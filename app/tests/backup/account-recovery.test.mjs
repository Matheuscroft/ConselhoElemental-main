import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {createClient} from '@supabase/supabase-js';
import {readFileSync} from 'node:fs';
const built=await build({stdin:{contents:"export * from './src/lib/backup/account-recovery';export * from './src/lib/backup/account-recovery-entry';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,external:['@supabase/supabase-js'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);
const {createPasswordRecovery,captureRecoveryEntry,RECOVERY_PROOF_KEY}=module.exports;
const id='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
function fixture(){
 const memory=new Map([['conselho-elemental-storage','untouched personal sentinel'],['old-auth-session','untouched session sentinel']]),keys=[],calls=[];
 const storage={getItem(k){keys.push(k);return memory.get(k)??null;},setItem(k,v){keys.push(k);memory.set(k,v);},removeItem(k){keys.push(k);memory.delete(k);}};
 const user={id,email:'synthetic@example.invalid',aud:'authenticated',created_at:new Date().toISOString()};
 const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url');const token=b64({alg:'HS256',typ:'JWT'})+'.'+b64({sub:id,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated'})+'.synthetic-signature';
 let now=1000,locked=false,verifiedId=id,putFailure=false,logoutFailure=false,recoverFailure=false,recoverWait;
 const locks={async request(name,options,action){assert.equal(options.ifAvailable,true);if(locked)return action(null);locked=true;try{return await action({name,mode:'exclusive'});}finally{locked=false;}}};
 const options={url:'https://recovery.example.invalid',key:'synthetic-public-key',origin:'https://app.example.invalid',storage,locks,now:()=>now};
 const construct=(url,key,opts)=>createClient(url,key,{...opts,global:{fetch:async(input,init)=>{
   const u=new URL(String(input)),method=init?.method??'GET',body=init?.body?JSON.parse(init.body):null;calls.push({path:u.pathname,search:u.search,method,body});
   if(u.pathname==='/auth/v1/recover'){if(recoverWait)await recoverWait;return recoverFailure?Response.json({msg:'synthetic rejected request'},{status:400}):Response.json({});}
   if(u.pathname==='/auth/v1/token')return Response.json({access_token:token,refresh_token:'synthetic-refresh',expires_in:3600,token_type:'bearer',user});
   if(u.pathname==='/auth/v1/user'&&method==='PUT')return putFailure?Response.json({msg:'synthetic response loss'},{status:504}):Response.json(user);
   if(u.pathname==='/auth/v1/user')return Response.json({...user,id:verifiedId});
   if(u.pathname==='/auth/v1/logout')return logoutFailure?Response.json({msg:'synthetic logout failure'},{status:500}):new Response(null,{status:204});
   throw Error('Unexpected synthetic Auth path');
 }}});
 const opened=[];return {memory,keys,calls,options,open(){const f=createPasswordRecovery(options,construct);opened.push(f);return f;},close(){opened.forEach(f=>f.dispose());},expire(){now+=3600001;},wrongUser(){verifiedId=other;},putFailure(){putFailure=true;},logoutFailure(){logoutFailure=true;},recoverFailure(){recoverFailure=true;},block(){locked=true;},wait(value){recoverWait=value;}};
}
async function recovered(f){const a=f.open();await a.request('synthetic@example.invalid');a.dispose();const b=f.open();await b.exchange('synthetic-code');return b;}

test('recovery URL code is captured once and scrubbed before any callback; implicit/duplicate/error credentials are rejected and removed',()=>{
 let cleaned;const entry=captureRecoveryEntry('https://app.example.invalid/?progresso=recuperar&code=synthetic-code',v=>{cleaned=v;});
 assert.equal(cleaned,'/?progresso=recuperar');assert.equal(entry.kind,'callback');assert.equal(entry.takeCode(),'synthetic-code');assert.equal(entry.takeCode(),null);
 for(const suffix of ['&code=a&code=b','&error=denied&error_description=private','&access_token=private','#access_token=private&refresh_token=private']){
  const e=captureRecoveryEntry('https://app.example.invalid/?progresso=recuperar'+suffix,v=>{assert.doesNotMatch(v,/private|code=|error=/);});assert.equal(e.kind,'invalid');assert.equal(e.takeCode(),null);
 }
 assert.throws(()=>captureRecoveryEntry('https://app.example.invalid/?progresso=recuperar&code=x',()=>{throw Error('history unavailable');}),/history unavailable/);
});

test('installed SDK requests S256 recovery, survives a new client through proof only, verifies server user, updates and logs out only its local session',async()=>{
 const f=fixture();try{
  const a=f.open();assert.equal(f.calls.length,0);await a.request('synthetic@example.invalid');
  const record=JSON.parse(f.memory.get(RECOVERY_PROOF_KEY)),verifier=JSON.parse(record.verifier).split('/')[0],request=f.calls.find(c=>c.path.endsWith('/recover'));
  assert.equal(request.body.code_challenge_method,'s256');assert.equal(request.body.code_challenge,createHash('sha256').update(verifier).digest('base64url'));
  assert.equal(new URLSearchParams(request.search).get('redirect_to'),'https://app.example.invalid/?progresso=recuperar');
  assert.equal(record.origin,'https://app.example.invalid');assert.doesNotMatch(record.verifier,/synthetic-refresh/);a.dispose();
  const b=f.open();assert.deepEqual(await b.exchange('synthetic-code'),{email:'synthetic@example.invalid',userId:id});assert.equal(f.memory.has(RECOVERY_PROOF_KEY),false);
  assert.equal(f.calls.find(c=>c.path.endsWith('/token')).body.code_verifier,verifier);
  assert.deepEqual(await b.update('synthetic new password'),{logoutConfirmed:true});
  assert.equal(f.calls.filter(c=>c.method==='PUT').length,1);assert.equal(f.calls.at(-1).search,'?scope=local');
  assert.equal(f.keys.every(k=>k===RECOVERY_PROOF_KEY),true);assert.equal(f.memory.size,2);assert.equal(f.memory.get('conselho-elemental-storage'),'untouched personal sentinel');
 }finally{f.close();}
});

test('missing, expired, wrong-project and wrong-purpose proofs never exchange codes or alter passwords',async()=>{
 for(const mode of ['missing','expired','project','purpose']){
  const f=fixture();try{
   if(mode!=='missing'){await f.open().request('synthetic@example.invalid');if(mode==='expired')f.expire();else if(mode==='project'){const p=JSON.parse(f.memory.get(RECOVERY_PROOF_KEY));p.project='https://other.example.invalid';f.memory.set(RECOVERY_PROOF_KEY,JSON.stringify(p));}else {const p=JSON.parse(f.memory.get(RECOVERY_PROOF_KEY));p.verifier=JSON.stringify('synthetic-not-recovery');f.memory.set(RECOVERY_PROOF_KEY,JSON.stringify(p));}}
   await assert.rejects(f.open().exchange('synthetic-code'),/link|recuperação/);
   assert.equal(f.calls.some(c=>c.path.endsWith('/token')||c.method==='PUT'),false);
  }finally{f.close();}
 }
});

test('another server identity and update without a validated recovery session cannot change a password',async()=>{
 const f=fixture();try{
  const a=f.open();await assert.rejects(a.update('synthetic password'),/Valide/);await a.request('synthetic@example.invalid');f.wrongUser();await assert.rejects(a.exchange('synthetic-code'),/validar/);await assert.rejects(a.update('synthetic password'),/Valide/);assert.equal(f.calls.some(c=>c.method==='PUT'),false);
 }finally{f.close();}
});

test('expired/stale recovery cannot delete a newer proof; disposal and parallel operations prevent late promotion',async()=>{
 const f=fixture();try{
  let release;f.wait(new Promise(resolve=>{release=resolve;}));f.recoverFailure();const a=f.open(),pending=a.request('synthetic@example.invalid');
  for(let i=0;i<10&&!f.calls.length;i++)await new Promise(r=>setTimeout(r,2));
  await assert.rejects(a.request('synthetic@example.invalid'),/Aguarde/);a.dispose();const newer='newer synthetic proof';f.memory.set(RECOVERY_PROOF_KEY,newer);release();await assert.rejects(pending,/encerrada/);assert.equal(f.memory.get(RECOVERY_PROOF_KEY),newer);
  await assert.rejects(a.exchange('synthetic-code'),/encerrada/);
 }finally{f.close();}
});

test('busy lock and invalid configuration fail without making Auth requests',async()=>{
 const f=fixture();try{
  f.block();await assert.rejects(f.open().request('synthetic@example.invalid'),/Outra aba/);assert.equal(f.calls.length,0);
  for(const extra of [{url:'http://external.invalid'},{origin:'https://user:password@app.example.invalid'},{locks:undefined},{key:undefined}])assert.throws(()=>createPasswordRecovery({...f.options,...extra},()=>{throw Error('must not construct');}),/conexão|navegador/);
 }finally{f.close();}
});

test('unconfirmed password response is not retried and logout failure is distinguished from password failure',async()=>{
 const f=fixture();try{const b=await recovered(f);f.putFailure();await assert.rejects(b.update('synthetic password'),/confirmar a alteração/);assert.equal(f.calls.filter(c=>c.method==='PUT').length,1);}finally{f.close();}
 const g=fixture();try{const b=await recovered(g);g.logoutFailure();assert.deepEqual(await b.update('synthetic password'),{logoutConfirmed:false});}finally{g.close();}
});

test('recovery bootstrap imports no stores/global Auth and preserves the closed release',()=>{
 const main=readFileSync('src/main.tsx','utf8');assert.ok(main.indexOf('captureRecoveryEntry(window.location.href')<main.indexOf("import('./mount-account-recovery')"));
 for(const path of ['src/lib/backup/account-recovery.ts','src/lib/backup/account-recovery-entry.ts','src/mount-account-recovery.tsx','src/components/backup/AccountRecoveryWorkspace.tsx'])assert.doesNotMatch(readFileSync(path,'utf8'),/from ['"][^'"]*(?:stores\/|services\/|lib\/supabase['"])/);
 assert.match(readFileSync('src/lib/backup/account-release.ts','utf8'),/ACCOUNT_TRANSFER_WRITES_RELEASED = false/);
});
