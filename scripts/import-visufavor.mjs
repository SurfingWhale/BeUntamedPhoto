/**
 * One-time import: VisuFavor's photographs into this archive.
 *
 * Reads the manifest VisuFavor publishes, copies each file into the public
 * gallery bucket, and files the rows under one album. It is safe to run more
 * than once: a plate whose storage path is already recorded is skipped, so a
 * run that dies half way is finished by running it again.
 *
 * It never deletes anything, here or there. VisuFavor keeps its own copies.
 *
 *   node scripts/import-visufavor.mjs [--dry-run] [manifest-url]
 *
 * Needs, in the environment:
 *   NEXT_PUBLIC_SUPABASE_URL     this project's URL
 *   SUPABASE_SECRET_KEY          a secret / service-role key, server-side only
 *
 * The secret key bypasses RLS. That is the whole reason this is a script you
 * run rather than a page in the darkroom.
 */
import { createClient } from "@supabase/supabase-js";

const DEFAULT_MANIFEST = "https://visufavor.vercel.app/export.json";
const BUCKET = "gallery";
const ALBUM = {
  slug: "visufavor",
  title: "VisuFavor",
  subtitle: "Food and product work, shot for the kitchens that serve it.",
  genre: "food",
  visibility: "public",
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const manifestUrl = args.find((a) => !a.startsWith("--")) ?? DEFAULT_MANIFEST;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing credentials.\n" +
      "  NEXT_PUBLIC_SUPABASE_URL  = this project's URL\n" +
      "  SUPABASE_SECRET_KEY       = Settings -> API Keys -> secret key (sb_secret_...)\n" +
      "The publishable key will not do: it cannot write past RLS.",
  );
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

/** Storage path for a plate. Deterministic, which is what makes a re-run safe. */
const pathFor = (slug, src) => {
  const ext = (new URL(src).pathname.match(/\.[a-z0-9]+$/i) ?? [".jpg"])[0];
  return `food/visufavor/${slug}${ext.toLowerCase()}`;
};

async function main() {
  console.log(`Manifest : ${manifestUrl}`);
  console.log(`Project  : ${url}`);
  console.log(dryRun ? "Mode     : DRY RUN — nothing is written\n" : "Mode     : writing\n");

  const res = await fetch(manifestUrl);
  if (!res.ok) throw new Error(`Manifest returned ${res.status} ${res.statusText}`);
  const manifest = await res.json();

  const photos = Array.isArray(manifest.photos) ? manifest.photos : null;
  if (!photos) throw new Error("Manifest has no `photos` array.");

  // Checked here rather than trusted: a missing width means every consumer
  // has to guess the shape, which is the crop this whole exercise is about.
  const bad = photos.filter(
    (p) => !p.slug || !p.src || typeof p.width !== "number" || typeof p.height !== "number",
  );
  if (bad.length > 0) {
    throw new Error(
      `${bad.length} entr${bad.length === 1 ? "y is" : "ies are"} missing slug, src, width or height — ` +
        `first is ${JSON.stringify(bad[0]).slice(0, 120)}`,
    );
  }
  console.log(`${photos.length} photographs in the manifest.`);

  // ---- the album
  let { data: album } = await db.from("albums").select("*").eq("slug", ALBUM.slug).maybeSingle();
  if (!album) {
    if (dryRun) {
      console.log(`Would create album "${ALBUM.slug}".`);
      album = { id: "(dry-run)", ...ALBUM };
    } else {
      const { data, error } = await db.from("albums").insert(ALBUM).select().single();
      if (error) throw new Error(`Creating the album failed: ${error.message}`);
      album = data;
      console.log(`Created album "${album.slug}".`);
    }
  } else {
    console.log(`Album "${album.slug}" already exists — filing into it.`);
  }

  // ---- what is already here
  const { data: existing } = await db
    .from("photos")
    .select("path")
    .eq("album_id", album.id);
  const have = new Set((existing ?? []).map((r) => r.path));

  let added = 0, skipped = 0, position = 0;
  const failed = [];

  for (const photo of photos) {
    const path = pathFor(photo.slug, photo.src);
    position += 1;

    if (have.has(path)) {
      skipped += 1;
      console.log(`  skip  ${photo.slug} — already filed`);
      continue;
    }
    if (dryRun) {
      added += 1;
      console.log(`  would add  ${photo.slug} -> ${path}`);
      continue;
    }

    try {
      const file = await fetch(photo.src);
      if (!file.ok) throw new Error(`source returned ${file.status}`);
      const body = Buffer.from(await file.arrayBuffer());

      const { error: upErr } = await db.storage.from(BUCKET).upload(path, body, {
        contentType: file.headers.get("content-type") ?? "image/jpeg",
        upsert: true,
      });
      if (upErr) throw new Error(`upload: ${upErr.message}`);

      // The row goes in after the file, never before: a row pointing at a file
      // that is not there renders as a hole on the public page.
      const { error: rowErr } = await db.from("photos").insert({
        album_id: album.id,
        bucket: BUCKET,
        path,
        caption: photo.title ?? null,
        width: photo.width,
        height: photo.height,
        position,
      });
      if (rowErr) throw new Error(`row: ${rowErr.message}`);

      added += 1;
      console.log(`  added ${photo.slug} -> ${path}`);
    } catch (e) {
      failed.push([photo.slug, e.message]);
      console.log(`  FAIL  ${photo.slug} — ${e.message}`);
    }
  }

  console.log(`\n${added} added, ${skipped} already present, ${failed.length} failed.`);
  if (failed.length > 0) {
    console.log("Run again to retry only what failed — what succeeded is skipped.");
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(`\n${e.message}`);
  process.exit(1);
});
