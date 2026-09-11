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

### The drawn lattice — the one open question

`<GridLines />` draws a hairline column lattice site-wide. **Neither reference
has one**, and the Corbusier study's ruler lines are explicitly a presentation
aid. It survives only because the owner asked for it against an earlier,
wrong description of the references. It has not been removed on that basis
alone. **Ask before touching it.**

---

## 5 · Typography

Two voices, not three: a distinct display face for the logotype, and one
neutral grotesque for everything else. **There is no monospace in the
reference** — prices, counters and meta are all the neutral sans — so the
metadata role does not get one. The site currently runs the system stack for
all of it, which is the owner's call and costs nothing; the display role is the
one that would justify a webfont.

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
- **Deep green carries whole surfaces**, through one class: `.band--dark` is
  the only place a section paints over the page, and it brings its own lime
  register marks. The primary button and the single filled tag per screen use
  the same ground. *The footer is canvas with a hairline above it, not a slab —
  what dominates it is a monumental wordmark at 6% ink.*
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
- Which surface a section sits on — canvas or a green slab — as long as the
  alternation reads intentional rather than random.
- The hero treatment, within § 7.

---

## 12 · Checks

Rules that are not asserted anywhere are a document, not a system. These are
the ones that have each already cost a visible regression:

Each one is a **gate: it prints nothing when the site is correct.** That is the
whole point, and the first draft of this section failed it — its uppercase
check returned 27 defensible hits and its literal-value check 119, so neither
could say pass or fail. A check you have to read by eye is a reminder, not a
check.

```bash
# No heading or card title in capitals. Rule blocks are joined first, because
# these declarations are spread over several lines.
# Found .foot__statement, which had outlived the de-shouting pass.
tr '\n' ' ' < src/app/globals.css | tr '}' '\n' \
  | grep -E "(h[1-3]|__title|__statement|reel__name|elsewhere__name|\.chip)[^{]*\{[^{]*uppercase"

# No literal colour in anything that paints. Narrowed to the painting
# properties, because px literals are legitimate — hairlines, hit targets,
# mask stops — and a check that flags them flags 119 lines and gates nothing.
tr '\n' ' ' < src/app/globals.css | tr ';' '\n' \
  | grep -E "(^|[ {])(color|background|background-color|border(-[a-z]+)?-color|fill|stroke|outline-color)[[:space:]]*:" \
  | grep -vE "var\(--|currentColor|transparent|inherit|none"

# Every sign-off reads from the byline. This one prints, and is read: the
# byline must be what src/lib/site.ts defines and what src/ signs off with.
grep -rn "site\.byline" src/ && grep -n "byline:" src/lib/site.ts

# Comment markers balance in both stylesheets. Cheap, and it earns its place:
# a comment closed one line early inside tokens.css turned the whole rest of
# :root into stray text — every colour, size and easing after that point
# silently gone. CSS does not error, the build was green, lint was green, and
# the only tell was a contrast measurement coming back as if the scrim were
# not there. Any count mismatch here means a stylesheet is truncated.
for f in tokens.css src/app/globals.css; do
  printf '%s %s %s\n' "$f" "$(grep -o '/\*' "$f" | wc -l)" "$(grep -o '\*/' "$f" | wc -l)"
done | awk '$2 != $3 { print "UNBALANCED: " $0 }'
```

In a browser, at 390×844 and 1440, because four of the five regressions this
month were invisible to anything that did not measure rendered boxes:

- how many distinct font families the page draws in;
- display type as a share of viewport width, against § 5;
- scroll height per page, and **height drift across a full scroll — must be 0**;
- the rendered box of every `sizes` slot against the candidate the browser
  actually picks;
- the computed `top` of every sticky element against `env(safe-area-inset-top)`.

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
