// "Try it on on you": sends the body photo and the chosen outfit to Gemini and returns the edited image.
// Written against the Web Request/Response API so the same code runs on Vercel and in the Vite dev server.

import { ApiError, GoogleGenAI } from '@google/genai';
import { buildTryOnPrompt } from '../src/ai/tryOnPrompt.js';
import type { Gender } from '../src/data/garments.js';

export const DEFAULT_MODEL = 'gemini-3.1-flash-image';

/** The app saves photos at up to 1200px as JPEG (a few hundred KB); this leaves headroom for PNG uploads. */
const MAX_PHOTO_CHARS = 3_000_000;
const PHOTO_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

export type TryOnEnv = { apiKey?: string; model?: string };

/** Successful body: `{ image }` (a data URL). Error body: `{ error, message }`. */
export type TryOnResponse = { image: string } | { error: TryOnError; message: string };
export type TryOnError = 'bad_request' | 'not_configured' | 'blocked' | 'busy' | 'failed';

const json = (status: number, body: TryOnResponse) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const fail = (status: number, error: TryOnError, message: string) => json(status, { error, message });

export async function handleTryOn(request: Request, env: TryOnEnv): Promise<Response> {
  if (request.method !== 'POST') return fail(405, 'bad_request', 'Use POST.');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'bad_request', 'Body must be JSON.');
  }
  const { photo, gender, top, bottom } = (body ?? {}) as Record<string, unknown>;

  if (typeof photo !== 'string' || photo.length > MAX_PHOTO_CHARS) {
    return fail(400, 'bad_request', 'Photo is missing or too big.');
  }
  const m = PHOTO_RE.exec(photo);
  if (!m) return fail(400, 'bad_request', 'Photo must be a JPEG, PNG or WebP data URL.');
  const [, mimeType, data] = m;

  if ((gender !== 'w' && gender !== 'm') || typeof top !== 'string' || typeof bottom !== 'string') {
    return fail(400, 'bad_request', 'Outfit is missing.');
  }
  const prompt = buildTryOnPrompt({ gender: gender as Gender, top, bottom });
  if (!prompt) return fail(400, 'bad_request', 'That outfit is not in the wardrobe.');

  if (!env.apiKey) return fail(500, 'not_configured', 'GEMINI_API_KEY is not set on the server.');

  const ai = new GoogleGenAI({ apiKey: env.apiKey });
  try {
    const res = await ai.models.generateContent({
      model: env.model || DEFAULT_MODEL,
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data } }, { text: prompt }] }],
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '2:3' },
      },
    });

    const parts = res.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p) => p.inlineData?.data)?.inlineData;
    if (img?.data) return json(200, { image: `data:${img.mimeType || 'image/png'};base64,${img.data}` });

    const reason = res.promptFeedback?.blockReason ?? res.candidates?.[0]?.finishReason;
    if (reason && reason !== 'STOP') {
      console.warn('[try-on] no image, reason:', reason);
      return fail(422, 'blocked', 'The stylist refused that photo. Try a different one.');
    }
    console.warn('[try-on] no image in response');
    return fail(502, 'failed', 'No image came back. Try again.');
  } catch (err) {
    if (err instanceof ApiError && err.status === 429) {
      return fail(429, 'busy', 'Too many requests right now. Try again in a minute.');
    }
    console.error('[try-on] Gemini call failed:', err instanceof ApiError ? `${err.status} ${err.message}` : err);
    return fail(502, 'failed', 'The stylist is out to lunch. Try again.');
  }
}
