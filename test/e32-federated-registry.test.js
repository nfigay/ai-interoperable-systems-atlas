import {describe,it,expect} from 'vitest';
import model from '../data/e3/federated-compositions.json';
import configs from '../data/e3/configurations.json';
import sources from '../data/e3/sources.json';
import {createRegistry} from '../src/e3/federated-registry.js';
const paths=['docs/E3-governed-configurations.md'];
const make=(m=model,c=configs)=>createRegistry(m,c,sources,paths);
describe('E3.2 navigable federation',()=>{
  it('indexes valid composition, baseline and inverse occurrence',()=>{const r=make();expect(r.errors).toEqual([]);expect(r.byComposition('comp:reference').map(x=>x.id)).toEqual(['baseline:reference']);expect(r.byOccurrence('occ:alt-client')[0].id).toBe('baseline:alternative');});
  it('exposes evaluated and explained statuses, not declared values alone',()=>{const r=make();expect(r.records.get('baseline:reference').resolution.status).toBe('resolved');expect(r.records.get('baseline:alternative').resolution.status).toBe('incompatible');expect(r.records.get('baseline:alternative').resolution.errors.join(' ')).toContain('mcp-transport-v0');});
  it('links documentary references back to baselines',()=>{expect(make().byReference('ref:caise')).toHaveLength(2);});
  it('rejects missing Markdown',()=>{expect(createRegistry(model,configs,sources,[]).errors.join(' ')).toContain('Missing Atlas document');});
  it('rejects orphan configuration and mismatched case selections',()=>{const m=structuredClone(model);m.configurations[0].composition='comp:absent';expect(make(m).errors.join(' ')).toContain('Composition without configuration');});
  it('rejects fake pinned native revision',()=>{const m=structuredClone(model);m.federatedReferences[0].pinned=true;expect(make(m).errors.join(' ')).toContain('Pinned without immutable native identity');});
  it('detects resolution case mismatch',()=>{const c=structuredClone(configs);c.cases[0].selectedIds=['client-old@0.8.0'];expect(make(model,c).errors.join(' ')).toContain('Case/occurrence selection mismatch');});
  it('does not confuse Cytoscape parents with semantic composition',()=>{expect(model.projectionPolicy.notEquivalentTo).toContain('semantic-part-of');});
});
