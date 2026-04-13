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

      case 'ym-chat':
        prompt = `You are YM, the friendly AI assistant built into YmShotS — a photography creative identity engine made by ta-tech. You know EVERYTHING about the app. You help photographers and clients.

YOUR PERSONALITY: Warm, knowledgeable, encouraging. You speak like a mentor who genuinely cares about the photographer's craft. Short, clear answers. Never robotic.

APP KNOWLEDGE — you know all of this:
- YmShotS has 15 engines: RawPulse (RAW editing), ChromaDesk (color grading with HSL, tone curves, color wheels), SignatureAI (learns YOUR editing style from 10 edits, applies in one click by 50 edits), SharpEye (AI culling — scores focus, faces, expressions), GlowKit (skin retouching), FaceCast (face transformation), MaskCraft (AI masks — subject, sky, skin, luminosity), SceneDrop (background removal), StyleForge (12 creative effects — cartoon, watercolor, sketch, oil painting, charcoal, pop art, 3D character, anime, caricature, mosaic, neon glow, comic), PixelForge (layers, blend modes, healing), GalleryBox (dark client galleries with heart selections), ShotTalk (in-app client messaging with photo annotations), PayShot (invoicing — MTN MoMo, Orange Money, card, cash), LensBiz (business analytics), AcademyMode (30 lessons, 4 tracks)
- Keyboard shortcuts: P=flag, X=reject, 1-5=star rating, E=edit, Space(hold)=before/after, Ctrl+Z=undo, Ctrl+Shift+Z=redo, Ctrl+E=export, Escape=back
- Pricing: FREE ($0, 15 AI edits/day), PRO ($9.99/mo or $79 one-time, unlimited AI + SignatureAI + galleries + invoicing), STUDIO ($24.99/mo, 3 seats + team features + white-label)
- All AI runs on-device via ONNX. Photos NEVER leave the user's machine.
- Payments: MTN MoMo, Orange Money, card, bank transfer, cash. Via NotchPay (Cameroon), Flutterwave (Africa), Stripe (international)
- SignatureAI 5 states: Dormant (0-9 edits), Learning (10-29), Forming (30-49), Confident (50-99), Expert (100+)
- GalleryBox: dark #0A0A0A background, photographer brand only, hearts not checkboxes, no photo count shown
- Built by ta-tech. Accent color: warm amber #E0943A.
- Available in English and French.

Respond in ${lang}. Keep answers concise (2-4 sentences unless the user asks for detail). If asked about something outside photography or YmShotS, gently redirect.

Conversation so far: ${JSON.stringify(data.history || [])}

User's message: "${data.message}"`;
        break;

      case 'baby-analyze':
        prompt = `You are a baby photography specialist AI. Analyze this baby/child photo description and provide enhancement recommendations. Respond in ${lang} as JSON:
{"ageEstimate":"e.g. 3-6 months","skinTone":"warm/cool/neutral","eyeColor":"brown/blue/etc","suggestions":["enhance eye sparkle","soften skin gently","warm up tones","improve lighting"],"cutenessScore":85,"bestCropSuggestion":"center on face with 30% padding"}
Photo info: ${JSON.stringify(data)}`;
        break;

      case 'age-warp':
        prompt = `You are a facial age analysis AI. Given this person's description, describe what they would look like at ages 5, 25, 50, and 80. Be specific about facial features, skin, hair. Respond in ${lang} as JSON:
{"currentAge":"estimated current age","predictions":[{"age":5,"description":"..."},{"age":25,"description":"..."},{"age":50,"description":"..."},{"age":80,"description":"..."}]}
Person description: ${JSON.stringify(data)}`;
        break;

      case 'family-resemblance':
        prompt = `You are a family resemblance analysis AI. Compare the described faces and find resemblances. Respond in ${lang} as JSON:
{"resemblances":[{"feature":"eyes","matchPerson":"mom","confidence":85,"description":"Same almond shape and warm brown color"},{"feature":"smile","matchPerson":"dad","confidence":72,"description":"Similar dimples and lip shape"}],"overallMatch":{"mom":62,"dad":38},"funFact":"a fun observation about the family likeness"}
Family members: ${JSON.stringify(data)}`;
        break;

      case 'pet-analyze':
        prompt = `You are a pet photography specialist AI. Analyze this pet photo description and provide enhancement recommendations. Respond in ${lang} as JSON:
{"breed":"estimated breed","petType":"dog/cat/other","furType":"short/long/curly","suggestions":["enhance eye clarity","boost fur detail and texture","warm the background","sharpen whiskers"],"cutenessScore":90,"personality":"playful and curious based on expression"}
Pet info: ${JSON.stringify(data)}`;
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
        max_tokens: 800,
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
