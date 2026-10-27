import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
const s=readFileSync(new URL('../src/e3/explorer.js',import.meta.url),'utf8');
describe('graph view meaning',()=>{
  it('explains typed graphs separately from assembly containment',()=>{
    expect(s).toContain('hierarchyGuides');
    expect(s).toContain('A subassembly part is not a direct part of its ancestor');
    expect(s).toContain('neither a part assembly nor a decomposition order');
    expect(s).toContain('Connections are not parts');
  });
  it('makes the active graph meaning visible with accessible status',()=>{
    expect(s).toContain('id="e34-view-explanation"');
    expect(s).toContain('function updateHierarchyGuide()');
    expect(s).toContain('updateHierarchyGuide();');
  });
});
