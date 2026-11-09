import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const transpile=file=>ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function fixture(){
 const core=new Set(),fitness=new Set(),status=new Set(),events=new Map(),docEvents=new Map(),timers=new Map();let next=0,phase='idle',flushes=0,stops=0;
 const add=(map,key,fn)=>{const list=map.get(key)??new Set();list.add(fn);map.set(key,list);};
 const surface={document:{visibilityState:'visible',addEventListener:(k,fn)=>add(docEvents,k,fn),removeEventListener:(k,fn)=>docEvents.get(k)?.delete(fn)},addEventListener:(k,fn)=>add(events,k,fn),removeEventListener:(k,fn)=>events.get(k)?.delete(fn)};
 const sync={getSnapshot:()=>({status:phase,message:phase}),subscribe:fn=>{status.add(fn);return()=>status.delete(fn);},flush:async()=>{if(['pending','blocked','stopped'].includes(phase))return;flushes++;phase='saved';},stop(){stops++;phase='stopped';for(const fn of status)fn();},invalidate(){sync.stop();}};
 const mod={exports:{}};new Function('require','module','exports','setTimeout','clearTimeout',transpile('src/lib/backup/attach-account-sync.ts'))(id=>{
 if(id.endsWith('/appStore'))return {useAppStore:{subscribe:fn=>{core.add(fn);return()=>core.delete(fn);}}};if(id.endsWith('/workoutStore'))return {useWorkoutStore:{subscribe:fn=>{fitness.add(fn);return()=>fitness.delete(fn);}}};
 return id.endsWith('account-resolution-key')?{ACCOUNT_RESOLUTION_KEY:'resolution'}:id.endsWith('progress-backup')?{STORE_KEYS:{core:'core',fitness:'fitness'}}:id.endsWith('account-binding')?{ACCOUNT_BINDING_KEY:'binding'}:id.endsWith('account-intent')?{ACCOUNT_INTENT_KEY:'intent'}:id.endsWith('progress-mode')?{LOCAL_PROGRESS_MODE_KEY:'mode'}:{RESTORE_JOURNAL_KEY:'journal'};
 },mod,mod.exports,fn=>{const id=++next;timers.set(id,fn);return id;},id=>timers.delete(id));
 const detach=mod.exports.attachAccountSync(sync,surface);
 return {core,fitness,status,events,docEvents,timers,detach,get flushes(){return flushes;},get stops(){return stops;},change(){for(const fn of core)fn({tasks:[1]},{tasks:[]});for(const fn of fitness)fn();},setPhase(v){phase=v;for(const fn of status)fn();},async tick(){for(const [id,fn]of [...timers]){timers.delete(id);await fn();}},emit(k,event={}){for(const fn of events.get(k)??[])fn(event);}};
}
test('both real adapter subscriptions debounce changes, pause on pending, and release all handlers on pagehide',async()=>{
 const f=fixture();assert.equal(f.timers.size,1);f.change();f.change();assert.equal(f.timers.size,1);assert.equal(f.flushes,0);await f.tick();assert.equal(f.flushes,1);
 f.change();f.setPhase('pending');assert.equal(f.timers.size,0);f.change();assert.equal(f.timers.size,0);f.emit('pagehide');assert.equal(f.core.size,0);assert.equal(f.fitness.size,0);assert.equal([...f.events.values()].some(s=>s.size),false);assert.equal([...f.docEvents.values()].some(s=>s.size),false);f.detach();assert.equal(f.stops,1);
});
test('foreign storage mutation stops the session; unrelated keys and stopped timers cannot save',async()=>{
 const f=fixture();f.emit('storage',{key:'unrelated'});assert.equal(f.stops,0);f.emit('storage',{key:'binding'});assert.equal(f.stops,1);assert.equal(f.timers.size,0);await f.tick();assert.equal(f.flushes,0);f.detach();
});
test('status panel presents explicit sync state, a manual check, and stops before leaving the document',()=>{
 const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};const view={status:'saved',message:'Arquivo confirmado'},calls=[];const sync={getSnapshot:()=>view,subscribe(){},flush:()=>calls.push('flush'),forgetAccess:()=>{calls.push('forget');return true;}};
 const mod={exports:{}};new Function('require','module','exports','window',transpile('src/components/backup/AccountSyncStatus.tsx'))(id=>id==='react'?{useSyncExternalStore:(_,get)=>get()}:id==='react/jsx-runtime'?jsx:id==='lucide-react'?{CloudCheck:()=>null,CloudOff:()=>null}:{},mod,mod.exports,{location:{assign:url=>calls.push(url)}});
 const flat=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flat):[n,...flat(n.props?.children)];let nodes=flat(mod.exports.AccountSyncStatus({sync}));const buttons=nodes.filter(n=>n.type==='button');buttons[0].props.onClick();buttons[1].props.onClick();assert.deepEqual(calls,['flush','forget','/auth']);
 view.status='pending';nodes=flat(mod.exports.AccountSyncStatus({sync}));assert.ok(nodes.some(n=>n.props?.role==='status'));nodes.find(n=>n.type==='button').props.onClick();assert.deepEqual(calls.slice(-2),['forget','/?progresso=conta']);
});

function mountFixture({lease=true,local=true,lateIdentity=false}={}){
 const calls=[];let view={status:'saved'},watch;const listeners=new Set();let stopped=false;
 const sync={getSnapshot:()=>view,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},flush:async()=>calls.push('check'),forgetAccess(){sync.stop();return true;},invalidate(){sync.stop();},stop(){if(stopped)return;stopped=true;view={status:'stopped'};calls.push('stop');for(const fn of listeners)fn();}};
 const session={watchIdentity:fn=>{watch=fn;return()=>calls.push('unwatch');}};
 const mod={exports:{}};new Function('require','module','exports','window',transpile('src/mount-account-app.ts'))(id=>{
 if(id.endsWith('account-live-sync'))return {createLiveAccountSync:()=>{calls.push('controller');return sync;}};
 if(id.endsWith('progress-startup'))return {hasExclusiveProgressSession:()=>lease};
 if(id.endsWith('progress-mode'))return {isRestoredLocalDocument:()=>local,markLiveAccountDocument:()=>calls.push('live-document')};
 if(id.endsWith('bootstrap-app')){calls.push('bootstrap-import');if(lateIdentity)watch();return {mountApp:()=>calls.push('mount')};}
 if(id.endsWith('attach-account-sync'))return {attachAccountSync:()=>{calls.push('attach');return()=>calls.push('detach');}};
 throw Error(id);
 },mod,mod.exports,{location:{origin:'http://fixture.test'},localStorage:{}});
 return {calls,start:()=>mod.exports.mountAccountApp({},session),invalidate:()=>watch()};
}
test('online mount requires isolation/exclusive lease; identity loss during lazy import never mounts the application',async()=>{
 for(const options of [{lease:false},{local:false}]){const f=mountFixture(options);await assert.rejects(f.start(),/conferência/);assert.deepEqual(f.calls,[]);}
 const f=mountFixture({lateIdentity:true});await assert.rejects(f.start(),/sessão mudou/);assert.equal(f.calls.includes('mount'),false);assert.equal(f.calls.includes('attach'),false);assert.ok(f.calls.includes('stop'));
});
test('accepted online mount subscribes only after preflight and drops its identity watch when stopped',async()=>{
 const f=mountFixture(),close=await f.start();assert.deepEqual(f.calls,['controller','check','bootstrap-import','live-document','mount','attach']);f.invalidate();await new Promise(r=>setImmediate(r));assert.ok(f.calls.includes('unwatch'));close();assert.ok(f.calls.includes('detach'));
});


test('timer-only renders do not queue another whole-account check',async()=>{
 const f=fixture();await f.tick();assert.equal(f.flushes,1);
 const tasks=[];for(const fn of f.core)fn({tasks,timer:{elapsedSeconds:42}},{tasks,timer:{elapsedSeconds:41}});
 assert.equal(f.timers.size,0);f.change();assert.equal(f.timers.size,1);f.detach();
});
