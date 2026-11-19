/* 014b — Bintang dari klaim putaran (berkas kecil).
 * Jalankan setelah 014a, lalu 014c. Aman dijalankan berulang.
 *
 * _apply_claim memeriksa satu klaim terhadap jawaban tersimpan, menghitung bintang,
 * menyimpannya, dan mengembalikan potongan progres yang perlu dikirim ke aplikasi.
 * Hanya dipanggil dari student_sync (security definer); akses langsung dicabut.
 */

create or replace function public._add_x(p_sid text, p_day text, p_n int, p_now bigint) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare v jsonb;
begin
  insert into progress (student_id, skill, score, att, ok, ms, last)
  values (p_sid, 'x:' || p_day, 0, 1, p_n, 0, p_now)
  on conflict (student_id, skill) do update
    set ok = progress.ok + excluded.ok, att = progress.att + 1, last = excluded.last;
  select jsonb_build_object('score', score, 'att', att, 'ok', ok, 'ms', ms, 'last', last)
    into v from progress where student_id = p_sid and skill = 'x:' || p_day;
  return jsonb_build_object('x:' || p_day, v);
end $$;

create or replace function public._apply_claim(p_sid text, p_claim jsonb, p_day text, p_now bigint) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  cid text := left(coalesce(p_claim->>'id', ''), 40);
  ck text := left(coalesce(p_claim->>'kind', ''), 12);
  d text; unit text; game text; v_ins int; v_obj jsonb;
  vn int; vok int; vms bigint; v_s0 int; pct int; v_stars int := 0; prev int; gain int; pts int;
begin
  if cid = '' or ck not in ('practice', 'test', 'game') then return '{}'::jsonb; end if;
  insert into star_claims (student_id, claim_id, kind, stars, at)
  values (p_sid, cid, ck, 0, p_now)
  on conflict (student_id, claim_id) do nothing;
  get diagnostics v_ins = row_count;
  if v_ins = 0 then return '{}'::jsonb; end if;

  d := coalesce(p_claim->>'d', '');
  if d not in (public._day_jkt(p_now - 86400000), p_day, public._day_jkt(p_now + 86400000)) then
    d := p_day;
  end if;
  select count(*), count(*) filter (where ok), coalesce(sum(ms), 0) into vn, vok, vms
    from answers where student_id = p_sid and round_id = cid;

  if ck = 'practice' then
    v_s0 := least(greatest(coalesce((p_claim->>'s0')::int, 100), 0), 100);
    if vn > 0 and v_s0 < 100 and vms::numeric / vn >= 1500 then
      v_stars := case when vok = vn then 3 when vok * 100 >= vn * 80 then 2
                      when vok * 100 >= vn * 60 then 1 else 0 end;
    end if;
    if v_stars > 0 then
      select coalesce(ok, 0) into prev from progress
        where student_id = p_sid and skill = 'x:' || d;
      v_stars := least(v_stars, greatest(0, 30 - coalesce(prev, 0)));
    end if;
    if v_stars > 0 then v_obj := public._add_x(p_sid, d, v_stars, p_now); end if;

  elsif ck = 'test' then
    unit := left(coalesce(p_claim->>'unit', ''), 10);
    if vn = 10 and unit <> '' then
      pct := round(vok * 100.0 / vn);
      if pct >= 60 and vms::numeric / vn >= 1500 then
        v_stars := case when pct >= 95 then 8 when pct >= 80 then 5 else 3 end;
      end if;
      select coalesce(ok, 0) into prev from progress
        where student_id = p_sid and skill = 'u:' || unit;
      gain := greatest(0, v_stars - coalesce(prev, 0));
      insert into progress (student_id, skill, score, att, ok, ms, last)
      values (p_sid, 'u:' || unit, case when v_stars > 0 then pct else 0 end, 1, v_stars,
              least(vms, 3600000), p_now)
      on conflict (student_id, skill) do update
        set score = greatest(progress.score, excluded.score),
            ok = greatest(progress.ok, excluded.ok),
            att = progress.att + 1, ms = progress.ms + excluded.ms, last = excluded.last;
      select jsonb_build_object('score', score, 'att', att, 'ok', ok, 'ms', ms, 'last', last)
        into v_obj from progress where student_id = p_sid and skill = 'u:' || unit;
      v_obj := jsonb_build_object('u:' || unit, v_obj);
      if gain > 0 then v_obj := v_obj || public._add_x(p_sid, d, gain, p_now); end if;
    end if;

  else
    game := left(coalesce(p_claim->>'game', ''), 10);
    if game <> '' then
      v_stars := least(greatest(coalesce((p_claim->>'stars')::int, 0), 0), 3);
      pts := greatest(coalesce((p_claim->>'points')::int, 0), 0);
      select coalesce(ok, 0) into prev from progress
        where student_id = p_sid and skill = 'g:' || game;
      gain := greatest(0, v_stars - coalesce(prev, 0));
      insert into progress (student_id, skill, score, att, ok, ms, last)
      values (p_sid, 'g:' || game, pts, 1, v_stars, 0, p_now)
      on conflict (student_id, skill) do update
        set score = greatest(progress.score, excluded.score),
            ok = greatest(progress.ok, excluded.ok),
            att = progress.att + 1, last = excluded.last;
      select jsonb_build_object('score', score, 'att', att, 'ok', ok, 'ms', ms, 'last', last)
        into v_obj from progress where student_id = p_sid and skill = 'g:' || game;
      v_obj := jsonb_build_object('g:' || game, v_obj);
      if gain > 0 then v_obj := v_obj || public._add_x(p_sid, d, gain, p_now); end if;
    end if;
  end if;

  update star_claims set stars = v_stars where student_id = p_sid and claim_id = cid;
  return coalesce(v_obj, '{}'::jsonb);
end $$;

revoke execute on function public._add_x(text, text, int, bigint) from public, anon, authenticated;
revoke execute on function public._apply_claim(text, jsonb, text, bigint) from public, anon, authenticated;

insert into public.schema_migrations (version, name)
values ('014b', 'bintang server: hitung klaim')
on conflict (version) do nothing;

notify pgrst, 'reload schema';
