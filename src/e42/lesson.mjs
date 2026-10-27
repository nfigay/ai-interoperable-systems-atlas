// Editorial teaching data: localized evidence, no conformance claim.
export const SOURCES = Object.freeze({
  cartography: {title:'Semantic Cartography — masterclass',locator:'SemanticCartography.html, §2.1, §3.2, §5.1',href:'https://nfigay.github.io/training/SemanticCartography.html',kind:'reviewed local educational source'},
  meaning: {title:'Semantic Interoperability — masterclass',locator:'SemanticInteroperability.html, §A.8, §E.5–E.6, §G.1–G.2',href:null,kind:'reviewed local educational source; no verified public link'},
  lifecycle: {title:'MCP 2025-11-25 — Lifecycle',locator:'Initialization, Capability Negotiation',href:'https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle',kind:'versioned normative specification'},
  tools: {title:'MCP 2025-11-25 — Tools',locator:'Listing Tools, Calling Tools, Tool Result',href:'https://modelcontextprotocol.io/specification/2025-11-25/server/tools',kind:'versioned normative specification'},
  modern: {title:'MCP 2026-07-28 — Specification',locator:'Overview, Base Protocol, Security',href:'https://modelcontextprotocol.io/specification/2026-07-28',kind:'versioned normative specification'}
});
export const ROLES = Object.freeze([
 {id:'occ:ref-agent',label:'Agent (Atlas occurrence)',meaning:'Application that chooses to use a capability. This role alone is not an MCP client.',source:'cartography'},
 {id:'occ:ref-client',label:'MCP client (Atlas occurrence)',meaning:'Host-side connection component that issues requests to the server.',source:'lifecycle'},
 {id:'occ:ref-server',label:'MCP server (Atlas occurrence)',meaning:'Exposes capabilities; advertising a tool does not prove successful execution.',source:'tools'},
 {id:'occ:ref-workflow',label:'Workflow (Atlas occurrence)',meaning:'Application orchestration distinct from the communication protocol.',source:'cartography'}
]);
export const CONNECTION = Object.freeze({id:'conn:ref-cs',meaning:'Client–server connection explicitly declared in the Atlas architecture registry. This is a documentary link, not evidence of actual transport.'});
const message=(actor,body,operation,comment,source)=>({actor,message:body,operation,comment,source,connection:CONNECTION.id});
export function runLesson({text='Hello Atlas',caseId='ok'}={}){
  if(!['ok','tool-error','rpc-error'].includes(caseId)) throw Error('Unknown scenario');
  if(typeof text!=='string'||text.length>160) throw Error('Invalid input (maximum 160 characters)');
  const messages=[
    message('client',{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'atlas-teaching-client',version:'0.1'}}},'initialize','The client proposes a version and capabilities.','lifecycle'),
    message('server',{jsonrpc:'2.0',id:1,result:{protocolVersion:'2025-11-25',capabilities:{tools:{}},serverInfo:{name:'atlas-teaching-server',version:'0.1'}}},'initialize response','The server confirms a version and advertises tools.','lifecycle'),
    message('client',{jsonrpc:'2.0',method:'notifications/initialized'},'notifications/initialized','Initialization-complete notification; not a request expecting a response.','lifecycle'),
    message('client',{jsonrpc:'2.0',id:2,method:'tools/list',params:{}},'tools/list','The client requests the available tools.','tools'),
    message('server',{jsonrpc:'2.0',id:2,result:{tools:[{name:'echo',description:'Returns text; entirely fictitious tool',inputSchema:{type:'object',properties:{text:{type:'string'}},required:['text']}}]}},'tools/list response','Advertising a tool does not prove that it is operational.','tools'),
    message('client',{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'echo',arguments:{text}}},'tools/call','The client constructs an invocation. The simulation sends nothing over a network.','tools')
  ];
  if(caseId==='rpc-error')messages.push(message('server',{jsonrpc:'2.0',id:3,error:{code:-32601,message:'Method not found (illustrative)'}},'JSON-RPC error','Protocol error; different from a tool that executed and then failed.','tools'));
  else if(caseId==='tool-error')messages.push(message('server',{jsonrpc:'2.0',id:3,result:{content:[{type:'text',text:'Illustrative tool failure'}],isError:true}},'tool error','The protocol transports the response, but the tool result indicates failure.','tools'));
  else messages.push(message('server',{jsonrpc:'2.0',id:3,result:{content:[{type:'text',text}],isError:false}},'tool result','Deterministic result from a simulated JavaScript function, not an MCP server.','tools'));
  return {kind:'atlas-e42-scripted-browser-simulation',simulation:true,protocolIllustrated:'2025-11-25',transport:'none',conformance:'not-assessed',caseId,text,connection:CONNECTION.id,messages,observed:caseId==='ok'?'fictitious-echo':caseId};
}
export function parseState(hash){
 const raw=String(hash).split('?')[1]||'';const p=new URLSearchParams(raw);
 const step=p.get('step');const scenario=p.get('case');const msg=Number(p.get('message'));
 return {step:step&&['concepts','interactions','assembly','configuration','prototype','reflect'].includes(step)?step:'concepts',caseId:['ok','tool-error','rpc-error'].includes(scenario)?scenario:'ok',text:(p.get('text')||'Hello Atlas').slice(0,160),message:Number.isInteger(msg)&&msg>=0&&msg<=6?msg:0};
}
export function stateHash({step='concepts',caseId='ok',text='Hello Atlas',message=0}={}){
 return '#voyage-agent-mcp?'+new URLSearchParams({step,case:caseId,text,message:String(message)});
}
