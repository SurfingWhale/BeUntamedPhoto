# PRD — nine routes, and what each one is for

**Status:** open — measured 2026-09-19 against the production build at HEAD
`3064f48`, phone viewport 390×844
**Scope:** the public routes and how they divide the work between them. Not
their visual design, and not what any gallery contains.
**Reads with:** `RESEARCH-the-first-screen.md` (the scroll budget one page has
to live inside), `PRD-index-as-gallery.md` (why the home index is a grid),
`PRD-the-reference-layout.md` (the sections that grid sits between)

> **The question this answers.** The site has grown a page at a time, each one
> justified on its own, and nothing has ever asked whether they can all stand
> at once. They can — but two of them are currently doing the same job with the
> same photographs, and the deepest page in the site has no way out except
> back. Both are measured below rather than asserted.

---

## 1. How this was measured

Every public route loaded in Chromium at 390×844, scrolled to the end so no
lazy image was missed, then read for: rendered section heights, word count,
the set of photographs by **storage path** rather than by URL — the same plate
is served at six widths and counting URLs would have counted it six times —
and every internal link the page offers.

The script is `ia.js` in this session's scratchpad; it is a measurement, not a
gate, and nothing in this document is read from the source.

## 2. What each route holds today

| route | screens | words | photographs | links out | h1 |
| --- | --- | --- | --- | --- | --- |
| `/` | 8.37 | 538 | 37 | 18 | Frames, not feeds. |
| `/work` | 3.89 | 105 | **49** | 18 | Work, indexed. |
| `/work/genre/graduation` | 1.66 | 67 | 12 | 8 | Graduation. |
| `/work/genre/brand` | 1.68 | 71 | 7 | 8 | Brand. |
| `/work/genre/event` | 2.83 | 100 | 30 | 11 | Event. |
| `/work/jkt-grads` | 6.61 | — | 24 | 6 | (the gallery) |
| `/work/rona-mekar` | 2.95 | 82 | 7 | 6 | Rona Mekar |
| `/about` | 3.81 | 278 | 2 | 6 | BeUntamed, working. |
| `/elsewhere` | 1.58 | 132 | 1 | 6 | Three sites, one practice. |
| `/notes` | 1.18 | 95 | 0 | 6 | Leave a note. |

And `/`, section by section, which is where its 8.37 screens go:

| section | starts at | height | photographs |
| --- | --- | --- | --- |
| hero | 0.13 | 0.74 | 5 |
| genre deck | 0.90 | 0.96 | 9 |
| statement | 1.86 | 0.51 | 0 |
| **the index** | **2.37** | **2.33** | **34** |
| opening zone | 4.70 | 0.80 | 2 |
| story | 5.50 | 0.68 | 0 |
| lanes | 6.45 | 0.63 | 3 |
| closing plate | 7.08 | 0.73 | 1 |

## 3. The overlap, measured

How much of each row's photography also appears on the column's page:

| | `/` | `/work` | `genre/event` | `/work/rona-mekar` | `/about` |
| --- | --- | --- | --- | --- | --- |
| `/` | 37/37 | **33/37** | 20/37 | 4/37 | 2/37 |
| `/work` | 33/49 | 49/49 | 30/49 | 6/49 | 2/49 |
| `genre/event` | 20/30 | **30/30** | 30/30 | 6/30 | 1/30 |
| `/work/rona-mekar` | 4/7 | 6/7 | 6/7 | 7/7 | 0/7 |

**89% of the home page's photographs are also on `/work`.** That is the finding
this document exists for.

## 4. What is actually wrong

### 4.1 Two routes do the same job, and the longer one does it worse

The index band on `/` is 2.33 screens — 30% of the page — and it shows nine
gallery cards with three plates each. `/work` is nine gallery cards with five
plates each, in 3.89 screens, and it carries **49 photographs against 37**.

So the home page spends nearly a third of its length on a worse copy of a page
one tap away. Both are reachable from the masthead, both are titled as an
index, and a visitor who scrolls `/` to the end and then taps "Galleries" is
shown the same nine galleries again in the same order.

This is not an argument for deleting either. It is an argument that **only one
of them can be the index**, and the other has to become something a visitor
would not have got from the first.

### 4.2 A gallery is a dead end

`/work/jkt-grads` holds 24 photographs over 6.61 screens — the richest page on
the site, and the one a client reads longest. At the bottom of it, the only
ways on are the footer's chrome and one "← All galleries" link.

There is no way to reach the next gallery without going back to a routing page
and choosing again. Nielsen Norman Group names that shape: "the hub-and-spoke
pattern of navigating from a routing page … to a page deeper in the site's
hierarchy, then immediately back to the routing page is referred to as pogo
sticking." Their causes are missing content, misleading links, and a routing
page whose descriptions do not let users tell which item they want — and § 4.1
of `PRD-the-archive-in-its-own-words.md` has already measured that four of nine
subtitles say nothing, which is exactly that third cause.

Next/previous pagination at the foot of a portfolio item is the ordinary
answer; Squarespace ships it by default and does not let you turn it off.

### 4.3 Three routes are the same list with a filter on it

`/work`, `/work/genre/event` and the home index are one list rendered three
ways. `genre/event` is a strict subset of `/work` — 30 of its 30 photographs
are there — which is correct for a filter and wrong as a *destination*: the
genre pages have their own `h1`, their own metadata, their own opengraph image,
and nothing on them that `/work` does not already show.

That is fine if they exist to be **sent** — "here is the graduation work" in a
WhatsApp message is a real use — and it is waste if they exist to be browsed.
Nothing on the site says which, and nothing on a genre page distinguishes it
from the filtered view of `/work` that a visitor could have reached by tapping
a chip.

### 4.4 Two routes in the masthead hold no photographs

`/notes` has 0 and `/elsewhere` has 1, against 49 on `/work`. They sit in the
same five-item nav, at the same weight, as the pages that are the entire point
of the site. Every route also links to all five, so the nav is flat: `/`,
`/work`, `/about`, `/elsewhere` and `/notes` each have exactly 10 inbound links
and a gallery has 3.

## 5. What this site's own research already settled

Not re-litigated here, and every proposal below respects it:

- **The visitor arrives mid-conversation on WhatsApp.** They are deciding "is
  this person good and do they shoot my thing", not whether to make contact —
  `RESEARCH-the-first-screen.md` § 1.
- **Photograph two above 1.5 screens, six or more inside the first three.**
  Measured today on `/`: photograph two at 0.66, fifteen inside three screens.
- **No CTAs, no pricing, no testimonials, no booking form.**

## 6. Proposal — one job per route

The rule: **a route earns its place by answering a question no other route
answers.** Stated as a table, with what each page must stop doing:

| route | the question it answers | what it must stop doing |
| --- | --- | --- |
| `/` | "What is this and is it any good?" | being a second index |
| `/work` | "What have they shot?" | nothing — it becomes the only index |
| `/work/genre/*` | "Have they shot *my* kind of thing?" | being browsed to; it is a link you send |
| `/work/<slug>` | "What did one whole job look like?" | dead-ending |
| `/about` | "Who am I talking to, and can they take my job?" | — |
| `/elsewhere` | "Is the food and sport work real?" | — |
| `/notes` | "Has anyone else worked with them?" | sitting at nav weight it has not earned |

### 6.1 The home index becomes a shortlist, not the list

Cut the index band on `/` from nine cards to **three** — the three the owner
would show first — and end it with the link to `/work` it already has. The
2.33 screens become roughly 0.9, and the page stops promising a complete list
it is not the best place to read.

What this buys, beyond the duplication: the home page gets shorter by about a
screen and a half without losing a single photograph from the *site*, because
every gallery it drops is one tap away on a page that shows more of it.

The counter-argument is recorded and answered: `PRD-index-as-gallery.md` § 3.4
reversed the reel *because* six of seven galleries were off-screen and someone
deciding had to swipe to find out. That reasoning was about `/` being the only
place the set was visible. It no longer is — `/work` shows nine galleries and
49 photographs — so the argument now points the other way.

### 6.2 A gallery offers the next gallery

At the foot of `/work/<slug>`, after the last plate: the next gallery in the
same genre, as a card with its cover, and a link to that genre. Same
component as the index card, one row, no new data call — `getAlbumsWithCovers`
already returns what it needs.

This is the single highest-value change in this document. The gallery is where
a client spends six screens, and today the site's answer to "what else" is a
link back to a list they have already seen.

### 6.3 The genre pages say what they are, and the ticker stops counting a different set


They are the thing to send. Give each one a line under its `h1` that says so
in the client's language — "Every graduation set in the archive, newest first"
— so the page reads as a complete answer rather than as a filtered view
somebody arrived at by accident.

The vocabulary is nearly settled already: `site.genres`, the chips on `/work`
and the deck's count all say **genre** since `3064f48`. The word "lane"
survives only in class names and in one darkroom-facing label in `site.ts`,
neither of which a visitor reads.

What a visitor *does* read is the ticker, and it numbers a different set
entirely:

```text
BEUNTAMED® · 9 GALLERIES FILED · OPEN ARCHIVE · 01 FOOD · VISUFAVOR ·
02 SPORT · UNTMD · 03 EVENTS & EVERYTHING ELSE · DISPATCH 2026
```

Numbered `01`, `02`, `03` in the second most prominent position on the first
screen, that reads as the archive's own categories — and two of the three are
other sites, while the archive's actual genres are Graduation, Brand and
Event. A client who reads it as a genre list and then meets three different
chips two screens later has been told two things. This is the first-screen
half of `pending-task.md` § 3, and it is cheap: the ticker is one array in
`page.tsx`.

### 6.4 The nav orders itself by what it is for

Five items at equal weight, two of which hold no photographs. `Galleries`
first and `Archive` second at minimum — a visitor sent a link is looking for
work, not for the front page they are already on — and `Guestbook` demoted to
the footer, where its 0 photographs and 95 words are honestly placed.

Left as a proposal rather than a task: it is the one item here that touches
what the owner has said the site is *for*, and the guestbook is the only page
on the site that another person can write on.

## 7. Acceptance criteria

1. No two routes share more than 50% of their photographs, measured by storage
   path. Today `/` shares 89% with `/work`.
2. `/` is under 7 screens at 390 and still puts photograph two above 1.5
   screens and six photographs inside three screens.
3. Every `/work/<slug>` offers at least one link to another gallery, and it is
   above the footer.
4. One word for a genre in every place a visitor can read one, and the
   ticker's numbered list either names the archive's own genres or stops
   being numbered like a category list.
5. `npm run measure` gains an **overlap** report: for each pair of public
   routes, the share of photographs in common, printed and not fatal. It is
   the check that would have caught this, and nothing today would.
6. Every gate that passes now still passes, and the content gate's count does
   not change.

## 8. Non-goals

- **No new page.** The fault is that two pages do one job; a tenth route
  cannot help.
- **No CTA, no pricing, no testimonials, no booking form.** Unchanged and
  reaffirmed.
- **No redesign.** Every change above is which content sits on which route.
  The sections, the grid and the type stay exactly as they are.
- **No change to what any gallery holds.** Which sets exist and what they are
  called is the owner's, and it is `PRD-the-archive-in-its-own-words.md`.

## 9. Still open, and not in this document

Carried here so the list lives in one place. None of these are code tasks:

| what | where it is blocked |
| --- | --- |
| Four subtitles that say nothing, one title in capitals, one `...` | `supabase/fix-content.sql` — written, needs the owner's sentences |
| `featured_rank` — which plate opens the site | `supabase/add-featured-rank.sql`, needs running once |
| Three sets filed under Event that are not events | a decision, then one `update` per set |
| Five genres promised, three held | `pending-task.md` § 3 |
| Deployment Protection on every URL, no custom domain | Vercel dashboard — the site is sign-in-walled to visitors |
| The repository is public and its history carries a real name | making it private |
| `.privacy-terms` absent, so gate 8 reports UNARMED | one file, git-ignored |
| `/darkroom` never audited at runtime | it is behind a login |

And one thing that is code, deliberately deferred: the strip could carry eight
plates rather than five. Seven of nine galleries hold enough. It was not done
because 49 photographs already put every one of them inside the first three
screens of `/work`, and the next increment buys reach the page does not need.

## 10. Process note

The first draft of § 4.2 cited Nielsen Norman Group for the claim that landing
pages should "enable easy lateral movement to sibling pages in the same
category". That sentence came out of a **search-result summary**, not out of
the article: fetched and read, the page defines pogo sticking and gives three
causes, and says nothing about lateral movement at all. The recommendation in
§ 6.2 is still right, but it stands on the pattern being industry-ordinary,
not on a citation that would not have survived being checked.

That is the fourth instrument in this repository to produce a confident wrong
answer — after the fixture with no preflight, `naturalWidth` on a `srcset`
image, and a touch-target sweep run in a browser with no touch. Same rule
every time: **when a measurement disagrees with the thing it measures, suspect
the instrument.**
