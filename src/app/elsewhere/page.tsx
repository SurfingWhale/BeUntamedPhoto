import type { Metadata } from "next";

import { directory } from "@/lib/site";

export const metadata: Metadata = {
  title: "Elsewhere",
  description: "Where to look — sport, food, and the unsorted middle.",
};

export default function ElsewherePage() {
  return (
    <div className="page">
      <section className="page__intro">
        <h2 className="page__title">
          Where to <em>look</em>.
        </h2>
        <p className="fold-text__body">
          Sport and food each have a place of their own, where they can be seen
          properly. This archive is the unsorted middle — everything that
          belongs to neither.
        </p>
      </section>

      <section className="fold-text fold-text--tight">
        <div className="elsewhere">
          {directory.map((place, i) => (
            <a
              key={place.href}
              className="elsewhere__row reveal"
              style={{ "--i": i } as React.CSSProperties}
              href={place.href}
              target={place.external ? "_blank" : undefined}
              rel={place.external ? "noreferrer" : undefined}
            >
              <span className="elsewhere__looking">{place.looking}</span>
              <span className="elsewhere__name">{place.name}</span>
              <span className="elsewhere__what">{place.what}</span>
              <span className="elsewhere__go">
                {place.go} {place.external ? "↗" : "→"}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
