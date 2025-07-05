// Shared types for preview components
export interface TerminalPalette {
  bg: string;
  fg: string;
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
  // UI Elements
  MENU_BAR: {
    HEIGHT: 24,
  },
  DOCK: {
    HEIGHT: 80,
  },
  // Spacing and Offsets
  SPACING: {
    SCREEN_EDGE: 20,
    TOP_MARGIN: 24,
    DOCK_MARGIN: 100,
  },
} as const;
