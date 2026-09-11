# Research — holding the speed, and why the site does not look like the reference

**Status:** research and a recommendation. Nothing here is coded.
**Raised by the owner:** *"deep research soal speed maintain sama better design,
sumpah ini ga kaya bayangan design yang gw kirim"* — the site does not look
like the design he sent.

---

## 0. The finding, in one line

**The site draws in one typeface. `design.md` specifies three.** Measured on
the current `main` at 390×844: every role on the page — the wordmark, the
headline, the mono rails, the `[bracket]` indices, body copy — computes to
`-apple-system`.

```
.mast__name                       -apple-system  w800  24px
h1 / .page__title / .story__title -apple-system  w500  40px
.u-mono                           -apple-system  w400  11px
.reel__no                         -apple-system  w400  11px
.reel__meta                       -apple-system  w400  11px
distinct families on the page: 1
```

Against `design.md` § 3.5, which is the table in force:

| Role | Specified | Rendering |
| --- | --- | --- |
| Display | **Syne** 600/700/800, tracking −0.03 to −0.05em | `-apple-system` |
| Body | **Hanken Grotesk** 300–700 | `-apple-system` |
| Metadata | **JetBrains Mono** — every index, coordinate and `[bracket]` | `-apple-system` |

Both supplied references are type-led. § 1 describes the Corbusier study as
*"single grotesque family used for both display and body — restraint **is** the
design"*, and the Nomvnt study as supplying *"a bold expanded grotesque
wordmark"* plus *"tiny tracked-uppercase grotesque for micro-labels"*. A layout
whose entire identity is the contrast between a heavy display face, a neutral
body, and a technical mono cannot read as that layout when all three are the
same face at the same width.

`tokens.css` collapsed them deliberately after a real bug was found — see § 2 —
and the commit records the owner approving the system face at that moment.
That approval and this complaint are not necessarily in conflict: what was
approved was *the system face*, and what is missing is *three distinct voices*.
§ 3 is how to have both.

---

## 1. What else the measurement found, separated by how sure it is

**Measured, unambiguous.** The masthead occupies roughly **330px of the 844px
first screen — 39%** — as a wordmark row, an account row, and a nav rail
stacked. Before any photograph.

**A judgement, and inside its budget.** The lime ticker band reads heavy as a
full-bleed strip. It is **4.0% of the first screen by area** (390 × ~34px of
390 × 844), so it is *inside* `design.md`'s `≤5%` / `~3–5%` accent budget — the
first draft of this document claimed it broke that rule and the arithmetic says
otherwise. What is arguable is the other half of § 3.6, *"green is never a
section"*, which is about shape rather than area. That one needs the owner's
eye, not a measurement.

**Still the owner's decision.** The drawn lattice at phone width, which is
`docs/PRD-index-as-gallery.md` § 6 and unanswered. At 390px an eight-column
lattice behind sparse content is closer to noise than structure, but § 3.5
records it as an explicit author-requested correction, so it stays until he
says otherwise.

---

## 2. Why the webfonts were removed, and which half of that reasoning still holds

The revert (`4d51614`) gives three reasons. They are not equal.

**Holds: the bytes were real.** Three variable families measured **99KB on the
wire** and were the largest non-image item on every page.

**Holds: a face on the device has no download.** True, and it is why the body
role should probably stay where it is.

**Does not hold: "no swap and no layout shift."** Font-swap layout shift is a
solved problem, and it was solved *by the tool that was removed*: `next/font`
has generated metric-matched fallbacks with `size-adjust`, `ascent-override`
and `descent-override` automatically **since Next 13**. The project was already
using it. The CLS argument is an argument against hand-rolled `@font-face`, not
against the loader that was there.

So the honest summary is: the revert bought 99KB and cost the type system. It
did not buy stability that was not already available.

---

## 3. Recommendation — three voices for roughly one file

Ordered by cost. The first is free and the third is optional.

### 3.1 Free: give the mono role a real monospace

`--font-mono` is currently `var(--system-sans)` — the same face as everything
else. **33 rules in `globals.css` already reference it**, and every one of them
is doing what § 3.5 assigns to mono: plate numbers, `[01]`, `[7 GALLERIES]`,
coordinates, the ticker, the rails.

Every platform ships a monospace. `ui-monospace, SFMono-Regular, Menlo,
monospace` costs **zero bytes**, needs no loader, and restores the technical
register that those 33 rules were written for. The previous session left this
in a comment as available-on-request rather than doing it, because it would
have changed a page the owner had just approved — which is the right call to
have left to him, and this is that request arriving.

This is a one-line change and it is the single highest ratio of design recovered
to bytes spent on the list.

### 3.2 Cheap: one webfont, for the display role only

The wordmark and the headlines are what carry a brand. The body does not need a
webfont — `design.md` asks body to be *"a neutral grotesque"*, and the system
stack **is** a neutral grotesque on every platform.

So load **one** family, for display only:

- **WOFF2, self-hosted, subset.** WOFF2 is roughly 30% smaller than WOFF, and
  the reduction from a full TTF is dramatic — the commonly cited example is
  Source Sans 3 at 627KB as TTF against 27.7KB as WOFF2.
- **Subset to what the display role actually sets.** The display face here draws
  uppercase Latin, digits, and a handful of marks. It never sets body copy, so
  it never needs the full character set.
- **One variable file covers the whole weight range** (§ 3.5 wants 600/700/800),
  which is one request rather than three.
- Keep `next/font`, and **put the class on `<html>`**, not `<body>` — that is
  the bug `CLAUDE.md` already records, and it is why nobody noticed for months.

Rough shape of the trade: **one subset display family instead of three full
ones**, against the 99KB that was measured. The exact figure has to be measured
after subsetting, not promised here.

### 3.3 Optional: leave the body where it is

System sans, zero bytes, already approved. Only revisit if § 3.1 and § 3.2
still do not read like the reference — and if that happens, the problem is
§ 4, not the fonts.

**Net:** three distinguishable voices, one font file, and the two free roles
stay free.

---

## 4. The limit of this document, stated plainly

**I have never seen the references.** `design.md` is a written reconstruction of
two images supplied in an earlier session — it says so itself: *"§ 4–5 below
were my reconstruction from the reference images."* Everything above is measured
against that reconstruction.

So if the site is fixed to match `design.md` exactly and it still does not look
like what he sent, then **the gap is in `design.md`**, and no amount of
measurement against it will find that. It would be a description that lost
something in the writing down — a proportion, a density, a colour temperature,
the way the type sits — and the only way to check is to look at the originals
beside the built page.

**The ask:** re-send the two reference images. With them, this becomes a
side-by-side audit — which proportions, weights, tracking and densities differ,
named and measured — instead of an argument with a paraphrase.

---

## 5. Holding the speed — the part that is not about fonts

Every performance regression found this week had the same shape: **a change
somewhere invalidated an assumption somewhere else, silently, and nothing
caught it.**

| Regression | The assumption it broke |
| --- | --- |
| `/work` tiles pulling 1500w for a 167px box | `SIZES.tile` said `100vw`; the grid became two columns |
| `.index-sticky` under the iOS clock | took `--mast-h`; the masthead publishes `0px` while retracted |
| Lanes growing 575px mid-scroll | `width`/`height` attributes lose to a CSS `width: auto` |
| Three typefaces never applying, for months | a `var()` resolves where it is declared, not where it is used |
| The guestbook leaking a name in the payload | a client component's props are published whether rendered or not |

All five are now conventions in `CLAUDE.md`, which helps the next reader but
catches nothing automatically. Four of the five were only visible to something
that **measured rendered boxes** — the build was green every time.

**Recommendation: check the harness into the repo.** The measurements in this
document and in `docs/PRD-index-as-gallery.md` were written from scratch three
times this week, each time throwing the script away. They should be
`npm run measure`, committed, so any session can produce the same numbers and
compare against the last run:

- scroll height and screen count per page, at 390×844 DPR3
- height drift across a full scroll (the lanes bug, and it would have caught it)
- rasterised image area, and the offscreen share
- the rendered box of every `sizes` slot, against the candidate the browser
  actually picks (this is what found the four wrong declarations)
- how many distinct font families the page renders in (this would have caught
  the type bug on day one)
- computed `top` of every sticky element against `env(safe-area-inset-top)`

That last-but-one line is the point. **A one-line assertion that the page draws
in three families would have caught the thing this whole document is about,
months ago, in CI.** A design system that is not asserted anywhere is a
document, not a system.

---

## 6. What to do, in order

1. **§ 3.1**, the free one. One line, and it gives the `[bracket]` rails the
   voice 33 CSS rules were written for. Needs a yes.
2. **Re-send the references** (§ 4). Everything past § 3.1 is guesswork without
   them, and this is the request the rest of the design work is blocked on.
3. **§ 3.2**, one subset display family, once § 4 confirms which face — Syne is
   what `design.md` names, but that came from the same reconstruction.
4. **§ 5**, the harness, which is what stops the next six regressions.
5. The lattice question, whenever he wants to answer it.
