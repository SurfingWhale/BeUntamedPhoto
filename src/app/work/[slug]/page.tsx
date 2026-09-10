import type { Metadata } from "next";

import { AlbumView, albumMetadata } from "@/components/album-view";

type Params = { params: Promise<{ slug: string }> };

/**
 * Page one of a gallery, prerendered on first request and served from the
 * cache after — which is why it takes no `searchParams`. Reading one would
 * make this the only page of the gallery that could not be cached, and it is
 * the page every visitor arrives on. The rest live at `p/[n]`.
 */
export const revalidate = 300;

/* An empty array is not the same as no function at all. Without it Next treats
 * every path under this segment as fully dynamic; with it, each path is
 * rendered the first time it is asked for and cached from then on. */
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return albumMetadata(slug);
}

export default async function AlbumPage({ params }: Params) {
  const { slug } = await params;
  return <AlbumView slug={slug} page={1} />;
}
