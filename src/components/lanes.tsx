import Link from "next/link";

import { SIZES } from "@/lib/images";
import { elsewhere } from "@/lib/site";

type Props = {
  /**
   * A frame from this archive for the UNTAMED lane. The other two carry a
   * committed still from the site they point at; this one takes whatever the
   * archive is showing, so it is never out of date with the work.
   */
  archiveBanner?: {
    url: string | null;
    /** Widths the render endpoint can serve this frame at. */
    srcSet?: string | null;
    caption: string | null;
    /* Reserved box, same reason as the committed banners: without it three
     * lazy frames grew this section 575px under the reader. */
    width?: number | null;
    height?: number | null;
  } | null;
};

/**
 * The three lanes — sport, food, and the archive itself.
 *
 * Each shows a frame from the site it leads to, because a list of names and
 * domains gave a client no reason to follow any of them. The frame sits beside
 * the words on canvas, not behind them under a wash: design.md § 10 is explicit
 * that photography is the imagery and that background texture of any kind is
 * out, and § 3.6 that green is never a section.
 *
 * Rendered by both the home page and /elsewhere from one component. There were
 * two copies of this list, and a list in two places disagrees with itself after
 * the first edit.
 *
 * Three destinations are a choice set, so they run sideways in a reel, the same
 * primitive the index uses. Stacked they were 1688px — two phone screens for
 * three links, which is exactly what § 11 tells you to cut. The banner is not
 * smaller for it; there are simply not three of them stacked down the page.
 */
export function Lanes({ archiveBanner }: Props) {
  const lanes = [
    ...elsewhere.map((place) => ({
      key: place.href,
      href: place.href,
      external: true,
      label: place.lane as string,
      name: place.name,
      what: place.what,
      addr: place.go,
      mark: "\u2197\uFE0E",
      banner: place.banner as string | null,
      bannerSet: place.bannerSet as string | null,
      bannerSizes: place.bannerSizes as string,
      w: place.w as number | null,
      h: place.h as number | null,
      alt: `${place.name} — ${place.what}`,
    })),
    {
      key: "/work",
      href: "/work",
      external: false,
      label: "Everything else",
      name: "UNTAMED",
      what: "Graduations, brand work and events — the full archive, filed by genre.",
      addr: "this site",
      mark: "\u2192",
      banner: archiveBanner?.url ?? null,
      // Already resized on the way out of storage, so it brings its own.
      bannerSet: archiveBanner?.srcSet ?? null,
      // The archive frame's ratio changes with whichever plate is showing, so
      // it is the one lane that has to fall back to the box.
      bannerSizes: SIZES.lane,
      w: archiveBanner?.width ?? null,
      h: archiveBanner?.height ?? null,
      alt: archiveBanner?.caption ?? "A frame from the archive",
    },
  ];

  return (
    <div className="reel" aria-label="The three sites">
      {lanes.map((lane, i) => {
        const body = (
          <>
            <span className="reel__no">
              [{String(i + 1).padStart(2, "0")}] {lane.label}
            </span>
            <span className="reel__frame">
              {lane.banner ? (
                // Storage and satellite URLs are remote — a plain <img> keeps
                // them unproxied, as everywhere else in this archive.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lane.banner}
                  srcSet={lane.bannerSet ?? undefined}
                  /* Per lane, because contain means the frame is narrower
                     than its box by however much the ratios differ. Without
                     any sizes the browser assumes 100vw and takes the largest
                     candidate on every screen. */
                  sizes={lane.bannerSizes}
                  alt={lane.alt}
                  width={lane.w ?? undefined}
                  height={lane.h ?? undefined}
                  /* Never eager, on any page.
                   *
                   * An eager frame emits a preload hint, and that hint travels
                   * in the prefetched payload of every route linking here —
                   * the masthead links /elsewhere from all of them. So an
                   * album page, which renders no reel at all, was pulling
                   * 113KB of lane stills; making only /elsewhere eager still
                   * leaked 54KB of it. /elsewhere is a secondary page and its
                   * LCP is not worth taxing the page every shared link lands
                   * on. Lazy costs it almost nothing: these sit in the opening
                   * viewport there, and lazy only defers what is off-screen. */
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </span>
            <span className="reel__name">{lane.name}</span>
            <span className="lane__what">{lane.what}</span>
            <span className="reel__meta">
              [{lane.addr}] {lane.mark}
            </span>
          </>
        );

        return lane.external ? (
          <a
            className="reel__card"
            key={lane.key}
            href={lane.href}
            target="_blank"
            rel="noreferrer"
          >
            {body}
          </a>
        ) : (
          <Link className="reel__card" key={lane.key} href={lane.href}>
            {body}
          </Link>
        );
      })}
    </div>
  );
}
