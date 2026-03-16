"use client";

import { useReducer, useRef, useCallback, useEffect, useState } from "react";
import { colorPalettes } from "../lib/colorPalettes";
import {
  ImageColorizer,
  MAX_PROCESSING_DIMENSION,
  type ColorizeOptions,
} from "../lib/imageColorizer";
import {
  colorizationReducer,
  colorSelectionReducer,
  imageProcessingReducer,
  uiReducer,
  type ColorizationState,
  type ColorSelectionState,
  type ImageProcessingState,
  type UIState,
} from "../lib/reducers";

const DEFAULT_WALLPAPER = "/wallpaper.png";
const BASE_PALETTE_COLORS = 6;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const normalizeHexColor = (value: string) => value.trim().toLowerCase();

const isValidHexColor = (value: string) =>
  HEX_COLOR_PATTERN.test(normalizeHexColor(value));

const getDefaultPaletteColors = (paletteName: string) => {
  const palette = colorPalettes[paletteName];

  return [
    palette.colors.background,
    palette.colors.primary,
    palette.colors.foreground,
  ];
};

const revokeObjectUrlOnNextFrame = (objectUrl: string | null) => {
  if (!objectUrl) {
    return;
  }

  requestAnimationFrame(() => URL.revokeObjectURL(objectUrl));
};

export const useWallriceController = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalWallpaperObjectUrlRef = useRef<string | null>(null);
  const processedWallpaperObjectUrlRef = useRef<string | null>(null);
  const processingInputVersionRef = useRef(0);
  const [processFullResolution, setProcessFullResolution] = useState(false);

  const [colorizationState, colorizationDispatch] = useReducer(
    colorizationReducer,
    {
      options: {
        strength: 1.0,
        saturation: 1.0,
        contrast: 1.0,
        brightness: 0,
        preserveEdges: true,
      },
      showAdvancedSettings: false,
      validationResult: null,
    } as ColorizationState
  );

  const [colorSelectionState, colorSelectionDispatch] = useReducer(
    colorSelectionReducer,
    {
      selectedPalette: "catppuccin",
      activeColors: [],
      customColors: [],
      customColorInput: "#ffffff",
      showCustomColorInput: false,
    } as ColorSelectionState
  );

  const [imageProcessingState, imageProcessingDispatch] = useReducer(
    imageProcessingReducer,
    {
      selectedFile: null,
      processedImage: null,
      wallpaperUrl: DEFAULT_WALLPAPER,
      originalWallpaperUrl: undefined,
      isProcessing: false,
    } as ImageProcessingState
  );

  const [uiState, uiDispatch] = useReducer(uiReducer, {
    uiHidden: true,
    osMode: "macos",
    isMobile: true,
  } as UIState);

  useEffect(() => {
    if (!imageProcessingState.selectedFile) {
      if (originalWallpaperObjectUrlRef.current) {
        URL.revokeObjectURL(originalWallpaperObjectUrlRef.current);
        originalWallpaperObjectUrlRef.current = null;
      }

      imageProcessingDispatch({
        type: "SET_ORIGINAL_WALLPAPER_URL",
        url: undefined,
      });
      return;
    }

    const objectUrl = URL.createObjectURL(imageProcessingState.selectedFile);
    originalWallpaperObjectUrlRef.current = objectUrl;
    imageProcessingDispatch({
      type: "SET_ORIGINAL_WALLPAPER_URL",
      url: objectUrl,
    });

    return () => {
      if (originalWallpaperObjectUrlRef.current === objectUrl) {
        URL.revokeObjectURL(objectUrl);
        originalWallpaperObjectUrlRef.current = null;
      }
    };
  }, [imageProcessingState.selectedFile]);

  useEffect(() => {
    const wallpaperUrl =
      imageProcessingState.processedImage ||
      imageProcessingState.originalWallpaperUrl ||
      DEFAULT_WALLPAPER;

    imageProcessingDispatch({
      type: "SET_WALLPAPER_URL",
      url: wallpaperUrl,
    });
  }, [
    imageProcessingState.processedImage,
    imageProcessingState.originalWallpaperUrl,
  ]);

  useEffect(() => {
    return () => {
      if (processedWallpaperObjectUrlRef.current) {
        URL.revokeObjectURL(processedWallpaperObjectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    colorSelectionDispatch({
      type: "RESET_COLORS",
      defaultColors: getDefaultPaletteColors(colorSelectionState.selectedPalette),
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  }, [colorSelectionState.selectedPalette]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      uiDispatch({ type: "SET_MOBILE", isMobile: isMobileDevice });
      uiDispatch({ type: "SET_UI_HIDDEN", hidden: isMobileDevice });
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    processingInputVersionRef.current += 1;
  }, [
    imageProcessingState.selectedFile,
    colorSelectionState.selectedPalette,
    colorSelectionState.activeColors,
    colorSelectionState.customColors,
    colorizationState.options,
    processFullResolution,
  ]);

  const handleFileSelect = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    setProcessFullResolution(false);
    imageProcessingDispatch({ type: "SET_FILE", file });
    const previousProcessedUrl = processedWallpaperObjectUrlRef.current;
    processedWallpaperObjectUrlRef.current = null;
    imageProcessingDispatch({ type: "SET_PROCESSED_IMAGE", image: null });
    revokeObjectUrlOnNextFrame(previousProcessedUrl);
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const maxColors =
    BASE_PALETTE_COLORS + colorSelectionState.customColors.length;
  const normalizedCustomColorInput = normalizeHexColor(
    colorSelectionState.customColorInput
  );
  const customColorSet = new Set(
    colorSelectionState.customColors.map(normalizeHexColor)
  );
  const isCustomColorInputValid = isValidHexColor(
    colorSelectionState.customColorInput
  );
  const isDuplicateCustomColor = customColorSet.has(normalizedCustomColorInput);
  const customColorInputError =
    normalizedCustomColorInput.length === 0 || isCustomColorInputValid
      ? isDuplicateCustomColor
        ? "This custom color has already been added."
        : null
      : "Enter a full 6-digit hex color like #aabbcc.";
  const canProcessImage =
    !!imageProcessingState.selectedFile &&
    colorSelectionState.activeColors.length > 0 &&
    !imageProcessingState.isProcessing;

  const handleColorSelection = (colorHex: string) => {
    colorSelectionDispatch({
      type: "TOGGLE_COLOR",
      color: colorHex,
      maxColors,
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const addCustomColor = () => {
    if (!isCustomColorInputValid || isDuplicateCustomColor) {
      return;
    }

    colorSelectionDispatch({
      type: "ADD_CUSTOM_COLOR",
      color: normalizedCustomColorInput,
      maxColors,
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const removeCustomColor = (colorToRemove: string) => {
    colorSelectionDispatch({
      type: "REMOVE_CUSTOM_COLOR",
      color: colorToRemove,
      maxColors:
        BASE_PALETTE_COLORS + (colorSelectionState.customColors.length - 1),
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const resetColors = () => {
    colorSelectionDispatch({
      type: "RESET_COLORS",
      defaultColors: getDefaultPaletteColors(colorSelectionState.selectedPalette),
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const selectAllColors = () => {
    const allColors = [
      ...Object.values(colorPalettes[colorSelectionState.selectedPalette].colors),
      ...colorSelectionState.customColors,
    ];

    colorSelectionDispatch({
      type: "SELECT_ALL_COLORS",
      allColors,
      maxColors,
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const processImage = useCallback(async () => {
    const selectedFile = imageProcessingState.selectedFile;
    const activeColors = colorSelectionState.activeColors;
    const options = colorizationState.options;
    const canvas = canvasRef.current;

    if (!selectedFile || !canvas || activeColors.length < 1) {
      return;
    }

    const processingVersion = processingInputVersionRef.current;

    imageProcessingDispatch({ type: "SET_PROCESSING", isProcessing: true });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });

    try {
      const colorizer = new ImageColorizer(canvas);
      const image = await colorizer.loadImage(selectedFile);

      if (processingVersion !== processingInputVersionRef.current) {
        return;
      }

      await colorizer.colorizeImage(image, activeColors, options, {
        maxDimension: processFullResolution ? null : MAX_PROCESSING_DIMENSION,
        shouldAbort: () =>
          processingVersion !== processingInputVersionRef.current,
      });

      if (processingVersion !== processingInputVersionRef.current) {
        return;
      }

      const blob = await colorizer.getBlob();

      if (processingVersion !== processingInputVersionRef.current) {
        return;
      }

      const processedImageUrl = URL.createObjectURL(blob);
      const previousProcessedUrl = processedWallpaperObjectUrlRef.current;
      processedWallpaperObjectUrlRef.current = processedImageUrl;
      imageProcessingDispatch({
        type: "SET_PROCESSED_IMAGE",
        image: processedImageUrl,
      });
      revokeObjectUrlOnNextFrame(previousProcessedUrl);

      window.setTimeout(() => {
        if (processingVersion !== processingInputVersionRef.current) {
          return;
        }

        const validation = colorizer.validateColorAccuracy(activeColors);

        if (processingVersion !== processingInputVersionRef.current) {
          return;
        }

        colorizationDispatch({
          type: "SET_VALIDATION_RESULT",
          result: validation,
        });
      }, 0);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "ProcessingAbortedError"
      ) {
        return;
      }

      console.error("Error processing image:", error);
    } finally {
      imageProcessingDispatch({ type: "SET_PROCESSING", isProcessing: false });
    }
  }, [
    imageProcessingState.selectedFile,
    colorSelectionState.activeColors,
    colorizationState.options,
    processFullResolution,
  ]);

  const downloadImage = () => {
    if (
      !imageProcessingState.processedImage ||
      !imageProcessingState.selectedFile
    ) {
      return;
    }

    const originalName = imageProcessingState.selectedFile.name.replace(
      /\.[^/.]+$/,
      ""
    );
    const link = document.createElement("a");
    link.href = imageProcessingState.processedImage;
    link.download = `${originalName}-colorized.png`;
    link.click();
  };

  const startOver = () => {
    setProcessFullResolution(false);
    const previousProcessedUrl = processedWallpaperObjectUrlRef.current;
    processedWallpaperObjectUrlRef.current = null;
    imageProcessingDispatch({ type: "RESET_PROCESSING" });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
    revokeObjectUrlOnNextFrame(previousProcessedUrl);
  };

  const selectedPaletteColors =
    colorPalettes[colorSelectionState.selectedPalette].colors;

  return {
    canvasRef,
    heroSectionProps: {
      selectedPalette: colorSelectionState.selectedPalette,
      osMode: uiState.osMode,
      onOSChange: (osMode: UIState["osMode"]) =>
        uiDispatch({ type: "SET_OS_MODE", osMode }),
    },
    previewProps: {
      wallpaperUrl: imageProcessingState.wallpaperUrl,
      originalWallpaperUrl: imageProcessingState.originalWallpaperUrl,
      terminalPalette: selectedPaletteColors,
      uiHidden: uiState.uiHidden,
      onToggleUi: () => {
        if (!uiState.isMobile) {
          uiDispatch({ type: "TOGGLE_UI" });
        }
      },
      terminalPaletteName: colorSelectionState.selectedPalette,
      osMode: uiState.osMode,
    },
    uploadPanelProps: {
      selectedFile: imageProcessingState.selectedFile,
      processedImage: imageProcessingState.processedImage,
      selectedPalette: colorSelectionState.selectedPalette,
      isProcessing: imageProcessingState.isProcessing,
      canProcess: canProcessImage,
      showAdvancedSettings: colorizationState.showAdvancedSettings,
      colorizationOptions: colorizationState.options,
      validationResult: colorizationState.validationResult,
      processFullResolution,
      onFileSelect: handleFileSelect,
      onProcessImage: processImage,
      onDownloadImage: downloadImage,
      onStartOver: startOver,
      onProcessFullResolutionChange: setProcessFullResolution,
      onToggleAdvancedSettings: () =>
        colorizationDispatch({ type: "TOGGLE_ADVANCED_SETTINGS" }),
      onUpdateOption: (
        key: keyof ColorizeOptions,
        value: number | boolean
      ) =>
        colorizationDispatch({ type: "UPDATE_OPTION", key, value }),
      onResetOptions: () => colorizationDispatch({ type: "RESET_OPTIONS" }),
    },
    colorSelectionPanelProps: {
      selectedPalette: colorSelectionState.selectedPalette,
      activeColors: colorSelectionState.activeColors,
      customColors: colorSelectionState.customColors,
      customColorInput: colorSelectionState.customColorInput,
      showCustomColorInput: colorSelectionState.showCustomColorInput,
      customColorInputError,
      customColorPickerValue: isCustomColorInputValid
        ? normalizedCustomColorInput
        : "#ffffff",
      canAddCustomColor: isCustomColorInputValid && !isDuplicateCustomColor,
      MAX_COLORS: maxColors,
      onPaletteChange: (palette: string) =>
        colorSelectionDispatch({ type: "SET_PALETTE", palette }),
      onColorSelection: handleColorSelection,
      onAddCustomColor: addCustomColor,
      onRemoveCustomColor: removeCustomColor,
      onCustomColorInputChange: (input: string) =>
        colorSelectionDispatch({
          type: "SET_CUSTOM_COLOR_INPUT",
          input,
        }),
      onToggleCustomColorInput: () =>
        colorSelectionDispatch({ type: "TOGGLE_CUSTOM_COLOR_INPUT" }),
      onResetColors: resetColors,
      onSelectAllColors: selectAllColors,
    },
  };
};
