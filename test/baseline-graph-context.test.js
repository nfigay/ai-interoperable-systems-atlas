import {describe,it,expect} from 'vitest';
import model from '../data/e3/federated-compositions.json';
import {createInternalCompositionRegistry} from '../src/e3/internal-compositions.js';
import {createInternalSelectionResolver} from '../src/e3/internal-selections.js';
import {contextualInternalStates} from '../src/e3/baseline-graph-context.js';
const registry=createInternalCompositionRegistry();
const resolver=createInternalSelectionResolver(undefined,registry,model);
describe('Baseline dependent compound annotations',()=>{
 it('marks explicitly selected reference client without claiming verification',()=>{
  const x=contextualInternalStates(model,registry,resolver,'baseline:reference','comp:reference');
  expect(x.nodes.get('occ:ref-client')).toBe('selected');
  expect(x.nodes.get(registry.byOccurrence('occ:ref-client')[0].rootNode)).toBe('selected');
  expect(x.counts['selected-illustrative']).toBe(1);
 });
 it('marks unselected server as absent rather than silently selected',()=>{
  const x=contextualInternalStates(model,registry,resolver,'baseline:reference','comp:reference');
  expect(x.nodes.get('occ:ref-server')).toBe('absent');
  expect(x.nodes.get(registry.byOccurrence('occ:ref-server')[0].rootNode)).toBe('absent');
 });
 it('preserves native identifiers across context changes and does not invent selection',()=>{
  const a=contextualInternalStates(model,registry,resolver,'baseline:reference','comp:reference');
  const b=contextualInternalStates(model,registry,resolver,'baseline:alternative','comp:alternative');
  expect(a.nodes.has('occ:ref-client')).toBe(true);
  expect(b.nodes.has('occ:ref-client')).toBe(false);
  expect(b.counts['selected-illustrative']).toBe(0);
 });
 it('does not annotate anything without active baseline',()=>{
  expect(contextualInternalStates(model,registry,resolver,null,'comp:reference').nodes.size).toBe(0);
 });
});
