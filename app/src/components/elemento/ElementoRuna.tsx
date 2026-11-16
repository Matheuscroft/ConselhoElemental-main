import { useId, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/constants';
import { ElementoSigilo } from './ElementoSigilo';

const formatar = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

export interface ElementoRunaProps {
  readonly elemento: ElementId;
  readonly nomeDoElemento: string;
  readonly areaId: string;
  readonly nome: string;
  readonly descricao?: string;
  readonly ativa: boolean;
  readonly pontos: number;
  readonly rituais: number;
  /** The area's share of the strongest area of the element, 0 to 1. */
  readonly fracao: number;
  /** Position in the list, for the cascade of the arrival. */
  readonly ordem: number;
}

/**
 * An area of life as a rune: its own sigil with the ring of its share of the
 * points, the state in words ("Área ativa", or an open invitation), and a body
 * that unfolds on the spring of the system. The header is one button; what is
 * folded away cannot be tabbed into.
 */
export function ElementoRuna({ elemento, nomeDoElemento, areaId, nome, descricao, ativa, pontos, rituais, fracao, ordem }: ElementoRunaProps) {
  const [aberta, setAberta] = useState(false);
  const corpoId = useId();
  const saude = areaId === 'area-saude';
  const destino = `/dominios/${encodeURIComponent(areaId)}`;
  return <article className="elemento-runa ds-pane" data-element={elemento} data-ativa={ativa ? '' : undefined} data-aberta={aberta} data-luz style={{ '--ordem': ordem } as CSSProperties}>
    <button type="button" className="elemento-runa-cabeca" aria-expanded={aberta} aria-controls={corpoId} onClick={() => setAberta((atual) => !atual)}>
      <ElementoSigilo elemento={elemento} nome={nome} fracao={fracao} ativa={ativa} />
      <span className="elemento-runa-titulo">
        <strong>{nome}</strong>
        <small className="elemento-runa-estado">{ativa ? 'Área ativa' : 'Disponível para explorar'}</small>
      </span>
      <ArcaneIcon className="elemento-runa-chevron" name="chevron" size={16} />
    </button>
    <div id={corpoId} className="elemento-runa-corpo" data-aberto={aberta} inert={!aberta}>
      <div>
        <div className="elemento-runa-conteudo">
          <p className="elemento-runa-descricao">{descricao || `Uma área da sua jornada em ${nomeDoElemento}.`}</p>
          <ul className="elemento-runa-dados">
            <li><strong>{formatar(pontos)}</strong> pontos registrados</li>
            <li><strong>{rituais}</strong> {rituais === 1 ? 'ritual' : 'rituais'}</li>
          </ul>
          <div className="elemento-runa-pe">
            {saude ? <Link className="ds-botao" data-tipo="fantasma" to={destino}>Ver subáreas de exercício físico</Link> : <span />}
            <Link className="ds-botao" data-tipo="secundario" to={saude ? '/treinos' : destino}>{saude ? 'Abrir treinos' : 'Explorar área'}</Link>
          </div>
        </div>
      </div>
    </div>
  </article>;
}

export default ElementoRuna;
