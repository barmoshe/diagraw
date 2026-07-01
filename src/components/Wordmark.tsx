import Image from "next/image";
import logoNav from "@/assets/logo-nav.png";

/** The Diagraw wordmark: the drafting-compass mark + the name.
 * The logo is a static import (not a public/ string path) so its final URL is
 * resolved at build time, including the GitHub Pages basePath; a raw string src
 * to a public/ asset does not get the basePath prefix under output: "export". */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <Image
        src={logoNav}
        alt=""
        width={28}
        height={28}
        priority
        className="wordmark-glyph"
      />
      <span className="wordmark-name">Diagraw</span>
    </span>
  );
}
