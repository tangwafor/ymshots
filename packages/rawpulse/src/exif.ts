import type { ExifData } from './types';

/**
 * ExifReader — Extracts EXIF metadata from photos.
 * Camera make/model, lens, settings, GPS, etc.
 *
 * Uses sharp metadata API (libvips underneath).
 */
export class ExifReader {

  async read(filePath: string): Promise<ExifData> {
    const sharp = require('sharp');
    const metadata = await sharp(filePath).metadata();

    const exif = metadata.exif ? this.parseExifBuffer(metadata.exif) : {};

    return {
      make: exif.Make || undefined,
      model: exif.Model || undefined,
      lens: exif.LensModel || undefined,
      focalLength: exif.FocalLength ? parseFloat(exif.FocalLength) : undefined,
      aperture: exif.FNumber ? parseFloat(exif.FNumber) : undefined,
      shutterSpeed: exif.ExposureTime || undefined,
      iso: exif.ISOSpeedRatings ? parseInt(exif.ISOSpeedRatings) : undefined,
      dateTime: exif.DateTimeOriginal || exif.DateTime || undefined,
      gpsLat: exif.GPSLatitude ? this.parseGpsCoord(exif.GPSLatitude, exif.GPSLatitudeRef) : undefined,
      gpsLng: exif.GPSLongitude ? this.parseGpsCoord(exif.GPSLongitude, exif.GPSLongitudeRef) : undefined,
      width: metadata.width || 0,
      height: metadata.height || 0,
      orientation: metadata.orientation,
    };
  }

  /**
   * Write EXIF metadata to an exported file.
   * Adds YmShotS software tag + photographer name.
   */
  async writeExportExif(filePath: string, outputPath: string, options: {
    artistName: string;
    includeYmShotsBranding: boolean;
  }): Promise<void> {
    const sharp = require('sharp');

    const exifData: Record<string, string> = {
      Artist: options.artistName,
      Copyright: `© ${new Date().getFullYear()} ${options.artistName}`,
    };

    if (options.includeYmShotsBranding) {
      exifData.Software = 'YmShotS 1.0 by ta-tech';
    }

    // sharp handles EXIF via withMetadata
    await sharp(filePath)
      .withMetadata({
        exif: {
          IFD0: exifData,
        },
      })
      .toFile(outputPath);
  }

  private parseExifBuffer(exifBuf: Buffer): Record<string, string> {
    // Simplified EXIF parsing — in production use exif-reader or piexifjs
    // sharp's metadata gives us the basics
    try {
      const ExifReader = require('exif-reader');
      return ExifReader(exifBuf);
    } catch {
      return {};
    }
  }

  private parseGpsCoord(coord: string, ref: string): number {
    // Convert DMS to decimal degrees
    const parts = coord.split(',').map(Number);
    if (parts.length < 3) return 0;
    let decimal = parts[0] + parts[1] / 60 + parts[2] / 3600;
    if (ref === 'S' || ref === 'W') decimal *= -1;
    return decimal;
  }
}
