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
        className="w-full border-2 border-dashed border-teal rounded-card p-8 flex flex-col items-center gap-2 bg-teal-light mb-10 hover:opacity-90"
      >
        <Upload className="text-teal" size={26} />
        <span className="font-medium text-teal-dark">Upload MRI scan</span>
        <span className="text-xs text-gray-500">Start a new patient analysis</span>
      </button>

      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}
    </>
  );
}
