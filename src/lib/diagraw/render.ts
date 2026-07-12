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

export type MermaidTheme =
  | "blueprint"
  | "default"
  | "base"
  | "dark"
  | "forest"
  | "neutral";

/**
 * The Diagraw "blueprint" theme: cyan ink on deep blue, off-white labels, mono
 * type. Built on mermaid's `base` theme via themeVariables so it applies to every
 * diagram type. This is what makes diagrams look like drafting-sheet schematics
 * instead of mermaid's muddy default dark boxes.
 */
const BLUEPRINT_VARS: Record<string, string> = {
  darkMode: "true",
  background: "transparent",
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: "15px",

  primaryColor: "#1c3d5f",
  primaryBorderColor: "#6fd8ff",
  primaryTextColor: "#eaf5ff",
  lineColor: "#6fd8ff",

  // General label text. HTML labels (flowchart/class/er) colour their <span>
  // from `textColor`, not `nodeTextColor`, so this is what actually makes the
  // labels readable on the dark nodes. Leaving it unset derives a dark value.
  textColor: "#eaf5ff",
  labelColor: "#eaf5ff",

  secondaryColor: "#254a70",
  secondaryBorderColor: "#6fd8ff",
  secondaryTextColor: "#eaf5ff",
  tertiaryColor: "#16324c",
  tertiaryBorderColor: "#3d6489",
  tertiaryTextColor: "#eaf5ff",

  mainBkg: "#1c3d5f",
  nodeBorder: "#6fd8ff",
  nodeTextColor: "#eaf5ff",
  clusterBkg: "#16324c",
  clusterBorder: "#3d6489",
  titleColor: "#eaf5ff",
  edgeLabelBackground: "#102438",

  noteBkgColor: "#254a70",
  noteBorderColor: "#6fd8ff",
  noteTextColor: "#eaf5ff",

  // sequence
  actorBkg: "#1c3d5f",
  actorBorder: "#6fd8ff",
  actorTextColor: "#eaf5ff",
  actorLineColor: "#6fd8ff",
  signalColor: "#cfe9ff",
  signalTextColor: "#eaf5ff",
  labelBoxBkgColor: "#254a70",
  labelBoxBorderColor: "#6fd8ff",
  labelTextColor: "#eaf5ff",
  loopTextColor: "#eaf5ff",
  activationBkgColor: "#254a70",
  activationBorderColor: "#6fd8ff",

  // journey (sections/tasks pull from the fillType cycle)
  fillType0: "#1c3d5f",
  fillType1: "#254a70",
  fillType2: "#16324c",
  fillType3: "#2d5a85",
  fillType4: "#1c3d5f",
  fillType5: "#254a70",
  fillType6: "#16324c",
  fillType7: "#2d5a85",

  // git graph
  git0: "#6fd8ff",
  git1: "#ffce7a",
  git2: "#8fe3a6",
  git3: "#c9a7ff",
  gitInv0: "#102438",
  gitBranchLabel0: "#102438",
  gitBranchLabel1: "#102438",
  commitLabelColor: "#eaf5ff",
  commitLabelBackground: "#16324c",
};

/**
 * Root fix for label contrast. themeVariables alone are fragile: each diagram
 * type routes some text through a different (sometimes underived) variable, so
 * labels kept coming out dark-on-dark (e.g. sequence actor boxes ignore
 * actorTextColor in v11). themeCSS is mermaid's highest-precedence hook, so we
 * assert the on-dark label colour here once, for every diagram type. We do NOT
 * touch git branch-label pills, which correctly sit on bright branch colours.
 */
const BLUEPRINT_CSS = `
.nodeLabel, .nodeLabel p, .edgeLabel, .edgeLabel p, .cluster-label,
.cluster-label p, .stateLabel, .messageText, .loopText, .labelText,
.noteText, .titleText, text.actor, text.actor tspan, .classText,
.entityLabel, .relationshipLabel {
  fill: #eaf5ff !important;
  color: #eaf5ff !important;
}
text.task, text.task tspan, text.journey-section, text.journey-section tspan,
text.legend, text.legend tspan, div.task, div.task .label,
div.journey-section, div.journey-section .label {
  fill: #eaf5ff !important;
  color: #eaf5ff !important;
}
circle.face {
  fill: #ffce7a !important;
  stroke: #102438 !important;
}
`;

let renderSeq = 0;

async function getMermaid() {
  const mod = await import("mermaid");
  return mod.default;
}

/** Render mermaid source to an SVG string. Throws on parse errors. */
export async function renderMermaid(
  source: string,
  theme: MermaidTheme = "blueprint",
): Promise<string> {
  const mermaid = await getMermaid();
  const themeConfig =
    theme === "blueprint"
      ? {
          theme: "base" as const,
          themeVariables: BLUEPRINT_VARS,
          themeCSS: BLUEPRINT_CSS,
        }
      : { theme };
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    flowchart: { htmlLabels: true },
    ...themeConfig,
  });
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
  theme: MermaidTheme = "blueprint",
): Promise<RenderAndBakeResult> {
  const svgString = await renderMermaid(source, theme);
  mount.innerHTML = svgString;
  const element = mount.querySelector("svg");
  if (!element) throw new Error("mermaid produced no <svg> element");

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
