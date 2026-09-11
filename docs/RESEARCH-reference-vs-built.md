# Research — the reference against what was built, side by side

> **Status: history, and it did its job.** This is the document that found
> `design.md` was a paraphrase rather than a description, and all five of its
> divergences have since been corrected in the code. The decision § 7 said
> everything turned on — whether Nomvnt or Corbusier is the backbone — was
> answered by the owner on 2026-09-11: **Nomvnt is the backbone**, and
> `design.md` § 3 records it. The lattice in § 3 is **removed**.
>
> § 8's method note is the part still worth re-reading, and it is now the rule
> at the top of `design.md`: check fidelity against the images, and if they are
> not to hand, say so and stop rather than measuring the copy.

**Status:** diagnosis. Nothing here is coded, and one decision in § 6 blocks
most of it.
**Raised by the owner:** *"beda banget ya ekspektasi gw sama realita"*, sent
with the Nomvnt reference attached — the first time this session has seen it.

---

## 0. The headline

`design.md` is a **written reconstruction** of two supplied images, and on the
Nomvnt reference it is wrong in five specific, checkable ways. Not details —
these five are most of why the built site does not read like the reference.

The previous document (`RESEARCH-speed-and-the-type-voice.md`) measured the
built site against `design.md` and found one real fault, the collapsed type
system. It could not find any of the five below, because it was measuring
against the paraphrase. That is the limit it stated in its own § 4, and this is
that limit being confirmed.

---

## 1. Headings are sentence case. `design.md` says uppercase.

| | |
| --- | --- |
| `design.md` § 3.5, line 192 | *"Display \| **Syne** 600/700/800, tracking −0.03 to −0.05em, **uppercase**"* |
| The reference | `Must-Have Outerwear` · `The Winter Collection Drop` · `Heard from our costumers` · `Popular Article` |
| Built | `THE INDEX` · `SUMMER IN BLOOM` · `HELD BACK` · `UNTMD SPORTS` |

Every section heading in the reference is **sentence case**, bold, tightly
tracked, left-aligned, and set in two lines with the second line indented to
the right. None of them are capitals.

This is the loudest of the five. Setting every heading and every gallery title
in capitals changes the voice from *editorial* to *shouted*, and it is applied
site-wide — the reel card titles, the page titles, the section headings, the
lane names.

## 2. Section labels are tiny and quiet. `design.md` built a mono rail.

| | |
| --- | --- |
| `design.md` § 11, line 372 | *"Section heading rhythm: **mono two-digit numeral** + tracked-uppercase label + heading"* |
| The reference | a small glyph and two or three words, grey, sentence case: `⊹ About Us` · `⊹ Featured Collection` · `⊹ Seasonal Series` · `⊹ Testimonials` |
| Built | `01 → THE INDEX` on the left, `[CHOOSE BY LANE]` on the right, full width, uppercase, bracketed |

The reference's label is an unobtrusive tag that names the section and gets out
of the way. What was built is a full-width technical rail with a numeral, an
arrow, capitals and a bracketed phrase at the far end — louder than the heading
it introduces.

## 3. There is no drawn grid lattice in the reference. Anywhere.

`design.md` § 3.5 records the lattice as an explicit author-requested
correction, implemented as `<GridLines />`. The Nomvnt reference has **no ruler
lines at all** — not in the hero, not behind the product grids, not in the
testimonial or article sections.

And `design.md` § 1 already says this about the *other* reference: the
Corbusier study's visible ruler lines are *"a presentation aid showing the
underlying column grid — they are **NOT** a texture to reproduce"*, and
rendering them *"would be copying the wrong layer"*.

So neither reference supports the lattice, and one of them explicitly warns
against it. This is `docs/PRD-index-as-gallery.md` § 6, and it is still the
owner's call, because § 3.5 records him asking for it — but he was asking for it
against a description, not against this image.

## 4. Lime is a surface, used repeatedly. `design.md` capped it at 3–5%.

| | |
| --- | --- |
| `design.md` line 126 | *"a bright chartreuse/lime green on the wordmark and CTAs, **small footprint (~3–5%), never flooded**"* |
| `design.md` § 3.6 | *"~85% white. **Green is never a section.**"* |
| The reference | the wordmark over the hero photograph · the full-bleed ticker band · **a lime block behind a product photograph, twice** · the active category chip · article tag chips · and a **giant lime wordmark filling the footer**, cropped by the page edge |

Lime is used as a *background for content* several times down that page. The
built site is, if anything, **too timid** with it — and an earlier draft of the
previous document accused the ticker band of breaking the 5% rule before
arithmetic showed it was inside the budget at 4.0%. The budget itself is the
part that does not match.

## 5. Photographs carry whole sections, with content on top.

| | |
| --- | --- |
| `design.md` § 10 | *"No page gets a decorative enrichment layer — no CSS-art grid lines, no generated illustration, **no background texture of any kind**. Photography is the imagery"* |
| The reference | the hero is a **full-bleed photograph with the wordmark set on it**; the `Choose by Category` section is a **photograph with the filter chips overlaid** |
| Built | type and photographs are kept strictly apart — `.plinth` photographs are full-bleed but nothing is ever set over them |

The rule as written was aimed at generated texture, and it is right about that.
But it was read as "never put anything over a photograph", and the reference
does exactly that twice, including for its single strongest moment — the hero.

## 6. One more, and it retracts my own recommendation from an hour ago

**There is no monospace anywhere in the reference.** The prices, the countdown
`10:56:00`, `( 24 Products )`, the product meta — all the neutral sans.

`RESEARCH-speed-and-the-type-voice.md` § 3.1 recommended giving `--font-mono` a
real monospace, called it free and the highest ratio of design recovered to
bytes spent. Against this image that is **the wrong direction**: it would have
made 33 rules' worth of labels *more* technical when the reference is less.
Withdrawn. The half of that document that still stands is that the display role
needs its own face — the reference's wordmark is unmistakably a distinct
display face — and that the body can stay on the system stack.

---

## 7. The decision this all turns on

`design.md`'s net summary, line 139:

> *"Corbusier is the skeleton and the type voice. Nomvnt is the palette and
> three specific components (paper-band rhythm, tab filter, statement footer)."*

That division is the root mistake to test. The image he sent is not a palette
swatch — it is a **full page structure**: photographic hero with type over it,
ticker, large sentence-case statement, label → heading → content sections,
asymmetric card grids, a photo-backed category filter, testimonials, articles,
and a statement footer. If that is the shape he has been picturing, then Nomvnt
is the backbone and Corbusier is the restraint applied to it — the opposite
weighting to what is written.

**This cannot be answered by measuring.** It is his intent, and everything
below depends on it:

- **If Nomvnt is the backbone:** `design.md` § 1, § 3.5, § 3.6, § 10 and § 11
  all need rewriting against the image first, then the code follows —
  sentence-case headings, quiet labels, lime as a surface, photo-backed
  sections, the lattice dropped. That is a real piece of work and it should not
  start from a paraphrase a second time.
- **If Corbusier is the backbone** and Nomvnt really is only colour, then the
  five divergences above are mostly intentional and the gap is narrower than it
  looks — but then § 1 and § 2 still need fixing, because capitals everywhere
  and a loud mono rail are not in either reference.

Either way, **§ 1 and § 2 are wrong under both readings** and are safe to fix
now: headings to sentence case, section labels to something quiet.

---

## 8. Method note, for the next time

Two documents have now been written measuring the built site against
`design.md`, and `design.md` turned out to be the thing that was wrong. The
references are the source; the description is a lossy copy of them. Anything
that claims to check design fidelity has to check against the images, and if
the images are not to hand, it has to say so loudly rather than measure the
copy and report a pass.

`RESEARCH-speed-and-the-type-voice.md` § 4 did say so, and it was still a
document written against the copy. Saying it is not sufficient — the work
should have stopped there and asked.
