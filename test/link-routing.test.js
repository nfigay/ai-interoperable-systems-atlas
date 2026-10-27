import {describe,it,expect} from 'vitest';
import {resolveAtlasLink} from '../src/link-routing.js';
const ids = new Set(['index','references','glossary','journeys/01-landscape']);
describe('Atlas reader destinations',()=>{
 it('returns home and reference page without leaving Atlas',()=>{
  expect(resolveAtlasLink('#index',ids)).toEqual({kind:'internal',href:'#index'});
  expect(resolveAtlasLink('docs/references.md',ids)).toEqual({kind:'internal',href:'#references'});
 });
 it('resolves relative Markdown document links',()=>expect(resolveAtlasLink('../references.md',ids,'journeys/01-landscape').href).toBe('#references'));
 it('opens external source apart from Atlas',()=>expect(resolveAtlasLink('https://www.omg.org/spec/BPMN/2.0.2',ids).kind).toBe('external'));
 it('does not silently route missing sources to the home page',()=>expect(resolveAtlasLink('missing.md',ids).kind).toBe('unresolved'));
 it('blocks executable URL schemes',()=>expect(resolveAtlasLink('javascript:alert(1)',ids).kind).toBe('blocked'));
});
