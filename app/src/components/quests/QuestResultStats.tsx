import { Clock3, Sparkles, Target } from 'lucide-react';

/** Read-only receipt presentation. Animation never grants or recalculates rewards. */
export function QuestResultStats({ xp, points, minutes }: { xp: number; points: number | null; minutes: number | null | undefined }) {
  return <dl className="quest-receipt-stats">
    <div><dt><Sparkles size={20} aria-hidden="true" />XP registrado</dt><dd>{xp.toLocaleString('pt-BR')}</dd></div>
    <div><dt><Target size={20} aria-hidden="true" />Pontos registrados</dt><dd>{points === null ? '—' : points.toLocaleString('pt-BR')}</dd></div>
    <div><dt><Clock3 size={20} aria-hidden="true" />Tempo dedicado</dt><dd>{minutes == null ? '—' : `${minutes.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min`}</dd></div>
  </dl>;
}

export function QuestProgress({ done, total }: { done: number; total: number }) {
  const scale = Math.min(1, Math.max(0, done / Math.max(1, total)));
  return <div className="quest-progress" role="progressbar" aria-label="Rituais concluídos nesta trilha" aria-valuemin={0} aria-valuemax={Math.max(1, total)} aria-valuenow={Math.min(Math.max(0, done), Math.max(1, total))} aria-valuetext={`${done} de ${total} rituais concluídos`}>
    <span aria-hidden="true" style={{ transform: `scaleX(${scale})` }} />
  </div>;
}
