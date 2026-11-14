import { Link } from 'react-router-dom';
import type { ElementId } from '@/types';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { LinhaDeRota, type EstadoDaLinha, type LinhaDeRotaProps } from './LinhaDeRota';
import './inscricao.css';

type Rota = LinhaDeRotaProps['rota'];

/** Uma rota da inscricao com o estado que a busca lhe deu. */
export interface ItemDaInscricao {
  rota: Rota;
  estado: EstadoDaLinha;
  primeira?: boolean;
  /** So o Temporal: estado de cada subportal por id ("temporal-mes"). Sem isso, acompanham a linha. */
  subportais?: Partial<Record<string, EstadoDaLinha>>;
}

export interface InscricaoElementalProps {
  elemento: ElementId;
  verbo: string;
  linha: string;
  rotas: ItemDaInscricao[];
  /** Quantas paginas respondem (a contagem do cabecalho). */
  contagem: number;
  /** Id da rota aberta agora (ex.: "lua"), ou nulo. */
  abertoAtual?: string | null;
  aoNavegar?: LinhaDeRotaProps['aoNavegar'];
}

/** Os subportais de texto do Temporal; os caminhos vem de APP_ROUTES pelos ids. */
const SUBPORTAIS = [
  { id: 'temporal-mes', nome: 'Mês', path: '/temporal/mes' },
  { id: 'temporal-ano', nome: 'Ano', path: '/temporal/ano' },
  { id: 'temporal-calendario', nome: 'Calendário', path: '/temporal/calendario' },
] as const;

const visivel = (estado: EstadoDaLinha) => estado === 'normal' || estado === 'acesa';

function estadoDoSubportal(item: ItemDaInscricao, id: string): EstadoDaLinha {
  const proprio = item.subportais?.[id];
  if (proprio) return proprio;
  return item.estado === 'acesa' ? 'normal' : item.estado;
}

function Subportais({ item, abertoAtual, aoNavegar }: { item: ItemDaInscricao; abertoAtual?: string | null; aoNavegar?: LinhaDeRotaProps['aoNavegar'] }) {
  const estados = SUBPORTAIS.map((sub) => estadoDoSubportal(item, sub.id));
  const algum = estados.some(visivel);
  return (
    <div className="ins-rota" data-subs data-adormecida={!algum || undefined} inert={!algum} aria-hidden={!algum || undefined}>
      <div className="ins-corte">
        <nav className="ins-subs" aria-label="Temporal">
          {SUBPORTAIS.map((sub, indice) => {
            const estado = estados[indice];
            const oculta = !visivel(estado);
            const atual = abertoAtual === sub.id;
            return (
              <div key={sub.id} className="ins-sub" data-acesa={estado === 'acesa' || undefined} data-adormecida={oculta || undefined} inert={oculta} aria-hidden={oculta || undefined}>
                <div className="ins-sub-corte">
                  <Link
                    to={sub.path}
                    className="ins-sub-link"
                    aria-current={atual ? 'page' : undefined}
                    onClick={() => aoNavegar?.({ id: sub.id, label: sub.nome, path: sub.path, description: '' })}
                  >
                    {sub.nome}
                  </Link>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/** Uma inscricao da folha "Todas as páginas": um elemento, seu verbo, e as rotas dele. */
export function InscricaoElemental({ elemento, verbo, linha, rotas, contagem, abertoAtual = null, aoNavegar }: InscricaoElementalProps) {
  const idTitulo = `mais-inscricao-${elemento}-titulo`;
  const vazia = !rotas.some((item) => visivel(item.estado) || (item.rota.id === 'temporal' && SUBPORTAIS.some((sub) => visivel(estadoDoSubportal(item, sub.id)))));
  const inicio = rotas.findIndex((item) => visivel(item.estado));
  return (
    <section id={`mais-inscricao-${elemento}`} className="ins" data-element={elemento} data-vazia={vazia || undefined} aria-labelledby={idTitulo}>
      <header className="ins-cabeca">
        <ArcaneIcon name={elemento} size={20} className="ins-emblema" />
        <h3 id={idTitulo} className="ins-verbo">{verbo}</h3>
        <p className="ins-linha-texto">{linha}</p>
        <span className="ins-contagem">{contagem} {contagem === 1 ? 'página' : 'páginas'}</span>
      </header>
      {vazia ? (
        <p className="ins-nenhuma">Nenhuma aqui</p>
      ) : null}
      <ul className="ins-lista">
        {rotas.map((item, indice) => (
          <li key={item.rota.id} className="ins-item" data-inicio={indice === inicio || undefined}>
            <LinhaDeRota
              rota={item.rota}
              elemento={elemento}
              estado={item.estado}
              atual={abertoAtual === item.rota.id}
              primeira={item.primeira}
              aoNavegar={aoNavegar}
            />
            {item.rota.id === 'temporal' ? <Subportais item={item} abertoAtual={abertoAtual} aoNavegar={aoNavegar} /> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default InscricaoElemental;
