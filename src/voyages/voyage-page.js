import voyage from '../../data/voyages/agent-mcp-first.json';
import {mountVoyageBrowserLab} from '../e3/voyage-browser-lab.js';
import './voyage-page.css';
import {mountWorkerLab} from '../e43/worker-lab.js'; // ATLAS_E43_WORKERS
import {mountE42Lesson} from '../e42/lesson-ui.js'; // ATLAS_E42_VERTICAL_SLICE

const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const atlasVoyageRoute = 'voyage-agent-mcp';
export const atlasVoyageSteps = voyage.steps;
export function mountVoyagePage(host){
  if(!host)throw Error('Zone voyage Atlas introuvable');
  host.innerHTML=`<section class="atlas-voyage-page" aria-label="MCP architecture journey"><p class="atlas-voyage-kicker">ARCHITECTURE JOURNEY · GUIDED EXPLORATION</p><h1>${esc(voyage.title)}</h1><p>Explore concepts, interactions, architecture and configuration; run the demonstrator and assess observations against hypotheses.</p><p class="atlas-voyage-warning">The guide includes simulations as optional comparisons. The main experiment uses real MCP SDK calls through an experimental browser-local transport; no conformance assessment.</p><nav aria-label="Journey guide sections"><ol class="atlas-voyage-index">${voyage.steps.map((s,i)=>`<li><button type="button" data-voyage-step="${i}">${esc(s.title)}</button></li>`).join('')}</ol></nav><article data-voyage-detail aria-live="polite"></article><div class="atlas-voyage-buttons"><button type="button" data-voyage-prev>← Previous guide section</button><button type="button" data-voyage-next>Next guide section →</button></div></section>`;
  const select = s => host.querySelector(s);
  const detail = select('[data-voyage-detail]');
  let active=0,disposeLab=()=>{},disposeLesson=()=>{},disposeWorker=()=>{};
  function show(index){
    if(index<0||index>=voyage.steps.length)return;
    disposeLab();disposeLesson();disposeWorker();active=index;
    const step=voyage.steps[index];
    detail.innerHTML=`<h2>${esc(step.title)}</h2><p><strong>Question:</strong> ${esc(step.id==="prototype"?"How do separate MCP client and server components actually interact inside a browser?":step.question)}</p><p><strong>Activity:</strong> ${esc(step.id==="prototype"?"Create the Workers; discover tools; invoke echo; inspect transport, source code, and observed traces.":step.method)}</p><p><strong>Expected result:</strong> ${esc(step.id==="prototype"?"Real messages transmitted and server-side tool executed; no claim of conformance or network communication.":step.expected)}</p><p><strong>Declared source:</strong> <code>${esc(step.id==="prototype"?"src/e43/client-worker.mjs, src/e43/server-worker.mjs, src/e43/port-transport.mjs":step.evidence)}</code></p><p><a href="#federated-configurations">Explore the composition and its properties in Atlas</a></p>${step.targets.length?`<p>Objects to inspect:</p><ul>${step.targets.map(id=>`<li><code>${esc(id)}</code>${id.startsWith('occ:')?` · <a href="#federated-configurations?occ=${encodeURIComponent(id)}">Open occurrence</a>`:''}</li>`).join('')}</ul>`:''}${['concepts','interactions'].includes(step.id)?'<div data-e42-lesson></div>':''}${step.id==='prototype'?'<section aria-label="MCP experimental journey"><h3>Main experiment · running MCP components</h3><p>Atlas runs two separate Web Workers containing a client and server built with the MCP SDK. The protocol interaction and echo tool execute; the MessagePort distribution is browser-local and is not a standardized MCP transport.</p><p><strong>How to explore:</strong> create components, discover tools, invoke echo, select an event, then inspect code, the specification, and exported evidence. This does not establish general conformance or cross-vendor interoperability.</p></section><div data-e43-worker-lab></div>':''}`;
    if(['concepts','interactions'].includes(step.id))disposeLesson=mountE42Lesson(detail.querySelector('[data-e42-lesson]'),step.id);
    if(step.id==='prototype')disposeWorker=mountWorkerLab(detail.querySelector('[data-e43-worker-lab]'));
    /* Earlier development labs are not part of the integrated demonstrator. */
    history.replaceState(null,'',`#voyage-agent-mcp?step=${encodeURIComponent(step.id)}`);
    host.querySelectorAll('[data-voyage-step]').forEach((button,i)=>button.setAttribute('aria-current',i===active?'step':'false'));
    select('[data-voyage-prev]').disabled=active===0;
    select('[data-voyage-next]').disabled=active===voyage.steps.length-1;
  }
  host.querySelectorAll('[data-voyage-step]').forEach(button=>button.addEventListener('click',()=>show(Number(button.dataset.voyageStep))));
  select('[data-voyage-prev]').addEventListener('click',()=>show(active-1));
  select('[data-voyage-next]').addEventListener('click',()=>show(active+1));
  const requested=new URLSearchParams(location.hash.split('?')[1]||'').get('step');
  const first=Math.max(0,voyage.steps.findIndex(s=>s.id===requested));
  show(first);
  return ()=>{disposeLab();disposeLesson();disposeWorker();host.replaceChildren();};
}
