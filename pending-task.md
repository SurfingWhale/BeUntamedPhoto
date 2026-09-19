# Pending — the things code cannot close

Everything in this file needs a decision or an account only the owner has. It
is not a wishlist: each item is blocked, and says exactly what unblocks it.
Nothing here is a substitute for `design.md`, which is the current brief, or
for `npm run measure`, which asserts it.

Last reviewed: 2026-09-14 (second pass).

---

## 1. The site is public. What is still missing is a domain of its own

**Corrected on 2026-09-13, and the previous version of this section was
wrong in the way that mattered.** It said a visitor gets a Vercel sign-in page
instead of the archive. They do not. Measured anonymously, no cookies:

```
beuntamed-photo.vercel.app                        200   69,646B   the archive
beuntamed-photo-untamed98xs-projects…             302   → vercel.com/sso
beuntamed-photo-git-main-untamed98xs-projects…    302   → vercel.com/sso
```

`/work`, `/about`, `/work/in-bloom` and `/work/genre/food` all answer 200 with
real gallery content on that first host — the HTML carries "Summer In Bloom",
"DARA BERSEMI", "Nuna", "Lumos". **A link sent on WhatsApp opens.**

What was true is that *deployment* URLs are protected, and the deploy gate was
pointed at one of those rather than at the production alias — which is why CI
reported a login wall on every run and this file believed it. That is fixed:
`measure-deploy.yml` measures `beuntamed-photo.vercel.app` for production
deployments.

**What is still open, and it is a smaller thing than it looked:**

- **A custom domain.** Not required for anyone to see the site. It is worth
  having because `og:` tags and the canonical link resolve to
  `beuntamed-photo.vercel.app` and will keep pointing there in every shared
  card. Attach one, then set `NEXT_PUBLIC_SITE_URL` — `src/lib/site.ts` says
  so at the top — and `PROD_BASE` in `.github/workflows/measure-deploy.yml`
  at the same time.

Either way, nobody is locked out today. Verify before acting on this section:
`curl -s -o /dev/null -w '%{http_code}' https://beuntamed-photo.vercel.app/`

---

## 2. The browser gates run now. A secret would extend them to previews

**No longer blocking.** The browser half measures the public production alias
on every production deployment, so it needs no secret to run at all. Proven by
running the same gates against `https://beuntamed-photo.vercel.app` by hand:
they load the live pages, report screen counts, drift and every `sizes` slot,
and they fail on real findings rather than on Vercel's markup.

A secret is still worth adding, for one narrower reason: **preview**
deployments remain protected, so the gates skip on pull requests.

1. Vercel → Project Settings → Deployment Protection → **Protection Bypass for
   Automation** → generate.
2. GitHub → repo Settings → Secrets and variables → Actions → new secret named
   `VERCEL_AUTOMATION_BYPASS_SECRET`, paste it.

**The original failure is still worth keeping.** The harness guarded on HTTP
401/403, reasoning that a protected deployment refuses the request. Vercel does
not refuse it — it answers **200 with a login page** — so the gates measured
that page and reported ten design failures against Vercel's own markup:
`GeistSans`, sticky `.fixed` and `.w-full`, a `.text-heading-32` heading.

The precondition is now identity, not reachability: `/` has to contain this
site's wordmark, read from `src/lib/site.ts` so it cannot drift. That one
assertion catches the login wall, a stale `--base`, a 404 and a parked domain.

This deliberately replaced the idea of building and serving the site inside
CI. `next build` runs the archive queries for real, so it needs live
credentials, and a fixture mode returning fake galleries would be a footgun
aimed at the public site. `CLAUDE.md` is explicit that failing the deploy is
the cheaper outcome.

The static gates need none of this and already run on every push.

---

## 3. Food and Sport have nothing filed under them — and now there is a shape to fill

Unchanged as a fact: of nine galleries, **Food has 0 and Sport has 0**. A
visitor who wants a food shoot sees the genre offered in the copy and finds no
work behind it. Both genre pages hand off to VisuFavor and UNTMD Sports rather
than showing "Nothing filed here yet", which is the right public answer to an
empty lane but is not a sample project.

**What changed 2026-09-14:** there is somewhere to put the story now. A gallery
renders as a case study — lane, title, the line that says what the job was, the
paragraph, then the frames — so "a sample project" is no longer a vague ask.
Concretely, one Food gallery and one Sport gallery each need:

| | field | where it shows |
| --- | --- | --- |
| 1 | the plates | the gallery, and one becomes the card's cover |
| 2 | `subtitle` — one line: who it was for, what was shot, where | every card, before the tap |
| 3 | `story` — what the brief was and how it was made, up to 1200 chars | the gallery page, after the tap |

All three are in `/darkroom/<slug>`. The subtitle is validated on save — a
placeholder, a repeat of the title or a repeat of the genre is refused with a
sentence saying why — and the story is free text.

**Still the owner's decision, not a code task.** The three options from before
stand: shoot something for each lane, move a set across from VisuFavor and
UNTMD Sports, or drop the two lanes from the copy so the site stops offering
what it cannot show. The difference is that option one is now a filling-in
rather than a build.


---

## 6. The repository is public, and the commit history is not anonymous

`CLAUDE.md` records this and it has not moved. Every commit carries author
identity, and a public repository publishes the working rules along with the
code. **Making the repository private is the fix for both**, and rewriting
history on an already-public repository is not reliable.

The specific terms being kept off the site are the owner's to hand over and
are deliberately not written down here — this file is in the same public
repository.

What *is* verified: the served HTML is clean. Checked against the live
production pages, not the source — the byline appears throughout, the only
address on the page is the archive's own, the only outbound links are the two
photography lanes, and the guestbook renders no stored names.

**The tree was not clean, and that is new information.** On 2026-09-11 a sweep
found a **full legal name** in `.hallmark/log.json` and a stored personal name
in `docs/PRD-index-as-gallery.md` — in the paragraph of the document whose
subject is that a personal name must not be published. Neither ever reached a
rendered page, so no visitor saw them; both were in a public repository for
weeks, and both are now out of the working tree.

They are still in git history. That moves this item from housekeeping to the
reason it was written: **making the repository private is the fix, and it is
the only one.** Rewriting history on an already-public repository is not
reliable.

`npm run measure` gate 8 now checks for this continuously, reading the term
list from `.privacy-terms` — outside the repository, because the terms cannot
be committed without publishing them. **It is UNARMED until that file exists**,
and it says so on every run rather than passing quietly. Creating it is a
two-minute job and the only thing standing between this class of leak and an
automatic check.

---

## 7. Optional, cosmetic, one person

`supabase/byline-on-owner-notes.sql` sets the owner profile's display name to
the byline. The leak it was written for is closed in code, so nothing depends
on running it. The only remaining effect is that the masthead greets a
signed-in owner by their stored name, which nobody else ever sees. The file
says all of this at the top.

---

## 9. The front page still needs a plate chosen for each of its four slots

**Code done, one SQL statement outstanding.** `/` renders four photographic
positions — hero, index band, lane banner, closing fold — and until the
migration is run they are filled by whatever the archive returns: covers first,
then newest first. The front page is a by-product of upload order.

**Two migrations are now waiting, and they are independent** — running either
one alone is fine:

| file | what it unlocks | until it runs |
| --- | --- | --- |
| `add-featured-rank.sql` | choosing which plate fills each of the four front-page slots | the slots fill from upload order |
| `add-album-story.sql` | the story paragraph on a gallery page (§ 3) | the gallery renders as it did before, and a save reports that the story did not stick |

Neither can break the site by being absent: both reads fall back and the story
write retries without the column. Both are idempotent, so running one twice is
harmless.

**What unblocks this one:** run `supabase/add-featured-rank.sql` once against
the project. Then every plate row in `/darkroom/<slug>` carries a select naming the
four slots, and choosing one takes effect on the next render.

Nothing breaks meanwhile, and that is checked rather than hoped: the read falls
back to the previous ordering on a missing column, the write answers with the
filename to run, and `next build` — which executes the featured query against
the live project for real — passes today with the column absent.

`docs/UI-UX Flow Be Untamed.md` § 5b has the flow, the states and the ordering
trap.

---

## 10. The reference layout — done, nothing outstanding

Both references were read against the built page section by section in
`docs/PRD-the-reference-layout.md`, which listed four gaps. All four are built
(`4d303b3`), and § 3.4 — the one recorded as *not* wanted — was built too, on
the owner's instruction:

| | what | state |
| --- | --- | --- |
| § 3.1 | one section-heading rhythm — eyebrow, two-line heading with the second line indented | built |
| § 3.3 | four gallery thumbnails along the foot of the hero | built · photograph two 1.56 → 0.71 screens |
| § 3.2 | one lime surface block | built, then re-cut as a shadow on the lead frame — the first version drew a border around the photograph rather than a block under it |
| § 3.5 | the marks aligned to `--row` | built |
| § 3.4 | the index as a grid, one large card then small, each with a contact strip | built on instruction · reverses a recorded decision; the reasoning is in that PRD and in `PRD-index-as-gallery.md` § 5.1 |

The one thing § 3.4 does **not** answer is what those cards say. Three plates
from inside a gallery show what a job looked like; they cannot say what the
brief was, who it was for, or what was delivered. That is § 4 of this file, and
it is still the owner's to write.

---

## 11. The archive lane over-fetches its banner for a portrait plate

Small, real, and measured while the lanes were being stacked. `SIZES.lane`
describes the **box** the banner sits in, because the archive's own lane
carries a plate whose ratio is not known until render — a landscape plate
fills the box, a portrait one letterboxes inside it. The two borrowed banners
have fixed ratios and declare their painted width directly, so only this one
lane is affected.

For the archive's usual shape the gap is large:

| | 390 | 1440 |
| --- | --- | --- |
| box the slot declares | 355px | 416px |
| painted area, 2:3 plate | 143px | 176px |

So a phone pulls a 1080w candidate to paint 143 CSS px. Declaring the box is
the *safe* direction — under-declaring gives a soft photograph, which costs
more than bytes — so it stays that way until this is done properly.

**What would fix it:** `archiveBanner.width/height` are already passed into
`Lanes`, so the lane can derive its own `sizes` from the plate's ratio at
render time instead of falling back to the box. Needs the frame's height per
breakpoint, which is `--row` based, so it is a small table rather than a
one-liner — and it wants measuring at all six widths afterwards.

Not blocked on anything. Just not worth doing in the same change as the
stacking, because the stacking is what changed the box.

---

## What is *not* pending

So this file does not become the thing it is warning about:

- The lattice question is **answered** — removed, measured at 1.08–1.16:1
  against the paper.
- The display face is **done** — Syne 800, one 10.7KB subset, verified in the
  live HTML.
- The reference images were **seen**, and `design.md` was rewritten against
  them rather than against a paraphrase.
- The measurement harness is **built**, with every gate proved by
  reintroducing the bug it targets.
- The login wall is **not a thing** — see § 1. The production alias is public
  and always was; the deploy gate was pointed at a protected deployment URL,
  and this file believed its own CI.
- The two over-asking `sizes` slots are **closed**. The declaration was never
  wrong: those frames are lazy inside a horizontal reel, so the candidate was
  chosen mid-scroll. `trimSrcSet` puts a ceiling on the ladder instead, which
  cannot be mistimed, and all ten browser gates pass.
- The undersized-files scare is **withdrawn**. `naturalWidth` on a `srcset`
  image is divided by the chosen density, so it echoes the slot size back
  whatever file is behind it. Decoded without a `srcset`, every file is exactly
  the size it was asked for. The bucket holds 76 files at 53.7MB, largest
  1.82MB — storage is not a constraint here.
- The darkroom's contact sheet no longer pulls **6.02MB to draw 24
  thumbnails**. It was asking storage for 1500px to paint a 96px square; it
  asks for 288 now, and the page is 0.39MB.
- What a gallery *says* is now asserted — `npm run measure` reads the live
  cards and fails on a subtitle that repeats its title, repeats its genre, or
  is a placeholder. § 4 and § 5 below are the remaining writing, and the gate
  will go green when they are done.
- **The gate's list is now a file you can run.** `supabase/fix-content.sql`
  carries the two mechanical fixes finished — `DARA BERSEMI` to sentence case
  and `Hello There...` to the ellipsis character — and the four subtitles as
  commented templates. The templates are deliberately not filled in: only the
  owner knows who each job was for, and the gate keeps failing until the
  sentences are real. Run it in the SQL editor, then `npm run measure`.

- **Which page does which job is now written down.**
  `docs/PRD-routes-that-coexist.md`, measured 2026-09-19: 89% of the home
  page's photographs are also on `/work`, the home index spends 2.33 of its
  8.37 screens being a worse copy of it, and a gallery — the page a client
  reads longest — offers no way to the next one. Its § 9 carries this file's
  open items so the list lives in one place.

`design.md` § 13 has the dated record.
