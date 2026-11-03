/** Yellow plaid SVG pattern, referenced by garments as fill="url(#id)". */
export function PlaidDefs({ id, size }: { id: string; size: number }) {
  const s = size / 18;
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <rect width={size} height={size} fill="#F2C230" />
          <rect y={7 * s} width={size} height={4 * s} fill="#3a2a10" opacity=".45" />
          <rect x={7 * s} width={4 * s} height={size} fill="#3a2a10" opacity=".45" />
          <rect y={15 * s} width={size} height={1 * s} fill="#fff" opacity=".8" />
          <rect x={15 * s} width={1 * s} height={size} fill="#fff" opacity=".8" />
          <rect y={2 * s} width={size} height={1 * s} fill="#C2272D" opacity=".7" />
          <rect x={2 * s} width={1 * s} height={size} fill="#C2272D" opacity=".7" />
        </pattern>
      </defs>
    </svg>
  );
}
