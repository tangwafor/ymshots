import type { RenderResult, HistogramData } from './types';

/**
 * HistogramCalculator — Generates RGB + Luminance histograms
 * from rendered image data. Used in the edit workspace sidebar.
 *
 * Target: < 16ms for 24MP (must not block UI at 60fps)
 */
export class HistogramCalculator {

  calculate(image: RenderResult): HistogramData {
    const { data, width, height } = image;
    const red = new Uint32Array(256);
    const green = new Uint32Array(256);
    const blue = new Uint32Array(256);
    const luminance = new Uint32Array(256);

    const pixelCount = width * height;

    // Sample every Nth pixel for large images (keep under 16ms)
    const step = pixelCount > 4_000_000 ? 4 : pixelCount > 1_000_000 ? 2 : 1;

    for (let i = 0; i < pixelCount; i += step) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      red[r]++;
      green[g]++;
      blue[b]++;

      // ITU-R BT.709 luminance
      const lum = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
      luminance[lum]++;
    }

    return { red, green, blue, luminance };
  }

  /**
   * Calculate clipping percentages (over/underexposed pixels)
   */
  getClipping(histogram: HistogramData, totalPixels: number): {
    shadowClip: number;    // % of pixels at 0
    highlightClip: number; // % of pixels at 255
  } {
    const shadowPixels = histogram.luminance[0] + histogram.luminance[1] + histogram.luminance[2];
    const highlightPixels = histogram.luminance[253] + histogram.luminance[254] + histogram.luminance[255];

    return {
      shadowClip: (shadowPixels / totalPixels) * 100,
      highlightClip: (highlightPixels / totalPixels) * 100,
    };
  }
}
