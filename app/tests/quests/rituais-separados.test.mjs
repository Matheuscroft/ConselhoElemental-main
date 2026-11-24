import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from '../cycles/load-store.mjs';
import { loadComponent } from '../elemental/load-component.mjs';

const { buildQuestTrails } = loadComponent('src/lib/quest-trails.ts');

// 24/11/2026: the steps of Journeys and Great Works were listed among the loose rituals, which blurred what a ritual is.
// The list of Rituais hides every task that is a step of a trail; the ids come from the trails themselves.
const idsDeEtapas = s => new Set(buildQuestTrails({ tasks: s.tasks, habits: s.habits, quests: s.quests, projects: s.projects })
  .flatMap(trilha => trilha.steps.filter(step => step.kind === 'task').map(step => step.id)));

test('the steps of a Journey and of a Great Work chapter are trail steps; a loose ritual is not', () => {
  const { store } = fixture(); const s = () => store.getState();
  const solta = s().addTask({ title: 'Ligar para a escola', elementId: 'agua' });
  const jornada = s().addQuest({ title: 'Domar o Fogo', elementId: 'fogo' });
  s().addTaskToQuest(jornada.id, { title: 'Acender a chama', elementId: 'fogo' });
  const obra = s().addProject({ title: 'Casa nova', elementId: 'terra' });
  s().addMissionToProject(obra.id, { title: 'Fundação', elementId: 'terra' });
  const capitulo = s().projects.find(p => p.id === obra.id).missions[0];
  s().addTaskToMission(obra.id, capitulo.id, { title: 'Comprar o terreno', elementId: 'terra' });

  const ids = idsDeEtapas(s());
  const idDe = titulo => s().tasks.find(t => t.title === titulo).id;
  assert.equal(ids.has(solta.id), false, 'a loose ritual stays in Rituais');
  assert.equal(ids.has(idDe('Acender a chama')), true, 'a Journey step lives in Trilhas');
  assert.equal(ids.has(idDe('Comprar o terreno')), true, 'a Great Work step lives in Trilhas');
  assert.deepEqual(s().tasks.filter(t => !ids.has(t.id)).map(t => t.title), ['Ligar para a escola']);
});

test('a finished trail keeps its steps out of the list, and a task whose trail was removed becomes a loose ritual again', () => {
  const { store } = fixture(); const s = () => store.getState();
  const jornada = s().addQuest({ title: 'Meta', elementId: 'ar' });
  s().addTaskToQuest(jornada.id, { title: 'Etapa única', elementId: 'ar' });
  const etapa = s().tasks[0];
  s().completeTask(etapa.id);
  assert.equal(idsDeEtapas(s()).has(etapa.id), true);
  s().deleteQuest?.(jornada.id);
  assert.equal(idsDeEtapas(s()).has(etapa.id), false, 'with no trail, it is a ritual like any other');
});
