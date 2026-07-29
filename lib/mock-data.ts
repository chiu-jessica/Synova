export type Subtype = "high_grade_astrocytoma" | "DMG_DIPG";

export interface MockPatient {
  id: string;
  patientIdentifier: string;
  uploadedAt: string;
  subtype: Subtype;
  confidence: number;
  similarPatientIds: string[];
}

export const mockPatients: MockPatient[] = [
  { id: "p1", patientIdentifier: "BraTS-PED-00012", uploadedAt: "2026-07-20", subtype: "high_grade_astrocytoma", confidence: 0.89, similarPatientIds: ["p4", "p7"] },
  { id: "p2", patientIdentifier: "BraTS-PED-00045", uploadedAt: "2026-07-18", subtype: "DMG_DIPG", confidence: 0.76, similarPatientIds: ["p6"] },
  { id: "p3", patientIdentifier: "BraTS-PED-00091", uploadedAt: "2026-07-15", subtype: "DMG_DIPG", confidence: 0.82, similarPatientIds: ["p2", "p6"] },
  { id: "p4", patientIdentifier: "BraTS-PED-00033", uploadedAt: "2026-07-12", subtype: "high_grade_astrocytoma", confidence: 0.94, similarPatientIds: ["p1"] },
  { id: "p5", patientIdentifier: "BraTS-PED-00078", uploadedAt: "2026-07-10", subtype: "high_grade_astrocytoma", confidence: 0.71, similarPatientIds: ["p4"] },
  { id: "p6", patientIdentifier: "BraTS-PED-00102", uploadedAt: "2026-07-08", subtype: "DMG_DIPG", confidence: 0.85, similarPatientIds: ["p2", "p3"] },
  { id: "p7", patientIdentifier: "BraTS-PED-00019", uploadedAt: "2026-07-05", subtype: "high_grade_astrocytoma", confidence: 0.79, similarPatientIds: ["p1", "p4"] },
  { id: "p8", patientIdentifier: "BraTS-PED-00060", uploadedAt: "2026-07-01", subtype: "DMG_DIPG", confidence: 0.88, similarPatientIds: ["p3"] },
];

export function getPatient(id: string) {
  return mockPatients.find((p) => p.id === id);
}

export function getSimilarPatients(id: string) {
  const patient = getPatient(id);
  if (!patient) return [];
  return patient.similarPatientIds.map(getPatient).filter(Boolean) as MockPatient[];
}
