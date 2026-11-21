import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { CenaMagica } from '@/components/cerimonia/CenaMagica';
import { ACENTO, AURA } from '@/lib/design/palette';
import { DURACAO_TRANSBORDO_MS, type AscensaoDoReel } from '@/lib/momentos/ascensao';
import './ascensao-palco.css';

const NOME = { terra: 'Terra', fogo: 'Fogo', agua: 'Água', ar: 'Ar' } as const;

/**
 * The stage of an ascension: while the frame overflows, the screen answers. Fluxo (level 2) is a swell of the
 * element's light with a title; Domínio (level 3) is the grand one: a flash, shockwaves, the circle of runes, a
 * crown over the title. It lasts as long as the frame's own overflow, never takes a tap (pointer-events: none), and is
 * rendered on the body so no stacking context can keep it under the bars. The words are announced once, politely.
 */
export function AscensaoPalco({ ascensao }: { ascensao: AscensaoDoReel }) {
  if (typeof document === 'undefined') return null;
  const { elemento, nivel } = ascensao;
  const dominio = nivel === 3;
  const cor = ACENTO[elemento];
  const aura = AURA[elemento];
  const nome = dominio ? 'Domínio' : 'Fluxo';
  return createPortal(
    <>
      <p className="asc-anuncio" role="status">{`${NOME[elemento]} ascendeu ao ${nome}`}</p>
      <div className="asc-palco" data-nivel={nivel} aria-hidden="true" style={{ '--cerimonia-cor': cor, '--cerimonia-aura': aura, '--asc-dur': `${DURACAO_TRANSBORDO_MS[nivel]}ms` } as CSSProperties}>
        <CenaMagica cor={cor} aura={aura} cy={40} runas={dominio} />
        <i className="asc-clarao" />
        <i className="asc-onda asc-onda-a" />
        <i className="asc-onda asc-onda-b" />
        {dominio ? <><i className="asc-onda asc-onda-c" /><i className="asc-onda asc-onda-d" /></> : null}
        <div className="asc-titulo">
          {dominio ? (
            <svg className="asc-coroa" viewBox="0 0 120 36" fill="none" focusable="false">
              <path pathLength={1} d="M10 30 18 12 36 22 60 4 84 22 102 12 110 30Z" />
              <path pathLength={1} d="M10 34h100" />
              <circle cx="18" cy="9" r="2.2" /><circle cx="60" cy="1.5" r="2.2" /><circle cx="102" cy="9" r="2.2" />
            </svg>
          ) : null}
          <span className="asc-glifo"><ArcaneIcon name={elemento} size={dominio ? 44 : 34} /></span>
          <small>{NOME[elemento]} ascende</small>
          <strong>{nome}</strong>
          <span className="asc-filete" />
        </div>
      </div>
    </>,
    document.body,
  );
}

export default AscensaoPalco;
