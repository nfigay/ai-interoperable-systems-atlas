import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const js=readFileSync(new URL('../src/e3/explorer.js',import.meta.url),'utf8');
describe('native collapse cue replaces unsuccessful HTML overlay',()=>{
 it('activates native extension cue',()=>expect(js).toContain('ec.enableCue()'));
 it('removes competing custom button and feedback',()=>{for(const text of ['ec.disableCue()', 'collapseCue', 'collapseFeedback', 'graph-cue.css'])expect(js).not.toContain(text)});
 it('keeps expand-collapse native actions',()=>{expect(js).toContain('ec.collapse(');expect(js).toContain('ec.expand(')});
});
