import type { CSSProperties } from 'react';
import { ACENTO, AURA } from '@/lib/design/palette';
import type { ElementoDoDia } from '@/lib/momentos/elemento-do-dia';
import './coroa-dominio.css';

const CANTOS = ['nw', 'ne', 'se', 'sw'] as const;

/**
 * What only level 3 (Domínio) has, drawn outside the card: a crest that floats over it, a ring of light that
 * breathes around it, four flares on its corners and a holographic sheen that crosses its face now and then.
 * It sits where the frame's canvas sits (same geometry as `.reel-feitico`) and is painted in the day's element.
 * Decoration only: hidden from assistive tech and from pointers, and absent with reduced motion.
 */
export function CoroaDominio({ elemento, visivel }: { elemento: ElementoDoDia | null; visivel: boolean }) {
  const cor = elemento ? ACENTO[elemento] : '#d6b66f';
  const aura = elemento ? AURA[elemento] : '#e8c675';
  return (
    <div className="reel-coroa-dominio" data-visivel={visivel} aria-hidden="true" style={{ '--coroa-cor': cor, '--coroa-aura': aura } as CSSProperties}>
      <i className="cd-anel" />
      <span className="cd-holo" />
      <svg className="cd-crista" viewBox="0 0 76 32" fill="none" focusable="false">
        <path className="cd-asa" d="M38 20C30 20 26 13 14 15 7 16.5 4 12 2 8" />
        <path className="cd-asa" d="M38 20C46 20 50 13 62 15 69 16.5 72 12 74 8" />
        <path className="cd-asa cd-asa-baixa" d="M38 25C32 25 29 21 21 22.5 16 23.5 13 21 10 18" />
        <path className="cd-asa cd-asa-baixa" d="M38 25C44 25 47 21 55 22.5 60 23.5 63 21 66 18" />
        <path className="cd-gema" d="M38 3 44.5 11 38 19 31.5 11Z" />
        <path className="cd-nucleo" d="M38 8 41 11 38 14 35 11Z" />
        <circle className="cd-ponta" cx="2" cy="8" r="1.4" />
        <circle className="cd-ponta" cx="74" cy="8" r="1.4" />
      </svg>
      {CANTOS.map((canto, i) => <i key={canto} className="cd-flare" data-canto={canto} style={{ '--i': i } as CSSProperties} />)}
    </div>
  );
}

export default CoroaDominio;
