import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('public/splash/abertura.css', 'utf8');
const source = ts.transpileModule(readFileSync('src/lib/backup/startup-screen.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('module', 'exports', source)(mod, mod.exports);
const { showProgressStartup } = mod.exports;

test('the opening scene is in the page itself, so it paints before any script', () => {
  const root = html.slice(html.indexOf('<div id="root">'), html.indexOf('<script'));
  assert.match(root, /class="abertura"/);
  assert.match(root, /role="status"/);
  assert.equal((root.match(/class="chama"/g) ?? []).length, 16);
  assert.match(root, /\/splash\/santuario\.webp/);
  assert.match(html, /href="\/splash\/abertura\.css"/);
});

test('the scene costs almost nothing: no filters, no blur, only transforms and opacity', () => {
  assert.doesNotMatch(css, /filter\s*:|backdrop|blur\(/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test('loading keeps the scene on screen; a block or failure replaces it', () => {
  let replaced = 0;
  const root = { querySelector: (sel) => (sel === '.abertura' ? {} : null), replaceChildren: () => { replaced += 1; }, ownerDocument: { createElement: () => ({ append() {}, setAttribute() {}, addEventListener() {}, focus() {} }) } };
  showProgressStartup(root);
  assert.equal(replaced, 0);
  showProgressStartup(root, 'busy');
  assert.equal(replaced, 1);
});
