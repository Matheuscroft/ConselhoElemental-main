import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
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
    assert.match(run('welcome').stdout, /Olá, Matheus!/);
    assert.equal(run('ack').status, 0);
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
