/* ATLAS_VOYAGE_ENTRY_V1 */
import './map/map.css';
import { marked } from 'marked';
import { pages, readerPages } from './content.js';
import './style.css';
import { resolveAtlasLink } from './link-routing.js';
const app = document.querySelector('#app');
const byId = new Map(pages.map(p => [p.id,p]));
const pageIds = new Set(byId.keys());
let disposeMap = null;
let disposeE3 = null;
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function configureDocumentLinks(root, currentId) {
  root.querySelectorAll('a[href]').forEach(a => {
    const destination = resolveAtlasLink(a.getAttribute('href'), pageIds, currentId);
    if (destination.kind === 'external') {
      a.target = 'atlas-reference';
      a.rel = 'noreferrer';
    } else if (destination.kind === 'internal') {
      a.href = destination.href;
    } else if (destination.kind === 'unresolved' || destination.kind === 'blocked') {
      a.removeAttribute('href');
      a.classList.add('atlas-unresolved-link');
      a.title = 'Unresolved destination in Atlas';
    }
  });
}
async function render(){
  if (disposeMap) { disposeMap(); disposeMap = null; }
  if (disposeE3) { disposeE3(); disposeE3 = null; }
  const wanted = decodeURIComponent(location.hash.slice(1).split('?')[0]) || 'index';
  const isMap = wanted === 'concept-map';
  const isVoyage = wanted === 'voyage-agent-mcp';
  const page = byId.get(wanted) || byId.get('index') || pages[0];
  document.title = `${isMap ? 'Concept map' : page.title} · AI Atlas`;
  app.innerHTML = `<header class="top"><details class="atlas-about-menu"><summary aria-label="About Atlas and its author">About</summary><div class="atlas-about-links"><a href="#about-atlas" ${page.id==='about-atlas'?'aria-current="page"':''}>About the Atlas</a><a href="#about-author" ${page.id==='about-author'?'aria-current="page"':''}>About the Author</a></div></details><a class="home-link" href="#index" aria-label="Return to Atlas home">AI & Interoperable Systems Atlas</a><span>Evidence-based, multi-perspective</span></header>
    <div class="layout"><nav aria-label="Atlas navigation"><h2>Explore</h2><a href="#index" ${!isMap && page.id==='index'?'aria-current="page"':''}>Home</a><a href="#concept-map" ${isMap?'aria-current="page"':''}>Concept map</a><a href="#voyage-agent-mcp" ${isVoyage?'aria-current="page"':''}>Guided journey · MCP architecture</a>${readerPages.filter(p=>p.id!=='index').map(p=>`<a href="#${encodeURIComponent(p.id)}" ${!isMap && p.id===page.id?'aria-current="page"':''}>${escapeHtml(p.title)}</a>`).join('')}</nav>
    <main id="content"><div class="status">WORKING KNOWLEDGE BASE · CHECK EVIDENCE STATUS</div>${isVoyage ? '<section id="atlas-voyage-root"></section>' : isMap ? '<section id="concept-map-root">Loading graph…</section>' : marked.parse(page.content)}</main></div>`;
  if (!isMap && !isVoyage) configureDocumentLinks(document.querySelector('#content'), page.id);
  if (isMap) {
    try {
      const { mountConceptMap } = await import('./map/interactive-map.js');
      if (location.hash.slice(1) !== 'concept-map') return;
      disposeMap = mountConceptMap(document.querySelector('#concept-map-root'));
    } catch (error) {
      console.error('Atlas concept map failed:', error);
      const target = document.querySelector('#concept-map-root');
      if (target) target.textContent = 'The concept map could not be initialized. Review the browser console.';
    }
  }
  if (isVoyage) {
    try {
      const {mountVoyagePage}=await import('./voyages/voyage-page.js');
      if(location.hash.slice(1).split('?')[0] === 'voyage-agent-mcp')disposeE3=mountVoyagePage(document.querySelector('#atlas-voyage-root'));
    } catch(error) {console.error('Atlas guided voyage:',error);const root=document.querySelector('#atlas-voyage-root');if(root)root.textContent='Journey unavailable: check the browser console.';}
  }
  if (!isMap && !isVoyage && page.id === 'federated-configurations') {
    try { const {mountE31}=await import('./e3/explorer.js'); disposeE3=mountE31(); }
    catch(error){console.error('E3.2 explorer:',error);}
  }
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',render);
render();
