import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AlbumView, albumMetadata } from "@/components/album-view";

type Params = { params: Promise<{ slug: string; n: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  return [];
}

/**
 * The page number, or nothing.
 *
 * Page one has its own URL at the base of the gallery, so `/p/1` is a second
 * address for the same plates — it redirects rather than answering. Anything
 * that is not a whole number above one was never a page.
 */
function parsePage(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 2 ? n : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, n } = await params;
  return albumMetadata(slug, parsePage(n) ?? 1);
}

export default async function AlbumPagedPage({ params }: Params) {
  const { slug, n } = await params;
  const page = parsePage(n);
  if (page === null) {
    if (n === "1") redirect(`/work/${slug}`);
    notFound();
  }
  return <AlbumView slug={slug} page={page} />;
}
