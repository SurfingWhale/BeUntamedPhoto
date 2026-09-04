"use client";

import { useEffect } from "react";

/**
 * Fades a photograph in as it decodes, rather than letting it snap into place.
 *
 * On a site that is mostly photographs, the pop of an image appearing is the
 * one piece of motion worth having: it is tied to something real happening,
 * not added on top. Everything else here stays still.
 *
 * The hiding is keyed on data-media="js", which the boot script in the layout
 * sets before first paint. Without it the rule never applies, so a browser
 * with JavaScript off shows every photograph immediately instead of a page of
 * empty frames — and there is no flash, because the attribute lands before
 * anything is painted rather than on mount.
 */
export function MediaFade() {
  useEffect(() => {
    const mark = (img: HTMLImageElement) => {
      img.dataset.loaded = "true";
    };
    for (const img of Array.from(document.images)) {
      if (img.complete) mark(img);
      else img.addEventListener("load", () => mark(img), { once: true });
      // A broken image should not sit invisible forever.
      img.addEventListener("error", () => mark(img), { once: true });
    }
  }, []);

  return null;
}
