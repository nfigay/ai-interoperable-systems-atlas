import { test } from 'vitest';import assert from 'node:assert/strict';
import {runLesson,parseState,stateHash,CONNECTION,SOURCES} from '../src/e42/lesson.mjs';
test('notification indispensable entre initialisation et outils',()=>{const r=runLesson();assert.deepEqual(r.messages.map(m=>m.operation).slice(0,4),['initialize','initialize response','notifications/initialized','tools/list']);});
test('traçabilité constante pour chaque échange',()=>{for(const m of runLesson().messages){assert.equal(m.connection,CONNECTION.id);assert.ok(SOURCES[m.source]);assert.ok(m.comment);}});
test('résultat outil différent erreur protocole',()=>{const a=runLesson({caseId:'tool-error'}).messages.at(-1).message;const b=runLesson({caseId:'rpc-error'}).messages.at(-1).message;assert.equal(a.result.isError,true);assert.ok(b.error);assert.ok(!a.error);});
test('aucun protocole réel ou conformité revendiquée',()=>{const r=runLesson();assert.equal(r.transport,'none');assert.equal(r.conformance,'not-assessed');assert.equal(r.simulation,true);});
test('fragment partageable et borné',()=>{const h=stateHash({step:'prototype',caseId:'rpc-error',text:'bonjour',message:6});assert.deepEqual(parseState(h),{step:'prototype',caseId:'rpc-error',text:'bonjour',message:6});assert.equal(parseState('#voyage-agent-mcp?case=evil&message=999').caseId,'ok');});
test('n’accepte pas les entrées sans borne',()=>assert.throws(()=>runLesson({text:'a'.repeat(161)})));
