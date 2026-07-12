import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "How Diagraw turns a Mermaid diagram into a self-contained animated SVG: the technique, diagram types, controls, export formats, and embedding.",
};

const NAV = [
  ["technique", "The technique"],
  ["types", "Diagram types"],
  ["controls", "Controls"],
  ["export", "Export & portability"],
  ["embedding", "Embedding"],
  ["roadmap", "Roadmap"],
  ["faq", "FAQ"],
];

export default function DocsPage() {
  return (
    <>
      <main id="main" tabIndex={-1} className="container docs-layout">
        <nav className="docs-nav" aria-label="Docs sections">
          <span className="bp-kicker">Contents</span>
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>

        <article className="docs-body">
          <section id="technique">
            <h2>The technique</h2>
            <p>
              Diagraw does one thing: it takes the SVG that Mermaid renders and
              bakes a small stylesheet into it so the diagram animates on its own,
              with no JavaScript in the exported file.
            </p>
            <ol>
              <li>
                <strong>Render.</strong> Mermaid renders your source to an SVG
                string with its own <code>mermaid.render()</code> API.
              </li>
              <li>
                <strong>Order.</strong> Diagraw reads each element&apos;s position
                and ranks them along the diagram&apos;s flow axis (top-to-bottom
                for a TB flowchart or a sequence diagram, left-to-right for LR and
                timelines). Elements at the same rank animate together.
              </li>
              <li>
                <strong>Bake.</strong> Edges get <code>pathLength=&quot;1&quot;</code>{" "}
                and animate <code>stroke-dashoffset</code> from 1 to 0 (the line
                draws itself, independent of its real length). Nodes fade in via{" "}
                <code>opacity</code>. A single <code>&lt;style&gt;</code> block with
                the keyframes and per-element delays is injected into the SVG.
              </li>
              <li>
                <strong>Export.</strong> The mutated SVG is serialized to a string.
                That string is the whole artifact.
              </li>
            </ol>
            <p>
              Nodes animate <code>opacity</code> only, never <code>transform</code>,
              because Mermaid uses a <code>translate()</code> transform on each node
              group for layout. Reduced-motion collapses everything to its final
              state instantly.
            </p>
          </section>

          <section id="types">
            <h2>Diagram types</h2>
            <p>
              Anything Mermaid renders, Diagraw animates. Draw-order quality varies
              by how naturally the type maps to a flow axis:
            </p>
            <div className="docs-table-wrap">
              <table className="bp-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Draw order</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>flowchart / graph</td>
                    <td>Topological, source to sink</td>
                  </tr>
                  <tr>
                    <td>sequenceDiagram</td>
                    <td>Top-to-bottom (time order)</td>
                  </tr>
                  <tr>
                    <td>stateDiagram, mindmap, timeline, gitGraph, journey</td>
                    <td>Positional cascade</td>
                  </tr>
                  <tr>
                    <td>class, ER, others</td>
                    <td>Positional cascade / graceful fade-in</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="controls">
            <h2>Controls</h2>
            <div className="docs-table-wrap">
              <table className="bp-table">
                <thead>
                  <tr>
                    <th>Control</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Speed</td>
                    <td>Global multiplier on every duration and delay.</td>
                  </tr>
                  <tr>
                    <td>Stagger</td>
                    <td>Delay between successive ranks in the cascade.</td>
                  </tr>
                  <tr>
                    <td>Order</td>
                    <td>Source-sink cascade, or all elements at once.</td>
                  </tr>
                  <tr>
                    <td>Easing</td>
                    <td>The timing function applied to every animation.</td>
                  </tr>
                  <tr>
                    <td>Theme</td>
                    <td>Mermaid render theme (dark, default, neutral, forest, base).</td>
                  </tr>
                  <tr>
                    <td>Replay</td>
                    <td>
                      Click the preview (or hit Replay) and the diagram draws itself
                      again.
                    </td>
                  </tr>
                  <tr>
                    <td>Pan &amp; zoom</td>
                    <td>
                      Drag the preview to pan; Ctrl/Cmd+wheel or pinch to zoom at the
                      cursor, or use the −/+/Fit buttons. Double-click resets.
                    </td>
                  </tr>
                  <tr>
                    <td>Save &amp; share</td>
                    <td>
                      Work autosaves to your browser. &quot;Copy link&quot; packs the
                      diagram into a shareable URL, and the source round-trips as a{" "}
                      <code>.mmd</code> file (Open… / .mmd).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="export">
            <h2>Export &amp; portability</h2>
            <p>
              This is the honest part. A CSS-animated SVG animates when it is{" "}
              <em>inline</em> in a page, or opened as a bare <code>.svg</code> file.
              It does <strong>not</strong> animate everywhere: <code>&lt;img&gt;</code>{" "}
              tags render SVG statically, and GitHub and most email clients strip the
              internal styles entirely. So Diagraw gives you the right format per
              destination.
            </p>
            <div className="docs-table-wrap">
              <table className="bp-table">
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Animated SVG</th>
                    <th>Recommended</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Inline in your HTML / JSX / slides</td>
                    <td><span className="yes">Animates</span></td>
                    <td>Animated SVG</td>
                  </tr>
                  <tr>
                    <td>Opened as a bare .svg file</td>
                    <td><span className="yes">Animates</span></td>
                    <td>Animated SVG</td>
                  </tr>
                  <tr>
                    <td>&lt;img src=&quot;diagram.svg&quot;&gt;</td>
                    <td><span className="no">Static</span></td>
                    <td>GIF / MP4</td>
                  </tr>
                  <tr>
                    <td>GitHub README, email, Slack</td>
                    <td><span className="no">Stripped</span></td>
                    <td>GIF / MP4</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Today Diagraw exports the animated SVG (copy source, download{" "}
              <code>.svg</code>, or copy an inline embed snippet). A raster
              GIF/MP4 export, the true works-everywhere path, is the next milestone
              (see the <a href="#roadmap">roadmap</a>).
            </p>
          </section>

          <section id="embedding">
            <h2>Embedding</h2>
            <p>
              For a page you control, paste the exported <code>&lt;svg&gt;</code>{" "}
              inline (into HTML or a React/JSX component) and it animates on load.
              The <strong>Copy embed</strong> button wraps it with a note about
              where it will and will not animate.
            </p>
            <pre>
              <code>{`// React / JSX
export function Diagram() {
  return (
    <div dangerouslySetInnerHTML={{ __html: animatedSvg }} />
  );
}`}</code>
            </pre>
            <p>
              For a static site, drop the <code>.svg</code> file in and reference it
              inline (not through <code>&lt;img&gt;</code>) to keep the animation.
            </p>
          </section>

          <section id="roadmap">
            <h2>Roadmap</h2>
            <ul>
              <li>
                <strong>Raster export (GIF / MP4 / WebM).</strong> Headless capture
                of the animation, frame-stepped and encoded. The real
                works-everywhere output for READMEs and email.
              </li>
              <li>
                <strong>True topological ordering</strong> for flowcharts, layered
                on top of the positional default.
              </li>
              <li>
                <strong>Morph / diff.</strong> Animate from diagram A to diagram B.
              </li>
              <li>
                <strong>A hosted embed service</strong> and editor plugins.
              </li>
            </ul>
          </section>

          <section id="faq">
            <h2>FAQ</h2>
            <h3>Does the exported SVG need any JavaScript?</h3>
            <p>
              No. The animation is pure CSS baked into the file. Open it in a
              browser as a bare <code>.svg</code> and it plays.
            </p>
            <h3>Will it animate in a GitHub README?</h3>
            <p>
              No: GitHub sanitizes SVG and strips the styles. Use a GIF/MP4 there
              (on the roadmap). This is a limitation of the destination, not the
              file.
            </p>
            <h3>Which Mermaid version?</h3>
            <p>
              Mermaid v11. Diagraw reads the rendered DOM structure, so it tracks
              whatever that version emits.
            </p>
            <p>
              Ready to try it? <Link href="/editor">Open the editor</Link>.
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
