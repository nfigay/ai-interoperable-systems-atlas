import {describe,it,expect} from 'vitest';
import {semanticContainmentToCompound,hierarchyGraphElements} from '../src/landscape/hierarchy-graph.js';
const n=(id,depth)=>({id,resourceId:id,label:id,kind:'illustrative-group',depth});
const l=(from,to,type='asserted-example-containment')=>({from,to,type,evidence:{field:'illustrative-decomposition.nodes.parent',sourceId:to,status:'illustrative'}});
const projection={hierarchy:'decomposition',nodes:[n('root',0),n('a',1),n('b',2),n('c',3),n('d',4),n('other',1)],links:[l('root','a'),l('a','b'),l('b','c'),l('c','d'),l('root','other')]};
describe('semantic compound containment',()=>{
 it('represents five explicit levels with actual Cytoscape parents',()=>{
   const result=hierarchyGraphElements(projection);
   expect(result.compound).toBe(true);
   expect(result.edges).toHaveLength(0);
   expect(result.nodes.find(x=>x.data.id==='d').data.parent).toBe('c');
   expect(result.nodes.find(x=>x.data.id==='a').data.containmentEvidence.sourceId).toBe('a');
   expect(result.nodes.find(x=>x.data.id==='other').data.parent).toBe('root');
 });
 it('preserves all nodes even when a UI folded set is supplied',()=>{
   const result=hierarchyGraphElements(projection,new Set(['a']));
   expect(result.nodes).toHaveLength(6);
 });
 it('rejects multiple parents and cycles',()=>{
   expect(()=>semanticContainmentToCompound({...projection,links:[...projection.links,l('other','b')]})).toThrow(/multiple/);
   expect(()=>semanticContainmentToCompound({...projection,links:[...projection.links,l('d','root')]})).toThrow(/cycle/i);
 });
 it('does not convert unrelated links into parents',()=>{
   const p={...projection,links:[...projection.links,l('d','other','uses')]};
   const g=semanticContainmentToCompound(p);
   expect(g.edges).toHaveLength(1);
   expect(g.nodes.find(x=>x.data.id==='other').data.parent).toBe('root');
 });
 it('refuses to claim containment for provenance paths',()=>{
   expect(()=>semanticContainmentToCompound({...projection,hierarchy:'realization'})).toThrow(/No asserted containment/);
 });
});
