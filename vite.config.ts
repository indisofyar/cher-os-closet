import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleTryOn } from './server/tryOn.js';

/** Serves POST /api/try-on during `npm run dev`, reading GEMINI_API_KEY from .env.local. */
function tryOnApi(env: Record<string, string>): Plugin {
  return {
    name: 'cheros-try-on-api',
    configureServer(server) {
      server.middlewares.use('/api/try-on', async (req, res) => {
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const request = new Request('http://localhost/api/try-on', {
          method: req.method,
          headers: { 'content-type': req.headers['content-type'] ?? '' },
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        });
        const response = await handleTryOn(request, { apiKey: env.GEMINI_API_KEY, model: env.GEMINI_IMAGE_MODEL });
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        res.end(Buffer.from(await response.arrayBuffer()));
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tryOnApi(loadEnv(mode, process.cwd(), ''))],
  base: './',
}));
