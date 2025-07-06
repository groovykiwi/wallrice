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
const MAX_COLORS = 8;

export default function ModernImageColorizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    isLinuxMode: false,
    isMobile: true, // Start as mobile to prevent flash
  } as UIState);

  // Update wallpaper URL when file or processed image changes
  useEffect(() => {
    let objectUrl: string | null = null;

    if (imageProcessingState.processedImage) {
      imageProcessingDispatch({
        type: "SET_WALLPAPER_URL",
        url: imageProcessingState.processedImage,
      });
    } else if (imageProcessingState.selectedFile) {
      objectUrl = URL.createObjectURL(imageProcessingState.selectedFile);
      imageProcessingDispatch({ type: "SET_WALLPAPER_URL", url: objectUrl });
      imageProcessingDispatch({
        type: "SET_ORIGINAL_WALLPAPER_URL",
        url: objectUrl,
      });
    } else {
      imageProcessingDispatch({
        type: "SET_WALLPAPER_URL",
        url: DEFAULT_WALLPAPER,
      });
      imageProcessingDispatch({
        type: "SET_ORIGINAL_WALLPAPER_URL",
        url: undefined,
      });
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageProcessingState.selectedFile, imageProcessingState.processedImage]);

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

  // Event handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      imageProcessingDispatch({ type: "SET_FILE", file });
      imageProcessingDispatch({ type: "SET_PROCESSED_IMAGE", image: null });
      colorizationDispatch({ type: "CLEAR_VALIDATION" });
    }
  };

  const handleColorSelection = (colorHex: string) => {
    colorSelectionDispatch({
      type: "TOGGLE_COLOR",
      color: colorHex,
      maxColors: MAX_COLORS,
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const addCustomColor = () => {
    colorSelectionDispatch({
      type: "ADD_CUSTOM_COLOR",
      color: colorSelectionState.customColorInput,
      maxColors: MAX_COLORS,
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const removeCustomColor = (colorToRemove: string) => {
    colorSelectionDispatch({
      type: "REMOVE_CUSTOM_COLOR",
      color: colorToRemove,
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
      maxColors: MAX_COLORS,
    });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });
  };

  const processImage = useCallback(async () => {
    if (
      !imageProcessingState.selectedFile ||
      !canvasRef.current ||
      colorSelectionState.activeColors.length < 1
    ) {
      return;
    }

    imageProcessingDispatch({ type: "SET_PROCESSING", isProcessing: true });
    colorizationDispatch({ type: "CLEAR_VALIDATION" });

    try {
      const colorizer = new ImageColorizer(canvasRef.current);
      const image = await colorizer.loadImage(
        imageProcessingState.selectedFile
      );
      colorizer.colorizeImage(
        image,
        colorSelectionState.activeColors,
        colorizationState.options
      );
      const dataURL = colorizer.getDataURL();
      imageProcessingDispatch({ type: "SET_PROCESSED_IMAGE", image: dataURL });

      // Automatically validate color accuracy
      const validation = colorizer.validateColorAccuracy(
        colorSelectionState.activeColors
      );
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

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        selectedPalette={colorSelectionState.selectedPalette}
        isLinuxMode={uiState.isLinuxMode}
        onToggleOS={() => uiDispatch({ type: "TOGGLE_OS" })}
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
            isLinuxMode={uiState.isLinuxMode}
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
              activeColors={colorSelectionState.activeColors}
              showAdvancedSettings={colorizationState.showAdvancedSettings}
              colorizationOptions={colorizationState.options}
              validationResult={colorizationState.validationResult}
              onFileChange={handleFileChange}
              onProcessImage={processImage}
              onDownloadImage={downloadImage}
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
              MAX_COLORS={MAX_COLORS}
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
