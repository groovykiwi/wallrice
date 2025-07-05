export interface ColorPalette {
  name: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
  };
}

export const colorPalettes: Record<string, ColorPalette> = {
  catppuccin: {
    name: "Catppuccin",
    colors: {
      background: "#1e1e2e",
      foreground: "#cdd6f4",
      primary: "#cba6f0",
      secondary: "#89b4fa",
      accent: "#f38ba8",
      muted: "#6c7086",
    },
  },
  gruvbox: {
    name: "Gruvbox",
    colors: {
      background: "#282828",
      foreground: "#ebdbb2",
      primary: "#fabd2f",
      secondary: "#83a598",
      accent: "#fe8019",
      muted: "#928374",
    },
  },
  dracula: {
    name: "Dracula",
    colors: {
      background: "#282a36",
      foreground: "#f8f8f2",
      primary: "#bd93f9",
      secondary: "#8be9fd",
      accent: "#ff79c6",
      muted: "#6272a4",
    },
  },
  everforest: {
    name: "Everforest",
    colors: {
      background: "#2D353B",
      foreground: "#D3C6AA",
      primary: "#A7C080",
      secondary: "#7FBBB3",
      accent: "#E67E80",
      muted: "#859289",
    },
  },
  tokyoNight: {
    name: "Tokyo Night",
    colors: {
      background: "#1a1b26",
      foreground: "#a9b1d6",
      primary: "#3d59a1",
      secondary: "#7aa2f7",
      accent: "#f7768e",
      muted: "#595f7c",
    },
  },
  nightOwl: {
    name: "Night Owl",
    colors: {
      background: "#021727",
      foreground: "#D6DEEB",
      primary: "#C792EA",
      secondary: "#82AAFF",
      accent: "#F78C6C",
      muted: "#637777",
    },
  },
  nord: {
    name: "Nord",
    colors: {
      background: "#2e3440",
      foreground: "#d8dee9",
      primary: "#88c0d0",
      secondary: "#a3be8c",
      accent: "#b48ead",
      muted: "#4c566a",
    },
  },
  rosePine: {
    name: "Rosé Pine",
    colors: {
      background: "#191724",
      foreground: "#e0def4",
      primary: "#eb6f92",
      secondary: "#f6c177",
      accent: "#31748f",
      muted: "#6e6a86",
    },
  },
  ayuDark: {
    name: "Ayu Dark",
    colors: {
      background: "#0F1419",
      foreground: "#E6E1CF",
      primary: "#FFB454",
      secondary: "#36A3D9",
      accent: "#F07178",
      muted: "#5C6773",
    },
  },
  gruvboxMaterial: {
    name: "Gruvbox Material",
    colors: {
      background: "#1d2021",
      foreground: "#d4be98",
      primary: "#d8a657",
      secondary: "#7daea3",
      accent: "#ea6962",
      muted: "#7c6f64",
    },
  },
  solarizedDark: {
    name: "Solarized Dark",
    colors: {
      background: "#002b36",
      foreground: "#eee8d5",
      primary: "#268bd2",
      secondary: "#859900",
      accent: "#dc322f",
      muted: "#586e75",
    },
  },
  onedark: {
    name: "One Dark",
    colors: {
      background: "#282c34",
      foreground: "#abb2bf",
      primary: "#c678dd",
      secondary: "#61afef",
      accent: "#e06c75",
      muted: "#5c6370",
    },
  },
};
