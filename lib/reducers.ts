import { ColorizeOptions } from "./imageColorizer";

// Colorization state and actions
export interface ColorizationState {
  options: ColorizeOptions;
  showAdvancedSettings: boolean;
  validationResult: {
    averageError: number;
    maxError: number;
    isAccurate: boolean;
  } | null;
}

export type ColorizationAction =
  | {
      type: "UPDATE_OPTION";
      key: keyof ColorizeOptions;
      value: number | boolean;
    }
  | { type: "RESET_OPTIONS" }
  | { type: "TOGGLE_ADVANCED_SETTINGS" }
  | {
      type: "SET_VALIDATION_RESULT";
      result: ColorizationState["validationResult"];
    }
  | { type: "CLEAR_VALIDATION" };

export const colorizationReducer = (
  state: ColorizationState,
  action: ColorizationAction
): ColorizationState => {
  switch (action.type) {
    case "UPDATE_OPTION":
      return {
        ...state,
        options: {
          ...state.options,
          [action.key]: action.value,
        },
        validationResult: null, // Clear validation when options change
      };
    case "RESET_OPTIONS":
      return {
        ...state,
        options: {
          strength: 1.0,
          saturation: 1.0,
          contrast: 1.0,
          brightness: 0,
          preserveEdges: true,
        },
        validationResult: null,
      };
    case "TOGGLE_ADVANCED_SETTINGS":
      return {
        ...state,
        showAdvancedSettings: !state.showAdvancedSettings,
      };
    case "SET_VALIDATION_RESULT":
      return {
        ...state,
        validationResult: action.result,
      };
    case "CLEAR_VALIDATION":
      return {
        ...state,
        validationResult: null,
      };
    default:
      return state;
  }
};

// Color selection state and actions
export interface ColorSelectionState {
  selectedPalette: string;
  activeColors: string[];
  customColors: string[];
  customColorInput: string;
  showCustomColorInput: boolean;
}

export type ColorSelectionAction =
  | { type: "SET_PALETTE"; palette: string }
  | { type: "TOGGLE_COLOR"; color: string; maxColors: number }
  | { type: "ADD_CUSTOM_COLOR"; color: string; maxColors: number }
  | { type: "REMOVE_CUSTOM_COLOR"; color: string; maxColors: number }
  | { type: "SET_CUSTOM_COLOR_INPUT"; input: string }
  | { type: "TOGGLE_CUSTOM_COLOR_INPUT" }
  | { type: "RESET_COLORS"; defaultColors: string[] }
  | { type: "SELECT_ALL_COLORS"; allColors: string[]; maxColors: number };

export const colorSelectionReducer = (
  state: ColorSelectionState,
  action: ColorSelectionAction
): ColorSelectionState => {
  switch (action.type) {
    case "SET_PALETTE":
      return {
        ...state,
        selectedPalette: action.palette,
      };
    case "TOGGLE_COLOR": {
      const isSelected = state.activeColors.includes(action.color);
      if (isSelected) {
        return {
          ...state,
          activeColors: state.activeColors.filter((c) => c !== action.color),
        };
      } else if (state.activeColors.length < action.maxColors) {
        return {
          ...state,
          activeColors: [...state.activeColors, action.color],
        };
      }
      return state;
    }
    case "ADD_CUSTOM_COLOR": {
      if (state.customColors.includes(action.color)) return state;

      const newCustomColors = [...state.customColors, action.color];
      const newActiveColors =
        state.activeColors.length < action.maxColors
          ? [...state.activeColors, action.color]
          : state.activeColors;

      return {
        ...state,
        customColors: newCustomColors,
        activeColors: newActiveColors,
      };
    }
    case "REMOVE_CUSTOM_COLOR": {
      const newCustomColors = state.customColors.filter(
        (c) => c !== action.color
      );
      const newActiveColors = state.activeColors.filter(
        (c) => c !== action.color
      );

      // Ensure we don't exceed the new max colors limit after removing this custom color
      const finalActiveColors = newActiveColors.slice(0, action.maxColors);

      return {
        ...state,
        customColors: newCustomColors,
        activeColors: finalActiveColors,
      };
    }
    case "SET_CUSTOM_COLOR_INPUT":
      return {
        ...state,
        customColorInput: action.input,
      };
    case "TOGGLE_CUSTOM_COLOR_INPUT":
      return {
        ...state,
        showCustomColorInput: !state.showCustomColorInput,
      };
    case "RESET_COLORS":
      return {
        ...state,
        activeColors: action.defaultColors,
        customColors: [],
      };
    case "SELECT_ALL_COLORS":
      return {
        ...state,
        activeColors: action.allColors.slice(0, action.maxColors),
      };
    default:
      return state;
  }
};

// Image processing state and actions
export interface ImageProcessingState {
  selectedFile: File | null;
  processedImage: string | null;
  wallpaperUrl: string;
  originalWallpaperUrl: string | undefined;
  isProcessing: boolean;
}

export type ImageProcessingAction =
  | { type: "SET_FILE"; file: File | null }
  | { type: "SET_PROCESSED_IMAGE"; image: string | null }
  | { type: "SET_WALLPAPER_URL"; url: string }
  | { type: "SET_ORIGINAL_WALLPAPER_URL"; url: string | undefined }
  | { type: "SET_PROCESSING"; isProcessing: boolean }
  | { type: "RESET_PROCESSING" };

export const imageProcessingReducer = (
  state: ImageProcessingState,
  action: ImageProcessingAction
): ImageProcessingState => {
  switch (action.type) {
    case "SET_FILE":
      return {
        ...state,
        selectedFile: action.file,
      };
    case "SET_PROCESSED_IMAGE":
      return {
        ...state,
        processedImage: action.image,
      };
    case "SET_WALLPAPER_URL":
      return {
        ...state,
        wallpaperUrl: action.url,
      };
    case "SET_ORIGINAL_WALLPAPER_URL":
      return {
        ...state,
        originalWallpaperUrl: action.url,
      };
    case "SET_PROCESSING":
      return {
        ...state,
        isProcessing: action.isProcessing,
      };
    case "RESET_PROCESSING":
      return {
        ...state,
        selectedFile: null,
        processedImage: null,
        isProcessing: false,
      };
    default:
      return state;
  }
};

// UI state and actions
export type OSMode = "macos" | "linux" | "windows11";

export interface UIState {
  uiHidden: boolean;
  osMode: OSMode;
  isMobile: boolean;
}

export type UIAction =
  | { type: "SET_UI_HIDDEN"; hidden: boolean }
  | { type: "TOGGLE_UI" }
  | { type: "SET_OS_MODE"; osMode: OSMode }
  | { type: "CYCLE_OS" }
  | { type: "SET_MOBILE"; isMobile: boolean };

export const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "SET_UI_HIDDEN":
      return {
        ...state,
        uiHidden: action.hidden,
      };
    case "TOGGLE_UI":
      return {
        ...state,
        uiHidden: !state.uiHidden,
      };
    case "SET_OS_MODE":
      return {
        ...state,
        osMode: action.osMode,
      };
    case "CYCLE_OS":
      const nextOSMode: OSMode =
        state.osMode === "macos"
          ? "linux"
          : state.osMode === "linux"
          ? "windows11"
          : "macos";
      return {
        ...state,
        osMode: nextOSMode,
      };
    case "SET_MOBILE":
      return {
        ...state,
        isMobile: action.isMobile,
      };
    default:
      return state;
  }
};
