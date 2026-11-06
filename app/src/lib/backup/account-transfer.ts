import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { ACCOUNT_BINDING_KEY, inspectAccountBinding, reviewAccountBinding, sealAccountBinding } from './account-binding';
import { createAccountTransport, type AccountCommitReceipt } from './account-transport';
import { ACCOUNT_INTENT_KEY, accountBaselineDigest, inspectAccountIntent, sealAccountIntent, type AccountIntent } from './account-intent';
import { readWorkspaceBaseline, assertWorkspaceBaseline, type WorkspaceBaseline } from './workspace-preview';
import { verifyPreviousSafetyCopy } from './restore-confirmation';
import { prepareLocalAssociationReview, prepareRemoteAssociationReview } from './association-review';
import { LOCAL_PROGRESS_MODE_KEY, localProgressMode, validateLocalProgressMode } from './progress-mode';
import { RESTORE_JOURNAL_KEY, type RestoreStorage } from './restore-journal';
import { hasProgressAppStarted, PROGRESS_SESSION_LOCK } from './progress-startup';
import { validateStoredProgress } from './stored-progress';

interface Context { origin: string; storage: () => RestoreStorage; locks?: Pick<LockManager,'request'>; otherTabsClosed: boolean; isCurrent: () => boolean }
type Transport = ReturnType<typeof createAccountTransport>;
function check(c: Context) {
  if (hasProgressAppStarted()) throw new Error('Abra a conferência de conta com o app pausado antes de enviar.');
  if (!c.origin || !c.isCurrent() || c.otherTabsClosed !== true) throw new Error('Feche outras abas e refaça a conferência antes de continuar.');
  if (c.storage().getItem(ACCOUNT_RESOLUTION_KEY) !== null) throw new Error('Conclua a resolução pendente antes de continuar.');
  if (c.storage().getItem(RESTORE_JOURNAL_KEY) !== null) throw new Error('Conclua a recuperação da restauração antes de conferir a conta.');
}
function write(s: RestoreStorage, key: string, value: string | null) {
  if (value === null) s.removeItem(key); else s.setItem(key,value);
  if (s.getItem(key) !== value) throw new Error('Não foi possível confirmar o registro da tentativa. Preserve os dados do navegador.');
}
async function exclusive<T>(input: Context, action: (c: Context,s: RestoreStorage) => Promise<T>): Promise<T> {
  const c = { ...input }; check(c);
  if (!c.locks) throw new Error('Este navegador não oferece a coordenação necessária para enviar com segurança.');
  return c.locks.request(PROGRESS_SESSION_LOCK, { mode:'exclusive', ifAvailable:true }, async lock => {
    if (!lock) throw new Error('O progresso está aberto em outra aba. Nenhum envio foi iniciado.');
    check(c); return action(c,c.storage());
  });
}
function assertIntent(s: RestoreStorage, raw: string) {
  if (s.getItem(ACCOUNT_INTENT_KEY) !== raw) throw new Error('A tentativa mudou. Recarregue a conferência.');
}
function checkMode(s: RestoreStorage, intent: AccountIntent) {
  const mode = s.getItem(LOCAL_PROGRESS_MODE_KEY);
  validateLocalProgressMode(mode,intent.origin);
  if (mode !== intent.localMode && mode !== localProgressMode(intent.origin)) throw new Error('O modo de uso mudou. Refaça a conferência.');
}
export async function beginAccountTransfer(context: Context, input: { baseline: WorkspaceBaseline; previousCopy: string; allProfilesConfirmed: boolean; userId: string }, transport: Transport) {
  const selected = { ...input, baseline: { ...input.baseline, pair: { ...input.baseline.pair } } };
  if (selected.allProfilesConfirmed !== true) throw new Error('Confirme o envio da cópia de todos os perfis locais.');
  return exclusive(context,async(c,s) => {
    if (s.getItem(ACCOUNT_INTENT_KEY) !== null) throw new Error('Confira primeiro a tentativa de envio pendente.');
    const baseline = { ...selected.baseline, snapshot: validateStoredProgress(selected.baseline.pair,c.origin) };
    assertWorkspaceBaseline(s,baseline);
    await verifyPreviousSafetyCopy(selected.previousCopy,baseline,s,c.origin); check(c);
    const reviewContext = { origin:c.origin, readLocal:() => {
      const current = readWorkspaceBaseline(s,c.origin).snapshot;
      if (!current) throw new Error('Não há progresso local para enviar.'); return current;
    }, isCurrent:c.isCurrent, expectedUserId:selected.userId, currentUserId:() => selected.userId };
    const bindingRaw = s.getItem(ACCOUNT_BINDING_KEY);
    let expectedRevision = 'empty';
    if (bindingRaw !== null) {
      const reviewed = await reviewAccountBinding(bindingRaw,c.origin,transport,s);
      if (reviewed.binding.userId !== selected.userId) throw new Error('Entre na conta correspondente ao vínculo salvo.');
      expectedRevision = reviewed.binding.revision;
    } else {
      const local = await prepareLocalAssociationReview(reviewContext), remote = await prepareRemoteAssociationReview(local,reviewContext,transport);
      if (remote.remoteSummary !== null || remote.revision !== 'empty') throw new Error('Esta conta já contém progresso online. Guarde as duas versões; esta etapa não substitui ou mescla dados existentes.');
    }
    check(c); assertWorkspaceBaseline(s,baseline);
    if (s.getItem(ACCOUNT_BINDING_KEY) !== bindingRaw) throw new Error('O vínculo mudou durante a conferência.');
    const command = await transport.prepare({ archive:selected.previousCopy, expectedRevision, allProfilesConfirmed:true });
    if (command.userId !== selected.userId) throw new Error('A conta de destino mudou.');
    const baselineDigest = await accountBaselineDigest(s);
    const raw = await sealAccountIntent({ format:'conselho-elemental-account-intent', version:1, phase:'pending', origin:c.origin,
      userId:command.userId, operationId:command.operationId, expectedRevision, archive:command.archive,
      archiveSha256:command.archiveSha256, baselineDigest, localMode:baseline.localMode });
    check(c); assertWorkspaceBaseline(s,baseline);
    if (s.getItem(ACCOUNT_INTENT_KEY) !== null || s.getItem(ACCOUNT_BINDING_KEY) !== bindingRaw) throw new Error('A tentativa ou o vínculo mudou. Refaça a conferência.');
    write(s,ACCOUNT_INTENT_KEY,raw); // Durable BEFORE the first remote write.
    await transport.commit(command); check(c); assertIntent(s,raw);
    const result = await transport.confirm(command); check(c); assertIntent(s,raw);
    return { raw, receipt:result.receipt, storageConfirmed:true as const };
  });
}
/** Checking a receipt never resends a file. Retry requires a separate explicit consent. */
export async function reviewAccountTransfer(context: Context, input: { raw: string; retryConfirmed?: boolean }, transport: Transport) {
  const selected = { ...input };
  return exclusive(context,async(c,s) => {
    assertIntent(s,selected.raw); const intent = await inspectAccountIntent(selected.raw,c.origin); check(c); assertIntent(s,selected.raw); checkMode(s,intent);
    const identity = await transport.verifyIdentity(); check(c);
    if (identity.userId !== intent.userId) throw new Error('Entre na mesma conta usada nesta tentativa para conferir o recibo.');
    const command = await transport.prepare({ archive:intent.archive, expectedRevision:intent.expectedRevision, operationId:intent.operationId, allProfilesConfirmed:true });
    const saved = await transport.getReceipt(command); check(c); assertIntent(s,selected.raw);
    if (!saved && selected.retryConfirmed !== true) return { receipt:null, localChanged:await accountBaselineDigest(s) !== intent.baselineDigest };
    if (!saved) {
      if (await accountBaselineDigest(s) !== intent.baselineDigest) throw new Error('O progresso local mudou. A tentativa antiga não será reenviada. Preserve as duas cópias.');
      check(c); assertIntent(s,selected.raw); checkMode(s,intent);
      await transport.commit(command);
    }
    const confirmed = await transport.confirm(command); check(c); assertIntent(s,selected.raw);
    return { receipt:confirmed.receipt, localChanged:await accountBaselineDigest(s) !== intent.baselineDigest };
  });
}
/** Readback confirmation is not online activation. Keep local isolation durable. */
export async function finishAccountTransferLocally(context: Context, input: { raw: string; localUseConfirmed: boolean; preserveNewerLocalConfirmed?: boolean; bindAccountConfirmed?: boolean }, transport: Transport): Promise<AccountCommitReceipt> {
  const selected = { ...input };
  if (selected.localUseConfirmed !== true) throw new Error('Confirme que deseja continuar usando o progresso local, sem sincronização automática.');
  return exclusive(context,async(c,s) => {
    assertIntent(s,selected.raw);const intent = await inspectAccountIntent(selected.raw,c.origin);check(c);checkMode(s,intent);
    const bindingRaw = s.getItem(ACCOUNT_BINDING_KEY);
    const existing = bindingRaw === null ? null : await inspectAccountBinding(bindingRaw,c.origin);
    if (existing && (existing.userId !== intent.userId || (existing.revision !== intent.expectedRevision && existing.operationId !== intent.operationId))) throw new Error('O vínculo mudou. Preserve as versões e refaça a conferência.');
    if (!existing && intent.expectedRevision !== 'empty') throw new Error('O vínculo anterior está ausente. Preserve a tentativa antes de continuar.');
    const identity=await transport.verifyIdentity();if(identity.userId!==intent.userId)throw new Error('A conta não corresponde à tentativa.');
    const command=await transport.prepare({archive:intent.archive,expectedRevision:intent.expectedRevision,operationId:intent.operationId,allProfilesConfirmed:true});
    const confirmed=await transport.confirm(command);check(c);assertIntent(s,selected.raw);
    const digest=await accountBaselineDigest(s);check(c);assertIntent(s,selected.raw);checkMode(s,intent);
    if(digest!==intent.baselineDigest&&selected.preserveNewerLocalConfirmed!==true)throw new Error('Existem edições locais posteriores ao arquivo enviado. Confirme que elas ficarão preservadas neste navegador.');
    const binding = (existing || selected.bindAccountConfirmed === true) ? await sealAccountBinding({
      format:'conselho-elemental-account-binding',version:1,origin:c.origin,
      ...confirmed.receipt,baselineDigest:intent.baselineDigest,
    }) : null;
    check(c); assertIntent(s,selected.raw); checkMode(s,intent);
    if (s.getItem(ACCOUNT_BINDING_KEY) !== bindingRaw) throw new Error('O vínculo mudou durante a conferência.');
    write(s,LOCAL_PROGRESS_MODE_KEY,intent.localMode??localProgressMode(c.origin));
    if (binding !== null) write(s,ACCOUNT_BINDING_KEY,binding);
    assertIntent(s,selected.raw);write(s,ACCOUNT_INTENT_KEY,null);
    return confirmed.receipt;
  });
}
/** Offline escape that retains the attempt/receipt identity, never discards it. */
export async function pauseAccountTransferLocally(context: Context, raw: string, confirmed: boolean): Promise<string> {
  if(confirmed!==true)throw new Error('Confirme a pausa do envio e o uso somente local.');
  return exclusive(context,async(c,s) => {
    assertIntent(s,raw);const intent=await inspectAccountIntent(raw,c.origin);
    const paused=await sealAccountIntent({...intent,phase:'paused'});check(c);assertIntent(s,raw);checkMode(s,intent);
    write(s,LOCAL_PROGRESS_MODE_KEY,intent.localMode??localProgressMode(c.origin));assertIntent(s,raw);write(s,ACCOUNT_INTENT_KEY,paused);return paused;
  });
}
