// Shared types for preview components
export interface TerminalPalette {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
}

export interface Position {
  x: number;
  y: number;
}

// Constants for dimensions and layout
export const DIMENSIONS = {
  // Linux Terminal
  LINUX_TERMINAL: {
    WIDTH: 384,
    HEIGHT: 320,
  },
  // macOS Terminal
  MAC_TERMINAL: {
    WIDTH: 320,
    HEIGHT: 140,
  },
  // Windows 11 Terminal
  WINDOWS11_TERMINAL: {
    WIDTH: 480,
    HEIGHT: 260,
  },
  // UI Elements
  MENU_BAR: {
    HEIGHT: 24,
  },
  DOCK: {
    HEIGHT: 80,
  },
  TASKBAR: {
    HEIGHT: 48,
  },
  // Spacing and Offsets
  SPACING: {
    SCREEN_EDGE: 20,
    TOP_MARGIN: 24,
    DOCK_MARGIN: 100,
    TASKBAR_MARGIN: 60,
  },
} as const;
