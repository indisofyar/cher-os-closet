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

/**
 * Poses for the generated photo. One is picked at random for each try-on so the
 * wardrobe screen doesn't show the same stiff stance every time. Every pose keeps
 * the whole body, head to toe, in frame and facing roughly towards the camera.
 */
export const POSES: string[] = [
  // The signature wardrobe-computer pose, straight out of the classic 90s teen-movie closet scene.
  'the classic 90s wardrobe-computer pose: standing facing the camera with knees together and feet a little apart, toes turned slightly inwards; both arms held out and down at about 30 degrees from the body, elbows straight, wrists flexed so the hands flare outwards with fingers spread like showing off the outfit; head tilted slightly, a sweet, happy smile',
  'a happy skip: caught mid-skip, one knee lifted with the foot kicked up behind, arms swinging loosely, laughing with a big genuine grin',
  'a joyful twirl: body turned three-quarters, weight on one leg with the other heel kicked up behind, both arms out to the sides, laughing',
  'a little happy dance: hips swaying to one side, elbows bent and fists bopping at chest height, one heel lifted, beaming',
  'a jump for joy: caught mid-air, feet off the ground with knees bent and heels kicked back, both arms flung up overhead, big open-mouthed smile (keep the feet inside the frame)',
  'a giggly moment: leaning forward slightly mid-laugh, one hand raised near the mouth, knees turned in, eyes crinkled with delight',
  'an excited "ta-da!": both arms thrown open wide with palms up as if showing off the outfit, one foot popped up behind, huge delighted smile',
  'a chatty 90s phone call: one hand holding an imaginary chunky phone to the ear, the other hand flung out mid-gossip, one foot popped up behind, gasping and laughing',
  'a cheerful wave: one arm raised high waving hello at the camera, the other hand on the hip, feet apart, a big friendly grin',
  'a peace-sign pose: one hand throwing a peace sign beside a smiling face, the other hand on the hip, one knee bent in, playful and happy',
  'a shopping-spree celebration: both fists pumped up in excitement, one knee lifted, as if just found the perfect outfit, beaming with joy',
  'a happy hop: bouncing on the toes with both hands clasped together under the chin, shoulders raised in excitement, a huge smile',
];

/** The signature pose comes up more often than the others (about 1 in 4 try-ons). */
export function pickPose(random = Math.random): string {
  if (random() < 0.25) return POSES[0];
  return POSES[1 + Math.floor(random() * (POSES.length - 1))];
}

export type TryOnOutfit = { gender: Gender; top: string; bottom: string };

/**
 * Returns the prompt for an outfit, or null if the outfit isn't in the wardrobe.
 * Only catalogue garments are accepted, so the server never forwards free text to the model.
 */
export function buildTryOnPrompt({ gender, top, bottom }: TryOnOutfit, pose = pickPose()): string | null {
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
    // Setup only asks for a head-and-shoulders / top-half photo, so the rest of the body has to be filled in.
    'The photo may only show the top half of their body; if so, extend them into a full figure with legs and feet that match their build and proportions naturally.',
    // Clothes
    `Outfit: ${clothes}. Remove the clothes they are currently wearing and replace them with this outfit only.`,
    // Pose: varies per try-on so it feels alive, not stiff
    `Pose: ${pose}. The mood is always happy, warm and fun: a genuine smile or laugh, playful candid energy, like they're having the best day. Not stiff, not serious, not a moody high-fashion model pose: no pouting, smouldering or blank expressions. Re-pose the person fully; do not copy the pose from the original photo.`,
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
