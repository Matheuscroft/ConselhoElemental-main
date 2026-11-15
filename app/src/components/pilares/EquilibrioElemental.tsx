import { useRef, type CSSProperties } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { MarcaElemento } from '@/components/elemental/blocos';
import { ELEMENT_ORDER } from '@/components/elemental/navigation';
import { Contagem } from '@/components/motion/Contagem';
import { useChegada } from './useChegada';
import type { ElementId } from '@/constants';
import './equilibrio-elemental.css';

/** What the panel reads of one element; the page already computed it. */
export interface FatiaEquilibrio {
  readonly id: ElementId;
  readonly pontos: number;
  readonly porcentagem: number;
}

const RAIO = 48;
/** A hairline of dark between two arcs, in percent of the ring. */
const VAO = 1.4;

const formatar = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/** Where each arc starts and how long it is, in percent of the ring. */
function arcos(fatias: readonly FatiaEquilibrio[], total: number) {
  const visiveis = fatias.filter((fatia) => fatia.pontos > 0).length;
  let inicio = 0;
  return fatias.map((fatia) => {
    const parte = total > 0 ? (fatia.pontos / total) * 100 : 0;
    const comVao = visiveis > 1 ? VAO : 0;
    const arco = { id: fatia.id, inicio, comprimento: Math.max(0, parte - comVao) };
    inicio += parte;
    return arco;
  });
}

/**
 * The balance as a living panel: one ring cut into four arcs of the elements'
 * own colours, a spark that runs along it, and four bars that fill with the
 * numbers. It draws itself the first time it comes into view in an opening of
 * the app; without points it is an invitation, not a grey line of text.
 */
export function EquilibrioElemental({ fatias, total, areasAtivas }: {
  fatias: readonly FatiaEquilibrio[];
  total: number;
  areasAtivas: number;
}) {
  const painelRef = useRef<HTMLDetailsElement>(null);
  const chegou = useChegada(painelRef);
  const vazio = total <= 0;
  const ordenadas = ELEMENT_ORDER.map((id) => fatias.find((fatia) => fatia.id === id) ?? { id, pontos: 0, porcentagem: 0 });
  const forma = arcos(ordenadas, total);

  return (
    <details ref={painelRef} className="eq-painel ds-pane" open data-vazio={vazio} data-chegou={chegou}>
      <summary>
        <span>Seu equilíbrio elemental</span>
        <small>{formatar(total)} pontos registrados</small>
        <ArcaneIcon name="chevron" size={16} />
      </summary>
      <div className="eq-corpo">
        <div className="eq-anel" role="img" aria-label={vazio ? 'Anel do equilíbrio elemental, ainda sem arcos acesos' : `Anel do equilíbrio elemental: ${ordenadas.map((fatia) => `${formatar(fatia.porcentagem)}% ${fatia.id}`).join(', ')}`}>
          <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
            <circle className="eq-trilha" cx="60" cy="60" r={RAIO} />
            {forma.map((arco, indice) => {
              const estilo = { '--arco': arco.comprimento, '--ordem': indice, '--giro': `${(arco.inicio * 3.6 - 90).toFixed(2)}deg` } as CSSProperties;
              return vazio
                ? <circle key={arco.id} className="eq-promessa" data-element={arco.id} cx="60" cy="60" r={RAIO} pathLength={100} style={{ '--ordem': indice, '--giro': `${indice * 90 - 90}deg` } as CSSProperties} />
                : <g key={arco.id} data-element={arco.id} style={estilo}>
                  <circle className="eq-halo" cx="60" cy="60" r={RAIO} pathLength={100} />
                  <circle className="eq-arco" cx="60" cy="60" r={RAIO} pathLength={100} />
                </g>;
            })}
            {vazio ? null : <circle className="eq-cometa" cx="60" cy="60" r={RAIO} pathLength={100} />}
          </svg>
          <div className="eq-centro">
            {vazio
              ? <ArcaneIcon name="invocar" size={28} />
              : <><strong><Contagem valor={chegou ? total : 0} formatar={formatar} /></strong><small>pontos</small></>}
          </div>
        </div>

        {vazio
          ? <div className="eq-convite">
            <h3>O círculo espera o primeiro arco</h3>
            <p>Registre uma atividade e a cor do elemento dela acende aqui. Cada jornada tem seu próprio ritmo.</p>
            <ul className="eq-marcas">{ELEMENT_ORDER.map((id) => <li key={id}><MarcaElemento elemento={id} /></li>)}</ul>
          </div>
          : <ul className="eq-legenda">{ordenadas.map((fatia, indice) => {
            const estilo = { '--parte': Math.min(1, Math.max(0, fatia.porcentagem / 100)), '--ordem': indice } as CSSProperties;
            return (
              <li key={fatia.id} data-element={fatia.id} data-sem-pontos={fatia.pontos <= 0} style={estilo}>
                <MarcaElemento elemento={fatia.id} />
                <span className="eq-valor"><strong><Contagem valor={chegou ? fatia.porcentagem : 0} formatar={formatar} />%</strong><span className="sr-only">{formatar(fatia.pontos)} pontos</span></span>
                <span className="eq-barra" aria-hidden="true"><i /></span>
              </li>
            );
          })}</ul>}

        <p className="eq-nota">{vazio ? `${areasAtivas} áreas ativas, prontas para receber seus registros.` : `${areasAtivas} áreas ativas. A distribuição mostra onde seus pontos foram registrados.`}</p>
      </div>
    </details>
  );
}

export default EquilibrioElemental;
