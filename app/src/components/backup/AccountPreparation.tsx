import { ACCOUNT_RESOLUTION_KEY } from '@/lib/backup/account-resolution-key';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, UserRoundCheck } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { captureProgress } from '@/lib/backup/capture-progress';
import { prepareLocalAssociationReview, assertLocalAssociationReviewCurrent, type LocalAssociationReview } from '@/lib/backup/association-review';
import { STORE_KEYS } from '@/lib/backup/progress-backup';
import { RESTORE_JOURNAL_KEY } from '@/lib/backup/restore-journal';
import { LOCAL_PROGRESS_MODE_KEY } from '@/lib/backup/progress-mode';

export function AccountPreparation() {
  const [review, setReview] = useState<LocalAssociationReview | null>(null);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const generation = useRef(0), job = useRef<number | null>(null), alive = useRef(true), displayed = useRef<LocalAssociationReview | null>(null);
  const makeContext = (token: number) => ({ origin: window.location.origin, readLocal: () => captureProgress(window.location.origin), isCurrent: () => generation.current === token });
  useEffect(() => {
    const ref = generation;
    alive.current = true;
    function invalidate() {
      ref.current++; job.current = null; setBusy(false); displayed.current = null; setReview(null); setMessage('O progresso mudou. Confira novamente para ver os valores atuais.');
    }
    function changed() {
      if (!displayed.current) return;
      try { assertLocalAssociationReviewCurrent(displayed.current, { origin: window.location.origin, readLocal: () => captureProgress(window.location.origin), isCurrent: () => true }); }
      catch { invalidate(); }
    }
    const uncore = useAppStore.subscribe(changed), unfitness = useWorkoutStore.subscribe(changed);
    const external = (event: StorageEvent) => {
      if (event.key === null || [STORE_KEYS.core, STORE_KEYS.fitness, RESTORE_JOURNAL_KEY, LOCAL_PROGRESS_MODE_KEY, ACCOUNT_RESOLUTION_KEY].includes(event.key)) invalidate();
    };
    window.addEventListener('storage', external);
    return () => { ref.current++; alive.current = false; uncore(); unfitness(); window.removeEventListener('storage', external); };
  }, []);
  async function inspect() {
    if (job.current !== null) return;
    const token = ++generation.current;
    job.current = token; displayed.current = null; setReview(null); setBusy(true); setMessage('Conferindo o progresso deste navegador…');
    try {
      const result = await prepareLocalAssociationReview(makeContext(token));
      if (generation.current !== token) return;
      assertLocalAssociationReviewCurrent(result, makeContext(token));
      displayed.current = result; setReview(result); setMessage('Conferência local pronta. Esta conferência não enviou nem alterou registros.');
    } catch (error) { if (generation.current === token) setMessage(error instanceof Error ? error.message : 'Não foi possível conferir o progresso. Tente novamente.'); }
    finally { if (job.current === token) { job.current = null; if (alive.current) setBusy(false); } }
  }
  function cancel() { generation.current++; job.current = null; displayed.current = null; setReview(null); setBusy(false); setMessage('Conferência encerrada. Seu progresso foi preservado.'); }
  return <details className="account-preparation"><summary><UserRoundCheck size={20} aria-hidden="true" />Preparar conta pessoal<ChevronDown size={18} aria-hidden="true" className="account-preparation-chevron" /></summary>
    <p><a className="progress-backup-restore-link" href="/?progresso=conta">Conferir envio para conta com o app pausado</a></p>
    <p>Confira o que está guardado neste navegador. A transferência para sua conta online ainda está em preparação.</p>
    <button type="button" disabled={busy} onClick={() => void inspect()}>Conferir progresso local</button>
    <p role="status" aria-live="polite">{message}</p>
    {review && <div className="account-preparation-review"><h3>Progresso de {review.profileName}</h3>
      <dl aria-label="Resumo do progresso local"><div><dt>Perfis locais</dt><dd>{review.summary.profiles}</dd></div><div><dt>Rituais</dt><dd>{review.summary.tasks}</dd></div><div><dt>Ciclos</dt><dd>{review.summary.habits}</dd></div><div><dt>Jornadas e obras</dt><dd>{review.summary.quests + review.summary.projects}</dd></div><div><dt>Rascunhos</dt><dd>{review.summary.drafts}</dd></div><div><dt>Sessões de treino</dt><dd>{review.summary.sessions}</dd></div></dl>
      <h4>XP registrado no personagem</h4><dl className="account-preparation-xp">{review.xp.map(item => <div key={item.element}><dt>{item.element}</dt><dd>{item.amount} XP</dd></div>)}</dl>
      <p>Atividades e XP são do perfil atual. A cópia de segurança inclui os outros perfis; as sessões de treino acima somam todas as contas locais.</p>
      <p>O envio online ainda precisa preservar personagem, histórico e Treinos em conjunto. Esta conferência não conecta uma conta nem ativa sincronização.</p>
    </div>}
    {(busy || review) && <button type="button" className="account-preparation-close" onClick={cancel}>{busy ? 'Cancelar conferência local' : 'Fechar conferência local'}</button>}
  </details>;
}
