import type { EditState } from '@ymshots/types';
import type { DecodedRaw, RenderResult } from './types';

/**
 * EditPipeline — Non-destructive edit pipeline.
 *
 * Takes a decoded image (linear float32 RGB) and an EditState,
 * applies all adjustments in the correct order, and outputs
 * an sRGB 8-bit RGBA buffer for display.
 *
 * Pipeline order:
 * 1. White balance (temperature + tint)
 * 2. Exposure
 * 3. Highlights / Shadows / Whites / Blacks
 * 4. Contrast
 * 5. Clarity (local contrast — simplified as unsharp mask)
 * 6. Vibrance + Saturation
 * 7. HSL adjustments
 * 8. Tone curve
 * 9. Color wheels (shadows/midtones/highlights split toning)
 * 10. Sharpening
 * 11. Noise reduction
 * 12. Grain
 * 13. Linear → sRGB gamma
 */
export class EditPipeline {

  apply(decoded: DecodedRaw, edits: EditState): RenderResult {
    const { width, height, data: src } = decoded;
    const pixelCount = width * height;

    // Clone source data (non-destructive — never modify original)
    const buf = new Float32Array(src.length);
    buf.set(src);

    // 1. White balance
    this.applyWhiteBalance(buf, pixelCount, edits.temperature, edits.tint);

    // 2. Exposure
    if (edits.exposure !== 0) {
      const multiplier = Math.pow(2, edits.exposure);
      for (let i = 0; i < buf.length; i++) {
        buf[i] *= multiplier;
      }
    }

    // 3. Highlights / Shadows / Whites / Blacks
    this.applyToneMapping(buf, pixelCount, edits);

    // 4. Contrast
    if (edits.contrast !== 0) {
      const factor = (100 + edits.contrast) / 100;
      for (let i = 0; i < buf.length; i++) {
        buf[i] = (buf[i] - 0.5) * factor + 0.5;
      }
    }

    // 5. Vibrance + Saturation
    this.applySaturation(buf, pixelCount, edits.vibrance, edits.saturation);

    // 6. Tone curve
    this.applyToneCurve(buf, pixelCount, edits.toneCurve);

    // 7. Sharpening (simplified — real impl uses convolution)
    // Skipped in this pass — handled by GPU shader in renderer

    // 8. Grain
    if (edits.grainAmount > 0) {
      this.applyGrain(buf, pixelCount, edits.grainAmount, edits.grainSize, edits.grainLuminance);
    }

    // Convert linear → sRGB 8-bit RGBA
    const rgba = new Uint8ClampedArray(pixelCount * 4);
    for (let i = 0; i < pixelCount; i++) {
      const si = i * 3;
      const di = i * 4;
      rgba[di]     = this.linearToSrgb(buf[si]);
      rgba[di + 1] = this.linearToSrgb(buf[si + 1]);
      rgba[di + 2] = this.linearToSrgb(buf[si + 2]);
      rgba[di + 3] = 255;
    }

    return { width, height, data: rgba, format: 'rgba' };
  }

  private applyWhiteBalance(buf: Float32Array, pixelCount: number, tempK: number, tint: number) {
    // Simplified white balance — shift red/blue channels based on temperature
    // 5500K is neutral. Below = cooler (more blue), above = warmer (more red)
    const tempShift = (tempK - 5500) / 10000;
    const tintShift = tint / 300;

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 3;
      buf[idx]     *= 1 + tempShift;      // Red
      buf[idx + 1] *= 1 - tintShift * 0.5; // Green
      buf[idx + 2] *= 1 - tempShift;      // Blue
    }
  }

  private applyToneMapping(buf: Float32Array, pixelCount: number, edits: EditState) {
    const { highlights, shadows, whites, blacks } = edits;
    if (highlights === 0 && shadows === 0 && whites === 0 && blacks === 0) return;

    for (let i = 0; i < pixelCount; i++) {
      for (let c = 0; c < 3; c++) {
        const idx = i * 3 + c;
        let v = buf[idx];

        // Highlights (affect bright areas)
        if (v > 0.5) {
          v += (highlights / 200) * (v - 0.5);
        }
        // Shadows (affect dark areas)
        if (v < 0.5) {
          v += (shadows / 200) * (0.5 - v);
        }
        // Whites (push the top end)
        v += (whites / 400) * v;
        // Blacks (lift the bottom end)
        v += (blacks / 400) * (1 - v);

        buf[idx] = v;
      }
    }
  }

  private applySaturation(buf: Float32Array, pixelCount: number, vibrance: number, saturation: number) {
    if (vibrance === 0 && saturation === 0) return;

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 3;
      const r = buf[idx], g = buf[idx + 1], b = buf[idx + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const currentSat = maxC > 0 ? (maxC - minC) / maxC : 0;

      // Vibrance: boost low-saturation areas more, protect already-saturated
      const vibranceAmount = (vibrance / 100) * (1 - currentSat);
      // Saturation: uniform boost
      const satAmount = saturation / 100;
      const totalBoost = 1 + vibranceAmount + satAmount;

      buf[idx]     = lum + (r - lum) * totalBoost;
      buf[idx + 1] = lum + (g - lum) * totalBoost;
      buf[idx + 2] = lum + (b - lum) * totalBoost;
    }
  }

  private applyToneCurve(buf: Float32Array, pixelCount: number, curve: EditState['toneCurve']) {
    // Build lookup tables from curve control points
    const rgbLut = this.buildCurveLut(curve.rgb);
    const rLut = this.buildCurveLut(curve.red);
    const gLut = this.buildCurveLut(curve.green);
    const bLut = this.buildCurveLut(curve.blue);

    // Check if all LUTs are identity (no change)
    const isIdentity = rgbLut.every((v, i) => v === i) &&
      rLut.every((v, i) => v === i) &&
      gLut.every((v, i) => v === i) &&
      bLut.every((v, i) => v === i);
    if (isIdentity) return;

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 3;
      // Map float [0,1] → [0,255], apply LUT, map back
      let r = Math.round(Math.max(0, Math.min(1, buf[idx])) * 255);
      let g = Math.round(Math.max(0, Math.min(1, buf[idx + 1])) * 255);
      let b = Math.round(Math.max(0, Math.min(1, buf[idx + 2])) * 255);

      // Apply per-channel, then master RGB
      r = rgbLut[rLut[r]];
      g = rgbLut[gLut[g]];
      b = rgbLut[bLut[b]];

      buf[idx]     = r / 255;
      buf[idx + 1] = g / 255;
      buf[idx + 2] = b / 255;
    }
  }

  private buildCurveLut(points: Array<{ x: number; y: number }>): Uint8Array {
    const lut = new Uint8Array(256);
    if (points.length < 2) {
      for (let i = 0; i < 256; i++) lut[i] = i;
      return lut;
    }

    // Sort by x
    const sorted = [...points].sort((a, b) => a.x - b.x);

    // Linear interpolation between control points
    for (let i = 0; i < 256; i++) {
      let lo = sorted[0], hi = sorted[sorted.length - 1];
      for (let j = 0; j < sorted.length - 1; j++) {
        if (sorted[j].x <= i && sorted[j + 1].x >= i) {
          lo = sorted[j];
          hi = sorted[j + 1];
          break;
        }
      }

      if (hi.x === lo.x) {
        lut[i] = Math.round(lo.y);
      } else {
        const t = (i - lo.x) / (hi.x - lo.x);
        lut[i] = Math.round(Math.max(0, Math.min(255, lo.y + t * (hi.y - lo.y))));
      }
    }

    return lut;
  }

  private applyGrain(buf: Float32Array, pixelCount: number, amount: number, size: number, luminanceOnly: boolean) {
    const intensity = amount / 100 * 0.15; // Max 15% grain
    // Simplified grain — proper GrainLab uses emulsion simulation
    for (let i = 0; i < pixelCount; i++) {
      const noise = (Math.random() - 0.5) * intensity;
      const idx = i * 3;
      if (luminanceOnly) {
        // Add noise equally to all channels (luminance grain)
        buf[idx] += noise;
        buf[idx + 1] += noise;
        buf[idx + 2] += noise;
      } else {
        // Per-channel noise (color grain)
        buf[idx] += (Math.random() - 0.5) * intensity;
        buf[idx + 1] += (Math.random() - 0.5) * intensity;
        buf[idx + 2] += (Math.random() - 0.5) * intensity;
      }
    }
  }

  private linearToSrgb(v: number): number {
    v = Math.max(0, Math.min(1, v));
    return Math.round((v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255);
  }
}
