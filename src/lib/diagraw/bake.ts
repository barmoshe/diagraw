/**
 * bake.ts - the engine core.
 *
 * Given a live, attached mermaid-rendered <svg>, this walks it in draw order and
 * bakes in a self-contained <style> block plus per-element delays so the diagram
 * draws itself with **zero JavaScript**. Serializing the mutated element yields
 * the portable artifact.
 *
 * Technique:
 *   - edges self-draw via a normalized `pathLength="1"` + animated
 *     `stroke-dashoffset` (no runtime length measurement, fully static CSS).
 *   - nodes fade via `opacity` only. We never animate `transform` on a node
 *     group because mermaid uses `translate()` there for layout, and overriding
 *     it would move the node.
 *   - reduced-motion collapses to the final state instantly.
 */

import { AnimateOptions, AnimateResult } from "./types";
import { detectAxis, orderByPosition, rankByPosition } from "./order";

const SVG_NS = "http://www.w3.org/2000/svg";

/** Selectors for the strokes that should "draw themselves". */
const EDGE_SELECTOR = [
  ".edgePaths path",
  "path.flowchart-link",
  ".messageLine0",
  ".messageLine1",
  ".relation",
  ".transition",
  "[class*='edgePath'] path",
  "line[class*='node-line']", // timeline connectors
].join(",");

/**
 * Selectors for node-like groups that should fade in.
 *
 * journey/timeline (mermaid v11) emit flat elements with no `g.node`-style
 * class on the wrapper, so their tasks/sections are matched structurally via
 * `:has()` on the plain `g` that mermaid wraps each of them in (verified
 * against mermaid 11.16 output). `:has()` only runs at bake time in the
 * browser - the exported SVG carries baked `.dg-*` classes, not these.
 */
const NODE_SELECTOR = [
  "g.node",
  ".actor",
  ".classGroup",
  ".statediagram-state",
  ".er.entityBox",
  ".mindmap-node",
  "g:has(> rect.task)", // journey tasks (rect + face + actor dots + label)
  "g:has(> rect.journey-section)", // journey section bands
  "svg > circle[class*='actor-']", // journey legend dots
  "g.timeline-node",
].join(",");

/** Selectors for standalone labels (node labels ride along with their node). */
const LABEL_SELECTOR = [
  ".edgeLabels .edgeLabel",
  ".messageText",
  "text.legend", // journey legend names
].join(",");

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function query(svg: SVGSVGElement, selector: string): SVGGraphicsElement[] {
  return uniq(
    Array.from(svg.querySelectorAll<SVGGraphicsElement>(selector)),
  ).filter((el) => el instanceof SVGGraphicsElement);
}

/** Remove any Diagraw markup from a prior bake so re-baking is idempotent. */
export function clearBake(svg: SVGSVGElement): void {
  svg.classList.remove("dg-anim", "dg-paused");
  svg.querySelector("style[data-diagraw]")?.remove();
  svg
    .querySelectorAll<SVGElement>(".dg-edge, .dg-node, .dg-label")
    .forEach((el) => {
      el.classList.remove("dg-edge", "dg-node", "dg-label");
      el.style.removeProperty("--dg-delay");
      el.style.removeProperty("--dg-dur");
      el.style.removeProperty("--dg-ndur");
    });
}

/**
 * Bake animation into a live, attached SVG element. Mutates the element and
 * returns timing metadata. Call {@link serializeSvg} afterwards to export.
 */
export function bake(
  svg: SVGSVGElement,
  opts: AnimateOptions,
): AnimateResult {
  clearBake(svg);

  const edges = query(svg, EDGE_SELECTOR);
  const nodes = query(svg, NODE_SELECTOR);
  const labels = query(svg, LABEL_SELECTOR);

  const axis = detectAxis(nodes.length ? nodes : edges);

  // Unified rank across every animated element so the cascade reads as one
  // continuous build along the flow axis, regardless of element kind.
  const all = uniq([...nodes, ...edges, ...labels]);
  const ranks =
    opts.direction === "all-at-once"
      ? new Map<SVGElement, number>(all.map((el) => [el, 0]))
      : rankByPosition(orderByPosition(all, axis));

  const speed = opts.speed > 0 ? opts.speed : 1;
  const staggerMs = opts.stagger / speed;
  const drawMs = opts.drawDuration / speed;
  const nodeMs = opts.nodeDuration / speed;
  const labelMs = 300 / speed;

  const delayFor = (el: SVGElement) => (ranks.get(el) ?? 0) * staggerMs;

  for (const el of edges) {
    el.setAttribute("pathLength", "1");
    el.classList.add("dg-edge");
    el.style.setProperty("--dg-delay", `${Math.round(delayFor(el))}ms`);
    el.style.setProperty("--dg-dur", `${Math.round(drawMs)}ms`);
  }
  for (const el of nodes) {
    el.classList.add("dg-node");
    el.style.setProperty("--dg-delay", `${Math.round(delayFor(el))}ms`);
    el.style.setProperty("--dg-ndur", `${Math.round(nodeMs)}ms`);
  }
  for (const el of labels) {
    el.classList.add("dg-label");
    el.style.setProperty("--dg-delay", `${Math.round(delayFor(el))}ms`);
  }

  const maxRank = Math.max(0, ...Array.from(ranks.values()));
  const totalMs = Math.round(maxRank * staggerMs + Math.max(drawMs, nodeMs));

  svg.classList.add("dg-anim");
  if (opts.paused) svg.classList.add("dg-paused");
  svg.style.setProperty("--dg-ease", opts.easing);

  const style = document.createElementNS(SVG_NS, "style");
  style.setAttribute("data-diagraw", "");
  style.textContent = buildCss(labelMs);
  svg.insertBefore(style, svg.firstChild);

  return {
    totalMs,
    counts: { edges: edges.length, nodes: nodes.length, labels: labels.length },
    axis,
  };
}

/** The self-contained keyframes + rules. Scoped under `.dg-anim` so it only
 * touches elements this engine tagged. */
function buildCss(labelMs: number): string {
  return `
.dg-anim .dg-edge{stroke-dasharray:1;stroke-dashoffset:1;animation:dg-draw var(--dg-dur,700ms) var(--dg-ease,ease) var(--dg-delay,0ms) both;}
.dg-anim .dg-node{opacity:0;animation:dg-fade var(--dg-ndur,380ms) var(--dg-ease,ease) var(--dg-delay,0ms) both;}
.dg-anim .dg-label{opacity:0;animation:dg-fade ${Math.round(labelMs)}ms var(--dg-ease,ease) var(--dg-delay,0ms) both;}
.dg-anim.dg-paused .dg-edge,.dg-anim.dg-paused .dg-node,.dg-anim.dg-paused .dg-label{animation-play-state:paused;}
@keyframes dg-draw{to{stroke-dashoffset:0;}}
@keyframes dg-fade{to{opacity:1;}}
@media (prefers-reduced-motion:reduce){
.dg-anim .dg-edge{stroke-dashoffset:0!important;animation:none!important;}
.dg-anim .dg-node,.dg-anim .dg-label{opacity:1!important;animation:none!important;}
}`.trim();
}

/** Serialize a baked SVG element to a standalone, portable string. */
export function serializeSvg(svg: SVGSVGElement): string {
  const s = new XMLSerializer().serializeToString(svg);
  return s.startsWith("<?xml") ? s : `<?xml version="1.0" encoding="UTF-8"?>\n${s}`;
}
