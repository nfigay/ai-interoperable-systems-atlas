// Teaching prototype only: no MCP transport or remote service.
import './voyage-browser-lab.css';

export function makeBrowserScenario(text='Bonjour Atlas'){
  const echo=String(text);
  const messages=[
    {actor:'client',message:{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'illustrative',capabilities:{},clientInfo:{name:'atlas-voyage-fixture',version:'0.1'}}}},
    {actor:'server',message:{jsonrpc:'2.0',id:1,result:{protocolVersion:'illustrative',capabilities:{tools:{}},serverInfo:{name:'atlas-demo',version:'0.1'}}}},
    {actor:'client',message:{jsonrpc:'2.0',id:2,method:'tools/list',params:{}}},
    {actor:'server',message:{jsonrpc:'2.0',id:2,result:{tools:[{name:'echo',description:'Retourne le texte fourni',inputSchema:{type:'object',properties:{text:{type:'string'}},required:['text']}}]}}},
    {actor:'client',message:{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'echo',arguments:{text:echo}}}},
    {actor:'server',message:{jsonrpc:'2.0',id:3,result:{content:[{type:'text',text:echo}]}}}
  ];
  return {kind:'atlas-browser-scripted-fixture',conformance:'not-assessed',transport:'none',messages,observation:{tool:'echo',text:echo}};
}

export function mountVoyageBrowserLab(host){
  if(!host)return ()=>{};
  host.classList.add('atlas-browser-lab');
  host.innerHTML=`<div class="atlas-lab-heading"><strong>Browser laboratory · JSON-RPC simulation</strong><span>No server · Conformance not assessed</span></div>
  <label>Argument de l'outil fictif echo <input data-lab-input maxlength="160" value="Bonjour Atlas" /></label>
  <div class="atlas-lab-controls"><button type="button" data-lab-run>Run scenario</button><button type="button" data-lab-next disabled>Next message</button><button type="button" data-lab-reset disabled>Reset</button><button type="button" data-lab-export disabled>Export JSON</button></div>
  <div class="atlas-lab-columns"><div><h4>Client ↔ server exchange</h4><ol data-lab-messages aria-live="polite"></ol></div><div><h4>Selected message</h4><pre data-lab-json>No message replayed.</pre></div></div><p data-lab-status role="status">Experiment not started.</p>`;
  const query=x=>host.querySelector(x);
  let scenario=null,index=-1;
  const btnNext=query('[data-lab-next]'),btnReset=query('[data-lab-reset]'),btnExport=query('[data-lab-export]');
  function display(){
    query('[data-lab-messages]').replaceChildren();
    if(!scenario)return;
    for(let i=0;i<=index;i++){
      const item=scenario.messages[i];
      const li=document.createElement('li');
      const method=item.message.method|| (item.message.id===1?'initialize · response':item.message.id===2?'tools/list · response':'tools/call · response');
      li.textContent=`${item.actor==='client'?'Client → Serveur':'Serveur → Client'} · ${method}`;
      if(i===index)li.classList.add('current');
      query('[data-lab-messages]').append(li);
    }
    query('[data-lab-json]').textContent=index<0?'No message replayed.':JSON.stringify(scenario.messages[index],null,2);
    btnNext.disabled=index>=scenario.messages.length-1;
    btnReset.disabled=false;btnExport.disabled=index<scenario.messages.length-1;
    query('[data-lab-status]').textContent=index===scenario.messages.length-1?`Simulation complete: echo → ${scenario.observation.text}. This result does not demonstrate MCP interoperability.`:`${index+1} / ${scenario.messages.length} messages displayed · local simulation.`;
  }
  query('[data-lab-run]').addEventListener('click',()=>{scenario=makeBrowserScenario(query('[data-lab-input]').value);index=0;display();});
  btnNext.addEventListener('click',()=>{if(scenario && index<scenario.messages.length-1){index++;display();}});
  btnReset.addEventListener('click',()=>{scenario=null;index=-1;query('[data-lab-messages]').replaceChildren();query('[data-lab-json]').textContent='No message replayed.';query('[data-lab-status]').textContent='Experiment reset.';btnNext.disabled=btnReset.disabled=btnExport.disabled=true;});
  btnExport.addEventListener('click',()=>{
    if(!scenario || index!==scenario.messages.length-1)return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(scenario,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='atlas-voyage-browser-observation.json';a.click();
    queueMicrotask(()=>URL.revokeObjectURL(url));
  });
  return ()=>host.replaceChildren();
}
