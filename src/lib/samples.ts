/** Starter diagrams offered in the editor. */
export interface Sample {
  id: string;
  label: string;
  source: string;
}

export const SAMPLES: Sample[] = [
  {
    id: "flow",
    label: "Flowchart",
    source: `flowchart TD
  A[Client request] --> B{Load balancer}
  B --> C[Web server 1]
  B --> D[Web server 2]
  C --> E[(Database)]
  D --> E
  E --> F[Cache]
  F --> G[Response]`,
  },
  {
    id: "sequence",
    label: "Sequence",
    source: `sequenceDiagram
  participant U as User
  participant A as API
  participant D as Database
  U->>A: POST /order
  A->>D: insert order
  D-->>A: order id
  A-->>U: 201 Created`,
  },
  {
    id: "state",
    label: "State",
    source: `stateDiagram-v2
  [*] --> Idle
  Idle --> Loading: fetch
  Loading --> Ready: success
  Loading --> Error: failure
  Ready --> Idle: reset
  Error --> Idle: retry`,
  },
  {
    id: "mindmap",
    label: "Mindmap",
    source: `mindmap
  root((Diagraw))
    Render
      Mermaid v11
    Animate
      Self-draw edges
      Fade nodes
    Export
      Animated SVG
      GIF / MP4`,
  },
  {
    id: "git",
    label: "Git graph",
    source: `gitGraph
  commit
  branch develop
  commit
  commit
  checkout main
  merge develop
  commit`,
  },
  {
    id: "timeline",
    label: "Timeline",
    source: `timeline
  title Release history
  2024 : Spike
  2025 : v0.1 : Editor
  2026 : v1.0 : Raster export`,
  },
];

export const DEFAULT_SOURCE = SAMPLES[0].source;
