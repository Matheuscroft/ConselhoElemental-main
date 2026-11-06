import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { loadComponent } from '../elemental/load-component.mjs';
const require=createRequire(import.meta.url);
const flat=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flat):[n,...flat(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
function fixture(){
 let si=0,tree;const slots=[],selected=[],moves=[];
 const mod={exports:{}};const source=ts.transpileModule(readFileSync('src/components/cycles/CycleCalendarNavigation.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 new Function('require','module','exports',source)(id=>{
  if(id==='react')return {useId:()=> 'date',useRef:()=>({current:null}),useState(v){const i=si++;if(!(i in slots))slots[i]=v;return [slots[i],v=>slots[i]=v];}};
  if(id.endsWith('/calendar'))return {Calendar:'Calendar'};
  if(id.endsWith('/dialog'))return Object.fromEntries(['Dialog','DialogContent','DialogDescription','DialogHeader','DialogTitle'].map(k=>[k,k]));
  if(id.includes('temporal/recurrence'))return loadComponent('src/lib/temporal/recurrence.ts');
  return require(id);
 },mod,mod.exports);
 const props={selectedDate:new Date(2026,9,30),onSelect:d=>selected.push(d),onPrevious:()=>moves.push(-7),onNext:()=>moves.push(7),onToday:()=>moves.push('today')};
 function render(){si=0;tree=mod.exports.CycleCalendarNavigation(props);}
 render();return {render,selected,moves,nodes:()=>flat(tree),content:()=>text(tree),open(){flat(tree).find(n=>n.type==='button'&&n.props['aria-haspopup']==='dialog').props.onClick();render();},click(label){flat(tree).find(n=>n.type==='button'&&text(n)===label).props.onClick();render();},date(value){flat(tree).find(n=>n.type==='input').props.onChange({target:{value}});render();},submit(){flat(tree).find(n=>n.type==='form').props.onSubmit({preventDefault(){}});render();},get isOpen(){return flat(tree).find(n=>n.type==='Dialog').props.open;}};
}

test('opening the selected date never jumps to today; weekday/window actions stay separate',()=>{
 const f=fixture();f.open();assert.equal(f.isOpen,true);assert.deepEqual(f.moves,[]);assert.deepEqual(f.selected,[]);assert.equal(f.nodes().find(n=>n.type==='input').props.value,'2026-10-30');
 for(const label of ['Mostrar sete dias anteriores','Mostrar próximos sete dias'])f.nodes().find(n=>n.props?.['aria-label']===label).props.onClick();assert.deepEqual(f.moves,[-7,7]);f.click('Cancelar');assert.equal(f.isOpen,false);assert.deepEqual(f.selected,[]);f.click('Voltar para hoje');assert.deepEqual(f.moves,[-7,7,'today']);
});

test('month starts at selected date, uses Portuguese and selects exactly once before closing',()=>{
 const f=fixture();f.open();const cal=f.nodes().find(n=>n.type==='Calendar');assert.equal(cal.props.locale.code,'pt-BR');assert.equal(cal.props.defaultMonth.getMonth(),9);cal.props.onSelect(undefined);assert.equal(f.selected.length,0);cal.props.onSelect(new Date(2028,1,29,18,30));f.render();assert.equal(f.isOpen,false);assert.equal(f.selected.length,1);assert.equal(f.selected[0].getHours(),0);assert.equal(f.selected[0].getDate(),29);
});

test('direct date handles year changes and rejects impossible date without discarding input',()=>{
 const f=fixture();f.open();f.date('2027-02-30');f.submit();assert.equal(f.selected.length,0);assert.equal(f.isOpen,true);assert.match(f.content(),/data válida/);assert.equal(f.nodes().find(n=>n.type==='input').props.value,'2027-02-30');f.date('2028-02-29');f.submit();assert.equal(f.selected.length,1);assert.equal(f.selected[0].getFullYear(),2028);assert.equal(f.isOpen,false);
});

test('cancel does not select the edited day; reopening resets unconfirmed input',()=>{
 const f=fixture();f.open();f.date('2030-12-31');f.click('Cancelar');assert.equal(f.selected.length,0);f.open();assert.equal(f.nodes().find(n=>n.type==='input').props.value,'2026-10-30');f.click('Ir para hoje');assert.deepEqual(f.moves,['today']);assert.equal(f.isOpen,false);assert.equal(f.selected.length,0);
});


test('closing returns keyboard focus to the date selector without moving the page',()=>{
 const f=fixture();const trigger=f.nodes().find(n=>n.props?.['aria-haspopup']==='dialog');let focused,prevented=false;trigger.props.ref.current={focus:options=>focused=options};const content=f.nodes().find(n=>n.type==='DialogContent');content.props.onCloseAutoFocus({preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.deepEqual(focused,{preventScroll:true});assert.equal(trigger.props['aria-controls'],content.props.id);
});
