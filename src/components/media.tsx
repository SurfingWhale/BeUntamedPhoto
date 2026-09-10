"use client";

import { useEffect } from "react";

/**
 * Fades a photograph in as it decodes, rather than letting it snap into place.
 *
 * On a site that is mostly photographs this is the one piece of motion tied to
 * something real happening. The hiding is keyed on data-media="js", which the
 * boot script in the layout sets before first paint, so a browser with
 * JavaScript off shows every photograph immediately instead of a page of empty
 * frames — and there is no flash, because the attribute lands before anything
 * is painted rather than on mount.
 *
 * The observer is not optional. The first version swept document.images once
 * on mount, which covered every server-rendered frame and nothing else: an
 * image added later never received data-loaded, and the CSS left it at
 * opacity 0 permanently. That is exactly what the upload staging grid is —
 * previews created from a local blob after the page is up — so composing a set
 * showed empty boxes where the photographs should be. Proven in a browser:
 * an <img> appended after mount reported complete: true, naturalWidth 40, and
 * a computed opacity of 0.
 */
export function MediaFade() {
  useEffect(() => {
    const mark = (img: HTMLImageElement) => {
      img.dataset.loaded = "true";
    };

    const watch = (img: HTMLImageElement) => {
      if (img.dataset.loaded === "true") return;
      if (img.complete) {
        mark(img);
        return;
      }
      img.addEventListener("load", () => mark(img), { once: true });
      // A broken image should not sit invisible forever.
      img.addEventListener("error", () => mark(img), { once: true });
    };

    for (const img of Array.from(document.images)) watch(img);

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of Array.from(record.addedNodes)) {
          if (!(node instanceof Element)) continue;
          if (node instanceof HTMLImageElement) watch(node);
          // A staged plate arrives inside its row, not on its own.
          for (const img of Array.from(node.querySelectorAll("img"))) watch(img);
        }
        // A src swapped on an existing element starts a new load.
        if (
          record.type === "attributes" &&
          record.target instanceof HTMLImageElement
        ) {
          delete record.target.dataset.loaded;
          watch(record.target);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "srcset"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
