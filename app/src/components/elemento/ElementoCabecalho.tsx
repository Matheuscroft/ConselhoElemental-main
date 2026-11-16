import { Contagem } from '@/components/motion/Contagem';
import { DURATION } from '@/lib/motion/motion';
import { deDecimos, emDecimos, useDeZero, useEntradaDaCenaDoElemento } from './elemento-entrada';

export interface ElementoCabecalhoProps {
  readonly nome: string;
  /** The line that says what the element is about. */
  readonly lema: string;
  readonly pontos: number;
  readonly areas: number;
  /** Share of the person's points that sit in this element, 0 to 100. */
  readonly percentual: number;
}

const RAIO = 50;
const formatarPercentual = (valor: number) => `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

/**
 * The name, the motto and the three figures of an element, as the one real
 * pane of glass of the page (`.ds-glass-float`, so this sheet declares no blur
 * of its own), lit from behind by the element. The share of the total is a
 * ring that draws itself; the figures count to their values the first time
 * and again whenever the element changes under them.
 */
export function ElementoCabecalho({ nome, lema, pontos, areas, percentual }: ElementoCabecalhoProps) {
  const plena = useEntradaDaCenaDoElemento() === 'plena';
  const atraso = DURATION.conjure + DURATION.reveal;
  const mostradosPontos = useDeZero(emDecimos(pontos), atraso, plena);
  const mostradasAreas = useDeZero(areas, atraso, plena);
  const mostradoPercentual = useDeZero(percentual, atraso, plena);
  const arco = Math.min(100, Math.max(0, Number.isFinite(mostradoPercentual) ? mostradoPercentual : 0));

  return <div className="elemento-altar">
    <span className="elemento-altar-luz" aria-hidden="true" />
    <section className="elemento-painel ds-glass-float" data-luz aria-labelledby="ep-title">
      <header className="elemento-titulo" key={nome}>
        <p className="elemento-sobretitulo">Elemento</p>
        <h1 id="ep-title">{nome}</h1>
        <p className="elemento-lema">{lema}.</p>
      </header>
      <div className="elemento-dados">
        <div className="elemento-anel">
          <div className="elemento-anel-grafico" role="img" aria-label={`${formatarPercentual(percentual)} dos pontos totais`}>
            <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
              <circle className="elemento-anel-marcas" cx="60" cy="60" r="57" pathLength={100} />
              <circle className="elemento-anel-trilho" cx="60" cy="60" r={RAIO} />
              <circle className="elemento-anel-halo" cx="60" cy="60" r={RAIO} pathLength={100} strokeDasharray={`${arco} 100`} data-vazio={arco <= 0 ? '' : undefined} />
              <circle className="elemento-anel-arco" cx="60" cy="60" r={RAIO} pathLength={100} strokeDasharray={`${arco} 100`} data-vazio={arco <= 0 ? '' : undefined} />
            </svg>
            <span className="elemento-anel-centro" aria-hidden="true"><Contagem valor={mostradoPercentual} beat="settle" formatar={formatarPercentual} /></span>
          </div>
          <small>dos pontos totais</small>
        </div>
        <ul className="elemento-cifras">
          <li className="elemento-cifra"><strong><Contagem valor={mostradosPontos} beat="settle" formatar={deDecimos} /></strong><small>pontos registrados</small></li>
          <li className="elemento-cifra"><strong><Contagem valor={mostradasAreas} beat="settle" /></strong><small>áreas para explorar</small></li>
        </ul>
      </div>
      {pontos <= 0 ? <p className="elemento-convite">Registre uma atividade deste elemento e o anel começa a acender.</p> : null}
    </section>
  </div>;
}

export default ElementoCabecalho;
