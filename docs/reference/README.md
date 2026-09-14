# The reference images

Four sessions of design work have been written against these and none of them
was in the repository. Every document that cites them — `design.md`,
`PRD-the-reference-layout.md`, `RESEARCH-reference-vs-built.md` — was written
by somebody looking at an image in a chat window, and the session after that
had to work from the description instead. That is how `design.md` came to name
a typeface from a reconstruction rather than from the reference, and how § 3.4
of the layout PRD came to be argued twice. They live here now.

They are **references, not site assets.** Nothing in this folder is served:
`docs/` is not `public/`, and moving any of these into `public/` would publish
them. Don't.

| file | what it is | what reads it |
| --- | --- | --- |
| `nomvnt-page.jpg` | The Nomvnt page, full length. The structural backbone — the owner's words: "Nomvnt itu kerangkanya". | `PRD-the-reference-layout.md` § 1 is a section-by-section table of this image. `design.md` § 4. |
| `untamed-marks.png` | The archive's own mark sheet: the apex stroke, and the four corner registration marks. | `.mark` and `.bracket` in `globals.css` are these. So is `.story__title` — "the half-second before it is over" is the caption under the apex. |
| `untamed-wordmark.jpg` | The wordmark. | `.foot__wordmark`, `.mast__name`, and the `site.byline` the whole site signs off with. |
| `type-specimen.jpg` | A type specimen, for the voice: a display heading at a size that crowds the frame, small technical labels, one accent colour on a word. | `design.md` § 1 and § 5. The numbered-plate rhythm and the marked word both come from here. |

## What the Nomvnt page actually does, in order

Kept here as well as in the PRD, because this is the file somebody opens next
to the image.

| # | section | image content |
| --- | --- | --- |
| 1 | Hero | full-bleed photograph · giant wordmark on it in lime · caption block low-right **on** the image · **four small thumbnails along the bottom edge** |
| 2 | Ticker | lime band, no image |
| 3 | About | **no image** — one large paragraph and a smaller grey one |
| 4 | Featured | **two cards side by side, the left one standing on a lime block** · `( 24 Products )` and ← → · each card: image, **name**, and a quieter descriptor under it |
| 5 | Seasonal | **one large card, three smaller** |
| 6 | By category | a photograph carrying the whole section, **filter chips laid over it** |
| 7 | Testimonials | **portrait on a lime block** + a quote card |
| 8 | Articles | **two wide cards** with tag pills |
| 9 | Footer | dark ground · link columns · **giant wordmark cropped by the page edge** |

Eight of its nine sections carry a photograph. Exactly one — About — is type
alone. That is the measurement behind "biar ga flat": this site had *two*
type-only sections back to back where the reference has one.

A section is more than its pictures, which is the mistake worth recording: the
first attempt at row 4 put two plates into an existing typographic zone and
called it done. The reference's Featured Collection is an eyebrow, a two-line
heading with the second line stepped in, a supporting line, two *named* cards
and an action at the trailing edge — and the owner sent this crop back with
"kan maksud gw dibagian section ini tambahin". Count the parts of a section,
not just whether a photograph appears in it.

**And the sections are only half of it.** Every card in rows 4, 5 and 8 taps
through to a page that explains the thing — the reference's product detail.
That is the pattern behind "cards bisa di tap dan ada storynya", and the
archive's answer to it is `/work/<slug>`: a gallery renders as a case study
(lane · title · the line · the story · the facts · the plates) rather than as
a folder with a date on it. `albums.story` is where the paragraph lives; see
`design.md` § 4 and `pending-task.md` § 3, which is the one thing still
outstanding for the Food and Sport lanes.

## A note on the Nomvnt capture

It is a screenshot of somebody else's live commercial site, kept as a design
reference, and this repository is public — so it is republishing their
photography and their copy to anyone who clones. That is an argument for
making the repository private, which `pending-task.md` § 6 already carries for
two other reasons. Nothing here is copied into the site itself: the structure
is the reference, the photographs are the archive's own.
