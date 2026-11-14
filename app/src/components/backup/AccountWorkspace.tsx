import { EntryArtwork, EntryBrand } from '@/components/entry/EntryVisuals';
import { connectCurrentAccountProgress, receiveReviewedAccountProgress, resumeAccountConnection } from '@/lib/backup/connect-account-progress';
import './account-journey.css';
import { ACCOUNT_RESOLUTION_KEY } from '@/lib/backup/account-resolution-key';
import { accountErrorCode } from '@/lib/backup/account-auth-messages';
import { accessAccount, resendAccountConfirmation, validAccountAccess, validAccountEmail, type AccountAccessMode } from '@/lib/backup/account-access';
import { takeOAuthReturn, type AccountReturnNotice, type AccountOAuthReturn } from '@/lib/backup/account-return';
import { ACCOUNT_OAUTH_LABELS, completeAccountOAuth, oauthPkceOptions, oauthReturnFailure, startAccountOAuth, type AccountOAuthProvider } from '@/lib/backup/account-oauth';
import { inspectAccountResolution, resolveAccountVersions, resumeAccountResolution, keepLocalAfterResolution, type AccountResolution } from '@/lib/backup/account-resolution';
import { AccountResolutionPanel } from './AccountResolutionPanel';
import { reviewAccountVersions } from '@/lib/backup/account-conflict';
import { reviewAccountBinding } from '@/lib/backup/account-binding';
import type { LiveAccountSession } from '@/lib/backup/account-live-sync';
import { ACCOUNT_BINDING_KEY, inspectAccountBinding, type AccountBinding } from '@/lib/backup/account-binding';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Download, Eye, EyeOff, LoaderCircle, MailCheck } from 'lucide-react';
import { createWorkspaceSafetyCopy, readWorkspaceBaseline, type WorkspaceBaseline } from '@/lib/backup/workspace-preview';
import { verifyPreviousSafetyCopy } from '@/lib/backup/restore-confirmation';
import { MAX_BACKUP_BYTES, STORE_KEYS, type ProgressSnapshot } from '@/lib/backup/progress-backup';
import { ACCOUNT_INTENT_KEY, accountBaselineDigest, inspectAccountIntent, type AccountIntent } from '@/lib/backup/account-intent';
import { createSupabaseAccountTransport, type AccountCommitReceipt } from '@/lib/backup/account-transport';
import { beginAccountTransfer, reviewAccountTransfer, finishAccountTransferLocally, pauseAccountTransferLocally } from '@/lib/backup/account-transfer';
import { ACCOUNT_TRANSFER_WRITES_RELEASED } from '@/lib/backup/account-release';
import { ACCOUNT_ACCESS_RELEASED } from '@/lib/backup/account-access-release';
import { RESTORE_JOURNAL_KEY } from '@/lib/backup/restore-journal';
import { LOCAL_PROGRESS_MODE_KEY } from '@/lib/backup/progress-mode';
import { ACCOUNT_TAB_ACCESS_KEY } from '@/lib/backup/account-resume-entry';
import { accountAccessStorage, saveRememberChoice, takeRememberChoice } from '@/lib/backup/account-access-storage';
import { StoredProgressAuditError } from '@/lib/backup/stored-progress';
import type { ProgressIssue } from '@/lib/backup/critical-progress';
import { applyStoredProgressRepair, planStoredProgressRepair, settleStoredProgressRepair, STORED_PROGRESS_REPAIR_KEY, type StoredProgressRepairPlan, type StoredProgressRepairSummary } from '@/lib/backup/stored-progress-repair';
type Session = ReturnType<typeof import('@/lib/backup/account-session').createAccountReviewSession>;

type StoredRecord = Record<string, unknown>;
const storedRecord = (value: unknown): value is StoredRecord => !!value && typeof value === 'object' && !Array.isArray(value);
const storedListCount = (value: unknown) => Array.isArray(value) ? value.filter(item => !storedRecord(item) || !item.parentId).length : 0;
const storedXp = (value: unknown) => {
  if (!storedRecord(value)) return 0;
  return ['xp_earth','xp_fire','xp_water','xp_air'].reduce((sum,key) => {
    const amount = value[key];
    return sum + (typeof amount === 'number' && Number.isFinite(amount) ? amount : 0);
  }, 0);
};
function summarizeLocalJourney(snapshot: ProgressSnapshot | null | undefined) {
  const unavailable = { profiles: 0, tasks: 0, habits: 0, xp: 0, sessions: 0, activeName: 'Resumo indisponível', activeTasks: 0, activeHabits: 0, activeXp: 0, empty: false, activeEmpty: false, available: false };
  if (!snapshot || !storedRecord(snapshot.stores) || !storedRecord(snapshot.stores.core) || !storedRecord(snapshot.stores.fitness)
    || !storedRecord(snapshot.stores.core.state) || !storedRecord(snapshot.stores.fitness.state)) return unavailable;
  const core = snapshot.stores.core.state, fitness = snapshot.stores.fitness.state;
  const names = new Map<string,string>(), profiles = new Map<string,StoredRecord>();
  if (Array.isArray(core.accounts)) for (const account of core.accounts) if (storedRecord(account) && typeof account.id === 'string') {
    names.set(account.id, typeof account.name === 'string' && account.name.trim() ? account.name.trim() : 'Perfil sem nome');
  }
  if (storedRecord(core.accountDataById)) for (const [id,data] of Object.entries(core.accountDataById)) if (storedRecord(data)) profiles.set(id,data);
  const activeId = typeof core.currentAccountId === 'string' ? core.currentAccountId : 'local';
  profiles.set(activeId,core);
  for (const id of names.keys()) if (!profiles.has(id)) profiles.set(id,{});
  const values = [...profiles.values()];
  const tasks = values.reduce((sum,profile)=>sum+storedListCount(profile.tasks),0);
  const habits = values.reduce((sum,profile)=>sum+storedListCount(profile.habits),0);
  const xp = values.reduce((sum,profile)=>sum+storedXp(profile.user),0);
  const activityRows = ['actions','executionLogs','projects','quests','drafts','cycleSequences','commitments'] as const;
  const otherActivity = values.reduce((sum,profile)=>sum+activityRows.reduce((part,key)=>part+storedListCount(profile[key]),0),0);
  const fitnessRows = (container: unknown, key: string) => storedRecord(container)
    ? Object.values(container).reduce<number>((sum,data)=>sum+(storedRecord(data)&&Array.isArray(data[key])?data[key].length:0),0) : 0;
  const sessions = fitnessRows(fitness.accountDataById,'sessions') + fitnessRows(fitness.nativeDataById,'nativeHistory');
  const active = profiles.get(activeId) ?? core;
  const activeTasks = storedListCount(active.tasks), activeHabits = storedListCount(active.habits), activeXp = storedXp(active.user);
  return { profiles: profiles.size, tasks, habits, xp, sessions, activeName: names.get(activeId) ?? (activeId === 'local' ? 'Progresso sem perfil' : 'Perfil ativo'), activeTasks, activeHabits, activeXp,
    empty: tasks + habits + xp + sessions + otherActivity === 0, activeEmpty: activeTasks + activeHabits + activeXp === 0, available: true };
}

type RemoteLook = { kind: 'looking' | 'empty' | 'legacy' | 'snapshot' | 'error' };
type Step = 'entrada' | 'procurando' | 'ajuste' | 'metade' | 'ligado' | 'salvar' | 'novo' | 'trazer' | 'escolher' | 'antigo-sem' | 'antigo-com';
const plural=(count:number,one:string,many:string)=>`${count.toLocaleString('pt-BR')} ${count===1?one:many}`;
const totalsLine=(summary:{xp:number;tasks:number;habits:number}|null)=>summary?`${summary.xp.toLocaleString('pt-BR',{maximumFractionDigits:3})} XP, ${plural(summary.tasks,'ritual','rituais')} e ${plural(summary.habits,'ciclo','ciclos')}`:'';
const dayLabel=(value:unknown)=>{const time=typeof value==='string'?Date.parse(value):NaN;return Number.isFinite(time)?new Date(time).toLocaleDateString('pt-BR'):'';};
const signedInNotice=(address?:string|null)=>address&&address.trim()?`Você entrou como ${address.trim()}.`:'Você entrou na sua conta.';
const GoogleIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.81z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4-3.1z"/><path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77z"/></svg>;
export function AccountWorkspace({ onStart, notice = 'none' }: { onStart?: (session: LiveAccountSession) => void; notice?: AccountReturnNotice } = {}) {
  const startsSignup=new URLSearchParams(window.location.search ?? '').get('modo') === 'cadastro' || window.location.pathname === '/cadastro';
  const [accessMode,setAccessMode]=useState<AccountAccessMode>(startsSignup ? 'signup' : 'login'),[confirmation,setConfirmation]=useState('');
  const [emailOpen,setEmailOpen]=useState(startsSignup),[signupSent,setSignupSent]=useState(false),[authSource,setAuthSource]=useState<'google'|'email'>('google');
  const [authFeedback,setAuthFeedback]=useState(notice==='oauth'?'Conferindo o retorno do provedor…':notice==='returned'?'O link foi aberto e suas credenciais foram removidas do endereço. Entre para validar o acesso.':notice==='invalid'?'O link não pôde ser confirmado aqui. Entre ou solicite outra confirmação.':''),[authError,setAuthErrorText]=useState(''),[authCode,setAuthCode]=useState<string|null>(null);
  const setAuthError=(reason:string,code:string|null=null)=>{setAuthErrorText(reason);setAuthCode(code);};
  const [receiveMode,setReceiveMode]=useState(false);
  const [resolution,setResolution]=useState<{raw:string;journal:Readonly<AccountResolution>}|null>(null);
  const [liveConsent,setLiveConsent]=useState(false),[keepConnected,setKeepConnected]=useState(true);
  const [versions,setVersions]=useState<Awaited<ReturnType<typeof reviewAccountVersions>>|null>(null);
  const [binding,setBinding]=useState<Readonly<AccountBinding>|null>(null),[saveBinding,setSaveBinding]=useState(false);
  const [baseline,setBaseline]=useState<WorkspaceBaseline|null>(null),[copy,setCopy]=useState<string|null>(null);
  const [pending,setPending]=useState<{raw:string;intent:AccountIntent}|null>(null),[receipt,setReceipt]=useState<AccountCommitReceipt|null>(null);
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[userId,setUserId]=useState<string|null>(null);
  const [showPassword, setShowPassword] = useState(false), [showConfirmation, setShowConfirmation] = useState(false);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  const [tabs,setTabs]=useState(false),[allProfiles,setAllProfiles]=useState(false),[localUse,setLocalUse]=useState(false),[retry,setRetry]=useState(false),[keepNewer,setKeepNewer]=useState(false),[localChanged,setLocalChanged]=useState(false);
  const [blocked,setBlocked]=useState(false),[repairable,setRepairable]=useState(false);
  const [blockKind,setBlockKind]=useState<'connection'|'progress'|'restore'|null>(null),[progressIssues,setProgressIssues]=useState<ProgressIssue[]>([]);
  const [progressRepair,setProgressRepair]=useState<StoredProgressRepairSummary|null>(null),[progressRepairError,setProgressRepairError]=useState(''),[repairConsent,setRepairConsent]=useState(false);
  const [,setLegacyAccount]=useState(false),[legacyConsent,setLegacyConsent]=useState(false);
  const [pendingRetryConsent,setPendingRetryConsent]=useState(false);
  const [emptyJourneyConsent,setEmptyJourneyConsent]=useState(false);
  const [ready,setReady]=useState(false);
  const [newJourneyConsent,setNewJourneyConsent]=useState(false);
  const [remote,setRemote]=useState<RemoteLook|null>(null),[stillLegacy,setStillLegacy]=useState(false);
  const [choice,setChoice]=useState<'account'|'device'|null>(null),[replaceConsent,setReplaceConsent]=useState(false),[advancedOpen,setAdvancedOpen]=useState(false);
  const oauthReturn=useRef<AccountOAuthReturn|null|undefined>(undefined),generation=useRef(0),job=useRef<number|null>(null),alive=useRef(true),session=useRef<Session|null>(null),identity=useRef<string|null>(null),accessRaw=useRef<string|null>(null),file=useRef<HTMLInputElement>(null),heading=useRef<HTMLHeadingElement>(null),emailField=useRef<HTMLInputElement>(null),repairPlan=useRef<StoredProgressRepairPlan|null>(null),advancedRef=useRef<HTMLDetailsElement>(null);
  /** Single decision point for the saved access: this device (localStorage) or this tab (sessionStorage). */
  const savedAccess=(remember?:boolean)=>accountAccessStorage(remember,window);
  const pair=()=>JSON.stringify([window.localStorage.getItem(STORE_KEYS.core),window.localStorage.getItem(STORE_KEYS.fitness)]);
  const isCurrent=(token:number)=>alive.current&&generation.current===token;
  function markBlocked(reason:unknown) {
    let restore=false;try{restore=window.localStorage.getItem(RESTORE_JOURNAL_KEY)!==null;}catch{/* storage error remains blocked */}
    const progress=reason instanceof StoredProgressAuditError;
    let planned:StoredProgressRepairPlan|null=null,repairError='';
    if(progress&&!restore)try{planned=planStoredProgressRepair(window.localStorage,window.location.origin);}catch(repairReason){repairError=repairReason instanceof Error?repairReason.message:'Estes campos precisam de revisão manual.';}
    repairPlan.current=planned;setProgressRepair(planned?.summary??null);setProgressRepairError(repairError);setRepairConsent(false);
    setReady(true);setBlocked(true);setRepairable(!restore&&!progress);setBlockKind(restore?'restore':progress?'progress':'connection');setProgressIssues(progress?reason.audit.issues:[]);
    setError(restore?'Há uma recuperação pendente que precisa ser concluída antes de conectar a conta.':progress?reason.message:'A conexão anterior deste aparelho precisa ser reiniciada. Suas atividades locais e qualquer versão já salva na conta continuam preservadas.');
  }
  async function refresh(token:number) {
    await settleStoredProgressRepair(window.localStorage,window.location.origin);
    if(window.localStorage.getItem(RESTORE_JOURNAL_KEY)!==null)throw new Error('Conclua a recuperação da restauração antes de conferir a conta.');
    const resolutionRaw=window.localStorage.getItem(ACCOUNT_RESOLUTION_KEY);
    const resolutionJournal=resolutionRaw===null?null:await inspectAccountResolution(resolutionRaw,window.location.origin);
    if(isCurrent(token))setResolution(resolutionRaw!==null&&resolutionJournal?{raw:resolutionRaw,journal:resolutionJournal}:null);
    const bindingRaw=window.localStorage.getItem(ACCOUNT_BINDING_KEY);
    const reviewedBinding=bindingRaw===null?null:await inspectAccountBinding(bindingRaw,window.location.origin);
    if(isCurrent(token))setBinding(reviewedBinding);
    const raw=window.localStorage.getItem(ACCOUNT_INTENT_KEY);
    if(raw!==null){const intent=await inspectAccountIntent(raw,window.location.origin);const changed=await accountBaselineDigest(window.localStorage)!==intent.baselineDigest;if(isCurrent(token)){setPending({raw,intent});setBaseline(null);setLocalChanged(changed);}}
    else if(isCurrent(token)){setPending(null);setBaseline(resolutionRaw!==null?null:readWorkspaceBaseline(window.localStorage,window.location.origin));}
    if(isCurrent(token)){repairPlan.current=null;setBlocked(false);setRepairable(false);setBlockKind(null);setProgressIssues([]);setProgressRepair(null);setProgressRepairError('');setRepairConsent(false);setLegacyAccount(false);setLegacyConsent(false);setReady(true);}
  }
  useEffect(()=>{
    const ref=generation;alive.current=true;setReady(false);const token=++ref.current;
    void (async()=>{
      try{await refresh(token);}catch(reason){if(ref.current===token)markBlocked(reason);return;}
      if(!isCurrent(token))return;
      const returned=notice==='oauth'?(oauthReturn.current??=takeOAuthReturn()):null;
      if(returned){
        try{
          setBusy(true);
          if(!returned.code)throw oauthReturnFailure(returned.errorCode??'oauth_error');
          await finishOAuthReturn(returned.code,token);
        }catch(reason){if(ref.current===token){setAuthFeedback('');setAuthError(reason instanceof Error?reason.message:'Não foi possível concluir o retorno do provedor.',accountErrorCode(reason));}}
        finally{if(ref.current===token)setBusy(false);}
        return;
      }
      if(savedAccess().getItem(ACCOUNT_TAB_ACCESS_KEY)===null)return;
      try{
        setBusy(true);
        const {resumeAuthenticatedAccountReview}=await import('@/lib/backup/resume-authenticated-account');
        const resumed=await resumeAuthenticatedAccountReview({config:{url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY},origin:window.location.origin,accessStorage:savedAccess(),isCurrent:()=>isCurrent(token)});
        if(!isCurrent(token)){resumed.owned.dispose();return;}
        const ids:string[]=[];
        const bindingRaw=window.localStorage.getItem(ACCOUNT_BINDING_KEY);if(bindingRaw)ids.push((await inspectAccountBinding(bindingRaw,window.location.origin)).userId);
        const pendingRaw=window.localStorage.getItem(ACCOUNT_INTENT_KEY);if(pendingRaw)ids.push((await inspectAccountIntent(pendingRaw,window.location.origin)).userId);
        const resolutionRaw=window.localStorage.getItem(ACCOUNT_RESOLUTION_KEY);if(resolutionRaw)ids.push((await inspectAccountResolution(resolutionRaw,window.location.origin)).userId);
        if(ids.some(id=>id!==resumed.userId)){resumed.owned.dispose();throw new Error('O acesso salvo pertence a outra conta. Entre na conta vinculada a esta tentativa.');}
        session.current=resumed.owned;identity.current=resumed.userId;accessRaw.current=savedAccess().getItem(ACCOUNT_TAB_ACCESS_KEY);setEmail(resumed.email??'');setUserId(resumed.userId);setPassword('');
        setAuthFeedback(signedInNotice(resumed.email));
        await lookAtAccount(token);
      }catch(reason){if(ref.current===token)setAuthError(reason instanceof Error?reason.message:'Entre novamente para validar o acesso.');}
    })()
      .finally(()=>{if(ref.current===token)setBusy(false);});
    const changed=(event:StorageEvent)=>{
      if(event.key!==null&&![STORE_KEYS.core,STORE_KEYS.fitness,ACCOUNT_INTENT_KEY,ACCOUNT_BINDING_KEY,ACCOUNT_RESOLUTION_KEY,RESTORE_JOURNAL_KEY,STORED_PROGRESS_REPAIR_KEY,LOCAL_PROGRESS_MODE_KEY].includes(event.key))return;
      const next=++ref.current;job.current=null;setReady(false);setBusy(false);setCopy(null);setReceipt(null);setTabs(false);setAllProfiles(false);setLocalUse(false);setRetry(false);setKeepNewer(false);setSaveBinding(false);setLiveConsent(false);setNewJourneyConsent(false);setLegacyAccount(false);setLegacyConsent(false);setPendingRetryConsent(false);setEmptyJourneyConsent(false);setVersions(null);setRemote(null);setStillLegacy(false);setChoice(null);setReplaceConsent(false);setMessage('O progresso mudou. Vamos olhar de novo.');
      void refresh(next).then(()=>{if(isCurrent(next)&&identity.current&&session.current)return lookAtAccount(next);}).catch(reason=>{if(ref.current===next)markBlocked(reason);});
    };
    window.addEventListener('storage',changed);
    return()=>{ref.current++;alive.current=false;session.current?.dispose();session.current=null;identity.current=null;window.removeEventListener('storage',changed);};
  // The isolated document owns this one subscription; callbacks bind generations.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  async function run(action:(token:number)=>Promise<void>,access=false) {
    if(!ready||job.current!==null)return;
    const token=++generation.current;job.current=token;setBusy(true);setError('');
    try{await action(token);}catch(reason){if(isCurrent(token)){if(access)setAuthError(reason instanceof Error?reason.message:'Não foi possível concluir. Preserve sua cópia local.',accountErrorCode(reason));else setError(reason instanceof Error?reason.message:'Não foi possível concluir. Preserve sua cópia local.');try{await refresh(token);}catch(refreshReason){markBlocked(refreshReason);}}}
    finally{if(job.current===token){job.current=null;if(alive.current)setBusy(false);}}
  }
  function download(text:string,label:string){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`${label}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;try{document.body.append(a);a.click();}finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}}
  function safety(){void run(async token=>{const saved=await createWorkspaceSafetyCopy(window.localStorage,window.location.origin);if(!isCurrent(token))return;setBaseline(saved.baseline);setCopy(null);setAllProfiles(false);setLocalUse(false);setLiveConsent(false);setVersions(null);download(saved.text,'conselho-antes-do-envio');setMessage('Download solicitado. Selecione o arquivo salvo para conferir antes de enviar.');});}
  function select(selected:File){void run(async token=>{setCopy(null);setAllProfiles(false);setLocalUse(false);setLiveConsent(false);setVersions(null);if(!baseline)throw new Error('Recarregue a conferência antes de escolher a cópia.');if(selected.size>MAX_BACKUP_BYTES)throw new Error('Escolha uma cópia de até 20 MB.');const text=await selected.text();if(!isCurrent(token))return;await verifyPreviousSafetyCopy(text,baseline,window.localStorage,window.location.origin);if(isCurrent(token)){setCopy(text);setMessage('Arquivo salvo corresponde ao progresso local conferido.');}});}
  function context(token:number){const captured=pair(),bound=window.localStorage.getItem(ACCOUNT_BINDING_KEY);return{origin:window.location.origin,storage:()=>window.localStorage,locks:navigator.locks,otherTabsClosed:tabs,isCurrent:()=>isCurrent(token)&&pair()===captured&&window.localStorage.getItem(ACCOUNT_BINDING_KEY)===bound};}
  function transport(token:number){if(!session.current||!identity.current)throw new Error('Entre na conta de destino para conferir.');const captured=pair(),currentSession=session.current;return createSupabaseAccountTransport(currentSession.client,{expectedUserId:identity.current,currentUserId:()=>identity.current,isCurrent:()=>isCurrent(token)&&session.current===currentSession&&pair()===captured});}
  function forgetSavedAccess() {
    const raw=accessRaw.current;if(!raw)return;
    const saved=savedAccess();
    if(saved.getItem(ACCOUNT_TAB_ACCESS_KEY)!==raw)throw new Error('O acesso salvo mudou. Recarregue antes de trocar a conta.');
    saved.removeItem(ACCOUNT_TAB_ACCESS_KEY);// both this device and this tab
    if(saved.getItem(ACCOUNT_TAB_ACCESS_KEY)!==null)throw new Error('O navegador não confirmou a saída.');
    accessRaw.current=null;
  }
  /** Explicit sign-out also revokes this session on the server; the client is disposed once that settles. */
  function signOutLocal(opened:Session){
    try{void Promise.resolve(opened.client.auth.signOut({scope:'local'})).catch(()=>{}).finally(()=>opened.dispose());}
    catch{opened.dispose();}
  }
  function clearAccess(forget=false) {
    setNewJourneyConsent(false);setLegacyAccount(false);setLegacyConsent(false);setEmptyJourneyConsent(false);
    if(forget)forgetSavedAccess();
    const opened=session.current;session.current=null;identity.current=null;
    if(forget&&opened)signOutLocal(opened);else opened?.dispose();setUserId(null);setPassword('');setConfirmation('');setVersions(null);setReceipt(null);setTabs(false);setLiveConsent(false);setAllProfiles(false);setLocalUse(false);setRetry(false);setKeepNewer(false);setSaveBinding(false);setPendingRetryConsent(false);setAuthFeedback('');setAuthError('');setRemote(null);setStillLegacy(false);setChoice(null);setReplaceConsent(false);
  }
  function changeAccess(mode:AccountAccessMode) {
    if(!ready||busy||job.current!==null||userId)return;
    generation.current++;clearAccess();setAccessMode(mode);setShowPassword(false);setShowConfirmation(false);setError('');setMessage('');
    window.history?.replaceState(null, '', mode === 'signup' ? '/auth?modo=cadastro' : '/auth');
  }
  function switchMode(mode:AccountAccessMode){changeAccess(mode);setEmailOpen(true);}
  function toggleEmail(){const next=!emailOpen;setEmailOpen(next);if(next)setTimeout(()=>emailField.current?.focus(),0);}
  function closeAccess() {
    if(!ready||busy||job.current!==null)return;
    generation.current++;try{clearAccess(true);setAuthFeedback('Você saiu desta conta. O progresso deste aparelho continua guardado.');}catch(reason){setAuthError(reason instanceof Error?reason.message:'Não foi possível encerrar este acesso.');}
  }
  function resetLocalConnection() {
    if(!ready||busy||!repairable)return;
    void run(async token=>{
      if(window.localStorage.getItem(RESTORE_JOURNAL_KEY)!==null)throw new Error('Conclua a recuperação pendente antes de reiniciar a conexão.');
      for(const key of [ACCOUNT_BINDING_KEY,ACCOUNT_INTENT_KEY,ACCOUNT_RESOLUTION_KEY,LOCAL_PROGRESS_MODE_KEY])window.localStorage.removeItem(key);
      savedAccess().removeItem(ACCOUNT_TAB_ACCESS_KEY);
      if([ACCOUNT_BINDING_KEY,ACCOUNT_INTENT_KEY,ACCOUNT_RESOLUTION_KEY,LOCAL_PROGRESS_MODE_KEY].some(key=>window.localStorage.getItem(key)!==null)||savedAccess().getItem(ACCOUNT_TAB_ACCESS_KEY)!==null)throw new Error('O navegador não confirmou a reinicialização. Seu progresso não foi alterado.');
      setBinding(null);setPending(null);setResolution(null);setVersions(null);setReceipt(null);setBlocked(false);setRepairable(false);setBlockKind(null);setProgressIssues([]);
      await refresh(token);
      if(isCurrent(token))setMessage('Conexão reiniciada. Agora é só continuar.');
    });
  }
  function repairStoredProgress() {
    const plan=repairPlan.current;
    if(!ready||busy||blockKind!=='progress'||!plan||!repairConsent)return;
    void run(async token=>{
      const captured=pair();
      await applyStoredProgressRepair({origin:window.location.origin,storage:()=>window.localStorage,locks:navigator.locks,otherTabsClosed:repairConsent,isCurrent:()=>isCurrent(token)&&pair()===captured},plan);
      if(!isCurrent(token))return;
      await refresh(token);
      if(isCurrent(token))setMessage('Dados antigos corrigidos e conferidos. A atividade foi preservada como item independente; agora você pode sincronizar este aparelho.');
    });
  }
  function authenticate(kind:AccountAccessMode){
    if(!ACCOUNT_ACCESS_RELEASED||!ready||userId||!validAccountAccess(kind,email,password,confirmation))return;
    const input={mode:kind,email,password,confirmation,origin:window.location.origin},keep=keepConnected;
    setAuthSource('email');
    void run(async token=>{
      clearAccess();
      const {createAccountReviewSession}=await import('@/lib/backup/account-session');if(!isCurrent(token))return;
      const opened=createAccountReviewSession({url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY});session.current=opened;
      try {
        const result=await accessAccount(opened.client,input,()=>isCurrent(token)&&session.current===opened);
        if(result.kind==='confirmation'){opened.dispose();session.current=null;setSignupSent(true);setAccessMode('login');window.history?.replaceState(null, '', '/auth');setAuthFeedback(result.message);return;}
        const id=result.userId;
        if((pending&&pending.intent.userId!==id)||(binding&&binding.userId!==id)||(resolution&&resolution.journal.userId!==id))throw new Error('Entre na mesma conta usada nesta tentativa para conferir seu recibo.');
        const {rememberAuthenticatedAccountAccess}=await import('@/lib/backup/account-live-access');
        await rememberAuthenticatedAccountAccess(opened,{userId:id,origin:window.location.origin,project:import.meta.env.VITE_SUPABASE_URL,storage:savedAccess(keep)});
        if(!isCurrent(token)||session.current!==opened)throw new Error('O acesso mudou. Entre novamente.');
        identity.current=id;accessRaw.current=savedAccess().getItem(ACCOUNT_TAB_ACCESS_KEY);setUserId(id);setPassword('');setConfirmation('');
        setAuthFeedback(signedInNotice(input.email));
        await lookAtAccount(token);
      }catch(reason){opened.dispose();if(session.current===opened)session.current=null;throw reason;}
    },true);
  }
  /** Social sign-in leaves for the provider; only the explicit return below creates an access. */
  function startOAuth(provider:AccountOAuthProvider){
    if(!ACCOUNT_ACCESS_RELEASED||!ready||userId)return;
    setAuthSource('google');
    void run(async token=>{
      clearAccess();
      const {createAccountReviewSession}=await import('@/lib/backup/account-session');if(!isCurrent(token))return;
      const opened=createAccountReviewSession({url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY},undefined,oauthPkceOptions(window.sessionStorage));session.current=opened;
      try{
        const url=await startAccountOAuth(opened.client,provider,{projectUrl:import.meta.env.VITE_SUPABASE_URL,storage:window.sessionStorage},()=>isCurrent(token)&&session.current===opened);
        saveRememberChoice(keepConnected,window);// only the boolean survives the provider round trip
        window.location.assign(url);
      }catch(reason){opened.dispose();if(session.current===opened)session.current=null;throw reason;}
    },true);
  }
  /** Same "authenticated access" as an e-mail login; no adoption, transfer or sync starts here. */
  async function finishOAuthReturn(code:string,token:number){
    const keep=takeRememberChoice(window);
    const {createAccountReviewSession}=await import('@/lib/backup/account-session');if(!isCurrent(token))return;
    const opened=createAccountReviewSession({url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY},undefined,oauthPkceOptions(window.sessionStorage));session.current=opened;
    try{
      const result=await completeAccountOAuth(opened.client,code,window.sessionStorage,()=>isCurrent(token)&&session.current===opened);
      const id=result.userId,ids:string[]=[];
      const bindingRaw=window.localStorage.getItem(ACCOUNT_BINDING_KEY);if(bindingRaw)ids.push((await inspectAccountBinding(bindingRaw,window.location.origin)).userId);
      const pendingRaw=window.localStorage.getItem(ACCOUNT_INTENT_KEY);if(pendingRaw)ids.push((await inspectAccountIntent(pendingRaw,window.location.origin)).userId);
      const resolutionRaw=window.localStorage.getItem(ACCOUNT_RESOLUTION_KEY);if(resolutionRaw)ids.push((await inspectAccountResolution(resolutionRaw,window.location.origin)).userId);
      if(ids.some(other=>other!==id))throw new Error('Entre na mesma conta usada nesta tentativa para conferir seu recibo.');
      const {rememberAuthenticatedAccountAccess}=await import('@/lib/backup/account-live-access');
      await rememberAuthenticatedAccountAccess(opened,{userId:id,origin:window.location.origin,project:import.meta.env.VITE_SUPABASE_URL,storage:savedAccess(keep)});
      if(!isCurrent(token)||session.current!==opened)throw new Error('O acesso mudou. Entre novamente.');
      identity.current=id;accessRaw.current=savedAccess().getItem(ACCOUNT_TAB_ACCESS_KEY);setEmail(result.email??'');setUserId(id);setPassword('');setConfirmation('');
      setAuthFeedback(signedInNotice(result.email));
      await lookAtAccount(token);
    }catch(reason){opened.dispose();if(session.current===opened)session.current=null;throw reason;}
  }
  function resend() {
    if(!ACCOUNT_ACCESS_RELEASED||!ready||userId||!validAccountEmail(email))return;
    const address=email;
    setAuthSource('email');
    void run(async token=>{
      clearAccess();
      const {createAccountReviewSession}=await import('@/lib/backup/account-session');if(!isCurrent(token))return;
      const opened=createAccountReviewSession({url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY});session.current=opened;
      try{const message=await resendAccountConfirmation(opened.client,address,window.location.origin,()=>isCurrent(token)&&session.current===opened);if(isCurrent(token))setAuthFeedback(message);}
      finally{opened.dispose();if(session.current===opened)session.current=null;}
    },true);
  }
  /** `byTap`: the main button of the "all set" step is the consent (nothing exists on either side to lose). */
  function startNewJourney(byTap=false) {
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||!ready||blocked||!onStart||!userId||!(newJourneyConsent||byTap)||!(tabs||byTap)||!baseline||baseline.snapshot||pending||binding||resolution)return;
    const opened=session.current,id=identity.current;
    if(!opened||!id)return;
    void run(async token=>{
      const current=()=>isCurrent(token)&&session.current===opened&&identity.current===id;
      const transport=createSupabaseAccountTransport(opened.client,{expectedUserId:id,currentUserId:()=>identity.current,isCurrent:current});
      const {startNewAccountProgress}=await import('@/lib/backup/new-account-progress');
      if(!current())return;
      const result=await startNewAccountProgress({origin:window.location.origin,storage:()=>window.localStorage,locks:navigator.locks,isCurrent:current,otherTabsClosed:tabs||byTap,startConfirmed:newJourneyConsent||byTap,userId:id},transport);
      if(!current())throw new Error('Confira o acesso antes de abrir sua jornada.');
      const {prepareLiveAccountAccess}=await import('@/lib/backup/account-live-access');
      const handoff=await prepareLiveAccountAccess(opened,{userId:id,bindingRaw:result.bindingRaw,origin:window.location.origin,project:import.meta.env.VITE_SUPABASE_URL,storage:savedAccess(),remember:true});
      if(!current()){handoff.dispose();throw new Error('O acesso mudou. Reabra a conferência.');}
      session.current=null;identity.current=null;
      try{onStart(handoff);}catch(reason){handoff.dispose();throw reason;}
    });
  }
  function send(){if(!ACCOUNT_TRANSFER_WRITES_RELEASED||resolution||!copy||!baseline||!userId||!tabs||!allProfiles||pending||blocked)return;void run(async token=>{const result=await beginAccountTransfer(context(token),{baseline,previousCopy:copy,allProfilesConfirmed:allProfiles,userId},transport(token));if(!isCurrent(token))return;setReceipt(result.receipt);await refresh(token);setMessage('Arquivo enviado e recibo conferido. O app ainda não está conectado para sincronizar automaticamente.');});}
  function review(resend=false){if(!ACCOUNT_TRANSFER_WRITES_RELEASED||resolution||!pending||!userId||!tabs||(resend&&!retry)||blocked)return;void run(async token=>{const result=await reviewAccountTransfer(context(token),{raw:pending.raw,retryConfirmed:resend&&retry},transport(token));if(isCurrent(token)){setReceipt(result.receipt);setLocalChanged(result.localChanged);setMessage(result.receipt?'Recibo e arquivo online conferidos. Nenhum dado local foi substituído.':'Ainda não há recibo confirmado. Esta consulta não reenviou o arquivo.');}});}
  function completePendingJourney(){
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||resolution||!pending||!userId||!onStart||!pendingRetryConsent||blocked)return;
    const opened=session.current,id=identity.current,attempt=pending;
    if(!opened||!id)return;
    void run(async token=>{
      const current=()=>isCurrent(token)&&session.current===opened&&identity.current===id&&window.localStorage.getItem(ACCOUNT_INTENT_KEY)===attempt.raw;
      const recoveryContext={origin:window.location.origin,storage:()=>window.localStorage,locks:navigator.locks,otherTabsClosed:true,isCurrent:current};
      const selectedTransport=createSupabaseAccountTransport(opened.client,{expectedUserId:id,currentUserId:()=>identity.current,isCurrent:current});
      setMessage('Conferindo o recibo e concluindo a conexão protegida…');
      const reviewed=await reviewAccountTransfer(recoveryContext,{raw:attempt.raw,retryConfirmed:true},selectedTransport);
      if(!reviewed.receipt)throw new Error('O servidor ainda não confirmou o envio. Preserve este navegador e tente novamente quando a conexão estiver estável.');
      if(reviewed.localChanged)throw new Error('O progresso mudou depois desta tentativa. Abra “Cópias, versões e recuperação” para preservar as duas versões antes de continuar.');
      await finishAccountTransferLocally(recoveryContext,{raw:attempt.raw,localUseConfirmed:true,bindAccountConfirmed:true},selectedTransport);
      if(!current()&&window.localStorage.getItem(ACCOUNT_INTENT_KEY)!==null)throw new Error('A conexão mudou. Reabra a conta antes de continuar.');
      const bindingRaw=window.localStorage.getItem(ACCOUNT_BINDING_KEY);
      if(!bindingRaw)throw new Error('O navegador não confirmou o vínculo da conta. Seu arquivo continua protegido.');
      const {prepareLiveAccountAccess}=await import('@/lib/backup/account-live-access');
      const handoff=await prepareLiveAccountAccess(opened,{userId:id,bindingRaw,origin:window.location.origin,project:import.meta.env.VITE_SUPABASE_URL,storage:savedAccess(),remember:true,email:email.trim()});
      if(!isCurrent(token)||session.current!==opened||identity.current!==id){handoff.dispose();throw new Error('O acesso mudou. Reabra a conta.');}
      session.current=null;identity.current=null;
      try{onStart(handoff);}catch(reason){handoff.dispose();throw reason;}
    });
  }
  function finish(){if(!ACCOUNT_TRANSFER_WRITES_RELEASED||resolution||!pending||!receipt||!userId||!tabs||!localUse||blocked)return;void run(async token=>{await finishAccountTransferLocally(context(token),{raw:pending.raw,localUseConfirmed:localUse,preserveNewerLocalConfirmed:keepNewer,bindAccountConfirmed:saveBinding},transport(token));if(isCurrent(token))window.location.assign('/santuario');});}
  function pause(){if(!ACCOUNT_TRANSFER_WRITES_RELEASED||resolution||!pending||!tabs||!localUse||blocked)return;void run(async token=>{await pauseAccountTransferLocally(context(token),pending.raw,localUse);if(isCurrent(token))window.location.assign('/santuario');});}
  function compareVersions(){
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||!userId||resolution||blocked)return;
    void run(async token=>{setVersions(null);const result=await reviewAccountVersions({origin:window.location.origin,expectedUserId:userId,storage:window.localStorage,isCurrent:context(token).isCurrent,transport:transport(token)});if(isCurrent(token)){setVersions(result);setMessage('Versões conferidas sem substituir ou mesclar dados. Guarde as cópias antes de decidir o próximo passo.');}});
  }
  function startLive(){
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||resolution||!onStart||!binding||pending||!copy||!baseline||!userId||!tabs||!allProfiles||!liveConsent||blocked)return;
    void run(async token=>{
      const captured=context(token),raw=window.localStorage.getItem(ACCOUNT_BINDING_KEY),owned=session.current,id=identity.current;
      if(!raw||!owned||!id||!navigator.locks)throw new Error('Reabra a conferência da conta antes de sincronizar.');
      await verifyPreviousSafetyCopy(copy,baseline,window.localStorage,window.location.origin);
      await reviewAccountBinding(raw,window.location.origin,transport(token),window.localStorage);
      if(!captured.isCurrent())throw new Error('O progresso mudou. Refaça a conferência antes de sincronizar.');
      const {prepareLiveAccountAccess}=await import('@/lib/backup/account-live-access');
      const handoff=await prepareLiveAccountAccess(owned,{userId:id,bindingRaw:raw,origin:window.location.origin,project:import.meta.env.VITE_SUPABASE_URL,storage:savedAccess(),remember:true});
      if(!captured.isCurrent()){handoff.dispose();throw new Error('O progresso mudou. Refaça a conferência.');}
      session.current=null;identity.current=null;
      try{onStart(handoff);}catch(reason){owned.dispose();throw reason;}
    });
  }
  function resolutionContext(token:number){
    const active=session.current,id=identity.current;
    return{origin:window.location.origin,storage:()=>window.localStorage,locks:navigator.locks,otherTabsClosed:tabs,isCurrent:()=>isCurrent(token)&&session.current===active&&identity.current===id};
  }
  function resolutionTransport(token:number){
    if(!session.current||!identity.current)throw new Error('Entre na conta para concluir a escolha.');
    const active=session.current,id=identity.current;
    return createSupabaseAccountTransport(active.client,{expectedUserId:id,currentUserId:()=>identity.current,isCurrent:()=>isCurrent(token)&&session.current===active});
  }
  /** Read-only look at the account right after sign-in: never writes, never adopts, never connects. */
  async function lookAtAccount(token:number,again=false){
    const opened=session.current,id=identity.current;
    if(!opened||!id)return;
    const current=()=>isCurrent(token)&&session.current===opened&&identity.current===id;
    setRemote({kind:'looking'});setVersions(null);setStillLegacy(false);setMessage('');
    try{
      const selected=resolutionTransport(token);
      const found=await selected.readProgress(id);
      if(!current())return;
      const kind=found&&typeof found==='object'&&'kind' in found?found.kind:null;
      if(kind==='snapshot'){
        const reviewed=await reviewAccountVersions({origin:window.location.origin,expectedUserId:id,storage:window.localStorage,isCurrent:current,transport:selected});
        if(!current())return;
        setVersions(reviewed);setRemote({kind:'snapshot'});
      }else if(kind==='legacy'){setRemote({kind:'legacy'});setStillLegacy(again);}
      else if(kind==='empty')setRemote({kind:'empty'});
      else throw new Error('Resposta inesperada da conta.');
    }catch{if(current())setRemote({kind:'error'});}
  }
  function lookAgain(again=false){void run(async token=>{await lookAtAccount(token,again);});}
  function chooseVersion(direction:'local'|'online',copies:{local:string|null;online:string;pending:string|null}){
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||!versions||!tabs||!userId||resolution||blocked)return;
    void run(async token=>{
      const selected=versions;setVersions(null);setLiveConsent(false);
      const result=await resolveAccountVersions(resolutionContext(token),{review:selected,direction,copies,allProfilesConfirmed:true,replacementConfirmed:true},resolutionTransport(token));
      if(isCurrent(token)){if(result.outcome==='resolved')window.location.assign('/santuario');else {await refresh(token);setMessage('A escolha está protegida e aguarda recibo. Nenhuma repetição automática foi feita.');}}
    });
  }
  function recoverResolution(retry:boolean){
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||!resolution||!tabs||!userId||blocked)return;
    void run(async token=>{const result=await resumeAccountResolution(resolutionContext(token),{raw:resolution.raw,recoveryConfirmed:true,retryConfirmed:retry},resolutionTransport(token));if(isCurrent(token)){if(result.outcome==='resolved')window.location.assign('/santuario');else setMessage('Ainda não há recibo. A consulta não repetiu o envio; a escolha e as cópias continuam protegidas.');}});
  }
  function keepResolutionLocal(){
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||!resolution||!tabs||!userId||blocked)return;
    void run(async token=>{await keepLocalAfterResolution(resolutionContext(token),{raw:resolution.raw,localUseConfirmed:true},resolutionTransport(token));if(isCurrent(token))window.location.assign('/?progresso=conta');});
  }
  function connectJourney(receive = false, adoptLegacy = false, emptyByTap = false) {
    if (!ACCOUNT_TRANSFER_WRITES_RELEASED || !ready || busy || blocked || !onStart || !userId || resolution || (receive && (!versions || pending))) return;
    const opened = session.current, id = identity.current;
    if (!opened || !id) return;
    void run(async token => {
      const current = () => isCurrent(token) && session.current === opened && identity.current === id;
      const context = { origin: window.location.origin, storage: () => window.localStorage, locks: navigator.locks, otherTabsClosed: true, isCurrent: current };
      setMessage(receive ? 'Trazendo seu progresso para este aparelho…' : 'Salvando na conta…');
      const selectedTransport = resolutionTransport(token);
      let result: { bindingRaw: string };
      if (pending) result = await resumeAccountConnection(context, { raw: pending.raw, confirmed: true }, selectedTransport);
      else if (receive) result = await receiveReviewedAccountProgress(context, { review: versions!, confirmed: true }, selectedTransport);
      else if (!binding) {
        const remote = await selectedTransport.readProgress(id);
        if (remote && typeof remote === 'object' && 'kind' in remote && remote.kind === 'legacy') {
          if (!adoptLegacy) {
            if (current()) { setLegacyAccount(true); setLegacyConsent(false); setMessage('A conta tem registros de uma versão antiga do app. Confira o aviso antes de continuar.'); }
            return;
          }
          if (!baseline?.snapshot) throw new Error('Este aparelho não tem progresso para salvar. Abra o app no aparelho onde você usava antes.');
          if (!legacyConsent) throw new Error('Marque a caixa para confirmar que os registros antigos ficam guardados.');
          result = await connectCurrentAccountProgress(context, { userId: id, confirmed: true, legacyReplacementConfirmed: true }, selectedTransport);
        } else if (remote && typeof remote === 'object' && 'kind' in remote && remote.kind === 'snapshot') {
          const reviewed = await reviewAccountVersions({origin:window.location.origin,expectedUserId:id,storage:window.localStorage,isCurrent:current,transport:selectedTransport});
          if (baseline?.snapshot) {
            if (current()) { setVersions(reviewed); setMessage('Há progresso neste aparelho e na conta. Escolha qual usar.'); }
            return;
          }
          result = await receiveReviewedAccountProgress(context, { review: reviewed, confirmed: true }, selectedTransport);
        } else {
          if (localJourney.empty && !emptyJourneyConsent && !emptyByTap) {
            if (current()) setMessage('A conta ainda não tem progresso salvo. Marque a caixa para continuar com este aparelho vazio.');
            return;
          }
          result = await connectCurrentAccountProgress(context, { userId: id, confirmed: true }, selectedTransport);
        }
      } else result = await connectCurrentAccountProgress(context, { userId: id, confirmed: true }, selectedTransport);
      if (!current()) throw new Error('O acesso mudou. Confira sua conta antes de continuar.');
      const { prepareLiveAccountAccess } = await import('@/lib/backup/account-live-access');
      const handoff = await prepareLiveAccountAccess(opened, { userId: id, bindingRaw: result.bindingRaw, origin: window.location.origin, project: import.meta.env.VITE_SUPABASE_URL, storage: savedAccess(), remember: true, email: email.trim() });
      if (!current()) { handoff.dispose(); throw new Error('A conexão mudou. Reabra a conta.'); }
      session.current = null; identity.current = null;
      try { onStart(handoff); } catch (reason) { handoff.dispose(); throw reason; }
    });
  }
  const localJourney = summarizeLocalJourney(baseline?.snapshot);
  const hasLocal = !!baseline?.snapshot && !localJourney.empty;
  const remoteJourney = (() => { if (!versions) return null; try { const found = summarizeLocalJourney(JSON.parse(versions.remoteArchive) as ProgressSnapshot); return found.available ? found : null; } catch { return null; } })();
  const showResend=signupSent||authCode==='email_not_confirmed';
  const authErrorBlock=authError?<div id="entry-auth-error" role="alert" className="restore-workspace-error"><p>{authError}</p>{authCode&&<p className="account-error-code">Código para suporte: {authCode}</p>}</div>:null;
  // Which question to ask: derived on every render from what is known, never stored.
  const remoteKind = remote?.kind === 'snapshot' && !versions ? 'error' : remote?.kind ?? 'looking';
  const step: Step = ready && blocked ? 'ajuste' : !ready || !userId ? 'entrada' : (pending || resolution) ? 'metade' : binding ? 'ligado'
    : remoteKind === 'looking' || remoteKind === 'error' ? 'procurando'
    : remoteKind === 'empty' ? (hasLocal ? 'salvar' : 'novo')
    : remoteKind === 'snapshot' ? (hasLocal ? 'escolher' : 'trazer')
    : (hasLocal ? 'antigo-com' : 'antigo-sem');
  const cannotAct = !ACCOUNT_TRANSFER_WRITES_RELEASED || busy || blocked || !onStart;
  const spinner = busy ? <LoaderCircle className="entry-spinner" size={18} aria-hidden="true" /> : null;
  const statusLine = <p className="account-step-status" role="status" aria-live="polite">{busy ? (message || 'Aguarde, não feche esta página…') : message}</p>;
  const failure = (friendly?: string) => error ? <div role="alert" className="restore-workspace-error account-step-error"><p>{friendly ?? error}</p>{friendly && <p className="account-error-code">Detalhe para suporte: {error}</p>}</div> : null;
  const feedback = (friendly?: string) => <>{failure(friendly)}{statusLine}</>;
  const localOnlyLink = <a className="account-text-link" href="/santuario">Usar só neste aparelho por enquanto</a>;
  const profileNote = !localJourney.empty && localJourney.activeEmpty ? <small className="account-step-note">O perfil ativo está vazio, mas há progresso em outros perfis deste aparelho. Tudo é salvo junto.</small> : null;
  const savedOn = dayLabel(versions?.remoteSummary.createdAt);
  const remoteSaved = `${savedOn ? `Salvo em ${savedOn}` : 'Salvo na conta'}${remoteJourney ? `: ${totalsLine(remoteJourney)}` : ''}.`;
  const closedTabs = <label className="restore-workspace-consent"><input type="checkbox" checked={tabs} disabled={busy} onChange={event=>setTabs(event.target.checked)}/>Fechei as outras abas e janelas deste app.</label>;
  const panel = (resolution || versions) ? <AccountResolutionPanel key={resolution?'recover':'choose'} versions={versions??undefined} resolution={resolution?.journal} busy={busy} released={ACCOUNT_TRANSFER_WRITES_RELEASED&&!blocked&&tabs&&!!userId} onChoose={chooseVersion} onRecover={recoverResolution} onKeepLocal={keepResolutionLocal}/> : null;
  const panelInStep = (step === 'metade' && !!resolution) || (step === 'escolher' && choice === 'device');
  const beginFresh = () => { if (!baseline?.snapshot) startNewJourney(true); else connectJourney(false, false, true); };
  function openAdvanced(){setAdvancedOpen(true);setTimeout(()=>advancedRef.current?.scrollIntoView?.({block:'start'}),0);}

  // One small view per step; each returns its title, its lead sentence and its body.
  const stepProcurando = () => ({ title: 'Procurando seu progresso…', lead: signedInNotice(email), body: remoteKind === 'error' ? <>
    <div role="alert" className="restore-workspace-error account-step-error"><p>Não deu para olhar sua conta agora. Nada foi alterado.</p></div>
    <button type="button" disabled={!ready||busy} onClick={()=>lookAgain()}>Tentar de novo</button>
    {localOnlyLink}
  </> : <p className="account-step-wait"><LoaderCircle className="entry-spinner" size={18} aria-hidden="true" />Aguarde um instante.</p> });
  const stepSalvar = () => ({ title: 'Salvar seu progresso na conta', lead: `Encontramos seu progresso neste aparelho: ${totalsLine(localJourney)}. Salve na conta para usar em outros aparelhos.`, body: <>
    {profileNote}
    <p id="account-step-consent" className="account-step-consent">Ao tocar, o progresso deste aparelho e o que você fizer depois ficam salvos na sua conta.</p>
    <button type="button" aria-describedby="account-step-consent" disabled={cannotAct} onClick={()=>connectJourney()}>{spinner}{error ? 'Tentar de novo' : 'Salvar meu progresso na conta'}</button>
    {feedback('Não deu para salvar agora. Seu progresso continua neste aparelho.')}
    {localOnlyLink}
  </> });
  const stepNovo = () => ({ title: 'Tudo pronto', lead: 'Sua conta é nova. Comece agora e o que você fizer fica salvo nela.', body: <>
    <p id="account-step-consent" className="account-step-consent">Ao tocar, sua jornada começa e o que você fizer depois fica salvo na sua conta.</p>
    <button type="button" aria-describedby="account-step-consent" disabled={cannotAct} onClick={beginFresh}>{spinner}{error ? 'Tentar de novo' : 'Começar minha jornada'}</button>
    {feedback('Não deu para começar agora. Seu progresso continua guardado.')}
  </> });
  const stepTrazer = () => ({ title: 'Seu progresso está na conta', lead: remoteSaved, body: <>
    <p className="account-step-who">{signedInNotice(email)} Não é essa conta? <button type="button" className="account-link-button" disabled={!ready||busy} onClick={()=>closeAccess()}>Sair e entrar com outra</button></p>
    <p id="account-step-consent" className="account-step-consent">Este aparelho ainda não tem atividades, então nada se perde. O XP não é somado de novo.</p>
    <button type="button" aria-describedby="account-step-consent" disabled={cannotAct} onClick={()=>connectJourney(true)}>{spinner}{error ? 'Tentar de novo' : 'Trazer meu progresso para este aparelho'}</button>
    {feedback('Não deu para trazer agora. Seu progresso continua guardado na conta.')}
  </> });
  const choiceCard = (value: 'account' | 'device', label: string, when: string, summary: { xp: number; tasks: number; habits: number } | null) => <label key={value} className="account-choice-card" data-selected={choice === value}>
    <input type="radio" name="account-choice" value={value} checked={choice === value} disabled={busy} onChange={()=>{setChoice(value);setReplaceConsent(false);}}/>
    <strong>{label}</strong>{when && <span>{when}</span>}
    {summary && <><span className="account-choice-xp">{summary.xp.toLocaleString('pt-BR',{maximumFractionDigits:3})} XP</span><span>{plural(summary.tasks,'ritual','rituais')} · {plural(summary.habits,'ciclo','ciclos')}</span></>}
  </label>;
  const stepEscolher = () => ({ title: 'Qual progresso você quer usar?', lead: 'Há progresso na conta e neste aparelho. Eles não se juntam: escolha um.', body: <>
    <div role="radiogroup" aria-label="Qual progresso usar" className="account-choice">
      {choiceCard('account', 'Na conta', savedOn ? `Salvo em ${savedOn}` : '', remoteJourney)}
      {choiceCard('device', 'Neste aparelho', '', localJourney)}
    </div>
    {profileNote}
    {choice === 'account' && <>
      <label className="restore-workspace-consent"><input type="checkbox" checked={replaceConsent} disabled={busy} onChange={event=>setReplaceConsent(event.target.checked)}/>Entendo: o progresso deste aparelho será trocado pelo da conta.</label>
      <button type="button" disabled={cannotAct||!replaceConsent} onClick={()=>connectJourney(true)}>{spinner}{error ? 'Tentar de novo' : 'Usar o progresso da conta'}</button>
      <button type="button" className="account-link-button" disabled={busy||!versions?.localArchive} onClick={()=>{if(versions?.localArchive)download(versions.localArchive,'conselho-copia-deste-aparelho');}}>Guardar uma cópia deste aparelho antes</button>
    </>}
    {choice === 'device' && <>
      <ol className="account-numbered">
        <li>Baixe a cópia da conta e a cópia deste aparelho.
          <span className="account-numbered-actions">
            <button type="button" className="restore-workspace-secondary" disabled={busy||!versions} onClick={()=>{if(versions)download(versions.remoteArchive,'conselho-versao-da-conta');}}>Baixar cópia da conta</button>
            <button type="button" className="restore-workspace-secondary" disabled={busy||!versions?.localArchive} onClick={()=>{if(versions?.localArchive)download(versions.localArchive,'conselho-versao-deste-aparelho');}}>Baixar cópia deste aparelho</button>
          </span>
        </li>
        <li>Escolha cada arquivo baixado, no campo certo abaixo.</li>
        <li>Marque as caixas e toque em “Usar o progresso deste aparelho”. O progresso da conta será trocado pelo deste aparelho.</li>
      </ol>
      {closedTabs}
      {panelInStep && panel}
    </>}
    {feedback('Não deu para continuar agora. Seu progresso continua guardado.')}
  </> });
  const stepAntigoSem = () => ({ title: 'Seu progresso está em outro aparelho', lead: 'Sua conta tem progresso de uma versão antiga do app. Ele está guardado; nada foi apagado. Para trazê-lo, use o aparelho onde você usava o app.', body: <>
    <div className="account-where">
      <h3>No aparelho onde você usava:</h3>
      <ol className="account-numbered">
        <li>Abra o app no mesmo navegador e no mesmo endereço de antes.</li>
        <li>Entre com {email.trim() || 'esta mesma conta'}.</li>
        <li>Toque em “Salvar meu progresso na conta”.</li>
        <li>Volte aqui e toque no botão abaixo.</li>
      </ol>
    </div>
    <button type="button" disabled={!ready||busy} onClick={()=>lookAgain(true)}>{spinner}Já fiz isso, procurar de novo</button>
    {stillLegacy && <p role="status" className="account-step-note">Ainda não encontramos. Confira se entrou com a mesma conta no outro aparelho.</p>}
    {feedback()}
    <a className="account-outline-link" href="/santuario">Usar só neste aparelho por enquanto</a>
    <small className="account-step-note">O que você fizer aqui fica só neste aparelho. Depois, você escolhe qual progresso usar.</small>
    <a className="account-text-link" href="/?progresso=restaurar">Tenho um arquivo de cópia</a>
  </> });
  const stepAntigoCom = () => ({ title: 'Atualizar sua conta com este aparelho', lead: `Sua conta tem registros de uma versão antiga do app. Este aparelho tem seu progresso atual: ${totalsLine(localJourney)}. Os registros antigos ficam guardados à parte, sem apagar, e a conta passa a usar o progresso deste aparelho. Os números não se somam.`, body: <>
    {profileNote}
    <label className="restore-workspace-consent"><input type="checkbox" checked={legacyConsent} disabled={busy} onChange={event=>setLegacyConsent(event.target.checked)}/>Entendo: a conta passa a usar o progresso deste aparelho e os registros antigos ficam guardados.</label>
    <button type="button" disabled={cannotAct||!legacyConsent} onClick={()=>connectJourney(false,true)}>{spinner}{error ? 'Tentar de novo' : 'Salvar meu progresso na conta'}</button>
    {feedback('Não deu para salvar agora. Seu progresso continua neste aparelho.')}
    <a className="account-text-link" href="/santuario">Agora não</a>
  </> });
  const stepLigado = () => ({ title: 'Este aparelho já está ligado à sua conta', lead: 'Seu progresso já está ligado à sua conta. Toque abaixo para continuar.', body: <>
    <button type="button" disabled={cannotAct} onClick={()=>connectJourney()}>{spinner}Abrir o app</button>
    {feedback('Não deu para abrir agora. Seu progresso continua guardado.')}
  </> });
  const stepMetade = () => resolution ? { title: 'Terminar o que ficou pela metade', lead: 'Uma escolha de progresso foi interrompida. Seu progresso está protegido.', body: <>
    {closedTabs}
    {panelInStep && panel}
    {feedback('Não deu para terminar agora. Seu progresso continua protegido.')}
  </> } : { title: 'Terminar o que ficou pela metade', lead: 'Uma gravação na conta foi interrompida. Seu progresso está protegido.', body: <>
    <button type="button" disabled={cannotAct} onClick={()=>connectJourney()}>{spinner}Verificar e terminar</button>
    {failure('Não deu para terminar agora. Seu progresso continua protegido.')}
    {error && <>
      <label className="restore-workspace-consent"><input type="checkbox" checked={pendingRetryConsent} disabled={busy} onChange={event=>setPendingRetryConsent(event.target.checked)}/>Fechei as outras abas e autorizo gravar de novo exatamente esta tentativa, se a conta confirmar que ela não chegou.</label>
      <button type="button" className="restore-workspace-secondary" disabled={cannotAct||!pendingRetryConsent} onClick={completePendingJourney}>Gravar de novo</button>
    </>}
    {statusLine}
  </> };
  const stepAjuste = () => ({ title: blockKind === 'progress' ? 'Alguns dados deste aparelho precisam de ajuste' : blockKind === 'restore' ? 'Uma importação ficou pela metade' : 'Reconectar este aparelho', lead: 'Nada do seu progresso é apagado.', body: blockKind === 'progress' ? <>
    {progressRepair ? <>
      <p>{progressRepair.xpFields} {progressRepair.xpFields===1?'campo antigo de XP será completado':'campos antigos de XP serão completados'}, sem mudar os saldos válidos.</p>
      {progressRepair.legacyExperienceMoved&&<p>A experiência do formato antigo fica no elemento Terra, como o app já fazia.</p>}
      {progressRepair.orphanActions.map(action=><p key={action.path}>“{action.title}” será mantida como {action.kind} independente, com o mesmo ID, estado e histórico.</p>)}
      <p>Antes de mexer, o app guarda uma cópia exata e só conclui se tudo passar na conferência.</p>
      <label className="restore-workspace-consent"><input type="checkbox" checked={repairConsent} disabled={busy} onChange={event=>setRepairConsent(event.target.checked)}/>Fechei as outras abas e janelas deste app.</label>
      <button type="button" disabled={busy||!repairConsent} onClick={repairStoredProgress}>Ajustar e continuar</button>
    </> : <p className="restore-workspace-error">{progressRepairError || 'Estes campos precisam de revisão manual. Nada foi alterado.'}</p>}
    <details className="account-support"><summary>Detalhes para suporte</summary>
      {error && <p>{error}</p>}
      <ul>{progressIssues.slice(0,6).map((issue,index)=><li key={`${issue.path}-${index}`}><code>{issue.path}</code>: {issue.message}</li>)}</ul>
      {progressIssues.length>6&&<small>Há mais {progressIssues.length-6} ocorrências do mesmo tipo.</small>}
    </details>
    {statusLine}
  </> : blockKind === 'restore' ? <>
    <p>Uma importação ficou pela metade neste navegador. Termine-a antes de continuar.</p>
    {failure()}
    <a className="account-outline-link" href="/?progresso=restaurar">Terminar importação</a>
    {statusLine}
  </> : <>
    <p>Isto remove só os vínculos antigos deste aparelho. Atividades, XP e treinos não são apagados.</p>
    {failure()}
    <button type="button" disabled={busy||!repairable} onClick={resetLocalConnection}>Reconectar este aparelho</button>
    {statusLine}
  </> });
  const views: Record<Exclude<Step, 'entrada'>, () => { title: string; lead: string; body: ReactNode }> = { procurando: stepProcurando, ajuste: stepAjuste, metade: stepMetade, ligado: stepLigado, salvar: stepSalvar, novo: stepNovo, trazer: stepTrazer, escolher: stepEscolher, 'antigo-sem': stepAntigoSem, 'antigo-com': stepAntigoCom };
  const view = step === 'entrada' ? null : views[step]();
  const signedView = userId ? view : null;
  const entryTitle = accessMode === 'signup' ? 'Comece sua jornada' : 'Sua jornada continua';
  const entryLead = accessMode === 'signup' ? 'Crie sua conta para ver seu progresso em qualquer aparelho.' : 'Entre para ver seu progresso em qualquer aparelho.';
  return <div className="entry-shell">
    <a className="entry-skip" href="#account-workspace-title">Ir para o acesso da conta</a>
    <div className="entry-masthead"><EntryBrand /><a className="entry-top-link" href="/santuario" hidden={!userId}><ArrowLeft size={16} aria-hidden="true" />Voltar ao app</a></div>
    <div className="entry-layout">
    <EntryArtwork />
    <main className="restore-workspace account-workspace entry-main" aria-labelledby="account-workspace-title">
    {(pending || resolution) && <a className="restore-workspace-back entry-context" href="/?progresso=conta" onClick={event=>{event.preventDefault();window.location.reload();}}><ArrowLeft size={18} aria-hidden="true" />Recarregar conferência</a>}
    <header><h1 id="account-workspace-title" ref={heading} tabIndex={-1}>{signedView ? signedView.title : entryTitle}</h1></header>
    <p>{signedView ? signedView.lead : entryLead}</p>
    {!ACCOUNT_ACCESS_RELEASED&&<p className="account-workspace-release" role="status">O acesso à conta ainda não está liberado nesta versão.</p>}
    {!ACCOUNT_TRANSFER_WRITES_RELEASED&&<section aria-labelledby="account-mobile"><h2 id="account-mobile">Seu progresso no celular</h2><p>Você já pode importar sua cópia completa neste aparelho, incluindo atividades, histórico e XP. Cadastro e acesso à conta são separados: envio e sincronização ainda não liberados.</p><a className="restore-workspace-back" href="/?progresso=restaurar">Importar minha cópia neste aparelho</a><p>Para validar sua conta, crie o acesso abaixo, confirme o e-mail e entre novamente. Entrar não envia nem substitui sua jornada.</p></section>}
    <section className="entry-access-card ds-pane" aria-label="Acesso à conta" hidden={!!userId}>
      {authFeedback&&<p className="entry-auth-feedback" role="status" aria-live="polite"><MailCheck size={19} aria-hidden="true" /><span>{authFeedback}</span></p>}
      <div className="account-entry" hidden={!!userId}>
        <div className="account-oauth" role="group" aria-label="Entrar com Google">
          <button type="button" className="restore-workspace-secondary account-oauth-button" disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy||!!userId} onClick={()=>startOAuth('google')}><GoogleIcon/>{ACCOUNT_OAUTH_LABELS.google}</button>
        </div>
        {authSource!=='email'&&authErrorBlock}
        <div className="account-keep">
          <label className="restore-workspace-consent account-keep-connected"><input type="checkbox" name="keep-connected" checked={keepConnected} disabled={!ready||busy||!!userId} onChange={event=>setKeepConnected(event.target.checked)}/>Manter conectado neste aparelho</label>
          <small className="account-keep-connected-note">Desmarque se o aparelho não for seu.</small>
        </div>
        <p className="account-oauth-divider"><span>ou</span></p>
        <button type="button" className="restore-workspace-secondary account-email-toggle" aria-expanded={emailOpen} aria-controls="account-email-panel" disabled={busy||!!userId} onClick={toggleEmail}>Entrar com e-mail</button>
        <div id="account-email-panel" className="account-reveal" data-open={emailOpen}><div className="account-reveal-inner"><div>
          <form aria-busy={busy} onSubmit={event=>{event.preventDefault();authenticate(accessMode);}}>
        <label htmlFor="entry-email">E-mail<input id="entry-email" ref={emailField} enterKeyHint="next" type="email" name="account-email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="voce@exemplo.com" required value={email} aria-describedby={authError ? 'entry-auth-error' : undefined} disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy||!!userId} onChange={event=>setEmail(event.target.value)}/></label>
        <div><label htmlFor="entry-password">Senha</label><div className="entry-password"><input id="entry-password" enterKeyHint={accessMode==='signup'?'next':'go'} autoCapitalize="none" autoCorrect="off" spellCheck={false} type={showPassword ? 'text' : 'password'} name="account-password" autoComplete={accessMode==='signup'?'new-password':'current-password'} required minLength={accessMode==='signup'?8:undefined} value={password} aria-describedby={accessMode==='signup'?'entry-password-help':undefined} disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy||!!userId} onChange={event=>setPassword(event.target.value)}/><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} disabled={busy} onClick={()=>setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button></div></div>
        {accessMode==='signup'&&<>
          <div><label htmlFor="entry-confirmation">Confirme a senha</label><div className="entry-password"><input id="entry-confirmation" enterKeyHint="done" autoCapitalize="none" autoCorrect="off" spellCheck={false} type={showConfirmation ? 'text' : 'password'} name="account-password-confirmation" autoComplete="new-password" required minLength={8} value={confirmation} disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy} onChange={event=>setConfirmation(event.target.value)}/><button type="button" aria-label={showConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'} disabled={busy} onClick={()=>setShowConfirmation(!showConfirmation)}>{showConfirmation ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button></div></div>
          <small id="entry-password-help">Use pelo menos 8 caracteres. Você pode colar uma senha do seu gerenciador.</small>{confirmation&&confirmation!==password&&<small role="status">As senhas ainda não coincidem.</small>}
        </>}
        {accessMode==='login'&&<a className="restore-workspace-back entry-recovery-link" href="/?progresso=recuperar">Esqueci minha senha</a>}
        <button type="submit" disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy||!!userId||!validAccountAccess(accessMode,email,password,confirmation)}>{busy&&<LoaderCircle className="entry-spinner" size={18} aria-hidden="true" />}{!ready ? 'Preparando acesso…' : busy ? 'Aguarde…' : accessMode==='signup'?'Criar minha conta':'Entrar'}</button>
      </form>
          {showResend&&<div className="account-resend"><button type="button" className="restore-workspace-secondary" disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy||!!userId||!validAccountEmail(email)} onClick={resend}>Reenviar confirmação de e-mail</button><small>Confira também a caixa de spam.</small></div>}
          {authSource==='email'&&authErrorBlock}
        </div></div></div>
        {accessMode==='login'?<p className="account-switch">Não tem conta? <button type="button" className="account-link-button" disabled={!ready||busy} onClick={()=>switchMode('signup')}>Criar conta com e-mail</button></p>:<p className="account-switch">Já tem conta? <button type="button" className="account-link-button" disabled={!ready||busy} onClick={()=>switchMode('login')}>Entrar</button></p>}
      </div>
    </section>
    {view && <section key={step} className="account-step ds-pane" data-step={step} aria-labelledby={userId ? undefined : 'account-step-title'} aria-label={userId ? view.title : undefined}>
      {!userId && <h2 id="account-step-title">{view.title}</h2>}
      {view.body}
      {userId && <div className="account-step-footer">
        <button type="button" className="account-link-button" hidden={blocked} onClick={openAdvanced}>Opções avançadas</button>
        <button type="button" className="account-link-button" disabled={!ready||busy} onClick={()=>closeAccess()}>Sair desta conta</button>
      </div>}
    </section>}
    <details id="account-advanced" ref={advancedRef} className="account-advanced" open={advancedOpen} onToggle={event=>setAdvancedOpen(event.currentTarget.open)} hidden={blocked}><summary>Cópias, versões e recuperação</summary>
    <div hidden={!ACCOUNT_TRANSFER_WRITES_RELEASED&&!pending&&!resolution}>
    {ready&&baseline&&!baseline.snapshot&&!pending&&!binding&&!resolution&&<section aria-labelledby="account-new"><h2 id="account-new">Sua primeira jornada</h2>
      <p>Este aparelho ainda não tem progresso. Se você já usa o app em outro dispositivo, receba a jornada salva. Para começar do zero, vamos conferir se sua conta também está vazia.</p>
      <label className="restore-workspace-consent"><input type="checkbox" checked={tabs} disabled={busy} onChange={event=>setTabs(event.target.checked)}/>Fechei as outras abas e janelas deste app.</label>
      <label className="restore-workspace-consent"><input type="checkbox" checked={newJourneyConsent} disabled={busy} onChange={event=>setNewJourneyConsent(event.target.checked)}/>Quero criar uma jornada vazia nesta conta e salvar minhas próximas alterações enquanto uso o app.</label>
      <button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||!userId||!onStart||busy||blocked||!tabs||!newJourneyConsent} onClick={()=>startNewJourney()}>Começar minha jornada</button>
    </section>}
    {(!baseline||!!baseline.snapshot||pending||resolution)&&<section aria-labelledby="account-local"><h2 id="account-local">Sua cópia local</h2>
      {resolution?<p>Uma escolha aguarda conclusão. As versões anterior e escolhida permanecem protegidas no registro de recuperação.</p>:pending?<><p>Uma tentativa aguarda conferência. O arquivo original continua protegido; consultar o recibo não repete o envio.</p><button type="button" disabled={busy||blocked} onClick={()=>{if(pending)download(pending.intent.archive,'conselho-arquivo-da-tentativa');}}><Download size={20} aria-hidden="true" />Guardar arquivo desta tentativa</button></>:<>
        <p>Todos os perfis, atividades, XP e Treinos entram no arquivo. Guarde a cópia e confira o arquivo salvo antes de enviar.</p>
        <button type="button" disabled={busy||blocked||!baseline?.snapshot} onClick={safety}><Download size={20} aria-hidden="true" />Baixar cópia antes do envio</button>
        <button type="button" className="restore-workspace-secondary" disabled={busy||blocked||!baseline?.snapshot} onClick={()=>file.current?.click()}>Conferir cópia salva</button>
        <input ref={file} type="file" name="account-safety-copy" hidden accept="application/json,.json" aria-label="Cópia local salva antes do envio" onChange={event=>{const selected=event.target.files?.[0];event.target.value='';if(selected)select(selected);}}/>
      </>}
    </section>}
    {binding&&<p className="account-workspace-release">Vínculo guardado em {new Date(binding.createdAt).toLocaleString('pt-BR')}. Entre na mesma conta para conferir outro envio. Edições posteriores continuam neste navegador até confirmação de um novo envio; não há sincronização automática.</p>}
    {!resolution&&!pending&&!binding&&<section><h2>Já tem progresso em outra conta ou dispositivo?</h2><p>Você pode entrar para conferir e receber o arquivo online. O recebimento exige cópias salvas e confirmação de substituição.</p><button type="button" disabled={busy||blocked||!ACCOUNT_TRANSFER_WRITES_RELEASED} onClick={()=>setReceiveMode(true)}>Quero receber progresso de uma conta</button></section>}
    {!resolution&&(binding||pending||receiveMode)&&<section aria-labelledby="account-versions"><h2 id="account-versions">Confira as versões</h2>
      <p>Compare o que está neste navegador com o arquivo online. Esta ação não escolhe nem substitui uma versão.</p>
      <button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||busy||blocked||!userId} onClick={compareVersions}>Comparar versão local e online</button>
      {versions&&<><dl><dt>Rituais locais / online</dt><dd>{versions.localSummary?.tasks??'Sem arquivo'} / {versions.remoteSummary.tasks}</dd><dt>Ciclos locais / online</dt><dd>{versions.localSummary?.habits??'Sem arquivo'} / {versions.remoteSummary.habits}</dd><dt>Sessões de treino locais / online</dt><dd>{versions.localSummary?.sessions??'Sem arquivo'} / {versions.remoteSummary.sessions}</dd></dl>
        {versions.comparison?.accounts.map(profile=><details key={profile.id}><summary>{profile.name} — diferenças detalhadas</summary>
          <p>Valores deste navegador / valores do arquivo online.</p>
          <dl>{profile.xp.map(xp=><div key={xp.label}><dt>XP {xp.label}</dt><dd>{xp.before??'Sem registro'} / {xp.after??'Sem registro'}</dd></div>)}</dl>
          <ul>{profile.rows.filter(row=>row.added||row.removed||row.changed).map(row=><li key={row.label}>{row.label}: {row.before} / {row.after}; {row.added} novos, {row.removed} ausentes, {row.changed} alterados no arquivo online.</li>)}</ul>
        </details>)}
        <p>Quantidades iguais não garantem conteúdo igual. As cópias completas preservam IDs, histórico e XP; comparar não soma recompensas.</p>
        {versions.localArchive&&<button type="button" onClick={()=>download(versions.localArchive!,'conselho-versao-local')}>Guardar versão local</button>}
        <button type="button" onClick={()=>download(versions.remoteArchive,'conselho-versao-online')}>Guardar versão online</button>
        {versions.pendingArchive&&<button type="button" onClick={()=>download(versions.pendingArchive!,'conselho-tentativa-pendente')}>Guardar tentativa pendente</button>}
        <p>Confira os arquivos salvos antes de escolher. Nenhuma versão será substituída só por comparar ou baixar.</p><button type="button" className="restore-workspace-secondary" disabled={busy} onClick={()=>{setVersions(null);setAllProfiles(false);setLiveConsent(false);}}>Fechar comparação</button></>}
    </section>}
    {(!!baseline?.snapshot||pending||resolution||versions)&&<section aria-labelledby="account-confirm"><h2 id="account-confirm">Confirme antes de continuar</h2>
      <label className="restore-workspace-consent"><input type="checkbox" checked={tabs} disabled={busy} onChange={event=>setTabs(event.target.checked)}/>Fechei as outras abas e janelas deste app.</label>
      {!versions&&!pending&&!resolution?<><label className="restore-workspace-consent"><input type="checkbox" checked={allProfiles} disabled={busy} onChange={event=>setAllProfiles(event.target.checked)}/>Confirmo enviar o arquivo conferido de todos os perfis locais. {binding?'A atualização só será enviada se a versão online ainda corresponder ao vínculo salvo.':'Esta etapa aceita apenas conta sem progresso online anterior.'}</label><button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||busy||blocked||!copy||!userId||!tabs||!allProfiles} onClick={send}>Enviar cópia conferida</button></>:!versions&&pending&&!resolution?<>
        <button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||busy||blocked||!userId||!tabs} onClick={()=>review()}>Conferir recibo sem reenviar</button>
        {!receipt&&<><label className="restore-workspace-consent"><input type="checkbox" checked={retry} disabled={busy} onChange={event=>setRetry(event.target.checked)}/>Autorizo reenviar exatamente o arquivo desta tentativa se não houver recibo confirmado.</label><button type="button" className="restore-workspace-secondary" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||busy||blocked||!userId||!tabs||!retry} onClick={()=>review(true)}>Repetir tentativa conferida</button></>}
        {!binding&&receipt&&<label className="restore-workspace-consent"><input type="checkbox" checked={saveBinding} disabled={busy} onChange={event=>setSaveBinding(event.target.checked)}/>Guardar o vínculo desta conta para próximos envios. Isso não ativa sincronização automática.</label>}
        {receipt&&<p>Arquivo online e recibo conferidos em {new Date(receipt.createdAt).toLocaleString('pt-BR')}. Nenhum XP foi somado novamente.</p>}
        {localChanged&&<label className="restore-workspace-consent"><input type="checkbox" checked={keepNewer} disabled={busy} onChange={event=>setKeepNewer(event.target.checked)}/>Entendo que há edições posteriores ao arquivo desta tentativa. Elas devem continuar preservadas somente neste navegador.</label>}
        <label className="restore-workspace-consent"><input type="checkbox" checked={localUse} disabled={busy} onChange={event=>setLocalUse(event.target.checked)}/>Quero continuar usando o progresso local, sem ativar sincronização automática.</label>
        <button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||busy||blocked||!receipt||!userId||!tabs||!localUse||(localChanged&&!keepNewer)} onClick={finish}>Encerrar conferência e continuar localmente</button>
        <button type="button" className="restore-workspace-secondary" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||busy||blocked||!tabs||!localUse} onClick={pause}>Pausar conferência e usar o app localmente</button>
      </>:null}
    </section>}
    {!panelInStep&&panel}
    {binding&&!pending&&!resolution&&!versions&&<section aria-labelledby="account-live"><h2 id="account-live">Sincronizar durante o uso</h2><p>Com as outras abas fechadas, o app envia alterações de todos os perfis nesta sessão. Cada envio precisa de recibo; conflitos pausam a sincronização. O acesso fica salvo conforme a opção “Manter conectado neste aparelho” escolhida ao entrar.</p>
      <label className="restore-workspace-consent"><input type="checkbox" checked={liveConsent} disabled={busy} onChange={event=>setLiveConsent(event.target.checked)}/>Autorizo enviar minhas alterações de todos os perfis enquanto uso o app nesta sessão.</label>
      <button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||busy||blocked||!onStart||!copy||!userId||!tabs||!allProfiles||!liveConsent} onClick={startLive}>Sincronizar enquanto uso o app</button>
    </section>}
    </div>
    </details>
    {!view && <><p role="status" aria-live="polite">{busy?'Aguarde, não feche esta página…':message}</p>{error&&<p role="alert" className="restore-workspace-error">{error}</p>}</>}
  </main></div>
    <footer className="entry-footer"><a href="/privacidade.html">Privacidade</a></footer>
  </div>;
}
