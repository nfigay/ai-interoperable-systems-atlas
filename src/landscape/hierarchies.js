/** Explicit, read-only navigation paths. Edges are derived from named source fields.
 * No edge below implies physical assembly, semantic part-of or deployed conformity.
 */
import {decompositionProjection} from './decomposition.js';
export const HIERARCHIES = Object.freeze([
  {id:'decomposition',title:'Illustrative decomposition (4+ levels)',description:'Explicit demonstration assertions, neither verified nor normative'},
  {id:'realization',title:'Realizations and authorities',description:'Composition → occurrence → definition → authority (native declarations)'},
  {id:'governance',title:'Configuration and references',description:'Composition → baseline → federated reference → authority'},
  {id:'connectivity',title:'Typed connectivity',description:'Occurrences connected by explicit relationships, without implied decomposition'}
]);
const key = (kind,record) => `${kind}:${record.id}`;
export function hierarchyProjection(model, compositionId, hierarchy='realization', maxDepth=3){
  if(hierarchy==='decomposition')return decompositionProjection(model,compositionId,maxDepth);
  if(!HIERARCHIES.some(x=>x.id===hierarchy)) throw new Error(`Unknown hierarchy: ${hierarchy}`);
  if(!Number.isInteger(maxDepth)||maxDepth<0||maxDepth>8)throw new Error('Depth must be an integer between 0 and 8');
  const composition=model.compositions.find(x=>x.id===compositionId);
  if(!composition)throw new Error(`Unknown composition: ${compositionId}`);
  const nodes=new Map(); const links=[];
  const add=(kind,record)=>{if(!record)return null;const id=key(kind,record);nodes.set(id,{id,kind,resourceId:record.id,label:record.name||record.id});return id;};
  const connect=(from,to,type,field,sourceId)=>{if(from&&to)links.push({from,to,type,evidence:{field,sourceId}});};
  const root=add('composition',composition);
  const occs=model.occurrences.filter(x=>x.composition===compositionId);
  if(hierarchy==='realization'){
    for(const occ of occs){
      const oid=add('occurrence',occ);connect(root,oid,'uses-occurrence','occurrence.composition',occ.id);
      const def=model.definitions.find(x=>x.id===occ.definition);
      const did=add('definition',def);connect(oid,did,'references-definition','occurrence.definition',occ.id);
      const authority=model.authorities.find(a=>a.id===def?.authority);
      const aid=add('authority',authority);connect(did,aid,'declared-authority','definition.authority',def?.id);
    }
  }else if(hierarchy==='governance'){
    for(const base of model.configurations.filter(x=>x.composition===compositionId)){
      const bid=add('configuration',base);connect(root,bid,'has-declared-baseline','configuration.composition',base.id);
      for(const refId of base.federatedReferences||[]){
        const ref=model.federatedReferences.find(x=>x.id===refId);
        const rid=add('federated-reference',ref);connect(bid,rid,'cites-reference','configuration.federatedReferences',base.id);
        const authority=model.authorities.find(a=>a.id===ref?.authority);
        const aid=add('authority',authority);connect(rid,aid,'declared-authority','federatedReference.authority',ref?.id);
      }
    }
  }else{
    for(const occ of occs){const oid=add('occurrence',occ);connect(root,oid,'uses-occurrence','occurrence.composition',occ.id);}
    for(const rel of model.connections){
      const source=occs.find(x=>x.id===rel.from), target=occs.find(x=>x.id===rel.to);
      if(source&&target) connect(key('occurrence',source),key('occurrence',target),rel.kind,'connection.from/to',rel.id);
    }
  }
  const adjacency=new Map();
  for(const edge of links){if(!adjacency.has(edge.from))adjacency.set(edge.from,[]);adjacency.get(edge.from).push(edge);}
  const depth=new Map([[root,0]]);const queue=[root];
  while(queue.length){const id=queue.shift();for(const edge of adjacency.get(id)||[]){if(!depth.has(edge.to)){depth.set(edge.to,depth.get(id)+1);queue.push(edge.to);}}}
  // Cross-occurrence connections stay at depth 1; they are not containment edges.
  const selected=[...nodes.values()].filter(n=>depth.has(n.id)&&depth.get(n.id)<=maxDepth).map(n=>({...n,depth:depth.get(n.id)}));
  const kept=new Set(selected.map(n=>n.id));
  return {hierarchy,compositionId,maxDepth,nodes:selected,links:links.filter(x=>kept.has(x.from)&&kept.has(x.to)),excluded:[...nodes.keys()].filter(x=>!kept.has(x))};
}
