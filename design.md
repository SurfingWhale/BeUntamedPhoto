# Design — UNTAMED

The layout and composition guideline for this site. **Everything in this file
is current.** Nothing in it is superseded by anything else in it, and no rule
points at another section to find out whether it still applies. That was the
state this file had reached — eight sections deep in corrections, three of them
labelled "superseded", a `§ 15` still claiming the system had not been applied
yet — and it was unusable as a guideline. It was rewritten on 2026-09-11. The
short record of what changed and why is in § 13; the full superseded text is in
git history, which is where archaeology belongs.

**Values live in `tokens.css`, not here.** Colours, sizes, spacing and easings
are *named* below and *defined* there, so the two cannot drift apart. This file
carries no colour value at all and no size that `tokens.css` owns. The figures
it does carry are **measurements, not specifications** — rendered boxes,
viewport shares, the drift a bug caused — and they are there to be checked
against, which is what § 12 is for.

Anything that needs an account or a decision rather than a commit lives in
`pending-task.md`, so this file can stay a brief.

**One method rule, and it is the reason this file was wrong for weeks.** This
is a *description* of two reference images. Checking the built site against
this description will not find a fault that is in the description itself — and
four documents' worth of decisions were made that way while the references sat
unseen. So: check design fidelity against the reference images. If they are not
to hand, say so plainly and stop, rather than measuring the paraphrase and
reporting a pass.

---

## 1 · What this site is

UNTAMED is the master photography archive and the hub for three shooting lanes
that do not otherwise share an identity:

| Lane | Lives at | Genre |
| --- | --- | --- |
| Food | `visufavor.vercel.app` | Food |
| Sport | `untmd-sports.vercel.app` | Sport |
| Everything else | here, `/work` | Events, graduations, brand, documentation |

Landing on UNTAMED and clicking through to either satellite should read as
**one photographer's system with three lanes**, not three unrelated sites.
`/elsewhere` is the cross-link page.

---

## 2 · Content rules — binding

`CLAUDE.md` is the authority on these and is what a working session actually
reads. In short, and unconditional:

1. **The site is the creative practice and nothing else.** No other career,
   trade, industry or employer appears anywhere — copy, metadata, alt text,
   placeholders, shipped comments.
2. **No person.** The byline is `site.byline` and every sign-off reads from it.
   `site.email` is the archive's own address. No legal name, no personal
   address, no link to anything that is not photography.
3. **Nothing invented.** No fake clients, campaign counts, gear or awards. An
   unproven claim that gets checked destroys more trust than a modest true one
   builds. This applies to reference material too: the motifs travel, the
   fiction does not.
4. **Specific beats clever.** What was shot, for whom, where, when.

---

## 3 · The references, and which one is the backbone

Two images were supplied.

**Nomvnt — a streetwear shop — is the backbone.** Confirmed by the owner on
2026-09-11, reversing what this file used to say. It supplies the *page
structure*, not just a palette: a photographic hero with type set on it, a
ticker, large sentence-case statements, label-then-heading sections,
asymmetric card clusters, a photo-backed filter, and a statement footer.

**The Corbusier grid study is the restraint applied to it.** What carries over
is the discipline, not the drawing: few elements per fold, generous gaps,
numbered plate labels, hairlines rather than boxes, typographic CTAs. Its
visible ruler lines are a presentation aid and **are not reproduced** — neither
reference has a drawn lattice anywhere.

The owner's own read of the reference, kept verbatim because it is sharper than
anything this file managed from the same images:

> *"dia make spacing yang enak terus typography yang kecil banget dengan border
> yang sesuai ada hero dengan font putih terus ada permainan color juga di
> salah satu katanya, itu yang gadipunya ai"*

Comfortable spacing · very small type · borders that fit · a hero with light
type on a photograph · colour played on one word. Those five are the brief.

---

## 4 · Layout and composition

### The density rule, which outranks everything else here

**Few elements per fold, generous space between them.** If a section feels
full, cut an element — do not add a bigger gap around the same amount of stuff.
This is the one rule that must not be traded away for any other in this file.

### The measure

- Photographs run **full-bleed**. Everything else is held to `--page-max`.
- Side gutters are `--page-gutter` at every width.
- Reading copy is held to `--measure`.
- Section block padding comes from the `--space-2xl … --space-4xl` steps. At
  1440 that measures ~120px and at 390 ~52px, and that rhythm is already
  right — it is what makes small type read as composed rather than sparse.

### Section rhythm — the same three parts every time

1. A **quiet label**: one small glyph, then two or three words, grey, sentence
   case, top-left. Nothing else on the line.
2. The **heading** beneath it: sentence case, bold, tightly tracked,
   left-aligned.
3. The **content**.

Stacked, in that order. Never a label on the left with something bracketed at
the far right of the same row — that shape reads as templated, and it is what
was there before.

### A choice set scrolls sideways; content scrolls down

The load-bearing layout decision on this site.

- **A set you pick *between*** — the galleries, the three lanes — is a
  **reel**: one horizontally snap-scrolled row, card ~78% of the scroller so
  the next one peeks. Compositor-driven, no JavaScript needed for the
  scrolling, and it degrades to a plain scroller. Position dots come from
  `::scroll-marker` behind `@supports`, additive only.
- **What you came to look *at*** — the plates inside one gallery — is
  **vertical**. Horizontal breaks the reading direction.
- `/work` is the exception that proves the rule: it is the survey page, so it
  is a vertical grid, two columns from the smallest width.

### Cards

- Two columns on a phone, asymmetric spans on the twelve-column field above
  60rem. A tile keeps its cover's own proportions — **nothing is cropped to
  make a row tidy**, and a row's height is its tallest member.
- **Every card sits in a box**, and this is most of why the reference's very
  small type reads as composed rather than stranded. A hairline border, a
  `--color-paper-white` ground, no radius and no shadow. The photograph
  reaches three edges and only the text is padded — padding the photograph too
  would mount it twice and cost real width on a phone column. In dark the two
  grounds are the same value, so the hairline carries it alone.

### Page skeletons

- **`/` (hub)** — opening zone · ticker · full-bleed plate · statement ·
  label + gallery reel · label + lanes reel · closing plate. The gallery reel
  carries a sticky head above it — a count and the genre chips — which is the
  only sticky thing on the page besides the masthead, and therefore the only
  other place § 10's safe-area rule bites.
  The hero is a full-bleed photograph with the statement set on it in white,
  the lime landing on one word, and a plate credit beside the tagline at its
  foot. It stops at ~74% of the first screen so the ticker below it is already
  visible — the invitation to scroll is a band of real content, not a chevron.
  The typographic zone that used to be the front door is now an interstitial
  below the ticker.
- **`/work`, `/work/[slug]`, `/about`, `/notes`** — typography and the
  photographs, nothing else. Plates carry numbered labels.
- **`/enter`, `/account`, `/darkroom`** — function only. No enrichment of any
  kind; get out of the way.

### The marks

The Corbusier restraint layer. `←` alone in an empty region · `↗` bold, level
with a headline's second line · `⌐` at a text block's top-right, outside its
measure · `∟` at its foot · a stepped swatch row, never a neat grid · one
filled tag per screen · `.ghost` numerals, set huge and cropped by the edge at
4% ink, sitting behind a column on `z-index: -1`.

Marks sit **in margins and empty cells**, never inside a text block. They mark
positions; they do not decorate content.

`↗` is the one to watch: it has an emoji presentation, so a phone can draw it
as a blue tile. Any `↗` that reaches shipped copy needs `U+FE0E` after it to
force the text glyph. `←` and `→` have no emoji form and need nothing — there
are ten of them in the pages now and they are fine. The only `↗` in the tree
is inside a CSS comment.

### There is no drawn lattice, and there was never a case for one

`<GridLines />` is gone. Three reasons, and the middle one is the one that
settles it:

1. **Neither reference has a drawn lattice.** The Corbusier study's ruler
   lines are explicitly a presentation aid showing the column grid — copying
   them would be copying the wrong layer.
2. **It was invisible.** Measured on bare paper, one horizontal scan at 390:
   383 of 390 pixels were paper, and the column hairlines came in at
   **1.08–1.16:1** against it. That is not subtle texture, it is nothing. The
   layer's own comment called itself "the blueprint stays visible".
3. By the time the hero and the card grounds existed, roughly **half its area
   was behind opaque content** anyway.

**The modular unit survives; only the drawing is gone.** `--row` is a cell
that stays square at every width, 22 rules read from it, and the hero's frame
height and every `.reel__frame` are measured in it. That is where the
structure lives — in the proportions, not in visible ruler lines. Same for the
marks above: they are the restraint idea, and they are legible.

---

## 5 · Typography

Two voices, not three. **Syne 800** carries the display role — the wordmark
and every heading — self-hosted as a 10,736-byte subset of the TTF already
vendored for the share card. Everything else is the system stack, which *is* a
neutral grotesque on every platform and costs nothing. **There is no monospace
in the reference** — prices, counters and meta are all the neutral sans — so
`--font-mono` points at that same stack deliberately, and the 33 label rules
that read from it stay in the register the reference uses.

Three families were once named and **none of them ever applied**, because a
`var()` resolves where its declaration lives and the loader's class was on
`<body>` while the tokens were built on `:root`. The class belongs on `<html>`.
`npm run measure` asserts the *result* rather than the intent: if the page ever
draws in one family again, it fails.

| Role | Rule |
| --- | --- |
| Logotype | its own face, wide and geometric, tracking positive |
| Headings | **sentence case**, bold, **tracked in** (negative), left-aligned |
| Body | regular; near-black primary, grey secondary |
| Labels / meta | small, grey, sentence case |
| Capitals | the wordmark, the ticker, tiny labels and control text. **Never a heading and never a card title** — that is the line § 12 gates |

**Small type against generous space.** Measured at 1440 as a share of viewport
width, the display sizes were nearly double the reference's before they were
corrected; the labels were already right. The scale lives in `tokens.css`.

**A `ch` cap belongs on the element whose own font it constrains.** Syne is
**52.8% wider than the system sans at the same point size**, measured, so the
moment it landed every `ch` cap had to be re-read. The ones on the display
elements themselves — `.hero__line`, `.page__title`, `.foot__statement` — are
correct and self-correct for any face. The one on `.head` was not: that box
holds a display heading *and* a body-face sub, so its `ch` resolved in the body
face and then constrained a heading in a different one, putting a 24-character
section heading on three lines while the box stayed 324px. A cap that exists
for layout reasons is now in layout units (`--module`), which cannot drift when
a face changes.
`--text-base` and `--text-md` are deliberately held *above* where the reference
would put them rather than following it all the way down — that is reading copy
on a phone, and this is an archive read on phones. Everything larger came down.

**Tracking follows the case, not the size.** Capitals have no ascenders or
descenders to interlock, so their sidebearings are already as tight as the
letters read — `--tracking-caps` tracks them *out*. Lowercase display type
wants the negative steps. Only the two wordmarks are capitals, so only they
take the positive step; every heading takes a negative one. Getting this
backwards is invisible in a diff and obvious on the page.

**Two signatures worth keeping:**

- A two-line heading **steps its second line in.** A negative `text-indent`
  against matching padding does it with no markup and no guessed break point,
  and it is invisible on a heading that fits one line.
- **Colour played on one word.** One word of a heading takes a lime ground —
  `Work, `*`indexed`*`.` — and the wordmark carries a lime letter. One word,
  once per page.

Character-level conventions, which are the reference's voice and not typos:
`heals .` (a space before terminal punctuation in display type) · `camera :
Samsung A10s` · `.COLOUR PICTURE` · exaggerated word gaps so words land on
separate columns · numerals used as graphic objects, set large and bare.

---

## 6 · Colour

Values in `tokens.css`. How they are used:

- **White carries the page** — roughly two thirds of it.
- **Lime is a surface, not a ration.** In the reference it is the logotype over
  the hero, the whole ticker band, a block behind a photograph twice, the
  active filter, article tags, and a giant cropped wordmark in the footer. It
  is used *more* boldly there than here. The discipline is shape, not area: a
  **deliberate block**, never a wash or a gradient, always carrying black or
  deep-green type on it.
- **Deep green carries the primary button and the single filled tag per
  screen.** That is all it currently carries. `.band--dark` is the slab
  primitive and **no page uses it** — its callers went when the lanes became a
  reel. It is kept because a green slab is a documented option below, not
  because anything is on one. *The footer is canvas with a hairline above it,
  not a slab — what dominates it is a monumental wordmark at 6% ink.*

  I wrote the opposite of this two commits ago, from reading the stylesheet
  instead of checking for callers. `npm run measure` gate 7 exists because of
  it.
- Depth is chromatic inversion, hairlines and typographic overlap. **No
  shadows.** `--radius-none` everywhere; the filter chip is the single pill.

---

## 7 · Photographs

- Full-bleed, and they are the imagery — negative space is the enrichment.
- **Type over a photograph is in.** The reference's two strongest moments are
  its hero logotype and its photo-backed filter row. What stays out is
  *generated* texture: CSS art, illustration, decorative gradients, pattern.
  A **scrim** is not on that list — it is a legibility device, because the
  photograph is owner content whose tonality is unknown at build time and
  white type over an unknown photograph is a contrast failure waiting for the
  wrong upload. Its alphas are `--color-scrim-*` and they are *measured*
  against a pure-white frame, the only case worth designing for.
- **Contrast over a photograph is measured on composited pixels**, never
  reasoned about. Sample what is actually behind the glyphs. And hierarchy
  there comes from size, weight and tracking — not from a lightness step,
  which cannot be guaranteed against something someone else uploaded.
- **Never cropped to fit a layout.** Boxes take the photograph's own
  proportions, or the photograph is contained and letterboxed. The hero is the
  single exception, and only because there the photograph is a *ground for
  type* rather than a plate to be read — and every one of those frames is also
  shown uncropped inside its gallery.
- **Every image box is reserved before the bytes land.** `width`/`height`
  attributes are only presentational hints and lose to any author `width` or
  `height` declaration — see `CLAUDE.md`, where this cost a 575px jump.

---

## 8 · Motion and microinteractions

**In force.**

- **No bounce, no overshoot, and no hover-scale on a photograph.** The last one
  is the AI tell this brief must never reintroduce.
- Link hover moves the text to `--color-accent-deep` and the underline to full
  `--color-accent`. Deep, not raw lime, because raw lime as text on canvas
  fails contrast — the underline carries the full strength instead. Under
  `(hover: hover) and (pointer: fine)` only.
- Focus ring is lime, 2px, offset, and **instant** — never animated in. It
  darkens to `--color-focus`'s light-theme value so it clears contrast on
  canvas.
- Silent success — a saved plate just saves. No celebratory toast.
- **Every animation has a `prefers-reduced-motion` branch.** There are eight,
  and the three running animations — the loading shimmer, the button spinner,
  the ticker — each stop dead rather than slow down.

**Not built, and this file should not pretend otherwise.** There are no
fade-in-on-scroll reveals, no scroll-driven `animation-timeline: view()`, and
no tooltips anywhere. If reveals are added, `view()` is the way to do them
because it costs no frame time — but nothing is waiting on them, and a page
this quiet may not want them at all.

---

## 9 · Controls

- **Primary** — a dark ground carrying lime text, square, and it **inverts on
  hover**: the ground goes lime and the text goes to `--color-accent-ink`. The
  chromatic inversion is the depth cue, which is why there are no shadows.
- **Secondary** — a `--rule-hair` outline, transparent fill, square.
- **Tertiary** — a typographic link: word, arrow, `--rule-hair` underline, no
  box.
- **Filter chips** — the one pill in the system, and the only `--radius-pill`
  in it. Sentence case, active one filled lime.
- Every control clears a 44px touch target, and small ones buy it with an
  `inset` pseudo-element rather than by growing.

---

## 10 · What every page shares

- The density rule in § 4.
- The wordmark, and the lime letter in it.
- Two type voices, sentence-case headings, capitals only in the ticker and
  tiny labels.
- The three-tier control voice in § 9.
- The section rhythm in § 4 — label, then heading, stacked.
- Square corners, hairlines, no shadows.
- **Safe-area insets.** Installed, the app is standalone with
  `viewport-fit: cover`. Anything pinned to an edge needs its
  `env(safe-area-inset-*)`; a sticky element takes
  `max(var(--mast-h, 0px), env(safe-area-inset-top, 0px))`. This has shipped
  broken twice.

## 11 · What a page may differ on

- Its skeleton, within its family in § 4.
- Which surface a section sits on — canvas or a green slab (`.band--dark`) —
  as long as the alternation reads intentional rather than random. Every
  section is currently on canvas.
- The hero treatment, within § 7.

---

## 12 · Checks

**`npm run measure`.** Rules that are not asserted anywhere are a document,
not a system — and this file *was* a document for months while the site
drifted from it. The checks below are that script, not a description of one.

It has two halves. The **static gates** read the files and always run; the
**browser checks** need the site running and skip, loudly, if it is not. Both
exit non-zero on failure, so this is what CI runs.

```bash
npm run measure                   # gates, then the browser against :3000
npm run measure -- --static       # gates only, no browser, no server
npm run measure -- --base <url>   # measure a deploy instead
```

Every gate **prints nothing when the site is correct**, and every one of them
exists because the thing it checks already shipped broken once. Each was
proved by reintroducing that exact bug and watching it fail:

| Gate | What shipped broken |
| --- | --- |
| No heading or card title in capitals | `.foot__statement` outlived the de-shouting pass |
| `--tracking-caps` only on the wordmarks | six sentence-case headings tracked *out* for weeks |
| No literal colour in anything that paints | — |
| Comment markers balance | a comment closed one line early silently truncated `tokens.css` |
| `--color-accent-ink` only ever sits on lime | `.rail__mark` was drawn in the dark theme's own background colour |
| No orphaned tokens | four went dead the day the lattice did |
| No dead class | `.plot` kept two tokens looking alive with no markup since the lanes became a reel |
| No kept-off term in the tree | a full legal name sat in `.hallmark/log.json`, and a personal name in the very PRD about not publishing one |
| The byline is the brand | `CLAUDE.md` is the authority; this one prints and is read |

The two allowlists are the point rather than a weakness: a token used outside
its role, or one that has gone dead, has to be named in the script with a
reason. That makes it a decision instead of an accident.

The kept-off-term gate is the one that reads a file **outside** the repository
— `.privacy-terms`, one term per line, git-ignored — because the terms cannot
be committed without publishing them, which is the whole point of the rule.
It prints `file:line` and never the term, since a CI log is public as well.
With no such file it reports itself UNARMED, not clean.

The browser half measures, at 390×844 dpr3 and 1440×900, on every public page:

- **height drift across a full scroll — must be 0.** The lanes grew a section
  575px under the reader because `width`/`height` attributes lose to an author
  `width: auto`;
- how many distinct font families the page actually draws in — three were
  specified and never applied for months, and nothing but this notices;
- the rendered box of every `sizes` slot against the candidate the browser
  picked — four declarations were wrong, one pulling 1500w into a 167px box;
- the computed `top` of every sticky element against `env(safe-area-inset-top)`
  — shipped broken twice;
- scroll height and screen count per page, and display type as a share of
  viewport width.

**What a gate cannot see.** `.rail__mark` passed every colour check while
being invisible, because the value came from a token — just the wrong one. It
took a dark-mode screenshot. So: look at both themes, and measure contrast on
*composited pixels* rather than on the token you think is underneath.

---

## 13 · What changed, and when

Short, so it stays out of the way. Full text in git history.

| Date | Change |
| --- | --- |
| 2026-08 | First version: Corbusier as backbone, Nomvnt as palette only. Archivo + IBM Plex named as the type. |
| 2026-09-03 | Stitch export supersedes the reconstructed palette and type. Syne / Hanken Grotesk / JetBrains Mono named. Full-bleed green slabs removed. Drawn lattice added at the owner's request. |
| 2026-09-10 | Webfonts found never to have applied — a `var()` resolving on `<body>` while the families were built on `:root`. The owner chose the system stack once he saw them. |
| 2026-09-11 | Reference images seen directly for the first time. Nomvnt confirmed as the backbone. Five divergences corrected: headings to sentence case, labels quieted, lime freed from a 5% ration, type over photographs allowed, lattice left standing but unsupported by either reference. Display type scale brought down ~1.85× to match. |
| 2026-09-11 | This file rewritten as one current document. Its checks rewritten as gates; the first two found `.foot__statement` still uppercase and `h1–h3` still on an all-caps leading floor. |
| 2026-09-11 | Cards put in boxes. Six sentence-case headings recovered the negative tracking a stale caps block was overriding. |
| 2026-09-11 | The hero built: full-bleed photograph, statement in white, lime on one word. Scrim alphas measured against a white frame. |
| 2026-09-11 | Drawn lattice removed — measured at 1.08–1.16:1 against the paper, and in neither reference. Four tokens went dead with it. |
| 2026-09-11 | The checks became `npm run measure`: seven static gates and a browser half, each gate proved by reintroducing the bug it targets. |
| 2026-09-11 | Syne 800 given to the display role — one 10.7KB subset, self-hosted, class on `<html>`. Verified by reading `getComputedStyle` and `document.fonts` back, and by reproducing the `<body>` bug to prove the test was sensitive. `.head`'s `ch` cap moved to modules. |
| 2026-09-11 | Dead code cut: `.plot` and its two crosshair tokens, the pre-reel lane rules, `.fold-photo--tall` and `PhotoFold`'s unreachable `size` prop. A § 6 claim about `.band--dark` corrected — it has no callers. Gate 7 added so the next one is caught, not written into the document. |
