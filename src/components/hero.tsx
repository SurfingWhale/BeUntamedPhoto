import { plate } from "@/lib/format";
import { SIZES } from "@/lib/images";
import { site } from "@/lib/site";
import type { PhotoWithUrl } from "@/lib/gallery";

/**
 * The opening photograph, with the statement set on it in light type.
 *
 * This is the reference's single strongest moment and it was the page's
 * largest structural gap: `/` opened on the masthead and then a screen of
 * typography, so someone arriving from a shared link met type before they met
 * any work. design.md § 4 (page skeletons) and § 7 (type over a photograph is
 * in; generated texture is not).
 *
 * Its own component rather than a `size="hero"` branch inside `PhotoFold`.
 * That component's whole job is to give a plate its own proportions and hang a
 * caption under it; this one crops to a fixed frame and sets type over it, and
 * folding both into one would mean a ratio comment that contradicts itself.
 */
export function Hero({ photo }: { photo?: PhotoWithUrl }) {
  const has = Boolean(photo?.url);

  return (
    <section className="hero">
      {has && (
        /* Storage URLs are signed / remote — a plain <img> keeps them
           unproxied, the same reason PhotoFold uses one. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="hero__img"
          src={photo!.url!}
          srcSet={photo!.srcSet ?? undefined}
          sizes={SIZES.fold}
          alt={photo!.caption ?? `Plate ${plate(0)}`}
          width={photo!.width ?? undefined}
          height={photo!.height ?? undefined}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      )}

      <div className="hero__type">
        {/* The page's h1. The archive's own line, and the lime lands on one
            word of it — design.md § 5. */}
        <h1 className="hero__line">
          <em>Frames</em>, not feeds.
        </h1>

        <div className="hero__foot">
          <p className="hero__sub">{site.tagline}</p>
          {has && (
            <p className="hero__credit">
              Plate {plate(0)}
              {photo!.place ? ` · ${photo!.place}` : ""}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
