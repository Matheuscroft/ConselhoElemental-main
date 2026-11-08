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

const { advance, INITIAL_PHASE, isPlaying, isSettled, onVisibility } = load('src/lib/sanctuary/awakening-controller.ts');
const { createAwakeningAudio } = load('src/lib/sanctuary/awakening-audio.ts');

test('the scene starts idle and only plays once it has something to show', () => {
  assert.equal(INITIAL_PHASE, 'idle');
  assert.equal(isPlaying('idle'), false);
  assert.equal(advance('idle', 'load'), 'loading');
  assert.equal(advance('loading', 'ready'), 'running');
  assert.equal(isPlaying('running'), true);
});

test('an unexpected signal is ignored rather than breaking the scene', () => {
  assert.equal(advance('idle', 'resume'), 'idle');
  assert.equal(advance('loading', 'pause'), 'loading');
  assert.equal(advance('running', 'resume'), 'running');
});

test('finishing and skipping are terminal: nothing restarts them', () => {
  assert.equal(advance('running', 'complete'), 'done');
  assert.equal(advance('paused', 'complete'), 'done');
  for (const signal of ['start', 'resume', 'pause', 'complete', 'skip']) {
    assert.equal(advance('done', signal), 'done');
    assert.equal(advance('skipped', signal), 'skipped');
  }
  assert.equal(isSettled('done'), true);
  assert.equal(isSettled('skipped'), true);
  assert.equal(isSettled('paused'), false);
});

test('skipping works from anywhere the scene has not already settled', () => {
  for (const phase of ['idle', 'loading', 'running', 'paused']) {
    assert.equal(advance(phase, 'skip'), 'skipped');
  }
});

test('leaving the app pauses, returning resumes, and a settled scene is left alone', () => {
  assert.equal(onVisibility('running', true), 'paused');
  assert.equal(onVisibility('paused', false), 'running');
  assert.equal(onVisibility('done', false), 'done');
  assert.equal(onVisibility('skipped', false), 'skipped');
  // It was already paused when the tab was hidden: hiding again changes nothing.
  assert.equal(onVisibility('paused', true), 'paused');
});

test('teardown always returns to idle, so a remount never inherits a phase', () => {
  for (const phase of ['idle', 'loading', 'running', 'paused', 'done', 'skipped']) {
    assert.equal(advance(phase, 'teardown'), 'idle');
  }
});

// --- audio -----------------------------------------------------------------

const fakeParam = () => ({
  value: 0,
  calls: [],
  cancelScheduledValues() {},
  setValueAtTime(v) { this.value = v; },
  linearRampToValueAtTime(v) { this.calls.push(v); this.value = v; },
});

function fakeContext() {
  const made = { gains: [], oscillators: 0, buffers: 0 };
  const node = () => ({ connect(next) { return next; }, disconnect() {} });
  const context = {
    state: 'suspended',
    currentTime: 0,
    sampleRate: 44100,
    destination: node(),
    resumed: 0,
    suspended: 0,
    closed: false,
    createGain() {
      const g = { ...node(), gain: fakeParam() };
      made.gains.push(g);
      return g;
    },
    createBiquadFilter() {
      return { ...node(), type: '', frequency: fakeParam(), Q: fakeParam() };
    },
    createOscillator() {
      made.oscillators += 1;
      return { ...node(), type: '', frequency: fakeParam(), start() { this.on = true; }, stop() {} };
    },
    createBufferSource() {
      return { ...node(), buffer: null, loop: false, start() { this.on = true; }, stop() {} };
    },
    createBuffer(_channels, length) {
      made.buffers += 1;
      return { getChannelData: () => new Float32Array(length) };
    },
    async resume() { this.resumed += 1; this.state = 'running'; },
    async suspend() { this.suspended += 1; this.state = 'suspended'; },
    async close() { this.closed = true; this.state = 'closed'; },
  };
  return { context, made };
}

test('no audio context exists until a gesture asks for one', async () => {
  let created = 0;
  const audio = createAwakeningAudio(() => { created += 1; return fakeContext().context; });

  audio.lightVoice('fogo');
  audio.setMuted(true);
  assert.equal(created, 0, 'nothing may be built before the person presses');
  assert.equal(audio.started, false);

  await audio.start();
  assert.equal(created, 1);
  assert.equal(audio.started, true);

  await audio.start();
  assert.equal(created, 1, 'starting twice must not build a second graph');
});

test('starting fades up from silence instead of landing at full level', async () => {
  const fake = fakeContext();
  const audio = createAwakeningAudio(() => fake.context);
  await audio.start();

  const master = fake.made.gains[0];
  assert.equal(master.gain.calls.length, 1, 'the master level is reached by a ramp');
  assert.ok(master.gain.calls[0] > 0 && master.gain.calls[0] < 0.5, `master ramped to ${master.gain.calls[0]}`);
  assert.equal(fake.context.resumed, 1, 'a suspended context is resumed by the gesture');
});

test('each element has its own voice, and lighting it twice does not stack', async () => {
  const fake = fakeContext();
  const audio = createAwakeningAudio(() => fake.context);
  await audio.start();

  // gains[0] is the master; one more per element.
  assert.equal(fake.made.gains.length >= 5, true, `only ${fake.made.gains.length} gains were built`);

  const before = fake.made.gains.slice(1).reduce((total, g) => total + g.gain.calls.length, 0);
  audio.lightVoice('agua');
  const once = fake.made.gains.slice(1).reduce((total, g) => total + g.gain.calls.length, 0);
  audio.lightVoice('agua');
  const twice = fake.made.gains.slice(1).reduce((total, g) => total + g.gain.calls.length, 0);

  assert.equal(before, 0);
  assert.equal(once, 1, 'lighting a voice ramps exactly one gain');
  assert.equal(twice, 1, 'lighting the same voice again must do nothing');
});

test('mute and unmute ramp the master rather than cutting it', async () => {
  const fake = fakeContext();
  const audio = createAwakeningAudio(() => fake.context);
  await audio.start();
  const master = fake.made.gains[0];

  audio.setMuted(true);
  assert.equal(master.gain.calls.at(-1), 0);
  assert.equal(audio.muted, true);

  audio.setMuted(false);
  assert.ok(master.gain.calls.at(-1) > 0);
  assert.equal(audio.muted, false);
});

test('leaving suspends and returning resumes, honouring a mute set while away', async () => {
  const fake = fakeContext();
  const audio = createAwakeningAudio(() => fake.context);
  await audio.start();
  const master = fake.made.gains[0];

  await audio.suspend();
  assert.equal(fake.context.suspended, 1);

  audio.setMuted(true);
  await audio.resume();
  assert.equal(master.gain.calls.at(-1), 0, 'coming back must not unmute behind the person');
});

test('stopping closes the context and refuses to start again', async () => {
  const fake = fakeContext();
  let created = 0;
  const audio = createAwakeningAudio(() => { created += 1; return fake.context; });
  await audio.start();
  await audio.stop();

  assert.equal(fake.context.closed, true);
  assert.equal(audio.started, false);

  await audio.start();
  assert.equal(created, 1, 'a torn-down scene must not reopen audio');
});
