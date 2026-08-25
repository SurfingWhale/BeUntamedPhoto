"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { recordPhotos, type PhotoInput } from "@/app/darkroom/actions";
import { createClient } from "@/lib/supabase/client";

type Props = {
  albumId: string;
  slug: string;
  bucket: "gallery" | "gallery-private";
  startPosition: number;
};

type Status =
  | { kind: "idle" }
  | { kind: "working"; done: number; total: number }
  | { kind: "error"; message: string }
  | { kind: "ok"; message: string; failures: string[] };

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 25 * 1024 * 1024;

/** Matches recordPhotos' own cap, so the batch never bounces off the server. */
const MAX_FILES = 200;

/** Parallel uploads. Enough to saturate a connection, few enough to be fair. */
const LANES = 4;

/** Longest edge of the stored thumbnail, in pixels. */
const THUMB_EDGE = 640;

function safeName(name: string) {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : ".jpg";
  const stem = name
    .slice(0, name.length - ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "plate";
  return `${stem}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}${ext}`;
}

type Decoded = {
  width: number | null;
  height: number | null;
  thumb: Blob | null;
};

/**
 * Decodes the file once to get both its intrinsic size — the page reserves
 * space with it, so nothing jumps as plates load — and a downscaled WebP.
 * The thumbnail is what index grids and the darkroom list actually request;
 * without it a gallery of 200 asks the browser for 200 full-size originals.
 */
async function decode(file: File): Promise<Decoded> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return { width: null, height: null, thumb: null };

  const { width, height } = bitmap;
  const scale = Math.min(1, THUMB_EDGE / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  let thumb: Blob | null = null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0, w, h);
      thumb = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.82),
      );
    }
  } catch {
    thumb = null; // A thumbnail is an optimisation; the plate still uploads.
  }

  bitmap.close();
  return { width, height, thumb };
}

/** Runs `job` over the list, `lanes` at a time, preserving result order. */
async function pooled<T, R>(
  items: T[],
  lanes: number,
  job: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let cursor = 0;

  await Promise.all(
    Array.from({ length: Math.min(lanes, items.length) }, async () => {
      for (;;) {
        const i = cursor++;
        if (i >= items.length) return;
        out[i] = await job(items[i], i);
      }
    }),
  );

  return out;
}

type Outcome =
  | { ok: true; photo: PhotoInput }
  | { ok: false; name: string; message: string };

export function Uploader({ albumId, slug, bucket, startPosition }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const files = data.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      setStatus({ kind: "error", message: "Pick at least one image." });
      return;
    }
    if (files.length > MAX_FILES) {
      setStatus({
        kind: "error",
        message: `That's ${files.length} files. Upload at most ${MAX_FILES} at a time.`,
      });
      return;
    }

    const bad = files.find((f) => !ALLOWED.includes(f.type) || f.size > MAX_BYTES);
    if (bad) {
      setStatus({
        kind: "error",
        message: !ALLOWED.includes(bad.type)
          ? `${bad.name} is a ${bad.type || "unknown"} — use JPEG, PNG, WebP or AVIF.`
          : `${bad.name} is over the 25 MB limit.`,
      });
      return;
    }

    const caption = String(data.get("caption") ?? "").trim() || null;
    const place = String(data.get("place") ?? "").trim() || null;
    const takenOn = String(data.get("taken_on") ?? "").trim() || null;

    const supabase = createClient();
    let done = 0;
    setStatus({ kind: "working", done: 0, total: files.length });

    const results = await pooled<File, Outcome>(files, LANES, async (file, i) => {
      const finish = <T extends Outcome>(outcome: T) => {
        done += 1;
        setStatus({ kind: "working", done, total: files.length });
        return outcome;
      };

      const path = `${slug}/${safeName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: "31536000", contentType: file.type });

      if (uploadError) {
        return finish({ ok: false, name: file.name, message: uploadError.message });
      }

      const { width, height, thumb } = await decode(file);

      let thumbPath: string | null = null;
      if (thumb) {
        const candidate = `${slug}/thumb-${safeName(`${file.name}.webp`)}`;
        const { error: thumbError } = await supabase.storage
          .from(bucket)
          .upload(candidate, thumb, {
            cacheControl: "31536000",
            contentType: "image/webp",
          });
        // A missing thumbnail is survivable — withUrls falls back to the plate.
        if (!thumbError) thumbPath = candidate;
      }

      return finish({
        ok: true,
        photo: {
          bucket,
          path,
          thumbPath,
          caption,
          place,
          takenOn,
          width,
          height,
          position: startPosition + i,
        },
      });
    });

    const uploaded = results.filter((r): r is Extract<Outcome, { ok: true }> => r.ok);
    const failures = results
      .filter((r): r is Extract<Outcome, { ok: false }> => !r.ok)
      .map((r) => `${r.name} — ${r.message}`);

    if (uploaded.length === 0) {
      setStatus({
        kind: "error",
        message: failures[0] ?? "Nothing uploaded.",
      });
      return;
    }

    const recorded = await recordPhotos({
      albumId,
      slug,
      photos: uploaded.map((r) => r.photo),
    });

    if (recorded.status === "error") {
      // Nothing was filed, so take the orphaned files back out of Storage.
      const orphans = uploaded.flatMap((r) =>
        r.photo.thumbPath ? [r.photo.path, r.photo.thumbPath] : [r.photo.path],
      );
      await supabase.storage.from(bucket).remove(orphans);
      setStatus({ kind: "error", message: recorded.message });
      return;
    }

    formRef.current?.reset();
    setStatus({ kind: "ok", message: recorded.message, failures });
    router.refresh();
  }

  const working = status.kind === "working";

  return (
    <form className="auth__form" ref={formRef} onSubmit={onSubmit}>
      <div className="field">
        <label className="field__label" htmlFor="files">
          Images
        </label>
        <input
          className="field__file"
          id="files"
          name="files"
          type="file"
          accept={ALLOWED.join(",")}
          multiple
          required
          disabled={working}
          aria-describedby="files-help"
        />
        <p className="field__help" id="files-help">
          JPEG, PNG, WebP or AVIF · up to 25 MB each · {MAX_FILES} at a time ·
          uploaded to {bucket === "gallery" ? "the open bucket" : "the private bucket"}.
        </p>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="caption">
          Caption
        </label>
        <input
          className="field__input"
          id="caption"
          name="caption"
          placeholder="scored before the proof"
          disabled={working}
          aria-describedby="caption-help"
        />
        <p className="field__help" id="caption-help">
          Applied to every image in this batch. Edit individually later.
        </p>
      </div>

      <div className="row2">
        <div className="field">
          <label className="field__label" htmlFor="photo-place">
            Place
          </label>
          <input
            className="field__input"
            id="photo-place"
            name="place"
            placeholder="Bintaro"
            disabled={working}
          />
          <p className="field__help" />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="taken_on">
            Taken on
          </label>
          <input
            className="field__input"
            id="taken_on"
            name="taken_on"
            type="date"
            disabled={working}
          />
          <p className="field__help" />
        </div>
      </div>

      <div>
        <button className="btn" type="submit" disabled={working} aria-disabled={working}>
          {working && <span className="btn__spin" aria-hidden="true" />}
          {working ? `Uploading ${status.done}/${status.total}` : "Upload"}
        </button>
      </div>

      <p className="prog" aria-live="polite">
        {status.kind === "working" && `${status.done} of ${status.total} filed…`}
      </p>

      {status.kind === "error" && (
        <p className="form-note" data-tone="error" role="alert">
          {status.message}
        </p>
      )}
      {status.kind === "ok" && (
        <>
          <p className="form-note" role="status">
            {status.message}
          </p>
          {status.failures.length > 0 && (
            <p className="form-note" data-tone="error" role="alert">
              {status.failures.length} skipped: {status.failures.join(" · ")}
            </p>
          )}
        </>
      )}
    </form>
  );
}
