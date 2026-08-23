"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { recordPhoto } from "@/app/darkroom/actions";
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
  | { kind: "ok"; message: string };

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 25 * 1024 * 1024;

/** Reads intrinsic dimensions so the page can reserve space and avoid CLS. */
function measure(file: File): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: null, height: null });
    };
    img.src = url;
  });
}

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
          : `${bad.name} is over the 25 MB limit.`,
      });
      return;
    }

    const caption = String(data.get("caption") ?? "").trim() || null;
    const place = String(data.get("place") ?? "").trim() || null;
    const takenOn = String(data.get("taken_on") ?? "").trim() || null;

    const supabase = createClient();
    setStatus({ kind: "working", done: 0, total: files.length });

    for (const [i, file] of files.entries()) {
      const path = `${slug}/${safeName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: "31536000", contentType: file.type });

      if (uploadError) {
        setStatus({ kind: "error", message: `${file.name} — ${uploadError.message}` });
        return;
      }

      const { width, height } = await measure(file);
      const result = await recordPhoto({
        albumId,
        slug,
        bucket,
        path,
        caption: files.length === 1 ? caption : caption,
        place,
        takenOn,
        width,
        height,
        position: startPosition + i,
      });

      if (result.status === "error") {
        await supabase.storage.from(bucket).remove([path]);
        setStatus({ kind: "error", message: result.message });
        return;
      }

      setStatus({ kind: "working", done: i + 1, total: files.length });
    }

    formRef.current?.reset();
    setStatus({
      kind: "ok",
      message: `${files.length} ${files.length === 1 ? "plate" : "plates"} added.`,
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
          JPEG, PNG, WebP or AVIF · up to 25 MB each · uploaded to{" "}
          {bucket === "gallery" ? "the open bucket" : "the private bucket"}.
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
        <p className="form-note" role="status">
          {status.message}
        </p>
      )}
    </form>
  );
}
