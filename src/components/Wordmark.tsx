import Image from "next/image";

/** The Diagraw wordmark: the drafting-compass mark + the name. */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <Image
        src="/logo-nav.png"
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
