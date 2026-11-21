import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = new URL('../../', import.meta.url).pathname;
const ler = (arquivo) => readFileSync(resolve(root, arquivo), 'utf8');

test('o Laboratório é só ensaio: não importa a loja, o backup nem o armazenamento de momentos', () => {
  const fonte = `${ler('src/pages/Laboratorio.tsx')}\n${ler('src/components/laboratorio/controles.tsx')}`;
  for (const proibido of ['@/stores/', '@/lib/backup', '@/lib/momentos/momento-store', 'localStorage', 'sessionStorage', 'supabase', 'fetch(']) {
    assert.ok(!fonte.includes(proibido), `o Laboratório não pode tocar em ${proibido}`);
  }
});

test('o Laboratório está registrado: rota, página e ícone', () => {
  assert.match(ler('src/lib/app-routes.ts'), /id: 'laboratorio'.*path: '\/laboratorio'/);
  assert.match(ler('src/App.tsx'), /path="\/laboratorio"/);
  assert.match(ler('src/components/elemental/ArcaneIcon.tsx'), /laboratorio: 'laboratorio'/);
});
