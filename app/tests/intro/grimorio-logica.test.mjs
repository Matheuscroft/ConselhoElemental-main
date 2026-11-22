import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(new URL('../../package.json', import.meta.url));
const root = new URL('../../', import.meta.url).pathname;
const cache = new Map();
function load(file) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path);
  const output = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)((id) => {
    if (id.startsWith('@/')) {
      const base = 'src/' + id.slice(2);
      return load(['.ts', '.tsx'].map((ext) => base + ext).find((c) => existsSync(resolve(root, c))));
    }
    if (!id.startsWith('.')) return require(id);
    const target = resolve(dirname(path), id);
    return load(['.ts', '.tsx'].map((ext) => target + ext).find(existsSync));
  }, module, module.exports);
  cache.set(path, module.exports);
  return module.exports;
}

const C = load('src/lib/intro/cerimonia.ts');
const G = load('src/lib/intro/gestos.ts');
const Q = load('src/lib/intro/qualidade.ts');
const T = load('src/lib/intro/textos.ts');

test('the ceremony keeps the approved order: water, earth, fire, air', () => {
  assert.deepEqual([...C.ORDEM_CERIMONIA], ['agua', 'terra', 'fogo', 'ar']);
});

test('the ceremony walks poster → opening → legend → four gestures → council → final → done', () => {
  const n = T.TOTAL_ORACOES;
  let e = C.ESTADO_INICIAL;
  assert.equal(e.fase, 'poster');
  e = C.avancar(e, { tipo: 'abrir' }, n); assert.equal(e.fase, 'abrindo');
  e = C.avancar(e, { tipo: 'aberto' }, n); assert.equal(e.fase, 'lenda');
  for (let i = 0; i < n; i += 1) e = C.avancar(e, { tipo: 'oracao' }, n);
  assert.equal(e.fase, 'gesto'); assert.equal(C.elementoAtual(e), 'agua');
  for (const el of C.ORDEM_CERIMONIA) { assert.equal(C.elementoAtual(e), el); e = C.avancar(e, { tipo: 'despertou', elemento: el }, n); }
  assert.equal(e.fase, 'conselho'); assert.deepEqual([...e.despertos], ['agua', 'terra', 'fogo', 'ar']);
  e = C.avancar(e, { tipo: 'conselhoAssentou' }, n); assert.equal(e.fase, 'final');
  e = C.avancar(e, { tipo: 'comecar' }, n); assert.equal(e.fase, 'concluido');
  assert.equal(C.encerrado(e), true);
});

test('an element out of order, a repeat or a stray signal changes nothing', () => {
  const n = T.TOTAL_ORACOES;
  let e = { ...C.ESTADO_INICIAL, fase: 'gesto', indice: 0 };
  assert.equal(C.avancar(e, { tipo: 'despertou', elemento: 'fogo' }, n), e);
  e = C.avancar(e, { tipo: 'despertou', elemento: 'agua' }, n);
  assert.equal(C.avancar(e, { tipo: 'despertou', elemento: 'agua' }, n), e);
  assert.equal(C.avancar(e, { tipo: 'comecar' }, n), e);
  assert.equal(C.avancar(C.ESTADO_INICIAL, { tipo: 'aberto' }, n), C.ESTADO_INICIAL);
});

test('skipping works from any beat and is terminal', () => {
  const n = T.TOTAL_ORACOES;
  for (const fase of ['poster', 'abrindo', 'lenda', 'gesto', 'conselho', 'final']) {
    const e = C.avancar({ ...C.ESTADO_INICIAL, fase }, { tipo: 'pular' }, n);
    assert.equal(e.fase, 'pulado');
    assert.equal(C.avancar(e, { tipo: 'comecar' }, n), e);
  }
});

test('the static version reaches the end with one tap per beat and visits every element', () => {
  const n = T.TOTAL_ORACOES;
  let e = C.ESTADO_INICIAL; let toques = 0;
  while (e.fase !== 'final' && toques < 20) { e = C.avancarPorToque(e, n); toques += 1; }
  assert.equal(e.fase, 'final');
  assert.deepEqual([...e.despertos], ['agua', 'terra', 'fogo', 'ar']);
  assert.equal(toques, 7); // abrir, lenda, 4 elementos, conselho
});

test('the legend reveals clause by clause and the whole text stays available', () => {
  assert.equal(T.TOTAL_ORACOES, 10);
  assert.deepEqual(T.oracoesVisiveis(0), { paragrafo: 0, ate: 1 });
  assert.deepEqual(T.oracoesVisiveis(5), { paragrafo: 1, ate: 1 });
  assert.match(T.LENDA_INTEIRA[0], /^Há muito tempo, a Água abriu os vales, a Terra ergueu as montanhas, o Fogo acendeu as estrelas e o Ar deu ao mundo seu primeiro sopro\.$/);
  assert.match(T.LENDA_INTEIRA[1], /Sob os seus dedos, a primeira desperta\.$/);
  assert.equal(T.TEXTO.frase, 'Quem domina os quatro elementos, domina a si mesmo.');
});

test('water: the drop is picked up only near it and the groove is followed, never skipped', () => {
  const arco = G.ARCO_AGUA;
  let e = G.SULCO_INICIAL;
  const longe = G.pontoNoArco(arco, 0.8);
  assert.equal(G.iniciarSulco(e, arco, longe).ativo, false);
  e = G.iniciarSulco(e, arco, G.pontoNoArco(arco, 0));
  assert.equal(e.ativo, true);
  e = G.moverSulco(e, arco, G.pontoNoArco(arco, 0.7));
  assert.equal(e.progresso, 0, 'a jump ahead along the groove does not count');
  for (let p = 0.05; p <= 1.0001; p += 0.05) e = G.moverSulco(e, arco, G.pontoNoArco(arco, p));
  assert.equal(e.concluido, true); assert.equal(e.progresso, 1);
});

test('water: lifting the finger keeps the progress, and off the groove nothing moves', () => {
  const arco = G.ARCO_AGUA;
  let e = G.iniciarSulco(G.SULCO_INICIAL, arco, G.pontoNoArco(arco, 0));
  e = G.moverSulco(e, arco, G.pontoNoArco(arco, 0.15));
  e = G.moverSulco(e, arco, { x: 0, y: 0 });
  assert.ok(Math.abs(e.progresso - 0.15) < 1e-9);
  e = G.soltarSulco(e);
  assert.equal(e.ativo, false);
  assert.ok(e.progresso > 0.14);
});

test('earth: holding raises it in about 1.4 s; letting go early lets it sink back', () => {
  let e = G.pressionar(G.SEGURAR_INICIAL);
  e = G.passoSegurar(e, 700);
  assert.ok(Math.abs(e.progresso - 0.5) < 1e-9);
  e = G.passoSegurar(G.largar(e), 200);
  assert.ok(e.progresso < 0.5);
  e = G.pressionar(e);
  for (let i = 0; i < 40; i += 1) e = G.passoSegurar(e, 50);
  assert.equal(e.concluido, true);
});

test('fire: a quick strike over the trace lights it, with its direction; a slow short rub does not', () => {
  const traco = { de: { x: 0.01, y: -0.01 }, ate: { x: 0.06, y: -0.01 }, tolerancia: 0.012 };
  const rapido = Array.from({ length: 8 }, (_, i) => ({ x: 0.012 + i * 0.0065, y: -0.011, t: i * 25 }));
  const r = G.avaliarRisco(traco, rapido);
  assert.equal(r.aceso, true); assert.equal(r.direcao, 1); assert.ok(r.velocidade > G.RISCO_VELOCIDADE);
  const inverso = G.avaliarRisco(traco, [...rapido].reverse().map((a, i) => ({ ...a, t: i * 25 })));
  assert.equal(inverso.direcao, -1);
  const lento = Array.from({ length: 8 }, (_, i) => ({ x: 0.012 + i * 0.003, y: -0.01, t: i * 300 }));
  assert.equal(G.avaliarRisco(traco, lento).aceso, false);
  const longe = rapido.map((a) => ({ ...a, y: 0.05 }));
  assert.equal(G.avaliarRisco(traco, longe).aceso, false);
});

test('air: a short upward pull lifts the corner; a tiny one falls back', () => {
  assert.equal(G.progressoLevantar(-844 * 0.12, 844), 1);
  assert.equal(G.progressoLevantar(40, 844), 0);
  assert.equal(G.levantouOSuficiente(G.progressoLevantar(-20, 844)), false);
  assert.equal(G.levantouOSuficiente(G.progressoLevantar(-70, 844)), true);
});

test('quality: reduced motion or the light choice means the static version; WebGPU means A; WebGL2 means B', () => {
  assert.equal(Q.nivelInicial({ movimentoReduzido: true, webgpu: true, webgl2: true }), 'C');
  assert.equal(Q.nivelInicial({ movimentoReduzido: false, webgpu: true, webgl2: true, escolhaLeve: true }), 'C');
  assert.equal(Q.nivelInicial({ movimentoReduzido: false, webgpu: true, webgl2: true }), 'A');
  assert.equal(Q.nivelInicial({ movimentoReduzido: false, webgpu: false, webgl2: true }), 'B');
  assert.equal(Q.nivelInicial({ movimentoReduzido: false, webgpu: false, webgl2: false }), 'C');
});

test('quality: two consecutive slow 2-second windows drop to C; one slow window or a hidden tab does not', () => {
  const m = Q.criarMonitorQuadros();
  const janela = (ms) => { let caiu = false; for (let s = 0; s < Q.JANELA_MS; s += ms) caiu = m.registrar(ms, true); return caiu; };
  assert.equal(janela(33), false); // one slow window
  assert.equal(janela(16), false); // a good one resets
  assert.equal(janela(33), false);
  m.registrar(16, false); // hidden tab interrupts
  assert.equal(janela(33), true);
  assert.equal(m.registrar(16, true), true, 'once dropped it stays dropped');
});

test('Fogo: um risco rápido sobre o fio de luz acende; um toque parado no meio dele não', () => {
  const g = load('src/lib/intro/gestos.ts');
  const T = g.TRACO_FOGO;
  const passada = (n, ms, inverso = false) => Array.from({ length: n + 1 }, (_, i) => {
    const k = inverso ? 1 - i / n : i / n;
    return { x: T.de.x + (T.ate.x - T.de.x) * k, y: T.de.y + (T.ate.y - T.de.y) * k, t: (ms * i) / n };
  });
  const rapido = g.avaliarRisco(T, passada(12, 180));
  assert.equal(rapido.aceso, true);
  assert.equal(rapido.direcao, 1);
  assert.equal(g.avaliarRisco(T, passada(12, 180, true)).direcao, -1);
  const meio = { x: (T.de.x + T.ate.x) / 2, y: (T.de.y + T.ate.y) / 2 };
  assert.equal(g.avaliarRisco(T, [{ ...meio, t: 0 }, { ...meio, t: 120 }]).aceso, false);
});
