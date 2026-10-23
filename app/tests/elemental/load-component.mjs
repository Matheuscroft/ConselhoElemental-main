import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';

const require = createRequire(new URL('../../package.json', import.meta.url));
const root = new URL('../../', import.meta.url).pathname;
const cache = new Map();
/** Compile local presentation components only; no browser or app store is initialized. */
export function loadComponent(file) {
  const absolute = resolve(root, file);
  if (cache.has(absolute)) return cache.get(absolute);
  const source = readFileSync(absolute, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  cache.set(absolute, module.exports);
  const localRequire = (id) => {
    if (!id.startsWith('.') && !id.startsWith('@/')) return require(id);
    const target = id.startsWith('@/') ? resolve(root, 'src', id.slice(2)) : resolve(dirname(absolute), id);
    const path = [target, `${target}.tsx`, `${target}.ts`].find((candidate) => existsSync(candidate));
    if (!path) throw new Error(`Missing presentation import ${id}`);
    return loadComponent(path);
  };
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
  return module.exports;
}
