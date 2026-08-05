"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ConfidenceBar from "@/components/ConfidenceBar";
import CaveatBanner from "@/components/CaveatBanner";
import { ArrowLeft } from "lucide-react";

interface LiveResult {
  patientIdentifier: string;
  patientId?: string;
  predicted_subtype: string;
  confidence: number;
  original_image_base64: string;
  gradcam_image_base64: string;
  segmentation_image_base64?: string;
  slice_index_used?: number;
  slices_analyzed?: number;
  slice_selection?: "segmentation" | "aggregate";
}

const subtypeLabel: Record<string, string> = {
  high_grade_astrocytoma: "High-grade astrocytoma",
  DMG_DIPG: "Diffuse midline glioma (DMG/DIPG)",
};

function ScanPanel({ base64, label }: { base64: string; label: string }) {
  return (
    <div>
      <div className="rounded-card bg-white shadow-[0_1px_2px_rgba(28,28,28,0.06)] overflow-hidden h-[300px] lg:h-[380px] flex items-center justify-center">
        {/* Base64 data URIs, so a plain <img> rather than next/image — there
            is no URL for the optimizer to fetch. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${base64}`}
          alt={label}
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-sm text-muted text-center mt-2.5">{label}</p>
    </div>
  );
}

export default function ResultsPage() {
  const [result, setResult] = useState<LiveResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("lastResult");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        // A malformed entry should read as "nothing analysed yet" rather
        // than crashing the page.
      }
    }
    setLoaded(true);
  }, []);

  // Only the panels the model actually returned, so dropping the
  // segmentation does not leave an empty column behind.
  const panels = result
    ? [
        { base64: result.original_image_base64, label: "Original scan" },
        ...(result.segmentation_image_base64
          ? [
              {
                base64: result.segmentation_image_base64,
                label: "Expert segmentation",
              },
            ]
          : []),
        { base64: result.gradcam_image_base64, label: "Grad-CAM attention" },
      ]
    : [];

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-5xl">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-teal-deep font-medium mb-4 w-fit hover:underline"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        {!loaded ? null : !result ? (
          <div className="rounded-card bg-white border border-black/5 px-6 py-10 text-center">
            <p className="text-sm font-medium mb-1">No scan analyzed yet</p>
            <p className="text-xs text-muted">
              Upload one from the dashboard to see a live model result here.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 bg-teal-light rounded-card px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-teal-deep font-medium mb-0.5">
                  Live model result
                </p>
                <h1 className="text-xl font-medium">
                  {result.patientIdentifier}
                </h1>
              </div>
              {/* Saved to Supabase, so there is a permanent page for it too —
                  this view only lives as long as the browser session. */}
              {result.patientId && (
                <Link
                  href={`/patients/${result.patientId}/diagnosis`}
                  className="text-xs font-medium px-4 py-2 rounded-pill bg-white text-teal-deep border-2 border-teal-light hover:border-teal"
                >
                  Open saved patient
                </Link>
              )}
            </div>

            <div
              className={`grid grid-cols-1 gap-4 mb-5 ${
                panels.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
              }`}
            >
              {panels.map(({ base64, label }) => (
                <ScanPanel key={label} base64={base64} label={label} />
              ))}
            </div>

            {/* Full width, split down the middle: the finding on the left,
                the numbers on the right — rather than a narrow card beside
                an empty half. */}
            <div className="rounded-card p-8 bg-white shadow-[0_1px_2px_rgba(28,28,28,0.06)] grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 items-center mb-5">
              <div>
                <p className="text-sm text-muted mb-2">Predicted subtype</p>
                <p className="text-3xl font-medium leading-tight">
                  {subtypeLabel[result.predicted_subtype] ??
                    result.predicted_subtype}
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <ConfidenceBar score={result.confidence} />
                {result.slice_index_used !== undefined && (
                  <dl className="flex items-baseline gap-2 flex-wrap">
                    {/* With no segmentation the score is averaged over many
                        slices, so naming a single one would misrepresent it. */}
                    {result.slices_analyzed && result.slices_analyzed > 1 ? (
                      <>
                        <dt className="text-xs text-muted">
                          Averaged over {result.slices_analyzed} slices
                        </dt>
                        <dd className="text-sm font-medium">
                          shown: {result.slice_index_used}
                        </dd>
                      </>
                    ) : (
                      <>
                        <dt className="text-xs text-muted">Slice analyzed</dt>
                        <dd className="text-sm font-medium">
                          {result.slice_index_used}
                        </dd>
                      </>
                    )}
                  </dl>
                )}
              </div>
            </div>

            <CaveatBanner text="AI-assisted estimate — confirm with clinical and pathology review." />
          </>
        )}
      </main>
    </div>
  );
}
