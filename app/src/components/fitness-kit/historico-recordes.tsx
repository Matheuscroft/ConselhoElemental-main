import React, { useId, useMemo, useState, type CSSProperties } from 'react';
import { Trophy } from 'lucide-react';
import './historico-uau.css';
import { elementoDaModalidade } from './treinos-elementos';
import { capaDaModalidade } from './modalidade-capa';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout/workout-labels';
import { recordesDaModalidade, type RecordesDaModalidade } from '@/lib/workout/progressao';
import type { NativeWorkoutSession, WorkoutExerciseCategory, WorkoutTemplate } from '@/types/workout';

const num = (value: number, digits = 0) => value.toLocaleString('pt-BR', { maximumFractionDigits: digits });
const minutos = (s: number) => (s >= 3600 ? `${Math.floor(s / 3600)} h ${String(Math.round((s % 3600) / 60)).padStart(2, '0')} min` : `${Math.round(s / 60)} min`);
const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

interface Props {
  sessions: readonly NativeWorkoutSession[];
  templates: readonly Pick<WorkoutTemplate, 'id' | 'modality'>[];
}


/** The streak as an object you can touch: a living flame, one pip per week (lit in turn), the best run marked. */
const SequenciaChama: React.FC<{ atual: number; melhor: number }> = ({ atual, melhor }) => {
  const [aberta, setAberta] = useState(false);
  const idDetalhe = useId();
  const pips = Math.min(8, Math.max(4, atual, melhor));
  const rotulo = atual === 1 ? 'semana seguida' : 'semanas seguidas';
  return (
    <div className="hr-seq" data-aberta={aberta ? '' : undefined}>
      <button type="button" className="hr-seq-botao" aria-expanded={aberta} aria-controls={idDetalhe} onClick={() => setAberta((v) => !v)}>
        <svg className="hr-seq-fogo" viewBox="0 0 24 32" aria-hidden="true" focusable="false">
          <path className="hr-seq-fora" d="M12 1c1.2 6.5 8 9.5 8 18a8 8 0 0 1-16 0c0-4 2-6.2 3.2-8.4 1 3 2.2 4.2 3.4 4.2C10.4 9 9.6 5.4 12 1z" />
          <path className="hr-seq-dentro" d="M12.2 14c1 3.2 4 4.4 4 8a4 4 0 0 1-8 0c0-2.2 1-3.2 2.2-4.4.6 1.2 1.2 1.8 2.2 1.8-.4-2-.4-3.6-.4-5.4z" />
        </svg>
        <span className="hr-seq-texto"><strong>{atual}</strong><span>{rotulo}</span></span>
        <span className="hr-seq-pips" aria-hidden="true">
          {Array.from({ length: pips }, (_, i) => <i key={i} data-aceso={i < atual ? '' : undefined} data-melhor={i + 1 === melhor ? '' : undefined} style={{ '--i': i } as CSSProperties} />)}
        </span>
      </button>
      <p id={idDetalhe} className="hr-seq-detalhe" hidden={!aberta}>
        {atual === melhor ? 'Esta é a sua melhor sequência. Treine nesta semana para mantê-la.' : `Sua melhor sequência foi de ${melhor} ${melhor === 1 ? 'semana' : 'semanas'}. Faltam ${melhor - atual + 1} para superá-la.`}
      </p>
    </div>
  );
};

const Cartao: React.FC<{ modalidade: WorkoutExerciseCategory; r: RecordesDaModalidade }> = ({ modalidade, r }) => {
  const Icone = CATEGORY_ICONS[modalidade] ?? CATEGORY_ICONS.mixed;
  const capa = capaDaModalidade(modalidade);
  const itens: Array<[string, React.ReactNode]> = [];
  if (r.maiorTempoAtivoS) itens.push(['Maior treino', minutos(r.maiorTempoAtivoS.valor)]);
  if (r.maiorDistanciaM) itens.push(['Maior distância', r.maiorDistanciaM.valor >= 1000 ? <>{num(r.maiorDistanciaM.valor / 1000, 2)}<small> km</small></> : <>{num(r.maiorDistanciaM.valor)}<small> m</small></>]);
  if (r.maisSeries) itens.push(['Mais séries', <>{num(r.maisSeries.valor)}<small> séries</small></>]);
  itens.push(['Melhor sequência', <>{r.melhorSequenciaDeSemanas}<small> {r.melhorSequenciaDeSemanas === 1 ? 'semana' : 'semanas'}</small></>]);
  return (
    <article className="hr-cartao ds-pane" data-element={elementoDaModalidade(modalidade)} aria-label={`Recordes de ${CATEGORY_LABELS[modalidade]}`}>
      {capa && <img className="hr-capa" src={capa} alt="" loading="lazy" decoding="async" aria-hidden="true" />}
      <div className="hr-cabeca">
        <h3><Icone size={18} aria-hidden="true" />{CATEGORY_LABELS[modalidade]}</h3>
      </div>
      {r.semanasAtivasSeguidas > 0 && <SequenciaChama atual={r.semanasAtivasSeguidas} melhor={Math.max(r.melhorSequenciaDeSemanas, r.semanasAtivasSeguidas)} />}
      <dl className="hr-numeros">
        {itens.map(([rotulo, valor]) => <div key={rotulo}><dt>{rotulo}</dt><dd>{valor}</dd></div>)}
      </dl>
      <p className="hr-rodape">{r.treinos === 1 ? '1 treino' : `${r.treinos} treinos`}{r.maiorTempoAtivoS ? ` · maior treino em ${data(r.maiorTempoAtivoS.data)}` : ''}</p>
    </article>
  );
};

/** Personal bests per modality; read-only, derived from the completed native sessions. */
export const RecordesDaAba: React.FC<Props> = ({ sessions, templates }) => {
  const cartoes = useMemo(() => (Object.keys(CATEGORY_LABELS) as WorkoutExerciseCategory[])
    .map((modalidade) => ({ modalidade, r: recordesDaModalidade(sessions, modalidade, { templates }) }))
    .filter(({ r }) => r.treinos > 0)
    .sort((a, b) => b.r.treinos - a.r.treinos), [sessions, templates]);

  return (
    <section className="hr-secao saude-entra" aria-labelledby="hr-titulo" style={{ '--ordem': 2 } as CSSProperties}>
      <h2 id="hr-titulo">Recordes</h2>
      {cartoes.length === 0 ? (
        <div className="hr-vazio ds-pane">
          <Trophy size={22} aria-hidden="true" />
          <p>Conclua um treino para abrir seus recordes por modalidade.</p>
        </div>
      ) : (
        <ul className="hr-trilho" tabIndex={0} aria-label="Recordes por modalidade, role para o lado">
          {cartoes.map(({ modalidade, r }) => <li key={modalidade}><Cartao modalidade={modalidade} r={r} /></li>)}
        </ul>
      )}
    </section>
  );
};
