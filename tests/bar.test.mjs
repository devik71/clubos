import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateBar, barItems } from '../lib/bar.ts';

test('new prices recalculate purchase and required cash while preserving reserve', () => {
  const result = calculateBar(barItems, 2500, 1000, true);
  assert.equal(result.total, 3357);
  assert.equal(result.available, 1500);
  assert.equal(result.needed, 1857);
  assert.ok(calculateBar(barItems, 2500, 1000, false).total < result.total);
});
test('no purchases needed when stock already meets targets', () => {
  const result = calculateBar(barItems.map(i => ({ ...i, target: 0 })), 2500, 1000, true);
  assert.equal(result.total, 0);
  assert.equal(result.needed, 0);
});
test('cash below reserve includes replenishing reserve, ample cash needs no top-up', () => {
  assert.equal(calculateBar(barItems, 300, 1000, true).needed, 4057);
  assert.equal(calculateBar(barItems, 10000, 1000, true).needed, 0);
});
