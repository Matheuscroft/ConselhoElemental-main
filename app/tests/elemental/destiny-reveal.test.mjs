import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from './load-component.mjs';
const { createDestinyReveal } = loadComponent('src/components/destiny/destiny-reveal.ts');

function fixture() {
  const results = [], scheduled = new Map(); let id = 0;
  const reveal = createDestinyReveal(value => results.push(value), {
    schedule(callback) { scheduled.set(++id, callback); return id; },
    cancel(id) { scheduled.delete(id); },
  });
  return { results, scheduled, reveal };
}

test('skipping reveals the original choice exactly once even if an old timer fires', () => {
  const { results, scheduled, reveal } = fixture();
  const chosen = Object.freeze({ key: 'habit:existing', title: 'Minha atividade' });
  assert.equal(reveal.start(chosen, 2700), true);
  const callback = [...scheduled.values()][0];
  assert.equal(reveal.start({ key: 'different' }, 2700), false);
  reveal.finish(); reveal.finish(); callback();
  assert.deepEqual(results, [chosen]);
  assert.equal(results[0], chosen);
  assert.equal(scheduled.size, 0);
  assert.equal(reveal.pending, false);
  reveal.start('next', 2700);
  callback();
  assert.deepEqual(results, [chosen], 'a previous timer cannot finish a newer selection');
  reveal.finish();
  assert.deepEqual(results, [chosen, 'next']);
});

test('reduced motion reveals immediately; unmount discards a pending animation result', () => {
  const { results, scheduled, reveal } = fixture();
  reveal.start('first', 0);
  assert.deepEqual(results, ['first']);
  assert.equal(scheduled.size, 0);
  reveal.start('discarded', 2700);
  const callback = [...scheduled.values()][0];
  reveal.dispose(); callback();
  assert.deepEqual(results, ['first']);
  assert.equal(scheduled.size, 0);
  assert.equal(reveal.pending, false);
  reveal.start('next', 0);
  assert.deepEqual(results, ['first', 'next']);
});
