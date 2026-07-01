import type { NextConfig } from "next";
import path from "node:path";

/**
 * Static export for GitHub Pages.
 *
 * The whole app is client-side (mermaid + the Diagraw engine run in the browser),
 * so we export a fully static site. Repo Pages serve under a sub-path, hence
 * `basePath`. `.nojekyll` (in public/) keeps Pages from dropping the _next/ dir.
 *
 * For local development basePath is disabled so the dev server serves at root.
 * Set DIAGRAW_BASE_PATH="" to build without the prefix (e.g. a user/org Pages site
 * or a custom domain).
 */
const isProd = process.env.NODE_ENV === "production";
const basePath =
  process.env.DIAGRAW_BASE_PATH ?? (isProd ? "/diagraw" : "");

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  // Pin the workspace root (a stray lockfile in a parent dir otherwise confuses
  // Turbopack's root inference).
  turbopack: { root: path.resolve() },
};

export default nextConfig;
