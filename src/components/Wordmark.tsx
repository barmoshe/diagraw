/** The Diagraw wordmark: a schematic node-edge-node glyph + the name.
 * `draw` makes the glyph self-draw (used large in the hero); static in the nav. */
export default function Wordmark({
  draw = false,
  className = "",
}: {
  draw?: boolean;
  className?: string;
}) {
  return (
    <span className={`wordmark ${className}`}>
      <svg
        className={`wordmark-glyph ${draw ? "bp-selfdraw" : ""}`}
        viewBox="0 0 32 24"
        width="28"
        height="21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="5" cy="12" r="3.2" pathLength={1} />
        <path d="M8.5 12 H20" pathLength={1} />
        <path d="M17 9 L20 12 L17 15" pathLength={1} />
        <rect x="20.5" y="6.5" width="9" height="11" rx="1" pathLength={1} />
      </svg>
      <span className="wordmark-name">Diagraw</span>
    </span>
  );
}
