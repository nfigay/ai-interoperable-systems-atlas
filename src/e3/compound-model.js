// E3.1: domain model independent from Cytoscape and RDF.
export function validateFederation(model, catalog = []) {
  const errors = [];
  const groups = ['authorities','definitions','compositions','occurrences','connections','federatedReferences','configurations'];
  const ids = new Set();
  for (const group of groups) {
    if (!Array.isArray(model[group])) { errors.push(`missing array: ${group}`); continue; }
    for (const entity of model[group]) {
      if (!entity.id || ids.has(entity.id)) errors.push(`duplicate or missing identifier: ${entity.id}`);
      ids.add(entity.id);
    }
  }
  const map = (group) => new Map((model[group] || []).map(x => [x.id,x]));
  const authority = map('authorities'), definitions = map('definitions'), comps = map('compositions');
  const occurrences = map('occurrences'), references = map('federatedReferences');
  const catalogIds = new Set(catalog.map(x => x.id));
  for (const d of definitions.values()) if (!authority.has(d.authority)) errors.push(`unknown authority: ${d.id}`);
  for (const o of occurrences.values()) {
    if (!definitions.has(o.definition)) errors.push(`unknown definition: ${o.id}`);
    if (!comps.has(o.composition)) errors.push(`unknown composition: ${o.id}`);
    if (!o.role) errors.push(`missing occurrence role: ${o.id}`);
    if (catalog.length && !catalogIds.has(o.versionSelection)) errors.push(`unknown catalog selection: ${o.id}`);
  }
  for (const c of model.connections || []) {
    if (!occurrences.has(c.from) || !occurrences.has(c.to)) errors.push(`dangling connection: ${c.id}`);
    if (!c.kind || !c.semanticSource) errors.push(`untyped connection: ${c.id}`);
  }
  for (const r of references.values()) {
    if (!authority.has(r.authority) || !r.nativeLocator || !r.granularity || !r.selection || typeof r.pinned !== 'boolean') errors.push(`incomplete federated reference: ${r.id}`);
  }
  for (const c of model.configurations || []) {
    if (!comps.has(c.composition)) errors.push(`unknown composition in baseline: ${c.id}`);
    if (!Array.isArray(c.nativeSelections)) errors.push(`missing native selections: ${c.id}`);
    for (const id of c.federatedReferences || []) if (!references.has(id)) errors.push(`unknown federated reference: ${c.id} / ${id}`);
    const versions = [...occurrences.values()].filter(o => o.composition === c.composition).map(o => o.versionSelection).sort();
    if (JSON.stringify(versions) !== JSON.stringify([...(c.nativeSelections || [])].sort())) errors.push(`selection/occurrence mismatch: ${c.id}`);
  }
  return errors;
}
export function toCompoundElements(model) {
  const elements = [];
  for (const c of model.compositions) elements.push({ data: { id: c.id, label: c.name, kind: 'composition' }, classes: 'e31-container' });
  const defs = new Map(model.definitions.map(d => [d.id,d]));
  for (const o of model.occurrences) {
    const d = defs.get(o.definition);
    elements.push({ data: { id: o.id, parent: o.composition, label: `${d?.name || o.definition}\n${o.role}`, kind: d?.kind || 'unknown', definition: o.definition, selectedVersion: o.versionSelection }, classes: 'e31-occurrence' });
  }
  for (const c of model.connections) elements.push({ data: { id: c.id, source: c.from, target: c.to, label: c.kind, kind: c.kind }, classes: 'e31-connection' });
  return elements;
}
