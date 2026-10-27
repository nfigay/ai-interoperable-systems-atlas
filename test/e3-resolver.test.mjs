import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { evaluate, validateRegistry } from '../scripts/e3-resolver.mjs';
const data = JSON.parse(readFileSync(resolve(import.meta.dirname, '../data/e3/configurations.json'), 'utf8'));
const sources = JSON.parse(readFileSync(resolve(import.meta.dirname, '../data/e3/sources.json'), 'utf8'));
test('registries have unique identifiers and valid source links', () => assert.equal(validateRegistry(sources, data), true));
for (const c of data.cases) {
  test(`${c.id} => ${c.expected}`, () => {
    const spec = data.specifications.find(s => s.id === c.specId);
    assert.equal(evaluate(c, spec, data.catalog).status, c.expected);
  });
}
test('unknown selected realization fails closed', () => {
  const spec = data.specifications[0];
  const result = evaluate({ id: 'case:missing', selectedIds: ['unknown@0'] }, spec, data.catalog);
  assert.equal(result.status, 'incompatible');
});
