// Builds the image-generation prompt for "Try it on on you".
// Shared by the browser and the /api/try-on server function, so it must stay free of DOM code.

import { WARDROBE, pickShoes, type Gender } from '../data/garments';

/** What each garment looks like, in words the image model can draw. Keyed by `Garment.name`. */
const DESCRIBE: Record<string, string> = {
  // Women's tops
  'Yellow plaid blazer': 'a fitted yellow-and-black tartan plaid blazer with notched lapels, worn open over a fitted white top',
  'White baby tee': 'a fitted white cropped baby tee',
  'Lilac knit': 'a soft lilac knit sweater',
  'Black turtleneck': 'a fitted black ribbed turtleneck',
  // Women's bottoms
  'Plaid mini skirt': 'a yellow-and-black tartan plaid pleated mini skirt',
  'Black trousers': 'slim black tailored trousers',
  'Light-wash jeans': 'light-wash straight-leg 90s jeans',
  // Men's tops
  'Blue oxford shirt': 'a pale blue button-down oxford shirt',
  'Navy knit': 'a navy crew-neck knit sweater',
  'White tee': 'a plain white crew-neck tee',
  // Men's bottoms
  'Plaid trousers': 'yellow-and-black tartan plaid trousers',
  'Chino shorts': 'tan chino shorts',
  // Shoes (chosen by pickShoes)
  'White knee boots': 'white over-the-knee socks and white platform ankle boots',
  'Mary Janes': 'black Mary Jane shoes with white ankle socks',
  'Black loafers': 'black leather loafers',
  'White sneakers': 'chunky white sneakers',
};

export type TryOnOutfit = { gender: Gender; top: string; bottom: string };

/**
 * Returns the prompt for an outfit, or null if the outfit isn't in the wardrobe.
 * Only catalogue garments are accepted, so the server never forwards free text to the model.
 */
export function buildTryOnPrompt({ gender, top, bottom }: TryOnOutfit): string | null {
  const wardrobe = WARDROBE[gender];
  if (!wardrobe) return null;
  const t = wardrobe.tops.find((g) => g.name === top);
  const b = wardrobe.bottoms.find((g) => g.name === bottom);
  if (!t || !b) return null;
  const shoes = pickShoes(gender, t, b);

  const clothes = [DESCRIBE[t.name], DESCRIBE[b.name], DESCRIBE[shoes.name]].filter(Boolean).join(', ');

  return [
    'Edit this photo of a person so they are wearing a new outfit.',
    'Keep the same person: identical face, hair, skin tone, body shape and proportions. Do not change who they are.',
    `Outfit: ${clothes}. Remove the clothes they are currently wearing and replace them with this outfit only.`,
    'Show the whole body, head to toe with feet visible, standing straight and facing the camera with arms relaxed slightly away from the body, centred in a tall portrait frame.',
    'Plain, flat white background with no props, scenery or shadows behind them.',
    'Style: a mid-1990s home-computer fashion program. The person looks like a photographed cut-out of a catalogue model, captured from a VHS tape shown on a CRT monitor:',
    'flat even studio lighting, slightly washed-out warm colours, soft focus, faint video grain and gentle scan lines.',
    'No text, no logos, no borders, no user interface.',
  ].join(' ');
}
