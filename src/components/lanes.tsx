import Link from "next/link";

import { Reveal } from "@/components/motion";
import { elsewhere } from "@/lib/site";

type Props = {
  /**
   * A frame from this archive for the UNTAMED lane. The other two carry a
   * committed still from the site they point at; this one takes whatever the
   * archive is showing, so it is never out of date with the work.
   */
  archiveBanner?: { url: string | null; caption: string | null } | null;
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
      alt: archiveBanner?.caption ?? "A frame from the archive",
    },
  ];

  return (
    <div className="lanes">
      {lanes.map((lane, i) => {
        const body = (
          <>
            <span className="lane__frame">
              {lane.banner ? (
                // Storage and satellite URLs are remote — a plain <img> keeps
                // them unproxied, as everywhere else in this archive.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lane.banner} alt={lane.alt} loading="lazy" decoding="async" />
              ) : null}
            </span>
            <span className="lane__body">
              <span className="lane__no">{String(i + 1).padStart(2, "0")}</span>
              <span className="lane__label">{lane.label}</span>
              <span className="lane__name">{lane.name}</span>
              <span className="lane__what">{lane.what}</span>
              <span className="lane__addr">
                [{lane.addr}] <span className="lane__mark">{lane.mark}</span>
              </span>
            </span>
          </>
        );

        return lane.external ? (
          <Reveal
            as="a"
            key={lane.key}
            index={i}
            className="lane"
            href={lane.href}
            target="_blank"
            rel="noreferrer"
          >
            {body}
          </Reveal>
        ) : (
          <Link className="lane" key={lane.key} href={lane.href}>
            {body}
          </Link>
        );
      })}
    </div>
  );
}
