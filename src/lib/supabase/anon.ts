import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * A server client with no session attached.
 *
 * Two reasons it exists. Next's cache scope cannot read cookies, so anything
 * cached has to be fetched without them. And more importantly it makes the
 * cached result provably anonymous: RLS gives this client exactly what a
 * signed-out visitor may see, so a cache filled by it can never hold a
 * held-back gallery's plates.
 *
 * Never use it to decide what someone may see. It is for reading the public
 * slice, nothing else.
 */
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
