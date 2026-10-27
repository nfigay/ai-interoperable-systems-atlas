import { describe,it,expect } from 'vitest';
import model from '../data/e3/federated-compositions.json';
import e3 from '../data/e3/configurations.json';
import {validateFederation,toCompoundElements} from '../src/e3/compound-model.js';
const copy=()=>structuredClone(model);
describe('E3.1 federation and compound semantics',()=>{
 it('validates source model against E3 selections',()=>expect(validateFederation(model,e3.catalog)).toEqual([]));
 it('distinguishes two occurrences of a shared definition',()=>{const instances=model.occurrences.filter(o=>o.definition==='def:agent');expect(instances).toHaveLength(2);expect(instances[0].id).not.toBe(instances[1].id);});
 it('projects visual containment without introducing semantic part-of edges',()=>{const els=toCompoundElements(model);expect(els.filter(e=>e.data.parent)).toHaveLength(model.occurrences.length);expect(els.filter(e=>e.data.source)).toHaveLength(model.connections.length);expect(els.some(e=>e.data.kind==='part-of')).toBe(false);});
 it('rejects dangling definitions',()=>{const m=copy();m.occurrences[0].definition='missing';expect(validateFederation(m)).toContain('unknown definition: occ:ref-agent');});
 it('rejects mismatched baseline and occurrence selections',()=>{const m=copy();m.configurations[0].nativeSelections.pop();expect(validateFederation(m)).toContain('selection/occurrence mismatch: baseline:reference');});
 it('rejects unqualified external references',()=>{const m=copy();delete m.federatedReferences[0].granularity;expect(validateFederation(m)).toContain('incomplete federated reference: ref:method');});
 it('retains semantic relation kind independently of visual containment',()=>{const els=toCompoundElements(model);expect(els.find(e=>e.data.id==='conn:ref-cs').data.kind).toBe('protocol-connection');});
});
