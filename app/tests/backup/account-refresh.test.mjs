import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const built=await build({entryPoints:['src/lib/backup/account-session-refresh.ts'],bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent'});
const m={exports:{}};new Function('module','exports',built.outputFiles[0].text)(m,m.exports);
const {attachSessionRefresh}=m.exports;
const tick=()=>new Promise(r=>setImmediate(r));
function fixture(){const listeners=new Set(),calls=[];const surface={visibilityState:'visible',addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)};const auth={async startAutoRefresh(){calls.push('start');},async stopAutoRefresh(){calls.push('stop');}};return{surface,auth,calls,listeners,change(state){surface.visibilityState=state;listeners.forEach(fn=>fn());}};}
test('live refresh follows visibility and cleanup removes listener and stops once',async()=>{
 const f=fixture();let failed=0;const stop=attachSessionRefresh(f.auth,f.surface,()=>failed++);await tick();assert.deepEqual(f.calls,['start']);f.change('hidden');await tick();assert.deepEqual(f.calls,['start','stop']);f.change('visible');await tick();assert.deepEqual(f.calls,['start','stop','start']);stop();stop();await tick();assert.equal(f.listeners.size,0);assert.deepEqual(f.calls,['start','stop','start','stop']);assert.equal(failed,0);
});
test('late async start is followed by stop; queued visibility changes cannot restart disposed session',async()=>{
 const f=fixture();let release;f.auth.startAutoRefresh=()=>{f.calls.push('start');return new Promise(r=>release=r);};const stop=attachSessionRefresh(f.auth,f.surface,()=>assert.fail('unexpected failure'));await tick();f.change('hidden');f.change('visible');stop();release();await tick();assert.deepEqual(f.calls,['start','stop']);assert.equal(f.listeners.size,0);
});
test('refresh failures invalidate only active session; hidden initial documents do not start refresh',async()=>{
 const f=fixture();f.surface.visibilityState='hidden';let failures=0;const stop=attachSessionRefresh(f.auth,f.surface,()=>failures++);await tick();assert.deepEqual(f.calls,['stop']);f.auth.startAutoRefresh=async()=>{throw Error('synthetic failure');};f.change('visible');await tick();assert.equal(failures,1);stop();await tick();assert.equal(f.listeners.size,0);
});
