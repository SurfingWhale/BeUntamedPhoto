import "server-only";

import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";

export type Note = {
  id: string;
  album_id: string | null;
  body: string;
  created_at: string;
  user_id: string;
  display_name: string;
};

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

  const { data } = await query;
  return (data ?? []) as Note[];
}
