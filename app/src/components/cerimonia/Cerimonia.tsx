import { useCallback, useEffect, useRef, useState } from 'react';
import { Contagem } from '@/components/motion/Contagem';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { ACENTO } from '@/lib/design/palette';
import { type Beat, ESPERA, beatsDe, proximoBeat, type Premio } from '@/lib/cerimonia/cerimonia';
import './cerimonia.css';

/**
 * The ceremony that marks finishing something: a short sequence of whole
 * screens rather than a notice.
 *
 * Where Duolingo bursts its mascot, this answers with the person's own
 * element — the colour the app already paints them in. The first beat
 * overshoots, on the only curve in the system that does; the screens after
 * it are for reading, so they settle.
 *
 * It can be left at any point. A celebration you cannot walk out of stops
 * being one the second time you see it.
 */
export function Cerimonia({ premio, onFechar }: { premio: Premio; onFechar: () => void }) {
  const reduced = useMotionPreference();
  const [beat, setBeat] = useState<Beat>('chegada');
  const sairRef = useRef<HTMLButtonElement>(null);
  const cor = premio.elemento ? ACENTO[premio.elemento] : '#d6b66f';

  // Reduced motion gets the whole thing at once: the information, without
  // being walked through it. And once the sequence lands, everything stays
  // on screen -- a ceremony that ends on an empty screen takes back what it
  // just gave, and leaves the person looking at nothing.
  const tudoDeUmaVez = reduced || beat === 'fim';
  const visiveis = tudoDeUmaVez
    ? beatsDe(premio).filter((b) => b !== 'fim')
    : [beat];

  useEffect(() => {
    sairRef.current?.focus();
  }, []);

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onFechar]);

  useEffect(() => {
    // `tudoDeUmaVez` already covers the end, so testing for it again is both
    // redundant and a comparison TypeScript can see is impossible.
    if (tudoDeUmaVez) return;
    const espera = window.setTimeout(() => {
      setBeat((atual) => proximoBeat(premio, atual));
    }, ESPERA[beat]);
    return () => window.clearTimeout(espera);
  }, [beat, premio, tudoDeUmaVez]);

  const encerrar = useCallback(() => onFechar(), [onFechar]);

  return (
    <div
      className="cerimonia"
      role="dialog"
      aria-modal="true"
      aria-label={premio.titulo}
      style={{ '--cerimonia-cor': cor } as React.CSSProperties}
    >
      <div className="cerimonia-raios" aria-hidden="true" data-parado={reduced} />

      <div className="cerimonia-corpo">
        {visiveis.includes('chegada') ? (
          <div className="cerimonia-beat cerimonia-chegada">
            <span className="cerimonia-selo" aria-hidden="true" />
            <h2>{premio.titulo}</h2>
          </div>
        ) : null}

        {visiveis.includes('numero') && premio.numero ? (
          <div className="cerimonia-beat cerimonia-numero">
            <strong>
              <Contagem valor={premio.numero.para} beat="conjure" />
            </strong>
            <small>
              {premio.numero.rotulo}
              {premio.numero.para > premio.numero.de
                ? ` · +${premio.numero.para - premio.numero.de}`
                : null}
            </small>
          </div>
        ) : null}

        {visiveis.includes('destrave') && premio.destrave ? (
          <div className="cerimonia-beat cerimonia-destrave">
            <strong>{premio.destrave.titulo}</strong>
            <small>{premio.destrave.detalhe}</small>
          </div>
        ) : null}
      </div>

      <button type="button" className="cerimonia-sair" ref={sairRef} onClick={encerrar}>
        {beat === 'fim' || tudoDeUmaVez ? 'Continuar' : 'Pular'}
      </button>
    </div>
  );
}

export default Cerimonia;
