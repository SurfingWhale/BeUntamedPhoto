"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { recordPhoto } from "@/app/darkroom/actions";
import { encodeToWebp, formatBytes } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";

type Props = {
  albumId: string;
  slug: string;
  bucket: "gallery" | "gallery-private";
  startPosition: number;
};

type Status =
  | { kind: "idle" }
  | { kind: "working"; stage: "encoding" | "uploading"; done: number; total: number }
  | { kind: "error"; message: string }
  | { kind: "ok"; message: string };

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
/* The cap is on what the browser reads, not on what reaches the bucket: every
 * file is re-encoded to WebP before it is uploaded. */
const MAX_BYTES = 60 * 1024 * 1024;

function safeName(name: string, ext: string) {
  const dot = name.includes(".") ? name.lastIndexOf(".") : name.length;
  const stem = name
    .slice(0, dot)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "plate";
  return `${stem}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}${ext}`;
}

export function Uploader({ albumId, slug, bucket, startPosition }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const files = data.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      setStatus({ kind: "error", message: "Pick at least one image." });
      return;
    }

    const bad = files.find((f) => !ALLOWED.includes(f.type) || f.size > MAX_BYTES);
    if (bad) {
      setStatus({
        kind: "error",
        message: !ALLOWED.includes(bad.type)
          ? `${bad.name} is a ${bad.type || "unknown"} — use JPEG, PNG, WebP or AVIF.`
          : `${bad.name} is over the 60 MB limit.`,
      });
      return;
    }

    const caption = String(data.get("caption") ?? "").trim() || null;
    const place = String(data.get("place") ?? "").trim() || null;
    const takenOn = String(data.get("taken_on") ?? "").trim() || null;

    const supabase = createClient();
    setStatus({ kind: "working", stage: "encoding", done: 0, total: files.length });

    let rawBytes = 0;
    let storedBytes = 0;

    for (const [i, file] of files.entries()) {
      setStatus({ kind: "working", stage: "encoding", done: i, total: files.length });

      // Re-encode first: the bucket only ever sees the WebP, and the encoder
      // hands back the output dimensions, so nothing decodes the image twice.
      const { blob, width, height, ext } = await encodeToWebp(file);
      rawBytes += file.size;
      storedBytes += blob.size;

      const path = `${slug}/${safeName(file.name, ext)}`;

      setStatus({ kind: "working", stage: "uploading", done: i, total: files.length });
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, blob, { cacheControl: "31536000", contentType: blob.type });

      if (uploadError) {
        setStatus({ kind: "error", message: `${file.name} — ${uploadError.message}` });
        return;
      }

      const result = await recordPhoto({
        albumId,
        slug,
        bucket,
        path,
        caption,
        place,
        takenOn,
        width: width || null,
        height: height || null,
        position: startPosition + i,
      });

      if (result.status === "error") {
        await supabase.storage.from(bucket).remove([path]);
        setStatus({ kind: "error", message: result.message });
        return;
      }

      setStatus({ kind: "working", stage: "uploading", done: i + 1, total: files.length });
    }

    const saved = rawBytes - storedBytes;
    formRef.current?.reset();
    setStatus({
      kind: "ok",
      message:
        `${files.length} ${files.length === 1 ? "plate" : "plates"} added — ` +
        `${formatBytes(rawBytes)} of originals stored as ${formatBytes(storedBytes)} ` +
        `(${Math.round((saved / Math.max(rawBytes, 1)) * 100)}% smaller).`,
    });
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
          aria-describedby="files-help"
        />
        <p className="field__help" id="files-help">
          JPEG, PNG, WebP or AVIF · up to 60 MB each. Re-encoded to WebP at
          2400px and stripped of EXIF before upload, so{" "}
          {bucket === "gallery" ? "the open bucket" : "the private bucket"} never
          holds the original.
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
          <input className="field__input" id="photo-place" name="place" placeholder="Bintaro" />
          <p className="field__help" />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="taken_on">
            Taken on
          </label>
          <input className="field__input" id="taken_on" name="taken_on" type="date" />
          <p className="field__help" />
        </div>
      </div>

      <div>
        <button className="btn" type="submit" disabled={working} aria-disabled={working}>
          {working && <span className="btn__spin" aria-hidden="true" />}
          {working
            ? `${status.stage === "encoding" ? "Compressing" : "Uploading"} ${status.done + 1}/${status.total}`
            : "Upload"}
        </button>
      </div>

      <p className="prog" aria-live="polite">
        {status.kind === "working" &&
          (status.stage === "encoding"
            ? `Re-encoding ${status.done + 1} of ${status.total} to WebP…`
            : `${status.done} of ${status.total} filed…`)}
      </p>

      {status.kind === "error" && (
        <p className="form-note" data-tone="error" role="alert">
          {status.message}
        </p>
      )}
      {status.kind === "ok" && (
        <p className="form-note" role="status">
          {status.message}
        </p>
      )}
    </form>
  );
}
