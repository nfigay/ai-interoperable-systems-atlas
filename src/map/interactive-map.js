import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import expandCollapse from 'cytoscape-expand-collapse';
import undoRedo from 'cytoscape-undo-redo';
import concepts from '../../data/concepts.json';
import relationsCsv from '../../data/relations.csv?raw';
import { buildAtlasGraph, parseRelationsCsv } from './graph-data.js';
import {conceptExamples,exampleUrl} from '../e3/concept-bridges.js';
import {fcoseOptions,fitVisible} from '../layout/fcose-profiles.js';
import {atlasLandscape} from '../landscape/atlas-landscape.js';
import {createExplorationController,mountExplorationToolbar,collapseSettings} from '../exploration/controller.js';

cytoscape.use(fcose);
cytoscape.use(undoRedo);
cytoscape.use(expandCollapse);

export function mountConceptMap(host) {
  const extracted=atlasLandscape.extract('view:concept-landscape');
  const graph = buildAtlasGraph(extracted.byKind.concept,extracted.byKind['concept-relation']);
  const conceptById = new Map(concepts.map(c => [c.id, c]));
  host.innerHTML = `<div class="map-intro"><h1>Concept map</h1><p>Compound groups express a <strong>view organisation</strong>, not an ontological assertion. Edge labels express proposed or sourced claims; statuses remain visible.</p></div>
    <div class="map-controls" aria-label="Graph controls"><button type="button" data-act="fit">Fit</button><button type="button" data-act="reset">Clear focus</button></div>
    <div class="map-panel-controls"><button type="button" id="map-detail-toggle" aria-controls="atlas-detail" aria-expanded="true">Hide properties</button><span class="map-panel-help">Drag the divider to adjust width.</span></div>
    <div class="map-workspace"><div id="atlas-graph" role="group" aria-label="Interactive concept graph; select a node or relation for details"></div><div class="map-splitter" role="separator" tabindex="0" aria-label="Resize map properties" aria-orientation="vertical" aria-valuemin="260" aria-valuemax="900" aria-valuenow="420"></div><aside id="atlas-detail" aria-live="polite"><h2>Explore a concept</h2><p>Select a node or relation to inspect it.</p></aside></div>
    <p class="map-footnote">Extraction explicite : <code>view:concept-landscape</code> (${extracted.count} ressources). Sources : <code>data/concepts.json</code> et <code>data/relations.csv</code>. Statuses: N normative in stated context; S scientific; E engineering; P proposed. This view has not been formally validated.</p>`;

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
      { selector: '.atlas-explore-filtered', style: { display: 'none' } },
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
  const ur = cy.undoRedo();
  const ec = cy.expandCollapse({...collapseSettings('concept'), undoable: true});
  ec.enableCue();
  const exploration=createExplorationController(cy,ec,'concept',undefined,ur);
  const disposeToolbar=mountExplorationToolbar(host.querySelector('.map-controls'),exploration,cy);
  const details = host.querySelector('#atlas-detail');
  const workspace=host.querySelector('.map-workspace');
  const splitter=host.querySelector('.map-splitter');
  const detailToggle=host.querySelector('#map-detail-toggle');
  let inspectorVisible=true;
  let inspectorWidth=420;
  let dragging=false;
  const graphHost=host.querySelector('#atlas-graph');
  const clampWidth=value=>Math.max(260,Math.min(900,Math.min(workspace.clientWidth*0.75,value)));
  function refreshGraphSize(){requestAnimationFrame(()=>{if(!cy.destroyed())cy.resize();});}
  function applyPanel(){
    workspace.classList.toggle('map-panel-hidden',!inspectorVisible);
    workspace.style.setProperty('--map-detail-width',inspectorWidth+'px');
    detailToggle.textContent=inspectorVisible?'Hide properties':'Show properties';
    detailToggle.setAttribute('aria-expanded',String(inspectorVisible));
    details.hidden=!inspectorVisible;
    splitter.hidden=!inspectorVisible;
    splitter.setAttribute('aria-valuenow',String(inspectorWidth));
    refreshGraphSize();
  }
  detailToggle.addEventListener('click',()=>{inspectorVisible=!inspectorVisible;applyPanel();});
  splitter.addEventListener('pointerdown',event=>{if(event.button!==0)return;dragging=true;splitter.setPointerCapture(event.pointerId);splitter.classList.add('is-dragging');event.preventDefault();});
  splitter.addEventListener('pointermove',event=>{if(!dragging)return;inspectorWidth=Math.round(clampWidth(workspace.getBoundingClientRect().right-event.clientX-5));applyPanel();});
  const stopDrag=()=>{dragging=false;splitter.classList.remove('is-dragging');refreshGraphSize();};
  splitter.addEventListener('pointerup',stopDrag);
  splitter.addEventListener('pointercancel',stopDrag);
  splitter.addEventListener('keydown',event=>{if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;event.preventDefault();inspectorWidth=Math.round(clampWidth(inspectorWidth+(event.key==='ArrowLeft'?24:-24)));applyPanel();});
  const onWindowResize=()=>{inspectorWidth=Math.round(clampWidth(inspectorWidth));applyPanel();};
  window.addEventListener('resize',onWindowResize);
  applyPanel();
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
      // Concept-to-reading link is an editorial pointer, not evidence of equivalence.
      const resource = conceptById.get(data.id)?.resource;
      if (resource && /^[a-z0-9/_-]+$/i.test(resource)) {
        const link = makeText('a', 'Read the associated Atlas resource');
        link.href = `#${resource}`;
        details.append(link);
      }


      const examples=conceptExamples[data.id] || [];
      if(examples.length){
        details.append(makeText('h3','Illustrative composite-model occurrences'));
        details.append(makeText('p','Editorial links to demonstration occurrences, not assertions of semantic identity, interoperability or norm compliance.'));
        const ul=document.createElement('ul');
        for(const id of examples){const li=document.createElement('li');const a=makeText('a',id+' — inspect selection, context and baseline');a.href=exampleUrl(id);li.append(a);ul.append(li);}
        details.append(ul);
      }
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
  function fit() { fitVisible(cy, 55); }
  function layout(randomize = exploration.state.randomize) {
    clearEmphasis();
    exploration.state.randomize=randomize;exploration.refresh();exploration.layout();
    syncGroupPresentation();
  }
  const controls = event => {
    const action = event.target.closest('button[data-act]')?.dataset.act;
    if (action === 'layout') layout();
    if (action === 'collapse') { clearEmphasis(); exploration.execute('collapse','all','nodes'); syncGroupPresentation(); cy.elements().unselect(); show(null); }
    if (action === 'expand') { exploration.execute('expand','all','nodes'); syncGroupPresentation(); cy.elements().unselect(); show(null); }
    if (action === 'fit') fit();
    if (action === 'reset') { cy.elements().unselect(); show(null); fit(); }
  };
  host.querySelector('.map-controls').addEventListener('click', controls);
  requestAnimationFrame(() => { if (cy.destroyed()) return; cy.resize(); cy.one("layoutstop",()=>fit()); layout(true); });
  return () => { window.removeEventListener('resize',onWindowResize); disposeToolbar();host.querySelector('.map-controls')?.removeEventListener('click', controls); cy.destroy(); };
}
