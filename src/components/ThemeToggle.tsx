"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "auto";

/** Blueprint theme toggle. Default is dark; `.light` is added for whiteprint.
 * Persists to `bm:theme`, which the pre-paint script reads (no flash). */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme((localStorage.getItem("bm:theme") as Theme) || "dark");
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    localStorage.setItem("bm:theme", next);
    const light =
      next === "light" ||
      (next === "auto" &&
        window.matchMedia("(prefers-color-scheme: light)").matches);
    document.documentElement.classList.toggle("light", light);
  }

  const order: Theme[] = ["dark", "light", "auto"];
  const labels: Record<Theme, string> = {
    dark: "Blueprint",
    light: "Whiteprint",
    auto: "Auto",
  };

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={() => apply(order[(order.indexOf(theme) + 1) % order.length])}
      aria-label={`Theme: ${labels[theme]}. Click to change.`}
      title={`Theme: ${labels[theme]}`}
    >
      {labels[theme]}
    </button>
  );
}
