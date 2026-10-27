// Pure, non-lossy domain projections; Cytoscape is never a source of domain facts.
export function concreteView(model, compositionId) {
  const composition = model.compositions.find(x => x.id === compositionId);
  if (!composition) throw new Error(`Unknown composition: ${compositionId}`);
  const definitions = new Map(model.definitions.map(x => [x.id,x]));
  const occurrences = model.occurrences.filter(x => x.composition === compositionId).map(x => ({...x, definitionRecord: definitions.get(x.definition) || null}));
  const ids = new Set(occurrences.map(x => x.id));
  const connections = model.connections.filter(x => ids.has(x.from) && ids.has(x.to));
  const configurations = model.configurations.filter(x => x.composition === compositionId);
  const referenceIds = new Set(configurations.flatMap(x => x.federatedReferences || []));
  const references = model.federatedReferences.filter(x => referenceIds.has(x.id));
  return {composition, occurrences, connections, configurations, references};
}
export function concreteConsistency(model, compositionId) {
  const v = concreteView(model,compositionId);
  const ids = new Set(v.occurrences.map(x=>x.id));
  const issues=[];
  for(const o of v.occurrences) if(!o.definitionRecord) issues.push(`missing definition: ${o.id}`);
  for(const e of model.connections.filter(x=>ids.has(x.from)||ids.has(x.to))) if(!ids.has(e.from)||!ids.has(e.to)) issues.push(`cross-composition connection: ${e.id}`);
  for(const c of v.configurations) {
    const expected=v.occurrences.map(x=>x.versionSelection).sort();
    if(JSON.stringify(expected)!==JSON.stringify([...(c.nativeSelections||[])].sort())) issues.push(`selection mismatch: ${c.id}`);
  }
  return issues;
}
