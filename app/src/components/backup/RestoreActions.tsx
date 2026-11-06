import { useEffect, useRef, useState } from 'react';
import { MAX_BACKUP_BYTES } from '@/lib/backup/progress-backup';
import { LOCAL_PROGRESS_MODE_KEY } from '@/lib/backup/progress-mode';
import { STORE_KEYS } from '@/lib/backup/progress-backup';
import { RESTORE_JOURNAL_KEY, type PendingRestoreReview } from '@/lib/backup/restore-journal';
import { runExclusiveRestore } from '@/lib/backup/exclusive-restore';
import { prepareConfirmedRestore, verifyPreviousSafetyCopy, type WorkspacePreview } from '@/lib/backup/restore-confirmation';
import { RESTORE_WRITES_RELEASED } from '@/lib/backup/restore-release';

interface Props {
  preview: WorkspacePreview | null;
  recovery: PendingRestoreReview | null;
  onComplete: (result: string) => void;
}
/** All mutation is coordinated before App imports. Release remains statically closed. */
export function RestoreActions({ preview, recovery, onComplete }: Props) {
  const [previousCopy, setPreviousCopy] = useState<string | null>(null);
  const [tabsClosed, setTabsClosed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [needsReload, setNeedsReload] = useState(false);
  const generation = useRef(0), working = useRef(false), alive = useRef(true), input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const token = generation;
    alive.current = true;
    token.current++; setPreviousCopy(null); setTabsClosed(false); setConfirmed(false); setMessage('');
    const changed = (event: StorageEvent) => {
      if (event.key !== null && ![STORE_KEYS.core, STORE_KEYS.fitness, RESTORE_JOURNAL_KEY, LOCAL_PROGRESS_MODE_KEY].includes(event.key)) return;
      token.current++; setPreviousCopy(null); setConfirmed(false); setTabsClosed(false);
      setMessage('O progresso mudou. Refaça a conferência antes de confirmar.');
    };
    window.addEventListener('storage', changed);
    return () => { token.current++; alive.current = false; window.removeEventListener('storage', changed); };
  }, [preview, recovery]);
  async function checkCopy(file: File) {
    if (working.current || !preview) return;
    const selected = preview, token = ++generation.current;
    working.current = true; setBusy(true); setPreviousCopy(null); setMessage('Conferindo a cópia anterior…');
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('Escolha uma cópia de até 20 MB.');
      const text = await file.text();
      if (generation.current !== token) return;
      await verifyPreviousSafetyCopy(text, selected.baseline, window.localStorage, window.location.origin);
      if (generation.current === token) { setPreviousCopy(text); setMessage('Cópia anterior salva e conferida.'); }
    } catch (error) { if (generation.current === token) setMessage(error instanceof Error ? error.message : 'Não foi possível conferir a cópia.'); }
    finally { working.current = false; if (alive.current) setBusy(false); }
  }
  const incomingReady = !!preview && !preview.audit.issues.length && !preview.audit.truncated;
  const recoveryReady = !!recovery && recovery.outcome !== 'conflict';
  const ready = tabsClosed && confirmed && (preview ? incomingReady && (!preview.baseline.snapshot || previousCopy !== null) : recoveryReady);
  async function execute() {
    if (!RESTORE_WRITES_RELEASED || working.current || !ready || needsReload) return;
    const selected = preview, reviewed = recovery, safety = previousCopy;
    const token = ++generation.current, current = () => generation.current === token;
    working.current = true; setBusy(true); setMessage('Confirmando o progresso. Aguarde a conclusão antes de fechar esta página.');
    try {
      const context = { storage: () => window.localStorage, locks: navigator.locks, origin: window.location.origin, otherTabsClosed: tabsClosed, isCurrent: current };
      let result: string;
      if (selected) {
        const journal = await prepareConfirmedRestore(selected, safety, window.localStorage, context.origin);
        if (!current()) return;
        result = await runExclusiveRestore(context, { mode: 'apply', journal, previousBackup: safety, replacementConfirmed: confirmed });
      } else if (reviewed?.outcome === 'rollback') result = await runExclusiveRestore(context, { mode: 'recover', expected: reviewed.baseline, recoveryConfirmed: confirmed });
      else if (reviewed?.outcome === 'keep-target') result = await runExclusiveRestore(context, { mode: 'local', expected: reviewed.baseline, localUseConfirmed: confirmed });
      else return;
      if (current()) onComplete(result);
    } catch (error) {
      if (current()) {
        setMessage(error instanceof Error ? error.message : 'Não foi possível concluir. Preserve os dados do navegador.');
        try { if (window.localStorage.getItem(RESTORE_JOURNAL_KEY) !== null) setNeedsReload(true); }
        catch { setNeedsReload(true); }
      }
    }
    finally { working.current = false; if (alive.current) setBusy(false); }
  }
  if (!preview && !recovery) return null;
  const local = recovery?.outcome === 'keep-target';
  return <section aria-labelledby="restore-action-title"><h2 id="restore-action-title">{preview ? 'Confirmar substituição' : local ? 'Continuar com a cópia' : 'Recuperar a versão anterior'}</h2>
    {preview?.baseline.snapshot && <>
      <p>Selecione o arquivo da cópia do progresso atual que você guardou antes de restaurar.</p>
      <button type="button" className="restore-workspace-secondary" disabled={busy} onClick={() => input.current?.click()}>Conferir cópia anterior salva</button>
      <input ref={input} type="file" hidden accept="application/json,.json" aria-label="Arquivo da cópia anterior" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void checkCopy(file); }} />
    </>}
    <label className="restore-workspace-consent"><input type="checkbox" checked={tabsClosed} disabled={busy} onChange={event => setTabsClosed(event.target.checked)} />Fechei as outras abas e janelas deste app.</label>
    <label className="restore-workspace-consent"><input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)} />{preview
      ? 'Confirmo substituir os dados locais de todos os perfis por esta cópia. O XP não será somado ao saldo atual.'
      : local ? 'Quero usar esta cópia apenas neste navegador, sem conectar ou enviar meu progresso à nuvem.' : 'Confirmo devolver as duas partes do progresso ao estado anterior à tentativa de restauração.'}</label>
    <p role="status" aria-live="polite">{message}</p>
    {!RESTORE_WRITES_RELEASED && <p>A confirmação foi preparada, mas a gravação permanece bloqueada até o teste final de restauração e recarga no navegador.</p>}
    <button type="button" disabled={!RESTORE_WRITES_RELEASED || !ready || busy || needsReload} onClick={() => void execute()}>{busy ? 'Aguarde…' : preview ? 'Restaurar esta cópia' : local ? 'Continuar somente local' : 'Recuperar progresso anterior'}</button>
    {needsReload && <><p>Há uma operação para conferir. Preserve os dados deste navegador e revise a recuperação antes de tentar novamente.</p><button type="button" className="restore-workspace-secondary" onClick={() => window.location.reload()}>Revisar recuperação pendente</button></>}
  </section>;
}
