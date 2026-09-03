import { Plate } from "@/components/plate";
import { plate } from "@/lib/format";
import type { PhotoWithUrl } from "@/lib/gallery";

type Props = {
  photo?: PhotoWithUrl;
  index: number;
  /**
   * Ratio the frame is held to. Vertical by default: most of the archive is
   * shot that way, and a wide slot can only serve a vertical frame by
   * cropping the top and bottom off it.
   */
  shape?: "tall" | "wide";
  priority?: boolean;
  fallbackLabel?: string;
};

/**
 * One plate inside the editorial grid — a frame at a fixed ratio with its
 * caption set under it rather than stamped over it. Nothing is laid on the
 * photograph, so no photograph has to survive text on top of it.
 */
export function Frame({
  photo,
  index,
  shape = "tall",
  priority = false,
  fallbackLabel,
}: Props) {
  const no = plate(index);
  const url = photo?.url ?? null;

  return (
    <figure className={`ed__fig ed__fig--${shape}`}>
      <div className="ed__frame">
        {url ? (
          // Storage URLs are signed / remote — a plain <img> keeps them unproxied.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
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
      </div>
      <figcaption className="ed__cap">
        <span>
          Plate {no}
          {photo?.caption ? ` · ${photo.caption}` : ""}
        </span>
        <span>{photo?.place ?? "unfiled"}</span>
      </figcaption>
    </figure>
  );
}
