import { useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MomentoDoDia } from '@/components/momentos/MomentoDoDia';
import { TemporalDayAgenda } from './TemporalDayAgenda';
import { useLuzDoToque } from '@/components/sanctuary/useCenaViva';
import { LuzDaSemanaContext } from './luz-da-semana';
import type { DayAggregate, TemporalCommitment, TemporalEvent } from '@/lib/temporal';

interface DayDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  aggregate: DayAggregate | null;
  events: TemporalEvent[];
  commitments: TemporalCommitment[];
  returnTo?: string;
}

export function DayDetailsDialog({ open, onOpenChange, date, aggregate, events, commitments, returnTo }: DayDetailsDialogProps) {
  const location = useLocation();
  // The dialog is portaled out of the scene, so it takes the week's light from the context and wears it.
  const luz = useContext(LuzDaSemanaContext);
  // Its light follows the finger too, but the scene's listener cannot hear a portal: it listens for itself.
  const [raiz, setRaiz] = useState<HTMLElement | null>(null);
  const raizRef = useMemo(() => ({ current: raiz }), [raiz]);
  useLuzDoToque(raizRef);
  const dateLabel = date?.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) ?? 'Dia selecionado';
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="temporal-day-dialog max-h-[85dvh] overflow-y-auto ds-glass-float text-white sm:max-w-xl" style={luz} data-luz ref={setRaiz}>
      <DialogHeader><DialogTitle className="first-letter:uppercase">{dateLabel}</DialogTitle><DialogDescription>Abra uma atividade ou confira o que você fez nesta data.</DialogDescription></DialogHeader>
      {date && <MomentoDoDia data={date} />}
      {aggregate && <p className="temporal-day-reading">{aggregate.totalCompleted} registros de conclusão · {aggregate.score.toLocaleString('pt-BR')} pontos registrados</p>}
      {date && <TemporalDayAgenda date={date} events={events} commitments={commitments} returnTo={returnTo ?? location.pathname + location.search} />}
    </DialogContent>
  </Dialog>;
}
