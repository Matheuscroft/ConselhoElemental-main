import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const skipped = new Set(['.git', 'node_modules', 'dist', 'dist-ssr', '.vite', '.cache', '.astro-boy', '.vercel']);
const directories = [];
const duplicates = new Map();
const largeFiles = [];
const localOnly = [];
function walk(directory) {
  let bytes = 0;
  let files = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    const name = relative(root, path);
    if (entry.isSymbolicLink()) { localOnly.push({ path: name, reason: 'symlink: não seguido' }); continue; }
    if (entry.isDirectory()) {
      if (skipped.has(entry.name) || ['.codex', '.claude', '.idea', '.vscode'].includes(entry.name)) {
        localOnly.push({ path: name, reason: 'dependência, artefato ou configuração local' });
      } else { const child = walk(path); bytes += child.bytes; files += child.files; }
    } else if (entry.isFile()) {
      if (entry.name.startsWith('.env') && entry.name !== '.env.example') {
        localOnly.push({ path: name, reason: 'ambiente: conteúdo não lido' }); continue;
      }
      if (entry.name === '.DS_Store') { localOnly.push({ path: name, reason: 'metadado do sistema' }); continue; }
      const size = statSync(path).size;
      bytes += size; files++;
      if (size > 2 * 1024 * 1024) largeFiles.push({ path: name, bytes: size });
      const hash = createHash('sha256').update(readFileSync(path)).digest('hex');
      const group = duplicates.get(hash) || [];
      group.push(name); duplicates.set(hash, group);
    }
  }
  directories.push({ path: relative(root, directory) || '.', files, bytes });
  return { bytes, files };
}
walk(root);
const canonical = ['00-Overview', '01-Domain-Core', '02-Platform-Architecture', '03-ADRs'];
const missingCanonicalFolders = canonical.filter((name) => !existsSync(resolve(root, 'app/docs', name)));
console.log(JSON.stringify({ directories, localOnly, largeFiles,
  duplicateFiles: [...duplicates.values()].filter((group) => group.length > 1),
  missingCanonicalFolders,
  note: 'Inventário recursivo de arquivos de projeto; dependências/build/configurações locais excluídos. Igualdade ou ausência de referência não prova que um arquivo pode ser removido.'
}, null, 2));
