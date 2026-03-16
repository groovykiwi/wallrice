"use client";

import type React from "react";
import { useReducer, useRef, useCallback, useEffect } from "react";
import { colorPalettes } from "../lib/colorPalettes";
import { ImageColorizer } from "../lib/imageColorizer";
import { MacBookPreview } from "../components/MacBookPreview";
import { HeroSection } from "../components/HeroSection";
import { ImageUploadPanel } from "../components/ImageUploadPanel";
import { ColorSelectionPanel } from "../components/ColorSelectionPanel";
import { Footer } from "../components/Footer";
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

// Define a constant for the default wallpaper image path
const DEFAULT_WALLPAPER = "/wallpaper.png";
const BASE_PALETTE_COLORS = 6;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const normalizeHexColor = (value: string) => value.trim().toLowerCase();

const isValidHexColor = (value: string) =>
  HEX_COLOR_PATTERN.test(normalizeHexColor(value));

export default function ModernImageColorizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalWallpaperObjectUrlRef = useRef<string | null>(null);
  const processingInputVersionRef = useRef(0);

  // Consolidated state using useReducer
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
    uiHidden: true, // Start hidden to prevent flash
    osMode: "macos",
    isMobile: true, // Start as mobile to prevent flash
  } as UIState);

  // Keep the original uploaded file URL alive until the file changes.
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

  // Update active colors when palette changes
  useEffect(() => {
    const currentPalette = colorPalettes[colorSelectionState.selectedPalette];
    const defaultColors = [
      currentPalette.colors.background,
      currentPalette.colors.primary,
      currentPalette.colors.foreground,
    ];

    colorSelectionDispatch({
      type: "RESET_COLORS",
      defaultColors,
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  }, [colorSelectionState.selectedPalette]);

  // Detect mobile devices and hide UI accordingly
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768; // Tailwind's md breakpoint
      uiDispatch({ type: "SET_MOBILE", isMobile: isMobileDevice });
      uiDispatch({ type: "SET_UI_HIDDEN", hidden: isMobileDevice });
    };

    // Check on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
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
  ]);

  // Event handlers
  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      imageProcessingDispatch({ type: "SET_FILE", file });
      imageProcessingDispatch({ type: "SET_PROCESSED_IMAGE", image: null });
      colorizationDispatch({ type: "CLEAR_VALIDATION" });
    }
  };

  // Calculate dynamic max colors based on palette colors + custom colors
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
    // Calculate the new max colors after removing this custom color
    const newMaxColors =
      BASE_PALETTE_COLORS + (colorSelectionState.customColors.length - 1);

    colorSelectionDispatch({
      type: "REMOVE_CUSTOM_COLOR",
      color: colorToRemove,
      maxColors: newMaxColors,
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const resetColors = () => {
    const currentPalette = colorPalettes[colorSelectionState.selectedPalette];
    const defaultColors = [
      currentPalette.colors.background,
      currentPalette.colors.primary,
      currentPalette.colors.foreground,
    ];
    colorSelectionDispatch({
      type: "RESET_COLORS",
      defaultColors,
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const selectAllColors = () => {
    const currentPalette = colorPalettes[colorSelectionState.selectedPalette];
    const allPaletteColors = Object.values(currentPalette.colors);
    const allColors = [
      ...allPaletteColors,
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

      colorizer.colorizeImage(image, activeColors, options);
      const dataURL = colorizer.getDataURL();
      imageProcessingDispatch({ type: "SET_PROCESSED_IMAGE", image: dataURL });

      // Automatically validate color accuracy
      const validation = colorizer.validateColorAccuracy(activeColors);
      colorizationDispatch({
        type: "SET_VALIDATION_RESULT",
        result: validation,
      });
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      imageProcessingDispatch({ type: "SET_PROCESSING", isProcessing: false });
    }
  }, [
    imageProcessingState.selectedFile,
    colorSelectionState.activeColors,
    colorizationState.options,
  ]);

  const downloadImage = () => {
    if (
      !imageProcessingState.processedImage ||
      !imageProcessingState.selectedFile
    )
      return;
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
    imageProcessingDispatch({ type: "RESET_PROCESSING" });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        selectedPalette={colorSelectionState.selectedPalette}
        osMode={uiState.osMode}
        onOSChange={(osMode) => uiDispatch({ type: "SET_OS_MODE", osMode })}
      />

      {/* MacBook Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative">
        <div className="relative">
          <MacBookPreview
            wallpaperUrl={imageProcessingState.wallpaperUrl}
            originalWallpaperUrl={imageProcessingState.originalWallpaperUrl}
            terminalPalette={
              colorPalettes[colorSelectionState.selectedPalette].colors
            }
            uiHidden={uiState.uiHidden}
            onToggleUi={() => {
              // Only allow toggling UI on desktop
              if (!uiState.isMobile) {
                uiDispatch({ type: "TOGGLE_UI" });
              }
            }}
            terminalPaletteName={colorSelectionState.selectedPalette}
            osMode={uiState.osMode}
          />
        </div>
      </div>

      {/* Advanced Control Panel */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className=" border-slate-200/50 ">
          <div className="grid lg:grid-cols-3 gap-8">
            <ImageUploadPanel
              selectedFile={imageProcessingState.selectedFile}
              processedImage={imageProcessingState.processedImage}
              selectedPalette={colorSelectionState.selectedPalette}
              isProcessing={imageProcessingState.isProcessing}
              canProcess={canProcessImage}
              showAdvancedSettings={colorizationState.showAdvancedSettings}
              colorizationOptions={colorizationState.options}
              validationResult={colorizationState.validationResult}
              onFileSelect={handleFileSelect}
              onProcessImage={processImage}
              onDownloadImage={downloadImage}
              onStartOver={startOver}
              onToggleAdvancedSettings={() =>
                colorizationDispatch({ type: "TOGGLE_ADVANCED_SETTINGS" })
              }
              onUpdateOption={(key, value) =>
                colorizationDispatch({ type: "UPDATE_OPTION", key, value })
              }
              onResetOptions={() =>
                colorizationDispatch({ type: "RESET_OPTIONS" })
              }
            />

            <ColorSelectionPanel
              selectedPalette={colorSelectionState.selectedPalette}
              activeColors={colorSelectionState.activeColors}
              customColors={colorSelectionState.customColors}
              customColorInput={colorSelectionState.customColorInput}
              showCustomColorInput={colorSelectionState.showCustomColorInput}
              customColorInputError={customColorInputError}
              customColorPickerValue={
                isCustomColorInputValid ? normalizedCustomColorInput : "#ffffff"
              }
              canAddCustomColor={
                isCustomColorInputValid && !isDuplicateCustomColor
              }
              MAX_COLORS={maxColors}
              onPaletteChange={(palette) =>
                colorSelectionDispatch({ type: "SET_PALETTE", palette })
              }
              onColorSelection={handleColorSelection}
              onAddCustomColor={addCustomColor}
              onRemoveCustomColor={removeCustomColor}
              onCustomColorInputChange={(input) =>
                colorSelectionDispatch({
                  type: "SET_CUSTOM_COLOR_INPUT",
                  input,
                })
              }
              onToggleCustomColorInput={() =>
                colorSelectionDispatch({ type: "TOGGLE_CUSTOM_COLOR_INPUT" })
              }
              onResetColors={resetColors}
              onSelectAllColors={selectAllColors}
            />
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
      <Footer />
    </div>
  );
}
