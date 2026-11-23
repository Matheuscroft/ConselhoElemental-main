import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// The module has no imports, so it runs on its own.
const source = ts.transpileModule(readFileSync('src/lib/backup/device-repair.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', source)(mod, mod.exports);
const { rawLocalCopy, rawCopyFileName, clearThisDevice } = mod.exports;

function fake(initial = {}, { stuck = false } = {}) {
  const map = new Map(Object.entries(initial));
  return {
    get length() { return map.size; },
    key: index => [...map.keys()][index] ?? null,
    getItem: key => (map.has(key) ? map.get(key) : null),
    clear: () => { if (!stuck) map.clear(); },
  };
}

test('the raw copy keeps every key exactly as stored, including the saved link and pending attempts', () => {
  const storage = fake({ 'conselho-elemental-storage': '{"state":{"tasks":[]}}', 'account-binding': 'x', 'pending': '{"a":1}' });
  const copy = rawLocalCopy(storage, 'https://app.example', new Date('2026-11-23T20:00:00.000Z'));
  assert.equal(copy.format, 'conselho-elemental-copia-bruta');
  assert.equal(copy.origin, 'https://app.example');
  assert.deepEqual(copy.entries, { 'conselho-elemental-storage': '{"state":{"tasks":[]}}', 'account-binding': 'x', pending: '{"a":1}' });
  assert.equal(storage.length, 3, 'taking a copy removes nothing');
});

test('the copy file name carries the time and has no characters a phone refuses', () => {
  const name = rawCopyFileName({ createdAt: '2026-11-23T20:00:00.123Z' });
  assert.equal(name, 'conselho-copia-bruta-2026-11-23T20-00-00-123Z.json');
});

test('clearing empties local and session storage', () => {
  const local = fake({ a: '1', b: '2' }), session = fake({ c: '3' });
  clearThisDevice(local, session);
  assert.equal(local.length, 0);
  assert.equal(session.length, 0);
});

test('a browser that keeps its data is reported, never claimed repaired', () => {
  assert.throws(() => clearThisDevice(fake({ a: '1' }, { stuck: true }), fake()), /device-not-cleared/);
  assert.throws(() => clearThisDevice(fake(), fake({ c: '3' }, { stuck: true })), /device-not-cleared/);
});

test('an empty browser is a valid repair (nothing to clear, nothing to lose)', () => {
  assert.doesNotThrow(() => clearThisDevice(fake(), fake()));
  assert.deepEqual(rawLocalCopy(fake(), 'o', new Date(0)).entries, {});
});
