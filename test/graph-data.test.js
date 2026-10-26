import { describe, it, expect } from 'vitest';
import concepts from '../data/concepts.json';
import { parseRelationsCsv, buildAtlasGraph } from '../src/map/graph-data.js';
import { readFileSync } from 'node:fs';
const csv = readFileSync(new URL('../data/relations.csv', import.meta.url), 'utf8');
describe('concept map data adapter', () => {
  it('parses relation records', () => expect(parseRelationsCsv(csv)).toHaveLength(3));
  it('produces compounds without altering concept identities', () => {
    const graph = buildAtlasGraph(concepts, parseRelationsCsv(csv));
    expect(graph.nodes.filter(n => n.data.kind === 'concept')).toHaveLength(5);
    expect(graph.nodes.filter(n => n.data.kind === 'view-group')).toHaveLength(3);
    expect(graph.nodes.find(n => n.data.id === 'AI-CON-002').data.parent).toBe('view-agents');
    expect(graph.edges).toHaveLength(3);
  });
  it('rejects dangling edges', () => expect(() => buildAtlasGraph(concepts, [{ id: 'bad', source: 'missing', target: 'AI-CON-002' }])).toThrow(/Unresolved/));
  it('rejects unsupported quoted CSV rather than misparsing it', () => expect(() => parseRelationsCsv('source_id,relation,target_id,status,notes\na,b,c,P,"hello,world"')).toThrow(/Quoted/));
});
