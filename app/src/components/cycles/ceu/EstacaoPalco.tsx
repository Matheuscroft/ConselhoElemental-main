import type { CSSProperties } from 'react';
import { Leaf, Snowflake, Sprout, Sun } from 'lucide-react';
import { Contagem } from '@/components/motion/Contagem';
import { ABERTURA_DA_TELA_MS, useDeZero, useEntradaDaCena } from '@/components/mais/useCenaDaTela';
import { SEASON_STORIES, type seasonCycle } from '@/components/temporal/celestial/season-presentation';
import { temaDaEstacao, type TomDaEstacao } from '@/lib/temporal/ceu-dos-ciclos';
import { EstacaoTela } from './EstacaoTela';
import './ceu-dos-ciclos.css';
import './ceu-paginas.css';

type Estacoes = ReturnType<typeof seasonCycle>;

const DIA_MS = 86_400_000;
const ICONES = { spring: Sprout, summer: Sun, autumn: Leaf, winter: Snowflake } as const;

const dataLonga = (data: Date) => data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
const inicioDoDia = (data: Date) => new Date(data.getFullYear(), data.getMonth(), data.getDate());
/** Whole days between two local dates, immune to the hour changing. */
const diasEntre = (de: Date, ate: Date) => Math.round((inicioDoDia(ate).getTime() - inicioDoDia(de).getTime()) / DIA_MS);
const tomDe = (nome: string): TomDaEstacao => temaDaEstacao(nome).tom;

export interface EstacaoPalcoProps {
  readonly estacoes: Estacoes;
  readonly nomeAtual: string;
  readonly now: Date;
  readonly hemisphere: 'north' | 'south';
  readonly onHemisphere: (valor: 'north' | 'south') => void;
}

/**
 * The current season as a scene: its sky, its sun and its weather (petals,
 * heat, leaves or snow) on the canvas the Season button of Ciclos already
 * uses, and over its lower part the screen's one pane of glass with the name,
 * the day of the season and how many days are left for the next.
 */
export function EstacaoPalco({ estacoes, nomeAtual, now, hemisphere, onHemisphere }: EstacaoPalcoProps) {
  const entrada = useEntradaDaCena();
  const atual = estacoes[0];
  const proxima = estacoes[1];
  const tema = temaDaEstacao(nomeAtual);
  const faltam = proxima ? Math.max(0, diasEntre(now, proxima.start)) : 0;
  const total = atual ? Math.max(1, diasEntre(atual.start, atual.end)) : 1;
  const dia = atual ? Math.min(total, Math.max(1, diasEntre(atual.start, now) + 1)) : 1;
  const mostrados = useDeZero(faltam, ABERTURA_DA_TELA_MS / 2, entrada === 'plena');
  const historia = SEASON_STORIES[nomeAtual];

  return (
    <section
      className="est-palco"
      aria-labelledby="season-current-title"
      data-estacao={tema.tom}
      style={{ '--ceu-cor': tema.cor, '--ceu-cor-2': tema.cor2, '--ceu-topo': tema.topo, '--ceu-vidro': tema.vidro, '--est-progresso': (dia / total).toFixed(4) } as CSSProperties}
    >
      <div className="est-ceu"><EstacaoTela tom={tema.tom} cor={tema.cor} cor2={tema.cor2} /></div>
      <div className="cena-vidro est-vidro">
        <span className="cena-vidro-luz" aria-hidden="true" />
        <div className="est-painel ds-glass-float" data-luz="">
          <p className="temporal-eyebrow">Estação atual · hemisfério {hemisphere === 'south' ? 'Sul' : 'Norte'}</p>
          <h3 id="season-current-title">{nomeAtual}</h3>
          {historia ? <p className="est-titulo">{historia.title}</p> : null}
          <p className="est-proxima">{proxima ? `A próxima mudança é para ${proxima.name.toLocaleLowerCase('pt-BR')}, em ${dataLonga(proxima.start)}.` : 'Acompanhe os capítulos do ano.'}</p>
          {proxima ? (
            <div className="est-dias">
              <p className="est-dias-numero"><Contagem valor={mostrados} /><small>{faltam === 1 ? 'dia' : 'dias'} para a próxima estação</small></p>
              <div className="est-dias-fio">
                <span>Dia {dia} de {total} da {nomeAtual.toLocaleLowerCase('pt-BR')}</span>
                <span className="est-barra" aria-hidden="true"><span className="est-barra-feita" /></span>
              </div>
            </div>
          ) : null}
          <label className="temporal-select">Explorar hemisfério<select value={hemisphere} onChange={(event) => onHemisphere(event.target.value === 'north' ? 'north' : 'south')}><option value="south">Hemisfério Sul</option><option value="north">Hemisfério Norte</option></select></label>
        </div>
      </div>
    </section>
  );
}

/* ---------- The wheel of the year ---------- */

const CENTRO = 120;
const RAIO = 92;
const FOLGA = 1.6;
const DIAS_DO_ANO = 365.25;

/** Degrees clockwise from the top, with the 1st of January at the top. */
function grausDoDia(data: Date) {
  const inicioDoAno = new Date(data.getFullYear(), 0, 1);
  return ((diasEntre(inicioDoAno, data) + 0.5) / DIAS_DO_ANO) * 360;
}

function ponto(graus: number, raio = RAIO) {
  const rad = ((graus - 90) * Math.PI) / 180;
  return [CENTRO + raio * Math.cos(rad), CENTRO + raio * Math.sin(rad)] as const;
}

function arco(inicio: number, varredura: number) {
  const [x0, y0] = ponto(inicio);
  const [x1, y1] = ponto(inicio + varredura);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${RAIO} ${RAIO} 0 ${varredura > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/**
 * The year as four arcs in the colours of the seasons, each as long as the
 * season really lasts (read from the app's own calendar), a gold marker
 * where today stands and, in the middle, the days left for the next one.
 * Decorative: the same facts are written below it for a reader.
 */
export function RodaDoAno({ estacoes, now }: { estacoes: Estacoes; now: Date }) {
  const entrada = useEntradaDaCena();
  const proxima = estacoes[1];
  const faltam = proxima ? Math.max(0, diasEntre(now, proxima.start)) : 0;
  const mostrados = useDeZero(faltam, ABERTURA_DA_TELA_MS, entrada === 'plena');
  const [mx, my] = ponto(grausDoDia(now));
  const atual = estacoes[0];

  return (
    <div className="est-roda" style={atual ? ({ '--ceu-cor': temaDaEstacao(atual.name).cor } as CSSProperties) : undefined}>
      <div className="est-roda-corpo" aria-hidden="true">
        <svg viewBox="0 0 240 240" className="est-roda-svg" focusable="false">
          <circle className="est-roda-fio" cx={CENTRO} cy={CENTRO} r={RAIO + 16} fill="none" />
          <g className="est-roda-giro">
            <circle className="est-roda-pontos" cx={CENTRO} cy={CENTRO} r={RAIO - 24} fill="none" />
          </g>
          {estacoes.map((estacao, indice) => {
            const tema = temaDaEstacao(estacao.name);
            const Icone = ICONES[tomDe(estacao.name)];
            const inicio = grausDoDia(estacao.start);
            const varredura = (diasEntre(estacao.start, estacao.end) / DIAS_DO_ANO) * 360;
            const [ix, iy] = ponto(inicio + varredura / 2);
            return (
              <g key={estacao.name} className="est-roda-estacao" data-atual={indice === 0 || undefined} style={{ '--i': indice, '--cor': tema.cor } as CSSProperties}>
                <path className="est-roda-arco" d={arco(inicio + FOLGA, varredura - FOLGA * 2)} pathLength={1} fill="none" />
                <Icone className="est-roda-icone" x={ix - 8} y={iy - 8} size={16} />
              </g>
            );
          })}
          <g className="est-roda-hoje" transform={`translate(${mx.toFixed(2)} ${my.toFixed(2)})`}>
            <circle className="est-roda-pulso" r="9" />
            <circle className="est-roda-marca" r="5" />
          </g>
        </svg>
        <div className="est-roda-centro">
          <span>faltam</span>
          <strong><Contagem valor={mostrados} /></strong>
          <span>{faltam === 1 ? 'dia' : 'dias'}{proxima ? ` para ${proxima.name.toLocaleLowerCase('pt-BR')}` : ''}</span>
        </div>
      </div>
      <ol className="sr-only">
        {estacoes.map((estacao, indice) => {
          const ultimo = new Date(estacao.end);
          ultimo.setDate(ultimo.getDate() - 1);
          return <li key={estacao.name}>{estacao.name}, de {dataLonga(estacao.start)} a {dataLonga(ultimo)}{indice === 0 ? ', estação atual' : ''}</li>;
        })}
      </ol>
    </div>
  );
}
