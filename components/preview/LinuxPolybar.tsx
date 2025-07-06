import type React from "react";
import { Power } from "lucide-react";
import type { TerminalPalette } from "./types";

interface LinuxPolybarProps {
  terminalPalette?: TerminalPalette;
  uiHidden: boolean;
}

export const LinuxPolybar: React.FC<LinuxPolybarProps> = ({
  terminalPalette,
  uiHidden,
}) => (
  <div
    className={`absolute top-0 left-0 right-0 h-6 flex items-center px-4 z-10 font-mono ${
      uiHidden ? "opacity-0 pointer-events-none" : "opacity-100"
    }`}
    style={{
      background: terminalPalette?.background || "#1e1e2e",
    }}
  >
    {/* Left - Workspaces */}
    <div className="flex items-center space-x-3">
      {[1, 2, 3, 4, 5].map((workspace) => (
        <div
          key={workspace}
          className={`w-2 h-2 rounded-full ${
            workspace === 1 ? "opacity-100" : "opacity-30"
          }`}
          style={{
            background: terminalPalette?.primary || "#89b4fa",
          }}
        />
      ))}
    </div>

    {/* Center - Time and Date - Absolutely centered */}
    <div
      className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2 text-xs"
      style={{
        color: terminalPalette?.foreground || "#cdd6f4",
      }}
    >
      <span>
        {new Date().toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })}
      </span>
      <span>
        /{" "}
        {new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>

    {/* Right - System indicators and power */}
    <div className="flex items-center space-x-3 ml-auto">
      <button className="hover:bg-white/10 p-1 rounded">
        <Power
          className="w-3 h-3"
          style={{ color: terminalPalette?.secondary || "#f38ba8" }}
        />
      </button>
    </div>
  </div>
);
