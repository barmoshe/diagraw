/**
 * render.ts - the browser orchestration layer.
 *
 * Ties mermaid rendering to the engine. mermaid.render() returns an SVG *string*,
 * but the engine needs a live, attached element to read geometry (getBBox). So we
 * mount the string into a caller-provided container (which must be in the
 * document), bake against the live element, then serialize.
 *
 * mermaid is imported dynamically so it never lands in a server bundle.
 */

import { AnimateOptions } from "./types";
import { bake, serializeSvg } from "./bake";

export type MermaidTheme = "default" | "base" | "dark" | "forest" | "neutral";

let mermaidInit = false;
let renderSeq = 0;

async function getMermaid() {
  const mod = await import("mermaid");
  return mod.default;
}

/** Render mermaid source to an SVG string. Throws on parse errors. */
export async function renderMermaid(
  source: string,
  theme: MermaidTheme = "default",
): Promise<string> {
  const mermaid = await getMermaid();
  // Re-initialize each call so a theme change takes effect. securityLevel
  // 'strict' sanitizes labels; startOnLoad off since we drive render manually.
  mermaid.initialize({
    startOnLoad: false,
    theme,
    securityLevel: "strict",
    flowchart: { htmlLabels: true },
  });
  mermaidInit = true;
  renderSeq += 1;
  const id = `diagraw-${renderSeq}`;
  const { svg } = await mermaid.render(id, source);
  return svg;
}

export interface RenderAndBakeResult {
  /** The live, baked <svg> element (attached inside `mount`). */
  element: SVGSVGElement;
  /** The portable, self-contained animated SVG string. */
  animatedSvg: string;
  /** Timing + counts. */
  totalMs: number;
  counts: { edges: number; nodes: number; labels: number };
  axis: "x" | "y";
}

/**
 * Render + bake in one call. `mount` must be an element attached to the document
 * (it can be visually hidden, but not display:none, or getBBox returns zeros).
 * The mount's contents are replaced with the rendered diagram.
 */
export async function renderAndBake(
  source: string,
  opts: AnimateOptions,
  mount: HTMLElement,
  theme: MermaidTheme = "default",
): Promise<RenderAndBakeResult> {
  const svgString = await renderMermaid(source, theme);
  mount.innerHTML = svgString;
  const element = mount.querySelector("svg");
  if (!element) throw new Error("mermaid produced no <svg> element");

  // Let the browser lay it out so getBBox is populated before we measure.
  const result = bake(element, opts);
  const animatedSvg = serializeSvg(element);
  return {
    element,
    animatedSvg,
    totalMs: result.totalMs,
    counts: result.counts,
    axis: result.axis,
  };
}

export { mermaidInit };
