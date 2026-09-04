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
  /** Why the original was kept. Only set when `passthrough` is true. */
  reason?: string;
};

function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot).toLowerCase() : ".jpg";
}

/** Encode the drawn canvas, trying each type in turn. */
async function encode(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  type: string,
): Promise<Blob | null> {
  if (typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type, quality: QUALITY }).catch(() => null);
  }
  return new Promise((resolve) =>
    (canvas as HTMLCanvasElement).toBlob((b) => resolve(b), type, QUALITY),
  );
}

/**
 * Draw at the target size, then encode.
 *
 * WebP first, JPEG second. Not every browser can encode WebP from a canvas —
 * when it cannot, the spec says fall back to PNG, which for a photograph is
 * larger than the JPEG that went in. The first version of this treated that as
 * total failure and kept the original, throwing away the resize with it. The
 * resize is most of the saving on its own: 7.77 MB becomes 757 KB as JPEG at
 * 2400px before WebP is considered at all. So a browser without WebP now gets
 * a resized JPEG rather than nothing.
 */
async function draw(
  bitmap: ImageBitmap,
  width: number,
  height: number,
): Promise<{ blob: Blob; ext: string } | null> {
  let canvas: OffscreenCanvas | HTMLCanvasElement;
  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(width, height);
  } else {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    canvas = c;
  }
  const ctx = canvas.getContext("2d") as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null;
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, width, height);

  for (const [type, ext] of [
    ["image/webp", ".webp"],
    ["image/jpeg", ".jpg"],
  ] as const) {
    const blob = await encode(canvas, type);
    if (blob && blob.type === type) return { blob, ext };
  }
  return null;
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
      return {
        blob: file,
        width: size.w,
        height: size.h,
        ext: ".webp",
        passthrough: true,
        reason: "already a small WebP",
      };
    }
  }

  // imageOrientation: a phone photo carries its rotation in EXIF, and the
  // canvas would otherwise bake in the unrotated pixels.
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return {
      blob: file,
      width: 0,
      height: 0,
      ext: extOf(file.name),
      passthrough: true,
      reason: "this browser could not decode the file",
    };
  }

  // Read the source size before close(); the fallback below reports it.
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(sourceWidth, sourceHeight));
  const width = Math.round(sourceWidth * scale);
  const height = Math.round(sourceHeight * scale);

  /* A 8000x12000 frame is 96 megapixels — 384 MB as raw bitmap, past what a
   * browser will hand to a canvas, and the draw comes back blank. Decoding a
   * second time with resize options lets the decoder downsample as it reads,
   * so the canvas only ever sees the target size. Only worth the extra decode
   * on the frames that need it. */
  let source = bitmap;
  if (sourceWidth * sourceHeight > 40_000_000 && scale < 1) {
    const small = await createImageBitmap(file, {
      imageOrientation: "from-image",
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: "high",
    }).catch(() => null);
    if (small) {
      bitmap.close();
      source = small;
    }
  }

  const drawn = await draw(source, width, height);
  source.close();

  // Keep the original only when there is genuinely nothing better: no encoder
  // at all, a canvas that failed to draw, or a result no smaller than the
  // input. `reason` is carried out so the uploader can say which, rather than
  // reporting "0% smaller" and leaving it a mystery.
  const blank = drawn ? drawn.blob.size < BLANK_BYTES && file.size > 64 * 1024 : false;
  const bigger = drawn ? drawn.blob.size >= file.size : false;
  if (!drawn || blank || bigger) {
    return {
      blob: file,
      width: sourceWidth,
      height: sourceHeight,
      ext: extOf(file.name),
      passthrough: true,
      reason: !drawn
        ? "this browser could not encode the resized image"
        : blank
          ? "the canvas came back blank — the image is too large for this browser"
          : "re-encoding made it no smaller",
    };
  }

  return { blob: drawn.blob, width, height, ext: drawn.ext, passthrough: false };
}

/** "8.4 MB" — for telling the uploader what it just saved. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
