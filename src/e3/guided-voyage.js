import voyage from '../../data/voyages/agent-mcp-first.json';
import model from '../../data/e3/federated-compositions.json';
import './guided-voyage.css';
import {mountVoyageBrowserLab} from './voyage-browser-lab.js';

const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function validateGuidedVoyage(v=voyage,m=model){
  const issues=[];
  const occurrences=new Set(m.occurrences.map(x=>x.id));
  const connections=new Set(m.connections.map(x=>x.id));
  if(!m.compositions.some(x=>x.id===v.composition))issues.push(`Composition inconnue : ${v.composition}`);
  if(!m.configurations.some(x=>x.id===v.baseline&&x.composition===v.composition))issues.push(`Unlinked baseline: ${v.baseline}`);
  const ids=new Set();
  for(const step of v.steps){
    if(ids.has(step.id))issues.push(`Duplicate step: ${step.id}`);
    ids.add(step.id);
    if(!step.question||!step.expected||!step.evidence)issues.push(`Incomplete step: ${step.id}`);
    for(const id of step.targets||[])if(!occurrences.has(id)&&!connections.has(id))issues.push(`Cible inconnue : ${id}`);
  }
  return issues;
}

export function mountGuidedVoyage(root,{navigate,selectTarget,getContext}={}){
  const errors=validateGuidedVoyage();
  if(errors.length)throw Error(errors.join('; '));
  const section=document.createElement('section');
  section.className='atlas-guided-voyage';
  section.setAttribute('aria-label','Guided architectural journey');
  section.innerHTML=`<details open><summary><strong>Guided journey</strong> · ${escapeHTML(voyage.title)} (${voyage.steps.length} sections)</summary><div class="atlas-voyage-body"><p>From concept to prototype: questions, model resources, experimentation, and evidence limits. This journey is <strong>illustrative</strong>, not a conformance validation.</p><label>Guide section <select data-voyage-step>${voyage.steps.map((s,i)=>`<option value="${i}">${escapeHTML(s.title)}</option>`).join('')}</select></label><div data-voyage-content aria-live="polite"></div><div class="atlas-voyage-actions"><button type="button" data-voyage-prev>Previous</button><button type="button" data-voyage-next>Next</button></div><p data-voyage-context class="e32-note"></p></div></details>`;
  root.querySelector('.e34-shared-tools')?.before(section);
  const stepSelect=section.querySelector('[data-voyage-step]');
  const content=section.querySelector('[data-voyage-content]');
  let index=0;
  let disposeLab=null;
  function render(){
    disposeLab?.();disposeLab=null;
    const step=voyage.steps[index];
    stepSelect.value=String(index);
    content.innerHTML=`<h3>${escapeHTML(step.title)}</h3><p><strong>Question:</strong> ${escapeHTML(step.question)}</p><p><strong>Activity:</strong> ${escapeHTML(step.method)}</p><p><strong>Expected outcome:</strong> ${escapeHTML(step.expected)}</p><p><strong>Source:</strong> <code>${escapeHTML(step.evidence)}</code></p><p><strong>Objects to inspect:</strong> ${step.targets.map(id=>`<button type="button" data-voyage-target="${escapeHTML(id)}">${escapeHTML(id)}</button>`).join(' ')}</p><button type="button" data-voyage-open>Open the relevant representation</button>${step.id==='prototype'?'<div data-voyage-browser-lab></div>':''}`;
    content.querySelector('[data-voyage-open]').addEventListener('click',()=>navigate?.(step));
    if(step.id==='prototype')disposeLab=mountVoyageBrowserLab(content.querySelector('[data-voyage-browser-lab]'));
    content.querySelectorAll('[data-voyage-target]').forEach(button=>button.addEventListener('click',()=>selectTarget?.(button.dataset.voyageTarget,step)));
    section.querySelector('[data-voyage-prev]').disabled=index===0;
    section.querySelector('[data-voyage-next]').disabled=index===voyage.steps.length-1;
    const context=getContext?.();
    section.querySelector('[data-voyage-context]').textContent=context?`Atlas context: ${context.composition} · ${context.baseline||'no baseline selected'}`:'';
  }
  stepSelect.addEventListener('change',()=>{index=Number(stepSelect.value);render();});
  section.querySelector('[data-voyage-prev]').addEventListener('click',()=>{index--;render();});
  section.querySelector('[data-voyage-next]').addEventListener('click',()=>{index++;render();});
  render();
  return ()=>{disposeLab?.();section.remove();};
}
