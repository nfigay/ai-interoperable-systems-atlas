import {describe,it,expect} from 'vitest';
import model from '../data/e3/federated-compositions.json';
import internalCatalog from '../data/e3/internal-compositions.json';
import selectionCatalog from '../data/e3/internal-selections.json';
import {createInternalCompositionRegistry} from '../src/e3/internal-compositions.js';
import {createInternalSelectionResolver} from '../src/e3/internal-selections.js';
const internals=createInternalCompositionRegistry(internalCatalog);
const build=dataset=>createInternalSelectionResolver(dataset,internals,model);
describe('explicit internal composition selection per federated baseline',()=>{
  it('resolves an explicit illustrative selection without claiming native verification',()=>{
    const resolver=build(selectionCatalog);
    expect(resolver.issues).toEqual([]);
    const found=resolver.resolve('baseline:reference','occ:ref-client');
    expect(found.status).toBe('selected-illustrative');
    expect(found.definition.parentOccurrence).toBe('occ:ref-client');
    expect(found.selection.revision).toBeNull();
  });
  it('does not infer selection from the availability of an internal definition',()=>{
    const found=build(selectionCatalog).resolve('baseline:reference','occ:ref-server');
    expect(found.status).toBe('absent');
  });
  it('reports ambiguity instead of arbitrarily choosing a competing selection',()=>{
    const candidate=selectionCatalog.selections[0];
    const result=build({selections:[candidate,{...candidate,id:'internal-selection:duplicate'}]})
      .resolve('baseline:reference','occ:ref-client');
    expect(result.status).toBe('ambiguous');
    expect(result.candidates).toHaveLength(2);
  });
  it('rejects missing definition and cross-composition selection',()=>{
    const candidate=selectionCatalog.selections[0];
    expect(build({selections:[{...candidate,internalDefinition:'missing'}]})
      .resolve(candidate.baseline,candidate.occurrence).status).toBe('incompatible');
    expect(build(selectionCatalog).resolve('baseline:alternative','occ:ref-client').status).toBe('incompatible');
  });
  it('detects inconsistent revision, authority and evidence',()=>{
    const candidate=selectionCatalog.selections[0];
    for(const patch of [{revision:'unverified-r2'},{authority:'other'},{evidence:'not-declared'}]){
      expect(build({selections:[{...candidate,...patch}]})
        .resolve(candidate.baseline,candidate.occurrence).status).toBe('incompatible');
    }
  });
});
