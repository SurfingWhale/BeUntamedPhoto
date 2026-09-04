@AGENTS.md

# UNTAMED — working notes

## The site is the creative practice, and nothing else

A standing rule from the owner, not a preference to weigh against other
concerns. Two separate things stay off the site, and a check for one will
miss the other:

**No other career.** No job title, trade, industry, employer or professional
background of any kind — in copy, metadata, alt text, form placeholders, or
comments that ship. A visiting client sees a photographer, full stop.

**No person.** No legal name and no personal address. The public byline is
`site.byline`, which reads "UNTAMED", and every sign-off reads from it.
`site.email` is the archive's own address, never a personal account. No link
to the owner's GitHub, or to any site that is not photography.

This repository is public, so this file cannot spell out what is being kept
off the site — writing the terms down here would publish them. The specific
words to grep for are the owner's to hand over; ask rather than guess, and
never commit the list.

What can be checked here, and should be before any copy lands:

```bash
# Every sign-off reads from the byline, and the byline is the brand.
grep -rn "site\.byline" src/ && grep -n "byline:" src/lib/site.ts

# Nothing signs off with a bare name instead.
grep -rniE "photography by |archive by |portfolio for |I(’|')m [A-Z]" src/ *.md docs/
```

The name reached `site.owner`, the site-wide `metadata.description` in
`layout.tsx` (what search engines index, on every page), the manifest, a form
placeholder, the README's first line and design.md before it was caught.
Three of those are places nobody thinks of as copy.

**Still open, and outside the code:** the commit history carries a real name
and address on every commit, and a public repository publishes the rules
along with everything else. Making the repository private is the fix for
both. Rewriting history on an already-public repo is not reliable.

## Checks before committing

```bash
npx tsc --noEmit
npm run lint
NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder" npm run build
```

The build needs only those two variables; nothing renders live data at
build time.

## Conventions

- **Design system.** `design.md` is the brief and `tokens.css` is the single
  source of colour, type, space and motion. Do not introduce a literal
  colour or size.
- **Photographs run full-bleed.** Everything else is held to `--page-max`.
- **Writes are owner-only through RLS.** A held-back gallery's files live in
  the private bucket and are served through short-lived signed links.
- **Safe-area insets.** Installed, the app is standalone with
  `viewport-fit: cover`, so anything pinned to an edge needs its
  `env(safe-area-inset-*)`, or iOS draws the status bar over it.
