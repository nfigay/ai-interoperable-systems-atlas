import { fcoseOptions } from '../layout/fcose-profiles.js';

export const DEFAULT_EXPLORATION = Object.freeze({ animate: true, animationDuration: 800, randomize: true, fit: false });

export function layoutSettings(profile, settings = DEFAULT_EXPLORATION) {
  const options = fcoseOptions(profile, settings.randomize ? 'initial' : 'refine');
  return { ...options, animate: settings.animate, animationDuration: settings.animationDuration, fit: false };
}

export function collapseSettings(profile, settings = DEFAULT_EXPLORATION) {
  return {
    animate: settings.animate,
    animationDuration: settings.animationDuration,
    fisheye: false,
    layoutBy: layoutSettings(profile, settings),
    edgeTypeInfo: edge => edge.data('kind') || edge.data('type') || 'unspecified',
    groupEdgesOfSameTypeOnCollapse: true,
    undoable: true,
    cueEnabled: true,
    expandCollapseCueSize: 16
  };
}

// One orchestration point shared by the complete landscape and page extractions.
// Structural transformations are delegated to expand-collapse; layoutBy runs fCoSE.
export function createExplorationController(cy, ec, profile, settings = DEFAULT_EXPLORATION, ur = null) {
  const state = { ...settings };
  let busy = false;
  const refresh = () => {
    // Do not reset the expand-collapse extension: setOptions() can disturb its cue lifecycle.
    ec.setOption('layoutBy', layoutSettings(profile, state));
    ec.setOption('animate', state.animate);
    ec.setOption('animationDuration', state.animationDuration);
    ec.enableCue();
  };
  const dispatch = (name, args, fallback) => ur ? ur.do(name, args) : fallback();
  function execute(action, scope = 'selected', target = 'nodes') {
    if (busy) return false;
    const nodes = cy.$(':selected').nodes();
    const edges = cy.$(':selected').edges();
    if (scope === 'selected' && !(target === 'nodes' ? nodes.length : edges.length)) return false;
    const opts = collapseSettings(profile, state);
    // User gestures are single undoable operations, registered by expand-collapse.
    // Layout and cues belong to the extension, never to a second animation loop.
    refresh();
    if (target === 'nodes') {
      if (scope === 'all') {
        const name = action === 'collapse' ? 'collapseAll' : 'expandAll';
        dispatch(name, { options: opts }, () => ec[name](opts));
      } else {
        const name = action === 'collapse' ? 'collapseRecursively' : 'expandRecursively';
        dispatch(name, { nodes, options: opts }, () => ec[name](nodes, opts));
      }
    } else if (scope === 'all') {
      const name = action === 'collapse' ? 'collapseAllEdges' : 'expandAllEdges';
      dispatch(name, { options: opts }, () => ec[name](opts));
    } else {
      const name = action === 'collapse' ? 'collapseEdges' : 'expandEdges';
      dispatch(name, { edges, options: opts }, () => ec[name](edges, opts));
    }
    return true;
  }
  function layout() {
    if (busy) return false;
    const job = cy.layout(layoutSettings(profile, state));
    busy = true;
    job.one('layoutstop', () => { busy = false; });
    job.run();
    return true;
  }
  function undo() { if (!ur || busy || ur.isUndoStackEmpty()) return false; ur.undo(); return true; }
  function redo() { if (!ur || busy || ur.isRedoStackEmpty()) return false; ur.redo(); return true; }
  return { state, refresh, execute, layout, undo, redo };
}

export function mountExplorationToolbar(host, controller, cy) {
  const wrap = document.createElement('div');
  wrap.className = 'atlas-exploration-toolbar';
  wrap.setAttribute('aria-label','Exploration du graphe');
  wrap.innerHTML = `<label>Elements <select data-explore="target"><option value="nodes">Compound nodes</option><option value="edges">Edges</option></select></label>
    <label>Scope <select data-explore="scope"><option value="selected">Selection</option><option value="all">All</option></select></label>
    <button type="button" data-explore="collapse">Collapse</button><button type="button" data-explore="expand">Expand</button>
    <button type="button" data-explore="layout">fCoSE</button>
    <button type="button" data-explore="undo">Undo</button><button type="button" data-explore="redo">Redo</button>
    <label><input type="checkbox" data-explore="randomize" checked> Randomize</label>
    <label><input type="checkbox" data-explore="animate" checked> Animate</label>
    <label>ms <input type="number" data-explore="duration" min="100" max="3000" step="100" value="800" style="width:5em"></label>
    <label>Node types <select data-explore="nodeType"><option value="*">All</option></select></label>
    <label>Types arcs <select data-explore="edgeType"><option value="*">All</option></select></label>
    <button type="button" data-explore="filtersReset">Reset filters</button><span class="atlas-exploration-status" role="status"></span>`;
  host.append(wrap);
  if (!document.getElementById('atlas-exploration-toolbar-style')) {
    const style=document.createElement('style');style.id='atlas-exploration-toolbar-style';
    style.textContent='.atlas-exploration-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #ccd5df;margin-top:8px}.atlas-exploration-toolbar label{display:inline-flex;align-items:center;gap:4px;font-size:12px}.atlas-exploration-toolbar select,.atlas-exploration-toolbar input{max-width:125px}.atlas-exploration-status{font-size:12px;opacity:.75}';
    document.head.append(style);
  }
  const read = key => wrap.querySelector(`[data-explore="${key}"]`);
  const status = message => {read('filtersReset').nextElementSibling.textContent = message;};
  const kinds = (collection, key) => [...new Set(collection.map(ele => ele.data(key)).filter(Boolean))].sort();
  const nodeKinds=kinds(cy.nodes(),'kind');
  const edgeKinds=[...new Set([...kinds(cy.edges(),'kind'),...kinds(cy.edges(),'type')])].sort();
  const fill=(el,values)=>values.forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;el.append(option);});
  fill(read('nodeType'),nodeKinds);fill(read('edgeType'),edgeKinds);
  function applyFilters() {
    const n=read('nodeType').value, e=read('edgeType').value;
    cy.batch(()=>{
      cy.nodes().forEach(node=>node.toggleClass('atlas-explore-filtered',n!=='*' && node.data('kind')!==n));
      cy.edges().forEach(edge=>edge.toggleClass('atlas-explore-filtered',e!=='*' && (edge.data('kind')||edge.data('type'))!==e));
    });
    status('Projection filter; source model unchanged');
  }
  function onChange(event){
    const key=event.target.dataset.explore;
    if (key==='randomize'||key==='animate') controller.state[key]=event.target.checked;
    if (key==='duration') controller.state.animationDuration=Math.max(100,Math.min(3000,Number(event.target.value)||800));
    if (['randomize','animate','duration'].includes(key)) controller.refresh();
    if (key==='nodeType'||key==='edgeType')applyFilters();
  }
  function onClick(event){
    const key=event.target.dataset.explore;
    if (key==='collapse'||key==='expand') status(controller.execute(key,read('scope').value,read('target').value)?'Operation in progress':'No selection or animation in progress');
    if (key==='layout') status(controller.layout()?'Animated fCoSE layout':'Animation in progress');
    if (key==='undo'||key==='redo') status(controller[key]() ? `${key} executed` : `${key} unavailable`);
    if (key==='filtersReset'){read('nodeType').value='*';read('edgeType').value='*';applyFilters();}
  }
  wrap.addEventListener('change',onChange);wrap.addEventListener('click',onClick);
  return ()=>{wrap.removeEventListener('change',onChange);wrap.removeEventListener('click',onClick);wrap.remove();};
}
