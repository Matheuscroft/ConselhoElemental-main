import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { monthHref } from './celestial/month-navigation';
import { calor } from './elementos-dos-dias';
import type { Direcao } from './useDirecao';

export interface MesDoMapa {
  readonly data: Date;
  readonly concluidos: number;
  readonly compromissos: number;
}

/**
 * The year as twelve lamps: each month glows with how much was finished in it,
 * against the brightest month of the year, and the lamps light one after
 * another. Every lamp is a link to its month. A year with nothing finished is
 * an invitation, not a row of dark squares.
 */
export function MapaDoAno({ ano, meses, atual, returnTo, direcao }: {
  ano: number; meses: readonly MesDoMapa[]; atual: number | null; returnTo?: string; direcao?: Direcao;
}) {
  const maximo = meses.reduce((mais, mes) => Math.max(mais, mes.concluidos), 0);
  const vazio = maximo === 0;
  return <section className="temporal-mapa" aria-labelledby="temporal-mapa-titulo">
    <div className="temporal-section-heading"><h3 id="temporal-mapa-titulo">O mapa de {ano}</h3><span>{vazio ? 'Os meses acendem conforme você conclui' : 'Quanto mais claro, mais você concluiu'}</span></div>
    <div className="temporal-mapa-grade" key={ano} data-direcao={direcao} data-vazio={vazio}>
      {meses.map((mes, indice) => {
        const nome = mes.data.toLocaleDateString('pt-BR', { month: 'long' });
        return <Link key={indice} className="temporal-mapa-mes" to={monthHref(mes.data)} state={returnTo ? { temporalReturn: returnTo } : undefined}
          data-current={atual === indice} data-acesa={mes.concluidos > 0}
          style={{ '--calor': calor(mes.concluidos, maximo).toFixed(2), '--i': indice } as CSSProperties}
          aria-label={`${nome}: ${mes.concluidos} registros de conclusão, ${mes.compromissos} compromissos`}>
          <span>{nome.slice(0, 3)}</span>
          <strong>{mes.concluidos}</strong>
        </Link>;
      })}
    </div>
  </section>;
}
