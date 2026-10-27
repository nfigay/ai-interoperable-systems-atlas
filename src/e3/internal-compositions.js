import catalog from '../../data/e3/internal-compositions.json' with { type: 'json' };

/** Demonstration mappings, never authoritative native composition definitions. */
export function createInternalCompositionRegistry(dataset=catalog){
  const byNode=new Map();
  const byOccurrence=new Map();
  for(const definition of dataset.definitions){
    if(byNode.has(definition.rootNode))throw new Error(`Duplicate internal composition: ${definition.rootNode}`);
    if(!definition.parentOccurrence || !definition.rootNode || !definition.id)throw new Error('Missing composition identity');
    const copy={...definition};
    byNode.set(definition.rootNode,{definition:copy,role:'composition'});
    for(const id of definition.interfaces||[]){
      if(byNode.has(id))throw new Error(`Duplicate internal element: ${id}`);
      byNode.set(id,{definition:copy,role:'interface'});
    }
    for(const id of definition.internalOccurrences||[]){
      if(byNode.has(id))throw new Error(`Duplicate internal element: ${id}`);
      byNode.set(id,{definition:copy,role:'internal-placeholder'});
    }
    if(!byOccurrence.has(definition.parentOccurrence))byOccurrence.set(definition.parentOccurrence,[]);
    byOccurrence.get(definition.parentOccurrence).push(copy);
  }
  return {getNode(id){return byNode.get(id)||null;},byOccurrence(id){return [...(byOccurrence.get(id)||[])];}, definitions:[...dataset.definitions]};
}

/** Referential integrity is checked against explicit source assertions, not graphical ancestry. */
export function validateInternalCompositionRegistry(registry,model,decomposition){
  const issues=[];
  const occurrences=new Map(model.occurrences.map(o=>[o.id,o]));
  for(const entry of registry.definitions){
    const occ=occurrences.get(entry.parentOccurrence);
    if(!occ || occ.composition!==entry.composition)issues.push(`Invalid owning occurrence: ${entry.id}`);
    const structure=decomposition.structures.find(s=>s.composition===entry.composition);
    const nodes=new Map((structure?.nodes||[]).map(n=>[n.id,n]));
    if(nodes.get(entry.rootNode)?.parent!==entry.parentOccurrence)issues.push(`Invalid root containment: ${entry.id}`);
    for(const id of [...(entry.interfaces||[]),...(entry.internalOccurrences||[])]){
      if(nodes.get(id)?.parent!==entry.rootNode)issues.push(`Invalid internal containment: ${id}`);
    }
    if(entry.verification!=='illustrative-unverified')issues.push(`Unsupported verification claim: ${entry.id}`);
  }
  return issues;
}
