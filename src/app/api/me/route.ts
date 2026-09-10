import { getViewer } from "@/lib/auth";

/**
 * Who is signed in, for the parts of the page that differ by reader.
 *
 * The root layout used to answer this on the server, which made every page —
 * the home page included — read cookies, and a page that reads cookies is
 * rendered per request and sent with `no-store`. That put the whole public
 * site outside every cache for the sake of one link in the corner and a form
 * at the bottom of the guestbook. They ask for themselves now.
 *
 * This response is per-visitor and must never be shared or stored. `id` is the
 * reader's own and only ever sent to them: the guestbook needs it to know which
 * notes offer a remove button, and whether a remove actually happens is still
 * decided by the row policy in Postgres.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getViewer();

  return Response.json(
    viewer && { id: viewer.id, displayName: viewer.displayName, isOwner: viewer.isOwner },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
