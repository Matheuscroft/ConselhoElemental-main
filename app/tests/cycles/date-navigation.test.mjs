import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {loadComponent} from '../elemental/load-component.mjs';
const {cycleDateNavigation,isCycleDateSelection,preserveCycleDateScroll}=loadComponent('src/components/cycles/cycle-date-navigation.ts');
const {advanceDailyView}=loadComponent('src/lib/cycles/daily-view.ts');
const {parseDestinyDate}=loadComponent('src/components/destiny/destiny-options.ts');
const normalizeDate=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const source=readFileSync('src/pages/Ciclos.tsx','utf8');

test('actual date callback updates query and can restore selected day after simulated reload',()=>{
 const body=source.slice(source.indexOf('  const selectCalendarDate ='),source.indexOf('  // Navigate days'));
 const js=ts.transpileModule(body+'\nexport { selectCalendarDate };',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 let selected,center;const calls=[],mod={exports:{}};
 new Function('exports','useCallback','normalizeDate','setSelectedDate','setVisibleDaysCenterDate','cycleDateNavigation','destinyParams','destinyAccountId','location','navigate',js)(mod.exports,fn=>fn,normalizeDate,d=>selected=d,d=>center=d,cycleDateNavigation,new URLSearchParams('data=2026-10-30&atividade=habit-a&tab=rotina'),'account-a',{state:{temporalReturn:'/temporal/mes?mes=2026-10&dia=2026-10-30'}},(...args)=>calls.push(args));
 mod.exports.selectCalendarDate(new Date(2026,10,2,17));assert.equal(selected.getDate(),2);assert.equal(center.getMonth(),10);
 const [href,options]=calls[0],query=new URL(href,'https://test.invalid').searchParams;assert.equal(query.get('data'),'2026-11-02');assert.equal(query.has('atividade'),false);assert.equal(query.get('tab'),'rotina');assert.equal(parseDestinyDate(query.get('data')).getTime(),selected.getTime());assert.equal(options.replace,true);assert.equal(options.preventScrollReset,true);assert.equal(options.state.temporalReturn,'/temporal/mes?mes=2026-10&dia=2026-10-30');
 center=null;mod.exports.selectCalendarDate(new Date(2026,10,3),false);assert.equal(center,null);
});

test('route intent acknowledges own selection without resetting filters, but re-applies external and account deep links',()=>{
 const body=source.slice(source.indexOf('  const destinyHabitId ='),source.indexOf('  const dayShortcuts ='));
 const js=ts.transpileModule(body,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const route=cycleDateNavigation('data=2026-10-30',new Date(2026,9,31),'a',null);
 function run(state,account='a',applied='a:day:2026-10-30',params='data=2026-10-31'){
  const effects=[];
  new Function('destinyParams','destinyAccountId','appliedDestinyIntent','findHabitById','habits','parseDestinyDate','isCycleDateSelection','location','setAppliedDestinyIntent','setSelectedDate','setVisibleDaysCenterDate','setWorkspaceView','setCycleFilters',js)(new URLSearchParams(params),account,applied,(_,id)=>id==='habit-a'?{name:'Água'}:null,[],parseDestinyDate,isCycleDateSelection,{state},v=>effects.push(['intent',v]),v=>effects.push(['date',v]),v=>effects.push(['center',v]),v=>effects.push(['view',v]),v=>effects.push(['filters',v]));return effects;
 }
 assert.ok(!run(route.options.state).some(([k])=>k==='filters'||k==='view'||k==='center'));
 assert.ok(run(null).some(([k])=>k==='filters'));
 assert.ok(run(route.options.state,'b').some(([k])=>k==='filters'));
 assert.ok(run(route.options.state,'a',null).some(([k])=>k==='center'),'reload centers the selected day');
 const external=run(null,'a','old','data=2026-10-31&atividade=habit-a');assert.deepEqual(external.find(([k])=>k==='filters')[1],{query:'Água',element:'all',status:'all'});
 assert.equal(run(null,'a','old','data=2026-10-31&atividade=missing').length,0);
});

test('rollover preserves existing follow-today rule and activity context; history stays fixed',()=>{
 const yesterday=new Date(2026,9,30),today=new Date(2026,9,31),history=new Date(2026,9,20);
 const next=advanceDailyView(yesterday,yesterday.toDateString(),today);const route=cycleDateNavigation('data=2026-10-30&atividade=habit-a',next,'a',null,true);
 assert.match(route.href,/data=2026-10-31/);assert.match(route.href,/atividade=habit-a/);assert.equal(isCycleDateSelection(route.options.state,'a:habit-a:2026-10-31'),true);assert.equal(advanceDailyView(history,yesterday.toDateString(),today),history);
 assert.match(source,/if \(activeHabit \|\| document.hidden\) return;/);
 assert.match(source,/if \(nextDate !== selectedDate\) selectCalendarDate\(nextDate, false, true\)/);
});

test('scroll preservation is scoped to internal same-page selection and only safe return state survives',()=>{
 const route=cycleDateNavigation('',new Date(2027,0,1),'a',{temporalReturn:'https://outside.test',secret:'discard'});
 assert.deepEqual(Object.keys(route.options.state).sort(),['cycleDateIntent','cycleDateSelection']);assert.equal(preserveCycleDateScroll('/ciclos','/ciclos',route.options.state),true);
 for(const [previous,path,state] of [[undefined,'/ciclos',route.options.state],['/rituais','/ciclos',route.options.state],['/ciclos','/mapa',route.options.state],['/ciclos','/ciclos',null],['/ciclos','/ciclos',{}]])assert.equal(preserveCycleDateScroll(previous,path,state),false);
 assert.equal(isCycleDateSelection(route.options.state,'other-account:day:2027-01-01'),false);
});
