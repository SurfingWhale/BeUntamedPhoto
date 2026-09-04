"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const KEY = "untamed-theme";
const CHANGED = "untamed-theme-change";

/**
 * `<html data-theme>` is the single source of truth. The boot script in the
 * layout sets it before first paint, so reading the attribute here can never
 * disagree with what is already on screen — and reading it through
 * useSyncExternalStore keeps the toggle off setState-in-an-effect, which
 * costs a second render pass on every mount.
 */
function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(CHANGED, onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    media.removeEventListener("change", onChange);
  };
}

function read(): Theme {
  const set = document.documentElement.getAttribute("data-theme");
  if (set === "dark" || set === "light") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  /* null on the server and on the first client render alike, so the markup
   * hydrates without a mismatch; the real value arrives immediately after. */
  const theme = useSyncExternalStore(subscribe, read, () => null);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* Private mode, or storage is full — the attribute still holds for
         this page, the choice just will not survive a reload. */
    }
    window.dispatchEvent(new Event(CHANGED));
  }

  // Render a stable-width control before hydration so the row never reflows.
  const label = theme === "dark" ? "Light" : "Dark";

  return (
    <button
      type="button"
      className="tog"
      onClick={toggle}
      aria-label={`Switch to ${label.toLowerCase()} appearance`}
    >
      {theme === null ? "     " : label}
    </button>
  );
}
