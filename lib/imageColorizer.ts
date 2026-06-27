// lib/imageColorizer.ts

// Color Science Constants
// These are standard constants from CIE color science specifications

// sRGB to Linear RGB conversion constants
const SRGB_GAMMA_THRESHOLD = 0.04045; // Threshold for gamma correction
const SRGB_GAMMA_FACTOR = 1.055; // Gamma correction factor
const SRGB_GAMMA_EXPONENT = 2.4; // Standard sRGB gamma exponent
const SRGB_LINEAR_FACTOR = 12.92; // Linear factor for small values
const SRGB_LINEAR_OFFSET = 0.055; // Offset for gamma correction
const SRGB_INVERSE_GAMMA_THRESHOLD = 0.0031308; // Threshold for inverse gamma correction

// Perceptual color difference thresholds in OKLab space
const COLOR_DIFFERENCE_THRESHOLD_AVERAGE = 0.04; // Average acceptable difference
const COLOR_DIFFERENCE_THRESHOLD_MAX = 0.12; // Maximum acceptable difference
const VALIDATION_TARGET_SAMPLE_COUNT = 50000;
const VALIDATION_MIN_PIXEL_STEP = 10;
const PROCESSING_TIME_BUDGET_MS = 12;
const YIELD_CHECK_ROW_INTERVAL = 8;

// Edge detection threshold
const EDGE_DETECTION_THRESHOLD = 30; // Sobel magnitude threshold for edge detection

// Luminance weights for RGB (ITU-R BT.709)
const LUMINANCE_WEIGHT_R = 0.2126;
const LUMINANCE_WEIGHT_G = 0.7152;
const LUMINANCE_WEIGHT_B = 0.0722;

export const MAX_PROCESSING_DIMENSION = 4096;

export const getConstrainedDimensions = (
  width: number,
  height: number,
  maxDimension: number = MAX_PROCESSING_DIMENSION
) => {
  const largestDimension = Math.max(width, height);

  if (largestDimension <= maxDimension) {
    return {
      width,
      height,
      scale: 1,
      isConstrained: false,
    };
  }

  const scale = maxDimension / largestDimension;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
    isConstrained: true,
  };
};

interface ProcessingOptions {
  maxDimension?: number | null;
  shouldAbort?: () => boolean;
}

type OklabColor = [number, number, number];
type OklchColor = [number, number, number];
type PaletteEntry = {
  oklab: OklabColor;
  oklch: OklchColor;
  lightness: number;
};
type LightnessRange = {
  min: number;
  max: number;
};

export type ColorizeMode = "toneMap" | "paletteMap" | "moodMatch";

export interface ColorizeOptions {
  mode?: ColorizeMode;
  strength?: number; // 0-1, how much to blend with original (1 = full colorization)
  saturation?: number; // 0-2, saturation multiplier (1 = no change)
  contrast?: number; // 0-2, contrast multiplier (1 = no change)
  brightness?: number; // -100 to 100, brightness adjustment
  preserveEdges?: boolean; // Whether to apply edge preservation
}

export type ColorizeOptionValue = NonNullable<
  ColorizeOptions[keyof ColorizeOptions]
>;

class ProcessingAbortedError extends Error {
  constructor() {
    super("Image processing was aborted.");
    this.name = "ProcessingAbortedError";
  }
}

export class ImageColorizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      };

      img.src = objectUrl;
    });
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error(`Invalid hex color format: ${hex}`);
    }
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ];
  }

  private getLightness(r: number, g: number, b: number): number {
    return (
      LUMINANCE_WEIGHT_R * r + LUMINANCE_WEIGHT_G * g + LUMINANCE_WEIGHT_B * b
    );
  }

  private async yieldToBrowser(): Promise<void> {
    await new Promise<void>((resolve) => {
      if (typeof window !== "undefined" && window.requestAnimationFrame) {
        window.requestAnimationFrame(() => resolve());
        return;
      }

      setTimeout(resolve, 0);
    });
  }

  private srgbChannelToLinear(channel: number): number {
    const value = channel / 255;

    return value > SRGB_GAMMA_THRESHOLD
      ? Math.pow(
          (value + SRGB_LINEAR_OFFSET) / SRGB_GAMMA_FACTOR,
          SRGB_GAMMA_EXPONENT
        )
      : value / SRGB_LINEAR_FACTOR;
  }

  private linearChannelToSrgb(channel: number): number {
    const value =
      channel > SRGB_INVERSE_GAMMA_THRESHOLD
        ? SRGB_GAMMA_FACTOR * Math.pow(channel, 1 / SRGB_GAMMA_EXPONENT) -
          SRGB_LINEAR_OFFSET
        : SRGB_LINEAR_FACTOR * channel;

    return Math.round(value * 255);
  }

  // OKLab/OKLCH color conversion keeps perceived lightness and chroma steadier
  // than CIE Lab/HSL for palette-driven image processing.
  private rgbToOklab(r: number, g: number, b: number): OklabColor {
    const linearR = this.srgbChannelToLinear(r);
    const linearG = this.srgbChannelToLinear(g);
    const linearB = this.srgbChannelToLinear(b);

    const l = Math.cbrt(
      0.4122214708 * linearR +
        0.5363325363 * linearG +
        0.0514459929 * linearB
    );
    const m = Math.cbrt(
      0.2119034982 * linearR +
        0.6806995451 * linearG +
        0.1073969566 * linearB
    );
    const s = Math.cbrt(
      0.0883024619 * linearR +
        0.2817188376 * linearG +
        0.6299787005 * linearB
    );

    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
  }

  private oklabToRgb(L: number, a: number, b: number): [number, number, number] {
    const lPrime = L + 0.3963377774 * a + 0.2158037573 * b;
    const mPrime = L - 0.1055613458 * a - 0.0638541728 * b;
    const sPrime = L - 0.0894841775 * a - 1.291485548 * b;

    const l = lPrime * lPrime * lPrime;
    const m = mPrime * mPrime * mPrime;
    const s = sPrime * sPrime * sPrime;

    const linearR = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const linearG = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const linearB = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    return [
      this.clamp(this.linearChannelToSrgb(linearR)),
      this.clamp(this.linearChannelToSrgb(linearG)),
      this.clamp(this.linearChannelToSrgb(linearB)),
    ];
  }

  private oklabToOklch([L, a, b]: OklabColor): OklchColor {
    const chroma = Math.sqrt(a * a + b * b);
    const hue = (Math.atan2(b, a) * 180) / Math.PI;

    return [L, chroma, hue < 0 ? hue + 360 : hue];
  }

  private oklchToOklab([L, chroma, hue]: OklchColor): OklabColor {
    const hueRadians = (hue * Math.PI) / 180;

    return [L, chroma * Math.cos(hueRadians), chroma * Math.sin(hueRadians)];
  }

  private rgbToOklch(r: number, g: number, b: number): OklchColor {
    return this.oklabToOklch(this.rgbToOklab(r, g, b));
  }

  private isOklchInSrgbGamut(color: OklchColor): boolean {
    const [L, a, b] = this.oklchToOklab(color);
    const lPrime = L + 0.3963377774 * a + 0.2158037573 * b;
    const mPrime = L - 0.1055613458 * a - 0.0638541728 * b;
    const sPrime = L - 0.0894841775 * a - 1.291485548 * b;

    const l = lPrime * lPrime * lPrime;
    const m = mPrime * mPrime * mPrime;
    const s = sPrime * sPrime * sPrime;

    const linearR = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const linearG = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const linearB = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
    const epsilon = 0.000001;

    return (
      linearR >= -epsilon &&
      linearR <= 1 + epsilon &&
      linearG >= -epsilon &&
      linearG <= 1 + epsilon &&
      linearB >= -epsilon &&
      linearB <= 1 + epsilon
    );
  }

  private mapOklchToSrgb(color: OklchColor): [number, number, number] {
    if (this.isOklchInSrgbGamut(color)) {
      return this.oklabToRgb(...this.oklchToOklab(color));
    }

    let lowChroma = 0;
    let highChroma = color[1];

    for (let i = 0; i < 12; i++) {
      const midChroma = (lowChroma + highChroma) / 2;
      const candidate: OklchColor = [color[0], midChroma, color[2]];

      if (this.isOklchInSrgbGamut(candidate)) {
        lowChroma = midChroma;
      } else {
        highChroma = midChroma;
      }
    }

    return this.oklabToRgb(...this.oklchToOklab([color[0], lowChroma, color[2]]));
  }

  private interpolateHue(startHue: number, endHue: number, amount: number) {
    const delta = ((((endHue - startHue) % 360) + 540) % 360) - 180;
    const hue = startHue + delta * amount;

    return ((hue % 360) + 360) % 360;
  }

  private adjustChroma(color: OklchColor, saturation: number): OklchColor {
    return [color[0], Math.max(0, color[1] * saturation), color[2]];
  }

  private createPalette(selectedColors: string[]): PaletteEntry[] {
    return selectedColors
      .map((hex) => {
        const rgb = this.hexToRgb(hex);
        const oklab = this.rgbToOklab(...rgb);
        const oklch = this.oklabToOklch(oklab);

        return { oklab, oklch, lightness: oklch[0] };
      })
      .sort((a, b) => a.lightness - b.lightness);
  }

  private findLightnessStops(
    palette: PaletteEntry[],
    lightness: number
  ): {
    lowerColor: PaletteEntry;
    upperColor: PaletteEntry;
    amount: number;
  } {
    if (palette.length === 1) {
      return {
        lowerColor: palette[0],
        upperColor: palette[0],
        amount: 0,
      };
    }

    const minLightness = palette[0].lightness;
    const maxLightness = palette[palette.length - 1].lightness;
    const clampedLightness = Math.max(
      minLightness,
      Math.min(lightness, maxLightness)
    );
    let lowerColor = palette[0];
    let upperColor = palette[0];

    for (let j = 0; j < palette.length - 1; j++) {
      lowerColor = palette[j];
      upperColor = palette[j + 1];

      if (
        clampedLightness >= lowerColor.lightness &&
        clampedLightness <= upperColor.lightness
      ) {
        break;
      }
    }

    const range = upperColor.lightness - lowerColor.lightness;
    const amount =
      range === 0 ? 0 : (clampedLightness - lowerColor.lightness) / range;

    return { lowerColor, upperColor, amount };
  }

  private mapByTone(
    outputLightness: number,
    selectorLightness: number,
    palette: PaletteEntry[]
  ): OklchColor {
    if (palette.length === 1) {
      const targetOklch = palette[0].oklch;
      const lightnessRatio = Math.min(
        outputLightness / Math.max(targetOklch[0], 0.01),
        1
      );

      return [
        outputLightness,
        targetOklch[1] * lightnessRatio,
        targetOklch[2],
      ];
    }

    const { lowerColor, upperColor, amount } = this.findLightnessStops(
      palette,
      selectorLightness
    );
    const lowerOklch = lowerColor.oklch;
    const upperOklch = upperColor.oklch;

    return [
      outputLightness,
      lowerOklch[1] + (upperOklch[1] - lowerOklch[1]) * amount,
      this.interpolateHue(lowerOklch[2], upperOklch[2], amount),
    ];
  }

  private mapByPalette(
    originalOklab: OklabColor,
    palette: PaletteEntry[]
  ): OklchColor {
    let totalWeight = 0;
    let weightedA = 0;
    let weightedB = 0;

    for (const color of palette) {
      const deltaL = (originalOklab[0] - color.oklab[0]) * 1.5;
      const deltaA = originalOklab[1] - color.oklab[1];
      const deltaB = originalOklab[2] - color.oklab[2];
      const distanceSquared =
        deltaL * deltaL + deltaA * deltaA + deltaB * deltaB;
      const weight = 1 / (distanceSquared + 0.0004);

      totalWeight += weight;
      weightedA += color.oklab[1] * weight;
      weightedB += color.oklab[2] * weight;
    }

    return this.oklabToOklch([
      originalOklab[0],
      weightedA / totalWeight,
      weightedB / totalWeight,
    ]);
  }

  private getLightnessRange(data: Uint8ClampedArray): LightnessRange {
    const totalPixels = data.length / 4;
    const pixelStep = Math.max(
      VALIDATION_MIN_PIXEL_STEP,
      Math.ceil(totalPixels / VALIDATION_TARGET_SAMPLE_COUNT)
    );
    let min = 1;
    let max = 0;

    for (let i = 0; i < data.length; i += pixelStep * 4) {
      if (data[i + 3] === 0) continue;

      const [lightness] = this.rgbToOklab(data[i], data[i + 1], data[i + 2]);
      min = Math.min(min, lightness);
      max = Math.max(max, lightness);
    }

    if (max <= min) {
      return { min: 0, max: 1 };
    }

    return { min, max };
  }

  private mapLightnessToPalette(
    lightness: number,
    sourceRange: LightnessRange,
    palette: PaletteEntry[]
  ): number {
    const sourceAmount =
      (lightness - sourceRange.min) / (sourceRange.max - sourceRange.min);
    const clampedAmount = Math.max(0, Math.min(1, sourceAmount));
    const minLightness = palette[0].lightness;
    const maxLightness = palette[palette.length - 1].lightness;

    return minLightness + (maxLightness - minLightness) * clampedAmount;
  }

  // Calculate perceptual color difference in OKLab space.
  private calculateColorDifference(
    color1: OklabColor,
    color2: OklabColor
  ): number {
    const deltaL = color1[0] - color2[0];
    const deltaA = color1[1] - color2[1];
    const deltaB = color1[2] - color2[2];

    return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
  }

  // Enhanced edge detection for color bleeding prevention
  private async detectEdges(
    imageData: ImageData,
    shouldAbort?: () => boolean
  ): Promise<Uint8Array> {
    const { width, height, data } = imageData;
    const edges = new Uint8Array(width * height);
    let lastYieldTime = performance.now();

    for (let y = 1; y < height - 1; y++) {
      if (shouldAbort?.()) {
        throw new ProcessingAbortedError();
      }

      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Simple Sobel edge detection on luminance
        const tl = this.getLightness(
          data[idx - width * 4 - 4],
          data[idx - width * 4 - 3],
          data[idx - width * 4 - 2]
        );
        const tm = this.getLightness(
          data[idx - width * 4],
          data[idx - width * 4 + 1],
          data[idx - width * 4 + 2]
        );
        const tr = this.getLightness(
          data[idx - width * 4 + 4],
          data[idx - width * 4 + 5],
          data[idx - width * 4 + 6]
        );
        const ml = this.getLightness(
          data[idx - 4],
          data[idx - 3],
          data[idx - 2]
        );
        const mr = this.getLightness(
          data[idx + 4],
          data[idx + 5],
          data[idx + 6]
        );
        const bl = this.getLightness(
          data[idx + width * 4 - 4],
          data[idx + width * 4 - 3],
          data[idx + width * 4 - 2]
        );
        const bm = this.getLightness(
          data[idx + width * 4],
          data[idx + width * 4 + 1],
          data[idx + width * 4 + 2]
        );
        const br = this.getLightness(
          data[idx + width * 4 + 4],
          data[idx + width * 4 + 5],
          data[idx + width * 4 + 6]
        );

        const gx = -1 * tl + 1 * tr + -2 * ml + 2 * mr + -1 * bl + 1 * br;
        const gy = -1 * tl + -2 * tm + -1 * tr + 1 * bl + 2 * bm + 1 * br;
        const magnitude = Math.sqrt(gx * gx + gy * gy);

        edges[y * width + x] = magnitude > EDGE_DETECTION_THRESHOLD ? 255 : 0;
      }

      if (
        y % YIELD_CHECK_ROW_INTERVAL === 0 &&
        performance.now() - lastYieldTime >= PROCESSING_TIME_BUDGET_MS
      ) {
        await this.yieldToBrowser();
        lastYieldTime = performance.now();
      }
    }

    return edges;
  }

  private clamp(value: number, min: number = 0, max: number = 255): number {
    return Math.max(min, Math.min(max, value));
  }

  private adjustContrast(
    r: number,
    g: number,
    b: number,
    contrast: number
  ): [number, number, number] {
    const factor =
      (259 * (contrast * 127.5 + 255)) / (255 * (259 - contrast * 127.5));

    const newR = factor * (r - 128) + 128;
    const newG = factor * (g - 128) + 128;
    const newB = factor * (b - 128) + 128;

    return [this.clamp(newR), this.clamp(newG), this.clamp(newB)];
  }

  private adjustBrightness(
    r: number,
    g: number,
    b: number,
    brightness: number
  ): [number, number, number] {
    const adjustment = (brightness / 100) * 255;

    return [
      this.clamp(r + adjustment),
      this.clamp(g + adjustment),
      this.clamp(b + adjustment),
    ];
  }

  // Main colorization method using OKLab/OKLCH for perceptual palette mapping
  async colorizeImage(
    image: HTMLImageElement,
    selectedColors: string[],
    options: ColorizeOptions = {},
    processingOptions: ProcessingOptions = {}
  ): Promise<void> {
    if (selectedColors.length < 1) {
      console.error("Colorize requires at least 1 color.");
      return;
    }

    const {
      mode = "toneMap",
      strength = 1.0,
      saturation = 1.0,
      contrast = 1.0,
      brightness = 0,
      preserveEdges = true,
    } = options;
    const {
      maxDimension = MAX_PROCESSING_DIMENSION,
      shouldAbort,
    } = processingOptions;

    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const processingSize =
      maxDimension == null
        ? {
            width: sourceWidth,
            height: sourceHeight,
            scale: 1,
            isConstrained: false,
          }
        : getConstrainedDimensions(sourceWidth, sourceHeight, maxDimension);

    this.canvas.width = processingSize.width;
    this.canvas.height = processingSize.height;
    this.ctx.drawImage(image, 0, 0, processingSize.width, processingSize.height);

    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const data = imageData.data;

    // Store original data for blending
    const originalData = new Uint8ClampedArray(data);

    // Detect edges if edge preservation is enabled
    const edges = preserveEdges
      ? await this.detectEdges(imageData, shouldAbort)
      : null;

    const palette = this.createPalette(selectedColors);
    const sourceLightnessRange =
      mode === "moodMatch" ? this.getLightnessRange(data) : null;
    let lastYieldTime = performance.now();

    // Process each pixel in OKLCH while preserving source lightness.
    for (let y = 0; y < this.canvas.height; y++) {
      if (shouldAbort?.()) {
        throw new ProcessingAbortedError();
      }

      const rowOffset = y * this.canvas.width * 4;

      for (let x = 0; x < this.canvas.width; x++) {
        const i = rowOffset + x * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        const pixelIndex = y * this.canvas.width + x;
        const isEdge = edges ? edges[pixelIndex] > 0 : false;
        const edgeStrength = isEdge ? strength * 0.5 : strength;

        const originalOklab = this.rgbToOklab(r, g, b);
        const originalLightness = originalOklab[0];
        let mappedColor: OklchColor;

        switch (mode) {
          case "paletteMap":
            mappedColor = this.mapByPalette(originalOklab, palette);
            break;
          case "moodMatch": {
            const targetLightness = this.mapLightnessToPalette(
              originalLightness,
              sourceLightnessRange ?? { min: 0, max: 1 },
              palette
            );
            mappedColor = this.mapByTone(
              targetLightness,
              targetLightness,
              palette
            );
            break;
          }
          case "toneMap":
          default:
            mappedColor = this.mapByTone(
              originalLightness,
              originalLightness,
              palette
            );
        }

        if (saturation !== 1.0) {
          mappedColor = this.adjustChroma(mappedColor, saturation);
        }

        let [newR, newG, newB] = this.mapOklchToSrgb(mappedColor);

        if (contrast !== 1.0) {
          [newR, newG, newB] = this.adjustContrast(newR, newG, newB, contrast);
        }

        if (brightness !== 0) {
          [newR, newG, newB] = this.adjustBrightness(
            newR,
            newG,
            newB,
            brightness
          );
        }

        if (edgeStrength < 1.0) {
          const originalR = originalData[i];
          const originalG = originalData[i + 1];
          const originalB = originalData[i + 2];

          newR = Math.round(originalR + (newR - originalR) * edgeStrength);
          newG = Math.round(originalG + (newG - originalG) * edgeStrength);
          newB = Math.round(originalB + (newB - originalB) * edgeStrength);
        }

        data[i] = this.clamp(newR);
        data[i + 1] = this.clamp(newG);
        data[i + 2] = this.clamp(newB);
      }

      if (
        y % YIELD_CHECK_ROW_INTERVAL === 0 &&
        performance.now() - lastYieldTime >= PROCESSING_TIME_BUDGET_MS
      ) {
        await this.yieldToBrowser();
        lastYieldTime = performance.now();
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  // Quality validation method using perceptual metrics
  validateColorAccuracy(targetPalette: string[]): {
    averageError: number;
    maxError: number;
    isAccurate: boolean;
  } {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const data = imageData.data;

    const targetOklabColors = targetPalette.map((hex) => {
      const rgb = this.hexToRgb(hex);
      return this.rgbToOklab(...rgb);
    });

    let totalError = 0;
    let maxError = 0;
    let pixelCount = 0;
    const totalPixels = this.canvas.width * this.canvas.height;
    const pixelStep = Math.max(
      VALIDATION_MIN_PIXEL_STEP,
      Math.ceil(totalPixels / VALIDATION_TARGET_SAMPLE_COUNT)
    );

    // Sample a bounded number of pixels so validation stays cheap on large images.
    for (let i = 0; i < data.length; i += pixelStep * 4) {
      if (data[i + 3] === 0) continue; // Skip transparent pixels

      const pixelOklab = this.rgbToOklab(data[i], data[i + 1], data[i + 2]);

      // Find closest target color
      let minDistance = Infinity;
      for (const targetOklab of targetOklabColors) {
        const distance = this.calculateColorDifference(pixelOklab, targetOklab);
        minDistance = Math.min(minDistance, distance);
      }

      totalError += minDistance;
      maxError = Math.max(maxError, minDistance);
      pixelCount++;
    }

    const averageError = pixelCount > 0 ? totalError / pixelCount : 0;
    const isAccurate =
      averageError < COLOR_DIFFERENCE_THRESHOLD_AVERAGE &&
      maxError < COLOR_DIFFERENCE_THRESHOLD_MAX;

    return { averageError, maxError, isAccurate };
  }

  async getBlob(
    type: string = "image/png",
    quality?: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            return;
          }

          reject(new Error("Failed to export processed image."));
        },
        type,
        quality
      );
    });
  }
}
