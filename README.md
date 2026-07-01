<div align="center">

# Diagraw

**Mermaid diagrams that draw themselves.**

Paste a [Mermaid](https://mermaid.js.org) diagram, watch it trace itself into
being, and export a self-contained animated SVG with zero runtime.

[Live site](https://barmoshe.github.io/diagraw) ·
[Editor](https://barmoshe.github.io/diagraw/editor) ·
[Docs](https://barmoshe.github.io/diagraw/docs) ·
[Scroll demo](https://barmoshe.github.io/diagraw/demo)

[![CI](https://github.com/barmoshe/diagraw/actions/workflows/ci.yml/badge.svg)](https://github.com/barmoshe/diagraw/actions/workflows/ci.yml)
[![Deploy](https://github.com/barmoshe/diagraw/actions/workflows/deploy.yml/badge.svg)](https://github.com/barmoshe/diagraw/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

## What it does

Diagraw takes the SVG that Mermaid renders and bakes a small stylesheet into it,
so the diagram animates on its own: edges trace themselves in flow order, nodes
fade in on a cascade. The exported file carries its own CSS and needs **no
JavaScript** to play. Open it as a bare `.svg` and it animates.

There is also a **scroll-driven** mode: the same engine, paused, so a diagram
assembles as the reader scrolls it into view.

## The technique

1. **Render.** Mermaid renders your source to an SVG (`mermaid.render()`).
2. **Order.** Diagraw ranks elements along the diagram's flow axis (top-to-bottom
   for flowcharts and sequence diagrams, left-to-right for LR and timelines).
3. **Bake.** Edges get `pathLength="1"` and animate `stroke-dashoffset` 1 to 0
   (self-drawing, independent of path length); nodes fade via `opacity`. A single
   `<style>` block with the keyframes and per-element delays is injected.
4. **Export.** Serialize the mutated SVG. That string is the whole artifact.

## Portability, honestly

A CSS-animated SVG animates **inline** in pages you control, and when opened as a
bare `.svg`. It does not animate everywhere:

| Destination | Animated SVG | Use instead |
|---|---|---|
| Inline in your HTML / JSX / slides | animates | Animated SVG |
| Opened as a bare `.svg` file | animates | Animated SVG |
| `<img src="diagram.svg">` | static | GIF / MP4 |
| GitHub README, email, Slack | stripped | GIF / MP4 |

A raster (GIF / MP4 / WebM) export, the true works-everywhere path, is the next
milestone on the [roadmap](https://barmoshe.github.io/diagraw/docs#roadmap).

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint (accessibility gate)
npm run typecheck  # tsc --noEmit
npm run build      # static export to ./out
```

The animation engine is a framework-neutral module in
[`src/lib/diagraw/`](src/lib/diagraw); the Next.js app is in
[`src/app/`](src/app). See [CONTRIBUTING.md](CONTRIBUTING.md).

## Deploy

The site is a static export (`output: "export"`) deployed to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to
`main`. The base path is `/diagraw` in production; set `DIAGRAW_BASE_PATH=""` to
build for a root domain.

## License

[MIT](LICENSE) © Bar Moshe
