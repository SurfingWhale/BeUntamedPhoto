"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Reveal } from "@/components/motion";
import { plate } from "@/lib/format";
import type { Album } from "@/lib/gallery";

type Lens = "all" | "open" | "held";

const LENSES: { id: Lens; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "held", label: "Held back" },
];

/**
 * The index, with a real filter over a real field. The chips previously all
 * pointed at the same unfiltered page, which made them a false affordance —
 * they now narrow the list by album visibility, which is data that exists.
 */
export function IndexFilter({ albums }: { albums: Album[] }) {
  const [lens, setLens] = useState<Lens>("all");

  const counts = useMemo(
    () => ({
      all: albums.length,
      open: albums.filter((a) => a.visibility === "public").length,
      held: albums.filter((a) => a.visibility === "members").length,
    }),
    [albums],
  );

  const shown = useMemo(() => {
    if (lens === "open") return albums.filter((a) => a.visibility === "public");
    if (lens === "held") return albums.filter((a) => a.visibility === "members");
    return albums;
  }, [albums, lens]);

  return (
    <>
      <div className="chips" role="group" aria-label="Filter galleries">
        {LENSES.map((l) => (
          <button
            key={l.id}
            type="button"
            className="chip"
            data-active={lens === l.id ? "true" : undefined}
            aria-pressed={lens === l.id}
            onClick={() => setLens(l.id)}
          >
            {l.label} ({counts[l.id]})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="notes__empty">
          {lens === "held"
            ? "Nothing held back right now — every gallery is open."
            : "Nothing filed under this view yet."}
        </p>
      ) : (
        <div className="index">
          {shown.slice(0, 6).map((album, i) => (
            <Reveal as="div" key={album.id} index={i}>
              <Link className="index__row" href={`/work/${album.slug}`}>
                <span className="index__no">[{plate(i)}]</span>
                <span className="index__name">{album.title}</span>
                <span className="index__meta">
                  {album.place ?? "unfiled"} · {album.year ?? "—"}
                  {album.visibility === "members" ? " · held" : ""} ↗
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
