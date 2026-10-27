import {describe,it,expect} from 'vitest';
import {createReifiedPartsRegistry} from '../src/e3/reified-parts.js';
import {projectReifiedPartUsages} from '../src/e3/part-projection.js';
const registry=createReifiedPartsRegistry();
function fixture(){return {hierarchy:'decomposition',nodes:[{id:'demo:ref-server-internal'},{id:'demo:ref-server-unit'},{id:'demo:ref-server-interface'}],links:[{from:'demo:ref-server-internal',to:'demo:ref-server-unit',type:'asserted-example-containment',evidence:{sourceId:'demo:ref-server-unit'}},{from:'demo:ref-server-internal',to:'demo:ref-server-interface',type:'asserted-example-containment',evidence:{sourceId:'demo:ref-server-interface'}}]};}
describe('reified semantic projection',()=>{
 it('links both server children to direct parts with their own identities',()=>{const x=projectReifiedPartUsages(fixture(),registry);expect(x.links.map(l=>l.partUsage).sort()).toEqual(['part-usage:ref-server-interface','part-usage:ref-server-unit']);expect(x.links.every(l=>l.semanticType==='direct-part-usage')).toBe(true);});
 it('does not create a transitive link',()=>{const x=projectReifiedPartUsages(fixture(),registry);expect(x.links).toHaveLength(2);expect(x.links.every(l=>l.from==='demo:ref-server-internal')).toBe(true);});
 it('rejects contradictory parenthood',()=>{const p=fixture();p.links[0].from='occ:ref-server';expect(()=>projectReifiedPartUsages(p,registry)).toThrow(/Contradictory/);});
 it('rejects missing immediate part link',()=>{const p=fixture();p.links.pop();expect(()=>projectReifiedPartUsages(p,registry)).toThrow(/Missing/);});
 it('does not synthesize parts for unrelated links',()=>{const p=fixture();p.nodes.push({id:'demo:other'});p.links.push({from:'demo:ref-server-internal',to:'demo:other',type:'asserted-example-containment'});const x=projectReifiedPartUsages(p,registry);const unrelated=x.links.find(l=>l.to==='demo:other');expect(unrelated).toBeDefined();expect(unrelated.partUsage).toBeUndefined();expect(unrelated.semanticType).toBeUndefined();});
});
