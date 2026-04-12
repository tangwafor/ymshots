export interface DecodedRaw {
  width: number;
  height: number;
  data: Float32Array;     // Linear RGB float32, 3 channels, range 0.0–1.0
  bitsPerChannel: number; // 12, 14, or 16 for RAW; 8 for JPEG
  colorSpace: 'linear' | 'srgb';
  iccProfile?: Buffer;
  make?: string;
  model?: string;
}

export interface RenderResult {
  width: number;
  height: number;
  data: Uint8ClampedArray;  // sRGB 8-bit RGBA for display
  format: 'rgba';
}

export interface HistogramData {
  red: Uint32Array;     // 256 bins
  green: Uint32Array;
  blue: Uint32Array;
  luminance: Uint32Array;
}

export interface ExifData {
  make?: string;
  model?: string;
  lens?: string;
  focalLength?: number;
  aperture?: number;
  shutterSpeed?: string;
  iso?: number;
  dateTime?: string;
  gpsLat?: number;
  gpsLng?: number;
  width: number;
  height: number;
  orientation?: number;
}

export interface ThumbnailOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;       // 0–100
  format: 'jpeg' | 'webp';
}
