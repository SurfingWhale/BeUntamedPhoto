-- Composable galleries, phase one: text between the frames.
-- Run after many-photos.sql. Safe to re-run.
--
--   psql "$POSTGRES_URL_NON_POOLING" -f supabase/blocks.sql
--
-- Only the kinds that actually render are allowed by the check constraint.
-- 'plate' and 'pair' widen it later, when a block can hold a photograph.

create table if not exists public.blocks (
  id         uuid primary key default gen_random_uuid(),
  album_id   uuid not null references public.albums(id) on delete cascade,
  kind       text not null check (kind in ('text','rule')),
  body       text,
  position   int  not null default 0,
  created_at timestamptz not null default now(),
  -- A text block with nothing in it is a rendering bug waiting to happen.
  constraint blocks_body_required check (kind <> 'text' or coalesce(trim(body), '') <> '')
);

create index if not exists blocks_album_idx on public.blocks (album_id, position);

-- ---------------------------------------------------------------- RLS
-- Reads follow the album exactly as photos do: a held-back gallery's prose is
-- held back with its plates. Writes are owner-only, like every other table.
alter table public.blocks enable row level security;

drop policy if exists blocks_read  on public.blocks;
drop policy if exists blocks_write on public.blocks;

create policy blocks_read on public.blocks for select
  using (exists (
    select 1 from public.albums a
    where a.id = blocks.album_id
      and (a.visibility = 'public' or auth.role() = 'authenticated')
  ));

create policy blocks_write on public.blocks for all
  using (public.is_owner()) with check (public.is_owner());
