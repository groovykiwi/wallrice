"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { Eye, EyeOff } from "lucide-react";

interface MacBookPreviewProps {
  wallpaperUrl?: string;
  children?: React.ReactNode;
  terminalPalette?: {
    bg: string;
    fg: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
  };
  uiHidden?: boolean;
  onToggleUi?: () => void;
}

export const MacBookPreview: React.FC<
  MacBookPreviewProps & { terminalPaletteName?: string }
> = ({
  wallpaperUrl = "/wallpaper.png",
  children,
  terminalPalette,
  uiHidden = false,
  onToggleUi,
  terminalPaletteName,
}) => {
  const [currentWallpaper, setCurrentWallpaper] = useState(wallpaperUrl);
  const [newWallpaper, setNewWallpaper] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (wallpaperUrl === currentWallpaper || wallpaperUrl === newWallpaper) {
      return;
    }

    const img = new Image();
    img.src = wallpaperUrl;
    img.onload = () => {
      setNewWallpaper(wallpaperUrl);
    };
  }, [wallpaperUrl, currentWallpaper, newWallpaper]);

  const handleTransitionEnd = () => {
    if (newWallpaper) {
      setCurrentWallpaper(newWallpaper);
      setNewWallpaper(null);
    }
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* MacBook Frame */}
      <div className="relative bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-xl p-1 shadow-2xl">
        {/* Screen Bezel */}
        <div className="bg-black rounded-lg p-2 relative overflow-hidden">
          {/* Screen Content */}
          <div className="w-full aspect-[16/9] rounded-md relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${currentWallpaper})`,
              }}
            />
            <div
              onTransitionEnd={handleTransitionEnd}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
              style={{
                backgroundImage: newWallpaper ? `url(${newWallpaper})` : "none",
                opacity: newWallpaper ? 1 : 0,
              }}
            />
            {/* macOS Menu Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-6 flex items-center justify-between px-4 z-10 transition-opacity duration-700 ${
                uiHidden ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              style={{ zIndex: 10, position: "absolute" }}
            >
              {/* Liquid glass layers */}

              <div
                className="absolute inset-0 z-10 "
                style={{ background: "rgba(255,255,255,0.15)" }}
              />
              <div className="relative z-30 flex w-full items-center justify-between">
                <div className="flex items-center space-x-6 select-none">
                  <span className="text-white text-sm font-bold"></span>
                  <span className="text-white text-xs font-medium">File</span>
                  <span className="text-white text-xs font-medium">Edit</span>
                  <span className="text-white text-xs font-medium">View</span>
                  <span className="text-white text-xs font-medium">Go</span>
                  <span className="text-white text-xs font-medium">Window</span>
                  <span className="text-white text-xs font-medium">Help</span>
                </div>
                <div className="text-white text-xs font-medium">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            {/* Terminal Window */}
            <div
              className={`absolute top-12 right-8 w-96 max-w-xs rounded-lg shadow-md z-20 transition-opacity duration-700 ${
                !terminalPalette || uiHidden
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              }`}
              style={{
                background: terminalPalette?.bg,
                color: terminalPalette?.fg,
                zIndex: 20,
              }}
            >
              {terminalPalette && (
                <>
                  {/* Terminal Bar */}
                  <div className="flex items-center px-4 py-1 rounded-t-lg">
                    <div className="absolute left-3">
                      <div className="flex space-x-2 mr-3">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ background: "#ff5f56" }}
                        ></span>
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ background: "#ffbd2e" }}
                        ></span>
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ background: "#27c93f" }}
                        ></span>
                      </div>
                    </div>
                    <span className="text-xs w-full text-center font-mono opacity-80">
                      Terminal
                    </span>
                  </div>
                  <div
                    className="px-4 py-3 font-mono text-sm rounded-b-lg"
                    style={{
                      background: terminalPalette.bg,
                      color: terminalPalette.fg,
                      minHeight: 100,
                    }}
                  >
                    {/* Fake syntax highlighting for terminal output */}
                    <div>
                      <span style={{ color: terminalPalette.primary }}>$</span>{" "}
                      <span style={{ color: terminalPalette.primary }}>
                        npx
                      </span>{" "}
                      <span style={{ color: terminalPalette.fg }}>
                        wallrice
                      </span>{" "}
                      <span style={{ color: terminalPalette.secondary }}>
                        --palette
                      </span>{" "}
                      <span style={{ color: terminalPalette.accent }}>
                        {terminalPaletteName || "palette"}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: terminalPalette.primary }}>$</span>{" "}
                      <span style={{ color: terminalPalette.muted }}>
                        # Colorize your wallpaper
                      </span>
                    </div>
                    <div>
                      <span style={{ color: terminalPalette.primary }}>$</span>{" "}
                      <span style={{ color: terminalPalette.primary }}>
                        open
                      </span>{" "}
                      <span style={{ color: terminalPalette.accent }}>
                        wallpaper.png
                      </span>
                    </div>
                    <div>
                      <span style={{ color: terminalPalette.primary }}>$</span>{" "}
                      <span style={{ color: terminalPalette.primary }}>
                        echo
                      </span>{" "}
                      <span style={{ color: terminalPalette.accent }}>
                        &quot;Palette:
                        <span style={{ color: terminalPalette.primary }}>
                          {" "}
                          {terminalPalette.primary}
                        </span>
                        ,
                        <span style={{ color: terminalPalette.secondary }}>
                          {" "}
                          {terminalPalette.secondary}
                        </span>
                        ,
                        <span style={{ color: terminalPalette.accent }}>
                          {" "}
                          {terminalPalette.accent}
                        </span>
                        &quot;
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Content Area */}
            <div className="absolute inset-0 flex items-end justify-center pb-8">
              {children}
            </div>

            {/* Hide UI Button */}
            {onToggleUi && (
              <button
                onClick={onToggleUi}
                className={`absolute bottom-4 right-4 z-50 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20 rounded-full p-2 shadow-lg transition-all duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                title={uiHidden ? "Show UI" : "Hide UI"}
              >
                {uiHidden ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MacBook Base */}
      <div className="bg-gradient-to-b from-gray-400 to-gray-500 h-3 rounded-b-3xl shadow-lg"></div>
    </div>
  );
};
