/**
 * The exposed Swiss grid. Hairline column rules run the full height of the
 * viewport inside the 1440px measure, with `+` crosshairs pinned at the
 * register marks — the structure is the ornament, per design.md § Grid.
 *
 * Fixed and pointer-events-none, so it sits under everything and never
 * intercepts a click. Purely decorative, so it is hidden from assistive tech.
 */
export function GridLines() {
  return (
    <div className="gridlines" aria-hidden="true">
      <div className="gridlines__cols" />
      <div className="gridlines__marks">
        {["tl", "tr", "ml", "mr", "bl", "br"].map((pos) => (
          <span key={pos} className={`gridlines__plus gridlines__plus--${pos}`}>
            +
          </span>
        ))}
      </div>
    </div>
  );
}
