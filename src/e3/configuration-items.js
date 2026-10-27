import data from '../../data/e3/configuration-items.json' with {type:'json'};

/** Explicit managed items, candidate realizations and baseline choices. Never infer a choice from a part or graph node. */
export function createConfigurationItemRegistry(dataset=data, {parts, internal, selections, model}={}) {
  const errors=[];
  const index=(entries,kind)=>{
    const map=new Map();
    for(const entry of entries||[]){
      if(!entry?.id || map.has(entry.id))errors.push(`Duplicate or missing ${kind} id: ${entry?.id}`);
      else map.set(entry.id,entry);
    }
    return map;
  };
  const items=index(dataset.configurationItems,'configuration item');
  const realizations=index(dataset.realizationDefinitions,'realization');
  const choices=index(dataset.configurationChoices,'configuration choice');
  const byPair=new Map();
  const sourceSelections=selections?.selections || null;
  for(const r of realizations.values()){
    if(!items.has(r.configurationItem))errors.push(`Realization ${r.id} references unknown item`);
    if(parts && !parts.assemblies.has(r.assemblyDefinition))errors.push(`Realization ${r.id} references unknown assembly`);
    const assembly=parts?.assemblies.get(r.assemblyDefinition);
    if(assembly && assembly.definition!==r.internalDefinition)errors.push(`Realization ${r.id} contradicts assembly definition`);
    if(internal && !internal.definitions.some(d=>d.id===r.internalDefinition)) errors.push(`Realization ${r.id} has unknown internal definition`);
  }
  for(const item of items.values()){
    if(model && !model.occurrences.some(o=>o.id===item.scopeOccurrence)) errors.push(`Item ${item.id} references unknown occurrence`);
  }
  for(const choice of choices.values()){
    const item=items.get(choice.configurationItem);
    const realization=realizations.get(choice.realizationDefinition);
    if(!item || !realization || realization.configurationItem!==choice.configurationItem || item.scopeOccurrence!==choice.occurrence)
      errors.push(`Choice ${choice.id} has incompatible item/realization/occurrence references`);
    if(model && !model.configurations.some(b=>b.id===choice.baseline && b.composition===model.occurrences.find(o=>o.id===choice.occurrence)?.composition)) errors.push(`Choice ${choice.id} has incompatible baseline context`);
    if(sourceSelections && !sourceSelections.some(s=>s.id===choice.internalSelection && s.baseline===choice.baseline && s.occurrence===choice.occurrence && s.internalDefinition===realization?.internalDefinition))
      errors.push(`Choice ${choice.id} contradicts source internal selection`);
    const key=`${choice.baseline}|${choice.occurrence}`;
    if(!byPair.has(key))byPair.set(key,[]);
    byPair.get(key).push(choice);
  }
  function resolve(baseline,occurrence){
    const found=byPair.get(`${baseline}|${occurrence}`)||[];
    if(found.length>1)return {status:'ambiguous',choices:found};
    if(!found.length)return {status:'absent',choices:[]};
    const choice=found[0],item=items.get(choice.configurationItem),realization=realizations.get(choice.realizationDefinition);
    if(!item || !realization || realization.configurationItem!==item.id || item.scopeOccurrence!==occurrence ||
       (sourceSelections && !sourceSelections.some(s=>s.id===choice.internalSelection && s.baseline===baseline && s.occurrence===occurrence && s.internalDefinition===realization.internalDefinition)))
      return {status:'incompatible',choice,item,realization};
    return {status:'selected-illustrative',choice,item,realization};
  }
  return {items,realizations,choices,errors,resolve,forOccurrence(id){return [...items.values()].filter(x=>x.scopeOccurrence===id);}};
}
