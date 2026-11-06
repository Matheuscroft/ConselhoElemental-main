import { ArrowRight } from 'lucide-react';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { QuestVictorySeal } from './QuestRune';
import { QuestProgress, QuestResultStats } from './QuestResultStats';
import type { QuestMilestone } from './quest-milestone';
import type { finishQuestStep } from './quest-commands';

export type QuestReceipt = NonNullable<ReturnType<typeof finishQuestStep>> & { milestone: QuestMilestone };

export function QuestCompletionBody({ receipt, nextTitle, onContinue, onDismiss }: {
  receipt: QuestReceipt; nextTitle?: string; onContinue: () => void; onDismiss: () => void;
}) {
  const { trail, level } = receipt.milestone;
  return <>
    <DialogHeader>
      <QuestVictorySeal />
      <DialogTitle id="quest-receipt-title">{trail?.allRitualsDone ? 'Todos os rituais realizados' : 'Mais um passo realizado'}</DialogTitle>
      <DialogDescription id="quest-receipt-description">{receipt.title}</DialogDescription>
    </DialogHeader>
    {level && !receipt.progress && <div className="quest-level-milestone">
      <ArcaneIcon name="conquista" size={30} />
      <div><span>Você avançou de nível</span><strong>Nível {level.from} <ArrowRight size={16} aria-hidden="true" /> {level.to}</strong></div>
    </div>}
    <QuestResultStats xp={receipt.xp} points={receipt.points} minutes={receipt.minutes} element={receipt.element} progress={receipt.progress} fromLevel={level?.from} />
    {trail && <section className="quest-receipt-trail" aria-label="Progresso da trilha">
      <strong>{trail.title}</strong>
      <p>{trail.done} de {trail.total} rituais concluídos</p>
      <QuestProgress done={trail.done} total={trail.total} />
      {trail.allRitualsDone && <p>Os rituais desta trilha estão concluídos.{trail.recurring > 0 ? ' Os ciclos vinculados continuam no seu calendário.' : ' Você pode revisar a conquista na página de origem.'}</p>}
    </section>}
    <p>Resultado registrado no seu Grimório.</p>
    {nextTitle && <p className="quest-receipt-next">Próxima sugestão: <strong>{nextTitle}</strong></p>}
    <div className="quest-receipt-actions">
      <button className="quest-primary elemental-press" onClick={onContinue}>{nextTitle ? 'Ver próxima etapa' : 'Voltar à trilha'}<ArrowRight size={17} aria-hidden="true" /></button>
      <button className="quest-secondary" onClick={onDismiss}>Fechar resultado</button>
    </div>
  </>;
}
