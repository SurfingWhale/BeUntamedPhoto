-- A gallery can say what the job was.
--
-- The owner's read of the reference, 2026-09-14: its product cards explain the
-- product and tap through to a page that tells its story. A photographer's
-- equivalent is the shoot — the brief, what it was for, what was made — and
-- this archive had nowhere to put it. A gallery carried a title, a place, a
-- year and a one-line subtitle, so a visitor deciding whether to commission a
-- food shoot could see the frames and nothing about the work.
--
-- `subtitle` stays what it is: one line, on the card, before you tap. `story`
-- is the paragraph on the gallery itself, after you have.
--
-- Nullable, and no default. A gallery with no story renders exactly as it does
-- today — the block is absent rather than empty — because the archive is not
-- going to be back-filled in one sitting and a page full of "TBD" is worse
-- than a page that simply shows the photographs.
--
-- Run it once:
--   supabase db execute --file supabase/add-album-story.sql
-- or paste it into the SQL editor. It is idempotent.

alter table public.albums
  add column if not exists story text;

-- Long enough for three or four paragraphs, short enough that it cannot become
-- an essay nobody reads. Measured against the reference's own About block,
-- which runs about 320 characters.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'albums_story_length'
  ) then
    alter table public.albums
      add constraint albums_story_length
      check (story is null or char_length(story) between 1 and 1200);
  end if;
end $$;

comment on column public.albums.story is
  'What the job was, in the owner''s words. Rendered on /work/<slug> under the title. Null means the gallery shows its plates and no story block.';
