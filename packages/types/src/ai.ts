// SignatureAI feature vector — what the model sees.
// IMPORTANT: The model NEVER sees raw pixel data. Only this feature vector.
// Extracted on 64x64 downscaled image to keep batch inference under 30s/500 photos.

export interface ImageFeatures {
  luminanceHist:  Float32Array;  // 64-bin normalized histogram
  rMean: number; gMean: number; bMean: number;  // channel means, 0.0–1.0
  rStd:  number; gStd:  number; bStd:  number;  // channel standard deviations
  colorTemp:      number;        // estimated Kelvin
  contrastRatio:  number;        // p95 luminance / p5 luminance
  saturationMean: number;        // average saturation 0.0–1.0
  sharpness:      number;        // Laplacian variance estimate
}

export type SignatureAIState = 'dormant' | 'learning' | 'forming' | 'confident' | 'expert';

export interface SignatureAIConfidence {
  score: number;
  label: string;
  state: SignatureAIState;
}

export function computeConfidence(pairCount: number): SignatureAIConfidence {
  if (pairCount < 10)  return { score: 0,                          label: 'Your style is being noticed',  state: 'dormant'   };
  if (pairCount < 30)  return { score: (pairCount - 10) / 20,      label: 'Your eye is forming',          state: 'learning'  };
  if (pairCount < 50)  return { score: 0.5 + (pairCount - 30) / 40, label: 'Your style is defined',       state: 'forming'   };
  if (pairCount < 100) return { score: 0.75 + (pairCount - 50) / 200, label: 'SignatureAI knows your eye', state: 'confident' };
  return                       { score: 1.0,                        label: 'Your eye is fully known',      state: 'expert'    };
}
