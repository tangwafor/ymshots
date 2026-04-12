import { OnnxModelManager } from '../model-manager';

/**
 * SharpEye — AI Cull Engine
 * Scores photos for focus quality, face count, expression quality, and blink detection.
 * Target: < 500ms per photo
 */
export class SharpEyeEngine {
  private models: OnnxModelManager;

  constructor(models: OnnxModelManager) {
    this.models = models;
  }

  async analyze(imageBuffer: Buffer, width: number, height: number): Promise<SharpEyeResult> {
    // Downscale to 224x224 for inference
    const input = this.preprocessImage(imageBuffer, width, height, 224, 224);

    if (this.models.isModelAvailable('sharpeye-focus')) {
      const session = await this.models.loadModel('sharpeye-focus');
      const ort = require('onnxruntime-node');
      const tensor = new ort.Tensor('float32', input, [1, 3, 224, 224]);
      const results = await session.run({ input: tensor });

      return {
        sharpnessScore: this.sigmoid(results.sharpness.data[0]),
        isInFocus: results.sharpness.data[0] > 0.5,
        faceCount: Math.round(results.faces.data[0]),
        expressionScore: this.sigmoid(results.expression.data[0]),
        blinkDetected: results.blink.data[0] > 0.5,
      };
    }

    // Fallback: Laplacian variance for sharpness (no model needed)
    return this.analyzeWithoutModel(imageBuffer, width, height);
  }

  async analyzeBatch(photos: Array<{ buffer: Buffer; width: number; height: number; id: string }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Map<string, SharpEyeResult>> {
    const results = new Map<string, SharpEyeResult>();
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      results.set(photo.id, await this.analyze(photo.buffer, photo.width, photo.height));
      onProgress?.(i + 1, photos.length);
    }
    return results;
  }

  private analyzeWithoutModel(imageBuffer: Buffer, width: number, height: number): SharpEyeResult {
    // Laplacian variance estimate for sharpness
    let sumVariance = 0;
    const stride = width * 3;
    const samples = Math.min(width * height, 100000);
    const step = Math.max(1, Math.floor((width * height) / samples));

    for (let i = step; i < width * height - step; i += step) {
      const idx = i * 3;
      const lum = 0.299 * imageBuffer[idx] + 0.587 * imageBuffer[idx + 1] + 0.114 * imageBuffer[idx + 2];
      const lumLeft = 0.299 * imageBuffer[idx - 3] + 0.587 * imageBuffer[idx - 2] + 0.114 * imageBuffer[idx - 1];
      const lumRight = 0.299 * imageBuffer[idx + 3] + 0.587 * imageBuffer[idx + 4] + 0.114 * imageBuffer[idx + 5];
      const laplacian = lumLeft + lumRight - 2 * lum;
      sumVariance += laplacian * laplacian;
    }

    const variance = sumVariance / samples;
    const sharpnessScore = Math.min(1, variance / 500); // Normalize

    return {
      sharpnessScore,
      isInFocus: sharpnessScore > 0.3,
      faceCount: 0, // Can't detect without model
      expressionScore: 0,
      blinkDetected: false,
    };
  }

  private preprocessImage(buffer: Buffer, srcW: number, srcH: number, dstW: number, dstH: number): Float32Array {
    // Simple nearest-neighbor downscale + normalize to [0,1] CHW format
    const result = new Float32Array(3 * dstW * dstH);
    for (let y = 0; y < dstH; y++) {
      for (let x = 0; x < dstW; x++) {
        const srcX = Math.floor(x * srcW / dstW);
        const srcY = Math.floor(y * srcH / dstH);
        const srcIdx = (srcY * srcW + srcX) * 3;
        const dstIdx = y * dstW + x;
        result[dstIdx] = (buffer[srcIdx] || 0) / 255;                          // R
        result[dstW * dstH + dstIdx] = (buffer[srcIdx + 1] || 0) / 255;        // G
        result[2 * dstW * dstH + dstIdx] = (buffer[srcIdx + 2] || 0) / 255;    // B
      }
    }
    return result;
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
}

export interface SharpEyeResult {
  sharpnessScore: number;    // 0.0–1.0
  isInFocus: boolean;
  faceCount: number;
  expressionScore: number;   // 0.0–1.0
  blinkDetected: boolean;
}
