import type { Handler, HandlerEvent } from '@netlify/functions';

/**
 * GalleryBox public route handler.
 * Serves client-facing gallery pages at /g/:slug
 */
const handler: Handler = async (event: HandlerEvent) => {
  const slug = event.path.replace('/.netlify/functions/gallery/', '').replace('/g/', '');
  const API_ORIGIN = process.env.API_ORIGIN || 'https://ymshots-api.up.railway.app';

  try {
    const res = await fetch(`${API_ORIGIN}/g/${slug}`, {
      method: event.httpMethod,
      headers: { 'Content-Type': event.httpMethod === 'POST' ? 'application/json' : 'text/html' },
      body: event.httpMethod === 'POST' && event.body ? event.body : undefined,
    });

    const body = await res.text();
    const contentType = res.headers.get('content-type') || 'text/html';

    return {
      statusCode: res.status,
      headers: { 'Content-Type': contentType },
      body,
    };
  } catch {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'text/html' },
      body: '<html><body style="background:#0A0A0A;color:#333;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><div>Gallery temporarily unavailable</div></body></html>',
    };
  }
};

export { handler };
