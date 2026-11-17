import { useSyncExternalStore } from 'react';
import { CloudCheck, CloudOff, CloudUpload, LogIn, UserRoundPlus, RefreshCw } from 'lucide-react';
import type { LiveAccountSync, AccountSyncView } from '@/lib/backup/account-live-sync';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import './account-connection.css';

const local: Readonly<AccountSyncView> = Object.freeze({ status: 'stopped', message: 'Progresso salvo somente neste aparelho.' });
const subscribeLocal = () => () => {};
const localSnapshot = () => local;
export function AccountConnectionCard({ sync, profileName }: { sync: LiveAccountSync | null; profileName: string }) {
  const view = useSyncExternalStore(sync?.subscribe ?? subscribeLocal, sync?.getSnapshot ?? localSnapshot, localSnapshot);
  const paused = ['pending','blocked','stopped'].includes(view.status);
  const saving = ['checking','saving'].includes(view.status);
  const saved = view.status === 'saved';
  const date = view.lastSavedAt && Number.isFinite(Date.parse(view.lastSavedAt)) ? new Date(view.lastSavedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;
  function disconnect() {
    if (!sync) return;
    sync.forgetAccess();
    window.location.replace('/auth');
  }
  return <section className="account-connection-card" aria-labelledby="account-connection-title">
    <header className="acc-identidade">
      <span className="account-connection-seal" data-connected={!!sync}><ArcaneIcon name="conta" size={28} /></span>
      <div className="acc-identidade-texto"><p className="account-connection-profile">{profileName}</p>{sync && view.email && <p className="account-connection-email">{view.email}</p>}</div>
      <span className="acc-estado" data-connected={!!sync}>{sync ? 'Na conta' : 'Neste aparelho'}</span>
    </header>
    <div className="acc-destaque" data-connected={!!sync}>
      <span className="acc-destaque-nuvem" aria-hidden="true">{saved ? <CloudCheck size={22} /> : <CloudUpload size={22} />}</span>
      <h2 id="account-connection-title">{sync ? 'Sua conta pessoal' : 'Leve sua jornada com você'}</h2>
      {sync ? <>
        <div role="status" aria-live="polite" className="account-connection-state" data-saved={saved}>{view.status === 'offline' || paused ? <CloudOff size={18} aria-hidden="true" /> : <CloudCheck size={18} aria-hidden="true" />}<span>{view.message}</span></div>
        {date && <small>Última versão salva: {date}</small>}
        <p>Atividades, XP, conquistas e treinos são salvos juntos. O app sincroniza durante o uso e confere a conta quando você volta.</p>
        {paused ? <a className="account-connection-primary" href="/?progresso=conta">Conferir conexão e progresso</a> : <button type="button" className="account-connection-primary" disabled={saving || view.status === 'offline'} onClick={() => void sync.flush()}><RefreshCw size={18} aria-hidden="true" />{saving ? 'Sincronizando…' : 'Sincronizar agora'}</button>}
        <button type="button" className="account-connection-link" onClick={disconnect}>Sair da conta</button>
      </> : <>
        <p>Guarde sua jornada e continue em qualquer aparelho.</p>
        <a className="account-connection-primary" href="/?progresso=conta&modo=cadastro"><UserRoundPlus size={20} aria-hidden="true" />Criar minha conta</a>
        <a className="account-connection-link" href="/?progresso=conta"><LogIn size={18} aria-hidden="true" />Já tenho conta</a>
        <small>O cadastro preserva seu progresso. Você confirma qual jornada quer salvar ou receber.</small>
      </>}
    </div>
  </section>;
}
