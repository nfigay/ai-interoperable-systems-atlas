import example from '../../data/e3/illustrative-decomposition.json' with { type: 'json' };

/** Strictly explicit author assertions; no topology-derived semantic parentage. */
export function decompositionProjection(model, compositionId, maxDepth=Infinity, dataset=example) {
  const composition=model.compositions.find(x=>x.id===compositionId);
  if(!composition)throw new Error(`Unknown composition: ${compositionId}`);
  if(!(maxDepth===Infinity||(Number.isInteger(maxDepth)&&maxDepth>=0)))throw new Error('Invalid maximum depth');
  const structure=dataset.structures.find(x=>x.composition===compositionId);
  if(!structure)throw new Error(`No asserted decomposition for ${compositionId}`);
  const records=new Map([[compositionId,{id:compositionId,label:composition.name,kind:'composition'}]]);
  for(const record of structure.nodes){
    if(records.has(record.id))throw new Error(`Duplicate decomposition resource: ${record.id}`);
    const occurrence=model.occurrences.find(x=>x.id===record.id);
    if(occurrence&&occurrence.composition!==compositionId)throw new Error(`Foreign occurrence: ${record.id}`);
    if(record.id.startsWith('occ:')&&!occurrence)throw new Error(`Unknown occurrence: ${record.id}`);
    records.set(record.id,{...record,kind:occurrence?'occurrence':'illustrative-group',label:record.label||occurrence?.role||record.id});
  }
  const children=new Map();
  for(const record of structure.nodes){
    if(!records.has(record.parent))throw new Error(`Unknown asserted parent: ${record.parent}`);
    if(!children.has(record.parent))children.set(record.parent,[]);
    children.get(record.parent).push(record.id);
  }
  const depth=new Map(); const active=new Set();
  const visit=(id,level)=>{
    if(active.has(id))throw new Error(`Cycle in explicit decomposition: ${id}`);
    if(depth.has(id))throw new Error(`Repeated decomposition resource: ${id}`);
    active.add(id);depth.set(id,level);
    for(const child of children.get(id)||[])visit(child,level+1);
    active.delete(id);
  };
  visit(compositionId,0);
  if(depth.size!==records.size)throw new Error('Disconnected decomposition resource or cycle');
  const nodes=[...records.values()].filter(n=>depth.get(n.id)<=maxDepth).map(n=>({id:n.id,kind:n.kind,resourceId:n.id,label:n.label,depth:depth.get(n.id),evidenceStatus:dataset.status}));
  const visible=new Set(nodes.map(n=>n.id));
  const links=structure.nodes.filter(n=>visible.has(n.id)&&visible.has(n.parent)).map(n=>({from:n.parent,to:n.id,type:'asserted-example-containment',evidence:{field:'illustrative-decomposition.nodes.parent',sourceId:n.id,status:dataset.status}}));
  return {hierarchy:'decomposition',compositionId,maxDepth,nodes,links,excluded:[...records.keys()].filter(id=>!visible.has(id)),disclaimer:dataset.disclaimer};
}
