-- OPTIONAL. The guestbook no longer needs this.
--
-- The leak it was written for — `notes_with_author` publishing a personal name
-- beside every note on a public, cached page — is closed in code. `getNotes`
-- looks up which accounts hold the owner role and substitutes `site.byline`
-- before the rows leave the server, so nothing depends on this file having
-- been run. See the note in src/lib/notes.ts.
--
-- What is left here is cosmetic and affects one person: the masthead greets a
-- signed-in reader by `profiles.display_name`, so the owner sees their own
-- stored name in the corner. Nobody else ever does. Run this if you would
-- rather it read the byline there too.
--
-- Idempotent; re-running is safe.

update public.profiles
   set display_name = 'UNTAMED'
 where role = 'owner'
   and display_name <> 'UNTAMED';

-- Verify:
--
--   select display_name, role from public.profiles where role = 'owner';
--
-- And to confirm the code-side fix rather than this one, view-source any
-- gallery with an owner note on it: the byline should appear and the stored
-- name should not, including inside the serialised payload at the end.
