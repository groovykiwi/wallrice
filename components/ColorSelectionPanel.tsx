import type React from "react";
import { Plus, X, Palette, RotateCcw } from "lucide-react";
import { colorPalettes } from "../lib/colorPalettes";

interface ColorSelectionPanelProps {
  selectedPalette: string;
  activeColors: string[];
  customColors: string[];
  customColorInput: string;
  showCustomColorInput: boolean;
  MAX_COLORS: number;
  onPaletteChange: (palette: string) => void;
  onColorSelection: (colorHex: string) => void;
  onAddCustomColor: () => void;
  onRemoveCustomColor: (color: string) => void;
  onCustomColorInputChange: (color: string) => void;
  onToggleCustomColorInput: () => void;
  onResetColors: () => void;
  onSelectAllColors: () => void;
}

export function ColorSelectionPanel({
  selectedPalette,
  activeColors,
  customColors,
  customColorInput,
  showCustomColorInput,
  MAX_COLORS,
  onPaletteChange,
  onColorSelection,
  onAddCustomColor,
  onRemoveCustomColor,
  onCustomColorInputChange,
  onToggleCustomColorInput,
  onResetColors,
  onSelectAllColors,
}: ColorSelectionPanelProps) {
  return (
    <div className="lg:col-span-2 space-y-6 p-8 rounded-xl shadow-md self-start">
      <div className="flex items-start  md:items-center justify-between flex-col md:flex-row ">
        <span className="text-lg font-semibold text-slate-800 mb-4 md:mb-0 ">
          Color Selection ({activeColors.length}/{MAX_COLORS})
        </span>

        <div className="flex gap-2">
          <button
            onClick={onToggleCustomColorInput}
            className={`text-xs px-3 py-1 border rounded-lg flex items-center gap-1 transition-colors ${
              showCustomColorInput
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
            }`}
            title={
              showCustomColorInput ? "Hide custom colors" : "Add custom colors"
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
            onClick={onSelectAllColors}
            className="text-xs text-black px-3 py-1 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1"
            title="Select all available colors"
          >
            <Palette className="w-3 h-3" /> Select All
          </button>
          <button
            onClick={onResetColors}
            className="text-xs text-black px-3 py-1 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1"
            title="Reset to default colors and clear custom colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Palette Selection */}
      <div>
        <select
          value={selectedPalette}
          onChange={(e) => onPaletteChange(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {Object.entries(colorPalettes).map(([key, palette]) => (
            <option key={key} value={key}>
              {palette.name}
            </option>
          ))}
        </select>
      </div>

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
                    onClick={() => onColorSelection(colorHex)}
                    className={`w-12 h-12 rounded-xl border-3 transition-all hover:scale-110 hover:shadow-lg relative ${
                      isSelected
                        ? "border-slate-800 shadow-lg scale-105"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                    style={{ backgroundColor: colorHex }}
                    title={colorHex}
                    disabled={!isSelected && activeColors.length >= MAX_COLORS}
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

      {/* Custom Color Input - Only show when toggled */}
      {showCustomColorInput && (
        <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-3">
          <div className="flex gap-2">
            <input
              type="color"
              value={customColorInput}
              onChange={(e) => onCustomColorInputChange(e.target.value)}
              className="w-8 h-8 border border-slate-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={customColorInput}
              onChange={(e) => onCustomColorInputChange(e.target.value)}
              placeholder="#ffffff"
              className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
            <button
              onClick={onAddCustomColor}
              disabled={customColors.includes(customColorInput)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

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
                    onClick={() => onColorSelection(color)}
                    className={`w-12 h-12 rounded-xl border-3 transition-all hover:scale-110 hover:shadow-lg relative ${
                      isSelected
                        ? "border-slate-800 shadow-lg scale-105"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                    disabled={!isSelected && activeColors.length >= MAX_COLORS}
                  >
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => onRemoveCustomColor(color)}
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
    </div>
  );
}
