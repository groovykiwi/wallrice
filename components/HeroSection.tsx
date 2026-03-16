import type React from "react";
import Image from "next/image";
import { colorPalettes } from "../lib/colorPalettes";
import type { OSMode } from "../lib/reducers";

interface HeroSectionProps {
  selectedPalette: string;
  osMode: OSMode;
  onOSChange: (osMode: OSMode) => void;
}

export function HeroSection({
  selectedPalette,
  osMode,
  onOSChange,
}: HeroSectionProps) {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl md:text-6xl font-bold font-mono text-slate-900 tracking-tight">
            Wall
            <span
              style={{
                color: colorPalettes[selectedPalette].colors.primary,
              }}
            >
              Rice
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
            A small utility to colorize your wallpapers with your own color
            palettes.
          </p>
        </div>
      </div>

      {/* OS Toggle Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 hidden md:flex justify-center">
        <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
          <button
            onClick={() => onOSChange("macos")}
            className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-md text-sm transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
              osMode === "macos"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-600 hover:text-slate-900 border border-transparent"
            }`}
          >
            <Image
              src="/logo/apple.svg"
              alt="macOS"
              width={12}
              height={12}
              className="w-3 h-3 opacity-80"
            />
            macOS
          </button>
          <button
            onClick={() => onOSChange("linux")}
            className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-md text-sm transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
              osMode === "linux"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-600 hover:text-slate-900 border border-transparent"
            }`}
          >
            <Image
              src="/logo/linux.svg"
              alt="Linux"
              width={12}
              height={12}
              className="w-3 h-3 opacity-80"
            />
            Linux
          </button>
          <button
            onClick={() => onOSChange("windows11")}
            className={`flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-md text-sm transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
              osMode === "windows11"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-600 hover:text-slate-900 border border-transparent"
            }`}
          >
            <Image
              src="/logo/windows.svg"
              alt="Windows 11"
              width={12}
              height={12}
              className="w-3 h-3 opacity-80"
            />
            Windows 11
          </button>
        </div>
      </div>
    </>
  );
}
