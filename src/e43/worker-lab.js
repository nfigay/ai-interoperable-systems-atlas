import './worker-lab.css';
import './source-inspector.css';
import {renderSourceInspector} from './source-inspector.js';
import {describeMessage} from './port-transport.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const components = {
  host: {title:'Atlas host · main thread',role:'Creates Workers and MessageChannel, controls the scenario, and displays observations. Not an autonomous agent.',source:'src/e43/worker-lab.js',api:'new Worker(), new MessageChannel(), postMessage()',atlas:'Architectural context: demonstration host; not an autonomous agent.'},
  client: {title:'MCP client · Worker A',role:'Instantiates the SDK Client and sends MCP requests to the server.',source:'src/e43/client-worker.mjs',api:'new Client(), connect(), listTools(), callTool()',atlas:'Related architecture element: MCP client (occ:ref-client). Relationship: proposed realization; not verified.'},
  transport: {title:'Transport · MessageChannel',role:'Two MessagePorts transferred to Workers. Instrumented bidirectional adapter; not a standardized MCP transport.',source:'src/e43/port-transport.mjs',api:'PortTransport.start(), send(), onmessage, close()',atlas:'Related architecture connection: client–server (conn:ref-cs). Relationship: interpretive correspondence; not the transport instance.'},
  server: {title:'MCP server · Worker B',role:'Instantiates McpServer, registers echo, and handles requests.',source:'src/e43/server-worker.mjs',api:'new McpServer(), registerTool(), connect()',atlas:'Related architecture element: MCP server (occ:ref-server). Relationship: proposed realization; not verified.'},
  echo: {title:'echo tool · Worker B',role:'JavaScript function actually executed in the server Worker; returns the input without an AI model.',source:'src/e43/server-worker.mjs',api:"registerTool('echo', ..., async ({text}) => ...)",atlas:'Server-provided capability implemented by this function; not an autonomous agent.'}
};
const phases=[
  {id:'create',label:'1 · Create and connect',explain:'Creates two Workers, transfers ports, and establishes the MCP connection.'},
  {id:'discover',label:'2 · Discover tools',explain:'The client requests tools/list; the server supplies the response.'},
  {id:'invoke',label:'3 · Call echo',explain:'The client sends tools/call; the server-side function executes.'},
];
const sources={tools:'https://modelcontextprotocol.io/specification/2025-11-25/server/tools',lifecycle:'https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle',sdk:'https://ts.sdk.modelcontextprotocol.io/v2/clients/connect'};
function relevantComponents(event){
  if(event.kind==='execution')return ['server','echo'];
  if(event.kind==='wire')return ['client','transport','server'];
  if(event.kind==='tools'||event.kind==='outcome')return ['client','server'];
  if(event.kind==='ready'||event.kind==='runtime')return [event.side==='client'?'client':'server'];
  if(event.kind==='failure')return [event.side==='client'?'client':event.side==='server'?'server':'host'];
  return ['host'];
}
export function mountWorkerLab(root){
  if(!root)return ()=>{};
  root.innerHTML=`<section class="atlas-worker-lab" aria-label="MCP architecture laboratory">
    <h3>Integrated demonstrator · architecture and execution</h3>
    <p><strong>Guide navigation ≠ execution.</strong> Previous/next guide section navigates documentation; only the operational commands below act on running components.</p>
    <p>Real MCP execution in <strong>two Web Workers within one browser</strong>, experimental MessagePort transport. No network transport, no LLM, no conformance assessment.</p>
    <div class="atlas-e47-workspace">
    <section class="atlas-e47-left" aria-label="Architecture and component details">
    <h4>Architecture &amp; live flow</h4>
    <div class="atlas-e44-boundary" aria-label="Browser boundary">
      <div class="atlas-e44-topology" aria-label="Components and dependencies">
        <button type="button" data-component="host" class="atlas-e44-component">Atlas host <small>main thread · UI orchestration</small><span data-state="host">Idle</span></button>
        <div class="atlas-e44-down" aria-hidden="true">↓ creates Workers and transfers ports ↓</div>
        <div class="atlas-e46-architecture" aria-label="Live MCP architecture with message flows">
          <button type="button" data-component="client" class="atlas-e44-component atlas-e46-client">Worker A <strong>MCP client</strong><small>SDK Client · requests</small><span data-state="client">Not created</span><span class="atlas-e410-compact" data-runtime-client>Awaiting observations</span></button>
          <div class="atlas-e46-link" aria-label="Instrumented MessagePort connection and currently selected message">
            <strong>MessagePort transport</strong>
            <svg viewBox="0 0 260 112" role="img" aria-label="Flow direction between the client and server">
              <path data-flow-arrow d="M14 63 H246" stroke="#0072c6" stroke-width="6" fill="none" />
              <circle data-flow-packet r="8" fill="#f3a01d" style="display:none" aria-hidden="true"><animateMotion data-flow-motion dur="1.7s" repeatCount="indefinite" path="M14 63 H246" /></circle>
              <path data-flow-tip d="M224 50 L246 63 L224 76" stroke="#0072c6" stroke-width="6" fill="none" />
              <text data-flow-method x="130" y="33" text-anchor="middle" fill="currentColor" font-size="15" font-weight="700">No message selected</text>
              <g data-flow-local style="display:none"><rect x="70" y="46" width="120" height="40" rx="8" stroke="#18804b" stroke-width="3" fill="none"/><text x="130" y="72" text-anchor="middle" fill="currentColor" font-size="15">echo execution</text></g>
            </svg>
            <span data-flow-counter>0 events</span>
            <small data-flow-caption>Start a session, then select a trace event.</small>
            <button type="button" data-component="transport" class="atlas-e44-component atlas-e46-transport">Inspect transport<small>src/e43/port-transport.mjs</small><span data-state="transport">Not created</span></button>
          </div>
          <button type="button" data-component="server" class="atlas-e44-component atlas-e46-server">Worker B <strong>MCP server</strong><small>SDK McpServer · tools</small><span data-state="server">Not created</span><span class="atlas-e410-compact" data-runtime-server>Awaiting observations</span></button>
        </div>
        <button type="button" data-component="echo" class="atlas-e44-component atlas-e44-echo">↳ echo <small>JavaScript function executed in Worker B</small><span data-state="echo">Not called</span></button>
      </div>
    </div>
    <p class="atlas-e410-caption">Worker boxes show application-reported state as of the selected event, not SDK private internals. Select a Worker for source and interface details.</p>
    <details class="atlas-e47-component-inspector"><summary>Component architecture &amp; implementation</summary>
      <p class="atlas-e44-hint">Select a component above to inspect its responsibility, interface, source file, and related architecture elements.</p>
      <article data-component-detail class="atlas-e44-detail" aria-live="polite"></article>
    </details>
    </section>
    <section class="atlas-e47-right" aria-label="Execution controls and observed events">
    <h4>Run the demonstration</h4>
    <details class="atlas-e47-phases"><summary>Execution phases and explanations</summary><ol class="atlas-e44-phases">${phases.map(p=>`<li><strong>${esc(p.label)}</strong><small>${esc(p.explain)}</small></li>`).join('')}</ol></details>
    <label>Text sent to echo <input data-worker-text maxlength="160" value="Hello Atlas"></label>
    <div class="atlas-worker-buttons" aria-label="Guided execution phases">
      <button type="button" data-worker-start>1 · Create and connect</button>
      <button type="button" data-worker-discover disabled>2 · Discover tools</button>
      <button type="button" data-worker-invoke disabled>3 · Invoke echo</button>
    </div>
    <div class="atlas-e49-evidence" aria-label="Session and evidence tools">
      <strong>Session &amp; evidence</strong>
      <button type="button" data-worker-export disabled>Export observations (JSON)</button>
      <button type="button" data-worker-reset disabled>New run</button>
      <small>Export is not a protocol execution phase.</small>
    </div>
    <p data-worker-status role="status">No session yet. No MCP request sent.</p>
    <h4>Observed sequence <small data-e47-count>0 events</small></h4>
    <p class="atlas-e47-compact-note">Select a message to replay its route on the architecture. Animation visualizes direction, not network latency.</p>
    <p class="atlas-e49-trace-guide">Observed events are grouped by execution phase. Expand a phase to inspect its messages, object transitions, and JSON evidence.</p>
    <div data-worker-trace class="atlas-e49-phase-groups"></div>
    <details class="atlas-e47-event-inspector" open><summary>Selected event · JSON and provenance</summary>
      <article data-worker-detail class="atlas-e44-detail" aria-live="polite"><p>Select an event to inspect its JSON message, components, and provenance.</p></article>
    </details>
    </section></div>
    <p class="atlas-e47-footnote">References: <a href="${sources.sdk}" target="_blank" rel="noopener noreferrer">Client SDK</a> · <a href="${sources.tools}" target="_blank" rel="noopener noreferrer">MCP tools</a>. Reference architecture elements are not identical to running instances.</p>
  </section>`;
  const q=sel=>root.querySelector(sel);
  const traces=[];const ready=new Set();
  let clientWorker,serverWorker,channel,disposed=false,busy=false,phase='idle',action='create',execution=0,session=0,hasDiscovered=false,hasInvoked=false;
  const phaseGroups=new Map();
  const state=(id,value)=>{const target=q(`[data-state="${id}"]`);if(target)target.textContent=value;};
  const status=value=>{if(!disposed)q('[data-worker-status]').textContent=value;};
  const setControls=()=>{
    q('[data-worker-start]').disabled=phase!=='idle';
    q('[data-worker-discover]').disabled=phase!=='connected'||busy||hasDiscovered;
    q('[data-worker-invoke]').disabled=phase!=='connected'||busy||!hasDiscovered||hasInvoked;
    q('[data-worker-export]').disabled=traces.length===0;
    q('[data-worker-reset]').disabled=phase==='idle'||busy;
  };
  function showComponent(id,event=null){
    const item=components[id];if(!item)return;
    for(const button of root.querySelectorAll('[data-component]'))button.setAttribute('aria-pressed',String(button.dataset.component===id));
    q('[data-component-detail]').innerHTML=`<h5>${esc(item.title)}</h5><p>${esc(item.role)}</p><dl><dt>Implementation file</dt><dd><code>${esc(item.source)}</code></dd><dt>API / interface</dt><dd><code>${esc(item.api)}</code></dd><dt>Architectural relationship</dt><dd>${esc(item.atlas)}</dd></dl><div data-source-inspector></div>`;
    renderSourceInspector(q('[data-source-inspector]'),item.source,event);
  }
  for(const button of root.querySelectorAll('[data-component]'))button.addEventListener('click',()=>showComponent(button.dataset.component));
  showComponent('host');
  function renderRuntime(index){
    // Historical snapshots: never project later Worker observations backward.
    const latest={client:null,server:null};
    for(let i=0;i<=index;i++){
      const entry=traces[i];
      if(entry.kind==='runtime' && (entry.side==='client'||entry.side==='server'))latest[entry.side]=entry;
    }
    for(const side of ['client','server']){
      const target=q(`[data-runtime-${side}]`),entry=latest[side];
      if(!entry){target.textContent='No state observed yet';continue;}
      const snapshot=entry.snapshot||{};
      const main=[
        ['Connection',snapshot.connection],
        ['Operation',snapshot.operation],
        ['Tools',side==='client'?snapshot.discoveredTools:snapshot.toolRegistered],
        ['Calls',snapshot.invocations]
      ].filter(([,value])=>value!==undefined && value!==null).slice(0,4);
      target.replaceChildren();
      const label=document.createElement('span');label.className='atlas-e410-state-title';label.textContent=entry.transition||'State observed';target.append(label);
      const dl=document.createElement('span');dl.className='atlas-e410-fields';
      for(const [key,value] of main){
        const field=document.createElement('span');field.className='atlas-e410-field';
        const name=document.createElement('b');name.textContent=key+': ';
        const v=document.createElement('span');v.textContent=Array.isArray(value)?(value.join(', ')||'none'):typeof value==='object'?JSON.stringify(value):String(value);
        field.append(name,v);dl.append(field);
      }
      target.append(dl);
      target.title=`Worker state reported at event ${traces.indexOf(entry)+1}. Select component for implementation information.`;
    }
  }
  function showFlow(event,index){
    const arrow=q('[data-flow-arrow]'),tip=q('[data-flow-tip]'),local=q('[data-flow-local]');
    const isWire=event.kind==='wire',isExecution=event.kind==='execution';
    const method=event.message?.method ?? (event.message?.result!==undefined?'JSON-RPC response':event.message?.error!==undefined?'JSON-RPC error':event.kind);
    arrow.style.display=isWire?'':'none';tip.style.display=isWire?'':'none';local.style.display='none';
    if(isWire){
      const fromClient=(event.side==='client'&&event.direction==='sent')||(event.side==='server'&&event.direction==='received');
      arrow.setAttribute('d',fromClient?'M14 63 H246':'M246 63 H14');
      tip.setAttribute('d',fromClient?'M224 50 L246 63 L224 76':'M36 50 L14 63 L36 76');
    }
    const packet=q('[data-flow-packet]'),motion=q('[data-flow-motion]');
    packet.style.display=isWire?'':'none';
    if(isWire){
      motion.setAttribute('path',arrow.getAttribute('d'));
      if(!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)motion.beginElement?.();
    }
    q('[data-flow-method]').textContent=isWire?method:'';
    q('[data-flow-counter]').textContent=isWire?`Event ${index+1} / ${traces.length} · session ${event.session}, action ${event.operation}`:'';
    const endpoint=isWire?`${event.side} ${event.direction} · ${event.direction==='sent'?'outbound':'inbound'} MCP message`:'';
    q('[data-flow-caption]').textContent=isWire?endpoint:'';
    q('.atlas-e46-architecture').dataset.flow=isWire?'wire':'other';
    renderRuntime(index);
    for(const node of root.querySelectorAll('[data-component]'))node.classList.toggle('atlas-e44-highlight',relevantComponents(event).includes(node.dataset.component));
    root.querySelectorAll('[data-worker-trace] button').forEach((b,i)=>b.setAttribute('aria-current',String(i===index)));
  }
  function tracePhase(operation,phaseName){
    const key=`${session}:${operation}`;
    if(phaseGroups.has(key))return phaseGroups.get(key);
    for(const group of phaseGroups.values())group.details.open=false;
    const meta=phases.find(p=>p.id===phaseName);
    const details=document.createElement('details');details.className='atlas-e49-phase';details.open=true;
    const summary=document.createElement('summary');
    const count=document.createElement('span');count.className='atlas-e49-count';
    summary.append(document.createTextNode(meta?.label||phaseName+' · Observations'),count);
    const list=document.createElement('ol');list.className='atlas-e44-traces';
    details.append(summary,list);q('[data-worker-trace]').append(details);
    const group={details,list,count,number:0};phaseGroups.set(key,group);return group;
  }
  function record(item){
    const entry={...item,time:new Date().toISOString(),session,operation:execution,phase:action};traces.push(entry);
    const index=traces.length-1;
    q('[data-e47-count]').textContent=`${traces.length} events`;
    const d=item.message?describeMessage(item.message):null;
    const heading=item.kind==='wire'?`${item.side} ${item.direction} · ${d.method??d.class}`:`${item.kind} · ${item.side??item.code??''}`;
    const li=document.createElement('li');const button=document.createElement('button');button.type='button';
    button.textContent=`${index+1} · [${action} / action ${execution}] ${heading}`;
    button.addEventListener('click',()=>{
      const event=traces[index],associated=relevantComponents(event);
      showFlow(event,index);
      for(const node of root.querySelectorAll('[data-component]'))node.classList.toggle('atlas-e44-highlight',associated.includes(node.dataset.component));
      const focused=event.kind==='execution'?'echo':event.side==='client'?'client':event.side==='server'?'server':'transport';showComponent(focused,event);
      const method=event.message?.method;
      q('[data-worker-detail]').innerHTML=`<h5>${esc(heading)}</h5><p><strong>Action:</strong> ${esc(event.phase)} · ${esc(event.operation)} ; <strong>session:</strong> ${esc(event.session)}</p><p><strong>Involved components:</strong> ${associated.map(esc).join(', ')}</p><p><strong>Provenance:</strong> ${esc(event.side??'observation')} · ${esc(event.direction??event.kind)}</p><p><strong>Related architecture element:</strong> ${event.kind==='execution'?'MCP server (occ:ref-server)':event.kind==='wire'?'Client–server connection (conn:ref-cs)':'Not established for this event'} (interpretive correspondence; not a verified realization).</p><pre>${esc(JSON.stringify(event,null,2))}</pre><p><a href="${method?.startsWith('tools/')?sources.tools:sources.lifecycle}" target="_blank" rel="noopener noreferrer">Inspect the relevant MCP specification</a></p>`;
    });li.append(button);const group=tracePhase(execution,action);group.list.append(li);group.number+=1;group.count.textContent=`${group.number} events`;
    // Follow observed events; SVG animation represents recorded direction, not actual transit time.
    button.click();setControls();
  }
  function fail(message){busy=false;phase='failed';status(message);setControls();}
  function handle(message){
    if(disposed)return;
    const data=message.data;record(data);
    if(data.kind==='failure'){fail('Worker error: '+String(data.error));return;}
    if(data.kind==='ready'){
      ready.add(data.side);state(data.side,'Connected');
      if(ready.size===2){phase='connected';busy=false;state('transport','Active');status('MCP connection established; tool discovery is available.');setControls();}
    }
    if(data.kind==='runtime'){
      if(data.side==='client' && data.snapshot?.operation)state('client',data.snapshot.operation);
      if(data.side==='server' && data.snapshot?.operation)state('server',data.snapshot.operation);
    }
    if(data.kind==='tools'){
      busy=false;hasDiscovered=true;state('client','Tools discovered');status('Discovery completed: '+(data.names??[]).join(', '));setControls();
    }
    if(data.kind==='execution')state('echo','Executed');
    if(data.kind==='outcome'){
      busy=false;hasInvoked=true;status('Guided run completed. Inspect the sequence, export evidence, or start a new run.');setControls();
    }
  }
  q('[data-worker-start]').addEventListener('click',()=>{
    if(phase!=='idle')return;
    phase='starting';action='create';session+=1;execution+=1;setControls();
    try{
      clientWorker=new Worker(new URL('./client-worker.mjs',import.meta.url),{type:'module'});
      serverWorker=new Worker(new URL('./server-worker.mjs',import.meta.url),{type:'module'});
      clientWorker.addEventListener('message',handle);serverWorker.addEventListener('message',handle);
      for(const [side,worker] of [['client',clientWorker],['server',serverWorker]])worker.addEventListener('error',e=>{record({kind:'failure',side,error:e.message});fail(`Error in ${side} : ${e.message}`);});
      state('host','Workers created');state('client','Initializing');state('server','Initializing');state('transport','Ports transferred');
      channel=new MessageChannel();
      serverWorker.postMessage({kind:'connect',port:channel.port2},[channel.port2]);
      clientWorker.postMessage({kind:'connect',port:channel.port1},[channel.port1]);
      status('Workers created; MCP initialization in progress…');
    }catch(error){fail('Creation failed: '+String(error));}
  });
  q('[data-worker-discover]').addEventListener('click',()=>{
    if(phase!=='connected'||busy||hasDiscovered)return;
    busy=true;execution+=1;action='discover';setControls();status('Requesting tools/list…');
    clientWorker.postMessage({kind:'discover'});
  });
  q('[data-worker-invoke]').addEventListener('click',()=>{
    if(phase!=='connected'||busy||!hasDiscovered||hasInvoked)return;
    busy=true;execution+=1;action='invoke';setControls();status('Calling tools/call echo…');
    clientWorker.postMessage({kind:'invoke',text:q('[data-worker-text]').value});
  });
  q('[data-worker-reset]').addEventListener('click',()=>{
    if(busy||phase==='idle')return;
    clientWorker?.terminate();serverWorker?.terminate();
    channel?.port1?.close();channel?.port2?.close();
    clientWorker=undefined;serverWorker=undefined;channel=undefined;
    ready.clear();traces.length=0;phaseGroups.clear();
    q('[data-worker-trace]').replaceChildren();q('[data-e47-count]').textContent='0 events';
    q('[data-worker-detail]').innerHTML='<p>Select an event to inspect its JSON and provenance.</p>';
    for(const side of ['client','server'])q(`[data-runtime-${side}]`).textContent='Awaiting observations';
    for(const [id,value] of Object.entries({host:'Idle',client:'Not created',server:'Not created',transport:'Not created',echo:'Not called'}))state(id,value);
    phase='idle';busy=false;hasDiscovered=false;hasInvoked=false;execution=0;action='create';
    const packet=q('[data-flow-packet]');packet.style.display='none';
    q('[data-flow-method]').textContent='No message selected';q('[data-flow-counter]').textContent='0 events';
    q('[data-flow-caption]').textContent='Start a session, then select a trace event.';
    q('[data-flow-arrow]').style.display='none';q('[data-flow-tip]').style.display='none';q('[data-flow-local]').style.display='none';
    for(const node of root.querySelectorAll('[data-component]'))node.classList.remove('atlas-e44-highlight');
    status('Ready for a new guided run.');setControls();
  });
  q('[data-worker-export]').addEventListener('click',()=>{
    const payload={kind:'atlas-real-worker-mcp',simulation:false,transport:'MessagePort (non-standard MCP transport adapter)',boundary:'two workers same browser',conformance:'not-assessed',architecture:components,phases,trace:traces,runtimeEvidence:'Worker-reported application snapshots; not SDK-private state'};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='atlas-e44-architecture-observations.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  setControls();
  return ()=>{disposed=true;clientWorker?.terminate();serverWorker?.terminate();channel?.port1?.close();channel?.port2?.close();root.replaceChildren();};
}
