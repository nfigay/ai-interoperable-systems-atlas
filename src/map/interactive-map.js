import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import expandCollapse from 'cytoscape-expand-collapse';
import concepts from '../../data/concepts.json';
import relationsCsv from '../../data/relations.csv?raw';
import { buildAtlasGraph, parseRelationsCsv } from './graph-data.js';

cytoscape.use(fcose);
cytoscape.use(expandCollapse);

export function mountConceptMap(host) {
  const graph = buildAtlasGraph(concepts, parseRelationsCsv(relationsCsv));
  const conceptById = new Map(concepts.map(c => [c.id, c]));
  host.innerHTML = `<div class="map-intro"><h1>Concept map</h1><p>Compound groups express a <strong>view organisation</strong>, not an ontological assertion. Edge labels express proposed or sourced claims; statuses remain visible.</p></div>
    <div class="map-controls" aria-label="Graph controls"><button type="button" data-act="layout">Re-layout (fCoSE)</button><button type="button" data-act="collapse">Collapse groups</button><button type="button" data-act="expand">Expand groups</button><button type="button" data-act="fit">Fit</button><button type="button" data-act="reset">Clear focus</button></div>
    <div class="map-workspace"><div id="atlas-graph" role="group" aria-label="Interactive concept graph; select a node or relation for details"></div><aside id="atlas-detail" aria-live="polite"><h2>Explore a concept</h2><p>Select a node or relation to inspect it.</p></aside></div>
    <p class="map-footnote">Source data: <code>data/concepts.json</code> and <code>data/relations.csv</code>. Statuses: N normative in stated context; S scientific; E engineering; P proposed. This view has not been formally validated.</p>`;

  const cy = cytoscape({
    container: host.querySelector('#atlas-graph'),
    elements: [...graph.nodes, ...graph.edges],
    minZoom: 0.2, maxZoom: 3.5, wheelSensitivity: 0.18,
    layout: { name: 'preset' },
    style: [
      { selector: 'node[kind="view-group"]', style: {
        'shape': 'round-rectangle', 'background-color': '#e3eff7', 'background-opacity': 0.7,
        'border-width': 2, 'border-style': 'dashed', 'border-color': '#729eb7',
        'label': 'data(label)', 'font-family': 'Arial, sans-serif', 'font-size': 22, 'font-weight': 700,
        'color': '#204a63', 'text-valign': 'top', 'text-halign': 'center', 'text-margin-y': -13,
        'padding': '54px', 'text-background-opacity': 0, 'text-margin-y': -15
      } },
      { selector: 'node[kind="concept"]', style: {
        'shape': 'round-rectangle', 'background-color': '#135d77', 'color': '#ffffff',
        'label': 'data(label)', 'font-family': 'Arial, sans-serif', 'font-size': 20, 'font-weight': 700,
        'text-valign': 'center', 'text-halign': 'center', 'text-wrap': 'wrap',
        'text-max-width': '180px', 'width': 210, 'height': 86,
        'border-color': '#0a435b', 'border-width': 2, 'text-outline-width': 0
      } },
      { selector: 'edge', style: {
        'curve-style': 'bezier', 'width': 3.2, 'line-color': '#577b91',
        'target-arrow-color': '#577b91', 'target-arrow-shape': 'triangle', 'arrow-scale': 1.1,
        'label': 'data(label)', 'font-family': 'Arial, sans-serif', 'font-size': 19,
        'font-weight': 600, 'text-rotation': 'autorotate', 'text-background-opacity': 1,
        'text-background-color': '#ffffff', 'text-background-padding': '6px', 'color': '#29485c'
      } },
      { selector: '.map-muted', style: { 'opacity': 0.18 } },
      { selector: '.map-neighbor', style: { 'border-color': '#4192c2', 'border-width': 4 } },
      { selector: ':selected', style: { 'border-color': '#f0a327', 'border-width': 5,
        'line-color': '#df8a1d', 'target-arrow-color': '#df8a1d', 'opacity': 1 } },
      // Collapse turns a compound node into an ordinary node.  Set its appearance
      // explicitly instead of retaining the expanded compound label geometry.
      { selector: 'node[kind="view-group"].cy-expand-collapse-collapsed-node', style: {
        'width': 235, 'height': 88, 'padding': '0px',
        'shape': 'round-rectangle', 'background-color': '#d1e7f3',
        'background-opacity': 1, 'border-style': 'solid',
        'border-width': 3, 'border-color': '#487f9c',
        'font-size': 19, 'color': '#173e54',
        'text-valign': 'center', 'text-halign': 'center',
        'text-wrap': 'wrap', 'text-max-width': '205px',
        'text-margin-x': 0, 'text-margin-y': 0,
        // The label background uses the SAME fill as the collapsed node: no
        // visually separate white stripe across the label area.
        'text-background-color': '#d1e7f3',
        'text-background-opacity': 1,
        'text-background-padding': '3px',
        'text-background-shape': 'roundrectangle'
      } }
    ]
  });
  const ec = cy.expandCollapse({ layoutBy: null, fisheye: false, animate: false, cueEnabled: false });
  const details = host.querySelector('#atlas-detail');
  const makeText = (tag, text) => { const el = document.createElement(tag); el.textContent = text; return el; };
  const displayName = id => conceptById.get(id)?.label || id;

  function clearEmphasis() {
    cy.elements().removeClass('map-muted map-neighbor');
  }
  function emphasize(element) {
    clearEmphasis();
    if (!element || element.data('kind') === 'view-group') return;
    const neighborhood = element.closedNeighborhood();
    const visible = neighborhood.union(neighborhood.ancestors()).union(element.ancestors());
    cy.elements().not(visible).addClass('map-muted');
    neighborhood.nodes().not(element).addClass('map-neighbor');
  }
  function navigateTo(id) {
    const node = cy.getElementById(id);
    if (!node.length || !node.inside()) return;
    // Expanding a group restores the original concept without changing its identity.
    let parent = node.parent();
    if (parent.length && ec.isExpandable(parent)) ec.expand(parent);
    parent = node.parent();
    while (parent.length) {
      if (ec.isExpandable(parent)) ec.expand(parent);
      parent = parent.parent();
    }
    syncGroupPresentation();
    cy.elements().unselect();
    node.select();
    show(node);
    cy.animate({ center: { eles: node }, zoom: Math.max(cy.zoom(), 0.9) }, { duration: 230 });
  }
  function show(element) {
    details.replaceChildren();
    emphasize(element);
    if (!element) {
      details.append(makeText('h2', 'Explore a concept'), makeText('p', 'Select a concept or relation. Click a related concept in this panel to navigate.'));
      return;
    }
    const data = element.data();
    details.append(makeText('h2', data.label || data.type || data.id));
    if (element.isEdge()) {
      details.append(makeText('p', `${displayName(data.source)} → ${displayName(data.target)}`));
      details.append(makeText('p', data.notes || 'No justification recorded'));
      details.append(makeText('p', `Relation status: ${data.status || 'unclassified'}`));
    } else if (data.kind === 'view-group') {
      details.append(makeText('p', 'Visual grouping only — not a semantic containment statement.'));
      details.append(makeText('p', 'Use Expand groups to explore its contained concepts.'));
    } else {
      details.append(makeText('p', data.definition || 'Definition pending review'));
      const connected = graph.edges.map(e => e.data).filter(e => e.source === data.id || e.target === data.id);
      details.append(makeText('h3', `Relations (${connected.length})`));
      if (!connected.length) details.append(makeText('p', 'No relation registered yet.'));
      const list = document.createElement('ul');
      list.className = 'map-relations';
      for (const relation of connected) {
        const outgoing = relation.source === data.id;
        const otherId = outgoing ? relation.target : relation.source;
        const item = document.createElement('li');
        item.append(makeText('small', `${outgoing ? '→' : '←'} ${relation.type.replaceAll('_', ' ')} [${relation.status}]`));
        const button = makeText('button', displayName(otherId));
        button.type = 'button';
        button.addEventListener('click', () => navigateTo(otherId));
        item.append(button);
        list.append(item);
      }
      details.append(list);
    }
    if (data.status) details.append(makeText('p', `Evidence classification: ${data.status}`));
    if (data.review) details.append(makeText('p', `Editorial review: ${data.review}`));
    details.append(makeText('p', `Identifier: ${data.id}`));
  }
  cy.on('tap', 'node, edge', event => show(event.target));
  cy.on('tap', event => { if (event.target === cy) { cy.elements().unselect(); show(null); } });

  function syncGroupPresentation() {
    // The expand-collapse extension maintains the documented
    // .cy-expand-collapse-collapsed-node class itself.  No duplicate state.
  }
  function fit() { cy.resize(); cy.fit(cy.elements(':visible'), 55); }
  function layout(randomize = true) {
    clearEmphasis();
    cy.layout({ name: 'fcose', quality: 'default', randomize, animate: false,
      fit: false, nodeDimensionsIncludeLabels: true,
      idealEdgeLength: 210, nodeRepulsion: 9500, nestingFactor: 1.3, gravity: 0.2
    }).run();
    syncGroupPresentation();
    fit();
  }
  const controls = event => {
    const action = event.target.closest('button[data-act]')?.dataset.act;
    if (action === 'layout') layout();
    if (action === 'collapse') { clearEmphasis(); ec.collapseAll(); syncGroupPresentation(); layout(false); cy.elements().unselect(); show(null); }
    if (action === 'expand') { ec.expandAll(); syncGroupPresentation(); layout(false); cy.elements().unselect(); show(null); }
    if (action === 'fit') fit();
    if (action === 'reset') { cy.elements().unselect(); show(null); fit(); }
  };
  host.querySelector('.map-controls').addEventListener('click', controls);
  requestAnimationFrame(() => { if (cy.destroyed()) return; cy.resize(); layout(); });
  return () => { host.querySelector('.map-controls')?.removeEventListener('click', controls); cy.destroy(); };
}
