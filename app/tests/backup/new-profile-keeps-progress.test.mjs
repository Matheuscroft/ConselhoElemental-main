import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-progress.mjs';

// Incident of 23/11/2026: on a device that had progress but no profile, "Criar e ativar perfil"
// (createAccount(name, false)) replaced the top-level lists with an empty profile and never saved
// the progress anywhere, so the next sync wrote an empty journey over the account.

const seeded = () => {
  const f = fixture();
  f.core.getState().addDraft('Rascunho de antes do perfil', 'notas');
  f.core.getState().addTask({ title: 'Ritual de antes do perfil', elementId: 'ar', baseValue: 2, plannedTimeMinutes: 5, effortLevel: 2 });
  return f;
};

test('creating the first profile empty keeps the progress that had no profile, as a profile of its own', () => {
  const f = seeded();
  const created = f.core.getState().createAccount('Perfil novo', false);
  const state = f.core.getState();
  assert.equal(state.currentAccountId, created.id);
  assert.equal(state.accounts.length, 2, 'the new profile plus the one that keeps the earlier progress');
  assert.equal(state.drafts.length, 0, 'the new profile starts empty');
  const kept = state.accounts.find(account => account.id !== created.id);
  assert.ok(kept, 'a profile holds the earlier progress');
  assert.ok(state.accountDataById[kept.id].drafts.some(draft => draft.title === 'Rascunho de antes do perfil'));
  assert.ok(state.accountDataById[kept.id].tasks.some(task => task.title === 'Ritual de antes do perfil'));
});

test('the earlier progress comes back whole when switching to the profile that kept it', () => {
  const f = seeded();
  const created = f.core.getState().createAccount('Perfil novo', false);
  const kept = f.core.getState().accounts.find(account => account.id !== created.id);
  f.core.getState().switchAccount(kept.id);
  const state = f.core.getState();
  assert.ok(state.drafts.some(draft => draft.title === 'Rascunho de antes do perfil'));
  assert.ok(state.tasks.some(task => task.title === 'Ritual de antes do perfil'));
});

test('a device with nothing to keep does not get a needless extra profile', () => {
  const f = fixture();
  f.core.getState().createAccount('Perfil novo', false);
  assert.equal(f.core.getState().accounts.length, 1);
});

test('importing the current data still moves it into the new profile, with no extra profile', () => {
  const f = seeded();
  f.core.getState().createAccount('Perfil novo', true);
  const state = f.core.getState();
  assert.equal(state.accounts.length, 1);
  assert.ok(state.drafts.some(draft => draft.title === 'Rascunho de antes do perfil'));
});

test('a second empty profile still behaves as before: the active profile is saved, nothing extra is created', () => {
  const f = seeded();
  const first = f.core.getState().createAccount('Primeiro', true);
  f.core.getState().createAccount('Segundo', false);
  const state = f.core.getState();
  assert.equal(state.accounts.length, 2);
  assert.ok(state.accountDataById[first.id].drafts.some(draft => draft.title === 'Rascunho de antes do perfil'));
});
