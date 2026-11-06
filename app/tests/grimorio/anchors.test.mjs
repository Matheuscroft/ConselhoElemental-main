import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function fixture() {
  let location = { hash: '', key: 'entry' }, pendingEffect, cleanup;
  const frames = new Map(), calls = [];
  let serial = 0, targetExists = true;
  const output = ts.transpileModule(readFileSync('src/components/grimorio/useGrimoireAnchor.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  const document = { getElementById(id) { calls.push(['find', id]); return targetExists ? { focus(options) { calls.push(['focus', options]); }, scrollIntoView(options) { calls.push(['scroll', options]); } } : null; } };
  new Function('require', 'module', 'exports', 'document', 'requestAnimationFrame', 'cancelAnimationFrame', output)(
    name => name === 'react' ? { useEffect(fn) { pendingEffect = fn; } } : { useLocation() { return location; } },
    module, module.exports, document,
    fn => { frames.set(++serial, fn); return serial; }, id => frames.delete(id),
  );
  return {
    calls, frames,
    render(hash) { cleanup?.(); location = { hash, key: String(serial) }; module.exports.useGrimoireAnchor(); cleanup = pendingEffect(); },
    flush() { for (const [id, fn] of frames) { frames.delete(id); fn(); } },
    unmount() { cleanup?.(); },
    removeTarget() { targetExists = false; },
  };
}

test('history and other known deep links focus their section after the global route reset', () => {
  for (const hash of ['#grimoire-history', '#grimoire-character', '#grimoire-elements', '#grimoire-backup', '#grimoire%2Dhistory']) {
    const f = fixture(); f.render(hash);
    assert.deepEqual(f.calls, [], 'must wait for mounted sections');
    f.flush();
    assert.deepEqual(f.calls, [['find', decodeURIComponent(hash.slice(1))], ['focus', { preventScroll: true }], ['scroll', { block: 'start', behavior: 'instant' }]]);
  }
});

test('unknown, absent and malformed anchors preserve ordinary route navigation', () => {
  for (const hash of ['', '#', '#unknown', '#%broken', '#main-content']) {
    const f = fixture(); f.render(hash); f.flush();
    assert.equal(f.frames.size, 0);
    assert.deepEqual(f.calls, []);
  }
});

test('fast section changes and unmount cancel stale navigation work', () => {
  const f = fixture(); f.render('#grimoire-history'); f.render('#grimoire-elements');
  assert.equal(f.frames.size, 1); f.flush();
  assert.equal(f.calls[0][1], 'grimoire-elements');
  f.render('#grimoire-character'); f.unmount();
  assert.equal(f.frames.size, 0);
});

test('missing section is harmless and requires no observer or polling', () => {
  const f = fixture(); f.removeTarget(); f.render('#grimoire-history'); f.flush();
  assert.deepEqual(f.calls, [['find', 'grimoire-history']]);
  assert.equal(f.frames.size, 0);
});
