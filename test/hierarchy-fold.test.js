import {describe,it,expect} from 'vitest';
import model from '../data/e3/federated-compositions.json';
import {hierarchyProjection} from '../src/landscape/hierarchies.js';
import {foldableProjection} from '../src/landscape/hierarchy-fold.js';
const p=(h='realization')=>hierarchyProjection(model,'comp:reference',h,3);
describe('Node-level folding without altering landscape',()=>{
  it('expanded state is unchanged',()=>{
    const x=p(), f=foldableProjection(x);
    expect(f.nodes).toHaveLength(x.nodes.length);
    expect(f.links).toHaveLength(x.links.length);
  });
  it('collapses one occurrence branch only',()=>{
    const x=p();const f=foldableProjection(x,new Set(['occurrence:occ:ref-client']));
    expect(f.nodes.some(n=>n.id==='occurrence:occ:ref-client')).toBe(true);
    expect(f.nodes.some(n=>n.id==='definition:def:mcp-client')).toBe(false);
    expect(f.nodes.some(n=>n.id==='occurrence:occ:ref-agent')).toBe(true);
  });
  it('configuration fold does not delete source records',()=>{
    const x=p('governance');const f=foldableProjection(x,new Set(['configuration:baseline:reference']));
    expect(f.hiddenCount).toBeGreaterThan(0);
    expect(x.nodes.some(n=>n.id==='federated-reference:ref:method')).toBe(true);
  });
  it('cross-connections do not generate fake children',()=>{
    const x=p('connectivity');const f=foldableProjection(x,new Set(['occurrence:occ:ref-client']));
    expect(f.nodes.length).toBe(x.nodes.length);
    expect(f.links.some(e=>e.type==='protocol-connection')).toBe(true);
  });
});
