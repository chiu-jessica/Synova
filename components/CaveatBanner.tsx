import { Info } from "lucide-react";

// Deliberately the loudest non-teal element on the page: these caveats frame
// every AI output as an estimate, so they must stay easy to read rather than
// fading into the decoration.
export default function CaveatBanner({ text }: { text: string }) {
  return (
    <div className="bg-pink-light border-2 border-pink rounded-card px-4 py-3 flex gap-2.5 items-start">
      <Info size={16} className="text-pink-deep mt-0.5 shrink-0" />
      <span className="text-sm text-pink-deep">{text}</span>
    </div>
  );
}
