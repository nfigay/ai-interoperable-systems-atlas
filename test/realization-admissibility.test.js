import {describe,it,expect} from 'vitest';
import data from '../data/e3/realization-admissibility.json' with {type:'json'};
import {createRealizationAdmissibility} from '../src/e3/realization-admissibility.js';
import {createConfigurationItemRegistry} from '../src/e3/configuration-items.js';
const build=(dataset=data)=>createRealizationAdmissibility(dataset,createConfigurationItemRegistry());
describe('contextual admissibility without implicit configuration explosion',()=>{
  it('validates authored candidate references',()=>expect(build().errors).toEqual([]));
  it('distinguishes selected candidate from another merely available candidate',()=>{
    const x=build().resolve('baseline:reference','occ:ref-client');
    expect(x.candidates).toHaveLength(2);
    expect(x.candidates.filter(c=>c.selected)).toHaveLength(1);
    expect(x.candidates.find(c=>c.selected).status).toBe('admissible-declared');
  });
  it('reports insufficient revision evidence without guessing',()=>{
    const x=build().resolve('baseline:reference','occ:ref-client');
    expect(x.candidates.find(c=>!c.selected).status).toBe('indeterminate');
  });
  it('does not invent candidates for an occurrence without an item',()=>expect(build().resolve('baseline:reference','occ:ref-server').candidates).toEqual([]));
  it('rejects a baseline outside the expressed applicability',()=>{
    const x=build().resolve('baseline:alternative','occ:ref-client');
    expect(x.candidates.every(c=>c.status==='incompatible')).toBe(true);
  });
  it('detects a contradictory realization reference',()=>{
    const d=structuredClone(data);d.candidates[0].realizationDefinition='missing';
    expect(build(d).errors.some(x=>x.includes('Invalid realization'))).toBe(true);
  });
});
