import {describe,it,expect} from 'vitest';
import model from '../data/e3/federated-compositions.json' with {type:'json'};
import {decompositionProjection} from '../src/landscape/decomposition.js';
import {hierarchyGraphElements} from '../src/landscape/hierarchy-graph.js';

describe('nested native components in a single typed compound projection',()=>{
  it.each(['comp:reference','comp:alternative'])('all four occurrences of %s have explicitly illustrative internal children',id=>{
    const projection=decompositionProjection(model,id,8);
    const graph=hierarchyGraphElements(projection,new Set(),model);
    const nodes=new Map(graph.nodes.map(n=>[n.data.id,n.data]));
    for(const occ of model.occurrences.filter(o=>o.composition===id)){
      const internals=graph.nodes.filter(n=>n.data.parent===occ.id);
      expect(internals).toHaveLength(1);
      expect(internals[0].data.evidenceStatus).toMatch(/illustrative/);
      expect(graph.nodes.filter(n=>n.data.parent===internals[0].data.id)).toHaveLength(2);
      expect(nodes.get(occ.id)?.kind).toBe('occurrence');
    }
  });
  it('retains native typed connections independently from containment',()=>{
    const p=decompositionProjection(model,'comp:reference',8);
    const graph=hierarchyGraphElements(p,new Set(),model);
    const native=model.connections.filter(c=>c.from.startsWith('occ:ref-')&&c.to.startsWith('occ:ref-'));
    expect(graph.edges.filter(x=>x.data.nativeConnection)).toHaveLength(native.length);
    for(const link of native){const edge=graph.edges.find(e=>e.data.id===link.id);expect(edge.data.source).toBe(link.from);expect(edge.data.type).toBe(link.kind)}
    expect(graph.nodes.filter(n=>n.data.id.startsWith('demo:') && n.data.id.includes('-internal')).every(n=>n.data.kind==='illustrative-group')).toBe(true);
  });
  it('keeps recursive containers intact when folded state changes',()=>{
    const p=decompositionProjection(model,'comp:reference',8);
    const a=hierarchyGraphElements(p,new Set(),model);
    const b=hierarchyGraphElements(p,new Set(['occ:ref-client']),model);
    expect(b.nodes).toEqual(a.nodes);
    expect(b.edges).toEqual(a.edges);
  });
});
