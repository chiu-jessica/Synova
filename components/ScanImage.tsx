import type { ReactNode } from "react";

// Renders a stored scan image, falling back to the placeholder icon when the
// model has not produced one yet (or the object is missing from Storage).
//
// A plain <img> rather than next/image: these are time-limited signed URLs
// on the Supabase host, so there is nothing stable for the optimizer to
// cache, and each would need a remotePatterns entry.
export default function ScanImage({
  src,
  alt,
  icon,
  className = "",
}: {
  src: string | null;
  alt: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-card shadow-[0_1px_2px_rgba(28,28,28,0.06)] overflow-hidden flex items-center justify-center ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-contain" />
      ) : (
        icon
      )}
    </div>
  );
}
