// Simulation éducative locale de messages JSON-RPC inspirés du cycle MCP.
// Aucun transport, serveur SDK ou conformité MCP n'est revendiqué.
const messages=[
  {actor:'client',message:{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'illustrative',capabilities:{},clientInfo:{name:'atlas-voyage-fixture',version:'0.1'}}}},
  {actor:'server',message:{jsonrpc:'2.0',id:1,result:{protocolVersion:'illustrative',capabilities:{tools:{}},serverInfo:{name:'atlas-demo',version:'0.1'}}}},
  {actor:'client',message:{jsonrpc:'2.0',id:2,method:'tools/list',params:{}}},
  {actor:'server',message:{jsonrpc:'2.0',id:2,result:{tools:[{name:'echo',description:'Retourne le texte fourni',inputSchema:{type:'object',properties:{text:{type:'string'}},required:['text']}}]}}},
  {actor:'client',message:{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'echo',arguments:{text:'Bonjour Atlas'}}}},
  {actor:'server',message:{jsonrpc:'2.0',id:3,result:{content:[{type:'text',text:'Bonjour Atlas'}]}}}
];
export function executeFixture(){return {kind:'atlas-offline-scripted-fixture',conformance:'not-assessed',transport:'none',messages,observation:{tool:'echo',text:messages.at(-1).message.result.content[0].text}};}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href){
  process.stdout.write(JSON.stringify(executeFixture(),null,2)+'\n');
}
