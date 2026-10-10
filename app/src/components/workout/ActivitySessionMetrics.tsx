import React from 'react';
import { activityMetrics } from '@/lib/workout/activity-metrics';
import type { WorkoutSession } from '@/types/workout';
export const ActivitySessionMetrics:React.FC<{session:WorkoutSession; earthPoints?:number}> = ({session, earthPoints}) => {
 const metrics=activityMetrics(session);
 return <section className="mt-6 rounded-2xl bg-fitness-surface p-5">
  <h2 className="font-sans text-lg font-semibold">Registro da atividade</h2>
  <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
   <div><dt className="text-fitness-muted">Tempo ativo declarado</dt><dd>{(metrics.seconds/60).toFixed(1)} min</dd></div>
   <div><dt className="text-fitness-muted">Carga percebida</dt><dd>{metrics.load.toFixed(1)} u.a.</dd></div>
   <div><dt className="text-fitness-muted">Esforço médio</dt><dd>{metrics.effort?.toFixed(1) ?? 'Não informado'}{metrics.effort ? ' / 10' : ''}</dd></div>
   <div><dt className="text-fitness-muted">Distância declarada</dt><dd>{metrics.distance > 0 ? `${metrics.distance.toLocaleString('pt-BR')} m` : 'Não informada'}</dd></div>
  </dl>
  <p className="mt-4 text-xs leading-relaxed text-fitness-muted">Carga = minutos ativos × esforço percebido. Só blocos concluídos entram no cálculo; intervalos não entram. Sem tempo e esforço informados, não há estimativa de carga. Tempo do relógio é a duração da sessão.</p>
  {session.exerciseResults.flatMap((result)=>result.sets.filter((set)=>set.completed&&!set.skipped&&set.activityNotes).map((set)=><p className="mt-3 break-words text-sm text-fitness-muted" key={set.id}><strong className="text-fitness-text">{result.exerciseNameSnapshot}: </strong>{set.activityNotes}</p>))}
  <h3 className="mt-5 font-sans text-sm font-semibold">Elementos do treino físico</h3><p className="mt-2 text-sm text-fitness-muted">{session.status === 'in_progress' ? 'Terra (potencial)' : 'Terra'}: {earthPoints ?? session.earthPoints} · Fogo: 0 · Água: 0 · Ar: 0</p>
  <p className="mt-2 text-xs leading-relaxed text-fitness-muted">A regra atual atribui treino físico a Terra. Os outros elementos não recebem pontos por associação automática ao nome do esporte. XP e recursos são confirmados uma única vez ao finalizar.</p>
 </section>;
};
