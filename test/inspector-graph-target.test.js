import {describe,it,expect} from 'vitest';
import {classifyGraphSelection} from '../src/e3/inspector-graph-target.js';
const registry={maps:{occurrences:new Map([['occ:ref-client',{}]]),connections:new Map([['conn:1',{}]]),compositions:new Map([['comp:reference',{}]]),federatedReferences:new Map()}};
describe('selection must not leave stale property sheets',()=>{
 it('resolves a native occurrence even when inside a compound',()=>expect(classifyGraphSelection({id:'occ:ref-client',kind:'occurrence'},registry)).toEqual({kind:'occurrence',id:'occ:ref-client'}));
 it('resolves an illustrative container independently from the native registry',()=>expect(classifyGraphSelection({id:'demo:ref-client-internal',kind:'illustrative-group',parent:'occ:ref-client'},registry)).toEqual({kind:'illustrative',id:'demo:ref-client-internal'}));
 it('resolves original connections and compositions',()=>{expect(classifyGraphSelection({id:'conn:1'},registry).kind).toBe('connection');expect(classifyGraphSelection({id:'comp:reference'},registry).kind).toBe('composition')});
 it('uses graph resourceId when the rendered id is a different projection identity',()=>expect(classifyGraphSelection({id:'view:occ:ref-client',resourceId:'occ:ref-client'},registry).id).toBe('occ:ref-client'));
 it('retains an explicit fallback for unregistered graph elements',()=>expect(classifyGraphSelection({id:'unregistered:1'},registry).kind).toBe('resource'));
});
