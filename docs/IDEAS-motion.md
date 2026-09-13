# Ideas — motion for a portfolio that is mostly photographs

**Status:** § 3.1, § 3.2, § 3.3, § 3.6 and § 3.7 shipped 2026-09-13; § 3.4 and
§ 3.5 open. § 4's three gates are in `npm run measure`, each proved by
reintroducing the bug it catches.
**Scope:** what moves on this site, what it means, and what it costs
**Reads with:** `design.md` § 3 (motion tokens), `src/components/motion.tsx`,
`PRD-index-as-gallery.md` (the reel this proposes to animate)

> The site does not lack motion. It has one gesture and uses it for
> everything, which is why it reads as flat. This document measures that
> first, then proposes a vocabulary, in order of what a client on a phone
> would actually notice.

---

## 1. What is there now, measured

Read out of the computed styles of six routes at 390×844, plus the token
usage in the stylesheet:

| | count |
| --- | --- |
| `var(--ease-out)` in `globals.css` | **26** |
| `var(--ease-in)` | **0** |
| `var(--ease-in-out)` | **0** |
| distinct easing curves actually applied, across 213 animated declarations | **1** |
| distinct durations | **3** — 120ms, 220ms, 420ms |
| `@keyframes` in the whole stylesheet | 3 — a shimmer, a spinner, a marquee |
| entrance gestures | **1** — fade + `translateY(14px)` |

**After § 3 shipped**, measured the same way: two curves in use, three
entrances (`text`, `plate`, `lateral`), a scroll-linked `settle` on the folds,
and every public route carrying entrance motion —

```
/  4 -> 11     /about  0 -> 3     /elsewhere  0 -> 1     /notes  0 -> 2
```

And where it lands:

```
/                .reveal elements:  4
/work            .reveal elements:  7
/work/in-bloom   .reveal elements:  7
/about           .reveal elements:  0
/elsewhere       .reveal elements:  0
/notes           .reveal elements:  0
```

Three of six public routes have **no entrance motion at all**. The three that
do use the same 420ms fade-and-rise with a 70ms stagger for every element —
so on `/work` a photograph arrives exactly the way a paragraph does.

Two easing tokens are defined in `tokens.css` and referenced nowhere. The
system already has the vocabulary written down; nothing speaks it.

## 2. The constraint this has to live inside

Not negotiable, and every idea below is shaped by it:

- **Motion was already removed once.** Two client chunks, ~350KB raw, for a
  fade and a progress bar — see the note in `motion.tsx`. Nothing here
  reintroduces a library. Everything below is CSS, or JS measured in hundreds
  of bytes.
- **The tree is prerendered.** Anything reaching the root layout must not read
  cookies; a `"use client"` island is fine, a server call is not.
- **The audience is a phone on mobile data**, sent a link mid-conversation on
  WhatsApp. Motion that delays the first photograph is a regression, not a
  feature.
- **`prefers-reduced-motion` already works** and must keep working — as a
  different design, not as "off".
- **The photographs are the content.** `design.md` § 10: no background
  texture, no ornament competing with the work. Motion that draws attention to
  itself is the same mistake in a different dimension.

## 3. Ideas, in the order a visitor would notice them

### 3.1 Give the system three curves instead of one, with roles

The tokens exist. Assign them meaning and the monotony halves without a single
new animation:

| curve | role | why |
| --- | --- | --- |
| `--ease-out` | anything **arriving** | fast out of the gate, settles — already the default, keep it |
| `--ease-in` | anything **leaving** | the mirror; an exit that decelerates reads as hesitant |
| `--ease-in-out` | anything **moving in place** | the masthead retract, a sticky bar, a reel snapping — these travel rather than appear |

Cost: a few dozen characters. This is the cheapest item in the document and it
is first because "everything uses one curve" *is* the complaint.

### 3.2 A photograph should not enter like a paragraph

One gesture for every element is the deeper cause. A frame and a sentence are
different objects and should arrive differently:

- **Text** keeps the current fade + 14px rise. It is correct for text.
- **A plate** reveals by **scale**, not translation: `scale(1.04) → 1` with
  opacity, over the existing 420ms. A photograph that slides looks like a card
  in a feed; a photograph that settles out of a slight over-scale looks like
  it is being placed.
- **A card in the index reel** enters along the axis it scrolls —
  `translateX`, not `translateY`. The reel moves sideways; its contents
  arriving vertically fights the gesture the user is about to make.

Cost: three CSS rules and one extra data attribute on `Reveal`. No new JS.

### 3.3 Scroll-linked instead of scroll-triggered

`Reveal` fires once when an element crosses the viewport. That is a switch,
not a relationship — the element knows only "seen / not seen".

Native scroll-driven animations give a plate a *range*:

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .fold-photo__img {
      animation: settle linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 30%;
    }
  }
  @keyframes settle { from { scale: 1.06 } to { scale: 1 } }
}
```

Zero JavaScript, runs off the main thread, and it degrades to nothing at all
where unsupported — which is the right failure. This is the single idea most
likely to make the site feel like a photographer's site rather than a
template, because it ties the motion to the reader's own pace instead of to a
timer.

Guard it behind `@supports` and reduced-motion, both shown above.

### 3.4 Carry the cover across the navigation

A client taps a gallery on `/work` and the page replaces itself. The cover
they tapped is the same photograph that opens the gallery — and it flashes
away and comes back.

The View Transitions API makes that one continuous move, and Next's App Router
supports it. Give the cover and the opening plate a shared
`view-transition-name` derived from the slug:

```tsx
style={{ viewTransitionName: `cover-${album.slug}` }}
```

This is the motion a portfolio site is *for*: it tells the visitor the thing
they chose is the thing they got. Everything else in this document is polish
next to it.

Caveats worth measuring before committing: it needs the navigation to not
reflow the image into a very different aspect (the tile crops with `cover`,
the plate does not), and it must be skipped under reduced motion.

### 3.5 Motion that gives space back

`MastheadRetract` is already the best motion on the site and its comment says
why: 130px of a 664px phone screen returned to the photographs when you scroll
down, navigation back when you flick up. It *returns something*.

Two more in that spirit:

- **The index bar earns its height.** It already goes magnetic; it could also
  shed its genre chips on the way down and bring them back on the way up, the
  same trade the masthead makes.
- **The ticker pauses when a photograph is on screen.** A marquee competing
  with a plate is the ornament problem in motion form. It already pauses on
  hover and focus for WCAG 2.2.2; an IntersectionObserver on `.plinth` is a
  few lines more.

### 3.6 Input feedback is one colour swap

Every interactive element transitions `color` / `background-color` /
`border-color` at 120ms and nothing else. Nothing acknowledges a press.

- `scale(0.96)` on `:active` for buttons and chips — the value `better-ui`
  specifies, and never below 0.95.
- The genre chips are a filter: when the set changes, the grid should
  **re-stagger** rather than swap in place. The stagger already exists; it is
  simply not re-run on filter.
- A focus ring that transitions in is worth more than it sounds on a phone
  with a keyboard attached, and costs one line.

### 3.7 The three routes with no entrance at all

`/about`, `/elsewhere` and `/notes` have zero `.reveal` elements. Whatever is
decided above, they should share it — a site where half the routes animate and
half do not reads as unfinished rather than restrained.

`/about` in particular is the page a client reads when deciding, and it is the
longest text on the site at 4.07 screens.

## 4. What would make this measurable

`npm run measure` asserts layout and type and nothing about motion. Three
gates would keep this honest, in the house style — each one provable by
reintroducing the bug:

1. **More than one easing curve is in use**, and every curve in use is a
   token. Catches the exact state this document opens with.
2. **No public route has zero entrance elements** — catches § 3.7 silently
   coming back.
3. **Under `prefers-reduced-motion: reduce`, no animation exceeds 150ms and no
   element translates more than 0px.** The stylesheet already does this; only
   nothing checks it, and it is the kind of rule that rots the moment someone
   adds a keyframe.

## 5. Order, if any of this is wanted

> Shipped: 1, 2, 3, 4 and 5 below, plus § 4's gates. **6 is the one left**, and
> it is left on purpose — a shared-element navigation needs the Next router to
> drive `startViewTransition`, and the cover crops with `object-fit: cover`
> while the opening plate does not, so the shared element changes aspect
> mid-flight. That wants measuring before it is written, not after.

1. § 3.1 — three curves with roles. Minutes, and it addresses the complaint
   directly.
2. § 3.2 — plates scale, text rises, reel cards come in sideways. An hour.
3. § 3.6 — press feedback and re-stagger on filter. Small, and it is the part
   a thumb notices.
4. § 3.7 — the three silent routes.
5. § 3.3 — scroll-linked plates, behind `@supports`. Measure paint cost on a
   mid phone first.
6. § 3.4 — the shared-element navigation. Biggest win, most care needed.
7. § 4 — the gates, once the vocabulary is settled and worth defending.

## 6. Non-goals

- **No motion library.** 350KB was already removed for exactly this feature
  set; nothing here needs one.
- **No parallax on text, no reveal-on-scroll for every paragraph.** That is
  the template look this is trying to get away from.
- **No autoplay video, no cursor-following anything.** Cursor effects do not
  exist on the device most visitors use.
- **Nothing that delays the first photograph.** Any idea here that costs LCP
  on a throttled 4G phone is wrong however good it looks.
- **No change to what the site says or sells.** This is motion only.
