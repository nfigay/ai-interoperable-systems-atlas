// Build-time raw imports: display the exact application source bundled with the demonstrator.
// These are application modules, not the source of the external MCP SDK.
import hostCode from './worker-lab.js?raw';
import clientCode from './client-worker.mjs?raw';
import serverCode from './server-worker.mjs?raw';
import transportCode from './port-transport.mjs?raw';

const SOURCES = Object.freeze({
  'src/e43/worker-lab.js':hostCode,
  'src/e43/client-worker.mjs':clientCode,
  'src/e43/server-worker.mjs':serverCode,
  'src/e43/port-transport.mjs':transportCode
});
const MARKERS = {
  'tools/list': {client:'listTools(',server:'registerTool('},
  'tools/call': {client:'callTool(',server:'registerTool('},
  'initialize': {client:'connect(',server:'connect('},
  'notifications/initialized': {client:'connect(',server:'connect('}
};

export function renderSourceInspector(container, file, event) {
  container.replaceChildren();
  const source = SOURCES[file];
  if (typeof source !== 'string') {
    const p=document.createElement('p');p.textContent='Source not bundled for this component.';container.append(p);return;
  }
  const details=document.createElement('details');details.className='atlas-source-inspector';
  const summary=document.createElement('summary');summary.textContent=`View actual source · ${file}`;details.append(summary);
  const note=document.createElement('p');note.textContent='Read-only source bundled by Vite. Highlighted locations indicate a related API call, not a verified execution stack trace.';details.append(note);
  const toolbar=document.createElement('label');toolbar.textContent='Find in source ';
  const search=document.createElement('input');search.type='search';search.placeholder='Symbol or operation';search.setAttribute('aria-label','Find in source');toolbar.append(search);details.append(toolbar);
  const sourceWrap=document.createElement('div');sourceWrap.className='atlas-source-scroll';sourceWrap.tabIndex=0;
  const code=document.createElement('code');code.className='atlas-source-lines';sourceWrap.append(code);details.append(sourceWrap);
  const lines=source.split('\n');
  const side=file.includes('client-worker')?'client':file.includes('server-worker')?'server':null;
  const marker=side && MARKERS[event?.message?.method]?.[side] || (event?.kind==='execution'&&side==='server'?'registerTool(':null);
  const initialIndex=marker?lines.findIndex(line=>line.includes(marker)):-1;
  const render=query=>{
    code.replaceChildren();
    const match=query.trim().toLowerCase();
    const fragment=document.createDocumentFragment();
    lines.forEach((line,i)=>{
      const span=document.createElement('span');span.className='atlas-source-line';
      if((match && line.toLowerCase().includes(match)) || (!match && i===initialIndex))span.classList.add('atlas-source-match');
      const n=document.createElement('span');n.className='atlas-source-number';n.textContent=String(i+1);
      const body=document.createElement('span');body.textContent=line || ' ';
      span.append(n,body);fragment.append(span);
    });
    code.append(fragment);
  };
  render('');search.addEventListener('input',()=>render(search.value));
  container.append(details);
  if(initialIndex>=0) {
    const hint=document.createElement('span');hint.className='atlas-source-hint';hint.textContent=`Related location: line ${initialIndex+1}`;
    summary.append(' · ',hint);
  }
}
