import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve,dirname} from 'node:path';
import ts from 'typescript';
const require=createRequire(import.meta.url),flush=()=>new Promise(r=>setImmediate(r));
const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
const uid='11111111-1111-4111-8111-111111111111',key='conselho-elemental-account-intent-v1';
const accessModule={exports:{}};new Function('exports',ts.transpileModule(readFileSync('src/lib/backup/account-access.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.Latest,module:ts.ModuleKind.CommonJS}}).outputText)(accessModule.exports);
const receipt={userId:uid,operationId:'synthetic-operation',revision:'synthetic-revision',createdAt:'2026-10-29T12:00:00Z'};
function fixture({released=true,accessReleased=released,pending=false,bound=false,handoff=false,notice='none',empty=false}={}){
 let si,ri,mounted=false,tree,cleanup,authId=uid,constructions=0,disposals=0,staleCopy=false,download=0;const handoffs=[];const slots=[],refs=[],listeners=new Set(),requests=[],navigations=[],sessions=[],timers=[];
 const memory=new Map([['conselho-elemental-storage','synthetic core'],['dominio-do-mago-workout-storage-v1','synthetic fitness']]);if(empty)memory.clear();if(pending)memory.set(key,'synthetic intent');if(bound)memory.set('conselho-elemental-account-binding-v1','synthetic binding');
 const baseline={pair:{core:empty?null:'synthetic core',fitness:empty?null:'synthetic fitness'},snapshot:empty?null:{},localMode:null};
 const react={useState(initial){const i=si++;if(!(i in slots))slots[i]=initial;return [slots[i],next=>slots[i]=next];},useRef(initial){return refs[ri++]??={current:initial};},useEffect(fn){if(!mounted)cleanup=fn();}};
 const window={location:{origin:'https://fixture.test',assign:url=>navigations.push(url),reload:()=>navigations.push('reload')},localStorage:{getItem:k=>memory.get(k)??null},addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)};
 const source=ts.transpileModule(readFileSync('src/components/backup/AccountWorkspace.tsx','utf8').replaceAll('import.meta.env.VITE_SUPABASE_URL',JSON.stringify('https://synthetic.invalid')).replaceAll('import.meta.env.VITE_SUPABASE_ANON_KEY',JSON.stringify('synthetic-public-key')),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert.deepEqual(source.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')),[]);
 const compiledSource=source.outputText;
 const mod={exports:{}};new Function('require','module','exports','window','navigator','document','URL','setTimeout',compiledSource)(id=>{
  if(id.endsWith('/entry/EntryVisuals'))return {EntryArtwork:()=>null,EntryBrand:()=>null};
  if(id==='react')return react;
  if(id.endsWith('.css'))return {};
  if(id.endsWith('/connect-account-progress'))return Object.fromEntries(['connectCurrentAccountProgress','receiveReviewedAccountProgress','resumeAccountConnection'].map(name=>[name,(...args)=>new Promise((resolve,reject)=>requests.push({name,args,resolve,reject}))]));
  if(id.endsWith('/account-access'))return accessModule.exports;
  if(id.endsWith('/workspace-preview'))return {readWorkspaceBaseline:()=>baseline,createWorkspaceSafetyCopy:async()=>({baseline,text:'local archive'})};
  if(id.endsWith('/restore-confirmation'))return {verifyPreviousSafetyCopy:async()=>{if(staleCopy)throw Error('Cópia diferente');}};
  if(id.endsWith('/progress-backup'))return {MAX_BACKUP_BYTES:20*1024*1024,STORE_KEYS:{core:'conselho-elemental-storage',fitness:'dominio-do-mago-workout-storage-v1'}};
  if(id.endsWith('/AccountResolutionPanel'))return {AccountResolutionPanel:()=>null};
  if(id.endsWith('/account-resolution-key'))return {ACCOUNT_RESOLUTION_KEY:'conselho-elemental-account-resolution-v1'};
  if(id.endsWith('/account-resolution'))return {inspectAccountResolution:async()=>({userId:uid,direction:'online'}),resolveAccountVersions:(...args)=>new Promise((resolve,reject)=>requests.push({name:'resolveAccountVersions',args,resolve,reject})),resumeAccountResolution:(...args)=>new Promise((resolve,reject)=>requests.push({name:'resumeAccountResolution',args,resolve,reject})),keepLocalAfterResolution:(...args)=>new Promise((resolve,reject)=>requests.push({name:'keepLocalAfterResolution',args,resolve,reject}))};
  if(id.endsWith('/account-conflict'))return {reviewAccountVersions:(...args)=>new Promise((resolve,reject)=>requests.push({name:'reviewAccountVersions',args,resolve,reject}))};
  if(id.endsWith('/account-binding'))return {ACCOUNT_BINDING_KEY:'conselho-elemental-account-binding-v1',reviewAccountBinding:async()=>({binding:{userId:uid}}),inspectAccountBinding:async()=>({userId:uid,createdAt:'2026-10-29T12:00:00Z'})};
  if(id.endsWith('/account-intent'))return {ACCOUNT_INTENT_KEY:key,accountBaselineDigest:async()=> 'baseline',inspectAccountIntent:async()=>({userId:uid,archive:'local archive',phase:'pending',baselineDigest:'baseline'})};
  if(id.endsWith('/restore-journal'))return {RESTORE_JOURNAL_KEY:'conselho-elemental-restore-journal-v1'};
  if(id.endsWith('/progress-mode'))return {LOCAL_PROGRESS_MODE_KEY:'conselho-elemental-local-progress-mode-v1'};
  if(id.endsWith('/account-release'))return {ACCOUNT_TRANSFER_WRITES_RELEASED:released};
  if(id.endsWith('/account-access-release'))return {ACCOUNT_ACCESS_RELEASED:accessReleased};
  if(id.endsWith('/account-transport'))return {createSupabaseAccountTransport:(_,guard)=>({guard})};
  if(id.endsWith('/account-transfer'))return Object.fromEntries(['beginAccountTransfer','reviewAccountTransfer','finishAccountTransferLocally','pauseAccountTransferLocally'].map(name=>[name,(...args)=>new Promise((resolve,reject)=>requests.push({name,args,resolve,reject}))]));
  if(id.endsWith('/new-account-progress'))return {startNewAccountProgress:(...args)=>new Promise((resolve,reject)=>requests.push({name:'startNewAccountProgress',args,resolve,reject}))};
  if(id.endsWith('/account-live-access'))return {prepareLiveAccountAccess:async(owned,options)=>({...options,allProfilesConfirmed:true,client:owned.client,dispose:owned.dispose})};
  if(id.endsWith('/account-session'))return {createAccountReviewSession(){constructions++;const client={auth:{onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signInWithPassword:args=>new Promise((resolve,reject)=>sessions.push({kind:'login',args,resolve,reject})),signUp:args=>new Promise((resolve,reject)=>sessions.push({kind:'signup',args,resolve,reject})),resend:args=>new Promise((resolve,reject)=>sessions.push({kind:'resend',args,resolve,reject})),getUser:async()=>({data:{user:{id:authId}},error:null})}};return {client,dispose(){disposals++;}};}};
  return require(id);
 },mod,mod.exports,window,{locks:{}},{body:{append(){}},createElement:()=>({click(){download++;},remove(){}})},{createObjectURL:()=> 'blob:synthetic',revokeObjectURL(){}},fn=>timers.push(fn));
 function render(){si=ri=0;tree=mod.exports.AccountWorkspace({notice,onStart:handoff?session=>handoffs.push(session):undefined});mounted=true;}render();const nodes=()=>flatten(tree);
 return {panel:()=>{const panels=nodes().filter(n=>typeof n.type==='function'&&n.type.name==='AccountResolutionPanel');assert.equal(panels.length,1);return panels[0].props;},render,nodes,handoffs,requests,sessions,memory,navigations,listeners,timers,get constructions(){return constructions;},get disposals(){return disposals;},get downloads(){return download;},content:()=>text(tree),
  click(label){const b=nodes().find(n=>n.type==='button'&&text(n.props.children)===label);assert.ok(b,label);b.props.onClick?.();render();},
  fill(type,value,index=0){nodes().filter(n=>n.type==='input'&&n.props.type===type)[index].props.onChange({target:{value}});render();},
  toggle(index,value=true){nodes().filter(n=>n.type==='input'&&n.props.type==='checkbox')[index].props.onChange({target:{checked:value}});render();},
  file(file={size:10,text:async()=> 'local archive'}){nodes().find(n=>n.type==='input'&&n.props.type==='file').props.onChange({target:{files:[file],value:'selected'}});render();},
  submit(){nodes().find(n=>n.type==='form').props.onSubmit({preventDefault(){}});render();},
  emit(storageKey){listeners.forEach(fn=>fn({key:storageKey}));render();},wrongCopy(value=true){staleCopy=value;},auth(value){authId=value;},unmount(){cleanup();}};
}
async function prepared(f){await flush();f.render();f.file();await flush();f.render();f.fill('email','synthetic@example.invalid');f.fill('password','synthetic test password');}
async function signed(f){f.submit();await flush();assert.ok(f.sessions.length);f.sessions.at(-1).resolve({data:{session:{},user:{id:uid}},error:null});await flush();f.render();}

test('distributed release cannot construct Auth or send even if disabled handlers are invoked directly; local copy tools remain usable',async()=>{
 const f=fixture({released:false});await prepared(f);f.submit();f.click('Criar conta');f.toggle(0);f.toggle(1);f.click('Enviar cópia conferida');await flush();f.render();assert.equal(f.constructions,0);assert.equal(f.requests.length,0);assert.match(f.content(),/ainda não liberados/);
 f.click('Baixar cópia antes do envio');await flush();f.render();assert.equal(f.downloads,1);assert.equal(f.constructions,0);f.unmount();
 // Closed-release behavior is injected above, independently of the published beta.

});

test('login is independent from a file, while password clears and explicit copy/consent still gate the durable send',async()=>{
 const independent=fixture();await flush();independent.render();independent.fill('email','synthetic@example.invalid');independent.fill('password','synthetic test password');await signed(independent);assert.equal(independent.constructions,1);independent.click('Enviar cópia conferida');assert.equal(independent.requests.length,0);independent.unmount();
 const f=fixture();await prepared(f);await signed(f);assert.equal(f.nodes().find(n=>n.type==='input'&&n.props.type==='password').props.value,'');f.click('Enviar cópia conferida');assert.equal(f.requests.length,0);f.toggle(0);f.toggle(1);f.click('Enviar cópia conferida');f.click('Enviar cópia conferida');assert.equal(f.requests.length,1);
 const request=f.requests[0];assert.equal(request.name,'beginAccountTransfer');assert.equal(request.args[1].previousCopy,'local archive');assert.equal(request.args[1].allProfilesConfirmed,true);
 f.memory.set(key,'synthetic intent');request.resolve({raw:'synthetic intent',receipt,storageConfirmed:true});await flush();f.render();assert.match(f.content(),/Arquivo enviado/);assert.equal(f.navigations.length,0);
 f.toggle(2);f.click('Encerrar conferência e continuar localmente');assert.equal(f.requests[1].name,'finishAccountTransferLocally');assert.equal(f.requests[1].args[1].bindAccountConfirmed,false);f.requests[1].resolve(receipt);await flush();assert.deepEqual(f.navigations,['/santuario']);assert.ok([...f.memory.keys()].every(k=>!/(password|token)/i.test(k)));f.unmount();assert.equal(f.listeners.size,0);
});

test('pending receipt check cannot resend without a separate consent, and offline pause does not construct a session',async()=>{
 const f=fixture({pending:true});await flush();f.render();f.toggle(0);f.toggle(2);f.click('Pausar conferência e usar o app localmente');assert.equal(f.constructions,0);assert.equal(f.requests[0].name,'pauseAccountTransferLocally');f.requests[0].resolve('paused intent');await flush();assert.deepEqual(f.navigations,['/santuario']);f.unmount();
 const g=fixture({pending:true});await flush();g.render();g.fill('email','synthetic@example.invalid');g.fill('password','synthetic test password');await signed(g);g.toggle(0);g.click('Conferir recibo sem reenviar');assert.equal(g.requests[0].args[1].retryConfirmed,false);g.requests[0].resolve({receipt:null,localChanged:false});await flush();g.render();g.click('Repetir tentativa conferida');assert.equal(g.requests.length,1);g.toggle(1);g.click('Repetir tentativa conferida');assert.equal(g.requests[1].args[1].retryConfirmed,true);g.requests[1].resolve({receipt:null,localChanged:false});await flush();g.unmount();
});

test('wrong identity, failed copy and late responses after storage changes or unmount never show a successful transfer',async()=>{
 const f=fixture({pending:true});await flush();f.render();f.auth('different-user');f.fill('email','synthetic@example.invalid');f.fill('password','synthetic test password');await signed(f);assert.match(f.content(),/mesma conta/);assert.equal(f.requests.length,0);f.unmount();
 const invalid=fixture();await flush();invalid.render();invalid.wrongCopy();invalid.file();await flush();invalid.render();assert.match(invalid.content(),/Cópia diferente/);assert.equal(invalid.constructions,0);invalid.unmount();
 for(const mode of ['change','unmount']){const g=fixture();await prepared(g);await signed(g);g.toggle(0);g.toggle(1);g.click('Enviar cópia conferida');const request=g.requests[0];if(mode==='change')g.emit('conselho-elemental-storage');else g.unmount();request.resolve({raw:'synthetic intent',receipt,storageConfirmed:true});await flush();g.render();assert.doesNotMatch(g.content(),/Arquivo enviado/);assert.equal(g.navigations.length,0);if(mode!=='unmount')g.unmount();}
});

test('account mount static graph has no domain stores, global auth client or eager session construction',()=>{
 const seen=new Set();function visit(path){if(seen.has(path))return;seen.add(path);assert.ok(!/\/(stores|services)\/|\/lib\/supabase\.ts$|bootstrap-app|capture-progress/.test(path),path);
 const ast=ts.createSourceFile(path,readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);for(const stmt of ast.statements){if(!ts.isImportDeclaration(stmt)&&!ts.isExportDeclaration(stmt))continue;if((ts.isImportDeclaration(stmt)&&stmt.importClause?.isTypeOnly)||(ts.isExportDeclaration(stmt)&&stmt.isTypeOnly))continue;const id=stmt.moduleSpecifier?.text;if(!id||id.endsWith('.css')||(!id.startsWith('.')&&!id.startsWith('@/')))continue;const base=id.startsWith('@/')?resolve('src',id.slice(2)):resolve(dirname(path),id);const file=[base,base+'.ts',base+'.tsx'].find(p=>existsSync(p)&&statSync(p).isFile());assert.ok(file,id);visit(file);}}
 visit(resolve('src/mount-account-workspace.tsx'));assert.ok(!seen.has(resolve('src/lib/backup/account-session.ts')));
});


test('saving the account binding is a separate explicit consent and does not claim automatic synchronization',async()=>{
 const f=fixture({pending:true});await flush();f.render();f.fill('email','synthetic@example.invalid');f.fill('password','synthetic test password');await signed(f);f.toggle(0);f.click('Conferir recibo sem reenviar');f.requests[0].resolve({receipt,localChanged:false});await flush();f.render();
 assert.match(f.content(),/Guardar o vínculo desta conta/);f.toggle(1);f.toggle(2);f.click('Encerrar conferência e continuar localmente');assert.equal(f.requests[1].args[1].bindAccountConfirmed,true);f.requests[1].resolve(receipt);await flush();f.unmount();
});

test('bound account describes revision protection, refuses another identity and invalidates consents on binding changes',async()=>{
 const f=fixture({bound:true});await prepared(f);assert.match(f.content(),/Vínculo guardado/);assert.match(f.content(),/versão online ainda corresponder/);f.auth('different-user');await signed(f);assert.match(f.content(),/mesma conta/);assert.equal(f.requests.length,0);
 f.emit('conselho-elemental-account-binding-v1');await flush();f.render();assert.equal(f.nodes().filter(n=>n.type==='input'&&n.props.type==='checkbox').every(n=>!n.props.checked),true);f.unmount();
});


test('live handoff requires its own consent and transfers session ownership without storing credentials',async()=>{
 const f=fixture({bound:true,handoff:true});await prepared(f);await signed(f);f.toggle(0);f.toggle(1);f.click('Sincronizar enquanto uso o app');await flush();assert.equal(f.handoffs.length,0);f.toggle(2);f.click('Sincronizar enquanto uso o app');await flush();f.render();assert.equal(f.handoffs.length,1);assert.equal(f.handoffs[0].allProfilesConfirmed,true);assert.equal(f.handoffs[0].userId,uid);
 const disposals=f.disposals;f.unmount();assert.equal(f.disposals,disposals);f.handoffs[0].dispose();assert.equal(f.disposals,disposals+1);
});

test('version comparison is read-only in the UI and storage changes discard the shown downloads',async()=>{
 const f=fixture({bound:true});await prepared(f);await signed(f);f.click('Comparar versão local e online');assert.equal(f.requests[0].name,'reviewAccountVersions');f.requests[0].resolve({localArchive:'local',remoteArchive:'remote',pendingArchive:null,localSummary:{tasks:2,habits:1,sessions:0},remoteSummary:{tasks:1,habits:0,sessions:0}});await flush();f.render();assert.match(f.content(),/2 \/ 1/);f.click('Guardar versão online');assert.equal(f.downloads,1);assert.equal(f.navigations.length,0);
 f.emit('conselho-elemental-storage');await flush();f.render();assert.equal(f.nodes().some(n=>n.type==='button'&&text(n.props.children)==='Guardar versão online'),false);f.unmount();
});


test('an unbound device authenticates without adopting data and hands only an explicit reviewed online choice to the coordinator',async()=>{
 const f=fixture();await flush();f.render();f.fill('email','synthetic@example.invalid');f.fill('password','synthetic test password');await signed(f);assert.equal(f.constructions,1);assert.equal(f.requests.length,0);
 f.click('Quero receber progresso de uma conta');f.click('Comparar versão local e online');assert.equal(f.requests[0].name,'reviewAccountVersions');f.requests[0].resolve({localArchive:null,remoteArchive:'online archive',pendingArchive:null,localSummary:null,remoteSummary:{tasks:2,habits:1,sessions:3},comparison:null});await flush();f.render();assert.match(f.content(),/Sem arquivo/);f.toggle(0);
 const panel=f.panel();assert.ok(panel);panel.onChoose('online',{local:null,online:'online archive',pending:null});await flush();f.render();assert.equal(f.requests[1].name,'resolveAccountVersions');assert.equal(f.requests[1].args[1].direction,'online');assert.equal(f.requests[1].args[1].replacementConfirmed,true);f.requests[1].resolve({outcome:'resolved'});await flush();assert.deepEqual(f.navigations,['/santuario']);f.unmount();
});

test('signup needs matching confirmation and discards an autoconfirm session without sending local progress',async()=>{
 const f=fixture();await flush();f.render();const before=[...f.memory.entries()];f.click('Criar conta');f.fill('email','synthetic@example.invalid');f.fill('password','synthetic password');f.fill('password','different password',1);f.submit();await flush();assert.equal(f.constructions,0);assert.match(f.content(),/não coincidem/);
 f.fill('password','synthetic password',1);f.submit();f.submit();await flush();assert.equal(f.constructions,1);assert.equal(f.sessions.length,1);assert.equal(f.sessions[0].kind,'signup');assert.equal(f.sessions[0].args.options.emailRedirectTo,'https://fixture.test/?progresso=conta');
 f.sessions[0].resolve({data:{session:{},user:{id:uid}},error:null});await flush();f.render();assert.match(f.content(),/Se este e-mail precisar/);assert.doesNotMatch(f.content(),/Conta validada nesta conferência/);assert.equal(f.requests.length,0);assert.equal(f.handoffs.length,0);assert.deepEqual([...f.memory.entries()],before);assert.equal(f.disposals,1);assert.equal(f.nodes().filter(n=>n.type==='input'&&n.props.type==='password').length,1);f.unmount();
});

test('resending confirmation is explicit, needs no password and cannot be duplicated while pending',async()=>{
 const f=fixture();await flush();f.render();f.fill('email','synthetic@example.invalid');f.click('Reenviar confirmação de e-mail');f.click('Reenviar confirmação de e-mail');await flush();assert.equal(f.sessions.length,1);assert.equal(f.sessions[0].kind,'resend');assert.equal(f.sessions[0].args.type,'signup');assert.equal('password' in f.sessions[0].args,false);
 f.sessions[0].resolve({data:{},error:null});await flush();f.render();assert.match(f.content(),/Se houver confirmação pendente/);assert.equal(f.requests.length,0);assert.equal(f.disposals,1);f.unmount();
});

test('mode switches clear typed credentials and changing a verified access preserves pending data but removes authority to send',async()=>{
 const f=fixture({pending:true,bound:true});await flush();f.render();f.fill('email','synthetic@example.invalid');f.fill('password','synthetic password');f.click('Criar conta');assert.equal(f.nodes().find(n=>n.type==='input'&&n.props.type==='password').props.value,'');f.click('Já tenho conta');f.fill('password','synthetic password');await signed(f);assert.match(f.content(),/Conta validada nesta conferência/);const before=[...f.memory.entries()];f.click('Trocar acesso');assert.doesNotMatch(f.content(),/Conta validada nesta conferência/);assert.deepEqual([...f.memory.entries()],before);f.click('Conferir recibo sem reenviar');assert.equal(f.requests.length,0);f.unmount();
});

test('late signup response after local context changes never restores access or shows a success result',async()=>{
 const f=fixture();await flush();f.render();f.click('Criar conta');f.fill('email','synthetic@example.invalid');f.fill('password','synthetic password');f.fill('password','synthetic password',1);f.submit();await flush();f.emit('conselho-elemental-storage');f.sessions[0].resolve({data:{session:{},user:{id:uid}},error:null});await flush();f.render();assert.doesNotMatch(f.content(),/Se este e-mail precisar|Conta validada nesta conferência/);assert.equal(f.requests.length,0);f.unmount();
});

test('confirmation return is only an informational notice and never constructs Auth or grants transfer authority',async()=>{
 for(const notice of ['returned','invalid']){const f=fixture({notice});await flush();f.render();assert.match(f.content(),notice==='returned'?/O link foi aberto/:/link não pôde ser confirmado/);f.click('Enviar cópia conferida');assert.equal(f.constructions,0);assert.equal(f.requests.length,0);assert.doesNotMatch(f.content(),/Conta validada nesta conferência/);f.unmount();}
});

test('authentication waits for initial pending-context inspection, even with valid credentials and forced handlers',async()=>{
 const f=fixture({pending:true,bound:true});f.fill('email','synthetic@example.invalid');f.fill('password','synthetic password');f.submit();await flush();assert.equal(f.constructions,0);f.render();await signed(f);assert.equal(f.constructions,1);assert.equal(f.requests.length,0);f.unmount();
});

test('a failed choice mounts recovery controls, never resends on receipt check, and can explicitly re-evaluate while keeping local data',async()=>{
 const f=fixture({bound:true});await prepared(f);await signed(f);f.click('Comparar versão local e online');f.requests[0].resolve({localArchive:'local archive',remoteArchive:'online archive',pendingArchive:null,localSummary:{tasks:1,habits:0,sessions:0},remoteSummary:{tasks:0,habits:0,sessions:0},comparison:null});await flush();f.render();f.toggle(0);f.panel().onChoose('online',{local:'local archive',online:'online archive',pending:null});await flush();f.memory.set('conselho-elemental-account-resolution-v1','synthetic recovery');f.requests[1].reject(Error('ack lost'));await flush();f.render();assert.equal(f.navigations.length,0);assert.ok(f.panel().resolution);assert.equal(f.nodes().some(n=>n.type==='button'&&text(n.props.children)==='Conferir recibo sem reenviar'),false);
 f.panel().onRecover(false);assert.equal(f.requests[2].name,'resumeAccountResolution');assert.equal(f.requests[2].args[1].retryConfirmed,false);f.requests[2].resolve({outcome:'awaiting-receipt'});await flush();f.render();assert.equal(f.navigations.length,0);
 f.panel().onKeepLocal();assert.equal(f.requests[3].name,'keepLocalAfterResolution');f.requests[3].resolve('review-ready');await flush();assert.deepEqual(f.navigations,['/?progresso=conta']);f.unmount();
});

test('remembered access has its own unchecked consent and is selected only at the reviewed live handoff',async()=>{
 const f=fixture({bound:true,handoff:true});await prepared(f);await signed(f);f.toggle(0);f.toggle(1);f.toggle(2);
 const checks=f.nodes().filter(n=>n.type==='input'&&n.props.type==='checkbox');assert.equal(checks.at(-1).props.checked,false);
 f.toggle(3);f.click('Sincronizar enquanto uso o app');await flush();assert.equal(f.handoffs.length,1);assert.equal(f.handoffs[0].remember,true);assert.equal(f.requests.length,0);f.unmount();f.handoffs[0].dispose();
});


test('new empty account has its own start path, explicit consent and one handoff; no existing data uses it',async()=>{
 const f=fixture({empty:true,handoff:true});await flush();f.render();assert.match(f.content(),/Sua primeira jornada/);assert.doesNotMatch(f.content(),/Baixar cópia antes do envio/);
 f.fill('email','synthetic@example.invalid');f.fill('password','synthetic test password');await signed(f);
 f.click('Começar minha jornada');assert.equal(f.requests.length,0);
 f.toggle(0);f.toggle(1);f.toggle(2);f.click('Começar minha jornada');f.click('Começar minha jornada');await flush();f.render();
 assert.equal(f.requests.length,1);assert.equal(f.requests[0].name,'startNewAccountProgress');assert.equal(f.requests[0].args[0].startConfirmed,true);
 f.requests[0].resolve({bindingRaw:'new binding',receipt});await flush();f.render();assert.equal(f.handoffs.length,1);assert.equal(f.handoffs[0].remember,true);assert.equal(f.handoffs[0].bindingRaw,'new binding');f.unmount();
 const existing=fixture({handoff:true});await flush();existing.render();assert.doesNotMatch(existing.content(),/Começar minha jornada/);existing.unmount();
});

test('new account start stays closed in product and storage changes revoke its consent and late handoff',async()=>{
 const closed=fixture({empty:true,handoff:true,released:false});await flush();closed.render();closed.toggle(0);closed.toggle(1);closed.click('Começar minha jornada');assert.equal(closed.requests.length,0);closed.unmount();
 const f=fixture({empty:true,handoff:true});await flush();f.render();f.fill('email','synthetic@example.invalid');f.fill('password','synthetic test password');await signed(f);f.toggle(0);f.toggle(1);f.click('Começar minha jornada');await flush();
 f.emit('conselho-elemental-storage');f.requests[0].resolve({bindingRaw:'stale',receipt});await flush();f.render();assert.equal(f.handoffs.length,0);assert.ok(f.nodes().filter(n=>n.type==='input'&&n.props.type==='checkbox').every(n=>!n.props.checked));f.unmount();
});


test('access-only release permits signup and verified login without progress RPCs, writes, handoff or loss of XP projections',async()=>{
 const f=fixture({released:false,accessReleased:true,handoff:true});await flush();f.render();const before=[...f.memory.entries()];
 f.click('Criar conta');f.fill('email','synthetic@example.invalid');f.fill('password','synthetic password');f.fill('password','synthetic password',1);f.submit();await flush();
 assert.equal(f.sessions.length,1);assert.equal(f.sessions[0].kind,'signup');f.sessions[0].resolve({data:{session:null,user:{id:uid}},error:null});await flush();f.render();
 assert.equal(f.disposals,1);assert.equal(f.requests.length,0);assert.deepEqual([...f.memory.entries()],before);
 f.fill('password','synthetic password');await signed(f);f.toggle(0);f.toggle(1);f.click('Enviar cópia conferida');f.click('Quero receber progresso de uma conta');await flush();f.render();
 assert.equal(f.requests.length,0);assert.equal(f.handoffs.length,0);assert.deepEqual([...f.memory.entries()],before);assert.deepEqual(f.navigations,[]);
 assert.ok(f.nodes().some(n=>n.type==='a'&&n.props.href==='/?progresso=restaurar'));
 assert.ok(f.nodes().some(n=>n.type==='div'&&n.props.hidden===true));
 assert.match(readFileSync('src/lib/backup/account-access-release.ts','utf8'),/ACCOUNT_ACCESS_RELEASED = true;/);
 // Closed-release behavior is injected above, independently of the published beta.
 f.unmount();
});

test('access-only release also keeps new-account start closed for an empty device after login',async()=>{
 const f=fixture({released:false,accessReleased:true,handoff:true,empty:true});await flush();f.render();const before=[...f.memory.entries()];
 f.fill('email','synthetic@example.invalid');f.fill('password','synthetic password');await signed(f);f.toggle(0);f.toggle(1);f.toggle(2);f.click('Começar minha jornada');await flush();
 assert.equal(f.requests.length,0);assert.equal(f.handoffs.length,0);assert.deepEqual([...f.memory.entries()],before);f.unmount();
});


test('one explicit connection reuses the current journey without a file roundtrip and starts only a confirmed handoff',async()=>{
 const f=fixture({handoff:true});await flush();f.render();f.fill('email','synthetic@example.invalid');f.fill('password','synthetic test password');await signed(f);
 assert.equal(f.downloads,0);f.click('Salvar minha jornada na conta');f.click('Salvar minha jornada na conta');assert.equal(f.requests.length,1);assert.equal(f.requests[0].name,'connectCurrentAccountProgress');assert.equal(f.requests[0].args[0].otherTabsClosed,true);assert.equal(f.requests[0].args[1].confirmed,true);assert.equal(f.requests[0].args[1].userId,uid);
 f.requests[0].resolve({bindingRaw:'confirmed binding'});await flush();f.render();assert.equal(f.handoffs.length,1);assert.equal(f.handoffs[0].bindingRaw,'confirmed binding');assert.equal(f.handoffs[0].remember,true);assert.equal(f.downloads,0);f.unmount();
 for(const mode of ['change','unmount']){const g=fixture({handoff:true});await flush();g.render();g.fill('email','synthetic@example.invalid');g.fill('password','synthetic test password');await signed(g);g.click('Salvar minha jornada na conta');if(mode==='change')g.emit('conselho-elemental-storage');else g.unmount();g.requests[0].resolve({bindingRaw:'late binding'});await flush();assert.equal(g.handoffs.length,0);if(mode==='change')g.unmount();}
});


test('password visibility is explicit, keeps credentials only in the form, and mode change hides and clears them without Auth',async()=>{
 const f=fixture();await flush();f.render();f.fill('email','synthetic@example.invalid');f.fill('password','synthetic private value');
 let input=f.nodes().find(n=>n.type==='input'&&n.props.name==='account-password');assert.equal(input.props.type,'password');
 f.nodes().find(n=>n.type==='button'&&n.props['aria-label']==='Mostrar senha').props.onClick();f.render();
 input=f.nodes().find(n=>n.type==='input'&&n.props.name==='account-password');assert.equal(input.props.type,'text');assert.equal(input.props.value,'synthetic private value');assert.equal(f.constructions,0);
 f.click('Criar conta');input=f.nodes().find(n=>n.type==='input'&&n.props.name==='account-password');assert.equal(input.props.type,'password');assert.equal(input.props.value,'');assert.equal(f.constructions,0);assert.equal(f.requests.length,0);f.unmount();
});
