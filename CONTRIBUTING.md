# Contributing to Diagraw

Thanks for your interest in Diagraw. Contributions of all sizes are welcome,
from typo fixes to new animation features. This guide covers how to get set up
and what to expect when you open a pull request.

## Getting started

You will need Node 26 (see `.nvmrc`) and npm.

```bash
npm install
npm run dev
```

`npm run dev` starts the local Next.js server. Open the printed URL in your
browser and you should see the editor.

## Project layout

- `src/lib/` holds the animation engine. This is a pure module: it takes a
  rendered diagram and produces the self-contained animated SVG, with no
  dependency on React or the DOM outside of what it needs to read the diagram.
  Keeping it pure makes it easy to test and reason about.
- `src/app/` is the Next.js application: the editor UI, routes, and the layer
  that wires the engine to the browser.

If you are adding animation behavior, it usually belongs in `src/lib/`. If you
are changing the editor experience, it usually belongs in `src/app/`.

## Running checks locally

Before opening a pull request, run the same checks that CI runs:

```bash
npm run lint
npm run typecheck
npm run build
```

`lint` runs ESLint (including the accessibility rules from
`eslint-config-next`), `typecheck` runs `tsc --noEmit`, and `build` runs
`next build`. All three should pass before you push.

## Branches and pull requests

- Keep pull requests small and focused. One change per pull request is easier to
  review and faster to merge.
- Conventional-commit-style messages are encouraged (for example
  `feat: add scroll-driven assembly mode` or `fix: correct edge trace order`),
  though they are not strictly required.
- CI must be green before a pull request can merge.
- If your change affects behavior users will notice, add a note under the
  `## [Unreleased]` section in `CHANGELOG.md`.

## Copy style

Documentation and UI copy in Diagraw avoid em dashes. Use commas, colons,
periods, or parentheses instead. Keep the voice plain and matter-of-fact.

## Good first issues

Issues labeled `good first issue` are a good place to start. They are scoped to
be approachable without deep knowledge of the whole codebase. If you would like
to work on one, leave a comment so others know it is being picked up.

If something is unclear, open an issue and ask. A question is a fine
contribution too.
