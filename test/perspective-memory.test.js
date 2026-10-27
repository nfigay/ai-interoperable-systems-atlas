import {describe,it,expect} from 'vitest';
import {createPerspectiveMemory} from '../src/e3/perspective-memory.js';

describe('per-perspective navigation memory',()=>{
  it('keeps direct and recursive perspectives separate',()=>{
    const m=createPerspectiveMemory();
    m.save('comp:reference|direct',{positions:[{id:'occ:ref-client',position:{x:10,y:20}}],zoom:1.2,pan:{x:2,y:3},collapsed:['comp:reference']});
    expect(m.get('comp:reference|hierarchy|decomposition|8')).toBeNull();
    expect(m.get('comp:reference|direct').positions[0].position.x).toBe(10);
  });
  it('does not expose mutable internal references',()=>{
    const m=createPerspectiveMemory();
    const data={positions:[{id:'x',position:{x:1,y:2}}],zoom:1,pan:{x:0,y:0},collapsed:['x']};
    m.save('a',data);data.positions[0].position.x=99;
    const read=m.get('a');read.collapsed.push('y');read.pan.x=99;
    expect(m.get('a')).toMatchObject({positions:[{position:{x:1,y:2}}],collapsed:['x'],pan:{x:0,y:0}});
  });
  it('requires an identity key',()=>expect(()=>createPerspectiveMemory().save('',{})).toThrow());
});
