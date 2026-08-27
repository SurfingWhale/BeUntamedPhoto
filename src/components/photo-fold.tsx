import Link from "next/link";

import { Plate } from "@/components/plate";
import { plate } from "@/lib/format";
import type { PhotoWithUrl } from "@/lib/gallery";

type Props = {
  photo?: PhotoWithUrl;
  index: number;
  size?: "tall" | "band" | "hero";
  priority?: boolean;
  fallbackLabel?: string;
  /** Small label, top left. Sits in a filled block so a photograph cannot eat it. */
  eyebrow?: string;
  /** The opening statement, set over the frame. Hero only. */
  children?: React.ReactNode;
  /** Chips laid over the frame. Each one goes somewhere real. */
  chips?: { label: string; href: string }[];
};

/* Macrostructure 08 — the photograph is the fold; the caption annotates it.
 * Anything laid over a frame sits on a solid block rather than leaning on a
 * text shadow, because the photograph underneath is not known in advance. */
export function PhotoFold({
  photo,
  index,
  size = "band",
  priority = false,
  fallbackLabel,
  eyebrow,
  children,
  chips,
}: Props) {
  const no = plate(index);
  const has = Boolean(photo?.url);
  const overlaid = Boolean(eyebrow || children);

  return (
    <section
      className={`fold-photo fold-photo--${size}${has ? "" : " fold-photo--empty"}`}
    >
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

      {overlaid && (
        <div className="fold-photo__over">
          <div className="fold-photo__over-row">
            {eyebrow && <span className="fold-photo__tag">{eyebrow}</span>}
          </div>
          <div className="fold-photo__over-row">
            {children && <h2 className="fold-photo__statement">{children}</h2>}
          </div>
        </div>
      )}

      {chips && chips.length > 0 && (
        <div className="chips">
          <div className="chips__inner">
            <span className="fold-photo__tag">Browse by gallery</span>
            <div className="chips__row">
              {chips.map((c) => (
                <Link className="chip" key={c.href} href={c.href}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
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
