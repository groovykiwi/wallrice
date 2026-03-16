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

// sRGB to XYZ transformation matrix (ITU-R BT.709 primaries)
// These constants convert sRGB to CIE XYZ color space
const SRGB_TO_XYZ_R = { x: 0.4124564, y: 0.2126729, z: 0.0193339 };
const SRGB_TO_XYZ_G = { x: 0.3575761, y: 0.7151522, z: 0.119192 };
const SRGB_TO_XYZ_B = { x: 0.1804375, y: 0.072175, z: 0.9503041 };

// XYZ to sRGB transformation matrix (inverse of above)
const XYZ_TO_SRGB_X = { r: 3.2404542, g: -0.969266, b: 0.0556434 };
const XYZ_TO_SRGB_Y = { r: -1.5371385, g: 1.8760108, b: -0.2040259 };
const XYZ_TO_SRGB_Z = { r: -0.4985314, g: 0.041556, b: 1.0572252 };

// D65 illuminant white point normalization factors
// D65 is the standard daylight illuminant used in sRGB
const D65_WHITE_POINT_X = 0.95047;
const D65_WHITE_POINT_Y = 1.0;
const D65_WHITE_POINT_Z = 1.08883;

// XYZ to Lab conversion constants
const LAB_DELTA = 6.0 / 29.0; // Delta threshold for Lab conversion
const LAB_DELTA_CUBED = LAB_DELTA * LAB_DELTA * LAB_DELTA; // ~0.008856
const LAB_DELTA_FACTOR = 7.787; // Factor for linear portion of Lab curve
const LAB_OFFSET = 16.0 / 116.0; // Offset for Lab conversion
const LAB_SCALE_L = 116.0; // Lightness scale factor
const LAB_SCALE_A = 500.0; // A* channel scale factor
const LAB_SCALE_B = 200.0; // B* channel scale factor
const LAB_LIGHTNESS_OFFSET = 16.0; // Lightness offset

// Perceptual color difference thresholds (CIEDE2000 approximation)
const COLOR_DIFFERENCE_THRESHOLD_AVERAGE = 2.0; // Average acceptable difference
const COLOR_DIFFERENCE_THRESHOLD_MAX = 5.0; // Maximum acceptable difference
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

export interface ColorizeOptions {
  strength?: number; // 0-1, how much to blend with original (1 = full colorization)
  saturation?: number; // 0-2, saturation multiplier (1 = no change)
  contrast?: number; // 0-2, contrast multiplier (1 = no change)
  brightness?: number; // -100 to 100, brightness adjustment
  preserveEdges?: boolean; // Whether to apply edge preservation
}

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

  // Lab color space conversion functions for perceptually accurate processing
  private rgbToLab(r: number, g: number, b: number): [number, number, number] {
    // Convert RGB to XYZ
    let x = r / 255;
    let y = g / 255;
    let z = b / 255;

    // Apply gamma correction (sRGB to linear RGB)
    x =
      x > SRGB_GAMMA_THRESHOLD
        ? Math.pow(
            (x + SRGB_LINEAR_OFFSET) / SRGB_GAMMA_FACTOR,
            SRGB_GAMMA_EXPONENT
          )
        : x / SRGB_LINEAR_FACTOR;
    y =
      y > SRGB_GAMMA_THRESHOLD
        ? Math.pow(
            (y + SRGB_LINEAR_OFFSET) / SRGB_GAMMA_FACTOR,
            SRGB_GAMMA_EXPONENT
          )
        : y / SRGB_LINEAR_FACTOR;
    z =
      z > SRGB_GAMMA_THRESHOLD
        ? Math.pow(
            (z + SRGB_LINEAR_OFFSET) / SRGB_GAMMA_FACTOR,
            SRGB_GAMMA_EXPONENT
          )
        : z / SRGB_LINEAR_FACTOR;

    // Transform linear RGB to XYZ using ITU-R BT.709 matrix
    const xyzX =
      x * SRGB_TO_XYZ_R.x + y * SRGB_TO_XYZ_G.x + z * SRGB_TO_XYZ_B.x;
    const xyzY =
      x * SRGB_TO_XYZ_R.y + y * SRGB_TO_XYZ_G.y + z * SRGB_TO_XYZ_B.y;
    const xyzZ =
      x * SRGB_TO_XYZ_R.z + y * SRGB_TO_XYZ_G.z + z * SRGB_TO_XYZ_B.z;

    // Normalize for D65 illuminant
    x = xyzX / D65_WHITE_POINT_X;
    y = xyzY / D65_WHITE_POINT_Y;
    z = xyzZ / D65_WHITE_POINT_Z;

    // Convert XYZ to Lab
    x =
      x > LAB_DELTA_CUBED
        ? Math.pow(x, 1 / 3)
        : LAB_DELTA_FACTOR * x + LAB_OFFSET;
    y =
      y > LAB_DELTA_CUBED
        ? Math.pow(y, 1 / 3)
        : LAB_DELTA_FACTOR * y + LAB_OFFSET;
    z =
      z > LAB_DELTA_CUBED
        ? Math.pow(z, 1 / 3)
        : LAB_DELTA_FACTOR * z + LAB_OFFSET;

    const L = Math.max(0, LAB_SCALE_L * y - LAB_LIGHTNESS_OFFSET);
    const a = LAB_SCALE_A * (x - y);
    const b_lab = LAB_SCALE_B * (y - z);

    return [L, a, b_lab];
  }

  private labToRgb(L: number, a: number, b: number): [number, number, number] {
    // Convert Lab to XYZ
    let y = (L + LAB_LIGHTNESS_OFFSET) / LAB_SCALE_L;
    let x = a / LAB_SCALE_A + y;
    let z = y - b / LAB_SCALE_B;

    x =
      Math.pow(x, 3) > LAB_DELTA_CUBED
        ? Math.pow(x, 3)
        : (x - LAB_OFFSET) / LAB_DELTA_FACTOR;
    y =
      Math.pow(y, 3) > LAB_DELTA_CUBED
        ? Math.pow(y, 3)
        : (y - LAB_OFFSET) / LAB_DELTA_FACTOR;
    z =
      Math.pow(z, 3) > LAB_DELTA_CUBED
        ? Math.pow(z, 3)
        : (z - LAB_OFFSET) / LAB_DELTA_FACTOR;

    // Scale by D65 illuminant
    x *= D65_WHITE_POINT_X;
    y *= D65_WHITE_POINT_Y;
    z *= D65_WHITE_POINT_Z;

    // Convert XYZ to linear RGB using inverse transformation matrix
    let r = x * XYZ_TO_SRGB_X.r + y * XYZ_TO_SRGB_Y.r + z * XYZ_TO_SRGB_Z.r;
    let g = x * XYZ_TO_SRGB_X.g + y * XYZ_TO_SRGB_Y.g + z * XYZ_TO_SRGB_Z.g;
    let blue = x * XYZ_TO_SRGB_X.b + y * XYZ_TO_SRGB_Y.b + z * XYZ_TO_SRGB_Z.b;

    // Apply inverse gamma correction (linear RGB to sRGB)
    r =
      r > SRGB_INVERSE_GAMMA_THRESHOLD
        ? SRGB_GAMMA_FACTOR * Math.pow(r, 1 / SRGB_GAMMA_EXPONENT) -
          SRGB_LINEAR_OFFSET
        : SRGB_LINEAR_FACTOR * r;
    g =
      g > SRGB_INVERSE_GAMMA_THRESHOLD
        ? SRGB_GAMMA_FACTOR * Math.pow(g, 1 / SRGB_GAMMA_EXPONENT) -
          SRGB_LINEAR_OFFSET
        : SRGB_LINEAR_FACTOR * g;
    blue =
      blue > SRGB_INVERSE_GAMMA_THRESHOLD
        ? SRGB_GAMMA_FACTOR * Math.pow(blue, 1 / SRGB_GAMMA_EXPONENT) -
          SRGB_LINEAR_OFFSET
        : SRGB_LINEAR_FACTOR * blue;

    return [
      Math.max(0, Math.min(255, Math.round(r * 255))),
      Math.max(0, Math.min(255, Math.round(g * 255))),
      Math.max(0, Math.min(255, Math.round(blue * 255))),
    ];
  }

  // Calculate perceptual color difference using CIEDE2000 approximation
  private calculateColorDifference(
    lab1: [number, number, number],
    lab2: [number, number, number]
  ): number {
    const [L1, a1, b1] = lab1;
    const [L2, a2, b2] = lab2;

    // Simplified CIEDE2000 calculation (approximation for performance)
    const deltaL = L1 - L2;
    const deltaA = a1 - a2;
    const deltaB = b1 - b2;

    const C1 = Math.sqrt(a1 * a1 + b1 * b1);
    const C2 = Math.sqrt(a2 * a2 + b2 * b2);
    const deltaC = C1 - C2;

    const deltaH = Math.sqrt(
      Math.max(0, deltaA * deltaA + deltaB * deltaB - deltaC * deltaC)
    );

    const kL = 1.0;
    const kC = 1.0;
    const kH = 1.0;

    return Math.sqrt(
      Math.pow(deltaL / kL, 2) +
        Math.pow(deltaC / kC, 2) +
        Math.pow(deltaH / kH, 2)
    );
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

  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s, l];
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  private clamp(value: number, min: number = 0, max: number = 255): number {
    return Math.max(min, Math.min(max, value));
  }

  private adjustSaturation(
    r: number,
    g: number,
    b: number,
    saturation: number
  ): [number, number, number] {
    const [h, s, l] = this.rgbToHsl(r, g, b);
    const newS = Math.max(0, Math.min(1, s * saturation));
    return this.hslToRgb(h, newS, l);
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

  // Main colorization method using Lab color space for pixel-perfect results
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

    // Convert palette to Lab space for perceptually uniform processing
    const palette = selectedColors
      .map((hex) => {
        const rgb = this.hexToRgb(hex);
        const lab = this.rgbToLab(...rgb);
        return { rgb, lab, lightness: lab[0] }; // L channel is lightness in Lab
      })
      .sort((a, b) => a.lightness - b.lightness);

    const minLightness = palette[0].lightness;
    const maxLightness = palette[palette.length - 1].lightness;
    let lastYieldTime = performance.now();

    // Process each pixel in Lab color space
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

        const [originalL] = this.rgbToLab(r, g, b);

        let newR: number, newG: number, newB: number;

        if (palette.length === 1) {
          const targetLab = palette[0].lab;
          const luminanceRatio = Math.min(
            originalL / Math.max(targetLab[0], 1),
            1.0
          );

          const newLab: [number, number, number] = [
            originalL,
            targetLab[1] * luminanceRatio,
            targetLab[2] * luminanceRatio,
          ];

          [newR, newG, newB] = this.labToRgb(...newLab);
        } else {
          const clampedLightness = Math.max(
            minLightness,
            Math.min(originalL, maxLightness)
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

          const lowerLab = lowerColor.lab;
          const upperLab = upperColor.lab;
          const interpolatedLab: [number, number, number] = [
            originalL,
            lowerLab[1] + (upperLab[1] - lowerLab[1]) * amount,
            lowerLab[2] + (upperLab[2] - lowerLab[2]) * amount,
          ];

          [newR, newG, newB] = this.labToRgb(...interpolatedLab);
        }

        if (saturation !== 1.0) {
          [newR, newG, newB] = this.adjustSaturation(
            newR,
            newG,
            newB,
            saturation
          );
        }

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

    const targetLabColors = targetPalette.map((hex) => {
      const rgb = this.hexToRgb(hex);
      return this.rgbToLab(...rgb);
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

      const pixelLab = this.rgbToLab(data[i], data[i + 1], data[i + 2]);

      // Find closest target color
      let minDistance = Infinity;
      for (const targetLab of targetLabColors) {
        const distance = this.calculateColorDifference(pixelLab, targetLab);
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
