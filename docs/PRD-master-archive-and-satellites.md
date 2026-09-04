# UNTAMED as the master archive — proposal

Status: **proposal, nothing built.** Written against `main` at the commit that
adds this file.

## 0 · What was asked for

1. Bulk-upload photographs into UNTAMED in one go.
2. Then route each one to where it belongs, by updating it rather than
   re-uploading it.
3. UNTAMED can reach what already lives in VisuFavor's and UNTMD Sports'
   storage.
4. Each satellite site can only reach its own genre.
5. **Nothing existing is deleted.** The buckets on UNTAMED and VisuFavor
   already hold real content, and the pages that load it keep working.

Point 5 is the constraint that shapes everything below: every step here is
additive. No bucket is dropped, no object is removed, no existing row is
rewritten.

## 1 · What already exists, so we don't rebuild it

| Piece | Where | State |
| --- | --- | --- |
| Two buckets, `gallery` public and `gallery-private` | `supabase/storage.sql` | Owner-only writes through `is_owner()`; private reads through signed URLs |
| `albums.genre`, five values, constrained | `supabase/add-genre.sql` | Done, indexed, and read by the index filter |
| Moving files between buckets | `relocate()`, `src/app/darkroom/actions.ts:108` | Batched, resumable, treats "already copied" as success, updates the row before deleting the source |
| Row written only after the object lands | `recordPhoto()`, same file | Done |
| Client-side WebP encode before upload | `src/lib/image.ts` | Done |
| Resized delivery, `srcset` for public, single width for private | `src/lib/images.ts` | Done |

**So "move a photograph to a different bucket, safely, in batches" is already
solved and in production.** What is missing is bulk intake, a routing step,
and anything at all to do with the other two sites.

## 2 · Answered: three stacks, two Supabase projects, one site with no backend

This was written as an open question. It is not one any more — both satellite
repositories were read directly.

| | UNTAMED | VisuFavor | UNTMD Sports |
| --- | --- | --- | --- |
| Framework | Next.js 16 | **Static HTML/CSS/JS, no build step** | Next.js 15 |
| Database | Supabase Postgres | **None** | **Firebase Firestore** |
| Auth | Supabase | None | Firebase |
| Photographs | Supabase Storage — `gallery`, `gallery-private` | **14 JPEGs committed to the repo**, `images/`, 1.9 MB | 47 files committed to `public/`, 15 MB, **plus** Supabase Storage bucket `UNTMD_SPORTS` |
| Supabase project | Provisioned by the Vercel Marketplace integration; the ref is not in the repo | — | `vkpdkntxsqexcfaiehgx` — created by hand in the dashboard |

Three consequences, and they matter more than the original question did:

1. **There is no shared project.** UNTMD Sports runs its own Supabase project,
   created separately, holding one bucket named `UNTMD_SPORTS`. Nothing about
   the two is connected today.
2. **VisuFavor has no backend at all.** Its "bucket" is a folder in git. That
   is not a limitation for this design — a static page can fetch a JSON feed
   with plain JavaScript, and no key or SDK is involved. It is the cleanest
   consumer of the three.
3. **UNTMD Sports is not a thin satellite.** It has its own admin panel,
   Firestore collections (`gallery`, `library`, `pricing`, `schedule`,
   `stories`, `leads`), Google sign-in, a watermark tool, and phone uploads
   that already write to its own Supabase bucket through
   `/api/upload-url`. Folding it into the master is a decision about giving up
   a working CMS, not a wiring job.

There is also a loose end in this repository: `firebase-admin` sits in
`package.json` and is imported nowhere in `src/`. Either it was added for a
plan that stopped, or it is the beginning of reading UNTMD Sports' Firestore
from here. It costs an install either way and should be removed or used.

## 3 · The shape being proposed: one archive, three windows

> UNTAMED holds the bytes. The satellites never get a key — they read a
> genre-scoped feed and render it next to whatever they already have.

```
            ┌──────────────────────────────────────┐
            │  UNTAMED (master)                    │
   bulk ───▶│  inbox ──▶ file to genre ──▶ gallery │
   upload   │            gallery-private           │
            └──────┬───────────────────────┬───────┘
                   │ /api/feed/food        │ /api/feed/sport
                   ▼                       ▼
              VisuFavor               UNTMD Sports
        (keeps its own photos)   (keeps its own photos)
```

**Why not one bucket per genre.** A bucket cannot be renamed, each one
multiplies the storage policies, and genre is the thing most likely to change
its mind — a set filed as "brand" turns out to be "event". Genre belongs in
Postgres, where re-filing is one `UPDATE`, and in the object *path*, which
`relocate()` already knows how to change. RLS on `storage.objects` can scope
by path prefix exactly as well as it can by `bucket_id`.

**Why not push copies to the satellites.** Two copies means two storage bills,
two things to keep in step, and the master holding a service-role key for
someone else's project — a key that can delete everything there. A pull-based
feed has none of that.

## 4 · The design

### 4.1 Storage layout — additive, nothing moves on day one

```
gallery/<genre>/<album-slug>/<file>            ← new work
gallery-private/<genre>/<album-slug>/<file>
gallery-private/inbox/<batch>/<file>           ← new prefix, private by default
```

`photos.path` already stores the whole path, so old objects at their current
paths and new ones under this layout coexist with no migration. Existing
photographs are re-pathed only if and when they are re-filed.

### 4.2 Schema — every statement `if not exists`

```sql
-- An album that is a holding pen rather than a published set.
alter table public.albums add column if not exists kind text not null default 'gallery';
alter table public.albums drop constraint if exists albums_kind_check;
alter table public.albums add constraint albums_kind_check check (kind in ('gallery','inbox'));

-- A plate can be filed on its own, before it belongs to a published album.
-- Null means "inherit the album's genre", so nothing needs backfilling.
alter table public.photos add column if not exists genre text;
alter table public.photos drop constraint if exists photos_genre_check;
alter table public.photos add constraint photos_genre_check
  check (genre is null or genre in ('graduation','brand','sport','food','event'));

-- Where a plate came from, so an imported one is never mistaken for native.
alter table public.photos add column if not exists source text not null default 'untamed';

-- Content hash. This is what makes the import in 4.6 safe to run twice.
alter table public.photos add column if not exists checksum text;

create index if not exists photos_genre_idx on public.photos (genre);
create unique index if not exists photos_checksum_idx
  on public.photos (checksum) where checksum is not null;
```

Nothing is dropped and no existing row changes value.

### 4.3 Bulk upload

Extends `src/components/uploader.tsx`, which already stages files before
sending them.

- **Concurrency 4, never `Promise.all` over the whole batch.** 200 files at
  once opens 200 sockets, and Supabase rate-limits long before that finishes.
- **Downscale first** with the WebP encode already in `lib/image.ts`. 200
  originals at ~8 MB is 1.6 GB uploaded; encoded first it is closer to 200 MB.
- **Per-file state, and a retry that only retries what failed.** A batch that
  dies at file 180 must not start again at file 1.
- **Everything lands in the inbox, in the private bucket.** Nothing is
  publicly reachable before it has been looked at.
- The row is still written after the object lands, as `recordPhoto()` does
  today — a row pointing at a file that is not there is the one state worth
  designing against.

### 4.4 Routing — the "update it to move it" step

One new action, `filePhotos(photoIds[], targetAlbumId)`:

1. Read the target album's `genre` and `visibility`.
2. Compute the new path: `<genre>/<album-slug>/<file>`.
3. `copy` with `destinationBucket`, update the row, then delete the source —
   the exact sequence `relocate()` already uses, including treating "already
   exists" as success so a re-run finishes a partial one.
4. Set `album_id`, `bucket`, `path`, `genre`, and append `position`.

In the darkroom: the inbox lists plates with checkboxes and a **File to…**
picker. Same batching and same resume behaviour as the visibility flip, so
there is one mechanism to trust rather than two.

### 4.5 The genre feed

`GET /api/feed/[genre]` on UNTAMED:

- Only `visibility = 'public'` rows, filtered in the query rather than after.
- Albums, plates, dimensions, captions, and `srcset` URLs built by
  `lib/images.ts`.
- `Cache-Control: s-maxage=300, stale-while-revalidate=86400`.
- CORS allowlist of exactly the two satellite origins.

The satellites fetch that URL. **They hold no key, reach no bucket, and can
ask for no genre but their own** — the scoping is the route, not a promise.
Their existing content stays exactly where it is and renders alongside.

This suits what they actually are. VisuFavor is a static page with no build
step and no SDK, so a `fetch()` and some DOM is the only integration it can
take — and the only one it needs. UNTMD Sports has its own data layer already;
for it the feed is an extra section, not a replacement.

### 4.6 Pulling in what already lives on the satellites

Two jobs, not one, and their sizes are nothing alike.

**VisuFavor — an afternoon.** Fourteen JPEGs in a git folder, 1.9 MB, with
their captions and categories in `js/script.js` as a plain array. Read the
array, upload the files under `gallery/food/visufavor-<slug>/`, insert one
album and fourteen photo rows. No key, no API, no permission needed — the
repository is the export. The files stay in the repo untouched, so the live
site keeps working exactly as it does now.

**UNTMD Sports — a negotiation, not a script.** Its photographs live in three
places at once: committed to `public/`, in its own Supabase bucket, and
described by Firestore documents that also drive pricing, schedule and story
content. Copying the images is easy; deciding what happens to a working admin
panel is not. Three honest options, in rising order of effort:

1. **Leave it alone.** UNTAMED links to it, as it does now. Nothing to build.
2. **Point its uploader at this project.** `app/storage.ts` there is two
   constants — a project URL and a bucket name. Change them and every *future*
   phone upload lands in UNTAMED's bucket instead of its own. Its existing
   photographs stay exactly where they are and keep rendering. This is the
   smallest change that makes UNTAMED genuinely the master going forward, and
   it deletes nothing.
3. **Import the back catalogue too.** A script with that project's secret key,
   reading Firestore for the metadata and its bucket for the files, writing
   both into UNTAMED. Idempotent through the checksum index. This is the only
   option that needs a credential, and the only one worth the guard rails in §8.

Option 2 is the recommendation: it costs two lines in a repository we can
already read, and it stops the split from getting wider while the bigger
question stays open.

## 5 · What this does not do

- **No two-way sync.** Edit a caption in VisuFavor's own admin afterwards and
  the master will not know. Two-way means a change feed and a conflict rule on
  both ends — that is its own project, not a step in this one.
- **Egress moves to the master.** Every image a satellite shows is served from
  UNTAMED's bandwidth. Worth watching on the free tier.
- **The feed does not replace a satellite's own tables.** If VisuFavor has its
  own Postgres, this is an additional source it merges, not a migration.

## 6 · Phases

| | Scope | Touches |
| --- | --- | --- |
| **P1** | Inbox album, bulk upload, `filePhotos` routing | This repo only. Nothing external changes, nothing is deleted |
| **P2** | `/api/feed/[genre]`, cache headers, CORS allowlist | This repo only |
| **P3** | Satellite reads the feed | The other two repos |
| **P4** | One-time import from the satellites | Needs a service-role key per satellite |

P1 and P2 are useful on their own: bulk upload plus routing is worth having
even if the satellites are never wired up.

## 7 · What is needed before P1 starts

1. ~~Same Supabase project, or three?~~ **Answered in §2** — three stacks,
   two Supabase projects, one static site.
2. **Volume**: photographs per batch, and typical file size off the camera.
   This sets the upload concurrency and whether resumable uploads are needed.
3. **UNTMD Sports' admin panel — keep it, or retire it?** This is the real
   open question now, and it is a decision about how you want to work rather
   than a technical one. §4.6 lists the three options; option 2 costs two
   lines and does not close the door on either of the others.
4. For the back-catalogue import only: the secret key for
   `vkpdkntxsqexcfaiehgx`, and confirmation that nothing there gets deleted.
   VisuFavor needs no key at all — its photographs are in its repository.

## 8 · Risks worth naming now

| Risk | Guard |
| --- | --- |
| Feed leaks a held-back gallery | Filter on `visibility` in the query; a test that asserts a `members` album never appears in any feed |
| A service-role key leaking | Never in the browser, never committed, rotate immediately after the import run |
| Import run twice, everything duplicated | The checksum unique index — that is what it is for |
| Batch dies halfway | Same resume path as `relocate()`: re-running finishes it |
| Storage cost | One copy under this design; two if we ever push instead of pull |
