import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createMemoryRouter, matchRoutes } from 'react-router-dom';
import ts from 'typescript';

const source = await readFile(new URL('../../src/components/elemental/navigation.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { ELEMENT_ORDER, SANCTUARY_HOME, PREVIEW_HOME, previewRedirect, parseElement, elementHref, legacyElementHref, areaFilters, updateAreaFilters, matchesAreaName, preserveAreaFilterScroll, filterNavigationRoutes } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

// Use the literal routes registered in App; no browser, auth or store is started.
const appSource = await readFile(new URL('../../src/App.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('App.tsx', appSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const routes = [];
function visit(node) {
  if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === 'Route') {
    const path = node.attributes.properties.find((prop) => ts.isJsxAttribute(prop) && prop.name.getText(ast) === 'path');
    if (path?.initializer && ts.isStringLiteral(path.initializer)) routes.push({ path: path.initializer.text });
  }
  ts.forEachChild(node, visit);
}
visit(ast);

test('four element URLs match their registered route, never the wildcard', () => {
  assert.equal(new Set(ELEMENT_ORDER).size, 4);
  for (const id of ELEMENT_ORDER) {
    const match = matchRoutes(routes, elementHref(id)).at(-1);
    assert.equal(match.route.path, `${SANCTUARY_HOME}/elementos/:elementId`);
    assert.equal(parseElement(match.params.elementId), id);
  }
  for (const invalid of ['__proto__', 'constructor', 'fogo/../terra', 'FOGO', '', null, undefined]) {
    assert.equal(parseElement(invalid), undefined);
  }
});

test('legacy bookmarks keep filters, accents and unrelated query parameters', () => {
  const target = legacyElementHref('?elemento=terra&busca=Sa%C3%BAde&areas=ativas&origem=link');
  const url = new URL(target, 'https://example.test');
  assert.equal(url.pathname, elementHref('terra'));
  assert.equal(url.searchParams.has('elemento'), false);
  assert.deepEqual(areaFilters(url.search), { query: 'Saúde', activeOnly: true });
  assert.equal(url.searchParams.get('origem'), 'link');
  assert.equal(legacyElementHref('?elemento=inexistente'), undefined);
});

test('filter changes are immutable, preserve other params and clear defaults', () => {
  const original = new URLSearchParams('origem=portal');
  const edited = updateAreaFilters(original, { query: 'Casa & Família', activeOnly: true });
  assert.equal(original.toString(), 'origem=portal');
  assert.deepEqual(areaFilters(edited), { query: 'Casa & Família', activeOnly: true });
  assert.equal(updateAreaFilters(edited, { query: '', activeOnly: false }).toString(), 'origem=portal');
  assert.equal(areaFilters('?areas=invalido').activeOnly, false);
  assert.equal(matchesAreaName('Exercício Físico', '  EXERCICIO  '), true);
  assert.equal(matchesAreaName('Saúde Física', 'saude'), true);
  assert.equal(matchesAreaName('Finanças', 'saude'), false);
});

test('memory navigation preserves the filtered URL on back/forward and direct entry', async () => {
  const router = createMemoryRouter(routes, { initialEntries: [SANCTUARY_HOME] });
  try {
    await router.navigate(elementHref('terra'));
    const params = updateAreaFilters(new URLSearchParams(), { query: 'saúde', activeOnly: true });
    await router.navigate(`${elementHref('terra')}?${params}`, { replace: true });
    await router.navigate(elementHref('agua'));
    await router.navigate(-1);
    assert.equal(router.state.location.pathname, elementHref('terra'));
    assert.deepEqual(areaFilters(router.state.location.search), { query: 'saúde', activeOnly: true });
    const reloaded = createMemoryRouter(routes, { initialEntries: [router.state.location.pathname + router.state.location.search] });
    assert.deepEqual(areaFilters(reloaded.state.location.search), { query: 'saúde', activeOnly: true });
    reloaded.dispose();
    await router.navigate(-1);
    assert.equal(router.state.location.pathname, SANCTUARY_HOME);
    await router.navigate(1);
    assert.equal(router.state.location.pathname, elementHref('terra'));
  } finally {
    router.dispose();
  }
});


test('scroll exception is restricted to marked filters on the same valid elemental page', () => {
  const terra = elementHref('terra');
  assert.equal(preserveAreaFilterScroll(terra, terra, { elementalFilter: true }), true);
  for (const [before, after, state] of [
    [undefined, terra, { elementalFilter: true }],
    [elementHref('agua'), terra, { elementalFilter: true }],
    [terra, terra, null],
    [terra, terra, { elementalFilter: false }],
    ['/treinos', '/treinos', { elementalFilter: true }],
    [PREVIEW_HOME, PREVIEW_HOME, { elementalFilter: true }],
    [`${PREVIEW_HOME}/elementos/void`, `${PREVIEW_HOME}/elementos/void`, { elementalFilter: true }],
  ]) assert.equal(preserveAreaFilterScroll(before, after, state), false);
});


test('navigation search reveals specific Fitness destinations and handles accents or no matches', () => {
  const routes = [
    { id: 'treinos', group: 'Treino', label: 'Treinos', description: 'Biblioteca' },
    { id: 'corpo', group: 'Treino', label: 'Corpo', description: 'Avaliações corporais' },
    { id: 'calendario', group: 'Tempo', label: 'Calendário', description: 'Planejamento' },
  ];
  assert.deepEqual(filterNavigationRoutes(routes, '').map(r => r.id), ['treinos', 'calendario']);
  assert.deepEqual(filterNavigationRoutes(routes, '  CORPO  ').map(r => r.id), ['corpo']);
  assert.deepEqual(filterNavigationRoutes(routes, 'avaliacoes').map(r => r.id), ['corpo']);
  assert.deepEqual(filterNavigationRoutes(routes, 'calendario').map(r => r.id), ['calendario']);
  assert.deepEqual(filterNavigationRoutes(routes, 'inexistente'), []);
  assert.equal(routes.length, 3);
});


test('preview redirects preserve deep links and invalid IDs, while canonical routes stay stable', () => {
  assert.equal(previewRedirect(PREVIEW_HOME, ''), SANCTUARY_HOME);
  assert.equal(previewRedirect(PREVIEW_HOME, '?elemento=agua&areas=ativas'), `${elementHref('agua')}?areas=ativas`);
  assert.equal(previewRedirect(`${PREVIEW_HOME}/elementos/terra`, '?busca=casa'), `${elementHref('terra')}?busca=casa`);
  assert.equal(previewRedirect(`${PREVIEW_HOME}/elementos/invalid`, ''), `${SANCTUARY_HOME}/elementos/invalid`);
  assert.equal(previewRedirect(SANCTUARY_HOME, ''), undefined);
  assert.equal(previewRedirect('/previa-elemental-outro', ''), undefined);
  assert.equal(matchRoutes(routes, SANCTUARY_HOME).at(-1).route.path, SANCTUARY_HOME);
  assert.equal(matchRoutes(routes, `${SANCTUARY_HOME}/classico`).at(-1).route.path, `${SANCTUARY_HOME}/classico`);
});
