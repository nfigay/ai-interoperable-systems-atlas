import { marked } from 'marked';
import { pages } from './content.js';
import './style.css';
const app = document.querySelector('#app');
const byId = new Map(pages.map(p => [p.id,p]));
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function render(){
  const wanted = decodeURIComponent(location.hash.slice(1)) || 'index';
  const page = byId.get(wanted) || byId.get('index') || pages[0];
  document.title = `${page.title} · AI Atlas`;
  app.innerHTML = `<header class="top"><strong>AI & Interoperable Systems Atlas</strong><span>Evidence-based, multi-perspective</span></header>
    <div class="layout"><nav aria-label="Atlas navigation"><h2>Explore</h2>${pages.map(p=>`<a href="#${encodeURIComponent(p.id)}" ${p.id===page.id?'aria-current="page"':''}>${escapeHtml(p.title)}</a>`).join('')}</nav>
    <main id="content"><div class="status">WORKING KNOWLEDGE BASE · CHECK EVIDENCE STATUS</div>${marked.parse(page.content)}</main></div>`;
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',render);
render();
