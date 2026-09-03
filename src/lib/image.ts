/**
 * Client-side re-encode, so the bucket never holds a raw camera file.
 *
 * A 6000px JPEG straight off a body is 8–15 MB. Nothing on this site renders
 * wider than the 1440px measure, so storing the original pays for resolution
 * no visitor will ever see. Everything is decoded, capped at MAX_EDGE on its
 * long side and re-encoded to WebP in the browser — the upload that leaves the
 * machine is typically 3–6% of what came off the card.
 *
 * Two things fall out of this for free: EXIF is dropped by the canvas, so GPS
 * coordinates never reach the bucket, and orientation is baked into the pixels
 * rather than left as a tag a renderer may ignore.
 */

/** Long edge in CSS pixels. 2400 covers the 1440px measure at 2× DPR. */
const MAX_EDGE = 2400;
const QUALITY = 0.82;

/* A canvas that failed to draw still encodes — as a few hundred bytes of flat
 * colour. iOS Safari does exactly this when an image exceeds its canvas memory
 * budget, and it does it silently, so the only signal is the size. Anything
 * this small from a real photograph is a blank, not a compression win. */
const BLANK_BYTES = 4096;

export type Encoded = {
  blob: Blob;
  /** Dimensions of `blob`, whichever branch produced it. */
  width: number;
  height: number;
  /** File extension matching `blob`'s real type. */
  ext: string;
  /** True when the original was kept because re-encoding gained nothing. */
  passthrough: boolean;
};

function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot).toLowerCase() : ".jpg";
}

function draw(
  bitmap: ImageBitmap,
  width: number,
  height: number,
): Promise<Blob | null> {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.resolve(null);
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas
      .convertToBlob({ type: "image/webp", quality: QUALITY })
      .catch(() => null);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", QUALITY),
  );
}

export async function encodeToWebp(file: File): Promise<Encoded> {
  /* An already-small WebP is left alone. Re-encoding one is lossy a second
   * time, and the size check below cannot catch that — a degraded file is
   * usually smaller, so it would look like a win. */
  if (file.type === "image/webp" && file.size <= 600 * 1024) {
    const probe = await createImageBitmap(file).catch(() => null);
    const fits = probe ? Math.max(probe.width, probe.height) <= MAX_EDGE : false;
    const size = probe ? { w: probe.width, h: probe.height } : { w: 0, h: 0 };
    probe?.close();
    if (fits) {
      return { blob: file, width: size.w, height: size.h, ext: ".webp", passthrough: true };
    }
  }

  // imageOrientation: a phone photo carries its rotation in EXIF, and the
  // canvas would otherwise bake in the unrotated pixels.
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return { blob: file, width: 0, height: 0, ext: extOf(file.name), passthrough: true };
  }

  // Read the source size before close(); the fallback below reports it.
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(sourceWidth, sourceHeight));
  const width = Math.round(sourceWidth * scale);
  const height = Math.round(sourceHeight * scale);

  const blob = await draw(bitmap, width, height);
  bitmap.close();

  // A browser without WebP encoding hands back a PNG, usually larger than the
  // JPEG that went in. Keep the original — and report *its* dimensions, since
  // the recorded width/height must describe the bytes actually stored.
  const blank = Boolean(blob) && blob!.size < BLANK_BYTES && file.size > 64 * 1024;
  if (!blob || blank || blob.type !== "image/webp" || blob.size >= file.size) {
    return {
      blob: file,
      width: sourceWidth,
      height: sourceHeight,
      ext: extOf(file.name),
      passthrough: true,
    };
  }

  return { blob, width, height, ext: ".webp", passthrough: false };
}

/** "8.4 MB" — for telling the uploader what it just saved. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
