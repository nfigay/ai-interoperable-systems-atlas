import './map/map.css';
import { marked } from 'marked';
import { pages } from './content.js';
import './style.css';
const app = document.querySelector('#app');
const byId = new Map(pages.map(p => [p.id,p]));
let disposeMap = null;
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
async function render(){
  if (disposeMap) { disposeMap(); disposeMap = null; }
  const wanted = decodeURIComponent(location.hash.slice(1)) || 'index';
  const isMap = wanted === 'concept-map';
  const page = byId.get(wanted) || byId.get('index') || pages[0];
  document.title = `${isMap ? 'Concept map' : page.title} · AI Atlas`;
  app.innerHTML = `<header class="top"><strong>AI & Interoperable Systems Atlas</strong><span>Evidence-based, multi-perspective</span></header>
    <div class="layout"><nav aria-label="Atlas navigation"><h2>Explore</h2><a href="#concept-map" ${isMap?'aria-current="page"':''}>Concept map</a>${pages.map(p=>`<a href="#${encodeURIComponent(p.id)}" ${!isMap && p.id===page.id?'aria-current="page"':''}>${escapeHtml(p.title)}</a>`).join('')}</nav>
    <main id="content"><div class="status">WORKING KNOWLEDGE BASE · CHECK EVIDENCE STATUS</div>${isMap ? '<section id="concept-map-root">Loading graph…</section>' : marked.parse(page.content)}</main></div>`;
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
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',render);
render();
