import Link from "next/link";
import type { Metadata } from "next";

import { Plate } from "@/components/plate";
import { getAlbums, getCovers } from "@/lib/gallery";
import { getViewer } from "@/lib/auth";
import { plate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galleries",
  description: "Photographic galleries — sport, food, and unfiled work.",
};

export default async function WorkPage() {
  const [albums, viewer] = await Promise.all([getAlbums(), getViewer()]);
  const covers = await getCovers(albums.map((a) => a.id));
  const heldBack = albums.filter((a) => a.visibility === "members").length;

  return (
    <div className="page">
      <section className="page__intro">
        <h2 className="page__title">
          Work, <em>indexed</em>.
        </h2>
        <p className="fold-text__body">
          {albums.length === 0
            ? "The index is empty — the first galleries are being filed."
            : `${albums.length} ${albums.length === 1 ? "gallery" : "galleries"}${
                heldBack > 0 ? `, ${heldBack} held back for signed-in visitors` : ""
              }.`}
        </p>
        {!viewer && heldBack > 0 && (
          <p>
            <Link className="link" href="/enter">
              Sign in to open them →
            </Link>
          </p>
        )}
      </section>

      {albums.length === 0 ? (
        <section className="page__pad page__pad-b">
          <p className="notes__empty">Nothing filed yet.</p>
        </section>
      ) : (
        <div className="albums">
          {albums.map((album, i) => {
            const cover = covers.get(album.id);
            return (
              <article
                className="album reveal"
                key={album.id}
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link className="album__media" href={`/work/${album.slug}`}>
                  {cover?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.url}
                      alt={cover.caption ?? album.title}
                      loading={i < 2 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      decoding="async"
                    />
                  ) : (
                    <Plate no={plate(i)} label="no cover yet" />
                  )}
                </Link>
                <div className="album__meta">
                  <h3 className="album__title">
                    <Link href={`/work/${album.slug}`}>{album.title}</Link>
                  </h3>
                  <span className="album__year u-tabular">{album.year ?? "—"}</span>
                </div>
                <p className="album__sub">
                  {album.subtitle ?? album.place ?? "unfiled"}
                </p>
                {album.visibility === "members" && (
                  <span className="lock">◆ signed-in only</span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
