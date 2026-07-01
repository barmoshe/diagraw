import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-dim bp-dim">
        <span>DIAGRAW</span>
        <span>v0.1 / MIT</span>
      </div>
      <div className="footer-grid">
        <div>
          <p className="bp-kicker">Product</p>
          <Link href="/editor">Editor</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/demo">Scroll demo</Link>
        </div>
        <div>
          <p className="bp-kicker">Docs</p>
          <Link href="/docs">How it works</Link>
          <Link href="/docs#export">Export formats</Link>
          <Link href="/docs#roadmap">Roadmap</Link>
        </div>
        <div>
          <p className="bp-kicker">Source</p>
          <a
            href="https://github.com/barmoshe/diagraw"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://github.com/barmoshe/diagraw/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            Issues
          </a>
          <a
            href="https://github.com/barmoshe/diagraw/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT License
          </a>
        </div>
      </div>
      <p className="footer-note">
        Every diagram on this site was drawn by Diagraw. Open source, built by{" "}
        <a
          href="https://github.com/barmoshe"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bar Moshe
        </a>
        .
      </p>
    </footer>
  );
}
