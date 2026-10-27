import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const source=readFileSync(new URL('../src/e3/explorer.js',import.meta.url),'utf8');
describe('native expand/collapse control only',()=>{
  it('enables the extension native cue',()=>expect(source).toContain('ec.enableCue()'));
  it('has no independently positioned HTML cue',()=>{
    for(const fragment of ['atlas-persistent-collapse-cue','collapseCue','collapseFeedback','positionCollapseCue','updateCollapseCue','graph-cue.css','ec.disableCue()'])expect(source).not.toContain(fragment);
  });
  it('keeps native expand/collapse controller',()=>{
    expect(source).toContain('cy.expandCollapse(');
    expect(source).toContain('createExplorationController(');
  });
});
