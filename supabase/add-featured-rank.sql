-- Which plate fills which slot on the home page, chosen by the owner.
--
-- Until now the four photographs on `/` were whichever four the archive
-- happened to return: covers first, then newest first. There was no way to say
-- "this frame opens the site", which is the one editorial decision a
-- photographer most wants over their own front page.
--
-- A rank, not a boolean, because the slots are not interchangeable — they are
-- four different jobs at four different sizes:
--
--   1  the hero            full bleed, the statement set on it
--   2  the index band      the photograph the genre filter sits on
--   3  the lane banner     the archive's own card in the lanes reel
--   4  the closing fold    the plate the page ends on
--
-- NULL means "not chosen", which is every plate by default, and those still
-- fill any slot the owner has not assigned — so the page never goes blank
-- while the archive is being arranged.
--
-- Run this once against the project, then reload /darkroom/<slug>.

alter table public.photos
  add column if not exists featured_rank smallint;

-- The four slots the home page has. A fifth would render nowhere, so it is
-- refused here rather than silently ignored in the query.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'photos_featured_rank_range'
  ) then
    alter table public.photos
      add constraint photos_featured_rank_range
      check (featured_rank is null or featured_rank between 1 and 4);
  end if;
end $$;

-- One plate per slot. Without this two photographs can both claim the hero and
-- which one wins is whatever the sort happens to do that day.
create unique index if not exists photos_featured_rank_unique
  on public.photos (featured_rank)
  where featured_rank is not null;

-- The query orders by this on every home-page render.
create index if not exists photos_featured_rank_idx
  on public.photos (featured_rank)
  where featured_rank is not null;

-- No RLS change. `photos` already lets anyone read what an open album holds
-- and only the owner write, and this column is covered by both.
