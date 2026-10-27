import dataset from '../../data/e3/realization-admissibility.json' with {type:'json'};

/** Resolve authored candidate constraints in the requested context; never enumerate configurations or infer native verification. */
export function createRealizationAdmissibility(data=dataset, configItems){
  const errors=[];
  const map=new Map();
  const realizations=new Map(configItems?.realizations || []);
  for(const r of data.additionalRealizations||[]){
    if(realizations.has(r.id))errors.push(`Duplicate realization ${r.id}`);
    if(!configItems?.items.has(r.configurationItem))errors.push(`Unknown item for realization ${r.id}`);
    realizations.set(r.id,r);
  }
  for(const candidate of data.candidates||[]){
    if(!candidate.id||map.has(candidate.id))errors.push(`Duplicate candidate ${candidate.id}`);
    if(!configItems?.items.has(candidate.configurationItem))errors.push(`Unknown item for candidate ${candidate.id}`);
    const realization=realizations.get(candidate.realizationDefinition);
    if(!realization||realization.configurationItem!==candidate.configurationItem)errors.push(`Invalid realization reference for candidate ${candidate.id}`);
    if(!candidate.evidence||!candidate.authority)errors.push(`Missing provenance for candidate ${candidate.id}`);
    for(const rule of candidate.constraints||[]){
      if(!['baseline-allowlist','revision-known'].includes(rule.kind))errors.push(`Unknown constraint ${rule.kind} on ${candidate.id}`);
    }
    map.set(candidate.id,candidate);
  }
  function evaluate(candidate,baseline){
    const realization=realizations.get(candidate.realizationDefinition);
    const reasons=[];let indeterminate=false,violated=false;
    if(!realization||realization.configurationItem!==candidate.configurationItem){violated=true;reasons.push('Inconsistent realization reference');}
    if(!candidate.applicableBaselines?.includes(baseline)){violated=true;reasons.push('Baseline not declared applicable');}
    for(const rule of candidate.constraints||[]){
      if(rule.kind==='baseline-allowlist'&&!rule.baselines?.includes(baseline)){violated=true;reasons.push('Baseline exclue par une contrainte');}
      else if(rule.kind==='revision-known'&&!realization?.revision){indeterminate=true;reasons.push('Unknown revision');}
      else if(!['baseline-allowlist','revision-known'].includes(rule.kind)){indeterminate=true;reasons.push('Contrainte non prise en charge');}
    }
    if(!candidate.evidence||!candidate.authority){indeterminate=true;reasons.push('Missing justification or authority');}
    const status=violated?'incompatible':indeterminate?'indeterminate':'admissible-declared';
    return {candidate,realization,status,reasons,verification:'illustrative-unverified'};
  }
  function resolve(baseline,occurrence){
    const itemList=configItems?.forOccurrence(occurrence)||[];
    const selected=configItems?.resolve(baseline,occurrence)||{status:'absent'};
    const candidates=itemList.flatMap(item=>[...map.values()].filter(c=>c.configurationItem===item.id).map(c=>{
      const result=evaluate(c,baseline);
      return {...result,selected:selected.choice?.realizationDefinition===c.realizationDefinition && selected.status==='selected-illustrative'};
    }));
    return {baseline,occurrence,selectionStatus:selected.status,candidates};
  }
  return {errors,candidates:map,realizations,evaluate,resolve};
}
