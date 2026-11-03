// Wardrobe catalogue and outfit rules, ported from the Dressing Room and Try-On artboards.

export type Gender = 'w' | 'm';

/** Flat-lay garment silhouettes on a 100×100 viewBox: `d` = fill shape, `d2` = detail lines. */
const SHAPES = {
  blazer: { d: 'M30 8 L42 6 L50 22 L58 6 L70 8 L88 20 L95 72 L82 74 L76 40 L76 94 L24 94 L24 40 L18 74 L5 72 L12 20 Z', d2: 'M42 6 L50 42 L58 6 M50 42 L50 94 M28 62 L40 62 M60 62 L72 62 M53 50 L53 50.5 M53 66 L53 66.5' },
  tee: { d: 'M32 12 L42 12 Q50 22 58 12 L68 12 L90 26 L82 40 L72 34 L72 92 L28 92 L28 34 L18 40 L10 26 Z', d2: 'M42 12 Q50 22 58 12' },
  knit: { d: 'M32 8 L42 8 L50 16 L58 8 L68 8 L88 20 L94 76 L82 76 L74 40 L74 94 L26 94 L26 40 L18 76 L6 76 L12 20 Z', d2: 'M42 8 L42 18 L58 18 L58 8 M26 88 L74 88 M8 70 L18 70 M82 70 L92 70 M40 30 L40 80 M60 30 L60 80' },
  turtle: { d: 'M40 2 L60 2 L60 12 L74 14 L90 26 L94 76 L82 76 L74 40 L74 94 L26 94 L26 40 L18 76 L6 76 L10 26 L26 14 L40 12 Z', d2: 'M40 7 L60 7 M40 12 L60 12' },
  skirt: { d: 'M24 14 L76 14 L78 22 L94 82 L6 82 L22 22 Z', d2: 'M22 22 L78 22 M32 22 L22 82 M41 22 L37 82 M50 22 L50 82 M59 22 L63 82 M68 22 L78 82' },
  trousers: { d: 'M24 4 L76 4 L84 96 L58 96 L50 32 L42 96 L16 96 Z', d2: 'M24 10 L76 10 M50 10 L50 30' },
  jeans: { d: 'M24 4 L76 4 L82 96 L58 96 L50 32 L42 96 L18 96 Z', d2: 'M24 10 L76 10 M30 10 Q34 22 44 20 M70 10 Q66 22 56 20' },
  maryjane: { d: 'M4 64 Q4 50 18 50 L34 50 Q46 50 46 62 L46 72 L4 72 Z M54 64 Q54 50 68 50 L84 50 Q96 50 96 62 L96 72 L54 72 Z', d2: 'M14 52 L32 58 M64 52 L82 58 M4 68 L46 68 M54 68 L96 68' },
  sneaker: { d: 'M4 66 Q8 50 20 52 L30 58 L46 62 L46 76 L4 76 Z M54 66 Q58 50 70 52 L80 58 L96 62 L96 76 L54 76 Z', d2: 'M4 71 L46 71 M54 71 L96 71 M20 56 L24 62 M70 56 L74 62' },
  boot: { d: 'M14 4 L32 4 L32 72 L46 78 L46 94 L14 94 Z M54 4 L72 4 L72 72 L86 78 L86 94 L54 94 Z', d2: 'M14 88 L46 88 M54 88 L86 88' },
  shirt: { d: 'M32 8 L42 6 L50 14 L58 6 L68 8 L88 20 L94 76 L82 76 L74 40 L74 94 L26 94 L26 40 L18 76 L6 76 L12 20 Z', d2: 'M42 6 L46 16 L50 14 L54 16 L58 6 M50 14 L50 94 M47 30 L47 30.5 M47 46 L47 46.5 M47 62 L47 62.5 M47 78 L47 78.5' },
  shorts: { d: 'M24 14 L76 14 L82 70 L56 72 L50 36 L44 72 L18 70 Z', d2: 'M24 20 L76 20 M50 20 L50 34' },
} as const;

type ShapeKey = keyof typeof SHAPES;

export type Garment = {
  name: string;
  fill: string;
  /** Formality, 1 (casual) – 4 (dressy). */
  formality: number;
  plaid: boolean;
  d: string;
  d2: string;
};

export const PLAID_FILL = 'url(#plaidY)';

const g = (shape: ShapeKey, fill: string, name: string, formality: number, plaid = false): Garment => ({
  name,
  fill,
  formality,
  plaid,
  ...SHAPES[shape],
});

export const WARDROBE: Record<Gender, { tops: Garment[]; bottoms: Garment[] }> = {
  w: {
    tops: [
      g('blazer', PLAID_FILL, 'Yellow plaid blazer', 4, true),
      g('tee', '#FFFFFF', 'White baby tee', 1),
      g('knit', '#C8A2E8', 'Lilac knit', 3),
      g('turtle', '#1F1F2E', 'Black turtleneck', 3),
    ],
    bottoms: [
      g('skirt', PLAID_FILL, 'Plaid mini skirt', 3, true),
      g('trousers', '#1F1F2E', 'Black trousers', 4),
      g('jeans', '#8FB3E0', 'Light-wash jeans', 1),
    ],
  },
  m: {
    tops: [
      g('blazer', PLAID_FILL, 'Yellow plaid blazer', 4, true),
      g('shirt', '#DDE8F6', 'Blue oxford shirt', 3),
      g('knit', '#2B3A67', 'Navy knit', 3),
      g('tee', '#FFFFFF', 'White tee', 1),
    ],
    bottoms: [
      g('trousers', PLAID_FILL, 'Plaid trousers', 4, true),
      g('jeans', '#8FB3E0', 'Light-wash jeans', 1),
      g('shorts', '#D8C39A', 'Chino shorts', 1),
    ],
  },
};

export const WARDROBE_ITEM_COUNT = Object.values(WARDROBE).reduce((n, w) => n + w.tops.length + w.bottoms.length, 0);

export function pickShoes(gender: Gender, top: Garment, bottom: Garment): Garment {
  if (bottom.formality >= 3) {
    if (gender === 'm') return g('maryjane', '#1F1F2E', 'Black loafers', 3);
    return top.plaid ? g('boot', '#F4F1E8', 'White knee boots', 3) : g('maryjane', '#1F1F2E', 'Mary Janes', 3);
  }
  return g('sneaker', '#FFFFFF', 'White sneakers', 1);
}

/** `line` is the iMac copy; `short` the shorter handheld copy. */
export type Verdict = { label: 'TOTALLY' | 'AS IF!' | 'HMMM'; bg: string; fg: string; line: string; short: string };

export const VERDICT_STYLE = {
  TOTALLY: { bg: '#F2C230', fg: '#15143F' },
  'AS IF!': { bg: '#E0245E', fg: '#FFFFFF' },
  HMMM: { bg: '#ABA7F2', fg: '#15143F' },
} as const;

export function outfitCheck(gender: Gender, top: Garment, bottom: Garment): Verdict {
  const spread = Math.abs(top.formality - bottom.formality);
  if (top.plaid && bottom.plaid)
    return {
      label: 'TOTALLY',
      ...VERDICT_STYLE.TOTALLY,
      line: 'Matching plaid set. Iconic. Do not change a thing.',
      short: 'Matching plaid set. Iconic. Do not change a thing.',
    };
  if (spread >= 3)
    return {
      label: 'AS IF!',
      ...VERDICT_STYLE['AS IF!'],
      line: `${top.name} with ${bottom.name.toLowerCase()}? Formality clash. Try the ${gender === 'm' ? 'navy' : 'lilac'} knit.`,
      short: `Formality clash. Try the ${gender === 'm' ? 'navy' : 'lilac'} knit.`,
    };
  if (spread === 2)
    return {
      label: 'HMMM',
      ...VERDICT_STYLE.HMMM,
      line: 'Close. One notch dressier on the bottom and it sings.',
      short: 'Close. One notch dressier on the bottom and it sings.',
    };
  return {
    label: 'TOTALLY',
    ...VERDICT_STYLE.TOTALLY,
    line: `Love. The ${top.name.toLowerCase()} and ${bottom.name.toLowerCase()} are basically best friends.`,
    short: 'These two are basically best friends.',
  };
}

// ---------- Try-on looks (garments dressed on the body figure, 120×240 viewBox) ----------

const ON = {
  tee: 'M50 40 L70 40 L70 104 L50 104 Z',
  jacket: 'M46 40 L74 40 Q86 42 88 50 L95 112 L86 114 L80 66 L80 128 L40 128 L40 66 L34 114 L25 112 L32 50 Q34 42 46 40 Z',
  lapels: 'M52 40 L60 72 L68 40 M60 72 L60 128 M44 104 L54 104 M66 104 L76 104',
  knit: 'M46 38 L74 38 Q86 42 88 50 L95 114 L86 116 L80 66 L80 126 L40 126 L40 66 L34 116 L25 114 L32 50 Q34 42 46 38 Z',
  knitRib: 'M40 120 L80 120 M27 108 L34 108 M86 108 L93 108 M52 38 Q60 46 68 38',
  turtle: 'M53 28 L67 28 L67 40 Q84 42 88 50 L95 114 L86 116 L80 66 L80 126 L40 126 L40 66 L34 116 L25 114 L32 50 Q36 42 53 40 Z',
  turtleRib: 'M53 33 L67 33 M53 37 L67 37',
  skirt: 'M40 124 L80 124 L87 162 L33 162 Z',
  pleats: 'M40 130 L80 130 M48 130 L44 162 M56 130 L55 162 M64 130 L65 162 M72 130 L76 162',
  socks: 'M44 172 L55 172 L54.5 220 L44.5 220 Z M65 172 L76 172 L75.5 220 L65.5 220 Z',
  boots: 'M43 218 L56 218 L58 230 L40 230 Z M64 218 L77 218 L80 230 L62 230 Z',
  trousers: 'M40 122 L80 122 L78 224 L65 224 L60 146 L55 224 L42 224 Z',
  creases: 'M40 128 L80 128 M60 128 L60 144',
  jeans: 'M40 122 L80 122 L77 224 L65 224 L60 146 L55 224 L43 224 Z',
  seams: 'M40 128 L80 128 M46 128 Q48 138 56 136 M74 128 Q72 138 64 136',
  sneakers: 'M42 222 L56 222 L58 231 L39 231 Z M64 222 L78 222 L81 231 L62 231 Z',
  mj: 'M43 222 L56 222 L57 231 L41 231 Z M64 222 L77 222 L79 231 L63 231 Z',
  mjStrap: 'M44 225 L55 225 M65 225 L76 225',
};

export const PLAID_ON_FILL = 'url(#plaidT)';

export type LookPart = { d: string; fill: string; d2: string };
export type Look = { id: string; name: string; verdict: Verdict['label']; line: string; short: string; parts: LookPart[] };

export const LOOKS: Look[] = [
  {
    id: 'yellow-plaid-set',
    name: 'Yellow plaid set',
    verdict: 'TOTALLY',
    line: 'Matching plaid, white knee socks, white boots. Iconic. Do not change a thing.',
    short: 'Matching plaid, knee socks, white boots. Iconic.',
    parts: [
      { d: ON.tee, fill: '#FFFFFF', d2: '' },
      { d: ON.skirt, fill: PLAID_ON_FILL, d2: ON.pleats },
      { d: ON.jacket, fill: PLAID_ON_FILL, d2: ON.lapels },
      { d: ON.socks, fill: '#FFFFFF', d2: '' },
      { d: ON.boots, fill: '#F4F1E8', d2: '' },
    ],
  },
  {
    id: 'lilac-knit-jeans',
    name: 'Lilac knit + jeans',
    verdict: 'TOTALLY',
    line: 'Soft, easy, still cute. Good for Tesco, honestly good for anywhere.',
    short: 'Soft, easy, still cute. Good for Tesco.',
    parts: [
      { d: ON.jeans, fill: '#8FB3E0', d2: ON.seams },
      { d: ON.knit, fill: '#C8A2E8', d2: ON.knitRib },
      { d: ON.sneakers, fill: '#FFFFFF', d2: '' },
    ],
  },
  {
    id: 'black-turtleneck-trousers',
    name: 'Black turtleneck + trousers',
    verdict: 'HMMM',
    line: 'Very chic, very serious. Add the plaid blazer and it sings.',
    short: 'Very chic, very serious. Add the plaid blazer.',
    parts: [
      { d: ON.trousers, fill: '#3B3B58', d2: ON.creases },
      { d: ON.turtle, fill: '#1F1F2E', d2: ON.turtleRib },
      { d: ON.mj, fill: '#1F1F2E', d2: ON.mjStrap },
    ],
  },
];
