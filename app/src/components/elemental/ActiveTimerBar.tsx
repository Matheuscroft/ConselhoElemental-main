import './elemental-timer.css';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { attachTimerRuntime, timerActivity } from '@/lib/timer/runtime';
import { formatTime } from '@/constants';
import { fracaoDoPlano, marcoAlcancado } from '@/components/foco/foco-tempo';
import { ElementIcon } from './ArcaneIcon';

const RAIO = 21;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

/**
 * The focus screen, minimised: a floating mini-player in the app's glass.
 * Tapping it opens the focus screen again; the round button pauses and resumes.
 * The clock itself is owned by the timer runtime, exactly as before.
 */
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
  const name = 'name' in activity ? activity.name : activity.title;
  const plannedMinutes = 'plannedTimeMinutes' in activity ? activity.plannedTimeMinutes : undefined;
  const planned = plannedMinutes && plannedMinutes > 0 ? plannedMinutes * 60 : undefined;
  // With a plan the ring fills toward it; without one it sweeps the current minute.
  const fraction = planned ? fracaoDoPlano(timer.elapsedSeconds, planned) : (timer.elapsedSeconds % 60) / 60;
  const met = !!planned && marcoAlcancado(fraction) >= 4;
  return <aside className="active-timer-bar foco-mini ds-glass-float" aria-label="Cronômetro da atividade" data-running={timer.isRunning} data-plano={!!planned} data-meta={met}
    style={{ '--foco-cor': `var(--element-${activity.elementId})` } as CSSProperties}>
    <Link className="foco-mini-abrir" to={href} aria-label={`Abrir cronômetro de ${name}`}>
      <span className="foco-mini-selo">
        <svg className="foco-mini-anel" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <circle className="foco-mini-trilho" cx="24" cy="24" r={RAIO} />
          <circle className="foco-mini-arco" cx="24" cy="24" r={RAIO} transform="rotate(-90 24 24)" strokeDasharray={CIRCUNFERENCIA} strokeDashoffset={CIRCUNFERENCIA * (1 - fraction)} />
        </svg>
        <ElementIcon element={activity.elementId} size={24} />
      </span>
      <span className="foco-mini-texto">
        <strong>{name}</strong>
        <span className="foco-mini-tempo"><i className="foco-mini-ponto" aria-hidden="true" />{timer.isRunning ? 'Em foco' : 'Pausado'} · {formatTime(timer.elapsedSeconds)}</span>
      </span>
      <ChevronUp className="foco-mini-expandir" size={20} aria-hidden="true" />
    </Link>
    <button type="button" className="foco-mini-pausar" aria-label={timer.isRunning ? 'Pausar cronômetro atual' : 'Retomar cronômetro atual'} onClick={() => timer.isRunning ? state.pauseTimer() : state.resumeTimer()}>{timer.isRunning ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}</button>
    {storageUnavailable && <small role="status">Mantenha o app aberto. Não foi possível guardar o cronômetro para recarga.</small>}
  </aside>;
}
