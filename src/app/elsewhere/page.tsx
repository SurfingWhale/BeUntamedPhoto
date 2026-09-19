import type { Metadata } from "next";

import { Lanes } from "@/components/lanes";
import { getFeatured } from "@/lib/gallery";
import { Reveal } from "@/components/motion";
import { elsewhere } from "@/lib/site";

/* Prerendered and revalidated: one featured frame and the lanes, nothing
 * per-visitor. */
export const revalidate = 300;

/* Named from `elsewhere`, not written out.
 *
 * The heading said "Three sites, one practice." and the description named both
 * satellites by hand, in a file whose entire subject is a list that lives in
 * site.ts — so adding or dropping a lane would have left this page confidently
 * claiming three while `<Lanes />` below rendered a different number.
 *
 * It no longer counts sites at all. A site-count is an answer to a question no
 * visitor has; what this page has to say is that the sport and food work
 * exists and is shot from here. The home page's own opening for this section
 * says the same thing in the same words. */

export const metadata: Metadata = {
  title: "Elsewhere",
  description: `The other sites — ${elsewhere
    .map((e) => `${e.name} for ${e.lane.toLowerCase()}`)
    .join(", ")}.`,
};

export default async function ElsewherePage() {
  const [frame] = await getFeatured(1);

  return (
    <div className="page">
      <Reveal as="section" className="page__intro" index={0}>
        <h1 className="page__title">
          {elsewhere.map((e) => e.lane.toLowerCase()).join(" and ")}, <em>too</em>.
        </h1>
        {/* "work has", not "lanes have": the subject is the work, so the
            sentence reads correctly whether the list names two lanes or one.
            Deriving a list and then hanging a plural verb off it only moves
            the drift from the count to the grammar. */}
        <p className="fold-text__body">
          Every genre is booked from this site. The{" "}
          {elsewhere.map((e) => e.lane.toLowerCase()).join(" and ")} work has
          enough behind it to warrant its own ground, where a client can see
          the depth of it.
        </p>
      </Reveal>

      <Lanes
        archiveBanner={
          frame
            ? {
                url: frame.url,
                srcSet: frame.srcSet,
                caption: frame.caption,
                width: frame.width,
                height: frame.height,
              }
            : null
        }
      />
    </div>
  );
}
