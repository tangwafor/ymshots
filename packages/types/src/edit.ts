// EditState — the central type of the entire app.
// Every editor panel, every adjustment slider, every AI apply, every export
// reads and writes this shape.

export interface EditState {
  // Tone (RawPulse)
  exposure:       number;   // -5.0 to +5.0,   default 0
  highlights:     number;   // -100 to +100,    default 0
  shadows:        number;   // -100 to +100,    default 0
  whites:         number;   // -100 to +100,    default 0
  blacks:         number;   // -100 to +100,    default 0
  contrast:       number;   // -100 to +100,    default 0
  clarity:        number;   // -100 to +100,    default 0
  vibrance:       number;   // -100 to +100,    default 0
  saturation:     number;   // -100 to +100,    default 0

  // Color (ChromaDesk)
  temperature:    number;   // 2000–16000K,     default 5500
  tint:           number;   // -150 to +150,    default 0
  hsl:            HslAdjustments;
  toneCurve:      ToneCurve;
  colorWheels:    ColorWheels;

  // Detail
  sharpening:     number;   // 0–150,           default 0
  noiseReduction: number;   // 0–100,           default 0

  // GrainLab
  grainAmount:    number;   // 0–100,           default 0
  grainSize:      number;   // 0–100,           default 0
  grainRoughness: number;   // 0–100,           default 0
  grainLuminance: boolean;  // default true
}

export interface HslChannel {
  hue: number;
  saturation: number;
  luminance: number;
}

export interface HslAdjustments {
  red:     HslChannel;
  orange:  HslChannel;
  yellow:  HslChannel;
  green:   HslChannel;
  aqua:    HslChannel;
  blue:    HslChannel;
  purple:  HslChannel;
  magenta: HslChannel;
}

export interface ToneCurve {
  rgb:   CurvePoint[];
  red:   CurvePoint[];
  green: CurvePoint[];
  blue:  CurvePoint[];
}

export interface CurvePoint {
  x: number;  // 0–255
  y: number;  // 0–255
}

export interface ColorWheels {
  shadows:    HslChannel;
  midtones:   HslChannel;
  highlights: HslChannel;
}

const ZERO_HSL: HslChannel = { hue: 0, saturation: 0, luminance: 0 };

export const DEFAULT_HSL: HslAdjustments = {
  red: { ...ZERO_HSL }, orange: { ...ZERO_HSL },
  yellow: { ...ZERO_HSL }, green: { ...ZERO_HSL },
  aqua: { ...ZERO_HSL }, blue: { ...ZERO_HSL },
  purple: { ...ZERO_HSL }, magenta: { ...ZERO_HSL },
};

export const DEFAULT_CURVE: ToneCurve = {
  rgb:   [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  red:   [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  blue:  [{ x: 0, y: 0 }, { x: 255, y: 255 }],
};

export const DEFAULT_WHEELS: ColorWheels = {
  shadows:    { ...ZERO_HSL },
  midtones:   { ...ZERO_HSL },
  highlights: { ...ZERO_HSL },
};

export const DEFAULT_EDIT_STATE: EditState = {
  exposure: 0, highlights: 0, shadows: 0, whites: 0, blacks: 0,
  contrast: 0, clarity: 0, vibrance: 0, saturation: 0,
  temperature: 5500, tint: 0,
  hsl: DEFAULT_HSL, toneCurve: DEFAULT_CURVE, colorWheels: DEFAULT_WHEELS,
  sharpening: 0, noiseReduction: 0,
  grainAmount: 0, grainSize: 0, grainRoughness: 0, grainLuminance: true,
};
