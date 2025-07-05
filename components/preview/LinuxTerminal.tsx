"use client";

import type React from "react";
import type { TerminalPalette, Position } from "./types";

interface LinuxTerminalProps {
  terminalPalette?: TerminalPalette;
  uiHidden: boolean;
  positionsInitialized: boolean;
  position: Position;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  terminalRef: React.RefObject<HTMLDivElement | null>;
}

export const LinuxTerminal: React.FC<LinuxTerminalProps> = ({
  terminalPalette,
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
      className={`absolute w-96 h-80 rounded-lg shadow-md z-20 font-mono select-none ${
        !terminalPalette || uiHidden || !positionsInitialized
          ? "opacity-0 pointer-events-none"
          : "opacity-100"
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: position.x,
        top: position.y,
        background: (terminalPalette?.bg || "#1e1e2e") + "CC",
        color: terminalPalette?.fg || "#cdd6f4",
        border: `1px solid ${terminalPalette?.primary || "#89b4fa"}`,
        backdropFilter: "blur(8px)",
      }}
      onMouseDown={onMouseDown}
    >
      <div className="px-3 py-2 text-xs overflow-hidden">
        <div className="space-y-1">
          <div>
            <span style={{ color: terminalPalette?.primary || "#89b4fa" }}>
              ❯
            </span>{" "}
            <span style={{ color: terminalPalette?.fg || "#cdd6f4" }}>
              neofetch
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div
              className="text-xs leading-tight pt-2 whitespace-pre flex items-start justify-start pl-2"
              style={{ color: terminalPalette?.primary || "#89b4fa" }}
            >
              {`      /\\      
     /  \\     
    /    \\    
   /      \\   
  /   ,,   \\  
 /   |  |  -\\ 
/_-''    ''-_\\`}
            </div>
            <div className="space-y-1 col-span-2 text-xs">
              <div style={{ color: terminalPalette?.primary || "#89b4fa" }}>
                user@arch
              </div>
              <div style={{ color: terminalPalette?.secondary || "#f38ba8" }}>
                -----------
              </div>
              <div>
                <span style={{ color: terminalPalette?.accent || "#a6e3a1" }}>
                  OS:
                </span>{" "}
                Arch Linux x86_64
              </div>
              <div>
                <span style={{ color: terminalPalette?.accent || "#a6e3a1" }}>
                  Host:
                </span>{" "}
                ThinkPad X1 Carbon
              </div>
              <div>
                <span style={{ color: terminalPalette?.accent || "#a6e3a1" }}>
                  Kernel:
                </span>{" "}
                6.10.2-arch1-1
              </div>
              <div>
                <span style={{ color: terminalPalette?.accent || "#a6e3a1" }}>
                  WM:
                </span>{" "}
                Hyprland
              </div>
              <div>
                <span style={{ color: terminalPalette?.accent || "#a6e3a1" }}>
                  Shell:
                </span>{" "}
                zsh 5.9
              </div>
              <div>
                <span style={{ color: terminalPalette?.accent || "#a6e3a1" }}>
                  Resolution:
                </span>{" "}
                1920x1080
              </div>
              <div>
                <span style={{ color: terminalPalette?.accent || "#a6e3a1" }}>
                  Terminal:
                </span>{" "}
                kitty
              </div>
              <div>
                <span style={{ color: terminalPalette?.accent || "#a6e3a1" }}>
                  CPU:
                </span>{" "}
                Intel Core i7-1165G7
              </div>
              <div>
                <span style={{ color: terminalPalette?.accent || "#a6e3a1" }}>
                  Memory:
                </span>{" "}
                16GB
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span style={{ color: terminalPalette?.primary || "#89b4fa" }}>
              ❯
            </span>{" "}
            <span className="opacity-60 animate-pulse">|</span>
          </div>
        </div>
      </div>
    </div>
  );
};
