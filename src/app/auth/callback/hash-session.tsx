"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

/**
 * Supabase's default email templates use the implicit flow: GoTrue verifies the
 * token itself and hands the session back in the URL *fragment*. Fragments never
 * reach the server, so the exchange has to finish in the browser.
 */
export function HashSession({ next }: { next: string }) {
  const router = useRouter();
  const [failed, setFailed] = useState<string | null>(null);

  /* The whole handshake runs inside one async pass. The two failure paths
   * used to set state synchronously in the effect body, which costs a second
   * render before the browser has painted the first one. */
  useEffect(() => {
    let live = true;
    const fail = (message: string) => {
      if (live) setFailed(message);
    };

    void (async () => {
      const params = new URLSearchParams(window.location.hash.slice(1));

      const errorDescription = params.get("error_description");
      if (errorDescription) return fail(errorDescription);

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        return fail("That link has already been used, or it expired.");
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return fail(error.message);
      if (!live) return;

      // Drop the tokens out of the address bar before moving on.
      window.history.replaceState(null, "", window.location.pathname);
      router.replace(next);
      router.refresh();
    })();

    return () => {
      live = false;
    };
  }, [next, router]);

  return (
    <div className="auth">
      <div className="head">
        <h1 className="page__title">
          {failed ? "That link didn’t work" : "Signing you in…"}
        </h1>
        <p className="head__sub" role="status" aria-live="polite">
          {failed ?? "One moment — finishing the handshake."}
        </p>
      </div>
      {failed && (
        <p>
          <a className="link" href="/enter">
            Ask for a fresh link &rarr;
          </a>
        </p>
      )}
    </div>
  );
}
