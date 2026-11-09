import { ACCOUNT_TRANSFER_WRITES_RELEASED } from './account-release';
import { ACCOUNT_BINDING_KEY, reviewAccountBinding } from './account-binding';
import { ACCOUNT_INTENT_KEY } from './account-intent';
import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { beginAccountTransfer, finishAccountTransferLocally, reviewAccountTransfer } from './account-transfer';
import { createWorkspaceSafetyCopy, readWorkspaceBaseline } from './workspace-preview';
import { resolveAccountVersions } from './account-resolution';
import type { reviewAccountVersions } from './account-conflict';
import type { createAccountTransport } from './account-transport';

type Context = Parameters<typeof beginAccountTransfer>[0];
type Transport = ReturnType<typeof createAccountTransport>;
function permitted(context: Context, confirmed: boolean) {
  if (!ACCOUNT_TRANSFER_WRITES_RELEASED || confirmed !== true || !context.isCurrent() || !context.otherTabsClosed) {
    throw new Error('Confirme a conexão da sua jornada e feche outras abas do app.');
  }
}
function completed(context: Context) {
  const storage = context.storage(), bindingRaw = storage.getItem(ACCOUNT_BINDING_KEY);
  if (!context.isCurrent() || !bindingRaw || storage.getItem(ACCOUNT_INTENT_KEY) !== null || storage.getItem(ACCOUNT_RESOLUTION_KEY) !== null) {
    throw new Error('A conexão precisa ser conferida. Seu progresso e a tentativa continuam protegidos.');
  }
  return { bindingRaw };
}

/** One explicit connection action. Reuses the existing archive, CAS, durable
 * intent, receipt, readback and binding. No external safety-file roundtrip. */
export async function connectCurrentAccountProgress(context: Context, input: { userId: string; confirmed: boolean; legacyReplacementConfirmed?: boolean }, transport: Transport) {
  permitted(context, input.confirmed);
  const storage = context.storage();
  if (storage.getItem(ACCOUNT_INTENT_KEY) !== null || storage.getItem(ACCOUNT_RESOLUTION_KEY) !== null) {
    throw new Error('Conclua a tentativa pendente antes de conectar outra jornada.');
  }
  const bound = storage.getItem(ACCOUNT_BINDING_KEY);
  if (bound !== null) {
    const { binding } = await reviewAccountBinding(bound, context.origin, transport, storage);
    if (binding.userId !== input.userId || storage.getItem(ACCOUNT_BINDING_KEY) !== bound) throw new Error('Entre na conta vinculada a esta jornada.');
    permitted(context, input.confirmed);
    return completed(context);
  }
  if (!readWorkspaceBaseline(storage, context.origin).snapshot) {
    const { startNewAccountProgress } = await import('./new-account-progress');
    await startNewAccountProgress({ ...context, userId: input.userId, startConfirmed: true }, transport);
  } else {
    const safety = await createWorkspaceSafetyCopy(storage, context.origin);
    permitted(context, input.confirmed);
    const sent = await beginAccountTransfer(context, { baseline: safety.baseline, previousCopy: safety.text, allProfilesConfirmed: true, userId: input.userId, legacyReplacementConfirmed: input.legacyReplacementConfirmed }, transport);
    await finishAccountTransferLocally(context, { raw: sent.raw, localUseConfirmed: true, bindAccountConfirmed: true }, transport);
  }
  return completed(context);
}

/** User chooses the reviewed online version. Internal protected copies replace
 * manual downloads; conflicts still need an explicit choice and a CAS fence. */
export async function receiveReviewedAccountProgress(context: Context, input: { review: Awaited<ReturnType<typeof reviewAccountVersions>>; confirmed: boolean }, transport: Transport) {
  permitted(context, input.confirmed);
  const review = input.review;
  const result = await resolveAccountVersions(context, { review, direction: 'online', copies: {
    local: review.localArchive, online: review.remoteArchive, pending: review.pendingArchive,
  }, allProfilesConfirmed: true, replacementConfirmed: true }, transport);
  if (result.outcome !== 'resolved') throw new Error('Confira o recibo da tentativa antes de abrir sua jornada.');
  return completed(context);
}

/** Recover only the receipt of the existing operation; never blindly retry it. */
export async function resumeAccountConnection(context: Context, input: { raw: string; confirmed: boolean }, transport: Transport) {
  permitted(context, input.confirmed);
  const review = await reviewAccountTransfer(context, { raw: input.raw }, transport);
  if (!review.receipt) throw new Error('O envio ainda não foi confirmado. Abra as opções de recuperação para conferir antes de repetir.');
  await finishAccountTransferLocally(context, { raw: input.raw, localUseConfirmed: true, bindAccountConfirmed: true }, transport);
  return completed(context);
}
