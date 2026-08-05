import { NextResponse } from "next/server";
import { getCurrentPhysicianId } from "@/lib/current-user";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { SCAN_BUCKET, storagePrefixFor } from "@/lib/scans";

interface ScanRow {
  id: string;
  file_url: string | null;
  scan_results: { heatmap_url: string | null; segmentation_url: string | null }[] | null;
}

// Deletes a patient and everything hanging off it: scans, results, and the
// stored files. Scoped by created_by, so one physician cannot delete
// another's record even with a valid id.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const physicianId = await getCurrentPhysicianId();
  if (!physicianId) {
    return NextResponse.json({ error: "You are not signed in." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  const { data, error: readError } = await supabase
    .from("patients")
    .select("id, scans(id, file_url, scan_results(heatmap_url, segmentation_url))")
    .eq("id", params.id)
    .eq("created_by", physicianId)
    .maybeSingle();

  if (readError) {
    console.error("Failed to load patient for deletion:", readError.message);
    return NextResponse.json({ error: "Could not delete the patient." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  // Collect the stored objects before the rows go away, since the paths only
  // exist on those rows.
  const prefix = storagePrefixFor(physicianId);
  const objects: string[] = [];

  for (const scan of (data.scans ?? []) as ScanRow[]) {
    // Seeded demo rows use a placeholder:// marker rather than a real object.
    if (scan.file_url && !scan.file_url.includes("://")) objects.push(scan.file_url);
    // The original slice has no column — same derived path /api/scans writes.
    objects.push(`${prefix}results/${scan.id}-original.png`);
    for (const result of scan.scan_results ?? []) {
      if (result.heatmap_url) objects.push(result.heatmap_url);
      if (result.segmentation_url) objects.push(result.segmentation_url);
    }
  }

  // similar_patients.similar_patient_id has no ON DELETE CASCADE, so rows
  // pointing at this patient must go first or the delete hits a foreign-key
  // violation. (Links from its own scan_results cascade on their own.)
  const { error: linkError } = await supabase
    .from("similar_patients")
    .delete()
    .eq("similar_patient_id", params.id);

  if (linkError) {
    console.error("Failed to clear similar-patient links:", linkError.message);
    return NextResponse.json({ error: "Could not delete the patient." }, { status: 500 });
  }

  const { error: deleteError } = await supabase
    .from("patients")
    .delete()
    .eq("id", params.id)
    .eq("created_by", physicianId);

  if (deleteError) {
    console.error("Failed to delete patient:", deleteError.message);
    return NextResponse.json({ error: "Could not delete the patient." }, { status: 500 });
  }

  // Storage last: an orphaned object is recoverable, a row pointing at a
  // deleted file is not.
  if (objects.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(SCAN_BUCKET)
      .remove(objects);
    if (storageError) {
      console.error("Patient deleted but files remain:", storageError.message);
    }
  }

  return NextResponse.json({ ok: true });
}
