import { ACCOUNT_RESOLUTION_KEY } from '@/lib/backup/account-resolution-key';
import { ACCOUNT_INTENT_KEY } from '@/lib/backup/account-intent';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, FileCheck2, ShieldCheck } from 'lucide-react';
import { MAX_BACKUP_BYTES, STORE_KEYS } from '@/lib/backup/progress-backup';
import { RESTORE_JOURNAL_KEY, reviewPendingRestore, assertPendingRestoreReview, copyRecoveryBaseline, createRecoverySafetyCopy, type PendingRestoreReview } from '@/lib/backup/restore-journal';
import { prepareWorkspacePreview, createWorkspaceSafetyCopy, assertWorkspaceBaseline } from '@/lib/backup/workspace-preview';
import { LOCAL_PROGRESS_MODE_KEY } from '@/lib/backup/progress-mode';
import { RestoreActions } from './RestoreActions';
import { RESTORE_WRITES_RELEASED } from '@/lib/backup/restore-release';

type Preview = Awaited<ReturnType<typeof prepareWorkspacePreview>>;

/** Mounted in a separate document before App/stores/auth are imported. Read-only release. */
export function RestoreWorkspace() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Escolha a cópia que deseja conferir. Nenhum dado será substituído nesta etapa.');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [pendingRestore, setPendingRestore] = useState(false);
  const [recovery, setRecovery] = useState<PendingRestoreReview | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const working = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const token = generation;
    heading.current?.focus({ preventScroll: true });
    const checkPending = () => {
      try {
        const pending = window.localStorage.getItem(RESTORE_JOURNAL_KEY) !== null;
        setPendingRestore(pending);
        if (pending) {
          setMessage('A sessão normal permanece pausada enquanto a recuperação é conferida.');
          setError('Há uma recuperação pendente. Confira as versões protegidas abaixo. Não limpe os dados do navegador.');
        }
      } catch { setPendingRestore(true); setError('Não foi possível ler o progresso salvo. Confira a permissão de armazenamento deste site e recarregue.'); }
    };
    checkPending();
    const invalidate = (event: StorageEvent) => {
      if (event.key !== null && !new Set<string>([STORE_KEYS.core, STORE_KEYS.fitness, RESTORE_JOURNAL_KEY, LOCAL_PROGRESS_MODE_KEY, ACCOUNT_INTENT_KEY, ACCOUNT_RESOLUTION_KEY]).has(event.key)) return;
      token.current++; working.current = false;
      setPreview(null); setRecovery(null); setBusy(false); setError('');
      setMessage('O progresso mudou em outra aba. Escolha o arquivo novamente para atualizar a conferência.');
      checkPending();
    };
    window.addEventListener('storage', invalidate);
    return () => { token.current++; window.removeEventListener('storage', invalidate); };
  }, []);
  function cancel() {
    generation.current++; working.current = false;
    setPreview(null); setRecovery(null); setBusy(false); setError(''); setMessage('Conferência cancelada. Seu progresso foi preservado.');
  }
  async function run(action: (current: () => boolean) => Promise<void>, retainedRecovery: PendingRestoreReview | null = null) {
    if (working.current) return;
    working.current = true;
    const id = ++generation.current;
    setBusy(true); setPreview(null); setRecovery(retainedRecovery); setError(''); setMessage('Conferindo os arquivos…');
    const current = () => generation.current === id;
    try { await action(current); }
    catch (reason) { if (current()) { setRecovery(null); setMessage(''); setError(reason instanceof Error ? reason.message : 'Não foi possível conferir. Seu progresso foi preservado.'); } }
    finally { if (current()) { working.current = false; setBusy(false); } }
  }
  function select(input: File) {
    void run(async current => {
      if (input.size > MAX_BACKUP_BYTES) throw new Error('Escolha uma cópia de até 20 MB.');
      const text = await input.text();
      if (!current()) return;
      const result = await prepareWorkspacePreview(text, window.localStorage, window.location.origin);
      if (!current()) return;
      assertWorkspaceBaseline(window.localStorage, result.baseline);
      setPreview(result); setMessage('Conferência pronta. Os valores abaixo são os registrados na cópia.');
    });
  }
  function safetyCopy() {
    void run(async current => {
      const result = await createWorkspaceSafetyCopy(window.localStorage, window.location.origin);
      if (!current()) return;
      assertWorkspaceBaseline(window.localStorage, result.baseline);
      download(result.text, 'conselho-antes-da-restauracao');
      setMessage('Download solicitado. Confira se a cópia foi salva em Arquivos ou Downloads.');
    });
  }
  function download(text: string, name: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = `${name}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    try { document.body.append(link); link.click(); }
    finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  }
  function recoveryCopy(side: 'before' | 'target') {
    if (!recovery) return;
    const reviewed = { ...recovery, baseline: copyRecoveryBaseline(recovery.baseline) };
    void run(async current => {
      const text = await createRecoverySafetyCopy(window.localStorage, reviewed, side, window.location.origin);
      if (!current()) return;
      assertPendingRestoreReview(window.localStorage, reviewed);
      download(text, `conselho-recuperacao-${side === 'before' ? 'anterior' : 'destino'}`);
      setRecovery(reviewed); setMessage(`Download da versão ${side === 'before' ? 'anterior' : 'de destino'} solicitado. Confira se o arquivo foi salvo em Arquivos ou Downloads.`);
    }, reviewed);
  }
  function reviewRecovery() {
    void run(async current => {
      const result = await reviewPendingRestore(window.localStorage, window.location.origin);
      if (!current()) return;
      if (!result) throw new Error('A recuperação não está mais pendente. Recarregue a conferência.');
      assertPendingRestoreReview(window.localStorage, result);
      setRecovery(result); setMessage('Versões conferidas. Nenhuma recuperação foi executada.');
    });
  }
  return <main className="restore-workspace" aria-labelledby="restore-workspace-heading">
    {pendingRestore ? <button type="button" className="restore-workspace-secondary" onClick={() => window.location.reload()}>Recarregar conferência</button> : <a className="restore-workspace-back" href="/grimorio#grimoire-backup"><ArrowLeft size={20} aria-hidden="true" />Voltar ao Grimório</a>}
    <header><ShieldCheck size={32} aria-hidden="true" /><div><p>Conselho Elemental</p><h1 id="restore-workspace-heading" ref={heading} tabIndex={-1}>Confira sua jornada</h1></div></header>
    <p>O app está pausado nesta página. Compare uma cópia com o progresso salvo antes de decidir sobre uma restauração.</p>
    <section aria-labelledby="restore-workspace-files"><h2 id="restore-workspace-files">Suas cópias de segurança</h2>
      <div className="restore-workspace-actions">
        <button type="button" disabled={busy || pendingRestore} onClick={safetyCopy}><Download size={20} aria-hidden="true" />Baixar cópia do estado atual</button>
        <button type="button" disabled={busy || pendingRestore} onClick={() => file.current?.click()}><FileCheck2 size={20} aria-hidden="true" />Escolher arquivo para conferir</button>
        <input ref={file} type="file" accept="application/json,.json" hidden aria-label="Cópia para restauração" onChange={event => { const selected = event.target.files?.[0]; event.target.value = ''; if (selected) select(selected); }} />
      </div>
      {busy && <button type="button" className="restore-workspace-secondary" onClick={cancel}>Cancelar conferência</button>}
      <p role="status" aria-live="polite">{message}</p>
      {error && <p role="alert" className="restore-workspace-error">{error}</p>}
    </section>
    {pendingRestore && <section aria-labelledby="restore-workspace-recovery"><h2 id="restore-workspace-recovery">Proteja sua jornada</h2>
      <p>Há uma operação pendente no progresso salvo. Confira as versões guardadas antes de retomar o app.</p>
      <button type="button" disabled={busy} onClick={reviewRecovery}><ShieldCheck size={20} aria-hidden="true" />Conferir recuperação pendente</button>
      {recovery && <>
        <h3>{recovery.phase === 'prepared' ? 'Substituição não confirmada' : 'Substituição já confirmada'}</h3>
        <p>{recovery.outcome === 'conflict'
          ? 'Foram encontradas alterações fora desta operação. A recuperação precisa de revisão para preservar essas mudanças.'
          : recovery.outcome === 'rollback'
            ? 'A recuperação devolveria as duas partes do progresso ao estado anterior à substituição.'
            : 'A cópia de destino já foi confirmada e permanece isolada. Para abrir o app, confirme o uso somente local abaixo.'}</p>
        <p>Você pode guardar as duas versões antes de continuar a revisão.</p>
        {([['Antes da substituição', recovery.before, 'before'], ['Cópia de destino', recovery.target, 'target']] as const).map(([label, summary, side]) => <details key={label} className="restore-workspace-profile"><summary>{label}</summary>
          {summary ? <><dl aria-label={label}><div><dt>Rituais principais</dt><dd>{summary.tasks}</dd></div><div><dt>Ciclos principais</dt><dd>{summary.habits}</dd></div><div><dt>Jornadas e obras</dt><dd>{summary.quests + summary.projects}</dd></div><div><dt>Perfis cadastrados</dt><dd>{summary.profiles}</dd></div><div><dt>Sessões de treino salvas</dt><dd>{summary.sessions}</dd></div></dl>
            <button type="button" className="restore-workspace-secondary" disabled={busy} onClick={() => recoveryCopy(side)}><Download size={20} aria-hidden="true" />{side === 'before' ? 'Baixar versão anterior' : 'Baixar versão de destino'}</button></>
            : <p>Não havia progresso salvo nesta origem antes da operação.</p>}
        </details>)}
        <p id="restore-workspace-recovery-release">{recovery.outcome === 'keep-target'
          ? 'As cópias podem ser baixadas acima. A conferência e a recarga desta página mantêm a proteção; não conectam esse progresso à nuvem.'
          : 'Seu progresso continua protegido nesta página. A execução da recuperação depende da validação final de isolamento entre abas e recarga.'}</p>
        {!RESTORE_WRITES_RELEASED && <button type="button" disabled aria-describedby="restore-workspace-recovery-release">{recovery.outcome === 'keep-target' ? 'Abertura da cópia ainda indisponível' : 'Recuperação ainda indisponível'}</button>}
      </>}
    </section>}
    {preview && <section aria-labelledby="restore-workspace-result"><h2 id="restore-workspace-result">O que mudaria</h2>
      <p>Cópia de {new Date(preview.summary.createdAt).toLocaleString('pt-BR')} · App {preview.summary.appVersion}</p>
      <dl aria-label="Conteúdo da cópia selecionada"><div><dt>Rituais principais</dt><dd>{preview.summary.tasks}</dd></div><div><dt>Ciclos principais</dt><dd>{preview.summary.habits}</dd></div><div><dt>Jornadas e obras</dt><dd>{preview.summary.quests + preview.summary.projects}</dd></div><div><dt>Perfis cadastrados</dt><dd>{preview.summary.profiles}</dd></div><div><dt>Sessões de treino salvas</dt><dd>{preview.summary.sessions}</dd></div></dl>
      <p>A restauração substituiria os dados locais de todos os perfis, incluindo Treinos. O XP não seria somado ao saldo atual.</p>
      {!preview.comparison && <p>Este navegador não tem progresso salvo nesta origem. A cópia entraria como progresso inicial.</p>}
      {preview.summary.origin !== window.location.origin && <p>Esta cópia veio de outro endereço. Isso não comprova que pertença à mesma conta online.</p>}
      {preview.audit.issues.length > 0 && <div role="alert" className="restore-workspace-error"><h3>A cópia precisa de revisão</h3><ul>{[...new Set(preview.audit.issues.map(issue => issue.message))].map(text => <li key={text}>{text}</li>)}</ul>{preview.audit.truncated && <p>Há mais registros para conferir. Guarde o arquivo original.</p>}</div>}
      {preview.comparison?.accounts.map(account => <details key={account.id} className="restore-workspace-profile"><summary>{account.name}<span>{account.status === 'added' ? 'Entraria na cópia local' : account.status === 'removed' ? 'Sairia da cópia local' : 'Ver mudanças'}</span></summary>
        <ul>{account.rows.filter(row => row.before || row.after).map(row => <li key={row.label}><strong>{row.label}</strong><span>{row.before} agora → {row.after} na cópia</span><small>{row.added} novos · {row.changed} alterados · {row.removed} removidos</small></li>)}</ul>
        <h3>XP registrado</h3><dl>{account.xp.map(xp => <div key={xp.label}><dt>{xp.label}</dt><dd>{xp.before ?? 'Não disponível'} → {xp.after ?? 'Não disponível'}</dd></div>)}</dl>
      </details>)}
      <button type="button" className="restore-workspace-secondary" onClick={cancel}>Fechar comparação</button>
    </section>}
    <RestoreActions preview={preview} recovery={recovery} onComplete={result => {
      if (result === 'local-ready') window.location.assign('/santuario');
      else window.location.reload();
    }} />
    {!RESTORE_WRITES_RELEASED && <section className="restore-workspace-confirmation" aria-labelledby="restore-workspace-confirmation"><h2 id="restore-workspace-confirmation">Antes de confirmar</h2>
      <ol><li>Guarde e confira a cópia do progresso atual.</li><li>Revise as mudanças de todos os perfis.</li><li>Feche as outras abas do app antes de uma futura substituição.</li></ol>
      <p id="restore-workspace-release">A aplicação da restauração ainda não está liberada. A conferência desta página preserva seu progresso; a gravação depende da validação final de recuperação e recarga.</p>
      <button type="button" disabled aria-describedby="restore-workspace-release">Restauração ainda indisponível</button>
    </section>}
  </main>;
}
