import type { SupabaseClient } from '@supabase/supabase-js';
import { inspectProgressBackup } from './progress-backup';
import { auditCriticalProgress } from './critical-progress';
import type { AssociationReader } from './association-review';

type RpcResult = { data: unknown; error: unknown };
type RpcRequest = PromiseLike<RpcResult> & { abortSignal?: (signal: AbortSignal) => PromiseLike<RpcResult> };
/** Compatible with an explicitly supplied Supabase client. No global client,
 * session, credentials, timers or network work is constructed by this module. */
export interface AccountRpcClient {
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null }; error: unknown }> };
  rpc: (name: string, args: Record<string, unknown>) => RpcRequest;
}
export interface AccountTransportGuard {
  expectedUserId: string;
  currentUserId: () => string | null;
  /** Must bind the reviewed local fingerprint/profile AND a monotonic generation. */
  isCurrent: () => boolean;
}
export interface PreparedAccountCommit {
  readonly userId: string;
  readonly operationId: string;
  readonly expectedRevision: string;
  readonly archive: string;
  readonly archiveSha256: string;
}
export interface AccountCommitReceipt {
  userId: string; operationId: string; revision: string; expectedRevision: string;
  archiveSha256: string; createdAt: string;
}
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
function fail(message: string): never { throw new Error(message); }
async function archiveHash(text: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))), b => b.toString(16).padStart(2, '0')).join('');
}
/** Backend transport only. No production writer is mounted/enabled by this factory;
 * even a verified receipt never removes local mode or hydrates a store. */
export function createAccountTransport(client: AccountRpcClient, input: AccountTransportGuard) {
  const guard = { ...input }, commands = new WeakSet<PreparedAccountCommit>();
  const check = (signal?: AbortSignal) => {
    if (signal?.aborted || !guard.isCurrent() || !uuid(guard.expectedUserId) || guard.currentUserId() !== guard.expectedUserId) fail('A conta, o perfil ou o progresso mudou. Refaça a conferência.');
  };
  const verifyIdentity = async (signal?: AbortSignal) => {
    check(signal);
    let result;
    try { result = await client.auth.getUser(); } catch { check(signal); return fail('Não foi possível validar a conta no servidor. Nenhum envio foi iniciado.'); }
    check(signal);
    if (result.error || result.data?.user?.id !== guard.expectedUserId) fail('A identidade validada não corresponde à conta conferida.');
    return { userId: guard.expectedUserId };
  };
  async function rpc(name: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<unknown> {
    check(signal);
    let result: RpcResult;
    try {
      const request = client.rpc(name, { ...args, p_expected_user_id: guard.expectedUserId });
      result = await (signal && request.abortSignal ? request.abortSignal(signal) : request);
    } catch { check(signal); return fail('Não foi possível confirmar a resposta do servidor. Confira o recibo antes de tentar novamente.'); }
    check(signal);
    if (result.error) {
      const message = object(result.error) && typeof result.error.message === 'string' ? result.error.message : '';
      if (message.includes('progress_release_closed')) fail('A integração ainda não foi liberada no servidor. Seu progresso permanece local.');
      if (message.includes('progress_revision_conflict')) fail('O progresso online mudou. Refaça a comparação antes de enviar.');
      if (message.includes('progress_legacy_requires_review')) fail('Esta conta possui dados no formato anterior. Eles precisam de revisão antes da associação.');
      if (message.includes('progress_legacy_consent_required')) fail('Confirme a preservação dos registros anteriores e o uso da jornada deste aparelho.');
      if (message.includes('progress_legacy_state_changed')) fail('Os registros anteriores da conta mudaram. Refaça a conferência antes de sincronizar.');
      if (message.includes('progress_operation_reused')) fail('Esta tentativa já foi usada para outro conteúdo. Preserve o recibo original.');
      fail('O servidor não confirmou a operação completa. Preserve a cópia local e confira o recibo.');
    }
    return result.data;
  }
  const readProgress: AssociationReader['readProgress'] = async (userId, signal) => {
    check(signal);
    if (userId !== guard.expectedUserId) fail('Destino diferente da conta conferida.');
    await verifyIdentity(signal);
    const response = await rpc('progress_account_read', {}, signal);
    if (object(response) && response.kind === 'legacy') {
      if (response.complete !== false || response.userId !== guard.expectedUserId || response.revision !== 'legacy') {
        fail('Resposta antiga da conta incompatível. Nenhum dado foi substituído.');
      }
      return Object.freeze({ complete: false as const, userId: guard.expectedUserId, kind: 'legacy' as const, revision: 'legacy' as const });
    }
    if (!object(response) || response.complete !== true || response.userId !== guard.expectedUserId
      || (response.kind !== 'empty' && response.kind !== 'snapshot') || !object(response.coverage)
      || (response.kind === 'empty' ? response.revision !== 'empty' || response.archive !== null : !uuid(response.revision) || typeof response.archive !== 'string')) {
      fail('Resposta online incompleta. Não é seguro associar o progresso.');
    }
    return response;
  };
  function receipt(value: unknown, command?: PreparedAccountCommit): AccountCommitReceipt {
    if (!object(value) || value.userId !== guard.expectedUserId || !uuid(value.operationId) || !uuid(value.revision)
      || typeof value.expectedRevision !== 'string' || typeof value.archiveSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.archiveSha256)
      || typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt))) fail('Recibo inválido. Preserve a cópia local.');
    if (command && (value.operationId !== command.operationId || value.expectedRevision !== command.expectedRevision || value.archiveSha256 !== command.archiveSha256)) fail('O recibo não corresponde ao arquivo e à tentativa conferidos.');
    return { userId: value.userId as string, operationId: value.operationId as string, revision: value.revision as string,
      expectedRevision: value.expectedRevision as string, archiveSha256: value.archiveSha256 as string, createdAt: value.createdAt as string };
  }
  async function prepare(input: { archive: string; expectedRevision: string; operationId?: string; allProfilesConfirmed: boolean }, signal?: AbortSignal): Promise<PreparedAccountCommit> {
    // Freeze exact bytes, revision and consent before hashing/validation.
    const { archive, expectedRevision, allProfilesConfirmed } = input, operationId = input.operationId ?? crypto.randomUUID();
    check(signal);
    if (allProfilesConfirmed !== true) fail('Confirme o envio do arquivo de todos os perfis locais.');
    if ((expectedRevision !== 'empty' && expectedRevision !== 'legacy' && !uuid(expectedRevision)) || !uuid(operationId)) fail('Revise a versão de destino e a identificação da tentativa.');
    const { backup } = await inspectProgressBackup(archive);
    const audit = auditCriticalProgress(backup);
    if (audit.issues.length || audit.truncated) fail('A cópia precisa de revisão antes de qualquer envio.');
    check(signal);
    const archiveSha256 = await archiveHash(archive); check(signal);
    const command = Object.freeze({ userId: guard.expectedUserId, operationId, expectedRevision, archive, archiveSha256 });
    commands.add(command); return command;
  }
  const bound = (command: PreparedAccountCommit, signal?: AbortSignal) => { check(signal); if (!commands.has(command)) fail('Prepare novamente o arquivo exato antes de enviar.'); };
  async function getReceipt(command: PreparedAccountCommit, signal?: AbortSignal): Promise<AccountCommitReceipt | null> {
    bound(command, signal); await verifyIdentity(signal);
    const value = await rpc('progress_account_receipt', { p_operation_id: command.operationId }, signal);
    return value === null ? null : receipt(value, command);
  }
  async function commit(command: PreparedAccountCommit, signal?: AbortSignal): Promise<AccountCommitReceipt> {
    bound(command, signal); await verifyIdentity(signal);
    const value = command.expectedRevision === 'legacy'
      ? await rpc('progress_account_adopt_legacy', { p_expected_revision: 'legacy', p_operation_id: command.operationId, p_archive: command.archive, p_all_profiles_confirmed: true, p_legacy_replacement_confirmed: true }, signal)
      : await rpc('progress_account_commit', { p_expected_revision: command.expectedRevision, p_operation_id: command.operationId, p_archive: command.archive, p_all_profiles_confirmed: true }, signal);
    return receipt(value, command);
  }
  async function confirm(command: PreparedAccountCommit, signal?: AbortSignal) {
    const saved = await getReceipt(command, signal);
    if (!saved) fail('A tentativa ainda não tem recibo confirmado. Preserve seu progresso local.');
    const current = await readProgress(guard.expectedUserId, signal); bound(command, signal);
    if (!object(current) || current.kind !== 'snapshot' || current.revision !== saved.revision || current.archive !== command.archive) fail('O estado online não corresponde mais ao recibo. Refaça a conferência sem sobrescrever mudanças.');
    return Object.freeze({ receipt: Object.freeze(saved), storageConfirmed: true as const, associationAllowed: false as const });
  }
  return { verifyIdentity, readProgress, prepare, commit, getReceipt, confirm };
}

/** Compile-checked bridge to the installed SDK. Caller supplies a quarantined
 * client explicitly; importing this module never creates one or starts auth. */
export function createSupabaseAccountTransport(client: SupabaseClient, guard: AccountTransportGuard) {
  return createAccountTransport(client, guard);
}
