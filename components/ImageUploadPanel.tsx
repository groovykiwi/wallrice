import type React from "react";
import { useRef, useState } from "react";
import {
  Upload,
  Download,
  Sparkles,
  RotateCcw,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { colorPalettes } from "../lib/colorPalettes";
import { ColorizeOptions } from "../lib/imageColorizer";

interface ImageUploadPanelProps {
  selectedFile: File | null;
  processedImage: string | null;
  selectedPalette: string;
  isProcessing: boolean;
  showAdvancedSettings: boolean;
  colorizationOptions: ColorizeOptions;
  validationResult: {
    averageError: number;
    maxError: number;
    isAccurate: boolean;
  } | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessImage: () => void;
  onDownloadImage: () => void;
  onToggleAdvancedSettings: () => void;
  onUpdateOption: (key: keyof ColorizeOptions, value: number | boolean) => void;
  onResetOptions: () => void;
}

export function ImageUploadPanel({
  selectedFile,
  processedImage,
  selectedPalette,
  isProcessing,
  showAdvancedSettings,
  colorizationOptions,
  validationResult,
  onFileChange,
  onProcessImage,
  onDownloadImage,
  onToggleAdvancedSettings,
  onUpdateOption,
  onResetOptions,
}: ImageUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handles file selection from either drag-and-drop or file input
  const handleFileSelection = (file: File) => {
    // Create a synthetic event to maintain compatibility with onFileChange
    const event = {
      target: {
        files: [file],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onFileChange(event);
  };

  const handleDragEvent = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvent(e);
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate that the file is an image
      if (file.type.startsWith("image/")) {
        handleFileSelection(file);
      }
    }
  };

  return (
    <div className="space-y-6 p-8 rounded-xl shadow-md self-start">
      <div>
        <span className="text-lg font-semibold text-slate-800 mb-3 block">
          Image Upload
        </span>
        <div className="space-y-4">
          <div
            className={`w-full h-16 border-2 border-dashed transition-all flex items-center gap-3 rounded-xl text-lg font-medium px-4 cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                fileInputRef.current?.click();
            }}
            style={{ outline: "none" }}
          >
            <Upload className="w-6 h-6 mr-3" />
            <span className="truncate flex-1 text-sm text-left">
              {isDragging
                ? "Drop image here..."
                : selectedFile
                ? selectedFile.name
                : "Click or drag image to upload"}
            </span>
            <span className="ml-auto text-slate-500 text-base font-normal">
              {selectedFile && !isDragging ? "Change" : ""}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {/* Action Buttons Container */}
        <div className="flex gap-3 flex-col pt-4">
          {/* Main action button: Upload -> Process -> Colorize More */}
          <button
            onClick={onProcessImage}
            disabled={!selectedFile || isProcessing}
            className="flex-1 text-white font-medium py-3 px-6 rounded-lg text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            style={{
              backgroundColor:
                selectedFile && !isProcessing
                  ? colorPalettes[selectedPalette].colors.primary
                  : colorPalettes[selectedPalette].colors.muted,
            }}
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : processedImage ? (
              <>
                <Sparkles className="w-4 h-4" />
                Colorize More
              </>
            ) : selectedFile ? (
              <>
                <Sparkles className="w-4 h-4" />
                Colorize
              </>
            ) : (
              "Upload an image first"
            )}
          </button>

          {/* This block appears after success, containing all subsequent actions. */}
          {processedImage && !isProcessing && (
            <div className="space-y-3 pt-4 border-t border-slate-200 mt-3 animate-in fade-in">
              <div
                className="bg-green-50 text-green-800 p-3 rounded-lg text-sm flex items-center gap-3"
                role="alert"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Image successfully colorized.</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onDownloadImage}
                  className="flex-1 bg-white justify-center hover:bg-slate-50 text-slate-700 font-medium border border-slate-200 px-6 py-3 rounded-lg text-base flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Strength Slider - Always Visible */}
        <div className="pt-4 mt-4 border-t border-slate-200">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-700">
                Colorization Strength
              </label>
              <span className="text-sm text-slate-500">
                {Math.round(colorizationOptions.strength! * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={colorizationOptions.strength}
              onChange={(e) =>
                onUpdateOption("strength", parseFloat(e.target.value))
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="pt-4 border-slate-200">
          <button
            onClick={onToggleAdvancedSettings}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showAdvancedSettings
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Settings className="w-4 h-4" />
            Advanced Settings
          </button>
        </div>

        {/* Advanced Settings Panel */}
        {showAdvancedSettings && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Colorization Settings
              </span>
              <button
                onClick={onResetOptions}
                className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Saturation */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-slate-600">Saturation</label>
                <span className="text-sm text-slate-500">
                  {Math.round(colorizationOptions.saturation! * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={colorizationOptions.saturation}
                onChange={(e) =>
                  onUpdateOption("saturation", parseFloat(e.target.value))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-slate-600">Contrast</label>
                <span className="text-sm text-slate-500">
                  {Math.round(colorizationOptions.contrast! * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={colorizationOptions.contrast}
                onChange={(e) =>
                  onUpdateOption("contrast", parseFloat(e.target.value))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Brightness */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-slate-600">Brightness</label>
                <span className="text-sm text-slate-500">
                  {colorizationOptions.brightness! > 0 ? "+" : ""}
                  {colorizationOptions.brightness}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={colorizationOptions.brightness}
                onChange={(e) =>
                  onUpdateOption("brightness", parseInt(e.target.value))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Preserve Edges Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-600">Preserve Edges</label>
                <input
                  type="checkbox"
                  checked={colorizationOptions.preserveEdges}
                  onChange={(e) =>
                    onUpdateOption("preserveEdges", e.target.checked)
                  }
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
                  title="Prevent colors from bleeding across object boundaries"
                />
              </div>
              <p className="text-xs text-slate-500">
                Reduces color bleeding across object boundaries
              </p>
            </div>

            {/* Color Accuracy Validation Results */}
            {validationResult && processedImage && (
              <div className="pt-4 border-t border-slate-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">
                      Color Accuracy
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        validationResult.isAccurate
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {validationResult.isAccurate ? "Excellent" : "Good"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>
                      Avg Error: {validationResult.averageError.toFixed(2)} ΔE
                    </div>
                    <div>
                      Max Error: {validationResult.maxError.toFixed(2)} ΔE
                    </div>
                    <div className="text-xs text-slate-400">
                      (Lower is better, &lt;2.0 = imperceptible difference)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
