// Builds the image-generation prompt for "Try it on on you".
// Shared by the browser and the /api/try-on server function, so it must stay free of DOM code.

import { WARDROBE, pickShoes, type Gender } from '../data/garments.js';

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
    'Edit this photo of a person so they are wearing a new outfit, and restyle the whole picture as a digitised photo inside a mid-1990s home-computer wardrobe program.',
    // Identity
    'Keep the same person: identical face, hair, skin tone, body shape and proportions. Do not change who they are or make them look like anyone else.',
    // Clothes
    `Outfit: ${clothes}. Remove the clothes they are currently wearing and replace them with this outfit only.`,
    // Pose and framing, like a paper doll in a dress-up program
    'Pose them like a paper doll in a dress-up game: standing straight and facing the camera, feet together with toes slightly turned out, arms held a little away from the body with relaxed open hands, a slight smile.',
    'Full body, head to toe, nothing cropped. The figure is centred and fills almost the full height of a tall portrait frame, with only a small margin above the head and below the feet.',
    // Backdrop: must be flat so it blends into the app's white panel
    'Background: one flat, even, pure bright white (#FFFFFF) from edge to edge, like a cut-out pasted on a white page. No floor, no horizon line, no gradient, no vignette, no shadow on the background, no props.',
    // The film look
    'Image style: a 1995 low-resolution digitised photograph, as if captured with an early video capture card and filmed off a CRT monitor.',
    'Soft and slightly blurry with low detail, gentle VHS colour bleed and chroma smear around edges, faint interlaced scan lines, mild glow on highlights.',
    'Bright, flat, over-lit studio lighting with no hard shadows; warm, saturated colours (golden yellows, rosy skin); slightly lifted blacks.',
    'It should look like a mid-90s teen-movie wardrobe computer screen, not a modern photograph: no sharp detail, no HDR, no depth-of-field blur.',
    'No text, no logos, no borders, no frames, no user interface elements.',
  ].join(' ');
}
