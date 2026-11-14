export type ElementoDoCiclo = 'fogo' | 'agua' | 'ar' | 'terra';
export type CycleSigilSize = 'card' | 'child' | 'trail';

/** Same shapes as the frame runes: fire and air point up, water and earth point down; air and earth are barred. */
const TRIANGULO: Record<ElementoDoCiclo, { pontos: string; barra: boolean }> = {
  fogo: { pontos: '7,2.5 11.5,10.5 2.5,10.5', barra: false },
  ar: { pontos: '7,2.5 11.5,10.5 2.5,10.5', barra: true },
  agua: { pontos: '2.5,3.5 11.5,3.5 7,11.5', barra: false },
  terra: { pontos: '2.5,3.5 11.5,3.5 7,11.5', barra: true },
};

const LADO: Record<CycleSigilSize, number> = { trail: 10, child: 20, card: 26 };

/** Decorative alchemical triangle of an element. Colour comes from currentColor; filled = done, hollow = pending. */
export function CycleSigil({ element, size, filled = false }: { element: ElementoDoCiclo; size: CycleSigilSize; filled?: boolean }) {
  const forma = TRIANGULO[element];
  const lado = LADO[size];
  return (
    <svg
      className="cycle-sigil"
      data-element={element}
      data-size={size}
      data-filled={filled}
      width={lado}
      height={lado}
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
    >
      <polygon
        points={forma.pontos}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
      {forma.barra ? <line x1="4.4" y1="7.6" x2="9.6" y2="7.6" stroke={filled ? 'var(--cyc-sigil-barra, #0b0b12)' : 'currentColor'} strokeWidth={1.1} strokeLinecap="round" /> : null}
    </svg>
  );
}

export default CycleSigil;
