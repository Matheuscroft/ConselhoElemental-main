import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-store.mjs';
import { loadComponent } from '../elemental/load-component.mjs';

const { conclusoesDoApp, elementoDaSemana } = loadComponent('src/lib/momentos/elemento-da-semana.ts');
const { achievementPlan, defaultTrailBonus } = loadComponent('src/lib/achievement-completion.ts');

// 23/11/2026: finishing the steps of a Fire trail added no Fire points to the scoreboard, and the frame (the week's
// element) saw nothing, because ritual completions were never mirrored into the canonical `actions` list.

function trailOfFire() {
  const { store } = fixture();
  const s = () => store.getState();
  const quest = s().addQuest({ title: 'Projeto de Fogo', elementId: 'fogo' });
  s().addTaskToQuest(quest.id, { title: 'Etapa 1', elementId: 'fogo' });
  s().addTaskToQuest(quest.id, { title: 'Etapa 2', elementId: 'fogo' });
  const second = s().tasks.find(t => t.title === 'Etapa 2');
  s().addTaskItem(second.id, { title: 'Sub A', baseValue: 10 });
  s().addTaskItem(second.id, { title: 'Sub B', baseValue: 10 });
  return { store, s, quest, second };
}

test('finishing trail steps makes Fire the element of the week for the frame', () => {
  const { s } = trailOfFire();
  assert.equal(elementoDaSemana(conclusoesDoApp(s().habits, s().actions), new Date()).elemento, null);
  s().completeTask(s().tasks.find(t => t.title === 'Etapa 1').id);
  const seen = conclusoesDoApp(s().habits, s().actions);
  assert.equal(seen.length, 1);
  assert.equal(elementoDaSemana(seen, new Date()).elemento, 'fogo');
});

test('a subitem finished on its own is a completion that paid its XP to its element, and it can be undone', () => {
  const { s, second } = trailOfFire();
  const item = s().tasks.find(t => t.id === second.id).childItems[0];
  s().completeTaskItem(second.id, item.id);
  const mirrored = s().actions.find(a => a.id === item.id);
  assert.equal(mirrored.isCompleted, true);
  assert.ok(mirrored.completedAt);
  assert.equal(mirrored.completionXp.elementId, 'fogo');
  assert.ok(mirrored.completionXp.amount > 0);
  assert.equal(conclusoesDoApp(s().habits, s().actions).length, 1);
  s().uncompleteTaskItem?.(second.id, item.id);
});

test('the scoreboard counts what subitems delivered, before and after their ritual is finished', () => {
  const { s, second } = trailOfFire();
  const fogo = () => s().getElementScores().find(e => e.elementId === 'fogo').score;
  assert.equal(fogo(), 0);
  const item = s().tasks.find(t => t.id === second.id).childItems[0];
  s().completeTaskItem(second.id, item.id);
  const afterItem = fogo();
  assert.ok(afterItem > 0, 'a finished subitem already scores for its element');
  s().completeTask(second.id);
  assert.equal(fogo(), afterItem, 'finishing the parent does not pay the same subitems twice');
});

test('finishing a whole trail pays a substantial bonus to its element by default, and a set bonus wins', () => {
  const { s, quest } = trailOfFire();
  assert.equal(defaultTrailBonus(2), 100);
  assert.equal(defaultTrailBonus(100), 500);
  assert.equal(achievementPlan(s(), 'quest', quest.id).amount, defaultTrailBonus(achievementPlan(s(), 'quest', quest.id).trail.total));
  assert.ok(achievementPlan(s(), 'quest', quest.id).amount >= 100);
  s().updateQuest(quest.id, { xpBonus: 40 });
  assert.equal(achievementPlan(s(), 'quest', quest.id).amount, 40);
});

test('a finished trail weighs three ordinary completions in the week and announces itself', () => {
  const { conclusoesDoApp: c } = { conclusoesDoApp };
  const quest = { isCompleted: true, elementId: 'fogo', completionBonus: { elementId: 'fogo', completedAt: new Date().toISOString() } };
  const week = c([], [], [quest]);
  assert.equal(week.length, 3);
  assert.ok(week.every(item => item.elemento === 'fogo'));
});

test('a bonus set on purpose to zero stays zero, and an old trail with no bonus set gets the default', () => {
  const { store } = fixture();
  const quest = store.getState().addQuest({ title: 'Sem bônus', elementId: 'fogo', xpBonus: 0 });
  assert.equal(achievementPlan(store.getState(), 'quest', quest.id).amount, 0);
  store.getState().updateQuest(quest.id, { bonusAutomatico: undefined });
  assert.ok(achievementPlan(store.getState(), 'quest', quest.id).amount >= 50);
});
