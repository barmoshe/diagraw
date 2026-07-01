"use client";

import { useEffect, useRef } from "react";
import {
  AnimateOptions,
  DEFAULT_OPTIONS,
  renderAndBake,
  type MermaidTheme,
} from "@/lib/diagraw";

/**
 * Renders a mermaid source as a Diagraw animated SVG. `trigger="load"` plays
 * immediately (hero); `trigger="scroll"` bakes in paused mode and plays when it
 * scrolls into view (gallery, demo). Same engine, different clock.
 */
export default function SelfDrawingDiagram({
  source,
  theme = "blueprint",
  trigger = "scroll",
  options,
  className = "",
}: {
  source: string;
  theme?: MermaidTheme;
  trigger?: "load" | "scroll";
  options?: Partial<AnimateOptions>;
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const bakeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const mount = bakeRef.current;
    if (!stage || !mount) return;
    let io: IntersectionObserver | undefined;
    let cancelled = false;

    (async () => {
      const opts: AnimateOptions = {
        ...DEFAULT_OPTIONS,
        paused: trigger === "scroll",
        ...options,
      };
      const res = await renderAndBake(source, opts, mount, theme);
      if (cancelled) return;
      stage.innerHTML = res.animatedSvg;
      const svg = stage.querySelector("svg");
      if (trigger === "scroll" && svg) {
        io = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                svg.classList.remove("dg-paused");
                io?.disconnect();
              }
            }
          },
          { threshold: 0.3 },
        );
        io.observe(stage);
      }
    })();

    return () => {
      cancelled = true;
      io?.disconnect();
    };
    // options is intentionally spread; callers pass a stable/inline object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, theme, trigger]);

  return (
    <>
      <div ref={stageRef} className={`sd-stage ${className}`} />
      <div ref={bakeRef} className="bake-mount" aria-hidden="true" />
    </>
  );
}
