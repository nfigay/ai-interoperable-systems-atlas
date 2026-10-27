import {describe,it,expect} from 'vitest';
import {atlasVoyageRoute,atlasVoyageSteps} from '../src/voyages/voyage-page.js';
import {readFileSync} from 'node:fs';
describe('voyage MCP accessible depuis Atlas',()=>{
 it('possède une route de premier niveau',()=>expect(atlasVoyageRoute).toBe('voyage-agent-mcp'));
 it('conserve les six étapes du voyage E4',()=>expect(atlasVoyageSteps).toHaveLength(6));
 it('monte le voyage via la navigation principale',()=>expect(readFileSync('src/main.js','utf8')).toContain('mountVoyagePage'));
});
