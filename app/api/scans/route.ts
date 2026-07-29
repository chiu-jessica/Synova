import { NextResponse } from "next/server";
import { getCurrentPhysicianId } from "@/lib/current-user";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { analyzeScan } from "@/lib/analysis";
import { SCAN_BUCKET, storagePrefixFor } from "@/lib/scans";

// Called once the browser has finished uploading to the signed URL. Records
// the patient and scan, runs the analysis, and stores the result.
export async function POST(req: Request) {
  const physicianId = await getCurrentPhysicianId();
  if (!physicianId) {
    return NextResponse.json(
      { error: "You must be signed in to upload a scan." },
      { status: 401 }
    );
  }

  let body: { patientIdentifier?: string; path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const patientIdentifier = body.patientIdentifier?.trim() ?? "";
  const path = body.path?.trim() ?? "";

  if (!patientIdentifier) {
    return NextResponse.json(
      { error: "A patient ID is required." },
      { status: 400 }
    );
  }
  // The client supplies the storage path, so verify it sits under this
  // physician's prefix rather than trusting it.
  if (!path.startsWith(storagePrefixFor(physicianId))) {
    return NextResponse.json({ error: "Invalid scan path." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  // Confirm the upload actually landed before recording a row that points at
  // it — a failed upload should not leave a scan referencing nothing.
  const lastSlash = path.lastIndexOf("/");
  const { data: listed, error: listError } = await supabase.storage
    .from(SCAN_BUCKET)
    .list(path.slice(0, lastSlash), { search: path.slice(lastSlash + 1) });

  if (listError || !listed?.length) {
    return NextResponse.json(
      { error: "The uploaded file could not be found. Please try again." },
      { status: 400 }
    );
  }

  // Re-use the patient when this physician has already recorded that
  // identifier, so a follow-up scan attaches to the same patient.
  const { data: existing } = await supabase
    .from("patients")
    .select("id")
    .eq("patient_identifier", patientIdentifier)
    .eq("created_by", physicianId)
    .maybeSingle();

  let patientId = existing?.id as string | undefined;

  if (!patientId) {
    const { data: created, error: patientError } = await supabase
      .from("patients")
      .insert({ patient_identifier: patientIdentifier, created_by: physicianId })
      .select("id")
      .single();

    if (patientError || !created) {
      console.error("Failed to create patient:", patientError?.message);
      return NextResponse.json(
        { error: "Could not save the patient. Please try again." },
        { status: 500 }
      );
    }
    patientId = created.id;
  }

  const { data: scan, error: scanError } = await supabase
    .from("scans")
    .insert({ patient_id: patientId, file_url: path, sequence_type: "t1c" })
    .select("id")
    .single();

  if (scanError || !scan) {
    console.error("Failed to create scan:", scanError?.message);
    return NextResponse.json(
      { error: "Could not save the scan. Please try again." },
      { status: 500 }
    );
  }

  // If analysis fails the patient and scan still stand — the patient just
  // shows as "Analysis pending" until a result is written.
  try {
    const result = await analyzeScan({ scanId: scan.id, storagePath: path });

    const { error: resultError } = await supabase.from("scan_results").insert({
      scan_id: scan.id,
      predicted_subtype: result.predictedSubtype,
      confidence_score: result.confidence,
      heatmap_url: result.heatmapUrl,
      segmentation_url: result.segmentationUrl,
    });

    if (resultError) throw new Error(resultError.message);
  } catch (err) {
    console.error("Analysis failed:", (err as Error).message);
    return NextResponse.json(
      { patientId, scanId: scan.id, analysisFailed: true },
      { status: 200 }
    );
  }

  return NextResponse.json({ patientId, scanId: scan.id });
}
