import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url),tick=()=>new Promise(r=>setImmediate(r));
const flat=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flat):[n,...flat(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
function fixture({released=true,recovery=false,empty=false,pending=false}={}){
 let si,ri,mounted=false,tree,cleanup;const slots=[],refs=[],calls=[];
 const versions={localArchive:empty?null:'local archive',remoteArchive:'online archive',pendingArchive:pending?'pending archive':null};
 const react={useState(initial){const i=si++;if(!(i in slots))slots[i]=initial;return[slots[i],next=>slots[i]=typeof next==='function'?next(slots[i]):next];},useRef(initial){return refs[ri++]??={current:initial};},useEffect(fn){if(!mounted)cleanup=fn();}};
 const mod={exports:{}};const source=ts.transpileModule(readFileSync('src/components/backup/AccountResolutionPanel.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 new Function('require','module','exports',source)(id=>id==='react'?react:id.endsWith('/progress-backup')?{MAX_BACKUP_BYTES:20*1024*1024}:require(id),mod,mod.exports);
 const props={versions:recovery?undefined:versions,resolution:recovery?{direction:'online'}:undefined,busy:false,released,onChoose:(...args)=>calls.push(['choose',...args]),onRecover:retry=>calls.push(['recover',retry]),onKeepLocal:()=>calls.push(['keep'])};
 const render=()=>{si=ri=0;tree=mod.exports.AccountResolutionPanel(props);mounted=true;};render();const nodes=()=>flat(tree);
 return {calls,props,render,content:()=>text(tree),unmount:()=>cleanup(),toggle(i,value=true){nodes().filter(n=>n.type==='input'&&n.props.type==='checkbox')[i].props.onChange({target:{checked:value}});render();},click(label){const n=nodes().find(n=>n.type==='button'&&text(n.props.children)===label);assert.ok(n,label);n.props.onClick();render();},file(i,value,size=10){const n=nodes().filter(n=>n.type==='input'&&n.props.type==='file')[i];n.props.onChange({target:{files:[{size,text:typeof value==='function'?value:async()=>value}],value:'file'}});render();},disabled(label){return nodes().find(n=>n.type==='button'&&text(n.props.children)===label).props.disabled;}};
}
async function verified(f,{empty=false,pending=false}={}){let i=0;if(!empty){f.file(i++,'local archive');await tick();f.render();}f.file(i++,'online archive');await tick();f.render();if(pending){f.file(i,'pending archive');await tick();f.render();}f.toggle(0);f.toggle(1);}

test('choice requires exact saved files, both explicit consents, and preserves separate local/online directions',async()=>{
 const f=fixture({pending:true});f.toggle(0);f.toggle(1);f.click('Usar versão local na conta');assert.deepEqual(f.calls,[]);await verified(f,{pending:true});assert.equal(f.disabled('Usar versão local na conta'),false);f.click('Usar versão local na conta');assert.deepEqual(f.calls,[['choose','local',{local:'local archive',online:'online archive',pending:'pending archive'}]]);f.click('Receber versão online neste dispositivo');assert.equal(f.calls[1][1],'online');f.unmount();
});
test('an empty device can only receive online; closed release and disabled handlers cannot choose',async()=>{
 const empty=fixture({empty:true});await verified(empty,{empty:true});assert.equal(empty.disabled('Usar versão local na conta'),true);empty.click('Usar versão local na conta');assert.deepEqual(empty.calls,[]);empty.click('Receber versão online neste dispositivo');assert.equal(empty.calls[0][1],'online');empty.unmount();
 const closed=fixture({released:false});await verified(closed);closed.click('Receber versão online neste dispositivo');assert.deepEqual(closed.calls,[]);closed.unmount();
});
test('recovery receipt check cannot resend without a separate retry consent; keeping local is also explicit',()=>{
 const f=fixture({recovery:true});f.click('Conferir recibo e concluir escolha');assert.deepEqual(f.calls,[]);f.toggle(0);f.toggle(1);f.click('Conferir recibo e concluir escolha');f.click('Repetir escolha protegida');assert.deepEqual(f.calls,[['recover',false]]);f.toggle(2);f.click('Repetir escolha protegida');f.click('Manter progresso local e reavaliar');assert.deepEqual(f.calls.slice(1),[['recover',true],['keep']]);f.unmount();
});
test('wrong, oversized and late selected files invalidate consent instead of enabling replacement',async()=>{
 const f=fixture();await verified(f);f.file(1,'wrong');await tick();f.render();assert.match(f.content(),/não corresponde/);assert.equal(f.disabled('Receber versão online neste dispositivo'),true);
 let release;f.file(1,()=>new Promise(r=>release=r));f.file(1,'wrong newer');await tick();f.render();release('online archive');await tick();f.render();f.toggle(0);f.toggle(1);assert.equal(f.disabled('Receber versão online neste dispositivo'),true);f.file(0,'local archive',21*1024*1024);await tick();f.render();assert.match(f.content(),/20 MB/);f.unmount();
});
