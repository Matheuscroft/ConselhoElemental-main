import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
// Real Zustand commands, bundled without browser/network. Every instance gets empty in-memory storage.
const bundled = await build({ entryPoints: ['src/stores/appStore.ts'], bundle: true, platform: 'node', format: 'cjs', write: false, alias: { '@': new URL('../../src', import.meta.url).pathname }, logLevel: 'silent' });
export function fixture() {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
  const module = { exports: {} };
  new Function('require', 'module', 'exports', 'window', 'crypto', bundled.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports, { localStorage: storage }, webcrypto);
  return { store: module.exports.useAppStore, memory };
}
