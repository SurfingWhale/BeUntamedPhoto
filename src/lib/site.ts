/** Everything the page says about itself, in one place. */

export const site = {
  name: "UNTAMED",
  wordmark: ["UNTAM", "E", "D"] as const,
  tagline: "A visual archive.",
  /**
   * The public byline — every page that signs off reads from here. It is the
   * brand rather than a legal name on purpose: a name is the strongest thing
   * tying this work to whoever made it. Change this one line to undo that.
   */
  byline: "UNTAMED",
  /**
   * The only contact route on the site. This address is the other strong
   * identifier — swap it for one that exists solely for the archive and
   * nothing else here needs to change.
   */
  email: "fauzymuhamad43@gmail.com",
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
