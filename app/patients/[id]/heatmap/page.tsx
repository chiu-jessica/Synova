import CaveatBanner from "@/components/CaveatBanner";
import { ScanEye, Focus, Flame } from "lucide-react";

const panels = [
  { icon: ScanEye, label: "Original scan" },
  { icon: Focus, label: "Expert segmentation" },
  { icon: Flame, label: "Grad-CAM attention" },
];

export default function HeatmapPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {panels.map(({ icon: Icon, label }) => (
          <div key={label}>
            <div className="bg-white border border-gray-200 rounded-card h-[180px] flex items-center justify-center">
              <Icon className="text-gray-300" size={26} />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">{label}</p>
          </div>
        ))}
      </div>
      <CaveatBanner text="Attention maps show where the model focused, not a diagnosis. Review alongside the full scan." />
    </div>
  );
}
