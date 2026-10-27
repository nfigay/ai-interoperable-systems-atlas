import {describe,it,expect} from 'vitest';
import model from '../data/e3/federated-compositions.json';
import {HIERARCHIES,hierarchyProjection} from '../src/landscape/hierarchies.js';

describe('Atlas explicit multi-hierarchy projections',()=>{
  it('offers independent navigational hierarchies',()=>expect(HIERARCHIES.map(h=>h.id)).toEqual(['decomposition','realization','governance','connectivity']));
  it('traces 3 levels to native authority without fabricated part-of',()=>{
    const x=hierarchyProjection(model,'comp:reference','realization',3);
    expect(x.nodes.find(n=>n.resourceId==='demo-registry')?.depth).toBe(3);
    expect(x.links.every(e=>e.evidence.field&&e.evidence.sourceId)).toBe(true);
    expect(x.links.some(e=>e.type==='part-of')).toBe(false);
  });
  it('traces baseline, federated reference, authority',()=>{
    const x=hierarchyProjection(model,'comp:reference','governance',3);
    expect(x.nodes.some(n=>n.resourceId==='baseline:reference')).toBe(true);
    expect(x.nodes.some(n=>n.resourceId==='ref:method')).toBe(true);
    expect(x.nodes.some(n=>n.resourceId==='atlas-git')).toBe(true);
  });
  it('depth restriction is a projection not destructive editing',()=>{
    const shallow=hierarchyProjection(model,'comp:reference','realization',1);
    const deep=hierarchyProjection(model,'comp:reference','realization',3);
    expect(shallow.nodes.length).toBe(5);
    expect(deep.nodes.length).toBeGreaterThan(shallow.nodes.length);
    expect(shallow.excluded.length).toBeGreaterThan(0);
  });
  it('preserves only actual typed connection records',()=>{
    const x=hierarchyProjection(model,'comp:alternative','connectivity',2);
    const relations=x.links.filter(e=>e.evidence.field==='connection.from/to');
    expect(relations).toHaveLength(3);
    expect(relations.every(e=>e.evidence.sourceId.startsWith('conn:alt-'))).toBe(true);
  });
  it('rejects unknown view, composition and depth',()=>{
    expect(()=>hierarchyProjection(model,'comp:reference','invented',3)).toThrow();
    expect(()=>hierarchyProjection(model,'other','realization',3)).toThrow();
    expect(()=>hierarchyProjection(model,'comp:reference','realization',8)).not.toThrow();
    expect(()=>hierarchyProjection(model,'comp:reference','realization',9)).toThrow();
    expect(()=>hierarchyProjection(model,'comp:reference','realization',-1)).toThrow();
  });
});
