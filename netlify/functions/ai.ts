import type { Handler } from '@netlify/functions';

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
    const { action, data, locale, imageBase64 } = JSON.parse(event.body || '{}');
    const lang = locale === 'fr' ? 'French' : 'English';
    let prompt = '';
    let useVision = false;

    switch (action) {
      case 'caption':
        prompt = `Describe this photo in 1-2 warm, professional sentences for a client gallery. Respond in ${lang}.`;
        useVision = !!imageBase64;
        break;

      case 'smart-reply':
        prompt = `Suggest 3 short, warm reply options to this client message. Each under 30 words. Respond in ${lang} as JSON array of strings. Client message: "${data.message}"`;
        break;

      case 'lesson':
        prompt = `Generate a photography lesson about "${data.topic}" for ${data.level} level. Include: intro (1 sentence), 4 steps, pro tip. Respond in ${lang} as JSON: {"intro":"...","steps":[{"title":"...","instruction":"..."}],"tip":"..."}`;
        break;

      case 'coach-tip':
        prompt = `Give a brief, helpful photography tip about "${data.tool}". 2 sentences max. Respond in ${lang}.`;
        break;

      case 'invoice-draft':
        prompt = `Draft invoice line items for a ${data.shootType} shoot. 2-3 items with prices in ${data.currency}. Respond in ${lang} as JSON array: [{"description":"...","suggestedPrice":number}]`;
        break;

      case 'style-describe':
        prompt = `Describe what the "${data.effect}" artistic effect will look like on a photo. One vivid sentence. Respond in ${lang}.`;
        break;

      case 'baby-analyze':
        prompt = `You are a baby photography specialist. Analyze this baby photo. Provide: estimated age, skin assessment, eye description, 4 specific enhancement suggestions for THIS baby, cuteness score 1-100, and best crop suggestion. Be specific to what you see. Respond in ${lang}. Keep it warm and helpful, 3-4 sentences.`;
        useVision = !!imageBase64;
        break;

      case 'age-warp':
        prompt = `Analyze this person's face. Estimate their current age. Then describe specifically how their face would look at ages 5, 25, 50, and 80 — mention skin, hair, facial structure changes. Be specific to THIS person's features. Respond in ${lang}. 4-5 sentences.`;
        useVision = !!imageBase64;
        break;

      case 'family-resemblance':
        prompt = `Analyze these family member photos. Identify specific facial feature resemblances: eyes, nose, mouth, face shape, skin tone, hair. Rate each match 0-100%. Give an overall "looks more like mom/dad" percentage. End with a fun observation. Respond in ${lang} as JSON:
{"resemblances":[{"feature":"...","matchPerson":"...","confidence":85,"description":"..."}],"overallMatch":{"parent1":60,"parent2":40},"funFact":"..."}`;
        useVision = !!imageBase64;
        break;

      case 'pet-analyze':
        prompt = `You are a pet photography specialist. Analyze this pet photo. Identify the breed/type, fur characteristics, expression. Give 4 specific enhancement suggestions for THIS pet. Rate cuteness 1-100. Describe their personality from the photo. Respond in ${lang}. 3-4 sentences, warm and fun.`;
        useVision = !!imageBase64;
        break;

      case 'ym-chat':
        prompt = `You are YM, the friendly AI assistant in YmShotS — a photography app by ta-tech. You know everything about the app.

APP: 20 engines (RawPulse, ChromaDesk, SignatureAI, SharpEye, GlowKit, FaceCast, MaskCraft, SceneDrop, StyleForge 12 effects, PixelForge, GalleryBox, ShotTalk, PayShot, LensBiz, AcademyMode, BabyGlow, AgeWarp, FamilyTree, TimeLapse, Pet Portrait). Keyboard: P=flag, X=reject, 1-5=rate, E=edit, Space=compare, Ctrl+Z=undo. Pricing: FREE $0, PRO $9.99/mo, STUDIO $24.99/mo. Payments: MTN MoMo, Orange Money, card, cash. All AI on-device. EN/FR bilingual.

Be warm, concise, helpful. Respond in ${lang}. History: ${JSON.stringify(data.history?.slice(-6) || [])}
User: "${data.message}"`;
        useVision = !!imageBase64;
        break;

      case 'photo-revive':
        prompt = `Analyze this old/damaged photo. Identify: damage type (scratches, fading, mold, tears, water damage), overall condition (1-10), whether it's black & white or color, face quality. Then give 4 specific restoration steps for THIS photo. Respond in ${lang}. 3-4 sentences.`;
        useVision = !!imageBase64;
        break;

      case 'backdrop-suggest':
        prompt = `Look at this person. Suggest 6 exotic real-world background scenes where they would look amazing. Include famous landmarks, luxury locations, and beautiful nature. Examples: "Eiffel Tower Paris sunset", "Santorini Greece blue domes", "Dubai skyline night". Respond ONLY as a JSON array of exactly 6 short strings (max 8 words each). No explanation, just the JSON array. Respond in ${lang}.`;
        useVision = !!imageBase64;
        break;

      case 'colorize':
        prompt = `This is a black and white photo. Describe the most likely natural colors for everything visible: skin tones, clothing, background, objects. Be very specific with color descriptions (e.g. "warm chestnut brown hair", "navy blue suit", "sage green grass"). Respond in ${lang}. This will guide AI colorization.`;
        useVision = !!imageBase64;
        break;

      default:
        return { statusCode: 400, headers, body: '{"error":"Unknown action"}' };
    }

    // Build messages with or without vision
    const messages: any[] = [];
    if (useVision && imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: prompt },
        ],
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: useVision ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages,
      }),
    });

    const result = await res.json();
    const text = result.content?.[0]?.text || result.error?.message || '';

    return { statusCode: 200, headers, body: JSON.stringify({ result: text }) };
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

export { handler };
