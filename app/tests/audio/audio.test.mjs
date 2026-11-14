import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';

const cues = loadComponent('src/lib/audio/cues.ts');
const prefs = loadComponent('src/lib/audio/preferencias.ts');
const render = loadComponent('src/lib/audio/render.ts');
const timbres_ = loadComponent('src/lib/audio/timbres.ts');
const engineMod = loadComponent('src/lib/audio/engine.ts');
const api = loadComponent('src/lib/audio/index.ts');
const ELS = ['fogo', 'agua', 'ar', 'terra'];
const todas = [
  ...ELS.flatMap((e) => [cues.conclusao(e, 0), cues.conclusao(e, 0.5), cues.conclusao(e, 1), ...[2, 3, 5, 10].map((n) => cues.nivel(e, n))]),
  ...ELS.flatMap((a) => ELS.map((b) => cues.trocaDeElemento(a, b))),
  cues.toque(),
  cues.conquista(),
];

test('scores are deterministic, finite and bounded', () => {
  assert.deepEqual(cues.conclusao('fogo', 0.7), cues.conclusao('fogo', 0.7));
  assert.deepEqual(cues.conquista(), cues.conquista());
  for (const p of todas) {
    assert.ok(Number.isFinite(p.duracao) && p.duracao > 0);
    assert.ok(p.vozes.length > 0);
    assert.ok(p.pico > 0 && p.pico <= 0.9, `${p.chave} pico ${p.pico}`);
    assert.ok(p.reverb >= 0 && p.reverb <= 0.5);
    for (const v of p.vozes) {
      for (const n of [v.freq, v.freq2, v.atraso, v.dur, v.ganho, v.pan, v.brilho, v.semente]) assert.ok(Number.isFinite(n), JSON.stringify(v));
      assert.ok(v.freq >= 0 && v.ganho > 0 && v.ganho <= 1 && Math.abs(v.pan) <= 1 && v.dur > 0 && v.atraso >= 0);
      assert.ok(v.atraso + v.dur <= p.duracao + 1e-6);
    }
  }
  assert.doesNotThrow(() => cues.conclusao('fogo', NaN));
});

test('duration limits per cue (score)', () => {
  assert.ok(cues.toque().duracao <= 0.08);
  for (const e of ELS) {
    for (const i of [0, 0.5, 1]) {
      const d = cues.conclusao(e, i).duracao;
      assert.ok(d >= 0.25 && d <= 0.7, `${e} ${i} ${d}`);
    }
    for (const n of [2, 3, 4, 6, 8, 10, 99]) {
      const d = cues.nivel(e, n).duracao;
      assert.ok(d >= 1.2 && d <= 2.8, `${e} ${n} ${d}`);
    }
  }
  for (const p of todas.filter((x) => x.sinal === 'troca')) assert.ok(p.duracao >= 0.9 && p.duracao <= 1.1, String(p.duracao));
  const c = cues.conquista().duracao;
  assert.ok(c >= 2.8 && c <= 3.4, String(c));
});

test('each element sounds different', () => {
  const sig = (f) => new Set(ELS.map((e) => JSON.stringify(f(e).vozes))).size;
  assert.equal(sig((e) => cues.conclusao(e, 0.5)), 4);
  assert.equal(sig((e) => cues.nivel(e, 3)), 4);
  assert.equal(sig((e) => cues.nivel(e, 2)), 4);
});

test('tonics follow the D major pentatonic', () => {
  const tonica = { terra: 293.66, fogo: 369.99, agua: 440, ar: 493.88 };
  for (const e of ELS) assert.ok(Math.abs(cues.freqGrau(({ terra: 0, fogo: 2, agua: 3, ar: 4 })[e]) - tonica[e]) < 0.1);
  assert.equal(cues.nivel('terra', 2).vozes.filter((v) => v.timbre === 'harpa').length, 4);
  assert.ok(cues.nivel('ar', 3).vozes.some((v) => v.timbre === 'sub'));
});

test('intensity and level add layers monotonically', () => {
  for (const e of ELS) {
    let vozes = 0;
    for (const i of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
      const n = cues.conclusao(e, i).vozes.length;
      assert.ok(n >= vozes, `${e} ${i}`);
      vozes = n;
    }
    assert.ok(cues.conclusao(e, 1).vozes.length > cues.conclusao(e, 0).vozes.length);
    assert.ok(cues.conclusao(e, 1).vozes[0].brilho > cues.conclusao(e, 0).vozes[0].brilho, 'intensity brightens');
    assert.ok(cues.nivel(e, 3).vozes.length > cues.nivel(e, 2).vozes.length);
    assert.ok(cues.nivel(e, 8).vozes.length > cues.nivel(e, 3).vozes.length);
  }
});

/* ---- pure rendering ---- */

const SR = 24000;
const energia = (b, de, ate) => {
  let s = 0;
  for (let i = de; i < ate; i += 1) s += b[i] * b[i];
  return s;
};

test('rendering is finite, normalized, non-silent, decays and is deterministic', () => {
  for (const p of todas) {
    const r = render.renderizarPartitura(SR, p);
    const n = r.esquerdo.length;
    assert.equal(n, Math.ceil(p.duracao * SR));
    assert.equal(r.direito.length, n);
    let pico = 0;
    for (const canal of [r.esquerdo, r.direito]) {
      for (let i = 0; i < n; i += 1) {
        assert.ok(Number.isFinite(canal[i]), `${p.chave} ${i}`);
        pico = Math.max(pico, Math.abs(canal[i]));
      }
    }
    assert.ok(pico <= 0.9 + 1e-6 && pico > 0.05, `${p.chave} pico ${pico}`);
    assert.ok(Math.abs(pico - p.pico) < 1e-3, `${p.chave} normalized to its target`);
    const e = energia(r.esquerdo, 0, n) + energia(r.direito, 0, n);
    assert.ok(e > 0);
    if (p.sinal !== 'troca') {
      const dec = Math.floor(n / 10);
      const inicio = energia(r.esquerdo, 0, dec) + energia(r.direito, 0, dec);
      const fim = energia(r.esquerdo, n - dec, n) + energia(r.direito, n - dec, n);
      assert.ok(fim < inicio * 0.1, `${p.chave} decays: ${fim} vs ${inicio}`);
    }
  }
  const a = render.renderizarPartitura(SR, cues.conclusao('agua', 1));
  const b = render.renderizarPartitura(SR, cues.conclusao('agua', 1));
  assert.deepEqual(a.esquerdo, b.esquerdo);
});

test('different elements and levels render different buffers; rendered lengths stay in limits', () => {
  const r = (p) => render.renderizarPartitura(SR, p);
  const igual = (x, y) => x.esquerdo.length === y.esquerdo.length && x.esquerdo.every((v, i) => v === y.esquerdo[i]);
  for (let i = 0; i < ELS.length; i += 1) {
    for (let j = i + 1; j < ELS.length; j += 1) {
      assert.ok(!igual(r(cues.conclusao(ELS[i], 0.5)), r(cues.conclusao(ELS[j], 0.5))));
      assert.ok(!igual(r(cues.nivel(ELS[i], 3)), r(cues.nivel(ELS[j], 3))));
    }
    assert.ok(!igual(r(cues.conclusao(ELS[i], 0)), r(cues.conclusao(ELS[i], 1))));
  }
  const seg = (p) => r(p).esquerdo.length / SR;
  assert.ok(seg(cues.toque()) <= 0.08 + 1e-3);
  for (const e of ELS) {
    for (const i of [0, 0.5, 1]) assert.ok(seg(cues.conclusao(e, i)) <= 0.7 + 1e-3);
    for (const n of [2, 3, 5]) assert.ok(seg(cues.nivel(e, n)) <= 2.8 + 1e-3);
  }
  assert.ok(seg(cues.conquista()) <= 3.4 + 1e-3);
});

test('every timbre renders finite, normalized samples at several sample rates', () => {
  const timbres = ['sino', 'cristal', 'harpa', 'sopro', 'whoosh', 'estalo', 'brasa', 'gota', 'bolha', 'batida', 'marimba', 'cascalho', 'sub', 'coro', 'swell', 'clique'];
  for (const sr of [8000, 22050, 44100, 48000]) {
    for (const timbre of timbres) {
      for (const freq of [55, 440, 1976, 5000]) {
        const v = { timbre, freq, freq2: freq * 2, atraso: 0, dur: 0.3, ganho: 1, pan: 0, brilho: 1, semente: 7 };
        const b = timbres_.renderizarVoz(sr, v);
        assert.equal(b.length, Math.round(0.3 * sr));
        let pico = 0;
        for (let i = 0; i < b.length; i += 1) {
          assert.ok(Number.isFinite(b[i]), `${timbre} ${sr} ${freq}`);
          pico = Math.max(pico, Math.abs(b[i]));
        }
        assert.ok(pico <= 1 + 1e-6, `${timbre} ${pico}`);
        assert.ok(pico > 0.5, `${timbre} ${sr} ${freq} not silent (${pico})`);
      }
    }
  }
});

test('harp string is tuned to the requested pitch', () => {
  const sr = 48000;
  const f = 440;
  const b = timbres_.renderizarVoz(sr, { timbre: 'harpa', freq: f, freq2: f, atraso: 0, dur: 1, ganho: 1, pan: 0, brilho: 0.6, semente: 3 });
  // autocorrelation peak near one period
  const periodo = sr / f;
  let melhor = 0;
  let lag = 0;
  for (let l = Math.floor(periodo * 0.8); l < periodo * 1.2; l += 1) {
    let s = 0;
    for (let i = 2000; i < 8000; i += 1) s += b[i] * b[i + l];
    if (s > melhor) { melhor = s; lag = l; }
  }
  assert.ok(Math.abs(sr / lag - f) / f < 0.02, String(sr / lag));
});

test('reverb impulse response is stereo, decorrelated, decaying and finite', () => {
  const [l, r] = timbres_.renderizarReverb(SR);
  assert.equal(l.length, r.length);
  assert.ok(Math.abs(l.length / SR - 1.5) < 0.05);
  assert.ok(l.every(Number.isFinite) && r.every(Number.isFinite));
  assert.ok(l.some((v, i) => v !== r[i]));
  const n = l.length;
  assert.ok(energia(l, n - Math.floor(n / 10), n) < energia(l, 0, Math.floor(n / 10)) * 0.01);
});

test('rendering cost stays small (conquista < 1.5 s at 48 kHz in Node)', () => {
  const t = Date.now();
  render.renderizarPartitura(48000, cues.conquista());
  assert.ok(Date.now() - t < 1500, `${Date.now() - t} ms`);
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
    createBuffer(_c, n) { const d = new Float32Array(n); return { length: n, getChannelData: () => d }; },
    createConvolver() { return no({ normalize: true, buffer: null }); },
    createDelay() { return no({ delayTime: param() }); },
    createBiquadFilter() { return no({ frequency: param(), Q: param() }); },
    createStereoPanner() { return no({ pan: param() }); },
        createBufferSource() { const o = no({ buffer: null, start() { registro.push(o); }, stop() {} }); return o; },
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
