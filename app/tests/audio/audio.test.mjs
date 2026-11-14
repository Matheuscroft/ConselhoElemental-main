import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';

const cues = loadComponent('src/lib/audio/cues.ts');
const prefs = loadComponent('src/lib/audio/preferencias.ts');
const engineMod = loadComponent('src/lib/audio/engine.ts');
const api = loadComponent('src/lib/audio/index.ts');
const ELS = ['fogo', 'agua', 'ar', 'terra'];
const todas = [
  ...ELS.flatMap((e) => [cues.conclusao(e, 0), cues.conclusao(e, 0.5), cues.conclusao(e, 1), ...[2, 3, 5, 10].map((n) => cues.nivel(e, n))]),
  ...ELS.flatMap((a) => ELS.map((b) => cues.trocaDeElemento(a, b))),
  cues.toque(),
  cues.conquista(),
];
const soma = (p) => p.vozes.reduce((s, v) => s + v.ganho, 0);

test('scores are deterministic and finite', () => {
  assert.deepEqual(cues.conclusao('fogo', 0.7), cues.conclusao('fogo', 0.7));
  assert.deepEqual(cues.conquista(), cues.conquista());
  for (const p of todas) {
    assert.ok(Number.isFinite(p.duracao) && p.duracao > 0);
    assert.ok(p.vozes.length > 0);
    for (const v of p.vozes) {
      for (const n of [...v.freq, v.atraso, v.ganho, v.pan, ...Object.values(v.adsr), ...(v.filtro ? [...v.filtro.freq, v.filtro.q] : [])]) {
        assert.ok(Number.isFinite(n), JSON.stringify(v));
      }
      assert.ok(v.freq[0] >= 0 && v.ganho > 0);
    }
  }
  assert.doesNotThrow(() => cues.conclusao('fogo', NaN));
});

test('duration limits per cue', () => {
  assert.ok(cues.toque().duracao <= 0.08);
  for (const e of ELS) {
    for (const i of [0, 0.5, 1]) {
      const d = cues.conclusao(e, i).duracao;
      assert.ok(d >= 0.25 && d <= 0.7, `${e} ${i} ${d}`);
    }
    for (const n of [2, 3, 4, 6, 8, 10, 99]) {
      const d = cues.nivel(e, n).duracao;
      assert.ok(d >= 1.2 && d <= 2.5, `${e} ${n} ${d}`);
    }
  }
  for (const p of todas.filter((x) => x.sinal === 'troca')) assert.ok(p.duracao >= 0.9 && p.duracao <= 1.1, String(p.duracao));
  const c = cues.conquista().duracao;
  assert.ok(c >= 2.8 && c <= 3.2, String(c));
});

test('each element sounds different', () => {
  const sig = (f) => new Set(ELS.map((e) => JSON.stringify(f(e)))).size;
  assert.equal(sig((e) => cues.conclusao(e, 0.5)), 4);
  assert.equal(sig((e) => cues.nivel(e, 3)), 4);
});

test('intensity and level add layers and gain monotonically', () => {
  for (const e of ELS) {
    let vozes = 0;
    let ganho = 0;
    for (const i of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
      const p = cues.conclusao(e, i);
      assert.ok(p.vozes.length >= vozes && soma(p) >= ganho, `${e} ${i}`);
      vozes = p.vozes.length;
      ganho = soma(p);
    }
    assert.ok(cues.conclusao(e, 1).vozes.length > cues.conclusao(e, 0).vozes.length);
    let v2 = 0;
    for (const n of [2, 3, 4, 5, 6, 8]) {
      const c = cues.nivel(e, n).vozes.length;
      assert.ok(c >= v2);
      v2 = c;
    }
    assert.ok(cues.nivel(e, 8).vozes.length > cues.nivel(e, 2).vozes.length);
  }
});

test('no voice peaks above 1 and sustain is a ratio', () => {
  for (const p of todas) for (const v of p.vozes) {
    assert.ok(v.ganho <= 1);
    assert.ok(v.adsr.sustain >= 0 && v.adsr.sustain <= 1);
    assert.ok(Math.abs(v.pan) <= 1);
  }
});

function memoria() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

test('preferences: defaults, persistence, invalid values, clamping, subscribe', () => {
  const antes = globalThis.localStorage;
  globalThis.localStorage = memoria();
  try {
    assert.deepEqual(prefs.lerPreferencias(), { ligado: true, volume: 0.6, haptico: true });
    const vistos = [];
    const sair = prefs.assinarPreferencias((p) => vistos.push(p));
    prefs.salvarPreferencias({ volume: 7, ligado: false });
    assert.deepEqual(prefs.lerPreferencias(), { ligado: false, volume: 1, haptico: true });
    prefs.salvarPreferencias({ volume: -3 });
    assert.equal(prefs.lerPreferencias().volume, 0);
    assert.equal(vistos.length, 2);
    sair();
    prefs.salvarPreferencias({ haptico: false });
    assert.equal(vistos.length, 2);
    globalThis.localStorage.setItem(prefs.CHAVE_SOM, '{"ligado":"sim","volume":"alto","haptico":false}');
    assert.deepEqual(prefs.lerPreferencias(), { ligado: true, volume: 0.6, haptico: false });
    globalThis.localStorage.setItem(prefs.CHAVE_SOM, '{"volume":99}');
    assert.equal(prefs.lerPreferencias().volume, 1);
    for (const lixo of ['not json', 'null', '[1]', '"x"']) {
      globalThis.localStorage.setItem(prefs.CHAVE_SOM, lixo);
      assert.deepEqual(prefs.lerPreferencias(), { ligado: true, volume: 0.6, haptico: true });
    }
    globalThis.localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
    assert.doesNotThrow(() => prefs.salvarPreferencias({ volume: 0.2 }));
    assert.equal(prefs.lerPreferencias().volume, 0.6);
  } finally {
    globalThis.localStorage = antes;
    if (antes === undefined) delete globalThis.localStorage;
  }
});

test('engine and public API are safe no-ops without AudioContext', async () => {
  assert.equal(globalThis.AudioContext, undefined);
  assert.equal(await api.ativarSom(), false);
  assert.doesNotThrow(() => {
    api.tocarConclusao('fogo', 1);
    api.tocarNivel('agua', 3);
    api.tocarTrocaDeElemento('ar', 'terra');
    api.tocarToque();
    api.tocarConquista();
  });
  const m = engineMod.criarMotor({ criarContexto: () => { throw new Error('boom'); } });
  assert.equal(await m.ativarSom(), false);
  assert.doesNotThrow(() => m.tocar(cues.toque()));
});

function contextoFalso(registro) {
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} });
  const no = (extra = {}) => ({ connect() {}, disconnect() {}, ...extra });
  return {
    state: 'running', currentTime: 1, sampleRate: 8000, destination: no(),
    resume() { return Promise.resolve(); },
    createGain() { return no({ gain: param() }); },
    createDynamicsCompressor() { return no({ threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() }); },
    createBuffer(_c, n) { const d = new Float32Array(n); return { getChannelData: () => d }; },
    createDelay() { return no({ delayTime: param() }); },
    createBiquadFilter() { return no({ frequency: param(), Q: param() }); },
    createStereoPanner() { return no({ pan: param() }); },
    createOscillator() { const o = no({ frequency: param(), start() { registro.push(o); }, stop() {} }); return o; },
    createBufferSource() { const o = no({ start() { registro.push(o); }, stop() {} }); return o; },
  };
}

test('engine with a fake context: gesture gate, mute, hidden, polyphony, rate limit', async () => {
  const antes = globalThis.localStorage;
  globalThis.localStorage = memoria();
  const fontes = [];
  let oculto = false;
  let t = 1000;
  const m = engineMod.criarMotor({ criarContexto: () => contextoFalso(fontes), oculto: () => oculto, agora: () => t });
  try {
    m.tocar(cues.toque());
    assert.equal(fontes.length, 0, 'nothing before activation');
    assert.equal(await m.ativarSom(), true);
    m.tocar(cues.toque());
    assert.equal(fontes.length, 1);
    oculto = true;
    m.tocar(cues.toque());
    assert.equal(fontes.length, 1, 'hidden tab is silent');
    oculto = false;
    prefs.salvarPreferencias({ ligado: false });
    m.tocar(cues.toque());
    assert.equal(fontes.length, 1, 'muted');
    prefs.salvarPreferencias({ ligado: true });
    for (let i = 0; i < 5; i += 1) m.tocar(cues.conquista());
    assert.ok(m.vozesAtivas <= engineMod.MAX_VOZES, String(m.vozesAtivas));
    const n = fontes.length;
    t = 5000;
    m.tocarConclusao(cues.conclusao('terra', 0.5));
    const depoisPrimeira = fontes.length;
    assert.ok(depoisPrimeira > n);
    t = 5010;
    m.tocarConclusao(cues.conclusao('terra', 0.5));
    assert.equal(fontes.length, depoisPrimeira, 'second completion within 80 ms is coalesced');
    await new Promise((r) => setTimeout(r, 120));
    assert.ok(fontes.length > depoisPrimeira, 'coalesced one plays after the window');
  } finally {
    globalThis.localStorage = antes;
    if (antes === undefined) delete globalThis.localStorage;
  }
});
