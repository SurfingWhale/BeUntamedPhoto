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

> UNTAMED holds the bytes for everything it owns, and mirrors the one genre it
> does not. No key moves in either direction.

**The owner has decided UNTMD Sports keeps its admin panel.** That settles the
direction of the data, and it is not the same for every genre:

| Genre | Source of record | UNTAMED's role | The satellite's role |
| --- | --- | --- | --- |
| **Sport** | UNTMD Sports — its panel, its Firestore, its bucket | **Mirrors it, read-only** | Unchanged. Nothing is touched |
| **Food** | UNTAMED | Files and rows live here | VisuFavor reads `/api/feed/food` |
| Graduation, brand, event | UNTAMED | Only place they exist | — |

An asymmetric design looks like a compromise and is not one. A genre with a
working CMS behind it should be edited where that CMS is; a genre whose site is
fourteen files in git should be edited here. Forcing both through one direction
would break the half that already works.

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

### 4.6 Sport: mirror it, don't move it

The previous revision recommended repointing UNTMD Sports' uploader at this
project's bucket. **Keeping its admin panel makes that the wrong call**, and the
reason is worth stating rather than quietly dropping: that panel writes a
photograph's metadata — dimensions, blur placeholder, storage URL — into
Firestore `library` as it uploads. Move the bytes here and the metadata stays
there, and one photograph is split across two systems that do not know about
each other: UNTAMED holding files it has no rows for, UNTMD Sports holding rows
pointing into someone else's bucket. Worse than either end alone.

So sport is mirrored, not migrated. What makes this cheap is already in that
repository:

- `gallery`, `library`, `stories` and `pricing` are all `allow read: if true`
  in `firestore.rules` — the front page has to render them for visitors who are
  not signed in.
- `app/firestoreRest.ts` already reads Firestore from the server over plain REST
  with **no SDK and no credentials**, for exactly that reason.
- The photographs themselves sit on public Supabase URLs.

So UNTAMED can read every sport photograph and its metadata **without a single
credential, and without one line changing in UNTMD Sports.**

```
GET https://firestore.googleapis.com/v1/projects/<project>/databases/(default)/documents/library
```

The mirror is a scheduled route here that reads that collection and upserts rows
keyed by the sport slug. Mirrored plates are marked `source = 'untmd-sports'`
and are **read-only in the darkroom** — the panel over there is where they are
edited, and two editors over one row is the bug this whole design exists to
avoid.

`external_url` earns its place here: a mirrored plate references the file where
it already lives rather than copying it. One copy of the bytes, one storage
bill, and no drift when a photograph is replaced over there.

```sql
-- A plate that lives in someone else's storage. Null for everything native.
alter table public.photos add column if not exists external_url text;
```

**This also settles `firebase-admin`: remove it.** Public reads over REST are
enough, and an admin SDK would mean holding a service account for a project
whose data is already open to read. Dead weight, not a half-finished plan.

### 4.7 Food: VisuFavor, an afternoon's import

Fourteen JPEGs in a git folder, captions and categories in `js/script.js` as a
plain array. Read the array, upload under `gallery/food/visufavor-<slug>/`,
insert one album and fourteen rows. No key, no API, no permission — the
repository is the export. The files stay in it untouched, so the live site keeps
working exactly as it does now.

Food is the genre where UNTAMED becomes the source of record, because VisuFavor
has no admin to protect: it is a static page, and a static page consuming
`/api/feed/food` is a strictly better arrangement than fourteen files nobody can
add to without a commit.

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
| **P3** | Sport mirror — scheduled Firestore REST read, upsert by slug | This repo only. No credential, no change to UNTMD Sports |
| **P4** | VisuFavor: import its fourteen files, then point it at the feed | This repo, then the VisuFavor repo |

P1 and P2 are useful on their own: bulk upload plus routing is worth having
even if the satellites are never wired up.

## 7 · What is needed before P1 starts

1. ~~Same Supabase project, or three?~~ **Answered in §2** — three stacks,
   two Supabase projects, one static site.
2. **Volume**: photographs per batch, and typical file size off the camera.
   This sets the upload concurrency and whether resumable uploads are needed.
3. ~~UNTMD Sports' admin panel — keep it, or retire it?~~ **Decided: kept.**
   Sport is mirrored read-only per §4.6, and nothing in that repository changes.
4. ~~A secret key for `vkpdkntxsqexcfaiehgx`.~~ **No longer needed.** Its
   Firestore collections are public-read and its photographs sit on public URLs,
   so the mirror runs with no credential at all. VisuFavor never needed one
   either.
5. **The Claude GitHub App is not installed on either satellite**, so this
   session can read them but cannot push. Only needed if the VisuFavor import
   should be made from here.

## 8 · Risks worth naming now

| Risk | Guard |
| --- | --- |
| Feed leaks a held-back gallery | Filter on `visibility` in the query; a test that asserts a `members` album never appears in any feed |
| A service-role key leaking | Never in the browser, never committed, rotate immediately after the import run |
| Import run twice, everything duplicated | The checksum unique index — that is what it is for |
| Batch dies halfway | Same resume path as `relocate()`: re-running finishes it |
| Storage cost | One copy under this design; two if we ever push instead of pull |
