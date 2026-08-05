import CaveatBanner from "@/components/CaveatBanner";
import ScanImage from "@/components/ScanImage";
import { getScanImages } from "@/lib/patients";
import { ScanEye, Flame } from "lucide-react";

export default async function HeatmapPage({
  params,
}: {
  params: { id: string };
}) {
  const images = await getScanImages(params.id);

  const panels = [
    { icon: ScanEye, label: "Original scan", src: images.original },
    { icon: Flame, label: "Grad-CAM attention", src: images.gradcam },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {panels.map(({ icon: Icon, label, src }) => (
          <div key={label}>
            <ScanImage
              src={src}
              alt={label}
              icon={<Icon className="text-teal/30" size={40} />}
              className="h-[260px] lg:h-[380px] xl:h-[440px]"
            />
            <p className="text-sm text-muted text-center mt-2.5">{label}</p>
          </div>
        ))}
      </div>
      <CaveatBanner text="Attention maps show where the model focused, not a diagnosis. Review alongside the full scan." />
    </div>
  );
}
