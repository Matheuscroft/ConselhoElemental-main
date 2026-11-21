import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { CenaMagica } from './CenaMagica';
import { Contagem } from '@/components/motion/Contagem';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { ACENTO, AURA } from '@/lib/design/palette';
import { type Beat, ESPERA, beatsDe, proximoBeat, type Premio } from '@/lib/cerimonia/cerimonia';
import './cerimonia.css';

const NOME = { terra: 'Terra', fogo: 'Fogo', agua: 'Água', ar: 'Ar' } as const;
const OURO = '#d6b66f';
const OURO_VIVO = '#f0cf86';

/** The count on the number beat starts at the old value and runs to the new one, so it is seen being earned. */
function useContar(de: number, para: number, parado: boolean) {
  const [valor, setValor] = useState(parado ? para : de);
  useEffect(() => {
    if (parado) return undefined;
    const quadro = requestAnimationFrame(() => setValor(para));
    return () => cancelAnimationFrame(quadro);
  }, [para, parado]);
  return valor;
}

function Numero({ rotulo, de, para, parado }: { rotulo: string; de: number; para: number; parado: boolean }) {
  const valor = useContar(de, para, parado);
  const ganho = para - de;
  return (
    <div className="cerimonia-beat cerimonia-numero">
      <div className="cerimonia-numero-linha">
        {ganho > 0 ? <span className="cerimonia-numero-de" aria-hidden="true">{de}</span> : null}
        {ganho > 0 ? <span className="cerimonia-numero-seta" aria-hidden="true" /> : null}
        <strong><Contagem valor={valor} beat="conjure" /></strong>
      </div>
      <small>{rotulo}{ganho > 0 ? <b> +{ganho}</b> : null}</small>
    </div>
  );
}

/**
 * The ceremony that marks finishing something: a short sequence of whole screens rather than a notice.
 *
 * It answers with the person's own element. The light, the sigil and the embers are painted in that element's
 * colour; the arrival is the one place in the app that is allowed to land harder than it settles (a flash, a
 * shockwave and a sigil that overshoots), and every screen after it only settles, for reading. Everything that
 * moves is a transform or an opacity, so it costs the phone almost nothing.
 *
 * It can be left at any point. A celebration you cannot walk out of stops being one the second time you see it.
 */
export function Cerimonia({ premio, onFechar }: { premio: Premio; onFechar: () => void }) {
  const reduced = useMotionPreference();
  const [beat, setBeat] = useState<Beat>('chegada');
  const sairRef = useRef<HTMLButtonElement>(null);
  const cor = premio.elemento ? ACENTO[premio.elemento] : OURO;
  const aura = premio.elemento ? AURA[premio.elemento] : OURO_VIVO;
  const kicker = premio.elemento ? NOME[premio.elemento] : 'Conquista';

  // Reduced motion gets the whole thing at once, and once the sequence lands everything stays on screen:
  // a ceremony that ends on an empty screen takes back what it just gave.
  const tudoDeUmaVez = reduced || beat === 'fim';
  const visiveis = tudoDeUmaVez ? beatsDe(premio).filter((b) => b !== 'fim') : [beat];
  const passos = beatsDe(premio).filter((b) => b !== 'fim');

  useEffect(() => { sairRef.current?.focus(); }, []);

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => { if (evento.key === 'Escape') onFechar(); };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onFechar]);

  useEffect(() => {
    if (tudoDeUmaVez) return;
    const espera = window.setTimeout(() => setBeat((atual) => proximoBeat(premio, atual)), ESPERA[beat]);
    return () => window.clearTimeout(espera);
  }, [beat, premio, tudoDeUmaVez]);

  const encerrar = useCallback(() => onFechar(), [onFechar]);
  const pronto = beat === 'fim' || tudoDeUmaVez;
  // The light is centred on whatever is on show.
  const cy = beat === 'chegada' && !tudoDeUmaVez ? 36 : beat === 'fim' || tudoDeUmaVez ? 40 : 43;

  // Rendered on the body: wherever it is called from, nothing (a stacking context, a transform) may keep it under the bars.
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="cerimonia"
      role="dialog"
      aria-modal="true"
      aria-label={premio.titulo}
      data-beat={beat}
      data-pronto={pronto}
      data-parado={reduced}
      style={{ '--cerimonia-cor': cor, '--cerimonia-aura': aura } as CSSProperties}
    >
      <CenaMagica cor={cor} aura={aura} cy={cy} />

      <div className="cerimonia-corpo">
        {visiveis.includes('chegada') ? (
          <div className="cerimonia-beat cerimonia-chegada">
            <div className="cerimonia-emblema" aria-hidden="true">
              <svg viewBox="0 0 120 120" fill="none">
                <circle className="cerimonia-anel-ticks" cx="60" cy="60" r="56" pathLength="360" />
                <circle className="cerimonia-anel-fio" cx="60" cy="60" r="48" pathLength="1" />
                <circle className="cerimonia-anel-miolo" cx="60" cy="60" r="40" />
                <path className="cerimonia-no" d="M60 8l3.2 3.2L60 14.4 56.8 11.2Z" />
                <path className="cerimonia-no" d="M112 60l-3.2 3.2-3.2-3.2 3.2-3.2Z" />
                <path className="cerimonia-no" d="M60 112l-3.2-3.2L60 105.6l3.2 3.2Z" />
                <path className="cerimonia-no" d="M8 60l3.2-3.2 3.2 3.2-3.2 3.2Z" />
              </svg>
              <span className="cerimonia-glifo"><ArcaneIcon name={premio.elemento ?? 'conquista'} size={54} /></span>
            </div>
            <small className="cerimonia-kicker">{kicker}</small>
            <h2>{premio.titulo}</h2>
            <span className="cerimonia-filete" aria-hidden="true" />
          </div>
        ) : null}

        {visiveis.includes('numero') && premio.numero ? (
          <Numero rotulo={premio.numero.rotulo} de={premio.numero.de} para={premio.numero.para} parado={tudoDeUmaVez && beat === 'fim' ? true : reduced} />
        ) : null}

        {visiveis.includes('destrave') && premio.destrave ? (
          <div className="cerimonia-beat cerimonia-destrave">
            <div className="cerimonia-cartao">
              <span className="cerimonia-cartao-selo" aria-hidden="true"><ArcaneIcon name="conquista" size={22} /></span>
              <div><strong>{premio.destrave.titulo}</strong><small>{premio.destrave.detalhe}</small></div>
            </div>
          </div>
        ) : null}
      </div>

      <footer className="cerimonia-pe">
        <ol className="cerimonia-passos" aria-hidden="true">
          {passos.map((passo) => (
            <li key={passo} data-estado={pronto || passos.indexOf(passo) < passos.indexOf(beat) ? 'feito' : passo === beat ? 'atual' : 'depois'} />
          ))}
        </ol>
        <button type="button" className="cerimonia-sair" ref={sairRef} data-pronto={pronto} onClick={encerrar}>
          {pronto ? 'Continuar' : 'Pular'}
        </button>
      </footer>
    </div>,
    document.body,
  );
}

export default Cerimonia;
