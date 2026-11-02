/* 016 — Daftar siswa tanpa kelas ikut menampilkan kode orang tua.
 * Sama seperti admin_ungrouped di 015, ditambah 'parentCode'. Jalankan setelah 015.
 */
create or replace function public.admin_ungrouped(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare t text := _tid(p_token);
begin
  if not _is_admin(t) then raise exception 'Hanya admin yang bisa melihat daftar ini';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', s.id, 'name', s.name, 'avatar', s.avatar, 'code', s.learn_code, 'parentCode', s.parent_code,
      'createdAt', (extract(epoch from s.created_at) * 1000)::bigint
    ) order by s.created_at desc)
    from students s where s.class_id is null
  ), '[]'::jsonb);
end $$;

notify pgrst, 'reload schema';
