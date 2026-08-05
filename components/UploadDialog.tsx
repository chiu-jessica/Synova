"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SCAN_BUCKET, isAllowedScanFile } from "@/lib/scans";

export default function UploadDialog({ onClose }: { onClose: () => void }) {
  const [patientId, setPatientId] = useState("");
  const [t1cFile, setT1cFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const busy = status !== "idle";

  // Uploads one file straight to Supabase Storage via a short-lived signed
  // URL, so the service key stays server-side and the file never passes
  // through an API route body.
  async function uploadToStorage(file: File): Promise<string> {
    const urlRes = await fetch("/api/scans/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name }),
    });
    const urlData = await urlRes.json();
    if (!urlRes.ok) throw new Error(urlData.error ?? "Could not start the upload.");

    const { error: uploadError } = await supabase.storage
      .from(SCAN_BUCKET)
      .uploadToSignedUrl(urlData.path, urlData.token, file);
    if (uploadError) throw new Error(uploadError.message);

    return urlData.path as string;
  }

  async function handleSubmit() {
    if (!t1cFile || !patientId) return;
    if (!isAllowedScanFile(t1cFile.name)) {
      setError("The T1c scan must be a .nii, .nii.gz, or .dcm file.");
      return;
    }

    setError(null);
    setStatus("uploading");

    try {
      // 1. Store the scan in Supabase, so the upload is kept rather than
      //    living only for the lifetime of the request.
      const path = await uploadToStorage(t1cFile);

      // 2. Record the patient and scan, run the model over the stored file,
      //    and save the result to `scan_results`.
      setStatus("analyzing");
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientIdentifier: patientId, path }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save the scan.");

      // The scan is saved either way; only the analysis may have failed.
      if (data.analysisFailed) {
        throw new Error(data.error ?? "Analysis failed.");
      }

      // Hand the rendered images to /results so it can show them without
      // re-fetching. The patient itself is now in the database, so it also
      // appears on the dashboard and its own patient page.
      sessionStorage.setItem(
        "lastResult",
        JSON.stringify({
          ...data.result,
          patientIdentifier: patientId,
          patientId: data.patientId,
        })
      );
      router.push("/results");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card p-6 w-[440px] max-h-full overflow-y-auto">
        <h2 className="text-lg font-medium mb-4">Upload MRI scan</h2>

        <label className="text-sm text-gray-700 block mb-1">Patient ID</label>
        <input
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="BraTS-PED-00012"
          disabled={busy}
          className="w-full border-2 border-teal-light rounded-pill px-4 py-2 text-sm mb-4 focus:border-teal focus:outline-none disabled:bg-gray-50"
        />

        <label className="text-sm text-gray-700 block mb-1">T1c scan</label>
        <label
          htmlFor="t1c-upload"
          className="border-2 border-dashed border-gray-200 rounded-card flex flex-col items-center justify-center gap-1.5 py-8 cursor-pointer hover:border-teal"
        >
          <UploadCloud size={20} className="text-gray-400" />
          <span className="text-xs text-muted px-3 text-center">
            {t1cFile ? t1cFile.name : "Drop a .nii.gz T1c file, or click to browse"}
          </span>
          <input
            id="t1c-upload"
            type="file"
            accept=".nii,.nii.gz,.dcm"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              setT1cFile(e.target.files?.[0] ?? null);
              setError(null);
            }}
          />
        </label>


        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-5 py-2 text-sm rounded-pill border-2 border-teal-light hover:bg-teal-light disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!t1cFile || !patientId || busy}
            className="px-5 py-2 text-sm font-medium rounded-pill bg-teal-dark text-white flex items-center gap-2 hover:bg-teal-deep disabled:opacity-50"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {status === "uploading"
              ? "Uploading scan…"
              : status === "analyzing"
                ? "Analyzing scan…"
                : "Analyze scan"}
          </button>
        </div>
      </div>
    </div>
  );
}
