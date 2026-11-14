import type { ElementoDoDia } from '@/lib/momentos/elemento-do-dia';
import { TRIANGULOS, triangulosAcesos } from '@/lib/momentos/moldura';
import type { NivelVfx } from '@/lib/momentos/nivel-vfx';

const CANTOS = ['nw', 'ne', 'se', 'sw'] as const;

/** Where each alchemical triangle sits: the middle of one side. */
const LADO: Record<ElementoDoDia, 'topo' | 'direita' | 'base' | 'esquerda'> = {
  fogo: 'topo',
  agua: 'direita',
  ar: 'base',
  terra: 'esquerda',
};

/** Fire and air point up, water and earth point down; air and earth are barred. */
const TRIANGULO: Record<ElementoDoDia, { pontos: string; barra: boolean }> = {
  fogo: { pontos: '7,2.5 11.5,10.5 2.5,10.5', barra: false },
  ar: { pontos: '7,2.5 11.5,10.5 2.5,10.5', barra: true },
  agua: { pontos: '2.5,3.5 11.5,3.5 7,11.5', barra: false },
  terra: { pontos: '2.5,3.5 11.5,3.5 7,11.5', barra: true },
};

/**
 * The drawn part of the frame, pinned to the open card: four corner brackets
 * and the four alchemical triangles. The hairline is a pseudo-element in the
 * stylesheet. Colour arrives as `--runa-cor` on the card; a lit triangle
 * takes it, the others stay gold. `conquista` changes on each conquered day
 * and restarts the sequence.
 *
 * `nivel` is the effective level of VFX (reduced motion has already turned it
 * into 1). Level 3 is the premium border: a filigree filet with a light that
 * runs along it, one more ornament on each bracket, and the triangles turn
 * slowly in their discs. All of it is drawn here and animated by the
 * stylesheet, by `data-nivel`.
 */
export function RunasMoldura({ elemento, completo, conquista, nivel }: {
  elemento: ElementoDoDia | null;
  completo: boolean;
  conquista: number;
  nivel: NivelVfx;
}) {
  const acesos = triangulosAcesos(elemento, completo);
  const premium = nivel === 3;
  return (
    <span
      className="reel-runas"
      aria-hidden="true"
      data-nivel={nivel}
      data-conquista={conquista > 0 ? (conquista % 2 ? 'a' : 'b') : 'nao'}
    >
      {premium ? (
        <svg className="reel-filigrana" viewBox="0 0 120 160" preserveAspectRatio="none" focusable="false">
          <rect className="reel-filigrana-fio" x="0" y="0" width="120" height="160" rx="11" pathLength="280" />
          <rect className="reel-filigrana-luz reel-filigrana-halo" x="0" y="0" width="120" height="160" rx="11" pathLength="100" />
          <rect className="reel-filigrana-luz" x="0" y="0" width="120" height="160" rx="11" pathLength="100" />
        </svg>
      ) : null}
      {CANTOS.map((canto) => (
        <svg key={canto} className="reel-cantoneira" data-canto={canto} viewBox="0 0 16 16" focusable="false">
          <path d="M1 15V6a5 5 0 0 1 5-5h9" />
          <path className="reel-losango" d="M5 5l1.5-1.5L8 5 6.5 6.5z" />
          {premium ? (
            <>
              <path className="reel-adorno" d="M4.5 15V9.5A3.5 3.5 0 0 1 8 6h7" />
              <circle className="reel-gota" cx="1" cy="15" r="0.9" />
              <circle className="reel-gota" cx="15" cy="1" r="0.9" />
            </>
          ) : null}
        </svg>
      ))}
      {TRIANGULOS.map((id, ordem) => {
        const forma = TRIANGULO[id];
        return (
          <svg
            key={id}
            className="reel-triangulo"
            data-lado={LADO[id]}
            data-aceso={acesos.includes(id)}
            style={{ '--ordem': ordem } as React.CSSProperties}
            viewBox="0 0 14 14"
            focusable="false"
          >
            <circle cx="7" cy="7" r="7" />
            <polygon points={forma.pontos} />
            {forma.barra ? <line x1="4.4" y1="7.6" x2="9.6" y2="7.6" /> : null}
          </svg>
        );
      })}
    </span>
  );
}

export default RunasMoldura;
