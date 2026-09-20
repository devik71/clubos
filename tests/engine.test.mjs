import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialEngine, engineReducer, available } from '../lib/engine.ts';

test('failed source is rejected; successful recovery returns only verified camera', () => {
  let s = engineReducer(initialEngine, { type: 'force', camera: 'B' });
  s = engineReducer(s, { type: 'fail', persistent: false });
  for (let i = 0; i < 8; i++) {
    assert.equal(s.program, 'A');
    assert.equal(available(s, 'B'), false);
    assert.equal(engineReducer(s, { type: 'force', camera: 'B' }).program, 'A');
    s = engineReducer(s, { type: 'tick' });
  }
  assert.equal(available(s, 'B'), true);
});
test('exhausted recovery preserves safe stream and notifies human', () => {
  let s = engineReducer(initialEngine, { type: 'fail', persistent: true });
  for (let i = 0; i < 40; i++) {
    s = engineReducer(s, { type: 'tick' });
    assert.notEqual(s.program, 'B');
  }
  assert.equal(available(s, 'B'), false);
  assert.ok(s.logs.some(l => l.includes('Human notified')));
});
test('manual scene remains locked and auto respects excluded sources', () => {
  let s = engineReducer(initialEngine, { type: 'force', camera: 'C' });
  for (let i = 0; i < 20; i++) s = engineReducer(s, { type: 'tick' });
  assert.equal(s.program, 'C');
  s = engineReducer(s, { type: 'exclude', camera: 'B' });
  s = engineReducer(s, { type: 'auto' });
  for (let i = 0; i < 30; i++) {
    s = engineReducer(s, { type: 'tick' });
    assert.notEqual(s.program, 'B');
  }
});
test('recovery cannot override a human battery-change exclusion', () => {
  let s = engineReducer(initialEngine, { type: 'exclude', camera: 'B' });
  s = engineReducer(s, { type: 'fail', persistent: false });
  for (let i = 0; i < 10; i++) s = engineReducer(s, { type: 'tick' });
  assert.equal(available(s, 'B'), false);
});
test('pause freezes simulation and reset restores initial state', () => {
  const paused = engineReducer(initialEngine, { type: 'pause' });
  assert.deepEqual(engineReducer(paused, { type: 'tick' }), paused);
  assert.deepEqual(engineReducer(paused, { type: 'reset' }), initialEngine);
});
