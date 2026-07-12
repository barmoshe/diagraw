import type { Metadata } from "next";
import Link from "next/link";
import SelfDrawingDiagram from "@/components/SelfDrawingDiagram";
import SiteFooter from "@/components/SiteFooter";
import { SAMPLES } from "@/lib/samples";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Diagraw release notes: what shipped and when - editor pan, zoom, click-to-replay, autosave, shareable links, .mmd round-trip, and animated people diagrams.",
};

const journeySample = SAMPLES.find((s) => s.id === "journey")!;

export default function ChangelogPage() {
  return (
    <main id="main" tabIndex={-1} className="container">
      <section className="section">
        <div className="section-head">
          <span className="bp-figure">Fig. / Changelog</span>
          <h1>Release notes</h1>
          <p className="lead">
            What shipped, and when. Each release links to the exact behavior in
            the editor.
          </p>
        </div>

        <article className="release bp-corners" id="v1-1">
          <header className="release-head">
            <span className="bp-kicker">v1.1 · 2026-07-12</span>
            <h2>Viewport, persistence, people diagrams</h2>
            <p>
              The editor grows into a tool: a real viewport for complex
              diagrams, state that survives a closed tab and travels in a URL,
              and animation support for the person-shaped diagram types.
            </p>
          </header>

          <ul className="release-list">
            <li>
              <strong>Click, and the diagram moves.</strong> A single click on
              the editor preview replays the self-drawing animation.
            </li>
            <li>
              <strong>Pan &amp; zoom.</strong> Drag to pan. Ctrl/Cmd+wheel or
              pinch zooms at the cursor, with a −/+/Fit toolbar and live
              percentage. Double-click resets. Built for the moment a diagram
              outgrows its frame.
            </li>
            <li>
              <strong>Your work comes back.</strong> The editor autosaves to
              your browser, <em>Copy link</em> packs the whole diagram into a
              shareable URL, and the source round-trips as a{" "}
              <code>.mmd</code> file.
            </li>
            <li>
              <strong>People diagrams.</strong> User-journey diagrams now
              animate person-by-person, task-by-task, and the editor ships with
              new <em>Org chart</em> and <em>User journey</em> samples. Timeline
              diagrams animate now too.
            </li>
          </ul>

          <div className="release-demo">
            <div className="gallery-canvas bp-corners">
              <SelfDrawingDiagram
                source={journeySample.source}
                trigger="scroll"
                theme="blueprint"
              />
            </div>
            <div className="gallery-foot">
              <span>New in v1.1: user journeys, drawn person-by-person</span>
              <Link href={{ pathname: "/editor", query: { sample: "journey" } }}>
                Open in editor →
              </Link>
            </div>
          </div>
        </article>

        <article className="release bp-corners" id="v0-1">
          <header className="release-head">
            <span className="bp-kicker">v0.1 · 2026-07-01</span>
            <h2>First public release</h2>
            <p>
              The core idea, shipped: write a Mermaid diagram, get a
              self-contained animated SVG that draws itself with zero JavaScript
              in the exported file.
            </p>
          </header>
          <ul className="release-list">
            <li>
              <strong>The engine.</strong> Renders Mermaid v11, ranks elements
              along the flow axis, bakes stroke-dashoffset self-draw and opacity
              fades straight into the SVG.
            </li>
            <li>
              <strong>The editor.</strong> Live source + preview panes, speed /
              stagger / order / easing controls, six render themes including the
              blueprint house style.
            </li>
            <li>
              <strong>The site.</strong> Gallery, docs with an honest
              portability matrix, and a scroll-driven demo - all on GitHub
              Pages, MIT licensed.
            </li>
          </ul>
        </article>
      </section>
      <SiteFooter />
    </main>
  );
}
