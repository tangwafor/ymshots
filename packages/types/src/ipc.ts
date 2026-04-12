// IPC bridge contract: Electron main <-> renderer
// The renderer NEVER imports rawpulse or ai-core directly.
// All heavy processing goes through this IPC bridge.

export interface YmShotsAPI {
  // System
  isMuted(): Promise<boolean>;
  getStorageDir(): Promise<string>;
  getPlatform(): Promise<'darwin' | 'win32' | 'linux'>;

  // File operations (ALL go through main — renderer has no fs access)
  importPhotos(paths: string[]): Promise<ImportResult[]>;
  readThumbnail(photoId: string): Promise<Buffer>;
  readPreview(photoId: string): Promise<Buffer>;

  // RAW processing (RawPulse — runs in main process)
  decodeRaw(filePath: string): Promise<DecodedImage>;
  applyEdits(photoId: string, edits: Record<string, unknown>): Promise<Buffer>;

  // AI (all ONNX inference in main process)
  runSharpEye(photoIds: string[]): Promise<SharpEyeResult[]>;
  runFaceDetection(photoId: string): Promise<FaceDetectionResult>;
  runSignatureAI(photoIds: string[], profileId: string): Promise<void>;

  // Export
  exportPhotos(jobId: string): Promise<void>;

  // Tethering
  startTether(shootId: string): Promise<void>;
  stopTether(): Promise<void>;

  // Events (main -> renderer)
  onTetherPhoto(callback: (data: TetherPhotoEvent) => void): () => void;
  onExportProgress(callback: (data: ExportProgressEvent) => void): () => void;
  onAIProgress(callback: (data: AIProgressEvent) => void): () => void;
}

export interface ImportResult {
  photoId: string;
  filename: string;
  success: boolean;
  error?: string;
}

export interface DecodedImage {
  width: number;
  height: number;
  data: Buffer;
  format: string;
}

export interface SharpEyeResult {
  photoId: string;
  isInFocus: boolean;
  faceCount: number;
  expressionScore: number;
  sharpnessScore: number;
}

export interface FaceDetectionResult {
  faces: Array<{
    index: number;
    box: { x: number; y: number; width: number; height: number };
    landmarks?: Record<string, { x: number; y: number }>;
  }>;
}

export interface TetherPhotoEvent {
  filename: string;
  photoId: string;
  thumbnailPath: string;
}

export interface ExportProgressEvent {
  jobId: string;
  progressPct: number;
  currentFile: string;
  completed: boolean;
}

export interface AIProgressEvent {
  operation: string;
  photoId: string;
  progressPct: number;
  completed: boolean;
}
