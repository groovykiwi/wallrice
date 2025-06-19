"use client";

import type React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import { colorPalettes } from "../lib/colorPalettes";
import { ImageColorizer } from "../lib/imageColorizer";
import { MacBookPreview } from "../components/MacBookPreview";
import { GlassDock } from "../components/LiquidGlass";
import {
  Upload,
  Palette,
  Download,
  Sparkles,
  Plus,
  X,
  RotateCcw,
} from "lucide-react";

// Define a constant for the default wallpaper image path
const DEFAULT_WALLPAPER = "/wallpaper.png";

export default function ModernImageColorizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [wallpaperUrl, setWallpaperUrl] = useState<string>(DEFAULT_WALLPAPER);
  const [selectedPalette, setSelectedPalette] = useState<string>("catppuccin");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [customColorInput, setCustomColorInput] = useState<string>("#ffffff");
  const [showCustomColorInput, setShowCustomColorInput] =
    useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_COLORS = 8;
  const [uiHidden, setUiHidden] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    if (processedImage) {
      setWallpaperUrl(processedImage);
    } else if (selectedFile) {
      objectUrl = URL.createObjectURL(selectedFile);
      setWallpaperUrl(objectUrl);
    } else {
      setWallpaperUrl(DEFAULT_WALLPAPER);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile, processedImage]);

  useEffect(() => {
    const currentPalette = colorPalettes[selectedPalette];
    setActiveColors([
      currentPalette.colors.bg,
      currentPalette.colors.primary,
      currentPalette.colors.fg,
    ]);
  }, [selectedPalette]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setProcessedImage(null);
    }
  };

  const handleColorSelection = (colorHex: string) => {
    setActiveColors((current) => {
      const isSelected = current.includes(colorHex);
      if (isSelected) {
        return current.filter((c) => c !== colorHex);
      } else {
        if (current.length < MAX_COLORS) {
          return [...current, colorHex];
        }
        return current;
      }
    });
  };

  const addCustomColor = () => {
    if (customColors.includes(customColorInput)) return;
    setCustomColors((current) => [...current, customColorInput]);
    // Auto-select the new custom color if there's room
    if (activeColors.length < MAX_COLORS) {
      setActiveColors((current) => [...current, customColorInput]);
    }
  };

  const removeCustomColor = (colorToRemove: string) => {
    setCustomColors((current) => current.filter((c) => c !== colorToRemove));
    setActiveColors((current) => current.filter((c) => c !== colorToRemove));
  };

  const resetColors = () => {
    const currentPalette = colorPalettes[selectedPalette];
    setActiveColors([
      currentPalette.colors.bg,
      currentPalette.colors.primary,
      currentPalette.colors.fg,
    ]);
    setCustomColors([]);
  };

  const selectAllColors = () => {
    const currentPalette = colorPalettes[selectedPalette];
    const allPaletteColors = Object.values(currentPalette.colors);
    const allColors = [...allPaletteColors, ...customColors];
    const colorsToSelect = allColors.slice(0, MAX_COLORS);
    setActiveColors(colorsToSelect);
  };

  const processImage = useCallback(async () => {
    if (!selectedFile || !canvasRef.current || activeColors.length < 1) {
      return;
    }

    setIsProcessing(true);
    try {
      const colorizer = new ImageColorizer(canvasRef.current);
      const image = await colorizer.loadImage(selectedFile);
      colorizer.colorizeImage(image, activeColors);
      const dataURL = colorizer.getDataURL();
      setProcessedImage(dataURL);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, activeColors]);

  const downloadImage = () => {
    if (!processedImage || !selectedFile) return;
    const originalName = selectedFile.name.replace(/\.[^/.]+$/, "");
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `${originalName}-colorized.png`;
    link.click();
  };

  const dockIcons = [
    { src: "/finder.png", alt: "Finder" },
    { src: "/safari.png", alt: "Safari" },
    { src: "/chatgpt.png", alt: "ChatGPT" },
    { src: "/maps.png", alt: "Maps" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <Sparkles className="w-16 h-16 text-slate-800 mr-4" />
              </div>
              <h1 className="text-7xl font-black text-slate-900 tracking-tight">
                Wall
                <span
                  className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  style={{
                    color: colorPalettes[selectedPalette].colors.primary,
                  }}
                >
                  Rice
                </span>
              </h1>
            </div>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your images with stunning color palettes. Upload, select
              colors from a palette, and create beautiful colorized artwork in
              seconds.
            </p>
          </div>
        </div>
      </div>

      {/* MacBook Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative">
        <MacBookPreview
          wallpaperUrl={wallpaperUrl}
          terminalPalette={colorPalettes[selectedPalette].colors}
          uiHidden={uiHidden}
          onToggleUi={() => setUiHidden((v) => !v)}
          terminalPaletteName={selectedPalette}
        >
          <div
            className={`transition-opacity duration-700 ${
              uiHidden ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <GlassDock icons={dockIcons} />
          </div>
        </MacBookPreview>
      </div>

      {/* Advanced Control Panel */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-white/70 backdrop-blur-xl border-slate-200/50 shadow-2xl rounded-2xl p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* File Upload Section */}
            <div className="space-y-6">
              <div>
                <span className="text-lg font-semibold text-slate-800 mb-3 block">
                  Image Upload
                </span>
                <div className="space-y-4">
                  <div
                    className="w-full h-16 border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center gap-3 rounded-xl text-slate-700 text-lg font-medium px-4 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        fileInputRef.current?.click();
                    }}
                    style={{ outline: "none" }}
                  >
                    <Upload className="w-6 h-6 mr-3" />
                    <span className="truncate flex-1 text-left">
                      {selectedFile ? selectedFile.name : "No file selected"}
                    </span>
                    <span className="ml-auto text-slate-500 text-base font-normal">
                      {selectedFile ? "Change" : "Upload"}
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Palette Selection */}
              <div>
                <span className="text-lg font-semibold text-slate-800 mb-3 block">
                  Base Palette
                </span>
                <select
                  value={selectedPalette}
                  onChange={(e) => setSelectedPalette(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.entries(colorPalettes).map(([key, palette]) => (
                    <option key={key} value={key}>
                      {palette.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color Selection */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-800">
                  Color Selection ({activeColors.length}/{MAX_COLORS})
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setShowCustomColorInput(!showCustomColorInput)
                    }
                    className={`text-xs px-3 py-1 border rounded-lg flex items-center gap-1 transition-colors ${
                      showCustomColorInput
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                    title={
                      showCustomColorInput
                        ? "Hide custom colors"
                        : "Add custom colors"
                    }
                  >
                    <Plus
                      className={`w-3 h-3 transition-transform ${
                        showCustomColorInput ? "rotate-45" : ""
                      }`}
                    />
                    Custom
                  </button>
                  <button
                    onClick={selectAllColors}
                    className="text-xs px-3 py-1 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1"
                    title="Select all available colors"
                  >
                    <Palette className="w-3 h-3" /> Select All
                  </button>
                  <button
                    onClick={resetColors}
                    className="text-xs px-3 py-1 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1"
                    title="Reset to default colors and clear custom colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
              </div>

              {/* Custom Color Input - Only show when toggled */}
              {showCustomColorInput && (
                <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      className="w-8 h-8 border border-slate-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    />
                    <button
                      onClick={addCustomColor}
                      disabled={customColors.includes(customColorInput)}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Palette Colors */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-3">
                  Palette Colors
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {Object.entries(colorPalettes[selectedPalette].colors).map(
                    ([name, colorHex]) => {
                      const isSelected = activeColors.includes(colorHex);
                      return (
                        <div key={name} className="text-center">
                          <button
                            onClick={() => handleColorSelection(colorHex)}
                            className={`w-12 h-12 rounded-xl border-3 transition-all hover:scale-110 hover:shadow-lg relative ${
                              isSelected
                                ? "border-slate-800 shadow-lg scale-105"
                                : "border-slate-300 hover:border-slate-400"
                            }`}
                            style={{ backgroundColor: colorHex }}
                            title={colorHex}
                            disabled={
                              !isSelected && activeColors.length >= MAX_COLORS
                            }
                          >
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </button>
                          <div className="mt-2 text-xs text-slate-600 font-medium capitalize">
                            {name}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Custom Colors */}
              {customColors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">
                    Custom Colors
                  </h3>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                    {customColors.map((color) => {
                      const isSelected = activeColors.includes(color);
                      return (
                        <div key={color} className="text-center relative">
                          <button
                            onClick={() => handleColorSelection(color)}
                            className={`w-12 h-12 rounded-xl border-3 transition-all hover:scale-110 hover:shadow-lg relative ${
                              isSelected
                                ? "border-slate-800 shadow-lg scale-105"
                                : "border-slate-300 hover:border-slate-400"
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                            disabled={
                              !isSelected && activeColors.length >= MAX_COLORS
                            }
                          >
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => removeCustomColor(color)}
                            className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors z-10"
                          >
                            <X className="w-2 h-2" />
                          </button>
                          <div className="mt-2 text-xs text-slate-600 font-medium">
                            {color.substring(0, 7)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={processImage}
                  disabled={
                    !selectedFile || isProcessing || activeColors.length < 1
                  }
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-lg text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {isProcessing
                    ? "Processing..."
                    : selectedFile
                    ? "Colorize"
                    : "Upload an image to colorize"}
                </button>

                {processedImage && (
                  <button
                    onClick={downloadImage}
                    className="bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200 px-6 py-3 rounded-lg text-base flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-600 text-sm">
              Made with ❤️ by{" "}
              <a
                href="https://nathvn.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-800 underline decoration-dotted hover:text-purple-600 font-medium transition-colors"
              >
                Nathan
              </a>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/groovykiwi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/nathan-houlamy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                LinkedIn
              </a>
              <a
                href="https://privacyalternative.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                Privacy Alternative
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
