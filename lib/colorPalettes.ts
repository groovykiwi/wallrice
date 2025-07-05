export interface ColorPalette {
  name: string;
  colors: {
    bg: string;
    fg: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    ready: string;
    not_ready: string;
  };
}

export const colorPalettes: Record<string, ColorPalette> = {
  catppuccin: {
    name: "Catppuccin",
    colors: {
      bg: "#1e1e2e",
      fg: "#cdd6f4",
      primary: "#cba6f0",
      secondary: "#89b4fa",
      accent: "#f38ba8",
      muted: "#6c7086",
      ready: "#a6e3a1", // Light green
      not_ready: "#f38ba8", // Use the accent color
    },
  },
  gruvbox: {
    name: "Gruvbox",
    colors: {
      bg: "#282828",
      fg: "#ebdbb2",
      primary: "#fabd2f",
      secondary: "#83a598",
      accent: "#fe8019",
      muted: "#928374",
      ready: "#b8bb26", // Light green
      not_ready: "#fb4934", // Red
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
      ready: "#50fa7b", // Light green
      not_ready: "#ff5555", // Red
    },
  },
  everforest: {
    name: "Everforest",
    colors: {
      bg: "#2D353B",
      fg: "#D3C6AA",
      primary: "#A7C080",
      secondary: "#7FBBB3",
      accent: "#E67E80",
      muted: "#859289",
      ready: "#989d6a", // Light green
      not_ready: "#e46876", // Red
    },
  },
  tokyoNight: {
    name: "Tokyo Night",
    colors: {
      bg: "#1a1b26",
      fg: "#a9b1d6",
      primary: "#3d59a1",
      secondary: "#7aa2f7",
      accent: "#f7768e",
      muted: "#787c99",
      ready: "#9ece6a", // Light green
      not_ready: "#f7768e", // Use the accent color
    },
  },
  nightOwl: {
    name: "Night Owl",
    colors: {
      bg: "#021727",
      fg: "#D6DEEB",
      primary: "#C792EA",
      secondary: "#82AAFF",
      accent: "#F78C6C",
      muted: "#637777",
      ready: "#add765", // Light green
      not_ready: "#f06a5c", // Red
    },
  },
  nord: {
    name: "Nord",
    colors: {
      bg: "#2e3440",
      fg: "#d8dee9",
      primary: "#88c0d0",
      secondary: "#a3be8c",
      accent: "#b48ead",
      muted: "#4c566a",
      ready: "#a3be8c", // Light green
      not_ready: "#bf616a", // Red
    },
  },
  rosePine: {
    name: "Rosé Pine",
    colors: {
      bg: "#191724",
      fg: "#e0def4",
      primary: "#eb6f92",
      secondary: "#f6c177",
      accent: "#31748f",
      muted: "#6e6a86",
      ready: "#9ccfd8", // Light blue
      not_ready: "#eb6f92", // Use the primary color
    },
  },

  ayuDark: {
    name: "Ayu Dark",
    colors: {
      bg: "#0F1419",
      fg: "#E6E1CF",
      primary: "#FFB454",
      secondary: "#36A3D9",
      accent: "#F07178",
      muted: "#5C6773",
      ready: "#b3c730", // Light green
      not_ready: "#F07178", // Use the accent color
    },
  },
  gruvboxMaterial: {
    name: "Gruvbox Material",
    colors: {
      bg: "#1d2021",
      fg: "#d4be98",
      primary: "#d8a657",
      secondary: "#7daea3",
      accent: "#ea6962",
      muted: "#3c3836",
      ready: "#b8bb26", // Light green
      not_ready: "#ea6962", // Use the accent color
    },
  },
  solarizedDark: {
    name: "Solarized Dark",
    colors: {
      bg: "#002b36",
      fg: "#eee8d5",
      primary: "#268bd2",
      secondary: "#859900",
      accent: "#dc322f",
      muted: "#586e75",
      ready: "#859900", // Light green
      not_ready: "#dc322f", // Use the accent color
    },
  },
  onedark: {
    name: "One Dark",
    colors: {
      bg: "#282c34",
      fg: "#abb2bf",
      primary: "#c678dd",
      secondary: "#61afef",
      accent: "#e06c75",
      muted: "#5c6370",
      ready: "#98c379", // Light green
      not_ready: "#e06c75", // Use the accent color
    },
  },
};
