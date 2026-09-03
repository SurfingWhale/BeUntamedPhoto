/**
 * The running strip. Movement comes from real archive metadata — gallery
 * counts, lane names, the year — never invented sale copy.
 *
 * The track is rendered twice so the loop is seamless; the duplicate is
 * hidden from assistive tech.
 */
export function Ticker({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  const track = (dup: boolean) => (
    <div className="ticker__track" aria-hidden={dup || undefined}>
      {items.map((item, i) => (
        <span key={`${item}-${i}`} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="ticker__dot" aria-hidden="true" />
          <span>{item}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="ticker">
      {track(false)}
      {track(true)}
    </div>
  );
}
