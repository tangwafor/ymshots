/**
 * RawPulse — RAW file decoding + non-destructive edit pipeline
 *
 * Core principle: originals are NEVER modified.
 * Every edit produces an EditState that is applied at render time.
 * The pipeline: decode → apply edits → render to canvas/buffer → export
 */

export { RawDecoder } from './decoder';
export { EditPipeline } from './pipeline';
export { HistogramCalculator } from './histogram';
export { ThumbnailGenerator } from './thumbnail';
export { ExifReader } from './exif';
export { ExportEngine } from './export';
export type { DecodedRaw, RenderResult, HistogramData, ExifData } from './types';
