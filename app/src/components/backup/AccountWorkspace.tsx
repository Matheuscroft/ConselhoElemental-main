import { EntryArtwork, EntryBrand } from '@/components/entry/EntryVisuals';
import { connectCurrentAccountProgress, receiveReviewedAccountProgress, resumeAccountConnection } from '@/lib/backup/connect-account-progress';
import { CloudUpload, CloudDownload, UserRoundCheck, Sparkles } from 'lucide-react';
import './account-journey.css';
import { ACCOUNT_RESOLUTION_KEY } from '@/lib/backup/account-resolution-key';
import { accessAccount, resendAccountConfirmation, validAccountAccess, validAccountEmail, type AccountAccessMode } from '@/lib/backup/account-access';
import type { AccountReturnNotice } from '@/lib/backup/account-return';
import { inspectAccountResolution, resolveAccountVersions, resumeAccountResolution, keepLocalAfterResolution, type AccountResolution } from '@/lib/backup/account-resolution';
import { AccountResolutionPanel } from './AccountResolutionPanel';
import { reviewAccountVersions } from '@/lib/backup/account-conflict';
import { reviewAccountBinding } from '@/lib/backup/account-binding';
import type { LiveAccountSession } from '@/lib/backup/account-live-sync';
import { ACCOUNT_BINDING_KEY, inspectAccountBinding, type AccountBinding } from '@/lib/backup/account-binding';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, ShieldCheck, Eye, EyeOff, LoaderCircle, MailCheck } from 'lucide-react';
import { createWorkspaceSafetyCopy, readWorkspaceBaseline, type WorkspaceBaseline } from '@/lib/backup/workspace-preview';
import { verifyPreviousSafetyCopy } from '@/lib/backup/restore-confirmation';
import { MAX_BACKUP_BYTES, STORE_KEYS } from '@/lib/backup/progress-backup';
import { ACCOUNT_INTENT_KEY, accountBaselineDigest, inspectAccountIntent, type AccountIntent } from '@/lib/backup/account-intent';
import { createSupabaseAccountTransport, type AccountCommitReceipt } from '@/lib/backup/account-transport';
import { beginAccountTransfer, reviewAccountTransfer, finishAccountTransferLocally, pauseAccountTransferLocally } from '@/lib/backup/account-transfer';
import { ACCOUNT_TRANSFER_WRITES_RELEASED } from '@/lib/backup/account-release';
import { ACCOUNT_ACCESS_RELEASED } from '@/lib/backup/account-access-release';
import { RESTORE_JOURNAL_KEY } from '@/lib/backup/restore-journal';
import { LOCAL_PROGRESS_MODE_KEY } from '@/lib/backup/progress-mode';
import { ACCOUNT_TAB_ACCESS_KEY } from '@/lib/backup/account-resume-entry';
import { StoredProgressAuditError } from '@/lib/backup/stored-progress';
import type { ProgressIssue } from '@/lib/backup/critical-progress';
import { applyStoredProgressRepair, planStoredProgressRepair, settleStoredProgressRepair, STORED_PROGRESS_REPAIR_KEY, type StoredProgressRepairPlan, type StoredProgressRepairSummary } from '@/lib/backup/stored-progress-repair';
type Session = ReturnType<typeof import('@/lib/backup/account-session').createAccountReviewSession>;

export function AccountWorkspace({ onStart, notice = 'none' }: { onStart?: (session: LiveAccountSession) => void; notice?: AccountReturnNotice } = {}) {
  const [accessMode,setAccessMode]=useState<AccountAccessMode>(new URLSearchParams(window.location.search ?? '').get('modo') === 'cadastro' || window.location.pathname === '/cadastro' ? 'signup' : 'login'),[confirmation,setConfirmation]=useState('');
  const [authFeedback,setAuthFeedback]=useState(notice==='returned'?'O link foi aberto e suas credenciais foram removidas do endereço. Entre para validar o acesso.':notice==='invalid'?'O link não pôde ser confirmado aqui. Entre ou solicite outra confirmação.':''),[authError,setAuthError]=useState('');
  const [receiveMode,setReceiveMode]=useState(false);
  const [resolution,setResolution]=useState<{raw:string;journal:Readonly<AccountResolution>}|null>(null);
  const [liveConsent,setLiveConsent]=useState(false),[rememberAccess,setRememberAccess]=useState(false);
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
  const [legacyAccount,setLegacyAccount]=useState(false),[legacyConsent,setLegacyConsent]=useState(false);
  const [ready,setReady]=useState(false);
  const [newJourneyConsent,setNewJourneyConsent]=useState(false);
  const generation=useRef(0),job=useRef<number|null>(null),alive=useRef(true),session=useRef<Session|null>(null),identity=useRef<string|null>(null),file=useRef<HTMLInputElement>(null),heading=useRef<HTMLHeadingElement>(null),repairPlan=useRef<StoredProgressRepairPlan|null>(null);
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
    void refresh(token).catch(reason=>{if(ref.current===token)markBlocked(reason);});
    const changed=(event:StorageEvent)=>{
      if(event.key!==null&&![STORE_KEYS.core,STORE_KEYS.fitness,ACCOUNT_INTENT_KEY,ACCOUNT_BINDING_KEY,ACCOUNT_RESOLUTION_KEY,RESTORE_JOURNAL_KEY,STORED_PROGRESS_REPAIR_KEY,LOCAL_PROGRESS_MODE_KEY].includes(event.key))return;
      const next=++ref.current;job.current=null;setReady(false);setBusy(false);setCopy(null);setReceipt(null);setTabs(false);setAllProfiles(false);setLocalUse(false);setRetry(false);setKeepNewer(false);setSaveBinding(false);setLiveConsent(false);setRememberAccess(false);setNewJourneyConsent(false);setLegacyAccount(false);setLegacyConsent(false);setVersions(null);setMessage('O progresso mudou. Refaça a conferência.');
      void refresh(next).catch(reason=>{if(ref.current===next)markBlocked(reason);});
    };
    window.addEventListener('storage',changed);
    return()=>{ref.current++;alive.current=false;session.current?.dispose();session.current=null;identity.current=null;window.removeEventListener('storage',changed);};
  // The isolated document owns this one subscription; callbacks bind generations.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  async function run(action:(token:number)=>Promise<void>,access=false) {
    if(!ready||job.current!==null)return;
    const token=++generation.current;job.current=token;setBusy(true);setError('');
    try{await action(token);}catch(reason){if(isCurrent(token)){(access?setAuthError:setError)(reason instanceof Error?reason.message:'Não foi possível concluir. Preserve sua cópia local.');try{await refresh(token);}catch(refreshReason){markBlocked(refreshReason);}}}
    finally{if(job.current===token){job.current=null;if(alive.current)setBusy(false);}}
  }
  function download(text:string,label:string){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`${label}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;try{document.body.append(a);a.click();}finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}}
  function safety(){void run(async token=>{const saved=await createWorkspaceSafetyCopy(window.localStorage,window.location.origin);if(!isCurrent(token))return;setBaseline(saved.baseline);setCopy(null);setAllProfiles(false);setLocalUse(false);setLiveConsent(false);setRememberAccess(false);setVersions(null);download(saved.text,'conselho-antes-do-envio');setMessage('Download solicitado. Selecione o arquivo salvo para conferir antes de enviar.');});}
  function select(selected:File){void run(async token=>{setCopy(null);setAllProfiles(false);setLocalUse(false);setLiveConsent(false);setRememberAccess(false);setVersions(null);if(!baseline)throw new Error('Recarregue a conferência antes de escolher a cópia.');if(selected.size>MAX_BACKUP_BYTES)throw new Error('Escolha uma cópia de até 20 MB.');const text=await selected.text();if(!isCurrent(token))return;await verifyPreviousSafetyCopy(text,baseline,window.localStorage,window.location.origin);if(isCurrent(token)){setCopy(text);setMessage('Arquivo salvo corresponde ao progresso local conferido.');}});}
  function context(token:number){const captured=pair(),bound=window.localStorage.getItem(ACCOUNT_BINDING_KEY);return{origin:window.location.origin,storage:()=>window.localStorage,locks:navigator.locks,otherTabsClosed:tabs,isCurrent:()=>isCurrent(token)&&pair()===captured&&window.localStorage.getItem(ACCOUNT_BINDING_KEY)===bound};}
  function transport(token:number){if(!session.current||!identity.current)throw new Error('Entre na conta de destino para conferir.');const captured=pair(),currentSession=session.current;return createSupabaseAccountTransport(currentSession.client,{expectedUserId:identity.current,currentUserId:()=>identity.current,isCurrent:()=>isCurrent(token)&&session.current===currentSession&&pair()===captured});}
  function clearAccess() {
    setNewJourneyConsent(false);setLegacyAccount(false);setLegacyConsent(false);
    session.current?.dispose();session.current=null;identity.current=null;setUserId(null);setPassword('');setConfirmation('');setVersions(null);setReceipt(null);setTabs(false);setLiveConsent(false);setRememberAccess(false);setAllProfiles(false);setLocalUse(false);setRetry(false);setKeepNewer(false);setSaveBinding(false);setAuthFeedback('');setAuthError('');
  }
  function changeAccess(mode:AccountAccessMode) {
    if(!ready||busy||job.current!==null||userId)return;
    generation.current++;clearAccess();setAccessMode(mode);setShowPassword(false);setShowConfirmation(false);setError('');setMessage('');
    window.history?.replaceState(null, '', mode === 'signup' ? '/auth?modo=cadastro' : '/auth');
  }
  function closeAccess() {
    if(!ready||busy||job.current!==null)return;
    generation.current++;clearAccess();setAuthFeedback('Acesso encerrado nesta conferência. O progresso local e as tentativas continuam preservados.');
  }
  function resetLocalConnection() {
    if(!ready||busy||!repairable)return;
    void run(async token=>{
      if(window.localStorage.getItem(RESTORE_JOURNAL_KEY)!==null)throw new Error('Conclua a recuperação pendente antes de reiniciar a conexão.');
      for(const key of [ACCOUNT_BINDING_KEY,ACCOUNT_INTENT_KEY,ACCOUNT_RESOLUTION_KEY,LOCAL_PROGRESS_MODE_KEY])window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(ACCOUNT_TAB_ACCESS_KEY);
      if([ACCOUNT_BINDING_KEY,ACCOUNT_INTENT_KEY,ACCOUNT_RESOLUTION_KEY,LOCAL_PROGRESS_MODE_KEY].some(key=>window.localStorage.getItem(key)!==null)||window.sessionStorage.getItem(ACCOUNT_TAB_ACCESS_KEY)!==null)throw new Error('O navegador não confirmou a reinicialização. Seu progresso não foi alterado.');
      setBinding(null);setPending(null);setResolution(null);setVersions(null);setReceipt(null);setBlocked(false);setRepairable(false);setBlockKind(null);setProgressIssues([]);
      await refresh(token);
      if(isCurrent(token))setMessage('Conexão reiniciada. Entre e use o botão principal para salvar a jornada deste aparelho na conta.');
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
    const input={mode:kind,email,password,confirmation,origin:window.location.origin};
    void run(async token=>{
      clearAccess();
      const {createAccountReviewSession}=await import('@/lib/backup/account-session');if(!isCurrent(token))return;
      const opened=createAccountReviewSession({url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY});session.current=opened;
      try {
        const result=await accessAccount(opened.client,input,()=>isCurrent(token)&&session.current===opened);
        if(result.kind==='confirmation'){opened.dispose();session.current=null;setAccessMode('login');window.history?.replaceState(null, '', '/auth');setAuthFeedback(result.message);return;}
        const id=result.userId;
        if((pending&&pending.intent.userId!==id)||(binding&&binding.userId!==id)||(resolution&&resolution.journal.userId!==id))throw new Error('Entre na mesma conta usada nesta tentativa para conferir seu recibo.');
        identity.current=id;setUserId(id);setAuthFeedback('Conta confirmada. Agora sincronize os dados deste aparelho para entrar no app.');
      }catch(reason){opened.dispose();if(session.current===opened)session.current=null;throw reason;}
    },true);
  }
  function resend() {
    if(!ACCOUNT_ACCESS_RELEASED||!ready||userId||!validAccountEmail(email))return;
    const address=email;
    void run(async token=>{
      clearAccess();
      const {createAccountReviewSession}=await import('@/lib/backup/account-session');if(!isCurrent(token))return;
      const opened=createAccountReviewSession({url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY});session.current=opened;
      try{const message=await resendAccountConfirmation(opened.client,address,window.location.origin,()=>isCurrent(token)&&session.current===opened);if(isCurrent(token))setAuthFeedback(message);}
      finally{opened.dispose();if(session.current===opened)session.current=null;}
    },true);
  }
  function startNewJourney() {
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||!ready||blocked||!onStart||!userId||!newJourneyConsent||!tabs||!baseline||baseline.snapshot||pending||binding||resolution)return;
    const opened=session.current,id=identity.current;
    if(!opened||!id)return;
    void run(async token=>{
      const current=()=>isCurrent(token)&&session.current===opened&&identity.current===id;
      const transport=createSupabaseAccountTransport(opened.client,{expectedUserId:id,currentUserId:()=>identity.current,isCurrent:current});
      const {startNewAccountProgress}=await import('@/lib/backup/new-account-progress');
      if(!current())return;
      const result=await startNewAccountProgress({origin:window.location.origin,storage:()=>window.localStorage,locks:navigator.locks,isCurrent:current,otherTabsClosed:tabs,startConfirmed:newJourneyConsent,userId:id},transport);
      if(!current())throw new Error('Confira o acesso antes de abrir sua jornada.');
      const {prepareLiveAccountAccess}=await import('@/lib/backup/account-live-access');
      const handoff=await prepareLiveAccountAccess(opened,{userId:id,bindingRaw:result.bindingRaw,origin:window.location.origin,project:import.meta.env.VITE_SUPABASE_URL,storage:window.sessionStorage,remember:rememberAccess});
      if(!current()){handoff.dispose();throw new Error('O acesso mudou. Reabra a conferência.');}
      session.current=null;identity.current=null;
      try{onStart(handoff);}catch(reason){handoff.dispose();throw reason;}
    });
  }
  function send(){if(!ACCOUNT_TRANSFER_WRITES_RELEASED||resolution||!copy||!baseline||!userId||!tabs||!allProfiles||pending||blocked)return;void run(async token=>{const result=await beginAccountTransfer(context(token),{baseline,previousCopy:copy,allProfilesConfirmed:allProfiles,userId},transport(token));if(!isCurrent(token))return;setReceipt(result.receipt);await refresh(token);setMessage('Arquivo enviado e recibo conferido. O app ainda não está conectado para sincronizar automaticamente.');});}
  function review(resend=false){if(!ACCOUNT_TRANSFER_WRITES_RELEASED||resolution||!pending||!userId||!tabs||(resend&&!retry)||blocked)return;void run(async token=>{const result=await reviewAccountTransfer(context(token),{raw:pending.raw,retryConfirmed:resend&&retry},transport(token));if(isCurrent(token)){setReceipt(result.receipt);setLocalChanged(result.localChanged);setMessage(result.receipt?'Recibo e arquivo online conferidos. Nenhum dado local foi substituído.':'Ainda não há recibo confirmado. Esta consulta não reenviou o arquivo.');}});}
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
      const handoff=await prepareLiveAccountAccess(owned,{userId:id,bindingRaw:raw,origin:window.location.origin,project:import.meta.env.VITE_SUPABASE_URL,storage:window.sessionStorage,remember:rememberAccess});
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
  function chooseVersion(direction:'local'|'online',copies:{local:string|null;online:string;pending:string|null}){
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||!versions||!tabs||!userId||resolution||blocked)return;
    void run(async token=>{
      const selected=versions;setVersions(null);setLiveConsent(false);setRememberAccess(false);
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
  function connectJourney(receive = false, adoptLegacy = false) {
    if (!ACCOUNT_TRANSFER_WRITES_RELEASED || !ready || busy || blocked || !onStart || !userId || resolution || (receive && (!versions || pending))) return;
    const opened = session.current, id = identity.current;
    if (!opened || !id) return;
    void run(async token => {
      const current = () => isCurrent(token) && session.current === opened && identity.current === id;
      const context = { origin: window.location.origin, storage: () => window.localStorage, locks: navigator.locks, otherTabsClosed: true, isCurrent: current };
      setMessage(receive ? 'Recebendo a jornada escolhida…' : 'Conectando sua jornada…');
      const selectedTransport = resolutionTransport(token);
      let result: { bindingRaw: string };
      if (pending) result = await resumeAccountConnection(context, { raw: pending.raw, confirmed: true }, selectedTransport);
      else if (receive) result = await receiveReviewedAccountProgress(context, { review: versions!, confirmed: true }, selectedTransport);
      else if (!binding) {
        const remote = await selectedTransport.readProgress(id);
        if (remote && typeof remote === 'object' && 'kind' in remote && remote.kind === 'legacy') {
          if (!adoptLegacy) {
            if (current()) { setLegacyAccount(true); setLegacyConsent(false); setMessage(baseline?.snapshot?'A conta possui registros do formato anterior. Confira a preservação abaixo antes de usar esta jornada local.':'A conta possui registros anteriores, mas este aparelho não contém uma jornada completa para adotar. Use o aparelho original ou importe uma cópia conferida.'); }
            return;
          }
          if (!baseline?.snapshot) throw new Error('Este aparelho não contém uma jornada completa. Abra a conta no aparelho original ou importe uma cópia antes de continuar.');
          if (!legacyConsent) throw new Error('Confirme a preservação dos registros anteriores e o uso desta jornada local.');
          result = await connectCurrentAccountProgress(context, { userId: id, confirmed: true, legacyReplacementConfirmed: true }, selectedTransport);
        } else if (remote && typeof remote === 'object' && 'kind' in remote && remote.kind === 'snapshot') {
          const reviewed = await reviewAccountVersions({origin:window.location.origin,expectedUserId:id,storage:window.localStorage,isCurrent:current,transport:selectedTransport});
          if (baseline?.snapshot) {
            if (current()) { setVersions(reviewed); setMessage('Há progresso neste aparelho e na conta. Confira os totais e escolha qual versão continuar usando.'); }
            return;
          }
          result = await receiveReviewedAccountProgress(context, { review: reviewed, confirmed: true }, selectedTransport);
        } else result = await connectCurrentAccountProgress(context, { userId: id, confirmed: true }, selectedTransport);
      } else result = await connectCurrentAccountProgress(context, { userId: id, confirmed: true }, selectedTransport);
      if (!current()) throw new Error('O acesso mudou. Confira sua conta antes de continuar.');
      const { prepareLiveAccountAccess } = await import('@/lib/backup/account-live-access');
      const handoff = await prepareLiveAccountAccess(opened, { userId: id, bindingRaw: result.bindingRaw, origin: window.location.origin, project: import.meta.env.VITE_SUPABASE_URL, storage: window.sessionStorage, remember: true, email: email.trim() });
      if (!current()) { handoff.dispose(); throw new Error('A conexão mudou. Reabra a conta.'); }
      session.current = null; identity.current = null;
      try { onStart(handoff); } catch (reason) { handoff.dispose(); throw reason; }
    });
  }
  const core = baseline?.snapshot?.stores?.core?.state;
  const count = (value: unknown) => Array.isArray(value) ? value.filter(item => !item?.parentId).length : 0;
  const localUser = core?.user as Record<string, unknown> | undefined;
  const localXP = ['xp_earth','xp_fire','xp_water','xp_air'].reduce((sum,key) => sum + (typeof localUser?.[key] === 'number' && Number.isFinite(localUser[key]) ? localUser[key] as number : 0), 0);
  const localXPLabel = localXP.toLocaleString('pt-BR',{maximumFractionDigits:3});
  return <div className="entry-shell">
    <a className="entry-skip" href="#account-workspace-title">Ir para o acesso da conta</a>
    <div className="entry-masthead"><EntryBrand /><a className="entry-top-link" href="/santuario"><ArrowLeft size={16} aria-hidden="true" />Voltar ao app</a></div>
    <div className="entry-layout">
    <EntryArtwork />
    <main className="restore-workspace account-workspace entry-main" aria-labelledby="account-workspace-title">
    {(pending || resolution) && <a className="restore-workspace-back entry-context" href="/?progresso=conta" onClick={event=>{event.preventDefault();window.location.reload();}}><ArrowLeft size={18} aria-hidden="true" />Recarregar conferência</a>}
    <header><h1 id="account-workspace-title" ref={heading} tabIndex={-1}>{userId ? 'Minha conta' : accessMode === 'signup' ? 'Comece sua jornada' : 'Sua jornada continua'}</h1></header>
    <p>{userId ? 'Escolha como continuar com suas atividades, conquistas e XP.' : accessMode === 'signup' ? 'Crie seu acesso para guardar atividades, conquistas e XP em uma conta pessoal.' : 'Entre para reencontrar suas atividades, conquistas e XP.'}</p>
    {!ACCOUNT_ACCESS_RELEASED&&<p className="account-workspace-release" role="status">O acesso à conta ainda não está liberado nesta versão.</p>}
    {!ACCOUNT_TRANSFER_WRITES_RELEASED&&<section aria-labelledby="account-mobile"><h2 id="account-mobile">Seu progresso no celular</h2><p>Você já pode importar sua cópia completa neste aparelho, incluindo atividades, histórico e XP. Cadastro e acesso à conta são separados: envio e sincronização ainda não liberados.</p><a className="restore-workspace-back" href="/?progresso=restaurar">Importar minha cópia neste aparelho</a><p>Para validar sua conta, crie o acesso abaixo, confirme o e-mail e entre novamente. Entrar não envia nem substitui sua jornada.</p></section>}
    <section className="entry-access-card" aria-labelledby="account-access">
      <h2 id="account-access">{userId ? 'Acesso confirmado' : 'Acesso à conta'}</h2>
      <div className="account-access-modes" role="group" aria-label="Tipo de acesso"><button type="button" aria-pressed={accessMode==='login'} disabled={!ready||busy||!!userId} onClick={()=>changeAccess('login')}>Já tenho conta</button><button type="button" aria-pressed={accessMode==='signup'} disabled={!ready||busy||!!userId} onClick={()=>changeAccess('signup')}>Criar conta</button></div>
      <div hidden={!!userId}><form aria-busy={busy} onSubmit={event=>{event.preventDefault();authenticate(accessMode);}}>
        <label htmlFor="entry-email">E-mail<input id="entry-email" enterKeyHint="next" type="email" name="account-email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="voce@exemplo.com" required value={email} aria-describedby={authError ? 'entry-auth-error' : undefined} disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy||!!userId} onChange={event=>setEmail(event.target.value)}/></label>
        <div><label htmlFor="entry-password">Senha</label><div className="entry-password"><input id="entry-password" enterKeyHint={accessMode==='signup'?'next':'go'} autoCapitalize="none" autoCorrect="off" spellCheck={false} type={showPassword ? 'text' : 'password'} name="account-password" autoComplete={accessMode==='signup'?'new-password':'current-password'} required minLength={accessMode==='signup'?8:undefined} value={password} aria-describedby={accessMode==='signup'?'entry-password-help':undefined} disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy||!!userId} onChange={event=>setPassword(event.target.value)}/><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} disabled={busy} onClick={()=>setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button></div></div>
        {accessMode==='signup'&&<>
          <div><label htmlFor="entry-confirmation">Confirme a senha</label><div className="entry-password"><input id="entry-confirmation" enterKeyHint="done" autoCapitalize="none" autoCorrect="off" spellCheck={false} type={showConfirmation ? 'text' : 'password'} name="account-password-confirmation" autoComplete="new-password" required minLength={8} value={confirmation} disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy} onChange={event=>setConfirmation(event.target.value)}/><button type="button" aria-label={showConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'} disabled={busy} onClick={()=>setShowConfirmation(!showConfirmation)}>{showConfirmation ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button></div></div>
          <small id="entry-password-help">Use pelo menos 8 caracteres. Você pode colar uma senha do seu gerenciador.</small>{confirmation&&confirmation!==password&&<small role="status">As senhas ainda não coincidem.</small>}
        </>}
        {accessMode==='login'&&<a className="restore-workspace-back entry-recovery-link" href="/?progresso=recuperar">Esqueci minha senha</a>}
        <button type="submit" disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy||!!userId||!validAccountAccess(accessMode,email,password,confirmation)}>{busy&&<LoaderCircle className="entry-spinner" size={18} aria-hidden="true" />}{!ready ? 'Preparando acesso…' : busy ? 'Aguarde…' : accessMode==='signup'?'Criar minha conta':'Entrar'}</button>
      </form>
      <details className="entry-confirmation"><summary>Não recebeu o e-mail de confirmação?</summary><button type="button" className="restore-workspace-secondary" disabled={!ACCOUNT_ACCESS_RELEASED||!ready||busy||!!userId||!validAccountEmail(email)} onClick={resend}>Reenviar confirmação de e-mail</button><small>Preencha seu e-mail acima e confira também a caixa de spam.</small></details></div>
      {userId&&<><p>Conta confirmada. Escolha abaixo a jornada que deseja sincronizar.</p><button type="button" className="restore-workspace-secondary" disabled={!ready||busy} onClick={closeAccess}>Trocar conta</button></>}
      {authFeedback&&<p className="entry-auth-feedback" role="status" aria-live="polite"><MailCheck size={19} aria-hidden="true" /><span>{authFeedback}</span></p>}{authError&&<p id="entry-auth-error" role="alert" className="restore-workspace-error">{authError}</p>}
    </section>
    {!userId && <p className="entry-local-note"><ShieldCheck size={18} aria-hidden="true" /><span>{baseline?.snapshot ? 'O progresso deste aparelho continua protegido. Depois de entrar, use o botão principal para salvá-lo na conta.' : 'Entre para receber sua jornada salva ou começar uma nova conta sincronizada.'}</span></p>}
    {ready&&!blocked&&baseline?.snapshot&&<section className="account-journey" aria-labelledby="account-health-title">
      <div className="account-journey-heading"><ShieldCheck size={28} aria-hidden="true" /><h2 id="account-health-title">Dados deste aparelho conferidos</h2></div>
      <p>XP, atividades, vínculos, histórico e Treinos passaram pela verificação estrutural. Nenhum problema que impeça a sincronização foi encontrado.</p>
      <small>Essa conferência valida a integridade do arquivo deste aparelho; ao conectar, o app ainda confere separadamente o estado salvo na conta.</small>
    </section>}
    {ready&&blocked&&<section className="account-journey" aria-labelledby="account-repair-title">
      <div className="account-journey-heading"><ShieldCheck size={28} aria-hidden="true" /><h2 id="account-repair-title">{blockKind==='progress'?'Confira os dados deste aparelho':blockKind==='restore'?'Conclua a recuperação':'Refaça a conexão deste aparelho'}</h2></div>
      {blockKind==='progress'?<>
        <p>O app encontrou campos antigos ou incompletos e pausou o envio para não gravar uma cópia defeituosa. Nenhuma atividade foi apagada.</p>
        <ul>{progressIssues.slice(0,6).map((issue,index)=><li key={`${issue.path}-${index}`}><code>{issue.path}</code>: {issue.message}</li>)}</ul>
        {progressIssues.length>6&&<small>Há mais {progressIssues.length-6} ocorrências do mesmo diagnóstico.</small>}
        {progressRepair?<div className="account-journey-online">
          <h3>Correção segura disponível</h3>
          <p>{progressRepair.xpFields} {progressRepair.xpFields===1?'campo antigo de XP será completado':'campos antigos de XP serão completados'} sem alterar os saldos válidos.</p>
          {progressRepair.legacyExperienceMoved&&<p>A experiência do formato antigo será mantida no elemento Terra, conforme a migração já usada pelo app.</p>}
          {progressRepair.orphanActions.map(action=><p key={action.path}>“{action.title}” será preservada como {action.kind} independente, com o mesmo ID, estado e histórico.</p>)}
          <p>Antes de gravar, o app mantém uma cópia local exata e só conclui se a nova estrutura passar por toda a conferência.</p>
          <label className="restore-workspace-consent"><input type="checkbox" checked={repairConsent} disabled={busy} onChange={event=>setRepairConsent(event.target.checked)}/>Fechei as outras abas e janelas deste app.</label>
          <button type="button" disabled={busy||!repairConsent} onClick={repairStoredProgress}>Corrigir dados e continuar</button>
        </div>:<p className="restore-workspace-error">{progressRepairError||'Estes campos exigem revisão manual. Nenhum dado foi alterado.'}</p>}
      </>:<p>{blockKind==='restore'?'Uma operação de importação realmente está pendente neste navegador. Conclua-a antes de sincronizar.':'Esta ação remove somente recibos e vínculos locais antigos. Atividades, XP, treinos e a versão existente na conta não são apagados.'}</p>}
      {repairable?<button type="button" disabled={busy} onClick={resetLocalConnection}>Reiniciar conexão deste aparelho</button>:blockKind==='restore'?<a className="restore-workspace-back" href="/?progresso=restaurar">Concluir recuperação pendente</a>:null}
    </section>}
    {ready && !!userId && !blocked && !pending && !resolution && <section className="account-journey" aria-labelledby="account-journey-title">
      <div className="account-journey-heading"><UserRoundCheck size={28} aria-hidden="true" /><h2 id="account-journey-title">{userId ? 'Conecte sua jornada' : 'Seu progresso continua aqui'}</h2></div>
      <p>{userId ? 'Envie o progresso deste aparelho para sua conta e continue de onde parou em outros dispositivos.' : 'Entrar ou criar uma conta não apaga o que você já fez. Depois de entrar, você escolhe qual progresso usar.'}</p>
      {baseline?.snapshot && <dl className="account-journey-ledger" aria-label="Progresso neste aparelho"><div><dt>Rituais</dt><dd>{count(core?.tasks)}</dd></div><div><dt>Ciclos</dt><dd>{count(core?.habits)}</dd></div><div><dt>XP elemental</dt><dd><Sparkles size={16} aria-hidden="true" />{localXPLabel}</dd></div></dl>}
      {userId && <>
        <p id="account-connect-consent">Feche outras abas do app. Ao conectar, você autoriza salvar todos os perfis deste aparelho e suas próximas alterações nesta conta. O acesso pode ser retomado nesta aba por até 12 horas. Sua senha não é guardada.</p>
        <button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED || busy || blocked || !onStart} aria-describedby="account-connect-consent" onClick={() => connectJourney()}><CloudUpload size={20} aria-hidden="true" />{binding ? 'Continuar sincronização' : 'Sincronizar este aparelho'}</button>
        <button type="button" className="restore-workspace-secondary" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED || busy || blocked} onClick={compareVersions}><CloudDownload size={20} aria-hidden="true" />Usar dados já salvos na conta</button>
        {legacyAccount&&<div className="account-journey-online">
          <h3>Registros anteriores encontrados</h3>
          {baseline?.snapshot?<>
            <p>A conta ainda usa as tabelas antigas. Ao continuar, o servidor guardará uma cópia privada desses registros e os manterá congelados, sem excluí-los. A jornada corrigida deste aparelho passará a ser a versão atual.</p>
            <p>Os saldos não serão somados nem mesclados. O XP e o histórico ativos serão exatamente os desta jornada local.</p>
            <label className="restore-workspace-consent"><input type="checkbox" checked={legacyConsent} disabled={busy} onChange={event=>setLegacyConsent(event.target.checked)}/>Quero preservar os registros anteriores e usar os dados deste aparelho como minha jornada atual.</label>
            <button type="button" disabled={busy||!legacyConsent} onClick={()=>connectJourney(false,true)}>Preservar registros e sincronizar</button>
          </>:<p>Este aparelho está vazio e não pode substituir os registros anteriores. Fábio deve abrir a conta no aparelho onde estão os dados dele ou importar primeiro uma cópia completa e conferida.</p>}
        </div>}
        {versions && <div className="account-journey-online"><h3>Jornada salva na conta</h3><p>{versions.remoteSummary.tasks} rituais · {versions.remoteSummary.habits} ciclos · {versions.remoteSummary.sessions} sessões de treino</p><p id="account-receive-consent">Ao usar esta jornada, o progresso deste aparelho será substituído pela versão da conta. O XP será o dessa versão, sem somar novamente.</p><button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED || busy || blocked || !onStart} aria-describedby="account-receive-consent" onClick={() => connectJourney(true)}>Usar a jornada salva na conta</button></div>}
      </>}
      <small>O app salva após suas alterações e confere a conta quando você volta. Sem internet, os registros permanecem no aparelho; um envio não confirmado pede conferência.</small>
    </section>}
    {ready && pending && !resolution && <section aria-labelledby="account-pending-title"><h2 id="account-pending-title">Conclua a conexão da sua jornada</h2><p>Há um envio protegido neste aparelho. Entre na mesma conta e confira o salvamento. Isso consulta a tentativa original, sem repetir o envio.</p><p id="account-pending-consent">Feche as outras abas. Ao continuar, você autoriza vincular a jornada já enviada e sincronizar as próximas alterações nesta aba por até 12 horas.</p><button type="button" aria-describedby="account-pending-consent" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED || !userId || busy || blocked || !onStart} onClick={() => connectJourney()}>Conferir salvamento e conectar</button></section>}
    <details className="account-advanced" hidden={blocked}><summary>Cópias, versões e recuperação</summary>
    <div hidden={!ACCOUNT_TRANSFER_WRITES_RELEASED&&!pending&&!resolution}>
    {ready&&baseline&&!baseline.snapshot&&!pending&&!binding&&!resolution&&<section aria-labelledby="account-new"><h2 id="account-new">Sua primeira jornada</h2>
      <p>Este aparelho ainda não tem progresso. Se você já usa o app em outro dispositivo, receba a jornada salva. Para começar do zero, vamos conferir se sua conta também está vazia.</p>
      <label className="restore-workspace-consent"><input type="checkbox" checked={tabs} disabled={busy} onChange={event=>setTabs(event.target.checked)}/>Fechei as outras abas e janelas deste app.</label>
      <label className="restore-workspace-consent"><input type="checkbox" checked={newJourneyConsent} disabled={busy} onChange={event=>setNewJourneyConsent(event.target.checked)}/>Quero criar uma jornada vazia nesta conta e salvar minhas próximas alterações enquanto uso o app.</label>
      <label className="restore-workspace-consent"><input type="checkbox" checked={rememberAccess} disabled={busy} onChange={event=>setRememberAccess(event.target.checked)}/>Retomar o acesso após recarregar (até 12 horas).</label>
      <button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||!userId||!onStart||busy||blocked||!tabs||!newJourneyConsent} onClick={startNewJourney}>Começar minha jornada</button>
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
        <p>Confira os arquivos salvos antes de escolher. Nenhuma versão será substituída só por comparar ou baixar.</p><button type="button" className="restore-workspace-secondary" disabled={busy} onClick={()=>{setVersions(null);setAllProfiles(false);setLiveConsent(false);setRememberAccess(false);}}>Fechar comparação</button></>}
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
    {(resolution||versions)&&<AccountResolutionPanel key={resolution?'recover':'choose'} versions={versions??undefined} resolution={resolution?.journal} busy={busy} released={ACCOUNT_TRANSFER_WRITES_RELEASED&&!blocked&&tabs&&!!userId} onChoose={chooseVersion} onRecover={recoverResolution} onKeepLocal={keepResolutionLocal}/>}
    {binding&&!pending&&!resolution&&!versions&&<section aria-labelledby="account-live"><h2 id="account-live">Sincronizar durante o uso</h2><p>Com as outras abas fechadas, o app envia alterações de todos os perfis nesta sessão. Cada envio precisa de recibo; conflitos pausam a sincronização. Você pode autorizar a retomada após recarregar por até 12 horas; sem essa opção, entre novamente para sincronizar.</p>
      <label className="restore-workspace-consent"><input type="checkbox" checked={liveConsent} disabled={busy} onChange={event=>setLiveConsent(event.target.checked)}/>Autorizo enviar minhas alterações de todos os perfis enquanto uso o app nesta sessão.</label>
      <label className="restore-workspace-consent"><input type="checkbox" checked={rememberAccess} disabled={busy} onChange={event=>setRememberAccess(event.target.checked)}/>Retomar o acesso após recarregar (até 12 horas).</label><small>Opcional neste navegador. Use “Parar e esquecer acesso” para encerrar. A senha nunca é salva; os dados de acesso ficam separados do seu progresso.</small>
      <button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||busy||blocked||!onStart||!copy||!userId||!tabs||!allProfiles||!liveConsent} onClick={startLive}>Sincronizar enquanto uso o app</button>
    </section>}
    </div>
    </details>
    <p role="status" aria-live="polite">{busy?'Conferindo. Aguarde antes de fechar esta página.':message}</p>{error&&<p role="alert" className="restore-workspace-error">{error}</p>}
  </main></div>
    <footer className="entry-footer">Você escolhe quando conectar seu progresso.</footer>
  </div>;
}
