/** Atlas fCoSE layout profiles. Visual placement is not semantic containment. */
export function fcoseOptions(profile, phase = 'initial') {
  if (!['concept', 'composition'].includes(profile)) throw new Error(`Unknown fCoSE profile: ${profile}`);
  if (!['initial', 'refine'].includes(phase)) throw new Error(`Unknown fCoSE phase: ${phase}`);
  const refine = phase === 'refine';
  const values = profile === 'concept'
    ? { idealEdgeLength: 210, nodeRepulsion: 9500, nestingFactor: 1.3, gravity: 0.2 }
    : { idealEdgeLength: 160, nodeRepulsion: 6500, edgeElasticity: 0.3, numIter: 1800 };
  return {
    name: 'fcose',
    quality: refine ? 'proof' : 'default',
    randomize: !refine,
    animate: false,
    fit: false,
    // The upstream README documents label dimensions only for proof quality.
    nodeDimensionsIncludeLabels: refine,
    packComponents: false,
    ...values
  };
}

/** Viewport operations must not mutate graph coordinates or selection. */
export function fitVisible(cy, padding = 40) {
  cy.resize();
  const visible = cy.elements(':visible');
  if (visible.length) cy.fit(visible, padding);
}
