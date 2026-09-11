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

Read directly from the Vercel project API, not inferred. What was *not*
possible to confirm from here is an anonymous fetch — this sandbox's egress
proxy blocks `*.vercel.app` outright, so the 403s seen while testing were the
proxy's own and prove nothing about Vercel. The conclusion rests on the
setting, which is documented behaviour.

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

Until then the job skips with that message. It will not measure a login wall
and call it a pass — that path is tested.

This deliberately replaced the idea of building and serving the site inside
CI. `next build` runs the archive queries for real, so it needs live
credentials, and a fixture mode returning fake galleries would be a footgun
aimed at the public site. `CLAUDE.md` is explicit that failing the deploy is
the cheaper outcome.

The static gates need none of this and already run on every push.

---

## 3. Gallery titles are inconsistently cased, and only data can fix it

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

## 4. The repository is public, and the commit history is not anonymous

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

---

## 5. Optional, cosmetic, one person

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
