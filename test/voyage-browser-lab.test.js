import {describe,it,expect} from 'vitest';
import {makeBrowserScenario} from '../src/e3/voyage-browser-lab.js';
import {executeFixture} from '../scripts/voyage-mcp-fixture.mjs';

describe('E4 browser lab, deployable as static Vite app',()=>{
  it('matches six messages of existing scripted voyage fixture by default',()=>{
    const browser=makeBrowserScenario(), cli=executeFixture();
    expect(browser.messages).toEqual(cli.messages);
    expect(browser.observation).toEqual(cli.observation);
  });
  it('changes echo argument and observed response only in local script',()=>{
    const scenario=makeBrowserScenario('Bonjour depuis GitHub Pages');
    expect(scenario.messages[4].message.params.arguments.text).toBe('Bonjour depuis GitHub Pages');
    expect(scenario.messages[5].message.result.content[0].text).toBe('Bonjour depuis GitHub Pages');
  });
  it('never claims MCP transport or conformity',()=>{
    const s=makeBrowserScenario();expect(s.transport).toBe('none');expect(s.conformance).toBe('not-assessed');
    expect(s.kind).toContain('scripted-fixture');
  });
  it('does not change original command line scenario',()=>{
    expect(executeFixture().observation.text).toBe('Bonjour Atlas');
  });
});
