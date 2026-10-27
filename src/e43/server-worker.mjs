import {McpServer} from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import {PortTransport} from './port-transport.mjs';
let server = null;
let transport = null;
const notify = data => self.postMessage(data);

let atlasServerState={serverCreated:false,toolRegistered:false,transportCreated:false,connection:'not connected',operation:'idle',invocations:0,lastTool:null};
const reportServer=(transition)=>notify({kind:'runtime',side:'server',transition,snapshot:{...atlasServerState,objects:{server:atlasServerState.serverCreated?'McpServer':'absent',tool:atlasServerState.toolRegistered?'echo':'absent',transport:atlasServerState.transportCreated?'PortTransport':'absent',port:atlasServerState.transportCreated?'MessagePort':'absent'}}});

self.onmessage = async event => {
  if (event.data?.kind !== 'connect') return;
  try {
    const {port} = event.data;
    server = new McpServer({name: 'atlas-browser-worker-server', version: '1.0.0'});
    atlasServerState.serverCreated=true;atlasServerState.operation='registering';reportServer('McpServer object created');
    server.registerTool('echo', {
      title: 'Echo — demonstration tool',
      description: 'Returns the supplied text without calling an LLM.',
      inputSchema: z.object({text: z.string().max(160)})
    }, async ({text}) => {
      atlasServerState.invocations+=1;atlasServerState.lastTool='echo';atlasServerState.operation='executing echo';reportServer('echo invocation executing');
      notify({kind: 'execution', code: 'echo', input: text});
      atlasServerState.operation='ready';reportServer('echo invocation completed');
      return {content: [{type:'text', text}]};
    });
    atlasServerState.toolRegistered=true;atlasServerState.operation='waiting';reportServer('echo tool registered');
    transport = new PortTransport(port, observation => notify({kind:'wire', ...observation}), 'server');
    atlasServerState.transportCreated=true;atlasServerState.connection='connecting';reportServer('Transport attached; MCP connect started');
    await server.connect(transport);
    atlasServerState.connection='connected';atlasServerState.operation='ready';reportServer('MCP server connected');
    notify({kind: 'ready', side: 'server'});
  } catch(error) {atlasServerState.operation='failed';reportServer('Server failure');notify({kind:'failure', side:'server', error:String(error)});}
};
