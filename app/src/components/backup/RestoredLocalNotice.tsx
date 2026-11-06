import { ShieldCheck } from 'lucide-react';
import { isRestoredLocalDocument, isLiveAccountDocument } from '@/lib/backup/progress-mode';
import './restored-local-notice.css';

export function RestoredLocalNotice() {
  if (!isRestoredLocalDocument() || isLiveAccountDocument()) return null;
  return <aside className="restored-local-notice" aria-label="Modo de armazenamento do progresso">
    <ShieldCheck size={20} aria-hidden="true" /><span><strong>Progresso local protegido</strong><small>Salvo neste navegador. Sincronização com a conta desativada.</small></span>
    <a href="/grimorio#grimoire-backup">Guardar cópia</a>
  </aside>;
}
