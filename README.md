# Cher's Closet (CherOS)

A virtual closet manager in a retro CRT-monitor look. This first web build covers the four confirmed screens from the design canvas:

| Route | Screen | What works |
| --- | --- | --- |
| `#/` | Welcome / main menu | Intro copy, "I'm clueless" goes to setup |
| `#/setup` | Body photo | Upload a photo, or take one with the webcam (3-2-1 countdown). Saved in the browser. |
| `#/wardrobe` | Dressing room | Women's/men's wardrobe, cycle tops and bottoms, Try It On shows an outfit check (TOTALLY / HMMM / AS IF!), Auto Style |
| `#/try-on` | Outfit on you | Opened from "Try it on on you": generates a photo of you in that outfit (Gemini), then cycles the preset looks; Wear It saves a look |

## Run it

```bash
npm install
npm run dev
```

### AI try-on (Gemini)

`POST /api/try-on` dresses the user's body photo in the chosen outfit using Gemini's image model. The Gemini key lives on the server only.

- **Vercel:** add `GEMINI_API_KEY` under Project → Settings → Environment Variables. `GEMINI_IMAGE_MODEL` is optional (default `gemini-3.1-flash-image`).
- **Local:** put `GEMINI_API_KEY=...` in `.env.local`. `npm run dev` serves the same endpoint through a Vite middleware.

Request body: `{ photo: <data URL>, gender: 'w' | 'm', top: <garment name>, bottom: <garment name> }`. Garment names must be in `src/data/garments.ts`, and shoes are picked automatically. The response is `{ image: <data URL> }` or `{ error, message }`. The prompt is in `src/ai/tryOnPrompt.ts`, and the handler is in `server/tryOn.ts`.

`npm run build` type-checks and writes a static site to `dist/`. Hash routing means it can be hosted on any static host.

## Layout

- `src/screens/`: one component per screen
- `src/components/Monitor.tsx`: the shared monitor shell (header, CRT overlay, chin, stand)
- `src/data/garments.ts`: wardrobe catalogue, outfit rules and try-on looks
- `src/state/AppState.tsx`: body photo and saved outfits, persisted to `localStorage`
- `src/ai/tryOnPrompt.ts`: garment descriptions and the Gemini try-on prompt
- `server/tryOn.ts` + `api/try-on.ts`: the try-on server function (Vercel)
- `src/config.ts`: display options (CRT overlay, side print, shell colour)
