import { getPatientById } from "@/lib/patients";
import ConfidenceBar from "@/components/ConfidenceBar";
import CaveatBanner from "@/components/CaveatBanner";
import { ScanEye } from "lucide-react";

const subtypeLabel: Record<string, string> = {
  high_grade_astrocytoma: "High-grade astrocytoma",
  DMG_DIPG: "Diffuse midline glioma (DMG/DIPG)",
};

export default async function DiagnosisPage({
  params,
}: {
  params: { id: string };
}) {
  const patient = await getPatientById(params.id);
  if (!patient) return <p className="text-sm text-gray-500">Patient not found.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-card h-[280px] flex flex-col items-center justify-center gap-2">
        <ScanEye className="text-gray-300" size={28} />
        <span className="text-xs text-gray-400">Tumor-representative slice</span>
      </div>

      <div className="flex flex-col gap-5">
        <div className="border border-gray-200 rounded-card p-5 bg-white">
          <p className="text-xs text-gray-400 mb-1">Predicted subtype</p>
          {patient.subtype ? (
            <>
              <p className="text-lg font-medium mb-4">
                {subtypeLabel[patient.subtype]}
              </p>
              <ConfidenceBar score={patient.confidence ?? 0} />
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Analysis pending — no result recorded for this scan yet.
            </p>
          )}
        </div>

        <CaveatBanner text="AI-assisted estimate — confirm with clinical and pathology review." />
      </div>
    </div>
  );
}
