-- The guestbook was publishing a personal name.
--
-- notes_with_author selects profiles.display_name beside every note, and
-- profiles.display_name defaults to the email local-part (schema.sql). /notes
-- and every gallery guestbook is public, and since the prerender work those
-- pages are cached and shared for five minutes. So a note left by the owner
-- published a personal name to every visitor and held it in a shared cache.
--
-- CLAUDE.md states the rule as standing and categorical: no legal name on the
-- site, and the public byline is site.byline.
--
-- The view now also returns the author's role. The byline itself stays in
-- src/lib/site.ts rather than being hardcoded here, so there is still one
-- place that decides what the archive is called — the app substitutes it for
-- any note whose author is the owner.
--
-- Run this against the master project. It is idempotent; re-running is safe.

create or replace view public.notes_with_author
with (security_invoker = true) as
  select n.id, n.album_id, n.body, n.created_at, n.user_id,
         p.display_name,
         p.role
  from public.notes n
  join public.profiles p on p.id = n.user_id
  where n.hidden = false;

-- Belt and braces, and the part that closes the hole immediately even if the
-- app were not updated: the stored value for the owner account becomes the
-- byline. Anything that reads display_name by another path then agrees.
--
-- This also fixes the masthead, which greets the owner by that same value.
update public.profiles
   set display_name = 'UNTAMED'
 where role = 'owner'
   and display_name <> 'UNTAMED';

-- Verify. Both should come back clean:
--
--   select display_name, role from public.profiles where role = 'owner';
--     -> display_name is 'UNTAMED'
--
--   select display_name, count(*) from public.notes_with_author
--    group by display_name order by 2 desc;
--     -> no personal name in the list
--
-- If a personal name still appears above, a non-owner account carries it and
-- that account's own display_name needs changing — the rule is about the
-- owner, but check before assuming.
