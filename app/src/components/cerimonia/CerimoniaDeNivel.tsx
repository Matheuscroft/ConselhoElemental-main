import { useCallback, useEffect, useRef, useState } from 'react';
import { Contagem } from '@/components/motion/Contagem';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { ACENTO } from '@/lib/design/palette';
import { type Beat, ESPERA, proximoBeat } from '@/lib/cerimonia/cerimonia';
import { PREMIO_DE_NIVEL } from '@/lib/cerimonia/nivel';
import './cerimonia-de-nivel.css';

export interface CerimoniaDeNivelProps {
  readonly de: number;
  readonly para: number;
  /** Mastery title of the new level. */
  readonly titulo: string;
  /** How far through the new level the mage already is (0..1). */
  readonly fracao: number;
  /** XP still missing for the next level. */
  readonly faltam: number;
  readonly onFechar: () => void;
}

/** The four elements, in the colours the app already paints them in. */
const CORES = [ACENTO.fogo, ACENTO.agua, ACENTO.ar, ACENTO.terra] as const;
const PARTICULAS = Array.from({ length: 28 }, (_, i) => i);

/**
 * The ceremony for the mage's level: whole screens in sequence, each doing one
 * thing. The seal arrives in a burst of rays and light, its number counts to
 * the new level, and the bar shows how far the next one is.
 *
 * The seal is the stage and stays; the text under it changes per beat. It can
 * be skipped to its end at any time, and only closes from the end.
 * Reduced motion gets the final screen at once, with no rays and no light.
 */
export function CerimoniaDeNivel({ de, para, titulo, fracao, faltam, onFechar }: CerimoniaDeNivelProps) {
  const reduced = useMotionPreference();
  const [beat, setBeat] = useState<Beat>('chegada');
  const raizRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);

  const fim = reduced || beat === 'fim';
  const ativo: Beat = fim ? 'fim' : beat;
  // The seal reads the old level until the number beat starts counting.
  const contando = fim || beat !== 'chegada';
  const proximo = para + 1;

  // Focus goes in and comes back to where it was.
  useEffect(() => {
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    raizRef.current?.focus();
    return () => anterior?.focus?.();
  }, []);

  useEffect(() => {
    if (fim) botaoRef.current?.focus();
  }, [fim]);

  const encerrar = useCallback(() => {
    if (fim) onFechar();
    else setBeat('fim');
  }, [fim, onFechar]);

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        encerrar();
      } else if (evento.key === 'Tab') {
        // The dialog has one control; keep focus on it (or on the dialog until it shows).
        evento.preventDefault();
        (fim ? botaoRef.current : raizRef.current)?.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [encerrar, fim]);

  useEffect(() => {
    if (fim) return;
    const espera = window.setTimeout(() => {
      setBeat((atual) => proximoBeat(PREMIO_DE_NIVEL, atual));
    }, ESPERA[beat as Exclude<Beat, 'fim'>]);
    return () => window.clearTimeout(espera);
  }, [beat, fim]);

  return (
    <div
      ref={raizRef}
      className="cerimonia-nivel"
      role="dialog"
      aria-modal="true"
      aria-label={`Nível ${para}: ${titulo}`}
      tabIndex={-1}
      data-beat={ativo}
      data-reduzido={reduced}
      onClick={fim ? undefined : encerrar}
    >
      {reduced ? null : <div className="cerimonia-nivel__raios" aria-hidden="true" />}
      {reduced ? null : (
        <div className="cerimonia-nivel__luzes" aria-hidden="true">
          {PARTICULAS.map((i) => (
            <span
              key={i}
              style={{
                '--i': i,
                '--x': `${(i * 37) % 100}%`,
                '--c': CORES[i % CORES.length],
                '--d': `${((i * 7) % 5) + 3}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <div className="cerimonia-nivel__palco">
        <p className="cerimonia-nivel__chegada" data-ativo={ativo === 'chegada'}>
          Novo nível
        </p>

        <div className="cerimonia-nivel__selo" data-pulsa={ativo === 'numero'} aria-hidden="true">
          <strong>
            <Contagem valor={contando ? para : de} beat="conjure" />
          </strong>
        </div>

        <div className="cerimonia-nivel__texto" data-ativo={ativo !== 'chegada'}>
          <h2>Nível {para}</h2>
          <p className="cerimonia-nivel__titulo">{titulo}</p>
        </div>

        <div className="cerimonia-nivel__progresso" data-ativo={ativo === 'destrave' || ativo === 'fim'}>
          <div
            className="cerimonia-nivel__barra"
            role="img"
            aria-label={`${Math.round(fracao * 100)}% do caminho até o nível ${proximo}`}
          >
            <i style={{ '--fracao': fracao } as React.CSSProperties} />
          </div>
          <p>
            Faltam {faltam} XP para o nível {proximo}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="cerimonia-nivel__continuar"
        ref={botaoRef}
        data-pronto={fim}
        onClick={encerrar}
        tabIndex={fim ? 0 : -1}
      >
        Continuar
      </button>
    </div>
  );
}

export default CerimoniaDeNivel;
