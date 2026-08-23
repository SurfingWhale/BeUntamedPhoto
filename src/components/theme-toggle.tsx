"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const KEY = "untamed-theme";
const QUERY = "(prefers-color-scheme: dark)";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => {
    listeners.delete(onChange);
    media.removeEventListener("change", onChange);
  };
}

// The boot script in the layout stamps data-theme only when a choice is stored;
// with no choice on record the ground comes from the system preference.
function read(): Theme {
  const stamped = document.documentElement.getAttribute("data-theme");
  if (stamped === "dark" || stamped === "light") return stamped;
  return window.matchMedia(QUERY).matches ? "dark" : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, read, () => null);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
    for (const listener of listeners) listener();
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
