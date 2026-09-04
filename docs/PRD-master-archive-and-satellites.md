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

## 2 · The one decision everything hangs on

**Are VisuFavor and UNTMD Sports the same Supabase project as this one, or
their own projects?** I cannot see them from this repository, and the answer
changes the whole shape:

| | Same project | Three projects |
| --- | --- | --- |
| Cross-site reads | RLS and a view; no keys move | Needs each project's service-role key |
| "Satellite sees only its genre" | Enforceable in the database | Enforceable only by whatever fetches for it |
| Storage billed | Once | Once per copy |
| Risk | Low | A key that can read and write everything, held by another app |

The rest of this proposal is written for **three separate projects**, because
that is what "the buckets on UNTAMED and VisuFavor both already have content"
implies. If they turn out to share one project, section 4.6 disappears and
section 4.5 gets simpler.

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

### 4.6 Pulling in what already lives on the satellites

A one-time script, `scripts/import-satellite.ts` — deliberately not a live
link:

- Takes that project's service-role key from the environment for the length of
  the run, and nowhere else.
- Lists its objects, downloads each, re-uploads under
  `gallery/<genre>/imported-<site>/…`.
- Inserts albums and photos with `source` set and `checksum` filled.
- **Idempotent**: re-running skips anything whose checksum is already present.
- **Deletes nothing on the satellite.** It reads and copies; that is all it is
  allowed to do.

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

1. **Same Supabase project, or three?** The project ref of each.
2. **Volume**: photographs per batch, and typical file size off the camera.
3. Do VisuFavor and UNTMD Sports have their own admin you want to keep, or
   should the master become the only place anything is filed?
4. For P4 only: a service-role key per satellite, and confirmation that
   nothing there gets deleted.

## 8 · Risks worth naming now

| Risk | Guard |
| --- | --- |
| Feed leaks a held-back gallery | Filter on `visibility` in the query; a test that asserts a `members` album never appears in any feed |
| A service-role key leaking | Never in the browser, never committed, rotate immediately after the import run |
| Import run twice, everything duplicated | The checksum unique index — that is what it is for |
| Batch dies halfway | Same resume path as `relocate()`: re-running finishes it |
| Storage cost | One copy under this design; two if we ever push instead of pull |
