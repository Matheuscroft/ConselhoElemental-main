import type { LiveAccountSession } from './lib/backup/account-live-sync';
import { hasAccountTabAccess } from './lib/backup/account-resume-entry';
import { captureRecoveryEntry } from './lib/backup/account-recovery-entry';
import { captureAccountReturn, type AccountReturnNotice } from './lib/backup/account-return';
import { needsReminderWorkspace } from './lib/reminders/reminder-entry'
import './index.css'
import './lib/backup/startup-screen.css'
import { startProgressSession } from './lib/backup/progress-startup'
import { showProgressStartup } from './lib/backup/startup-screen'

// ── Fase 1: Força Dark Mode globalmente ────────────────────────────────
// A classe 'dark' no <html> ativa os tokens CSS do Design System Arcano
document.documentElement.classList.add('dark');

const root = document.getElementById('root')!;
showProgressStartup(root);
async function openRestoreWorkspace() {
  try { const { mountRestoreWorkspace } = await import('./mount-restore-workspace'); mountRestoreWorkspace(root); }
  catch { showProgressStartup(root, 'startup-failed'); }
}
async function openAccountWorkspace(notice: AccountReturnNotice = 'none') {
  try { const { mountAccountWorkspace } = await import('./mount-account-workspace'); mountAccountWorkspace(root,startAccountApp,notice); }
  catch { showProgressStartup(root, 'startup-failed'); }
}
async function openReminderWorkspace() {
  try { const { mountReminderWorkspace } = await import('./mount-reminder-workspace'); mountReminderWorkspace(root); }
  catch { showProgressStartup(root, 'startup-failed'); }
}
function startAccountApp(session: LiveAccountSession) {
  showProgressStartup(root);
  void startProgressSession({storage:()=>window.localStorage,origin:window.location.origin,locks:navigator.locks,exclusive:true,
    load:async()=>{const {mountAccountApp}=await import('./mount-account-app');await mountAccountApp(root,session);},
    blocked:reason=>{session.dispose();showProgressStartup(root,reason);},
  });
}
const progressView = new URLSearchParams(window.location.search).get('progresso');
if (progressView === 'recuperar') {
  try {
    const entry = captureRecoveryEntry(window.location.href, url => window.history.replaceState(null, '', url));
    void import('./mount-account-recovery').then(({ mountAccountRecovery }) => mountAccountRecovery(root, entry)).catch(() => { entry.discard(); showProgressStartup(root, 'startup-failed'); });
  } catch { showProgressStartup(root, 'startup-failed'); }
}
else {
  try {
    const notice=captureAccountReturn(window.location.href,url=>window.history.replaceState(null,'',url));
    if(notice!=='none')void openAccountWorkspace(notice);
    else if(progressView==='conta')void openAccountWorkspace();
    else if(progressView==='restaurar')void openRestoreWorkspace();
    else void openProgress();
  }catch{showProgressStartup(root,'startup-failed');}
}
async function openProgress() {
  try { if (needsReminderWorkspace(window.location.search, () => window.sessionStorage)) { await openReminderWorkspace(); return; } }
  catch { showProgressStartup(root, 'storage-unavailable'); return; }
  try {
    if (hasAccountTabAccess(window.sessionStorage)) {
      await startProgressSession({storage:()=>window.localStorage,origin:window.location.origin,locks:navigator.locks,exclusive:true,
        load:async()=>{const {mountAccountResume}=await import('./mount-account-resume');await mountAccountResume(root);},
        blocked:reason=>{if(reason==='pending-account')void openAccountWorkspace();else if(reason==='pending-restore')void openRestoreWorkspace();else showProgressStartup(root,reason);},
      });return;
    }
  } catch { showProgressStartup(root,'storage-unavailable');return; }
  await startProgressSession({
  storage: () => window.localStorage,
  origin: window.location.origin,
  locks: navigator.locks,
  load: async () => { const { mountApp } = await import('./bootstrap-app'); mountApp(root); },
  blocked: reason => { if (reason === 'pending-account') void openAccountWorkspace(); else if (reason === 'pending-restore') void openRestoreWorkspace(); else showProgressStartup(root, reason); },
});
}
