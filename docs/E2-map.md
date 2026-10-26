# Atlas E2 — Concept map

## Scope

The first interactive map renders existing concept records and relations using Cytoscape.js, compound nodes, fCoSE positioning and expand/collapse controls. Groups represent **view organisation**, not domain knowledge or ontology axioms. Relations use IDs from the source register and preserve their evidence classification.

## Implementation reference

ArchiCG original (local user revision `7f40c22832e311495d06ea9ac40766ea07cc288e`) provides a functional precedent: `js/cytoscape/displayer.js` creates Cytoscape, invokes `cy.expandCollapse(...)`, and calls `api.expand` / `api.collapse`. We do not copy bundled libraries or assume its visual layout has formal semantics.

## Limits

- E2 only renders five pre-existing concepts and three pre-existing relations; it makes no new normative assertions.
- CSV parser intentionally supports only the current simple unquoted format; malformed inputs fail explicitly.
- Compound membership is a visualization choice and may change across viewpoints.
- No persisted layout positions, ontology reasoner, or multi-view graph projection yet.
- Browser interaction acceptance is pending until tested in Chrome on the user's Mac.
