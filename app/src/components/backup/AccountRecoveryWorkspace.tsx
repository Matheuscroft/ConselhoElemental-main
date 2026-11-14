import { EntryArtwork, EntryBrand } from '@/components/entry/EntryVisuals';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import type { RecoveryEntry } from '@/lib/backup/account-recovery-entry';
import type { createPasswordRecovery } from '@/lib/backup/account-recovery';
import { accountErrorCode } from '@/lib/backup/account-auth-messages';
import { ACCOUNT_ACCESS_RELEASED } from '@/lib/backup/account-access-release';

export function AccountRecoveryWorkspace({ entry }: { entry: RecoveryEntry }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirm, setConfirm] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0), [clock, setClock] = useState(Date.now());
  const [showPassword, setShowPassword] = useState(false), [showConfirm, setShowConfirm] = useState(false);
  const [verified, setVerified] = useState<{ email: string } | null>(null);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(''), [errorCode, setErrorCode] = useState<string | null>(null), [done, setDone] = useState(false);
  const session = useRef<ReturnType<typeof createPasswordRecovery> | null>(null), working = useRef(false), alive = useRef(true), heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    alive.current = true;
    if (entry.kind === 'callback') exchange();
    return () => { alive.current = false; session.current?.dispose(); session.current = null; };
  // Recovery credentials are one-time; mount this isolated root without StrictMode replay.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (cooldownUntil <= clock) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil, clock]);
  async function run(action: () => Promise<void>) {
    if (!ACCOUNT_ACCESS_RELEASED || working.current) return;
    working.current = true; setBusy(true); setError(''); setErrorCode(null); setMessage('');
    try { await action(); } catch (reason) { if (alive.current) { setError(reason instanceof Error ? reason.message : 'Não foi possível conferir o acesso.'); setErrorCode(accountErrorCode(reason)); } }
    finally { working.current = false; if (alive.current) setBusy(false); }
  }
  async function open() {
    if (session.current) return session.current;
    const { createPasswordRecovery } = await import('@/lib/backup/account-recovery');
    if (!alive.current) throw new Error('A página foi encerrada.');
    const next = createPasswordRecovery({ url: import.meta.env.VITE_SUPABASE_URL, key: import.meta.env.VITE_SUPABASE_ANON_KEY, origin: window.location.origin, locks: navigator.locks });
    session.current = next; return next;
  }
  function request() { if (cooldownUntil > Date.now()) return; void run(async () => {
    const next = await open();
    const result = await next.request(email); if (alive.current) { setMessage(result); setCooldownUntil(Date.now() + 60_000); setClock(Date.now()); }
  }); }
  function exchange() { void run(async () => {
    const credentials = entry.takeCredentials();
    if (!credentials) throw new Error('O link já foi conferido. Solicite outro se precisar.');
    const next = await open();
    const result = await next.exchange(credentials); if (alive.current) setVerified(result);
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
  return <div className="entry-shell">
    <a className="entry-skip" href="#recovery-title">Ir para a recuperação</a>
    <div className="entry-masthead"><EntryBrand /><a className="entry-top-link" href="/auth"><ArrowLeft size={16} aria-hidden="true" />Voltar ao acesso</a></div>
    <div className="entry-layout"><EntryArtwork />
    <main className="restore-workspace account-workspace entry-main" aria-labelledby="recovery-title">
    <header><h1 id="recovery-title" ref={heading} tabIndex={-1}>Recupere seu acesso</h1></header>
    <p>Vamos ajudar você a voltar. Suas atividades, conquistas e XP permanecem como estão.</p>
    {!ACCOUNT_ACCESS_RELEASED && <p role="status">O acesso online ainda está em preparação. A recuperação será liberada após a revisão do acesso.</p>}
    {!done && (verified ? <section className="entry-access-card"><h2>Defina sua nova senha</h2><p>Conta conferida: {verified.email || 'e-mail validado no servidor'}.</p>
      <form onSubmit={event => { event.preventDefault(); update(); }}>
        <label htmlFor="recovery-password">Nova senha</label><div className="entry-password"><input id="recovery-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} name="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={password} disabled={busy || !ACCOUNT_ACCESS_RELEASED} onChange={event => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'} onClick={()=>setShowPassword(!showPassword)} disabled={busy}>{showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button></div>
        <label htmlFor="recovery-confirmation">Confirme a nova senha</label><div className="entry-password"><input id="recovery-confirmation" autoCapitalize="none" autoCorrect="off" spellCheck={false} name="new-password-confirmation" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={confirm} disabled={busy || !ACCOUNT_ACCESS_RELEASED} onChange={event => setConfirm(event.target.value)} /><button type="button" aria-label={showConfirm ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'} onClick={()=>setShowConfirm(!showConfirm)} disabled={busy}>{showConfirm ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button></div>
        <small>Use pelo menos 8 caracteres. A política de senha do servidor também será aplicada.</small>
        {confirm && password !== confirm && <small role="status">As senhas ainda não coincidem.</small>}
        <button type="submit" disabled={busy || !ACCOUNT_ACCESS_RELEASED || password.length < 8 || password !== confirm}>Salvar nova senha</button>
      </form></section> : <>
      {entry.kind === 'callback' && busy && <section className="entry-access-card" role="status"><h2>Validando o link</h2><p>Conferindo a solicitação com segurança. Você não precisa entrar antes de redefinir a senha.</p></section>}
      {entry.kind === 'invalid' && <p role="alert">Este link não pôde ser aceito. Solicite outro abaixo.</p>}
      <section className="entry-access-card"><h2>Receber um novo link</h2><p>Você pode abrir o e-mail neste navegador ou em outro aparelho. Um novo pedido substitui o link anterior.</p><form onSubmit={event => { event.preventDefault(); request(); }}>
        <label htmlFor="recovery-email">E-mail da conta<input id="recovery-email" enterKeyHint="go" name="recovery-email" type="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="voce@exemplo.com" autoComplete="email" required value={email} disabled={busy || !ACCOUNT_ACCESS_RELEASED} onChange={event => setEmail(event.target.value)} /></label>
        <button type="submit" disabled={busy || cooldownUntil > clock || !ACCOUNT_ACCESS_RELEASED || !email.trim()}>{busy&&<LoaderCircle className="entry-spinner" size={18} aria-hidden="true" />}{cooldownUntil > clock ? `Enviar novamente em 00:${String(Math.ceil((cooldownUntil-clock)/1000)).padStart(2,'0')}` : message ? 'Enviar link novamente' : 'Enviar link de recuperação'}</button>
      </form></section>
    </>)}
    {done && <a className="restore-workspace-back" href="/?progresso=conta">Entrar com a nova senha</a>}
    <p role="status" aria-live="polite">{busy ? 'Conferindo o acesso. Aguarde.' : message}</p>
    {error && <p className="restore-workspace-error" role="alert">{error}{errorCode && <small className="entry-auth-code" style={{ display: 'block', opacity: 0.7, fontSize: '.75em', marginTop: 4 }}>código: {errorCode}</small>}</p>}
  </main></div><footer className="entry-footer">Um novo acesso. A mesma jornada.</footer></div>;
}
