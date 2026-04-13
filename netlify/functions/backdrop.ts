import type { Handler } from '@netlify/functions';

/**
 * BackdropAI — Generate exotic backgrounds via Replicate SDXL,
 * then composite the person onto the generated scene.
 */
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || '';

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{"error":"POST only"}' };
  if (!REPLICATE_TOKEN) return { statusCode: 500, headers, body: '{"error":"Replicate not configured"}' };

  try {
    const { prompt, width, height } = JSON.parse(event.body || '{}');

    // Generate background using SDXL Lightning (fast, cheap)
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b', // SDXL Lightning
        input: {
          prompt: `${prompt}, professional photography backdrop, high quality, 8k, detailed, beautiful lighting, no people, empty scene`,
          negative_prompt: 'people, person, face, body, text, watermark, low quality, blurry',
          width: Math.min(width || 1024, 1024),
          height: Math.min(height || 768, 1024),
          num_inference_steps: 4,
          guidance_scale: 1.5,
        },
      }),
    });
    const prediction = await createRes.json();

    // Poll for result
    const id = prediction.id;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` },
      });
      const result = await pollRes.json();
      if (result.status === 'succeeded' && result.output?.[0]) {
        const imgRes = await fetch(result.output[0]);
        const buffer = await imgRes.arrayBuffer();
        return { statusCode: 200, headers, body: JSON.stringify({ image: Buffer.from(buffer).toString('base64') }) };
      }
      if (result.status === 'failed') throw new Error('Generation failed');
    }
    throw new Error('Timeout');
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

export { handler };
