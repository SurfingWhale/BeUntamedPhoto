"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { swapPlateFile } from "@/app/darkroom/actions";
import { encodeToWebp, formatBytes } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import type { PhotoWithUrl } from "@/lib/gallery";

type State =
  | { kind: "idle" }
  | { kind: "working"; done: number; total: number; saved: number }
  | { kind: "done"; count: number; before: number; after: number; failed: number }
  | { kind: "error"; message: string };

/**
 * Re-encode plates that were stored before the encoder worked.
 *
 * It runs here rather than as a script because that is the cheapest correct
 * permission model: the owner is already signed in, the storage policies
 * already allow them to write, and every step is visible. No service key
 * leaves the server.
 *
 * Per plate: fetch the stored original, run it through the same encoder the
 * uploader uses, upload under a new path, point the row at it, delete the old
 * object. Upload first and delete last, so an interruption leaves the row
 * naming a file that exists.
 */
export function Reencode({ photos }: { photos: PhotoWithUrl[] }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "idle" });

  async function run() {
    const supabase = createClient();
    setState({ kind: "working", done: 0, total: photos.length, saved: 0 });

    let before = 0;
    let after = 0;
    let failed = 0;

    for (const [i, photo] of photos.entries()) {
      setState({ kind: "working", done: i, total: photos.length, saved: before - after });
      try {
        // The stored object, not the resized render — this is the file being
        // replaced, so it has to be read at full size once.
        const origin = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
        const src =
          photo.bucket === "gallery"
            ? `${origin}/storage/v1/object/public/gallery/${photo.path}`
            : photo.url;
        if (!src) { failed += 1; continue; }

        const res = await fetch(src);
        if (!res.ok) { failed += 1; continue; }
        const raw = await res.blob();
        const file = new File([raw], photo.path.split("/").pop() ?? "plate.jpg", {
          type: raw.type || "image/jpeg",
        });

        const { blob, width, height, ext, passthrough } = await encodeToWebp(file);
        if (passthrough) { failed += 1; continue; }

        const stem = photo.path.replace(/\.[^.]+$/, "");
        const newPath = `${stem}-r${Date.now().toString(36)}${ext}`;

        const { error: upErr } = await supabase.storage
          .from(photo.bucket)
          .upload(newPath, blob, { cacheControl: "31536000", contentType: blob.type });
        if (upErr) { failed += 1; continue; }

        const result = await swapPlateFile({
          id: photo.id,
          newPath,
          oldPath: photo.path,
          bucket: photo.bucket,
          width: width || null,
          height: height || null,
        });
        if (result.status === "error") {
          // The row still points at the old file, so drop the copy we made.
          await supabase.storage.from(photo.bucket).remove([newPath]);
          failed += 1;
          continue;
        }

        before += raw.size;
        after += blob.size;
      } catch {
        failed += 1;
      }
    }

    setState({ kind: "done", count: photos.length - failed, before, after, failed });
    router.refresh();
  }

  if (photos.length === 0) {
    return <p className="field__help">Every plate is already stored at a sane size.</p>;
  }

  const working = state.kind === "working";

  return (
    <>
      <p className="field__help">
        {photos.length} {photos.length === 1 ? "plate is" : "plates are"} stored as an
        oversized original. Re-encoding replaces the stored file; the pictures on
        the site are unchanged, since those are already resized on the way out.
      </p>

      <div>
        <button
          className="btn btn--quiet"
          type="button"
          onClick={run}
          disabled={working}
          aria-disabled={working}
        >
          {working && <span className="btn__spin" aria-hidden="true" />}
          Re-encode {photos.length} {photos.length === 1 ? "plate" : "plates"}
        </button>
      </div>

      <p className="prog" aria-live="polite">
        {state.kind === "working" &&
          `Re-encoding ${state.done + 1} of ${state.total}… ${formatBytes(Math.max(0, state.saved))} saved so far`}
        {state.kind === "done" &&
          `${state.count} replaced — ${formatBytes(state.before)} is now ${formatBytes(state.after)}` +
            (state.before
              ? ` (${Math.round(((state.before - state.after) / state.before) * 100)}% smaller).`
              : ".") +
            (state.failed ? ` ${state.failed} skipped.` : "")}
      </p>

      {state.kind === "error" && (
        <p className="form-note" data-tone="error" role="alert">
          {state.message}
        </p>
      )}
    </>
  );
}
