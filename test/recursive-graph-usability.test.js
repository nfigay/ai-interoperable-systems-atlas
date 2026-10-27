import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const source=readFileSync(new URL('../src/e3/explorer.js',import.meta.url),'utf8');
describe('recursive graph usability',()=>{
 it('keeps horizontal high-contrast relationship labels',()=>{expect(source).toContain("'text-rotation':'none'");expect(source).toContain("'text-background-opacity':0.96")});
 it('uses the extension cue only',()=>{expect(source).toContain('ec.enableCue()');expect(source).not.toContain('collapseCue')});
 it('keeps native expand-collapse actions via explorer',()=>{expect(source).toContain('cy.expandCollapse(');expect(source).toContain('createExplorationController(')});
 it('preserves selection and inspector actions',()=>{expect(source).toContain("cy.on('tap','node,edge'");expect(source).toContain('openInspector()')});
});
