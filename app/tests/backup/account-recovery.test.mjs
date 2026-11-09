import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const messagesModule={exports:{}};new Function('exports',ts.transpileModule(readFileSync('src/lib/backup/account-auth-messages.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.Latest,module:ts.ModuleKind.CommonJS}}).outputText)(messagesModule.exports);

const compilerOptions={target:ts.ScriptTarget.Latest,module:ts.ModuleKind.CommonJS};
const entryModule={exports:{}};new Function('exports',ts.transpileModule(readFileSync('src/lib/backup/account-recovery-entry.ts','utf8'),{compilerOptions}).outputText)(entryModule.exports);
const recoveryModule={exports:{}};new Function('require','exports',ts.transpileModule(readFileSync('src/lib/backup/account-recovery.ts','utf8'),{compilerOptions}).outputText)(id=>id==='@supabase/supabase-js'?{createClient}:id.endsWith('account-auth-messages')?messagesModule.exports:entryModule.exports,recoveryModule.exports);
const {captureRecoveryEntry,isPasswordRecoveryCallback}=entryModule.exports,{createPasswordRecovery}=recoveryModule.exports;
const id='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';

function fixture(origin='https://conselho-elemental-main.vercel.app'){
 const calls=[],user={id,email:'synthetic@example.invalid',aud:'authenticated',created_at:new Date().toISOString()};
 const b64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
 const token=b64({alg:'HS256',typ:'JWT'})+'.'+b64({sub:id,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated'})+'.synthetic-signature';
 const credentials={accessToken:token,refreshToken:'synthetic-refresh'};
 let locked=false,verifiedId=id,userFailure=false,logoutFailure=false,recoverFailure=false,recoverWait;
 const locks={async request(name,options,action){assert.equal(options.ifAvailable,true);if(locked)return action(null);locked=true;try{return await action({name,mode:'exclusive'});}finally{locked=false;}}};
 const options={url:'https://recovery.example.invalid',key:'synthetic-public-key',origin,locks};
 const construct=(url,key,opts)=>createClient(url,key,{...opts,global:{fetch:async(input,init)=>{
   const requestUrl=new URL(String(input)),method=init?.method??'GET',body=init?.body?JSON.parse(init.body):null;calls.push({path:requestUrl.pathname,search:requestUrl.search,method,body});
   if(requestUrl.pathname==='/auth/v1/recover'){if(recoverWait)await recoverWait;return recoverFailure?Response.json({msg:'synthetic rejected request'},{status:400}):Response.json({});}
   if(requestUrl.pathname==='/auth/v1/token')return Response.json({access_token:token,refresh_token:'synthetic-refresh',expires_in:3600,token_type:'bearer',user});
   if(requestUrl.pathname==='/auth/v1/user'&&method==='PUT')return Response.json(user);
   if(requestUrl.pathname==='/auth/v1/user')return userFailure?Response.json({msg:'synthetic invalid session'},{status:401}):Response.json({...user,id:verifiedId});
   if(requestUrl.pathname==='/auth/v1/logout')return logoutFailure?Response.json({msg:'synthetic logout failure'},{status:500}):new Response(null,{status:204});
   throw Error('Unexpected synthetic Auth path '+requestUrl.pathname);
 }}});
 const opened=[];return {calls,credentials,options,open(){const recovery=createPasswordRecovery(options,construct);opened.push(recovery);return recovery;},close(){opened.forEach(recovery=>recovery.dispose());},wrongUser(){verifiedId=other;},failUser(){userFailure=true;},logoutFailure(){logoutFailure=true;},recoverFailure(){recoverFailure=true;},block(){locked=true;},wait(value){recoverWait=value;}};
}

test('implicit recovery credentials are captured once and scrubbed before Auth is imported',()=>{
 const fragment='#access_token=synthetic-access&refresh_token=synthetic-refresh&type=recovery&expires_in=3600';
 assert.equal(isPasswordRecoveryCallback('https://app.example.invalid/'+fragment),true);
 let cleaned;const entry=captureRecoveryEntry('https://app.example.invalid/?progresso=recuperar'+fragment,value=>{cleaned=value;});
 assert.equal(cleaned,'/?progresso=recuperar');assert.equal(entry.kind,'callback');
 assert.deepEqual(entry.takeCredentials(),{accessToken:'synthetic-access',refreshToken:'synthetic-refresh'});assert.equal(entry.takeCredentials(),null);
 let fallbackClean='';const fallback=captureRecoveryEntry('https://app.example.invalid/'+fragment,value=>fallbackClean=value,true);
 assert.equal(fallback.kind,'callback');assert.equal(fallbackClean,'/?progresso=recuperar');
 for(const suffix of ['?progresso=recuperar&code=private','#access_token=a&access_token=b&refresh_token=r&type=recovery','#access_token=a&refresh_token=r&type=signup','#error=denied&error_description=private']){
  const invalid=captureRecoveryEntry('https://app.example.invalid/'+suffix,value=>{assert.doesNotMatch(value,/private|access_token|refresh_token|error=/);});assert.equal(invalid.kind,'invalid');assert.equal(invalid.takeCredentials(),null);
 }
 assert.equal(isPasswordRecoveryCallback('https://app.example.invalid/#access_token=a&refresh_token=r&type=signup'),false);
 assert.throws(()=>captureRecoveryEntry('https://app.example.invalid/?progresso=recuperar'+fragment,()=>{throw Error('history unavailable');}),/history unavailable/);
});

test('localhost keeps its page while the email return is always the canonical Vercel recovery route',async()=>{
 for(const origin of ['http://localhost:5173','http://127.0.0.1:5173','http://[::1]:5173']){
  const fixtureState=fixture(origin);try{
   const message=await fixtureState.open().request('synthetic@example.invalid');
   const request=fixtureState.calls.find(call=>call.path==='/auth/v1/recover');
   assert.equal(new URLSearchParams(request.search).get('redirect_to'),'https://conselho-elemental-main.vercel.app/?progresso=recuperar');
   assert.equal(request.body.code_challenge,null);assert.match(message,/outro aparelho/);
  }finally{fixtureState.close();}
 }
});

test('isolated memory session validates the server user, updates password and signs out locally',async()=>{
 const fixtureState=fixture();try{
  const recovery=fixtureState.open();assert.deepEqual(await recovery.exchange(fixtureState.credentials),{email:'synthetic@example.invalid',userId:id});
  assert.deepEqual(await recovery.update('synthetic new password'),{logoutConfirmed:true});
  assert.equal(fixtureState.calls.filter(call=>call.method==='PUT').length,1);assert.equal(fixtureState.calls.at(-1).search,'?scope=local');
  const source=readFileSync('src/lib/backup/account-recovery.ts','utf8');assert.match(source,/flowType:\s*'implicit'/);assert.doesNotMatch(source,/localStorage|sessionStorage|account-recovery-proof|flowType:\s*'pkce'/);
 }finally{fixtureState.close();}
});

test('invalid server session and update without a validated recovery session cannot change a password',async()=>{
 const fixtureState=fixture();try{
  const recovery=fixtureState.open();await assert.rejects(recovery.update('synthetic password'),/Valide/);fixtureState.failUser();
  await assert.rejects(recovery.exchange(fixtureState.credentials),/validar/);await assert.rejects(recovery.update('synthetic password'),/Valide/);
  assert.equal(fixtureState.calls.some(call=>call.method==='PUT'),false);
 }finally{fixtureState.close();}
});

test('disposal, parallel operations and server failures do not promote a late recovery session',async()=>{
 const fixtureState=fixture();try{
  let release;fixtureState.wait(new Promise(resolve=>{release=resolve;}));fixtureState.recoverFailure();const recovery=fixtureState.open(),pending=recovery.request('synthetic@example.invalid');
  for(let attempt=0;attempt<10&&!fixtureState.calls.length;attempt++)await new Promise(resolve=>setTimeout(resolve,2));
  await assert.rejects(recovery.request('synthetic@example.invalid'),/Aguarde/);recovery.dispose();release();await assert.rejects(pending,/encerrada/);
  await assert.rejects(recovery.exchange(fixtureState.credentials),/encerrada/);
 }finally{fixtureState.close();}
});

test('busy lock and invalid configuration fail without making Auth requests',async()=>{
 const fixtureState=fixture();try{
  fixtureState.block();await assert.rejects(fixtureState.open().request('synthetic@example.invalid'),/Outra aba/);assert.equal(fixtureState.calls.length,0);
  for(const extra of [{url:'http://external.invalid'},{origin:'https://user:password@app.example.invalid'},{locks:undefined},{key:undefined}])assert.throws(()=>createPasswordRecovery({...fixtureState.options,...extra},()=>{throw Error('must not construct');}),/conexão|navegador/);
 }finally{fixtureState.close();}
});

test('recovery copy permits another device and the isolated workspace has no transfer or progress path',()=>{
 const component=readFileSync('src/components/backup/AccountRecoveryWorkspace.tsx','utf8');
 assert.match(component,/outro aparelho/);assert.match(component,/takeCredentials/);assert.doesNotMatch(component,/mesmo navegador usado para solicitar|connectCurrentAccountProgress|beginAccountTransfer|startNewAccountProgress/);
 const main=readFileSync('src/main.tsx','utf8');assert.ok(main.indexOf('captureRecoveryEntry(window.location.href')<main.indexOf("import('./mount-account-recovery')"));
 assert.doesNotMatch(main,/canonicalRecoveryRequestTarget|RECOVERY_PROOF_KEY|window\.location\.replace\(recoveryRedirect/);
});
