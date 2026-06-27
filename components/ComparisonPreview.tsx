"use client";

import { ChevronDown, Columns2, ScanSearch } from "lucide-react";
import { useCallback, useState } from "react";
import type React from "react";

interface ComparisonPreviewProps {
  originalImageUrl: string;
  processedImageUrl: string;
}

interface FocusPoint {
  x: number;
  y: number;
}

interface ImagePanelProps {
  imageUrl: string;
  label: string;
  focus: FocusPoint;
  onFocusChange?: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

function ImagePanel({
  imageUrl,
  label,
  focus,
  onFocusChange,
}: ImagePanelProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div
        className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
        onPointerMove={onFocusChange}
        onPointerDown={onFocusChange}
      >
        <div
          aria-label={`${label} wallpaper`}
          role="img"
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
        />
        <div
          className="pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded border border-white/90 shadow-[0_0_0_999px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.45)]"
          style={{
            left: `${focus.x}%`,
            top: `${focus.y}%`,
          }}
        />
      </div>
    </div>
  );
}

function DetailPanel({ imageUrl, label, focus }: ImagePanelProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div
        className="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 bg-no-repeat"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `${focus.x}% ${focus.y}%`,
          backgroundSize: "320%",
        }}
      />
    </div>
  );
}

export function ComparisonPreview({
  originalImageUrl,
  processedImageUrl,
}: ComparisonPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [focus, setFocus] = useState<FocusPoint>({ x: 50, y: 50 });

  const updateFocus = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      setFocus({
        x: clampPercent(x),
        y: clampPercent(y),
      });
    },
    []
  );

  return (
    <section className="border-t border-slate-200 pt-6">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-slate-700 transition-colors hover:bg-slate-50"
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Columns2 className="h-4 w-4" />
          Compare before/after
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ImagePanel
              imageUrl={originalImageUrl}
              label="Original"
              focus={focus}
              onFocusChange={updateFocus}
            />
            <ImagePanel
              imageUrl={processedImageUrl}
              label="Colorized"
              focus={focus}
              onFocusChange={updateFocus}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ScanSearch className="h-4 w-4" />
              Detail
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailPanel
                imageUrl={originalImageUrl}
                label="Original"
                focus={focus}
              />
              <DetailPanel
                imageUrl={processedImageUrl}
                label="Colorized"
                focus={focus}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
