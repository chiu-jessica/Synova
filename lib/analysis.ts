import type { Subtype } from "@/lib/mock-data";

export interface AnalysisResult {
  predictedSubtype: Subtype;
  confidence: number;
  heatmapUrl: string | null;
  segmentationUrl: string | null;
}

const SUBTYPES: Subtype[] = ["high_grade_astrocytoma", "DMG_DIPG"];

// MOCK inference. This is the single seam where the real model gets wired in:
// replace the body with a call to the model-serving backend (e.g. a FastAPI
// service given a signed URL for `storagePath`), and store the heatmap /
// segmentation images it returns in Supabase Storage. Every caller — the
// upload flow and /api/analyze-scan — goes through here, so nothing else
// needs to change.
export async function analyzeScan(input: {
  scanId: string;
  storagePath: string;
}): Promise<AnalysisResult> {
  void input;
  await new Promise((r) => setTimeout(r, 2000)); // simulate processing time

  return {
    predictedSubtype: SUBTYPES[Math.floor(Math.random() * SUBTYPES.length)],
    confidence: +(0.7 + Math.random() * 0.25).toFixed(2),
    heatmapUrl: "/placeholder-heatmap.png",
    segmentationUrl: "/placeholder-segmentation.png",
  };
}
