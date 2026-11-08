import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, KeyRound } from 'lucide-react';
import type { RecoveryEntry } from '@/lib/backup/account-recovery-entry';
import type { createPasswordRecovery } from '@/lib/backup/account-recovery';
import { ACCOUNT_ACCESS_RELEASED } from '@/lib/backup/account-access-release';

export function AccountRecoveryWorkspace({ entry }: { entry: RecoveryEntry }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirm, setConfirm] = useState('');
  const [verified, setVerified] = useState<{ email: string } | null>(null);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(''), [done, setDone] = useState(false);
  const session = useRef<ReturnType<typeof createPasswordRecovery> | null>(null), working = useRef(false), alive = useRef(true), heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { alive.current = true; heading.current?.focus({ preventScroll: true }); return () => { alive.current = false; session.current?.dispose(); session.current = null; }; }, []);
  async function run(action: () => Promise<void>) {
    if (!ACCOUNT_ACCESS_RELEASED || working.current) return;
    working.current = true; setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (reason) { if (alive.current) setError(reason instanceof Error ? reason.message : 'Não foi possível conferir o acesso.'); }
    finally { working.current = false; if (alive.current) setBusy(false); }
  }
  async function open() {
    if (session.current) return session.current;
    const { createPasswordRecovery } = await import('@/lib/backup/account-recovery');
    if (!alive.current) throw new Error('A página foi encerrada.');
    const next = createPasswordRecovery({ url: import.meta.env.VITE_SUPABASE_URL, key: import.meta.env.VITE_SUPABASE_ANON_KEY, origin: window.location.origin, storage: window.localStorage, locks: navigator.locks });
    session.current = next; return next;
  }
  function request() { void run(async () => {
    const next = await open();
    const result = await next.request(email); if (alive.current) setMessage(result);
  }); }
  function exchange() { void run(async () => {
    const code = entry.takeCode();
    if (!code) throw new Error('O link já foi conferido. Solicite outro se precisar.');
    const next = await open();
    const result = await next.exchange(code); if (alive.current) setVerified(result);
  }); }
  function update() {
    if (password !== confirm || password.length < 8) return;
    const value = password; setPassword(''); setConfirm('');
    void run(async () => {
      const next = session.current;
      if (!next || !verified) throw new Error('Valide seu link novamente.');
      const result = await next.update(value);
      next.dispose(); if (session.current === next) session.current = null;
      if (alive.current) { setDone(true); setVerified(null); setMessage(result.logoutConfirmed ? 'Senha atualizada. Entre novamente para acessar sua jornada.' : 'Senha atualizada. A saída no servidor não pôde ser confirmada; a sessão temporária deste formulário foi descartada.'); }
    });
  }
  return <main className="restore-workspace account-workspace" aria-labelledby="recovery-title">
    <a className="restore-workspace-back" href="/?progresso=conta"><ArrowLeft size={20} aria-hidden="true" />Voltar ao acesso da conta</a>
    <header><KeyRound size={32} aria-hidden="true" /><div><p>Conselho Elemental</p><h1 id="recovery-title" ref={heading} tabIndex={-1}>Recupere seu acesso</h1></div></header>
    <p>Definir outra senha não recria seu personagem nem substitui atividades, XP ou Treinos. Este formulário não abre a sincronização do app.</p>
    {!ACCOUNT_ACCESS_RELEASED && <p role="status">O acesso online ainda está em preparação. A recuperação será liberada após a revisão do acesso.</p>}
    {!done && (verified ? <section><h2>Defina sua nova senha</h2><p>Conta conferida: {verified.email || 'e-mail validado no servidor'}.</p>
      <form onSubmit={event => { event.preventDefault(); update(); }}>
        <label>Nova senha<input type="password" autoComplete="new-password" minLength={8} required value={password} disabled={busy || !ACCOUNT_ACCESS_RELEASED} onChange={event => setPassword(event.target.value)} /></label>
        <label>Confirme a nova senha<input type="password" autoComplete="new-password" minLength={8} required value={confirm} disabled={busy || !ACCOUNT_ACCESS_RELEASED} onChange={event => setConfirm(event.target.value)} /></label>
        <small>Use pelo menos 8 caracteres. A política de senha do servidor também será aplicada.</small>
        {confirm && password !== confirm && <small role="status">As senhas ainda não coincidem.</small>}
        <button type="submit" disabled={busy || !ACCOUNT_ACCESS_RELEASED || password.length < 8 || password !== confirm}>Salvar nova senha</button>
      </form></section> : <>
      {entry.kind === 'callback' && <section><h2>Confira o link recebido</h2><p>O código foi removido do endereço. Valide-o antes de definir sua senha. O link precisa ter sido solicitado neste navegador.</p><button type="button" disabled={busy || !ACCOUNT_ACCESS_RELEASED} onClick={exchange}>Validar meu link</button></section>}
      {entry.kind === 'invalid' && <p role="alert">Este link não pôde ser aceito. Solicite outro abaixo.</p>}
      <section><h2>Receber um novo link</h2><p>Abra o e-mail no mesmo navegador usado para solicitar. Um novo pedido substitui o link anterior.</p><form onSubmit={event => { event.preventDefault(); request(); }}>
        <label>E-mail da conta<input type="email" autoComplete="email" required value={email} disabled={busy || !ACCOUNT_ACCESS_RELEASED} onChange={event => setEmail(event.target.value)} /></label>
        <button type="submit" disabled={busy || !ACCOUNT_ACCESS_RELEASED || !email.trim()}>Enviar link de recuperação</button>
      </form></section>
    </>)}
    {done && <a className="restore-workspace-back" href="/?progresso=conta">Entrar com a nova senha</a>}
    <p role="status" aria-live="polite">{busy ? 'Conferindo o acesso. Aguarde.' : message}</p>
    {error && <p className="restore-workspace-error" role="alert">{error}</p>}
  </main>;
}
