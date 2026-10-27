/** A read-only, identity-preserving landscape over existing heterogeneous sources.
 * View extraction does not claim semantic equivalence between a concept and a component.
 */
export function createLandscape({concepts, relations, model, catalog = [], views}) {
  const entities = new Map();
  const add = (kind, records) => {
    for (const record of records) {
      if (!record.id || entities.has(record.id)) throw new Error(`duplicate landscape id: ${record.id}`);
      entities.set(record.id, Object.freeze({kind, record}));
    }
  };
  add('concept', concepts); add('concept-relation', relations);
  for (const [kind,key] of [['authority','authorities'],['definition','definitions'],['composition','compositions'],['occurrence','occurrences'],['connection','connections'],['federated-reference','federatedReferences'],['configuration','configurations']]) add(kind,model[key]||[]);
  add('catalog-component', catalog);
  const viewIndex = new Map();
  for (const view of views.views) {
    if (viewIndex.has(view.id)) throw new Error(`duplicate view: ${view.id}`);
    viewIndex.set(view.id, view);
  }
  function extract(viewId) {
    const view=viewIndex.get(viewId); if(!view)throw new Error(`unknown view: ${viewId}`);
    const ids=new Set(), omitted=[];
    const include = id=> { if(!entities.has(id)) throw new Error(`dangling landscape reference: ${id}`); ids.add(id); };
    if(view.mode==='concepts') {
      const selected=view.selection.concepts==='all'?concepts:concepts.filter(c=>view.selection.concepts.includes(c.id));
      selected.forEach(x=>include(x.id));
      for(const rel of relations) {
        if(ids.has(rel.source)&&ids.has(rel.target)) include(rel.id);
        else omitted.push(rel.id);
      }
    } else if(view.mode==='composition') {
      const composition=view.selection.composition; include(composition);
      const occurrences=model.occurrences.filter(o=>o.composition===composition);
      const occurrenceIds=new Set(occurrences.map(o=>o.id));
      for(const occurrence of occurrences) { include(occurrence.id); include(occurrence.definition); const d=model.definitions.find(x=>x.id===occurrence.definition); if(d) include(d.authority); if(entities.has(occurrence.versionSelection)) include(occurrence.versionSelection); }
      for(const connection of model.connections) {
        if(occurrenceIds.has(connection.from)&&occurrenceIds.has(connection.to)) include(connection.id);
        else omitted.push(connection.id);
      }
      for(const baseline of model.configurations.filter(c=>c.composition===composition)) {
        include(baseline.id);
        for(const refId of baseline.federatedReferences||[]) {include(refId);const ref=model.federatedReferences.find(r=>r.id===refId);if(ref)include(ref.authority);}
      }
    } else throw new Error(`unsupported view mode: ${view.mode}`);
    const selected=[...ids].map(id=>({id,...entities.get(id)}));
    const byKind={}; for(const e of selected)(byKind[e.kind]??=[]).push(e.record);
    return {view, ids:[...ids], byKind, omitted, count:selected.length, has:id=>ids.has(id)};
  }
  return {entities,views:viewIndex,extract};
}
