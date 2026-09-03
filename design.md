# Design — UNTAMED

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

**Status:** applied to shared chrome + `/`.

- **Done:** `tokens.css`, `globals.css`, `layout.tsx`, `footer.tsx` carry the
  system (near-white/forest-green · Archivo grotesque · lime accent · Ft5
  statement footer) — global, so every route inherits colour + type.
- **Done:** `/` rebuilt to the Portfolio Grid low-density shape in § 3 —
  H6 hero fold → intro → three asymmetric tiles (spans 7 / 4 / 6, one
  deliberately short of the edge) → forest-green band carrying the lane
  index → closing fold. Five blocks, down from seven.
- **Correction (2026-09-03):** the first pass on `/` only recoloured the old
  Photographic macrostructure and was reported as "tuned" — it wasn't. The
  green paper-band motif (§ 1) was missing entirely, and no restructuring had
  happened. Fixed in the pass above. Lesson for future runs: a rebrand that
  only swaps tokens is a reskin, and this file's § 3 is not satisfied by one.
- **Not done:** `/work`, `/about`, `/notes` still run their old structure
  (their JSX is untouched) wearing the new colours. The Specimen pass on
  those — numbered plates, staggered spans — is the next step.

---

## 0 · Brand context — why this exists

UNTAMED (this site, `beuntamed-photo.vercel.app`) is Muhammad Fauzy's master
photography archive. It is the hub that ties together three shooting lanes
that don't share one visual identity today:

| Lane | Where it lives | Genre |
| --- | --- | --- |
| **Food** | `visufavor.vercel.app` (separate brand, VisuFavor) | Food photography |
| **Sport** | `untmd-sports.vercel.app` (separate brand, UNTMD Sports) | Sport photography |
| **Everything else** | Native to UNTAMED — `/work` on this site | Events and any documentation work that isn't Food or Sport. Deliberately not locked to a fixed third category — it's the flexible lane. |

`/elsewhere` already exists as the cross-link page between the three. The
goal of this redesign is a shared visual language — Swiss grid + grotesque
type + one anchored colour system — so that landing on UNTAMED, then
clicking through to VisuFavor or UNTMD Sports, reads as **one photographer's
system with three lanes**, not three unrelated sites. UNTAMED is the
identity; Food/Sport/Events are the lanes.

This file is also the answer to "why does the site look like this" — read
§ 1 before touching any token.

---

## 1 · Design DNA analysis — where the system comes from

Two references were supplied. Per Hallmark's one-backbone rule, they don't
blend evenly — one supplies the *structure*, the other supplies the *colour*.

### Backbone: the Le Corbusier grid study (structure + type)

A Swiss-grid editorial layout: exposed grid ruler lines left visible as a
deliberate texture, a huge black grotesque headline cropped by the frame
edge, three numbered picture rows (`Picture 01 / 02 / 03`) staggered on a
diagonal cascade with small caption labels to the left and bold black
captions to the right of each image, closing in a wide black paragraph with
selective grey-toned emphasis words. Pure black-on-white, no chromatic
accent, single grotesque family used for both display and body — restraint
*is* the design.

Extracted DNA:

- **Macrostructure:** closest to **Specimen** — numbered left-margin labels,
  asymmetric image spans, hairline rules, generous whitespace, typographic
  (not boxed) CTAs.
- **Type pairing:** single-family grotesque, display and body both sans —
  not a serif/sans pair. Heavy weight for headline, regular for caption/body.
- **The grid is structural, not decorative.** The reference's visible ruler
  lines are a presentation aid showing the underlying column grid — they are
  NOT a texture to reproduce. What actually carries over is the *effect* of
  that grid discipline: three images, generous gaps, nothing else on the
  page. Rendering the ruler lines as background CSS art would be copying the
  wrong layer — it'd add visual noise the source deliberately doesn't have.
- **Density/asymmetry — the load-bearing quality of this reference.**
  Generous, left-biased, diagonal cascade between images. Only three images
  and one paragraph occupy the entire page. This is the single most
  important thing to carry forward: **few elements, huge negative space**,
  not a packed grid of many things.
- **Anti-patterns to skip:** none — the reference is clean, no bouncy
  hovers or invented chrome to avoid.

### Colour + secondary motifs: Nomvnt (streetwear e-commerce)

Supplies the **colour anchor only**, plus a short list of structural motifs
explicitly worth borrowing:

- **Paper bands:** alternates near-white sections with deep forest-green
  sections down the page — not a single background, a rhythm.
- **Accent:** a bright chartreuse/lime green on the wordmark and CTAs, small
  footprint (~3–5%), never flooded.
- **Type:** bold expanded grotesque wordmark ("Nomvnt®") for the logotype,
  neutral grotesque for body, tiny tracked-uppercase grotesque for
  micro-labels (marquee ticker, sale tags).
- **Motifs worth keeping:** a marquee ticker bar, a category filter row with
  an underlined active tab, and — the strongest one — an oversized closing
  wordmark filling the footer as a final brand statement.
- **Motifs NOT kept:** the ticker's sale-countdown content (irrelevant, this
  isn't e-commerce), the carousel-heavy product grid (UNTAMED's "product" is
  a photograph, not SKUs — F6 Product-card-grid is not being adopted).

Net: Corbusier is the skeleton and the type voice. Nomvnt is the palette and
three specific components (paper-band rhythm, tab filter, statement footer).
Theme route is **custom** (the brief names a specific brand-colour anchor —
Nomvnt's green/lime — which is exactly the signal that routes away from the
catalog per Hallmark's theme dispatch).

---

## 2 · Genre

**Editorial.** Unchanged from the current system — a photography archive
with a foundry-adjacent, restrained voice is editorial's canonical case.
Swiss/grotesque is a type-and-grid decision within editorial, not a genre
change.

## 3 · Macrostructure family

Three page-type families, each pulling from the DNA above:

- **Marketing / hub pages** (`/`, `/elsewhere`) — **Portfolio Grid, low
  density.** The work is the product; `/elsewhere` becomes a three-lane
  index (Food / Sport / Events) rather than a plain link list — but "grid"
  here means 3–4 large asymmetric tiles with huge gaps between them, not a
  packed masonry of thumbnails. One dominant image per fold, matching the
  Corbusier reference's three-images-and-nothing-else composition. Opens
  with an **H6 Photographic fold** hero (full-bleed photograph, caption
  lower-left) before the sparse grid starts — carried over from the current
  site's photography-first instinct, just re-typeset.
- **Content / gallery pages** (`/work`, `/work/[slug]`, `/about`, `/notes`)
  — **Specimen**. Gallery plates get numbered labels (`Plate 01`, `Plate 02`
  …) exactly echoing the Corbusier reference's "Picture 01/02/03" — this is
  the most direct, literal DNA transfer in the whole system. Staggered,
  asymmetric image placement, one or two plates visible per fold, not a
  uniform grid.
- **App / utility pages** (`/enter`, `/account`, `/darkroom`) — typography
  only, no macrostructure enrichment. These pages are for doing a task
  (sign in, upload a plate); Swiss restraint here means *get out of the
  way*, not decorate.

This differs from the current system's single macrostructure (Photographic
everywhere) on purpose — the diversification rule requires a different pick
from the last Hallmark run (`Photographic`, 2026-08-23), and a photography
archive with three page *kinds* genuinely benefits from three shapes.
Density stays constant across all three families though: **few elements per
fold, generous gaps between them.** That's the one rule this whole system
must not compromise on — see § 11.

## 3.5 · Superseded by the Stitch system (2026-09-03)

The palette and type in § 4–5 below were my reconstruction from the reference
images. They are **superseded** by the author's actual Stitch export
("Swiss Neo-Grotesque Studio"), which is now what `tokens.css` implements:

| Axis | Now in force |
| --- | --- |
| Display | **Syne** 600/700/800, tracking −0.03 to −0.05em, uppercase |
| Body | **Hanken Grotesk** 300–700 |
| Metadata | **JetBrains Mono** — all indices, coordinates, camera logs, wrapped in `[brackets]` |
| Canvas | `#FBFBF9` surface · `#F4F4F2` alt · `#FFFFFF` lowest |
| Slab | `#051C14` forest-deep · `#0B2D20` container |
| Signal | `#C4F23E` acid lime (`#D4F843` alt), `#4F6600` where lime needs contrast on white |
| Structure | `#E5E5E0` hairline · `rgba(13,13,13,0.25)` crosshair |
| Shape | `0px` everywhere. Pills **only** for filter chips |
| Elevation | No shadows. Depth = chromatic inversion + hairlines + typographic overlap |

**Two corrections the author asked for on top of the Stitch export:**

1. **More negative space.** Space scale opened one step (`--space-3xl` 7.5rem,
   new `--space-4xl` 11rem); sections use `4xl` block padding.
2. **The grid is drawn.** Stitch only marked four `+` glyphs at the viewport
   edges. The real thing — what every reference image shows — is a fixed
   hairline column lattice inside the 1440px measure with `+` register marks.
   Implemented as `<GridLines />` in the root layout plus a `.plot` utility
   that puts `+` marks on any container's corners. Canvas sections stay
   transparent so the lattice reads through them; only slab sections occlude
   it, and they carry lime crosshairs instead.

**Not carried over from the Stitch HTML:** all of its content. That export
invents Michelin campaigns, Hasselblad/Sony gear logs, Adidas commissions,
Tokyo/Paris/Jakarta representation desks, "128 plates", and AI-generated
photographs. Putting any of it on a live portfolio would be publishing false
claims about a real practice. The system travels; the fiction does not. Real
copy and real galleries come from Supabase as before.

## 4 · Theme — superseded, kept for provenance

Paper alternates light and dark-green, per the Nomvnt rhythm. Accent is the
lime. Ink stays near-black/near-white — **not cream** (near-white paper and
near-white on-dark ink both sit at negligible chroma on purpose).

```text
--color-paper        oklch(98.5% 0.001 90)   near-white, not ivory
--color-paper-2       oklch(96%   0.002 90)   secondary light surface
--color-paper-dark    oklch(24%   0.045 155)  deep forest green (Nomvnt band)
--color-paper-dark-2  oklch(29%   0.045 155)  secondary dark surface
--color-ink           oklch(15%   0.010 155)  near-black, faint green undertone
--color-ink-2         oklch(38%   0.010 155)  muted body text
--color-ink-on-dark    oklch(96%  0.010 90)   near-white text on green bands
--color-rule          oklch(88%   0.005 155)  hairline on light
--color-rule-on-dark  oklch(40%   0.050 155)  hairline on dark green
--color-accent        oklch(88%   0.230 120)  lime / chartreuse (Nomvnt anchor)
--color-accent-ink    oklch(20%   0.050 120)  near-black text on lime fills
--color-focus         oklch(70%   0.190 120)  deeper lime, focus rings
--color-error         oklch(52%   0.190 27)
--color-ok            oklch(48%   0.100 150)
```

Accent discipline: lime never exceeds ~5% of any viewport — CTA fills,
active tab underline, focus rings, the plate-number digits. It does not
become a background flood; that would read as the e-commerce site it was
borrowed from, not a photography archive.

## 5 · Typography

- **Display:** Archivo — Black 900 for headlines, Expanded width + 700 for
  the "UNTAMED" wordmark specifically (the one place tracking goes positive,
  echoing Nomvnt's expanded logotype). Free, real Swiss-grotesque energy,
  replaces the current Fraunces serif — this is the one deliberate override
  of the existing font stack, because "swiss + grotesque" is incompatible
  with a serif display by definition.
- **Body:** IBM Plex Sans — **unchanged from the current system.** Already a
  neutral grotesque; no reason to replace what already fits the brief.
- **Numeral / label:** JetBrains Mono — **unchanged.** Used narrowly for
  plate numbers (`01`, `02`) and dates/metadata, tabular-figure alignment.
  Text labels/eyebrows (not numerals) use tracked-uppercase Plex Sans
  instead of mono, matching both references' label treatment.
- **Display tracking:** −0.02em at display sizes (tight, grotesque
  convention) except the wordmark itself at +0.02em (expanded, logotype
  read).
- **Type scale anchor:** `--text-display: clamp(2.5rem, 4.4vw + 1rem, 5rem)`
  — reuse the existing scale unchanged; only the face changes, not the
  rhythm.

## 6 · Spacing

Unchanged — reuse the existing 4pt scale in the current `tokens.css`
(`--space-3xs` … `--space-4xl`, `--page-gutter`, `--measure`). No brief
signal calls for a new spacing system; changing it would be scope creep.

## 7 · Motion

Unchanged easings and durations (`--ease-out/in/in-out`, `--dur-micro/short/
long`). Explicit principle for this rebrand: **restraint is the design.**
Fade-only reveals, ≤220ms, no bounce/overshoot, no hover-scale on
photographs (the current AI-slop tell this brief should never reintroduce).
Link hover is a 1px lime underline sweep, not a colour change — the one
motion flourish the system allows itself.

## 8 · Microinteractions stance

- Silent success (a saved plate just... saves; no celebratory toast).
- Hover delay 800ms / focus delay 0ms on any tooltip.
- Focus ring: lime (`--color-focus`) at ≥3:1, appears instantly, never
  animated in.

## 9 · CTA voice

- **Primary:** filled lime, `--color-accent-ink` text, `--radius-none` —
  sharp rectangular edge (the existing token already defines
  `--radius-none: 0`; this rebrand leans into it instead of introducing
  rounding).
- **Secondary:** 1px ink outline, transparent fill, `--radius-none`.
- **Tertiary / inline:** typographic link — word + arrow + 1px underline,
  no box. This is the Corbusier reference's CTA voice directly.

## 10 · Per-page allowances

- **No page gets a decorative enrichment layer** — no CSS-art grid lines,
  no generated illustration, no background texture of any kind. Photography
  is the imagery; negative space is the enrichment. This applies to
  marketing pages too — § 1 already flagged that reproducing the Corbusier
  reference's visible ruler lines would be copying its presentation layer,
  not its actual DNA.
- **Content pages** (`/work`, `/about`, `/notes`) — typography + the
  photographs only. The Specimen macrostructure's numbered-plate rhythm,
  at low density, is the design.
- **App pages** (`/enter`, `/account`, `/darkroom`) MUST NOT use
  enrichment — function carries the page, unchanged principle from before.

## 11 · What pages MUST share

- **Generous negative space. Few elements per fold.** This is the system's
  central discipline, carried directly from the Corbusier reference (§ 1)
  — a fold with one large image and short copy beats a fold with four
  medium images every time. If a section feels "full," cut an element
  before adding more whitespace tokens — `--space-3xl`/`--space-4xl` are
  already generous; the fix for a cramped page is fewer things, not bigger
  gaps around the same amount of stuff.
- The "UNTAMED" wordmark (Archivo Expanded 700, +0.02em tracking).
- The lime accent and its ≤5%-of-viewport footprint discipline.
- Archivo (display) + IBM Plex Sans (body) + JetBrains Mono (numerals only).
- CTA voice: rectangular, `--radius-none`, the three-tier button/link system
  in § 9.
- Section heading rhythm: mono two-digit numeral + tracked-uppercase label +
  Archivo Black heading, stacked vertically (never the tag-left/heading-
  right two-column pattern — that reads as a templated AI tell).

## 12 · What pages MAY differ on

- Macrostructure within their family (§ 3) — e.g. `/about` could run Long
  Document instead of Specimen if the prose genuinely wants continuous
  paragraphs; it still uses the system's type, colour, and CTA voice.
- Hero archetype, within the family's allowance.
- Paper band choice per section — light or dark-green — as long as the
  alternation reads intentional, not random (Nomvnt's own rhythm: roughly
  every 2nd–3rd section flips).

## 13 · Nav and footer

- **Nav — N6 Newspaper masthead (kept from the current system, retyped).**
  Large centred "UNTAMED" wordmark, thin mono meta line above/below (date,
  or plate count), double hairline rule beneath. Same archetype as today;
  only the type voice changes from serif small-caps to grotesque.
- **Footer — Ft5 Statement (changed from the current Ft6 Letter close).**
  One large closing line in Archivo Black — e.g. *"UNTAMED. Shot on
  purpose."* — with the wordmark beneath in muted small type. This is a
  deliberate deviation from editorial's catalog default footers (Ft1/Ft2/
  Ft4/Ft6/Ft7); it's justified because it's a direct, named motif from the
  Nomvnt study (§ 1) that the brief explicitly asked to keep, and design.md
  is allowed to override catalog routing once a studied DNA is locked in.

## 14 · Exports

### tokens.css (proposed — not yet applied to the live file)

```css
:root {
  --color-paper:         oklch(98.5% 0.001 90);
  --color-paper-2:       oklch(96%   0.002 90);
  --color-paper-dark:    oklch(24%   0.045 155);
  --color-paper-dark-2:  oklch(29%   0.045 155);
  --color-ink:           oklch(15%   0.010 155);
  --color-ink-2:         oklch(38%   0.010 155);
  --color-ink-on-dark:   oklch(96%   0.010 90);
  --color-rule:          oklch(88%   0.005 155);
  --color-rule-on-dark:  oklch(40%   0.050 155);
  --color-accent:        oklch(88%   0.230 120);
  --color-accent-ink:    oklch(20%   0.050 120);
  --color-focus:         oklch(70%   0.190 120);
  --color-error:         oklch(52%   0.190 27);
  --color-ok:            oklch(48%   0.100 150);

  --font-display:  var(--font-archivo), "Archivo", ui-sans-serif, sans-serif;
  --font-body:     var(--font-plex), ui-sans-serif, system-ui, sans-serif;
  --font-mono:     var(--font-jetbrains), ui-monospace, monospace;

  --tracking-display: -0.02em;
  --tracking-wordmark: 0.02em;

  /* space / text / ease / dur / radius tokens: unchanged, see current tokens.css */
  --radius-none: 0;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper:      oklch(98.5% 0.001 90);
  --color-paper-dark: oklch(24% 0.045 155);
  --color-ink:        oklch(15% 0.010 155);
  --color-accent:     oklch(88% 0.230 120);
  --font-display:     "Archivo", sans-serif;
  --font-body:        "IBM Plex Sans", sans-serif;
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "paper":       { "$value": "oklch(98.5% 0.001 90)", "$type": "color" },
    "paper-dark":  { "$value": "oklch(24% 0.045 155)",  "$type": "color" },
    "ink":         { "$value": "oklch(15% 0.010 155)",  "$type": "color" },
    "accent":      { "$value": "oklch(88% 0.230 120)",  "$type": "color" }
  },
  "font": {
    "display": { "$value": "Archivo",      "$type": "fontFamily" },
    "body":    { "$value": "IBM Plex Sans","$type": "fontFamily" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background:          98.5% 0.001 90;
  --foreground:           15% 0.010 155;
  --primary:              88% 0.230 120;
  --primary-foreground:   20% 0.050 120;
  --muted:                88% 0.005 155;
  --border:               88% 0.005 155;
  --ring:                 70% 0.190 120;
  --radius:               0px;
}
```

---

## 15 · Next step

This file is the proposed system. It has **not** been applied yet — live
`tokens.css` and every page under `src/app/` still run the current Atelier
system. Applying it means, page by page: swap the display font import,
rewrite `tokens.css` with the palette in § 14, and redesign each route per
its macrostructure family in § 3. Say which to start with — likely `/` (the
hub) first, since it's the page most of the DNA in § 1 was extracted for.
