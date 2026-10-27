/** Projects immediate, identified part usages. No inference along paths. */
export function projectReifiedPartUsages(projection, registry) {
  if (projection.hierarchy !== 'decomposition') return projection;
  const visible = new Set(projection.nodes.map(n => n.id));
  const owned = new Map();
  for (const [graphNode, entry] of registry.byGraph) {
    if (!visible.has(graphNode)) continue;
    const {usage, part} = entry;
    if (!visible.has(usage.parentGraphNode)) continue; // respect depth
    if (owned.has(graphNode)) throw new Error(`Duplicate direct part ${graphNode}`);
    owned.set(graphNode, {usage, part});
  }
  const links = [];
  const seen = new Set();
  for (const link of projection.links) {
    const entry = owned.get(link.to);
    if (!entry) { links.push(link); continue; }
    if (link.type !== 'asserted-example-containment' || link.from !== entry.usage.parentGraphNode) {
      throw new Error(`Contradictory graphical containment for ${link.to}`);
    }
    if (seen.has(link.to)) throw new Error(`Multiple direct usages for ${link.to}`);
    seen.add(link.to);
  }
  // Authoritative containment for migrated parts comes from PartUsage, not graphic parent.
  for (const [graphNode,{usage,part}] of owned) {
    if (!seen.has(graphNode)) throw new Error(`Missing direct part link ${graphNode}`);
    links.push({from:usage.parentGraphNode,to:graphNode,
      type:'asserted-example-containment', semanticType:'direct-part-usage',
      partDefinition:part.id,partUsage:usage.id,assemblyDefinition:usage.assemblyDefinition,
      evidence:{field:'PartUsage.parentGraphNode',sourceId:usage.assertionSource,
        assertionSource:usage.assertionSource,source:usage.evidence,
        partUsage:usage.id,partDefinition:part.id}
    });
  }
  return {...projection, links};
}

/** Ensures the rendered direct parent relation and inspector enumeration match. */
export function validateProjectedDirectParts(graph, registry) {
  const errors=[];
  const nodes=new Map(graph.nodes.map(n=>[n.data.id,n.data]));
  for (const [root, assembly] of registry.byRoot) {
    if (!nodes.has(root)) continue;
    const expected=registry.directParts(assembly.id).filter(x=>nodes.has(x.usage.graphNode));
    const actual=[...nodes.values()].filter(n=>n.parent===root && registry.byGraph.has(n.id));
    if (expected.length!==actual.length) errors.push(`Direct part count mismatch ${root}`);
    for (const {usage,part} of expected) {
      const node=nodes.get(usage.graphNode);
      if (node?.parent!==root || node?.partUsage!==usage.id || node?.partDefinition!==part.id)
        errors.push(`Part projection mismatch ${usage.id}`);
    }
  }
  return errors;
}
