import { useState } from 'react';
import { createQaStorage, QA_INTERRUPT_KEY } from './qa-storage.mjs';
/** Disposable QA entry. Never import this file from src or expose it through the app. */
import { createRoot } from 'react-dom/client';
import ActivityReminderControl from '../../src/components/reminders/ActivityReminderControl';
import { ReminderWorkspace } from '../../src/components/reminders/ReminderWorkspace';
import { REMINDER_HANDOFF_KEY } from '../../src/lib/reminders/reminder-handoff-key';
import { validateStoredProgress } from '../../src/lib/backup/stored-progress';
import { localProgressMode, LOCAL_PROGRESS_MODE_KEY } from '../../src/lib/backup/progress-mode';
import { reviewActivityReminder, prepareActivityReminder } from '../../src/lib/reminders/reminder-preparation';
import seed from 'qa-seed';
import '../../src/components/backup/restore-workspace.css';
import '../../src/pages/temporal/temporal-elemental.css';

// Only the fixture envelope is read from the real session storage.
const nativeSession = window.sessionStorage;
const qa = createQaStorage(nativeSession, seed.entries);
const storage = qa.storage;
if (qa.fresh) storage.setItem(LOCAL_PROGRESS_MODE_KEY,localProgressMode(window.location.origin));
// Components use the original key names INSIDE the fixture map, not real app storage.
Object.defineProperty(window,'localStorage',{value:storage});
Object.defineProperty(window,'sessionStorage',{value:storage});
export function reviewLiveActivityReminder(identity: Parameters<typeof reviewActivityReminder>[1], isCurrent: () => boolean) {
  return reviewActivityReminder(context(isCurrent),identity);
}
function context(isCurrent: () => boolean) {
  return {storage,session:storage,origin:window.location.origin,localDocument:true,liveAccountDocument:false,isCurrent,
    readProgress:()=>validateStoredProgress({core:storage.getItem('conselho-elemental-storage'),fitness:storage.getItem('dominio-do-mago-workout-storage-v1')},window.location.origin)!};
}
export function prepareLiveActivityReminder(review: Parameters<typeof prepareActivityReminder>[1], draft: Parameters<typeof prepareActivityReminder>[2], returnTo: string, confirmed: boolean, isCurrent: () => boolean) {
  return prepareActivityReminder(context(isCurrent),review,draft,returnTo,confirmed);
}
function QaScenarioControls() {
  const [armed, setArmed] = useState(storage.getItem(QA_INTERRUPT_KEY) === 'armed');
  const pending = storage.getItem(REMINDER_HANDOFF_KEY) !== null || storage.getItem('conselho-elemental-restore-journal-v1') !== null;
  return <aside className="restore-workspace" aria-label="Cenários de teste descartáveis"><section>
    <h2>Somente dados de QA</h2><p>Reiniciar limpa exclusivamente esta fixture. Não altera seu progresso pessoal.</p>
    <button type="button" className="restore-workspace-secondary" onClick={() => { qa.reset(); window.location.assign('/'); }}>Reiniciar dados de teste</button>
    <button type="button" className="restore-workspace-secondary" disabled={armed || pending} onClick={() => { storage.setItem(QA_INTERRUPT_KEY,'armed'); setArmed(true); }}>{armed ? 'Interrupção armada para a próxima gravação' : 'Simular interrupção na próxima gravação'}</button>
  </section></aside>;
}
const root = document.getElementById('root')!;
const workspace = new URLSearchParams(location.search).get('progresso')==='lembretes' || storage.getItem(REMINDER_HANDOFF_KEY)!==null;
createRoot(root).render(<><QaScenarioControls/>{workspace ? <ReminderWorkspace/> : <main className="restore-workspace">
  <h1>Ensaio descartável de avisos</h1><p>Dados sintéticos. Nenhuma atividade pessoal é carregada. Preparar não entrega notificações.</p>
  <p>Ritual QA · 30/10/2026</p>
  <ActivityReminderControl identity={seed.identity} returnTo="/temporal/mes?mes=2026-10&dia=2026-10-30"/>
  <p>Recarga conserva somente a fixture desta aba. Outra aba tem uma cópia independente: isto não valida concorrência de progresso entre abas.</p>
</main>}</>);
