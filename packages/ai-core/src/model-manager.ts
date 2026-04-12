import path from 'path';
import fs from 'fs';

/**
 * OnnxModelManager — Loads, caches, and manages ONNX models.
 * Models are stored locally in the ONNX_MODEL_DIR directory.
 */
export class OnnxModelManager {
  private modelDir: string;
  private sessions: Map<string, any> = new Map();

  constructor(modelDir?: string) {
    this.modelDir = modelDir || process.env.ONNX_MODEL_DIR || path.join(process.cwd(), 'models');
  }

  async loadModel(modelName: string): Promise<any> {
    if (this.sessions.has(modelName)) {
      return this.sessions.get(modelName);
    }

    const modelPath = path.join(this.modelDir, `${modelName}.onnx`);

    if (!fs.existsSync(modelPath)) {
      throw new Error(
        `ONNX model not found: ${modelPath}. Run "pnpm run download-models" to fetch AI models.`
      );
    }

    try {
      const ort = require('onnxruntime-node');
      const session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['CUDAExecutionProvider', 'CPUExecutionProvider'],
        graphOptimizationLevel: 'all',
      });
      this.sessions.set(modelName, session);
      return session;
    } catch (err: any) {
      // Fall back to CPU only
      const ort = require('onnxruntime-node');
      const session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['CPUExecutionProvider'],
      });
      this.sessions.set(modelName, session);
      return session;
    }
  }

  isModelAvailable(modelName: string): boolean {
    return fs.existsSync(path.join(this.modelDir, `${modelName}.onnx`));
  }

  getAvailableModels(): string[] {
    if (!fs.existsSync(this.modelDir)) return [];
    return fs.readdirSync(this.modelDir)
      .filter(f => f.endsWith('.onnx'))
      .map(f => f.replace('.onnx', ''));
  }

  async dispose() {
    for (const [name, session] of this.sessions) {
      try { await session.release(); } catch {}
    }
    this.sessions.clear();
  }
}
