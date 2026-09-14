# PRD — the reference layout, section by section

**Status:** closed — written 2026-09-14 with both references in hand, and every
section built by the end of that day
**Scope:** `/` only. The structure of its sections, not their copy.
**References:** the Nomvnt page (structure, rhythm, how lime is used) and the
"silence that heals" composition (the drawn grid, the type-on-grid voice).
**Both are in the repository now** — `docs/reference/`, committed 2026-09-14
after four sessions of work written against images nobody after the session
could open.
**Reads with:** `RESEARCH-reference-vs-built.md` (which found `design.md` was a
paraphrase), `RESEARCH-the-first-screen.md` (the scroll-depth budget this has
to live inside)

> **Why a third document about this.** `RESEARCH-reference-vs-built.md`
> diagnosed five divergences and all five are fixed. This one is not a
> diagnosis — it is the section-by-section build order for what is still
> missing, written against the images rather than against a description of
> them. Everything below is checkable by looking at the two references.

---

## 1. What the reference actually does, in order

Nomvnt, top to bottom:

| # | section | what it is |
| --- | --- | --- |
| 1 | **Hero** | full-bleed photograph · giant wordmark set on it in lime, top-left · small nav top-right · a caption block low-right **on** the image · **a row of four small thumbnails along the bottom edge** |
| 2 | **Ticker** | lime band, full bleed, repeating |
| 3 | **About** | `⊹ About Us` · one large sentence-case paragraph on a wide measure · a smaller grey paragraph under it |
| 4 | **Featured** | `⊹ Featured Collection` · heading in two lines, **second line indented right** · two cards side by side, **one of them standing on a lime block** · `( 24 Products )` and ← → at the foot |
| 5 | **Seasonal** | `⊹ Seasonal Series` · two-line heading · `Shop All` at the right · **an asymmetric grid — one large card, three smaller** |
| 6 | **Choose by category** | a photograph carrying the whole section, with the **filter chips laid over it** |
| 7 | **Testimonials** | quote card, portrait on a lime block |
| 8 | **Articles** | two cards with tags |
| 9 | **Footer** | dark ground · link columns · **giant wordmark cropped by the page edge** |

The second reference contributes one thing and it is not a section: a
typographic composition standing on a **visible square grid**, with marks (`←`
`↗` `⌐` `∟`) placed in the empty cells.

## 2. What this site has now

```
hero → ticker → statement → index band (photo + heading)
     → the index (chips + reel) → 2K26 zone → story → lanes
     → closing plate → footer wordmark
```

Sections 1, 2, 3, 6 and 9 are present. The lattice is back on the two
typographic sections. The reference's **type-on-photograph** move is in twice —
the hero and the index band. Since 2026-09-14 the index is a grid rather than a
reel (§ 3.4), and § 3.1, § 3.2, § 3.3 and § 3.5 are built.

## 3. What is missing, in the order it is worth building

### 3.1 The section heading rhythm — the loudest remaining gap

Every Nomvnt section opens the same way, and this page has three different
openings:

| the reference | this page |
| --- | --- |
| `⊹ Featured Collection` — small, grey, sentence case | `✹ The index` on a full-width rail |
| then a heading in **two lines, second line indented right** | `The index` at 18px in the sticky bar |
| then the content | then the content |

The eyebrow already exists as `.rail`. The **two-line indented heading** exists
in exactly one place — `.index-band__title`, added for the band. Nowhere else
uses it, so the page reads as one section that follows the reference and
several that do not.

**Wanted:** one `.section-head` used by the index, the lanes and the closing
block — eyebrow, two-line heading with the second line stepped in, optional
action at the trailing edge. `.rail` becomes its eyebrow rather than a
competing full-width bar.

### 3.2 Lime is a surface in the reference and a hairline here

`RESEARCH-reference-vs-built.md` § 4 measured this and nothing has acted on it.
The reference stands a product photograph **on a lime block, twice**, puts a
portrait on one in the testimonial, and fills the footer with a cropped lime
wordmark. This page uses lime for the ticker band and one word of the hero.

**Wanted:** one lime block behind one gallery card in the index, the same move
the reference makes — not a new colour, not a new token, a surface the system
already has and does not use.

### 3.3 The hero has no thumbnail strip

The reference hangs four small frames along the bottom edge of its hero. They
are the first evidence that there is more than one photograph, and they are
above the fold.

This is also the cheapest possible answer to
`RESEARCH-the-first-screen.md` § 4.1 — which measured **one** photograph in the
first 2.7 screens and now measures the second at 1.56. Four thumbnails on the
hero would put five photographs on screen one.

**Wanted:** a strip of four covers along the foot of `.hero`, each one a link
to its gallery. They are already fetched for the index.

### 3.4 The card grid is a reel where the reference is a grid

Nomvnt's seasonal section is an asymmetric grid — one large card, three
smaller. `/work` already does exactly this with its 7/5/5/7/6/6 spans. The home
index was a horizontal reel instead, which was a deliberate decision recorded in
`PRD-index-as-gallery.md` (seven galleries are a set you choose between, not a
thing you read).

**Reversed and built, 2026-09-14, on the owner's instruction.** This section
said "not wanted, for now" and was named so nobody would fix it without
reading why. The reason it was reversed rather than overridden:

- **The trade was priced before the hero carried anything.** The reel bought
  back height at a moment when the page had one photograph in its first 2.7
  screens, and stacked covers measured 1273px. § 3.3 has since put four covers
  inside the hero's own box: five photographs on screen one, photograph two at
  0.71 screens. The height a stacked index costs is no longer being paid where
  it hurt.
- **What the reel cost was the thing the site is for.** Six of seven galleries
  were off-screen, and someone deciding whether this archive shoots what they
  need had to swipe to find out. "A set you choose between" is the right
  reading of what the index *is*; it does not follow that the set should be
  hidden.

Built as: twelve columns above 60rem with the lead card on six and the rest on
three — one large, then small, which is the reference's own shape — and two
columns below it with the lead across both. Measured section height, against
the reel it replaces:

| | 390 | 768 | 1280 | 1440 |
| --- | --- | --- | --- | --- |
| reel | 325 | 328 | 351 | 380 |
| grid | 1632 | 1535 | 945 | 1033 |

That is the cost, stated plainly: **+1307px on a phone**. It is spent below
photograph two, so it changes neither number § 4 constrains, and the first
three screens now hold more photographs rather than fewer.

**And each card carries a contact strip** — three more plates from inside that
gallery, capped at 2.5 modules so no box exceeds 89 CSS px and each one is a
single 288w file. This was the other half of the instruction, and it is the
part that answers a question the reel could not: one cover says a gallery
exists, three plates behind it say what the job looked like. Evidence rather
than copy, deliberately — the subtitles are the owner's to write
(`pending-task.md` § 4) and the photographs were already in the archive.

One consequence worth naming: the lead card's strip is capped well short of
its own 672px width, so there is a band of empty ground to the right of it at
desktop. Left as it is. Filling it means either serving those three boxes at
448w — 120KB to decorate a card that already carries a large photograph — or a
second layout rule for one card. The emptiness is consistent with the rest of
the page.

### 3.5 Marks in the empty cells

The second reference places `←` `↗` `⌐` `∟` in the blank cells of its grid.
This page has all four marks and they sit in `.open` and `.story` — but they
were positioned before the lattice came back, so they do not land on cells.

**Wanted:** the marks aligned to `--row`, so they read as placed on the grid
rather than near it.

## 4. Constraints this has to respect

- **The scroll budget.** `RESEARCH-the-first-screen.md`: photograph two above
  1.5 screens, six or more inside the first three. It read 1.56 and 10 when
  this was written; § 3.3 moved the first to 0.71. Nothing here may make that
  worse — and § 3.4's height is all spent below it.
- **No new tokens.** Everything above is composition using what
  `tokens.css` already has. The one token added this week, `--color-grid`, was
  a restoration.
- **No CTAs, no pricing, no testimonials.** The reference has all three and
  this site does not sell that way — see `RESEARCH-the-first-screen.md` § 6.
- **The gates stay green.** 20 of them, and `npm run measure` is the check.

## 5. Acceptance criteria

1. One heading component opens the index, the lanes and the closing block, with
   an eyebrow and a two-line heading whose second line is indented.
2. No section still opens with a full-width `.rail` competing with its own
   heading.
3. Exactly one lime surface block exists on `/` besides the ticker.
4. Four gallery thumbnails sit within the hero's own box, each linking to its
   gallery, and photograph two is still at or under 1.56 screens.
5. The marks in `.open` and `.story` land on `--row` multiples.
6. `npm run measure` passes every gate it passed before, and the content gate's
   count does not change.
7. The index is a grid: one card spans half the twelve-column field and the
   rest a quarter of it, every card carries three plates from inside its own
   gallery, no strip box exceeds 96 CSS px at 390, 768, 1280 or 1440, and the
   grid's horizontal overflow is 0 at all four.

## 6. Order of work

1. ~~§ 3.1 the heading rhythm~~ — built, `4d303b3`.
2. ~~§ 3.3 the hero strip~~ — built, `4d303b3`.
3. ~~§ 3.2 the lime surface~~ — built, `4d303b3`; re-cut as an offset shadow on
   the lead frame when a screenshot showed the pseudo-element version drawing a
   lime border around the photograph rather than a block under it. The why is
   in `globals.css` over that rule: `isolation: isolate` makes a negative
   z-index child paint *in front of* its own card's background.
4. ~~§ 3.5 the marks~~ — built, `4d303b3`.
5. ~~§ 3.4 the index as a grid~~ — built on instruction; see that section.
6. ~~Section 4 of the § 1 table, the Featured pair~~ — built 2026-09-14, on the
   owner's note that the page had no image elements beyond the hero and the
   index. **This document never listed it as a gap**, which was the miss: § 3
   catalogued what was missing from the sections this page *had*, and section 4
   of the reference had no counterpart here at all, so it fell out of the
   comparison entirely. Counting the reference rather than reading it is what
   found it — eight of its nine sections carry a photograph and exactly one is
   type alone, against two type-only sections back to back here. The opening
   zone now carries two plates with the first on a lime block, in place of a
   strip of four 12px colour squares.
7. ~~The lanes stack below 48rem~~ — same note. A reel that shows one of three
   on a phone is not a choice set; § 3 had no criterion for *how many of a set
   are visible*, only for which axis it runs on.

Nothing in this document is outstanding.

> **The lesson for the next one of these.** Both misses above are the same
> shape: this PRD compared section to section and never counted. A table of
> "what the reference does" and a table of "what this page has" will not
> surface a section the page is missing outright, or a set the layout hides.
> Count the images, count what is on screen, then compare.
