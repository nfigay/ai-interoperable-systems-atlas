import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/e3/explorer.js', import.meta.url), 'utf8');
describe('single Cytoscape explorer wiring', () => {
  it('creates only one Cytoscape instance for both perspectives', () => {
    expect((source.match(/=cytoscape\(/g)||[])).toHaveLength(1);
    expect(source).not.toContain('hierarchyCy=cytoscape');
  });
  it('switches projections on the existing engine', () => {
    expect(source).toContain('cy.add(elements)');
    expect(source).toContain("replaceProjection([...graph.nodes,...graph.edges],'hierarchy')");
    expect(source).toContain("replaceProjection(nativeGraphElements,'graph')");
  });
  it('keeps one graph container and resolves native occurrence identity through the inspector dispatcher', () => {
    expect(source).not.toContain('id="e34-graph"');
    expect(source).toContain('classifyGraphSelection(data,registry)');
    expect(source).toMatch(/if\(resolved\.kind==='occurrence'\)\{showOccurrence\(resolved\.id\);return;\}/);
    expect(source).toContain("if(typeof ur.reset==='function')ur.reset()");
  });
});
