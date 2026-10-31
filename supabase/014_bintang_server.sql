/* 014 — Bintang dihitung di server.
 *
 * Sebelumnya aplikasi mengirim angka bintang dari perangkat (kunci 'x:YYYYMMDD' dan 'u:<bab>'),
 * jadi angka itu bisa diubah lewat localStorage. Mulai migrasi ini server yang menghitung:
 *
 *  - Setiap jawaban membawa nomor putaran (round_id).
 *  - Saat satu putaran selesai, aplikasi mengirim "klaim" berisi nomor putaran itu.
 *  - Server mencocokkan klaim dengan jawaban yang benar-benar tersimpan (jumlah, benar, waktu),
 *    lalu menghitung bintang dengan aturan yang sama seperti di aplikasi:
 *      latihan  : 3 / 2 / 1 bintang pada ketepatan 100 / 80 / 60 persen,
 *                 tidak dihitung bila keterampilan sudah tuntas atau rata-rata di bawah 1,5 detik,
 *                 maksimal 30 bintang per hari
 *      ujian bab: 3 / 5 / 8 bintang pada nilai 60 / 80 / 95, hanya selisih di atas rekor
 *      permainan: hanya selisih di atas bintang terbaik permainan itu
 *  - Angka 'x:' / 'u:' / 'g:' kiriman perangkat diabaikan bila aplikasi meminta mode server
 *    (p_server = true). Aplikasi lama (tanpa klaim) tetap berjalan seperti biasa.
 *
 * Jalankan setelah 013. Aman dijalankan berulang.
 */

alter table public.answers add column if not exists round_id text;
alter table public.answers add column if not exists kind text;
alter table public.answers add column if not exists unit text;

create index if not exists answers_round on public.answers (student_id, round_id);

/* Satu klaim hanya boleh dihitung sekali. Kunci (siswa, nomor putaran) menahan pengiriman ulang
   saat internet putus lalu tersambung lagi. */
create table if not exists public.star_claims (
  student_id text not null references public.students(id) on delete cascade,
  claim_id text not null,
  kind text not null,
  stars int not null default 0,
  at bigint not null,
  primary key (student_id, claim_id)
);

/* Tanggal menurut Waktu Indonesia Barat, supaya batas 30 bintang per hari tidak ikut jam server (UTC). */
create or replace function public._day_jkt(p_ts bigint) returns text
language sql immutable
as $$
  select to_char(to_timestamp((coalesce(p_ts, 0)::double precision) / 1000.0) at time zone 'Asia/Jakarta', 'YYYYMMDD');
$$;

drop function if exists public.student_sync(text, text, jsonb, jsonb);

create or replace function public.student_sync(
  p_code text,
  p_student_id text,
  p_answers jsonb,
  p_progress jsonb,
  p_claims jsonb default '[]'::jsonb,
  p_server boolean default false
) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  n int;
  v_ins int;
  v_prog jsonb := '{}'::jsonb;
  v_obj jsonb;
  v_now bigint := (extract(epoch from now()) * 1000)::bigint;
  v_today text := public._day_jkt((extract(epoch from now()) * 1000)::bigint);
  v_yest text := public._day_jkt(((extract(epoch from now()) - 86400) * 1000)::bigint);
  v_tom text := public._day_jkt(((extract(epoch from now()) + 86400) * 1000)::bigint);
  c jsonb;
  cid text;
  ckind text;
  v_day text;
  v_unit text;
  v_game text;
  v_n int;
  v_ok int;
  v_ms bigint;
  v_s0 int;
  v_pct int;
  v_avg numeric;
  v_stars int;
  v_prev int;
  v_gain int;
  v_pts int;
begin
  perform public._student_in(p_code, p_student_id);
  if jsonb_array_length(coalesce(p_answers, '[]'::jsonb)) > 500 then
    raise exception 'Terlalu banyak data sekaligus';
  end if;

  insert into answers (id, student_id, skill, ok, given, answer, text, tag, ms, ts, round_id, kind, unit)
  select left(a->>'id', 40), p_student_id, left(a->>'skill', 10), coalesce((a->>'ok')::boolean, false),
         left(a->>'given', 60), left(a->>'answer', 60), left(a->>'text', 300), left(a->>'tag', 30),
         least(coalesce((a->>'ms')::numeric, 0), 600000)::int, coalesce((a->>'ts')::bigint, 0),
         nullif(left(coalesce(a->>'rid', ''), 40), ''),
         nullif(left(coalesce(a->>'kind', ''), 12), ''),
         nullif(left(coalesce(a->>'unit', ''), 10), '')
  from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) a
  where a ? 'id'
  on conflict (id) do nothing;
  get diagnostics n = row_count;

  /* Hitung bintang dari jawaban yang sudah tersimpan. Dikerjakan sebelum progres keterampilan
     diperbarui, supaya "sudah tuntas" berarti tuntas sebelum putaran ini. */
  if p_server then
    for c in select jsonb_array_elements(coalesce(p_claims, '[]'::jsonb)) loop
      cid := left(coalesce(c->>'id', ''), 40);
      ckind := left(coalesce(c->>'kind', ''), 12);
      if cid = '' or ckind not in ('practice', 'test', 'game') then continue; end if;

      insert into star_claims (student_id, claim_id, kind, stars, at)
      values (p_student_id, cid, ckind, 0, v_now)
      on conflict (student_id, claim_id) do nothing;
      get diagnostics v_ins = row_count;
      if v_ins = 0 then continue; end if;

      v_day := coalesce(c->>'d', '');
      if v_day not in (v_yest, v_today, v_tom) then v_day := v_today; end if;

      if ckind = 'practice' then
        select count(*), count(*) filter (where ok), coalesce(sum(ms), 0)
          into v_n, v_ok, v_ms
          from answers where student_id = p_student_id and round_id = cid;
        if v_n > 0 then
          v_s0 := least(greatest(coalesce((c->>'s0')::int, 100), 0), 100);
          v_avg := v_ms::numeric / v_n;
          v_stars := 0;
          if v_s0 < 100 and v_avg >= 1500 then
            if v_ok = v_n then v_stars := 3;
            elsif v_ok * 100 >= v_n * 80 then v_stars := 2;
            elsif v_ok * 100 >= v_n * 60 then v_stars := 1;
            end if;
          end if;
          if v_stars > 0 then
            select coalesce(ok, 0) into v_prev
              from progress where student_id = p_student_id and skill = 'x:' || v_day;
            v_stars := least(v_stars, greatest(0, 30 - coalesce(v_prev, 0)));
          end if;
          if v_stars > 0 then
            insert into progress (student_id, skill, score, att, ok, ms, last)
            values (p_student_id, 'x:' || v_day, 0, 1, v_stars, 0, v_now)
            on conflict (student_id, skill) do update
              set ok = progress.ok + excluded.ok, att = progress.att + 1, last = excluded.last;
            select jsonb_build_object('score', score, 'att', att, 'ok', ok, 'ms', ms, 'last', last)
              into v_obj from progress where student_id = p_student_id and skill = 'x:' || v_day;
            v_prog := v_prog || jsonb_build_object('x:' || v_day, v_obj);
          end if;
          update star_claims set stars = v_stars where student_id = p_student_id and claim_id = cid;
        end if;

      elsif ckind = 'test' then
        v_unit := left(coalesce(c->>'unit', ''), 10);
        select count(*), count(*) filter (where ok), coalesce(sum(ms), 0)
          into v_n, v_ok, v_ms
          from answers where student_id = p_student_id and round_id = cid;
        if v_n = 10 and v_unit <> '' then
          v_pct := round(v_ok * 100.0 / v_n);
          v_avg := v_ms::numeric / v_n;
          v_stars := 0;
          if v_pct >= 60 and v_avg >= 1500 then
            v_stars := case when v_pct >= 95 then 8 when v_pct >= 80 then 5 else 3 end;
          end if;
          select coalesce(ok, 0) into v_prev
            from progress where student_id = p_student_id and skill = 'u:' || v_unit;
          v_gain := greatest(0, v_stars - coalesce(v_prev, 0));
          insert into progress (student_id, skill, score, att, ok, ms, last)
          values (p_student_id, 'u:' || v_unit, case when v_stars > 0 then v_pct else 0 end, 1, v_stars,
                  least(v_ms, 3600000), v_now)
          on conflict (student_id, skill) do update
            set score = greatest(progress.score, excluded.score),
                ok = greatest(progress.ok, excluded.ok),
                att = progress.att + 1,
                ms = progress.ms + excluded.ms,
                last = excluded.last;
          select jsonb_build_object('score', score, 'att', att, 'ok', ok, 'ms', ms, 'last', last)
            into v_obj from progress where student_id = p_student_id and skill = 'u:' || v_unit;
          v_prog := v_prog || jsonb_build_object('u:' || v_unit, v_obj);
          if v_gain > 0 then
            insert into progress (student_id, skill, score, att, ok, ms, last)
            values (p_student_id, 'x:' || v_day, 0, 1, v_gain, 0, v_now)
            on conflict (student_id, skill) do update
              set ok = progress.ok + excluded.ok, att = progress.att + 1, last = excluded.last;
            select jsonb_build_object('score', score, 'att', att, 'ok', ok, 'ms', ms, 'last', last)
              into v_obj from progress where student_id = p_student_id and skill = 'x:' || v_day;
            v_prog := v_prog || jsonb_build_object('x:' || v_day, v_obj);
          end if;
          update star_claims set stars = v_stars where student_id = p_student_id and claim_id = cid;
        end if;

      else
        v_game := left(coalesce(c->>'game', ''), 10);
        if v_game <> '' then
          v_stars := least(greatest(coalesce((c->>'stars')::int, 0), 0), 3);
          v_pts := greatest(coalesce((c->>'points')::int, 0), 0);
          select coalesce(ok, 0) into v_prev
            from progress where student_id = p_student_id and skill = 'g:' || v_game;
          v_gain := greatest(0, v_stars - coalesce(v_prev, 0));
          insert into progress (student_id, skill, score, att, ok, ms, last)
          values (p_student_id, 'g:' || v_game, v_pts, 1, v_stars, 0, v_now)
          on conflict (student_id, skill) do update
            set score = greatest(progress.score, excluded.score),
                ok = greatest(progress.ok, excluded.ok),
                att = progress.att + 1,
                last = excluded.last;
          select jsonb_build_object('score', score, 'att', att, 'ok', ok, 'ms', ms, 'last', last)
            into v_obj from progress where student_id = p_student_id and skill = 'g:' || v_game;
          v_prog := v_prog || jsonb_build_object('g:' || v_game, v_obj);
          if v_gain > 0 then
            insert into progress (student_id, skill, score, att, ok, ms, last)
            values (p_student_id, 'x:' || v_day, 0, 1, v_gain, 0, v_now)
            on conflict (student_id, skill) do update
              set ok = progress.ok + excluded.ok, att = progress.att + 1, last = excluded.last;
            select jsonb_build_object('score', score, 'att', att, 'ok', ok, 'ms', ms, 'last', last)
              into v_obj from progress where student_id = p_student_id and skill = 'x:' || v_day;
            v_prog := v_prog || jsonb_build_object('x:' || v_day, v_obj);
          end if;
          update star_claims set stars = v_stars where student_id = p_student_id and claim_id = cid;
        end if;
      end if;
    end loop;
  end if;

  insert into progress (student_id, skill, score, att, ok, ms, last, mastered_at)
  select p_student_id, left(e.k, 10), least(greatest((e.v->>'score')::int, 0), 100), (e.v->>'att')::int, (e.v->>'ok')::int,
         coalesce((e.v->>'ms')::numeric, 0)::bigint, coalesce((e.v->>'last')::bigint, 0), (e.v->>'masteredAt')::bigint
  from jsonb_each(coalesce(p_progress, '{}'::jsonb)) as e(k, v)
  where (not p_server) or (e.k not like 'x:%' and e.k not like 'u:%' and e.k not like 'g:%')
  on conflict (student_id, skill) do update set score = excluded.score, att = excluded.att, ok = excluded.ok, ms = excluded.ms,
    last = excluded.last, mastered_at = coalesce(progress.mastered_at, excluded.mastered_at)
  where excluded.att >= progress.att;

  return jsonb_build_object(
    'saved', n,
    'progress', v_prog,
    'stars', (select coalesce(sum(ok), 0) from progress where student_id = p_student_id and skill like 'x:%')
  );
end $$;

revoke execute on function public.student_sync(text, text, jsonb, jsonb, jsonb, boolean) from public;
revoke execute on function public._day_jkt(bigint) from public;
grant execute on function public.student_sync(text, text, jsonb, jsonb, jsonb, boolean) to anon, authenticated;

notify pgrst, 'reload schema';
