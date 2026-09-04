# PRD — multi-genre commissions, content composition, and page weight

**Status:** open · audited 2026-09-04 · **no code written yet**
**Companion:** `docs/PRD-mobile-and-identity.md` (shipped, `ea73a48`)

Read this first if a session was cut off. Section 7 is the resume point.

---

## 1. The goal this serves

Fauzy sells photography and creative commissions. He is expanding past the
three genres the site names — into graduations, brand work, and more — while
sport already lives at UNTMD Sports and food at VisuFavor.

Everything below is measured against one question: **does a prospective client
land here and believe this person can shoot their thing?**

---

## 2. Audit — writing

Applied `interfaces:better-writing`. The palette of findings is small but one
of them is structural.

| # | Sev | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- |
| W1 | HIGH | `src/app/page.tsx:123`, `src/app/about/page.tsx` | "Food work lives at VisuFavor, sport at UNTMD Sports, and events and everything unsorted stay in this archive." | Lead with the range Fauzy shoots; name the other two sites as deeper portfolios, not as redirects | The line **sends a paying client away**. Someone who arrived wanting food or sport is told this is not the place. For a commissions site that is the most expensive sentence on it |
| W2 | HIGH | `src/app/page.tsx:118`, `/about`, OG card, `layout.tsx` description | "food, sport and event documentation" | One line that covers the genres actually offered, graduations and brand included | Three named genres is a closed list. A client shooting a graduation reads it and concludes no |
| W3 | HIGH | `src/app/elsewhere/page.tsx:18`, `page.tsx:243` | "The archive here is the unsorted middle." / "Events and everything unsorted — the archive you're standing in." | Position the archive as the full body of work, with two specialised portfolios beside it | "Unsorted", "leftover", "the middle" is the vocabulary of a hobby project. It reads as a shoebox, not a practice |
| W4 | MED | `src/app/about/page.tsx:80` | "Send the date, the location, and roughly what the pictures are for — menu, editorial, a team, a launch." | Add graduation and brand to the examples | The examples are the real genre list a reader believes, more than any heading |
| W5 | MED | `src/lib/site.ts` `elsewhere[].what` | "Court-side and field work…", "Food, plated and photographed." | Frame both as "more of this work at…" rather than as separate destinations | Same redirect problem as W1, in the component that renders in four places |
| W6 | LOW | `src/app/work/page.tsx:29` | "The index is empty — the first galleries are being filed." | Name what will be here and give the reader a next step | Empty states should point forward (principle 11) |
| W7 | LOW | `src/components/notes-panel.tsx:22` | Submit swaps its label to "Sending" | Keep the label, let the spinner carry state | `auth-forms.tsx` keeps its label; two submit buttons behaving differently is the flow-vocabulary rule (principle 6) |

**Verdict: Block.** W1–W3 are the same wound — the copy is written for an
archive of leftovers, and he is selling commissions.

---

## 3. Audit — layout

Applied `interfaces:better-layout`.

| # | Sev | Location | Finding | Principle |
| --- | --- | --- | --- | --- |
| L1 | HIGH | `supabase/schema.sql` `albums` | **No genre column exists.** Nothing in the data can express "this is a graduation set". Every genre requirement below is blocked on this | 4 — order by importance; you cannot order what is not recorded |
| L2 | HIGH | `src/components/index-filter.tsx:11` | The only filter is `All / Open / Held back` — visibility, which is a housekeeping detail no client cares about. A visitor cannot ask "show me graduations" | 5 — hidden content with no cue may as well not exist |
| L3 | MED | `src/components/album-admin.tsx` | Plates list has "make cover" and "remove" and **no way to reorder**. `photos.position` exists in the schema and is only ever set to upload order | 4 — the sequence of a photo essay is the composition |
| L4 | MED | `src/components/uploader.tsx` | Upload is a single batch with one shared caption. There is no step between choosing files and them being live — no arranging, no per-file caption | 5 — progressive disclosure; this is the "susun content" step that does not exist |
| L5 | LOW | `src/app/work/page.tsx` | `.albums` is one flat grid. With five genres and many sets it becomes a wall with no structure | 1 — group with space |

---

## 4. Audit — colour

Applied `interfaces:better-colors`. Measured, both themes.

| # | Sev | Finding | Evidence |
| --- | --- | --- | --- |
| C1 | — | Current palette is **clean**. Every foreground/background pair passes after `f99e4c5` | light `--color-muted` #616764 → 5.58 / 5.25 / 4.96 on paper/paper-2/paper-3, APCA Lc 76.5; dark #B3C0A0 → \|Lc\| 61–65 on all three |
| C2 | MED | **A genre system has no colour to spend.** The system has exactly one accent (`--color-accent` lime) and it is already the signal layer — filter chips, `<em>` marks, the ticker, hover rules | One colour cannot also mean five genres. Principle: one colour, one meaning |
| C3 | — | Do **not** give each genre a hue | Five accents in a system built on one lime would read as a template. Genre should be carried typographically — a mono label in the existing `--color-muted` — with lime reserved for the *selected* state, which is what it already means on `.chip[aria-current]` |

**Verdict: Approve for the existing palette; C2/C3 are a constraint on the
genre design, not a defect.**

---

## 5. Audit — page weight

Measured in headless Chromium at 375px, not estimated.

| resource | requests | size |
| --- | --- | --- |
| **images** | 2 | **8,276 KB** |
| script | 9 | 185 KB |
| font | 3 | 99 KB |
| stylesheet | 1 | 11 KB |
| | | **code total 307 KB** |

Live timings, unthrottled desktop network: DOMContentLoaded 2659ms, load
3690ms. On a real phone connection this is far worse.

| # | Sev | Finding |
| --- | --- | --- |
| P1 | HIGH | **Images are 27× the weight of all code combined.** A 375px-wide phone downloads a 4000×6000 original — 7.77 MB for one plate. There is no `srcset`, no `sizes`, no Next `<Image>`, no Supabase render transform. Every `<img>` points at the full-size object |
| P2 | HIGH | The WebP encoder added in `380c4e7` only helps **future** uploads. The two photographs already in the bucket are untouched originals. Nothing backfills them |
| P3 | MED | Three font families (Syne, Hanken Grotesk, JetBrains Mono) cost 99 KB. All three are used, so this is a real design cost, not waste — but it is a third of the code budget |
| P4 | MED | LCP did not report in either measurement. Cross-origin Supabase images send no `Timing-Allow-Origin`, so image timing is invisible to the field data too |
| P5 | LOW | JS is 185 KB across 9 chunks, Motion included. Reasonable, and not where the problem is |

**Verdict: Block on P1/P2.** No amount of layout work matters while a phone
pulls 8 MB.

---

## 6. The content flow he asked for

> "bikin flow check ketika gw push ke bucket gw bisa susun content"

Today: pick files → they upload → they appear in upload order, with one shared
caption, and the only edit afterwards is "make cover" or "remove".

What it needs to be, given the genre expansion:

1. **A set belongs to a genre.** `albums.genre`, a constrained set —
   graduation, brand, sport, food, event — not free text, so the index can
   filter on it and the copy can name it.
2. **A staging step between choosing and publishing.** Files are encoded and
   previewed as a grid, still local. Ordering is drag-or-arrow, captions are
   per-file, and only then does anything reach the bucket.
3. **Reordering after the fact.** `photos.position` already exists and is
   already read in order; it just has no control bound to it.
4. **The index filters by genre**, replacing the visibility filter, which is
   housekeeping and belongs in the darkroom.

**Explicitly not in scope:** free-text tags, multiple genres per set, a
drag-and-drop library. Arrow buttons that swap `position` satisfy L3 with no
dependency and stay keyboard-accessible.

---

## 7. Order of work — resume here

Each phase is independently shippable. Do them in this order; the reasons are
dependencies, not preference.

| # | Phase | Blocked by | Why this order |
| --- | --- | --- | --- |
| 1 | **P1/P2 — image delivery.** Supabase render transforms or `srcset`, plus a one-off backfill of the two existing originals | — | 8 MB is the largest defect on the site and it is invisible in code review |
| 2 | **L1 — `albums.genre` migration** | — | Everything genre-shaped is blocked on the column existing |
| 3 | **W1–W5 — the commissions rewrite** | 2 (the copy should name the genres the data can hold) | Cheapest change with the largest effect on the stated goal |
| 4 | **L2 — genre filter on the index**, visibility filter moves to the darkroom | 2 | |
| 5 | **L3/L4 — the composition flow**: staging grid, per-file captions, reorder | 2 | Largest build; do it last, when the data model is settled |
| 6 | W6, W7, L5, P3 | — | Polish |

## 8. Acceptance criteria

Measurements, run in a browser against the deployed site — not source reading.
This is the rule `docs/PRD-mobile-and-identity.md` was written to enforce.

1. Total image transfer on `/` at 375px is **under 400 KB**, measured the way
   section 5 measured 8,276 KB.
2. No `<img>` requests an object more than 2× its rendered CSS width.
3. `/work` offers a genre filter, and choosing one narrows the list.
4. `grep -ri "unsorted\|leftover\|the middle" src/` returns nothing.
5. Uploading three files lets them be reordered and captioned individually
   **before** anything reaches the bucket, and the published order matches.
6. Every contrast pair still passes after any new genre styling — re-measure,
   do not assume.
7. The pages are screenshotted at 375px and looked at.
