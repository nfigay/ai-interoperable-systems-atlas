/** Resolve graph selection without assuming that illustrative groups belong to the native registry. */
export function classifyGraphSelection(data, registry) {
  const id = data?.resourceId || data?.id;
  if (!id) return {kind:'unknown',id:''};
  if (registry.maps.occurrences.has(id)) return {kind:'occurrence',id};
  if (registry.maps.connections.has(id)) return {kind:'connection',id};
  if (registry.maps.compositions.has(id)) return {kind:'composition',id};
  if (registry.maps.configurations?.has?.(id)) return {kind:'configuration',id};
  if (registry.maps.federatedReferences.has(id)) return {kind:'reference',id};
  if (data?.kind === 'illustrative-group' || data?.evidenceStatus || id.startsWith('demo:')) return {kind:'illustrative',id};
  return {kind:'resource',id};
}
