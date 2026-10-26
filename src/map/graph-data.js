// Pure adapter: group membership is a view choice, never an ontology assertion.
export const VIEW_GROUPS = [
  { id: 'view-models', label: 'Models & inference' },
  { id: 'view-agents', label: 'Intelligent systems' },
  { id: 'view-integration', label: 'Process & interoperability' }
];

export const GROUP_FOR_ID = {
  'AI-CON-001': 'view-models',
  'AI-CON-005': 'view-models',
  'AI-CON-002': 'view-agents',
  'AI-CON-003': 'view-integration',
  'AI-CON-004': 'view-integration'
};

// CSV input is restricted to simple, unquoted cells in this first iteration.
// Reject unsupported CSV syntax rather than silently corrupt relations.
export function parseRelationsCsv(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.shift()?.trim() !== 'source_id,relation,target_id,status,notes') {
    throw new Error('Unexpected relation CSV header');
  }
  return lines.filter(line => line.trim()).map((line, i) => {
    if (line.includes('"')) throw new Error(`Quoted CSV unsupported at line ${i + 2}`);
    const fields = line.split(',');
    if (fields.length !== 5) throw new Error(`Invalid CSV row at line ${i + 2}`);
    const [source, type, target, status, notes] = fields.map(s => s.trim());
    if (!source || !target || !type || !status) throw new Error(`Incomplete relation at line ${i + 2}`);
    return { id: `rel-${i + 1}`, source, target, type, status, notes };
  });
}

export function buildAtlasGraph(concepts, relations, groupForId = GROUP_FOR_ID) {
  const ids = new Set();
  const nodes = concepts.map(concept => {
    if (!concept.id || ids.has(concept.id)) throw new Error(`Invalid/duplicate concept ID: ${concept.id}`);
    ids.add(concept.id);
    const parent = groupForId[concept.id];
    if (parent && !VIEW_GROUPS.some(g => g.id === parent)) throw new Error(`Unknown group ${parent}`);
    return { data: { ...concept, ...(parent ? { parent } : {}), kind: 'concept' } };
  });
  const edges = relations.map(relation => {
    if (!ids.has(relation.source) || !ids.has(relation.target)) {
      throw new Error(`Unresolved relation endpoint: ${relation.source} -> ${relation.target}`);
    }
    return { data: { ...relation, label: relation.type.replaceAll('_', ' ') } };
  });
  const parents = VIEW_GROUPS.filter(group => nodes.some(node => node.data.parent === group.id))
    .map(group => ({ data: { ...group, kind: 'view-group' } }));
  return { nodes: [...parents, ...nodes], edges };
}
