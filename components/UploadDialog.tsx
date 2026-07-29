"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SCAN_BUCKET, isAllowedScanFile } from "@/lib/scans";

type Status = "idle" | "uploading" | "analyzing";

export default function UploadDialog({ onClose }: { onClose: () => void }) {
  const [patientId, setPatientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const busy = status !== "idle";

  async function handleSubmit() {
    if (!file || !patientId) return;
    if (!isAllowedScanFile(file.name)) {
      setError("Upload a .nii, .nii.gz, or .dcm file.");
      return;
    }

    setError(null);
    setStatus("uploading");

    try {
      // 1. Ask the server for a signed upload URL (service key stays server-side).
      const urlRes = await fetch("/api/scans/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
      });
      const urlData = await urlRes.json();
      if (!urlRes.ok) throw new Error(urlData.error ?? "Could not start the upload.");

      // 2. Send the file straight to Supabase Storage.
      const { error: uploadError } = await supabase.storage
        .from(SCAN_BUCKET)
        .uploadToSignedUrl(urlData.path, urlData.token, file);
      if (uploadError) throw new Error(uploadError.message);

      // 3. Record the patient and scan, then analyse it.
      setStatus("analyzing");
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientIdentifier: patientId, path: urlData.path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save the scan.");

      router.push(`/patients/${data.patientId}/diagnosis`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-card p-6 w-[420px]">
        <h2 className="text-lg font-medium mb-4">Upload MRI scan</h2>

        <label className="text-sm text-gray-600 block mb-1">Patient ID</label>
        <input
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="BraTS-PED-00012"
          disabled={busy}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 disabled:bg-gray-50"
        />

        <label
          htmlFor="file-upload"
          className="border-2 border-dashed border-gray-200 rounded-card flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-teal"
        >
          <UploadCloud size={24} className="text-gray-400" />
          <span className="text-sm text-gray-500">
            {file ? file.name : "Drop a .nii.gz or DICOM file, or click to browse"}
          </span>
          <input
            id="file-upload"
            type="file"
            accept=".nii,.nii.gz,.dcm"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
            }}
          />
        </label>

        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || !patientId || busy}
            className="px-4 py-2 text-sm rounded-lg bg-teal text-white flex items-center gap-2 disabled:opacity-50"
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
