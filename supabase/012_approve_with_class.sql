-- Metiq — saat menyetujui pengajuan guru, super admin bisa langsung memberinya kelas yang sudah ada.
-- Jalankan sekali di SQL Editor setelah 011_delete_school.sql. Aman dijalankan ulang.
-- Jika kelas tidak dipilih, guru dibuatkan kelas baru seperti sebelumnya.

-- Setujui atau tolak pengajuan
create or replace function public.super_decide(p_token text, p_request_id text, p_approve boolean, p_school_id text default null, p_school_name text default null,
  p_make_admin boolean default false, p_class_id text default null, p_note text default null) returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare me text := _super(p_token); r requests; sid text; cid text; pc text; kid text; res jsonb := '{}'::jsonb; kids jsonb := '[]'::jsonb; nm text;
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
    -- guru sekolah bisa langsung diberi kelas yang sudah ada; jika tidak dipilih, dibuatkan kelas baru
    if r.kind = 'guru' and nullif(trim(coalesce(p_class_id, '')), '') is not null then
      if not exists (select 1 from classes where id = p_class_id) then raise exception 'Kelas tidak ditemukan'; end if;
      update classes set teacher_id = r.teacher_id where id = p_class_id;
      cid := p_class_id;
    else
      cid := _new_class(r.teacher_id, coalesce(nullif(trim(r.details->>'className'), ''), case when r.kind = 'homeschool' then 'Kelas ' || r.name else 'Kelas 1' end));
    end if;
    -- keluarga homeschool: anak-anak langsung dibuatkan akun siswa di kelas keluarga
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
    if p_class_id is null or not exists (select 1 from classes where id = p_class_id) then raise exception 'Pilih kelas untuk siswa ini'; end if;
    loop pc := _code(6); exit when not exists (select 1 from students where parent_code = pc); end loop;
    insert into students (class_id, name, avatar, parent_code) values (p_class_id, left(r.name, 80), '🦁', pc) returning id into kid;
    res := jsonb_build_object('studentName', r.name, 'studentId', kid, 'classCode', (select code from classes where id = p_class_id),
      'className', (select name from classes where id = p_class_id), 'parentCode', pc);
  end if;
  update requests set status = 'disetujui', result = res, note = left(p_note, 300), decided_at = now(), decided_by = me where id = r.id;
  return res || jsonb_build_object('ok', true, 'status', 'disetujui');
end $$;

