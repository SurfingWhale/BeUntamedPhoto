import Link from "next/link";

import { plate } from "@/lib/format";
import { HERO_THUMB_WIDTH, SIZES, publicSrc } from "@/lib/images";
import { site } from "@/lib/site";
import type { AlbumWithCover, PhotoWithUrl } from "@/lib/gallery";

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
export function Hero({
  photo,
  thumbs = [],
}: {
  photo?: PhotoWithUrl;
  /**
   * Four covers hung along the foot of the frame.
   *
   * The reference does exactly this and it is the first evidence a visitor
   * gets that there is more than one photograph — above the fold, before any
   * scrolling. It is also the cheapest answer to the measurement in
   * docs/RESEARCH-the-first-screen.md § 4.1, which found one photograph in the
   * first 2.7 screens: four more here makes it five on screen one.
   *
   * They are already fetched for the index, so they cost no query.
   */
  thumbs?: AlbumWithCover[];
}) {
  const has = Boolean(photo?.url);
  const strip = thumbs.filter((a) => a.cover?.url).slice(0, 4);

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

        {strip.length > 0 && (
          <ul className="hero__strip" aria-label="Recent galleries">
            {strip.map((album) => (
              <li key={album.id}>
                <Link className="hero__thumb" href={`/work/${album.slug}`}>
                  {/* One small file, no ladder — see HERO_THUMB_WIDTH. A
                      held-back cover has no public URL to rebuild, so it keeps
                      the signed one it arrived with. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      album.cover!.bucket === "gallery"
                        ? publicSrc(
                            "gallery",
                            album.cover!.path,
                            HERO_THUMB_WIDTH,
                            album.cover!.width,
                            album.cover!.height,
                          )
                        : album.cover!.url!
                    }
                    alt={album.title}
                    width={HERO_THUMB_WIDTH}
                    height={HERO_THUMB_WIDTH}
                    loading="eager"
                    decoding="async"
                  />
                  <span className="u-sr">{album.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

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
