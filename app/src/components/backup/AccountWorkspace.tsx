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
import { ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { createWorkspaceSafetyCopy, readWorkspaceBaseline, type WorkspaceBaseline } from '@/lib/backup/workspace-preview';
import { verifyPreviousSafetyCopy } from '@/lib/backup/restore-confirmation';
import { MAX_BACKUP_BYTES, STORE_KEYS } from '@/lib/backup/progress-backup';
import { ACCOUNT_INTENT_KEY, accountBaselineDigest, inspectAccountIntent, type AccountIntent } from '@/lib/backup/account-intent';
import { createSupabaseAccountTransport, type AccountCommitReceipt } from '@/lib/backup/account-transport';
import { beginAccountTransfer, reviewAccountTransfer, finishAccountTransferLocally, pauseAccountTransferLocally } from '@/lib/backup/account-transfer';
import { ACCOUNT_TRANSFER_WRITES_RELEASED } from '@/lib/backup/account-release';
import { RESTORE_JOURNAL_KEY } from '@/lib/backup/restore-journal';
import { LOCAL_PROGRESS_MODE_KEY } from '@/lib/backup/progress-mode';
type Session = ReturnType<typeof import('@/lib/backup/account-session').createAccountReviewSession>;

export function AccountWorkspace({ onStart, notice = 'none' }: { onStart?: (session: LiveAccountSession) => void; notice?: AccountReturnNotice } = {}) {
  const [accessMode,setAccessMode]=useState<AccountAccessMode>('login'),[confirmation,setConfirmation]=useState('');
  const [authFeedback,setAuthFeedback]=useState(notice==='returned'?'O link foi aberto e suas credenciais foram removidas do endereço. Entre para validar o acesso.':notice==='invalid'?'O link não pôde ser confirmado aqui. Entre ou solicite outra confirmação.':''),[authError,setAuthError]=useState('');
  const [receiveMode,setReceiveMode]=useState(false);
  const [resolution,setResolution]=useState<{raw:string;journal:Readonly<AccountResolution>}|null>(null);
  const [liveConsent,setLiveConsent]=useState(false),[rememberAccess,setRememberAccess]=useState(false);
  const [versions,setVersions]=useState<Awaited<ReturnType<typeof reviewAccountVersions>>|null>(null);
  const [binding,setBinding]=useState<Readonly<AccountBinding>|null>(null),[saveBinding,setSaveBinding]=useState(false);
  const [baseline,setBaseline]=useState<WorkspaceBaseline|null>(null),[copy,setCopy]=useState<string|null>(null);
  const [pending,setPending]=useState<{raw:string;intent:AccountIntent}|null>(null),[receipt,setReceipt]=useState<AccountCommitReceipt|null>(null);
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[userId,setUserId]=useState<string|null>(null);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  const [tabs,setTabs]=useState(false),[allProfiles,setAllProfiles]=useState(false),[localUse,setLocalUse]=useState(false),[retry,setRetry]=useState(false),[keepNewer,setKeepNewer]=useState(false),[localChanged,setLocalChanged]=useState(false);
  const [blocked,setBlocked]=useState(false);
  const [ready,setReady]=useState(false);
  const generation=useRef(0),job=useRef<number|null>(null),alive=useRef(true),session=useRef<Session|null>(null),identity=useRef<string|null>(null),file=useRef<HTMLInputElement>(null),heading=useRef<HTMLHeadingElement>(null);
  const pair=()=>JSON.stringify([window.localStorage.getItem(STORE_KEYS.core),window.localStorage.getItem(STORE_KEYS.fitness)]);
  const isCurrent=(token:number)=>alive.current&&generation.current===token;
  async function refresh(token:number) {
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
    if(isCurrent(token))setReady(true);
  }
  useEffect(()=>{
    const ref=generation;alive.current=true;setReady(false);const token=++ref.current;
    heading.current?.focus({preventScroll:true});
    void refresh(token).catch(()=>{if(ref.current===token){setBlocked(true);setError('Há uma conferência pendente que precisa de revisão. Preserve os dados deste navegador.');}});
    const changed=(event:StorageEvent)=>{
      if(event.key!==null&&![STORE_KEYS.core,STORE_KEYS.fitness,ACCOUNT_INTENT_KEY,ACCOUNT_BINDING_KEY,ACCOUNT_RESOLUTION_KEY,RESTORE_JOURNAL_KEY,LOCAL_PROGRESS_MODE_KEY].includes(event.key))return;
      const next=++ref.current;job.current=null;setReady(false);setBusy(false);setCopy(null);setReceipt(null);setTabs(false);setAllProfiles(false);setLocalUse(false);setRetry(false);setKeepNewer(false);setSaveBinding(false);setLiveConsent(false);setRememberAccess(false);setVersions(null);setMessage('O progresso mudou. Refaça a conferência.');
      void refresh(next).catch(()=>{if(ref.current===next){setBlocked(true);setError('Preserve os dados e recarregue a conferência.');}});
    };
    window.addEventListener('storage',changed);
    return()=>{ref.current++;alive.current=false;session.current?.dispose();session.current=null;identity.current=null;window.removeEventListener('storage',changed);};
  // The isolated document owns this one subscription; callbacks bind generations.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  async function run(action:(token:number)=>Promise<void>,access=false) {
    if(!ready||job.current!==null)return;
    const token=++generation.current;job.current=token;setBusy(true);setError('');
    try{await action(token);}catch(reason){if(isCurrent(token)){(access?setAuthError:setError)(reason instanceof Error?reason.message:'Não foi possível concluir. Preserve sua cópia local.');try{await refresh(token);}catch{setBlocked(true);}}}
    finally{if(job.current===token){job.current=null;if(alive.current)setBusy(false);}}
  }
  function download(text:string,label:string){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`${label}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;try{document.body.append(a);a.click();}finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}}
  function safety(){void run(async token=>{const saved=await createWorkspaceSafetyCopy(window.localStorage,window.location.origin);if(!isCurrent(token))return;setBaseline(saved.baseline);setCopy(null);setAllProfiles(false);setLocalUse(false);setLiveConsent(false);setRememberAccess(false);setVersions(null);download(saved.text,'conselho-antes-do-envio');setMessage('Download solicitado. Selecione o arquivo salvo para conferir antes de enviar.');});}
  function select(selected:File){void run(async token=>{setCopy(null);setAllProfiles(false);setLocalUse(false);setLiveConsent(false);setRememberAccess(false);setVersions(null);if(!baseline)throw new Error('Recarregue a conferência antes de escolher a cópia.');if(selected.size>MAX_BACKUP_BYTES)throw new Error('Escolha uma cópia de até 20 MB.');const text=await selected.text();if(!isCurrent(token))return;await verifyPreviousSafetyCopy(text,baseline,window.localStorage,window.location.origin);if(isCurrent(token)){setCopy(text);setMessage('Arquivo salvo corresponde ao progresso local conferido.');}});}
  function context(token:number){const captured=pair(),bound=window.localStorage.getItem(ACCOUNT_BINDING_KEY);return{origin:window.location.origin,storage:()=>window.localStorage,locks:navigator.locks,otherTabsClosed:tabs,isCurrent:()=>isCurrent(token)&&pair()===captured&&window.localStorage.getItem(ACCOUNT_BINDING_KEY)===bound};}
  function transport(token:number){if(!session.current||!identity.current)throw new Error('Entre na conta de destino para conferir.');const captured=pair(),currentSession=session.current;return createSupabaseAccountTransport(currentSession.client,{expectedUserId:identity.current,currentUserId:()=>identity.current,isCurrent:()=>isCurrent(token)&&session.current===currentSession&&pair()===captured});}
  function clearAccess() {
    session.current?.dispose();session.current=null;identity.current=null;setUserId(null);setPassword('');setConfirmation('');setVersions(null);setReceipt(null);setTabs(false);setLiveConsent(false);setRememberAccess(false);setAllProfiles(false);setLocalUse(false);setRetry(false);setKeepNewer(false);setSaveBinding(false);setAuthFeedback('');setAuthError('');
  }
  function changeAccess(mode:AccountAccessMode) {
    if(!ready||busy||job.current!==null||userId)return;
    generation.current++;clearAccess();setAccessMode(mode);setError('');setMessage('');
  }
  function closeAccess() {
    if(!ready||busy||job.current!==null)return;
    generation.current++;clearAccess();setAuthFeedback('Acesso encerrado nesta conferência. O progresso local e as tentativas continuam preservados.');
  }
  function authenticate(kind:AccountAccessMode){
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||!ready||blocked||userId||!validAccountAccess(kind,email,password,confirmation))return;
    const input={mode:kind,email,password,confirmation,origin:window.location.origin};
    void run(async token=>{
      clearAccess();
      const {createAccountReviewSession}=await import('@/lib/backup/account-session');if(!isCurrent(token))return;
      const opened=createAccountReviewSession({url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY});session.current=opened;
      try {
        const result=await accessAccount(opened.client,input,()=>isCurrent(token)&&session.current===opened);
        if(result.kind==='confirmation'){opened.dispose();session.current=null;setAccessMode('login');setAuthFeedback(result.message);return;}
        const id=result.userId;
        if((pending&&pending.intent.userId!==id)||(binding&&binding.userId!==id)||(resolution&&resolution.journal.userId!==id))throw new Error('Entre na mesma conta usada nesta tentativa para conferir seu recibo.');
        identity.current=id;setUserId(id);setAuthFeedback('Conta validada apenas nesta conferência. A sincronização do app continua pausada.');
      }catch(reason){opened.dispose();if(session.current===opened)session.current=null;throw reason;}
    },true);
  }
  function resend() {
    if(!ACCOUNT_TRANSFER_WRITES_RELEASED||!ready||blocked||userId||!validAccountEmail(email))return;
    const address=email;
    void run(async token=>{
      clearAccess();
      const {createAccountReviewSession}=await import('@/lib/backup/account-session');if(!isCurrent(token))return;
      const opened=createAccountReviewSession({url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY});session.current=opened;
      try{const message=await resendAccountConfirmation(opened.client,address,window.location.origin,()=>isCurrent(token)&&session.current===opened);if(isCurrent(token))setAuthFeedback(message);}
      finally{opened.dispose();if(session.current===opened)session.current=null;}
    },true);
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
  return <main className="restore-workspace account-workspace" aria-labelledby="account-workspace-title">
    <a className="restore-workspace-back" href={pending||resolution?'/?progresso=conta':'/grimorio#grimoire-backup'} onClick={event=>{if(pending||resolution){event.preventDefault();window.location.reload();}}}><ArrowLeft size={20} aria-hidden="true" />{pending||resolution?'Recarregar conferência':'Voltar ao Grimório'}</a>
    <header><ShieldCheck size={32} aria-hidden="true" /><div><p>Conselho Elemental</p><h1 id="account-workspace-title" ref={heading} tabIndex={-1}>Proteja sua jornada</h1></div></header>
    <p>Valide o acesso e escolha como proteger sua jornada. Entrar não envia dados; o envio ou recebimento de progresso exige uma conferência separada.</p>
    {!ACCOUNT_TRANSFER_WRITES_RELEASED&&<p className="account-workspace-release" role="status">Conexão e envio ainda não liberados nesta versão. Você pode guardar e conferir sua cópia local; a ativação depende dos testes finais e do servidor.</p>}
    <section aria-labelledby="account-access"><h2 id="account-access">Acesso à conta</h2><p>Entrar ou criar uma conta não envia nem substitui seu progresso. A sessão desta conferência fica só na memória.</p>
      <div className="account-access-modes" role="group" aria-label="Tipo de acesso"><button type="button" className="restore-workspace-secondary" aria-pressed={accessMode==='login'} disabled={!ready||busy||!!userId} onClick={()=>changeAccess('login')}>Já tenho conta</button><button type="button" className="restore-workspace-secondary" aria-pressed={accessMode==='signup'} disabled={!ready||busy||!!userId} onClick={()=>changeAccess('signup')}>Criar conta de acesso</button></div>
      <form onSubmit={event=>{event.preventDefault();authenticate(accessMode);}}><label>E-mail<input type="email" name="account-email" autoComplete="username" spellCheck={false} required value={email} disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||!ready||busy||blocked||!!userId} onChange={event=>setEmail(event.target.value)}/></label><label>Senha<input type="password" name="account-password" autoComplete={accessMode==='signup'?'new-password':'current-password'} required minLength={accessMode==='signup'?8:undefined} value={password} disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||!ready||busy||blocked||!!userId} onChange={event=>setPassword(event.target.value)}/></label>
      {accessMode==='signup'&&<><label>Confirme a senha<input type="password" name="account-password-confirmation" autoComplete="new-password" required minLength={8} value={confirmation} disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||!ready||busy||blocked} onChange={event=>setConfirmation(event.target.value)}/></label><small>Use pelo menos 8 caracteres. A política do servidor também será aplicada.</small>{confirmation&&confirmation!==password&&<small role="status">As senhas ainda não coincidem.</small>}</>}
      <button type="submit" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||!ready||busy||blocked||!!userId||!validAccountAccess(accessMode,email,password,confirmation)}>{accessMode==='signup'?'Solicitar cadastro':'Entrar para conferir'}</button></form>
      <button type="button" className="restore-workspace-secondary" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||!ready||busy||blocked||!!userId||!validAccountEmail(email)} onClick={resend}>Reenviar confirmação de e-mail</button>
      <a className="restore-workspace-back" href="/?progresso=recuperar">Esqueci minha senha</a>
      {userId&&<><p>Conta validada nesta conferência. Enviar ou receber progresso continua exigindo as confirmações próprias.</p><button type="button" className="restore-workspace-secondary" disabled={!ready||busy} onClick={closeAccess}>Trocar acesso</button></>}
      {authFeedback&&<p role="status" aria-live="polite">{authFeedback}</p>}{authError&&<p role="alert" className="restore-workspace-error">{authError}</p>}
    </section>
    <section aria-labelledby="account-local"><h2 id="account-local">Sua cópia local</h2>
      {resolution?<p>Uma escolha aguarda conclusão. As versões anterior e escolhida permanecem protegidas no registro de recuperação.</p>:pending?<><p>Uma tentativa aguarda conferência. O arquivo original continua protegido; consultar o recibo não repete o envio.</p><button type="button" disabled={busy||blocked} onClick={()=>{if(pending)download(pending.intent.archive,'conselho-arquivo-da-tentativa');}}><Download size={20} aria-hidden="true" />Guardar arquivo desta tentativa</button></>:<>
        <p>Todos os perfis, atividades, XP e Treinos entram no arquivo. Guarde a cópia e confira o arquivo salvo antes de enviar.</p>
        <button type="button" disabled={busy||blocked||!baseline?.snapshot} onClick={safety}><Download size={20} aria-hidden="true" />Baixar cópia antes do envio</button>
        <button type="button" className="restore-workspace-secondary" disabled={busy||blocked||!baseline?.snapshot} onClick={()=>file.current?.click()}>Conferir cópia salva</button>
        <input ref={file} type="file" name="account-safety-copy" hidden accept="application/json,.json" aria-label="Cópia local salva antes do envio" onChange={event=>{const selected=event.target.files?.[0];event.target.value='';if(selected)select(selected);}}/>
      </>}
    </section>
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
    <section aria-labelledby="account-confirm"><h2 id="account-confirm">Confirme antes de continuar</h2>
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
    </section>
    {(resolution||versions)&&<AccountResolutionPanel key={resolution?'recover':'choose'} versions={versions??undefined} resolution={resolution?.journal} busy={busy} released={ACCOUNT_TRANSFER_WRITES_RELEASED&&!blocked&&tabs&&!!userId} onChoose={chooseVersion} onRecover={recoverResolution} onKeepLocal={keepResolutionLocal}/>}
    {binding&&!pending&&!resolution&&!versions&&<section aria-labelledby="account-live"><h2 id="account-live">Sincronizar durante o uso</h2><p>Com as outras abas fechadas, o app envia alterações de todos os perfis nesta sessão. Cada envio precisa de recibo; conflitos pausam a sincronização. Você pode autorizar a retomada após recarregar por até 12 horas; sem essa opção, entre novamente para sincronizar.</p>
      <label className="restore-workspace-consent"><input type="checkbox" checked={liveConsent} disabled={busy} onChange={event=>setLiveConsent(event.target.checked)}/>Autorizo enviar minhas alterações de todos os perfis enquanto uso o app nesta sessão.</label>
      <label className="restore-workspace-consent"><input type="checkbox" checked={rememberAccess} disabled={busy} onChange={event=>setRememberAccess(event.target.checked)}/>Retomar o acesso após recarregar (até 12 horas).</label><small>Opcional neste navegador. Use “Parar e esquecer acesso” para encerrar. A senha nunca é salva; os dados de acesso ficam separados do seu progresso.</small>
      <button type="button" disabled={!ACCOUNT_TRANSFER_WRITES_RELEASED||busy||blocked||!onStart||!copy||!userId||!tabs||!allProfiles||!liveConsent} onClick={startLive}>Sincronizar enquanto uso o app</button>
    </section>}
    <p role="status" aria-live="polite">{busy?'Conferindo. Aguarde antes de fechar esta página.':message}</p>{error&&<p role="alert" className="restore-workspace-error">{error}</p>}
  </main>;
}
