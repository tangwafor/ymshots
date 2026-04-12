import { OnnxModelManager } from '../model-manager';
import { computeConfidence, type SignatureAIConfidence, type EditState, type ImageFeatures } from '@ymshots/types';

/**
 * SignatureAI — Personal Style DNA Engine
 * THE product. Learns from your edits, builds your style fingerprint,
 * applies your style to any photo automatically.
 *
 * 5 emotional states:
 * 1. Dormant (0–9 pairs)   — "Your style is being noticed"
 * 2. Learning (10–29)      — Fingerprint bars appear
 * 3. Forming (30–49)       — Style card + "Apply my style" button
 * 4. Confident (50–99)     — Batch apply unlocked
 * 5. Expert (100+)         — Full-screen milestone, style export, per-shoot profiles
 */
export class SignatureAIEngine {
  private models: OnnxModelManager;

  constructor(models: OnnxModelManager) {
    this.models = models;
  }

  /**
   * Extract features from an image for style comparison.
   * Runs on 64x64 downscaled image — never sees raw pixels.
   */
  extractFeatures(imageBuffer: Buffer, width: number, height: number): ImageFeatures {
    const size = 64;
    let rSum = 0, gSum = 0, bSum = 0;
    let rSqSum = 0, gSqSum = 0, bSqSum = 0;
    let satSum = 0;
    const luminanceHist = new Float32Array(64);
    const pixels = size * size;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const srcX = Math.floor(x * width / size);
        const srcY = Math.floor(y * height / size);
        const idx = (srcY * width + srcX) * 3;

        const r = (imageBuffer[idx] || 0) / 255;
        const g = (imageBuffer[idx + 1] || 0) / 255;
        const b = (imageBuffer[idx + 2] || 0) / 255;

        rSum += r; gSum += g; bSum += b;
        rSqSum += r * r; gSqSum += g * g; bSqSum += b * b;

        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const bin = Math.min(63, Math.floor(lum * 64));
        luminanceHist[bin]++;

        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        satSum += maxC > 0 ? (maxC - minC) / maxC : 0;
      }
    }

    // Normalize histogram
    for (let i = 0; i < 64; i++) luminanceHist[i] /= pixels;

    const rMean = rSum / pixels;
    const gMean = gSum / pixels;
    const bMean = bSum / pixels;

    // Estimate color temperature from R/B ratio
    const rbRatio = rMean / Math.max(0.001, bMean);
    const colorTemp = 2000 + rbRatio * 4000; // Rough estimate

    // Contrast ratio: p95/p5 luminance
    let p5 = 0, p95 = 0, cumSum = 0;
    for (let i = 0; i < 64; i++) {
      cumSum += luminanceHist[i];
      if (cumSum >= 0.05 && p5 === 0) p5 = i / 64;
      if (cumSum >= 0.95 && p95 === 0) p95 = i / 64;
    }

    return {
      luminanceHist,
      rMean, gMean, bMean,
      rStd: Math.sqrt(rSqSum / pixels - rMean * rMean),
      gStd: Math.sqrt(gSqSum / pixels - gMean * gMean),
      bStd: Math.sqrt(bSqSum / pixels - bMean * bMean),
      colorTemp,
      contrastRatio: p95 / Math.max(0.001, p5),
      saturationMean: satSum / pixels,
      sharpness: 0, // Computed separately via Laplacian
    };
  }

  /**
   * Create a training pair from before/after edit states.
   * Called every time the user saves an edit.
   */
  createTrainingPair(beforeFeatures: ImageFeatures, afterEdits: EditState): StyleTrainingData {
    return {
      features: beforeFeatures,
      edits: afterEdits,
      timestamp: Date.now(),
    };
  }

  /**
   * Compute the style fingerprint from all training pairs.
   * Returns average adjustments that define the user's style.
   */
  computeFingerprint(pairs: StyleTrainingData[]): StyleFingerprint {
    if (pairs.length === 0) {
      return { warmth: 0, contrast: 0, clarity: 0, shadowLift: 0, saturation: 0, moodWords: [] };
    }

    let warmth = 0, contrast = 0, clarity = 0, shadowLift = 0, saturation = 0;

    for (const pair of pairs) {
      warmth += (pair.edits.temperature - 5500) / 5000; // Normalize around neutral
      contrast += pair.edits.contrast / 100;
      clarity += pair.edits.clarity / 100;
      shadowLift += pair.edits.shadows / 100;
      saturation += pair.edits.vibrance / 100;
    }

    const n = pairs.length;
    warmth /= n; contrast /= n; clarity /= n; shadowLift /= n; saturation /= n;

    // Derive mood words
    const moodWords: string[] = [];
    if (warmth > 0.1) moodWords.push('Warm');
    if (warmth < -0.1) moodWords.push('Cool');
    if (contrast > 0.15) moodWords.push('High contrast');
    if (contrast < -0.1) moodWords.push('Soft contrast');
    if (clarity > 0.2) moodWords.push('Crisp');
    if (shadowLift > 0.15) moodWords.push('Matte shadows');
    if (saturation > 0.15) moodWords.push('Vibrant');
    if (saturation < -0.1) moodWords.push('Desaturated');
    if (moodWords.length === 0) moodWords.push('Natural');

    return { warmth, contrast, clarity, shadowLift, saturation, moodWords };
  }

  /**
   * Predict edit adjustments for a new photo based on trained style.
   */
  predictEdits(imageFeatures: ImageFeatures, fingerprint: StyleFingerprint, pairCount: number): Partial<EditState> {
    const confidence = computeConfidence(pairCount);

    // Scale predictions by confidence
    const scale = confidence.score;

    return {
      temperature: 5500 + fingerprint.warmth * 5000 * scale,
      contrast: fingerprint.contrast * 100 * scale,
      clarity: fingerprint.clarity * 100 * scale,
      shadows: fingerprint.shadowLift * 100 * scale,
      vibrance: fingerprint.saturation * 100 * scale,
    };
  }

  /**
   * Apply style to a batch of photos.
   * Returns predicted edits for each photo.
   */
  async applyStyleBatch(
    photos: Array<{ id: string; features: ImageFeatures }>,
    fingerprint: StyleFingerprint,
    pairCount: number,
    onProgress?: (completed: number, total: number, photoId: string) => void,
  ): Promise<Map<string, Partial<EditState>>> {
    const results = new Map<string, Partial<EditState>>();

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const edits = this.predictEdits(photo.features, fingerprint, pairCount);
      results.set(photo.id, edits);
      onProgress?.(i + 1, photos.length, photo.id);
    }

    return results;
  }

  getConfidence(pairCount: number): SignatureAIConfidence {
    return computeConfidence(pairCount);
  }
}

export interface StyleTrainingData {
  features: ImageFeatures;
  edits: EditState;
  timestamp: number;
}

export interface StyleFingerprint {
  warmth: number;      // -1 to 1 (cold to warm)
  contrast: number;    // -1 to 1
  clarity: number;     // -1 to 1
  shadowLift: number;  // -1 to 1
  saturation: number;  // -1 to 1
  moodWords: string[];
}
