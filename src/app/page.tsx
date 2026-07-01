import Link from "next/link";
import SelfDrawingDiagram from "@/components/SelfDrawingDiagram";
import SiteFooter from "@/components/SiteFooter";

const HERO = `flowchart LR
  M[Mermaid source] --> E{{Diagraw}}
  E --> S[Animated SVG]
  E --> G[GIF / MP4]
  S --> W[Any website]
  G --> R[README / email]`;

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      {/* Hero */}
      <section className="container hero">
        <div className="hero-copy">
          <p className="bp-kicker">Mermaid, in motion</p>
          <h1>
            Diagrams that <span className="accent">draw themselves.</span>
          </h1>
          <p className="lead">
            Paste a Mermaid diagram, watch it trace itself into being, and export
            a self-contained animated SVG with zero runtime. A blueprint for
            motion: the whole page you are reading is drawn by the same engine.
          </p>
          <div className="hero-actions">
            <Link href="/editor" className="btn btn-lg">
              Open the editor
            </Link>
            <Link href="/docs" className="btn btn-ghost btn-lg">
              Read the docs
            </Link>
          </div>
        </div>
        <div className="hero-visual bp-corners">
          <SelfDrawingDiagram
            source={HERO}
            trigger="load"
            theme="dark"
            options={{ stagger: 200, drawDuration: 650 }}
          />
          <span className="bp-leader hero-meta">no javascript inside</span>
        </div>
      </section>

      {/* How it works */}
      <section className="container section">
        <div className="section-head">
          <span className="bp-figure">Fig. 01 / How it works</span>
          <p className="lead">
            Three steps, all in the browser. No server, no build step for the
            output.
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-num">01</span>
            <h3>Render</h3>
            <p>
              Mermaid renders your source to an SVG using its own engine. Every
              diagram type it supports, Diagraw can animate.
            </p>
          </div>
          <div className="step">
            <span className="step-num">02</span>
            <h3>Bake</h3>
            <p>
              Diagraw walks the SVG in flow order and bakes in a small stylesheet:
              edges self-draw via stroke-dashoffset, nodes fade in on a cascade.
            </p>
          </div>
          <div className="step">
            <span className="step-num">03</span>
            <h3>Export</h3>
            <p>
              Serialize the result. The animated SVG is one self-contained file
              with the CSS baked in and no runtime to ship.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container section">
        <div className="section-head">
          <span className="bp-figure">Fig. 02 / What you get</span>
        </div>
        <div className="features">
          <div className="feature">
            <span className="bp-kicker">Signature</span>
            <h3>Self-drawing edges</h3>
            <p>
              The classic line-draws-itself effect, applied to every connector,
              normalized so timing is independent of path length.
            </p>
          </div>
          <div className="feature">
            <span className="bp-kicker">Legibility</span>
            <h3>Draw order that reads</h3>
            <p>
              Elements animate along the diagram&apos;s flow axis, top-to-bottom
              or left-to-right, so the structure assembles the way you read it.
            </p>
          </div>
          <div className="feature">
            <span className="bp-kicker">Portable</span>
            <h3>Zero runtime</h3>
            <p>
              The exported SVG carries its own CSS. Open it as a bare file and it
              animates: no script tag, no library, nothing to load.
            </p>
          </div>
          <div className="feature">
            <span className="bp-kicker">Narrative</span>
            <h3>Scroll-driven mode</h3>
            <p>
              The same engine, paused. A diagram can assemble as the reader
              scrolls it into view. See the{" "}
              <Link href="/demo">scroll demo</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Export matrix teaser */}
      <section className="container section container-tight">
        <div className="section-head">
          <span className="bp-figure">Fig. 03 / Where it works</span>
          <p className="lead">
            An animated SVG is perfect for pages you control. For places that
            strip SVG animation (GitHub, email), a raster export is the honest
            answer. Diagraw is built for both.
          </p>
        </div>
        <div className="docs-table-wrap">
          <table className="bp-table">
            <thead>
              <tr>
                <th>Destination</th>
                <th>Animated SVG</th>
                <th>The everywhere path</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Your own site / slides / React</td>
                <td>
                  <span className="yes">Yes</span>
                </td>
                <td>Inline SVG (hero)</td>
              </tr>
              <tr>
                <td>Opened as a bare .svg file</td>
                <td>
                  <span className="yes">Yes</span>
                </td>
                <td>The file itself</td>
              </tr>
              <tr>
                <td>GitHub README / email</td>
                <td>
                  <span className="no">No</span>
                </td>
                <td>GIF / MP4 (roadmap)</td>
              </tr>
            </tbody>
            <caption>
              Full detail in the <Link href="/docs#export">export docs</Link>.
            </caption>
          </table>
        </div>
        <div className="hero-actions">
          <Link href="/editor" className="btn btn-lg">
            Try it now
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
