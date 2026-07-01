<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all
differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

Guidance for coding agents working in this repo.

## What this is

Diagraw turns a Mermaid diagram into a self-contained animated SVG (CSS baked in,
zero runtime), plus a scroll-driven mode. Next.js 16 + React 19 + TypeScript,
plain CSS with oklch design tokens (no Tailwind). Static export to GitHub Pages.

## Layout

- `src/lib/diagraw/` is the framework-neutral animation engine. Pure, no React.
  - `bake.ts` walks a live SVG and injects the self-drawing `<style>`.
  - `order.ts` ranks elements by position along the flow axis.
  - `render.ts` ties mermaid rendering to the engine (browser only).
- `src/components/` is the React UI (`Editor`, `SelfDrawingDiagram`, chrome).
- `src/app/` holds the routes: `/`, `/editor`, `/docs`, `/gallery`, `/demo`.
- `src/app/tokens.css` + `blueprint.css` are the "blueprint" brand system.

## Conventions

- Verify APIs against the installed versions, do not trust memory. Mermaid's SVG
  structure is version-specific; the engine reads the rendered DOM.
- Nodes animate `opacity` only, never `transform` (Mermaid uses `translate()` for
  node layout there).
- Respect `prefers-reduced-motion`: collapse to the final state.
- No em dashes in any copy or comments. Use commas, colons, or parentheses.
- Keep it a static-export-safe client app: no server-only features.

## Checks (all must pass)

```bash
npm run lint
npm run typecheck
npm run build   # produces ./out
```
