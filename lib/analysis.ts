import type { Subtype } from "@/lib/mock-data";

export const MODEL_SERVICE_URL =
  process.env.MODEL_SERVICE_URL ?? "http://localhost:8000";

// Shape returned by the FastAPI service's POST /predict.
export interface AnalysisResult {
  predicted_subtype: Subtype;
  confidence: number;
  slice_index_used?: number;
  original_image_base64: string;
  gradcam_image_base64: string;
  segmentation_image_base64?: string;
}

export class ModelServiceError extends Error {
  constructor(message: string, readonly unreachable = false) {
    super(message);
    this.name = "ModelServiceError";
  }
}

// The single seam between the app and the model. Both callers go through
// here: /api/analyze-scan proxies a browser FormData straight through, and
// /api/scans rebuilds one from files it pulled out of Supabase Storage.
export async function runInference(formData: FormData): Promise<AnalysisResult> {
  let res: Response;
  try {
    res = await fetch(`${MODEL_SERVICE_URL}/predict`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    throw new ModelServiceError(
      `Could not reach the model service at ${MODEL_SERVICE_URL}. Is it running?`,
      true
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Model service error:", res.status, detail.slice(0, 500));
    throw new ModelServiceError("Model service failed to analyze this scan.");
  }

  return (await res.json()) as AnalysisResult;
}
