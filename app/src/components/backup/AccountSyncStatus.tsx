import { useSyncExternalStore } from 'react';
import { CloudCheck, CloudOff } from 'lucide-react';
import type { LiveAccountSync } from '@/lib/backup/account-live-sync';
import './restored-local-notice.css';

export function AccountSyncStatus({ sync }: { sync: LiveAccountSync }) {
  const view = useSyncExternalStore(sync.subscribe,sync.getSnapshot,sync.getSnapshot);
  const paused = ['pending','blocked','stopped'].includes(view.status);
  const offline = view.status === 'offline';
  function leave(url: string) { const forgotten = sync.forgetAccess(); window.location.assign(forgotten ? url : '/?progresso=conta'); }
  return <aside className="restored-local-notice account-sync-status" aria-label="Sincronização integral da conta">
    {paused || offline ? <CloudOff size={20} aria-hidden="true"/> : <CloudCheck size={20} aria-hidden="true"/>}
    <span role="status" aria-live="polite"><strong>{offline?'Sem internet':paused?'Conferência necessária':view.status==='saved'?'Progresso salvo':'Sua conta pessoal'}</strong><small>{view.message}</small></span>
    {paused ? <button type="button" onClick={()=>leave('/?progresso=conta')}>Conferir versões</button> : <button type="button" disabled={offline||view.status==='checking'||view.status==='saving'} onClick={()=>void sync.flush()}>Conferir agora</button>}
    <button type="button" onClick={()=>leave('/santuario')}>Parar e esquecer acesso</button>
  </aside>;
}
