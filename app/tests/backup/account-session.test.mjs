import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {createClient} from '@supabase/supabase-js';
const source=await build({stdin:{contents:`export * from './src/lib/backup/account-session';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,external:['@supabase/supabase-js'],logLevel:'silent'});
let constructions=0;const mod={exports:{}};
new Function('require','module','exports',source.outputFiles[0].text)(id=>id==='@supabase/supabase-js'?{createClient:()=>{constructions++;throw Error('Unrequested client');}}:createRequire(import.meta.url)(id),mod,mod.exports);
const {createAccountReviewSession}=mod.exports;

test('import/missing config do not create a client, and explicit construction pins memory-only auth options',()=>{
 assert.equal(constructions,0);assert.throws(()=>createAccountReviewSession({}),/continua local/);assert.throws(()=>createAccountReviewSession({url:'http://external.invalid',key:'synthetic'}),/revisão/);assert.equal(constructions,0);
 let options,stops=0;const session=createAccountReviewSession({url:'https://synthetic.invalid',key:'synthetic'},(_,__,value)=>{options=value;return {auth:{stopAutoRefresh:()=>{stops++;}}};});
 assert.equal(options.auth.persistSession,true);assert.match(options.auth.storageKey,/^ce-account-review-memory-/);assert.equal(options.auth.autoRefreshToken,false);assert.equal(options.auth.detectSessionInUrl,false);assert.equal(options.auth.storage.getItem('anything'),null);options.auth.storage.setItem('synthetic-session','not a real token');assert.equal(options.auth.storage.getItem('synthetic-session'),'not a real token');session.dispose();assert.equal(options.auth.storage.getItem('synthetic-session'),null);assert.equal(stops,1);
});

test('installed SDK can sign in using only synthetic fetch responses and memory; no external session storage is consulted',async()=>{
 const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'synthetic@example.invalid',created_at:new Date().toISOString()},calls=[];
 const b64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');const token=b64({alg:'HS256',typ:'JWT'})+'.'+b64({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated'})+'.synthetic-signature';
 const opened=createAccountReviewSession({url:'https://synthetic.invalid',key:'synthetic-public-key'},(url,key,options)=>createClient(url,key,{...options,global:{fetch:async(input)=>{
  const path=new URL(String(input)).pathname;calls.push(path);if(path.endsWith('/token'))return Response.json({access_token:token,refresh_token:'synthetic-refresh',expires_in:3600,token_type:'bearer',user});if(path.endsWith('/user'))return Response.json(user);throw Error('Unexpected synthetic Auth request '+path);
 }}}));
 assert.equal((await opened.client.auth.getSession()).data.session,null);assert.deepEqual(calls,[]);
 const signed=await opened.client.auth.signInWithPassword({email:user.email,password:'synthetic test password'});assert.equal(signed.error,null);assert.equal(signed.data.user.id,user.id);
 assert.equal((await opened.client.auth.getUser()).data.user.id,user.id);assert.equal((await opened.client.auth.getSession()).data.session.access_token,token);assert.ok(calls.every(path=>['/auth/v1/token','/auth/v1/user'].includes(path)));const before=calls.length;opened.dispose();assert.equal((await opened.client.auth.getSession()).data.session,null);assert.equal(calls.length,before);
});

test('disposed memory session cannot be repopulated by late SDK writes or promoted again',()=>{
 let options;const opened=createAccountReviewSession({url:'https://synthetic.invalid',key:'synthetic'},(_,__,opts)=>{options=opts;return{auth:{stopAutoRefresh:async()=>{}}};});
 options.auth.storage.setItem('synthetic-session','not a real token');opened.dispose();opened.dispose();options.auth.storage.setItem('synthetic-session','late synthetic token');assert.equal(options.auth.storage.getItem('synthetic-session'),null);assert.throws(()=>opened.startLiveRefresh({visibilityState:'visible',addEventListener(){},removeEventListener(){}},()=>{}),/encerrada/);
});

test('late sign-in response in the installed SDK cannot retain a session after disposal',async()=>{
 let release,started;const waiting=new Promise(resolve=>{release=resolve;}),sent=new Promise(resolve=>{started=resolve;});
 const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',email:'synthetic@example.invalid',created_at:new Date().toISOString()};
 const b64=v=>Buffer.from(JSON.stringify(v)).toString('base64url'),token=b64({alg:'HS256'})+'.'+b64({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})+'.synthetic';
 const opened=createAccountReviewSession({url:'https://synthetic.invalid',key:'synthetic-public-key'},(url,key,options)=>createClient(url,key,{...options,global:{fetch:async()=>{started();await waiting;return Response.json({access_token:token,refresh_token:'synthetic-refresh',expires_in:3600,token_type:'bearer',user});}}}));
 const pending=opened.client.auth.signInWithPassword({email:user.email,password:'synthetic password'});await sent;opened.dispose();release();await pending;assert.equal((await opened.client.auth.getSession()).data.session,null);
});


test('installed SDK restores an expired synthetic access token by refreshing and checking the user in memory',async()=>{
 const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'synthetic@example.invalid',created_at:new Date().toISOString()},calls=[];
 const b64=v=>Buffer.from(JSON.stringify(v)).toString('base64url'),jwt=exp=>b64({alg:'HS256'})+'.'+b64({sub:user.id,exp})+'.c3ludGhldGlj';
 const expired=jwt(Math.floor(Date.now()/1000)-60),fresh=jwt(Math.floor(Date.now()/1000)+3600);
 const opened=createAccountReviewSession({url:'https://synthetic.invalid',key:'synthetic-public-key'},(url,key,options)=>createClient(url,key,{...options,global:{fetch:async input=>{
  const path=new URL(String(input)).pathname;calls.push(path);
  if(path.endsWith('/token'))return Response.json({access_token:fresh,refresh_token:'rotated-synthetic',expires_in:3600,token_type:'bearer',user});
  if(path.endsWith('/user'))return Response.json(user);throw Error('Unexpected request');
 }}}));
 try{const result=await opened.client.auth.setSession({access_token:expired,refresh_token:'synthetic-refresh'});assert.equal(result.error,null);assert.equal(result.data.session.access_token,fresh);assert.equal((await opened.client.auth.getUser()).data.user.id,user.id);assert.equal((await opened.client.auth.getSession()).data.session.refresh_token,'rotated-synthetic');assert.deepEqual(calls,['/auth/v1/token','/auth/v1/user']);}
 finally{opened.dispose();}assert.equal((await opened.client.auth.getSession()).data.session,null);
});
