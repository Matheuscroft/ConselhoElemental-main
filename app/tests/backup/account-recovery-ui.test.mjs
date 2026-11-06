import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync('src/components/backup/AccountRecoveryWorkspace.tsx','utf8').replaceAll('import.meta.env.VITE_SUPABASE_URL',"'https://synthetic.invalid'").replaceAll('import.meta.env.VITE_SUPABASE_ANON_KEY',"'synthetic'"),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function fixture({released=true,callback=true}={}){
 const values=[];let cursor=0,initialized=false,cleanup,tree,constructions=0,disposals=0,taken=0;
 const calls=[];
 const hook=initial=>{const at=cursor++;if(!(at in values))values[at]=initial;return [values[at],value=>{values[at]=value;}];};
 const react={useState:hook,useRef:initial=>hook({current:initial})[0],useEffect:fn=>{if(!initialized)cleanup=fn();}};
 const jsx=(type,props)=>({type,props:props??{}});
 const entry={kind:callback?'callback':'request',takeCode(){taken++;return taken===1?'synthetic-code':null;}};
 const controller={dispose(){disposals++;},request(...args){return pending('request',args);},exchange(...args){return pending('exchange',args);},update(...args){return pending('update',args);}};
 function pending(name,args){return new Promise((resolve,reject)=>calls.push({name,args,resolve,reject}));}
 const exports={};
 new Function('require','exports','window','navigator',source)(id=>{
  if(id==='react')return react;if(id==='react/jsx-runtime')return {jsx,jsxs:jsx};if(id==='lucide-react')return {ArrowLeft:'icon',KeyRound:'icon'};
  if(id.endsWith('account-release'))return {ACCOUNT_TRANSFER_WRITES_RELEASED:released};
  if(id.endsWith('account-recovery'))return {createPasswordRecovery(){constructions++;return controller;}};
  throw Error('Unexpected UI dependency '+id);
 },exports,{location:{origin:'https://app.example.invalid'},localStorage:{}},{locks:{}});
 function render(){cursor=0;tree=exports.AccountRecoveryWorkspace({entry});initialized=true;}
 const nodes=()=>{const out=[];function visit(n){if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(visit);return;}out.push(n);visit(n.props?.children);}visit(tree);return out;};
 function text(n){if(n==null||typeof n==='boolean')return '';if(typeof n==='string'||typeof n==='number')return String(n);if(Array.isArray(n))return n.map(text).join('');return text(n.props?.children);}
 render();return {calls,render,get constructions(){return constructions;},get disposals(){return disposals;},get taken(){return taken;},content:()=>text(tree),click(label){const b=nodes().find(n=>n.type==='button'&&text(n)===label);assert.ok(b,label);b.props.onClick?.();render();},fill(type,value,index=0){nodes().filter(n=>n.type==='input'&&n.props.type===type)[index].props.onChange({target:{value}});render();},submit(){nodes().find(n=>n.type==='form').props.onSubmit({preventDefault(){}});render();},unmount(){cleanup();}};
}

test('closed release rejects forced recovery handlers before Auth construction or code consumption',async()=>{
 const f=fixture({released:false});f.click('Validar meu link');f.fill('email','synthetic@example.invalid');f.submit();await tick();f.render();assert.equal(f.constructions,0);assert.equal(f.taken,0);assert.equal(f.calls.length,0);assert.match(f.content(),/em preparação/);f.unmount();
});

test('explicit code validation, matching passwords and separate confirmation control the update; double taps do not duplicate it',async()=>{
 const f=fixture();f.click('Validar meu link');f.click('Validar meu link');await tick();f.render();assert.equal(f.calls.length,1);assert.equal(f.calls[0].name,'exchange');assert.equal(f.taken,1);
 f.calls[0].resolve({email:'synthetic@example.invalid',userId:'synthetic'});await tick();f.render();assert.match(f.content(),/Conta conferida/);
 f.fill('password','synthetic new password',0);f.fill('password','different password',1);assert.match(f.content(),/não coincidem/);f.submit();await tick();assert.equal(f.calls.length,1);
 f.fill('password','synthetic new password',1);f.submit();f.submit();await tick();assert.equal(f.calls.length,2);assert.deepEqual(f.calls[1].args,['synthetic new password']);f.calls[1].resolve({logoutConfirmed:true});await tick();f.render();assert.match(f.content(),/Senha atualizada/);assert.equal(f.disposals,1);assert.equal(f.constructions,1);f.unmount();
});

test('resending uses one isolated client for the document and has no App handoff',async()=>{
 const f=fixture({callback:false});f.fill('email','synthetic@example.invalid');f.submit();await tick();f.calls[0].resolve('Generic request accepted');await tick();f.render();f.submit();await tick();assert.equal(f.constructions,1);assert.equal(f.calls[1].name,'request');f.calls[1].resolve('Generic request accepted');await tick();f.render();assert.match(f.content(),/Generic request accepted/);f.unmount();assert.equal(f.disposals,1);
});

test('unmount during validation disposes the owned client and ignores late identity results',async()=>{
 const f=fixture();f.click('Validar meu link');await tick();f.unmount();f.calls[0].resolve({email:'synthetic@example.invalid'});await tick();f.render();assert.doesNotMatch(f.content(),/Conta conferida/);assert.equal(f.disposals,1);
});
