# Pending — the things code cannot close

Everything in this file needs a decision or an account only the owner has. It
is not a wishlist: each item is blocked, and says exactly what unblocks it.
Nothing here is a substitute for `design.md`, which is the current brief, or
for `npm run measure`, which asserts it.

Last reviewed: 2026-09-11.

---

## 1. The site is behind a login wall on every URL it has

**This is the one that matters.** Vercel Deployment Protection is on for the
project with `deploymentType: all_except_custom_domains`, and the project has
no custom domain — its three hostnames are all `*.vercel.app`:

```
beuntamed-photo.vercel.app
beuntamed-photo-untamed98xs-projects.vercel.app
beuntamed-photo-git-main-untamed98xs-projects.vercel.app
```

So every one of them is covered. **Anyone the link is sent to gets a Vercel
sign-in page instead of the archive** — a prospective client included. The
deployment itself is healthy: production is `READY`, the pages are prerendered
(`x-vercel-cache: PRERENDER`, `x-nextjs-stale-time: 300`), and the HTML is
correct. It is only the door that is shut.

**Proven, not inferred.** The setting was read from the Vercel project API, and
then an unrelated client confirmed the effect: the `measure deploy` workflow
runs on a GitHub runner, which has no Vercel session, and on
[run 2](https://github.com/SurfingWhale/BeUntamedPhoto/actions/runs/34594146806)
it reported

```
skip  https://beuntamed-photo-…-untamed98xs-projects.vercel.app served
      Vercel's authentication page (HTTP 200), not the archive
```

That is an ordinary anonymous visitor getting the login page — which is what a
prospective client gets too. (Note the shape: **HTTP 200 with a login page**,
not a refusal. An earlier version of that check guarded on 401/403 and
therefore measured the wall instead of skipping; see § 2.)

**Two ways to unblock, and they are not the same decision:**

- **Attach a custom domain.** The protection setting already excludes custom
  domains, so the archive becomes public there and every deployment URL stays
  shut. This is the better answer if the site is meant to be found: it also
  fixes the `og:` tags and the canonical link, which currently point at
  `beuntamed-photo.vercel.app` and would keep pointing there in every shared
  card. Set `NEXT_PUBLIC_SITE_URL` once it is attached — `src/lib/site.ts`
  says so at the top.
- **Turn the protection off.** One switch in Project Settings → Deployment
  Protection. Makes the `.vercel.app` URLs public immediately.

Either is the owner's to make, because both change who can see the site. Ask
before touching it.

---

## 2. The browser half of `npm run measure` has no secret yet

Wired and waiting, not missing. `.github/workflows/measure-deploy.yml` runs
the browser gates against each successful deployment — real data, real
credentials, the page a visitor is served. It needs one secret to get past the
protection in § 1:

1. Vercel → Project Settings → Deployment Protection → **Protection Bypass for
   Automation** → generate.
2. GitHub → repo Settings → Secrets and variables → Actions → new secret named
   `VERCEL_AUTOMATION_BYPASS_SECRET`, paste it.

Until then the job skips with that message.

**It did not, on the first run, and the failure is instructive.** The harness
guarded on HTTP 401/403, reasoning that a protected deployment refuses the
request. Vercel does not refuse it — it answers **200 with a login page** — so
the gates measured that page and reported ten design failures against Vercel's
own markup: `GeistSans`, sticky `.fixed` and `.w-full`, a `.text-heading-32`
heading. Red rather than a false pass, but red for a reason that had nothing to
do with this site.

The precondition is now identity, not reachability: `/` has to contain this
site's wordmark, read from `src/lib/site.ts` so it cannot drift. That one
assertion catches the login wall, a stale `--base`, a 404 and a parked domain,
without knowing anything about how Vercel signals protection. Tested against a
server that imitates what Vercel actually returns — which is exactly what the
first version was not.

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

`design.md` § 13 has the dated record.
