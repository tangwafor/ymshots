import type { EditState } from '@ymshots/types';
import type { RenderResult } from './types';
import { RawDecoder } from './decoder';
import { EditPipeline } from './pipeline';

/**
 * FinalPass Export Engine — Batch export with format, quality, ICC, metadata.
 *
 * Exports are always from the non-destructive edit pipeline.
 * Original files are NEVER modified.
 *
 * Supported: JPEG, TIFF, PNG, WEBP, HEIF
 * Target: < 1s per 24MP JPEG export
 */
export class ExportEngine {
  private decoder = new RawDecoder();
  private pipeline = new EditPipeline();

  async exportPhoto(options: {
    inputPath: string;
    outputPath: string;
    edits: EditState;
    format: 'jpeg' | 'tiff' | 'png' | 'webp' | 'heif';
    quality: number;        // 0–100
    longEdgePx?: number;    // Max dimension (null = original size)
    colorProfile: string;   // 'sRGB', 'Adobe RGB', 'ProPhoto RGB'
    sharpening?: number;    // 0–100
    stripMetadata: boolean;
    watermarkText?: string;
    artistName: string;
    includeYmShotsBranding: boolean;
  }): Promise<{ outputPath: string; width: number; height: number; sizeBytes: number }> {
    const sharp = require('sharp');

    // 1. Decode source
    const decoded = await this.decoder.decode(options.inputPath);

    // 2. Apply edits (non-destructive pipeline)
    const rendered = this.pipeline.apply(decoded, options.edits);

    // 3. Create sharp instance from RGBA buffer
    let image = sharp(Buffer.from(rendered.data.buffer), {
      raw: { width: rendered.width, height: rendered.height, channels: 4 },
    });

    // 4. Resize if longEdgePx specified
    if (options.longEdgePx) {
      image = image.resize(options.longEdgePx, options.longEdgePx, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // 5. Sharpening
    if (options.sharpening && options.sharpening > 0) {
      const sigma = 0.5 + (options.sharpening / 100) * 2;
      image = image.sharpen(sigma);
    }

    // 6. Watermark (simple text overlay)
    if (options.watermarkText) {
      const svgText = `<svg width="${rendered.width}" height="${rendered.height}">
        <text x="50%" y="95%" text-anchor="middle" font-size="24" fill="rgba(255,255,255,0.3)" font-family="sans-serif">${options.watermarkText}</text>
      </svg>`;
      image = image.composite([{ input: Buffer.from(svgText), gravity: 'southeast' }]);
    }

    // 7. ICC color profile
    if (options.colorProfile === 'sRGB') {
      image = image.toColorspace('srgb');
    }

    // 8. Metadata
    if (!options.stripMetadata) {
      const exifData: Record<string, string> = {
        Artist: options.artistName,
        Copyright: `© ${new Date().getFullYear()} ${options.artistName}`,
      };
      if (options.includeYmShotsBranding) {
        exifData.Software = 'YmShotS 1.0 by ta-tech';
      }
      image = image.withMetadata({ exif: { IFD0: exifData } });
    } else {
      image = image.withMetadata(false as any);
    }

    // 9. Format + write
    switch (options.format) {
      case 'jpeg':
        image = image.jpeg({ quality: options.quality, mozjpeg: true });
        break;
      case 'tiff':
        image = image.tiff({ quality: options.quality, compression: 'lzw' });
        break;
      case 'png':
        image = image.png({ compressionLevel: Math.round((100 - options.quality) / 11) });
        break;
      case 'webp':
        image = image.webp({ quality: options.quality });
        break;
      case 'heif':
        image = image.heif({ quality: options.quality });
        break;
    }

    const result = await image.toFile(options.outputPath);

    return {
      outputPath: options.outputPath,
      width: result.width,
      height: result.height,
      sizeBytes: result.size,
    };
  }

  /**
   * Batch export — processes multiple photos sequentially.
   * Fires progress callback after each photo.
   */
  async exportBatch(
    jobs: Array<{
      inputPath: string;
      outputPath: string;
      edits: EditState;
    }>,
    options: {
      format: 'jpeg' | 'tiff' | 'png' | 'webp' | 'heif';
      quality: number;
      longEdgePx?: number;
      colorProfile: string;
      sharpening?: number;
      stripMetadata: boolean;
      watermarkText?: string;
      artistName: string;
      includeYmShotsBranding: boolean;
    },
    onProgress: (completed: number, total: number, currentFile: string) => void,
  ): Promise<{ total: number; succeeded: number; failed: number }> {
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      try {
        await this.exportPhoto({
          ...options,
          inputPath: job.inputPath,
          outputPath: job.outputPath,
          edits: job.edits,
        });
        succeeded++;
      } catch (err) {
        console.error(`Export failed for ${job.inputPath}:`, err);
        failed++;
      }
      onProgress(i + 1, jobs.length, job.outputPath);
    }

    return { total: jobs.length, succeeded, failed };
  }
}
