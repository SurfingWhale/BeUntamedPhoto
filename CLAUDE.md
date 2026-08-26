# UNTAMED — working notes

## The site shows the creative side, and nothing else

This is a standing rule from the owner, not a preference to weigh against
other concerns. **The website is the creative side. Nothing outside it is
shown.** The other career, the professional background, the analytical work
and the sites that hold it are all off the site.

That means, concretely:

- No job title, trade, industry, employer, or professional background — in
  copy, metadata, alt text, form placeholders, or comments that ship.
- No legal name. The public byline is `site.byline`, which reads "UNTAMED".
- No personal email. `site.email` is `null`; the guestbook is the contact
  route. An address that belongs to the archive alone can be set there, and
  the contact lines come back on their own.
- No link to the owner's GitHub, or to any site that is not photography.

When adding copy, check two greps rather than one — the profession and the
person are different searches, and a pass for one will miss the other:

```bash
grep -rniE "data analy|accounting|ledger|forecast|analyst|banker" src/ README.md
grep -rniE "muhammad|fauzy|github\.com/untamed" src/ README.md
```

Three of the leaks found so far were places nobody thinks of as copy: the
site-wide `metadata.description` in `layout.tsx` (which is what search
engines index, on every page), a form placeholder, and the README's first
line.

**Still open, and outside the code:** the repository's commit history
carries a real name and address on every commit. Removing text from the
site does not touch that. Making the repository private is the cheap fix;
rewriting history on an already-public repo is not reliable.

## Positioning

The site is a signpost, not a single portfolio. A visitor should learn
within one screen where their thing lives:

| Looking for | Goes to |
| --- | --- |
| Sport | UNTMD Sports |
| Food | VisuFavor |
| Everything else | this archive |

The subject leads and the site name follows — someone knows they want sport
long before they know a site is called UNTMD Sports. `site.directory` holds
this, and the home page, `/about` and `/elsewhere` all render from it.

## Conventions

- **Design system.** `tokens.css` is the single source of colour, type,
  space and motion. Every value in `src/app/globals.css` references a token
  by name. Do not introduce a literal colour or size.
- **Fonts.** Krona One is the wordmark only; Fraunces sets headings; IBM
  Plex Sans is body; JetBrains Mono is captions and data. Krona One has no
  italic — a synthesised oblique is never acceptable.
- **Photographs run full-bleed.** Everything else is held to `--shell` and
  centred.
- **Reads follow the album.** A held-back gallery's plates, prose and
  covers are all gated the same way. Writes are owner-only through RLS.
- **Never select a whole album.** `getPhotoPage` exists because an unpaged
  select hits PostgREST's row cap and silently drops the tail.

## Checks before committing

```bash
npx tsc --noEmit
npm run lint
NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder" npm run build
```

The build needs only those two variables; nothing renders live data at
build time.
