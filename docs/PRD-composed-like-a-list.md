# PRD — the page is composed like a list, and that is what reads as generic

**Status:** research and proposal, 2026-09-19. Measured against the build at
`323b28f`, and against `docs/reference/nomvnt-page.jpg` with the same
instrument.
**Scope:** how `/` is composed, and what moves. Not the typeface, not the
colour tokens, not the copy, not what any gallery holds.
**Reads with:** `PRD-the-reference-layout.md` (which sections exist),
`RESEARCH-reference-vs-built.md` (the first comparison), `IDEAS-motion.md`
(the motion vocabulary this extends), `PRD-routes-that-coexist.md` (which page
does which job)

> **The complaint, in the owner's words:** the site is "lack of creative side
> so the output become passive or slop AI" — still not the reference, even
> after the reference layout was built section by section.
>
> That is not a vague feeling and this document does not treat it as one.
> Every signal named below is counted, on both pages, with the same
> instrument. The short version: **the page has the reference's sections and
> not its composition.** It stacks boxes where the reference layers them, and
> it spends its photographs on thumbnails.

---

## 1. How this was measured

Full-page screenshots of `/` at 1440×900 and 390×844 from the production build,
after a complete scroll so nothing was lazy. The reference is the committed
JPEG, measured by the same code.

Two instruments, both crude on purpose and both pointed at both pages:

- **Photographic area.** The picture is divided into 8px tiles and a tile
  counts as photograph when its luminance variance is over 40. Flat ground —
  paper, a lime block, a dark slab — reads as not-photograph.
- **Accent and dark ground.** A pixel is accent when it is clearly greener
  than it is red or blue, and dark ground when all three channels are low.

Everything in § 3's second table is read out of the live DOM instead: rendered
boxes, computed styles, and rectangles.

## 2. What the owner is seeing, named by the people who write about it

The industry has a vocabulary for this and the signals are specific:

- **"Distributional convergence"** — a model predicts the most probable next
  token, so it lands on the most common pattern on the internet.
- **"Uniform component sizing"**, described exactly: *"identical padding,
  identical border radius, identical card heights"*, *"every element gets the
  same 16px border radius and 24px padding"*.
- **"Hover states that do nothing. Buttons that snap instead of easing."**
- The result is *"technically clean but emotionally invisible"* — an
  **aesthetic monoculture**.

Two of those are literally true of this page today, and the third is nearly
so. They are counted in § 3.

## 3. The numbers

### 3.1 This page against the reference, same instrument

| | reference | `/` at 1440 | `/` at 390 |
| --- | --- | --- | --- |
| photographic area | **43.9%** | 33.1% | 38.8% |
| accent lime | **1.88%** | 0.89% | — |
| dark ground | **25.8%** | 14.8% | — |
| longest stretch with no photograph | 2.2% of height | 4.0% | 1.8% |

The gap is not where it was assumed to be. The page is **not** mostly empty
and it is **not** starved of photographs — 33% against 44% is a real
difference but not the difference. What is half-strength is the **palette**:
the reference spends twice the lime and nearly twice the dark ground.

### 3.2 What the page is actually made of, read from the DOM at 1440

| | count |
| --- | --- |
| photographs | 42 |
| **median photograph** | **4% of one screen** |
| photographs under 2% of a screen | 16 |
| share of all photographic area held by the largest five | **63%** |
| elements drawing a border on three or more sides | **27** |
| sections opening with the same eyebrow + two-line heading | **4 of 9** |
| places where type sits *on* a photograph | **2 of 9 sections** |
| rendered type sizes | 14 — but 89 of 136 text elements are 12 or 13px |
| hover treatments on a card | 3, **every one of them a border colour** |
| lime used as a surface rather than a hairline | 1 block |

## 4. What those numbers mean

### 4.1 It is a contact sheet, not a composition

Three photographs carry 63% of all the photographic area on the page: the
hero at 76% of a screen, the index band at 67%, the closing plate at 40%.
Every other photograph on `/` is a thumbnail — the median is **4% of a
screen**, and sixteen of them are under 2%.

That is the shape of a filing system, and it is what the last four sessions
built: strips of three under every card, four covers in the hero, three frames
in each genre card. Each was right on its own terms — `PRD-index-as-gallery.md`
and the session that put 49 photographs on `/work` were both answering "show
more work". Nothing was answering **"show one photograph properly"**.

The reference does the opposite. Counted by eye off the picture it holds
**about fifteen photographs against this page's forty-two**, and they are
large: a hero that fills the screen, a category band with a skater
running the full width, a portrait standing on a lime block. A visitor's
impression of a photographer is formed by the largest photograph they see, not
by the number of them.

### 4.2 Everything sits in its own box, and nothing sits on anything

Twenty-seven elements draw a border on three or more sides. Type sits on a
photograph in exactly **two** places — the hero and the index band — and both
were built from this reference in the first place.

Layering is the reference's signature and it is in four of its nine sections:
the wordmark runs over the hero photograph, a caption card floats on the
image, the filter chips are laid over the category photograph, and a product
stands on a lime block that breaks out from behind it. That is the move that
makes a page read as *composed by someone* rather than *assembled from
components*, because a box that overlaps another box could not have been
placed by a layout engine following defaults.

This page stacks. Hero, then band, then grid, then zone, then band, each in
its own horizontal slab, each aligned to the same two gutters, each fully
inside its own rectangle.

### 4.3 Four of nine sections open with the same two moves

`.section-head` was built deliberately — `PRD-the-reference-layout.md` § 3.1
asked for one heading rhythm because the page had three competing ones, and it
was the right fix. It has since become the only rhythm: eyebrow, two-line
heading, grid of equal cards, four times over.

The reference opens every section the same way *typographically* and then
gives each one a **different content shape**: two cards side by side, an
asymmetric four, a full-bleed photograph with chips laid on it, a quote beside
a portrait, two wide article cards.

Counting shapes is a reading rather than a measurement, and it is marked as
one: by eye, the reference's nine sections take six different shapes and this
page's nine take three — a full-bleed photograph with type on it, a row or
grid of equal cards, and a block of type on paper. What *is* measured is the
opening: `.section-head` appears four times, and every one of those four is
followed by cards of equal size.

### 4.4 The motion is all arrival, and none of it is answer

Measured live: 93 elements carry a transition or animation, two easing curves,
three durations (120ms, 220ms, 420ms), 13 `.reveal` elements, and
`animation-timeline: view()` on the fold photographs. `IDEAS-motion.md` shipped
all of that and it works.

Every one of those plays **when an element appears**. The page has no motion
that responds to what the reader does:

- Hover on a card changes an **outline colour**. That is the slop guide's own
  example of a hover state that does nothing, and it is three of three.
- Tapping a gallery replaces the page; the cover the visitor chose flashes
  away and comes back at a different size. `IDEAS-motion.md` § 3.4 has wanted
  this since it was written.
- Nothing responds to scroll direction except the masthead.

## 5. What the research says, and what this site's own constraints allow

Grounding, and every proposal in § 6 and § 7 respects all of it:

- **Animate transform and opacity almost exclusively** — *"they run on the
  compositor thread and don't trigger layout recalculations"* — and
  scroll-linked animation *"in particular can cause janky experiences if
  they're touching layout properties like `width`, `height`, or `top`"*.
- **Scroll-linked motion is justified when it "reveals or explains
  something"**, and parallax works *"when used sparingly"*.
- **No motion library.** 350KB was already removed for this exact feature set;
  `motion.tsx` carries the note.
- **The tree is prerendered** and the audience is a phone on mobile data. Any
  idea that delays the first photograph is wrong however good it looks.
- **`prefers-reduced-motion` is a different design, not "off".**

## 6. Proposal — composition

Five changes, ordered by how much of the complaint each one answers. None adds
a token, a typeface or a colour.

### C1 One photograph in every section is allowed to be big

The rule the page is missing: **each section has a subject.** Pick one plate
per section and let it be four to six times the others, instead of three
equals in a row.

Concretely: the index grid's lead card becomes a band — one photograph across
the full measure with its title set on it — and the eight behind it stay as
they are. The genre deck's three-up becomes one large card and two small, the
shape the reference's Seasonal section uses.

Target: **median photograph ≥ 8% of a screen at 1440**, largest five holding
**≤ 50%** of photographic area, with the count of photographs unchanged.

### C2 Put type on the photograph in four sections, not two

Every candidate already has the photograph and the type; they are simply set
one above the other. The genre deck's label over its frame, the lane card's
name over its banner, `/work`'s year over the cover corner, the closing
plate's caption already on it below 60rem.

This is the cheapest of the five: it is position, not new content, and the
hero and the index band prove the treatment reads.

### C3 Stop drawing the box

Twenty-seven bordered boxes to under ten. A photograph does not need a
hairline rectangle around it to be a card — it *is* the card — and "identical
padding, identical border radius, identical card heights" is the most-cited
signal of the look the owner is describing.

Keep borders where they carry structure: the ticker's rules, the chips, the
form fields, the plinth's edges. Remove them from anything whose content is a
photograph.

### C4 Two shapes the page does not have

- **A full-bleed editorial band**: one photograph at the full width of the
  viewport, 70–80vh, with a single line of type set on it. The reference's
  category section. The page has this exactly once, at the index band.
- **An asymmetric pair**: two photographs where one is twice the other, not
  two halves. The reference's Featured row.

Nine sections, three shapes today. Target: **no more than three sections
sharing a shape**.

### C5 Spend the palette

Lime is 0.89% of the page against the reference's 1.88%, and the dark ground
is 14.8% against 25.8%. The tokens exist and are already correct; they are
being spent on hairlines and one block.

- The footer wordmark is `rgb(13,15,14)` — near-black on the dark slab. In the
  reference the equivalent is a **giant lime wordmark cropped by the page
  edge**, and it is the last thing you see. Make it the accent.
- One more dark band, between the index and the 2K26 zone, so the page reads
  light → dark → light → dark rather than a single near-white run with three
  interruptions.

Target: **accent ≥ 1.5%**, **dark ground ≥ 20%**.

## 7. Proposal — motion that answers the reader

Ordered by what a client on a phone would notice. Everything below is CSS or
tens of bytes of JavaScript, transform/opacity/clip-path only.

### M1 Hover is a crop, not a border

Desktop only, and it replaces all three outline-colour hovers: the photograph
scales to 1.03 inside a frame that does not move, over 420ms with
`--ease-out`. The frame crops it, so the picture appears to push forward
against its own edge.

Cost: one rule. It is the single most visible change in this section on a
laptop, and it is the exact defect the slop guide names.

### M2 A plate is uncovered, not faded in

`.reveal[data-kind="plate"]` currently fades and scales from 1.04. Add
`clip-path: inset(0 0 12% 0)` → `inset(0)` on the same timeline: the frame
wipes open from the top as it settles. A photograph being uncovered reads as
a photograph being *shown*; a fade reads as a page loading.

Guarded by `@supports (clip-path: inset(0))` and by reduced-motion, which
keeps the existing opacity-only fallback.

### M3 The cover carries across the navigation

`IDEAS-motion.md` § 3.4, still the biggest single win and still not built. A
client taps a cover on `/work` and the gallery opens with the same photograph
— `view-transition-name: cover-<slug>` on both.

It is cheaper now than when it was deferred: `/work`'s card and the gallery's
opening plate are the same album's cover, so the shared element is a real
pair rather than a lookalike. The aspect change the note warned about is the
remaining work, and it is measurable before it is written.

### M4 The ticker stops while a photograph is on screen

`IDEAS-motion.md` § 3.5. A marquee running beside a plate is ornament
competing with the work. An IntersectionObserver on `.plinth` and the hero,
and the existing `data-paused` attribute does the rest.

### M5 The index re-staggers by scroll direction

The stagger exists and always runs downward. Reading its direction off the
scroll and playing it upward when the reader scrolls up costs one variable on
the observer that is already there, and it makes the grid feel like it is
responding rather than replaying.

### Deliberately not proposed

- **Parallax on type, cursor effects, scroll-velocity skew, sticky-stacked
  sections.** Every one of them is the trend layer the reference does not use
  either, and the audience is a phone where the cursor does not exist.
- **A motion library.** See § 5.
- **An intro animation.** It delays the first photograph, which is the one
  thing this site cannot afford.

## 8. Acceptance criteria, as a gate

`npm run measure` gains a **composition** section, in the browser half, that
reads `/` and reports. It fails on the first three and reports the rest,
because the first three are counts and the rest are judgement:

1. Median rendered photograph is **≥ 8%** of a screen at 1440 and ≥ 7% at 390.
2. The largest five photographs hold **≤ 50%** of the page's photographic area.
3. **≤ 10** elements draw a border on three or more sides.
4. At least **four** sections carry type over a photograph.
5. No more than **three** sections share a content shape. This one is a
   judgement and the gate reports it rather than failing on it — a shape has
   to be named by a person, and a gate that guesses would be worse than none.
6. Accent ≥ 1.5% and dark ground ≥ 20% of page area.
7. Every gate that passes today still passes: `/` stays under 9 screens on a
   phone, photograph two above 1.5 screens, drift 0, no overflow.

Criterion 1 is the one that matters. If a photography site's median photograph
is 4% of a screen, nothing else in this document will fix how it reads.

## 9. Non-goals

- **No new typeface and no new colour token.** The voice is settled — the
  owner has said so twice, once angrily, and `RESEARCH-speed-and-the-type-voice.md`
  records what happened the last time a face changed unasked.
- **No new sections.** `PRD-the-reference-layout.md` settled which sections
  exist; this document is about how they are composed.
- **No CTA, no pricing, no testimonials, no booking form.**
- **No fewer photographs.** C1 changes their sizes, not their count: `/work`'s
  49 and the home page's 37 stay.

## 10. Process note

Both instruments are blunt and both were pointed at both pages, which is the
only reason the comparison holds:

- The variance test counts a lime block and a white product shot on white
  paper as *not photograph*, so the reference's own 43.9% is an undercount of
  what a reader would call an image. The direction of the gap is safe; the
  exact figure is not.
- The reference is a **JPEG of a design**, not a live page. Its motion could
  not be measured at all, and every claim here about what it does is read off
  one rendering at one width. Where this document says "the reference layers",
  that is visible in the picture; where it might have said "the reference
  animates", it says nothing.

And the finding that did not survive being measured: the working assumption
before any of this was that the page looked thin because it had too few
photographs. It has 42 on one page, and 33.1% of its area is photographic
against the reference's 43.9%. The fault was never the count — it is that
three of them are large and thirty-nine are thumbnails. Counting first is what
changed the proposal from "add more" to "make one big".
