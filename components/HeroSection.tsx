import type React from "react";
import { Apple, Monitor } from "lucide-react";
import { colorPalettes } from "../lib/colorPalettes";

interface HeroSectionProps {
  selectedPalette: string;
  isLinuxMode: boolean;
  onToggleOS: () => void;
}

export function HeroSection({
  selectedPalette,
  isLinuxMode,
  onToggleOS,
}: HeroSectionProps) {
  return (
    <>
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <h1 className=" text-4xl md:text-7xl font-bold text-slate-900 tracking-tight">
                Wall
                <span
                  className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  style={{
                    color: colorPalettes[selectedPalette].colors.primary,
                  }}
                >
                  Rice
                </span>
              </h1>
            </div>
            <p className="text-base md:text-xl text-slate-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              A small utility to colorize your wallpapers with your own color
              palettes.
            </p>
          </div>
        </div>
      </div>

      {/* OS Toggle Button */}
      <div className=" z-50 w-full  justify-center mb-6 mt-0 px-4 hidden md:flex">
        <div className="flex bg-white/20 backdrop-blur-md rounded-lg p-1 border border-white/20">
          <button
            onClick={onToggleOS}
            className={`flex items-center cursor-pointer gap-2 px-3 py-2  rounded-md text-sm font-medium transition-colors ${
              !isLinuxMode ? " text-black/70 shadow-sm" : "text-black/70 "
            }`}
          >
            <Apple className="w-3 h-3" />
            macOS
          </button>
          <button
            onClick={onToggleOS}
            className={`flex items-center cursor-pointer gap-2 ml-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isLinuxMode
                ? "bg-white/30 text-black shadow-sm"
                : "text-black/70 "
            }`}
          >
            <Monitor className="w-3 h-3" />
            Linux
          </button>
        </div>
      </div>
    </>
  );
}
