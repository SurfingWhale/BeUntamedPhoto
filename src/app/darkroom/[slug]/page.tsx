import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { AlbumAdmin } from "@/components/album-admin";
import { Pager } from "@/components/pager";
import { Uploader } from "@/components/uploader";
import { clampPage, getAlbum, getMaxPosition, getPhotoPage } from "@/lib/gallery";
import { getViewer } from "@/lib/auth";
import { plate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export const metadata: Metadata = { title: "Darkroom", robots: { index: false } };

export default async function DarkroomAlbumPage({ params, searchParams }: Params) {
  const viewer = await getViewer();
  if (!viewer) redirect("/enter?next=%2Fdarkroom");
  if (!viewer.isOwner) redirect("/work");

  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const album = await getAlbum(slug);
  if (!album) notFound();

  const page = clampPage(query.page);
  // The next position comes from the album's own maximum, not from whatever
  // happens to be on this page — otherwise page two would restart at zero.
  const [plates, maxPosition] = await Promise.all([
    getPhotoPage(album.id, page),
    getMaxPosition(album.id),
  ]);

  const bucket = album.visibility === "members" ? "gallery-private" : "gallery";
  const nextPosition = maxPosition + 1;

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">
          Darkroom · {album.visibility === "members" ? "signed-in only" : "open"}
        </p>
        <h2 className="page__title">{album.title}</h2>
        <p className="fold-text__body">
          {plates.total} {plates.total === 1 ? "plate" : "plates"} ·{" "}
          <Link className="link" href={`/work/${album.slug}`}>
            View the public page →
          </Link>
        </p>
        <p>
          <Link className="link" href="/darkroom">
            ← All galleries
          </Link>
        </p>
      </section>

      <div className="dark-grid">
        <section className="panel">
          <h3 className="panel__title">Plates</h3>
          <AlbumAdmin
            album={album}
            photos={plates.items}
            offset={(plates.page - 1) * plates.perPage}
          />
          <Pager
            base={`/darkroom/${album.slug}`}
            page={plates.page}
            pages={plates.pages}
            total={plates.total}
            perPage={plates.perPage}
          />
        </section>

        <section className="panel">
          <h3 className="panel__title">Add plates</h3>
          <Uploader
            albumId={album.id}
            slug={album.slug}
            bucket={bucket}
            startPosition={nextPosition}
          />
          <p className="field__help">
            Next plate number: {plate(nextPosition)}
          </p>
        </section>
      </div>
    </div>
  );
}
