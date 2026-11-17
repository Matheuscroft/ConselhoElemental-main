import React, { useMemo, type CSSProperties } from 'react';
import { Flame, Trophy } from 'lucide-react';
import './historico-uau.css';
import { elementoDaModalidade } from './treinos-elementos';
import { capaDaModalidade } from './modalidade-capa';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout/workout-labels';
import { recordesDaModalidade, type RecordesDaModalidade } from '@/lib/workout/progressao';
import type { NativeWorkoutSession, WorkoutExerciseCategory, WorkoutTemplate } from '@/types/workout';

const num = (value: number, digits = 0) => value.toLocaleString('pt-BR', { maximumFractionDigits: digits });
const minutos = (s: number) => (s >= 3600 ? `${Math.floor(s / 3600)} h ${String(Math.round((s % 3600) / 60)).padStart(2, '0')} min` : `${Math.round(s / 60)} min`);
const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
const semanas = (n: number) => (n === 1 ? '1 semana' : `${n} semanas`);

interface Props {
  sessions: readonly NativeWorkoutSession[];
  templates: readonly Pick<WorkoutTemplate, 'id' | 'modality'>[];
}

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
        {r.semanasAtivasSeguidas > 0 && (
          <span className="hr-chama"><Flame size={16} aria-hidden="true" />{semanas(r.semanasAtivasSeguidas)} seguidas</span>
        )}
      </div>
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
