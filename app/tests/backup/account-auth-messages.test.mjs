import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createClient} from '@supabase/supabase-js';
import {AuthApiError,AuthRetryableFetchError} from '@supabase/auth-js';
import ts from 'typescript';

const mod={exports:{}};new Function('exports',ts.transpileModule(readFileSync('src/lib/backup/account-auth-messages.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.Latest,module:ts.ModuleKind.CommonJS}}).outputText)(mod.exports);
const {accountAuthMessage,AccountAuthError,accountErrorCode}=mod.exports;
const api=(code,status)=>new AuthApiError('private server detail synthetic@example.invalid token key',status,code);
const m=(error,action,fallback='fallback')=>accountAuthMessage(error,action,fallback);

test('login maps each known code to a specific safe message with its technical code',()=>{
 assert.match(m(api('email_not_confirmed',400),'login').message,/Confirme seu e-mail.*Reenviar confirmação/);
 assert.equal(m(api('email_not_confirmed',400),'login').code,'email_not_confirmed');
 assert.deepEqual(m(api('invalid_credentials',400),'login'),{message:'E-mail ou senha incorretos.',code:'invalid_credentials'});
 assert.equal(m(api('over_request_rate_limit',429),'login').message,'Muitas tentativas. Aguarde alguns minutos.');
 assert.equal(m(api(undefined,429),'login').message,'Muitas tentativas. Aguarde alguns minutos.');
 assert.equal(m(api(undefined,429),'login').code,'http_429');
});
test('unknown account and wrong password share one login message',()=>{
 // GoTrue answers invalid_credentials for both; the mapping depends only on the code.
 assert.equal(m(api('invalid_credentials',400),'login').message,m({code:'invalid_credentials',status:400,message:'user not found'},'login').message);
});
test('signup maps rate limit, beta allow-list, weak password and closed signup',()=>{
 assert.match(m(api('over_email_send_rate_limit',429),'signup').message,/envio de e-mails está no limite/);
 assert.match(m(api('email_address_not_authorized',400),'signup').message,/fase do beta/);
 assert.match(m(api('weak_password',422),'signup').message,/senha é fraca.*8 caracteres/);
 assert.match(m(api('signup_disabled',422),'signup').message,/cadastro está fechado/);
 assert.match(m(api('email_address_not_authorized',400),'resend').message,/fase do beta/);
 assert.equal(m(api('over_email_send_rate_limit',429),'resend').message,m(api('over_email_send_rate_limit',429),'signup').message);
});
test('password reset shows a send-limit message but never account-dependent ones',()=>{
 assert.match(m(api('over_email_send_rate_limit',429),'reset').message,/limite/);
 assert.match(m(api(undefined,429),'reset').message,/limite/);
 assert.equal(m(api('email_address_not_authorized',400),'reset','generic').message,'generic');
 assert.equal(m(api('user_not_found',400),'reset','generic').message,'generic');
});
test('network failures and 5xx have their own messages in every action',()=>{
 for(const action of ['login','signup','resend','reset']){
  assert.equal(m(new AuthRetryableFetchError('fetch failed',0),action).message,'Sem conexão com o servidor. Verifique a internet.');
  assert.equal(m(new TypeError('fetch failed'),action).message,'Sem conexão com o servidor. Verifique a internet.');
  assert.equal(m(new AuthRetryableFetchError('x',503),action).message,'O serviço de conta está indisponível. Tente de novo em instantes.');
  assert.equal(m(api(undefined,500),action).message,'O serviço de conta está indisponível. Tente de novo em instantes.');
 }
});
test('unknown failures fall back and no message leaks email, token or key',()=>{
 assert.deepEqual(m({message:'secret'},'login','fallback'),{message:'fallback',code:null});
 assert.equal(m(api('some_new_code',400),'login').message,'fallback');
 const errors=[api('email_not_confirmed',400),api('invalid_credentials',400),api('over_request_rate_limit',429),api('over_email_send_rate_limit',429),api('email_address_not_authorized',400),api('weak_password',422),api('signup_disabled',422),api(undefined,500),new TypeError('fetch failed synthetic@example.invalid')];
 for(const action of ['login','signup','resend','reset'])for(const e of errors){const r=m(e,action);assert.doesNotMatch(r.message+' '+(r.code??''),/@|token|\bkey\b|https?:|synthetic|private/i);}
 assert.equal(m(api('Weird Code!',400),'login').code,'http_400');
});
test('AccountAuthError carries only the safe code',()=>{
 const e=new AccountAuthError({message:'msg',code:'invalid_credentials'});
 assert.equal(e.message,'msg');assert.equal(accountErrorCode(e),'invalid_credentials');
 assert.equal(accountErrorCode(new Error('x')),null);assert.equal(accountErrorCode(Object.assign(new Error('x'),{code:'leak'})),null);
});
