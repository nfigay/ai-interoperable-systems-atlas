import {describe,it,expect} from 'vitest';
import {createReifiedPartsRegistry} from '../src/e3/reified-parts.js';
import source from '../data/e3/illustrative-decomposition.json' with {type:'json'};
import dataset from '../data/e3/reified-parts.json' with {type:'json'};

describe('reified direct parts',()=>{
  it('binds all direct usages to source assertions',()=>{
    const r=createReifiedPartsRegistry();
    expect(r.validateSource(source)).toEqual([]);
  });
  it('represents server unit and interface as distinct direct parts',()=>{
    const r=createReifiedPartsRegistry();
    const a=r.byRoot.get('demo:ref-server-internal');
    expect(r.directParts(a.id).map(x=>x.usage.graphNode).sort()).toEqual(['demo:ref-server-interface','demo:ref-server-unit']);
  });
  it('never invents configuration items or realizations',()=>{
    const r=createReifiedPartsRegistry();
    expect([...r.parts.values()].every(p=>p.configurationItem===null&&p.candidateItemDefinition===null)).toBe(true);
  });
  it('does not return grandchildren as direct parts',()=>{
    const r=createReifiedPartsRegistry();
    const a=r.byRoot.get('demo:ref-server-internal');
    expect(r.directParts(a.id).every(x=>x.usage.parentGraphNode==='demo:ref-server-internal')).toBe(true);
    expect(r.directParts(a.id).some(x=>x.usage.graphNode==='occ:ref-server')).toBe(false);
  });
  it('rejects a wrong direct parent rather than traversing ancestors',()=>{
    const changed=structuredClone(dataset);
    changed.partUsages[0].parentGraphNode='occ:ref-agent';
    const r=createReifiedPartsRegistry(changed);
    expect(r.validateSource(source).some(x=>x.includes('Mismatch direct membership'))).toBe(true);
  });
});
