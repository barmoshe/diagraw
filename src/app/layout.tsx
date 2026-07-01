import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./tokens.css";
import "./base.css";
import "./blueprint.css";
import "./components.css";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-app" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });

// Default = blueprint dark. Add `.light` only when the user opts in (or picks
// auto and the system is light). Runs before paint, so no flash.
const PREPAINT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("bm:theme")||"dark";var light=t==="light"||(t==="auto"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches);d.classList.toggle("light",light);var c=localStorage.getItem("bm:contrast");if(c)d.dataset.contrast=c;var s=parseFloat(localStorage.getItem("bm:text-scale"));if(s&&s>0)d.style.setProperty("--text-scale",String(s));}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://barmoshe.github.io/diagraw"),
  title: {
    default: "Diagraw: Mermaid diagrams that draw themselves",
    template: "%s · Diagraw",
  },
  description:
    "Paste a Mermaid diagram, watch it draw itself, and export a self-contained animated SVG with zero runtime. A blueprint for motion.",
  keywords: [
    "mermaid",
    "diagram",
    "animation",
    "animated svg",
    "self-drawing",
    "flowchart",
    "sequence diagram",
  ],
  authors: [{ name: "Bar Moshe" }],
  openGraph: {
    title: "Diagraw: Mermaid diagrams that draw themselves",
    description:
      "Turn a Mermaid diagram into a self-contained animated SVG with zero runtime.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="bp-grid app-shell">
          <SiteNav />
          {children}
        </div>
      </body>
    </html>
  );
}
