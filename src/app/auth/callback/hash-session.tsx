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

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));

    const errorDescription = params.get("error_description");
    if (errorDescription) {
      setFailed(errorDescription);
      return;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setFailed("That link has already been used, or it expired.");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setFailed(error.message);
          return;
        }
        // Drop the tokens out of the address bar before moving on.
        window.history.replaceState(null, "", window.location.pathname);
        router.replace(next);
        router.refresh();
      });
  }, [next, router]);

  return (
    <div className="auth">
      <div className="head">
        <h2 className="page__title">
          {failed ? "That link didn’t work" : "Signing you in…"}
        </h2>
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
