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

**There is now a place to put them that is not the repository.** One term per
line in `.privacy-terms`, which `.gitignore` excludes and `npm run measure`
reads: gate 8 greps the whole shipping tree and reports `file:line` **without
ever printing the term**, because a CI log is public too. Absent, the gate
reports itself **UNARMED** rather than passing quietly.

It was written because the gap was not theoretical. On 2026-09-11 a **full
legal name** was found in `.hallmark/log.json`, and a stored personal name in
`docs/PRD-index-as-gallery.md` — in the paragraph of the document whose entire
subject is that a personal name must not be published. Both had been in a
public repository for weeks, and both are now out of the working tree. Neither
is out of git history, which is the argument for making the repository private
rather than a substitute for it.

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

`pending-task.md` tracks this and everything else that needs an account or a
decision rather than a commit — including the one that matters most right now:
**Vercel Deployment Protection is on for every URL the site has, and there is
no custom domain, so a visitor gets a sign-in page instead of the archive.**

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

- **A client component's props are published.** Every field on an object
  handed to a `"use client"` component is serialised into the HTML as the RSC
  payload, whether or not anything renders it — and on a prerendered page that
  payload sits in a shared cache. Substituting a value inside the component is
  therefore not a fix: the guestbook rendered the byline correctly while the
  stored personal name sat in view-source a few kilobytes below. Anything that
  must not be published has to be gone **before the data leaves the server** —
  in the data layer, not the view. Verify by planting the value in a fixture
  and grepping the whole served response for it, not by reading the DOM.

- **Safe-area insets.** Installed, the app is standalone with
  `viewport-fit: cover`, so anything pinned to an edge needs its
  `env(safe-area-inset-*)`, or iOS draws the status bar over it. This has
  shipped broken twice — first the masthead, then `.index-sticky` — so a new
  sticky element takes `top: max(var(--mast-h, 0px), env(safe-area-inset-top, 0px))`,
  not `--mast-h` alone. The masthead publishes `--mast-h: 0px` while retracted.

- **A `var()` resolves where the declaration lives, not where it is used.**
  `next/font` puts `--font-syne` on whatever element carries its generated
  class, and `tokens.css` builds `--font-display: var(--font-syne), ...` on
  `:root`. With the class on `<body>` the variable was undefined at `:root`,
  `--font-display` computed to the guaranteed-invalid value, and every
  descendant inherited that invalidity — so the whole site rendered in
  `-apple-system` for months while three woff2 files were preloaded and used
  by nothing. The font classes belong on `<html>`. Nothing catches this but
  reading `getComputedStyle` back: the build was green, the CSS was valid, and
  `document.fonts` reporting 47 faces `unloaded` was the only tell.

- **Never floor a height on a box whose width is shrink-to-fit.** With
  `aspect-ratio` set, a `min-height` makes the *width* derive from the new
  height. A five-row floor on `.fold-photo--tall` produced a 731px frame
  inside a 390px viewport, hidden by `overflow-x: clip`. Cap the ratio
  instead. Three separate grid blowouts in `globals.css` now trace to this
  family, and all three were invisible until something measured rendered
  boxes.

- **Reserve every image box, and know why the attributes alone will not.**
  `width`/`height` on an `<img>` are only *presentational hints*: any author
  `width` or `height` declaration beats them. `.lane__frame img` carried
  `width: auto; height: auto`, so three lazy banners reserved nothing and grew
  that section 575px under the reader — and adding the attributes did not fix
  it, because the CSS was overriding them. Either give the wrapper a definite
  height, or leave the image's `width`/`height` out of the stylesheet so the
  hints and the attribute-derived `aspect-ratio` can do their job. Measure the
  drift, do not assume: scroll the page and diff section heights.

- **`npm run measure` is the design system, asserted.** Seven static gates on
  the files, plus a browser half that needs the site running. Every gate is
  there because the thing it checks already shipped broken, and each was proved
  by reintroducing that exact bug. `design.md` § 12 is the index of them. CI
  runs the static half; the browser half — height drift, the `sizes` slots, how
  many typefaces the page draws in — is still a local step somebody has to
  remember, because `next build` needs real credentials.

- **A gate sees a literal; it cannot see a token used outside its role.**
  `--color-accent-ink` means text *on* lime. `.rail__mark` used it on a canvas:
  near-black in light so it looked right by accident, and `#051C14` — the
  page's own background — in dark, so the glyph was painted in the background
  colour and vanished. The value came from a token, the CSS was valid and every
  colour check passed. **Look at both themes**, and measure contrast on the
  *composited pixels* rather than on the token you believe is underneath. The
  accent that survives on a canvas is `--color-accent-deep`.

- **A `ch` cap belongs on the element whose own font it constrains.** `.head`
  capped a box at `34ch` that holds a display heading *and* a body-face sub, so
  the `ch` resolved in the body face and then constrained a heading set in a
  different one. Invisible while both faces were the same stack; the moment
  Syne landed — 52.8% wider at the same point size, measured — a 24-character
  section heading went to three lines while the box stayed 324px. A cap that
  exists for layout reasons belongs in layout units (`--module`). A face change
  is also when every `clamp` floor has to be re-derived: `--text-display`'s
  3rem put a three-word hero on three lines at 390px.

- **A fixture is a measuring instrument, and it needs calibrating.** A gutter
  measurement reported the hero and the credit overflowing and nearly got
  correct CSS "fixed". The fixture was missing Tailwind's preflight, so
  `box-sizing` was `content-box` and every padded block came out one gutter too
  wide on each side. The tell was a right gutter of exactly `-40px` at 1440 and
  exactly `-30.7px` at 768 — the gutter value itself, which is not the shape a
  real overflow has. When a measurement disagrees with the code, suspect the
  instrument before the code; and load the preflight in any fixture that
  measures a box.
