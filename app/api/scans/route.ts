import { NextResponse } from "next/server";
import { getCurrentPhysicianId } from "@/lib/current-user";
import { getSupabaseServiceClient } from "@/lib/supabase";
import {
  AnalysisResult,
  ModelServiceError,
  runInference,
} from "@/lib/analysis";
import { SCAN_BUCKET, storagePrefixFor } from "@/lib/scans";
import type { SupabaseClient } from "@supabase/supabase-js";

// Called once the browser has finished uploading to the signed URL(s).
// Records the patient and scan, runs the real model over the stored files,
// and persists the result plus its rendered images.
export async function POST(req: Request) {
  const physicianId = await getCurrentPhysicianId();
  if (!physicianId) {
    return NextResponse.json(
      { error: "You must be signed in to upload a scan." },
      { status: 401 }
    );
  }

  let body: { patientIdentifier?: string; path?: string; segPath?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const patientIdentifier = body.patientIdentifier?.trim() ?? "";
  const path = body.path?.trim() ?? "";
  const segPath = body.segPath?.trim() || null;
  const prefix = storagePrefixFor(physicianId);

  if (!patientIdentifier) {
    return NextResponse.json(
      { error: "A patient ID is required." },
      { status: 400 }
    );
  }
  // The client supplies the storage paths, so verify they sit under this
  // physician's prefix rather than trusting them.
  if (!path.startsWith(prefix) || (segPath && !segPath.startsWith(prefix))) {
    return NextResponse.json({ error: "Invalid scan path." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  // Pull the uploaded files back out of Storage. This doubles as the
  // existence check — a failed upload should not leave a scan row pointing
  // at nothing.
  const { data: t1cBlob, error: t1cError } = await supabase.storage
    .from(SCAN_BUCKET)
    .download(path);

  if (t1cError || !t1cBlob) {
    return NextResponse.json(
      { error: "The uploaded file could not be found. Please try again." },
      { status: 400 }
    );
  }

  let segBlob: Blob | null = null;
  if (segPath) {
    const { data } = await supabase.storage.from(SCAN_BUCKET).download(segPath);
    segBlob = data ?? null;
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

  // If inference fails the patient and scan still stand — the patient shows
  // as "Analysis pending" until a result is written.
  let result: AnalysisResult;
  try {
    const formData = new FormData();
    formData.append("t1c_file", t1cBlob, path.split("/").pop() ?? "scan.nii.gz");
    if (segBlob && segPath) {
      formData.append("seg_file", segBlob, segPath.split("/").pop() ?? "seg.nii.gz");
    }
    result = await runInference(formData);
  } catch (err) {
    const message =
      err instanceof ModelServiceError ? err.message : "Analysis failed.";
    console.error("Analysis failed:", message);
    return NextResponse.json(
      { patientId, scanId: scan.id, analysisFailed: true, error: message },
      { status: 200 }
    );
  }

  // `scan_results` has columns for the heatmap and segmentation only, so the
  // original slice is stored under a path derived from the scan id and looked
  // up the same way by getScanImages().
  const [heatmapUrl, segmentationUrl] = await Promise.all([
    storeResultImage(supabase, prefix, scan.id, "gradcam", result.gradcam_image_base64),
    storeResultImage(supabase, prefix, scan.id, "segmentation", result.segmentation_image_base64),
    storeResultImage(supabase, prefix, scan.id, "original", result.original_image_base64),
  ]);

  const { error: resultError } = await supabase.from("scan_results").insert({
    scan_id: scan.id,
    predicted_subtype: result.predicted_subtype,
    confidence_score: result.confidence,
    heatmap_url: heatmapUrl,
    segmentation_url: segmentationUrl,
  });

  if (resultError) {
    console.error("Failed to save scan result:", resultError.message);
    return NextResponse.json(
      { patientId, scanId: scan.id, analysisFailed: true, error: "Could not save the result." },
      { status: 200 }
    );
  }

  // The base64 images ride back to the browser so /results can render them
  // immediately without a round trip to Storage.
  return NextResponse.json({ patientId, scanId: scan.id, result });
}

// Decodes one of the model's base64 PNGs into Storage and returns its path,
// so `scan_results` holds a reference rather than the image bytes.
async function storeResultImage(
  supabase: SupabaseClient,
  prefix: string,
  scanId: string,
  kind: string,
  base64?: string
): Promise<string | null> {
  if (!base64) return null;

  const objectPath = `${prefix}results/${scanId}-${kind}.png`;
  const bytes = Buffer.from(base64, "base64");

  const { error } = await supabase.storage
    .from(SCAN_BUCKET)
    .upload(objectPath, bytes, { contentType: "image/png", upsert: true });

  if (error) {
    console.error(`Failed to store ${kind} image:`, error.message);
    return null;
  }
  return objectPath;
}
