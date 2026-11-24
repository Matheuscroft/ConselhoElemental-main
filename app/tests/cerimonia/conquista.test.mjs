import assert from 'node:assert/strict';
import test from 'node:test';
import { loadComponent } from '../elemental/load-component.mjs';

const { premioDeConquista } = loadComponent('src/lib/cerimonia/conquista.ts');
const cerimonia = loadComponent('src/lib/cerimonia/cerimonia.ts');

const base = { tipo: 'quest', nome: 'Projeto de Fogo', elemento: 'fogo', bonus: 75, xpAntes: 10, xpDepois: 85, magoAntes: 1, magoDepois: 1 };

test('finishing a journey is a big ceremony in the element: its name, the element XP counting up, and the bonus it paid', () => {
  const premio = premioDeConquista(base);
  assert.equal(premio.grandeza, 'grande');
  assert.equal(premio.elemento, 'fogo');
  assert.equal(premio.titulo, 'Projeto de Fogo');
  assert.equal(premio.sobretitulo, 'Jornada concluída · Fogo');
  assert.deepEqual(premio.numero, { rotulo: 'XP de Fogo', de: 10, para: 85 });
  assert.deepEqual(premio.destrave, { titulo: 'Bônus da conquista', detalhe: '+75 XP de Fogo' });
});

test('a Great Work says so, and a level gained is what it unlocks, the element before the mage', () => {
  assert.equal(premioDeConquista({ ...base, tipo: 'project' }).sobretitulo, 'Grande Obra concluída · Fogo');
  assert.equal(premioDeConquista({ ...base, xpAntes: 50, xpDepois: 150, magoDepois: 2 }).destrave.titulo, 'Fogo chegou ao nível 2');
  assert.equal(premioDeConquista({ ...base, magoDepois: 3 }).destrave.titulo, 'Você chegou ao nível 3');
});

test('a conquest with no bonus has no number and no empty unlock, and an unnamed one still has a title', () => {
  const premio = premioDeConquista({ ...base, bonus: 0, nome: '  ' });
  assert.equal(premio.numero, undefined);
  assert.equal(premio.destrave, undefined);
  assert.equal(premio.titulo, 'Jornada concluída');
});

test('the whole ceremony of a conquest stays under the ceiling nobody should wait past', () => {
  assert.ok(cerimonia.duracaoTotal(premioDeConquista(base)) <= cerimonia.TETO_TOTAL);
  assert.ok(cerimonia.duracaoTotal(premioDeConquista({ ...base, xpAntes: 50, xpDepois: 150 })) <= cerimonia.TETO_TOTAL);
});
