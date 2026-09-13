# PRD — the reference layout, section by section

**Status:** open — written 2026-09-14 with both references in hand
**Scope:** `/` only. The structure of its sections, not their copy.
**References:** the Nomvnt page (structure, rhythm, how lime is used) and the
"silence that heals" composition (the drawn grid, the type-on-grid voice)
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
the hero and the index band.

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
index is a horizontal reel instead, which was a deliberate decision recorded in
`PRD-index-as-gallery.md` (seven galleries are a set you choose between, not a
thing you read) and it is still defensible.

**Not wanted, for now.** Named so nobody "fixes" it later without reading why.

### 3.5 Marks in the empty cells

The second reference places `←` `↗` `⌐` `∟` in the blank cells of its grid.
This page has all four marks and they sit in `.open` and `.story` — but they
were positioned before the lattice came back, so they do not land on cells.

**Wanted:** the marks aligned to `--row`, so they read as placed on the grid
rather than near it.

## 4. Constraints this has to respect

- **The scroll budget.** `RESEARCH-the-first-screen.md`: photograph two above
  1.5 screens, six or more inside the first three. It currently reads 1.56 and
  10. Nothing here may make the first number worse — § 3.3 improves it.
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

## 6. Order of work

1. § 3.1 the heading rhythm — it is the one that makes the page read as one
   thing, and it touches the most sections.
2. § 3.3 the hero strip — cheapest win against the first-screen budget.
3. § 3.2 the lime surface — one block, one rule.
4. § 3.5 the marks — smallest, and only worth doing once the lattice is settled.
