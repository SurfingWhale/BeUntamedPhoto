-- The content gate's list, as statements you can run.
--
-- `npm run measure` ends with a Content section that reads the live archive.
-- It fails on the three faults that are mechanical — a subtitle that restates
-- its own title, a subtitle that restates the genre printed beside it, and a
-- placeholder that reached production — and reports two more that are cheap
-- to fix and never urgent. Today it says:
--
--   FAIL  Sales HeadShot       subtitle restates the title
--   FAIL  Cindy's Graduation   subtitle restates its genre
--   FAIL  Hello There...       no subtitle
--   FAIL  Nuna Graduation      subtitle restates its genre
--   note  DARA BERSEMI         title set in capitals (design.md § 5)
--   note  Hello There...       three periods where … belongs
--
-- The two notes are below and they are finished: run them as they are. The
-- four subtitles are not, and nobody but you can write them — only you know
-- who each job was for. They are left as commented templates with the shape
-- design.md § 2 asks for, and the gate will keep failing until they are real
-- sentences rather than this file's placeholder text.
--
-- Run against the project once, then `npm run measure` again to check.

begin;

-- ------------------------------------------------ the two mechanical notes

-- Sentence case, like every other title in the archive. The stylesheet stopped
-- shouting a while ago; this one shouts from the database, which is the one
-- layer CSS cannot reach.
update public.albums
   set title = 'Dara Bersemi'
 where title = 'DARA BERSEMI';

-- The character, not three periods.
update public.albums
   set title = 'Hello There…'
 where title = 'Hello There...';

-- ------------------------------------------------------- the four subtitles
--
-- The shape, from design.md § 2: what was shot, for whom, where. One line, and
-- it is the whole pitch on a card — a client sent this link reads the title,
-- this sentence, the genre and the year, and decides from that whether you
-- have done anything like the thing they want.
--
-- Uncomment one at a time and replace the text. Keep it under about 60
-- characters so it does not wrap to three lines on a phone.

-- update public.albums
--    set subtitle = 'Headshots for <company>, <how many> people in a morning'
--  where title = 'Sales HeadShot';

-- update public.albums
--    set subtitle = 'The ceremony and the family afterwards, <campus>'
--  where title = 'Cindy''s Graduation';

-- update public.albums
--    set subtitle = '<what the set is>, <where>'
--  where title = 'Hello There…';

-- update public.albums
--    set subtitle = 'The ceremony and the family afterwards, <campus>'
--  where title = 'Nuna Graduation';

commit;

-- ------------------------------------------------------------- still open
--
-- Not written here, because it is a decision rather than a typo:
-- PRD-the-archive-in-its-own-words.md § 3.2 found that three sets filed under
-- Event are not events. By their own subtitles, Dara Bersemi is wellness and
-- yoga, Lumos Studio is a beauty shoot and Summer In Bloom is a portrait set
-- shot with strobes. A client looking for portrait work filters to Brand,
-- finds two headshot sets, and leaves — while three sets of what they wanted
-- sit one chip away under the wrong word.
--
-- The genre ids are in src/lib/site.ts: graduation, brand, sport, food, event.
-- When you have decided where those three belong:
--
--   update public.albums set genre = '<id>' where title = '<title>';
