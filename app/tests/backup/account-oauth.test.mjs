import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {createClient} from '@supabase/supabase-js';

const built=await build({stdin:{contents:"export * from './src/lib/backup/account-oauth';export * from './src/lib/backup/account-return';export * from './src/lib/backup/account-session';export * from './src/lib/backup/account-auth-messages';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,external:['@supabase/supabase-js'],logLevel:'silent'});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports);
const {ACCOUNT_OAUTH_REDIRECT,ACCOUNT_OAUTH_LABELS,APPLE_ACCOUNT_NOTICE,startAccountOAuth,completeAccountOAuth,oauthReturnFailure,appleIdentityNotice,oauthPkceOptions,clearOAuthAttempt,captureAccountReturn,takeOAuthReturn,ACCOUNT_OAUTH_PENDING_KEY,createAccountReviewSession,accountAuthMessage}=mod.exports;

const PROJECT='https://synthetic.invalid',uid='11111111-1111-4111-8111-111111111111';
const store=()=>{const m=new Map();return {m,getItem:k=>m.get(k)??null,setItem:(k,v)=>void m.set(k,String(v)),removeItem:k=>void m.delete(k)};};
const SECRETS=['synthetic-secret-code','eyJ','access_token','refresh_token','http://','https://'];
const clean=text=>{for(const secret of SECRETS)assert.ok(!String(text).includes(secret),`${secret} in ${text}`);};

test('redirectTo is the fixed production return and labels are in Portuguese',()=>{
 assert.equal(ACCOUNT_OAUTH_REDIRECT,'https://conselho-elemental-main.vercel.app/?progresso=conta');
 assert.equal(ACCOUNT_OAUTH_LABELS.github,'Continuar com GitHub');assert.equal(ACCOUNT_OAUTH_LABELS.apple,'Continuar com Apple');
 assert.match(APPLE_ACCOUNT_NOTICE,/Apple pode ocultar seu e-mail/);assert.match(APPLE_ACCOUNT_NOTICE,/conta nova, separada/);
});

test('startAccountOAuth sends only the provider and the fixed redirect, never navigates by itself, and only to the project Auth host',async()=>{
 for(const provider of ['github','apple']){
  const storage=store(),calls=[];
  const client={auth:{signInWithOAuth:async args=>{calls.push(args);return {data:{provider,url:PROJECT+'/auth/v1/authorize?provider='+provider},error:null};}}};
  const url=await startAccountOAuth(client,provider,{projectUrl:PROJECT,storage,now:()=>1000},()=>true);
  assert.deepEqual(calls,[{provider,options:{redirectTo:'https://conselho-elemental-main.vercel.app/?progresso=conta',skipBrowserRedirect:true}}]);
  assert.equal(url,PROJECT+'/auth/v1/authorize?provider='+provider);assert.equal(storage.getItem(ACCOUNT_OAUTH_PENDING_KEY),'1000');
 }
 const storage=store();
 for(const bad of ['https://evil.invalid/auth/v1/authorize','http://synthetic.invalid/auth/v1/authorize',PROJECT+'/other','javascript:alert(1)']){
  await assert.rejects(startAccountOAuth({auth:{signInWithOAuth:async()=>({data:{url:bad},error:null})}},'github',{projectUrl:PROJECT,storage},()=>true));
  assert.equal(storage.getItem(ACCOUNT_OAUTH_PENDING_KEY),null);
 }
 await assert.rejects(startAccountOAuth({auth:{signInWithOAuth:async()=>{throw Error('must not call')}}},'google',{projectUrl:PROJECT,storage},()=>true),/provedor/);
 await assert.rejects(startAccountOAuth({auth:{signInWithOAuth:async()=>{throw Error('must not call')}}},'github',{projectUrl:PROJECT,storage},()=>false),/mudou/);
});

test('start failures use the safe mapper with a discreet technical code and never echo server text',async()=>{
 const cases=[[{code:'provider_disabled',status:400,message:'Unsupported provider: secret-code-123'},/ainda não está disponível/,'provider_disabled'],[{code:'oauth_provider_not_supported',status:400},/ainda não está disponível/,'oauth_provider_not_supported'],[{status:429},/Muitas tentativas/,'http_429'],[new TypeError('Failed to fetch https://x.invalid?access_token=1'),/Sem conexão/,'network'],[{status:400,message:'weird https://leak.invalid'},/Não foi possível entrar pelo provedor/,'http_400']];
 for(const [error,pattern,code] of cases){
  const storage=store();
  const failure=await startAccountOAuth({auth:{signInWithOAuth:async()=>({data:{url:null},error})}},'github',{projectUrl:PROJECT,storage},()=>true).then(()=>null,e=>e);
  assert.equal(failure.name,'AccountAuthError');assert.match(failure.message,pattern);assert.equal(failure.code,code);clean(failure.message);assert.equal(storage.getItem(ACCOUNT_OAUTH_PENDING_KEY),null);
 }
});

test('return failures (cancelled, denied, provider not configured) map to safe text; nothing user-controlled reaches the message',()=>{
 const denied=oauthReturnFailure('access_denied');assert.match(denied.message,/cancelado ou negado/);assert.equal(denied.code,'access_denied');
 assert.match(oauthReturnFailure('provider_disabled').message,/ainda não está disponível/);
 assert.match(oauthReturnFailure('bad_oauth_callback').message,/retorno do provedor/);
 const odd=oauthReturnFailure('Some Weird Value https://x');assert.equal(odd.code,'oauth_error');clean(odd.message);
 const unknown=oauthReturnFailure('server_error');assert.equal(unknown.code,'server_error');assert.match(unknown.message,/retorno do provedor/);
 assert.equal(accountAuthMessage({code:'access_denied'},'login','x').message,'x');
});

test('captureAccountReturn keeps an OAuth code only in memory, only when a fresh marker exists, and wipes the URL',()=>{
 const session=store();globalThis.sessionStorage=session;
 try{
  const code='synthetic-secret-code-1234';
  // no marker: the old behaviour (credentials discarded, explicit login)
  let replaced;assert.equal(captureAccountReturn('https://app.test/?progresso=conta&code='+code,u=>{replaced=u;}),'returned');assert.equal(replaced,'/?progresso=conta');assert.equal(takeOAuthReturn(),null);
  // fresh marker
  session.setItem(ACCOUNT_OAUTH_PENDING_KEY,String(Date.now()));
  assert.equal(captureAccountReturn('https://app.test/?progresso=conta&code='+code,u=>{replaced=u;}),'oauth');assert.equal(replaced,'/?progresso=conta');
  assert.equal(session.getItem(ACCOUNT_OAUTH_PENDING_KEY),null);assert.ok([...session.m.values()].every(v=>!v.includes(code)));
  assert.deepEqual(takeOAuthReturn(),{code,errorCode:null});assert.equal(takeOAuthReturn(),null);
  // expired marker
  session.setItem(ACCOUNT_OAUTH_PENDING_KEY,String(Date.now()-11*60*1000));
  assert.equal(captureAccountReturn('https://app.test/?progresso=conta&code='+code,()=>{}),'returned');assert.equal(takeOAuthReturn(),null);
  // tokens alongside a code are never accepted as an OAuth return
  session.setItem(ACCOUNT_OAUTH_PENDING_KEY,String(Date.now()));
  assert.equal(captureAccountReturn('https://app.test/?progresso=conta&code='+code+'&access_token=eyJabc',()=>{}),'returned');assert.equal(takeOAuthReturn(),null);
  // a malformed code is not kept
  session.setItem(ACCOUNT_OAUTH_PENDING_KEY,String(Date.now()));
  assert.equal(captureAccountReturn('https://app.test/?progresso=conta&code=a%20b',()=>{}),'returned');assert.equal(takeOAuthReturn(),null);
 }finally{delete globalThis.sessionStorage;}
});

test('an OAuth error return keeps only a short technical tag, from query or fragment, never the description',()=>{
 const session=store();globalThis.sessionStorage=session;
 try{
  for(const href of ['https://app.test/?progresso=conta&error=access_denied&error_code=access_denied&error_description=secret+text+eyJabc','https://app.test/?progresso=conta#error=server_error&error_code=provider_disabled&error_description=https%3A%2F%2Fleak.invalid']){
   session.setItem(ACCOUNT_OAUTH_PENDING_KEY,String(Date.now()));let replaced;
   assert.equal(captureAccountReturn(href,u=>{replaced=u;}),'oauth');assert.equal(replaced,'/?progresso=conta');
   const value=takeOAuthReturn();assert.equal(value.code,null);assert.match(value.errorCode,/^[a-z0-9_]{1,64}$/);clean(JSON.stringify(value));
  }
  session.setItem(ACCOUNT_OAUTH_PENDING_KEY,String(Date.now()));assert.equal(captureAccountReturn('https://app.test/?progresso=conta&error=Weird%20Value!',()=>{}),'oauth');assert.equal(takeOAuthReturn().errorCode,'oauth_error');
 }finally{delete globalThis.sessionStorage;}
});

test('PKCE session keeps the verifier in the given storage, the session in memory only, and leaves e-mail sessions untouched',()=>{
 let options;const verifier=store();
 const opened=createAccountReviewSession({url:PROJECT,key:'synthetic'},(_,__,o)=>{options=o;return {auth:{stopAutoRefresh:async()=>{}}};},oauthPkceOptions(verifier));
 assert.equal(options.auth.flowType,'pkce');assert.equal(options.auth.storageKey,'ce-account-oauth');assert.equal(options.auth.detectSessionInUrl,false);assert.equal(options.auth.autoRefreshToken,false);
 options.auth.storage.setItem('ce-account-oauth-code-verifier','synthetic-verifier');options.auth.storage.setItem('ce-account-oauth','synthetic session');
 assert.deepEqual([...verifier.m.keys()],['ce-account-oauth-code-verifier']);assert.equal(options.auth.storage.getItem('ce-account-oauth'),'synthetic session');
 options.auth.storage.removeItem('ce-account-oauth-code-verifier');assert.equal(verifier.m.size,0);
 opened.dispose();assert.equal(options.auth.storage.getItem('ce-account-oauth'),null);
 let plain;createAccountReviewSession({url:PROJECT,key:'synthetic'},(_,__,o)=>{plain=o;return {auth:{stopAutoRefresh:async()=>{}}};});
 assert.equal(plain.auth.flowType,undefined);assert.match(plain.auth.storageKey,/^ce-account-review-memory-/);
});

const b64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const user={id:uid,aud:'authenticated',role:'authenticated',email:'synthetic@example.invalid',app_metadata:{provider:'github'},created_at:new Date().toISOString()};
const jwt=b64({alg:'HS256',typ:'JWT'})+'.'+b64({sub:uid,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated'})+'.synthetic-signature';
function sdkClient(storage,fetchLog,{userId=uid,exchangeError=null}={}){
 return createAccountReviewSession({url:PROJECT,key:'synthetic-public-key'},(url,key,options)=>createClient(url,key,{...options,global:{fetch:async(input,init)=>{
  const u=new URL(String(input));fetchLog.push(u.pathname);
  if(u.pathname.endsWith('/token')){if(exchangeError)return Response.json(exchangeError,{status:400});return Response.json({access_token:jwt,refresh_token:'synthetic-refresh',expires_in:3600,token_type:'bearer',user:{...user,id:userId}});}
  if(u.pathname.endsWith('/user'))return Response.json({...user,id:userId});
  return Response.json({},{status:404});
 }}}),oauthPkceOptions(storage));
}

test('installed SDK: PKCE authorize URL carries the fixed redirect and a challenge; verifier survives only in tab storage; exchange yields the same authenticated result as a login',async()=>{
 const storage=store(),log=[];
 const first=sdkClient(storage,log);
 const url=new URL(await startAccountOAuth(first.client,'github',{projectUrl:PROJECT,storage},()=>true));
 assert.equal(url.origin,PROJECT);assert.equal(url.pathname,'/auth/v1/authorize');assert.equal(url.searchParams.get('provider'),'github');
 assert.equal(url.searchParams.get('redirect_to'),ACCOUNT_OAUTH_REDIRECT);assert.equal(url.searchParams.get('code_challenge_method'),'s256');assert.ok(url.searchParams.get('code_challenge'));
 assert.equal(url.searchParams.get('code_verifier'),null);assert.ok(storage.getItem('ce-account-oauth-code-verifier'));assert.ok(storage.getItem(ACCOUNT_OAUTH_PENDING_KEY));
 assert.deepEqual(log,[]);first.dispose();
 // after the redirect a fresh client takes over from the same tab storage
 const second=sdkClient(storage,log);
 const result=await completeAccountOAuth(second.client,'synthetic-code-0001',storage,()=>true);
 assert.deepEqual(Object.keys(result).sort(),['email','kind','newIdentityNotice','userId']);assert.equal(result.kind,'authenticated');assert.equal(result.userId,uid);assert.equal(result.newIdentityNotice,null);
 assert.deepEqual(log,['/auth/v1/token','/auth/v1/user']);assert.equal(storage.m.size,0);
 assert.equal((await second.client.auth.getSession()).data.session.user.id,uid);second.dispose();
});

test('exchange failures and a changed identity are safe, leave no verifier/marker, and never echo the code',async()=>{
 const storage=store(),log=[];storage.setItem('ce-account-oauth-code-verifier','v');storage.setItem(ACCOUNT_OAUTH_PENDING_KEY,'1');
 const denied=sdkClient(storage,log,{exchangeError:{error_code:'bad_code_verifier',msg:'secret synthetic-secret-code'}});
 const failure=await completeAccountOAuth(denied.client,'synthetic-secret-code',storage,()=>true).then(()=>null,e=>e);
 assert.equal(failure.name,'AccountAuthError');clean(failure.message);assert.equal(storage.m.size,0);denied.dispose();
 for(const bad of ['short','a b c d e f g h','x'.repeat(600)]){
  const never=await completeAccountOAuth({auth:{exchangeCodeForSession:async()=>{throw Error('must not call')}}},bad,storage,()=>true).then(()=>null,e=>e);
  assert.match(never.message,/retorno do provedor/);clean(never.message);
 }
 const mismatch=await completeAccountOAuth({auth:{exchangeCodeForSession:async()=>({data:{session:{user:{id:uid}}},error:null}),getUser:async()=>({data:{user:{id:'22222222-2222-4222-8222-222222222222'}},error:null})}},'synthetic-code-0002',storage,()=>true).then(()=>null,e=>e);
 assert.match(mismatch.message,/mudou/);
 const stale=await completeAccountOAuth({auth:{exchangeCodeForSession:async()=>({data:{session:{user:{id:uid}}},error:null}),getUser:async()=>({data:{user:{id:uid}},error:null})}},'synthetic-code-0003',storage,()=>false).then(()=>null,e=>e);
 assert.match(stale.message,/mudou/);
});

test('Apple identities (private relay or provider tag) get the new-account notice; GitHub with a real address does not claim linking',()=>{
 assert.match(appleIdentityNotice({email:'abc@privaterelay.appleid.com'}),/conta nova, separada/);
 assert.match(appleIdentityNotice({email:null,app_metadata:{provider:'apple'}}),/conta nova, separada/);
 assert.equal(appleIdentityNotice({email:'a@example.invalid',app_metadata:{provider:'github'}}),null);assert.equal(appleIdentityNotice(null),null);
});

test('clearOAuthAttempt removes marker and verifier even if storage throws elsewhere',()=>{
 const s=store();s.setItem('ce-account-oauth-code-verifier','v');s.setItem(ACCOUNT_OAUTH_PENDING_KEY,'1');clearOAuthAttempt(s);assert.equal(s.m.size,0);
 assert.doesNotThrow(()=>clearOAuthAttempt({getItem(){},setItem(){},removeItem(){throw Error('denied');}}));
});
