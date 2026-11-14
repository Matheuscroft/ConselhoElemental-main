import assert from 'node:assert/strict';
import test from 'node:test';
import { loadComponent } from '../elemental/load-component.mjs';

const c = loadComponent('src/components/mais/constelacoes.ts');
const { APP_ROUTES } = loadComponent('src/lib/app-routes.ts');
const { ELEMENT_ORDER, filterNavigationRoutes } = loadComponent('src/components/elemental/navigation.ts');
const ids = (lista) => lista.map((rota) => rota.id);

test('a rosa segue ELEMENT_ORDER e cada elemento tem verbo e linha', () => {
  assert.deepEqual([...c.ELEMENTOS_DA_ROSA], ['fogo', 'ar', 'agua', 'terra']);
  assert.deepEqual([...c.ELEMENTOS_DA_ROSA], ELEMENT_ORDER);
  assert.deepEqual(c.ELEMENTOS_DA_ROSA.map((e) => c.VERBOS[e]), ['Agir', 'Saber', 'Fluir', 'Sustentar']);
  c.ELEMENTOS_DA_ROSA.forEach((e) => assert.ok(c.INSCRICOES[e].linha.length > 0));
});

test('todo id de APP_ROUTES é mapeado exatamente uma vez, sem ids fantasmas', () => {
  const mapeados = c.ELEMENTOS_DA_ROSA.flatMap((e) => c.ROTAS_POR_ELEMENTO[e]);
  assert.equal(new Set(mapeados).size, mapeados.length, 'id repetido no mapa');
  assert.deepEqual([...mapeados].sort(), ids(APP_ROUTES).sort());
});

test('a distribuição do briefing', () => {
  const visiveis = (e) => c.ROTAS_POR_ELEMENTO[e].filter((id) => !c.ehLatente(id) && !c.ehSubportal(id));
  assert.deepEqual(visiveis('fogo'), ['invocar', 'rituais', 'jornadas', 'grandes-obras', 'forja', 'cassino']);
  assert.deepEqual(visiveis('ar'), ['grimorio', 'astrolabio', 'mapa']);
  assert.deepEqual(visiveis('agua'), ['ciclos', 'temporal', 'lua', 'estacoes']);
  assert.deepEqual(visiveis('terra'), ['santuario', 'pilares', 'dominios', 'treinos']);
  assert.ok(c.ehLatente('treinos-historico') && c.ehLatente('fitness') && !c.ehLatente('treinos'));
});

test('os portais existem em APP_ROUTES, um por elemento na ordem da rosa', () => {
  assert.deepEqual(c.PORTAIS.map((p) => p.elemento), ['fogo', 'ar', 'agua', 'terra']);
  assert.deepEqual(c.PORTAIS.map((p) => p.id), ['invocar', 'grimorio', 'temporal', 'treinos']);
  c.PORTAIS.forEach((p) => assert.ok(APP_ROUTES.some((r) => r.id === p.id), p.id));
  assert.equal(APP_ROUTES.find((r) => r.id === 'temporal').path, '/temporal/semana');
});

test("conjurar('') coincide com o filtro padrão e nada acende", () => {
  const r = c.conjurar('');
  assert.deepEqual(ids(r.visiveis).sort(), ids(filterNavigationRoutes(APP_ROUTES, '')).sort());
  assert.deepEqual(r.acesas, []);
  assert.equal(r.primeira, null);
  assert.deepEqual(r.contagemPorElemento, { fogo: 6, ar: 3, agua: 4, terra: 4 });
  assert.ok(!ids(r.visiveis).includes('treinos-historico'));
});

test("'historico' acende a subrota de histórico de treino e a traz à tona", () => {
  const r = c.conjurar('historico');
  assert.ok(ids(r.acesas).includes('treinos-historico'));
  assert.ok(ids(r.visiveis).includes('treinos-historico'));
  assert.equal(r.primeira.id, 'treinos-historico');
});

test('acentos e caixa são ignorados', () => {
  assert.deepEqual(ids(c.conjurar('GRIMORIO').acesas), ids(c.conjurar('grimório').acesas));
  assert.ok(ids(c.conjurar('grimorio').acesas).includes('grimorio'));
  assert.ok(ids(c.conjurar('mes').acesas).includes('temporal-mes'));
  assert.ok(ids(c.conjurar('estacoes').acesas).includes('estacoes'));
});

test('termo sem resposta dá zero e a primeira segue a ordem visual', () => {
  const vazio = c.conjurar('xpto');
  assert.equal(vazio.acesas.length, 0);
  assert.equal(vazio.primeira, null);
  assert.deepEqual(vazio.contagemPorElemento, { fogo: 0, ar: 0, agua: 0, terra: 0 });
  const lua = c.conjurar('lua');
  assert.equal(lua.primeira.id, 'lua');
  assert.equal(lua.contagemPorElemento.agua, 1);
  const ordem = ids(c.conjurar('a').acesas);
  const posicoes = ordem.map((id) => c.ELEMENTOS_DA_ROSA.indexOf(c.elementoDaRota(id)));
  assert.deepEqual(posicoes, [...posicoes].sort((x, y) => x - y));
});

test('elementoDoCaminho resolve subcaminhos', () => {
  assert.equal(c.elementoDoCaminho('/lua'), 'agua');
  assert.equal(c.elementoDoCaminho('/temporal/mes'), 'agua');
  assert.equal(c.elementoDoCaminho('/treinos/preview/abc'), 'terra');
  assert.equal(c.elementoDoCaminho('/dominios/yoga'), 'terra');
  assert.equal(c.elementoDoCaminho('/nada'), undefined);
});
