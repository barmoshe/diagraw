/**
 * Draw-order heuristics.
 *
 * The engine needs to decide *when* each element animates. A full topological
 * source->sink walk requires parsing the graph out of mermaid's version-specific
 * element ids, which is brittle. Instead we use a robust, universal proxy:
 * **geometric position along the diagram's primary flow axis.**
 *
 * Mermaid lays diagrams out along their flow direction: flowchart TB and
 * sequence diagrams read top-to-bottom, flowchart LR and timelines read
 * left-to-right. So sorting elements by position along the dominant axis
 * approximates source->sink for the whole diagram-type family, with no graph
 * parsing and no id-format assumptions. A true topological pass can layer on
 * top later for flowcharts (see ROADMAP); this is the reliable default.
 */

export type Axis = "x" | "y";

export interface Positioned {
  el: SVGGraphicsElement;
  /** Center coordinate along the chosen axis, in the SVG's user space. */
  pos: number;
}

/** Parse a `translate(x, y)` out of an element's transform attribute, if any.
 * Mermaid positions node groups this way, and reading it avoids getBBox, which
 * throws on groups containing <foreignObject> (mermaid's HTML labels). */
function translateOf(el: SVGElement): { x: number; y: number } | null {
  const tr = el.getAttribute("transform");
  if (!tr) return null;
  const m = /translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/.exec(tr);
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
}

/** Center of an element in local user units. Prefers the element's own
 * translate (robust for nodes); falls back to getBBox for untransformed
 * strokes like edge paths. Needs the element attached to a rendered document. */
function centerOf(el: SVGGraphicsElement): { x: number; y: number } | null {
  const t = translateOf(el);
  if (t && (t.x !== 0 || t.y !== 0)) return t;
  try {
    const b = el.getBBox();
    if (!b.width && !b.height) return t; // may be a real translate(0,0)
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  } catch {
    return t;
  }
}

/**
 * Detect the primary flow axis from the spread of node centers. If nodes spread
 * wider horizontally than vertically, the flow is horizontal (order by x);
 * otherwise vertical (order by y). Falls back to "y" (top-to-bottom) when the
 * diagram is too small or geometry is unavailable.
 */
export function detectAxis(nodes: SVGGraphicsElement[]): Axis {
  const centers = nodes
    .map(centerOf)
    .filter((c): c is { x: number; y: number } => c !== null);
  if (centers.length < 2) return "y";
  const xs = centers.map((c) => c.x);
  const ys = centers.map((c) => c.y);
  const spreadX = Math.max(...xs) - Math.min(...xs);
  const spreadY = Math.max(...ys) - Math.min(...ys);
  return spreadX > spreadY * 1.15 ? "x" : "y";
}

/** Sort elements by position along the axis, ascending (source side first). */
export function orderByPosition(
  els: SVGGraphicsElement[],
  axis: Axis,
): Positioned[] {
  return els
    .map((el) => {
      const c = centerOf(el);
      return c ? { el, pos: axis === "x" ? c.x : c.y } : null;
    })
    .filter((p): p is Positioned => p !== null)
    .sort((a, b) => a.pos - b.pos);
}

/**
 * Map a sorted list of positions onto integer rank buckets so elements at
 * (nearly) the same position share a delay and animate together. Returns a
 * Map from element to its 0-based rank.
 */
export function rankByPosition(
  positioned: Positioned[],
  tolerance = 12,
): Map<SVGElement, number> {
  const ranks = new Map<SVGElement, number>();
  let rank = 0;
  let prev: number | null = null;
  for (const { el, pos } of positioned) {
    if (prev !== null && pos - prev > tolerance) rank += 1;
    ranks.set(el, rank);
    prev = pos;
  }
  return ranks;
}
