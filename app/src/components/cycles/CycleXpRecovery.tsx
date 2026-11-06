import { useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { planCycleXpRecovery } from '@/lib/cycles/xp-recovery';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';

const names = { terra: 'Terra', fogo: 'Fogo', agua: 'Água', ar: 'Ar' };
const format = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function CycleXpRecovery() {
  const accountId = useAppStore(s => s.currentAccountId);
  return <RecoveryPanel key={accountId ?? 'local'} accountId={accountId} />;
}

function RecoveryPanel({ accountId }: { accountId: string | null }) {
  const habits = useAppStore(s => s.habits);
  const recover = useAppStore(s => s.recoverCycleXp);
  const plan = useMemo(() => planCycleXpRecovery(habits), [habits]);
  const [result, setResult] = useState<{ total: number; backupKey: string | null } | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [confirmedSignature, setConfirmedSignature] = useState<string | null>(null);
  const submittedSignature = useRef<string | null>(null);
  const confirmed = confirmedSignature === plan.signature;
  function apply() {
    if (!confirmed || submittedSignature.current === plan.signature) return;
    submittedSignature.current = plan.signature;
    setError('');
    try {
      const receipt = recover(accountId, plan.signature);
      setResult({ total: receipt.plan.total, backupKey: receipt.backupKey });
      setOpen(false); setConfirmedSignature(null);
    } catch {
      submittedSignature.current = null;
      setError('Não foi possível confirmar a recuperação. Confira se a cópia foi salva e se o saldo mudou antes de tentar novamente. Seus registros não foram apagados.');
    }
  }
  function download() {
    try {
      if (!result?.backupKey) return;
      const data = window.localStorage.getItem(result.backupKey);
      if (!data) throw new Error('Backup unavailable');
      const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'conselho-antes-do-xp-retroativo.json'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError('Não foi possível baixar a cópia anterior neste navegador.'); }
  }
  if (!plan.entries.length && !plan.unresolved && !result) return null;
  return <section className="cycle-xp-recovery" aria-labelledby="cycle-xp-recovery-title">
    <div className="cycle-reward-header"><ArcaneIcon name="historico" size={28} /><div><h2 id="cycle-xp-recovery-title">Seu esforço também conta</h2><p>Recupere o XP de conclusões anteriores dos Ciclos.</p></div></div>
    {result && <div role="status"><strong>+{format(result.total)} XP recuperados nesta conta</strong>{result.backupKey && <button type="button" onClick={download}>Baixar cópia anterior</button>}</div>}
    {plan.entries.length > 0 && <>
      <p><strong>{format(plan.total)} XP</strong> em {plan.entries.length} conclusões com valor registrado.</p>
      <button type="button" className="elemental-action elemental-action-secondary" aria-expanded={open} onClick={() => setOpen(value => !value)}>Conferir recuperação</button>
      {open && <div className="cycle-xp-review">
        <ul>{(Object.keys(names) as ElementId[]).filter(e => plan.byElement[e] > 0).map(e => <li key={e}><ElementIcon element={e} /> {names[e]} <strong>+{format(plan.byElement[e])} XP</strong></li>)}</ul>
        <p>Usamos o valor salvo na conclusão e o elemento atual da atividade. Treinos e recibos com XP marcado são excluídos. Uma cópia local de personagem e ciclos será salva antes do crédito.</p>
        <label><input type="checkbox" checked={confirmed} onChange={event => setConfirmedSignature(event.target.checked ? plan.signature : null)} />Essas conclusões não receberam uma compensação manual de XP anteriormente.</label>
        <button type="button" className="elemental-action" disabled={!confirmed} onClick={apply}>Recuperar {format(plan.total)} XP</button>
      </div>}
    </>}
    {plan.unresolved > 0 && <p className="cycle-xp-recovery-note">{plan.unresolved} registros sem valor recuperável seguro ficam preservados para revisão, incluindo etapas automáticas de valor zero. Não vamos estimar XP pelo planejamento atual.</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
