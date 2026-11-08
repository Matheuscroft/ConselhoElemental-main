import { useEffect, useRef, useState } from 'react';
import { STORE_KEYS } from '@/lib/backup/progress-backup';
import { LOCAL_PROGRESS_MODE_KEY } from '@/lib/backup/progress-mode';
import { ACCOUNT_INTENT_KEY } from '@/lib/backup/account-intent';
import { ACCOUNT_RESOLUTION_KEY } from '@/lib/backup/account-resolution-key';
import { RESTORE_JOURNAL_KEY } from '@/lib/backup/restore-journal';
import { prepareLocalImport, type WorkspacePreview } from '@/lib/backup/restore-confirmation';
import { runExclusiveRestore } from '@/lib/backup/exclusive-restore';
import { RESTORE_WRITES_RELEASED } from '@/lib/backup/restore-release';
import { restoreFailureMessage } from '@/lib/backup/restore-errors';

interface Props {
  preview: WorkspacePreview;
  onBusyChange: (busy: boolean) => void;
  onComplete: () => void;
}

/** One explicit local replacement/use action. No manual safety-file readback. */
export function SimpleImportActions({ preview, onBusyChange, onComplete }: Props) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [needsReload, setNeedsReload] = useState(false);
  const generation = useRef(0), working = useRef(false), alive = useRef(true);
  useEffect(() => {
    const epoch = generation;
    alive.current = true;
    const changed = (event: StorageEvent) => {
      if (event.key !== null && ![STORE_KEYS.core, STORE_KEYS.fitness, RESTORE_JOURNAL_KEY, LOCAL_PROGRESS_MODE_KEY, ACCOUNT_INTENT_KEY, ACCOUNT_RESOLUTION_KEY].includes(event.key)) return;
      epoch.current++;
      setNeedsReload(true);
      setError('Os dados deste aparelho mudaram. Reabra a importação antes de confirmar.');
    };
    window.addEventListener('storage', changed);
    return () => { alive.current = false; epoch.current++; window.removeEventListener('storage', changed); };
  }, [preview]);

  async function execute() {
    if (!RESTORE_WRITES_RELEASED || working.current || needsReload || preview.audit.issues.length || preview.audit.truncated) return;
    const token = ++generation.current;
    const current = () => alive.current && generation.current === token;
    working.current = true; setBusy(true); onBusyChange(true); setError('');
    try {
      const prepared = await prepareLocalImport(preview, window.localStorage, window.location.origin);
      if (!current()) return;
      const result = await runExclusiveRestore({ storage: () => window.localStorage, locks: navigator.locks, origin: window.location.origin,
        // The adjacent notice and this import action bundle replacement, closing
        // other tabs and local use. The exclusive lease is still mandatory.
        otherTabsClosed: true, isCurrent: current }, { mode: 'import-local', ...prepared, replacementConfirmed: true });
      if (result !== 'local-ready') throw new Error('A importação ainda precisa terminar antes de abrir o app. Retome a conferência.');
      if (current()) onComplete();
    } catch (reason) {
      if (current()) {
        setError(restoreFailureMessage(reason));
        try { if (window.localStorage.getItem(RESTORE_JOURNAL_KEY) !== null) setNeedsReload(true); }
        catch { setNeedsReload(true); }
      }
    } finally {
      working.current = false;
      if (alive.current) { setBusy(false); onBusyChange(false); }
    }
  }

  const invalid = preview.audit.issues.length > 0 || preview.audit.truncated;
  return <section aria-labelledby="simple-import-title">
    <h2 id="simple-import-title">Importe e continue sua jornada</h2>
    <p id="simple-import-consent">Feche outras abas deste app antes de continuar. Ao tocar em importar, você confirma substituir os dados deste aparelho pela cópia escolhida e usá-la aqui. O XP vem do arquivo, sem ser somado novamente. A conta online será configurada depois.</p>
    <p>Não é preciso escolher outro arquivo nem marcar caixas. O estado anterior fica protegido durante a operação para permitir recuperação se houver falha.</p>
    {invalid && <p role="alert" className="restore-workspace-error">O arquivo precisa de revisão. Confira os avisos acima; nenhum dado foi substituído.</p>}
    {!RESTORE_WRITES_RELEASED && <p role="alert">A importação não está disponível nesta versão.</p>}
    {error && <p role="alert" className="restore-workspace-error">{error}</p>}
    {busy && <p role="status" aria-live="polite">Importando e conferindo seu progresso. Aguarde a abertura do Santuário.</p>}
    {needsReload ? <button type="button" disabled={busy} onClick={() => window.location.reload()}>Retomar importação</button>
      : <button type="button" aria-describedby="simple-import-consent" disabled={!RESTORE_WRITES_RELEASED || busy || invalid} onClick={() => void execute()}>{busy ? 'Importando…' : 'Importar e usar neste aparelho'}</button>}
  </section>;
}
