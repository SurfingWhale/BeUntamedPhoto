import type { Metadata } from "next";

import { Reveal } from "@/components/motion";
import { elsewhere } from "@/lib/site";

export const metadata: Metadata = {
  title: "Elsewhere",
  description: "The other sites — UNTMD Sports for sport, VisuFavor for food.",
};

export default function ElsewherePage() {
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

      <section className="fold-text fold-text--tight">
        <div className="elsewhere">
          {elsewhere.map((place, i) => (
            <Reveal
              as="a"
              key={place.href}
              index={i}
              className="elsewhere__row"
              href={place.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="elsewhere__name">{place.name}</span>
              <span className="elsewhere__what">{place.what}</span>
              <span className="elsewhere__go">{place.go} ↗</span>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
