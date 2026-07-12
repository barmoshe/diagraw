import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import Wordmark from "./Wordmark";

const LINKS = [
  { href: "/editor", label: "Editor" },
  { href: "/gallery", label: "Gallery" },
  { href: "/docs", label: "Docs" },
  { href: "/changelog", label: "Changelog" },
  { href: "/demo", label: "Scroll demo" },
];

export default function SiteNav() {
  return (
    <header className="site-nav">
      <Link href="/" className="nav-brand" aria-label="Diagraw home">
        <Wordmark />
      </Link>
      <nav className="nav-links" aria-label="Primary">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <a
          href="https://github.com/barmoshe/diagraw"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
