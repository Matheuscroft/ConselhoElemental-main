import { useId, useState } from 'react';
import { toast } from 'sonner';
import { Repeat2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Contagem } from '@/components/motion/Contagem';
import { DialogoCabeca } from '@/components/fitness-kit/dialogo-cabeca';
import { useLuzDoDialogo } from '@/components/fitness-kit/dialogo-luz';
import '@/components/fitness-kit/dialogo-uau.css';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutTemplate, WorkoutSequence } from '@/types/workout';

const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const shortDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const presets = [
  { label: 'Todos os dias', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'Dias úteis', days: [1, 2, 3, 4, 5] },
  { label: 'Fim de semana', days: [0, 6] },
];

export function MakeCycleModal({ template, sequence, onClose }: ({ template: WorkoutTemplate; sequence?: never } | { sequence: WorkoutSequence; template?: never }) & { onClose: () => void }) {
  const [selected, setSelected] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);
  const titleId = useId();
  const ligarLuz = useLuzDoDialogo();
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
  const sameDays = (preset: number[]) => preset.length === selected.length && preset.every((day) => selected.includes(day));
  const ordered = selected.slice().sort((a, b) => a - b);
  return <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
    <DialogContent ref={ligarLuz} data-luz="" data-element="fogo" aria-labelledby={titleId} showCloseButton={false} overlayClassName="dialogo-veu" className="dialogo-treino dg-compacto ds-glass-float">
      <DialogoCabeca icone={Repeat2} sobretitulo="Ciclos">
        <DialogTitle id={titleId} className="dg-titulo">{sequence ? 'Tornar sequência de Ciclos' : 'Tornar treino um Ciclo'}</DialogTitle>
        <DialogDescription className="dg-descricao">{sequence ? 'Em quais dias da semana você seguirá esta sequência?' : 'Em quais dias da semana você fará este treino?'}</DialogDescription>
      </DialogoCabeca>
      <div className="dg-corpo">
        <p className="dg-alvo ds-pane">{sequence?.name ?? template?.name}</p>
        <div className="dg-atalhos" role="group" aria-label="Atalhos de dias">
          {presets.map((preset) => <button key={preset.label} type="button" className="dg-chip" aria-pressed={sameDays(preset.days)} disabled={saving} onClick={() => setSelected(preset.days)}><span>{preset.label}</span></button>)}
        </div>
        <div role="group" aria-label="Dias da semana" className="dg-dias">{days.map((day, index) => <button key={day} type="button" aria-label={day} aria-pressed={selected.includes(index)} disabled={saving} className="dg-dia" onClick={() => setSelected((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index])}><span aria-hidden="true">{shortDays[index]}</span></button>)}</div>
        <p className="dg-leitura" role="status">{selected.length
          ? <><span className="sr-only">{selected.length} {selected.length === 1 ? 'dia' : 'dias'} por semana: {ordered.map((index) => days[index]).join(', ')}</span><span aria-hidden="true"><Contagem valor={selected.length} formatar={(valor) => String(Math.round(valor))} className="dg-resumo-numero" /> {selected.length === 1 ? 'dia' : 'dias'} por semana · {ordered.map((index) => shortDays[index]).join(', ')}</span></>
          : 'Selecione pelo menos um dia.'}</p>
      </div>
      <footer className="dg-pe">
        <div className="dg-pe-acoes"><button type="button" className="dg-btn" data-tipo="fantasma" disabled={saving} onClick={onClose}>Cancelar</button><button type="button" className="dg-btn" data-tipo="primario" disabled={!selected.length || saving} onClick={confirm}>{saving ? 'Criando…' : sequence ? 'Confirmar Sequência' : 'Confirmar Ciclo'}</button></div>
      </footer>
    </DialogContent>
  </Dialog>;
}
