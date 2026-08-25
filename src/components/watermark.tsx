/**
 * The registration mark, sat in the corner of a plate. It frames rather than
 * covers, which is the whole reason this mark was chosen for the job.
 */
export function Watermark() {
  return (
    <span className="wm" aria-hidden="true">
      <svg viewBox="0 0 100 100" fill="none">
        <g stroke="currentColor" strokeWidth="8" strokeLinejoin="miter">
          <path d="M12 34V12h22" />
          <path d="M66 12h22v22" />
          <path d="M88 66v22H66" />
          <path d="M34 88H12V66" />
        </g>
      </svg>
    </span>
  );
}
