import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Dumbbell, Flower2, PersonStanding, Footprints, Plus, Play, Repeat2, Layers3, Pencil, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppStore } from '@/stores/appStore';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';
import { FitnessButton, FitnessCard, FitnessCategoryGrid, FitnessEmptyState, FitnessHeader, FitnessListRow, FitnessPageShell, SectionHeader } from '@/components/fitness-kit';
import { FitnessEmbeddedContext } from '@/components/fitness-kit/FitnessEmbeddedContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NativeTemplateDialog } from '@/components/workout/NativeTemplateDialog';
import { ExerciseDetailSheet } from '@/components/workout/ExerciseDetailSheet';
import { WorkoutHistory } from './WorkoutHistory';
import { Corpo } from '@/pages/Corpo';
import type { Exercise, WorkoutExerciseCategory, WorkoutTemplate } from '@/types/workout';
import { CATEGORY_ICONS } from '@/lib/workout';

const modalities = [
  { id: 'yoga', label: 'Yoga', icon: Flower2, description: 'Respiração e equilíbrio' },
  { id: 'calisthenics', label: 'Calistenia', icon: PersonStanding, description: 'Força com o próprio corpo' },
  { id: 'strength', label: 'Musculação', icon: Dumbbell, description: 'Séries e cargas' },
  { id: 'running', label: 'Corrida', icon: Footprints, description: 'Ritmo e resistência' },
  { id: 'swimming', label: 'Natação', icon: CATEGORY_ICONS.swimming, description: 'Técnica e movimento' },
  { id: 'cycling', label: 'Ciclismo', icon: CATEGORY_ICONS.cycling, description: 'Cadência e distância' },
] satisfies { id: WorkoutExerciseCategory; label: string; icon: typeof Dumbbell; description: string }[];

function TemplateCard({ template, catalog }: { template: WorkoutTemplate; catalog: Exercise[] }) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const startSession = useWorkoutStore((state) => state.startSession);
  const active = useWorkoutStore((state) => state.activeNativeSession);
  const previewReward = useWorkoutStore((state) => state.previewTemplateReward);
  const reward = previewReward(template.id);
  const series = template.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  return <FitnessCard className="space-y-4 p-5">
    <h3><button type="button" aria-expanded={expanded} aria-controls={`template-content-${template.id}`} onClick={() => setExpanded((value) => !value)} className="flex min-h-11 w-full items-start gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-fitness-primary/15 text-fitness-primary"><Dumbbell size={21} /></span><span className="min-w-0 flex-1"><span className="block break-words text-lg font-semibold">{template.name}</span><span className="mt-1 block text-sm font-normal text-fitness-muted">{template.exercises.length} exercícios · {series} séries</span></span><ChevronDown size={20} className={`mt-3 shrink-0 text-fitness-muted transition-transform ${expanded ? 'rotate-180' : ''}`} /></button></h3>
    {reward && <div className="space-y-2"><span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 font-semibold text-emerald-800">{formatEarthXp(reward.earthXp)} XP <span aria-label="Terra">🌿</span></span><p className="text-xs text-fitness-muted">Estimativa · {reward.estimatedDurationMinutes} min planejados · esforço {reward.effortLevel}. O ganho depende do que você concluir.</p></div>}
    <FitnessButton size="md" className="w-full" disabled={!!active || template.exercises.length === 0} onClick={() => {
      const session = startSession(template.id);
      if (session) navigate(`/fitness/ativo/${session.id}`);
      else toast.error('Não foi possível iniciar o treino. Confira a sessão em andamento.');
    }}><Play size={17} />{active?.templateId === template.id ? 'Sessão em andamento' : 'Executar Agora'}</FitnessButton>
    <div id={`template-content-${template.id}`} hidden={!expanded} className="space-y-4">
    <ol aria-label={`Composição de ${template.name}`} className="space-y-3 rounded-xl bg-fitness-canvas/60 p-3">
      {template.exercises.slice().sort((a, b) => a.order - b.order).map((exercise, index) => <li key={exercise.id} className="space-y-2"><p className="text-sm font-medium"><span className="mr-2 text-fitness-primary">{index + 1}.</span>{exercise.exerciseNameSnapshot}</p><div className="flex flex-wrap gap-1.5">{exercise.sets.map((set) => <span key={set.id} className="rounded-lg bg-fitness-primary/10 px-2 py-1 text-xs text-fitness-muted">{set.setNumber} · {set.measureMode === 'reps' ? `${set.targetReps ?? '—'} reps` : `${set.targetDurationSeconds ?? '—'}s`}{(set.targetLoadKg ?? 0) > 0 ? ` · ${set.targetLoadKg?.toLocaleString('pt-BR')} kg` : ''} · {set.restSeconds ?? 0}s pausa{set.loadFactor === 1.5 ? ' · PR' : set.loadFactor === 0.8 ? ' · Leve' : ''}</span>)}</div></li>)}
    </ol>
    <FitnessButton size="md" variant="secondary" className="w-full" onClick={() => setEditing(true)}><Pencil size={16} />Editar treino</FitnessButton>
    {editing && <NativeTemplateDialog template={template} catalog={catalog} modality={template.modality} onClose={() => setEditing(false)} />}

    <div className="grid grid-cols-2 gap-2">
      <FitnessButton size="md" variant="secondary" className="px-2 text-sm" onClick={() => {
        // TODO: Integrar Core
        toast.info('O agendamento estará disponível na próxima etapa.');
      }}><CalendarDays size={16} />Agendar</FitnessButton>
      <FitnessButton size="md" variant="secondary" className="px-2 text-sm" onClick={() => {
        // TODO: Integrar Core
        toast.info('A criação de ciclos estará disponível na próxima etapa.');
      }}><Repeat2 size={16} />Tornar Ciclo</FitnessButton>
    </div>
    </div>
  </FitnessCard>;
}

export function FitnessRoot() {
  const accountId = useWorkoutStore((state) => state.currentAccountId);
  return <FitnessLibraryRoot key={accountId ?? 'local'} />;
}

function NativeSessionHistory() {
  const history = useWorkoutStore((state) => state.nativeHistory);
  const logs = useAppStore((state) => state.executionLogs);
  return <section className="mb-8 space-y-4" aria-label="Histórico de sessões nativas"><SectionHeader title="Sessões registradas" />{history.length === 0 ? <p className="text-sm text-fitness-muted">Seus treinos concluídos aparecerão aqui.</p> : history.slice().sort((a, b) => Date.parse(b.completedAt ?? b.startedAt) - Date.parse(a.completedAt ?? a.startedAt)).map((session) => {
    const log = logs.find((item) => item.id === session.coreExecutionLogId || (item.sourceModule === 'modulo_treino' && item.sourceRefId === session.id));
    return <FitnessCard key={session.id} className="space-y-3 p-5"><h3 className="font-semibold">{session.nameSnapshot}</h3><p className="text-sm text-fitness-muted">{new Date(session.completedAt ?? session.startedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {Math.floor(session.durationSeconds / 60)}min {session.durationSeconds % 60}s</p>{log ? <p className="flex flex-wrap items-center gap-2 text-2xl font-semibold text-emerald-300">Ganho: +{formatEarthXp(log.executedValue)} XP <span aria-label="Terra">🌿</span></p> : <p className="text-sm text-fitness-muted">Recompensa sem registro ativo no Core.</p>}<p className="text-xs text-fitness-muted">({session.totalER.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ER)</p></FitnessCard>;
  })}</section>;
}

function FitnessLibraryRoot() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = ['history', 'body'].includes(params.get('tab') ?? '') ? params.get('tab')! : 'workouts';
  const requested = params.get('modalidade');
  const modality = modalities.find((item) => item.id === requested);
  const catalog = useWorkoutStore((state) => state.nativeCatalog);
  const templates = useWorkoutStore((state) => state.templates);
  const sequences = useWorkoutStore((state) => state.sequences);
  const active = useWorkoutStore((state) => state.activeNativeSession);
  const ensureCatalog = useWorkoutStore((state) => state.ensureNativeCatalog);
  const [createOpen, setCreateOpen] = useState(false);
  const [presetId, setPresetId] = useState<string>();
  const [detail, setDetail] = useState<Exercise | null>(null);
  useEffect(() => { ensureCatalog(); }, [ensureCatalog]);
  const selectedCatalog = useMemo(() => catalog.filter((exercise) => exercise.modality === modality?.id), [catalog, modality]);
  const selectedTemplates = templates.filter((template) => template.modality === modality?.id);
  const selectedIds = new Set(selectedTemplates.map((template) => template.id));
  const selectedSequences = sequences.filter((sequence) => sequence.templateIds.some((id) => selectedIds.has(id)));
  const updateParam = (key: string, value?: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next); };
  const selectTab = (value: string) => {
    const next = new URLSearchParams(params);
    next.set('tab', value);
    if (value === 'workouts') {
      next.delete('modalidade');
      setDetail(null);
      setCreateOpen(false);
      setPresetId(undefined);
    }
    setParams(next);
  };
  const adaptedDetail = detail ? { ...detail, category: detail.modality } : null;

  return <FitnessPageShell focused withNav showPageMap={false}>
    <div className="mx-auto max-w-xl">
      <FitnessHeader title={tab === 'workouts' && modality ? modality.label : 'Exercício Físico'} subtitle="Biblioteca de treinos" onBack={() => { if (tab === 'workouts' && modality) updateParam('modalidade'); else navigate('/pilares'); }} backLabel={modality && tab === 'workouts' ? 'Voltar às modalidades' : 'Voltar aos Pilares'} />
      <Tabs value={tab} onValueChange={selectTab} className="mt-6">
        <TabsList aria-label="Seções de Exercício Físico" className="grid h-12 w-full grid-cols-3 rounded-2xl bg-fitness-surface p-1">
          {([['workouts', 'Treinos'], ['history', 'Histórico'], ['body', 'O Corpo']] as const).map(([value, label]) => <TabsTrigger key={value} value={value} onClick={() => { if (value === 'workouts' && tab === 'workouts') selectTab(value); }} className="h-10 rounded-xl text-fitness-muted data-[state=active]:bg-fitness-primary data-[state=active]:text-white">{label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="workouts" className="mt-6 space-y-8 pb-12">
            {active && <FitnessCard className="border border-fitness-primary/30 p-5"><div className="flex items-center gap-2 text-fitness-primary"><Play size={17} /><p className="font-medium">Sessão em andamento</p></div><p className="mt-2 break-words text-lg font-semibold">{active.nameSnapshot}</p><FitnessButton size="md" className="mt-4 w-full" onClick={() => navigate(`/fitness/ativo/${active.id}`)}>Retomar treino</FitnessButton></FitnessCard>}
          {!modality ? <><SectionHeader title="Explorar modalidades" subtitle="Encontre seus exercícios e organize seus treinos." /><FitnessCategoryGrid options={modalities} selectedId={null} ariaLabel="Modalidades de exercício físico" onSelect={(id) => updateParam('modalidade', id)} /></> : <>

            <section className="space-y-4"><SectionHeader title="Meus Treinos" />{selectedTemplates.length ? selectedTemplates.map((template) => <TemplateCard key={template.id} template={template} catalog={selectedCatalog} />) : <FitnessEmptyState message="Monte seu primeiro treino com os exercícios desta modalidade." action={<FitnessButton size="md" onClick={() => { setPresetId(undefined); setCreateOpen(true); }}>Criar treino</FitnessButton>} />}</section>
            <section className="space-y-4"><SectionHeader title="Sequências" />{selectedSequences.length ? selectedSequences.map((sequence) => <FitnessCard key={sequence.id} className="p-5"><div className="flex items-center gap-3"><Layers3 className="text-fitness-primary" size={21} /><h3 className="font-semibold">{sequence.name}</h3></div><ol className="mt-3 space-y-2">{sequence.templateIds.map((id, index) => <li key={`${id}-${index}`} className="flex gap-3 text-sm text-fitness-muted"><span className="text-fitness-primary">{index + 1}</span>{templates.find((template) => template.id === id)?.name ?? 'Treino indisponível'}</li>)}</ol></FitnessCard>) : <p className="rounded-fit bg-fitness-surface/50 p-5 text-sm text-fitness-muted">Suas sequências de treinos aparecerão aqui, na ordem planejada.</p>}</section>
            <section className="space-y-4"><SectionHeader title="Catálogo" subtitle={`${selectedCatalog.length} exercícios de ${modality.label}`} />{selectedCatalog.length ? selectedCatalog.map((exercise) => <FitnessListRow key={exercise.id} icon={CATEGORY_ICONS[exercise.modality]} title={exercise.name} subtitle={exercise.focus} onClick={() => setDetail(exercise)} ariaLabel={`Ver ${exercise.name}`} />) : <FitnessEmptyState message="Esta modalidade ainda não tem exercícios no catálogo." />}</section>
          </>}
        </TabsContent>
        <FitnessEmbeddedContext.Provider value>
          <TabsContent value="history" className="mt-6"><NativeSessionHistory /><WorkoutHistory /></TabsContent>
          <TabsContent value="body" className="mt-6"><Corpo /></TabsContent>
        </FitnessEmbeddedContext.Provider>
      </Tabs>
    </div>
    {tab === 'workouts' && modality && <button type="button" aria-label="Criar treino" onClick={() => { setPresetId(undefined); setCreateOpen(true); }} className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-fitness-primary text-white shadow-fitness-primary outline-none focus-visible:ring-2 focus-visible:ring-white md:right-8"><Plus className="h-7 w-7" /></button>}
    {createOpen && modality && <NativeTemplateDialog catalog={selectedCatalog} modality={modality.id} presetId={presetId} onClose={() => setCreateOpen(false)} />}
    <ExerciseDetailSheet variant="fitness" exercise={adaptedDetail} open={!!detail} onOpenChange={(open) => { if (!open) setDetail(null); }} onAddToWorkout={(exercise) => { setPresetId(exercise.id); setDetail(null); setCreateOpen(true); }} />
  </FitnessPageShell>;
}
