"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimateOptions,
  DEFAULT_OPTIONS,
  DrawDirection,
  renderAndBake,
  type MermaidTheme,
} from "@/lib/diagraw";
import { DEFAULT_SOURCE, SAMPLES } from "@/lib/samples";

const EASINGS = [
  { value: "cubic-bezier(0.2, 0.7, 0.2, 1)", label: "Smooth" },
  { value: "ease", label: "Ease" },
  { value: "linear", label: "Linear" },
  { value: "ease-in-out", label: "Ease in-out" },
  { value: "cubic-bezier(0.34, 1.56, 0.64, 1)", label: "Overshoot" },
];

const MERMAID_THEMES: MermaidTheme[] = [
  "blueprint",
  "dark",
  "default",
  "neutral",
  "forest",
  "base",
];

export default function Editor({
  initialSource = DEFAULT_SOURCE,
}: {
  initialSource?: string;
}) {
  const [source, setSource] = useState(initialSource);
  const [opts, setOpts] = useState<AnimateOptions>(DEFAULT_OPTIONS);
  const [theme, setTheme] = useState<MermaidTheme>("blueprint");
  const [animatedSvg, setAnimatedSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({ edges: 0, nodes: 0, labels: 0 });
  const [replayKey, setReplayKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [split, setSplit] = useState(33);
  const [isMax, setIsMax] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setOpt = <K extends keyof AnimateOptions>(
    key: K,
    value: AnimateOptions[K],
  ) => setOpts((o) => ({ ...o, [key]: value }));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await renderAndBake(source, opts, mount, theme);
        if (cancelled) return;
        setAnimatedSvg(res.animatedSvg);
        setCounts(res.counts);
        setError(null);
        setReplayKey((k) => k + 1);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [source, opts, theme]);

  // Prefill from ?sample= (the gallery's "open in editor" links).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("sample");
    const s = SAMPLES.find((x) => x.id === id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (s) setSource(s.source);
  }, []);

  // Draggable split.
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragging.current || !editorRef.current) return;
      const rect = editorRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(70, Math.max(20, pct)));
    }
    function onUp() {
      dragging.current = false;
      document.body.style.userSelect = "";
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }, []);

  const copySvg = useCallback(async () => {
    await navigator.clipboard.writeText(animatedSvg);
    flash("Animated SVG copied");
  }, [animatedSvg, flash]);

  const downloadSvg = useCallback(() => {
    const blob = new Blob([animatedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.animated.svg";
    a.click();
    URL.revokeObjectURL(url);
    flash("Downloaded diagram.animated.svg");
  }, [animatedSvg, flash]);

  const copyEmbed = useCallback(async () => {
    const snippet = `<!-- Diagraw animated SVG. Animates inline in HTML/JSX and when opened as a .svg file.\n     For GitHub READMEs or email, export a GIF/MP4 instead (animation is stripped there). -->\n${animatedSvg}`;
    await navigator.clipboard.writeText(snippet);
    flash("Embed snippet copied");
  }, [animatedSvg, flash]);

  const total =
    counts.edges + counts.nodes > 0
      ? `${counts.nodes} nodes / ${counts.edges} edges`
      : "";

  return (
    <div
      ref={editorRef}
      className={`editor ${isMax ? "is-max" : ""}`}
      style={{ ["--split" as string]: `${split}%` }}
    >
      {/* Source pane */}
      <section className="pane pane-source" aria-label="Diagram source">
        <div className="pane-header">
          <span>Source</span>
          <select
            aria-label="Load a sample diagram"
            value=""
            onChange={(e) => {
              const s = SAMPLES.find((x) => x.id === e.target.value);
              if (s) setSource(s.source);
            }}
          >
            <option value="" disabled>
              Sample…
            </option>
            {SAMPLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="source-input"
          value={source}
          spellCheck={false}
          onChange={(e) => setSource(e.target.value)}
          aria-label="Mermaid diagram source code"
        />
      </section>

      {/* Divider */}
      <div
        className="divider"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panes"
        onPointerDown={() => {
          dragging.current = true;
          document.body.style.userSelect = "none";
        }}
      />

      {/* Preview pane */}
      <section className="pane" aria-label="Animated preview">
        <div className="pane-header">
          <span>Preview {total && <span className="control-value">{total}</span>}</span>
          <span style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setReplayKey((k) => k + 1)}
            >
              Replay
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsMax((m) => !m)}
              aria-pressed={isMax}
            >
              {isMax ? "Exit" : "Maximize"}
            </button>
          </span>
        </div>

        <div className="stage">
          {error ? (
            <p className="stage-error" role="alert">
              {error}
            </p>
          ) : (
            <div
              key={replayKey}
              className="stage-svg"
              dangerouslySetInnerHTML={{ __html: animatedSvg }}
            />
          )}
        </div>

        <div className="controls">
          <div className="control">
            <label htmlFor="speed">Speed</label>
            <input
              id="speed"
              type="range"
              min={0.25}
              max={3}
              step={0.25}
              value={opts.speed}
              onChange={(e) => setOpt("speed", Number(e.target.value))}
            />
            <span className="control-value">{opts.speed}x</span>
          </div>

          <div className="control">
            <label htmlFor="stagger">Stagger</label>
            <input
              id="stagger"
              type="range"
              min={0}
              max={600}
              step={20}
              value={opts.stagger}
              onChange={(e) => setOpt("stagger", Number(e.target.value))}
            />
            <span className="control-value">{opts.stagger}</span>
          </div>

          <div className="control">
            <label htmlFor="direction">Order</label>
            <select
              id="direction"
              value={opts.direction}
              onChange={(e) =>
                setOpt("direction", e.target.value as DrawDirection)
              }
            >
              <option value="source-sink">Source-sink</option>
              <option value="all-at-once">All at once</option>
            </select>
          </div>

          <div className="control">
            <label htmlFor="easing">Easing</label>
            <select
              id="easing"
              value={opts.easing}
              onChange={(e) => setOpt("easing", e.target.value)}
            >
              {EASINGS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control">
            <label htmlFor="mtheme">Theme</label>
            <select
              id="mtheme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as MermaidTheme)}
            >
              {MERMAID_THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="export-row">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={copySvg}
              disabled={!animatedSvg}
            >
              Copy SVG
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={copyEmbed}
              disabled={!animatedSvg}
            >
              Copy embed
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={downloadSvg}
              disabled={!animatedSvg}
            >
              Download .svg
            </button>
          </div>
        </div>
      </section>

      <div ref={mountRef} className="bake-mount" aria-hidden="true" />

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
