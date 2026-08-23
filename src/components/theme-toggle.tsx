"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const KEY = "untamed-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Theme | null;
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setTheme(stored ?? system);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
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
      {theme === null ? "     " : label}
    </button>
  );
}
