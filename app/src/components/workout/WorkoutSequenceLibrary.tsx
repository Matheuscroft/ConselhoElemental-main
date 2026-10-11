import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Layers3, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { FitnessButton, FitnessCard, SectionHeader } from '@/components/fitness-kit';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppStore } from '@/stores/appStore';
import type { UUIDv4, WorkoutExerciseCategory, WorkoutSequence } from '@/types/workout';
import { MakeCycleModal } from './MakeCycleModal';
import { asWorkoutSequence, deactivateWorkoutSequence } from '@/lib/workout/shared-sequences';

const field = 'h-11 w-full rounded-xl border border-white/10 bg-fitness-canvas px-3 text-fitness-text outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary';

function CreateSequenceModal({ onClose }: { onClose: () => void }) {
  const templates = useWorkoutStore((state) => state.templates);
  const save = useWorkoutStore((state) => state.saveSequence);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ids, setIds] = useState<UUIDv4[]>([]);
  const move = (index: number, direction: number) => setIds((current) => {
    const next = [...current]; const target = index + direction;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]]; return next;
  });
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent overlayClassName="bottom-[calc(4rem+env(safe-area-inset-bottom))]" className="max-w-xl overflow-y-auto border-white/10 bg-fitness-canvas text-fitness-text" style={{ top: 'calc((100dvh - 4rem - env(safe-area-inset-bottom)) / 2)', maxHeight: 'calc(100dvh - 6rem - env(safe-area-inset-bottom) - env(safe-area-inset-top))' }}><DialogHeader><DialogTitle>Criar sequência</DialogTitle><DialogDescription>Organize dois ou mais treinos. A sequência fica na biblioteca até você ativá-la em Ciclos.</DialogDescription></DialogHeader><form className="space-y-5" onSubmit={(event) => {
    event.preventDefault();
    const saved = save({ name, description, templateIds: ids });
    if (!saved) { toast.error('Informe um nome e escolha ao menos dois treinos disponíveis.'); return; }
    toast.success('Sequência salva na biblioteca.'); onClose();
  }}><label className="block space-y-2 text-sm">Nome<input required maxLength={100} className={field} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Treino ABC" /></label><label className="block space-y-2 text-sm">Descrição<textarea className={`${field} h-20 py-3`} maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Objetivo ou organização da sequência" /></label><section className="space-y-2"><h3 className="font-medium">Ordem dos treinos</h3><ol className="space-y-2">{ids.map((id, index) => <li key={id} className="flex items-center gap-2 rounded-xl bg-fitness-surface p-3"><span className="text-fitness-primary">{index + 1}</span><span className="min-w-0 flex-1 break-words text-sm">{templates.find((template) => template.id === id)?.name ?? 'Treino indisponível'}</span><button type="button" className="grid h-11 w-9 place-items-center disabled:opacity-30" aria-label={`Mover treino ${index + 1} para cima`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={17} /></button><button type="button" className="grid h-11 w-9 place-items-center disabled:opacity-30" aria-label={`Mover treino ${index + 1} para baixo`} disabled={index === ids.length - 1} onClick={() => move(index, 1)}><ArrowDown size={17} /></button><button type="button" className="grid h-11 w-9 place-items-center text-fitness-muted" aria-label={`Remover treino ${index + 1} da sequência`} onClick={() => setIds((current) => current.filter((value) => value !== id))}><Trash2 size={17} /></button></li>)}</ol>{ids.length < 2 && <p className="text-xs text-fitness-muted">Selecione pelo menos dois treinos diferentes.</p>}</section><fieldset className="space-y-2"><legend className="mb-2 font-medium">Sua biblioteca de treinos</legend><div className="max-h-52 space-y-2 overflow-y-auto">{templates.map((template) => <label key={template.id} className="flex min-h-12 items-center gap-3 rounded-xl bg-fitness-surface p-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-violet-500" checked={ids.includes(template.id)} onChange={(event) => setIds((current) => event.target.checked ? [...current, template.id] : current.filter((id) => id !== template.id))} /><span className="break-words">{template.name}</span></label>)}</div></fieldset><div className="grid grid-cols-2 gap-2"><FitnessButton size="md" variant="secondary" onClick={onClose}>Cancelar</FitnessButton><FitnessButton size="md" type="submit" disabled={!name.trim() || ids.length < 2}>Salvar sequência</FitnessButton></div></form></DialogContent></Dialog>;
}

export function WorkoutSequenceLibrary({ modality }: { modality?: WorkoutExerciseCategory }) {
  const legacySequences = useWorkoutStore((state) => state.sequences);
  const accountId = useWorkoutStore((state) => state.currentAccountId);
  const migrateLegacySequences = useWorkoutStore((state) => state.migrateLegacySequences);
  const templates = useWorkoutStore((state) => state.templates);
  const rotations = useAppStore((state) => state.cycleSequences);
  const sequences = rotations.filter((sequence) => sequence.memberRestriction === 'WORKOUT').map(asWorkoutSequence);
  useEffect(() => { migrateLegacySequences(); }, [legacySequences, accountId, migrateLegacySequences]);
  const [creating, setCreating] = useState(false);
  const [activating, setActivating] = useState<WorkoutSequence | null>(null);
  const visible = modality ? sequences.filter((sequence) => sequence.templateIds.some((id) => templates.some((template) => template.id === id && template.modality === modality))) : sequences;
  return <section className="space-y-4"><SectionHeader title="Sequências" subtitle="Treinos em uma ordem que se repete." /><FitnessButton size="md" variant="secondary" className="w-full" disabled={templates.length < 2} onClick={() => setCreating(true)}><Plus size={17} />Criar sequência</FitnessButton>{templates.length < 2 && <p className="text-xs text-fitness-muted">Crie pelo menos dois treinos para montar uma sequência.</p>}{visible.map((sequence) => {
    const active = rotations.some((rotation) => rotation.id === sequence.id && rotation.isActive);
    const valid = sequence.templateIds.length >= 2 && sequence.templateIds.every((id) => templates.some((template) => template.id === id));
    return <FitnessCard key={sequence.id} className="space-y-4 p-5"><div className="flex items-center gap-3"><Layers3 size={21} className="text-fitness-primary" /><h3 className="break-words font-semibold">{sequence.name}</h3></div>{sequence.description && <p className="text-sm text-fitness-muted">{sequence.description}</p>}<ol className="space-y-2">{sequence.templateIds.map((id, index) => <li key={`${id}-${index}`} className="flex gap-3 text-sm"><span className="text-fitness-primary">{index + 1}</span>{templates.find((template) => template.id === id)?.name ?? 'Treino indisponível'}</li>)}</ol><FitnessButton size="md" variant="secondary" className={`w-full ${active ? 'text-emerald-300' : ''}`} disabled={!active && !valid} onClick={() => { if (active) { deactivateWorkoutSequence(sequence.id); toast.success('Sequência devolvida ao planejamento.'); } else setActivating(sequence); }}>{active ? 'Desativar e voltar ao planejamento' : 'Tornar Sequência de Ciclos'}</FitnessButton>{!valid && <p className="text-xs text-fitness-muted">Esta sequência precisa de pelo menos dois treinos disponíveis.</p>}</FitnessCard>;
  })}{!visible.length && <p className="text-sm text-fitness-muted">Suas sequências aparecerão aqui.</p>}{creating && <CreateSequenceModal onClose={() => setCreating(false)} />}{activating && <MakeCycleModal sequence={activating} onClose={() => setActivating(null)} />}</section>;
}

