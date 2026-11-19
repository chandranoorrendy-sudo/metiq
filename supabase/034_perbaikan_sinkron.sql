/* 034 — Perbaikan sinkronisasi progres dan ulasan orang tua.
 *
 * 1) Progres keterampilan tidak lagi ditimpa saat jumlah percobaan (att) sama.
 *    Dua perangkat bisa menghasilkan att yang sama; rekaman dibandingkan berurutan:
 *    att, lalu skor, lalu jawaban benar, lalu waktu, lalu waktu terakhir. Yang lebih besar menang,
 *    sehingga hasilnya sama di mana pun urutan pengirimannya.
 *
 * 2) Angka turunan x: (bintang harian), u: (bintang ujian bab), dan g: (bintang permainan)
 *    TIDAK PERNAH diterima dari perangkat, baik p_server true maupun false. Angka itu hanya
 *    dihitung server dari jawaban/klaim yang tersimpan.
 *
 * 3) Ulasan orang tua dipisah ke submit_feedback_parent dan wajib membawa sesi orang tua
 *    (p_ptoken) yang tertaut ke siswa, atau kode orang tua siswa (p_pcode). submit_feedback
 *    lama hanya untuk siswa dan menolak p_by = 'ortu'.
 *
 * Jalankan setelah 033. Aman dijalankan berulang.
 */

/* ---------- 1. Catatan migrasi ---------- */
create table if not exists public.schema_migrations (
  version text primary key,
  name text not null,
  applied_at timestamptz not null default now()
);
insert into public.schema_migrations (version, name)
values ('034', 'perbaikan sinkronisasi progres dan ulasan orang tua')
on conflict (version) do nothing;

/* ---------- 2. student_sync: aturan menang yang pasti ---------- */
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

  /* Bintang dihitung dari jawaban yang sudah tersimpan. */
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

  /* Progres keterampilan dari perangkat.
     - x:/u:/g: selalu diabaikan (bintang hanya dari server).
     - att sama tidak lagi menimpa: bandingkan att, score, ok, ms, last. */
  insert into progress (student_id, skill, score, att, ok, ms, last, mastered_at)
  select p_student_id, left(e.k, 10), least(greatest((e.v->>'score')::int, 0), 100), (e.v->>'att')::int, (e.v->>'ok')::int,
         coalesce((e.v->>'ms')::numeric, 0)::bigint, coalesce((e.v->>'last')::bigint, 0), (e.v->>'masteredAt')::bigint
  from jsonb_each(coalesce(p_progress, '{}'::jsonb)) as e(k, v)
  where e.k not like 'x:%' and e.k not like 'u:%' and e.k not like 'g:%'
  on conflict (student_id, skill) do update set score = excluded.score, att = excluded.att, ok = excluded.ok, ms = excluded.ms,
    last = excluded.last, mastered_at = coalesce(progress.mastered_at, excluded.mastered_at)
  where (excluded.att, excluded.score, excluded.ok, excluded.ms, excluded.last)
      > (progress.att, progress.score, progress.ok, progress.ms, progress.last);

  return jsonb_build_object(
    'saved', n,
    'progress', v_prog,
    'stars', (select coalesce(sum(ok), 0) from progress where student_id = p_student_id and skill like 'x:%')
  );
end $$;

revoke execute on function public.student_sync(text, text, jsonb, jsonb, jsonb, boolean) from public;
grant execute on function public.student_sync(text, text, jsonb, jsonb, jsonb, boolean) to anon, authenticated;

/* ---------- 3. Ulasan: siswa dan orang tua dipisah ---------- */
create or replace function public.submit_feedback(
  p_code text, p_student_id text, p_assignment_id text, p_by text, p_rating int, p_comment text
) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare cid text := _student_in(p_code, p_student_id);
begin
  if coalesce(p_by, '') = 'ortu' then
    raise exception 'Ulasan orang tua harus dikirim lewat akun orang tua';
  end if;
  if not exists (select 1 from assignment_done where assignment_id = p_assignment_id and student_id = p_student_id) then
    raise exception 'Tugas belum selesai';
  end if;
  if not exists (select 1 from assignments where id = p_assignment_id and class_id = cid) then
    raise exception 'Tugas tidak ditemukan';
  end if;
  insert into feedback (assignment_id, student_id, by_role, rating, comment)
  values (p_assignment_id, p_student_id, 'siswa', greatest(1, least(5, p_rating)),
          nullif(left(trim(coalesce(p_comment, '')), 500), ''))
  on conflict (assignment_id, student_id, by_role) do update
    set rating = excluded.rating, comment = excluded.comment, created_at = now();
end $$;

create or replace function public.submit_feedback_parent(
  p_ptoken text, p_pcode text, p_code text, p_student_id text, p_assignment_id text, p_rating int, p_comment text
) returns void
language plpgsql volatile security definer set search_path = public
as $$
declare pid text; cid text := _student_in(p_code, p_student_id); ok boolean;
begin
  /* Harus sesi orang tua yang tertaut ke siswa ini, atau kode orang tua siswa itu sendiri. */
  if coalesce(p_ptoken, '') <> '' then
    pid := _pid(p_ptoken);
    select exists (select 1 from parent_students where parent_id = pid and student_id = p_student_id) into ok;
    if not ok then raise exception 'Akun orang tua tidak tertaut ke siswa ini'; end if;
  else
    select exists (select 1 from students where id = p_student_id and parent_code = upper(trim(coalesce(p_pcode, '')))) into ok;
    if not ok then raise exception 'Kode orang tua tidak cocok'; end if;
  end if;

  if not exists (select 1 from assignment_done where assignment_id = p_assignment_id and student_id = p_student_id) then
    raise exception 'Tugas belum selesai';
  end if;
  if not exists (select 1 from assignments where id = p_assignment_id and class_id = cid) then
    raise exception 'Tugas tidak ditemukan';
  end if;
  insert into feedback (assignment_id, student_id, by_role, rating, comment)
  values (p_assignment_id, p_student_id, 'ortu', greatest(1, least(5, p_rating)),
          nullif(left(trim(coalesce(p_comment, '')), 500), ''))
  on conflict (assignment_id, student_id, by_role) do update
    set rating = excluded.rating, comment = excluded.comment, created_at = now();
end $$;

revoke execute on function public.submit_feedback(text, text, text, text, int, text) from public;
grant execute on function public.submit_feedback(text, text, text, text, int, text) to anon, authenticated;
revoke execute on function public.submit_feedback_parent(text, text, text, text, text, int, text) from public;
grant execute on function public.submit_feedback_parent(text, text, text, text, text, int, text) to anon, authenticated;

notify pgrst, 'reload schema';
