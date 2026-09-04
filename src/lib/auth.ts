import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string | null;
  displayName: string;
  isOwner: boolean;
} | null;

/**
 * Deduped for the length of one request.
 *
 * The layout asks who is here to draw the masthead, and then most pages ask
 * again to decide what to show — two auth calls and two profile selects for
 * one page. A round trip to this project measures about 330ms, so the repeat
 * was costing more than every query on the page put together.
 *
 * react's cache() keys on the arguments, and this takes none, so the second
 * caller of a request gets the first caller's result.
 */
export const getViewer = cache(async function getViewer(): Promise<Viewer> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "Visitor",
    isOwner: profile?.role === "owner",
  };
});
