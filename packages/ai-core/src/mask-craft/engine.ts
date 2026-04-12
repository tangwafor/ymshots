import { OnnxModelManager } from '../model-manager';

/**
 * MaskCraft — AI Segmentation Masks
 * Subject, sky, skin, luminosity, gradient, brush, AI custom masks.
 * Uses U2-Net / SAM-style segmentation via ONNX.
 */
export class MaskCraftEngine {
  private models: OnnxModelManager;

  constructor(models: OnnxModelManager) {
    this.models = models;
  }

  async detectSubject(imageBuffer: Buffer, width: number, height: number): Promise<MaskResult> {
    return this.runSegmentation('maskcraft-subject', imageBuffer, width, height);
  }

  async detectSky(imageBuffer: Buffer, width: number, height: number): Promise<MaskResult> {
    return this.runSegmentation('maskcraft-sky', imageBuffer, width, height);
  }

  async detectSkin(imageBuffer: Buffer, width: number, height: number): Promise<MaskResult> {
    // Skin detection via color thresholding in YCbCr space (no model needed)
    const mask = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = imageBuffer[i * 3], g = imageBuffer[i * 3 + 1], b = imageBuffer[i * 3 + 2];
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.169 * r - 0.331 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.419 * g - 0.081 * b;
      mask[i] = (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) ? 255 : 0;
    }
    return { mask, width, height, type: 'SKIN' };
  }

  async createLuminosityMask(imageBuffer: Buffer, width: number, height: number, range: 'shadows' | 'midtones' | 'highlights'): Promise<MaskResult> {
    const mask = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = imageBuffer[i * 3], g = imageBuffer[i * 3 + 1], b = imageBuffer[i * 3 + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      switch (range) {
        case 'shadows':    mask[i] = Math.round(Math.max(0, 1 - lum / 85) * 255); break;
        case 'midtones':   mask[i] = Math.round(Math.max(0, 1 - Math.abs(lum - 128) / 64) * 255); break;
        case 'highlights': mask[i] = Math.round(Math.max(0, (lum - 170) / 85) * 255); break;
      }
    }
    return { mask, width, height, type: 'LUMINOSITY' };
  }

  async createGradientMask(width: number, height: number, direction: 'top' | 'bottom' | 'left' | 'right', feather: number): Promise<MaskResult> {
    const mask = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let t: number;
        switch (direction) {
          case 'top':    t = y / height; break;
          case 'bottom': t = 1 - y / height; break;
          case 'left':   t = x / width; break;
          case 'right':  t = 1 - x / width; break;
        }
        // Apply feather curve
        t = Math.pow(t, 1 / Math.max(0.1, feather));
        mask[y * width + x] = Math.round(t * 255);
      }
    }
    return { mask, width, height, type: 'GRADIENT' };
  }

  private async runSegmentation(modelName: string, buffer: Buffer, width: number, height: number): Promise<MaskResult> {
    if (!this.models.isModelAvailable(modelName)) {
      // Return empty mask if model not available
      return { mask: new Uint8Array(width * height), width, height, type: 'SUBJECT' };
    }

    const session = await this.models.loadModel(modelName);
    const ort = require('onnxruntime-node');
    const size = 320;
    const input = new Float32Array(3 * size * size);

    // Preprocess
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const srcX = Math.floor(x * width / size);
        const srcY = Math.floor(y * height / size);
        const srcIdx = (srcY * width + srcX) * 3;
        const dstIdx = y * size + x;
        input[dstIdx] = (buffer[srcIdx] || 0) / 255;
        input[size * size + dstIdx] = (buffer[srcIdx + 1] || 0) / 255;
        input[2 * size * size + dstIdx] = (buffer[srcIdx + 2] || 0) / 255;
      }
    }

    const tensor = new ort.Tensor('float32', input, [1, 3, size, size]);
    const results = await session.run({ input: tensor });
    const outputData = results.output.data;

    // Upscale mask back to original dimensions
    const mask = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcX = Math.floor(x * size / width);
        const srcY = Math.floor(y * size / height);
        mask[y * width + x] = Math.round(Math.max(0, Math.min(1, outputData[srcY * size + srcX])) * 255);
      }
    }

    return { mask, width, height, type: 'SUBJECT' };
  }
}

export interface MaskResult {
  mask: Uint8Array;   // Single channel, 0-255
  width: number;
  height: number;
  type: string;
}
