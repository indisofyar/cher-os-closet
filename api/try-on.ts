// Vercel server function: POST /api/try-on. Logic lives in server/tryOn.ts.
import { handleTryOn } from '../server/tryOn';

export function POST(request: Request): Promise<Response> {
  return handleTryOn(request, { apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_IMAGE_MODEL });
}
