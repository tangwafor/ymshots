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

  try {
    const { pollUrl } = JSON.parse(event.body || '{}');
    if (!pollUrl) return { statusCode: 400, headers, body: '{"error":"No pollUrl"}' };

    const res = await fetch(pollUrl, {
      headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` },
    });
    const result = await res.json();

    if (result.status === 'succeeded' && result.output?.[0]) {
      const imgRes = await fetch(result.output[0]);
      const buffer = await imgRes.arrayBuffer();
      return { statusCode: 200, headers, body: JSON.stringify({ image: Buffer.from(buffer).toString('base64'), status: 'succeeded' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ status: result.status }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

export { handler };
