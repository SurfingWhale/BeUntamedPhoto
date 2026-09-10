import type { Metadata } from "next";

import { Lanes } from "@/components/lanes";
import { getFeatured } from "@/lib/gallery";

/* Prerendered and revalidated: one featured frame and three fixed lanes,
 * nothing per-visitor. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Elsewhere",
  description: "The other sites — UNTMD Sports for sport, VisuFavor for food.",
};

export default async function ElsewherePage() {
  const [frame] = await getFeatured(1);

  return (
    <div className="page">
      <section className="page__intro">
        <h1 className="page__title">
          Three sites, one <em>practice</em>.
        </h1>
        <p className="fold-text__body">
          Every genre is booked from this site. Sport and food have enough work
          to warrant their own ground, where a client can see the depth of it.
        </p>
      </section>

      <Lanes
        archiveBanner={
          frame
            ? { url: frame.url, caption: frame.caption, width: frame.width, height: frame.height }
            : null
        }
      />
    </div>
  );
}
