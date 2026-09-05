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

  /* One asynchronous pass, so every outcome is reported the same way.
   *
   * The synchronous failures used to set state straight from the effect body,
   * which is what react-hooks/set-state-in-effect objects to and also meant
   * three different shapes of "this went wrong". Reading the hash cannot move
   * to render — the server has no hash and would hydrate a different answer —
   * so the work stays in the effect and the reporting moves off its body. The
   * cancelled flag is the other half: this component navigates away on
   * success, and a late setState on an unmounted component is a warning
   * waiting to happen. */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const errorDescription = params.get("error_description");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (errorDescription) {
        if (!cancelled) setFailed(errorDescription);
        return;
      }
      if (!accessToken || !refreshToken) {
        if (!cancelled) setFailed("That link has already been used, or it expired.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (cancelled) return;
      if (error) {
        setFailed(error.message);
        return;
      }
      // Drop the tokens out of the address bar before moving on.
      window.history.replaceState(null, "", window.location.pathname);
      router.replace(next);
      router.refresh();
    })();

    return () => {
      cancelled = true;
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
