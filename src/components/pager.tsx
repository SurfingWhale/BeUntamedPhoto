import Link from "next/link";

type Props = {
  /** Path without a query string — the page number is appended here. */
  base: string;
  page: number;
  pages: number;
  total: number;
  perPage: number;
  /** What is being counted, singular. "plate" reads better than "item". */
  unit?: string;
};

/**
 * Page controls for a gallery.
 *
 * Plain links, not a client component: the pages they point at are rendered on
 * the server anyway, and a link works before any JavaScript has loaded.
 */
export function Pager({ base, page, pages, total, perPage, unit = "plate" }: Props) {
  if (pages <= 1) return null;

  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);
  const href = (n: number) => (n <= 1 ? base : `${base}?page=${n}`);

  return (
    <nav className="pager" aria-label="Pages">
      <p className="pager__count">
        {first}–{last} of {total} {total === 1 ? unit : `${unit}s`} · page {page} of {pages}
      </p>
      <div className="pager__links">
        {page > 1 ? (
          <Link className="link" href={href(page - 1)} rel="prev">
            ← Previous
          </Link>
        ) : (
          <span className="pager__off">← Previous</span>
        )}
        {page < pages ? (
          <Link className="link" href={href(page + 1)} rel="next">
            Next →
          </Link>
        ) : (
          <span className="pager__off">Next →</span>
        )}
      </div>
    </nav>
  );
}
