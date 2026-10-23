import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatTime } from '@/constants';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ElementalTimer } from './ElementalTimer';
import { canUseSimpleRitualTimer, ritualListHref, completeRitualTimer, openRitualTimer, ownsRitualTimer, toggleRitualTimer } from './sanctuary-timer';

export function SanctuaryRituals() {
  const navigate = useNavigate();
  const state = useAppStore();
  const { tasks, timer, currentAccountId } = state;
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const pending = tasks.filter((task) => !task.isCompleted).slice(0, 4);
  const context = { accountId: currentAccountId, taskId: selected ?? '' };
  const selectedTask = tasks.find((task) => task.id === selected);
  const open = !!selectedTask && ownsRitualTimer(state, context);
  const activeTask = timer.entityType === 'TASK' ? tasks.find((task) => task.id === timer.entityId && !task.isCompleted) : undefined;
  const begin = (taskId: string) => {
    const task = useAppStore.getState().tasks.find(item => item.id === taskId);
    if (task && !canUseSimpleRitualTimer(task)) {
      navigate(task.sourceModule === 'modulo_treino' ? '/treinos' : ritualListHref);
      return;
    }
    const result = openRitualTimer(useAppStore.getState, { accountId: currentAccountId, taskId });
    if (result === 'busy') setMessage('Há um cronômetro em aberto. Retome ou conclua essa atividade antes de iniciar outra.');
    else if (result === 'unavailable') setMessage('Este ritual não está mais disponível. Escolha outro ritual.');
    else { setSelected(taskId); setMessage(''); }
  };
  return <div className="ep-pending">
    <div className="ep-section-line"><h3>Rituais pendentes</h3><Link to={ritualListHref}>Ver todos <ArrowRight size={15} /></Link></div>
    {timer.entityId && <div className="ep-active-session">
      <div><span>{timer.isRunning ? 'Em andamento' : 'Cronômetro pausado'}</span><strong>{activeTask?.title ?? 'Sua atividade atual'}</strong><span role="timer" aria-label="Tempo da atividade atual">{formatTime(timer.elapsedSeconds)}</span></div>
      {activeTask ? <button type="button" className="ep-button" onClick={() => begin(activeTask.id)}>Abrir cronômetro</button> : <Link className="ep-button" to={timer.entityType === 'HABIT' ? '/ciclos' : ritualListHref}>Ver atividade</Link>}
    </div>}
    {pending.length ? <ul>{pending.map((task) => <li key={task.id} className="ep-ritual-row"><Link to={ritualListHref}><span className="ep-task-marker" aria-hidden="true" /><span>{task.title}</span></Link><button type="button" className="ep-ritual-start" onClick={() => begin(task.id)} aria-label={`${!canUseSimpleRitualTimer(task) ? 'Abrir detalhes de' : activeTask?.id === task.id ? 'Abrir cronômetro de' : 'Iniciar'} ${task.title}`}><Play size={15} aria-hidden="true" /><span>{!canUseSimpleRitualTimer(task) || activeTask?.id === task.id ? 'Abrir' : 'Iniciar'}</span></button></li>)}</ul> : <p className="ep-empty">Nenhum ritual pendente. Comece com algo que você quer realizar.</p>}
    <p className="ep-session-message" role="status">{message}</p>
    <Dialog open={open} onOpenChange={(value) => { if (!value) setSelected(null); }}>
      <DialogContent className="max-w-md border-white/20 bg-void text-white max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Cronômetro do ritual</DialogTitle><DialogDescription>Fechar esta janela mantém o estado do cronômetro. Use Pausar para interromper a contagem.</DialogDescription></DialogHeader>
        {selectedTask && <ElementalTimer title={selectedTask.title} element={selectedTask.elementId} time={formatTime(timer.elapsedSeconds)} running={timer.isRunning}
          onToggle={() => toggleRitualTimer(useAppStore.getState, context)}
          onComplete={() => {
            if (completeRitualTimer(useAppStore.getState, context)) setMessage('Ritual concluído. Seu progresso foi atualizado.');
            else setMessage('Não foi possível confirmar a conclusão. Confira a atividade em Rituais.');
            setSelected(null);
          }} />}
      </DialogContent>
    </Dialog>
  </div>;
}
