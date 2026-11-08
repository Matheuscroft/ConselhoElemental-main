import { execFileSync, spawnSync } from 'node:child_process';

const repository = 'https://github.com/Matheuscroft/ConselhoElemental-main.git';
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const remote = 'origin';
if (git('remote', 'get-url', '--push', remote) !== repository) throw new Error('Confira o remoto origin; destino inesperado.');
if (git('status', '--porcelain')) throw new Error('Revise e registre as mudanças antes de publicar. Nada foi adicionado automaticamente ao commit.');
git('fetch', remote, 'main');
const ancestor = spawnSync('git', ['merge-base', '--is-ancestor', `${remote}/main`, 'HEAD']);
if (ancestor.status !== 0) throw new Error('A main avançou. Integre as mudanças do colaborador e valide antes de publicar; não use force push.');
for (const script of ['verify:release', 'build']) {
  const result = spawnSync('npm', ['run', script], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
// Normal fast-forward push; Vercel Git integration performs the hosted build.
execFileSync('git', ['push', remote, 'HEAD:main'], { stdio: 'inherit' });
