import { RewardSummary } from '@/components/rewards/RewardSummary';
import type { ElementId } from '@/types';
import type { LevelProgress } from '@/services/leveling-calculator';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { achievementPlan, type AchievementKind } from '@/lib/achievement-completion';
import { trailHref } from './quest-path';
import { QuestRune } from './QuestRune';

const names = { terra: 'Terra', fogo: 'Fogo', agua: 'Água', ar: 'Ar' };
const number = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function AchievementCompletion({ kind, id }: { kind: AchievementKind; id: string }) {
  const accountId = useAppStore(s => s.currentAccountId);
  return <CompletionPanel key={`${accountId}:${kind}:${id}`} kind={kind} id={id} />;
}

function CompletionPanel({ kind, id }: { kind: AchievementKind; id: string }) {
  const state = useAppStore(useShallow(s => ({ tasks: s.tasks, habits: s.habits, quests: s.quests, projects: s.projects,
    currentAccountId: s.currentAccountId, setAchievementCompleted: s.setAchievementCompleted, getLevelProgress: s.getLevelProgress })));
  const plan = useMemo(() => achievementPlan(state, kind, id), [state, kind, id]);
  const [review, setReview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ message: string; amount: number; element: ElementId; fromLevel: number; progress: LevelProgress; completed: boolean; changed: boolean } | null>(null);
  const busy = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (result) resultRef.current?.focus({ preventScroll: true }); }, [result]);
  if (!plan) return null;
  const completed = plan.trail.completed;
  const label = kind === 'quest' ? 'Jornada' : 'Grande Obra';
  const reviewing = review === plan.signature;
  const confirm = () => {
    if (!reviewing || busy.current) return;
    busy.current = true;
    setError('');
    try {
      const fromLevel = state.getLevelProgress().level;
      const receipt = state.setAchievementCompleted(kind, id, !completed, state.currentAccountId, plan.signature);
      setResult({ message: receipt.changed ? `${label} ${completed ? 'reaberta' : 'concluída'}.` : 'Esta alteração já foi registrada.', amount: receipt.amount, element: plan.element, fromLevel, progress: state.getLevelProgress(), completed: !completed, changed: receipt.changed });
      setReview(null);
    } catch (reason) {
      busy.current = false;
      setError(`${reason instanceof Error ? reason.message : 'Não foi possível confirmar.'} Confira o estado da conquista antes de tentar novamente.`);
    }
  };
  return <section className="achievement-completion" data-element={plan.element} aria-label={`Conclusão da ${label}`}>
    <div className="achievement-heading"><QuestRune element={plan.element} size={36} /><div>
      <h3>{completed ? 'Conquista registrada' : 'Feche este capítulo'}</h3>
      <p>{completed ? (plan.entity.completionBonus ? `Bônus recebido: ${number(plan.amount)} XP · ${names[plan.element]}` : 'Conclusão anterior sem recibo de bônus. Nenhum XP será debitado ao reabrir.')
        : plan.amount > 0 && plan.validAmount ? `Bônus da conquista: +${number(plan.amount)} XP · ${names[plan.element]}` : 'O XP dos rituais é recebido em cada atividade. Esta conquista não tem bônus adicional configurado.'}</p>
    </div></div>
    {result && result.completed === completed && <div role="status" tabIndex={-1} ref={resultRef} className="achievement-reward-result"><p>{result.message}</p>{result.changed && <RewardSummary xp={result.amount} elements={[{element: result.element, amount: result.amount}]} progress={result.progress} fromLevel={result.fromLevel} animate />}</div>}
    {plan.trail.archived ? <p>Esta obra está arquivada.</p> : !completed && !plan.canComplete ? <p>
      {plan.pending.length ? <>{plan.pending.length} rituais ainda precisam de conclusão ou revisão. <Link to={trailHref(plan.trail.key)}>Ver etapas</Link></> : 'O valor do bônus precisa de revisão antes da conclusão.'}
    </p> : <>
      {!reviewing ? <button type="button" className="quest-secondary" onClick={() => { busy.current = false; setReview(plan.signature); setResult(null); setError(''); }}>
        {completed ? <RotateCcw size={18} /> : <Check size={18} />}{completed ? `Reabrir ${label}` : `Concluir ${label}`}
      </button> : <div className="achievement-review">
        <p>{completed ? `Reabrir retira somente o bônus registrado de ${number(plan.amount)} XP. Os rituais e seus ganhos ficam preservados.`
          : `Confirme que você alcançou esta conquista. ${plan.trail.total ? 'Os rituais vinculados estão concluídos.' : 'Esta conquista não tem rituais pontuais vinculados.'} Ciclos continuam na rotina; suas atividades não recebem XP novamente.`}</p>
        <div className="achievement-actions"><button type="button" className="quest-secondary" onClick={() => setReview(null)}>Cancelar</button>
          <button type="button" className="quest-primary" onClick={confirm}>{completed ? 'Confirmar reabertura' : 'Confirmar conclusão'}</button></div>
      </div>}
    </>}
    {error && <p className="quest-error" role="alert">{error}</p>}
  </section>;
}
