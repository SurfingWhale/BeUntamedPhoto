# Research — the first screen, and why someone keeps scrolling

**Status:** research, 2026-09-14. Measured against live production, sources cited.
**Question it answers:** what makes someone who opens this link interested
enough to keep going — hero, copy, and the order things appear in.
**Reads with:** `IDEAS-motion.md`, `PRD-index-as-gallery.md`,
`PRD-the-archive-in-its-own-words.md`

---

## 1. The visitor is not who the advice is written for

Almost every article about photography-portfolio conversion assumes **cold
traffic**: a stranger arrives from search or an ad, and the page has to
introduce a business. The standard prescription follows from that — a value
proposition headline, packages, a starting price, a "Schedule Now" button,
testimonials.

That is the wrong brief for this site, and applying it would make it worse.

Here, the link is sent **inside a conversation that is already happening on
WhatsApp**. The visitor already knows who sent it and already intends to talk.
They are not deciding *whether to make contact*. They are deciding one thing:

> **Is this person good, and do they shoot the kind of thing I need?**

So the generic advice inverts. A headline explaining who he is spends the most
valuable space in the page answering a question that was settled before the tap.
Pricing and booking buttons compete with the WhatsApp thread that is already
open. What that visitor needs is the shortest possible path to **photographs of
the thing they came for**.

Everything below is judged against that, not against conversion-rate advice for
strangers.

## 2. What the research actually establishes

Three findings survive the filter and are worth building on.

**First impressions form in ~50ms, and they stick.** Participants rated the
visual appeal of homepages shown for 500ms, then again at 50ms, and the ratings
stayed highly correlated — the judgement is essentially instantaneous. Through
the halo effect it then colours later judgements of credibility and usability.
Low visual complexity and high *prototypicality* — looking like what its
category is expected to look like — rate highest.

*Useful here:* the first screen is the whole argument. It is also the reason
this site's austerity works rather than backfires — a photograph filling the
screen is exactly what a photography site is expected to look like.

**The headline is most of what gets read.** "On average, 8 out of 10 people
will read headline copy, but only 2 out of 10 will read the rest." The same
source is blunt about the failure mode: keep lyrical writing for blog posts,
because on a top-level page "people are in search of something, and they don't
have the patience to solve riddles." It recommends headlines of 2–9 words, and
warns against a slideshow with no text at all — "visitors will still be
confused and wonder what the site is all about."

**Viewers judge a body of work by its weakest frame, and they stop early.**
The consensus figure is a working portfolio of 15–30 images that all look like
one body of work, and a viewer who looks at **roughly 10–20 images before
deciding** whether to make contact or move on. "A tight set of 15 strong frames
beats a padded set of 50 every time, because viewers do not remember your best
shot. They remember their impression of the whole."

## 3. What this site does now, measured

Live production, iPhone 12 at 390×844, after a full scroll so nothing is lazy:

```
page total                     5.23 screens

first photograph               0.17 screens     624px tall
"available for commissions"    1.72 screens
the email address              2.26 screens
genre filter chips             2.64 screens
first gallery card             2.70 screens
```

And the photographs, in the order they appear:

```
 1.  0.17 screens   h624   Plate 01
 2.  2.73 screens   h215   Summer In Bloom
 3.  2.73 screens   h215   DARA BERSEMI
 4.  2.73 screens   h215   Sales HeadShot
 ... five more, all at 2.73
12.  3.74 screens   h551   Plate 03
```

The first screen itself is good: **74% of it is photograph**, under a 145px
masthead, with the statement set on the image.

## 4. Where this site and the research disagree

### 4.1 There is exactly one photograph in the first 2.7 screens

This is the finding. Everything else in this document is smaller than it.

The research says a visitor looks at 10–20 images before deciding. This page
shows them **one**, then asks them to scroll **1.7 screens of typography** —
the opening zone, "the half-second before it is over", the two-line gloss, the
bio paragraph, two rails — before a second photograph exists.

A visitor who came to find out whether he shoots their kind of thing gets one
frame and an essay. The page is not slow and it is not ugly; it is *withholding
the only evidence that matters*. On a photography site, type between photographs
is a toll, and 1.7 screens is a high one.

### 4.2 The headline is a position, not information

Live, at 40px:

```
Frames, not feeds.
Graduation, brand, sport, food and event photography.
```

"Frames, not feeds" is a good line and it is doing the wrong job. It is a
stance about Instagram — it distinguishes him from a platform, which is a
question nobody opening a WhatsApp link is asking. Against "8 out of 10 read
only the headline", the one line most likely to be read is spent on a riddle.

The **second** line is the one carrying information, and it is at 15px
underneath. It is also missing the single most load-bearing fact in any
photographer's first line: **where he works**. There is no city anywhere on the
first screen.

### 4.3 The first screen promises five genres and the archive holds three

The tagline names graduation, brand, sport, food and event. The ticker repeats
"01 FOOD · VISUFAVOR / 02 SPORT · UNTMD". The archive holds Graduation, Brand
and Event.

Against the halo effect this is expensive in a way it does not look: the
promise is made in the first 50ms and contradicted two screens later when the
filter shows three chips. That is `pending-task.md` § 3 and it is a decision,
not a bug — but it is a **first-screen** decision, not a housekeeping one.

### 4.4 The ticker spends first-screen space on archive housekeeping

It renders twice in the opening viewport:

```
UNTAMED® · 8 GALLERIES FILED · OPEN ARCHIVE · 01 FOOD · VISUFAVOR ·
02 SPORT · UNTMD · 03 EVENTS & EVERYTHING ELSE · DISPATCH 2026
```

"8 galleries filed", "open archive", "dispatch 2026" are the vocabulary of the
person who maintains the archive, not of the person deciding whether to hire
him. It is the second most prominent text on the screen.

## 5. What to do, inside the constraints

Ordered by how much it changes the answer to "is this person good".

### 5.1 Put photograph two on screen two

The single highest-value change on the site. Options, cheapest first:

- **Move the index up.** The genre filter and the first gallery cards sit at
  2.64 and 2.70 screens. Above the story section instead of below it, they land
  near 1.2 — so a visitor sees eight covers before any prose. The story does not
  disappear; it becomes the thing you read *after* you are interested, which is
  the order it should have been in.
- **Or let the opening photograph run to the filter.** Keep the hero, cut the
  opening zone and one rail, and the distance from frame one to frame two
  becomes roughly one screen rather than 2.7.

Either way the target is measurable: **photograph two above 1.5 screens**, and
**six or more photographs within the first three**.

### 5.2 Swap which line is the headline

The information is already written. It is set 25px smaller than the riddle.

```
now      Frames, not feeds.                                          40px
         Graduation, brand, sport, food and event photography.       15px

instead  Graduation, brand and event photography in Jakarta.         40px
         Frames, not feeds.                                          15px
```

Two to nine words is the recommended headline length; the first line above is
seven. "Frames, not feeds" keeps its place as the line underneath, where a
stance belongs — it is a good line, it is just not an answer.

Adding the city is the other half. A photographer without a place on the first
screen is asking to be ruled out by anyone who needs someone local, and it
costs three words.

Note this only works honestly if § 4.3 is settled — say three genres and show
three, or file the food and sport work here.

### 5.3 Make the ticker say something a client would say

Same component, different content. It currently counts the archive; it could
carry the work instead — what was shot recently, where, for whom. "Wisuda UI,
Salemba · Menu shoot for a Blok M kitchen · Court-side, Senayan" is the same
strip doing the same motion, and it is evidence rather than inventory.

If that is more trouble than it is worth, the cheaper version is to cut it from
the first screen entirely and let the photograph have the room.

### 5.4 Curate to the number people actually look at

15–30 frames, all looking like one body of work; 10–20 looked at before a
decision. The archive holds 76 across seven galleries, which is not a problem
in itself — but it means the **order inside each gallery** is doing the work of
curation, and nothing has audited that. The first three frames of each gallery
are, in practice, the portfolio.

## 6. What this deliberately does not propose

The generic advice for photography portfolios recommends all of the following.
Each is wrong for this site, and the reason is the same in every case — the
conversation is already open.

- **No pricing or packages.** Declined explicitly, and a price on the page
  competes with a negotiation already happening in chat.
- **No booking button or contact form.** The next step is the thread the
  visitor came from. A form asks them to start a second conversation.
- **No testimonials.** The photographs are the evidence; a stranger's quote is
  weaker than a frame.
- **No "Schedule Now" hero CTA.** The hero's job here is to show work, not to
  capture a lead that is already captured.
- **No rotating hero slideshow.** It costs LCP on a phone on mobile data, and
  one photograph held still is a stronger claim than five going past.

## 7. Sources

- [Attention web designers: You have 50 milliseconds to make a good first impression](https://www.researchgate.net/publication/220208334_Attention_web_designers_You_have_50_milliseconds_to_make_a_good_first_impression_Behaviour_and_Information_Technology_252_115-126) — Lindgaard et al.
- [First impressions form quickly on the web, eye-tracking study shows](https://www.sciencedaily.com/releases/2012/02/120216094726.htm) — ScienceDaily
- [First Impressions Matter: The Importance of Great Visual Design](https://cxl.com/blog/first-impressions-matter-the-importance-of-great-visual-design/) — CXL, on prototypicality and the halo effect
- [Copywriters for your photography website & 10 writing tips](https://www.foregroundweb.com/copywriting/) — ForegroundWeb, on headlines, poetic language and pronouns
- [7 Copywriting Tips for Photographers](https://saltedpages.com/blog/7-copywriting-tips-for-photographers/) — Salted Pages
- [Why Delete 90% of Your Photography Portfolio](https://fstoppers.com/education/why-every-photographer-needs-delete-90-their-portfolio-901819) — Fstoppers
- [Build a Photography Portfolio That Gets You Hired](https://fstoppers.com/business/how-build-photography-portfolio-gets-hired-902136) — Fstoppers
- [How Many Photos Should a Photographer Show in a Portfolio?](https://gopickle.ai/blogs/how-many-photos-should-a-photographer-show-in-a-portfolio) — GoPickle
