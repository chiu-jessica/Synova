"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

// Deleting a patient also removes its scans, results, and stored files, so it
// asks first rather than acting on a single click.
export default function DeletePatientButton({
  patientId,
  patientIdentifier,
}: {
  patientId: string;
  patientIdentifier: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/patients/${patientId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not delete the patient.");
      }
      setConfirming(false);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${patientIdentifier}`}
        title="Delete patient"
        className="w-8 h-8 rounded-pill bg-white/90 text-muted flex items-center justify-center hover:bg-pink-light hover:text-pink-deep transition-colors"
      >
        <Trash2 size={15} />
      </button>

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card p-6 w-[420px]">
            <h2 className="text-lg font-medium mb-2">Delete this patient?</h2>
            <p className="text-sm text-muted mb-1">
              <span className="font-medium text-ink">{patientIdentifier}</span>{" "}
              and all of its scans and results will be removed.
            </p>
            <p className="text-xs text-muted">
              The uploaded scan files are deleted too. This cannot be undone.
            </p>

            {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setConfirming(false);
                  setError(null);
                }}
                disabled={deleting}
                className="px-5 py-2 text-sm rounded-pill border-2 border-teal-light hover:bg-teal-light disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 text-sm font-medium rounded-pill bg-pink-deep text-white flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                {deleting ? "Deleting…" : "Delete patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
