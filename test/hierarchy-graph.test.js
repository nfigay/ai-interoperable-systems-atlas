import {describe,it,expect} from 'vitest';
import {hierarchyGraphElements} from '../src/landscape/hierarchy-graph.js';
const sample={hierarchy:'realization',nodes:[
{id:'composition:c',resourceId:'c',label:'C',kind:'composition',depth:0},
{id:'occurrence:o',resourceId:'o',label:'O',kind:'occurrence',depth:1},
{id:'definition:d',resourceId:'d',label:'D',kind:'definition',depth:2}],links:[
{from:'composition:c',to:'occurrence:o',type:'uses-occurrence',evidence:{field:'occurrence.composition',sourceId:'o'}},
{from:'occurrence:o',to:'definition:d',type:'references-definition',evidence:{field:'occurrence.definition',sourceId:'o'}}]};
describe('graph projection of navigation hierarchies',()=>{
 it('keeps stable source identities and evidence',()=>{
   const g=hierarchyGraphElements(sample);
   expect(g.nodes.map(x=>x.data.resourceId)).toEqual(['c','o','d']);
   expect(g.edges[1].data.field).toBe('occurrence.definition');
 });
 it('folds a single branch without changing input',()=>{
   const before=JSON.stringify(sample);
   const g=hierarchyGraphElements(sample,new Set(['occurrence:o']));
   expect(g.nodes.map(x=>x.data.id)).toEqual(['composition:c','occurrence:o']);
   expect(g.edges).toHaveLength(1);
   expect(JSON.stringify(sample)).toBe(before);
 });
 it('marks eligible graph nodes',()=>{
   const g=hierarchyGraphElements(sample);
   expect(g.nodes[1].data.foldable).toBe(true);
   expect(g.nodes[2].data.foldable).toBe(false);
 });
});
