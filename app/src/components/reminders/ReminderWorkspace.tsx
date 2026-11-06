import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BellRing, ShieldCheck } from 'lucide-react';
import { reminderReturnFromSearch } from '@/lib/reminders/reminder-return';
import { REMINDER_HANDOFF_KEY } from '@/lib/reminders/reminder-handoff';
import { REMINDER_WRITES_RELEASED } from '@/lib/reminders/reminder-release';
import { REMINDER_WATCH_KEYS, reviewReminderWorkspace, runReminderWorkspaceAction, type ReminderWorkspaceAction, type ReminderWorkspaceReview } from '@/lib/reminders/reminder-workspace';

interface PanelProps {
  returnTo?: string;
  review: ReminderWorkspaceReview | null;
  busy: boolean;
  error: string;
  tabsClosed: boolean;
  confirmed: boolean;
  onTabs: (value: boolean) => void;
  onConfirm: (value: boolean) => void;
  onRefresh: () => void;
  onAction: (action: ReminderWorkspaceAction) => void;
}
/** Presentation only: no raw snapshot, account identifier or recovery payload is rendered. */
export function ReminderWorkspacePanel({ review, busy, error, tabsClosed, confirmed, onTabs, onConfirm, onRefresh, onAction, returnTo = '/santuario' }: PanelProps) {
  const handoff = review?.handoff;
  const accountBlocked = review?.accounts.some(value => value !== null);
  const pending = handoff?.status === 'pending-recovery';
  const rollback = review?.recovery?.outcome === 'rollback';
  const canCancel = !!handoff && (handoff.status === 'prepared' || handoff.status === 'changed');
  const action: ReminderWorkspaceAction | null = accountBlocked ? null
    : pending ? review?.recovery?.outcome === 'conflict' ? null : rollback ? 'recover' : 'local'
      : handoff?.status === 'prepared' && review?.localOnly ? 'apply'
        : handoff?.status === 'committed' && review?.localOnly ? 'finish' : null;
  const labels = { apply: 'Salvar aviso', recover: 'Recuperar progresso anterior', local: 'Continuar somente local', finish: 'Voltar ao app' };
  const consent = action === 'recover' ? 'Confirmo recuperar o progresso anterior à tentativa de salvar o aviso.'
    : action === 'local' ? 'Quero continuar com esta cópia somente neste navegador, sem enviá-la à nuvem.'
      : action === 'finish' ? 'Conferi o aviso salvo e quero voltar ao app com meu progresso local.'
        : 'Confirmo salvar esta alteração de aviso no meu progresso local.';
  return <main className="restore-workspace" aria-labelledby="reminder-workspace-heading" aria-busy={busy}>
    <header><BellRing size={32} aria-hidden="true" /><div><p>Conselho Elemental</p><h1 id="reminder-workspace-heading" tabIndex={-1}>Confira seu aviso</h1></div></header>
    <p>Confira a alteração antes de salvar. Suas atividades e recompensas permanecem preservadas.</p>
    <p role="status" aria-live="polite">{busy ? 'Conferindo seu progresso…' : review ? 'Conferência atualizada.' : 'Atualize a conferência para continuar.'}</p>
    {error && <p role="alert" className="restore-workspace-error">{error}</p>}
    <button type="button" className="restore-workspace-secondary" disabled={busy} onClick={onRefresh}>Atualizar conferência</button>
    {!REMINDER_WRITES_RELEASED && <p className="account-workspace-release">A gravação de avisos ainda está em validação. Você pode conferir ou descartar uma alteração pendente; salvar e retomar uma recuperação continuam indisponíveis.</p>}
    {review && !handoff && <section><h2>{review.orphanRecovery ? 'Há uma recuperação para conferir' : 'Nenhuma alteração de aviso pendente'}</h2>
      <p>{review.orphanRecovery ? 'A operação protegida pode ser conferida na recuperação do progresso.' : 'Nenhum aviso foi alterado nesta página.'}</p>
      {review.orphanRecovery ? <a className="restore-workspace-back" href="/?progresso=restaurar">Conferir recuperação</a> : <a className="restore-workspace-back" href={returnTo}><ArrowLeft size={20} aria-hidden="true" />Voltar ao app</a>}
    </section>}
    {handoff && <>
      <section aria-labelledby="reminder-workspace-change"><h2 id="reminder-workspace-change">Sua alteração</h2>
        {review.changes.map(item => <div key={item.key} className="restore-workspace-profile"><h3>{item.label}</h3>
          <dl><div><dt>Dia da atividade</dt><dd>{item.day.split('-').reverse().join('/')}</dd></div>
            <div><dt>{item.status === 'dismissed' ? 'Aviso dispensado' : 'Horário do aviso'}</dt><dd>{item.status === 'dismissed' ? 'A atividade continua na rotina' : new Date(item.dueAt).toLocaleString('pt-BR')}</dd></div></dl>
        </div>)}
        {handoff.status === 'changed' && <p>O progresso mudou desde a preparação. Descarte esta alteração e prepare o aviso novamente a partir da atividade.</p>}
        {handoff.status === 'committed' && <p>O aviso corresponde à alteração confirmada. Confira o retorno abaixo.</p>}
        {accountBlocked && <p>Há um vínculo ou uma conferência de conta. A edição de avisos para progresso conectado ainda não está disponível; nenhuma preferência de sincronização foi alterada.</p>}
        {!accountBlocked && handoff.status === 'prepared' && !review.localOnly && <p>Este progresso não está configurado para uso somente local. A edição de avisos permanece indisponível nesta sessão; suas preferências foram preservadas.</p>}
      </section>
      {pending && <section><h2><ShieldCheck size={22} aria-hidden="true" /> Proteja seu progresso</h2><p>{review.recovery?.outcome === 'conflict'
        ? 'Existem mudanças fora desta operação. Preserve os dados e abra a conferência de recuperação.'
        : rollback ? 'A gravação foi interrompida. Você pode confirmar a recuperação da versão anterior antes de tentar novamente.'
          : 'O aviso foi salvo. Confirme o uso somente local antes de voltar ao app.'}</p>
        <a className="restore-workspace-back" href="/?progresso=restaurar">Abrir conferência de recuperação</a>
      </section>}
      {action && <section aria-labelledby="reminder-workspace-confirmation"><h2 id="reminder-workspace-confirmation">{labels[action]}</h2>
        <label className="restore-workspace-consent"><input type="checkbox" disabled={busy} checked={tabsClosed} onChange={event => onTabs(event.target.checked)} />Fechei as outras abas e janelas deste app.</label>
        <label className="restore-workspace-consent"><input type="checkbox" disabled={busy} checked={confirmed} onChange={event => onConfirm(event.target.checked)} />{consent}</label>
        <button type="button" disabled={!REMINDER_WRITES_RELEASED || busy || !tabsClosed || !confirmed} onClick={() => onAction(action)}>{labels[action]}</button>
      </section>}
      {canCancel && <button type="button" className="restore-workspace-secondary" disabled={busy} onClick={() => onAction('cancel')}>Descartar alteração do aviso</button>}
    </>}
    {error && <a className="restore-workspace-back" href="/?progresso=restaurar">Conferir recuperação do progresso</a>}
  </main>;
}

/** Pre-bootstrap only. Review and writes each require an explicit human action. */
export function ReminderWorkspace() {
  const [review, setReview] = useState<ReminderWorkspaceReview | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [tabsClosed, setTabsClosed] = useState(false), [confirmed, setConfirmed] = useState(false);
  const generation = useRef(0), working = useRef(false), alive = useRef(true);
  async function run(action?: ReminderWorkspaceAction) {
    if (working.current || (action && action !== 'cancel' && (!REMINDER_WRITES_RELEASED || !tabsClosed || !confirmed))) return;
    working.current = true;
    const selected = review, token = ++generation.current;
    const current = () => alive.current && generation.current === token;
    setBusy(true); setError(''); setTabsClosed(false); setConfirmed(false);
    try {
      if (action) {
        if (!selected) throw new Error('Confira o aviso antes de continuar.');
        const result = await runReminderWorkspaceAction({ storage: () => window.localStorage, locks: navigator.locks, origin: window.location.origin, otherTabsClosed: tabsClosed, reminderConfirmed: confirmed, isCurrent: current }, window.sessionStorage, selected, action, action === 'cancel' || confirmed);
        if (!current()) return;
        if (result === 'exit') { window.location.assign(reminderReturnFromSearch(window.location.search)); return; }
      }
      const next = await reviewReminderWorkspace(window.sessionStorage, window.localStorage, window.location.origin);
      if (current()) setReview(next);
    } catch (reason) {
      if (current()) { setReview(null); setError(reason instanceof Error ? reason.message : 'Não foi possível conferir o aviso. Preserve os dados e tente atualizar a conferência.'); }
    } finally { working.current = false; if (alive.current) setBusy(false); }
  }
  useEffect(() => {
    const token = generation;
    alive.current = true;
    document.getElementById('reminder-workspace-heading')?.focus({ preventScroll: true });
    const invalidate = (event: StorageEvent) => {
      if (event.key !== null && event.key !== REMINDER_HANDOFF_KEY && !REMINDER_WATCH_KEYS.includes(event.key)) return;
      token.current++; setReview(null); setTabsClosed(false); setConfirmed(false);
      setError('O progresso mudou em outra aba. Atualize a conferência antes de continuar.');
    };
    window.addEventListener('storage', invalidate);
    return () => { token.current++; alive.current = false; window.removeEventListener('storage', invalidate); };
  }, []);
  return <ReminderWorkspacePanel returnTo={reminderReturnFromSearch(window.location.search)} review={review} busy={busy} error={error} tabsClosed={tabsClosed} confirmed={confirmed} onTabs={setTabsClosed} onConfirm={setConfirmed} onRefresh={() => void run()} onAction={action => void run(action)} />;
}
