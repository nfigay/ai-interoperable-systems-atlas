import {describe,it,expect} from 'vitest';
import {createInternalCompositionRegistry,validateInternalCompositionRegistry} from '../src/e3/internal-compositions.js';
import model from '../data/e3/federated-compositions.json';
import decomposition from '../data/e3/illustrative-decomposition.json';

describe('governed internal composition mappings',()=>{
  const registry=createInternalCompositionRegistry();
  it('is referentially consistent with explicit authored containment',()=>{
    expect(registry.definitions).toHaveLength(8);
    expect(validateInternalCompositionRegistry(registry,model,decomposition)).toEqual([]);
  });
  it('links parent occurrences to their internal composition and elements',()=>{
    const [def]=registry.byOccurrence('occ:ref-client');
    expect(def.rootNode).toBe('demo:ref-client-internal');
    expect(registry.getNode('demo:ref-client-interface').role).toBe('interface');
    expect(registry.getNode('demo:ref-client-unit').role).toBe('internal-placeholder');
  });
  it('never asserts native versions, internal connections, or verified interfaces',()=>{
    for(const def of registry.definitions){
      expect(def.verification).toBe('illustrative-unverified');
      expect(def.revision).toBeNull();
      expect(def.configurationSelection).toBeNull();
      expect(def.internalConnections).toEqual([]);
    }
  });
  it('rejects a fabricated containment and preserves unique graph identities',()=>{
    const bad=createInternalCompositionRegistry({definitions:[{...registry.definitions[0],interfaces:['demo:missing']}]});
    expect(validateInternalCompositionRegistry(bad,model,decomposition)).not.toEqual([]);
    expect(()=>createInternalCompositionRegistry({definitions:[registry.definitions[0],registry.definitions[0]]})).toThrow(/Duplicate/);
  });
});
