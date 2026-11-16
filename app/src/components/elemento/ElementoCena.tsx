import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENT_ORDER } from '@/components/elemental/navigation';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { BRASAS } from '@/components/pilares/brasas';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import type { ElementId } from '@/constants';
import { DURATION } from '@/lib/motion/motion';
import { EntradaDoElemento, useEntradaElemento } from './elemento-entrada';

/** The art of one element. If the file is missing the coloured rune stands in for it. */
function ArteDoElemento({ id, saindo = false }: { id: ElementId; saindo?: boolean }) {
  const [falhou, setFalhou] = useState(false);
  return <span className="elemento-arte" data-saindo={saindo ? '' : undefined} data-arte={id}>
    {falhou
      ? <ElementIcon element={id} size="62%" className="elemento-arte-reserva" />
      : <img
        className="elemento-arte-imagem"
        src={`/sanctuary/elements/${id}-v1.webp`}
        width={1254}
        height={1254}
        alt=""
        draggable={false}
        decoding="async"
        fetchPriority={saindo ? 'low' : 'high'}
        onError={() => setFalhou(true)}
      />}
  </span>;
}

/**
 * The scene of the page of an element: the light of that element behind the
 * heading, its art as the hero with a breath of its own, motes of its own kind
 * (embers, bubbles, wisps, shards), a little depth that follows the hand and
 * the finger's light on every `[data-luz]` surface. It stays mounted when the
 * person moves to another element: the colour and the light change in place,
 * the art crosses over, and nothing is staged a second time.
 *
 * It only reads: nothing here writes or scores anything.
 */
export function ElementoCena({ id, children }: { id: ElementId; children: ReactNode }) {
  const reduzido = useMotionPreference();
  const cenaRef = useRef<HTMLDivElement>(null);
  const cenarioRef = useRef<HTMLDivElement>(null);
  const { entrada, abrindo } = useEntradaElemento();

  // Depth only on the scene itself: the page below is far too tall to read the finger against.
  useParalaxe(cenarioRef, !reduzido);
  useLuzDoToque(cenaRef);

  // The art that is leaving stays long enough to fade; adjusted during render,
  // React's recipe for state that follows a prop.
  const [ultimo, setUltimo] = useState(id);
  const [saindo, setSaindo] = useState<ElementId | null>(null);
  if (ultimo !== id) {
    setSaindo(ultimo);
    setUltimo(id);
  }
  useEffect(() => {
    if (!saindo) return;
    const fim = window.setTimeout(() => setSaindo(null), DURATION.settle);
    return () => window.clearTimeout(fim);
  }, [saindo, id]);

  return <EntradaDoElemento.Provider value={entrada}>
    <div ref={cenaRef} className="elemento-cena ep-element-page" data-element={id} data-entrada={entrada} data-abrindo={abrindo}>
      <div ref={cenarioRef} className="elemento-cenario">
        <div className="elemento-palco" aria-hidden="true">
          <span className="elemento-aura" />
          <span className="elemento-chao" />
          <span className="elemento-horizonte" />
        </div>
        <div className="elemento-heroi" aria-hidden="true">
          <span className="elemento-orbita"><i /></span>
          <span className="elemento-pulso" />
          {saindo && saindo !== id ? <ArteDoElemento key={saindo} id={saindo} saindo /> : null}
          <ArteDoElemento key={id} id={id} />
        </div>
        <div className="elemento-particulas" aria-hidden="true">
          {ELEMENT_ORDER.map((elemento) => <span key={elemento} className="elemento-camada" data-ativo={elemento === id} data-elemento={elemento}>
            {BRASAS.map((brasa, posicao) => <span
              key={posicao}
              className="elemento-brasa"
              style={{ '--x': `${brasa.x}%`, '--t': brasa.tamanho / 10, '--v': brasa.deriva, '--c': brasa.ciclo, '--a': brasa.avanco } as CSSProperties}
            />)}
          </span>)}
        </div>
      </div>
      {children}
    </div>
  </EntradaDoElemento.Provider>;
}

export default ElementoCena;
