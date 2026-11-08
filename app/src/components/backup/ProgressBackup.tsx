import { useEffect, useRef, useState } from 'react';
import { Download, FileCheck2, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { captureProgress } from '@/lib/backup/capture-progress';
import { createProgressBackup, inspectProgressBackup, MAX_BACKUP_BYTES, type BackupSummary } from '@/lib/backup/progress-backup';
import { RestoreComparison } from './RestoreComparison';
import { AccountPreparation } from './AccountPreparation';
import './progress-backup.css';

export function ProgressBackup() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fileText, setFileText] = useState<string | null>(null);
  const [summary, setSummary] = useState<BackupSummary | null>(null);
  const operation = useRef(0);
  const working = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => () => { operation.current += 1; }, []);

  async function run(action: (current: () => boolean) => Promise<void>) {
    if (working.current) return;
    working.current = true;
    const id = ++operation.current;
    const accountId = useAppStore.getState().currentAccountId;
    const current = () => operation.current === id && useAppStore.getState().currentAccountId === accountId;
    setBusy(true); setError(''); setMessage(''); setSummary(null); setFileText(null);
    try { await action(current); }
    catch (reason) { if (current()) setError(reason instanceof Error ? reason.message : 'Não foi possível conferir o arquivo. Seus dados não foram alterados.'); }
    finally { if (current()) { working.current = false; setBusy(false); } }
  }
  function cancel() {
    operation.current += 1; working.current = false; setBusy(false); setSummary(null); setFileText(null); setError(''); setMessage('Conferência cancelada. Nenhum dado foi alterado.');
  }
  function download() {
    void run(async current => {
      const snapshot = captureProgress(window.location.origin);
      const text = await createProgressBackup(snapshot);
      const verified = await inspectProgressBackup(text);
      if (!current()) return;
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url; link.download = `conselho-progresso-${snapshot.createdAt.replace(/[:.]/g, '-')}.json`;
      try { document.body.append(link); link.click(); }
      finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
      setSummary(verified.summary);
      setMessage('Arquivo conferido e enviado para download. Confirme que ele foi salvo em Arquivos ou Downloads.');
    });
  }
  function inspect(file: File) {
    void run(async current => {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('Escolha um arquivo de até 20 MB. Nenhum dado foi alterado.');
      const text = await file.text();
      if (!current()) return;
      const verified = await inspectProgressBackup(text);
      if (!current()) return;
      setSummary(verified.summary);
      setFileText(text);
      setMessage('Integridade e formato conferidos. Esta conferência não restaura nem substitui seu progresso.');
    });
  }
  return <section id="grimoire-backup" tabIndex={-1} className="progress-backup" aria-labelledby="progress-backup-heading">
    <div className="progress-backup-heading"><ShieldCheck size={28} aria-hidden="true" /><div><h2 id="progress-backup-heading">Guarde sua jornada</h2><p>Uma cópia do progresso local para guardar com você.</p></div></div>
    <p>Inclui personagem, atividades, conclusões, conquistas e os dados de Treinos de todas as contas locais deste app.</p>
    <div className="progress-backup-actions">
      <a className="progress-backup-import" href="/?progresso=restaurar"><FileCheck2 size={20} aria-hidden="true" />Importar progresso neste dispositivo</a>
      <button type="button" onClick={download} disabled={busy}><Download size={20} aria-hidden="true" />Baixar cópia do progresso</button>
      <button type="button" onClick={() => fileInput.current?.click()} disabled={busy}><FileCheck2 size={20} aria-hidden="true" />Conferir arquivo sem importar</button>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden aria-label="Arquivo de backup" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) inspect(file); }} />
    </div>
    {busy && <div className="progress-backup-pending"><span role="status">Preparando e conferindo o arquivo…</span><button type="button" onClick={cancel}>Cancelar</button></div>}
    <div role="status" aria-live="polite">{message && <p>{message}</p>}</div>
    {error && <p role="alert" className="progress-backup-error">{error}</p>}
    {summary && <div className="progress-backup-preview"><h3>O que esta cópia contém</h3>
      <p>{new Date(summary.createdAt).toLocaleString('pt-BR')} · App {summary.appVersion}</p>
      <dl><div><dt>Rituais principais</dt><dd>{summary.tasks}</dd></div><div><dt>Ciclos principais</dt><dd>{summary.habits}</dd></div><div><dt>Jornadas e obras</dt><dd>{summary.quests + summary.projects}</dd></div><div><dt>Rascunhos</dt><dd>{summary.drafts}</dd></div><div><dt>Sessões de treino salvas</dt><dd>{summary.sessions}</dd></div><div><dt>Perfis cadastrados</dt><dd>{summary.profiles}</dd></div></dl>
      <p>Atividades acima são da conta ativa na cópia; subitens e outras contas também estão no arquivo. Treinos somam os registros nativos e legados de todas as contas.</p>
      <details><summary>Ver origem da cópia</summary><p>{summary.origin}</p><p>Conta: {summary.accountId ?? 'Local, sem perfil selecionado'}</p></details>
      <button type="button" onClick={() => { setSummary(null); setFileText(null); setMessage(''); }}>Fechar conferência</button>
    </div>}
    {fileText && <RestoreComparison fileText={fileText} />}
    <AccountPreparation />
    <p><a className="progress-backup-restore-link" href="/?progresso=restaurar">Abrir importação com o app pausado</a></p>
    <details className="progress-backup-details"><summary>O que fica de fora e como guardar</summary><p>Guarde o arquivo em um lugar privado: ele contém seus registros pessoais. Senhas e sessões de acesso não entram na cópia, nem formulários não salvos, cronômetro de ritual em andamento, preferências de calendário/localização ou arquivos de mídia externos.</p><p>A conferência verifica integridade e estrutura, não a autenticidade do arquivo nem toda regra de domínio. A importação substitui os dados locais deste navegador após conferência e confirmação. A conta online e a sincronização entre dispositivos continuam em preparação.</p></details>
  </section>;
}
