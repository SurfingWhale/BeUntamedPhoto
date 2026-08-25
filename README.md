# UNTAMED — visual archive

Photographic portfolio for Muhammad Fauzy. Next.js 16 (App Router, Turbopack) +
Supabase (auth, Postgres, Storage), deployed on Vercel.

## What's here

| Route | What it is |
| --- | --- |
| `/` | Home — full-bleed photo folds with narrow text bands between them |
| `/work` | Gallery index. Held-back galleries are listed but locked |
| `/work/[slug]` | One gallery: plates + a notes thread, 24 to a page |
| `/about` | Who and how |
| `/elsewhere` | UNTMD Sports · VisuFavor · Surfing Whale |
| `/notes` | Global guestbook |
| `/enter` | Sign in · sign up · magic link · password reset |
| `/account` | Display name, password, sign out |
| `/darkroom` | Owner-only: file galleries, upload plates, set covers, delete |

## Auth and roles

- **The first account to sign up becomes the owner** (`profiles.role = 'owner'`).
  Everyone after is a visitor. Sign up before sharing the URL.
- Visitors can read public galleries, open held-back galleries, and leave notes.
- Only the owner sees `/darkroom` and can write to `albums`, `photos`, and Storage.

To promote someone later:

```sql
update public.profiles set role = 'owner' where id = '<uuid>';
```

## Storage

Two buckets, both created by `supabase/storage.sql`:

- `gallery` — public. Holds plates for `visibility = 'public'` albums.
- `gallery-private` — private. Holds plates for `visibility = 'members'` albums;
  served through one-hour signed URLs minted per request.

Uploads go browser → Storage directly (RLS enforces owner-only), four at a
time, then one server action records the whole batch. That sidesteps the
Server Action body-size limit and keeps a 100-plate upload to a single insert.

Each plate is stored twice: the original, and a ≤640px WebP thumbnail the
browser renders down at upload time. Index grids and the darkroom list request
the thumbnail — without it a gallery of 200 asks for 200 full-size originals.
Plates uploaded before this fall back to the original, so nothing breaks.

Changing an album's visibility **moves its files** into the matching bucket, in
batches of 60 per save. Before this, holding a gallery back left its plates in
the public bucket on unsigned URLs that never expire.

## Database

Applied in order:

```bash
psql "$POSTGRES_URL_NON_POOLING" -f supabase/schema.sql
psql "$POSTGRES_URL_NON_POOLING" -f supabase/storage.sql
psql "$POSTGRES_URL_NON_POOLING" -f supabase/seed.sql
psql "$POSTGRES_URL_NON_POOLING" -f supabase/rls-albums.sql
psql "$POSTGRES_URL_NON_POOLING" -f supabase/many-photos.sql
```

`many-photos.sql` adds the thumbnail column, the paging indexes, and the
`album_covers` view. It is safe to re-run, and existing installs need it —
without it the app queries a view that isn't there.

`seed.sql` also installs the first-account-is-owner rule and three starter
galleries — rename or delete them from `/darkroom`.

## Environment

Pulled from Vercel by the Supabase Marketplace integration:

```bash
vercel env pull
```

The running app needs only `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` — every write goes through RLS as the signed-in
user, so no service-role key is deployed. `POSTGRES_URL_NON_POOLING` is used
locally to apply the SQL files above.

## Design system

`tokens.css` is the single source of colour, type, space, and motion. Every
value in `src/app/globals.css` references a token by name. The stamp at the top
of both files records the macrostructure, theme, and archetypes; `.hallmark/log.json`
records the run so a later redesign picks a different shape.

## Develop

```bash
npm run dev
```
