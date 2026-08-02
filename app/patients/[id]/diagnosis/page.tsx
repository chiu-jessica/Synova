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
  if (!patient) return <p className="text-sm text-muted">Patient not found.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="bg-white rounded-card shadow-[0_1px_2px_rgba(28,28,28,0.06)] min-h-[340px] lg:min-h-[500px] flex flex-col items-center justify-center gap-3">
        <ScanEye className="text-teal/30" size={48} />
        <span className="text-sm text-muted">Tumor-representative slice</span>
      </div>

      <div className="flex flex-col gap-5">
        {/* Sized to its content rather than stretched to match the scan panel
            beside it — matching heights left a lot of empty card. */}
        <div className="rounded-card p-8 bg-white shadow-[0_1px_2px_rgba(28,28,28,0.06)] flex flex-col gap-7">
          {patient.subtype ? (
            <>
              <div>
                <p className="text-sm text-muted mb-2">Predicted subtype</p>
                <p className="text-3xl font-medium leading-tight">
                  {subtypeLabel[patient.subtype]}
                </p>
              </div>

              <ConfidenceBar score={patient.confidence ?? 0} />

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 pt-6 border-t border-black/5">
                <div>
                  <dt className="text-xs text-muted mb-1">Scan date</dt>
                  <dd className="text-sm font-medium">{patient.uploadedAt}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted mb-1">Sequence</dt>
                  <dd className="text-sm font-medium">
                    {(patient.sequenceType ?? "—").toUpperCase()}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm font-medium mb-1">Analysis pending</p>
              <p className="text-xs text-muted">
                No result has been recorded for this scan yet.
              </p>
            </div>
          )}
        </div>

        <CaveatBanner text="AI-assisted estimate — confirm with clinical and pathology review." />
      </div>
    </div>
  );
}
