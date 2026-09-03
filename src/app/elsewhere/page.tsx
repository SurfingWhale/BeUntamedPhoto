import type { Metadata } from "next";

import { elsewhere } from "@/lib/site";

export const metadata: Metadata = {
  title: "Elsewhere",
  description: "The other sites — UNTMD Sports, VisuFavor, Surfing Whale.",
};

export default function ElsewherePage() {
  return (
    <div className="page">
      <section className="page__intro">
        <h1 className="page__title">
          Three sites, one <em>practice</em>.
        </h1>
        <p className="fold-text__body">
          The archive here is the unsorted middle. The specialised work lives on
          its own ground, where it can be seen properly.
        </p>
      </section>

      <section className="fold-text fold-text--tight">
        <div className="elsewhere">
          {elsewhere.map((place, i) => (
            <a
              key={place.href}
              className="elsewhere__row reveal"
              style={{ "--i": i } as React.CSSProperties}
              href={place.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="elsewhere__name">{place.name}</span>
              <span className="elsewhere__what">{place.what}</span>
              <span className="elsewhere__go">{place.go} ↗</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
