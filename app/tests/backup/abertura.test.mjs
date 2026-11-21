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
  const root = html.slice(html.indexOf('<body>'), html.indexOf('<script type="module"'));
  assert.match(root, /id="abertura"/);
  assert.ok(root.indexOf('id="abertura"') < root.indexOf('<div id="root">'), 'the scene sits above the app root, not inside it');
  assert.ok(root.indexOf('window.__abertura') > root.indexOf('<div id="root">'), 'the progress script runs after the root exists');
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
  const root = { replaceChildren: () => { replaced += 1; }, ownerDocument: { getElementById: (id) => (id === 'abertura' ? {} : null), createElement: () => ({ append() {}, setAttribute() {}, addEventListener() {}, focus() {} }) } };
  showProgressStartup(root);
  assert.equal(replaced, 0);
  showProgressStartup(root, 'busy');
  assert.equal(replaced, 1);
});

test('the percentage follows the real stages and ends at 100 only when the app has painted', () => {
  const stages = [['src/main.tsx', 14], ['src/main.tsx', 22], ['src/mount-account-resume.ts', 32], ['src/mount-account-resume.ts', 62], ['src/mount-account-app.ts', 76], ['src/mount-account-app.ts', 92]];
  for (const [file, n] of stages) assert.match(readFileSync(file, 'utf8'), new RegExp(`etapa\\(${n}\\)`), `${file} reports ${n}`);
  assert.match(html, /MutationObserver/);
  assert.match(html, /root\.firstChild\)\{fim=true/);
  assert.match(css, /\[data-saindo\]/);
});
