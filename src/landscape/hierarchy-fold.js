/** Read-only tree folding in a typed navigation projection.
 * Only evidence-backed hierarchy edges define descendants. Connectivity edges
 * are cross-references, never a source of tree parentage.
 */
const traversalTypes = {
  decomposition: new Set(['asserted-example-containment']),
  realization: new Set(['uses-occurrence','references-definition','declared-authority']),
  governance: new Set(['has-declared-baseline','cites-reference','declared-authority']),
  connectivity: new Set(['uses-occurrence'])
};
export function foldableProjection(projection, collapsedIds = new Set()) {
  const structural = traversalTypes[projection.hierarchy];
  if (!structural) throw new Error(`Unknown hierarchy: ${projection.hierarchy}`);
  const nodes = new Map(projection.nodes.map(n=>[n.id,n]));
  const edges = projection.links.filter(e=>structural.has(e.type));
  const children=new Map();
  const parents=new Set();
  for(const edge of edges){
    if(!children.has(edge.from)) children.set(edge.from,[]);
    children.get(edge.from).push(edge.to);
    parents.add(edge.to);
  }
  const roots=projection.nodes.filter(n=>!parents.has(n.id));
  const visible=new Set();
  const expanded=new Set();
  const visit=(id,ancestors=new Set())=>{
    if(ancestors.has(id)||!nodes.has(id))return;
    visible.add(id);
    if(collapsedIds.has(id))return;
    expanded.add(id);
    const path=new Set([...ancestors,id]);
    for(const child of children.get(id)||[]) visit(child,path);
  };
  roots.forEach(n=>visit(n.id));
  const visibleNodes=projection.nodes.filter(n=>visible.has(n.id));
  const visibleLinks=projection.links.filter(e=>visible.has(e.from)&&visible.has(e.to));
  return {
    nodes:visibleNodes,
    links:visibleLinks,
    foldable:new Set([...children.keys()].filter(id=>(children.get(id)||[]).length)),
    hiddenCount:projection.nodes.length-visibleNodes.length,
    collapsedCount:[...collapsedIds].filter(id=>children.has(id)).length
  };
}
