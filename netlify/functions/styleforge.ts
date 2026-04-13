import type { Handler } from '@netlify/functions';

/**
 * StyleForge AI Function — transforms photos into artistic styles
 * using Hugging Face Inference API (free) or Replicate (paid, better quality).
 *
 * Each effect is a Stable Diffusion img2img prompt with specific parameters.
 */
const HF_TOKEN = process.env.HF_TOKEN || '';
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || '';

// Style prompts for SDXL img2img
const STYLE_PROMPTS: Record<string, { prompt: string; negPrompt: string; strength: number }> = {
  cartoon: {
    prompt: 'cartoon illustration, bold outlines, flat vivid colors, Disney Pixar style, clean lines, cel shaded, high quality digital art',
    negPrompt: 'photo, realistic, blurry, ugly, deformed',
    strength: 0.65,
  },
  comic: {
    prompt: 'comic book art, halftone dots, bold black ink outlines, Ben-Day dots, Marvel comic style, high contrast, dramatic shadows',
    negPrompt: 'photo, realistic, blurry, soft',
    strength: 0.7,
  },
  watercolor: {
    prompt: 'beautiful watercolor painting, soft washes, wet on wet technique, paper texture, translucent colors, artistic, museum quality',
    negPrompt: 'photo, digital, sharp edges, harsh',
    strength: 0.6,
  },
  oil: {
    prompt: 'oil painting on canvas, thick impasto brushstrokes, rich deep colors, classical fine art, museum quality, Rembrandt lighting',
    negPrompt: 'photo, digital, flat, smooth',
    strength: 0.6,
  },
  pencil: {
    prompt: 'detailed pencil sketch on paper, graphite drawing, fine crosshatching, shading, artistic illustration, notebook paper, hand drawn',
    negPrompt: 'color, photo, digital, blurry',
    strength: 0.7,
  },
  charcoal: {
    prompt: 'charcoal drawing on textured paper, deep blacks, dramatic contrast, fine art, expressive strokes, smudged edges, gallery quality',
    negPrompt: 'color, photo, digital, clean',
    strength: 0.7,
  },
  popart: {
    prompt: 'Andy Warhol pop art, bold flat colors, screen print style, neon pink yellow cyan, high contrast, graphic design, iconic',
    negPrompt: 'photo, realistic, muted colors, blurry',
    strength: 0.75,
  },
  '3d': {
    prompt: 'Pixar 3D character render, smooth clay-like skin, big expressive eyes, ambient occlusion, soft studio lighting, cute, high quality 3D',
    negPrompt: 'photo, 2D, flat, ugly, deformed',
    strength: 0.6,
  },
  anime: {
    prompt: 'anime illustration, Japanese animation style, clean lines, big expressive eyes, colorful, Studio Ghibli quality, beautiful',
    negPrompt: 'photo, realistic, ugly, deformed, western',
    strength: 0.65,
  },
  caricature: {
    prompt: 'caricature illustration, exaggerated facial features, humorous, big head small body, editorial cartoon style, colorful, funny',
    negPrompt: 'photo, realistic, normal proportions',
    strength: 0.7,
  },
  mosaic: {
    prompt: 'Roman mosaic tile art, small colored stone tiles, ancient Mediterranean style, detailed tilework, museum artifact',
    negPrompt: 'photo, smooth, digital, modern',
    strength: 0.65,
  },
  neon: {
    prompt: 'neon glow art, glowing neon outlines on dark background, cyberpunk, synthwave, electric blue and pink and orange neon lights',
    negPrompt: 'daylight, bright background, muted, realistic',
    strength: 0.7,
  },
};

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{"error":"POST only"}' };

  try {
    const { effect, imageBase64, intensity } = JSON.parse(event.body || '{}');
    const style = STYLE_PROMPTS[effect];
    if (!style) return { statusCode: 400, headers, body: '{"error":"Unknown effect"}' };

    const strength = Math.min(0.9, style.strength * (intensity || 1));

    // Try Replicate first (better quality), fall back to Hugging Face (free)
    let resultBase64 = '';

    if (REPLICATE_TOKEN) {
      resultBase64 = await runReplicate(imageBase64, style.prompt, style.negPrompt, strength);
    } else if (HF_TOKEN) {
      resultBase64 = await runHuggingFace(imageBase64, style.prompt, strength);
    } else {
      return { statusCode: 500, headers, body: '{"error":"No AI provider configured. Add HF_TOKEN or REPLICATE_API_TOKEN to env vars."}' };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ image: resultBase64 }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

async function runReplicate(imageBase64: string, prompt: string, negPrompt: string, strength: number): Promise<string> {
  // Create prediction
  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf', // SDXL img2img
      input: {
        image: `data:image/jpeg;base64,${imageBase64}`,
        prompt,
        negative_prompt: negPrompt,
        prompt_strength: strength,
        num_inference_steps: 20,
        guidance_scale: 7.5,
      },
    }),
  });
  const prediction = await createRes.json();

  // Poll for result (max 30 seconds)
  const id = prediction.id;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` },
    });
    const result = await pollRes.json();
    if (result.status === 'succeeded' && result.output?.[0]) {
      // Fetch the output image and convert to base64
      const imgRes = await fetch(result.output[0]);
      const buffer = await imgRes.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    }
    if (result.status === 'failed') throw new Error('Replicate prediction failed');
  }
  throw new Error('Replicate timeout');
}

async function runHuggingFace(imageBase64: string, prompt: string, strength: number): Promise<string> {
  const res = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        image: imageBase64,
        strength,
        guidance_scale: 7.5,
        num_inference_steps: 20,
      },
    }),
  });

  if (!res.ok) {
    // HF free tier might be loading the model
    const err = await res.text();
    if (err.includes('loading')) throw new Error('Model loading, try again in 30 seconds');
    throw new Error(`HuggingFace error: ${err}`);
  }

  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

export { handler };
