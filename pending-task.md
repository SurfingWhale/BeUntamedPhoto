# Pending — the things code cannot close

Everything in this file needs a decision or an account only the owner has. It
is not a wishlist: each item is blocked, and says exactly what unblocks it.
Nothing here is a substitute for `design.md`, which is the current brief, or
for `npm run measure`, which asserts it.

Last reviewed: 2026-09-13.

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

## 3. Two of the five genres have no work on this site

Counted off the live pages: **7 galleries — Graduation 2, Brand 2, Event 3.
Food 0. Sport 0.** The tagline, the ticker, `site.genres` and `/about`'s
commissions line all name five.

The work itself is not missing, it is on the satellites, and `/work/genre/food`
and `/work/genre/sport` now hand a visitor over to VisuFavor and UNTMD Sports
instead of dead-ending on "Nothing filed here yet". That stops the bleeding; it
does not fix the shape.

**The shape is the decision, and it is the owner's.** Three ways, and they are
genuinely different businesses:

- **File food and sport sets here too.** The archive becomes the one place
  that holds everything, and the satellites become deeper cuts rather than the
  only proof. Costs uploading work that already exists.
- **Stop selling five genres from this site.** If food and sport live
  elsewhere on purpose, then the tagline, the ticker and the commissions line
  should say three and point at two, rather than claim five and hold three.
  Costs nothing but honesty.
- **Leave it.** Defensible only if the satellites are what get sent to food and
  sport clients, and this site is never the first thing they see.

Doing none of the three is the only option that is actively wrong, because the
site currently promises five and shows three.

## 4. The galleries that exist do not say what the job was

A visitor cannot tell what they are looking at. Live subtitles, verbatim:

| Gallery | What it says | What a client needs |
| --- | --- | --- |
| Summer In Bloom | `Strobist, PrimeLens And Summer` | who it was for, what it produced |
| DARA BERSEMI | `Wellness & Yoga` | closer, but the title is internal |
| Sales HeadShot | `Sales Headshot Photography` | restates the title |
| Cindy's Graduation | `Graduation` | restates the genre |
| Hello There... | `unfiled` | — |
| Nuna Graduation | `Graduation` | restates the genre |

Three of the six restate their own title or genre, one is a camera-technique
note, one is literally `unfiled`. `design.md` § 2 asks for "what was shot, for
whom, where, when" — specific beats clever — and none of these do that.

No gate can catch it: the fields are filled, the CSS is right, and the content
is in the database. It is a writing job in the darkroom, one line per gallery,
and it is probably worth more per minute spent than anything left in the code.

Also: everything is filed under **Event**, including "Summer In Bloom" and
"DARA BERSEMI", which look like portrait and wellness work. So the genre
filter — the one tool a client has for finding relevant work — is pointing at
the wrong sets.

## 5. Gallery titles are inconsistently cased, and only data can fix it

Sentence case is the rule (`design.md` § 5) and the stylesheet no longer
forces anything — so a title renders exactly as it was typed. Live right now,
in the same reel:

```
Summer In Bloom      ← title case
DARA BERSEMI         ← all capitals
Sales HeadShot       ← title case, internal capital
Cindy's Graduation   ← sentence case
```

No gate can catch this: the CSS is correct and the casing is in the database.
Rename them in the darkroom, or leave it deliberately — but it is the loudest
remaining inconsistency on the page, and `DARA BERSEMI` in particular
reintroduces exactly the shouting the de-shouting pass removed.

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

## 8. Some stored plates are smaller than the size recorded for them

Found on 2026-09-13 by the browser gates, and it is a data fault that no
amount of CSS can answer.

`publicSrcSet` caps its candidate ladder at the photograph's own width, so a
1000px plate should never be offered at 2880w. Two images are being offered
the full ladder anyway, which means the width stored in `photos` is larger
than the file actually in the bucket. Supabase's render endpoint is honest
about it — `resize=contain` will not upscale, so it returns the source size and
ignores the width asked for:

| where | asked for | got back | box it fills | at |
| --- | --- | --- | --- | --- |
| the archive lane frame, `/elsewhere` | `?width=1500` | `naturalWidth` **304** | 271px | 390 dpr3 |
| the archive lane frame, `/elsewhere` | `?width=2000` | `naturalWidth` **304** | 414px | 1440 dpr2 |
| the second fold plate, `/` | `?width=2880` | `naturalWidth` **1000** | 560px | 1440 dpr2 |

The bytes are not the problem — a 304px file is small. **The sharpness is.** A
271px box on a 3x phone wants 813px of image and is being handed 304, so that
frame is upscaled about 2.7x and will look soft on exactly the device most
visitors use. The gate reports it as a `sizes` failure because that is the
shape it takes from the outside; the declaration is right and the file is
wrong.

**What unblocks it:** re-upload those plates at full size through the
darkroom, which records the real dimensions as it encodes. The darkroom's
"Stored file sizes" panel is the place to find the others — this was two
images out of the ones the five public routes happen to show, and nothing has
audited the whole table.

Worth a gate afterwards: `naturalWidth` at least the box times DPR, on every
image the browser actually loaded. It would have caught this the day it
happened, and it is a few lines next to the `sizes` check that already walks
every slot.

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

`design.md` § 13 has the dated record.
