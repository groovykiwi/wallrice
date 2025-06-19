// lib/imageColorizer.ts
// No changes needed for lerpColor, hexToRgb, or getLightness helpers

// ... (keep lerpColor, hexToRgb, getLightness, loadImage from previous answer)

export class ImageColorizer {
    // ... (constructor, loadImage, hexToRgb, getLightness are the same)
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
  
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d")!;
    }
  
    async loadImage(file: File): Promise<HTMLImageElement> {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    }
  
    private hexToRgb(hex: string): [number, number, number] {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [0, 0, 0];
    }
  
    private getLightness(r: number, g: number, b: number): number {
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
  
    // MODIFIED: This function now accepts an array of hex color strings
    colorizeImage(image: HTMLImageElement, selectedColors: string[]): void {
      if (selectedColors.length < 1) {
        console.error("Colorize requires at least 1 color.");
        return;
      }
  
      this.canvas.width = image.width;
      this.canvas.height = image.height;
      this.ctx.drawImage(image, 0, 0);
  
      const imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      const data = imageData.data;
  
      // 1. Create a sorted palette from the user's selected colors
      const sortedPalette = selectedColors
        .map((hex) => {
          const rgb = this.hexToRgb(hex);
          return { rgb, lightness: this.getLightness(...rgb) };
        })
        .sort((a, b) => a.lightness - b.lightness);
  
      const minLightness = sortedPalette[0].lightness;
      const maxLightness = sortedPalette[sortedPalette.length - 1].lightness;
  
      // 2. Process each pixel (this logic remains the same)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
  
        if (a === 0) continue;
  
        if (sortedPalette.length === 1) {
          // Only one color: tint the image with this color while preserving luminance
          const originalLightness = this.getLightness(r, g, b);
          const [targetR, targetG, targetB] = sortedPalette[0].rgb;
          const targetLightness = this.getLightness(targetR, targetG, targetB);
          
          // Preserve the original pixel's relative brightness
          const luminanceRatio = targetLightness > 0 ? originalLightness / targetLightness : 0;
          const clampedRatio = Math.min(luminanceRatio, 1.0); // Prevent brightening beyond the target color
          
          data[i] = Math.round(targetR * clampedRatio);
          data[i + 1] = Math.round(targetG * clampedRatio);
          data[i + 2] = Math.round(targetB * clampedRatio);
          continue;
        }
  
        const originalLightness = this.getLightness(r, g, b);
        const clampedLightness = Math.max(
          minLightness,
          Math.min(originalLightness, maxLightness)
        );
  
        let lowerColor = sortedPalette[0];
        let upperColor = sortedPalette[0];
        for (let j = 0; j < sortedPalette.length - 1; j++) {
          lowerColor = sortedPalette[j];
          upperColor = sortedPalette[j + 1];
          if (
            clampedLightness >= lowerColor.lightness &&
            clampedLightness <= upperColor.lightness
          ) {
            break;
          }
        }
  
        const range = upperColor.lightness - lowerColor.lightness;
        const amount =
          range === 0
            ? 0
            : (clampedLightness - lowerColor.lightness) / range;
  
        const [newR, newG, newB] = lerpColor(
          lowerColor.rgb,
          upperColor.rgb,
          amount
        );
  
        data[i] = newR;
        data[i + 1] = newG;
        data[i + 2] = newB;
      }
  
      this.ctx.putImageData(imageData, 0, 0);
    }
  
    getDataURL(): string {
      return this.canvas.toDataURL();
    }
  }
  
  // Helper function for linear interpolation of colors
  function lerpColor(
    a: [number, number, number],
    b: [number, number, number],
    amount: number
  ): [number, number, number] {
    const ar = a[0],
      ag = a[1],
      ab = a[2];
    const br = b[0],
      bg = b[1],
      bb = b[2];
  
      const r = ar + (br - ar) * amount;
      const g = ag + (bg - ag) * amount;
      const blue = ab + (bb - ab) * amount;
      
      return [r, g, blue];
  }