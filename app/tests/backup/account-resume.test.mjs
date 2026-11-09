import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import ts from 'typescript';
const uid='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222',origin='https://fixture.test',project='https://synthetic.invalid';
const tokens={user:{id:uid},access_token:'synthetic-access',refresh_token:'synthetic-refresh'};
const key='conselho-elemental-tab-access-v1',now=Date.now();
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
function store(entries=[]){const values=new Map(entries),writes=[];return{values,writes,getItem:k=>values.get(k)??null,setItem(k,v){writes.push(k);values.set(k,v);},removeItem(k){writes.push(k);values.delete(k);}};}
const api=load('src/lib/backup/account-tab-access.ts');
const opts=storage=>({storage,origin,project,userId:uid,remember:true,tokens,now:()=>now});
function saved(storage=store()){const control=api.createTabAccessControl(opts(storage));control.activate();return {storage,raw:storage.getItem(key),control};}

test('remembered access is opt-in, bounded, origin/project-bound and separate from domain data',()=>{
 const storage=store([['core','personal fixture']]),control=api.createTabAccessControl(opts(storage));assert.equal(storage.getItem(key),null);control.capture(tokens);assert.equal(storage.getItem(key),null);
 control.activate();const raw=storage.getItem(key);assert.equal(api.inspectTabAccess(raw,origin,project,now).userId,uid);assert.equal(storage.getItem('core'),'personal fixture');assert.deepEqual(storage.writes,[key]);
 for(const change of [{origin:'https://other.invalid'},{project:'https://other.invalid'},{userId:'bad'},{extra:true},{consentedAt:now+1},{consentedAt:now-api.ACCOUNT_TAB_ACCESS_TTL},{accessToken:'a'.repeat(14001)},{refreshToken:'with space'}])assert.throws(()=>api.inspectTabAccess(JSON.stringify({...JSON.parse(raw),...change}),origin,project,now),/conferência/);
 for(const malformed of ['bad','[]','x'.repeat(32769)])assert.throws(()=>api.inspectTabAccess(malformed,origin,project,now));
});
test('refresh and reload preserve the original consent deadline; disposal retains access, explicit forgetting removes only its own marker',()=>{
 const f=saved(),initial=JSON.parse(f.raw);f.control.capture({...tokens,refresh_token:'rotated'});assert.equal(JSON.parse(f.storage.getItem(key)).consentedAt,initial.consentedAt);f.control.dispose();f.control.capture({...tokens,refresh_token:'late'});assert.equal(JSON.parse(f.storage.getItem(key)).refreshToken,'rotated');
 const raw=f.storage.getItem(key),next=api.createTabAccessControl({...opts(f.storage),previous:{raw,consentedAt:initial.consentedAt}});next.activate();assert.equal(next.deadline,initial.consentedAt+api.ACCOUNT_TAB_ACCESS_TTL);next.forget();assert.equal(f.storage.getItem(key),null);
});
test('storage refusal, foreign replacement and wrong identity cannot silently persist or erase another access',()=>{
 const f=saved();f.storage.values.set(key,'newer access');assert.throws(()=>f.control.capture(tokens));assert.throws(()=>f.control.forget());assert.equal(f.storage.getItem(key),'newer access');
 const denied=store();denied.setItem=()=>{};assert.throws(()=>api.createTabAccessControl(opts(denied)).activate());
 const g=saved();assert.throws(()=>g.control.capture({...tokens,user:{id:other}}));assert.equal(g.storage.getItem(key),g.raw);
 const noRemember=api.createTabAccessControl({...opts(g.storage),remember:false,tokens:undefined});noRemember.activate();assert.equal(g.storage.getItem(key),null);
});

function resumeFixture({released=true,exclusive=true,wrong=false,pending=false,remoteConflict=false,mutate=false}={}){
 const f=saved(),storage=store([['binding','bound'],['core','local core'],['fitness','local fitness']]);if(pending)storage.values.set('intent','pending');const calls=[];let disposed=0;
 const opened={client:{auth:{setSession:async value=>{calls.push(['setSession',value]);return {data:{session:tokens},error:null};},getUser:async()=>{calls.push(['getUser']);if(mutate)storage.values.set('core','changed');return {data:{user:{id:wrong?other:uid}},error:null};}}},dispose(){disposed++;}};
 const loaded=load('src/lib/backup/resume-account-session.ts',{
 './account-release':{ACCOUNT_TRANSFER_WRITES_RELEASED:released},'./account-binding':{ACCOUNT_BINDING_KEY:'binding',inspectAccountBinding:async()=>({userId:uid}),reviewAccountBinding:async()=>{calls.push(['review']);if(remoteConflict)throw Error('conflict');}},
 './account-intent':{ACCOUNT_INTENT_KEY:'intent'},'./account-resolution-key':{ACCOUNT_RESOLUTION_KEY:'resolution'},'./restore-journal':{RESTORE_JOURNAL_KEY:'journal'},'./progress-mode':{LOCAL_PROGRESS_MODE_KEY:'mode'},'./progress-backup':{STORE_KEYS:{core:'core',fitness:'fitness'}},
 './account-session':{createAccountReviewSession:()=>{calls.push(['construct']);return opened;}},'./account-transport':{createAccountTransport:()=>({})},'./account-live-access':{prepareLiveAccountAccess:async(_,options)=>{calls.push(['prepare',options]);return {dispose:opened.dispose};}},
 });
 return {f,storage,calls,get disposed(){return disposed;},run:()=>loaded.resumeAccountSession({config:{url:project,key:'synthetic-public'},origin,storage,accessStorage:f.storage,isExclusive:()=>exclusive})};
}
test('resume validates identity and binding before handing off; no progress is written or hydrated',async()=>{
 const f=resumeFixture();await f.run();assert.deepEqual(f.calls.map(c=>c[0]),['construct','setSession','getUser','review','prepare']);assert.equal(f.calls.at(-1)[1].previous.raw,f.f.raw);assert.deepEqual(f.storage.writes,[]);assert.equal(f.f.storage.getItem(key),f.f.raw);assert.equal(f.disposed,0);
});
test('closed gates, pending intent and missing lease stop before Auth; identity, revision and local changes stop before handoff',async()=>{
 for(const options of [{released:false},{exclusive:false},{pending:true}]){const f=resumeFixture(options);await assert.rejects(f.run());assert.deepEqual(f.calls,[]);assert.deepEqual(f.storage.writes,[]);}
 for(const options of [{wrong:true},{remoteConflict:true},{mutate:true}]){const f=resumeFixture(options);await assert.rejects(f.run());assert.equal(f.calls.some(c=>c[0]==='prepare'),false);assert.equal(f.disposed,1);assert.deepEqual(f.storage.writes,[]);assert.equal(f.f.storage.getItem(key),f.f.raw);}
});

test('live access persists only at activation; token rotations are synchronous and explicit stop clears remembered access',async()=>{
 let callback,disposed=0;const f=saved(),opened={client:{auth:{getSession:async()=>({data:{session:tokens},error:null}),onAuthStateChange:fn=>{callback=fn;return {data:{subscription:{unsubscribe(){}}}};}}},dispose(){disposed++;}};
 const loaded=load('src/lib/backup/account-live-access.ts',{}, {document:{}});
 const session=await loaded.prepareLiveAccountAccess(opened,{origin,project,userId:uid,bindingRaw:'bound',storage:f.storage,remember:false});
 const unwatch=session.watchIdentity(()=>assert.fail('unexpected invalidation'));assert.ok(f.storage.getItem(key));session.activateResume();assert.equal(f.storage.getItem(key),null);callback('TOKEN_REFRESHED',tokens);session.dispose();unwatch();assert.equal(disposed,1);
 const target=store(),second=await loaded.prepareLiveAccountAccess(opened,{origin,project,userId:uid,bindingRaw:'bound',storage:target,remember:true});assert.equal(target.getItem(key),null);
 let invalidations=0;const stop=second.watchIdentity(()=>invalidations++);second.activateResume();callback('TOKEN_REFRESHED',{...tokens,refresh_token:'rotated'});assert.equal(JSON.parse(target.getItem(key)).refreshToken,'rotated');callback('SIGNED_OUT',null);assert.equal(invalidations,1);second.forgetResume();second.dispose();stop();assert.equal(target.getItem(key),null);
});

test('verified login persists tab access before any progress binding or transport exists',async()=>{
 let disposed=0;const target=store(),opened={client:{auth:{getSession:async()=>({data:{session:tokens},error:null})}},dispose(){disposed++;}};
 const loaded=load('src/lib/backup/account-live-access.ts');
 await loaded.rememberAuthenticatedAccountAccess(opened,{origin,project,userId:uid,storage:target});
 const saved=api.inspectTabAccess(target.getItem(key),origin,project,Date.now());
 assert.equal(saved.userId,uid);assert.equal(disposed,0);assert.deepEqual(target.writes,[key]);
});

test('authenticated local mode exposes account state without a progress transport and logout clears only access',async()=>{
 const calls=[];const loaded=load('src/lib/backup/authenticated-local-sync.ts');
 const sync=loaded.createAuthenticatedLocalSync({userId:uid,email:'synthetic@example.invalid',client:{},forgetResume(){calls.push('forget');},dispose(){calls.push('dispose');}});
 assert.equal(sync.getSnapshot().status,'blocked');assert.match(sync.getSnapshot().message,/sincronização aguarda sua escolha/i);
 await sync.flush();assert.deepEqual(calls,[]);assert.equal(sync.forgetAccess(),true);assert.deepEqual(calls,['forget','dispose']);assert.equal(sync.getSnapshot().status,'stopped');
});

test('saved Auth resumes independently from local progress and preserves the original twelve-hour deadline',async()=>{
 const f=saved(),calls=[];let disposed=0;
 const opened={client:{auth:{setSession:async value=>{calls.push(['set',value]);return{data:{session:tokens},error:null};},getUser:async()=>{calls.push(['user']);return{data:{user:{id:uid,email:'synthetic@example.invalid'}},error:null};}}},dispose(){disposed++;}};
 const loaded=load('src/lib/backup/resume-authenticated-account.ts',{
  './account-session':{createAccountReviewSession:()=>opened},
  './account-live-access':{prepareAuthenticatedAccountAccess:async(_,options)=>{calls.push(['prepare',options]);return{userId:uid,client:opened.client,dispose:opened.dispose};},rememberAuthenticatedAccountAccess:async()=>{}},
 });
 const session=await loaded.resumeAuthenticatedAccountSession({config:{url:project,key:'synthetic-public'},origin,accessStorage:f.storage,isCurrent:()=>true});
 assert.equal(session.userId,uid);assert.deepEqual(calls.map(call=>call[0]),['set','user','prepare']);assert.equal(calls[2][1].previous.consentedAt,JSON.parse(f.raw).consentedAt);assert.equal(disposed,0);
});
