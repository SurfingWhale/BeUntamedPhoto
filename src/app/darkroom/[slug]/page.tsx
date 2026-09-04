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

  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  const page = clampPage((await searchParams).page);

  /* The next position comes from the database, not from the page on screen.
   * Reducing over the rows in view was right only while every row was in
   * view — on page two it would hand the uploader a position that is already
   * taken, and the new plates would interleave with the old ones. */
  const [plates, maxPosition] = await Promise.all([
    getPhotoPage(album.id, page),
    getMaxPosition(album.id),
  ]);
  const photos = plates.items;
  const bucket = album.visibility === "members" ? "gallery-private" : "gallery";
  const nextPosition = maxPosition + 1;

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">
          Darkroom · {album.visibility === "members" ? "signed-in only" : "open"}
        </p>
        <h1 className="page__title">{album.title}</h1>
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
          <h2 className="panel__title">Plates</h2>
          <AlbumAdmin
            album={album}
            photos={photos}
            offset={(plates.page - 1) * plates.perPage}
            total={plates.total}
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
          <h2 className="panel__title">Add plates</h2>
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
