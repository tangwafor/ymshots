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
  if (!REPLICATE_TOKEN) return { statusCode: 500, headers, body: '{"error":"Replicate not configured. Add REPLICATE_API_TOKEN env var."}' };

  try {
    const { prompt } = JSON.parse(event.body || '{}');

    // Step 1: Create prediction
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=8',
      },
      body: JSON.stringify({
        version: '5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f',
        input: {
          prompt: `${prompt}, professional photography backdrop, high quality, 8k, detailed, beautiful cinematic lighting, no people, empty scene, landscape`,
          negative_prompt: 'people, person, face, body, hands, text, watermark, low quality, blurry, ugly',
          width: 768,
          height: 512,
          num_inference_steps: 4,
          guidance_scale: 1.0,
          scheduler: 'DPMSolverMultistep',
        },
      }),
    });

    const prediction = await createRes.json();

    // Check if sync mode returned the result directly
    if (prediction.output?.[0]) {
      const imgRes = await fetch(prediction.output[0]);
      const buffer = await imgRes.arrayBuffer();
      return { statusCode: 200, headers, body: JSON.stringify({ image: Buffer.from(buffer).toString('base64') }) };
    }

    // If not ready yet, return poll URL for client-side polling
    if (prediction.id) {
      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({
          pollUrl: `https://api.replicate.com/v1/predictions/${prediction.id}`,
          id: prediction.id,
        }),
      };
    }

    return { statusCode: 500, headers, body: JSON.stringify({ error: prediction.detail || prediction.error || 'Unknown error', raw: prediction }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

export { handler };
