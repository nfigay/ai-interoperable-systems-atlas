import {describe,it,expect} from 'vitest';
import {createConfigurationItemRegistry} from '../src/e3/configuration-items.js';
import {createRealizationAdmissibility} from '../src/e3/realization-admissibility.js';
import {createDecisionTrace} from '../src/e3/decision-trace.js';
const build=()=>{const items=createConfigurationItemRegistry();const admissibility=createRealizationAdmissibility(undefined,items);return createDecisionTrace(admissibility,items);};
describe('traceability of authored configuration decisions',()=>{
  it('shows evidence, authority and evaluated applicability for the selected realization',()=>{
    const x=build().resolve('baseline:reference','occ:ref-client');
    const selected=x.candidates.find(c=>c.selected);
    expect(selected).toBeDefined();expect(selected.status).toBe('admissible-declared');
    expect(selected.checks.some(c=>c.kind==='baseline-allowlist'&&c.outcome==='satisfied'&&c.evidence&&c.authority)).toBe(true);
  });
  it('explains missing revision without pretending verified compatibility',()=>{
    const x=build().resolve('baseline:reference','occ:ref-client');
    const alternative=x.candidates.find(c=>!c.selected);
    expect(alternative.status).toBe('indeterminate');
    expect(alternative.checks.find(c=>c.kind==='revision-known')).toMatchObject({outcome:'unknown',actual:null});
    expect(alternative.verification).toBe('illustrative-unverified');
  });
  it('preserves incompatibility for disallowed baseline',()=>{
    const x=build().resolve('baseline:alternative','occ:ref-client');
    expect(x.candidates.every(c=>c.checks.some(t=>t.kind==='applicable-baselines'&&t.outcome==='violated'))).toBe(true);
  });
  it('does not create entries for nonexistent configurations',()=>expect(build().resolve('baseline:reference','occ:ref-server').candidates).toEqual([]));
  it('caches by context and invalidates only dependent decisions',()=>{
    const x=build();
    const first=x.resolve('baseline:reference','occ:ref-client');
    const second=x.resolve('baseline:reference','occ:ref-server');
    expect(x.resolve('baseline:reference','occ:ref-client')).toBe(first);
    expect(x.invalidate(['occurrence:occ:ref-client'])).toBe(1);
    expect(x.resolve('baseline:reference','occ:ref-server')).toBe(second);
    expect(x.resolve('baseline:reference','occ:ref-client')).not.toBe(first);
  });
  it('invalidates a realization-dependent decision without global enumeration',()=>{
    const x=build();x.resolve('baseline:reference','occ:ref-client');x.resolve('baseline:reference','occ:ref-server');
    expect(x.invalidate(['realization:realization-definition:reference-client-alternative'])).toBe(1);
    expect(x.cacheSize).toBe(1);
  });
});
