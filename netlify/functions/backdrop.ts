import type { Handler } from '@netlify/functions';

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
    const { prompt } = JSON.parse(event.body || '{}');

    // Use Replicate's synchronous prediction API (faster, no polling needed)
    const res = await fetch('https://api.replicate.com/v1/models/bytedance/sdxl-lightning-4step/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        input: {
          prompt: `${prompt}, professional photography backdrop, high quality, detailed, beautiful lighting, no people, empty scene`,
          negative_prompt: 'people, person, face, body, text, watermark, low quality, blurry',
          width: 768,
          height: 512,
          num_inference_steps: 4,
          guidance_scale: 1.5,
        },
      }),
    });

    const result = await res.json();

    if (result.output?.[0]) {
      // Fetch the output image and convert to base64
      const imgRes = await fetch(result.output[0]);
      const buffer = await imgRes.arrayBuffer();
      return { statusCode: 200, headers, body: JSON.stringify({ image: Buffer.from(buffer).toString('base64') }) };
    }

    if (result.error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: result.error }) };
    }

    // If sync didn't work, return the prediction URL for client-side polling
    if (result.urls?.get) {
      return { statusCode: 202, headers, body: JSON.stringify({ pollUrl: result.urls.get, id: result.id }) };
    }

    return { statusCode: 500, headers, body: JSON.stringify({ error: 'No output', raw: result }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

export { handler };
