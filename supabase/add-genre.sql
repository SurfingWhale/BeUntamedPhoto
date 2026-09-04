-- Genre on albums.
--
-- Nothing in the schema could express "this is a graduation set", so the index
-- could only filter by visibility — housekeeping no client cares about. This
-- is the column every genre requirement in docs/PRD-genres-and-load.md is
-- blocked on.
--
-- A constrained set, not free text: the index filters on it and the copy names
-- it, and both break the moment two spellings of the same genre exist.
--
-- Safe to run more than once.

alter table public.albums
  add column if not exists genre text not null default 'event';

alter table public.albums
  drop constraint if exists albums_genre_check;

alter table public.albums
  add constraint albums_genre_check
  check (genre in ('graduation', 'brand', 'sport', 'food', 'event'));

-- The index filters on it and the gallery list orders by it.
create index if not exists albums_genre_idx on public.albums (genre);

comment on column public.albums.genre is
  'Which body of work a set belongs to. Drives the filter on /work.';
