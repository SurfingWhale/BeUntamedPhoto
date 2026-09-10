import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { AlbumView, albumMetadata } from "@/components/album-view";
import { getViewer } from "@/lib/auth";
import { clampPage, getAlbum } from "@/lib/gallery";

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

/**
 * A held-back gallery, read as the person reading it.
 *
 * The public pair at `/work/[slug]` and `/work/[slug]/p/[n]` is prerendered
 * and cached, which is what made the archive quick — and the price of that
 * cache is that neither may look at a cookie. Not by convention: a route with
 * `revalidate` and `generateStaticParams` is generated into the cache, and
 * `cookies()` during that render throws `DYNAMIC_SERVER_USAGE` outright. A
 * gallery whose plates are invisible without a session therefore cannot live
 * on those routes at all.
 *
 * So it lives here, on its own, rendered per request. Nothing is cached and
 * nothing should be: the plates are in the private bucket behind signed links
 * that last minutes. It is one link away from the notice on the cached page,
 * and the link only appears for someone already signed in.
 *
 * An open gallery has no business here — it already has a cached page, and a
 * second URL for the same plates would only split the cache and the search
 * result. It redirects.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return { ...(await albumMetadata(slug)), robots: { index: false, follow: false } };
}

export default async function AlbumPrivatePage({ params, searchParams }: Params) {
  const { slug } = await params;
  const page = clampPage((await searchParams).page);

  const album = await getAlbum(slug);
  if (!album) notFound();
  if (album.visibility !== "members") redirect(`/work/${album.slug}`);

  if (!(await getViewer())) {
    redirect(`/enter?next=${encodeURIComponent(`/work/${album.slug}/open`)}`);
  }

  return <AlbumView slug={slug} page={page} mode="private" />;
}
