import { useEffect, useRef, useState } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { captureProgress } from '@/lib/backup/capture-progress';
import { compareProgressBackup, progressFingerprint, type RestoreComparison as Comparison } from '@/lib/backup/restore-comparison';

export function RestoreComparison({ fileText }: { fileText: string }) {
  const [plan, setPlan] = useState<Comparison | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const generation = useRef(0);
  const working = useRef(false);
  const active = useRef(false);
  useEffect(() => {
    const pending = generation;
    const invalidate = () => {
      if (!active.current) return;
      generation.current++; working.current = false; active.current = false;
      setPlan(null); setBusy(false); setError('');
      setMessage('O estado do app mudou. Compare novamente para ver uma prévia atual.');
    };
    const core = useAppStore.subscribe(invalidate), fitness = useWorkoutStore.subscribe(invalidate);
    return () => { pending.current++; core(); fitness(); };
  }, []);
  async function compare() {
    if (working.current) return;
    const id = ++generation.current;
    working.current = true; active.current = true;
    setBusy(true); setPlan(null); setError(''); setMessage('');
    try {
      const snapshot = captureProgress(window.location.origin);
      const result = await compareProgressBackup(fileText, snapshot);
      if (generation.current !== id) return;
      if (result.baseline !== progressFingerprint(captureProgress(window.location.origin))) {
        setMessage('O progresso mudou. Compare novamente.');
        return;
      }
      setPlan(result);
      setMessage('Comparação pronta. Nenhum dado foi alterado.');
    } catch (reason) {
      if (generation.current === id) setError(reason instanceof Error ? reason.message : 'Não foi possível comparar. Nenhum dado foi alterado.');
    } finally {
      if (generation.current === id) { working.current = false; setBusy(false); }
    }
  }
  function close() {
    generation.current++; working.current = false; active.current = false;
    setPlan(null); setBusy(false); setError(''); setMessage('Prévia fechada. Nenhum dado foi alterado.');
  }
  return <section className="restore-comparison" aria-label="Prévia de restauração">
    <h3>Antes de restaurar</h3>
    <p>Compare este arquivo com o progresso atual. A restauração futura substituirá o conteúdo local das duas partes, incluindo os outros perfis; não somará XP nem mesclará atividades.</p>
    <div className="progress-backup-actions">
      <button type="button" disabled={busy} onClick={() => void compare()}><GitCompareArrows size={20} aria-hidden="true" />Comparar com meu progresso</button>
      {(busy || plan) && <button type="button" onClick={close}>{busy ? 'Cancelar comparação' : 'Fechar prévia'}</button>}
    </div>
    <p role="status" aria-live="polite">{busy ? 'Comparando as contas e os registros…' : message}</p>
    {error && <p role="alert" className="progress-backup-error">{error}</p>}
    {plan && <div>
      <p>Arquivo de {new Date(plan.fileCreatedAt).toLocaleString('pt-BR')} · App {plan.fileVersion}</p>
      <p>Perfil ativo: {plan.currentAccount} → {plan.incomingAccount}.</p>
      {plan.audit.issues.length > 0 ? <div role="alert" className="progress-backup-error">
        <h4>Esta cópia precisa de revisão</h4>
        <ul>{[...new Set(plan.audit.issues.map(issue => issue.message))].map(message => <li key={message}>{message}</li>)}</ul>
        <p>{plan.audit.truncated ? 'Há mais registros para conferir. ' : ''}Guarde o arquivo original. Nenhum dado foi corrigido ou substituído.</p>
      </div> : <p>A conferência de dados críticos não encontrou problemas nos campos verificados. Isso ainda não libera a restauração: a validação completa e a confirmação continuam pendentes.</p>}
      {(!plan.sameOrigin || !plan.sameVersion || !plan.sameActiveAccount) && <ul className="restore-comparison-notices">
        {!plan.sameOrigin && <li>Arquivo de outro endereço do app. Isso não confirma a mesma conta online.</li>}
        {!plan.sameVersion && <li>Versões do app diferentes. A compatibilidade de restauração ainda precisa ser validada.</li>}
        {!plan.sameActiveAccount && <li>O perfil ativo mudaria. Confira também os demais perfis abaixo.</li>}
      </ul>}
      {plan.accounts.map(account => <details key={account.id} className="restore-comparison-account">
        <summary>{account.name}<span>{account.status === 'added' ? 'Entraria na cópia local' : account.status === 'removed' ? 'Sairia da cópia local' : 'Comparar alterações'}</span></summary>
        <p>Identificador: {account.id}</p>
        <ul className="restore-comparison-rows">{account.rows.filter(row => row.before || row.after).map(row => <li key={row.label}>
          <strong>{row.label}</strong><span>Agora: {row.before} · Na cópia: {row.after}</span>
          <span>{row.added} novos · {row.changed} alterados · {row.removed} removidos</span>
        </li>)}</ul>
        <h4>XP registrado por elemento</h4>
        <dl className="restore-comparison-xp">{account.xp.map(xp => <div key={xp.label}><dt>{xp.label}</dt><dd>{xp.before ?? 'Não disponível'} → {xp.after ?? 'Não disponível'}</dd></div>)}</dl>
      </details>)}
      <p>Alterações incluem subitens dentro da atividade principal. “Demais dados” compara personagem, preferências do perfil, catálogos, medidas e outros campos; não representa uma contagem de atividades. Históricos nativo e legado são mostrados separadamente.</p>
    </div>}
    <p>A aplicação da restauração ainda não está disponível. Esta prévia não grava dados nem ativa sincronização. A etapa de confirmação e recuperação em caso de falha vem a seguir.</p>
  </section>;
}
