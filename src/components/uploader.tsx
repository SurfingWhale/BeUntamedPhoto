"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { recordPhoto } from "@/app/darkroom/actions";
import { encodeToWebp, formatBytes } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";

type Props = {
  albumId: string;
  slug: string;
  bucket: "gallery" | "gallery-private";
  startPosition: number;
};

/** One chosen file, already re-encoded, waiting to be published. */
type Staged = {
  key: string;
  name: string;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  rawBytes: number;
  ext: string;
  caption: string;
  /** Set when the original was kept, with the reason why. */
  kept: string | null;
};

type Status =
  | { kind: "idle" }
  | { kind: "encoding"; done: number; total: number }
  | { kind: "uploading"; done: number; total: number }
  | { kind: "error"; message: string }
  | { kind: "ok"; message: string };

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
/* The cap is on what the browser reads, not on what reaches the bucket: every
 * file is re-encoded to WebP before it is uploaded. */
const MAX_BYTES = 60 * 1024 * 1024;

/**
 * How many plates upload at once.
 *
 * Four, not one and not all of them. Sequential cost a full round trip per
 * plate — one upload plus one server action — so a batch of 200 spent 400
 * waits end to end. Unbounded is the other mistake: a hundred parallel
 * uploads on a phone gets throttled, and the refusals come back as failures
 * rather than as queueing.
 *
 * Encoding stays sequential on purpose — see the loop in onChoose. That work
 * is canvas memory, not network, and running it in parallel is what kills a
 * tab on iOS.
 */
const UPLOAD_LANES = 4;

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

/**
 * Choosing files no longer publishes them.
 *
 * The old flow went straight from the file picker to the bucket: one shared
 * caption for the batch, order fixed by whatever the picker returned, and the
 * only edit afterwards was "make cover" or "remove". A set could not be
 * composed, which is what a photo essay actually is.
 *
 * Now the files are re-encoded on selection — so the preview is the WebP that
 * will be stored, and the saving is visible before anything is committed —
 * and staged locally. Order and per-plate captions are settled here, and
 * nothing reaches storage until Publish.
 */
export function Uploader({ albumId, slug, bucket, startPosition }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<Staged[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [place, setPlace] = useState("");
  const [takenOn, setTakenOn] = useState("");

  /* Object URLs are a manual allocation and nothing frees them for you.
   * drop() and publish() release the ones they consume; this covers the last
   * case, a component that goes away with plates still staged. The ref is
   * written from an effect rather than during render — a render-phase ref
   * write is what react-hooks/refs exists to catch. */
  const stagedRef = useRef<Staged[]>([]);
  useEffect(() => {
    stagedRef.current = staged;
  }, [staged]);
  useEffect(
    () => () => stagedRef.current.forEach((s) => URL.revokeObjectURL(s.previewUrl)),
    [],
  );

  const onChoose = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((f) => f.size > 0);
    if (files.length === 0) return;

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

    setStatus({ kind: "encoding", done: 0, total: files.length });
    const next: Staged[] = [];
    for (const [i, file] of files.entries()) {
      setStatus({ kind: "encoding", done: i, total: files.length });
      const { blob, width, height, ext, passthrough, reason } = await encodeToWebp(file);
      next.push({
        kept: passthrough ? (reason ?? "kept as-is") : null,
        key: `${file.name}-${Date.now()}-${i}`,
        name: file.name,
        blob,
        previewUrl: URL.createObjectURL(blob),
        width,
        height,
        rawBytes: file.size,
        ext,
        caption: "",
      });
    }
    setStaged((prev) => [...prev, ...next]);
    setStatus({ kind: "idle" });
    // Let the same file be chosen again after it is removed from the stage.
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  function move(index: number, dir: -1 | 1) {
    setStaged((prev) => {
      const to = index + dir;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  function drop(index: number) {
    setStaged((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function setCaption(index: number, caption: string) {
    setStaged((prev) => prev.map((s, i) => (i === index ? { ...s, caption } : s)));
  }

  /** Publish one staged plate. Its position comes from where it sits on the
   * stage, so the published order is the composed order no matter which lane
   * finishes first. */
  async function publishOne(
    supabase: ReturnType<typeof createClient>,
    item: Staged,
    index: number,
  ): Promise<string | null> {
    const path = `${slug}/${safeName(item.name, item.ext)}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, item.blob, {
        cacheControl: "31536000",
        contentType: item.blob.type,
      });
    if (uploadError) return uploadError.message;

    const result = await recordPhoto({
      albumId,
      slug,
      bucket,
      path,
      caption: item.caption.trim() || null,
      place: place.trim() || null,
      takenOn: takenOn.trim() || null,
      width: item.width || null,
      height: item.height || null,
      // The staged order is the published order.
      position: startPosition + index,
    });

    if (result.status === "error") {
      // The row is what makes a file a plate. Without one the object is
      // unreachable litter, so it goes back out.
      await supabase.storage.from(bucket).remove([path]);
      return result.message;
    }
    return null;
  }

  async function publish() {
    if (staged.length === 0) return;
    const supabase = createClient();
    const batch = staged;
    setStatus({ kind: "uploading", done: 0, total: batch.length });

    /* One plate failing no longer abandons the rest.
     *
     * It used to return on the first error, which left the plates before it
     * published, the plates after it never attempted, and one message on
     * screen that said nothing about either. Now every plate is attempted, the
     * failures stay on the stage, and pressing publish again retries only
     * those. */
    const failed: { item: Staged; message: string }[] = [];
    let done = 0;

    const queue = batch.map((item, index) => ({ item, index }));
    const lanes = Array.from(
      { length: Math.min(UPLOAD_LANES, queue.length) },
      async () => {
        for (;;) {
          const job = queue.shift();
          if (!job) return;
          const message = await publishOne(supabase, job.item, job.index);
          if (message) failed.push({ item: job.item, message });
          done += 1;
          setStatus({ kind: "uploading", done, total: batch.length });
        }
      },
    );
    await Promise.all(lanes);

    const published = batch.filter((b) => !failed.some((f) => f.item.key === b.key));
    published.forEach((sp) => URL.revokeObjectURL(sp.previewUrl));
    setStaged(failed.map((f) => f.item));

    if (published.length === 0) {
      setStatus({
        kind: "error",
        message: `Nothing published — ${failed[0].item.name}: ${failed[0].message}`,
      });
      return;
    }

    const rawBytes = published.reduce((n, sp) => n + sp.rawBytes, 0);
    const storedBytes = published.reduce((n, sp) => n + sp.blob.size, 0);
    const count = published.length;
    if (failed.length === 0) {
      setPlace("");
      setTakenOn("");
    }
    const saved = Math.round(((rawBytes - storedBytes) / Math.max(rawBytes, 1)) * 100);
    // Naming the reason matters more than the percentage: "0% smaller" with no
    // explanation is how a batch of 82 MB originals got published unnoticed.
    const kept = published.filter((sp) => sp.kept);
    const why = kept.length
      ? ` ${kept.length} kept as ${kept.length === 1 ? "an original" : "originals"} — ${kept[0].kept}.`
      : "";
    const summary =
      `${count} ${count === 1 ? "plate" : "plates"} published — ` +
      `${formatBytes(rawBytes)} stored as ${formatBytes(storedBytes)} (${saved}% smaller).` +
      why;

    /* A partial batch reports as an error, not as a success with a footnote:
     * plates are still sitting on the stage and someone has to press publish
     * again. */
    setStatus(
      failed.length > 0
        ? {
            kind: "error",
            message:
              `${summary} ${failed.length} still on the stage — ` +
              `${failed[0].item.name}: ${failed[0].message}. Publish again to retry those.`,
          }
        : { kind: "ok", message: summary },
    );
    router.refresh();
  }

  const busy = status.kind === "encoding" || status.kind === "uploading";
  const totalRaw = staged.reduce((n, s) => n + s.rawBytes, 0);
  const totalOut = staged.reduce((n, s) => n + s.blob.size, 0);

  return (
    <div className="auth__form">
      <div className="field">
        <label className="field__label" htmlFor="files">
          Images
        </label>
        <input
          className="field__file"
          ref={fileRef}
          id="files"
          name="files"
          type="file"
          accept={ALLOWED.join(",")}
          multiple
          disabled={busy}
          onChange={onChoose}
          aria-describedby="files-help"
        />
        <p className="field__help" id="files-help">
          JPEG, PNG, WebP or AVIF · up to 60 MB each. Re-encoded to WebP at
          2400px and stripped of EXIF as soon as you choose them. Nothing
          reaches {bucket === "gallery" ? "the open bucket" : "the private bucket"}{" "}
          until you publish.
        </p>
      </div>

      {staged.length > 0 && (
        <>
          <div className="stage" role="list" aria-label="Plates waiting to publish">
            {staged.map((item, i) => (
              <div className="stage__item" role="listitem" key={item.key}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="stage__thumb" src={item.previewUrl} alt="" />

                <div className="stage__body">
                  <p className="stage__no u-tabular">
                    {String(i + 1).padStart(2, "0")}
                    <span className="u-muted">
                      {" · "}
                      {item.kept
                        ? `${formatBytes(item.blob.size)} — original kept, ${item.kept}`
                        : `${formatBytes(item.rawBytes)} → ${formatBytes(item.blob.size)}`}
                    </span>
                  </p>
                  <label className="u-sr" htmlFor={`cap-${item.key}`}>
                    Caption for plate {i + 1}
                  </label>
                  <input
                    className="field__input"
                    id={`cap-${item.key}`}
                    value={item.caption}
                    disabled={busy}
                    placeholder="Caption — optional"
                    onChange={(e) => setCaption(i, e.target.value)}
                  />
                </div>

                <div className="stage__acts">
                  <button
                    className="tog plates__arrow"
                    type="button"
                    disabled={busy || i === 0}
                    onClick={() => move(i, -1)}
                    aria-label={`Move plate ${i + 1} earlier`}
                  >
                    ↑
                  </button>
                  <button
                    className="tog plates__arrow"
                    type="button"
                    disabled={busy || i === staged.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label={`Move plate ${i + 1} later`}
                  >
                    ↓
                  </button>
                  <button
                    className="note__del"
                    type="button"
                    disabled={busy}
                    onClick={() => drop(i)}
                    aria-label={`Remove plate ${i + 1} from this batch`}
                  >
                    remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="prog">
            {staged.length} staged · {formatBytes(totalRaw)} chosen, {formatBytes(totalOut)} to
            upload
          </p>
        </>
      )}

      <div className="row2">
        <div className="field">
          <label className="field__label" htmlFor="photo-place">
            Place
          </label>
          <input
            className="field__input"
            id="photo-place"
            value={place}
            disabled={busy}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Bintaro"
            aria-describedby="place-help"
          />
          <p className="field__help" id="place-help">
            Applies to every plate in this batch.
          </p>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="taken_on">
            Taken on
          </label>
          <input
            className="field__input"
            id="taken_on"
            type="date"
            value={takenOn}
            disabled={busy}
            onChange={(e) => setTakenOn(e.target.value)}
          />
          <p className="field__help" />
        </div>
      </div>

      <div>
        <button
          className="btn"
          type="button"
          onClick={publish}
          disabled={busy || staged.length === 0}
          aria-disabled={busy || staged.length === 0}
        >
          {busy && <span className="btn__spin" aria-hidden="true" />}
          Publish
        </button>
      </div>

      <p className="prog" aria-live="polite">
        {status.kind === "encoding" &&
          `Re-encoding ${status.done + 1} of ${status.total} to WebP…`}
        {status.kind === "uploading" &&
          `Publishing ${status.done + 1} of ${status.total}…`}
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
    </div>
  );
}
