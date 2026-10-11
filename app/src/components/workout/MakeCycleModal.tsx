import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FitnessButton } from '@/components/fitness-kit';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutTemplate, WorkoutSequence } from '@/types/workout';

const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export function MakeCycleModal({ template, sequence, onClose }: ({ template: WorkoutTemplate; sequence?: never } | { sequence: WorkoutSequence; template?: never }) & { onClose: () => void }) {
  const [selected, setSelected] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);
  const schedule = useWorkoutStore((state) => state.scheduleWorkoutAsHabit);
  const scheduleRotation = useWorkoutStore((state) => state.scheduleSequenceAsRotation);
  const confirm = () => {
    setSaving(true);
    try {
      if (sequence) scheduleRotation(sequence.id, selected);
      else schedule(template.id, selected);
      onClose();
      toast.success(sequence ? 'A sequência agora está em Ciclos, na ordem escolhida!' : 'O treino agora é um Ciclo e está na sua rotina!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível criar o ciclo.');
      setSaving(false);
    }
  };
  return <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}><DialogContent className="border-white/10 bg-fitness-canvas text-fitness-text"><DialogHeader><DialogTitle>{sequence ? 'Tornar sequência de Ciclos' : 'Tornar treino um Ciclo'}</DialogTitle><DialogDescription>{sequence ? 'Em quais dias da semana você seguirá esta sequência?' : 'Em quais dias da semana você fará este treino?'}</DialogDescription></DialogHeader><p className="break-words font-medium">{sequence?.name ?? template?.name}</p><div role="group" aria-label="Dias da semana" className="grid grid-cols-7 gap-1.5">{days.map((day, index) => <button key={day} type="button" aria-label={day} aria-pressed={selected.includes(index)} disabled={saving} onClick={() => setSelected((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index])} className={`grid min-h-11 place-items-center rounded-full text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary ${selected.includes(index) ? 'bg-fitness-primary text-white' : 'bg-fitness-surface text-fitness-muted'}`}>{day[0]}</button>)}</div><p className="text-xs text-fitness-muted">{selected.length ? selected.slice().sort((a, b) => a - b).map((index) => days[index]).join(', ') : 'Selecione pelo menos um dia.'}</p><div className="grid grid-cols-2 gap-2"><FitnessButton size="md" variant="secondary" disabled={saving} onClick={onClose}>Cancelar</FitnessButton><FitnessButton size="md" disabled={!selected.length || saving} onClick={confirm}>{saving ? 'Criando…' : sequence ? 'Confirmar Sequência' : 'Confirmar Ciclo'}</FitnessButton></div></DialogContent></Dialog>;
}
