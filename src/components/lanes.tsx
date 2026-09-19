import Link from "next/link";

import { LANE_MAX_WIDTH, SIZES, trimSrcSet } from "@/lib/images";
import { elsewhere, site } from "@/lib/site";

type Props = {
  /**
   * Whether this archive appears as a lane of its own.
   *
   * `/elsewhere` says yes: the page's subject is the whole practice, and the
   * third card is what makes it a set rather than two outbound links.
   *
   * The home page says no, and that changed when the section's heading did.
   * It used to read "3 sites, one practice", which needs all three to be
   * counted; it now reads "sport and food, too", whose whole job is the two
   * lanes a visitor cannot see from here. A card inviting the reader to the
   * archive they are already standing on — directly under an index of that
   * same archive — is the third destination competing with the other two, and
   * on a phone it was a third of the section's 1172px.
   */
  includeSelf?: boolean;
  /**
   * A frame from this archive for its own lane. The other two carry a
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
export function Lanes({ archiveBanner, includeSelf = true }: Props) {
  const lanes = [
    ...elsewhere.map((place) => ({
      key: place.href,
      href: place.href,
      external: true,
      label: place.lane as string,
      name: place.name,
      what: place.what,
      addr: place.go,
      /* The invitation, built from the lane rather than written per site.
       * "See the food work" is the sentence that has to land; the domain is
       * confirmation of where it goes, not the offer. */
      go: `See the ${place.lane.toLowerCase()} work`,
      mark: "\u2197\uFE0E",
      banner: place.banner as string | null,
      bannerSet: place.bannerSet as string | null,
      w: place.w as number | null,
      h: place.h as number | null,
      alt: `${place.name} — ${place.what}`,
    })),
    ...(includeSelf ? [{
      key: "/work",
      href: "/work",
      external: false,
      label: "Everything else",
      /* From site.name, not repeated: this lane *is* this site, and a second
       * copy of the brand string is a second thing to forget when it
       * changes — which it did, on 2026-09-14. */
      name: site.name,
      what: "Graduations, brand work and events — the full archive, filed by genre.",
      addr: "this site",
      go: "Browse the full archive",
      mark: "\u2192",
      banner: archiveBanner?.url ?? null,
      /* Already resized on the way out of storage, so it brings its own —
       * trimmed to what this frame can actually use. See trimSrcSet: a lazy
       * frame in a reel picks its candidate mid-scroll, and it was taking a
       * 1500w file for a 271px box. */
      bannerSet: trimSrcSet(archiveBanner?.srcSet ?? null, LANE_MAX_WIDTH) ?? null,
      w: archiveBanner?.width ?? null,
      h: archiveBanner?.height ?? null,
      alt: archiveBanner?.caption ?? "A frame from the archive",
    }] : []),
  ];

  return (
    <div className="reel lanes" aria-label="The three sites">
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
                  /* One declaration for all three, because the frames crop:
                     painted width is box width and the box is the same in
                     every lane. It was per lane while they letterboxed. */
                  sizes={SIZES.lane}
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
            <span className="lane__go">
              {lane.go} {lane.mark}
            </span>
            <span className="reel__meta">{lane.addr}</span>
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
