import "server-only";

import { unstable_cache } from "next/cache";

import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";

export type Note = {
  id: string;
  album_id: string | null;
  body: string;
  created_at: string;
  user_id: string;
  display_name: string;
  /**
   * Who the note is signed by, and always safe to render or serialise.
   *
   * `getNotes` substitutes the archive's byline for any owner-authored note
   * before returning, so nothing downstream has to remember to. That is the
   * point: this array is handed to a client component, which means every field
   * on it is serialised into the HTML and held in a shared cache, whether or
   * not anything renders it.
   */
};

/**
 * The ids of any owner-role account.
 *
 * Read separately rather than joined into `notes_with_author`, because that
 * would need a migration run against the live project and this needs to hold
 * without one. `profiles` is world-readable by policy — `profiles_read ...
 * using (true)` in supabase/schema.sql — so the anonymous client can see
 * `role`, and it must be the anonymous client: a cookie read here would make
 * every page that shows a guestbook render per request and ship `no-store`.
 *
 * One row, cached for an hour. An owner account is not something that changes
 * between two page loads.
 */
const readOwnerIds = unstable_cache(
  async (): Promise<string[]> => {
    const { data, error } = await createAnonClient()
      .from("profiles")
      .select("id")
      .eq("role", "owner");
    if (error) {
      // Not fatal, and deliberately so: the fallback is the stored display
      // name, which is what shipped before this existed. A guestbook that 500s
      // is worse than one that signs a note the old way.
      console.error("[notes] owner lookup failed:", error.message);
      return [];
    }
    return (data ?? []).map((r) => r.id as string);
  },
  ["owner-ids"],
  { revalidate: 3600 },
);


/**
 * Notes on an album, or the guestbook when albumId is null.
 *
 * `scope` is not a performance knob. The anonymous client cannot see notes on
 * a held-back gallery — the policy ties a note's visibility to its album's —
 * so a page showing one has to ask as the viewer. Everywhere else "public" is
 * both correct and cacheable, because reading a cookie is what stops a page
 * being cached at all.
 */
export async function getNotes(
  albumId: string | null,
  scope: "public" | "viewer" = "public",
  limit = 50,
): Promise<Note[]> {
  const supabase = scope === "public" ? createAnonClient() : await createClient();
  let query = supabase
    .from("notes_with_author")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  query = albumId === null ? query.is("album_id", null) : query.eq("album_id", albumId);

  const [{ data }, owners] = await Promise.all([query, readOwnerIds()]);
  const rows = (data ?? []) as Note[];

  /* Sign the owner's own notes as the archive, here and not in a component.
   *
   * The guestbook is public, prerendered, and held in a shared cache for five
   * minutes, and `profiles.display_name` defaults to the email local-part — so
   * a note left by the owner published a personal name to every visitor. The
   * rule in CLAUDE.md is standing and categorical.
   *
   * Substituting it in the panel was tried first and was not enough: these
   * rows are props of a client component, so the raw value was serialised into
   * the RSC payload and sat in view-source — rendered correctly, leaked
   * anyway. Verified by planting a personal name in a fixture and grepping the
   * served HTML for it. The name has to be gone before the data leaves the
   * server, which is here.
   */
  const owned = new Set(owners);
  return rows.map((n) =>
    owned.has(n.user_id) ? { ...n, display_name: site.byline } : n,
  );
}
