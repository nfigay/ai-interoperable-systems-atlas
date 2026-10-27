import {describe,it,expect} from 'vitest';
import {createLandscape} from '../src/landscape/landscape.js';
import concepts from '../data/concepts.json';
import model from '../data/e3/federated-compositions.json';
import configs from '../data/e3/configurations.json';
import views from '../data/landscape/views.json';
import {parseRelationsCsv} from '../src/map/graph-data.js';
import {readFileSync} from 'node:fs';
const relations=parseRelationsCsv(readFileSync(new URL('../data/relations.csv',import.meta.url),'utf8'));
const landscape=createLandscape({concepts,relations,model,catalog:configs.catalog,views});
describe('integrated landscape and explicit extracts',()=>{
  it('contains original stable identities once',()=>{expect(landscape.entities.has('AI-CON-004')).toBe(true);expect(landscape.entities.has('occ:ref-client')).toBe(true);});
  it('extracts concept view with only induced relations',()=>{const v=landscape.extract('view:concept-landscape');expect(v.has('AI-CON-004')).toBe(true);expect(v.byKind['concept-relation'].length).toBe(relations.length);});
  it('separates configuration alternatives without duplicating concepts',()=>{const a=landscape.extract('view:agent-mcp-reference');const b=landscape.extract('view:agent-mcp-alternative');expect(a.has('baseline:reference')).toBe(true);expect(a.has('baseline:alternative')).toBe(false);expect(b.has('baseline:alternative')).toBe(true);expect(a.byKind.occurrence).toHaveLength(4);expect(b.byKind.occurrence).toHaveLength(4);});
  it('keeps explicit definitions, authority and references',()=>{const v=landscape.extract('view:agent-mcp-reference');expect(v.has('def:mcp-client')).toBe(true);expect(v.has('demo-registry')).toBe(true);expect(v.has('ref:method')).toBe(true);});
  it('does not mistake graphic containment for semantic part-of',()=>{const v=landscape.extract('view:agent-mcp-reference');expect(v.view.projection).toBe('composition-containers');expect(v.byKind.connection.every(c=>c.kind!=='part-of')).toBe(true);});
  it('rejects unknown views and duplicate identities',()=>{expect(()=>landscape.extract('missing')).toThrow();expect(()=>createLandscape({concepts:[...concepts,concepts[0]],relations,model,views})).toThrow();});
});
