import { ElementalXpBadge } from '@/components/rewards/ElementalXpBadge';
import { FITNESS_ICONS, FitnessGlyph } from '@/components/fitness-kit/FitnessGlyph';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Check, Eye, Plus, Play, Repeat2, Pencil, ChevronDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppStore } from '@/stores/appStore';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';
import { calculateEstimatedDuration } from '@/lib/workout/workout-duration';
import { getWorkoutPresentation, getExercisePresentation } from '@/lib/workout/workout-focus';
import { FitnessButton, FitnessCard, FitnessCategoryGrid, FitnessEmptyState, FitnessHeader, FitnessPageShell, FitnessListRow } from '@/components/fitness-kit';
import { ModalidadeHeroi } from '@/components/fitness-kit/modalidade-heroi';
import { elementoDaModalidade } from '@/components/fitness-kit/treinos-elementos';
import type { ElementoId } from '@/lib/design/palette';
import '@/components/fitness-kit/treino-cartao-uau.css';
import '@/components/fitness-kit/plano-uau.css';
import { PlanoSemana } from '@/components/fitness-kit/plano-semana';
import { FitnessEmbeddedContext } from '@/components/fitness-kit/FitnessEmbeddedContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SavedWorkoutLibrary } from '@/components/workout/SavedWorkoutLibrary';
import { NativeTemplateDialog } from '@/components/workout/NativeTemplateDialog';
import { WorkoutSequenceLibrary } from '@/components/workout/WorkoutSequenceLibrary';
import { MuscleExerciseCatalog } from '@/components/workout/MuscleExerciseCatalog';
import { MakeCycleModal } from '@/components/workout/MakeCycleModal';
import { DialogoAlerta } from '@/components/fitness-kit/dialogo-alerta';
import { ExerciseDetailSheet } from '@/components/workout/ExerciseDetailSheet';
import { WorkoutHistory } from './WorkoutHistory';
import { HealthDashboard } from './HealthDashboard';
import { HealthInsights } from './HealthInsights';
import { HealthWeeklySummary } from './HealthWeeklySummary';
import { Corpo } from '@/pages/Corpo';
import type { Exercise, WorkoutExerciseCategory, WorkoutTemplate } from '@/types/workout';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout';
import type { CategoryOption } from '@/components/fitness-kit';
import { RunningReferenceIcon, CoreReferenceIcon, SwimmingReferenceIcon, MartialArtsReferenceIcon, YogaReferenceIcon, CyclingReferenceIcon } from '@/components/fitness-kit/WorkoutReferenceIcons';

const modalities = [
  { id: 'running', label: 'Corrida', icon: RunningReferenceIcon },
  { id: 'calisthenics', label: 'Calistenia', icon: CoreReferenceIcon },
  { id: 'swimming', label: 'Natação', icon: SwimmingReferenceIcon },
  { id: 'martial_arts', label: 'Artes marciais', icon: MartialArtsReferenceIcon },
  { id: 'yoga', label: 'Yoga', icon: YogaReferenceIcon },
  { id: 'cycling', label: 'Ciclismo', icon: CyclingReferenceIcon },
  { id: 'strength', label: 'Musculação', icon: FITNESS_ICONS.strength },
] satisfies (CategoryOption & { id: WorkoutExerciseCategory })[];

function TemplateCard({ template, catalog, element, index = 0 }: { template: WorkoutTemplate; catalog: Exercise[]; element?: ElementoId; index?: number }) {
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
  const focus = getWorkoutPresentation(template, catalog);
  const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
  const totalMinutos = calculateEstimatedDuration(template.exercises);
  const acao = (rotulo: string, icone: ReactNode, onClick: () => void, extra: { destrutiva?: boolean; ativa?: boolean; desabilitada?: boolean } = {}) => <button type="button" className="tc-acao" data-destrutiva={extra.destrutiva ? '' : undefined} data-ativa={extra.ativa ? '' : undefined} disabled={extra.desabilitada} onClick={onClick}>{icone}<span>{rotulo}</span></button>;
  return <FitnessCard luz data-element={element} style={{ '--i': index + 3 } as CSSProperties} className="mo-cartao tc-cartao space-y-4 p-5">
    <h3 className="font-sans"><button type="button" aria-expanded={expanded} aria-controls={`template-content-${template.id}`} onClick={() => setExpanded((value) => !value)} className="tc-cabeca"><span className="tc-icone"><FitnessGlyph name={focus.icon} size={28} label={focus.label} /></span><span className="tc-titulo"><span className="tc-nome">{template.name}</span><span className="tc-chips"><span className="tc-chip">{plural(template.exercises.length, 'exercício', 'exercícios')}</span><span className="tc-chip">{plural(series, 'série', 'séries')}</span><span className="tc-chip">~{totalMinutos} min</span>{template.scheduledAt && <span className="tc-chip" data-destaque="">Planejado {new Date(template.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>}</span></span><ChevronDown size={20} aria-hidden="true" className="tc-seta" data-aberto={expanded ? '' : undefined} /></button></h3>
    {reward && <div className="tc-recompensa"><ElementalXpBadge value={formatEarthXp(reward.earthXp)} element="terra" /><span className="tc-recompensa-nota">estimativa por sessão</span></div>}
    <FitnessButton size="md" className="tc-executar w-full" disabled={!!active || template.exercises.length === 0} onClick={() => {
      const session = startSession(template.id);
      if (session) navigate(`/fitness/ativo/${session.id}`);
      else toast.error('Não foi possível iniciar o treino. Confira a sessão em andamento.');
    }}><Play size={17} />{active?.templateId === template.id ? 'Sessão em andamento' : 'Executar agora'}</FitnessButton>
    <div className="tc-acoes" role="group" aria-label={`Ações de ${template.name}`}>
      {acao('Ver', <Eye size={20} aria-hidden="true" />, () => navigate(`/treinos/preview/${template.id}`))}
      {acao('Editar', <Pencil size={20} aria-hidden="true" />, () => setEditing(true))}
      {acao('Planejar', <CalendarDays size={20} aria-hidden="true" />, () => setEditing(true))}
      {acao(hasCycle ? 'Em ciclo' : 'Ciclo', hasCycle ? <Check size={20} aria-hidden="true" /> : <Repeat2 size={20} aria-hidden="true" />, () => setCycleOpen(true), { ativa: hasCycle, desabilitada: hasCycle })}
      {acao('Excluir', <Trash2 size={20} aria-hidden="true" />, () => setConfirmDelete(true), { destrutiva: true })}
    </div>
    <div id={`template-content-${template.id}`} hidden={!expanded} className="space-y-3">
    {reward && <p className="tc-detalhe">Estimativa · {(reward.activeDurationSeconds / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min ativos · esforço {reward.effortLevel}. {reward.estimatedDurationMinutes} min planejados usados na projeção. O ganho é consolidado por sessão.</p>}
    <ol aria-label={`Composição de ${template.name}`} className="tc-lista">
      {template.exercises.slice().sort((a, b) => a.order - b.order).map((exercise) => {
        const exerciseFocus = getExercisePresentation(exercise.exerciseId, catalog, template.modality);
        const summary = (['reps', 'duration'] as const).flatMap((mode) => {
          const sets = exercise.sets.filter((set) => set.measureMode === mode);
          if (!sets.length) return [];
          const amounts = sets.map((set) => set.measureMode === 'reps' ? set.targetReps ?? 0 : set.targetDurationSeconds ?? 0);
          const average = amounts.reduce((sum, amount) => sum + amount, 0) / sets.length;
          const varies = amounts.some((amount) => amount !== amounts[0]);
          return [`${sets.length} × ${varies ? '~' : ''}${average.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${mode === 'reps' ? ' reps' : 's'}`];
        }).join(' + ');
        return <li key={exercise.id} className="tc-item">{exerciseFocus && <FitnessGlyph name={exerciseFocus.icon} size={24} label={exerciseFocus.label} className="tc-item-icone" />}<span className="tc-item-texto"><span className="tc-item-nome">{exercise.exerciseNameSnapshot}</span><span className="tc-item-meta" title="Tempo estimado incluindo descansos; ~ indica média entre séries diferentes.">{summary} · {calculateEstimatedDuration([exercise])} min</span></span></li>;
      })}
    </ol>
    </div>
    <DialogoAlerta open={confirmDelete} onOpenChange={setConfirmDelete} titulo="Excluir este treino?" descricao={`“${template.name}” será removido da biblioteca e das sequências que o utilizam. Sessões em andamento e o histórico de treinos realizados serão preservados.`} cancelar="Manter treino" confirmar="Excluir treino" onConfirm={() => { deleteTemplate(template.id); toast.success('Treino excluído da biblioteca.'); }} />
    {editing && <NativeTemplateDialog template={template} catalog={catalog} modality={template.modality} onClose={() => setEditing(false)} />}
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
  const availableModalities = useMemo(() => {
    const known = new Set<string>(modalities.map((item) => item.id));
    const additional = new Set<WorkoutExerciseCategory>([...catalog.map((exercise) => exercise.modality), ...templates.map((template) => template.modality)]);
    return [...modalities, ...Array.from(additional).filter((id) => !known.has(id)).map((id) => ({ id, label: CATEGORY_LABELS[id], icon: CATEGORY_ICONS[id] }))];
  }, [catalog, templates]);
  const modality = availableModalities.find((item) => item.id === requested);
  const legacyActive = useWorkoutStore.getState().getActiveSession();
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const modalitiesHeadingRef = useRef<HTMLHeadingElement>(null);
  const catalogHeadingRef = useRef<HTMLHeadingElement>(null);
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
        <TabsList aria-label="Seções de Exercício Físico" data-ativa={tab} className="fitness-elemental-tabs tr-abas ds-glass-float">
          <span className="tr-abas-indicador" aria-hidden="true" />
          {([['workouts', 'Treinos'], ['history', 'Histórico'], ['body', 'Corpo'], ['health', 'Saúde']] as const).map(([value, label]) => <TabsTrigger key={value} value={value} onClick={() => { if (value === 'workouts' && tab === 'workouts') selectTab(value); }} className="tr-aba">{label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="workouts" className="mt-6 space-y-8 pb-12">
            {active && <FitnessCard className="border border-fitness-primary/30 p-5"><div className="flex items-center gap-2 text-fitness-primary"><Play size={17} /><p className="font-medium">Sessão em andamento</p></div><p className="mt-2 break-words text-lg font-semibold">{active.nameSnapshot}</p><FitnessButton size="md" className="mt-4 w-full" onClick={() => navigate(`/fitness/ativo/${active.id}`)}>Retomar treino</FitnessButton></FitnessCard>}
          {legacyActive && <FitnessListRow title={legacyActive.workoutNameSnapshot} subtitle="Sessão em andamento · continuar treino" icon={Play} onClick={() => navigate(`/treinos/ativo/${legacyActive.id}`)} />}
          {!modality && <>
            <PlanoSemana onExplorar={() => {
              modalitiesHeadingRef.current?.focus({ preventScroll: true });
              modalitiesHeadingRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            }} />
            <SavedWorkoutLibrary templates={templates} catalog={catalog} onOpen={(id) => navigate(`/treinos/preview/${id}`)} onExplore={() => {
              modalitiesHeadingRef.current?.focus({ preventScroll: true });
              modalitiesHeadingRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            }} />
            <section aria-labelledby="fitness-modalities-heading" className="space-y-4">
              <div>
                <h2 id="fitness-modalities-heading" ref={modalitiesHeadingRef} tabIndex={-1} className="tr-secao-titulo scroll-mt-6 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary">Explorar modalidades</h2>
                <p className="tr-secao-subtitulo">Cada caminho tem a luz de um elemento. Escolha o seu.</p>
              </div>
              <FitnessCategoryGrid options={availableModalities} selectedId={null} ariaLabel="Modalidades de exercício físico" onSelect={(id) => updateParam('modalidade', id)} />
            </section>
          </>}
          {modality && <ModalidadeHeroi ref={createButtonRef} id={modality.id} label={modality.label} icon={modality.icon} exercicios={selectedCatalog.length} treinos={selectedTemplates.length} onCriar={() => { setPresetId(undefined); setCreateOpen(true); }} />}
          {modality && <>
            <section aria-labelledby="fitness-modality-templates" className="mo-secao space-y-4" style={{ '--i': 2 } as CSSProperties}>
              <div className="tr-meus-cab"><h2 id="fitness-modality-templates" className="tr-secao-titulo">Meus treinos <span className="tr-meus-contagem">{selectedTemplates.length}</span></h2></div>
              {selectedTemplates.map((template, index) => <TemplateCard key={template.id} template={template} catalog={selectedCatalog} element={elementoDaModalidade(modality.id)} index={index} />)}
              {!selectedTemplates.length && <FitnessEmptyState
                icon={<modality.icon className="h-7 w-7" strokeWidth={1.55} />}
                title={`Seu primeiro treino de ${modality.label}`}
                message="Escolha exercícios desta modalidade e monte um treino só seu. Cada série que você fizer fica selada para você."
                action={<FitnessButton size="md" variant="secondary" className="w-full max-w-xs" onClick={() => {
                  catalogHeadingRef.current?.focus({ preventScroll: true });
                  catalogHeadingRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
                }}>Explorar o catálogo</FitnessButton>}
              />}
            </section>
            <section aria-labelledby="fitness-modality-catalog" className="mo-secao space-y-4" style={{ '--i': 2 } as CSSProperties}>
              <div>
                <h2 id="fitness-modality-catalog" ref={catalogHeadingRef} tabIndex={-1} className="tr-secao-titulo scroll-mt-6 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary">Catálogo</h2>
                <p className="tr-secao-subtitulo">Exercícios de {modality.label}</p>
              </div>
              <MuscleExerciseCatalog key={modality.id} icon={CATEGORY_ICONS[modality.id]} element={elementoDaModalidade(modality.id)} exercises={selectedCatalog} onSelect={setDetail} />
            </section>
          </>}
          <WorkoutSequenceLibrary modality={modality?.id} />
          {modality && <div className="mo-respiro" aria-hidden="true" />}
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
    {tab === 'workouts' && modality && !createVisible && !createOpen && <button type="button" aria-label="Criar treino" onClick={() => { setPresetId(undefined); setCreateOpen(true); }} className="tr-fab fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl border border-[rgb(var(--el-gold)/0.5)] bg-[rgb(var(--el-gold))] text-[rgb(var(--el-canvas))] shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary md:right-8"><Plus className="h-7 w-7" aria-hidden="true" /></button>}
    {createOpen && modality && <NativeTemplateDialog catalog={selectedCatalog} modality={modality.id} presetId={presetId} onClose={closeCreator} />}
    <ExerciseDetailSheet variant="fitness" exercise={adaptedDetail} open={!!detail} onOpenChange={(open) => { if (!open) setDetail(null); }} onAddToWorkout={(exercise) => { setPresetId(exercise.id); setDetail(null); setCreateOpen(true); }} />
  </FitnessPageShell>;
}
