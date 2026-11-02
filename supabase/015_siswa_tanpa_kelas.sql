/* 015 — Siswa tanpa kelas.
 *
 * Tahap ini kelas hanya diurus di dashboard admin. Anak bisa langsung belajar tanpa kode kelas:
 *   - Setiap anak yang mulai otomatis mendapat "kode belajar" pribadi (6 huruf).
 *   - Data (bintang, jawaban) tetap tersimpan di server memakai kode belajar itu.
 *   - Admin melihat daftar "siswa tanpa kelas" dan memindahkan mereka ke kelas kapan saja.
 *   - Setelah masuk kelas, laporan kelas berjalan seperti biasa. Kode belajar tetap berlaku,
 *     jadi anak tidak perlu masuk ulang.
 *
 * Jalankan setelah 014. Aman dijalankan berulang.
 */

/* Kelas boleh kosong untuk sementara. */
alter table public.students alter column class_id drop not null;
alter table public.students add column if not exists learn_code text;
create unique index if not exists students_learn_code on public.students (learn_code);

/* Siswa lama mendapat kode belajar juga, supaya bisa masuk dari perangkat lain. */
do $$
declare r record; c text;
begin
  for r in select id from students where learn_code is null loop
    loop
      c := _code(6);
      exit when not exists (select 1 from students where learn_code = c);
    end loop;
    update students set learn_code = c where id = r.id;
  end loop;
end $$;

/* Kode kelas ATAU kode belajar sama-sama diterima. Mengembalikan kelas (boleh kosong). */
create or replace function public._student_in(p_code text, p_sid text) returns text
language plpgsql stable security definer set search_path = public
as $$
declare cid text; u text := upper(trim(p_code));
begin
  select s.class_id into cid
  from students s left join classes c on c.id = s.class_id
  where s.id = p_sid and (c.code = u or s.learn_code = u);
  if not found then raise exception 'Siswa tidak ditemukan'; end if;
  return cid;
end $$;

/* Mulai belajar tanpa kelas: buat siswa baru + kode belajar. */
create or replace function public.student_start(p_name text, p_avatar text default null) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare sid text; lc text; pc text; nm text := left(trim(coalesce(p_name, '')), 80);
begin
  if char_length(nm) < 1 then raise exception 'Nama belum diisi'; end if;
  loop lc := _code(6); exit when not exists (select 1 from students where learn_code = lc); end loop;
  loop pc := _code(6); exit when not exists (select 1 from students where parent_code = pc); end loop;
  insert into students (class_id, name, avatar, parent_code, learn_code)
  values (null, nm, coalesce(nullif(left(trim(coalesce(p_avatar, '')), 40), ''), 'svg:boy-peci'), pc, lc)
  returning id into sid;
  return jsonb_build_object('id', sid, 'code', lc, 'name', nm);
end $$;

/* Masuk lagi di perangkat lain memakai kode belajar. */
create or replace function public.student_login(p_code text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare s students;
begin
  select * into s from students where learn_code = upper(trim(p_code));
  if s.id is null then raise exception 'Kode belajar tidak ditemukan';
  end if;
  return jsonb_build_object('id', s.id, 'name', s.name, 'code', s.learn_code, 'classId', s.class_id);
end $$;

/* Daftar siswa yang belum masuk kelas (khusus admin). */
create or replace function public.admin_ungrouped(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token);
begin
  if not _is_admin(t) then raise exception 'Hanya admin yang bisa melihat daftar ini';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', s.id, 'name', s.name, 'avatar', s.avatar, 'code', s.learn_code,
      'createdAt', (extract(epoch from s.created_at) * 1000)::bigint
    ) order by s.created_at desc)
    from students s where s.class_id is null
  ), '[]'::jsonb);
end $$;

/* Pindahkan satu siswa tanpa kelas ke kelas pilihan admin. */
create or replace function public.admin_assign_student(p_token text, p_student_id text, p_class_id text) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare t text := _tid(p_token);
begin
  if not _is_admin(t) then raise exception 'Hanya admin yang bisa memindahkan siswa';
  end if;
  if not exists (select 1 from classes where id = p_class_id) then raise exception 'Kelas tidak ditemukan';
  end if;
  update students set class_id = p_class_id where id = p_student_id;
  if not found then raise exception 'Siswa tidak ditemukan';
  end if;
  return jsonb_build_object('id', p_student_id, 'classId', p_class_id);
end $$;

/* Setujui pengajuan siswa tanpa harus memilih kelas.
 * Sama seperti 012, hanya bagian siswa yang berubah: kelas boleh kosong, dan siswa selalu
 * mendapat kode belajar sendiri. Admin bisa memindahkannya ke kelas kapan saja. */
create or replace function public.super_decide(p_token text, p_request_id text, p_approve boolean, p_school_id text default null, p_school_name text default null,
  p_make_admin boolean default false, p_class_id text default null, p_note text default null) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token); r requests; sid text; cid text; pc text; kid text; lc text; res jsonb := '{}'::jsonb; kids jsonb := '[]'::jsonb; nm text;
begin
  select * into r from requests where id = p_request_id for update;
  if r.id is null then raise exception 'Pengajuan tidak ditemukan'; end if;
  if r.status <> 'menunggu' then raise exception 'Pengajuan ini sudah diputuskan'; end if;
  if not p_approve then
    update requests set status = 'ditolak', note = left(p_note, 300), decided_at = now(), decided_by = me where id = r.id;
    update teachers set status = 'ditolak' where id = r.teacher_id;
    update parents set status = 'ditolak' where id = r.parent_id;
    return jsonb_build_object('ok', true, 'status', 'ditolak');
  end if;
  if r.kind in ('guru', 'homeschool') then
    sid := nullif(trim(coalesce(p_school_id, '')), '');
    if sid is not null and not exists (select 1 from schools where id = sid) then raise exception 'Sekolah tidak ditemukan'; end if;
    if sid is null then
      insert into schools (name, kind) values (left(coalesce(nullif(trim(p_school_name), ''), r.school_name, case when r.kind = 'homeschool' then 'Homeschool ' || r.name else 'Sekolah ' || r.name end), 100),
        case when r.kind = 'homeschool' then 'homeschool' else 'sekolah' end) returning id into sid;
    end if;
    update teachers set status = 'aktif', school_id = sid, is_school_admin = (r.kind = 'homeschool' or coalesce(p_make_admin, false)) where id = r.teacher_id;
    if r.kind = 'guru' and nullif(trim(coalesce(p_class_id, '')), '') is not null then
      if not exists (select 1 from classes where id = p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
      update classes set teacher_id = r.teacher_id where id = p_class_id;
      cid := p_class_id;
    else
      cid := _new_class(r.teacher_id, coalesce(nullif(trim(r.details->>'className'), ''), case when r.kind = 'homeschool' then 'Kelas ' || r.name else 'Kelas 1' end));
    end if;
    if r.kind = 'homeschool' and jsonb_typeof(r.details->'children') = 'array' then
      for nm in select trim(value) from jsonb_array_elements_text(r.details->'children') where char_length(trim(value)) > 0 limit 10 loop
        loop pc := _code(6); exit when not exists (select 1 from students where parent_code = pc); end loop;
        insert into students (class_id, name, avatar, parent_code) values (cid, left(nm, 80), '🦁', pc) returning id into kid;
        kids := kids || jsonb_build_object('name', left(nm, 80), 'parentCode', pc);
      end loop;
    end if;
    res := jsonb_build_object('classCode', (select code from classes where id = cid), 'className', (select name from classes where id = cid),
      'schoolName', (select name from schools where id = sid), 'children', kids);
  elsif r.kind = 'ortu' then
    update parents set status = 'aktif' where id = r.parent_id;
  else
    cid := nullif(trim(coalesce(p_class_id, '')), '');
    if cid is not null and not exists (select 1 from classes where id = cid) then raise exception 'Kelas tidak ditemukan'; end if;
    loop pc := _code(6); exit when not exists (select 1 from students where parent_code = pc); end loop;
    loop lc := _code(6); exit when not exists (select 1 from students where learn_code = lc); end loop;
    insert into students (class_id, name, avatar, parent_code, learn_code) values (cid, left(r.name, 80), '🦁', pc, lc) returning id into kid;
    res := jsonb_build_object('studentName', r.name, 'studentId', kid, 'learnCode', lc,
      'classCode', (select code from classes where id = cid), 'className', (select name from classes where id = cid), 'parentCode', pc);
  end if;
  update requests set status = 'disetujui', result = res, note = left(p_note, 300), decided_at = now(), decided_by = me where id = r.id;
  return res || jsonb_build_object('ok', true, 'status', 'disetujui');
end $$;

revoke execute on function public.student_start(text, text) from public;
revoke execute on function public.student_login(text) from public;
revoke execute on function public.admin_ungrouped(text) from public;
revoke execute on function public.admin_assign_student(text, text, text) from public;
revoke execute on function public.super_decide(text, text, boolean, text, text, boolean, text, text) from public;
grant execute on function public.student_start(text, text), public.student_login(text),
  public.admin_ungrouped(text), public.admin_assign_student(text, text, text),
  public.super_decide(text, text, boolean, text, text, boolean, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
