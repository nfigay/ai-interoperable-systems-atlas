/** Explain declared admissibility without claiming native verification or enumerating configurations. */
export function createDecisionTrace(admissibility, configurationItems) {
  const cache=new Map();
  const dependencies=new Map();
  const signature=(baseline,occurrence)=>JSON.stringify([baseline,occurrence]);
  function compute(baseline,occurrence){
    const resolved=admissibility.resolve(baseline,occurrence);
    const selected=configurationItems.resolve(baseline,occurrence);
    const candidates=resolved.candidates.map(entry=>{
      const {candidate,realization}=entry;
      const checks=[{
        id:`${candidate.id}:applicability`,kind:'applicable-baselines',
        outcome:candidate.applicableBaselines?.includes(baseline)?'satisfied':'violated',
        expected:candidate.applicableBaselines||[],actual:baseline,
        authority:candidate.authority||null,evidence:candidate.evidence||null
      }];
      for(let i=0;i<(candidate.constraints||[]).length;i++){
        const rule=candidate.constraints[i];
        let outcome='unknown',expected=null,actual=null;
        if(rule.kind==='baseline-allowlist'){
          expected=rule.baselines||[];actual=baseline;
          outcome=expected.includes(baseline)?'satisfied':'violated';
        }else if(rule.kind==='revision-known'){
          expected='known-revision';actual=realization?.revision??null;
          outcome=actual?'satisfied':'unknown';
        }
        checks.push({id:`${candidate.id}:constraint:${i}`,kind:rule.kind,outcome,
          expected,actual,authority:rule.authority||candidate.authority||null,
          evidence:rule.evidence||candidate.evidence||null});
      }
      checks.push({id:`${candidate.id}:provenance`,kind:'declared-provenance',
        outcome:candidate.evidence&&candidate.authority?'satisfied':'unknown',
        expected:'authority-and-evidence',actual:{authority:candidate.authority||null,evidence:candidate.evidence||null},
        authority:candidate.authority||null,evidence:candidate.evidence||null});
      if(!realization||realization.configurationItem!==candidate.configurationItem){
        checks.push({id:`${candidate.id}:reference`,kind:'realization-reference',outcome:'violated',
          expected:candidate.configurationItem,actual:realization?.configurationItem??null,
          authority:candidate.authority||null,evidence:candidate.evidence||null});
      }
      return {candidateId:candidate.id,configurationItem:candidate.configurationItem,
        realizationDefinition:candidate.realizationDefinition,selected:entry.selected,
        status:entry.status,verification:entry.verification,checks,
        authority:candidate.authority||null,evidence:candidate.evidence||null};
    });
    return {baseline,occurrence,selectionStatus:resolved.selectionStatus,
      selectionId:selected.choice?.id||null,candidates};
  }
  function resolve(baseline,occurrence){
    const key=signature(baseline,occurrence);
    if(!cache.has(key)){
      const result=compute(baseline,occurrence);cache.set(key,result);
      const deps=new Set([`baseline:${baseline}`,`occurrence:${occurrence}`]);
      for(const entry of result.candidates){
        deps.add(`candidate:${entry.candidateId}`);
        deps.add(`realization:${entry.realizationDefinition}`);
        deps.add(`configuration-item:${entry.configurationItem}`);
      }
      dependencies.set(key,deps);
    }
    return cache.get(key);
  }
  /** Invalidate only cached resolutions depending on explicitly changed identifiers. */
  function invalidate(changed=[]){
    const changes=new Set(changed);
    let count=0;
    for(const [key,deps] of dependencies){
      if([...changes].some(x=>deps.has(x))){cache.delete(key);dependencies.delete(key);count++;}
    }
    return count;
  }
  return {resolve,invalidate,clear(){cache.clear();dependencies.clear();},get cacheSize(){return cache.size;}};
}
