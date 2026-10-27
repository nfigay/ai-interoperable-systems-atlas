import { evaluate } from './evaluate.js';

// Federation is a read-model of existing E3/E3.1 facts, not a new source of truth.
export function createRegistry(model, configurations, sources, documentPaths = []) {
  const maps = Object.fromEntries(['compositions','occurrences','definitions','configurations','federatedReferences','authorities','connections'].map(k => [k,new Map(model[k].map(x=>[x.id,x]))]));
  const catalog = new Map(configurations.catalog.map(x=>[x.id,x]));
  const cases = new Map(configurations.cases.map(x=>[x.id,x]));
  const specs = new Map(configurations.specifications.map(x=>[x.id,x]));
  const sourceMap = new Map(sources.sources.map(x=>[x.id,x]));
  const paths = new Set(documentPaths);
  const errors = [];
  const records = new Map();
  for (const composition of model.compositions) {
    const baselines = model.configurations.filter(x=>x.composition===composition.id);
    if (!baselines.length) errors.push(`Composition without configuration: ${composition.id}`);
    records.set(composition.id,{...composition,baselines:baselines.map(x=>x.id)});
  }
  for (const baseline of model.configurations) {
    const configurationCase = cases.get(baseline.case);
    if (!configurationCase) { errors.push(`Missing resolution case: ${baseline.id}`); continue; }
    const spec = specs.get(configurationCase.specId);
    if (!spec) { errors.push(`Missing specification: ${baseline.id}`); continue; }
    const selected = model.occurrences.filter(x=>x.composition===baseline.composition);
    if (!selected.length) errors.push(`Empty composition: ${baseline.id}`);
    if (JSON.stringify([...selected.map(x=>x.versionSelection)].sort()) !== JSON.stringify([...configurationCase.selectedIds].sort())) errors.push(`Case/occurrence selection mismatch: ${baseline.id}`);
    if (JSON.stringify([...baseline.nativeSelections].sort()) !== JSON.stringify([...configurationCase.selectedIds].sort())) errors.push(`Case/baseline selection mismatch: ${baseline.id}`);
    const resolution = evaluate(configurationCase,spec,configurations.catalog);
    if (resolution.status !== configurationCase.expected) errors.push(`Unexpected evaluated status: ${baseline.id}`);
    const selections = selected.map(occurrence => ({occurrence,definition:maps.definitions.get(occurrence.definition),component:catalog.get(occurrence.versionSelection)}));
    for (const entry of selections) if (!entry.definition || !entry.component) errors.push(`Unresolved selection: ${entry.occurrence.id}`);
    const references = baseline.federatedReferences.map(id => maps.federatedReferences.get(id));
    for (const ref of references) {
      if (!ref) { errors.push(`Missing reference in ${baseline.id}`); continue; }
      if (!maps.authorities.has(ref.authority)) errors.push(`Missing reference authority: ${ref.id}`);
      if (ref.pinned && (!ref.nativeRevision && !ref.contentDigest && !ref.immutableLocator)) errors.push(`Pinned without immutable native identity: ${ref.id}`);
      if (ref.authority === 'atlas-git' && !paths.has(ref.nativeLocator)) errors.push(`Missing Atlas document: ${ref.nativeLocator}`);
    }
    for (const id of spec.sourceIds) if (!sourceMap.has(id)) errors.push(`Unknown normative source: ${id}`);
    records.set(baseline.id,{...baseline,context:spec.environment,assertedAt:spec.assertedAt,validFrom:spec.validFrom,validUntil:spec.validUntil,revision:spec.revision,requirementIds:[...spec.requiredCapabilities],resolution,selections,references,sourceRecords:spec.sourceIds.map(id=>sourceMap.get(id)).filter(Boolean)});
  }
  for (const connection of model.connections) {
    const from = maps.occurrences.get(connection.from), to = maps.occurrences.get(connection.to);
    if (!from || !to || from.composition !== to.composition) errors.push(`Invalid cross-composition connection: ${connection.id}`);
  }
  return {errors,records,maps,byComposition(id){return (records.get(id)?.baselines||[]).map(x=>records.get(x)).filter(Boolean);},byOccurrence(id){const occurrence=maps.occurrences.get(id);return occurrence?this.byComposition(occurrence.composition):[];},byReference(id){return model.configurations.filter(x=>x.federatedReferences.includes(id)).map(x=>records.get(x.id)).filter(Boolean);}};
}
