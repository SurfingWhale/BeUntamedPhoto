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
  /**
   * The browser could not decode this file at all, so there is nothing to
   * stage. The caller drops it and names it, rather than uploading bytes no
   * visitor's browser will be able to display either.
   */
  undecodable?: boolean;
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

  /* WebP first, JPEG second, and the type check is the whole point: when a
   * canvas cannot encode the type asked for, the spec says produce PNG
   * instead — silently. `blob.type === type` is what catches that.
   *
   * On iOS Safari this always falls to JPEG, because Safari's canvas has no
   * WebP encoder. Every one of the 76 files in the bucket is a .jpg for that
   * reason, and it is not a bug in this function. It is also not the loss it
   * looks like: the resize is where the saving is — 7.77MB becomes 757KB at
   * 2400px before the format is even considered — and Supabase's render
   * endpoint negotiates WebP on the way out, so a visitor's browser is served
   * WebP regardless of what the bucket holds. Measured: the same plate comes
   * back 262,918 B as WebP and 324,410 B as JPEG from the same URL. */
  for (const [type, ext] of [
    ["image/webp", ".webp"],
    ["image/jpeg", ".jpg"],
  ] as const) {
    const blob = await encode(canvas, type);
    if (blob && blob.type === type) return { blob, ext };
  }
  return null;
}

/**
 * Whether this browser's canvas can encode WebP at all.
 *
 * Asked once and cached. The uploader says so rather than letting every
 * upload quietly come out as JPEG and leaving the owner to wonder why the
 * feature he asked for is not working.
 */
let webpSupport: Promise<boolean> | null = null;
export function canEncodeWebp(): Promise<boolean> {
  if (!webpSupport) {
    webpSupport = (async () => {
      try {
        const c =
          typeof OffscreenCanvas !== "undefined"
            ? new OffscreenCanvas(2, 2)
            : Object.assign(document.createElement("canvas"), { width: 2, height: 2 });
        const blob = await encode(c, "image/webp");
        return Boolean(blob && blob.type === "image/webp");
      } catch {
        return false;
      }
    })();
  }
  return webpSupport;
}

/**
 * The pixel dimensions, read from the file's header without decoding it.
 *
 * This exists so the decode itself can be bounded. A Fujifilm X-T30 frame is
 * 6240x4160 — 26 megapixels, about 104 MB as a raw bitmap — and the only way
 * to avoid handing that to the browser is to know the size before asking for
 * the pixels. Guessing from the file size is not knowing.
 *
 * JPEG: walk the marker segments to a start-of-frame and read the two 16-bit
 * fields. PNG: IHDR is always the first chunk. Anything else returns null and
 * the caller decodes normally.
 */
async function headerSize(file: File): Promise<{ w: number; h: number } | null> {
  const head = new Uint8Array(await file.slice(0, 256 * 1024).arrayBuffer());

  // PNG: 8-byte signature, then IHDR length+type, then width/height.
  if (head.length > 24 && head[0] === 0x89 && head[1] === 0x50) {
    const view = new DataView(head.buffer);
    return { w: view.getUint32(16), h: view.getUint32(20) };
  }

  // JPEG: 0xFFD8, then segments. SOF0-3, 5-7, 9-11, 13-15 carry the size.
  if (!(head.length > 4 && head[0] === 0xff && head[1] === 0xd8)) return null;
  let i = 2;
  while (i + 9 < head.length) {
    if (head[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = head[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = (head[i + 2] << 8) | head[i + 3];
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      return {
        h: (head[i + 5] << 8) | head[i + 6],
        w: (head[i + 7] << 8) | head[i + 8],
      };
    }
    if (len < 2) return null;
    i += 2 + len;
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

  /* Decode bounded, not full size, whenever the header says it is worth it.
   *
   * This used to decode every file at its native resolution and only take the
   * resize-on-decode path above 40 megapixels. A 26MP camera JPEG — an X-T30
   * frame is 6240x4160 — sits under that line, so it was decoded whole: about
   * 104 MB of bitmap before a single pixel was drawn. iOS Safari answers that
   * by handing back a canvas that draws nothing, silently, which this file
   * then correctly identified as blank and fell back to keeping the original.
   * So the shrink quietly stopped happening on exactly the files it existed
   * for. Thirteen of the seventy-six plates in the bucket are still stored at
   * full camera resolution because of it.
   *
   * Only resizeWidth is passed, never both. The spec preserves the aspect
   * ratio from the one given, and EXIF rotation is applied before the resize —
   * so passing both would stretch anything shot in portrait. A portrait frame
   * therefore comes back with a 2400px *width* and a taller height; that is
   * still a fraction of the full decode, and the canvas target below caps the
   * long edge properly afterwards. */
  const header = await headerSize(file).catch(() => null);

  // imageOrientation: a phone photo carries its rotation in EXIF, and the
  // canvas would otherwise bake in the unrotated pixels.
  let bitmap: ImageBitmap | null = null;
  if (header && Math.max(header.w, header.h) > MAX_EDGE) {
    bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
      resizeWidth: MAX_EDGE,
      resizeQuality: "high",
    }).catch(() => null);
  }
  try {
    if (!bitmap) bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return {
      blob: file,
      width: 0,
      height: 0,
      ext: extOf(file.name),
      passthrough: true,
      reason: "this browser could not decode the file",
      undecodable: true,
    };
  }

  // Read the source size before close(); the fallback below reports it.
  /* Two different sizes, and they stopped being the same thing when the decode
   * became bounded. `decoded*` is what the canvas will draw from — already at
   * or under MAX_EDGE on its width when the header path ran. `original*` is
   * what came off the camera, and it is what the passthrough branch has to
   * report, because passthrough returns the original file rather than
   * anything this function produced. */
  const decodedWidth = bitmap.width;
  const decodedHeight = bitmap.height;
  const originalWidth = header?.w ?? decodedWidth;
  const originalHeight = header?.h ?? decodedHeight;
  const scale = Math.min(1, MAX_EDGE / Math.max(decodedWidth, decodedHeight));
  const width = Math.round(decodedWidth * scale);
  const height = Math.round(decodedHeight * scale);

  const drawn = await draw(bitmap, width, height);
  bitmap.close();

  // Keep the original only when there is genuinely nothing better: no encoder
  // at all, a canvas that failed to draw, or a result no smaller than the
  // input. `reason` is carried out so the uploader can say which, rather than
  // reporting "0% smaller" and leaving it a mystery.
  const blank = drawn ? drawn.blob.size < BLANK_BYTES && file.size > 64 * 1024 : false;
  const bigger = drawn ? drawn.blob.size >= file.size : false;
  if (!drawn || blank || bigger) {
    return {
      blob: file,
      width: originalWidth,
      height: originalHeight,
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
