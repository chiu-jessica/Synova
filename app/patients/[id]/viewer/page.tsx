"use client";

import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ScanEye } from "lucide-react";

export default function ViewerPage() {
  const [slice, setSlice] = useState(78);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-card h-[360px] overflow-hidden">
        <TransformWrapper>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <div className="w-full h-[360px] flex items-center justify-center">
              <ScanEye className="text-gray-300" size={40} />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-500 shrink-0">Slice</label>
        <input
          type="range"
          min={0}
          max={155}
          value={slice}
          onChange={(e) => setSlice(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm w-10 text-right">{slice}</span>
      </div>
      <p className="text-xs text-gray-400">Scroll-wheel or pinch to zoom, drag to pan.</p>
    </div>
  );
}
