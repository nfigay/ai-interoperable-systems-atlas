import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/e3/explorer.js',import.meta.url),'utf8');
describe('typed graph UI consistency',()=>{
  it('opens the typed perspective rather than silently redrawing direct composition',()=>{
    expect(source).toMatch(/hierarchyId=e\.target\.value;[\s\S]*?if\(modelView==='graph'\)modelView='hierarchy';[\s\S]*?changeHierarchy\(\);/);
  });
  it('reports visible versus declared nodes and relations, including hidden ones',()=>{
    expect(source).toContain('id="e34-graph-coverage"');
    expect(source).toContain('semanticProjection.nodes.length-graph.nodes.length');
    expect(source).toContain('graph.edges.length');
    expect(source).toContain('Expand all');
  });
  it('differentiates direct composition from typed graph in view title',()=>{
    expect(source).toContain("hierarchyId==='decomposition'?'Recursive composition and connections':'Typed graph: '");
    expect(source).toContain('DIRECT COMPOSITION — Native assembly and connections.');
  });
});
