import {describe,it,expect} from 'vitest';
import model from '../data/e3/federated-compositions.json';
import example from '../data/e3/illustrative-decomposition.json';
import {decompositionProjection} from '../src/landscape/decomposition.js';
import {foldableProjection} from '../src/landscape/hierarchy-fold.js';
import {hierarchyGraphElements} from '../src/landscape/hierarchy-graph.js';

describe('authored illustrative recursive decomposition',()=>{
  it('has explicit paths deeper than 3, and preserves native occurrence IDs',()=>{
    const p=decompositionProjection(model,'comp:reference');
    expect(p.nodes.find(n=>n.id==='occ:ref-client').depth).toBe(5);
    expect(p.links.every(e=>e.evidence.status==='illustrative-author-asserted-not-normative')).toBe(true);
  });
  it('folding one intermediate node leaves sibling branches visible',()=>{
    const p=decompositionProjection(model,'comp:reference');
    const view=foldableProjection(p,new Set(['demo:ref-client-layer']));
    expect(view.nodes.some(n=>n.id==='occ:ref-client')).toBe(false);
    expect(view.nodes.some(n=>n.id==='occ:ref-server')).toBe(true);
    expect(view.nodes.some(n=>n.id==='demo:ref-client-layer')).toBe(true);
    // The Structure tree uses foldableProjection; the compound graph delegates
    // folding to Cytoscape expand-collapse without deleting source elements.
    const compound=hierarchyGraphElements(p,new Set(['demo:ref-client-layer']));
    expect(compound.compound).toBe(true);
    expect(compound.nodes.find(n=>n.data.id==='occ:ref-client').data.parent).toBe('demo:ref-client-slot');
    expect(compound.nodes.some(n=>n.data.id==='occ:ref-server')).toBe(true);
    expect(compound.nodes).toHaveLength(p.nodes.length);
  });
  it('depth limit only changes view, not source assertions',()=>{
    const shallow=decompositionProjection(model,'comp:reference',2);
    const complete=decompositionProjection(model,'comp:reference');
    expect(shallow.nodes.length).toBeLessThan(complete.nodes.length);
    expect(example.structures[0].nodes.length).toBeGreaterThan(9);
    expect(example.structures[0].nodes.length).toBe(complete.nodes.length - 1);
    expect(complete.excluded).toHaveLength(0);
  });
  it('rejects cycles instead of silently creating fake trees',()=>{
    const bad=structuredClone(example);
    bad.structures[0].nodes.find(n=>n.id==='demo:ref-system').parent='demo:ref-client-slot';
    expect(()=>decompositionProjection(model,'comp:reference',Infinity,bad)).toThrow();
  });
});
