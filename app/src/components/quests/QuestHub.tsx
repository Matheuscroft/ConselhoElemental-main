import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Play, Plus } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatTime } from '@/constants';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ElementalTimer } from '@/components/elemental/ElementalTimer';
import { openRitualTimer, ownsRitualTimer, toggleRitualTimer } from '@/components/elemental/sanctuary-timer';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { buildQuestTrails, type QuestStep } from './quest-path';
import { appendQuestStep, finishQuestStep } from './quest-commands';
import { QuestComposer } from './QuestComposer';
import { QuestTrailMap } from './QuestTrailMap';
import './quests.css';

type Receipt = NonNullable<ReturnType<typeof finishQuestStep>>;
export function QuestHub({ onManageTask }: { onManageTask: (id: string) => void }) {
  const state = useAppStore(useShallow(s => ({
    tasks: s.tasks, habits: s.habits, quests: s.quests, projects: s.projects,
    timer: s.timer, currentAccountId: s.currentAccountId,
    startTimer: s.startTimer, pauseTimer: s.pauseTimer, resumeTimer: s.resumeTimer,
    stopTimer: s.stopTimer, completeTask: s.completeTask,
  })));
  const { tasks, habits, quests, projects, timer, currentAccountId } = state;
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const trails = useMemo(() => buildQuestTrails({ tasks, habits, quests, projects }), [tasks, habits, quests, projects]);
  const trail = trails.find(t => t.key === params.get('trilha')) ?? trails.find(t => !t.completed && !t.archived) ?? trails[0];
  const selected = trail?.steps.find(s => s.key === params.get('etapa')) ?? trail?.next ?? trail?.steps[0];
  const [timerId, setTimerId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [message, setMessage] = useState('');
  const returnFocus = useRef<HTMLElement | null>(null);
  const hubTitle = useRef<HTMLHeadingElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const focusNext = useRef(false);
  const explicitStep = params.get('etapa');
  useEffect(() => {
    if (explicitStep) board.current?.querySelector<HTMLElement>('.quest-step[aria-expanded=true]')?.scrollIntoView({ block: 'nearest' });
  }, [explicitStep]);
  const timerTask = tasks.find(t => t.id === timerId);
  const ownsTimer = !!timerId && ownsRitualTimer(state, { accountId: currentAccountId, taskId: timerId });
  const runningTask = timer.entityType === 'TASK' ? tasks.find(t => t.id === timer.entityId && !t.isCompleted) : undefined;
  const select = (key: string, step?: string) => {
    setParams(previous => { const next = new URLSearchParams(previous); next.delete('view'); next.set('trilha', key); if (step) next.set('etapa', step); else next.delete('etapa'); return next; }, { state: { questStepSelection: key === trail?.key && !!step } });
    setMessage('');
  };
  const begin = (id: string, trigger: HTMLElement) => {
    const task = useAppStore.getState().tasks.find(t => t.id === id);
    if (task?.sourceModule === 'modulo_treino') { navigate('/treinos'); return; }
    if (!task || task.childItems.length) { onManageTask(id); return; }
    const status = openRitualTimer(useAppStore.getState, { accountId: currentAccountId, taskId: id });
    if (status === 'busy') { setMessage('Você já tem uma atividade em andamento ou pausada. Retome-a antes de iniciar outra.'); return; }
    if (status === 'unavailable') { setMessage('Esta etapa não está mais disponível. Atualize sua seleção.'); return; }
    returnFocus.current = trigger; setTimerId(id); setMessage('');
  };
  const finish = () => {
    if (!timerId) return;
    const result = finishQuestStep(useAppStore.getState, currentAccountId, timerId);
    setTimerId(null);
    if (result) setReceipt(result);
    else setMessage('A conclusão não foi registrada. Confira a atividade na lista de Rituais.');
  };
  const restoreFocus = (event: Event) => {
    event.preventDefault();
    if (focusNext.current) {
      focusNext.current = false;
      const next = board.current?.querySelector<HTMLElement>('.quest-step[aria-expanded=true]');
      if (next) { next.focus(); return; }
    }
    if (returnFocus.current?.isConnected) returnFocus.current.focus(); else hubTitle.current?.focus();
  };
  const detail = (step: QuestStep) => {
    if (!step.available) return <p>Este ritual não está mais disponível. Você pode revisar a composição em {trail.kind === 'project' ? 'Grandes Obras' : 'Jornadas'}.</p>;
    if (step.completed) return <><p><Check size={16} />Ritual concluído. Seu resultado está no histórico.</p><button className="quest-secondary" onClick={() => onManageTask(step.id)}>Ver ritual e resultado</button></>;
    if (trail.archived || trail.completed) return <p>Esta trilha está {trail.archived ? 'arquivada' : 'concluída'}. Revise seu estado na página de origem para continuar.</p>;
    if (step.native || step.kind === 'habit') return <><p>{step.native ? 'Continue este treino no módulo de Treinos.' : 'Este ciclo se repete na sua rotina e tem seu próprio calendário.'}</p><Link className="quest-primary" to={step.native ? '/treinos' : '/ciclos'}>{step.native ? 'Abrir treino' : 'Abrir ciclos'}<ArrowRight size={17} /></Link></>;
    if (step.hasChildren) return <><p>Este ritual tem subetapas. Abra seus detalhes para acompanhar cada uma.</p><button className="quest-primary" onClick={() => onManageTask(step.id)}>Abrir subetapas<ArrowRight size={17} /></button></>;
    return <><p>{step.plannedMinutes !== null ? `${step.plannedMinutes} min planejados. ` : ''}Dedique um tempo a esta etapa e conclua quando terminar.</p><div className="quest-detail-actions"><button className="quest-primary" onClick={event => begin(step.id, event.currentTarget)}><Play size={17} />{timer.entityId === step.id && timer.entityType === 'TASK' ? 'Retomar etapa' : 'Iniciar etapa'}</button><button className="quest-text-button" onClick={() => onManageTask(step.id)}>Detalhes e edição</button></div></>;
  };
  return <section className="quest-hub" aria-labelledby="quest-hub-title">
    <header className="quest-section-heading"><div><h1 id="quest-hub-title" ref={hubTitle} tabIndex={-1}>Sua jornada de conquistas</h1><p>Rituais que transformam intenção em progresso.</p></div><QuestComposer onCreated={key => select(key)} /></header>
    {runningTask && <div className="quest-resume" role="status"><span><ArcaneIcon name="ritual" size={21} />{timer.isRunning ? 'Em andamento' : 'Pausado'}: {runningTask.title}</span><button className="quest-secondary" onClick={event => begin(runningTask.id, event.currentTarget)}>Retomar</button></div>}
    {timer.entityType === 'HABIT' && <div className="quest-resume"><span>Há um ciclo {timer.isRunning ? 'em andamento' : 'pausado'}.</span><Link className="quest-secondary" to="/ciclos">Retomar ciclo</Link></div>}
    {message && <p className="quest-notice" role="status">{message}</p>}
    {params.has('trilha') && !trails.some(item => item.key === params.get('trilha')) && <p className="quest-notice" role="status">A trilha deste link não está disponível nesta conta. {trails.length ? 'Escolha uma das suas trilhas abaixo.' : 'Você pode criar uma nova quest.'}</p>}
    {trail ? <>
      <label className="quest-picker">Escolha sua trilha<select value={trail.key} onChange={event => select(event.target.value)}>{trails.map(t => <option value={t.key} key={t.key}>{t.kind === 'quest' ? 'Jornada' : 'Grande Obra'}: {t.title}{t.archived ? ' (arquivada)' : t.completed ? ' (concluída)' : ''}</option>)}</select></label>
      <div className="quest-board" data-element={trail.element} ref={board}>
        <header className="quest-banner"><span className="quest-banner-seal"><ElementIcon element={trail.element} size={44} /></span><div><span className="quest-kicker">{trail.kind === 'quest' ? 'Jornada' : 'Grande Obra'}</span><h2>{trail.title}</h2>{trail.description && <p>{trail.description}</p>}<div className="quest-progress-label"><span>{trail.done} de {trail.total} rituais concluídos</span>{trail.steps.some(s => s.kind === 'habit') && <span>{trail.steps.filter(s => s.kind === 'habit').length} ciclos vinculados</span>}</div><progress value={trail.done} max={Math.max(1, trail.total)} aria-label="Rituais concluídos nesta trilha" /></div></header>
        <div className="quest-board-body"><p className="quest-freedom">{trail.archived ? 'Trilha arquivada. Seu percurso continua disponível para consulta.' : trail.completed ? 'Trilha concluída. Explore o percurso e seus resultados.' : 'A próxima etapa é uma sugestão. Você pode escolher qualquer ritual.'}</p>
          {trail.steps.length ? <QuestTrailMap trail={trail} selectedKey={selected?.key} onSelect={key => select(trail.key, key)} detail={detail} /> : <div className="quest-empty"><ArcaneIcon name="jornada" size={42} /><h3>O primeiro passo é seu</h3><p>Adicione um ritual para começar a desenhar esta trilha.</p></div>}
          {!trail.archived && !trail.completed && <AppendStep key={trail.key} trail={trail} accountId={currentAccountId} />}
          <Link className="quest-origin" to={trail.kind === 'project' ? '/grandes-obras' : '/jornadas'}>Gerenciar {trail.kind === 'project' ? 'Grandes Obras e capítulos' : 'Jornadas'}<ArrowRight size={16} /></Link>
        </div>
      </div>
    </> : <div className="quest-empty quest-board"><span className="quest-empty-seal"><ArcaneIcon name="jornada" size={64} /></span><h2>Uma grande conquista começa com um ritual</h2><p>Crie uma quest, escolha seu elemento e divida sua intenção em etapas. Sua próxima ação também aparecerá no Santuário.</p><p>Jornadas organizam conquistas. Grandes Obras reúnem projetos com capítulos.</p></div>}
    <nav className="quest-related" aria-label="Organização das quests"><Link to="/jornadas"><ArcaneIcon name="jornada" />Jornadas</Link><Link to="/grandes-obras"><ArcaneIcon name="obra" />Grandes Obras</Link><Link to="/grimorio#grimoire-history"><ArcaneIcon name="grimorio" />Meu histórico</Link></nav>
    <Dialog open={ownsTimer && !!timerTask} onOpenChange={open => { if (!open) setTimerId(null); }}><DialogContent className="elemental-timer-dialog quest-timer-dialog max-w-sm" onCloseAutoFocus={event => { if (receipt) event.preventDefault(); else restoreFocus(event); }} aria-labelledby="quest-timer-title" aria-describedby="quest-timer-description"><DialogHeader><DialogTitle id="quest-timer-title">Ritual em andamento</DialogTitle><DialogDescription id="quest-timer-description">Seu tempo continua registrado ao fechar esta janela.</DialogDescription></DialogHeader>{timerTask && <ElementalTimer title={timerTask.title} element={timerTask.elementId} time={formatTime(timer.elapsedSeconds)} running={timer.isRunning} onToggle={() => toggleRitualTimer(useAppStore.getState, { accountId: currentAccountId, taskId: timerTask.id })} onComplete={finish} />}</DialogContent></Dialog>
    <Dialog open={!!receipt} onOpenChange={open => { if (!open) setReceipt(null); }}><DialogContent className="quest-dialog quest-receipt" onCloseAutoFocus={restoreFocus} aria-labelledby="quest-receipt-title" aria-describedby="quest-receipt-description"><DialogHeader><span className="quest-receipt-seal"><Check size={36} /></span><DialogTitle id="quest-receipt-title">Mais um passo realizado</DialogTitle><DialogDescription id="quest-receipt-description">{receipt?.title}</DialogDescription></DialogHeader>{receipt && <><div className="quest-receipt-stats"><div><span>XP registrado</span><strong>{receipt.xp.toLocaleString('pt-BR')}</strong></div><div><span>Pontos registrados</span><strong>{receipt.points === null ? '—' : receipt.points.toLocaleString('pt-BR')}</strong></div><div><span>Tempo dedicado</span><strong>{receipt.minutes == null ? '—' : `${receipt.minutes.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min`}</strong></div></div><p>Resultado já registrado no seu Grimório.</p><button className="quest-primary" onClick={() => { focusNext.current = true; setReceipt(null); if (trail) select(trail.key, trail.next?.key); }}>{trail?.next ? 'Ver próxima etapa' : 'Voltar à trilha'}<ArrowRight size={17} /></button></>}</DialogContent></Dialog>
  </section>;
}

function AppendStep({ trail, accountId }: { trail: ReturnType<typeof buildQuestTrails>[number]; accountId: string | null }) {
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState(trail.chapters[0]?.id ?? '');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    try { appendQuestStep(useAppStore.getState, accountId, trail.key, title, chapter); setTitle(''); setError(''); setConfirmation('Etapa adicionada à trilha.'); }
    catch (reason) { setConfirmation(''); setError(reason instanceof Error ? reason.message : 'Não foi possível adicionar a etapa.'); }
  };
  return <details className="quest-append"><summary><Plus size={18} />Adicionar etapa</summary>{trail.kind === 'project' && !trail.chapters.length ? <p>Crie um capítulo em <Link to="/grandes-obras">Grandes Obras</Link> para organizar suas próximas etapas.</p> : <form className="quest-form" onSubmit={submit}><label>Nome do ritual<input required value={title} onChange={e => { setTitle(e.target.value); setConfirmation(''); }} placeholder="Um passo concreto para sua conquista" /></label>{trail.kind === 'project' && <label>Capítulo<select value={chapter} onChange={e => setChapter(e.target.value)}>{trail.chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>}<button className="quest-primary" type="submit">Adicionar ritual</button>{error && <p className="quest-error" role="alert">{error}</p>}{confirmation && <p role="status">{confirmation}</p>}</form>}</details>;
}
