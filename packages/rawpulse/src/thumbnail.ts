import type { ThumbnailOptions } from './types';

/**
 * ThumbnailGenerator — Creates fast preview thumbnails.
 * Target: < 300ms per thumbnail.
 *
 * Uses sharp for efficient resize + format conversion.
 */
export class ThumbnailGenerator {

  async generate(inputPath: string, outputPath: string, options: ThumbnailOptions): Promise<{
    width: number;
    height: number;
    size: number;
  }> {
    const sharp = require('sharp');

    const result = await sharp(inputPath)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(options.maxWidth, options.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(options.format, {
        quality: options.quality,
        mozjpeg: options.format === 'jpeg',
      })
      .toFile(outputPath);

    return {
      width: result.width,
      height: result.height,
      size: result.size,
    };
  }

  async generateBuffer(inputPath: string, options: ThumbnailOptions): Promise<Buffer> {
    const sharp = require('sharp');

    return sharp(inputPath)
      .rotate()
      .resize(options.maxWidth, options.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(options.format, {
        quality: options.quality,
      })
      .toBuffer();
  }
}
