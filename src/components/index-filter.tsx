"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { plate } from "@/lib/format";
import { genres, genreLabel } from "@/lib/site";
import { SIZES } from "@/lib/images";
import { Plate } from "@/components/plate";
import type { AlbumWithCover } from "@/lib/gallery";

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
 * It runs sideways because seven galleries are a set you choose between, not
 * a thing you read — see the .reel note in globals.css. Stacked with covers it
 * was 1273px; as a reel it is one card deep, and the chips cap how many are in
 * it at once. /work stays vertical: that is the survey page, and someone sent
 * that link is there to see everything at once.
 */
export function IndexFilter({ albums }: { albums: AlbumWithCover[] }) {
  const [lens, setLens] = useState<Lens>("all");

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

  return (
    /* One wrapper around both halves. A sticky element is bound by its
       containing block, and as a direct grid item of .grid-band that block was
       its own row — nowhere to travel, so it scrolled away like anything
       else. */
    <div className="index-wrap">
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
        <div className="reel" aria-label="Galleries">
          {shown.map((album, i) => (
            <Link className="reel__card" key={album.id} href={`/work/${album.slug}`}>
              <span className="reel__no">[{plate(i)}]</span>
              <span className="reel__frame">
                {album.cover?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.cover.url}
                    srcSet={album.cover.srcSet ?? undefined}
                    sizes={SIZES.cover}
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
              <span className="reel__name">{album.title}</span>
              <span className="reel__meta">
                {genreLabel(album.genre)} · {album.place ?? "unfiled"} ·{" "}
                {album.year ?? "\u2014"} {"\u2197\uFE0E"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
