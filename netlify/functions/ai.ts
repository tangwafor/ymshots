import type { Handler } from '@netlify/functions';

/**
 * YmShotS AI Function — Claude API proxy for all AI features.
 * Handles: photo captions, ShotTalk smart replies, Academy lesson generation,
 * StyleForge effect descriptions, invoice drafting.
 */
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{"error":"POST only"}' };
  if (!ANTHROPIC_KEY) return { statusCode: 500, headers, body: '{"error":"AI not configured"}' };

  try {
    const { action, data, locale } = JSON.parse(event.body || '{}');
    const lang = locale === 'fr' ? 'French' : 'English';
    let prompt = '';

    switch (action) {
      case 'caption':
        prompt = `You are a professional photography assistant. Describe this photo in 1-2 sentences for a client gallery. Be warm and professional. Respond in ${lang}. Photo details: ${JSON.stringify(data)}`;
        break;

      case 'smart-reply':
        prompt = `You are a professional photographer's assistant. Suggest 3 short, warm reply options to this client message. Keep each under 30 words. Respond in ${lang} as JSON array of strings. Client message: "${data.message}"`;
        break;

      case 'lesson':
        prompt = `You are a photography educator. Generate a lesson about "${data.topic}" for ${data.level} level photographers. Include: intro (1 sentence), 4 steps with clear instructions, and a pro tip. Respond in ${lang} as JSON: {"intro":"...","steps":[{"title":"...","instruction":"..."}],"tip":"..."}`;
        break;

      case 'coach-tip':
        prompt = `You are a photography coach. Give a brief, helpful tip about "${data.tool}" for a photographer who just started using it. 2 sentences max. Respond in ${lang}.`;
        break;

      case 'invoice-draft':
        prompt = `You are a photography business assistant. Draft invoice line item descriptions for a ${data.shootType} shoot. Include 2-3 line items with descriptions and suggested prices in ${data.currency}. Respond in ${lang} as JSON array: [{"description":"...","suggestedPrice":number}]`;
        break;

      case 'style-describe':
        prompt = `You are an art director. Describe what the "${data.effect}" effect will look like when applied to a photo. One vivid sentence. Respond in ${lang}.`;
        break;

      default:
        return { statusCode: 400, headers, body: '{"error":"Unknown action"}' };
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const result = await res.json();
    const text = result.content?.[0]?.text || '';

    return { statusCode: 200, headers, body: JSON.stringify({ result: text }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

export { handler };
