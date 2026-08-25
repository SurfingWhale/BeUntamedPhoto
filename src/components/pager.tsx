import Link from "next/link";

type Props = {
  base: string;
  page: number;
  pages: number;
  total: number;
  perPage: number;
  /** What is being counted, singular — "plate", "gallery". */
  noun?: string;
};

function href(base: string, page: number) {
  return page <= 1 ? base : `${base}?page=${page}`;
}

/**
 * Plain links, so paging works without JavaScript and each page is its own
 * URL the owner can share or bookmark.
 */
export function Pager({ base, page, pages, total, perPage, noun = "plate" }: Props) {
  if (pages <= 1) return null;

  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  return (
    <nav className="pager" aria-label={`${noun} pages`}>
      <p className="pager__count u-tabular">
        Page {page} of {pages} · {total} {total === 1 ? noun : `${noun}s`}
      </p>
      <div className="pager__links">
        {page > 1 ? (
          <Link className="link" href={href(base, page - 1)} rel="prev">
            ← Newer
          </Link>
        ) : (
          <span className="pager__off">← Newer</span>
        )}
        {page < pages ? (
          <Link className="link" href={href(base, page + 1)} rel="next">
            Older →
          </Link>
        ) : (
          <span className="pager__off">Older →</span>
        )}
      </div>
      <p className="u-sr">
        Showing {first} to {last} of {total}.
      </p>
    </nav>
  );
}
