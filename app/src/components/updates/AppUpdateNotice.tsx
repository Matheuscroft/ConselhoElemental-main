import { useContext, useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { version } from '../../../package.json';
import { newerRelease } from '@/lib/updates/release';
import { AccountConnectionContext } from '@/lib/backup/account-connection-context';
import { ACCOUNT_INTENT_KEY } from '@/lib/backup/account-intent';
import { ACCOUNT_RESOLUTION_KEY } from '@/lib/backup/account-resolution-key';
import { RESTORE_JOURNAL_KEY } from '@/lib/backup/restore-journal';
import './app-update.css';

export function AppUpdateNotice() {
  const sync = useContext(AccountConnectionContext);
  const [next, setNext] = useState<string | null>(null), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const dismissed = useRef<string | null>(null);
  useEffect(() => {
    let controller: AbortController | undefined, disposed = false, last = 0;
    const check = async () => {
      if (document.visibilityState === 'hidden' || !navigator.onLine || Date.now() - last < 30000) return;
      last = Date.now(); controller?.abort(); controller = new AbortController();
      const abort = setTimeout(() => controller?.abort(), 15000);
      try {
        const response = await fetch('/app-version.json', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) return;
        const release = newerRelease(version, await response.json());
        if (!disposed && release && release !== dismissed.current) setNext(release);
      } catch { /* Being offline never prevents using the current app. */ }
      finally { clearTimeout(abort); }
    };
    const run = () => { void check(); };
    run(); const interval = setInterval(run, 5 * 60 * 1000);
    window.addEventListener('focus', run); window.addEventListener('online', run); document.addEventListener('visibilitychange', run);
    return () => { disposed = true; controller?.abort(); clearInterval(interval); window.removeEventListener('focus', run); window.removeEventListener('online', run); document.removeEventListener('visibilitychange', run); };
  }, []);
  if (!next) return null;
  async function update() {
    setBusy(true); setMessage('');
    try {
      if (!navigator.onLine) throw Error('Conecte-se à internet para atualizar.');
      if (sync) { await sync.flush(); if (!['saved', 'idle'].includes(sync.getSnapshot().status)) throw Error('Confira o salvamento da sua conta antes de atualizar.'); }
      if ([ACCOUNT_INTENT_KEY, ACCOUNT_RESOLUTION_KEY, RESTORE_JOURNAL_KEY].some(key => localStorage.getItem(key) !== null)) throw Error('Conclua a conferência do seu progresso antes de atualizar.');
      // No cache/storage clearing, new origin or automatic reload during editing.
      const url = new URL(location.href); url.searchParams.set('atualizar', next!); window.location.replace(url);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível atualizar agora.'); setBusy(false); }
  }
  return <aside className="app-update-notice" aria-label="Atualização disponível"><RefreshCw size={22} aria-hidden="true" /><div><strong>Uma nova versão está pronta</strong><p>Salve o que estiver editando. Seu progresso neste aparelho será mantido.</p>{message && <p role="status">{message}</p>}<button type="button" disabled={busy} onClick={() => void update()}>{busy ? 'Conferindo…' : 'Atualizar agora'}</button></div><button className="app-update-later" type="button" disabled={busy} aria-label="Ver atualização depois" onClick={() => { dismissed.current = next; setNext(null); }}><X size={20} /></button></aside>;
}
