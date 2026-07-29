import { Info } from "lucide-react";

export default function CaveatBanner({ text }: { text: string }) {
  return (
    <div className="bg-yellow-light border border-yellow rounded-lg px-4 py-3 flex gap-2.5 items-start">
      <Info size={16} className="text-yellow-700 mt-0.5 shrink-0" />
      <span className="text-sm text-yellow-900">{text}</span>
    </div>
  );
}
