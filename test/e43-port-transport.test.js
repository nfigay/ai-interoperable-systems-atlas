import {test,expect} from 'vitest';
import {MessageChannel} from 'node:worker_threads';
import {PortTransport,describeMessage} from '../src/e43/port-transport.mjs';
test('deux ports transfèrent une requête réelle sans la synthétiser',async()=>{
  const {port1,port2}=new MessageChannel();const observations=[];
  const c=new PortTransport(port1,e=>observations.push(e),'client');
  const s=new PortTransport(port2,e=>observations.push(e),'server');
  const request={jsonrpc:'2.0',id:7,method:'tools/list'};
  const received=new Promise(resolve=>{s.onmessage=resolve});
  await c.start();await s.start();await c.send(request);
  expect(await received).toEqual(request);
  expect(observations.map(o=>o.direction)).toEqual(['sent','received']);
  await c.close();await s.close();
});
test('messages distingués : requête, notification, réponse, erreur',()=>{
  expect(describeMessage({method:'tools/list',id:1}).class).toBe('request');
  expect(describeMessage({method:'notifications/initialized'}).class).toBe('notification');
  expect(describeMessage({id:1,result:{}}).class).toBe('response');
  expect(describeMessage({id:1,error:{code:-32601}}).class).toBe('rpc-error');
});
