import selections from '../../data/e3/internal-selections.json' with { type: 'json' };

/** Resolve internal selections for one baseline/occurrence; never infer from availability. */
export function createInternalSelectionResolver(dataset=selections, internals, model) {
  const definitions=new Map(internals.definitions.map(d=>[d.id,d]));
  const occurrences=new Map(model.occurrences.map(o=>[o.id,o]));
  const baselines=new Map(model.configurations.map(b=>[b.id,b]));
  const byKey=new Map();
  const issues=[];
  const ids=new Set();
  for(const selection of dataset.selections || []) {
    if(!selection.id || ids.has(selection.id))issues.push(`Duplicate or absent selection ID: ${selection.id}`);
    ids.add(selection.id);
    const key=`${selection.baseline}|${selection.occurrence}`;
    if(!byKey.has(key))byKey.set(key,[]);
    byKey.get(key).push(selection);
  }
  function resolve(baselineId,occurrenceId) {
    const baseline=baselines.get(baselineId);
    const occurrence=occurrences.get(occurrenceId);
    if(!baseline || !occurrence || occurrence.composition!==baseline.composition)
      return {status:'incompatible',reason:'Baseline or occurrence missing, or composition mismatch',candidates:[]};
    const candidates=byKey.get(`${baselineId}|${occurrenceId}`)||[];
    if(!candidates.length)return {status:'absent',reason:'No internal composition selected for this baseline and occurrence',candidates:[]};
    if(candidates.length>1)return {status:'ambiguous',reason:'Multiple internal selections for the same baseline and occurrence',candidates};
    const selection=candidates[0];
    const definition=definitions.get(selection.internalDefinition);
    if(!definition || definition.parentOccurrence!==occurrenceId || definition.composition!==baseline.composition ||
      selection.verification!=='illustrative-unverified' || selection.authority!==definition.authority ||
      !selection.evidence || selection.evidence!==definition.source ||
      (selection.revision!=null && definition.revision!==selection.revision) ||
      (selection.context && JSON.stringify(selection.context)!==JSON.stringify({platform:'unspecified'})))
      return {status:'incompatible',reason:'Internal definition, authority, provenance, revision or context mismatch',candidates};
    return {status:'selected-illustrative',reason:'Selection is declared but not natively verified',selection,definition,candidates};
  }
  for(const selection of dataset.selections||[]) {
    const result=resolve(selection.baseline,selection.occurrence);
    if(result.status==='incompatible')issues.push(`${selection.id}: ${result.reason}`);
  }
  return {resolve,issues,selections:[...(dataset.selections||[])]};
}
