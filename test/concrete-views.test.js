import {describe,it,expect} from 'vitest';
import model from '../data/e3/federated-compositions.json';
import {concreteView,concreteConsistency} from '../src/e3/concrete-views.js';
import {toCompoundElements} from '../src/e3/compound-model.js';
describe('Concrete model view independent of graphics',()=>{
  for (const c of model.compositions) it(`preserves source facts for ${c.id}`,()=>{
    const view=concreteView(model,c.id);
    expect(concreteConsistency(model,c.id)).toEqual([]);
    expect(view.occurrences).toHaveLength(4);
    expect(view.connections).toHaveLength(3);
    expect(view.configurations).toHaveLength(1);
    expect(view.occurrences.map(x=>x.id).sort()).toEqual(model.occurrences.filter(x=>x.composition===c.id).map(x=>x.id).sort());
    expect(view.connections.map(x=>x.id).sort()).toEqual(model.connections.filter(x=>x.from.startsWith(c.id==='comp:reference'?'occ:ref-':'occ:alt-')).map(x=>x.id).sort());
    expect(view.occurrences.every(x=>x.definitionRecord?.id===x.definition)).toBe(true);
  });
  it('visual parentage does not become a semantic part-of relation',()=>{
    const elems=toCompoundElements(model);
    const v=concreteView(model,'comp:reference');
    expect(elems.find(x=>x.data.id==='occ:ref-client').data.parent).toBe('comp:reference');
    expect(v.connections.map(x=>x.kind)).not.toContain('part-of');
  });
  it('rejects unknown composition',()=>expect(()=>concreteView(model,'unknown')).toThrow());
});
