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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {panels.map(({ icon: Icon, label }) => (
          <div key={label}>
            <div className="bg-white rounded-card shadow-[0_1px_2px_rgba(28,28,28,0.06)] h-[260px] lg:h-[380px] xl:h-[440px] flex items-center justify-center">
              <Icon className="text-teal/30" size={40} />
            </div>
            <p className="text-sm text-muted text-center mt-2.5">{label}</p>
          </div>
        ))}
      </div>
      <CaveatBanner text="Attention maps show where the model focused, not a diagnosis. Review alongside the full scan." />
    </div>
  );
}
