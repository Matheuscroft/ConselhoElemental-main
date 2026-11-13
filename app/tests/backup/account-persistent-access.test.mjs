import test, {mock} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import ts from 'typescript';
// "Manter conectado neste aparelho": where the access lives, the sliding 90-day window and safe rotation.
const uid='11111111-1111-4111-8111-111111111111',origin='https://fixture.test',project='https://synthetic.invalid';
const key='conselho-elemental-tab-access-v1',DAY=24*60*60*1000,t0=Date.UTC(2026,10,13);
function load(file,mocks={},globals={}){
 const cache=new Map();
 function one(path){path=resolve(path);if(cache.has(path))return cache.get(path);const out={};cache.set(path,out);
 const source=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 new Function('require','exports',...Object.keys(globals),source)(id=>{
   if(Object.hasOwn(mocks,id))return mocks[id];
   if(id.startsWith('.'))return one(resolve(dirname(path),id+'.ts'));
   throw Error('Unexpected import '+id);
 },out,...Object.values(globals));return out;}return one(file);
}
function store(entries=[]){const values=new Map(entries);return{values,getItem:k=>values.get(k)??null,setItem(k,v){values.set(k,v);},removeItem(k){values.delete(k);}};}
const access=load('src/lib/backup/account-access-storage.ts'),api=load('src/lib/backup/account-tab-access.ts');
const surface=(local=store(),session=store())=>({localStorage:local,sessionStorage:session});
const record=(extra={})=>JSON.stringify({format:'conselho-elemental-tab-access',version:2,origin,project,userId:uid,consentedAt:t0,lastUsedAt:t0,accessToken:'access-a',refreshToken:'refresh-a',...extra});
const tokens=(refresh='refresh-a')=>({user:{id:uid},access_token:'access-a',refresh_token:refresh});

test('checked stores on this device only, unchecked in this tab only, and a change of mind never leaves two copies',()=>{
 const s=surface();access.accountAccessStorage(true,s).setItem(key,'one');assert.equal(s.localStorage.getItem(key),'one');assert.equal(s.sessionStorage.getItem(key),null);
 access.accountAccessStorage(false,s).setItem(key,'two');assert.equal(s.localStorage.getItem(key),null);assert.equal(s.sessionStorage.getItem(key),'two');
 access.accountAccessStorage(true,s).setItem(key,'three');assert.equal(s.localStorage.getItem(key),'three');assert.equal(s.sessionStorage.getItem(key),null);
 // Without a choice the record stays where it is (refresh rotations never move it).
 const saved=access.accountAccessStorage(undefined,s);saved.setItem(key,'four');assert.equal(s.localStorage.getItem(key),'four');assert.equal(s.sessionStorage.getItem(key),null);
 const tab=surface(store(),store([[key,'tab only']]));access.accountAccessStorage(undefined,tab).setItem(key,'tab again');assert.equal(tab.localStorage.getItem(key),null);assert.equal(tab.sessionStorage.getItem(key),'tab again');
});
test('reads look on the device first and then in the tab; removal clears both places',()=>{
 const s=surface(store([[key,record()]]),store([[key,'stale tab copy']]));const saved=access.accountAccessStorage(undefined,s);
 assert.equal(saved.getItem(key),record());saved.removeItem(key);assert.equal(s.localStorage.getItem(key),null);assert.equal(s.sessionStorage.getItem(key),null);assert.equal(saved.getItem(key),null);
 const onlyTab=surface(store(),store([[key,record()]]));assert.equal(access.accountAccessStorage(undefined,onlyTab).getItem(key),record());
});
test('unavailable or full device storage falls back to this tab; a broken tab store is reported, not hidden',()=>{
 const full=store();full.setItem=()=>{throw new Error('QuotaExceededError');};const s=surface(full,store());
 access.accountAccessStorage(true,s).setItem(key,'fallback');assert.equal(s.sessionStorage.getItem(key),'fallback');
 const blocked={get localStorage(){throw new Error('SecurityError');},sessionStorage:store()};access.accountAccessStorage(true,blocked).setItem(key,'tab');assert.equal(blocked.sessionStorage.getItem(key),'tab');assert.equal(access.accountAccessStorage(undefined,blocked).getItem(key),'tab');
 const none={get localStorage(){throw new Error('SecurityError');},get sessionStorage(){throw new Error('SecurityError');}};
 assert.throws(()=>access.accountAccessStorage(true,none).setItem(key,'x'),/não conseguiu guardar/);assert.throws(()=>access.accountAccessStorage(undefined,none).getItem(key));
});
test('version 1 exists only in a tab: a v1 copy on the device is invisible, a corrupt one still reaches the validator',()=>{
 const v1=JSON.stringify({format:'conselho-elemental-tab-access',version:1,origin,project,userId:uid,consentedAt:t0,accessToken:'a',refreshToken:'r'});
 assert.equal(access.accountAccessStorage(undefined,surface(store([[key,v1]]))).getItem(key),null);
 assert.equal(access.accountAccessStorage(undefined,surface(store(),store([[key,v1]]))).getItem(key),v1);
 assert.equal(access.accountAccessStorage(undefined,surface(store([[key,'{broken']]))).getItem(key),'{broken');
});
test('v1 is accepted for its tab (12 h from consent) and nothing else about the strict format is relaxed',()=>{
 const v1=extra=>JSON.stringify({format:'conselho-elemental-tab-access',version:1,origin,project,userId:uid,consentedAt:t0,accessToken:'a',refreshToken:'r',...extra});
 assert.equal(api.inspectTabAccess(v1(),origin,project,t0+api.ACCOUNT_TAB_ACCESS_V1_TTL-1).lastUsedAt,t0);
 assert.throws(()=>api.inspectTabAccess(v1(),origin,project,t0+api.ACCOUNT_TAB_ACCESS_V1_TTL),/conferência/);
 assert.throws(()=>api.inspectTabAccess(v1({lastUsedAt:t0}),origin,project,t0),/conferência/);
 const now=t0+DAY;
 for(const change of [{version:3},{version:undefined},{lastUsedAt:now+1},{lastUsedAt:t0-1},{lastUsedAt:'x'},{origin:'https://other.invalid'},{project:'https://other.invalid'},{userId:'bad'},{extra:1},{accessToken:'a'.repeat(14001)},{refreshToken:'with space'}])
  assert.throws(()=>api.inspectTabAccess(record(change),origin,project,now),/conferência/,JSON.stringify(change));
 assert.throws(()=>api.inspectTabAccess(JSON.stringify((({lastUsedAt,...rest})=>rest)(JSON.parse(record()))),origin,project,now),/conferência/);
});
test('the window slides: each use renews it, and 90 days without use expire it',()=>{
 let clock=t0;const storage=store(),control=api.createTabAccessControl({storage,origin,project,userId:uid,remember:true,tokens:tokens(),now:()=>clock});
 control.activate();let saved=JSON.parse(storage.getItem(key));assert.equal(saved.version,2);assert.equal(saved.lastUsedAt,t0);assert.equal(control.deadline,t0+api.ACCOUNT_TAB_ACCESS_TTL);assert.equal(api.ACCOUNT_TAB_ACCESS_TTL,90*DAY);
 clock=t0+60*DAY;control.capture(tokens('refresh-b'));saved=JSON.parse(storage.getItem(key));
 assert.equal(saved.consentedAt,t0);assert.equal(saved.lastUsedAt,t0+60*DAY);assert.equal(saved.refreshToken,'refresh-b');assert.equal(control.deadline,t0+150*DAY);
 assert.ok(api.inspectTabAccess(storage.getItem(key),origin,project,t0+60*DAY+90*DAY-1));
 assert.throws(()=>api.inspectTabAccess(storage.getItem(key),origin,project,t0+60*DAY+90*DAY),/Entre novamente/);
 // Without use it would already have expired at day 90 of the original login.
 assert.throws(()=>api.inspectTabAccess(record(),origin,project,t0+90*DAY),/Entre novamente/);
});
test('the invalidation timer follows the sliding deadline and survives the 24.8-day timer cap',()=>{
 mock.timers.enable({apis:['setTimeout']});
 try{
  let clock=t0,deadline=t0+40*DAY,fired=0;const stop=api.watchAccessDeadline({get deadline(){return deadline;}},()=>fired++,()=>clock);
  for(let day=1;day<=39;day++){clock=t0+day*DAY;mock.timers.tick(DAY);}
  assert.equal(fired,0);deadline=t0+60*DAY;// a token rotation slid the window
  for(let day=40;day<=59;day++){clock=t0+day*DAY;mock.timers.tick(DAY);}
  assert.equal(fired,0);clock=t0+60*DAY;mock.timers.tick(DAY);assert.equal(fired,1);stop();
  let late=0,again=api.watchAccessDeadline({deadline:null},()=>late++,()=>clock);mock.timers.tick(100*DAY);assert.equal(late,0);again();
 }finally{mock.timers.reset();}
});
test('forgetting through the saved-access store removes the device copy and the tab copy',()=>{
 const s=surface(store(),store());const saved=access.accountAccessStorage(true,s);
 const control=api.createTabAccessControl({storage:saved,origin,project,userId:uid,remember:true,tokens:tokens()});control.activate();s.sessionStorage.setItem(key,'leftover');
 const wrapper=access.accountAccessStorage(undefined,s);assert.equal(wrapper.getItem(key)!==null,true);
 // forget() is compare-and-swap on the visible copy, then clears both
 control.forget();assert.equal(s.localStorage.getItem(key),null);assert.equal(s.sessionStorage.getItem(key),null);
});

// ── Restoring: rotation lock, renewal and safe failure ────────────────────────────
function server(){let current='refresh-a',n=0;const calls=[];
 const client=()=>({auth:{
  async setSession(value){calls.push(value.refresh_token);if(value.refresh_token!==current)return{data:{session:null},error:{code:'refresh_token_already_used',status:400,message:'Invalid Refresh Token: secret-detail'}};
   n++;current='refresh-'+n;await Promise.resolve();return{data:{session:tokens(current)},error:null};},
  async getUser(){return{data:{user:{id:uid,email:'synthetic@example.invalid'}},error:null};},
 }});
 return{calls,client,get current(){return current;}};
}
function resumeApi(srv,extra={}){
 let disposed=0;return{get disposed(){return disposed;},api:load('src/lib/backup/resume-authenticated-account.ts',{
  './account-session':{createAccountReviewSession:()=>({client:srv.client(),dispose(){disposed++;}})},
  './account-live-access':{prepareAuthenticatedAccountAccess:async(_,options)=>({userId:uid,previous:options.previous,dispose(){}}),rememberAuthenticatedAccountAccess:async()=>{}},...extra})};
}
const lockManager=()=>{let chain=Promise.resolve();const names=[];return{names,request(name,options,task){names.push(name);const run=chain.then(()=>task());chain=run.catch(()=>{});return run;}};};
const resume=(r,accessStorage,locks)=>r.api.resumeAuthenticatedAccountSession({config:{url:project,key:'synthetic-public'},origin,accessStorage,isCurrent:()=>true,locks});

test('two tabs opening together never refresh the same token: the second reads the pair the first rotated',async()=>{
 const srv=server(),r=resumeApi(srv),storage=store([[key,record({lastUsedAt:Date.now()-DAY,consentedAt:Date.now()-2*DAY})]]),locks=lockManager();
 const both=await Promise.all([resume(r,storage,locks),resume(r,storage,locks)]);
 assert.equal(both.length,2);assert.deepEqual(srv.calls,['refresh-a','refresh-1']);assert.deepEqual(locks.names,['conselho-elemental-auth-refresh-v1','conselho-elemental-auth-refresh-v1']);
 assert.equal(JSON.parse(storage.getItem(key)).refreshToken,'refresh-2');
});
test('without the lock the same race reuses a rotated token and burns the session, which is exactly what the lock prevents',async()=>{
 const srv=server(),r=resumeApi(srv),storage=store([[key,record({lastUsedAt:Date.now()-DAY,consentedAt:Date.now()-2*DAY})]]);
 const settled=await Promise.allSettled([resume(r,storage,null),resume(r,storage,null)]);
 assert.deepEqual(settled.map(x=>x.status),['rejected','rejected']);assert.deepEqual(srv.calls,['refresh-a','refresh-a']);assert.equal(storage.getItem(key),null);
});
test('a successful restore writes the rotated pair back and renews the 90-day window; consent date and storage place stay',async()=>{
 const srv=server(),r=resumeApi(srv),old=Date.now()-30*DAY,s=surface(store([[key,record({consentedAt:old-DAY,lastUsedAt:old})]]),store());
 await resume(r,access.accountAccessStorage(undefined,s),lockManager());
 const saved=JSON.parse(s.localStorage.getItem(key));assert.equal(saved.refreshToken,'refresh-1');assert.equal(saved.consentedAt,old-DAY);assert.ok(saved.lastUsedAt>=Date.now()-5000);assert.equal(s.sessionStorage.getItem(key),null);
});
test('a corrupt or expired record asks to sign in again, drops only that record and touches no progress',async()=>{
 for(const bad of ['{broken',record({lastUsedAt:Date.now()-91*DAY,consentedAt:Date.now()-92*DAY})]){
  const srv=server(),r=resumeApi(srv),storage=store([[key,bad],['conselho-elemental-storage','local progress']]);
  await assert.rejects(resume(r,storage,lockManager()),/Entre novamente/);assert.equal(storage.getItem(key),null);assert.equal(storage.getItem('conselho-elemental-storage'),'local progress');assert.deepEqual(srv.calls,[]);
 }
});
test('a reused or revoked refresh token falls to "Entre novamente" with the safe message, once, and keeps local progress',async()=>{
 const srv=server(),r=resumeApi(srv),storage=store([[key,record({refreshToken:'refresh-old',lastUsedAt:Date.now()-DAY,consentedAt:Date.now()-2*DAY})],['conselho-elemental-storage','local progress']]);
 const failure=await resume(r,storage,lockManager()).then(()=>null,e=>e);
 assert.ok(failure);assert.match(failure.message,/Entre novamente/);assert.equal(failure.code,'refresh_token_already_used');assert.doesNotMatch(failure.message,/secret-detail|refresh-old/);
 assert.equal(storage.getItem(key),null);assert.equal(storage.getItem('conselho-elemental-storage'),'local progress');assert.equal(r.disposed,1);
 // No loop: the next start finds no record and goes straight to the login screen.
 await assert.rejects(resume(r,storage,lockManager()),/Entre novamente/);assert.deepEqual(srv.calls,['refresh-old']);
});
test('offline or server errors keep the saved access; only a definitive end removes it',async()=>{
 const raw=record({lastUsedAt:Date.now()-DAY,consentedAt:Date.now()-2*DAY}),storage=store([[key,raw]]);
 const offline={calls:[],client:()=>({auth:{setSession:async()=>({data:{session:null},error:{name:'AuthRetryableFetchError',status:0,message:'secret fetch failed'}}),getUser:async()=>({})}})};
 const failure=await resume(resumeApi(offline),storage,lockManager()).then(()=>null,e=>e);
 assert.match(failure.message,/Sem conexão/);assert.doesNotMatch(failure.message,/secret/);assert.equal(storage.getItem(key),raw);
});
