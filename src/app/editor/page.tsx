import type { Metadata } from "next";
import Editor from "@/components/Editor";

export const metadata: Metadata = {
  title: "Editor",
  description:
    "Paste Mermaid source, tune the animation, and export a self-contained animated SVG.",
};

export default function EditorPage() {
  return (
    <main id="main" tabIndex={-1} className="editor-page">
      <Editor />
    </main>
  );
}
