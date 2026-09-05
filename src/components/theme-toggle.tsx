"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const KEY = "untamed-theme";

/**
 * The stored preference is an external store, so it is read with the API for
 * reading external stores.
 *
 * It used to load in an effect and then set state, which meant the control
 * rendered once knowing nothing and again knowing the answer — and left a
 * react-hooks/set-state-in-effect error standing. useSyncExternalStore reads
 * during render, keeps the server snapshot separate, and re-reads when the
 * system preference changes or another tab writes the key.
 */
function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Theme {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Private mode and blocked storage both throw. The system answer stands.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** The server cannot know, and must not guess — see the placeholder below. */
function getServerSnapshot(): Theme | null {
  return null;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // The attribute is already set, so the page follows even if it cannot
      // be remembered.
    }
    // storage does not fire in the tab that wrote it.
    window.dispatchEvent(new Event("storage"));
  }, [theme]);

  const label = theme === "dark" ? "Light" : "Dark";
  // Non-breaking spaces, because HTML collapses a run of ordinary ones — the
  // placeholder has to hold the width or the masthead reflows on hydration.
  const placeholder = "    ";

  return (
    <button
      type="button"
      className="tog"
      onClick={toggle}
      aria-label={`Switch to ${(theme === "dark" ? "light" : "dark")} appearance`}
    >
      {theme === null ? placeholder : label}
    </button>
  );
}
