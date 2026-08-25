/** Everything the page says about itself, in one place. */

export const site = {
  name: "UNTAMED",
  wordmark: ["UNTAM", "E", "D"] as const,
  tagline: "A visual archive by Muhammad Fauzy.",
  owner: "Muhammad Fauzy",
  email: "fauzymuhamad43@gmail.com",
  github: "https://github.com/Untamed98x",
  mastLine: "Visual archive · frames, not feeds",
};

export const nav = [
  { href: "/", label: "Archive" },
  { href: "/work", label: "Galleries" },
  { href: "/elsewhere", label: "Elsewhere" },
  { href: "/about", label: "About" },
  { href: "/notes", label: "Guestbook" },
] as const;

/**
 * Where to send someone by what they came looking for. The subject leads —
 * a visitor knows they want sport long before they know a site is called
 * UNTMD Sports.
 */
export const directory = [
  {
    looking: "Sport",
    name: "UNTMD Sports",
    what: "Court-side and field work — motion, sweat, the half-second before the point ends.",
    href: "https://untmd-sports.vercel.app/",
    go: "untmd-sports.vercel.app",
    external: true,
  },
  {
    looking: "Food",
    name: "VisuFavor",
    what: "Plated and photographed. Steam, char, the texture close enough to touch.",
    href: "https://visufavor.vercel.app/",
    go: "visufavor.vercel.app",
    external: true,
  },
  {
    looking: "Everything else",
    name: "This archive",
    what: "Frames that belong to neither pile — kept in order, left unsorted.",
    href: "/work",
    go: "open the galleries",
    external: false,
  },
] as const;

/** The external destinations only, for the footer link row. */
export const elsewhere = directory.filter((d) => d.external);
