"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { plate } from "@/lib/format";
import { genres, genreLabel } from "@/lib/site";
import { CARD_THUMB_WIDTH, SIZES } from "@/lib/images";
import { Plate } from "@/components/plate";
import { SectionHead } from "@/components/section-head";
import { useRevealChildren } from "@/components/motion";
import type { AlbumWithCover, PhotoWithUrl } from "@/lib/gallery";

type Lens = "all" | (typeof genres)[number]["id"];

/**
 * The index, filtered by the body of work.
 *
 * It used to filter by visibility — All / Open / Held back — which is
 * housekeeping. A visitor deciding whether to commission a graduation shoot
 * does not care which sets are held back; they care whether graduations are
 * shot here at all. Visibility belongs in the darkroom, and is there.
 *
 * Genres with nothing filed under them are not offered: an empty filter is a
 * promise the archive cannot keep.
 *
 * Each card carries its cover. It did not, and the home page compensated by
 * printing a separate grid of the same seven galleries above it — 2162px of
 * one page listing one set twice. design.md § 10 asks a content page for
 * "typography + the photographs only", and a photographer's index with no
 * photographs in it reads as a directory, because it was one.
 *
 * It stacks, in the asymmetric grid the reference uses for its own product
 * section: one large card, the rest small. It ran sideways as a reel until
 * now, on the argument in `PRD-index-as-gallery.md` that seven galleries are a
 * set you choose between rather than a thing you read — and a reel is one card
 * deep where stacked covers measured 1273px.
 *
 * That trade was made before the hero carried anything. It no longer holds:
 * the four covers along the hero's foot (`hero.tsx`) already put five
 * photographs on the first screen and moved photograph two from 1.56 screens
 * to 0.71, so the height a stacked index costs is no longer being paid at the
 * top of the page where it mattered. What the reel cost instead is that six of
 * seven galleries were off-screen, and a visitor deciding whether this archive
 * shoots what they need had to swipe to find out. The owner asked for the
 * grid; `PRD-the-reference-layout.md` § 3.4 has the decision it reverses.
 *
 * Each card also carries a contact strip — three more plates from inside that
 * gallery, small. One cover says a gallery exists; three plates behind it say
 * what the job looked like, which is the question a visitor actually has and
 * the one a title like "Graduation 2025" cannot answer on its own. It is
 * evidence rather than copy on purpose: the subtitles are the owner's to write
 * (pending-task.md § 4) and photographs were already in the archive.
 */
export function IndexFilter({
  albums,
  band,
}: {
  albums: AlbumWithCover[];
  /**
   * A plate for the band this section opens on.
   *
   * The reference carries whole sections on a photograph with the content set
   * over it — its "Choose by Category" block is exactly that, and it is the
   * layout this page did not have. See docs/RESEARCH-reference-vs-built.md
   * § 5, which found the rule "photography is the imagery" had been read as
   * "never set anything over a photograph" when the reference does it twice,
   * including for its strongest moment.
   */
  band?: PhotoWithUrl;
}) {
  const [lens, setLens] = useState<Lens>("all");
  const gridRef = useRef<HTMLDivElement | null>(null);

  /* The cards reveal themselves rather than being wrapped: each one is the
   * grid item, and a wrapper around it would be the thing the grid placed.
   * Re-runs on `lens`, so switching genre plays the stagger again instead of
   * swapping rows in place — docs/IDEAS-motion.md § 3.6. */
  useRevealChildren(gridRef, ".reel__card", lens);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of albums) map.set(a.genre, (map.get(a.genre) ?? 0) + 1);
    return map;
  }, [albums]);

  const lenses = useMemo(
    () => [
      { id: "all" as const, label: "All", count: albums.length },
      ...genres
        .filter((g) => (counts.get(g.id) ?? 0) > 0)
        .map((g) => ({ id: g.id, label: g.label, count: counts.get(g.id) ?? 0 })),
    ],
    [albums.length, counts],
  );

  const shown = useMemo(
    () => (lens === "all" ? albums : albums.filter((a) => a.genre === lens)),
    [albums, lens],
  );

  /* The band's copy answers the chip.
   *
   * The reference's sections are full of words where this one was two lines
   * over a photograph, and the words that were missing already existed: every
   * genre in site.ts carries a `blurb` written by the owner, and until now
   * nothing on the home page read one. So the band says what the whole archive
   * is while the lens is open, and what *this kind of work* is the moment a
   * lane is picked — which is the question a visitor has and the one a count
   * cannot answer.
   *
   * Derived from `lenses`, not written out: only lanes with galleries in them
   * are named, and a hand-typed list of five genres is the exact shape of the
   * bug that printed a nonsense commissions line on /about. */
  const lane = useMemo(
    () => (lens === "all" ? null : genres.find((g) => g.id === lens) ?? null),
    [lens],
  );
  const laneLine = useMemo(() => {
    const names = lenses.slice(1).map((l) => l.label.toLowerCase());
    if (names.length === 0) return "";
    if (names.length === 1) return names[0];
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  }, [lenses]);

  return (
    /* One wrapper around both halves. A sticky element is bound by its
       containing block, and as a direct grid item of .grid-band that block was
       its own row — nowhere to travel, so it scrolled away like anything
       else. */
    <div className="index-wrap">
      {/* The section opens on a photograph with its heading set in the middle
          of it — the reference's one repeated structural move, and the one
          this page was missing. The heading is sentence case and breaks across
          two lines with the second indented, which is how every heading in the
          reference is set. */}
      {band?.url ? (
        <div className="index-band">
          {/* Storage URLs are remote — a plain <img>, as everywhere else. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="index-band__img"
            src={band.url}
            srcSet={band.srcSet ?? undefined}
            sizes={SIZES.fold}
            alt=""
            width={band.width ?? undefined}
            height={band.height ?? undefined}
            loading="lazy"
            decoding="async"
          />
          <div className="index-band__type">
            <SectionHead
              className="section-head--on-photo"
              eyebrow={lane ? `Lane · ${lane.label}` : "Choose by lane"}
              /* The count is the highlighted word. It is the one assertion on
                 the page that a visitor can check in a glance — there is a
                 body of work here, this much of it — and lime on a numeral
                 reads as a fact rather than as decoration. One word, the same
                 device as the hero's line. */
              lead={
                <>
                  <em>{shown.length}</em>{" "}
                  {shown.length === 1 ? "gallery" : "galleries"},
                </>
              }
              tail={lane ? `all of it ${lane.label.toLowerCase()}.` : "filed by what they are."}
              sub={
                lane
                  ? lane.blurb
                  : `${laneLine} — pick a lane and the index narrows to it. Every set opens in full, plate by plate.`
              }
            />
          </div>
        </div>
      ) : null}

      {/* Heading and filters travel together, because a filter with its
          question scrolled off the screen is a row of unlabelled buttons. */}
      <div className="index-sticky">
        <div className="index-head">
          <h2 className="head__title">The index</h2>
          <p className="index-count">
            ( {albums.length} {albums.length === 1 ? "gallery" : "galleries"} )
          </p>
        </div>

        <div className="chips" role="group" aria-label="Filter galleries by genre">
          {lenses.map((l) => (
            <button
              key={l.id}
              type="button"
              className="chip"
              data-active={lens === l.id ? "true" : undefined}
              aria-pressed={lens === l.id}
              onClick={() => setLens(l.id)}
            >
              {l.label} ({l.count})
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="notes__empty">
          Nothing filed under {genreLabel(lens)} yet.
        </p>
      ) : (
        /* One large card then small ones, which is the shape of the
           reference's own grid. The card vocabulary below is still
           `.reel__*`: the lanes draw the same box from the same rules and
           only the container differs, so renaming it would have touched a
           section this change has no business in. See the note over
           `.index-grid` in globals.css. */
        <div className="index-grid" ref={gridRef}>
          {shown.map((album, i) => {
            /* Three, and only from galleries that have them. A strip of one
               reads as a mistake rather than as a set. Each plate arrives as
               a single source already sized for the box — see StripPlate for
               why it is not a whole photograph. */
            const strip = album.plates.slice(0, 3);
            return (
              <Link
                className="reel__card reveal"
                key={album.id}
                href={`/work/${album.slug}`}
              >
                <span className="reel__no">[{plate(i)}]</span>
                <span className="reel__frame">
                  {album.cover?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.cover.url}
                      srcSet={album.cover.srcSet ?? undefined}
                      sizes={i === 0 ? SIZES.cardLead : SIZES.card}
                      alt={album.cover.caption ?? album.title}
                      width={album.cover.width ?? undefined}
                      height={album.cover.height ?? undefined}
                      loading={i < 2 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  ) : (
                    <Plate no={plate(i)} label="no cover" />
                  )}
                </span>

                {strip.length === 3 && (
                  /* Decorative: the card is one link with one name, and three
                     more images inside it that each announced themselves
                     would read the gallery out four times. The evidence is
                     visual, and the title above already carries it. */
                  <span className="reel__strip" aria-hidden="true">
                    {strip.map((p) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={p.id}
                        src={p.src}
                        alt=""
                        width={CARD_THUMB_WIDTH}
                        height={CARD_THUMB_WIDTH}
                        loading="lazy"
                        decoding="async"
                      />
                    ))}
                  </span>
                )}

                <span className="reel__name">{album.title}</span>
                <span className="reel__meta">
                  {genreLabel(album.genre)} · {album.place ?? "\u2014"} ·{" "}
                  {album.year ?? "\u2014"} {"\u2197\uFE0E"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
