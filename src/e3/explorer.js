import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import expandCollapse from 'cytoscape-expand-collapse';
import undoRedo from 'cytoscape-undo-redo';
import {concreteView,concreteConsistency} from './concrete-views.js';
import {HIERARCHIES,hierarchyProjection} from '../landscape/hierarchies.js';
import {foldableProjection} from '../landscape/hierarchy-fold.js';
import {hierarchyGraphElements} from '../landscape/hierarchy-graph.js';
import {fcoseOptions,fitVisible} from '../layout/fcose-profiles.js';
cytoscape.use(fcose);
cytoscape.use(undoRedo);
cytoscape.use(expandCollapse);
import model from '../../data/e3/federated-compositions.json';
import configs from '../../data/e3/configurations.json';
import sources from '../../data/e3/sources.json';
import {toCompoundElements,validateFederation} from './compound-model.js';
import {createRegistry} from './federated-registry.js';
import {pages} from '../content.js';
import {atlasLandscape} from '../landscape/atlas-landscape.js';
import {createExplorationController,mountExplorationToolbar,collapseSettings} from '../exploration/controller.js';
import './explorer.css';
import {createInspectorState,inspectorLayoutState,inspectorWidthLabel,nextInspectorWidth} from './inspector-panel.js';
import {classifyGraphSelection} from './inspector-graph-target.js';
import {createInternalCompositionRegistry} from './internal-compositions.js';
import {createInternalSelectionResolver} from './internal-selections.js';
import {contextualInternalStates} from './baseline-graph-context.js';
import {createPerspectiveMemory} from './perspective-memory.js';
import {createReifiedPartsRegistry} from './reified-parts.js';
import {projectReifiedPartUsages,validateProjectedDirectParts} from './part-projection.js';
import {createConfigurationItemRegistry} from './configuration-items.js';
import {createRealizationAdmissibility} from './realization-admissibility.js';
import {createDecisionTrace} from './decision-trace.js';
import {createTraceNavigation} from './trace-navigation.js';
import {mountGuidedVoyage} from './guided-voyage.js';
import decompositionData from '../../data/e3/illustrative-decomposition.json' with {type:'json'};

const esc = value => String(value ?? 'not specified').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list = (items,render) => `<ul>${items.map(render).join('')}</ul>`;
const link = path => `<a href="#${encodeURIComponent(path.replace(/^docs\//,'').replace(/\.md$/,''))}">${esc(path)}</a>`;
const statusText = {resolved:'Declared constraints satisfied',incompatible:'Constraint violation demonstrated',indeterminate:'Insufficient evidence'};
export function mountE31(){
  if(document.getElementById('atlas-e31'))return;
  const root=document.createElement('section');root.id='atlas-e31';
  root.innerHTML=`<div class="e31-controls"><label>Composition <select id="e31-case">${model.compositions.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label><button type="button" id="e31-fit">Fit view</button><button type="button" id="e31-back">Configuration view</button><div class="e31-panel-options"><button type="button" id="e31-panel-toggle">Hide properties</button><button type="button" id="e31-panel-width">Width: normal</button><label class="e31-randomize"><input type="checkbox" id="e31-panel-auto">Auto reveal</label></div></div><div class="e34-shared-tools"><label>Active baseline <select id="e34-active-baseline" aria-label="Active baseline for internal compositions"></select></label><span id="e34-baseline-legend" class="e32-note"></span><label>Graph type <select id="e34-global-hierarchy">${HIERARCHIES.map(h=>`<option value="${esc(h.id)}">${esc(h.title)}</option>`).join('')}</select></label><label>Depth <select id="e34-global-depth">${[0,1,2,3,4,5,6,7,8].map(i=>`<option value="${i}" ${i===8?'selected':''}>${i}</option>`).join('')}</select></label><button type="button" id="e34-global-expand">Expand all</button><button type="button" id="e34-global-collapse">Collapse all</button><button type="button" id="e34-undo">Undo navigation</button><button type="button" id="e34-redo">Redo navigation</button><span class="e32-note">Direct assembly relationships differ from traceability paths.</span></div><p id="e34-view-explanation" class="e34-view-explanation" role="status" aria-live="polite"></p><p id="e34-graph-coverage" class="e34-view-explanation" role="status" aria-live="polite" hidden></p><div class="e33-tabs" role="group" aria-label="Concrete model views"><button type="button" data-model-view="graph">Direct composition</button><button type="button" data-model-view="hierarchy">Recursive composition and connections</button><button type="button" data-model-view="structure">Structure</button><button type="button" data-model-view="relations">Relations</button><button type="button" data-model-view="source">Source model</button></div><div class="e32-workspace"><div class="e32-edge-hotzone" aria-hidden="true"></div><button type="button" class="e32-inspector-handle" id="e31-panel-handle" hidden>Properties</button><div class="e32-graph-pane"><div id="e31-graph" role="group" aria-label="Selectable composition and occurrences"></div><div id="e33-concrete" hidden aria-label="Non-graphical model view"></div><p class="e32-note">Select an occurrence or relationship to explore its configuration links.</p></div><div id="e31-splitter" class="e32-splitter" role="separator" aria-label="Resize the properties panel" aria-orientation="vertical" tabindex="0" aria-valuemin="260" aria-valuemax="900"></div><div id="e31-inspector" aria-live="polite"></div></div>`;
  document.querySelector('#content')?.append(root);
  const registry=createRegistry(model,configs,sources,pages.map(p=>`docs/${p.id}.md`));
  const internalRegistry=createInternalCompositionRegistry();
  const reifiedParts=createReifiedPartsRegistry();
  const internalSelections=createInternalSelectionResolver(undefined,internalRegistry,model);
  const configItems=createConfigurationItemRegistry(undefined,{parts:reifiedParts,internal:internalRegistry,selections:internalSelections,model});
  const admissibility=createRealizationAdmissibility(undefined,configItems);
  const decisionTrace=createDecisionTrace(admissibility,configItems);
  const traceNavigation=createTraceNavigation({configurationItems:configItems,parts:reifiedParts,decisionTrace});
  const landscapeExtracts=new Map([['comp:reference','view:agent-mcp-reference'],['comp:alternative','view:agent-mcp-alternative']]);
  const errors=[...validateFederation(model,configs.catalog),...registry.errors,...reifiedParts.validateSource(decompositionData),...configItems.errors,...admissibility.errors];
  const inspector=root.querySelector('#e31-inspector');
  const workspace=root.querySelector('.e32-workspace');
  const panelToggle=root.querySelector('#e31-panel-toggle');
  const panelWidth=root.querySelector('#e31-panel-width');
  const panelAuto=root.querySelector('#e31-panel-auto');
  const panelHandle=root.querySelector('#e31-panel-handle');
  const edgeHotzone=root.querySelector('.e32-edge-hotzone');
  const splitter=root.querySelector('#e31-splitter');
  let inspectorPixels=420;
  const inspectorState=createInspectorState({collapsed:true,autoReveal:false});
  let revealTimer=null;
  if(errors.length){inspector.textContent=errors.join('\n');return ()=>root.remove();}
  let current=model.compositions[0].id;
  let baselineId=null;
  let activeBaselineId=null;
  let modelView='graph';
  let hierarchyId='decomposition';
  let hierarchyDepth=8;
  const foldedByHierarchy=new Map();
  const folded=()=>{const key=`${current}|${hierarchyId}`;if(!foldedByHierarchy.has(key))foldedByHierarchy.set(key,new Set());return foldedByHierarchy.get(key);};
  const cy=cytoscape({container:root.querySelector('#e31-graph'),elements:toCompoundElements(model),style:[
    {selector:'node',style:{label:'data(label)','font-size':15,'text-wrap':'wrap','text-max-width':'165px','text-valign':'center','text-halign':'center','background-color':'#c4e0ea','border-width':1,'border-color':'#316789',padding:'20px',width:'label',height:'label'}},
    {selector:'.e31-container.cy-expand-collapse-collapsed-node',style:{'width':210,'height':85,'background-opacity':1,'border-style':'solid','text-valign':'center','text-halign':'center','padding':'0px','font-size':14}},
    {selector:'.e31-container',style:{'background-color':'#e8eef4','background-opacity':0.3,'border-width':2,'border-style':'dashed','border-color':'#69849c','text-valign':'top','text-halign':'center','font-size':17,padding:'45px'}},
    {selector:'edge',style:{label:'data(label)','font-size':11,width:3,'line-color':'#6d7f91','target-arrow-shape':'triangle','target-arrow-color':'#6d7f91','curve-style':'bezier','text-rotation':'none','text-background-color':'#f8fbfd','text-background-opacity':0.96,'text-background-padding':'4px','text-background-shape':'roundrectangle','text-outline-width':0,'color':'#213447','font-weight':600,'min-zoomed-font-size':9}},
    {selector:'.atlas-compound-parent',style:{'background-color':'#e8eef4','background-opacity':0.35,'border-style':'dashed','border-width':2,'padding':'32px','text-valign':'top','text-halign':'center'}},
    {selector:'.atlas-compound-parent.cy-expand-collapse-collapsed-node',style:{'background-opacity':1,'border-style':'solid',width:165,height:66,'text-valign':'center'}},
    {selector:'node[foldable]',style:{'border-style':'dashed'}},
    {selector:'node.atlas-internal-selected',style:{'border-color':'#2b7f72','border-width':5}},
    {selector:'node.atlas-internal-absent',style:{'border-color':'#a67c3c','border-width':3,'border-style':'dotted'}},
    {selector:'node.atlas-internal-incompatible',style:{'border-color':'#b64c4c','border-width':5}},
    {selector:'node.atlas-internal-ambiguous',style:{'border-color':'#b64c4c','border-width':4,'border-style':'dashed'}},
    {selector:'.e32-active',style:{'border-color':'#c16a20','border-width':4,'line-color':'#c16a20','target-arrow-color':'#c16a20'}},
    {selector:'.atlas-explore-filtered',style:{display:'none'}},
    {selector:'.e31-hidden',style:{display:'none'}}],layout:{name:'preset'}});
  // Visual cue is drawn on the compound itself by the official extension.
  // This is graphic containment, not an assertion of semantic part-of.

  const ur=cy.undoRedo();
  const ec=cy.expandCollapse({...collapseSettings('composition'),undoable:true});
  ec.enableCue(); // Native cytoscape-expand-collapse cue only
  const exploration=createExplorationController(cy,ec,'composition',undefined,ur);
  const disposeToolbar=mountExplorationToolbar(root.querySelector('.e31-controls'),exploration,cy);
  function syncViewport(padding=24){
    requestAnimationFrame(()=>{
      if(cy.destroyed())return;
      cy.resize();
      if(modelView==='graph')fitVisible(cy,padding);
    });
  }
  function updateInspectorLayout(){
    const layout=inspectorLayoutState(inspectorState);
    workspace.classList.toggle('is-inspector-hidden',inspectorState.collapsed);
    workspace.classList.toggle('is-inspector-peeking',inspectorState.collapsed && inspectorState.revealed);
    workspace.style.setProperty('--e32-inspector-width',`${inspectorPixels}px`);
    splitter.hidden=inspectorState.collapsed;
    inspector.hidden=!layout.visible;
    panelHandle.hidden=layout.visible;
    edgeHotzone.hidden=!(inspectorState.collapsed && inspectorState.autoReveal);
    panelToggle.textContent=inspectorState.collapsed?(inspectorState.revealed?'Pin properties':'Show properties'):'Hide properties';
    panelWidth.textContent=`Width: ${inspectorPixels} px`;
    splitter.setAttribute('aria-valuenow',String(inspectorPixels));
    panelAuto.checked=inspectorState.autoReveal;
    requestAnimationFrame(()=>{if(!cy.destroyed()){cy.resize();}});
  }
  function cancelRevealHide(){ if(revealTimer){ clearTimeout(revealTimer); revealTimer=null; } }
  function scheduleRevealHide(){
    cancelRevealHide();
    if(!(inspectorState.collapsed && inspectorState.revealed && inspectorState.autoReveal))return;
    revealTimer=setTimeout(()=>{ inspectorState.revealed=false; updateInspectorLayout(); },180);
  }
  function revealInspector(){
    if(!(inspectorState.collapsed && inspectorState.autoReveal))return;
    cancelRevealHide();
    inspectorState.revealed=true;
    updateInspectorLayout();
  }
  function openInspector(){ cancelRevealHide(); inspectorState.collapsed=false; inspectorState.revealed=false; updateInspectorLayout(); }
  function toggleInspector(){ cancelRevealHide(); inspectorState.collapsed=!inspectorState.collapsed; inspectorState.revealed=false; updateInspectorLayout(); }
  function restructure(){
    if(modelView!=='graph'||activeProjection!=='graph')return;
    const phase=exploration.state.randomize?'initial':'refine';
    exploration.state.randomize=phase==='initial';exploration.refresh();exploration.layout();
  }
  function applyCollapse(kind){
    if(activeProjection!=='graph')return;
    const compound=cy.getElementById(current);
    if(kind==='collapse' && ec.isCollapsible(compound))ec.collapse(compound,collapseSettings('composition',exploration.state));
    if(kind==='expand' && ec.isExpandable(compound))ec.expand(compound,collapseSettings('composition',exploration.state));
    // The registry and inspector survive graphic collapse/expansion.
  }

  const concretePane=root.querySelector('#e33-concrete');
  const graphPane=root.querySelector('#e31-graph');
  const nativeGraphElements=toCompoundElements(model);
  let activeProjection='graph';
  let graphSwapGeneration=0;
  const perspectiveMemory=createPerspectiveMemory();
  let selectedGraphId=null;
  let activePerspectiveKey=`${current}|direct`;
  const perspectiveKey=(projection=activeProjection)=>
    `${current}|${projection==='graph'?'direct':`hierarchy|${hierarchyId}|${hierarchyDepth}`}`;
  function snapshotProjection(){
    if(cy.destroyed()||cy.elements().length===0)return;
    perspectiveMemory.save(activePerspectiveKey,{
      positions:cy.nodes().filter(n=>!n.isParent()).map(n=>({id:n.id(),position:{...n.position()}})),
      zoom:cy.zoom(),pan:{...cy.pan()},
      collapsed:cy.nodes('.cy-expand-collapse-collapsed-node').map(n=>n.id())
    });
  }
  function restoreSelection(){
    cy.elements().removeClass('e32-active');
    if(!selectedGraphId)return;
    const element=cy.getElementById(selectedGraphId);
    if(element.length)element.addClass('e32-active');
  }
  // A single Cytoscape core; UI states are keyed by composition and perspective.
  function replaceProjection(elements,projection){
    snapshotProjection();
    graphSwapGeneration++;
    cy.stop();
    if(typeof ur.reset==='function')ur.reset();
    cy.batch(()=>{cy.elements().remove();cy.add(elements);});
    activeProjection=projection;
    activePerspectiveKey=perspectiveKey(projection);
    cy.elements().removeClass('e31-hidden e32-active atlas-explore-filtered');
    exploration.refresh();
    const saved=perspectiveMemory.get(perspectiveKey());
    if(saved){
      cy.batch(()=>saved.positions.forEach(({id,position})=>{
        const node=cy.getElementById(id);
        if(node.length && node.isNode() && !node.isParent())node.position(position);
      }));
      // Nested collapse may remove children; order deepest-first for safety.
      for(const id of saved.collapsed){
        const node=cy.getElementById(id);
        if(node.length && ec.isCollapsible(node))ec.collapse(node,{...collapseSettings('composition',exploration.state),layoutBy:null});
      }
    }
    restoreSelection();
    return saved;
  }
  const baselineChooser=root.querySelector('#e34-active-baseline');
  const baselineLegend=root.querySelector('#e34-baseline-legend');
  function refreshBaselineChooser(){
    const available=registry.byComposition(current);
    if(!available.some(b=>b.id===activeBaselineId))activeBaselineId=available[0]?.id||null;
    baselineChooser.innerHTML=available.map(b=>`<option value="${esc(b.id)}">${esc(b.id)}</option>`).join('');
    baselineChooser.value=activeBaselineId||'';
    baselineChooser.disabled=available.length<2;
  }
  function applyInternalContext(){
    const states=contextualInternalStates(model,internalRegistry,internalSelections,activeBaselineId,current);
    cy.batch(()=>{
      cy.nodes().removeClass('atlas-internal-selected atlas-internal-absent atlas-internal-incompatible atlas-internal-ambiguous');
      for(const [id,state] of states.nodes){
        const node=cy.getElementById(id);
        if(node.length && node.isNode())node.addClass(`atlas-internal-${state}`);
      }
    });
    baselineLegend.textContent=`${activeBaselineId||'No baseline'} · ${states.counts['selected-illustrative']} illustrative selection · ${states.counts.absent} missing selection(s) · ${states.counts.ambiguous} ambiguous · ${states.counts.incompatible} incompatible. Borders indicate selection status, not conformance.`;
  }
  baselineChooser.addEventListener('change',()=>{
    activeBaselineId=baselineChooser.value;
    applyInternalContext();
    if(selectedGraphId){
      const target=cy.getElementById(selectedGraphId);
      if(target.length)showSelectedGraphElement(target);
    }
  });
  function renderHierarchyGraph(){
    if(modelView!=='hierarchy')return;
    const projection=hierarchyProjection(model,current,hierarchyId,hierarchyDepth);
    const semanticProjection=projectReifiedPartUsages(projection,reifiedParts);
    const graph=hierarchyGraphElements(semanticProjection,folded(),model);
    const coverage=root.querySelector('#e34-graph-coverage');
    const relationTypes=[...new Set(semanticProjection.links.map(link=>link.type))];
    const hiddenCount=semanticProjection.nodes.length-graph.nodes.length;
    const edgeCount=graph.edges.length;
    coverage.textContent=`${hierarchyNames[hierarchyId]||hierarchyId} — ${graph.nodes.length} visible node(s) out of ${semanticProjection.nodes.length}, ${edgeCount} visible edge(s) out of ${semanticProjection.links.length}. `+
      `Present relationships: ${relationTypes.join(', ')||'none'}. `+
      (hiddenCount?`${hiddenCount} node(s) hidden by folding; use “Expand all” to reveal them. `:'')+
      (!edgeCount?'No visible edge: the current view cannot show a path. ':'')+
      'Use “Fit view” if elements are outside the viewport. Arrows are not parts unless an explicit constitutive assertion says otherwise.';
    coverage.hidden=false;
    for(const node of graph.nodes){
      const direct=reifiedParts.byGraph.get(node.data.id);
      if(direct && node.data.parent===direct.usage.parentGraphNode){
        node.data.partDefinition=direct.part.id;
        node.data.partUsage=direct.usage.id;
        node.data.assemblyDefinition=direct.usage.assemblyDefinition;
        node.data.containmentEvidence={...node.data.containmentEvidence,assertionSource:direct.usage.assertionSource,partDefinition:direct.part.id,partUsage:direct.usage.id};
      }
    }
    const projectionIssues=hierarchyId==='decomposition'?validateProjectedDirectParts(graph,reifiedParts):[];
    if(projectionIssues.length){inspector.textContent=projectionIssues.join('\n');return;}
    const saved=replaceProjection([...graph.nodes,...graph.edges],'hierarchy');
    applyInternalContext();
    const generation=graphSwapGeneration;
    requestAnimationFrame(()=>{
      if(cy.destroyed()||generation!==graphSwapGeneration||modelView!=='hierarchy')return;
      cy.resize();
      if(saved){cy.zoom(saved.zoom);cy.pan(saved.pan);return;}
      cy.one('layoutstop',()=>{if(!cy.destroyed()&&generation===graphSwapGeneration)cy.fit(undefined,35);});
      cy.layout({name:'fcose',quality:'default',randomize:true,animate:true,
        animationDuration:800,fit:false,idealEdgeLength:125}).run();
    });
  }
  function renderDirectGraph(){
    let restored=null;
    if(activeProjection!=='graph'){
      restored=replaceProjection(nativeGraphElements,'graph');
      if(restored)requestAnimationFrame(()=>{
        if(!cy.destroyed()&&modelView==='graph'){cy.resize();cy.zoom(restored.zoom);cy.pan(restored.pan);}
      });
      else requestAnimationFrame(()=>{if(!cy.destroyed()&&modelView==='graph')exploration.layout();});
    }
    const extracted=atlasLandscape.extract(landscapeExtracts.get(current));
    const visible=new Set((extracted.byKind.occurrence||[]).map(o=>o.id));
    cy.batch(()=>cy.elements().forEach(ele=>{
      const active=ele.isEdge()?visible.has(ele.data('source'))&&visible.has(ele.data('target')):
        ele.id()===current||visible.has(ele.id());
      ele.toggleClass('e31-hidden',!active);
    }));
    applyInternalContext();
    if(!restored)syncViewport(30);
  }
  const hierarchyGuides={
    decomposition:'ASSEMBLY — Nested boxes represent direct containment declared in this example; arrows represent typed connections only. A subassembly part is not a direct part of its ancestor.',
    realization:'TRACEABILITY — Each arrow describes a reference (composition → occurrence → definition → authority). This path is neither a part assembly nor a decomposition order.',
    governance:'CONFIGURATION — Arrows indicate references among composition, baseline, federated references, and authorities. They do not mean “contains a part” or “is selected”.',
    connectivity:'CONNECTIONS — Arrows show explicit relationships between occurrences. Connections are not parts, and their existence does not establish operational compatibility.'
  };
  const hierarchyNames={decomposition:'Illustrative assembly (direct parts)',realization:'Definition references and authorities',governance:'Configuration references',connectivity:'Connections between occurrences'};
  for(const option of root.querySelector('#e34-global-hierarchy').options){
    if(hierarchyNames[option.value])option.textContent=hierarchyNames[option.value];
  }
  function updateHierarchyGuide(){
    const el=root.querySelector('#e34-view-explanation');
    el.textContent=modelView==='hierarchy'?(hierarchyGuides[hierarchyId]||''):
      modelView==='graph'?'DIRECT COMPOSITION — Native assembly and connections. Changing “Graph type” opens the corresponding typed graph without modifying this composition.':
      'Structure and relationship views follow the selected graph type.';
    root.querySelector('#e34-graph-coverage').hidden=modelView!=='hierarchy';
    const graphTab=root.querySelector('[data-model-view="hierarchy"]');
    graphTab.textContent=hierarchyId==='decomposition'?'Recursive composition and connections':'Typed graph: '+(hierarchyNames[hierarchyId]||hierarchyId);
  }
  function changeHierarchy(){
    root.querySelector('#e34-global-hierarchy').value=hierarchyId;
    root.querySelector('#e34-global-depth').value=String(hierarchyDepth);
    renderConcrete();
  }
  root.querySelector('#e34-global-hierarchy').addEventListener('change',e=>{
    hierarchyId=e.target.value;
    // A graph type is a request to see that projection: never silently redraw the unrelated direct composition.
    if(modelView==='graph')modelView='hierarchy';
    changeHierarchy();
  });
  root.querySelector('#e34-global-depth').addEventListener('change',e=>{
    hierarchyDepth=Number(e.target.value);
    if(modelView==='graph')modelView='hierarchy';
    changeHierarchy();
  });
  root.querySelector('#e34-global-expand').addEventListener('click',()=>{if(modelView==='hierarchy'&&activeProjection==='hierarchy'){exploration.execute('expand','all');return;}folded().clear();changeHierarchy();});
  root.querySelector('#e34-global-collapse').addEventListener('click',()=>{if(modelView==='hierarchy'&&activeProjection==='hierarchy'){exploration.execute('collapse','all');return;}const p=hierarchyProjection(model,current,hierarchyId,hierarchyDepth);for(const id of foldableProjection(p).foldable)folded().add(id);changeHierarchy();});
  root.querySelector('#e34-undo').addEventListener('click',()=>modelView==='hierarchy'&&exploration.undo());
  root.querySelector('#e34-redo').addEventListener('click',()=>modelView==='hierarchy'&&exploration.redo());

  let activeDomainId=null;
  function modelButton(label,kind,id){return `<button type="button" data-model-kind="${kind}" data-model-id="${esc(id)}">${esc(label)}</button>`;}
  function renderConcrete(){
    updateHierarchyGuide();
    const v=concreteView(model,current);
    const issues=concreteConsistency(model,current);
    graphPane.hidden=!(modelView==='graph'||modelView==='hierarchy');concretePane.hidden=modelView==='graph'||modelView==='hierarchy';
    root.querySelectorAll('[data-model-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modelView===modelView)));
    if(modelView==='graph') {renderDirectGraph();return;}
    if(modelView==='hierarchy'){renderHierarchyGraph();return;}
    const summary=`<p><strong>${esc(v.composition.name)}</strong> · <code>${esc(v.composition.id)}</code> · revision ${esc(v.composition.revision)}</p>`;
    if(modelView==='structure') {
      const projection=hierarchyProjection(model,current,hierarchyId,hierarchyDepth);
      const chooser='<div class="e34-hierarchy-tools"><label>Hierarchy <select id="e34-hierarchy">'+HIERARCHIES.map(h=>'<option value="'+esc(h.id)+'"'+(h.id===hierarchyId?' selected':'')+'>'+esc(h.title)+'</option>').join('')+'</select></label><label>Depth <select id="e34-depth">'+[0,1,2,3,4,5,6,7,8].map(d=>'<option value="'+d+'"'+(d===hierarchyDepth?' selected':'')+'>'+d+'</option>').join('')+'</select></label></div>';
      const notes='<p class="e32-note">Navigation derived only from declared source fields, not from a domain part-of decomposition. Hidden references remain in the model.</p>';
      const display=foldableProjection(projection,folded());
      const visibleNodes='<h3>Resources ('+display.nodes.length+' / '+projection.nodes.length+')</h3>'+list(display.nodes,n=>'<li class="e34-tree-row" style="--e34-indent:'+Math.min(n.depth,5)+'">'+(display.foldable.has(n.id)?'<button type="button" class="e34-fold" data-fold-id="'+esc(n.id)+'" aria-expanded="'+String(!folded().has(n.id))+'" aria-label="'+(folded().has(n.id)?'Expand':'Collapse')+' '+esc(n.label)+'">'+(folded().has(n.id)?'+':'−')+'</button>':'<span class="e34-fold-spacer"></span>')+' <span class="e34-kind">'+esc(n.kind)+'</span> '+modelButton(n.label,n.kind==='occurrence'?'occ':n.kind==='federated-reference'?'ref':n.kind==='configuration'?'baseline':'resource',n.resourceId)+' <code>'+esc(n.resourceId)+'</code></li>');
      const visibleLinks='<h3>Visible relationships and evidence ('+display.links.length+')</h3>'+list(display.links,e=>'<li><code>'+esc(e.from)+'</code> → <code>'+esc(e.to)+'</code> · '+esc(e.type)+' <small>['+esc(e.evidence.field)+' ; '+esc(e.evidence.sourceId)+']</small></li>');
      concretePane.innerHTML=summary+chooser+notes+'<div class="e34-fold-tools"><button type="button" id="e34-expand-all">Expand all</button><button type="button" id="e34-collapse-all">Collapse all</button><span>'+display.hiddenCount+' resource(s) hidden by folding</span></div>'+visibleNodes+visibleLinks+'<p class="e32-note">'+projection.excluded.length+' resources excluded by depth only. +/- operations change the view only.</p>';
      concretePane.querySelectorAll('[data-fold-id]').forEach(button=>button.addEventListener('click',()=>{const group=folded(),id=button.dataset.foldId;group.has(id)?group.delete(id):group.add(id);renderConcrete();}));
      concretePane.querySelector('#e34-expand-all').addEventListener('click',()=>{folded().clear();renderConcrete();});
      concretePane.querySelector('#e34-collapse-all').addEventListener('click',()=>{const group=folded();for(const id of display.foldable)group.add(id);renderConcrete();});
      concretePane.querySelector('#e34-hierarchy').addEventListener('change',event=>{hierarchyId=event.target.value;changeHierarchy();});
      concretePane.querySelector('#e34-depth').addEventListener('change',event=>{hierarchyDepth=Number(event.target.value);changeHierarchy();});
    }
    else if(modelView==='relations') {const p=foldableProjection(hierarchyProjection(model,current,hierarchyId,hierarchyDepth),folded());concretePane.innerHTML=summary+'<h3>Projected relationships ('+p.links.length+')</h3>'+list(p.links,e=>`<li><code>${esc(e.from)}</code> → <code>${esc(e.to)}</code> · ${esc(e.type)} · ${esc(e.evidence.field)} (${esc(e.evidence.sourceId)})</li>`);}
    else {const projection=hierarchyProjection(model,current,hierarchyId,hierarchyDepth);const display=foldableProjection(projection,folded());concretePane.innerHTML=summary+'<h3>Navigation projection: resources and evidence</h3><p>The native model remains distinct and unchanged; the nodes below are a projection.</p><pre><code>'+esc(JSON.stringify({hierarchyId,hierarchyDepth,nodes:display.nodes,links:display.links,excluded:projection.excluded},null,2))+'</code></pre>';}
    if(issues.length) concretePane.innerHTML+='<p>Inconsistencies: '+esc(issues.join('; '))+'</p>';
    concretePane.querySelectorAll('[data-model-id]').forEach(b=>b.addEventListener('click',()=>{
      const {modelKind,modelId}=b.dataset;
      if(modelKind==='occ')showOccurrence(modelId);
      else if(modelKind==='connection')showConnection(modelId);
      else if(modelKind==='baseline')renderBaseline(modelId);
      else if(modelKind==='ref')showReference(modelId);
      else if(modelKind==='resource')renderResource(modelId);
    }));
  }
  root.querySelectorAll('[data-model-view]').forEach(b=>b.addEventListener('click',()=>{modelView=b.dataset.modelView;renderConcrete();}));
  let resizeActive=false;
  const clampWidth=value=>Math.round(Math.max(260,Math.min(900,Math.min(workspace.clientWidth*.75,value))));
  splitter.addEventListener('pointerdown',event=>{
    if(inspectorState.collapsed)return;
    event.preventDefault();
    resizeActive=true;
    splitter.setPointerCapture(event.pointerId);
    splitter.classList.add('is-dragging');
  });
  splitter.addEventListener('pointermove',event=>{
    if(!resizeActive)return;
    const right=workspace.getBoundingClientRect().right;
    inspectorPixels=clampWidth(right-event.clientX);
    workspace.style.setProperty('--e32-inspector-width',inspectorPixels+'px');
    panelWidth.textContent='Width: '+inspectorPixels+' px';
    splitter.setAttribute('aria-valuenow',String(inspectorPixels));
    cy.resize();
  });
  const endResize=()=>{if(!resizeActive)return;resizeActive=false;splitter.classList.remove('is-dragging');cy.resize();};
  splitter.addEventListener('pointerup',endResize);
  splitter.addEventListener('pointercancel',endResize);
  splitter.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();
    inspectorPixels=clampWidth(inspectorPixels+(event.key==='ArrowLeft'?24:-24));
    updateInspectorLayout();
  });
  panelToggle.addEventListener('click',()=>{ inspectorState.autoReveal=false; panelAuto.checked=false; toggleInspector(); });
  panelWidth.addEventListener('click',()=>{ inspectorPixels=inspectorPixels===320?420:inspectorPixels===420?520:320;updateInspectorLayout(); });
  panelAuto.addEventListener('change',()=>{inspectorState.autoReveal=panelAuto.checked; if(!inspectorState.autoReveal && inspectorState.revealed){inspectorState.revealed=false;} updateInspectorLayout();});
  panelHandle.addEventListener('click',openInspector);
  edgeHotzone.addEventListener('mouseenter',()=>{if(inspectorState.autoReveal)revealInspector();});
  edgeHotzone.addEventListener('click',revealInspector);
  edgeHotzone.addEventListener('focusin',revealInspector);
  inspector.addEventListener('mouseenter',cancelRevealHide);
  inspector.addEventListener('mouseleave',scheduleRevealHide);
  workspace.addEventListener('mouseleave',scheduleRevealHide);
  let traceReturn=null;
  const traceButton=(kind,id,label=id)=>`<button type="button" data-trace-kind="${esc(kind)}" data-trace-id="${esc(id)}">${esc(label)}</button>`;
  function showTrace(kind,id){
    if(kind==='occurrence'){showOccurrence(id);return;}
    if(kind==='baseline'){renderBaseline(id);return;}
    if(kind==='graph'){
      const node=cy.getElementById(id);
      if(node.length){showSelectedGraphElement(node);return;}
      inspector.innerHTML=`<p>The node <code>${esc(id)}</code> is not present in this perspective. Switch to Recursive composition to inspect it.</p>`;
      return;
    }
    const node=traceNavigation.resolve(kind,id,activeBaselineId,traceReturn?.occurrence||null);
    if(!node){inspector.innerHTML=`<p>Unknown reference: <code>${esc(id)}</code></p>`;return;}
    const attrs=Object.entries(node.record).filter(([key])=>key!=='references');
    inspector.innerHTML=`<p class="e32-eyebrow">Semantic reference · ${esc(kind)}</p><h3>${esc(id)}</h3>
      <p>${traceReturn?traceButton('return',traceReturn.id,'Return to original element'):''}</p>
      <dl>${attrs.map(([key,value])=>`<dt>${esc(key)}</dt><dd>${esc(typeof value==='object'?JSON.stringify(value):value)}</dd>`).join('')}</dl>
      <h4>Forward and reverse references</h4>${list(node.references,r=>`<li>${traceButton(r.kind,r.id)}</li>`)}
      <p class="e32-note">Evidence references are declared; their contents and authority are not automatically verified.</p>`;
    actions();
  }
  function traceActions(){
    inspector.querySelectorAll('[data-trace-kind]').forEach(b=>b.addEventListener('click',()=>{
      const kind=b.dataset.traceKind,id=b.dataset.traceId;
      if(kind==='return'){
        const origin=traceReturn;traceReturn=null;
        if(origin?.kind==='graph')showTrace('graph',origin.id);
        else if(origin?.kind==='occurrence')showOccurrence(origin.id);
        return;
      }
      if(!traceReturn)traceReturn={kind:selectedGraphId?'graph':'occurrence',id:selectedGraphId||activeDomainId,occurrence:activeDomainId};
      showTrace(kind,id);
    }));
  }
  const actions = () => {
    inspector.querySelectorAll('[data-baseline]').forEach(b=>b.addEventListener('click',()=>renderBaseline(b.dataset.baseline)));
    inspector.querySelectorAll('[data-occ]').forEach(b=>b.addEventListener('click',()=>showOccurrence(b.dataset.occ)));
    inspector.querySelectorAll('[data-ref]').forEach(b=>b.addEventListener('click',()=>showReference(b.dataset.ref)));
    inspector.querySelectorAll('[data-overview]').forEach(b=>b.addEventListener('click',()=>renderComposition(current)));
    traceActions();
  };
  const selectGraph = id=>{selectedGraphId=id;activeDomainId=id;cy.elements().removeClass('e32-active');const node=cy.getElementById(id);if(node.length){node.addClass('e32-active');cy.animate({center:{eles:node},duration:200});}};
  function renderResource(id){
    const entry=atlasLandscape.entities.get(id);
    if(!entry)return;
    inspector.innerHTML='<p class="e32-eyebrow">Landscape resource</p><h3>'+esc(id)+'</h3><dl><dt>Type</dt><dd>'+esc(entry.kind)+'</dd><dt>Declared native data</dt><dd><pre>'+esc(JSON.stringify(entry.record,null,2))+'</pre></dd></dl><p class="e32-note">Read-only inspection; the hierarchy view does not create domain relationships.</p>';
  }
  const internalSelectionText=(result)=>{
    const names={'selected-illustrative':'Declared illustrative selection','absent':'No internal selection declared','ambiguous':'Ambiguous competing selections','incompatible':'Incompatible selection'};
    return `<strong>${esc(names[result.status]||result.status)}</strong> — ${esc(result.reason)}`+
      (result.selection?`<dl><dt>Selected internal definition</dt><dd><code>${esc(result.selection.internalDefinition)}</code></dd>
      <dt>Revision</dt><dd>${esc(result.selection.revision??'Not specified')}</dd>
      <dt>Authority</dt><dd>${esc(result.selection.authority)}</dd>
      <dt>Provenance</dt><dd><code>${esc(result.selection.evidence)}</code></dd>
      <dt>Verification</dt><dd>${esc(result.selection.verification)}</dd></dl>`:'');
  };
  function internalSelectionSummary(occurrenceId){
    const baselines=registry.byOccurrence(occurrenceId);
    return '<h4>Internal composition selections by baseline</h4>'+`<p>Active baseline: <code>${esc(activeBaselineId||'none')}</code></p>`+
      list(baselines,b=>`<li><button type="button" data-baseline="${esc(b.id)}">${esc(b.id)}</button> : ${internalSelectionText(internalSelections.resolve(b.id,occurrenceId))}</li>`);
  }
  function admissibilityDetails(occurrenceId){
    const baseline=activeBaselineId;
    if(!baseline)return '<h4>Candidate realizations</h4><p>No baseline active.</p>';
    const result=admissibility.resolve(baseline,occurrenceId);
    const trace=decisionTrace.resolve(baseline,occurrenceId);
    const labels={'admissible-declared':'Declared constraints satisfied (unverified)','incompatible':'Violated constraints','indeterminate':'Insufficient evidence or data'};
    return `<h4>Candidate realizations and contextual admissibility</h4>
      <p>Baseline: <code>${esc(baseline)}</code> · Selection: <strong>${esc(result.selectionStatus)}</strong></p>
      ${result.candidates.length?list(result.candidates,entry=>`<li>
        ${traceButton('realization',entry.candidate.realizationDefinition,entry.candidate.id)} — <strong>${esc(labels[entry.status]||entry.status)}</strong>
        ${entry.selected?'<strong> · SELECTED REALIZATION</strong>':' · Not selected'}
        <dl><dt>Realization definition</dt><dd><code>${esc(entry.candidate.realizationDefinition)}</code></dd>
        <dt>Constraints</dt><dd>${esc(entry.candidate.constraints?.map(x=>x.kind).join(', ')||'None declared')}</dd>
        <dt>Reasons</dt><dd>${esc(entry.reasons.join('; ')||'No violations among declared constraints')}</dd>
        <dt>Authority</dt><dd>${esc(entry.candidate.authority)}</dd>
        <dt>Justification</dt><dd><code>${esc(entry.candidate.evidence)}</code></dd>
        <dt>Verification</dt><dd>${esc(entry.verification)}</dd>
        <dt>Explained decision</dt><dd><ul>${(trace.candidates.find(x=>x.candidateId===entry.candidate.id)?.checks||[]).map(check=>`<li><code>${esc(check.kind)}</code> : <strong>${esc(check.outcome)}</strong> — expected: <code>${esc(JSON.stringify(check.expected))}</code> ; observed: <code>${esc(JSON.stringify(check.actual))}</code> ; source: ${check.evidence?traceButton('evidence',check.evidence):'not declared'} ; authority: ${esc(check.authority||'not declared')}</li>`).join('')}</ul></dd></dl></li>`):'<p>No candidate realization declared.</p>'}
      <p class="e32-note">Declared admissibility demonstrates neither MCP conformance nor operational suitability. No combinatorial configuration is generated.</p>`;
  }
  function configurationItemDetails(occurrenceId){
    const items=configItems.forOccurrence(occurrenceId);
    const baseline=activeBaselineId;
    const result=baseline?configItems.resolve(baseline,occurrenceId):{status:'absent'};
    const rows=items.map(item=>`<li>${traceButton('item',item.id)} · ${esc(item.verification)} · ${esc(item.authority)}</li>`).join('');
    const realization=result.realization;
    return `<h4>Configuration item and realization</h4>
      <p>Active baseline: <code>${esc(baseline||'none')}</code> ; selection: <strong>${esc(result.status)}</strong></p>
      <p>Explicitly declared items: ${items.length}</p>${items.length?`<ul>${rows}</ul>`:''}
      ${realization?`<dl><dt>Realization definition</dt><dd>${traceButton('realization',realization.id)}</dd>
      <dt>Composition definition</dt><dd><code>${esc(realization.internalDefinition)}</code></dd>
      <dt>Assembly</dt><dd><code>${esc(realization.assemblyDefinition)}</code></dd>
      <dt>Revision</dt><dd>${esc(realization.revision??'Not specified')}</dd>
      <dt>Justification</dt><dd><code>${esc(result.choice.evidence)}</code></dd>
      <dt>Verification</dt><dd>${esc(result.choice.verification)}</dd></dl>`:''}
      <p class="e32-note">A configuration item is not automatically created for every part. An illustrative realization does not establish native conformance.</p>`;
  }
  function directPartDetails(nodeId){
    const assembly=reifiedParts.byRoot.get(nodeId);
    const member=reifiedParts.byGraph.get(nodeId);
    let content='';
    if(assembly){
      content+=`<h4>Assembly definition and declared direct parts</h4><dl>
        <dt>Assembly definition</dt><dd>${traceButton('assembly',assembly.id)}</dd>
        <dt>Source</dt><dd>${esc(assembly.evidence)}</dd></dl>`;
      const direct=reifiedParts.directParts(assembly.id);
      content+=list(direct,({part,usage})=>`<li><button type="button" data-part-node="${esc(usage.graphNode)}">${esc(part.label)}</button>
        <dl><dt>PartDefinition</dt><dd>${traceButton('part',part.id)}</dd>
        <dt>Role in this assembly</dt><dd>${esc(part.role)}</dd>
        <dt>Direct usage</dt><dd>${traceButton('usage',usage.id)}</dd>
        <dt>Source assertion</dt><dd><code>${esc(usage.assertionSource)}</code></dd>
        <dt>Configuration item</dt><dd>${esc(part.configurationItem||'Not declared')}</dd>
        <dt>Realization definition</dt><dd>${esc(part.candidateItemDefinition||'Not declared')}</dd></dl></li>`);
    }
    if(member){
      content+=`<h4>Reified part in its immediate assembly</h4><dl>
        <dt>Part definition</dt><dd>${traceButton('part',member.part.id)}</dd>
        <dt>Role</dt><dd>${esc(member.part.role)}</dd>
        <dt>Assembly defining this part</dt><dd><button type="button" data-part-node="${esc(member.usage.parentGraphNode)}">${esc(member.usage.parentGraphNode)}</button></dd>
        <dt>Direct usage</dt><dd>${traceButton('usage',member.usage.id)}</dd>
        <dt>Configuration item</dt><dd>${esc(member.part.configurationItem||'Not declared')}</dd>
        <dt>Illustrative evidence</dt><dd><code>${esc(member.usage.evidence)}</code></dd></dl>`;
    }
    return content;
  }
  function renderIllustrative(data){
    const id=data.resourceId || data.id;
    const evidence=data.containmentEvidence || {};
    const parent=data.parent || null;
    cy.elements().removeClass('e32-active');
    const element=cy.getElementById(data.id); if(element.length)element.addClass('e32-active');
    const internal=internalRegistry.getNode(id);
    const activeInternal=internal&&activeBaselineId?internalSelections.resolve(activeBaselineId,internal.definition.parentOccurrence):null;
    const activeInternalDetail=activeInternal?`<h4>State in active baseline: <code>${esc(activeBaselineId)}</code></h4><p>${internalSelectionText(activeInternal)}</p>`:'';
    const internalDetails=internal?`<h4>Declared internal composition (example)</h4><dl>
      <dt>Definition</dt><dd><code>${esc(internal.definition.id)}</code></dd>
      <dt>Role in composition</dt><dd>${esc(internal.role)}</dd>
      <dt>Owning occurrence</dt><dd><button type="button" data-occ="${esc(internal.definition.parentOccurrence)}">${esc(internal.definition.parentOccurrence)}</button></dd>
      <dt>Example authority</dt><dd>${esc(internal.definition.authority)}</dd>
      <dt>Source</dt><dd><code>${esc(internal.definition.source)}</code></dd>
      <dt>Internal version</dt><dd>Not specified</dd>
      <dt>Internal configuration</dt><dd>Not selected</dd>
      <dt>Historical illustrative projection</dt><dd>Constituent elements are described below using their part definitions and direct usages.</dd>
      <dt>Internal connections</dt><dd>None declared</dd>
      <dt>Verification</dt><dd>${esc(internal.definition.verification)}</dd></dl>`:'';
    inspector.innerHTML=`<p class="e32-eyebrow">Illustrative grouping</p>
      <h3>${esc(data.label||id)}</h3><dl>
      <dt>Identifier</dt><dd><code>${esc(id)}</code></dd>
      <dt>Kind</dt><dd>${esc(data.kind||'illustrative-group')}</dd>
      <dt>Parent in this projection</dt><dd>${parent?`<code>${esc(parent)}</code>`:'None'}</dd>
      <dt>Projected relationship</dt><dd>${esc(data.containmentRelation||'Not specified')}</dd>
      <dt>Source field</dt><dd>${esc(evidence.field||'Not specified')}</dd>
      <dt>Source assertion</dt><dd>${esc(evidence.sourceId||'Not specified')}</dd>
      <dt>Evidence status</dt><dd>${esc(data.evidenceStatus||evidence.status||'Unverified')}</dd></dl>
      ${activeInternalDetail}${internalDetails}${internal?.definition?.parentOccurrence?configurationItemDetails(internal.definition.parentOccurrence)+admissibilityDetails(internal.definition.parentOccurrence):''}${directPartDetails(id)}${internal?internalSelectionSummary(internal.definition.parentOccurrence):''}<p class="e32-note">Illustrative, non-normative decomposition. Native internal selections, their versions, and their conformance are not established.</p>`;
    actions();
    traceActions();
    inspector.querySelectorAll('[data-part-node]').forEach(b=>b.addEventListener('click',()=>{const n=cy.getElementById(b.dataset.partNode);if(n.length)showSelectedGraphElement(n);}));
  }
  function showSelectedGraphElement(target){
    selectedGraphId=target.id();
    const data=target.data();
    const resolved=classifyGraphSelection(data,registry);
    if(target.isEdge()) {
      if(resolved.kind==='connection') { showConnection(resolved.id);return; }
      inspector.innerHTML=`<p class="e32-eyebrow">Typed relationship</p><h3>${esc(data.label||data.type||target.id())}</h3>
        <dl><dt>Identifier</dt><dd><code>${esc(target.id())}</code></dd>
        <dt>Source</dt><dd><code>${esc(data.source)}</code></dd><dt>Target</dt><dd><code>${esc(data.target)}</code></dd>
        <dt>Source field</dt><dd>${esc(data.field)}</dd><dt>Evidence identifier</dt><dd>${esc(data.sourceId)}</dd></dl>`;
      return;
    }
    if(resolved.kind==='occurrence'){showOccurrence(resolved.id);return;}
    if(resolved.kind==='composition'){renderComposition(resolved.id);return;}
    if(resolved.kind==='configuration'){renderBaseline(resolved.id);return;}
    if(resolved.kind==='reference'){showReference(resolved.id);return;}
    if(resolved.kind==='illustrative'){renderIllustrative(data);return;}
    if(atlasLandscape.entities.has(resolved.id)){renderResource(resolved.id);return;}
    inspector.innerHTML=`<p class="e32-eyebrow">Graph element</p><h3>${esc(data.label||resolved.id)}</h3>
      <p>Identifier: <code>${esc(resolved.id)}</code></p><pre>${esc(JSON.stringify(data,null,2))}</pre>
      <p class="e32-note">No native record associated with this identifier.</p>`;
  }
  function renderComposition(id){
    const extracted=atlasLandscape.extract(landscapeExtracts.get(id));
    const composition=registry.maps.compositions.get(id), linked=registry.byComposition(id);
    inspector.innerHTML=`<p class="e32-eyebrow">Composition</p><h3>${esc(composition?.name||id)}</h3><p>Identity: <code>${esc(id)}</code> · revision ${esc(composition?.revision)}</p><h4>Explicit landscape extraction</h4><p><code>${esc(extracted.view.id)}</code> · ${esc(extracted.count)} resources · ${esc(extracted.view.projection)}</p><details><summary>View criteria and coverage</summary><pre>${esc(JSON.stringify({selection:extracted.view.selection,layoutProfile:extracted.view.layoutProfile,lossPolicy:extracted.view.lossPolicy,omitted:extracted.omitted},null,2))}</pre></details><h4>Applicable configurations</h4>${list(linked,x=>`<li><button type="button" data-baseline="${esc(x.id)}">${esc(x.id)} — ${esc(statusText[x.resolution.status])}</button></li>`)}<p class="e32-note">The Cytoscape parent expresses graphical containment, not an implicit domain relationship.</p>`;
    actions();
  }
  function renderBaseline(id){
    const record=registry.records.get(id);if(!record)return;baselineId=id;
    if(record.composition===current && activeBaselineId!==id){activeBaselineId=id;baselineChooser.value=id;applyInternalContext();}
    const r=record.resolution;
    inspector.innerHTML=`<p class="e32-eyebrow">Federated configuration</p><h3>${esc(id)}</h3><p><button data-overview="true">All configurations for the composition</button></p><dl><dt>Composition</dt><dd>${esc(record.composition)}</dd><dt>Selection context</dt><dd><code>${esc(JSON.stringify(record.context))}</code></dd><dt>Specification revision</dt><dd>${esc(record.revision)}</dd><dt>Domain validity</dt><dd>${esc(record.validFrom)} → ${esc(record.validUntil)}</dd><dt>Recorded assertion</dt><dd>${esc(record.assertedAt)}</dd><dt>Constraint status</dt><dd><strong>${esc(r.status)} — ${esc(statusText[r.status])}</strong></dd></dl><p>${esc(r.resolutionScope)}</p><h4>Requirements</h4>${list(record.requirementIds,x=>`<li><code>${esc(x)}</code></li>`)}${r.errors.length?`<h4>Violations</h4>${list(r.errors,x=>`<li>${esc(x)}</li>`)}`:''}${r.unknown.length?`<h4>Unknowns</h4>${list(r.unknown,x=>`<li>${esc(x)}</li>`)}`:''}<h4>Selections and occurrences</h4>${list(record.selections,x=>`<li><button type="button" data-occ="${esc(x.occurrence.id)}">${esc(x.definition?.name)} — ${esc(x.occurrence.role)}</button> <code>${esc(x.component?.id)}</code></li>`)}<h4>Federated resources</h4>${list(record.references,x=>`<li><button type="button" data-ref="${esc(x.id)}">${esc(x.id)}</button> · ${esc(x.authority)} · ${esc(x.granularity)} · ${x.authority==='atlas-git'?link(x.nativeLocator):esc(x.nativeLocator)} · ${x.pinned?'pinned':'moving / unpinned'}</li>`)}<h4>Justifications and limitations</h4>${list(record.sourceRecords,x=>`<li><a href="${esc(x.canonicalUrl)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a> · ${esc(x.version||'version not pinned')} · ${esc(x.verification)}</li>`)}<p class="e32-note">Fictitious components. Unpinned documentary references. No deployed baseline or evidence of operational interoperability.</p><h4>Internal composition selections</h4><ul>${list(record.selections,x=>`<li><button type="button" data-occ="${esc(x.occurrence.id)}">${esc(x.occurrence.id)}</button> : ${internalSelectionText(internalSelections.resolve(id,x.occurrence.id))}</li>`)}</ul>`;
    actions();
  }
  function showOccurrence(id){
    const occurrence=registry.maps.occurrences.get(id);if(!occurrence)return;
    const definition=registry.maps.definitions.get(occurrence.definition);
    const related=registry.byOccurrence(id);selectGraph(id);
    const contextCards=related.map(b=>`<li><button type="button" data-baseline="${esc(b.id)}">${esc(b.id)}</button> — <strong>${esc(b.resolution.status)}</strong><dl><dt>Declared context</dt><dd>${Object.entries(b.context||{}).map(([key,value])=>`${esc(key)} : ${esc(value==='unspecified'?'unspecified (not an identified platform)':value)}`).join('; ')||'not specified'}</dd><dt>Specification revision</dt><dd>${esc(b.revision)}</dd><dt>Native selection</dt><dd>${esc(occurrence.versionSelection)} (${esc(definition?.authority||'authority not declared')})</dd><dt>Reproducibility status</dt><dd>Fictitious component: illustrative version identifier, without verified pinned native artifact</dd></dl></li>`).join('');
    const internalDefs=internalRegistry.byOccurrence(id);
    const internalSummary=internalDefs.length?'<h4>Internal compositions (examples)</h4>'+list(internalDefs,d=>`<li><button type="button" data-internal="${esc(d.rootNode)}">${esc(d.rootNode)}</button> · ${esc(d.verification)} · internal version not specified</li>`):'';
    inspector.innerHTML=`<p class="e32-eyebrow">Configured occurrence</p><h3>${esc(definition?.name||id)}</h3><dl><dt>Stable occurrence</dt><dd><code>${esc(id)}</code></dd><dt>Role</dt><dd>${esc(occurrence.role)}</dd><dt>Separate definition</dt><dd><code>${esc(occurrence.definition)}</code></dd><dt>Native selection</dt><dd><code>${esc(occurrence.versionSelection)}</code></dd><dt>Authority</dt><dd>${esc(definition?.authority)}</dd></dl><h4>Baselines, contexts, and selections</h4><ul>${contextCards}</ul>${internalSummary}${internalSelectionSummary(id)}${configurationItemDetails(id)}${admissibilityDetails(id)}<p class="e32-note">The graph container does not constitute a native semantic decomposition.</p>`;
    actions();
    inspector.querySelectorAll('[data-internal]').forEach(b=>b.addEventListener('click',()=>{
      const id=b.dataset.internal;
      const node=cy.getElementById(id);
      if(node.length){openInspector();showSelectedGraphElement(node);}
      else inspector.insertAdjacentHTML('beforeend',`<p class="e32-note">Open the recursive perspective to select ${esc(id)}.</p>`);
    }));
  }
  function showReference(id){
    const ref=registry.maps.federatedReferences.get(id);if(!ref)return;
    const linked=registry.byReference(id);
    inspector.innerHTML=`<p class="e32-eyebrow">Federated resource</p><h3>${esc(id)}</h3><dl><dt>Native authority</dt><dd>${esc(ref.authority)}</dd><dt>Native locator</dt><dd>${ref.authority==='atlas-git'?link(ref.nativeLocator):esc(ref.nativeLocator)}</dd><dt>Granularity</dt><dd>${esc(ref.granularity)}</dd><dt>Selection</dt><dd>${esc(ref.selection)}</dd><dt>Pinning status</dt><dd>${ref.pinned?'pinned':'moving / unpinned'}</dd><dt>Declared observation date</dt><dd>${esc(ref.observation)}</dd></dl><h4>Linked baselines (reverse navigation)</h4>${list(linked,x=>`<li><button type="button" data-baseline="${esc(x.id)}">${esc(x.id)} · ${esc(x.resolution.status)}</button></li>`)}<p class="e32-note">An external locator is not necessarily accessible from the published Atlas. An unpinned reference does not support exact reproducibility.</p>`;
    actions();
  }
  function showConnection(id){
    const rel=registry.maps.connections.get(id);if(!rel)return;selectGraph(id);
    inspector.innerHTML=`<p class="e32-eyebrow">Explicit relationship</p><h3>${esc(rel.kind)}</h3><p>Identifier: <code>${esc(id)}</code></p><p>Source: <button data-occ="${esc(rel.from)}">${esc(rel.from)}</button></p><p>Target: <button data-occ="${esc(rel.to)}">${esc(rel.to)}</button></p><p>Source: ${esc(rel.semanticSource)} · Verification: ${esc(rel.verification)}</p>`;actions();
  }
  function show(composition){
    if(current!==composition){snapshotProjection();}
    if(activeProjection==='graph' && ec.isExpandable(cy.getElementById(current)))ec.expand(cy.getElementById(current));
    current=composition;activePerspectiveKey=perspectiveKey();baselineId=null;refreshBaselineChooser();const extracted=atlasLandscape.extract(landscapeExtracts.get(composition));
    const visible=new Set((extracted.byKind.occurrence||[]).map(o=>o.id));
    if(activeProjection==='graph')cy.batch(()=>cy.elements().forEach(ele=>{const active=ele.isEdge()?visible.has(ele.data('source'))&&visible.has(ele.data('target')):ele.id()===composition||visible.has(ele.id());ele.toggleClass('e31-hidden',!active);}));
    cy.elements().removeClass('e32-active');if(modelView==='graph')restructure();renderComposition(composition);renderConcrete();
  }
  cy.on('tap','node,edge',event=>{
    openInspector();
    const element=event.target;
    const data=element.data();
    if(activeProjection==='hierarchy' && element.isNode() &&
       hierarchyId!=='decomposition' && data.foldable){
      const state=folded();
      state.has(element.id())?state.delete(element.id()):state.add(element.id());
      // Render the fiche from the stable event payload before replacing the projection.
      showSelectedGraphElement(element);
      renderHierarchyGraph();
      return;
    }
    showSelectedGraphElement(element);
  });
  root.querySelector('#e31-case').addEventListener('change',e=>show(e.target.value));
  root.querySelector('#e31-fit').addEventListener('click',()=>{if(modelView==='hierarchy'){cy.resize();cy.fit(undefined,30);}else syncViewport(18);});
  root.querySelector('#e31-back').addEventListener('click',()=>baselineId?renderBaseline(baselineId):renderComposition(current));
  const params=new URLSearchParams(location.hash.split('?')[1]||'');
  const target=params.get('occ');
  const targetOccurrence=target&&registry.maps.occurrences.get(target);
  if(targetOccurrence){
    current=targetOccurrence.composition;root.querySelector('#e31-case').value=current;
  }
  const disposeVoyage=mountGuidedVoyage(root,{
    getContext:()=>({composition:current,baseline:activeBaselineId}),
    navigate:step=>{
      if(current!=='comp:reference'){
        root.querySelector('#e31-case').value='comp:reference';
        show('comp:reference');
      }
      if(step.hierarchy)hierarchyId=step.hierarchy;
      modelView=step.view;
      renderConcrete();
      if(activeBaselineId!=='baseline:reference'&&step.id==='configuration'){
        activeBaselineId='baseline:reference';
        baselineChooser.value=activeBaselineId;
        applyInternalContext();
      }
    },
    selectTarget:(id,step)=>{
      if(current!=='comp:reference'){
        root.querySelector('#e31-case').value='comp:reference';
        show('comp:reference');
      }
      if(modelView!==step.view){modelView=step.view;renderConcrete();}
      openInspector();
      if(registry.maps.occurrences.has(id)){showOccurrence(id);return;}
      if(registry.maps.connections.has(id)){showConnection(id);return;}
      const target=cy.getElementById(id);
      if(target.length)showSelectedGraphElement(target);
    }
  });
  updateInspectorLayout();
  refreshBaselineChooser();
  show(current);
  if(targetOccurrence)showOccurrence(target);
  else renderBaseline(registry.byComposition(current)[0]?.id);
  return ()=>{cancelRevealHide();disposeVoyage();disposeToolbar();cy.destroy();root.remove();};
}
