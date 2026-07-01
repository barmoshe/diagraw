import type { Metadata } from "next";
import Link from "next/link";
import SelfDrawingDiagram from "@/components/SelfDrawingDiagram";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Scroll demo",
  description:
    "A scroll-driven architecture walkthrough where each Diagraw diagram assembles itself as you read.",
};

const REQUEST_FLOW = `flowchart TD
  A[Client request] --> B{Load balancer}
  B --> C[Web server 1]
  B --> D[Web server 2]
  C --> E[(Database)]
  D --> E
  E --> F[Cache]
  F --> G[Response]`;

const ORDER_SEQ = `sequenceDiagram
  participant U as User
  participant A as API
  participant Q as Queue
  participant W as Worker
  U->>A: POST /order
  A->>Q: enqueue job
  A-->>U: 202 Accepted
  Q->>W: deliver job
  W->>W: process
  W-->>U: webhook: done`;

const DEPLOY_STATE = `stateDiagram-v2
  [*] --> Building
  Building --> Testing: build ok
  Building --> Failed: build error
  Testing --> Deploying: green
  Testing --> Failed: red
  Deploying --> Live: healthy
  Deploying --> RolledBack: unhealthy
  Live --> [*]`;

export default function DemoPage() {
  return (
    <>
      <main id="main" tabIndex={-1} className="demo-doc">
        <span className="bp-figure">Scroll demo</span>
        <h1>Anatomy of a web request</h1>
        <p className="demo-lede">
          Scroll down. Each diagram stays still until it reaches the middle of
          the screen, then draws itself, edge by edge, in flow order. The
          diagrams are plain animated SVGs: no JavaScript runs inside them. A
          tiny observer just decides when to start each one.
        </p>

        <section className="demo-section">
          <h2>1. The request path</h2>
          <p>
            A request lands on the load balancer, fans out to a web server, hits
            the database, warms the cache, and returns. Watching it build in
            order makes the flow legible in a way a static picture does not.
          </p>
          <div className="demo-stage bp-corners">
            <SelfDrawingDiagram source={REQUEST_FLOW} trigger="scroll" theme="blueprint" />
          </div>
        </section>

        <section className="demo-section">
          <h2>2. An asynchronous order</h2>
          <p>
            Sequence diagrams read top to bottom as time. Diagraw draws the
            messages in exactly that order, so the handoff from API to queue to
            worker reads like a story.
          </p>
          <div className="demo-stage bp-corners">
            <SelfDrawingDiagram source={ORDER_SEQ} trigger="scroll" theme="blueprint" />
          </div>
        </section>

        <section className="demo-section">
          <h2>3. A deployment&apos;s life</h2>
          <p>
            State machines assemble from their entry point outward. Build, test,
            deploy, and the branches that can go wrong all appear as the reader
            arrives at them.
          </p>
          <div className="demo-stage bp-corners">
            <SelfDrawingDiagram source={DEPLOY_STATE} trigger="scroll" theme="blueprint" />
          </div>
        </section>

        <footer className="demo-footer">
          <p>
            Every diagram on this page was produced by pasting Mermaid source
            into <Link href="/editor">the Diagraw editor</Link> and exporting an
            animated SVG.
          </p>
        </footer>
      </main>
      <SiteFooter />
    </>
  );
}
