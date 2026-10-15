import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Dumbbell, Plus, Play, Repeat2, Pencil, ChevronDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppStore } from '@/stores/appStore';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';
import { calculateEstimatedDuration } from '@/lib/workout/workout-duration';
import { getWorkoutFocus, getExerciseFocus } from '@/lib/workout/workout-focus';
import { FitnessButton, FitnessCard, FitnessCategoryGrid, FitnessHeader, FitnessPageShell, FitnessListRow, SectionHeader } from '@/components/fitness-kit';
import { FitnessEmbeddedContext } from '@/components/fitness-kit/FitnessEmbeddedContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NativeTemplateDialog } from '@/components/workout/NativeTemplateDialog';
import { WorkoutSequenceLibrary } from '@/components/workout/WorkoutSequenceLibrary';
import { MuscleExerciseCatalog } from '@/components/workout/MuscleExerciseCatalog';
import { MakeCycleModal } from '@/components/workout/MakeCycleModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ExerciseDetailSheet } from '@/components/workout/ExerciseDetailSheet';
import { WorkoutHistory } from './WorkoutHistory';
import { HealthDashboard } from './HealthDashboard';
import { HealthInsights } from './HealthInsights';
import { HealthWeeklySummary } from './HealthWeeklySummary';
import { Corpo } from '@/pages/Corpo';
import type { Exercise, Workout, WorkoutExerciseCategory, WorkoutTemplate } from '@/types/workout';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout';
import type { CategoryOption } from '@/components/fitness-kit';
import { RunningReferenceIcon, CoreReferenceIcon, SwimmingReferenceIcon, MartialArtsReferenceIcon, YogaReferenceIcon, CyclingReferenceIcon } from '@/components/fitness-kit/WorkoutReferenceIcons';

const EMPTY_WORKOUTS: Workout[] = [];
const modalities = [
  { id: 'running', label: 'Corrida', icon: RunningReferenceIcon },
  { id: 'calisthenics', label: 'Calistenia', icon: CoreReferenceIcon },
  { id: 'swimming', label: 'Natação', icon: SwimmingReferenceIcon },
  { id: 'martial_arts', label: 'Artes marciais', icon: MartialArtsReferenceIcon },
  { id: 'yoga', label: 'Yoga', icon: YogaReferenceIcon },
  { id: 'cycling', label: 'Ciclismo', icon: CyclingReferenceIcon },
  { id: 'strength', label: 'Musculação', icon: Dumbbell },
] satisfies (CategoryOption & { id: WorkoutExerciseCategory })[];

function LegacyTemplateCard({ workout, catalog }: { workout: Workout; catalog: Exercise[] }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  return <FitnessCard className="space-y-4 p-5">
    <h3 className="break-words text-lg font-semibold">{workout.name}</h3>
    <p className="text-sm text-fitness-muted">{workout.exercises.length} exercícios · {workout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} séries</p>
    <div className="grid grid-cols-2 gap-2"><FitnessButton size="md" onClick={() => navigate(`/treinos/preview/${workout.id}`)}>Ver treino</FitnessButton><FitnessButton variant="secondary" size="md" onClick={() => setEditing(true)}><Pencil size={16} />Editar</FitnessButton></div>
    {editing && <NativeTemplateDialog legacyWorkout={workout} catalog={catalog} modality={workout.category} onClose={() => setEditing(false)} />}
  </FitnessCard>;
}

function TemplateCard({ template, catalog }: { template: WorkoutTemplate; catalog: Exercise[] }) {
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState(params.get('edit') === template.id);
  const [confirmDelete, setConfirmDelete] = useState(params.get('delete') === template.id);
  useEffect(() => {
    if (params.get('edit') === template.id || params.get('delete') === template.id) {
      const next = new URLSearchParams(params); next.delete('edit'); next.delete('delete'); setParams(next, { replace: true });
    }
  }, [params, setParams, template.id]);
  const [cycleOpen, setCycleOpen] = useState(false);
  const hasCycle = useAppStore((state) => state.habits.some((habit) => habit.sourceModule === 'modulo_treino' && habit.sourceRefId === template.id && !habit.controlledBySequenceId));
  const deleteTemplate = useWorkoutStore((state) => state.deleteTemplate);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const startSession = useWorkoutStore((state) => state.startSession);
  const active = useWorkoutStore((state) => state.activeNativeSession);
  const previewReward = useWorkoutStore((state) => state.previewTemplateReward);
  const reward = previewReward(template.id);
  const series = template.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const focus = getWorkoutFocus(template, catalog);
  return <FitnessCard className="space-y-4 p-5">
    <h3 className="font-sans"><button type="button" aria-expanded={expanded} aria-controls={`template-content-${template.id}`} onClick={() => setExpanded((value) => !value)} className="flex min-h-11 w-full items-start gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-fitness-primary/15 text-fitness-primary">{focus ? <span role="img" aria-label={`Foco predominante: ${focus.label}`} className="text-2xl">{focus.emoji}</span> : <Dumbbell size={21} />}</span><span className="min-w-0 flex-1"><span className="block break-words text-lg font-semibold">{template.name}</span><span className="mt-1 block text-sm font-normal text-fitness-muted">{template.exercises.length} exercícios · {series} séries</span></span><ChevronDown size={20} className={`mt-3 shrink-0 text-fitness-muted transition-transform ${expanded ? 'rotate-180' : ''}`} /></button></h3>
    {reward && <div className="space-y-2"><span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 font-semibold text-emerald-800">{formatEarthXp(reward.earthXp)} XP <span aria-label="Terra">🌿</span></span><p className="text-xs text-fitness-muted">Estimativa · {(reward.activeDurationSeconds / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min ativos · esforço {reward.effortLevel}. {reward.estimatedDurationMinutes} min planejados usados na projeção. O ganho é consolidado por sessão.</p></div>}
    {template.scheduledAt && <p className="text-sm text-fitness-muted">Planejado para {new Date(template.scheduledAt).toLocaleDateString('pt-BR')}</p>}
    <FitnessButton size="md" className="w-full" disabled={!!active || template.exercises.length === 0} onClick={() => {
      const session = startSession(template.id);
      if (session) navigate(`/fitness/ativo/${session.id}`);
      else toast.error('Não foi possível iniciar o treino. Confira a sessão em andamento.');
    }}><Play size={17} />{active?.templateId === template.id ? 'Sessão em andamento' : 'Executar Agora'}</FitnessButton>
    <FitnessButton size="md" variant="secondary" className="w-full" onClick={() => navigate(`/treinos/preview/${template.id}`)}>Ver treino</FitnessButton>
    <div id={`template-content-${template.id}`} hidden={!expanded} className="space-y-4">
    <ol aria-label={`Composição de ${template.name}`} className="space-y-3 rounded-xl bg-fitness-canvas/60 p-3">
      {template.exercises.slice().sort((a, b) => a.order - b.order).map((exercise) => {
        const exerciseFocus = getExerciseFocus(exercise.exerciseId, catalog);
        const summary = (['reps', 'duration'] as const).flatMap((mode) => {
          const sets = exercise.sets.filter((set) => set.measureMode === mode);
          if (!sets.length) return [];
          const amounts = sets.map((set) => set.measureMode === 'reps' ? set.targetReps ?? 0 : set.targetDurationSeconds ?? 0);
          const average = amounts.reduce((sum, amount) => sum + amount, 0) / sets.length;
          const varies = amounts.some((amount) => amount !== amounts[0]);
          return [`${sets.length} × ${varies ? '~' : ''}${average.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${mode === 'reps' ? ' reps' : 's'}`];
        }).join(' + ');
        return <li key={exercise.id} className="space-y-1"><p className="min-w-0 break-words text-sm font-medium">{exerciseFocus && <span role="img" aria-label={`Foco: ${exerciseFocus.label}`} className="mr-2">{exerciseFocus.emoji}</span>}{exercise.exerciseNameSnapshot}</p><span className="block text-xs tabular-nums text-fitness-muted" title="Tempo estimado incluindo descansos; ~ indica média entre séries diferentes.">{summary} · {calculateEstimatedDuration([exercise])} min total</span></li>;
      })}
    </ol>
    <div className="grid grid-cols-2 gap-2">
      <FitnessButton size="md" variant="secondary" className="w-full min-w-0 px-2 text-sm" onClick={() => setEditing(true)}><Pencil size={16} />Editar</FitnessButton>
      <FitnessButton size="md" variant="secondary" className="w-full min-w-0 px-2 text-sm text-fitness-red" onClick={() => setConfirmDelete(true)}><Trash2 size={16} />Excluir</FitnessButton>
    </div>
    <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}><AlertDialogContent className="border-white/10 bg-fitness-canvas text-fitness-text"><AlertDialogHeader><AlertDialogTitle>Excluir este treino?</AlertDialogTitle><AlertDialogDescription>“{template.name}” será removido da biblioteca e das sequências que o utilizam. Sessões em andamento e o histórico de treinos realizados serão preservados.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Manter treino</AlertDialogCancel><AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => { deleteTemplate(template.id); toast.success('Treino excluído da biblioteca.'); }}>Excluir treino</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    {editing && <NativeTemplateDialog template={template} catalog={catalog} modality={template.modality} onClose={() => setEditing(false)} />}

    <div className="grid grid-cols-2 gap-2">
      <FitnessButton size="md" variant="secondary" className="px-2 text-sm" onClick={() => {
        setEditing(true);
      }}><CalendarDays size={16} />Planejar data</FitnessButton>
      <FitnessButton size="md" variant="secondary" className={`px-2 text-sm ${hasCycle ? 'text-emerald-300' : ''}`} disabled={hasCycle} onClick={() => setCycleOpen(true)}><Repeat2 size={16} />{hasCycle ? '✓ Ciclo ativo' : 'Tornar Ciclo'}</FitnessButton>
    </div>
    </div>
    {cycleOpen && <MakeCycleModal template={template} onClose={() => setCycleOpen(false)} />}
  </FitnessCard>;
}

export function FitnessRoot() {
  const accountId = useWorkoutStore((state) => state.currentAccountId);
  return <FitnessLibraryRoot key={accountId ?? 'local'} />;
}

function FitnessLibraryRoot() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = ['history', 'body', 'health'].includes(params.get('tab') ?? '') ? params.get('tab')! : 'workouts';
  const requested = params.get('modalidade') ?? (params.get('source') === 'calistenia' ? 'calisthenics' : params.get('source') === 'yoga' ? 'yoga' : undefined);
  const catalog = useWorkoutStore((state) => state.nativeCatalog);
  const templates = useWorkoutStore((state) => state.templates);
  const active = useWorkoutStore((state) => state.activeNativeSession);
  const accountData = useWorkoutStore((state) => state.accountDataById);
  const accountId = useWorkoutStore((state) => state.currentAccountId);
  const legacyWorkouts = accountData[accountId ?? 'local']?.workouts ?? EMPTY_WORKOUTS;
  const availableModalities = useMemo(() => {
    const known = new Set<string>(modalities.map((item) => item.id));
    const additional = new Set<WorkoutExerciseCategory>([...catalog.map((exercise) => exercise.modality), ...legacyWorkouts.map((workout) => workout.category)]);
    return [...modalities, ...Array.from(additional).filter((id) => !known.has(id)).map((id) => ({ id, label: CATEGORY_LABELS[id], icon: CATEGORY_ICONS[id] }))];
  }, [catalog, legacyWorkouts]);
  const modality = availableModalities.find((item) => item.id === requested);
  const legacyActive = useWorkoutStore.getState().getActiveSession();
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [createVisible, setCreateVisible] = useState(false);
  useEffect(() => {
    const node = createButtonRef.current;
    if (!node || tab !== 'workouts') { setCreateVisible(false); return; }
    const observer = new IntersectionObserver(([entry]) => setCreateVisible(entry.isIntersecting && entry.intersectionRatio >= 0.9), { threshold: [0, 0.9, 1], rootMargin: '0px 0px -80px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [tab, modality?.id]);
  const ensureCatalog = useWorkoutStore((state) => state.ensureNativeCatalog);
  const [createOpen, setCreateOpen] = useState(params.get('novo') === '1');
  const [presetId, setPresetId] = useState<string>();
  const [detail, setDetail] = useState<Exercise | null>(null);
  useEffect(() => { ensureCatalog(); }, [ensureCatalog]);
  useEffect(() => {
    if (params.get('novo') !== '1') return;
    setCreateOpen(true);
    const preset = catalog.find((exercise) => exercise.id === params.get('exercise') || exercise.legacyId === params.get('exercise'));
    if (preset) setPresetId(preset.id);
  }, [params, catalog]);
  const selectedCatalog = useMemo(() => catalog.filter((exercise) => exercise.modality === modality?.id), [catalog, modality]);
  const selectedTemplates = templates.filter((template) => template.modality === modality?.id);
  const updateParam = (key: string, value?: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next); };
  const selectTab = (value: string) => {
    const next = new URLSearchParams(params);
    next.set('tab', value);
    if (value === 'workouts') {
      next.delete('modalidade');
      next.delete('source');
      setDetail(null);
      setCreateOpen(false);
      setPresetId(undefined);
    }
    setParams(next);
  };
  const closeCreator = () => { setCreateOpen(false); const next = new URLSearchParams(params); next.delete('novo'); next.delete('exercise'); setParams(next, { replace: true }); };
  const adaptedDetail = detail ? { ...detail, category: detail.modality } : null;

  return <FitnessPageShell focused withNav showPageMap={false}>
    <div className="mx-auto max-w-xl">
      <FitnessHeader title={tab === 'workouts' && modality ? modality.label : { workouts: 'Exercício Físico', history: 'Histórico', body: 'Meu corpo', health: 'Saúde' }[tab] ?? 'Treinos'} subtitle={tab === 'workouts' && modality ? 'Exercícios, treinos e sequências' : 'Seu movimento, sua evolução'} onBack={() => { if (tab === 'workouts' && modality) { const next = new URLSearchParams(params); next.delete('modalidade'); next.delete('source'); setParams(next); } else navigate('/pilares'); }} backLabel={tab === 'workouts' && modality ? 'Voltar às modalidades' : 'Voltar aos Pilares'} />
      <Tabs value={tab} onValueChange={selectTab} className="mt-6">
        <TabsList aria-label="Seções de Exercício Físico" className="grid h-12 w-full grid-cols-4 rounded-2xl bg-fitness-surface p-1">
          {([['workouts', 'Treinos'], ['history', 'Histórico'], ['body', 'Corpo'], ['health', 'Saúde']] as const).map(([value, label]) => <TabsTrigger key={value} value={value} onClick={() => { if (value === 'workouts' && tab === 'workouts') selectTab(value); }} className="h-10 rounded-xl px-1 text-xs sm:text-sm text-fitness-muted data-[state=active]:bg-fitness-primary data-[state=active]:text-white">{label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="workouts" className="mt-6 space-y-8 pb-12">
            {active && <FitnessCard className="border border-fitness-primary/30 p-5"><div className="flex items-center gap-2 text-fitness-primary"><Play size={17} /><p className="font-medium">Sessão em andamento</p></div><p className="mt-2 break-words text-lg font-semibold">{active.nameSnapshot}</p><FitnessButton size="md" className="mt-4 w-full" onClick={() => navigate(`/fitness/ativo/${active.id}`)}>Retomar treino</FitnessButton></FitnessCard>}
          {legacyActive && <FitnessListRow title={legacyActive.workoutNameSnapshot} subtitle="Sessão em andamento · continuar treino" icon={Play} onClick={() => navigate(`/treinos/ativo/${legacyActive.id}`)} />}
          {!modality && <FitnessCategoryGrid options={availableModalities} selectedId={null} ariaLabel="Modalidades de exercício físico" onSelect={(id) => updateParam('modalidade', id)} />}
          {modality && <div className="space-y-3">
            <p className="text-center text-sm text-fitness-muted">{modality?.label ?? 'Escolha uma modalidade'} · {selectedCatalog.length} exercícios disponíveis</p>
            <FitnessButton ref={createButtonRef} className="w-full" disabled={!modality} onClick={() => { setPresetId(undefined); setCreateOpen(true); }}>Montar treino</FitnessButton>
          </div>}
          {modality && <>
            <section className="space-y-4"><SectionHeader title="Meus treinos" />
              {selectedTemplates.map((template) => <TemplateCard key={template.id} template={template} catalog={selectedCatalog} />)}
              {legacyWorkouts.filter((workout) => workout.category === modality.id && workout.status !== 'cancelled').map((workout) => <LegacyTemplateCard key={workout.id} workout={workout} catalog={selectedCatalog} />)}
              {!selectedTemplates.length && !legacyWorkouts.some((workout) => workout.category === modality.id && workout.status !== 'cancelled') && <p className="text-sm text-fitness-muted">Monte seu primeiro treino com os exercícios desta modalidade.</p>}
            </section>
            <section className="space-y-4"><SectionHeader title="Catálogo" subtitle={`Exercícios de ${modality.label}`} /><MuscleExerciseCatalog key={modality.id} icon={CATEGORY_ICONS[modality.id]} exercises={selectedCatalog} onSelect={setDetail} /></section>
          </>}
          <WorkoutSequenceLibrary modality={modality?.id} />
        </TabsContent>
        <FitnessEmbeddedContext.Provider value>
          <TabsContent value="history" className="mt-6"><WorkoutHistory /></TabsContent>
          <TabsContent value="body" className="mt-6"><Corpo embedded /></TabsContent>
          <TabsContent value="health" className="mt-6">
            <nav aria-label="Visões de saúde" className="mb-6 flex gap-2 overflow-x-auto">
              {([['overview', 'Hoje'], ['insights', 'Evolução'], ['week', 'Semana']] as const).map(([value, label]) => <button key={value} type="button" aria-current={(params.get('view') ?? 'overview') === value ? 'page' : undefined} onClick={() => updateParam('view', value)} className={`min-h-11 flex-1 rounded-full px-3 text-sm focus-visible:ring-2 focus-visible:ring-fitness-primary ${(params.get('view') ?? 'overview') === value ? 'bg-fitness-primary/20 text-fitness-primary' : 'bg-fitness-surface text-fitness-muted'}`}>{label}</button>)}
            </nav>
            {params.get('view') === 'week' ? <HealthWeeklySummary /> : params.get('view') === 'insights' ? <HealthInsights /> : <HealthDashboard />}
          </TabsContent>
        </FitnessEmbeddedContext.Provider>
      </Tabs>
    </div>
    {tab === 'workouts' && modality && !createVisible && !createOpen && <button type="button" aria-label="Criar treino" onClick={() => { setPresetId(undefined); setCreateOpen(true); }} className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-fitness-primary text-white shadow-fitness-primary outline-none focus-visible:ring-2 focus-visible:ring-white md:right-8"><Plus className="h-7 w-7" /></button>}
    {createOpen && modality && <NativeTemplateDialog catalog={selectedCatalog} modality={modality.id} presetId={presetId} onClose={closeCreator} />}
    <ExerciseDetailSheet variant="fitness" exercise={adaptedDetail} open={!!detail} onOpenChange={(open) => { if (!open) setDetail(null); }} onAddToWorkout={(exercise) => { setPresetId(exercise.id); setDetail(null); setCreateOpen(true); }} />
  </FitnessPageShell>;
}
