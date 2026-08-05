import { getPatientById, getSimilarPatients } from "@/lib/patients";
import PatientCard from "@/components/PatientCard";
import { Users } from "lucide-react";

const subtypeLabel: Record<string, string> = {
  high_grade_astrocytoma: "high-grade astrocytoma",
  DMG_DIPG: "DMG / DIPG",
};

export default async function SimilarPatientsPage({
  params,
}: {
  params: { id: string };
}) {
  const [patient, similar] = await Promise.all([
    getPatientById(params.id),
    getSimilarPatients(params.id),
  ]);

  if (!patient?.subtype) {
    return (
      <p className="text-sm text-muted">
        No diagnosis for this scan yet, so there is nothing to match against.
      </p>
    );
  }

  const label = subtypeLabel[patient.subtype] ?? patient.subtype;

  return (
    <div className="flex flex-col gap-5">
      {/* Says what "similar" means here: these share a model prediction, not a
          confirmed pathological diagnosis. */}
      <p className="text-sm text-muted">
        Your other patients whose scans were also predicted{" "}
        <span className="font-medium text-ink">{label}</span>.
      </p>

      {similar.length === 0 ? (
        <div className="rounded-card bg-white border border-black/5 px-6 py-10 text-center">
          <span className="w-12 h-12 rounded-full bg-teal-light text-teal flex items-center justify-center mx-auto mb-3">
            <Users size={22} />
          </span>
          <p className="text-sm font-medium mb-1">No other cases yet</p>
          <p className="text-xs text-muted">
            This is currently your only patient with this predicted subtype.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {similar.map((p) => (
            <PatientCard key={p.id} patient={p} />
          ))}
        </div>
      )}
    </div>
  );
}
