/** A visual annotation of internal-composition selection, never a statement of compliance.
 * Nodes retain their original identity and containment regardless of selection status.
 */
export function contextualInternalStates(model, registry, resolver, baselineId, compositionId) {
  const nodes=new Map();
  const counts={'selected-illustrative':0,absent:0,ambiguous:0,incompatible:0};
  if(!baselineId)return {nodes,counts};
  for(const occurrence of model.occurrences.filter(o=>o.composition===compositionId)) {
    const result=resolver.resolve(baselineId,occurrence.id);
    counts[result.status]=(counts[result.status]||0)+1;
    const cssStatus=result.status==='selected-illustrative'?'selected':result.status;
    nodes.set(occurrence.id,cssStatus);
    for(const definition of registry.byOccurrence(occurrence.id)) {
      // A different available definition is NOT the selected definition.
      const status=result.status==='selected-illustrative' && result.definition?.id!==definition.id?'absent':cssStatus;
      nodes.set(definition.rootNode,status);
    }
  }
  return {nodes,counts};
}
