/** Everything the page says about itself, in one place. */

/**
 * The origin every absolute URL is built from — Open Graph images and the
 * manifest need one, and a relative og:image is simply ignored by WhatsApp.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every build, so this is correct
 * without any configuration. Set NEXT_PUBLIC_SITE_URL once a custom domain is
 * attached, otherwise cards keep pointing at the vercel.app hostname.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const site = {
  name: "UNTAMED",
  wordmark: ["UNTAM", "E", "D"] as const,
  tagline: "A visual archive by Fauzy.",
  owner: "Fauzy",
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
