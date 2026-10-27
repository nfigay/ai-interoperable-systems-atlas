import {describe,it,expect} from 'vitest';
import concepts from '../data/concepts.json';
import compositions from '../data/e3/federated-compositions.json';
import {conceptExamples,exampleUrl} from '../src/e3/concept-bridges.js';

describe('editorial concept-to-occurrence navigation',()=>{
  it('links only existing concepts to existing occurrences',()=>{
    const conceptIds=new Set(concepts.map(c=>c.id));
    const occurrences=new Set(compositions.occurrences.map(o=>o.id));
    for(const [concept,targets] of Object.entries(conceptExamples)){
      expect(conceptIds.has(concept)).toBe(true);
      for(const target of targets)expect(occurrences.has(target)).toBe(true);
    }
  });
  it('produces deep links back to the model explorer',()=>{
    expect(exampleUrl('occ:ref-client')).toBe('#federated-configurations?occ=occ%3Aref-client');
  });
});
