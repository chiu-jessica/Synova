"use client";

import { useState } from "react";
import UploadDialog from "@/components/UploadDialog";
import { Upload } from "lucide-react";

// Split out of the dashboard page so that page can stay a server component
// and await its Supabase query.
export default function UploadPanel() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowUpload(true)}
        className="group w-full rounded-card bg-teal-light border-2 border-dashed border-teal/50 px-8 py-10 flex flex-col items-center gap-2 mb-10 hover:border-teal hover:bg-teal-light/70 transition-colors"
      >
        <span className="w-14 h-14 rounded-full bg-white text-teal flex items-center justify-center shadow-[0_2px_8px_rgba(6,148,148,0.18)] group-hover:-translate-y-0.5 transition-transform">
          <Upload size={24} />
        </span>
        <span className="font-medium text-teal-deep mt-1">Upload MRI scan</span>
        <span className="text-xs text-muted">Start a new patient analysis</span>
      </button>

      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
    </>
  );
}
