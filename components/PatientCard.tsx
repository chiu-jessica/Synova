import Link from "next/link";
import { ScanEye } from "lucide-react";
import type { Patient } from "@/lib/patients";

const subtypeLabel: Record<string, string> = {
  high_grade_astrocytoma: "High-grade astrocytoma",
  DMG_DIPG: "DMG / DIPG",
};

// Both subtypes share a pink chip — they are told apart by their label, not
// by colour.
const subtypeChipClass = "bg-pink-light text-pink-deep";

export default function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Link
      href={`/patients/${patient.id}/diagnosis`}
      className="group block rounded-card bg-white p-4 border border-black/5 shadow-[0_1px_2px_rgba(28,28,28,0.05)] hover:shadow-[0_6px_16px_rgba(6,148,148,0.14)] hover:border-teal/40 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="w-9 h-9 rounded-pill bg-teal-light text-teal flex items-center justify-center shrink-0 group-hover:bg-teal group-hover:text-white transition-colors">
          <ScanEye size={17} />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">
            {patient.patientIdentifier}
          </p>
          <p className="text-xs text-muted">{patient.uploadedAt}</p>
        </div>
      </div>

      {patient.subtype ? (
        <span
          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-pill ${subtypeChipClass}`}
        >
          {subtypeLabel[patient.subtype]}
        </span>
      ) : (
        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-pill bg-yellow-light text-yellow-deep">
          Analysis pending
        </span>
      )}
    </Link>
  );
}
