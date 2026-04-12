import fs from 'fs';
import path from 'path';
import type { DecodedRaw, ExifData } from './types';

/**
 * RawDecoder — Decodes RAW files (NEF, CR2, ARW, DNG, RAF, ORF, etc.)
 * and standard formats (JPEG, HEIF, PNG, TIFF) into linear float32 buffers.
 *
 * Uses sharp for standard formats. RAW files use dcraw-vendored or
 * libraw bindings (to be added as native dependency).
 *
 * Target: < 2 seconds per RAW file decode.
 */
export class RawDecoder {
  private supportedRaw = new Set([
    '.nef', '.cr2', '.cr3', '.arw', '.dng', '.raf', '.orf', '.rw2', '.pef', '.srw',
  ]);
  private supportedStandard = new Set([
    '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.heif', '.heic', '.webp',
  ]);

  canDecode(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedRaw.has(ext) || this.supportedStandard.has(ext);
  }

  isRaw(filePath: string): boolean {
    return this.supportedRaw.has(path.extname(filePath).toLowerCase());
  }

  async decode(filePath: string): Promise<DecodedRaw> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();

    if (this.supportedRaw.has(ext)) {
      return this.decodeRaw(filePath);
    }

    return this.decodeStandard(filePath);
  }

  private async decodeRaw(filePath: string): Promise<DecodedRaw> {
    // In production: use libraw-node or dcraw bindings
    // For now, use sharp which can handle some RAW via libvips
    try {
      const sharp = require('sharp');
      const image = sharp(filePath);
      const metadata = await image.metadata();
      const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });

      const width = info.width;
      const height = info.height;
      const channels = info.channels;

      // Convert uint8/uint16 to float32 linear
      const pixelCount = width * height;
      const float32 = new Float32Array(pixelCount * 3);

      for (let i = 0; i < pixelCount; i++) {
        const srcIdx = i * channels;
        const dstIdx = i * 3;
        const scale = info.size > pixelCount * 6 ? 1 / 65535 : 1 / 255;
        float32[dstIdx] = data[srcIdx] * scale;
        float32[dstIdx + 1] = data[srcIdx + 1] * scale;
        float32[dstIdx + 2] = (channels >= 3 ? data[srcIdx + 2] : data[srcIdx]) * scale;
      }

      return {
        width, height, data: float32,
        bitsPerChannel: metadata.depth === 'ushort' ? 16 : 8,
        colorSpace: 'linear',
        make: metadata.exif?.Make,
        model: metadata.exif?.Model,
      };
    } catch {
      throw new Error(`RAW decode failed for ${filePath}. Install libraw bindings for full RAW support.`);
    }
  }

  private async decodeStandard(filePath: string): Promise<DecodedRaw> {
    const sharp = require('sharp');
    const image = sharp(filePath);
    const metadata = await image.metadata();
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    const pixelCount = width * height;
    const float32 = new Float32Array(pixelCount * 3);

    for (let i = 0; i < pixelCount; i++) {
      const srcIdx = i * channels;
      const dstIdx = i * 3;
      // sRGB to linear conversion (approximate gamma 2.2)
      float32[dstIdx] = Math.pow(data[srcIdx] / 255, 2.2);
      float32[dstIdx + 1] = Math.pow(data[srcIdx + 1] / 255, 2.2);
      float32[dstIdx + 2] = Math.pow((channels >= 3 ? data[srcIdx + 2] : data[srcIdx]) / 255, 2.2);
    }

    return {
      width, height, data: float32,
      bitsPerChannel: 8,
      colorSpace: 'linear',
      make: undefined,
      model: undefined,
    };
  }

  getSupportedExtensions(): string[] {
    return [...this.supportedRaw, ...this.supportedStandard];
  }
}
