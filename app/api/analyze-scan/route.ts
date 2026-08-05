import { NextResponse } from "next/server";
import { ModelServiceError, runInference } from "@/lib/analysis";

// Stateless proxy to the model service — analyses a scan without saving
// anything. The persisting path is /api/scans, which stores the scan in
// Supabase Storage and writes the result to `scan_results`.
export async function POST(req: Request) {
  try {
    return NextResponse.json(await runInference(await req.formData()));
  } catch (err) {
    if (err instanceof ModelServiceError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.unreachable ? 503 : 502 }
      );
    }
    throw err;
  }
}
