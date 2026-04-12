/**
 * AI Core — On-device inference via ONNX Runtime.
 * ALL AI runs locally. Photos NEVER leave the user's machine.
 *
 * 7 engines:
 * - SharpEye:    Focus, blink, expression scoring (cull AI)
 * - FaceCast:    Face transformation (age, reshape, gender)
 * - GlowKit:    Skin smooth, blemish, teeth, eyes, contour
 * - MaskCraft:   Subject, sky, skin, luminosity masks
 * - SceneDrop:   Background removal + replacement
 * - CleanSlate:  Object removal with contextual AI fill
 * - HeadshotAI:  Studio-quality headshots from any photo
 */

export { SharpEyeEngine } from './sharp-eye/engine';
export { FaceCastEngine } from './face-cast/engine';
export { GlowKitEngine } from './glow-kit/engine';
export { MaskCraftEngine } from './mask-craft/engine';
export { SceneDropEngine } from './scene-drop/engine';
export { CleanSlateEngine } from './clean-slate/engine';
export { HeadshotAIEngine } from './headshot-ai/engine';
export { SignatureAIEngine } from './signature-ai/engine';
export { OnnxModelManager } from './model-manager';

export { computeConfidence, type SignatureAIConfidence, type SignatureAIState } from '@ymshots/types';
