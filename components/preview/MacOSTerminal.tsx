"use client";

import type React from "react";
import type { TerminalPalette, Position } from "./types";

interface MacOSTerminalProps {
  terminalPalette?: TerminalPalette;
  terminalPaletteName?: string;
  uiHidden: boolean;
  positionsInitialized: boolean;
  position: Position;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  terminalRef: React.RefObject<HTMLDivElement | null>;
}

export const MacOSTerminal: React.FC<MacOSTerminalProps> = ({
  terminalPalette,
  terminalPaletteName,
  uiHidden,
  positionsInitialized,
  position,
  isDragging,
  onMouseDown,
  terminalRef,
}) => {
  return (
    <div
      ref={terminalRef}
      className={`absolute w-96 max-w-xs rounded-lg shadow-md z-20 select-none ${
        !terminalPalette || uiHidden || !positionsInitialized
          ? "opacity-0 pointer-events-none"
          : "opacity-100"
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: position.x,
        top: position.y,
        background: terminalPalette?.background,
        color: terminalPalette?.foreground,
        zIndex: 20,
      }}
      onMouseDown={onMouseDown}
    >
      {terminalPalette && (
        <>
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
            <span className="text-xs w-full text-center opacity-80 font-mono">
              Terminal
            </span>
          </div>
          <div
            className="px-4 py-3 text-xs rounded-b-lg font-mono"
            style={{
              background: terminalPalette.background,
              color: terminalPalette.foreground,
              minHeight: 100,
            }}
          >
            <div>
              <span style={{ color: terminalPalette.primary }}>$</span>{" "}
              <span style={{ color: terminalPalette.primary }}>npx</span>{" "}
              <span style={{ color: terminalPalette.foreground }}>
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
              <span style={{ color: terminalPalette.primary }}>open</span>{" "}
              <span style={{ color: terminalPalette.accent }}>
                wallpaper.png
              </span>
            </div>
            <div>
              <span style={{ color: terminalPalette.primary }}>$</span>{" "}
              <span style={{ color: terminalPalette.primary }}>echo</span>{" "}
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
  );
};
