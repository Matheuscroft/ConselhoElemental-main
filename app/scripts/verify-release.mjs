import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const find = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = join(directory, entry.name);
  return entry.isDirectory() ? find(path) : entry.isFile() && entry.name.endsWith('.test.mjs') ? [path] : [];
});
const tests = [...find('tests'), ...find('scripts')].sort();
if (!tests.length) throw new Error('Nenhum teste encontrado; publicação interrompida.');
/*
 * Types first, and on purpose.
 *
 * This script ran the tests and the lint and nothing else, while the only
 * typecheck in the project lived inside `npm run build`, which only ever ran
 * in CI. So `verify:release` could come back green on code that does not
 * compile -- and in November 2026 it did, four pushes in a row, leaving main
 * red and nothing deployable until someone looked at the CI log.
 *
 * `tsc -b` is the same command `build` runs, so this is the CI check itself
 * rather than an approximation of it, and it costs about eight seconds. It
 * goes first so a type error is reported before the suite spends its time.
 */
const etapas = [
  ['npx', ['tsc', '-b']],
  [process.execPath, ['--test', '--test-concurrency=2', ...tests]],
  ['npm', ['run', 'lint']],
];

for (const [command, args] of etapas) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
