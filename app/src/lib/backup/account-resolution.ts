import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { reviewedAccountVersions } from './account-conflict';
import { ACCOUNT_BINDING_KEY, inspectAccountBinding, sealAccountBinding } from './account-binding';
import { ACCOUNT_INTENT_KEY, inspectAccountIntent, accountDigest } from './account-intent';
import { LOCAL_PROGRESS_MODE_KEY, localProgressMode, validateLocalProgressMode } from './progress-mode';
import { RESTORE_JOURNAL_KEY, type StoredProgress, type RestoreStorage } from './restore-journal';
import { inspectProgressBackup, STORE_KEYS } from './progress-backup';
import { auditCriticalProgress } from './critical-progress';
import { validateStoredProgress } from './stored-progress';
import { hasProgressAppStarted, PROGRESS_SESSION_LOCK } from './progress-startup';
import type { createAccountTransport } from './account-transport';

interface Context { origin: string; storage: () => RestoreStorage; locks?: Pick<LockManager,'request'>; otherTabsClosed: boolean; isCurrent: () => boolean }
type Transport = ReturnType<typeof createAccountTransport>;
export interface AccountResolution {
  format: 'conselho-elemental-account-resolution'; version:1; origin:string; userId:string;
  direction:'local'|'online'; operationId:string; expectedRevision:string; archive:string;
  before:StoredProgress; target:StoredProgress; bindingRaw:string|null; intentRaw:string|null; localMode:string|null;
}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
function invalid():never { throw new Error('A resolução precisa de revisão. Preserve as cópias e os dados deste navegador.'); }
function parse(text:string):unknown { try{return JSON.parse(text);}catch{return invalid();} }
function pair(v:unknown):asserts v is StoredProgress {
  if(!object(v)||Object.keys(v).length!==2||!Object.hasOwn(v,'core')||!Object.hasOwn(v,'fitness')||[v.core,v.fitness].some(x=>x!==null&&typeof x!=='string'))invalid();
}
function read(s:Pick<Storage,'getItem'>):StoredProgress {return {core:s.getItem(STORE_KEYS.core),fitness:s.getItem(STORE_KEYS.fitness)};}
function same(a:StoredProgress,b:StoredProgress){return a.core===b.core&&a.fitness===b.fitness;}
async function targetPair(archive:string,origin:string):Promise<StoredProgress>{
  const {backup}=await inspectProgressBackup(archive),audit=auditCriticalProgress(backup);
  if(audit.issues.length||audit.truncated)invalid();
  const target={core:JSON.stringify({state:backup.stores.core.state,version:backup.stores.core.version}),fitness:JSON.stringify({state:backup.stores.fitness.state,version:backup.stores.fitness.version})};
  validateStoredProgress(target,origin);return target;
}
export async function inspectAccountResolution(raw:string,origin:string):Promise<Readonly<AccountResolution>>{
  if(new TextEncoder().encode(raw).byteLength>150*1024*1024)invalid();
  const e=parse(raw);if(!object(e)||Object.keys(e).length!==2||typeof e.payload!=='string'||typeof e.checksum!=='string'||await accountDigest(e.payload)!==e.checksum)invalid();
  const v=parse(e.payload),keys=['format','version','origin','userId','direction','operationId','expectedRevision','archive','before','target','bindingRaw','intentRaw','localMode'];
  if(!object(v)||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k))||v.format!=='conselho-elemental-account-resolution'||v.version!==1||!origin||v.origin!==origin||!uuid(v.userId)||!uuid(v.operationId)||!uuid(v.expectedRevision)||(v.direction!=='local'&&v.direction!=='online')||typeof v.archive!=='string'||[v.bindingRaw,v.intentRaw,v.localMode].some(x=>x!==null&&typeof x!=='string'))invalid();
  pair(v.before);pair(v.target);validateStoredProgress(v.before,origin);validateStoredProgress(v.target,origin);validateLocalProgressMode(v.localMode as string|null,origin);
  if(v.bindingRaw!==null&&(await inspectAccountBinding(v.bindingRaw as string,origin)).userId!==v.userId)invalid();
  if(v.intentRaw!==null&&(await inspectAccountIntent(v.intentRaw as string,origin)).userId!==v.userId)invalid();
  const expected=v.direction==='local'?v.before:await targetPair(v.archive,origin);
  // Local choice must also describe exactly the same domain, with no byte normalization.
  if(v.direction==='local'){
    const normalized=await targetPair(v.archive,origin);
    for(const k of ['core','fitness'] as const){if(v.before[k]===null||JSON.stringify(JSON.parse(v.before[k]!).state)!==JSON.stringify(JSON.parse(normalized[k]!).state))invalid();}
  }
  if(!same(v.target,expected))invalid();
  return Object.freeze({...v,before:Object.freeze({...v.before}),target:Object.freeze({...v.target})}) as unknown as Readonly<AccountResolution>;
}
async function seal(value:AccountResolution){const payload=JSON.stringify(value),raw=JSON.stringify({payload,checksum:await accountDigest(payload)});await inspectAccountResolution(raw,value.origin);return raw;}
function write(s:RestoreStorage,key:string,value:string|null){if(value===null)s.removeItem(key);else s.setItem(key,value);if(s.getItem(key)!==value)throw new Error('A gravação não foi confirmada. A resolução permanece protegida para retomar.');}
function check(c:Context){if(hasProgressAppStarted()||!c.isCurrent()||!c.origin||c.otherTabsClosed!==true)throw new Error('Feche outras abas e abra a conferência antes de resolver versões.');}
async function exclusive<T>(input:Context,action:(c:Context,s:RestoreStorage)=>Promise<T>){const c={...input};check(c);if(!c.locks)throw new Error('Este navegador não oferece a coordenação necessária.');return c.locks.request(PROGRESS_SESSION_LOCK,{mode:'exclusive',ifAvailable:true},async lock=>{if(!lock)throw new Error('O app está aberto em outra aba.');check(c);const s=c.storage();if(s.getItem(RESTORE_JOURNAL_KEY)!==null)throw new Error('Conclua a recuperação da restauração antes de resolver a conta.');return action(c,s);});}

async function complete(c:Context,s:RestoreStorage,raw:string,transport:Transport,retry:boolean){
  const journal=await inspectAccountResolution(raw,c.origin);check(c);
  const initial={pair:read(s),binding:s.getItem(ACCOUNT_BINDING_KEY),intent:s.getItem(ACCOUNT_INTENT_KEY),mode:s.getItem(LOCAL_PROGRESS_MODE_KEY)};
  const stable=()=>{check(c);if(s.getItem(ACCOUNT_RESOLUTION_KEY)!==raw||!same(read(s),initial.pair)||s.getItem(ACCOUNT_BINDING_KEY)!==initial.binding||s.getItem(ACCOUNT_INTENT_KEY)!==initial.intent||s.getItem(LOCAL_PROGRESS_MODE_KEY)!==initial.mode)throw new Error('O progresso mudou durante a retomada. Preserve as versões e confira novamente.');};
  stable();
  if((initial.intent!==journal.intentRaw&&initial.intent!==null)||(initial.mode!==journal.localMode&&initial.mode!==localProgressMode(c.origin)))invalid();
  for(const k of ['core','fitness'] as const)if(initial.pair[k]!==journal.before[k]&&initial.pair[k]!==journal.target[k])invalid();
  if(initial.binding!==journal.bindingRaw){if(initial.binding===null)invalid();const bound=await inspectAccountBinding(initial.binding,c.origin);if(bound.userId!==journal.userId||bound.operationId!==journal.operationId)invalid();stable();}
  if((await transport.verifyIdentity()).userId!==journal.userId)invalid();stable();
  const command=await transport.prepare({archive:journal.archive,expectedRevision:journal.expectedRevision,operationId:journal.operationId,allProfilesConfirmed:true});stable();
  let receipt=await transport.getReceipt(command);stable();
  if(!receipt){
    if(!retry)return {outcome:'awaiting-receipt' as const};
    if(!same(initial.pair,journal.before)||initial.binding!==journal.bindingRaw||initial.intent!==journal.intentRaw)throw new Error('O estado local já mudou. Não é seguro repetir esse envio.');
    receipt=await transport.commit(command);stable();
  }
  const confirmed=await transport.confirm(command);stable();
  const binding=await sealAccountBinding({format:'conselho-elemental-account-binding',version:1,origin:c.origin,...confirmed.receipt,baselineDigest:await accountDigest(JSON.stringify(journal.target))});stable();
  // A successful CAS fence changes the revision. A delayed old operation can no
  // longer replace the chosen archive, even if it had no receipt when reviewed.
  const owned=()=>{check(c);if(s.getItem(ACCOUNT_RESOLUTION_KEY)!==raw)invalid();const current=read(s);for(const k of ['core','fitness'] as const)if(current[k]!==journal.before[k]&&current[k]!==journal.target[k])invalid();if(![journal.bindingRaw,initial.binding,binding].includes(s.getItem(ACCOUNT_BINDING_KEY))||![journal.intentRaw,null].includes(s.getItem(ACCOUNT_INTENT_KEY))||![journal.localMode,localProgressMode(c.origin)].includes(s.getItem(LOCAL_PROGRESS_MODE_KEY)))invalid();};
  owned();write(s,LOCAL_PROGRESS_MODE_KEY,journal.localMode??localProgressMode(c.origin));
  for(const k of ['core','fitness'] as const){owned();if(s.getItem(STORE_KEYS[k])!==journal.target[k])write(s,STORE_KEYS[k],journal.target[k]);}
  owned();write(s,ACCOUNT_BINDING_KEY,binding);owned();write(s,ACCOUNT_INTENT_KEY,null);owned();write(s,ACCOUNT_RESOLUTION_KEY,null);
  return {outcome:'resolved' as const,receipt:confirmed.receipt};
}

export async function resolveAccountVersions(context:Context,input:{review:object;direction:'local'|'online';copies:{local:string|null;online:string;pending:string|null};allProfilesConfirmed:boolean;replacementConfirmed:boolean},transport:Transport){
  const selected={...input,copies:{...input.copies}},review=reviewedAccountVersions(selected.review);
  if(selected.allProfilesConfirmed!==true||selected.replacementConfirmed!==true)throw new Error('Confirme a substituição da versão escolhida e o escopo de todos os perfis.');
  if(selected.copies.local!==review.localArchive||selected.copies.online!==review.remoteArchive||selected.copies.pending!==review.pendingArchive)throw new Error('Confira os arquivos salvos de todas as versões antes de escolher.');
  if(selected.direction!=='local'&&selected.direction!=='online')invalid();
  if(selected.direction==='local'&&review.localArchive===null)throw new Error('Não existe versão local para enviar.');
  return exclusive(context,async(c,s)=>{
    const fresh=()=>{check(c);if(c.origin!==review.origin||!same(read(s),review.before)||s.getItem(ACCOUNT_BINDING_KEY)!==review.bindingRaw||s.getItem(ACCOUNT_INTENT_KEY)!==review.intentRaw||s.getItem(LOCAL_PROGRESS_MODE_KEY)!==review.localMode||s.getItem(ACCOUNT_RESOLUTION_KEY)!==null)throw new Error('A comparação mudou. Confira novamente antes de escolher.');};
    fresh();if((await transport.verifyIdentity()).userId!==review.userId)invalid();
    const online=await transport.readProgress(review.userId);fresh();
    if(!online||typeof online!=='object'||!('revision'in online)||!('archive'in online)||online.revision!==review.revision||online.archive!==review.remoteArchive)throw new Error('A versão online mudou. Compare novamente antes de decidir.');
    const archive=selected.direction==='local'?review.localArchive!:review.remoteArchive;
    const command=await transport.prepare({archive,expectedRevision:review.revision,allProfilesConfirmed:true});fresh();
    const target=selected.direction==='local'?{...review.before}:await targetPair(archive,c.origin);
    const raw=await seal({format:'conselho-elemental-account-resolution',version:1,origin:c.origin,userId:review.userId,direction:selected.direction,operationId:command.operationId,expectedRevision:review.revision,archive,before:{...review.before},target,bindingRaw:review.bindingRaw,intentRaw:review.intentRaw,localMode:review.localMode});fresh();
    write(s,ACCOUNT_RESOLUTION_KEY,raw);
    return complete(c,s,raw,transport,true);
  });
}
export async function resumeAccountResolution(context:Context,input:{raw:string;recoveryConfirmed:boolean;retryConfirmed?:boolean},transport:Transport){
  const selected={...input};if(selected.recoveryConfirmed!==true)throw new Error('Confirme a retomada da escolha salva antes de continuar.');
  return exclusive(context,async(c,s)=>{if(s.getItem(ACCOUNT_RESOLUTION_KEY)!==selected.raw)throw new Error('A resolução mudou. Recarregue a conferência.');return complete(c,s,selected.raw,transport,selected.retryConfirmed===true);});
}

/** Leave the local version untouched only after a fresh server revision fences
 * every still-in-flight request for this choice. Not an offline cancellation. */
export async function keepLocalAfterResolution(context:Context,input:{raw:string;localUseConfirmed:boolean},transport:Transport){
  const selected={...input};if(selected.localUseConfirmed!==true)throw new Error('Confirme manter o progresso local sem aplicar esta escolha.');
  return exclusive(context,async(c,s)=>{
    const journal=await inspectAccountResolution(selected.raw,c.origin);check(c);
    const baseline={pair:read(s),binding:s.getItem(ACCOUNT_BINDING_KEY),intent:s.getItem(ACCOUNT_INTENT_KEY),mode:s.getItem(LOCAL_PROGRESS_MODE_KEY)};
    const stable=()=>{check(c);if(s.getItem(ACCOUNT_RESOLUTION_KEY)!==selected.raw||!same(read(s),baseline.pair)||s.getItem(ACCOUNT_BINDING_KEY)!==baseline.binding||s.getItem(ACCOUNT_INTENT_KEY)!==baseline.intent||s.getItem(LOCAL_PROGRESS_MODE_KEY)!==baseline.mode)invalid();};
    stable();if(!same(baseline.pair,journal.before)||baseline.binding!==journal.bindingRaw||baseline.intent!==journal.intentRaw||![journal.localMode,localProgressMode(c.origin)].includes(baseline.mode))throw new Error('A aplicação local já começou ou os dados mudaram. Retome a escolha protegida.');
    if((await transport.verifyIdentity()).userId!==journal.userId)invalid();
    const remote=await transport.readProgress(journal.userId);stable();
    if(!remote||typeof remote!=='object'||!('revision'in remote)||!('archive'in remote)||typeof remote.archive!=='string'||remote.revision===journal.expectedRevision)throw new Error('Ainda não é seguro encerrar a escolha. Confira o recibo ou repita a mesma operação.');
    await targetPair(remote.archive,c.origin);stable();
    write(s,LOCAL_PROGRESS_MODE_KEY,journal.localMode??localProgressMode(c.origin));
    check(c);
    if(s.getItem(ACCOUNT_RESOLUTION_KEY)!==selected.raw||!same(read(s),baseline.pair)||s.getItem(ACCOUNT_BINDING_KEY)!==baseline.binding||s.getItem(ACCOUNT_INTENT_KEY)!==baseline.intent||s.getItem(LOCAL_PROGRESS_MODE_KEY)!==(journal.localMode??localProgressMode(c.origin)))invalid();
    // Keep any older intent exactly as-is. The workspace can compare or pause
    // it explicitly; leaving this choice never discards an uncertain operation.
    write(s,ACCOUNT_RESOLUTION_KEY,null);
    return 'review-ready' as const;
  });
}
