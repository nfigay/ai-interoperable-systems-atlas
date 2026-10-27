import {describe,it,expect} from 'vitest';
import {createTraceNavigation} from '../src/e3/trace-navigation.js';
const item={id:'ci',scopeOccurrence:'occ',evidence:'source-a'};
const real={id:'r',configurationItem:'ci',assemblyDefinition:'a',evidence:'source-b'};
const choice={id:'choice',configurationItem:'ci',realizationDefinition:'r',occurrence:'occ',baseline:'b'};
const part={id:'part',assemblyDefinition:'a'};
const usage={id:'use',partDefinition:'part',assemblyDefinition:'a',graphNode:'node',assertionSource:'source-c'};
const config={items:new Map([['ci',item]]),realizations:new Map([['r',real]]),choices:new Map([['choice',choice]])};
const parts={parts:new Map([['part',part]]),usages:new Map([['use',usage]]),assemblies:new Map([['a',{id:'a'}]])};
const decisionTrace={resolve:()=>({candidates:[{checks:[{id:'check1',evidence:'source-b'}]}]})};
const nav=createTraceNavigation({configurationItems:config,parts,decisionTrace});
describe('identity-driven configuration navigation',()=>{
 it('resolves configuration item and its realizations and choices',()=>expect(nav.resolve('item','ci').references.map(x=>x.id)).toEqual(expect.arrayContaining(['occ','r','choice','source-a'])));
 it('navigates from realization back to configuration item and assembly',()=>expect(nav.resolve('realization','r').references.map(x=>x.id)).toEqual(expect.arrayContaining(['ci','a','choice'])));
 it('maintains direct assembly/part usage without transitive promotion',()=>{
   expect(nav.resolve('assembly','a').references).toEqual([{kind:'usage',id:'use'}]);
   expect(nav.resolve('usage','use').references.map(x=>x.id)).toEqual(['part','a','node','source-c']);
 });
 it('resolves declared evidence and inverse references without claiming verification',()=>{
   const evidence=nav.resolve('evidence','source-b','b','occ');
   expect(evidence.record.verification).toBe('not-established');
   expect(evidence.references).toEqual(expect.arrayContaining([{kind:'realization',id:'r'},{kind:'check',id:'check1'}]));
 });
 it('does not synthesize unknown semantic entities',()=>expect(nav.resolve('part','missing')).toBeNull());
});
