import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fixture } from './load-store.mjs';
import { loadComponent } from '../elemental/load-component.mjs';
const { dailyDateKey, dailyQuantity, validateDailyTracking } = loadComponent('src/lib/cycles/daily-tracking.ts');
const { newCycleCompletion } = loadComponent('src/components/cycles/completion-event.ts');
const { CycleDailyCounter } = loadComponent('src/components/cycles/CycleDailyCounter.tsx');
const date = day => new Date(2026,9,day,12);
function configured(extra = {}) {
  const { store, memory } = fixture();
  const habit = store.getState().addHabit({ name: 'Água teste isolado', startDate: date(1), ...extra });
  store.getState().configureHabitDailyTracking(habit.id, { target: 3, step: 1, unit: 'L' });
  return { store, memory, id: habit.id, current: () => store.getState().habits.find(h => h.id === habit.id) };
}

test('quantities exceed the goal without rewards, completion, streak or extra fixed subitems', () => {
  const f = configured(); const user = JSON.stringify(f.store.getState().user);
  for (let i=0; i<4; i++) f.store.getState().recordHabitQuantity(f.id, date(25));
  const h = f.current();
  assert.equal(dailyQuantity(h.dailyEntries,date(25),'L').total,4);
  assert.equal(h.completions.length,0); assert.equal(h.childHabits.length,0); assert.equal(h.streak,0);
  assert.equal(JSON.stringify(f.store.getState().user),user);
  assert.deepEqual(f.store.getState().actions.find(a=>a.id===f.id).dailyEntries,h.dailyEntries);
});

test('next day starts at zero without deleting history; fractional records and per-record undo persist', async () => {
  const f = configured();
  f.store.getState().configureHabitDailyTracking(f.id,{target:3,step:.25,unit:'L'});
  const first=f.store.getState().recordHabitQuantity(f.id,date(25));
  const second=f.store.getState().recordHabitQuantity(f.id,date(25));
  assert.equal(dailyQuantity(f.current().dailyEntries,date(25),'L').total,.5);
  assert.equal(dailyQuantity(f.current().dailyEntries,date(26),'L').total,0);
  f.store.getState().recordHabitQuantity(f.id,date(26));
  f.store.getState().removeHabitQuantity(f.id,second);
  assert.equal(dailyQuantity(f.current().dailyEntries,date(25),'L').total,.25);
  assert.equal(dailyQuantity(f.current().dailyEntries,date(26),'L').total,.25);
  assert.equal(f.current().dailyEntries[0].id,first);
  await f.store.persist.rehydrate();
  assert.equal(f.current().dailyEntries.length,2);
  assert.equal(f.current().dailyTracking.step,.25);
});

test('manual completion/undo stays independent; extra entries never multiply XP', () => {
  const f=configured();
  f.store.getState().recordHabitQuantity(f.id,date(25));
  f.store.getState().completeHabit(f.id,10,date(25));
  const score=JSON.stringify(f.store.getState().user);
  const entry=f.store.getState().recordHabitQuantity(f.id,date(25));
  assert.equal(JSON.stringify(f.store.getState().user),score);
  f.store.getState().removeHabitQuantity(f.id,entry);
  assert.equal(f.current().completions.length,1);
  f.store.getState().uncompleteHabit(f.id,date(25));
  assert.equal(f.current().completions.length,0);
  assert.equal(f.current().dailyEntries.length,1);
  assert.equal(f.current().dailyEntries[0].quantity,1);
});

test('invalid configuration and unit mixing fail before writing; duplication does not copy consumption', () => {
  const f=configured(); f.store.getState().recordHabitQuantity(f.id,date(25));
  const before=JSON.stringify(f.current());
  for(const config of [{target:0,step:1,unit:'L'}, {target:3,step:NaN,unit:'L'}, {target:3,step:1,unit:' '},{target:3,step:1,unit:'ml'}]) {
    assert.throws(()=>f.store.getState().configureHabitDailyTracking(f.id,config));
    assert.equal(JSON.stringify(f.current()),before);
  }
  assert.throws(()=>f.store.getState().recordHabitQuantity(f.id,new Date('invalid')));
  const copy=f.store.getState().duplicateHabit(f.id);
  assert.equal(copy.dailyEntries.length,0);
  assert.deepEqual(copy.dailyTracking,f.current().dailyTracking);
  assert.equal(f.current().dailyEntries.length,1);
  const other=fixture(); assert.equal(other.store.getState().habits.length,0);
});

test('native workouts reject manual counters and empty legacy habits remain untouched', () => {
  const {store}=fixture();const h=store.getState().addHabit({name:'Treino',sourceModule:'modulo_treino'});
  assert.throws(()=>store.getState().configureHabitDailyTracking(h.id,{target:1,step:1,unit:'vez'}));
  assert.equal(store.getState().habits[0].dailyEntries,undefined);
  assert.deepEqual(dailyQuantity([],date(25),'L'),{items:[],total:0});
  assert.equal(dailyDateKey(new Date(2026,0,1,0)), '2026-01-01');
  assert.deepEqual(validateDailyTracking({target:1,step:.1,unit:' aulas '}),{target:1,step:.1,unit:'aulas'});
});

test('completion feedback follows a new receipt, including a child; never fires for undo or quantity-only changes', () => {
  const f=configured(); const before=f.store.getState().habits;
  f.store.getState().recordHabitQuantity(f.id,date(25));
  assert.equal(newCycleCompletion(before,f.store.getState().habits,date(25)),null);
  const quantities=f.store.getState().habits;
  f.store.getState().completeHabit(f.id,1,date(25));
  assert.equal(newCycleCompletion(quantities,f.store.getState().habits,date(25)).name,'Água teste isolado');
  assert.equal(newCycleCompletion(quantities,f.store.getState().habits,date(26)),null);
  const completed=f.store.getState().habits;
  f.store.getState().uncompleteHabit(f.id,date(25));
  assert.equal(newCycleCompletion(completed,f.store.getState().habits,date(25)),null);
  const leaf={id:'child',name:'Etapa',childHabits:[],completions:[]};const root={id:'root',name:'Pai',childHabits:[leaf],completions:[]};
  assert.equal(newCycleCompletion([root],[{...root,childHabits:[{...leaf,completions:[{id:'receipt',completionDate:date(25)}]}]}],date(25)).name,'Etapa');
  assert.equal(newCycleCompletion([],completed,date(25)),null);
});

test('counter presentation identifies the date, quantity, history and separation from rewards', () => {
  const f=configured();for(let i=0;i<4;i++)f.store.getState().recordHabitQuantity(f.id,date(25));
  const html=renderToStaticMarkup(React.createElement(CycleDailyCounter,{habit:f.current(),date:date(25),onConfigure(){},onRecord(){},onRemove(){}}));
  assert.match(html,/Somar 1 L a/); assert.match(html,/Meta atingida/);
  assert.match(html,/aria-valuenow="3"/);assert.match(html,/4 de 3 L/);
  assert.match(html,/não conclui o ciclo nem concede pontos/);
  assert.equal((html.match(/Desfazer registro/g)??[]).length,4);
});

test('day rollover follows the previous today but preserves selected history across month/year', () => {
  const { advanceDailyView } = loadComponent('src/lib/cycles/daily-view.ts');
  const yesterday=new Date(2026,11,31), today=new Date(2027,0,1), history=new Date(2026,11,10);
  assert.equal(advanceDailyView(yesterday,yesterday.toDateString(),today),today);
  assert.equal(advanceDailyView(history,yesterday.toDateString(),today),history);
  assert.equal(history.getDate(),10);
});

test('local account switching isolates records and restores the right diary', () => {
  const f=configured();f.store.getState().recordHabitQuantity(f.id,date(25));
  const a=f.store.getState().createAccount('Teste A',true);
  const b=f.store.getState().createAccount('Teste B',false);
  assert.equal(f.store.getState().habits.length,0);
  assert.throws(()=>f.store.getState().recordHabitQuantity(f.id,date(25)));
  f.store.getState().switchAccount(a.id);
  assert.equal(f.current().dailyEntries.length,1);
  f.store.getState().recordHabitQuantity(f.id,date(25));
  f.store.getState().switchAccount(b.id);
  assert.equal(f.store.getState().habits.length,0);
  f.store.getState().switchAccount(a.id);
  assert.equal(f.current().dailyEntries.length,2);
});


test('generic counters accept unrelated activities and independent custom measurements', () => {
  const { store } = fixture();
  const cases = [
    ['Revisar vocabulário', 'revisões', 8, 1],
    ['Organizar documentos', 'arquivos', 15, 5],
    ['Praticar instrumento', 'minutos', 30, 10],
    ['Caminhar', 'km', 4, .5],
  ];
  for (const [name, unit, target, step] of cases) {
    const h = store.getState().addHabit({ name });
    store.getState().configureHabitDailyTracking(h.id, { unit, target, step });
    store.getState().recordHabitQuantity(h.id, date(25));
    store.getState().recordHabitQuantity(h.id, date(25));
    const current = store.getState().habits.find(item => item.id === h.id);
    assert.equal(dailyQuantity(current.dailyEntries, date(25), unit).total, step * 2);
    assert.equal(current.completions.length, 0);
    store.getState().configureHabitDailyTracking(h.id, { unit, target: target * 2, step });
    assert.equal(store.getState().habits.find(item => item.id === h.id).dailyEntries.length, 2);
  }
  assert.equal(store.getState().habits.length, cases.length);
});

test('unconfigured activity offers a generic counter without activity presets', () => {
  const { store } = fixture();
  const habit = store.getState().addHabit({ name: 'Organizar documentos' });
  const html = renderToStaticMarkup(React.createElement(CycleDailyCounter, { habit, date:date(25), onConfigure(){}, onRecord(){}, onRemove(){} }));
  assert.match(html, /Adicionar contador/);
  assert.match(html, /Some repetições ou quantidades desta atividade/);
  assert.doesNotMatch(html, /Água|Aulas|Banhos/);
  assert.match(html, /aria-expanded="false"/);
});
