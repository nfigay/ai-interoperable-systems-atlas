import { describe, it, expect } from 'vitest';
import model from '../data/e3/federated-compositions.json';
import registry from '../data/e3/configurations.json';
import { toCompoundElements } from '../src/e3/compound-model.js';
import { evaluate } from '../scripts/e3-resolver.mjs';
import { existsSync } from 'node:fs';

const byId = list => new Map(list.map(item => [item.id, item]));
const occ = byId(model.occurrences);
const comps = byId(model.compositions);
const cases = byId(registry.cases);
const specs = byId(registry.specifications);

describe('E3.1 functional contract audit (not browser qualification)', () => {
  it('keeps connections internal to the composition of their endpoint occurrences', () => {
    for (const link of model.connections) {
      expect(occ.has(link.from), link.id).toBe(true);
      expect(occ.has(link.to), link.id).toBe(true);
      expect(occ.get(link.from).composition, link.id).toBe(occ.get(link.to).composition);
    }
  });
  it('maps every baseline to a genuine E3 evaluation rather than trusting a textual label', () => {
    for (const baseline of model.configurations) {
      const example = cases.get(baseline.case);
      expect(example, baseline.id).toBeDefined();
      expect(example.selectedIds, baseline.id).toEqual(baseline.nativeSelections);
      const result = evaluate(example, specs.get(example.specId), registry.catalog);
      expect(result.status, baseline.id).toBe(example.expected);
    }
  });
  it('does not conflate compound containment with a semantic composition edge', () => {
    const projected = toCompoundElements(model);
    const nodes = projected.filter(e => !e.data.source);
    const edges = projected.filter(e => !!e.data.source);
    expect(nodes).toHaveLength(model.compositions.length + model.occurrences.length);
    expect(edges).toHaveLength(model.connections.length);
    for (const o of model.occurrences) {
      const item = nodes.find(e => e.data.id === o.id);
      expect(item.data.parent).toBe(o.composition);
      expect(comps.has(item.data.parent)).toBe(true);
      expect(item.data.definition).toBe(o.definition);
      expect(item.data.selectedVersion).toBe(o.versionSelection);
    }
  });
  it('maintains distinct reusable-definition and occurrence identities', () => {
    const ids = model.occurrences.map(o=>o.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(model.occurrences.filter(o => o.definition === 'def:agent').length).toBeGreaterThan(1);
  });
  it('keeps source-document references explicit and warns if they are mobile', () => {
    for (const r of model.federatedReferences) {
      expect(r.authority).toBeTruthy();
      expect(r.granularity).toBeTruthy();
      expect(typeof r.pinned).toBe('boolean');
      if (!r.pinned) expect(r.selection).toBeTruthy();
      if (r.authority === 'atlas-git') expect(existsSync(r.nativeLocator), r.id).toBe(true);
    }
  });
});
