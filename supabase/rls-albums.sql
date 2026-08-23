-- Album metadata is public so visitors can SEE that held-back galleries exist.
-- The plates inside them stay gated.
drop policy if exists albums_read on public.albums;
create policy albums_read on public.albums for select using (true);
