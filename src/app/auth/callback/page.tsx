import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { HashSession } from "./hash-session";

export const dynamic = "force-dynamic";

type Search = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function safeNext(value: string | null): string {
  // Same-origin paths only — never an absolute URL from the query string.
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/work";
}

/**
 * Handles every shape Supabase can send a visitor back in:
 *   ?code=…                  PKCE
 *   ?token_hash=…&type=…     token-hash templates
 *   #access_token=…          implicit (the default email templates)
 */
export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const next = safeNext(one(sp.next));
  const code = one(sp.code);
  const tokenHash = one(sp.token_hash);
  const type = one(sp.type) as EmailOtpType | null;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    redirect(error ? "/enter?error=exchange_failed" : next);
  }

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    redirect(error ? "/enter?error=exchange_failed" : next);
  }

  return <HashSession next={next} />;
}
