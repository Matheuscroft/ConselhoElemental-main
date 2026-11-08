import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {createClient} from '@supabase/supabase-js';
const built=await build({stdin:{contents:"export * from './src/lib/backup/account-access';export * from './src/lib/backup/account-return';export * from './src/lib/backup/account-session';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,external:['@supabase/supabase-js'],logLevel:'silent'});
const module={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);
const {accessAccount,resendAccountConfirmation,validAccountAccess,accountConfirmationRedirect,captureAccountReturn,createAccountReviewSession}=module.exports;
const id='11111111-1111-4111-8111-111111111111',origin='https://app.example.invalid';
function fixture({autoconfirm=false,error=false,wrongUser=false}={}){
 const calls=[],user={id,email:'synthetic@example.invalid',aud:'authenticated',role:'authenticated',created_at:new Date().toISOString()};
 const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),token=b64({alg:'HS256'})+'.'+b64({sub:id,exp:Math.floor(Date.now()/1000)+3600})+'.synthetic';
 const session={access_token:token,refresh_token:'synthetic-refresh',expires_in:3600,token_type:'bearer',user};
 const opened=createAccountReviewSession({url:'https://synthetic.invalid',key:'synthetic-public-key'},(url,key,options)=>createClient(url,key,{...options,global:{fetch:async(input,init)=>{
  const u=new URL(String(input));calls.push({path:u.pathname,search:u.search,body:init?.body?JSON.parse(init.body):null});
  if(error)return Response.json({msg:'private server detail must not be shown',code:'synthetic_error'},{status:400});
  if(u.pathname.endsWith('/signup'))return Response.json(autoconfirm?session:user);
  if(u.pathname.endsWith('/token'))return Response.json(session);
  if(u.pathname.endsWith('/user'))return Response.json({...user,id:wrongUser?'22222222-2222-4222-8222-222222222222':id});
  if(u.pathname.endsWith('/resend'))return Response.json({});
  throw Error('Unexpected synthetic request');
 }}}));
 return {opened,calls,input:{mode:'signup',email:' synthetic@example.invalid ',password:'synthetic password',confirmation:'synthetic password',origin}};
}

test('signup enforces confirmation/minimum while login preserves existing passwords; redirects reject untrusted origins',()=>{
 assert.equal(validAccountAccess('login','synthetic@example.invalid',' x '),true);
 assert.equal(validAccountAccess('signup','synthetic@example.invalid','short','short'),false);
 assert.equal(validAccountAccess('signup','synthetic@example.invalid','synthetic password','other password'),false);
 assert.equal(accountConfirmationRedirect(origin),'https://conselho-elemental-main.vercel.app/?progresso=conta');
 for(const local of ['http://localhost:5173','http://127.0.0.1:5173','http://[::1]:5173'])assert.equal(accountConfirmationRedirect(local),'https://conselho-elemental-main.vercel.app/?progresso=conta');
 for(const bad of ['http://external.invalid','https://user:password@app.example.invalid','https://app.example.invalid/path','https://app.example.invalid?redirect=elsewhere'])assert.throws(()=>accountConfirmationRedirect(bad),/origem/);
});

test('installed SDK sends explicit signup redirect; confirmation never authenticates or reads progress even with an autoconfirm session',async()=>{
 for(const autoconfirm of [false,true]){
  const f=fixture({autoconfirm});try{
   const result=await accessAccount(f.opened.client,f.input,()=>true);assert.equal(result.kind,'confirmation');assert.equal('userId' in result,false);
   assert.equal(f.calls.length,1);assert.equal(f.calls[0].path,'/auth/v1/signup');assert.equal(f.calls[0].body.email,'synthetic@example.invalid');assert.equal(new URLSearchParams(f.calls[0].search).get('redirect_to'),'https://conselho-elemental-main.vercel.app/?progresso=conta');
   f.opened.dispose();assert.equal((await f.opened.client.auth.getSession()).data.session,null);
  }finally{f.opened.dispose();}
 }
});

test('login requires a server-verified identity matching the sign-in response and never normalizes a password',async()=>{
 const f=fixture();try{
  const result=await accessAccount(f.opened.client,{...f.input,mode:'login',password:' synthetic password '},()=>true);assert.deepEqual(result,{kind:'authenticated',userId:id});assert.equal(f.calls[0].body.password,' synthetic password ');assert.deepEqual(f.calls.map(c=>c.path),['/auth/v1/token','/auth/v1/user']);
 }finally{f.opened.dispose();}
 const g=fixture({wrongUser:true});try{await assert.rejects(accessAccount(g.opened.client,{...g.input,mode:'login'},()=>true),/mesma conta/);}finally{g.opened.dispose();}
});

test('invalid input, stale results and opaque Auth failures never produce an authenticated outcome',async()=>{
 const f=fixture();try{
  await assert.rejects(accessAccount(f.opened.client,{...f.input,confirmation:'wrong'},()=>true),/Confira/);assert.equal(f.calls.length,0);
  let checks=0;await assert.rejects(accessAccount(f.opened.client,f.input,()=>++checks===1),/conferência mudou/);
 }finally{f.opened.dispose();}
 const g=fixture({error:true});try{await assert.rejects(accessAccount(g.opened.client,g.input,()=>true),e=>!e.message.includes('private server detail')&&/Confira seu e-mail/.test(e.message));}finally{g.opened.dispose();}
});

test('resend uses signup purpose and fixed return URL without requiring or transmitting a password',async()=>{
 const f=fixture();try{
  const result=await resendAccountConfirmation(f.opened.client,'synthetic@example.invalid',origin,()=>true);assert.match(result,/Se houver confirmação pendente/);assert.equal(f.calls.length,1);assert.equal(f.calls[0].path,'/auth/v1/resend');assert.equal(f.calls[0].body.type,'signup');assert.equal('password' in f.calls[0].body,false);assert.equal(new URLSearchParams(f.calls[0].search).get('redirect_to'),'https://conselho-elemental-main.vercel.app/?progresso=conta');
 }finally{f.opened.dispose();}
});

test('confirmation tokens at fallback root or other routes are discarded, not adopted as identity',()=>{
 for(const url of [origin+'/#access_token=synthetic&refresh_token=synthetic&type=signup',origin+'/ciclos?access_token=synthetic',origin+'/?code=synthetic',origin+'/?progresso=conta&code=synthetic']){
  let cleaned;assert.equal(captureAccountReturn(url,value=>{cleaned=value;}),'returned');assert.equal(cleaned,'/?progresso=conta');
 }
 let cleaned;assert.equal(captureAccountReturn(origin+'/#error=denied&error_description=private',v=>{cleaned=v;}),'invalid');assert.equal(cleaned,'/?progresso=conta');
 assert.throws(()=>captureAccountReturn(origin+'/#access_token=synthetic',()=>{throw Error('history denied');}),/history denied/);
});

test('ordinary navigation and a distinct calendar OAuth callback are untouched',()=>{
 for(const url of [origin+'/ciclos?data=2026-10-30',origin+'/?progresso=conta',origin+'/integrations/google-calendar/callback?code=synthetic'])assert.equal(captureAccountReturn(url,()=>{throw Error('must not replace');}),'none');
});


test('email configuration and rate limits have actionable messages while opaque errors remain private',()=>{
 const message=module.exports.accountAccessFailure;
 assert.match(message({code:'email_address_not_authorized'},'generic'),/novos testadores/);assert.match(message({code:'over_email_send_rate_limit'},'generic'),/Aguarde/);assert.equal(message({message:'private raw value'},'generic'),'generic');
});
