# PRD — the index reads as a directory, and the home page prints it twice

**Status:** phases 0–2 shipped (`763d821`, `85919e4`, `1bf5b7e`)
**Scope:** the index on `/` and `/work`, the plate strip on `/work/[slug]`, and
the sticky/safe-area and layout-shift defects found while measuring them
**Raised by the owner:** *"the index needs to be magnetic disappear, looks like
scrollable gallery instead of infinite stacked… made user bored and takes too
long to scroll"* and *"the layout still feels so ai slop"*

---

## 0. Outcome

Measured on the same harness as § 2, after phases 0–2:

| | before | after | shipped in |
| --- | --- | --- | --- |
| `/` | 8.5 screens | **4.8** | § 5.2, 5.3, 5.4 |
| `/work` | 4.9 screens | **2.8** | § 5.3 |
| `/work` rasterised image area | 26.6 MB | **6.1 MB** | § 5.3 |
| height drift while scrolling | +575px | **0** | § 5.6c |
| duplicate titles on `/` | 6 | **0** | § 5.2 |
| index section | 1273px | **568px** | § 5.3 |
| lanes section | 1688px | **355px** | § 5.3 |

`/` beat the 6.0-screen criterion in § 8 because the lanes became a reel too,
which was not in the plan below: three destinations are a choice set on the
same reasoning as the seven galleries, and stacked they had become the largest
block on the page.

**Phase 3, and the part of it that was rejected.** The `sizes` audit shipped:
four of the six declarations were over-declaring, the worst by three candidate
steps — `/work` tiles still said `100vw` after § 5.3 made them two columns, so
a phone pulled a 1500w file for a 167px box. All four were retuned against the
measured box at 390, 430, 768 and 1280 CSS px, and the result was verified by
letting the browser resolve each declaration against the real candidate list:
14 of 16 slot/viewport pairs now land on the smallest candidate that covers the
box, every phone width among them.

**`content-visibility: auto` was tried and rejected, on measurement.** The
browser does skip the plates — 13 of 24 at load, confirmed through
`contentvisibilityautostatechange` — but it cannot report an honest height
here, and not for want of tuning. The estimate was computed per plate from that
photograph's own stored ratio, which sounds exact and is not: these are grid
items, and a grid row stretches every item to the tallest one. A plate with a
146px frame measures 314px because its neighbour is a portrait. A plate's
height is a function of its *sibling*, so no per-item intrinsic size can match
it, and the page misreported itself by 105px. Against that, full style+layout
recalc was 19.9ms with it and 20.4ms without — inside the noise, consistent
with § 4. Revisiting it means stopping the grid stretching rows first; the
reasoning is recorded in `globals.css` beside `.strip__item`.

That measurement did turn up a real defect, now fixed: the row's spare height
was being dealt out between a plate's number, frame and caption, so a landscape
plate's caption floated ~168px below its own photograph while the portrait
beside it sat tight. `align-content: start` on `.strip__item`; the caption gap
is now a uniform 12px on every plate.

**§ 9 is closed, in code, with no migration to run.** `profiles` is
world-readable by policy, so `getNotes` reads which accounts hold the owner
role through the anonymous client — cached for an hour, and anonymous on
purpose, since a cookie read there would cost every guestbook page its cache —
and substitutes `site.byline` before the rows are returned.

Substituting it in the panel was tried first and was **not enough.** The rows
are props of a client component, so the raw `display_name` was serialised into
the RSC payload: the page rendered the byline and shipped the personal name in
view-source, inside a response cached for five minutes. Verified by planting a
name in a fixture and grepping the whole served response — 1 occurrence with
the component-level fix, 0 with the data-layer one, and the visitor's own name
untouched in both. That lesson is now a convention in `CLAUDE.md`.
`supabase/byline-on-owner-notes.sql` survives as optional: all it does now is
change what the masthead greets the owner with, which only the owner ever sees.

**Still open.** The § 6 lattice question, which is the owner's to answer. The
album page stays 6.1 screens for 24 plates, and that is the intended shape —
those plates are the content, not chrome.

---

## 1. Why this exists

Two separate complaints arrived together and they have different causes, so
they need separating before anything is built:

1. **"Too long to scroll / boring."** Measured below. It is real, and the
   dominant cause is not rendering speed — it is that the home page lists the
   same seven galleries twice, in two different visual languages, across 2.6
   screens.
2. **"Still feels like AI slop."** Also real, and specific: the pattern
   `design.md` § 11 names as *the* templated tell is in the stylesheet, three
   lines below a comment forbidding it.

There is also a third thing, unrelated to layout, that the measurement turned
up: **a signed-in owner leaving a guestbook note publishes their profile name
to every visitor.** That is § 9, and it is the only item here that is a P0
regardless of what happens to the redesign.

Per the house rule from `docs/PRD-mobile-and-identity.md`: nothing is coded
until the cause is named and measured **in a browser**, and nothing is called
done until it is measured **in a browser again**.

---

## 2. How this was measured

Headless Chromium, viewport **390 × 844**, `deviceScaleFactor: 3`,
`isMobile: true` — a production `next build`/`next start`, not dev mode.

The database is unreachable from the build sandbox, so the pages were served
against a fixture mirroring the **seven real albums** (`Summer In Bloom`,
`DARA BERSEMI`, `Held back`, `Sales HeadShot`, `Nuna Graduation`,
`Hello There…`, `Lumos Studio`) and a 31-plate album, with plate ratios mixed
3:2 and 2:3. Album titles and slugs were read off the live production HTML, so
the content *shape* is real even though the photographs are placeholders.

**Two limits on what follows, stated up front:**

- **Frame timings are from desktop-class hardware.** They are a floor, not a
  phone estimate. Where a number needs a real device, § 8 says so.
- **Decoded-bitmap totals are the rasterised layout box** (`box × dpr² × 4B`).
  The decoded *source* bitmap depends on which `srcset` candidate a phone
  picks from the live Supabase renderer, which could not be exercised here.

---

## 3. What is actually wrong

### 3.1 The home page is 7.8 screens long, and 2.6 of them are the same list twice

| page | scroll height | screens | swipes at 0.8 × viewport |
| --- | --- | --- | --- |
| `/` | **6569px** | **7.8** | ~10 |
| `/work` | 4125px | 4.9 | 7 |
| `/work/[slug]` (24 plates) | 5172px | 6.1 | 8 |

Home page, section by section, with the scroll offset each one starts at:

| section | height | starts at | screens in |
| --- | --- | --- | --- |
| `.open` | 373px | 0 | 0.0 |
| `.ticker` | 34px | 503px | 0.6 |
| `.plinth` (hero plate) | 320px | 537px | 0.6 |
| `.story` | 935px | 944px | 1.1 |
| **`.grid-band.plot` — "Recent work"** | **1197px** | 1920px | **2.3** |
| **`.grid-band` — "The index"** | **965px** | 3160px | **3.7** |
| `.lanes` | 1219px → **1794px** | 4083px | 4.8 |
| `.plinth` (closing plate) | 612px | — | — |

**Root cause.** `src/app/page.tsx` renders `albums.slice(0, 6)` as a cover grid
under the heading *"Recent work"*, and then renders `<IndexFilter albums={albums} />`
— all seven — as a numbered text list under the heading *"The index"*. Querying
every rendered `.album__title` and `.index__name` returns **six duplicated
titles**: `Summer In Bloom`, `DARA BERSEMI`, `Held back`, `Sales HeadShot`,
`Nuna Graduation`, `Hello There…`.

So **2162px — 2.6 of the 7.8 screens — is one set of seven galleries, printed
twice.** A visitor scrolls past the covers, then scrolls past the same names
again as text, and arrives at the lanes having learned nothing new since
screen 2.3. That is the boredom, and it is a content-architecture bug, not a
scrolling bug.

### 3.2 The index has no photographs in it

`design.md` § 10 — *"Content pages (`/work`, `/about`, `/notes`) — typography
+ the photographs only."*

`.index__row` renders `[03]` · title · `EVENT · UNFILED · 2026 ↗`. No cover.
The one thing a client visiting a photographer's index wants to look at is the
only thing not in it. That is why it reads as a directory: **it is a
directory.** The covers exist — they are loaded already for the section
immediately above it.

### 3.3 The AI-slop tell is in the stylesheet, against its own comment

`src/app/globals.css:920` —

> *Single column, always. A label sitting beside a heading on the same row is
> the templated-editorial tell (slop-test gate 66) — the count stacks under the
> heading instead.*

`src/app/globals.css:968`, forty-eight lines later —

```css
.index-sticky .index-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;   /* ← the thing the comment forbids */
}
```

Computed style on the live element, measured: `display: flex / space-between`.
That renders **`THE INDEX` ⟷ `( 7 GALLERIES )`** — which `design.md` § 11 names
explicitly:

> Section heading rhythm: mono two-digit numeral + tracked-uppercase label +
> heading, **stacked vertically** (never the tag-left/heading-right two-column
> pattern — that reads as a templated AI tell).

This is the same failure mode as the lanes slab: a correct comment written,
then the forbidden thing done underneath it. It is the single most direct answer
to *"still feels like AI slop"*, and it is a four-line fix.

### 3.4 Every sticky bar pins under the iOS clock

`.index-sticky { top: var(--mast-h, 0px); }` and `MastheadRetract`
(`src/components/motion.tsx:97`) publishes `--mast-h: 0px` **while the masthead
is retracted**. So on a downward scroll the index bar pins to `top: 0` — and the
app is `viewport-fit: cover` with a translucent status bar, so iOS draws the
clock and battery straight over `THE INDEX`. That is the overlap in the third
screenshot.

The masthead itself already handles this (`globals.css:314`, with a comment
explaining exactly this hazard). The index bar does not. Same bug, second
location — which means it belongs in `CLAUDE.md` as a rule, not just a patch.

### 3.5 The lanes section grows 575px underneath the reader

Measured: `.lanes` is **1219px** on load and **1794px** after scrolling to the
bottom — `+575px`, arriving while the visitor is mid-scroll.

**Root cause.** `src/components/lanes.tsx:66` —

```tsx
<img src={lane.banner} alt={lane.alt} loading="lazy" decoding="async" />
```

No `width`/`height` attributes, and `globals.css:1600` sets `width: auto;
height: auto`. Three lazy banners with no reserved box, ~190px each. The whole
page below them jumps three times as they land.

This costs more perceived speed than any amount of render optimisation buys
back, because the content moves while a thumb is on it. It is also mine, from
the lanes work.

### 3.6 Two thirds to four fifths of the decoded image area is offscreen and retained

Rasterised footprint (`box × dpr² × 4B`), and how much of it is outside the
viewport at load:

| page | images | rasterised | offscreen | share offscreen |
| --- | --- | --- | --- | --- |
| `/` | 11 | 17.1 MB | 14.3 MB | **84%** |
| `/work` | 7 | 26.6 MB | 17.5 MB | **66%** |
| `/work/[slug]` | 24 | 23.0 MB | 18.2 MB | **79%** |

Nothing in the codebase uses `content-visibility` or `contain-intrinsic-size`
— confirmed by grep. So the browser lays out, paints and retains all of it.

On `/work` a single-column tile is 350 × 525 CSS px at DPR 3, which is
1050 × 1575 physical — the browser will pick the **1500w** candidate from
`WIDTHS` for a box that needs 1080w. Worth an audit; see § 8.

### 3.7 Seven galleries take 4.9 screens on `/work`

`.albums` is 3009px for seven tiles — **430px per gallery**, single column, one
below the other. `/work` is the page a client is sent to. It is a wall.

---

## 4. The reframe: this is not a virtualisation problem

The obvious fix for "long list, too much memory" is to virtualise it, so that
was tested before proposing it. `content-visibility: auto` +
`contain-intrinsic-size: auto 420px` applied to `.strip__item`, `.album`,
`.index__row` and `.lane`, A/B, same build, same viewport:

| page | | median frame | p95 frame | frames > 50ms | full style+layout recalc |
| --- | --- | --- | --- | --- | --- |
| `/work/[slug]` | baseline | 16.7ms | 17.1ms | **0** | 16.4ms |
| | with `c-v` | 16.7ms | 17.4ms | 0 | 13.7ms |
| `/work` | baseline | 16.7ms | 16.9ms | **0** | 15.0ms |
| | with `c-v` | 16.7ms | 17.5ms | 0 | 14.1ms |
| `/` | baseline | 16.7ms | 37.5ms | 1 | 37.5ms |
| | with `c-v` | 16.7ms | 38.2ms | 0 | **18.0ms** |

**Two conclusions, and the second one matters more.**

**Scrolling is not janky at this content volume.** Median frame is a clean
16.7ms with and without, and the album page drops zero frames either way. At
seven galleries and 24 plates there is no rendering bottleneck to remove.
Virtualisation buys a halving of full-recalc cost on the home page (37.5 → 18ms)
— worth having, invisible to a reader.

**The naive version introduces a worse bug than it fixes.** A blanket
`contain-intrinsic-size: auto 420px` made the page mis-report its own height
until the items were measured:

| page | height claimed on load | true height | drift |
| --- | --- | --- | --- |
| `/work/[slug]` | 6337px | 5174px | **−1163px** |
| `/work` | 4193px | 4125px | −68px |
| `/` | 9912px | 7144px | **−2768px** |

A 2768px lie about the page height is a scrollbar that jumps and a scroll
position that cannot be restored. So `contain-intrinsic-size` is only safe here
with a **per-item value derived from the plate's stored `width`/`height`** — the
database has both columns — never a shared constant.

**Therefore: the lever is to make the page shorter, not to render a long page
more cleverly.** Which is also what the brief already says — `design.md` § 11:
*"the fix for a cramped page is fewer things, not bigger gaps around the same
amount of stuff."*

---

## 5. Proposal

### 5.1 The organising principle

Research on mobile gallery patterns splits cleanly, and the split maps onto
this site:

- **Horizontal, snap-scrolled** suits a *lateral choice set* — portfolios and
  galleries, where the value is browsing across options. It saves vertical
  space, scroll-snap runs on the compositor rather than the main thread, and a
  partially-visible next item is itself the affordance that says "more".
- **Vertical** suits content you *consume*. Horizontal scrolling breaks the
  reading direction, and most people reflexively scroll down.

So:

> **Choosing a gallery scrolls sideways. Reading a gallery scrolls down.**

Seven galleries are a choice set — horizontal. Twenty-four plates inside one
gallery are the content — vertical. This is why the answer is not "make
everything a carousel".

### 5.2 One index, not two — delete "Recent work"

Remove the `.grid-band.plot` cover grid from `src/app/page.tsx`. The index
below it becomes the only index, and gains the covers.

Saves **1240px** (the grid plus the section rail that introduced it) and
removes six duplicated titles.

Together with § 5.3 replacing the text list with a strip, the arithmetic on the
measured sections is:

| | px | screens |
| --- | --- | --- |
| measured | 6569 | 7.8 |
| less "Recent work" + its rail | −1240 | |
| less the list → strip (est. 520px) | −445 | |
| **projected** | **4884** | **5.8** |

The strip's 520px is the one number in this document that is an estimate rather
than a measurement, and it is the reason the projection is 5.8 rather than a
rounder figure. An earlier draft of this PRD claimed **5.2 screens** — that
overstated the saving by 495px and is corrected here.

### 5.3 The index becomes a film strip

One horizontally snap-scrolled row of cover cards, in place of both the grid and
the text list. Per card, keeping the Specimen numbered-plate rhythm that § 1 of
`design.md` is built on:

```
[03]              ← mono index, hung in the card's left margin
┌──────────────┐
│    cover     │  ← the photograph, its own ratio, no crop
└──────────────┘
HELD BACK        ← Syne 800, uppercase
EVENT · 2026 ↗   ← mono meta, bracketed where it is a coordinate
```

- `scroll-snap-type: x mandatory`, `scroll-snap-align: start`, card width
  ~**78vw** so the next card peeks and reads as "keep going".
- Seven galleries occupy **one screen** instead of 2.6.
- The genre chips stay, and stay sticky — they are the one control that earns
  pinning. The heading **stacks above them** (§ 3.3).
- Progressive enhancement: `::scroll-marker` dots and `::scroll-button()` where
  supported — **Chrome 135+ and Safari 19+, Firefox partial, not Baseline** — so
  they are additive only. Plain overflow scroll is the floor and works
  everywhere, with no JavaScript in either case.
- `/work` keeps a vertical grid (it is the full index, and a client sent that
  link is there to survey everything) but drops to **two columns** at phone
  width. Seven galleries in ~2.5 screens instead of 4.9.

### 5.4 "Magnetic disappear"

Read as: the section should settle where you left it and then get out of the
way, rather than being a wall you grind past. Two mechanisms, both off the main
thread:

- **Settle:** scroll-snap on the strip only — *not* `scroll-snap-type: y` on the
  page. Page-level vertical snapping fights a reader who wants to scan an
  editorial page, and would make the long-form `.story` section unreadable.
- **Disappear:** `animation-timeline: view()` fading and easing the section out
  as it leaves the viewport. Scroll-driven animations run on the compositor, so
  this costs no frame time — and `design.md` § 7 allows exactly this much:
  fade-only, ≤220ms, no bounce, no hover-scale.

Behind `@media (prefers-reduced-motion: reduce)`, both reduce to plain scrolling.

### 5.5 The album page stays vertical, and gets contained properly

Keep the vertical strip — it is the content. Add, per plate:

- `content-visibility: auto`
- `contain-intrinsic-size` **computed from the plate's own stored
  `width`/`height`**, emitted as an inline custom property per item. This is the
  part § 4 proved cannot be a constant.
- Reserve every box: `width`/`height` attributes on every `<img>` on the site,
  which also fixes § 3.5.

Caveat to accept knowingly: reported behaviour is that Safari does not reliably
find text inside `content-visibility: auto` subtrees with find-in-page (as of
18.3.1), and never paints `<text>` inside an SVG in one. Mitigation: contain
`.strip__frame` (the image box) and leave `.strip__cap` (the caption text)
outside the contained element, so captions stay findable.

### 5.6 The polish fixes, which are small and independent

| # | fix | file |
| --- | --- | --- |
| a | Stack the index heading over its count | `globals.css:968` |
| b | `top: max(var(--mast-h, 0px), env(safe-area-inset-top, 0px))` on every sticky | `globals.css:963` |
| c | `width`/`height` on the three lane banners | `lanes.tsx:66` |
| d | Audit `SIZES.tile` against the real box (§ 3.6) | `lib/images.ts` |

(b) becomes a `CLAUDE.md` convention — it is the second time this bug has
shipped in a different component.

---

## 6. Open decisions — these are the owner's, not mine

1. **The drawn lattice at phone width.** `design.md` contains a genuine
   contradiction: § 3.5 records *"the grid is drawn"* as an explicit
   author-requested correction (2026-09-03, `<GridLines />`), while § 1 and § 10
   forbid *"CSS-art grid lines"* as "copying the presentation layer, not the
   DNA". § 3.5 is the later instruction, so the lattice stays as authorised —
   but at 390px an 8-column lattice behind body text is closer to noise than
   structure. **Recommendation:** keep it at ≥ 48rem, fade to the four `+`
   register marks below that. **This needs an explicit yes — I am not removing
   an author-requested element on my own reading.**

2. **Dropping "Recent work" entirely** (§ 5.2) versus keeping a single hero
   gallery there. Recommendation: drop it; the strip does the job in a third of
   the height.

3. **Whether `/work` keeps a vertical grid at all**, or becomes the same strip
   per genre. Recommendation: keep vertical — it is the survey page.

---

## 7. Non-goals

- Infinite scroll. The archive is seven galleries; paging already exists at 24
  plates and works.
- A JavaScript virtual-list library. § 4 shows there is no frame budget to
  reclaim at this volume, and it would break the prerendering that was just
  shipped.
- Changing the type, palette, or spacing scale. `tokens.css` stands.
- Touching the darkroom. Owner-only, dynamic, not part of this.

---

## 8. Acceptance criteria — measured in a browser, twice

| # | criterion | how it is checked |
| --- | --- | --- |
| 1 | `/` ≤ **6.0 screens** at 390×844 (from 7.8) | `scrollHeight / 844` |
| 2 | **Zero** duplicated album titles on `/` | query `.album__title, .index__name`, compare sets |
| 3 | Seven galleries reachable within **one screen** of the index heading | offset of the last card |
| 4 | `/work` ≤ **2.6 screens** (from 4.9) | `scrollHeight / 844` |
| 5 | Height drift while scrolling **= 0px** on every page (from +575px) | section heights before/after a full scroll |
| 6 | `scrollHeight` on load within **±16px** of true height | the § 4 drift harness |
| 7 | No sticky element's painted top above `env(safe-area-inset-top)` | computed `top` with the masthead retracted |
| 8 | Offscreen rasterised share **< 30%** (from 66–84%) | the § 3.6 harness |
| 9 | Index heading computed `display` is **not** `flex/space-between` | computed style |
| 10 | On a real iPhone: no white flash on the strip, and scroll position survives a back-navigation | device check — cannot be done in the sandbox |
| 11 | Renderer returns **WebP/AVIF**, not resized JPEG | `content-type` on a live render URL — needs the live project |

Criteria 10 and 11 need hardware and the live database. They are not
sandbox-verifiable and must not be reported as passing from a build alone.

---

## 9. Separate P0 — the guestbook publishes the owner's profile name

Found while measuring; unrelated to layout; ships independently of everything
above.

`supabase/schema.sql:149` —

```sql
select n.id, n.album_id, n.body, n.created_at, n.user_id, p.display_name
```

`notes_with_author` publishes `profiles.display_name` beside every note, and
`/notes` plus every gallery guestbook is public and now **prerendered and
cached for five minutes**. `profiles.display_name` defaults to the email
local-part (`schema.sql:25`), and the masthead in the owner's own screenshot
reads **`FAUZY`** — so that is the value currently stored.

**Therefore: the moment the owner leaves a note on their own guestbook, a
personal name is published to every visitor and held in a shared cache.**

`CLAUDE.md` states the rule as standing and categorical — *"No person. No legal
name… The public byline is `site.byline`."*

Fix, in order of durability:

1. Render notes authored by an `owner`-role account under `site.byline` rather
   than the profile name — the archive replies as the archive.
2. Set `profiles.display_name` for the owner account to the byline, so the
   masthead and any missed path agree.
3. Check whether any note already carries it, before the cache is warmed
   again — this needs a query against the live database, which I cannot reach.

**This is unverified against production data.** I can see the schema and the
default and the screenshot; I cannot see the `notes` table. Treat § 9 as "check
this now", not as "this has happened".

---

## 10. Phasing

| phase | contents | why this order |
| --- | --- | --- |
| **0** | § 9 (name leak), § 5.6b (safe-area), § 5.6c (lane banners) | Small, independent, no design decisions. One is a privacy issue and two are visible defects. |
| **1** | § 5.2 (delete the duplicate), § 5.6a (stack the heading) | Deletions. Biggest measured win — ~1200px and the slop tell — for the least new code. |
| **2** | § 5.3 (film strip), § 5.4 (settle + exit) | The actual redesign. Needs decision 6.1 answered first. |
| **3** | § 5.5 (containment), § 5.6d (`sizes` audit) | Memory and bytes. Needs the per-plate intrinsic sizing from § 4, and a device check. |

Phase 0 and 1 together should be measurable before phase 2 is designed, because
they change the numbers phase 2 is aiming at.
