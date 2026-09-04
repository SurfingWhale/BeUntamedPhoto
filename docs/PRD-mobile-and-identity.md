# PRD — the mobile page is laid out six times too wide, and the site links off-brand

**Status:** open · written 2026-09-04, before any code
**Scope:** `/` on phone widths, plus the outbound links in `src/lib/site.ts`

---

## 1. Why this exists

Three rounds of "fixed the mobile crop" were shipped and the crop was still
there. Each round verified the wrong thing: it read the served HTML, confirmed
an attribute was present, computed an `object-fit` ratio on paper, and called it
done. None of it opened the page.

This document exists because that loop cost real time. Nothing below gets coded
until the root cause is named and measured **in a browser**, and nothing is
called done until it is measured **in a browser again**.

---

## 2. What is actually wrong

### 2.1 The home page is laid out 2410px wide inside a 375px viewport

Measured with headless Chromium at 375×812:

| element | rendered box | intrinsic | `object-fit` crop |
| --- | --- | --- | --- |
| `.fold-photo__img` (home) | **2410 × 3615** | 4000×6000 | 0% |
| `.album__media` (home) | **1400 × 2100** | 4000×6000 | 0% |
| `.album__media` (/work) | 335 × 503 | 4000×6000 | 0% |
| `.fold-photo__img` (/about) | 375 × 563 | 4000×6000 | 0% |

The aspect-ratio work was correct — the crop really is 0% — but it was
measuring the wrong thing. The box is six times wider than the screen, so a
reader sees roughly the left 15% of each photograph. That reads as "cropped",
and it is, just not by `object-fit`.

**Root cause.** `.page` is `display: grid` with no `grid-template-columns`, so
it gets one `auto` track. `.ticker__track` is `white-space: nowrap` and its
min-content contribution sizes that track to 2409.77px. Every sibling section
then stretches to the track. `html`/`body` carry `overflow-x: clip`, which
hides the overflow instead of scrolling it — which is why no horizontal
scrollbar ever appeared and why three rounds of markup inspection found nothing.

Confirmed by bisection: hiding `.ticker` collapses the track from 2409.77px to
375px. Hiding any other child changes nothing.

Only `/` has a ticker, which is why `/work` and `/about` measured correctly and
looked fine.

**Age.** Present since the ticker landed in `634de49`. The `aspect-ratio` change
in `744fe3e` did not cause it but made it worse: the fold's height used to be
fixed, and now follows the inflated width, so the fold grew to 3615px tall.

### 2.2 The same trap is set in 26 other places

Every `display: grid` rule in `globals.css` that omits `grid-template-columns`
gets an `auto` track with the same behaviour. Today only `.page` holds a child
wide enough to trigger it. `.strip`, `.notes`, `.elsewhere`, `.dark-grid`,
`.fold-text`, `.band`, `.grid-band`, `.head`, `.album`, `.auth`, `.foot` and
`.page__intro` are all one wide child away from the same bug.

### 2.3 The site links to Surfing Whale

`site.elsewhere` carries a third entry, "Studio notes and side projects — where
things get built before they get shot." It renders in four places: the home
page, `/about`, `/elsewhere`, and the footer.

This is the standing identity rule being broken. UNTAMED sells photography and
creative commissions; Surfing Whale is the build/side-project identity. A
prospective client following that link lands somewhere that reframes the
photographer as a hobbyist. The footer's GitHub link is the same category of
leak, and points at the account whose commits carry a legal name.

---

## 3. Requirements

**R1 — No layout box on any page may exceed the viewport width.**
At 320, 375 and 430px, every element's rendered `right` edge sits within the
viewport and `document.scrollWidth` equals the viewport width.

**R2 — `.page` pins its track.** `grid-template-columns: minmax(0, 1fr)`, so no
future wide child can inflate it. The ticker is also fixed at its source so it
stops contributing an oversized min-content in the first place.

**R3 — Every single-column grid in the system pins its track**, for the same
reason, so this class of bug cannot recur silently.

**R4 — Photographs stay uncropped on phones.** `object-fit` loss stays at 0%
for the folds and for album tiles that have a cover, which is already true and
must not regress.

**R5 — No outbound link or copy on the site refers to anything but the
photography practice.** Surfing Whale is removed. The GitHub link is removed.

---

## 4. Non-goals

- The desktop layout. It measures correctly and is not being touched.
- The ticker's design, speed, or content. Only its width contribution changes.
- The 25% crop on album tiles at ≥40rem, which is a deliberate editorial crop
  for a multi-column grid.
- `UNTMD Sports` and `VisuFavor`, which are both photography and stay.

---

## 5. Acceptance criteria

Each one is a measurement, run in headless Chromium against the deployed site,
not a reading of the source:

1. At 375px, `getComputedStyle(document.querySelector('.page')).gridTemplateColumns`
   is `375px`.
2. At 320, 375 and 430px, on `/`, `/work`, `/about`, `/elsewhere` and `/notes`,
   no element has a bounding box extending past the viewport, and
   `document.documentElement.scrollWidth` equals the viewport width.
3. Every `<img>` on those pages reports a rendered box no wider than the
   viewport, and 0% `object-fit` loss where the box carries a real ratio.
4. `grep -ri "surfing.whale\|github.com" src/` returns nothing.
5. A screenshot of `/` at 375px is opened and looked at before this is called
   done.

---

## 6. Process note

The rule this cost us: **a layout claim is only true if a browser was asked.**
Reading the HTML proves the markup shipped. It does not prove the box is the
size you think it is, and `overflow-x: clip` guarantees the page will look
calm while being wrong.
