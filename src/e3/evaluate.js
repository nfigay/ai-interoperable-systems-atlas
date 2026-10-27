export function evaluate(configuration, spec, catalog) {
  const byId = new Map(catalog.map(x => [x.id, x]));
  const selected = configuration.selectedIds.map(id => byId.get(id));
  const errors = [];
  const unknown = [...(configuration.unknownConstraints ?? [])];
  const missing = configuration.selectedIds.filter(id => !byId.has(id));
  if (missing.length) errors.push(...missing.map(id => `Unknown component: ${id}`));
  const provided = new Set(selected.filter(Boolean).flatMap(x => x.provides));
  for (const capability of spec.requiredCapabilities) {
    if (!provided.has(capability)) errors.push(`Missing required capability: ${capability}`);
  }
  for (const component of selected.filter(Boolean)) {
    for (const requirement of component.requires) {
      if (!provided.has(requirement)) errors.push(`${component.id} requires unavailable capability: ${requirement}`);
    }
  }
  const status = errors.length ? 'incompatible' : unknown.length ? 'indeterminate' : 'resolved';
  return { caseId: configuration.id, specId: spec.id, status, errors, unknown,
    selectedIds: [...configuration.selectedIds],
    resolutionScope: 'Declared capabilities and requirements only; no runtime or semantic verification' };
}
