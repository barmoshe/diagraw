/**
 * Diagraw animation engine - public API.
 *
 * A framework-neutral module that turns a mermaid-rendered SVG into a
 * self-contained animated SVG that draws itself with zero JavaScript.
 */

export type {
  AnimateOptions,
  AnimateResult,
  DrawDirection,
} from "./types";
export { DEFAULT_OPTIONS } from "./types";
export { bake, serializeSvg, clearBake } from "./bake";
export { detectAxis } from "./order";
export {
  renderMermaid,
  renderAndBake,
  type MermaidTheme,
  type RenderAndBakeResult,
} from "./render";
