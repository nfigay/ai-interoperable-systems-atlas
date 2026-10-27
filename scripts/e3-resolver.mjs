/** Atlas E3 illustrative, deterministic constraint evaluator; not SAT/SMT or p2 implementation. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

import {evaluate} from '../src/e3/evaluate.js';
export {evaluate};

export function validateRegistry(sources, configs) {
  const fail = message => { throw new Error(message); };
  if (sources.schemaVersion !== 'atlas-e3/0.1' || configs.schemaVersion !== 'atlas-e3/0.1') fail('Unsupported schema');
  const sourceIds = new Set();
  for (const src of sources.sources) {
    if (!src.id || sourceIds.has(src.id)) fail(`Duplicate/blank source id: ${src.id}`);
    sourceIds.add(src.id);
    if (!src.canonicalUrl.startsWith('https://')) fail(`Untrusted source URL: ${src.id}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(src.observedAt)) fail(`Missing observation date: ${src.id}`);
  }
  const ids = new Set();
  for (const comp of configs.catalog) {
    if (!comp.id || ids.has(comp.id)) fail(`Duplicate component: ${comp.id}`);
    ids.add(comp.id);
    for (const field of ['provides', 'requires', 'sourceIds']) if (!Array.isArray(comp[field])) fail(`Invalid ${field} on ${comp.id}`);
    for (const id of comp.sourceIds) if (!sourceIds.has(id)) fail(`Unknown source: ${id}`);
  }
  const specs = new Set();
  for (const spec of configs.specifications) {
    if (specs.has(spec.id)) fail(`Duplicate spec: ${spec.id}`);
    specs.add(spec.id);
    for (const id of spec.sourceIds) if (!sourceIds.has(id)) fail(`Unknown source: ${id}`);
  }
  for (const c of configs.cases) if (!specs.has(c.specId)) fail(`Unknown spec: ${c.specId}`);
  return true;
}

const self = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === self) {
  const root = resolve(dirname(self), '..');
  const data = JSON.parse(readFileSync(resolve(root, 'data/e3/configurations.json'), 'utf8'));
  const sources = JSON.parse(readFileSync(resolve(root, 'data/e3/sources.json'), 'utf8'));
  validateRegistry(sources, data);
  const results = data.cases.map(c => evaluate(c, data.specifications.find(s => s.id === c.specId), data.catalog));
  for (const result of results) console.log(`${result.caseId}: ${result.status}`);
  if (results.some((r, i) => r.status !== data.cases[i].expected)) process.exitCode = 1;
}
