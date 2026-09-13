# PRD — the archive does not say what the work was, and three sets are filed under the wrong word

**Status:** open — drafted 2026-09-13 against live production
**Scope:** what a gallery *says* — its title, subtitle, genre and year — plus
the darkroom fields that produce them and the gates that could hold them
**Companion to:** `PRD-genres-and-load.md` (the genre model),
`PRD-index-as-gallery.md` (the index that displays this), `pending-task.md`
§ 3–§ 5 (the same faults, recorded as blocked)

> **Why a fourth PRD.**
>
> The other three are about code, and their findings are closed or now
> permanently asserted by `npm run measure`. The page is laid out correctly at
> every width from 320 to 1920, it draws in the faces it declares, no box
> collides with another, the grid crops nothing into a sliver, and the images
> are the right size for their slots.
>
> None of that helps a client who cannot tell what they are looking at. Every
> remaining problem on this site is in the database, where no gate can reach
> it: the fields are filled, the CSS is right, and the content is wrong. This
> document is the first one whose subject is the writing rather than the
> rendering.

---

## 1. Why this exists

The site has one job, and the owner has stated it repeatedly: he is already
talking to a client on WhatsApp, he sends a link, the client looks at
photographs on a phone, and the conversation continues in WhatsApp. There is
no funnel, no form, no pricing. **The card is the entire pitch.**

A client sent `/work` sees seven cards. Each one gives them a title, a
one-line subtitle, a genre and a year. That is the whole basis on which they
decide whether this photographer has done anything like the thing they want.

Measured on live production, anonymously, on 2026-09-13, that basis is:

```
Summer In Bloom      Strobist, PrimeLens And Summer     Event · Blok M · 2026
DARA BERSEMI         Wellness & Yoga                    Event · Kemang · 2026
Sales HeadShot       Sales Headshot Photography         Brand · AOS · 2025
Cindy's Graduation   Graduation                         Graduation · Jakarta · 2023
Hello There...       unfiled                            Brand · unfiled · 2022
Nuna Graduation      Graduation                         Graduation · UI · 2021
Lumos Studio         Beauty Shoot                       Event · unfiled · —
```

Nothing in that block tells a client who the work was for or what it produced.

## 2. How this was measured

Against `https://beuntamed-photo.vercel.app`, anonymously, with no cookies —
the page a client following a WhatsApp link is actually served. Headless
Chromium at 1440×900 dpr2 and 390×844 dpr3, reading rendered text out of
`.album__title`, `.album__sub`, `.reel__name` and `.reel__meta`, and loading
each `/work/genre/<id>` page in turn for membership.

No claim here is read from the source or from the database. The subtitle
column is what the card renders; the genre column is which genre page the
gallery appears on.

## 3. What is actually wrong

### 3.1 Five of seven subtitles say nothing a client can use

`design.md` § 2 asks a caption for "what was shot, for whom, where, when".
Against that, verbatim from the live cards:

| Gallery | Subtitle | What it actually does |
| --- | --- | --- |
| Summer In Bloom | `Strobist, PrimeLens And Summer` | names the photographer's own kit |
| DARA BERSEMI | `Wellness & Yoga` | a category, not this job |
| Sales HeadShot | `Sales Headshot Photography` | restates the title, plus the word "photography" |
| Cindy's Graduation | `Graduation` | restates the genre, which is already on the card |
| Hello There... | `unfiled` | a placeholder reached production |
| Nuna Graduation | `Graduation` | restates the genre |
| Lumos Studio | `Beauty Shoot` | a category, not this job |

Two restate the genre that is printed beside them. One restates its own title.
One is a note about lighting equipment, which is a conversation between
photographers. One is the literal string `unfiled`.

This is the highest-value unfixed thing on the site and it costs nothing but
seven sentences.

### 3.2 The filing is wrong in the one place a client uses it

The genre filter is the only tool a client has for finding relevant work, and
it is the mechanism the whole of `PRD-genres-and-load.md` was built for.
Membership, read off the genre pages:

```
/work/genre/graduation   Cindy's Graduation, Nuna Graduation
/work/genre/brand        Sales HeadShot, Hello There...
/work/genre/event        Summer In Bloom, DARA BERSEMI, Lumos Studio
/work/genre/food         (empty — hands over to VisuFavor)
/work/genre/sport        (empty — hands over to UNTMD Sports)
```

Graduation is right. **Event is three sets and not one of them is an event.**
By their own subtitles, `DARA BERSEMI` is wellness and yoga, `Lumos Studio` is
a beauty shoot, and `Summer In Bloom` is a portrait set shot with strobes. A
client looking for portrait or beauty work filters to Brand, finds two
headshot sets, and concludes this photographer does not shoot what they want —
while three sets of exactly that sit under Event.

`pending-task.md` § 4 records this as "everything is filed under Event", which
overstates it: four of seven are filed correctly. The shape of the fault is
narrower and worse — the misfiled three are all the same kind of work, so the
gap they leave is a whole category rather than scattered noise.

### 3.3 Four casing conventions in one reel

`design.md` § 5 makes sentence case the rule, and the stylesheet no longer
forces anything, so a title renders exactly as typed:

```
Summer In Bloom      title case
DARA BERSEMI         all capitals
Sales HeadShot       title case with an internal capital
Cindy's Graduation   sentence case
Hello There...       title case, trailing ellipsis as three periods
Nuna Graduation      title case
Lumos Studio         title case
```

`DARA BERSEMI` reintroduces the shouting that the de-shouting pass removed
from the CSS, in the one layer CSS cannot reach. `Hello There...` also spells
its ellipsis as three periods where the character is `…`.

### 3.4 One gallery has no year, and the index is ordered by year

The index is deliberately ordered by the date of the work rather than the date
it was uploaded — that is a shipped feature and it is working: the home reel
reads 2026, 2026, 2025, 2023, 2022, 2021. `Lumos Studio` has no year, renders
`—`, and sorts last permanently regardless of when it was shot.

Two of seven also carry `unfiled` as their place.

### 3.5 The site sells five genres and holds three

The tagline, the ticker, `site.genres` and `/about`'s commissions line all
name five. The archive holds Graduation, Brand and Event. Food and Sport now
hand a visitor to VisuFavor and UNTMD Sports instead of dead-ending — shipped,
and it stops the bleeding — but the promise and the holdings still disagree.

That decision is the owner's and is recorded in `pending-task.md` § 3. It is
named here only because § 3.2 makes it worse: of the three genres the archive
does hold, one of them is holding work that belongs in neither.

## 4. Why no gate catches any of this today

`npm run measure` has nine static gates and a browser half, and every one of
them would pass this page. The fields are populated, every colour comes from a
token, every class is reachable, nothing overflows, drift is zero. The gates
assert the *system*; nothing asserts the *content*.

That is the right default — a gate that fails a build because a caption is
weak would be intolerable — but there is a band of this that is mechanical and
checkable, and it is currently unchecked.

## 5. Proposal

### 5.1 A content gate that reports and never blocks

Add a tenth gate, `content`, that reads the live archive and reports. It runs
in the browser half, where a page is already being loaded, and it exits
non-zero only on the two that are unambiguous defects:

| Check | Verdict | Rationale |
| --- | --- | --- |
| subtitle equals the title, case-insensitive | **fail** | mechanical, never intentional |
| subtitle equals its genre label | **fail** | the genre is already printed beside it |
| subtitle is `unfiled`, `-`, `n/a` or empty | **fail** | a placeholder in production |
| year missing | **report** | may be genuinely unknown |
| title is ALL CAPS, or has an internal capital | **report** | `design.md` § 5, but a brand name may earn it |
| `...` where `…` belongs | **report** | cheap to fix, never urgent |
| a genre page with zero galleries | **report** | already handled by the hand-off |

"Report" lines print and keep the exit code. This is the same posture as gate 8
reporting itself UNARMED: visible, not fatal.

### 5.2 The darkroom asks for the sentence it needs

The subtitle field currently accepts anything, including the title. Three
changes, in order of value:

1. **Placeholder that is the template, not a label.** `design.md` § 2's own
   words: `who it was for · what was shot · where`. A field that shows
   `Subtitle` gets `Graduation`; a field that shows the shape gets the shape.
2. **Reject the two mechanical cases on save** — subtitle equal to the title,
   or equal to the genre label — with the reason, not a generic error.
3. **Show the card as it will render**, at 390px, beside the form. The subtitle
   is written in a text input two hundred pixels wider than the card that has
   to hold it.

### 5.3 The seven sentences

A writing pass in the darkroom, one line per gallery, and the re-filing of the
three sets under § 3.2. This is the owner's work and nobody else can do it:
only he knows who each job was for.

What the code can do is make it a five-minute job rather than a project —
which is § 5.2 — and make the result visible the moment it is wrong, which is
§ 5.1.

## 6. Non-goals

- **No CTAs, no pricing, no testimonials.** Stated repeatedly by the owner and
  reaffirmed here: deals happen on WhatsApp, and this site exists to make
  sending pictures easy.
- **No rewriting his galleries.** This document measures what the cards say
  and proposes tooling. Which sets exist, what they are called and what they
  are for are content decisions, and content decisions are the owner's.
- **No blocking a publish on prose.** The gate reports; it fails only on a
  placeholder or a duplicate, both of which are mistakes rather than choices.
- **No new genre taxonomy.** `site.genres` is the list; § 3.2 is a filing
  error inside it, not an argument for a sixth genre.

## 7. Acceptance criteria

1. `npm run measure` gains a `content` section that reads the live archive and
   prints one line per gallery.
2. It exits non-zero while any subtitle equals its title, equals its genre
   label, or is a placeholder. Proved by reintroducing each of the three
   against a fixture, in the house style — every gate in this repo was proved
   by reintroducing the bug it targets.
3. No gallery's subtitle restates its title or its genre on live production.
4. No gallery renders `unfiled` as a subtitle.
5. `/work/genre/event` contains only sets that are events, and the portrait,
   wellness and beauty sets appear under a genre a client would filter to.
6. Every gallery has a year, or the index's `—` is a deliberate and documented
   state rather than a missing field.
7. The darkroom subtitle field shows the template as its placeholder and
   refuses the two mechanical duplicates with a specific reason.

## 8. Order of work

1. § 5.1, the gate — it is code, it needs no decision, and it turns every item
   below into something that reports itself rather than something somebody has
   to remember.
2. § 5.2.1 and § 5.2.2, the placeholder and the two refusals — small, and they
   stop the next gallery arriving in this state.
3. § 5.3, the seven sentences and the re-filing — the owner's, and worth more
   per minute than anything else left.
4. § 5.2.3, the card preview — the largest change, and the one that matters
   least once the first three are done.

## 9. Process note

Section 3 was written twice. The first version reported that two stored plates
were smaller than the dimensions recorded for them, on the evidence that a URL
asking `?width=1500` returned `naturalWidth` 304. That is not what
`naturalWidth` means on a `srcset` image — a candidate chosen by `w` descriptor
carries a current pixel density, and the property returns the intrinsic width
divided by it, so it echoes the slot size back whatever file is behind it.
Decoded properly, in a bare `<img>` with no `srcset`, every file was exactly
the size it was asked for.

The wrong version was committed and pushed before it was checked. It is in
`CLAUDE.md` now, next to the fixture that measured its own missing preflight
and the test double that confirmed a Vercel behaviour which does not exist.
Three instruments, three false findings, one lesson: **when a measurement
disagrees with the code, suspect the instrument first.**
