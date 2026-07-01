import type { Metadata } from "next";
import Link from "next/link";
import SelfDrawingDiagram from "@/components/SelfDrawingDiagram";
import SiteFooter from "@/components/SiteFooter";
import { SAMPLES } from "@/lib/samples";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A gallery of Diagraw animations across Mermaid diagram types, each assembling as you scroll.",
};

export default function GalleryPage() {
  const items = SAMPLES;
  return (
    <main id="main" tabIndex={-1} className="container">
      <section className="section">
        <div className="section-head">
          <span className="bp-figure">Fig. / Gallery</span>
          <h1>Every diagram, in motion</h1>
          <p className="lead">
            Scroll through. Each one stays still until it enters the frame, then
            draws itself in flow order. Open any of them in the editor to tweak
            the timing.
          </p>
        </div>

        <div className="gallery-grid">
          {items.map((item) => (
            <article key={item.id} className="gallery-item">
              <div className="gallery-canvas bp-corners">
                <SelfDrawingDiagram
                  source={item.source}
                  trigger="scroll"
                  theme="blueprint"
                />
              </div>
              <div className="gallery-foot">
                <span>{item.label}</span>
                <Link href={{ pathname: "/editor", query: { sample: item.id } }}>
                  Open in editor →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
