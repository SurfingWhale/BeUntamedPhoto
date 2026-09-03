/** Everything the page says about itself, in one place. */

export const site = {
  name: "UNTAMED",
  wordmark: ["UNTAM", "E", "D"] as const,
  tagline: "A visual archive by Muhammad Fauzy.",
  owner: "Muhammad Fauzy",
  email: "untamed98x@gmail.com",
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

export const elsewhere = [
  {
    name: "UNTMD Sports",
    href: "https://untmd-sports.vercel.app/",
    what: "Court-side and field work — motion, sweat, the half-second before the point ends.",
    go: "untmd-sports.vercel.app",
  },
  {
    name: "VisuFavor",
    href: "https://visufavor.vercel.app/",
    what: "Food, plated and photographed. Steam, char, the texture close enough to touch.",
    go: "visufavor.vercel.app",
  },
  {
    name: "Surfing Whale",
    href: "https://surfing-whale.vercel.app/",
    what: "Studio notes and side projects — where things get built before they get shot.",
    go: "surfing-whale.vercel.app",
  },
] as const;
