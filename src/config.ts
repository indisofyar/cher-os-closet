// Display options that were design-time tweaks on the canvas.
export type Print = 'leopard' | 'plaid' | 'lavender';
export type Shell = 'white' | 'aqua' | 'lilac' | 'orange' | 'lime' | 'pink';

export const DISPLAY = {
  crt: true,
  print: 'leopard' as Print,
  shell: 'white' as Shell,
};

export const printClass = (p: Print) => (p === 'plaid' ? 'plaid' : p === 'lavender' ? 'lav' : 'leo');
