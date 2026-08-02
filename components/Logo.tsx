import Image from "next/image";

// The brand mark. Kept in one component so the asset path, sizing, and the
// all-caps wordmark stay consistent everywhere it appears.
export default function Logo({
  size = 28,
  showName = false,
  nameClass = "font-medium text-lg tracking-wide",
  className = "",
}: {
  size?: number;
  showName?: boolean;
  nameClass?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="SYNOVA"
        width={size}
        height={size}
        priority
        className="shrink-0"
      />
      {showName && <span className={nameClass}>SYNOVA</span>}
    </span>
  );
}
