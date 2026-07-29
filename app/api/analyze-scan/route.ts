import { NextResponse } from "next/server";
import { analyzeScan } from "@/lib/analysis";

// Thin HTTP wrapper around the inference seam in lib/analysis.ts, kept so a
// scan can be re-analysed on its own. The upload flow does not go through
// here — it calls analyzeScan() directly from /api/scans and persists the
// result. Swap the model in lib/analysis.ts and both paths pick it up.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const result = await analyzeScan({
    scanId: body.scanId ?? "",
    storagePath: body.storagePath ?? "",
  });

  return NextResponse.json(result);
}
