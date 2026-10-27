import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/e3/explorer.js', import.meta.url), 'utf8');
describe('graph element selection reveals properties', () => {
  it('opens the inspector and dispatches the selected graph element for both nodes and edges', () => {
    const start=source.indexOf("cy.on('tap','node,edge',event=>{");
    expect(start).toBeGreaterThanOrEqual(0);
    const handler=source.slice(start,source.indexOf('\n  });',start));
    expect(handler).toContain('openInspector();');
    expect(handler).toContain('showSelectedGraphElement(element);');
    expect(handler.indexOf('openInspector();')).toBeLessThan(handler.indexOf('showSelectedGraphElement(element);'));
  });
  it('uses openInspector to persist panel visibility and refresh its layout', () => {
    expect(source).toMatch(/function openInspector\(\)\{[^}]*inspectorState\.collapsed=false;[^}]*updateInspectorLayout\(\);/);
  });
});
