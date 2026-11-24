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

// Leva 2 (23/11/2026): audit of every kind of action. Workouts pay Terra and must say so; a parent that paid nothing of
// its own must not announce "+0"; every completion reaches the frame.
const { detectarEventos } = loadComponent('src/lib/progresso/eventos.ts');
const lido = s => ({ habits: s().habits, actions: s().actions, user: s().user, conquistas: [...s().quests, ...s().projects] });
const conclusoes = (a, b) => detectarEventos(a, b).filter(e => e.tipo === 'conclusao');

test('a workout (loose action or workout cycle) announces the XP it paid, in Terra', () => {
  for (const make of [
    s => s().completeNativeAction({ sessionId: crypto.randomUUID(), effortLevel: 2, title: 'Treino', baseValue: 10, durationSeconds: 1800, completedAt: new Date().toISOString() }),
    s => { const h = s().addHabit({ name: 'Treino A', elementId: 'fogo', areaId: 'sem-categoria', plannedPoints: 3, plannedTimeMinutes: 20, sourceModule: 'modulo_treino' });
      s().completeNativeAction({ habitId: h.id, sessionId: crypto.randomUUID(), title: 'Treino', baseValue: 2, durationSeconds: 600, completedAt: new Date().toISOString() }); },
  ]) {
    const { store } = fixture(); const s = () => store.getState();
    const antes = lido(s); make(s); const novas = conclusoes(antes, lido(s));
    assert.equal(novas.length, 1);
    assert.equal(novas[0].elemento, 'terra');
    assert.ok(novas[0].xp > 0, 'the notice carries the XP the workout paid');
    assert.equal(conclusoesDoApp(s().habits, s().actions).every(c => c.elemento === 'terra'), true);
  }
});

test('a cycle parent that paid nothing of its own does not announce "+0", its child does announce its XP', () => {
  const { store } = fixture(); const s = () => store.getState();
  const h = s().addHabit({ name: 'Pai', elementId: 'fogo', areaId: 'sem-categoria', plannedPoints: 3, plannedTimeMinutes: 5 });
  s().addHabitChild(h.id, { name: 'Filho', elementId: 'fogo', areaId: 'sem-categoria', plannedPoints: 2 });
  const antes = lido(s); s().completeHabitChild(s().habits[0].childHabits[0].id, 2, new Date());
  const novas = conclusoes(antes, lido(s));
  assert.deepEqual(novas.map(n => n.nome), ['Filho']);
  assert.ok(novas[0].xp > 0);
});
