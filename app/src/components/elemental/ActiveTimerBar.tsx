import './elemental-timer.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { attachTimerRuntime, timerActivity } from '@/lib/timer/runtime';
import { formatTime } from '@/constants';
import { ElementIcon } from './ArcaneIcon';

export function ActiveTimerBar() {
  const state = useAppStore();
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  useEffect(() => attachTimerRuntime(useAppStore, window, () => setStorageUnavailable(true)), []);
  const activity = timerActivity(state), timer = state.timer;
  if (!activity || !timer.entityId) return null;
  const params = new URLSearchParams({ atividade: timer.entityId, cronometro: '1' });
  if (timer.entityType === 'TASK') params.set('view', 'lista');
  if (timer.activityDate) params.set('data', timer.activityDate);
  const href = `${timer.entityType === 'TASK' ? '/rituais' : '/ciclos'}?${params}`;
  return <aside className="active-timer-bar" aria-label="Cronômetro da atividade">
    <ElementIcon element={activity.elementId} size={24} />
    <Link to={href} aria-label={`Abrir cronômetro de ${'name' in activity ? activity.name : activity.title}`}><strong>{'name' in activity ? activity.name : activity.title}</strong><span>{timer.isRunning ? 'Em andamento' : 'Pausado'} · {formatTime(timer.elapsedSeconds)}</span></Link>
    <button type="button" aria-label={timer.isRunning ? 'Pausar cronômetro atual' : 'Retomar cronômetro atual'} onClick={() => timer.isRunning ? state.pauseTimer() : state.resumeTimer()}>{timer.isRunning ? <Pause size={20} /> : <Play size={20} />}</button>
    <Link className="active-timer-open" to={href} aria-label="Voltar à atividade"><ChevronRight size={20} /></Link>
    {storageUnavailable && <small role="status">Mantenha o app aberto. Não foi possível guardar o cronômetro para recarga.</small>}
  </aside>;
}
