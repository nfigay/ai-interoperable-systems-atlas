// Pure adapter: group membership is a view choice, never an ontology assertion.
// Pure adapter: group membership is a view choice, never an ontology assertion.
export const VIEW_GROUPS = [
  { id: 'view-models', label: 'Models & inference' },
  { id: 'view-agents', label: 'Agents & orchestration' },
  { id: 'view-integration', label: 'Protocols & distribution' },
  { id: 'view-knowledge', label: 'Knowledge & semantics' },
  { id: 'view-governance', label: 'Governance & evidence' },
  { id: 'view-engineering', label: 'Engineering & configuration' }
];

// Visual placement only. Never infer ontology subclassing from a group's name.
export const GROUP_FOR_ID = {
  'AI-CON-001': 'view-models',
  'AI-CON-002': 'view-agents',
  'AI-CON-003': 'view-agents',
  'AI-CON-004': 'view-integration',
  'AI-CON-005': 'view-models',
  'AI-CON-006': 'view-models',
  'AI-CON-007': 'view-models',
  'AI-CON-008': 'view-knowledge',
  'AI-CON-009': 'view-knowledge',
  'AI-CON-010': 'view-knowledge',
  'AI-CON-011': 'view-knowledge',
  'AI-CON-012': 'view-knowledge',
  'AI-CON-013': 'view-governance',
  'AI-CON-014': 'view-governance',
  'AI-CON-015': 'view-governance',
  'AI-CON-016': 'view-agents',
  'AI-CON-017': 'view-integration',
  'AI-CON-018': 'view-integration',
  'AI-CON-019': 'view-integration',
  'AI-CON-020': 'view-integration',
  'AI-CON-021': 'view-engineering',
  'AI-CON-022': 'view-engineering',
  'AI-CON-023': 'view-models',
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
