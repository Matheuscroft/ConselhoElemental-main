import type { CSSProperties } from 'react';
import { Trophy } from 'lucide-react';
import type { EventoDeRecorde, RecordeQuebrado, TipoDeRecorde } from '@/lib/workout/progressao';
import { NumeroQueConta } from './treino-numero';

const FAISCAS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

const ROTULO: Record<TipoDeRecorde, { nome: string; unidade: string }> = {
  carga: { nome: 'Maior carga', unidade: 'kg' },
  reps: { nome: 'Mais repetições', unidade: 'reps' },
  volume: { nome: 'Maior volume da sessão', unidade: 'kg' },
  '1rm': { nome: '1RM estimado', unidade: 'kg' },
  duracao: { nome: 'Maior tempo', unidade: 's' },
  distancia: { nome: 'Maior distância', unidade: 'm' },
};

const numero = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

/**
 * "Records of this session" celebration. The records come from the pure layer; nothing is
 * invented here and nothing is shown without at least one real event. Reuses the seal, ring and
 * sparks of the app's small celebrations (recompensa-uau.css); progressao-uau.css drops the sparks and the ring for reduced motion.
 */
export function ProgressaoRecordes({ eventos, fresca }: { eventos: readonly EventoDeRecorde[]; fresca: boolean }) {
  const quebrados = eventos.filter((e): e is RecordeQuebrado => e.tipo !== 'estreia');
  const estreias = eventos.filter((e) => e.tipo === 'estreia');
  if (!quebrados.length) return null;

  return <section className="progressao-recordes ds-pane" aria-label="Recordes desta sessão">
    <header className="progressao-recordes-cabeca">
      <span className="rec-selo progressao-selo" aria-hidden="true">
        {fresca && <svg className="rec-anel" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" pathLength="1" /></svg>}
        {fresca && FAISCAS.map((i) => <i key={i} style={{ '--faisca': i } as CSSProperties} />)}
        <Trophy size={24} strokeWidth={1.75} />
      </span>
      <div>
        <h3 className="progressao-recordes-titulo">Recordes desta sessão</h3>
        <p className="progressao-recordes-nota">{quebrados.length === 1 ? '1 marca nova' : `${quebrados.length} marcas novas`}</p>
      </div>
    </header>
    <ul className="progressao-recordes-lista">
      {quebrados.map((r, i) => {
        const { nome, unidade } = ROTULO[r.tipo];
        const texto = numero(r.valorNovo);
        return <li key={`${r.exerciseId}-${r.tipo}`} className="progressao-recorde" style={{ '--i': i } as CSSProperties}>
          <span className="progressao-recorde-nome"><strong>{r.nome}</strong><span>{nome}</span></span>
          <span className="progressao-recorde-valor"><b>{fresca ? <NumeroQueConta texto={texto} /> : texto}</b> {unidade}</span>
          {r.valorAnterior != null && <span className="progressao-recorde-antes">antes {numero(r.valorAnterior)} {unidade}</span>}
        </li>;
      })}
    </ul>
    {estreias.length > 0 && <ul className="progressao-estreias">{estreias.map((e) => <li key={e.exerciseId}>Primeira vez em {e.nome}</li>)}</ul>}
  </section>;
}

/** First appearances alone are a quiet note, not a celebration. */
export function ProgressaoEstreias({ eventos }: { eventos: readonly EventoDeRecorde[] }) {
  const estreias = eventos.filter((e) => e.tipo === 'estreia');
  if (!estreias.length || eventos.some((e) => e.tipo !== 'estreia')) return null;
  return <ul className="progressao-estreias progressao-estreias--solta">{estreias.map((e) => <li key={e.exerciseId}>Primeira vez em {e.nome}</li>)}</ul>;
}
