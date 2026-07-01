"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps decorative inline SVG line-art and makes its strokes draw themselves
 * when scrolled into view, using the same stroke-dashoffset trick as the engine.
 * Sets `pathLength=1` on stroked descendants so timing is geometry-independent.
 */
export default function DrawOnScroll({
  children,
  className = "",
  durationMs = 1200,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  durationMs?: number;
  as?: "div" | "span";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--bp-dur", `${durationMs}ms`);
    el.querySelectorAll<SVGElement>(
      "path, line, polyline, polygon, circle, rect, ellipse",
    ).forEach((s) => s.setAttribute("pathLength", "1"));

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-drawn");
            io.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [durationMs]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLSpanElement>}
      className={`bp-selfdraw ${className}`}
    >
      {children}
    </Tag>
  );
}
