/* 014c — student_sync: simpan jawaban, progres, dan bintang server (berkas kecil).
 * Jalankan setelah 014a dan 014b. Aman dijalankan berulang.
 *
 * - x: (harian), u: (bab), g: (permainan) tidak pernah diterima dari perangkat.
 * - Progres menang berurutan att, score, ok, ms, last; att sama tidak menimpa.
 */

create or replace function public.student_sync(
  p_code text, p_student_id text, p_answers jsonb, p_progress jsonb,
  p_claims jsonb default '[]'::jsonb, p_server boolean default false
) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  n int; c jsonb; v_prog jsonb := '{}'::jsonb;
  v_now bigint := (extract(epoch from now()) * 1000)::bigint;
  v_day text := public._day_jkt((extract(epoch from now()) * 1000)::bigint);
begin
  perform public._student_in(p_code, p_student_id);
  if jsonb_array_length(coalesce(p_answers, '[]'::jsonb)) > 500 then
    raise exception 'Terlalu banyak data sekaligus';
  end if;

  insert into answers (id, student_id, skill, ok, given, answer, text, tag, ms, ts, round_id, kind, unit)
  select left(a->>'id', 40), p_student_id, left(a->>'skill', 10), coalesce((a->>'ok')::boolean, false),
         left(a->>'given', 60), left(a->>'answer', 60), left(a->>'text', 300), left(a->>'tag', 30),
         least(coalesce((a->>'ms')::numeric, 0), 600000)::int, coalesce((a->>'ts')::bigint, 0),
         nullif(left(coalesce(a->>'rid', ''), 40), ''), nullif(left(coalesce(a->>'kind', ''), 12), ''),
         nullif(left(coalesce(a->>'unit', ''), 10), '')
  from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) a
  where a ? 'id'
  on conflict (id) do nothing;
  get diagnostics n = row_count;

  if p_server then
    for c in select jsonb_array_elements(coalesce(p_claims, '[]'::jsonb)) loop
      v_prog := v_prog || public._apply_claim(p_student_id, c, v_day, v_now);
    end loop;
  end if;

  /* Progres keterampilan dari perangkat; bintang x:/u:/g: selalu dibuang. */
  insert into progress (student_id, skill, score, att, ok, ms, last, mastered_at)
  select p_student_id, left(e.k, 10), least(greatest((e.v->>'score')::int, 0), 100), (e.v->>'att')::int,
         (e.v->>'ok')::int, coalesce((e.v->>'ms')::numeric, 0)::bigint, coalesce((e.v->>'last')::bigint, 0),
         (e.v->>'masteredAt')::bigint
  from jsonb_each(coalesce(p_progress, '{}'::jsonb)) as e(k, v)
  where e.k not like 'x:%' and e.k not like 'u:%' and e.k not like 'g:%'
  on conflict (student_id, skill) do update
    set score = excluded.score, att = excluded.att, ok = excluded.ok, ms = excluded.ms,
        last = excluded.last, mastered_at = coalesce(progress.mastered_at, excluded.mastered_at)
  where row(excluded.att, excluded.score, excluded.ok, excluded.ms, excluded.last)
        > row(progress.att, progress.score, progress.ok, progress.ms, progress.last);

  return jsonb_build_object(
    'saved', n,
    'progress', v_prog,
    'stars', (select coalesce(sum(ok), 0) from progress where student_id = p_student_id and skill like 'x:%')
  );
end $$;

/* Aplikasi versi lama memakai 4 argumen (dulu mengembalikan int). Tetap dilayani
   tanpa mode server; bintang dari perangkat tetap dibuang oleh fungsi di atas. */
create or replace function public.student_sync(
  p_code text, p_student_id text, p_answers jsonb, p_progress jsonb
) returns int
language sql volatile security definer set search_path = public
as $$
  select (public.student_sync(p_code, p_student_id, p_answers, p_progress, '[]'::jsonb, false)->>'saved')::int;
$$;

revoke execute on function public.student_sync(text, text, jsonb, jsonb, jsonb, boolean) from public;
revoke execute on function public.student_sync(text, text, jsonb, jsonb) from public;
grant execute on function public.student_sync(text, text, jsonb, jsonb, jsonb, boolean) to anon, authenticated;
grant execute on function public.student_sync(text, text, jsonb, jsonb) to anon, authenticated;

insert into public.schema_migrations (version, name)
values ('014c', 'bintang server: student_sync')
on conflict (version) do nothing;

notify pgrst, 'reload schema';
