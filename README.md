# Cher's Closet (CherOS)

A virtual closet manager in a retro CRT-monitor look. This first web build covers the four confirmed screens from the design canvas:

| Route | Screen | What works |
| --- | --- | --- |
| `#/` | Welcome / main menu | Intro copy, "I'm clueless" goes to setup |
| `#/setup` | Body photo | Upload a photo, or take one with the webcam (3-2-1 countdown). Saved in the browser. |
| `#/wardrobe` | Dressing room | Women's/men's wardrobe, cycle tops and bottoms, Try It On shows an outfit check (TOTALLY / HMMM / AS IF!), Auto Style |
| `#/try-on` | Outfit on you | Cycle styled looks on the body figure with sticker animations; Wear It saves a look |

## Run it

```bash
npm install
npm run dev
```

`npm run build` type-checks and writes a static site to `dist/`. Hash routing means it can be hosted on any static host.

## Layout

- `src/screens/`: one component per screen
- `src/components/Monitor.tsx`: the shared monitor shell (header, CRT overlay, chin, stand)
- `src/data/garments.ts`: wardrobe catalogue, outfit rules and try-on looks
- `src/state/AppState.tsx`: body photo and saved outfits, persisted to `localStorage`
- `src/config.ts`: display options (CRT overlay, side print, shell colour)
