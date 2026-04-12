import { OnnxModelManager } from '../model-manager';

/**
 * CleanSlate — Object Removal with Contextual AI Fill
 * Uses LaMa inpainting model to remove objects and fill with context.
 */
export class CleanSlateEngine {
  private models: OnnxModelManager;

  constructor(models: OnnxModelManager) {
    this.models = models;
  }

  async removeObject(imageBuffer: Buffer, width: number, height: number, mask: Uint8Array): Promise<Buffer> {
    if (!this.models.isModelAvailable('cleanslate-lama')) {
      throw new Error('LaMa inpainting model not available. Download models first.');
    }

    const session = await this.models.loadModel('cleanslate-lama');
    const ort = require('onnxruntime-node');
    const size = 512;

    // Preprocess image + mask
    const imgInput = new Float32Array(3 * size * size);
    const maskInput = new Float32Array(1 * size * size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const srcX = Math.floor(x * width / size);
        const srcY = Math.floor(y * height / size);
        const srcIdx = (srcY * width + srcX) * 3;
        const dstIdx = y * size + x;

        imgInput[dstIdx] = (imageBuffer[srcIdx] || 0) / 255;
        imgInput[size * size + dstIdx] = (imageBuffer[srcIdx + 1] || 0) / 255;
        imgInput[2 * size * size + dstIdx] = (imageBuffer[srcIdx + 2] || 0) / 255;
        maskInput[dstIdx] = (mask[srcY * width + srcX] || 0) / 255;
      }
    }

    const imgTensor = new ort.Tensor('float32', imgInput, [1, 3, size, size]);
    const maskTensor = new ort.Tensor('float32', maskInput, [1, 1, size, size]);
    const results = await session.run({ image: imgTensor, mask: maskTensor });
    const output = results.output.data;

    // Reconstruct output buffer at original resolution
    const result = Buffer.from(imageBuffer);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x] > 128) {
          const srcX = Math.floor(x * size / width);
          const srcY = Math.floor(y * size / height);
          const srcIdx = srcY * size + srcX;
          const dstIdx = (y * width + x) * 3;
          result[dstIdx] = Math.round(output[srcIdx] * 255);
          result[dstIdx + 1] = Math.round(output[size * size + srcIdx] * 255);
          result[dstIdx + 2] = Math.round(output[2 * size * size + srcIdx] * 255);
        }
      }
    }

    return result;
  }
}
