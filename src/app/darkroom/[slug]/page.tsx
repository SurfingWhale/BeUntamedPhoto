import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { AlbumAdmin } from "@/components/album-admin";
import { Uploader } from "@/components/uploader";
import { getAlbum, getPhotos } from "@/lib/gallery";
import { getViewer } from "@/lib/auth";
import { plate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Darkroom", robots: { index: false } };

export default async function DarkroomAlbumPage({ params }: Params) {
  const viewer = await getViewer();
  if (!viewer) redirect("/enter?next=%2Fdarkroom");
  if (!viewer.isOwner) redirect("/work");

  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  const photos = await getPhotos(album.id);
  const bucket = album.visibility === "members" ? "gallery-private" : "gallery";
  const nextPosition = photos.reduce((max, p) => Math.max(max, p.position), -1) + 1;

  return (
    <div className="page">
      <section className="page__intro">
        <p className="u-mono">
          Darkroom · {album.visibility === "members" ? "signed-in only" : "open"}
        </p>
        <h2 className="page__title">{album.title}</h2>
        <p className="fold-text__body">
          {photos.length} {photos.length === 1 ? "plate" : "plates"} ·{" "}
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
          <AlbumAdmin album={album} photos={photos} />
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
