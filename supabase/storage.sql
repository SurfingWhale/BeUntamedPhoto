-- Storage access. `gallery` is a public bucket (anon read via public URL);
-- `gallery-private` is private and only reachable through signed URLs we mint
-- server-side for authenticated visitors.

-- The buckets themselves. Without these the policies below apply to nothing
-- and every upload fails with "Bucket not found".
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('gallery-private', 'gallery-private', false)
on conflict (id) do update set public = false;

drop policy if exists gallery_owner_write   on storage.objects;
drop policy if exists gallery_owner_update  on storage.objects;
drop policy if exists gallery_owner_delete  on storage.objects;
drop policy if exists gallery_private_read  on storage.objects;

create policy gallery_owner_write on storage.objects for insert to authenticated
  with check (bucket_id in ('gallery','gallery-private') and public.is_owner());

create policy gallery_owner_update on storage.objects for update to authenticated
  using (bucket_id in ('gallery','gallery-private') and public.is_owner())
  with check (bucket_id in ('gallery','gallery-private') and public.is_owner());

create policy gallery_owner_delete on storage.objects for delete to authenticated
  using (bucket_id in ('gallery','gallery-private') and public.is_owner());

create policy gallery_private_read on storage.objects for select to authenticated
  using (bucket_id in ('gallery','gallery-private'));
