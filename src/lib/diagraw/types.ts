/**
 * Public option + result types for the Diagraw animation engine.
 *
 * The engine is intentionally framework-neutral: it operates on a live,
 * attached SVG element (so it can read real geometry) and bakes a self-contained
 * <style> block plus per-element delays into it. The exported artifact animates
 * with zero JavaScript. See `bake.ts` for the mechanics.
 */

export type DrawDirection = "source-sink" | "all-at-once";

export interface AnimateOptions {
  /** Global speed multiplier. 1 = default. 2 = twice as fast, 0.5 = half. */
  speed: number;
  /** Base delay added between successive elements, in ms (before speed scaling). */
  stagger: number;
  /** source-sink = staggered cascade along the flow axis; all-at-once = simultaneous. */
  direction: DrawDirection;
  /** CSS easing function applied to every animation. */
  easing: string;
  /** How long a single edge takes to draw itself, in ms (before speed scaling). */
  drawDuration: number;
  /** How long a single node takes to fade in, in ms (before speed scaling). */
  nodeDuration: number;
  /** When true, elements start paused (for scroll-driven playback). */
  paused: boolean;
}

export const DEFAULT_OPTIONS: AnimateOptions = {
  speed: 1,
  stagger: 220,
  direction: "source-sink",
  easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
  drawDuration: 700,
  nodeDuration: 380,
  paused: false,
};

export interface AnimateResult {
  /** Total animation runtime in ms (last delay + longest duration). */
  totalMs: number;
  /** Count of animated elements, by kind. */
  counts: { edges: number; nodes: number; labels: number };
  /** Detected primary flow axis. */
  axis: "x" | "y";
}
