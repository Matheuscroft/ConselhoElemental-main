import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const find = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = join(directory, entry.name);
  return entry.isDirectory() ? find(path) : entry.isFile() && entry.name.endsWith('.test.mjs') ? [path] : [];
});
const tests = [...find('tests'), ...find('scripts')].sort();
if (!tests.length) throw new Error('Nenhum teste encontrado; publicação interrompida.');
for (const [command, args] of [[process.execPath, ['--test', '--test-concurrency=2', ...tests]], ['npm', ['run', 'lint']]]) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
