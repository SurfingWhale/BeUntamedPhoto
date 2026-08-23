import { Plate } from "@/components/plate";
import { plate } from "@/lib/format";
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

  return (
    <section className={`fold-photo fold-photo--${size}`}>
      {has ? (
        // Storage URLs are signed / remote — a plain <img> keeps them unproxied.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="fold-photo__img"
          src={photo!.url!}
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
