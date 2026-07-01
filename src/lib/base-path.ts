/** The configured base path (e.g. "/diagraw" in production, "" in dev). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a root-relative public asset path with the base path.
 * `next/link` and `next/font` handle basePath automatically, but raw references
 * to files in `public/` (og images, sample svgs) do not, so use this for those. */
export function withBase(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
