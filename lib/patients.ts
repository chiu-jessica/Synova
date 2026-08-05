import { cache } from "react";
import { getCurrentPhysicianId } from "@/lib/current-user";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { SCAN_BUCKET, storagePrefixFor } from "@/lib/scans";
import type { Subtype } from "@/lib/mock-data";

// The flattened shape the patient list UI renders. Each patient is
// summarised by its most recent scan and that scan's most recent result;
// both are null until the analysis step has written a `scan_results` row.
export interface Patient {
  id: string;
  patientIdentifier: string;
  uploadedAt: string;
  subtype: Subtype | null;
  confidence: number | null;
}

// Everything the single-patient views need on top of the list shape. The
// url fields stay null until the analysis step fills them in.
export interface PatientDetail extends Patient {
  scanId: string | null;
  scanResultId: string | null;
  scanFileUrl: string | null;
  sequenceType: string | null;
  heatmapUrl: string | null;
  segmentationUrl: string | null;
}

interface ScanResultRow {
  id: string;
  predicted_subtype: Subtype;
  confidence_score: number;
  heatmap_url: string | null;
  segmentation_url: string | null;
  created_at: string;
}

interface ScanRow {
  id: string;
  file_url: string;
  sequence_type: string | null;
  uploaded_at: string;
  scan_results: ScanResultRow[] | null;
}

interface PatientRow {
  id: string;
  patient_identifier: string;
  created_at: string;
  scans: ScanRow[] | null;
}

// A patient's current state is its newest scan and that scan's newest
// result — the schema allows several of each per patient.
function latestOf(row: PatientRow) {
  const scan = [...(row.scans ?? [])].sort((a, b) =>
    b.uploaded_at.localeCompare(a.uploaded_at)
  )[0];

  const result = [...(scan?.scan_results ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )[0];

  return { scan, result };
}

function toPatient(row: PatientRow): Patient {
  const { scan, result } = latestOf(row);

  return {
    id: row.id,
    patientIdentifier: row.patient_identifier,
    uploadedAt: (scan?.uploaded_at ?? row.created_at).slice(0, 10),
    subtype: result?.predicted_subtype ?? null,
    confidence: result?.confidence_score ?? null,
  };
}

function toPatientDetail(row: PatientRow): PatientDetail {
  const { scan, result } = latestOf(row);

  return {
    ...toPatient(row),
    scanId: scan?.id ?? null,
    scanResultId: result?.id ?? null,
    scanFileUrl: scan?.file_url ?? null,
    sequenceType: scan?.sequence_type ?? null,
    heatmapUrl: result?.heatmap_url ?? null,
    segmentationUrl: result?.segmentation_url ?? null,
  };
}

export async function getPatientsForPhysician(
  physicianId: string
): Promise<Patient[]> {
  // Server-side query uses the service client: the `patients` RLS policy is
  // written against auth.uid(), which a NextAuth session doesn't provide.
  // Scoping is enforced explicitly by the created_by filter below.
  const { data, error } = await getSupabaseServiceClient()
    .from("patients")
    .select("*, scans(*, scan_results(*))")
    .eq("created_by", physicianId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load patients:", error.message);
    return [];
  }
  return ((data ?? []) as PatientRow[]).map(toPatient);
}

export async function getPatientsForCurrentPhysician(): Promise<Patient[]> {
  const physicianId = await getCurrentPhysicianId();
  if (!physicianId) return [];
  return getPatientsForPhysician(physicianId);
}

// Wrapped in React's cache() so the patient layout and the tab rendered
// inside it share one round trip per request.
export const getPatientById = cache(async function getPatientById(
  id: string
): Promise<PatientDetail | null> {
  const physicianId = await getCurrentPhysicianId();
  if (!physicianId) return null;

  // Scoped by created_by as well as id: the service client bypasses RLS, so
  // without this filter any signed-in physician could read another's patient
  // by editing the URL.
  const { data, error } = await getSupabaseServiceClient()
    .from("patients")
    .select("*, scans(*, scan_results(*))")
    .eq("id", id)
    .eq("created_by", physicianId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load patient:", error.message);
    return null;
  }
  return data ? toPatientDetail(data as PatientRow) : null;
});

export interface ScanImages {
  original: string | null;
  segmentation: string | null;
  gradcam: string | null;
}

// Turns the stored image paths into short-lived signed URLs. The bucket is
// private, so the browser cannot read these objects directly.
//
// The Grad-CAM and segmentation paths come from `scan_results`. The original
// slice has no column of its own, so its path is derived from the scan id —
// the same convention /api/scans writes it under. A missing object simply
// yields null and the UI falls back to its placeholder.
export const getScanImages = cache(async function getScanImages(
  patientId: string
): Promise<ScanImages> {
  const empty: ScanImages = { original: null, segmentation: null, gradcam: null };

  const [patient, physicianId] = await Promise.all([
    getPatientById(patientId),
    getCurrentPhysicianId(),
  ]);
  if (!patient?.scanId || !physicianId) return empty;

  const originalPath = `${storagePrefixFor(physicianId)}results/${patient.scanId}-original.png`;
  const wanted = [
    ["original", originalPath],
    ["segmentation", patient.segmentationUrl],
    ["gradcam", patient.heatmapUrl],
  ] as const;

  const paths = wanted.map(([, p]) => p).filter((p): p is string => Boolean(p));
  if (paths.length === 0) return empty;

  const { data, error } = await getSupabaseServiceClient()
    .storage.from(SCAN_BUCKET)
    .createSignedUrls(paths, 60 * 60);

  if (error) {
    console.error("Failed to sign scan images:", error.message);
    return empty;
  }

  const byPath = new Map(
    (data ?? [])
      .filter((row) => row.signedUrl && !row.error)
      .map((row) => [row.path, row.signedUrl] as const)
  );

  return {
    original: byPath.get(originalPath) ?? null,
    segmentation: patient.segmentationUrl
      ? byPath.get(patient.segmentationUrl) ?? null
      : null,
    gradcam: patient.heatmapUrl ? byPath.get(patient.heatmapUrl) ?? null : null,
  };
});

// The reference cohort the model matched against, joined through the
// patient's most recent scan result.
export async function getSimilarPatients(patientId: string): Promise<Patient[]> {
  const patient = await getPatientById(patientId);
  // Nothing to match on until this patient has a result of its own.
  if (!patient?.subtype) return [];

  const all = await getPatientsForCurrentPhysician();

  return all.filter(
    (candidate) =>
      candidate.id !== patient.id && candidate.subtype === patient.subtype
  );
}
