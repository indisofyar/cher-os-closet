// Display options that were design-time tweaks on the canvas.
export type Print = 'leopard' | 'plaid' | 'lavender';
export type Shell = 'white' | 'aqua' | 'lilac' | 'orange' | 'lime' | 'pink';
export type PocketShell = 'lilac' | 'pink' | 'white' | 'aqua';

export const DISPLAY = {
  crt: true,
  print: 'leopard' as Print,
  shell: 'white' as Shell,
  /** Colour of the handheld used on phones. */
  pocketShell: 'lilac' as PocketShell,
};

export const printClass = (p: Print) => (p === 'plaid' ? 'plaid' : p === 'lavender' ? 'lav' : 'leo');
