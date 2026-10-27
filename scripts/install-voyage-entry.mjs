import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
const file='src/main.js';
const src=readFileSync(file,'utf8');
const stamp='/* ATLAS_VOYAGE_ENTRY_V1 */';
if(src.includes(stamp)){console.log('ATLAS_VOYAGE_ENTRY_ALREADY_INSTALLED');process.exit(0);}
function insert(oldText,newText,what){
  if(!current.includes(oldText))throw Error(`Point d'insertion introuvable : ${what}. main.js inchangé.`);
  current=current.replace(oldText,newText);
}
let current=src;
insert("const isMap = wanted === 'concept-map';", "const isMap = wanted === 'concept-map';\n  const isVoyage = wanted === 'voyage-agent-mcp';",'détection route');
insert("${readerPages.filter(p=>p.id!=='index')", "<a href=\"#voyage-agent-mcp\" ${isVoyage?'aria-current=\"page\"':''}>Voyage guidé · Architecture MCP</a>${readerPages.filter(p=>p.id!=='index')",'lien navigation');
insert("${isMap ? '<section id=\"concept-map-root\">Loading graph…</section>' : marked.parse(page.content)}", "${isVoyage ? '<section id=\"atlas-voyage-root\"></section>' : isMap ? '<section id=\"concept-map-root\">Loading graph…</section>' : marked.parse(page.content)}",'zone voyage');
insert("if (!isMap) configureDocumentLinks(document.querySelector('#content'), page.id);", "if (!isMap && !isVoyage) configureDocumentLinks(document.querySelector('#content'), page.id);",'liens');
insert("  if (!isMap && page.id === 'federated-configurations') {", "  if (isVoyage) {\n    try {\n      const {mountVoyagePage}=await import('./voyages/voyage-page.js');\n      if(location.hash.slice(1).split('?')[0] === 'voyage-agent-mcp')disposeE3=mountVoyagePage(document.querySelector('#atlas-voyage-root'));\n    } catch(error) {console.error('Atlas guided voyage:',error);const root=document.querySelector('#atlas-voyage-root');if(root)root.textContent='Voyage indisponible : consulter la console du navigateur.';}\n  }\n  if (!isMap && !isVoyage && page.id === 'federated-configurations') {",'montage voyage');
current=stamp+'\n'+current;
copyFileSync(file,`${file}.before-voyage-entry.bak`);
writeFileSync(file,current);
console.log('ATLAS_VOYAGE_ENTRY_INSTALLED');
