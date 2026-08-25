-- Photos at scale. Run after schema.sql, storage.sql, seed.sql, rls-albums.sql.
--
--   psql "$POSTGRES_URL_NON_POOLING" -f supabase/many-photos.sql
--
-- Safe to re-run.

-- ------------------------------------------------------------- thumbnails
-- A downscaled copy uploaded alongside each original. Index grids and the
-- darkroom list render this instead of pulling multi-megabyte plates, which
-- is the difference between a gallery of 300 loading and not.
alter table public.photos add column if not exists thumb_path text;

-- ---------------------------------------------------------------- indexes
-- Paging an album reads (album_id, position); the cover view reads
-- (album_id, is_cover desc, position).
create index if not exists photos_album_idx on public.photos (album_id, position);
create index if not exists photos_cover_idx on public.photos (album_id, is_cover desc, position);

-- ------------------------------------------------------------ cover view
-- One row per album, picked the way the index grid wants it. This replaces
-- fetching every photo of every album and choosing the first in JS — which
-- silently lost covers once the albums held more than PostgREST's row cap.
-- security_invoker keeps the photos RLS policy in force for whoever asks.
create or replace view public.album_covers
with (security_invoker = true) as
  select distinct on (p.album_id)
    p.album_id,
    p.id,
    p.bucket,
    p.path,
    p.thumb_path,
    p.caption,
    p.width,
    p.height
  from public.photos p
  order by p.album_id, p.is_cover desc, p.position asc, p.created_at asc;
