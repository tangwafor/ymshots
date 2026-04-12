import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

/**
 * Netlify serverless function adapter for YmShotS API.
 * Routes /api/v1/* requests to the Fastify handlers.
 */
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '');
  const method = event.httpMethod;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Health check
  if (path === '/health' || path === '/v1/health') {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ status: 'ok', version: '1.0.0', name: 'YmShotS API', platform: 'netlify' }),
    };
  }

  // For full API functionality, the Fastify server runs on Railway/Render
  // This function handles lightweight routes and proxies to the main API
  const API_ORIGIN = process.env.API_ORIGIN || 'https://ymshots-api.up.railway.app';

  try {
    const res = await fetch(`${API_ORIGIN}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(event.headers.authorization ? { 'Authorization': event.headers.authorization } : {}),
      },
      body: method !== 'GET' && event.body ? event.body : undefined,
    });

    const body = await res.text();
    return { statusCode: res.status, headers, body };
  } catch (err: any) {
    return {
      statusCode: 502, headers,
      body: JSON.stringify({ error: { code: 'PROXY_ERROR', message: 'API temporarily unavailable' } }),
    };
  }
};

export { handler };
