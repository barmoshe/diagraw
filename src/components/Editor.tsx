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
import {
  buildShareUrl,
  loadLocalSnapshot,
  readHashSnapshot,
  saveLocalSnapshot,
} from "@/lib/persist";

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

const ZOOM_MIN = 0.2;
const ZOOM_MAX = 8;

interface StageView {
  zoom: number;
  x: number;
  y: number;
}

const FIT_VIEW: StageView = { zoom: 1, x: 0, y: 0 };

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
  const [view, setView] = useState<StageView>(FIT_VIEW);
  const [isPanning, setIsPanning] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageViewRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const panPointer = useRef<{
    id: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

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

  // Restore on mount. Precedence: shared link (#s=) > gallery prefill
  // (?sample=) > autosaved session > the default sample.
  useEffect(() => {
    const shared = readHashSnapshot();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (shared) {
      setSource(shared.source);
      setOpts(shared.opts);
      setTheme(shared.theme);
      return;
    }
    const id = new URLSearchParams(window.location.search).get("sample");
    const s = SAMPLES.find((x) => x.id === id);
    if (s) {
      setSource(s.source);
      return;
    }
    const saved = loadLocalSnapshot();
    if (saved) {
      setSource(saved.source);
      setOpts(saved.opts);
      setTheme(saved.theme);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Autosave, debounced — so a closed tab or refresh never loses work.
  useEffect(() => {
    const t = setTimeout(
      () => saveLocalSnapshot({ v: 1, source, opts, theme }),
      400,
    );
    return () => clearTimeout(t);
  }, [source, opts, theme]);

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

  // Zoom about a focal point given in client coordinates. The math works in
  // the stage-view's *laid-out* frame: with a centered transform-origin, the
  // laid-out center is the transformed rect's center minus the translation.
  const zoomAt = useCallback((factor: number, clientX: number, clientY: number) => {
    setView((v) => {
      const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.zoom * factor));
      if (zoom === v.zoom) return v;
      const el = stageViewRef.current;
      if (!el) return { ...v, zoom };
      const rect = el.getBoundingClientRect();
      const cx = clientX - (rect.left + rect.width / 2 - v.x);
      const cy = clientY - (rect.top + rect.height / 2 - v.y);
      const k = zoom / v.zoom;
      return { zoom, x: cx - k * (cx - v.x), y: cy - k * (cy - v.y) };
    });
  }, []);

  // Zoom from the +/- buttons: focal point = the middle of the stage.
  const zoomStep = useCallback(
    (factor: number) => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      zoomAt(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
    },
    [zoomAt],
  );

  const resetView = useCallback(() => setView(FIT_VIEW), []);

  // Wheel: ctrl/cmd+wheel (and trackpad pinch) zooms at the cursor; a plain
  // wheel pans. React's onWheel is passive, so preventDefault needs a manual
  // non-passive listener.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.exp(-e.deltaY * 0.0022), e.clientX, e.clientY);
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // Pan by pressing and dragging anywhere on the stage.
  const onStagePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 && e.button !== 1) return;
      if ((e.target as Element).closest(".stage-tools")) return;
      panPointer.current = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: view.x,
        originY: view.y,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsPanning(true);
    },
    [view.x, view.y],
  );

  const onStagePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const p = panPointer.current;
      if (!p || e.pointerId !== p.id) return;
      const dx = e.clientX - p.startX;
      const dy = e.clientY - p.startY;
      setView((v) => ({ ...v, x: p.originX + dx, y: p.originY + dy }));
    },
    [],
  );

  const onStagePointerEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (panPointer.current?.id !== e.pointerId) return;
      panPointer.current = null;
      setIsPanning(false);
    },
    [],
  );

  const onStageDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as Element).closest(".stage-tools")) return;
      resetView();
    },
    [resetView],
  );

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }, []);

  const copySvg = useCallback(async () => {
    await navigator.clipboard.writeText(animatedSvg);
    flash("Animated SVG copied");
  }, [animatedSvg, flash]);

  const downloadBlob = useCallback((data: string, type: string, name: string) => {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadSvg = useCallback(() => {
    downloadBlob(animatedSvg, "image/svg+xml", "diagram.animated.svg");
    flash("Downloaded diagram.animated.svg");
  }, [animatedSvg, downloadBlob, flash]);

  const downloadSource = useCallback(() => {
    downloadBlob(source, "text/plain", "diagram.mmd");
    flash("Downloaded diagram.mmd");
  }, [source, downloadBlob, flash]);

  const copyEmbed = useCallback(async () => {
    const snippet = `<!-- Diagraw animated SVG. Animates inline in HTML/JSX and when opened as a .svg file.\n     For GitHub READMEs or email, export a GIF/MP4 instead (animation is stripped there). -->\n${animatedSvg}`;
    await navigator.clipboard.writeText(snippet);
    flash("Embed snippet copied");
  }, [animatedSvg, flash]);

  const copyLink = useCallback(async () => {
    const url = buildShareUrl({ v: 1, source, opts, theme });
    window.history.replaceState(null, "", url);
    await navigator.clipboard.writeText(url);
    flash("Shareable link copied");
  }, [source, opts, theme, flash]);

  const openSourceFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setSource(await file.text());
      flash(`Loaded ${file.name}`);
    },
    [flash],
  );

  const total =
    counts.edges + counts.nodes > 0
      ? `${counts.nodes} nodes / ${counts.edges} edges`
      : "";

  const isFit = view.zoom === 1 && view.x === 0 && view.y === 0;

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
          <span className="pane-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => fileRef.current?.click()}
            >
              Open…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".mmd,.mermaid,.txt"
              hidden
              onChange={openSourceFile}
              aria-label="Open a Mermaid source file"
            />
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
          </span>
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

        <div
          ref={stageRef}
          className={`stage ${isPanning ? "is-panning" : ""}`}
          onPointerDown={onStagePointerDown}
          onPointerMove={onStagePointerMove}
          onPointerUp={onStagePointerEnd}
          onPointerCancel={onStagePointerEnd}
          onDoubleClick={onStageDoubleClick}
        >
          {error ? (
            <p className="stage-error" role="alert">
              {error}
            </p>
          ) : (
            <div
              ref={stageViewRef}
              className="stage-view"
              style={{
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
              }}
            >
              <div
                key={replayKey}
                className="stage-svg"
                dangerouslySetInnerHTML={{ __html: animatedSvg }}
              />
            </div>
          )}

          <div className="stage-tools" role="toolbar" aria-label="Zoom">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => zoomStep(1 / 1.25)}
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="stage-zoom" aria-live="polite">
              {Math.round(view.zoom * 100)}%
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => zoomStep(1.25)}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={resetView}
              disabled={isFit}
            >
              Fit
            </button>
          </div>
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
            <button type="button" className="btn btn-ghost btn-sm" onClick={copyLink}>
              Copy link
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={downloadSource}
            >
              .mmd
            </button>
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
