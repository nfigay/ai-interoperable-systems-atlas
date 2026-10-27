import { foldableProjection } from './hierarchy-fold.js';

/** A compound parent represents ONLY an explicit, selected containment assertion.
 * Navigation / traceability / connectivity stay typed edges, never inferred parents.
 */
export function semanticContainmentToCompound(projection) {
  if (projection.hierarchy !== 'decomposition') throw new Error('No asserted containment semantics for this hierarchy');
  const byId = new Map(projection.nodes.map(n => [n.id, n]));
  if (byId.size !== projection.nodes.length) throw new Error('Duplicate compound node id');
  const parent = new Map();
  const evidence = new Map();
  const edges = [];
  for (const link of projection.links) {
    if (!byId.has(link.from) || !byId.has(link.to)) throw new Error('Unknown containment endpoint');
    if (link.type !== 'asserted-example-containment') {
      edges.push({data:{id:`relation:${edges.length}:${link.from}:${link.to}`,source:link.from,target:link.to,type:link.type,label:link.type,field:link.evidence?.field,sourceId:link.evidence?.sourceId}});
      continue;
    }
    if (link.from === link.to || parent.has(link.to)) throw new Error(`Invalid or multiple containment parents: ${link.to}`);
    parent.set(link.to, link.from);
    evidence.set(link.to, link.evidence);
  }
  for (const id of parent.keys()) {
    const visited = new Set([id]);
    let current = parent.get(id);
    while (current !== undefined) {
      if (visited.has(current)) throw new Error(`Containment cycle: ${id}`);
      visited.add(current);
      current = parent.get(current);
    }
  }
  const parents = new Set(parent.values());
  const nodes = projection.nodes.map(n=>({data:{
    id:n.id, resourceId:n.resourceId, label:n.label, kind:n.kind, depth:n.depth,
    ...(parent.has(n.id)?{parent:parent.get(n.id)}:{}),
    foldable:parents.has(n.id),
    containmentRelation:parent.has(n.id)?'asserted-example-containment':undefined,
    containmentEvidence: evidence.get(n.id) || undefined,
    evidenceStatus:n.evidenceStatus
  }, classes:parents.has(n.id)?'atlas-compound-parent':''}));
  return {nodes, edges, visible:{nodes:projection.nodes,links:projection.links,foldable:parents}, compound:true};
}

/** Non-containment paths remain edge-based, with no Cytoscape parent. */
/** Add ONLY existing native typed connections to the same recursive compound projection.
 * This preserves occurrence ids and never turns a connection into parentage. */
export function nativeConnectionsForCompound(projection, model) {
  if (projection.hierarchy !== 'decomposition') return [];
  const included = new Set(projection.nodes.map(n => n.resourceId));
  const occs = new Map(model.occurrences.map(o => [o.id, o]));
  return model.connections.filter(c => included.has(c.from) && included.has(c.to) &&
    occs.get(c.from)?.composition === projection.compositionId &&
    occs.get(c.to)?.composition === projection.compositionId).map(c => ({data:{
      id:c.id,source:c.from,target:c.to,type:c.kind,label:c.kind,
      field:'connection.from/to',sourceId:c.id,semanticSource:c.semanticSource,
      nativeConnection:true
  }}));
}
export function hierarchyGraphElements(projection, folded = new Set(), model = null) {
  if (projection.hierarchy === 'decomposition') {
    const result = semanticContainmentToCompound(projection);
    if (model) result.edges.push(...nativeConnectionsForCompound(projection, model));
    return result;
  }
  const visible = foldableProjection(projection, folded);
  const nodes = visible.nodes.map(node => ({ data: {
    id:node.id,label:node.label,kind:node.kind,resourceId:node.resourceId,
    depth:node.depth,foldable:visible.foldable.has(node.id),collapsed:folded.has(node.id)
  }}));
  const edges = visible.links.map((link,index)=>({data:{
    id:`navigation:${index}:${link.from}:${link.to}`,
    source:link.from,target:link.to,label:link.type,type:link.type,
    field:link.evidence.field,sourceId:link.evidence.sourceId
  }}));
  return {nodes,edges,visible,compound:false};
}
