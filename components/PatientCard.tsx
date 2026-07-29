import Link from "next/link";
import type { Patient } from "@/lib/patients";

const subtypeLabel: Record<string, string> = {
  high_grade_astrocytoma: "High-grade astrocytoma",
  DMG_DIPG: "DMG / DIPG",
};

export default function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Link
      href={`/patients/${patient.id}/diagnosis`}
      className="block border border-gray-200 rounded-card p-4 hover:border-teal transition-colors bg-white"
    >
      <p className="font-medium text-sm">{patient.patientIdentifier}</p>
      <p className="text-xs text-gray-500 mb-2">{patient.uploadedAt}</p>
      {patient.subtype ? (
        <span className="inline-block text-xs px-2 py-1 rounded-full bg-teal-light text-teal-dark">
          {subtypeLabel[patient.subtype]}
        </span>
      ) : (
        <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
          Analysis pending
        </span>
      )}
    </Link>
  );
}
