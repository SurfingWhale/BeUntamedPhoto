"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const SW_URL = "/sw.js";

/**
 * Registers the worker in production only.
 *
 * In development /_next/static filenames are not content-hashed the way a build
 * makes them, so a worker caching them would serve yesterday's chunks — exactly
 * the staleness this setup exists to avoid. So dev actively unregisters instead.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((rs) => rs.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }

    navigator.serviceWorker.register(SW_URL).catch(() => {
      // A failed registration costs nothing here — the site is network-first
      // by design and works identically without a worker.
    });
  }, []);

  return null;
}

type State =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; caches: number; workers: number }
  | { kind: "error"; message: string };

/**
 * Owner-only cache reset.
 *
 * Note what this can and cannot reach: it drops every Cache Storage entry and
 * unregisters the workers, then reloads. It cannot clear the browser's own HTTP
 * cache — no page can — but that one respects the build hashes, so a deploy
 * already busts it. What actually goes stale on a phone is an installed copy
 * holding old assets, and that is what this clears.
 */
export function ClearCache() {
  const [state, setState] = useState<State>({ kind: "idle" });
  /* Whether the browser exposes anything to clear is a client-only fact, and
   * useSyncExternalStore is how you read one without setting state from an
   * effect. The server snapshot assumes support, so the control renders enabled
   * and is corrected on hydration if it turns out not to be. */
  const supported = useSyncExternalStore(
    () => () => {},
    () => "caches" in window || "serviceWorker" in navigator,
    () => true,
  );

  async function purge() {
    setState({ kind: "working" });
    try {
      // Ask a live worker to drop its caches before it loses the chance.
      navigator.serviceWorker?.controller?.postMessage("untamed:purge");

      const names = "caches" in window ? await caches.keys() : [];
      await Promise.all(names.map((n) => caches.delete(n)));

      const regs =
        "serviceWorker" in navigator
          ? await navigator.serviceWorker.getRegistrations()
          : [];
      await Promise.all(regs.map((r) => r.unregister()));

      setState({ kind: "done", caches: names.length, workers: regs.length });
      // Long enough to read the count, short enough not to feel stuck.
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not clear the cache.",
      });
    }
  }

  const working = state.kind === "working" || state.kind === "done";

  return (
    <>
      <div>
        <button
          className="btn btn--quiet"
          type="button"
          onClick={purge}
          disabled={working || !supported}
          aria-disabled={working || !supported}
        >
          {state.kind === "working" && <span className="btn__spin" aria-hidden="true" />}
          Clear cache
        </button>
      </div>

      <p className="field__help" aria-live="polite">
        {!supported
          ? "This browser exposes no cache storage to clear."
          : state.kind === "done"
            ? `Cleared ${state.caches} ${state.caches === 1 ? "cache" : "caches"} and ` +
              `${state.workers} ${state.workers === 1 ? "worker" : "workers"} — reloading…`
            : state.kind === "error"
              ? state.message
              : "Drops the installed app's stored assets and reloads. Your sign-in is not affected."}
      </p>
    </>
  );
}
