import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentPhysicianId } from "@/lib/current-user";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { SCAN_BUCKET, isAllowedScanFile, storagePrefixFor } from "@/lib/scans";

// Hands the browser a short-lived signed URL so it can upload the scan
// straight to Supabase Storage. Doing it this way keeps the service key on
// the server and keeps multi-megabyte MRI files out of the API route's
// request body, which serverless platforms cap well below typical scan sizes.
export async function POST(req: Request) {
  const physicianId = await getCurrentPhysicianId();
  if (!physicianId) {
    return NextResponse.json(
      { error: "You must be signed in to upload a scan." },
      { status: 401 }
    );
  }

  let body: { fileName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fileName = body.fileName?.trim() ?? "";
  if (!isAllowedScanFile(fileName)) {
    return NextResponse.json(
      { error: "Upload a .nii, .nii.gz, or .dcm file." },
      { status: 400 }
    );
  }

  // Namespaced by physician so one account's uploads can never collide with
  // or overwrite another's, and prefixed with a uuid so re-uploading the same
  // filename doesn't clobber an earlier scan.
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${storagePrefixFor(physicianId)}${randomUUID()}-${safeName}`;

  const { data, error } = await getSupabaseServiceClient()
    .storage.from(SCAN_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("Failed to create signed upload URL:", error?.message);
    return NextResponse.json(
      { error: "Could not start the upload. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
