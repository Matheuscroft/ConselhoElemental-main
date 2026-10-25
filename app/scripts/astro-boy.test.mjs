import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const script = resolve(dirname(fileURLToPath(import.meta.url)), 'astro-boy.mjs');
test('Perfil explícito, apresentação única, troca de colaborador e validação', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'astro-boy-test-'));
  const run = (...args) => spawnSync(process.execPath, [script, ...args], {
    env: { ...process.env, ASTRO_BOY_STATE_DIR: directory }, encoding: 'utf8',
  });
  const state = () => JSON.parse(run('status', '--json').stdout);
  try {
    assert.equal(state().profile, null);
    assert.equal(run('ack').status, 1);
    assert.equal(run('setup', '--name', 'Matheus', '--role', 'backend').status, 0);
    assert.equal(state().profile.name, 'Matheus');
    assert.equal(state().onboardingRequired, true);
    const greeting = run('welcome').stdout;
    assert.match(greeting, /Olá, Matheus!/);
    assert.match(greeting, /F59/);
    assert.match(greeting, /reversão\/idempotência/);
    assert.match(greeting, /GPS\/mapa/);
    assert.match(greeting, /Repaginação R01–R11/);
    assert.match(greeting, /Atualização R15–R26/);
    assert.match(greeting, /constância por datas programadas, aprovada por Fábio/);
    assert.match(greeting, /REPASSE-FRONTEND-PARA-BACKEND/);
    assert.match(greeting, /Matheus responde pelo backend/);
    assert.equal(run('ack').status, 0);
    assert.equal(state().updateBriefingRequired, false);
    const timestamp = state().profile.introducedAt;
    assert.equal(state().onboardingRequired, false);
    run('setup', '--name', 'Matheus', '--role', 'backend');
    assert.equal(state().profile.introducedAt, timestamp);
    assert.equal(run('setup', '--name', 'Fábio', '--role', 'frontend').status, 0);
    assert.equal(state().onboardingRequired, true);
    assert.equal(state().profile.role, 'frontend');
    assert.equal(run('setup', '--name', 'Pessoa', '--role', 'invalid').status, 1);
    assert.equal(run('setup', '--name', 'Pessoa\ncomando', '--role', 'backend').status, 1);
    assert.equal(state().profile.name, 'Fábio');
    assert.equal(run('unknown').status, 1);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});


test('Perfil antigo recebe o novo repasse uma vez, preservando nome, papel e data original', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'astro-boy-upgrade-'));
  const run = (...args) => spawnSync(process.execPath, [script, ...args], {
    env: { ...process.env, ASTRO_BOY_STATE_DIR: directory }, encoding: 'utf8',
  });
  const state = () => JSON.parse(run('status', '--json').stdout);
  const introducedAt = '2026-10-14T12:00:00.000Z';
  try {
    writeFileSync(resolve(directory, 'profile.json'), JSON.stringify({ schema: 1, name: 'Matheus', role: 'backend', introducedAt, briefingAcknowledged: 'repaginacao-elemental-r14-2026-10-23' }));
    assert.equal(state().onboardingRequired, true);
    assert.equal(state().updateBriefingRequired, true);
    assert.match(run('welcome').stdout, /Santuário novo/);
    assert.equal(run('ack').status, 0);
    assert.equal(state().onboardingRequired, false);
    assert.equal(state().profile.introducedAt, introducedAt);
    assert.equal(state().profile.name, 'Matheus');
    assert.equal(state().profile.role, 'backend');
    assert.equal(run('setup', '--name', 'Matheus', '--role', 'backend').status, 0);
    assert.equal(state().onboardingRequired, false);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
