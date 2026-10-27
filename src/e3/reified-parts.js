import dataset from '../../data/e3/reified-parts.json' with {type:'json'};

/** A direct role in an assembly is distinct from its realization and from a configuration item. */
export function createReifiedPartsRegistry(data=dataset){
  const assemblies=new Map(data.assemblyDefinitions.map(x=>[x.id,x]));
  const parts=new Map(data.partDefinitions.map(x=>[x.id,x]));
  const usages=new Map(data.partUsages.map(x=>[x.id,x]));
  const byGraph=new Map();
  const byAssembly=new Map();
  const issues=[];
  for(const usage of usages.values()){
    const part=parts.get(usage.partDefinition);
    if(!part || !assemblies.has(usage.assemblyDefinition) || part.assemblyDefinition!==usage.assemblyDefinition)
      issues.push(`Invalid direct usage ${usage.id}`);
    if(byGraph.has(usage.graphNode))issues.push(`Duplicated graph node ${usage.graphNode}`);
    byGraph.set(usage.graphNode,{usage,part});
    if(!byAssembly.has(usage.assemblyDefinition))byAssembly.set(usage.assemblyDefinition,[]);
    byAssembly.get(usage.assemblyDefinition).push({usage,part});
  }
  const byRoot=new Map([...assemblies.values()].map(a=>[a.node,a]));
  if(byRoot.size!==assemblies.size || parts.size!==data.partDefinitions.length || usages.size!==data.partUsages.length)
    issues.push('Duplicate semantic identifiers');
  function validateSource(decomposition){
    const more=[...issues];
    for(const assembly of assemblies.values()){
      const structure=decomposition.structures.find(s=>s.nodes.some(n=>n.id===assembly.node));
      if(!structure)more.push(`Unknown assembly root ${assembly.node}`);
      const nodes=new Map((structure?.nodes||[]).map(n=>[n.id,n]));
      for(const {usage} of byAssembly.get(assembly.id)||[]){
        if(usage.parentGraphNode!==assembly.node || nodes.get(usage.graphNode)?.parent!==assembly.node)
          more.push(`Mismatch direct membership ${usage.id}`);
        if(usage.assertionSource!==usage.graphNode)more.push(`Missing source assertion ${usage.id}`);
      }
      for(const n of structure?.nodes||[]){
        if(n.parent===assembly.node && !byGraph.has(n.id))more.push(`Unrepresented direct member ${n.id}`);
      }
    }
    return more;
  }
  return {assemblies,parts,usages,issues,byRoot,byGraph,directParts(id){return [...(byAssembly.get(id)||[])];},validateSource};
}
