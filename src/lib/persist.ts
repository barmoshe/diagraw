/**
 * Editor persistence: localStorage autosave + shareable-link encoding.
 *
 * A snapshot is `{ v, source, opts, theme }`. Links carry it as base64url JSON
 * in the URL *hash* (`#s=…`) so shared diagrams never reach server logs and
 * survive static hosting. The payload is versioned; decoding is defensive so
 * old or hand-mangled links degrade to "ignored", never to a crash.
 */

import {
  AnimateOptions,
  DEFAULT_OPTIONS,
  type MermaidTheme,
} from "@/lib/diagraw";

export interface EditorSnapshot {
  v: 1;
  source: string;
  opts: AnimateOptions;
  theme: MermaidTheme;
}

const STORAGE_KEY = "diagraw:editor:v1";
const HASH_PARAM = "s=";

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const bin = atob(s.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** Coerce unknown parsed JSON into a snapshot, or null if it isn't one. */
function asSnapshot(data: unknown): EditorSnapshot | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Partial<EditorSnapshot>;
  if (typeof d.source !== "string" || d.source.length === 0) return null;
  return {
    v: 1,
    source: d.source,
    // Merge over defaults so payloads from older/newer builds stay usable.
    opts: { ...DEFAULT_OPTIONS, ...(typeof d.opts === "object" ? d.opts : {}) },
    theme: typeof d.theme === "string" ? (d.theme as MermaidTheme) : "blueprint",
  };
}

export function encodeSnapshot(snap: EditorSnapshot): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(snap)));
}

export function decodeSnapshot(encoded: string): EditorSnapshot | null {
  try {
    return asSnapshot(
      JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))),
    );
  } catch {
    return null;
  }
}

/** Read a snapshot from the current URL hash (`#s=…`), if present. */
export function readHashSnapshot(): EditorSnapshot | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash.startsWith(HASH_PARAM)) return null;
  return decodeSnapshot(hash.slice(HASH_PARAM.length));
}

/** Build a shareable URL for the snapshot from the current location. */
export function buildShareUrl(snap: EditorSnapshot): string {
  const url = new URL(window.location.href);
  url.searchParams.delete("sample"); // the hash payload wins; drop the prefill
  url.hash = HASH_PARAM + encodeSnapshot(snap);
  return url.toString();
}

/** localStorage can throw (private mode, disabled) — treat it as best-effort. */
export function loadLocalSnapshot(): EditorSnapshot | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? asSnapshot(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveLocalSnapshot(snap: EditorSnapshot): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  } catch {
    // Best-effort: autosave silently unavailable.
  }
}
