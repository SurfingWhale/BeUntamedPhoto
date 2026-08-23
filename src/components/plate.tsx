/**
 * An empty archive slot. Deliberately not a stock photograph — the page
 * admits the frame hasn't been made yet rather than faking one.
 */
export function Plate({ no, label }: { no: string; label?: string }) {
  return (
    <div className="plate" role="img" aria-label={`Empty plate ${no}${label ? ` — ${label}` : ""}`}>
      <span className="plate__no">Plate {no}</span>
      <span>{label ?? "slot open"}</span>
    </div>
  );
}
