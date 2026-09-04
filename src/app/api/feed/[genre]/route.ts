import { NextResponse } from "next/server";

import { getGenreFeed } from "@/lib/gallery";
import { elsewhere, genreIds, site, type Genre } from "@/lib/site";

/**
 * The genre feed: what a satellite site reads to render its own portfolio from
 * this archive.
 *
 * Scoping is the route, not a promise. A satellite asks for the genre in its
 * own URL and cannot address another one, so there is no key to hand out and
 * nothing to trust it with. Held-back galleries never reach here — see
 * getGenreFeed, which excludes them in the query.
 */
export const dynamic = "force-dynamic";

/**
 * The satellites fetch this from the visitor's browser, not from their server,
 * so the browser enforces CORS and the allowlist has to be real. Derived from
 * the sites already listed in site.ts rather than typed again here: two lists
 * of origins would disagree the first time one of them moved.
 */
const ALLOWED = new Set(elsewhere.map((e) => new URL(e.href).origin));

function cors(origin: string | null): Record<string, string> {
  if (!origin || !ALLOWED.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
  };
}

/** 5 minutes fresh, a day stale-while-revalidate: a portfolio is not a feed of
 * news, and a satellite should never wait on this archive to render. */
const CACHE = "public, s-maxage=300, stale-while-revalidate=86400";

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: { ...cors(req.headers.get("origin")), "Access-Control-Allow-Methods": "GET" },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ genre: string }> },
) {
  const { genre } = await params;
  const headers = cors(req.headers.get("origin"));

  if (!genreIds.includes(genre as Genre)) {
    return NextResponse.json(
      { error: "unknown genre", known: genreIds },
      { status: 404, headers },
    );
  }

  const photos = await getGenreFeed(genre as Genre);

  return NextResponse.json(
    { site: site.name.toLowerCase(), genre, photos },
    { headers: { ...headers, "Cache-Control": CACHE } },
  );
}
