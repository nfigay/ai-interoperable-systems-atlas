/** Identity-driven navigation for configuration semantics. A declared evidence locator is not proof of verification. */
export function createTraceNavigation({configurationItems,parts,decisionTrace}) {
  function resolve(kind,id,baseline=null,occurrence=null){
    const maps={item:configurationItems.items,realization:configurationItems.realizations,choice:configurationItems.choices,part:parts.parts,usage:parts.usages,assembly:parts.assemblies};
    if(kind==='evidence'){
      if(!id || typeof id!=='string')return null;
      const references=[];
      for(const [type,items] of Object.entries(maps))for(const record of items.values())
        if(record.evidence===id || record.assertionSource===id)references.push({kind:type,id:record.id});
      if(baseline && occurrence){
        const trace=decisionTrace.resolve(baseline,occurrence);
        for(const candidate of trace.candidates)for(const check of candidate.checks)
          if(check.evidence===id)references.push({kind:'check',id:check.id});
      }
      return {kind,id,record:{id,verification:'not-established',references},references};
    }
    const record=maps[kind]?.get(id);
    if(!record)return null;
    const references=[];
    if(kind==='item'){
      if(record.scopeOccurrence)references.push({kind:'occurrence',id:record.scopeOccurrence});
      for(const r of configurationItems.realizations.values())if(r.configurationItem===id)references.push({kind:'realization',id:r.id});
      for(const c of configurationItems.choices.values())if(c.configurationItem===id)references.push({kind:'choice',id:c.id});
    }else if(kind==='realization'){
      references.push({kind:'item',id:record.configurationItem},{kind:'assembly',id:record.assemblyDefinition});
      for(const c of configurationItems.choices.values())if(c.realizationDefinition===id)references.push({kind:'choice',id:c.id});
    }else if(kind==='choice'){
      references.push({kind:'item',id:record.configurationItem},{kind:'realization',id:record.realizationDefinition},{kind:'occurrence',id:record.occurrence},{kind:'baseline',id:record.baseline});
    }else if(kind==='assembly'){
      for(const u of parts.usages.values())if(u.assemblyDefinition===id)references.push({kind:'usage',id:u.id});
    }else if(kind==='part'){
      references.push({kind:'assembly',id:record.assemblyDefinition});
      for(const u of parts.usages.values())if(u.partDefinition===id)references.push({kind:'usage',id:u.id});
    }else if(kind==='usage'){
      references.push({kind:'part',id:record.partDefinition},{kind:'assembly',id:record.assemblyDefinition});
      if(record.graphNode)references.push({kind:'graph',id:record.graphNode});
    }
    if(record.evidence)references.push({kind:'evidence',id:record.evidence});
    if(record.assertionSource)references.push({kind:'evidence',id:record.assertionSource});
    return {kind,id,record,references};
  }
  return {resolve};
}
