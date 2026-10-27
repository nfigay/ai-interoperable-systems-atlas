import {describe,it,expect} from 'vitest';
import {createConfigurationItemRegistry} from '../src/e3/configuration-items.js';
import {createReifiedPartsRegistry} from '../src/e3/reified-parts.js';
import {createInternalCompositionRegistry} from '../src/e3/internal-compositions.js';
import {createInternalSelectionResolver} from '../src/e3/internal-selections.js';
import model from '../data/e3/federated-compositions.json' with {type:'json'};
import dataset from '../data/e3/configuration-items.json' with {type:'json'};
const build=(data=dataset)=>{
  const internal=createInternalCompositionRegistry();
  const selections=createInternalSelectionResolver(undefined,internal,model);
  return createConfigurationItemRegistry(data,{parts:createReifiedPartsRegistry(),internal,selections,model});
};
describe('explicit configuration items and realizations',()=>{
  it('validates all authored references',()=>expect(build().errors).toEqual([]));
  it('resolves only the declared illustrative choice',()=>{
    const r=build();
    const selected=r.resolve('baseline:reference','occ:ref-client');
    expect(selected.status).toBe('selected-illustrative');
    expect(selected.realization.internalDefinition).toBe('internal-definition:ref-client-internal');
    expect(r.resolve('baseline:reference','occ:ref-server').status).toBe('absent');
  });
  it('does not create configuration items from direct part definitions',()=>{
    const r=build();expect(r.items.size).toBe(1);
    expect(r.forOccurrence('occ:ref-server')).toEqual([]);
  });
  it('rejects a choice pointing to another configuration item',()=>{
    const d=structuredClone(dataset);
    d.configurationChoices[0].configurationItem='configuration-item:unknown';
    const r=build(d);expect(r.errors.some(x=>x.includes('incompatible item'))).toBe(true);
    expect(r.resolve('baseline:reference','occ:ref-client').status).toBe('incompatible');
  });
  it('rejects a contradictory internal selection without guessing another',()=>{
    const d=structuredClone(dataset);
    d.configurationChoices[0].internalSelection='internal-selection:nonexistent';
    const r=build(d);expect(r.errors.some(x=>x.includes('source internal selection'))).toBe(true);
    expect(r.resolve('baseline:reference','occ:ref-client').status).toBe('incompatible');
  });
});
