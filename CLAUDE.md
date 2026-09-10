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
npm run build   # needs real Supabase credentials — see below
```

**The build reads the database now.** Every public page is prerendered, so
`next build` runs the archive and featured queries for real and writes their
answer into the HTML. Point it at the live project (or a local Supabase) with
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Placeholder credentials no longer get you a build. It fails at `/about` with
`Could not read the archive`, and that is the intended behaviour, not a
regression: the query throws rather than returning nothing, because an empty
result renders an empty archive at 200 — a site that looks finished and blank.
Failing the deploy is the cheaper way to find out.

Somewhere with no database reachable, `tsc` and `lint` still tell you almost
everything. If you need the route table too, the trick is to make the two
`throw new Error(\`Could not read the archive\`)` in `src/lib/gallery.ts`
return `[]` for one build and then put them back — never commit that.

## Conventions

- **Design system.** `design.md` is the brief and `tokens.css` is the single
  source of colour, type, space and motion. Do not introduce a literal
  colour or size.
- **Photographs run full-bleed.** Everything else is held to `--page-max`.
- **Writes are owner-only through RLS.** A held-back gallery's files live in
  the private bucket and are served through short-lived signed links.
- **The public tree is prerendered, and one cookie read undoes it.** `/`,
  `/about`, `/work`, `/work/genre/*`, `/elsewhere` and `/notes` are static with
  `revalidate = 300`; the galleries are `generateStaticParams`-registered and
  cached on first request. Anything reachable from those pages — including the
  root layout and every component in it — must not call `cookies()`, and so
  must not call `getViewer()` or `createClient()`. A single one turns the whole
  tree back into `no-store`, silently. `<Fab />` in the root layout did exactly
  that, and cost every page its cache to draw one button for one person.

  Ask from the browser instead: `useViewer()`, or `<SignedIn>` / `<SignedOut>` /
  `<NotesGate>` around the parts that differ. The server still decides anything
  that matters, because every write goes through RLS.

  On a route that has `revalidate` or `generateStaticParams`, `cookies()` is not
  a quiet fall back to per-request rendering — it throws `DYNAMIC_SERVER_USAGE`
  and the page 500s. That is why a held-back gallery has its own dynamic route
  at `/work/[slug]/open` rather than a branch inside the cached one.

- **Safe-area insets.** Installed, the app is standalone with
  `viewport-fit: cover`, so anything pinned to an edge needs its
  `env(safe-area-inset-*)`, or iOS draws the status bar over it.
