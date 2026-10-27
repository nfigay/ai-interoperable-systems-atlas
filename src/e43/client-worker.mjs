import {Client} from '@modelcontextprotocol/client';
import {PortTransport} from './port-transport.mjs';
let client=null;
const notify=data=>self.postMessage(data);

let atlasClientState={clientCreated:false,transportCreated:false,connection:'not connected',operation:'idle',discoveredTools:[],invocations:0};
const reportClient=(transition)=>notify({kind:'runtime',side:'client',transition,snapshot:{...atlasClientState,objects:{client:atlasClientState.clientCreated?'Client':'absent',transport:atlasClientState.transportCreated?'PortTransport':'absent',port:atlasClientState.transportCreated?'MessagePort':'absent'}}});

self.onmessage=async event=>{
  const data=event.data;
  try{
    if(data?.kind==='connect'){
      client=new Client({name:'atlas-browser-worker-client',version:'1.0.0'});
      atlasClientState.clientCreated=true;atlasClientState.operation='creating';reportClient('Client object created');
      const transport=new PortTransport(data.port,observation=>notify({kind:'wire',...observation}),'client');
      atlasClientState.transportCreated=true;reportClient('PortTransport and MessagePort attached');
      atlasClientState.connection='connecting';reportClient('MCP connect started');
      await client.connect(transport);
      atlasClientState.connection='connected';atlasClientState.operation='ready';reportClient('MCP connect completed');
      notify({kind:'ready',side:'client',protocol:client.getNegotiatedProtocolVersion?.()??'not-reported'});
    }else if(data?.kind==='discover'||data?.kind==='run'){
      if(!client)throw Error('Client not connected');
      atlasClientState.operation='discovering';reportClient('Tool discovery started');
      const tools=await client.listTools();
      atlasClientState.discoveredTools=tools.tools.map(t=>t.name);atlasClientState.operation='ready';reportClient('Tool discovery completed');
      notify({kind:'tools',names:tools.tools.map(t=>t.name)});
      if(data.kind==='run'){
        atlasClientState.operation='calling echo';reportClient('Tool invocation started');
        const response=await client.callTool({name:'echo',arguments:{text:String(data.text??'').slice(0,160)}});
        atlasClientState.invocations+=1;atlasClientState.operation='ready';reportClient('Tool invocation completed');
        notify({kind:'outcome',response});
      }
    }else if(data?.kind==='invoke'){
      if(!client)throw Error('Client not connected');
      atlasClientState.operation='calling echo';reportClient('Tool invocation started');
        const response=await client.callTool({name:'echo',arguments:{text:String(data.text??'').slice(0,160)}});
        atlasClientState.invocations+=1;atlasClientState.operation='ready';reportClient('Tool invocation completed');
      notify({kind:'outcome',response});
    }
  }catch(error){atlasClientState.operation='failed';reportClient('Client failure');notify({kind:'failure',side:'client',error:String(error)});}
};
