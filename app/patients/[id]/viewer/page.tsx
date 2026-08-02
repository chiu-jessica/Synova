"use client";

import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ScanEye } from "lucide-react";

const MAX_SLICE = 155;

// Sized against the viewport rather than fixed pixels, so the slider below
// stays on screen without scrolling. The subtracted height covers the page
// chrome above (tabs, patient header) plus the controls beneath.
const VIEWER_HEIGHT =
  "h-[calc(100vh-380px)] min-h-[260px] max-h-[560px]";

export default function ViewerPage() {
  const [slice, setSlice] = useState(78);
  const filled = (slice / MAX_SLICE) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`bg-white rounded-card shadow-[0_1px_2px_rgba(28,28,28,0.06)] overflow-hidden ${VIEWER_HEIGHT}`}
      >
        <TransformWrapper>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            {/* Same height as the card so the pannable area fills it rather
                than leaving dead space below. */}
            <div
              className={`w-full flex items-center justify-center ${VIEWER_HEIGHT}`}
            >
              <ScanEye className="text-teal/30" size={56} />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-muted shrink-0">Slice</label>
        <input
          type="range"
          min={0}
          max={MAX_SLICE}
          value={slice}
          onChange={(e) => setSlice(Number(e.target.value))}
          className="flex-1 slider-pink"
          // Only the length is set here — the fill colour stays in CSS so the
          // pressed state can darken it.
          style={{ "--fill-pct": `${filled}%` } as React.CSSProperties}
        />
        <span className="text-sm w-10 text-right">{slice}</span>
      </div>
      <p className="text-xs text-muted">Scroll-wheel or pinch to zoom, drag to pan.</p>
    </div>
  );
}
