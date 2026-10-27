import {describe,it,expect} from 'vitest';
import voyage from '../data/voyages/agent-mcp-first.json';
import model from '../data/e3/federated-compositions.json';
import {validateGuidedVoyage} from '../src/e3/guided-voyage.js';
import {executeFixture} from '../scripts/voyage-mcp-fixture.mjs';

describe('first vertical Atlas voyage',()=>{
 it('links all six stages to declared Atlas entities',()=>{expect(validateGuidedVoyage()).toEqual([]);expect(voyage.steps).toHaveLength(6);});
 it('does not confuse direct assembly and connectivity',()=>{expect(voyage.steps.find(x=>x.id==='assembly').hierarchy).toBe('decomposition');expect(voyage.steps.find(x=>x.id==='interactions').targets.every(id=>model.connections.some(c=>c.id===id))).toBe(true);});
 it('requires the baseline to belong to the selected composition',()=>{expect(validateGuidedVoyage({...voyage,baseline:'baseline:alternative'})).toContain('Unlinked baseline: baseline:alternative');});
 it('rejects unknown targets rather than displaying invented objects',()=>{const invalid=structuredClone(voyage);invalid.steps[0].targets=['occ:missing'];expect(validateGuidedVoyage(invalid)).toContain('Cible inconnue : occ:missing');});
 it('produces deterministic scripted JSON-RPC observations without conformance claims',()=>{const out=executeFixture();expect(out.transport).toBe('none');expect(out.conformance).toBe('not-assessed');expect(out.messages.filter(x=>x.actor==='client').map(x=>x.message.method)).toEqual(['initialize','tools/list','tools/call']);expect(out.observation.text).toBe('Bonjour Atlas');});
});
