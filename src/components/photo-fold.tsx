import type { CSSProperties } from "react";

import { Plate } from "@/components/plate";
import { plate } from "@/lib/format";
import { SIZES } from "@/lib/images";
import type { PhotoWithUrl } from "@/lib/gallery";

type Props = {
  photo?: PhotoWithUrl;
  index: number;
  size?: "tall" | "band";
  priority?: boolean;
  fallbackLabel?: string;
};

/* Macrostructure 08 — the photograph is the fold; the caption annotates it. */
export function PhotoFold({
  photo,
  index,
  size = "band",
  priority = false,
  fallbackLabel,
}: Props) {
  const no = plate(index);
  const has = Boolean(photo?.url);

  /* The fold takes the plate's own proportions on a phone — see .fold-photo
   * in globals.css. Without this the CSS falls back to 0.75 and crops.
   *
   * A single number, not `w / h`: the stylesheet caps this with min() so an
   * opening frame is never wider than 4:5, and min() takes numbers. An
   * aspect-ratio of one number means that number to 1, which is the same box. */
  const ratio =
    photo?.width && photo?.height
      ? ({ "--fold-ratio": `${(photo.width / photo.height).toFixed(4)}` } as CSSProperties)
      : undefined;

  /* Landscape or portrait decides whether the plate can bleed at all on a wide
   * screen — see .fold-photo[data-shape] in globals.css. Unknown when the
   * dimensions were never recorded, and then the band behaves as it always did. */
  const shape =
    photo?.width && photo?.height
      ? photo.height > photo.width
        ? "portrait"
        : "landscape"
      : undefined;

  return (
    <section
      className={`fold-photo fold-photo--${size}`}
      style={ratio}
      data-shape={shape}
    >
      {has ? (
        // Storage URLs are signed / remote — a plain <img> keeps them unproxied.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="fold-photo__img"
          src={photo!.url!}
          srcSet={photo!.srcSet ?? undefined}
          sizes={SIZES.fold}
          alt={photo!.caption ?? `Plate ${no}`}
          width={photo!.width ?? undefined}
          height={photo!.height ?? undefined}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      ) : (
        <Plate no={no} label={fallbackLabel} />
      )}

      {has && (
        <p className="fold-photo__cap">
          <span>
            Plate {no}
            {photo!.caption ? ` · ${photo!.caption}` : ""}
          </span>
          <span>{photo!.place ?? "unfiled"}</span>
        </p>
      )}
    </section>
  );
}
