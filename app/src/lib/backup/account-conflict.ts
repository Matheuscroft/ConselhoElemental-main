import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { LOCAL_PROGRESS_MODE_KEY } from './progress-mode';
import type { StoredProgress } from './restore-journal';
import { ACCOUNT_BINDING_KEY, inspectAccountBinding } from './account-binding';
import { ACCOUNT_INTENT_KEY, inspectAccountIntent } from './account-intent';
import type { createAccountTransport } from './account-transport';
import { createProgressBackup, inspectProgressBackup, STORE_KEYS } from './progress-backup';
import { validateStoredProgress } from './stored-progress';
import { auditCriticalProgress } from './critical-progress';
import { compareProgressBackup } from './restore-comparison';
import { RESTORE_JOURNAL_KEY } from './restore-journal';

interface ReviewedVersions {
  origin: string; userId: string; before: StoredProgress;
  bindingRaw: string | null; intentRaw: string | null; localMode: string | null;
  revision: string; localArchive: string | null; remoteArchive: string; pendingArchive: string | null;
}
const reviews = new WeakMap<object,Readonly<ReviewedVersions>>();
export function reviewedAccountVersions(reference: object): Readonly<ReviewedVersions> {
  const value = reviews.get(reference);
  if (!value) throw new Error('Confira novamente as versões antes de escolher.');
  return Object.freeze({...value,before:{...value.before}});
}
/** Read-only conflict review. Neither version is selected, rebased or overwritten. */
export async function reviewAccountVersions(input: {
  origin: string; expectedUserId?: string; storage: Pick<Storage,'getItem'>;
  isCurrent: () => boolean; transport: ReturnType<typeof createAccountTransport>;
}) {
  const {storage,origin,isCurrent,transport} = {...input};
  const keys = [STORE_KEYS.core,STORE_KEYS.fitness,ACCOUNT_BINDING_KEY,ACCOUNT_INTENT_KEY,RESTORE_JOURNAL_KEY,LOCAL_PROGRESS_MODE_KEY,ACCOUNT_RESOLUTION_KEY];
  const before = keys.map(key=>storage.getItem(key));
  const check = () => { if (!isCurrent() || keys.some((key,i)=>storage.getItem(key)!==before[i])) throw new Error('As versões mudaram. Confira novamente antes de continuar.'); };
  check(); if (before[6] !== null) throw new Error('Conclua a resolução pendente antes de comparar novamente.');
  if (before[4] !== null) throw new Error('Conclua a recuperação da restauração antes de conferir a conta.');
  const binding = before[2] === null ? null : await inspectAccountBinding(before[2],origin);
  const pending = before[3] === null ? null : await inspectAccountIntent(before[3],origin); check();
  const userId = binding?.userId ?? pending?.userId ?? input.expectedUserId;
  if (!userId || (binding && pending && binding.userId !== pending.userId)) throw new Error('Confira o vínculo da conta antes de comparar versões.');
  if ((await transport.verifyIdentity()).userId !== userId) throw new Error('Entre na mesma conta para comparar as versões.'); check();
  const local = validateStoredProgress({core:before[0],fitness:before[1]},origin);
  const remote = await transport.readProgress(userId); check();
  if (!remote || typeof remote !== 'object' || !('archive' in remote) || typeof remote.archive !== 'string' || !('revision' in remote) || typeof remote.revision !== 'string') throw new Error('A conta ainda não possui um arquivo integral para comparar.');
  const online = await inspectProgressBackup(remote.archive);
  const audit = auditCriticalProgress(online.backup);
  if (audit.issues.length || audit.truncated) throw new Error('O arquivo online precisa de revisão antes de continuar.');
  const comparison = local ? await compareProgressBackup(remote.archive,local) : null;
  const localArchive = local ? await createProgressBackup(local) : null;
  const localSummary = localArchive ? (await inspectProgressBackup(localArchive)).summary : null; check();
  const result = Object.freeze({localArchive,remoteArchive:remote.archive,pendingArchive:pending?.archive ?? null,revision:remote.revision,
    localSummary,remoteSummary:online.summary,comparison});
  reviews.set(result,Object.freeze({origin,userId,before:Object.freeze({core:before[0],fitness:before[1]}),bindingRaw:before[2],intentRaw:before[3],localMode:before[5],revision:remote.revision,localArchive,remoteArchive:remote.archive,pendingArchive:pending?.archive??null}));
  return result;
}
