"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Reveal } from "@/components/motion";
import { plate } from "@/lib/format";
import { genres, genreLabel } from "@/lib/site";
import type { Album } from "@/lib/gallery";

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
 */
export function IndexFilter({ albums }: { albums: Album[] }) {
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
    <>
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

      {shown.length === 0 ? (
        <p className="notes__empty">
          Nothing filed under {genreLabel(lens)} yet.
        </p>
      ) : (
        <div className="index">
          {shown.slice(0, 6).map((album, i) => (
            <Reveal as="div" key={album.id} index={i}>
              <Link className="index__row" href={`/work/${album.slug}`}>
                <span className="index__no">[{plate(i)}]</span>
                <span className="index__name">{album.title}</span>
                <span className="index__meta">
                  {genreLabel(album.genre)} · {album.place ?? "unfiled"} ·{" "}
                  {album.year ?? "—"} ↗
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
