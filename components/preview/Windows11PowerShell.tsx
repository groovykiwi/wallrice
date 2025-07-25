"use client";

import type React from "react";
import { Minus, Square, X } from "lucide-react";
import type { TerminalPalette, Position } from "./types";
import Image from "next/image";

interface Windows11PowerShellProps {
  terminalPalette?: TerminalPalette;
  uiHidden: boolean;
  position: Position;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  terminalRef: React.RefObject<HTMLDivElement | null>;
  positionsInitialized: boolean;
}

export const Windows11PowerShell: React.FC<Windows11PowerShellProps> = ({
  terminalPalette,
  uiHidden,
  position,
  isDragging,
  onMouseDown,
  terminalRef,
  positionsInitialized,
}) => {
  const backgroundColor = terminalPalette?.background || "#1e1e2e";
  const foregroundColor = terminalPalette?.foreground || "#cdd6f4";
  const primaryColor = terminalPalette?.primary || "#89b4fa";
  const accentColor = terminalPalette?.accent || "#f38ba8";

  return (
    <div
      ref={terminalRef}
      className={`absolute bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-20 select-none ${
        !terminalPalette || uiHidden || !positionsInitialized
          ? "opacity-0 pointer-events-none"
          : "opacity-100"
      } ${isDragging ? "cursor-grabbing" : "cursor-auto"}`}
      style={{
        left: position.x,
        top: position.y,
        width: "480px",
        height: "260px",
        background: `${backgroundColor}dd`,
      }}
    >
      {/* Window Header */}
      <div
        className={`flex items-center justify-between px-4 py-1 border-b border-white/10 rounded-t-lg ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={onMouseDown}
        style={{
          background: `linear-gradient(135deg, ${backgroundColor}cc 0%, ${backgroundColor}aa 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          {/* Terminal Icon */}
          <Image
            src="/terminal.ico"
            alt="Terminal"
            width={16}
            height={16}
            className="w-4 h-4"
          />
          <span className="text-xs font-medium text-white/90">
            Windows PowerShell
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors text-white/70">
            <Minus className="w-3 h-3" />
          </button>
          <button className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors text-white/70">
            <Square className="w-3 h-3" />
          </button>
          <button className="w-6 h-6 rounded hover:bg-red-500/80 flex items-center justify-center transition-colors text-white/70 hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-4 font-mono text-xs overflow-hidden h-full">
        <div
          className="text-white/90 leading-relaxed"
          style={{ color: foregroundColor }}
        >
          <div className="mb-2">
            <span style={{ color: primaryColor }}>PS C:\Users\User&gt;</span>{" "}
            <span className="text-white/60">
              Get-ComputerInfo | Select-Object WindowsProductName,
              WindowsVersion
            </span>
          </div>

          <div className="mb-4 text-white/80">
            <div>WindowsProductName : Windows 11 Pro</div>
            <div>WindowsVersion : 2009</div>
          </div>

          <div className="mb-2">
            <span style={{ color: primaryColor }}>PS C:\Users\User&gt;</span>{" "}
            <span className="text-white/60">
              Get-Process | Where-Object ProcessName -eq &quot;wallrice&quot;
            </span>
          </div>

          <div className="mb-4 text-white/80">
            <div>
              <span style={{ color: accentColor }}>ProcessName</span>
              {"  "}
              <span style={{ color: primaryColor }}>Id</span>
              {"  "}
              <span style={{ color: foregroundColor }}>CPU</span>
            </div>
            <div>wallrice 4092 15.2</div>
          </div>
        </div>
      </div>
    </div>
  );
};
