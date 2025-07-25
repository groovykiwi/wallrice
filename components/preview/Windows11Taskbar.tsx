"use client";

import type React from "react";
import Image from "next/image";
import { VolumeX, Wifi, Battery } from "lucide-react";
import type { TerminalPalette } from "./types";

interface Windows11TaskbarProps {
  terminalPalette?: TerminalPalette;
  uiHidden?: boolean;
}

export const Windows11Taskbar: React.FC<Windows11TaskbarProps> = ({
  uiHidden = false,
}) => {
  if (uiHidden) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 z-20">
      {/* Taskbar Background */}
      <div
        className="absolute inset-0 backdrop-blur-xl border-t border-white/10"
        style={{
          background: "rgba(32, 32, 32, 0.85)",
        }}
      />

      {/* Taskbar Content */}
      <div className="relative h-full flex items-center px-2">
        {/* Left Spacer */}
        <div className="flex-1"></div>

        {/* Center - App Icons */}
        <div className="flex items-center gap-1">
          {/* Start Button */}
          <button
            className="h-10 w-10 rounded-lg hover:bg-white/10 transition-colors duration-200 flex items-center justify-center"
            title="Start"
          >
            <Image src="/start.ico" alt="Start" width={24} height={24} />
          </button>
          {/* Search */}
          <button
            className="h-10 w-10 rounded-lg hover:bg-white/10 transition-colors duration-200 flex items-center justify-center"
            title="Search"
          >
            <Image src="/search.ico" alt="Search" width={24} height={24} />
          </button>
          {/* File Explorer */}
          <button
            className="h-10 w-10 rounded-lg hover:bg-white/10 transition-colors duration-200 flex items-center justify-center"
            title="File Explorer"
          >
            <Image
              src="/explorer.ico"
              alt="File Explorer"
              width={24}
              height={24}
            />
          </button>

          {/* Edge Browser */}
          <button
            className="h-10 w-10 rounded-lg hover:bg-white/10 transition-colors duration-200 flex items-center justify-center"
            title="Microsoft Edge"
          >
            <Image
              src="/edge.ico"
              alt="Microsoft Edge"
              width={24}
              height={24}
            />
          </button>

          {/* Terminal */}
          <button
            className="h-10 w-10 rounded-lg hover:bg-white/10 transition-colors duration-200 flex items-center justify-center"
            title="Terminal"
          >
            <Image src="/terminal.ico" alt="Terminal" width={24} height={24} />
          </button>
        </div>

        {/* Right - System Tray */}
        <div className="flex-1 flex items-center justify-end gap-1 text-white/80">
          {/* System Icons */}
          <button
            className="h-8 px-2 rounded hover:bg-white/10 transition-colors duration-200 flex items-center gap-1"
            title="System"
          >
            <Wifi className="w-4 h-4" />
            <VolumeX className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </button>

          {/* Date and Time */}
          <div className="h-10 px-2 rounded hover:bg-white/10 transition-colors duration-200 flex flex-col items-center justify-center text-xs text-white/90">
            <div className="leading-3">10:42</div>
            <div className="leading-3">6/10/2021</div>
          </div>

          {/* Show Desktop */}
          <div className="w-1 h-10 hover:bg-white/20 transition-colors duration-200 cursor-pointer"></div>
        </div>
      </div>
    </div>
  );
};
