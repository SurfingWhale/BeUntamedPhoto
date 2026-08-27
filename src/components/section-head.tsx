import Link from "next/link";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  /** Right-hand side: a count, and optionally somewhere to go. */
  count?: string;
  action?: { label: string; href: string };
};

/** Heading left, count and action right — the reference's section rhythm. */
export function SectionHead({ eyebrow, title, count, action }: Props) {
  return (
    <div className="sec-head">
      <div className="sec-head__left">
        {eyebrow && <span className="u-mono u-mono--block">{eyebrow}</span>}
        <h2 className="sec-head__title">{title}</h2>
      </div>
      <div className="sec-head__right">
        {count && <span className="sec-head__count u-tabular">{count}</span>}
        {action && (
          <Link className="btn btn--quiet" href={action.href}>
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
