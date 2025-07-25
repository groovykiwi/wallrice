"use client";

import { useState, useEffect, useRef } from "react";
import type React from "react";
import { Eye, EyeOff, ImageIcon, Palette } from "lucide-react";
import { GlassDock } from "./LiquidGlass";
import { LinuxPolybar } from "./preview/LinuxPolybar";
import { LinuxTerminal } from "./preview/LinuxTerminal";
import { MacOSMenuBar } from "./preview/MacOSMenuBar";
import { MacOSTerminal } from "./preview/MacOSTerminal";
import { Windows11Taskbar } from "./preview/Windows11Taskbar";
import { Windows11PowerShell } from "./preview/Windows11PowerShell";
import { useDragBehavior } from "./preview/hooks/useDragBehavior";
import type { TerminalPalette } from "./preview/types";
import type { OSMode } from "../lib/reducers";

interface MacBookPreviewProps {
  wallpaperUrl?: string;
  terminalPalette?: TerminalPalette;
  uiHidden?: boolean;
  onToggleUi?: () => void;
  osMode?: OSMode;
  originalWallpaperUrl?: string;
  terminalPaletteName?: string;
}

export const MacBookPreview: React.FC<MacBookPreviewProps> = ({
  wallpaperUrl = "/wallpaper.png",
  terminalPalette,
  uiHidden = false,
  onToggleUi,
  terminalPaletteName,
  osMode = "macos",
  originalWallpaperUrl,
}) => {
  const [currentWallpaper, setCurrentWallpaper] = useState(wallpaperUrl);
  const [newWallpaper, setNewWallpaper] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isShowingOriginal, setIsShowingOriginal] = useState(false);

  const screenRef = useRef<HTMLDivElement>(null);

  // Use drag behavior hooks for all terminal types
  const linuxDragBehavior = useDragBehavior({
    screenRef,
    terminalType: "linux",
  });

  const macDragBehavior = useDragBehavior({
    screenRef,
    terminalType: "macos",
  });

  const windows11DragBehavior = useDragBehavior({
    screenRef,
    terminalType: "windows11",
  });

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

  // Preload original wallpaper if provided
  useEffect(() => {
    if (!originalWallpaperUrl) return;
    const img = new Image();
    img.src = originalWallpaperUrl;
  }, [originalWallpaperUrl]);

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
          <div
            className="w-full aspect-[16/9] rounded-md relative overflow-hidden"
            ref={screenRef}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  isShowingOriginal && originalWallpaperUrl
                    ? originalWallpaperUrl
                    : currentWallpaper
                })`,
              }}
            />
            <div
              onTransitionEnd={handleTransitionEnd}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
              style={{
                backgroundImage:
                  newWallpaper && !isShowingOriginal
                    ? `url(${newWallpaper})`
                    : "none",
                opacity: newWallpaper && !isShowingOriginal ? 1 : 0,
              }}
            />

            {/* Render different UI based on mode */}
            {osMode === "linux" ? (
              <>
                <LinuxPolybar
                  terminalPalette={terminalPalette}
                  uiHidden={uiHidden}
                />
                <LinuxTerminal
                  terminalPalette={terminalPalette}
                  uiHidden={uiHidden}
                  positionsInitialized={linuxDragBehavior.positionsInitialized}
                  position={linuxDragBehavior.position}
                  isDragging={linuxDragBehavior.isDragging}
                  onMouseDown={linuxDragBehavior.handleMouseDown}
                  terminalRef={linuxDragBehavior.terminalRef}
                />
              </>
            ) : osMode === "windows11" ? (
              <>
                <Windows11Taskbar
                  terminalPalette={terminalPalette}
                  uiHidden={uiHidden}
                />
                <Windows11PowerShell
                  terminalPalette={terminalPalette}
                  uiHidden={uiHidden}
                  positionsInitialized={
                    windows11DragBehavior.positionsInitialized
                  }
                  position={windows11DragBehavior.position}
                  isDragging={windows11DragBehavior.isDragging}
                  onMouseDown={windows11DragBehavior.handleMouseDown}
                  terminalRef={windows11DragBehavior.terminalRef}
                />
              </>
            ) : (
              <>
                <MacOSMenuBar uiHidden={uiHidden} />
                <MacOSTerminal
                  terminalPalette={terminalPalette}
                  terminalPaletteName={terminalPaletteName}
                  uiHidden={uiHidden}
                  positionsInitialized={macDragBehavior.positionsInitialized}
                  position={macDragBehavior.position}
                  isDragging={macDragBehavior.isDragging}
                  onMouseDown={macDragBehavior.handleMouseDown}
                  terminalRef={macDragBehavior.terminalRef}
                />
              </>
            )}

            {/* Content Area */}
            <div className="absolute inset-0 flex items-end justify-center pb-8">
              {osMode === "macos" && (
                <div
                  className={`${
                    uiHidden ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                >
                  <GlassDock
                    icons={[
                      { src: "/finder.png", alt: "Finder" },
                      { src: "/safari.png", alt: "Safari" },
                      { src: "/music.png", alt: "Music" },
                      { src: "/maps.png", alt: "Maps" },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* Hide UI Button and Reveal Original Button */}
            {onToggleUi && (
              <div
                className={`absolute bottom-4 right-4 z-50 flex space-x-2 ${
                  isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <button
                  onClick={onToggleUi}
                  className="bg-black/60 backdrop-blur-md hover:bg-black/70 text-white border border-white/20 rounded-full p-2 shadow-lg transition-all duration-300"
                  title="Choose preview style"
                  style={{
                    boxShadow:
                      "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {uiHidden ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                {originalWallpaperUrl && (
                  <button
                    onClick={() => setIsShowingOriginal((v) => !v)}
                    className="bg-black/60 backdrop-blur-md hover:bg-black/70 text-white border border-white/20 rounded-full p-2 shadow-lg transition-all duration-300"
                    title={
                      isShowingOriginal
                        ? "Show colorized wallpaper"
                        : "Show original wallpaper"
                    }
                    style={{
                      boxShadow:
                        "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {/* Better icons for original/colorized toggle */}
                    {isShowingOriginal ? (
                      <Palette className="w-4 h-4" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MacBook Base */}
      <div className="bg-gradient-to-b from-gray-400 to-gray-500 h-3 rounded-b-3xl shadow-lg"></div>
    </div>
  );
};
