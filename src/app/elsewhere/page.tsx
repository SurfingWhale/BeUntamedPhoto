import type { Metadata } from "next";

import { Lanes } from "@/components/lanes";
import { getFeatured } from "@/lib/gallery";
import { Reveal } from "@/components/motion";
import { elsewhere } from "@/lib/site";

/* Prerendered and revalidated: one featured frame and the lanes, nothing
 * per-visitor. */
export const revalidate = 300;

/* Counted and named from `elsewhere`, not written out.
 *
 * The heading said "Three sites, one practice." and the description named both
 * satellites by hand, in a file whose entire subject is a list that lives in
 * site.ts — so adding or dropping a lane would have left this page confidently
 * claiming three of them while `<Lanes />` below rendered a different number.
 * The home page already derives the identical line (`${elsewhere.length + 1}
 * sites,`) and says in its own comment that this is why. This page is the one
 * that had not been brought along.
 *
 * Plus one, both here and there: this archive is a lane too, and it is the one
 * the reader is standing on. */
const SITES = elsewhere.length + 1;

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
          {SITES} sites, one <em>practice</em>.
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
