// lib/colorPalettes.ts
export interface ColorPalette {
    name: string;
    colors: {
      bg: string;
      fg: string;
      primary: string;
      secondary: string;
      accent: string;
      muted: string;
    };
  }
  
  export const colorPalettes: Record<string, ColorPalette> = {
    gruvbox: {
      name: "Gruvbox",
      colors: {
        bg: "#282828",
        fg: "#ebdbb2",
        primary: "#fabd2f",
        secondary: "#83a598",
        accent: "#fe8019",
        muted: "#928374",
      },
    },
    catppuccin: {
      name: "Catppuccin",
      colors: {
        bg: "#1e1e2e",
        fg: "#cdd6f4",
        primary: "#cba6f7",
        secondary: "#89b4fa",
        accent: "#f38ba8",
        muted: "#6c7086",
      },
    },
    dracula: {
      name: "Dracula",
      colors: {
        bg: "#282a36",
        fg: "#f8f8f2",
        primary: "#bd93f9",
        secondary: "#8be9fd",
        accent: "#ff79c6",
        muted: "#6272a4",
      },
    },
    oneDarkPro: {
      name: "One Dark Pro",
      colors: {
        bg: "#282c34",
        fg: "#abb2bf",
        primary: "#c678dd", // keywords
        secondary: "#61afef", // functions
        accent: "#e06c75", // variables
        muted: "#5c6370", // comments
      },
    },
    githubDark: {
      name: "GitHub Dark Default",
      colors: {
        bg: "#24292e",
        fg: "#e1e4e8",
        primary: "#3392FF44", // selection background
        secondary: "#959da5", // less prominent text
        accent: "#0366d6", // github blue (not in list, but common)
        muted: "#6a737d", // github muted
      },
    },
    tokyoNight: {
      name: "Tokyo Night",
      colors: {
        bg: "#0a192f",
        fg: "#f8f8f8",
        primary: "#3d59a1", // panel active border
        secondary: "#00b48a", // accent
        accent: "#f95d8a", // pink coral
        muted: "#959cbd", // foreground
      },
    },
    nightOwl: {
      name: "Night Owl",
      colors: {
        bg: "#011627",
        fg: "#D6DEEB",
        primary: "#C792EA", // keywords
        secondary: "#82AAFF", // functions
        accent: "#F78C6C", // numbers
        muted: "#637777", // comments
      },
    },
    materialTheme: {
      name: "Material Theme",
      colors: {
        bg: "#292D3E",
        fg: "#A6ACCD",
        primary: "#7e57c2", // accent purple
        secondary: "#addb67", // green
        accent: "#ecc48d", // yellow
        muted: "#546e7a", // material muted
      },
    },
    monokaiPro: {
      name: "Monokai Pro",
      colors: {
        bg: "#2D2A2E",
        fg: "#fcfcfa",
        primary: "#e5b567", // yellow
        secondary: "#b4d273", // green
        accent: "#e87d3e", // orange
        muted: "#75715e", // comments
      },
    },
    nord: {
      name: "Nord",
      colors: {
        bg: "#2e3440",
        fg: "#d8dee9",
        primary: "#88c0d0", // blue-cyan
        secondary: "#a3be8c", // green
        accent: "#b48ead", // purple
        muted: "#4c566a", // muted
      },
    },
    rosePine: {
      name: "Rosé Pine",
      colors: {
        bg: "#191724",
        fg: "#e0def4",
        primary: "#eb6f92", // love
        secondary: "#f6c177", // gold
        accent: "#31748f", // pine
        muted: "#6e6a86", // surface (approx)
      },
    },
    horizon: {
      name: "Horizon",
      colors: {
        bg: "#16161C",
        fg: "#F8F8F2",
        primary: "#B877DB", // purple
        secondary: "#25B2BC", // cyan
        accent: "#E95678", // red-pink
        muted: "#FAB795", // orange (strings)
      },
    },
  };