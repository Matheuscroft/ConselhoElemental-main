import { useRef, useState, type KeyboardEvent } from 'react';
import type { ElementoId } from '@/lib/design/palette';
import { ELEMENT_ORDER } from '../elemental/navigation';
import './rosa-elemental.css';

export type OrigemDaRosa = 'toque' | 'teclado';

export interface RosaElementalProps {
  /** Elemento da página atual ou da primeira resposta: para onde a agulha aponta. */
  ativo: ElementoId;
  /** Quantas páginas há em cada inscrição, para o rótulo falado. */
  contagens: Record<ElementoId, number>;
  /** Busca: só estes triângulos ficam acesos; os demais recuam a .25. */
  acesos?: readonly ElementoId[];
  /** Linha da rosa encolhida durante a busca: decorativa, botões inertes. */
  compacta?: boolean;
  /** Movimento reduzido: sem animação, agulha já no lugar. */
  reduzido?: boolean;
  onEscolher: (elemento: ElementoId, origem: OrigemDaRosa) => void;
}

const ORDEM = ELEMENT_ORDER as readonly ElementoId[];
const NOME: Record<ElementoId, string> = { fogo: 'Fogo', ar: 'Ar', agua: 'Água', terra: 'Terra' };
const VERBO: Record<ElementoId, string> = { fogo: 'Agir', ar: 'Saber', agua: 'Fluir', terra: 'Sustentar' };
/** Norte, leste, sul, oeste: o sentido horário da rosa é a ordem de ELEMENT_ORDER. */
const GRAUS: Record<ElementoId, number> = { fogo: 0, ar: 90, agua: 180, terra: 270 };
/** Centro de cada triângulo no viewBox de 120. */
const CENTRO: Record<ElementoId, readonly [number, number]> = { fogo: [60, 27], ar: [93, 60], agua: [60, 93], terra: [27, 60] };

/** Mesma geometria de CycleSigil (caixa de 14): fogo e ar de ponta para cima, água e terra para baixo; ar e terra levam o travessão. */
const FORMA: Record<ElementoId, { pontos: string; barra: boolean }> = {
  fogo: { pontos: '7,2.5 11.5,10.5 2.5,10.5', barra: false },
  ar: { pontos: '7,2.5 11.5,10.5 2.5,10.5', barra: true },
  agua: { pontos: '2.5,3.5 11.5,3.5 7,11.5', barra: false },
  terra: { pontos: '2.5,3.5 11.5,3.5 7,11.5', barra: true },
};
const ESCALA = 2.2;

/** Caminho mais curto até o alvo, somado ao ângulo já acumulado (nunca dá a volta longa). */
export function anguloMaisCurto(atual: number, alvo: number): number {
  const delta = ((((alvo - atual) % 360) + 540) % 360) - 180;
  return atual + delta;
}

function rotulo(elemento: ElementoId, total: number) {
  return `${NOME[elemento]}, ${VERBO[elemento]}, ${total} ${total === 1 ? 'página' : 'páginas'}`;
}

export function RosaElemental({ ativo, contagens, acesos, compacta = false, reduzido = false, onEscolher }: RosaElementalProps) {
  const [agulha, setAgulha] = useState({ ativo, angulo: GRAUS[ativo], pulso: 0 });
  // Ajuste durante a renderização: o ângulo acumulado é estado, não efeito.
  let atual = agulha;
  if (agulha.ativo !== ativo) {
    atual = { ativo, angulo: anguloMaisCurto(agulha.angulo, GRAUS[ativo]), pulso: agulha.pulso + 1 };
    setAgulha(atual);
  }
  const botoes = useRef<Partial<Record<ElementoId, HTMLButtonElement | null>>>({});

  const mover = (elemento: ElementoId) => {
    onEscolher(elemento, 'teclado');
    botoes.current[elemento]?.focus();
  };
  const aoTeclar = (evento: KeyboardEvent<HTMLDivElement>) => {
    const i = ORDEM.indexOf(ativo);
    const alvo =
      evento.key === 'ArrowRight' ? ORDEM[(i + 1) % ORDEM.length]
      : evento.key === 'ArrowLeft' ? ORDEM[(i + ORDEM.length - 1) % ORDEM.length]
      : evento.key === 'Home' ? ORDEM[0]
      : evento.key === 'End' ? ORDEM[ORDEM.length - 1]
      : undefined;
    if (!alvo) return;
    evento.preventDefault();
    mover(alvo);
  };

  return (
    <div className="rosa" data-compacta={compacta} data-reduzido={reduzido} data-ativo={ativo}>
      <div className="rosa-corpo">
        <div className="rosa-auras" aria-hidden="true">
          {ORDEM.map((elemento) => (
            <span key={elemento} className="rosa-aura" data-element={elemento} data-ligada={elemento === ativo} />
          ))}
        </div>
        <svg className="rosa-svg" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true" focusable="false">
          <circle className="rosa-anel" cx="60" cy="60" r="56" fill="none" strokeWidth="1" />
          {ORDEM.map((elemento, i) => {
            const [cx, cy] = CENTRO[elemento];
            const forma = FORMA[elemento];
            const apagado = acesos !== undefined && !acesos.includes(elemento);
            return (
              <g key={elemento} transform={`translate(${cx - 7 * ESCALA} ${cy - 7 * ESCALA}) scale(${ESCALA})`}>
                <g className="rosa-entrada" style={{ ['--i' as string]: i }}>
                  <g className="rosa-triangulo" data-element={elemento} data-ativo={elemento === ativo} data-apagado={apagado}>
                    <polygon points={forma.pontos} strokeWidth="1" strokeLinejoin="round" />
                    {forma.barra ? <line x1="4.4" y1="7.6" x2="9.6" y2="7.6" strokeWidth="1" strokeLinecap="round" /> : null}
                  </g>
                </g>
              </g>
            );
          })}
          <g className="rosa-agulha" style={{ ['--rosa-angulo' as string]: `${atual.angulo}deg` }}>
            <polygon points="60,1.5 64,9.5 56,9.5" />
          </g>
          <polygon key={atual.pulso} className="rosa-nucleo" points="60,55 65,60 60,65 55,60" />
        </svg>
        <div className="rosa-botoes" role="group" aria-label="Rosa dos Quatro" onKeyDown={compacta ? undefined : aoTeclar}>
          {ORDEM.map((elemento) => (
            <button
              key={elemento}
              ref={(no) => { botoes.current[elemento] = no; }}
              type="button"
              className="rosa-botao"
              data-element={elemento}
              aria-label={rotulo(elemento, contagens[elemento])}
              aria-current={elemento === ativo ? 'true' : undefined}
              tabIndex={elemento === ativo ? 0 : -1}
              inert={compacta}
              onClick={(evento) => onEscolher(elemento, evento.detail === 0 ? 'teclado' : 'toque')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default RosaElemental;
