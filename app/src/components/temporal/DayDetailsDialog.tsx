import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TemporalDayAgenda } from './TemporalDayAgenda';
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
  const dateLabel = date?.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) ?? 'Dia selecionado';
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="temporal-day-dialog max-h-[85dvh] overflow-y-auto border-white/20 bg-void/95 text-white backdrop-blur-xl sm:max-w-xl">
      <DialogHeader><DialogTitle className="capitalize">{dateLabel}</DialogTitle><DialogDescription>Abra uma atividade ou confira o que você fez nesta data.</DialogDescription></DialogHeader>
      {aggregate && <p className="temporal-day-reading">{aggregate.totalCompleted} registros de conclusão · {aggregate.score.toLocaleString('pt-BR')} pontos registrados</p>}
      {date && <TemporalDayAgenda date={date} events={events} commitments={commitments} returnTo={returnTo ?? location.pathname + location.search} />}
    </DialogContent>
  </Dialog>;
}
