import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from '../backup/load-progress.mjs';
import {loadComponent} from '../elemental/load-component.mjs';
const {attachTimerRuntime,TIMER_SESSION_KEY}=loadComponent('src/lib/timer/runtime.ts');
const {elapsedTimerSeconds}=loadComponent('src/lib/timer/clock.ts');
function surface(){const map=new Map(),document=new EventTarget();document.visibilityState='visible';const win=new EventTarget();Object.assign(win,{document,sessionStorage:{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},setInterval:fn=>{win.interval=fn;return 1;},clearInterval:()=>{win.interval=null;}});return win;}
function setup(){const f=fixture(),h=f.core.getState().addHabit({name:'Atividade temporária',elementId:'agua',plannedPoints:2,plannedTimeMinutes:0});return{...f,h};}
const instant=Date.UTC(2026,10,7,15);

test('elapsed time survives omitted callbacks, pause, resume and stop without manufacturing completion or XP',t=>{
 t.mock.timers.enable({apis:['Date'],now:instant});const f=setup(),s=f.core;
 s.getState().startTimer(f.h.id,'HABIT',new Date(2026,10,7));t.mock.timers.tick(600000);
 s.getState().pauseTimer();assert.equal(s.getState().timer.elapsedSeconds,600);
 t.mock.timers.tick(3600000);s.getState().tickTimer();assert.equal(s.getState().timer.elapsedSeconds,600);
 s.getState().resumeTimer();t.mock.timers.tick(30000);s.getState().resumeTimer();s.getState().tickTimer();assert.equal(s.getState().timer.elapsedSeconds,630);
 t.mock.timers.tick(7000);assert.equal(s.getState().stopTimer(),637);
 assert.equal(s.getState().habits[0].elapsedSeconds,637);assert.equal(s.getState().habits[0].completions.length,0);assert.equal(s.getState().user.xp_water,0);
});

test('visibility wake-up and reload recover a running local timer in the same tab, with no domain/XP transfer',t=>{
 t.mock.timers.enable({apis:['Date'],now:instant});const f=setup(),win=surface(),off=attachTimerRuntime(f.core,win);
 f.core.getState().startTimer(f.h.id,'HABIT',new Date(2026,10,7));win.document.visibilityState='hidden';win.document.dispatchEvent(new Event('visibilitychange'));
 t.mock.timers.tick(420000);win.interval();assert.equal(f.core.getState().timer.elapsedSeconds,0);
 win.document.visibilityState='visible';win.document.dispatchEvent(new Event('visibilitychange'));assert.equal(f.core.getState().timer.elapsedSeconds,420);off();
 const reloaded=fixture([],f.memory);assert.equal(reloaded.core.getState().timer.entityId,null);
 t.mock.timers.tick(8000);const cleanup=attachTimerRuntime(reloaded.core,win);
 assert.equal(reloaded.core.getState().timer.entityId,f.h.id);assert.equal(reloaded.core.getState().timer.elapsedSeconds,428);assert.equal(reloaded.core.getState().timer.activityDate,'2026-11-07');assert.equal(reloaded.core.getState().user.xp_water,0);
 reloaded.core.getState().stopTimer();assert.equal(win.sessionStorage.getItem(TIMER_SESSION_KEY),null);cleanup();
});

test('paused timer survives reload, owner mismatch and missing activity refuse recovery; malformed storage never alters domain',t=>{
 t.mock.timers.enable({apis:['Date'],now:instant});const f=setup(),win=surface(),off=attachTimerRuntime(f.core,win);f.core.getState().startTimer(f.h.id,'HABIT');t.mock.timers.tick(9000);f.core.getState().pauseTimer();off();
 t.mock.timers.tick(500000);const next=fixture([],f.memory),cleanup=attachTimerRuntime(next.core,win);assert.equal(next.core.getState().timer.elapsedSeconds,9);assert.equal(next.core.getState().timer.isRunning,false);cleanup();
 const saved=win.sessionStorage.getItem(TIMER_SESSION_KEY);
 for(const mutate of [s=>s.updateUser({id:'different-local-owner'}),s=>s.deleteHabit(f.h.id)]){const another=fixture([],new Map(f.memory));mutate(another.core.getState());win.sessionStorage.setItem(TIMER_SESSION_KEY,saved);const done=attachTimerRuntime(another.core,win);assert.equal(another.core.getState().timer.entityId,null);assert.equal(win.sessionStorage.getItem(TIMER_SESSION_KEY),null);done();}
 win.sessionStorage.setItem(TIMER_SESSION_KEY,'broken');const before=JSON.stringify(f.core.getState().user),done=attachTimerRuntime(f.core,win);assert.equal(JSON.stringify(f.core.getState().user),before);done();
});

test('reopening cannot reset a current timer, and device clock rollback never decreases displayed seconds',t=>{
 t.mock.timers.enable({apis:['Date'],now:instant});const f=setup();f.core.getState().startTimer(f.h.id,'HABIT');t.mock.timers.tick(5000);f.core.getState().tickTimer();
 f.core.getState().startTimer(f.h.id,'HABIT');f.core.getState().startTimer('another','TASK');assert.equal(f.core.getState().timer.entityId,f.h.id);assert.equal(f.core.getState().timer.elapsedSeconds,5);
 assert.equal(elapsedTimerSeconds(f.core.getState().timer,instant-100000),5);
});

test('completion elsewhere removes the operational timer without paying twice; unavailable session storage never blocks the clock',t=>{
 t.mock.timers.enable({apis:['Date'],now:instant});const f=setup(),win=surface();let warnings=0;win.sessionStorage={getItem(){throw Error('quota');},setItem(){throw Error('quota');},removeItem(){throw Error('quota');}};
 const cleanup=attachTimerRuntime(f.core,win,()=>warnings++);f.core.getState().startTimer(f.h.id,'HABIT');t.mock.timers.tick(8000);win.interval();assert.equal(f.core.getState().timer.elapsedSeconds,8);assert.ok(warnings>0);
 f.core.getState().completeHabit(f.h.id,0,new Date());assert.equal(f.core.getState().timer.entityId,null);assert.equal(f.core.getState().user.xp_water,2);cleanup();
});
