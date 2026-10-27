import { describe, it, expect } from 'vitest';
import { DEFAULT_EXPLORATION, layoutSettings, collapseSettings } from '../src/exploration/controller.js';
describe('Animated exploration contract',()=>{
 it('uses agreed initial settings',()=>expect(DEFAULT_EXPLORATION).toEqual({animate:true,animationDuration:800,randomize:true,fit:false}));
 it('preserves fCoSE documented randomize / quality pairing',()=>{
  expect(layoutSettings('concept',{...DEFAULT_EXPLORATION,randomize:true})).toMatchObject({name:'fcose',quality:'default',randomize:true,animate:true,animationDuration:800,fit:false});
  expect(layoutSettings('composition',{...DEFAULT_EXPLORATION,randomize:false})).toMatchObject({name:'fcose',quality:'proof',randomize:false,animate:true,fit:false});
 });
 it('uses one coordinated extension layout, typed edge grouping',()=>{
  const c=collapseSettings('composition');
  expect(c).toMatchObject({animate:true,animationDuration:800,groupEdgesOfSameTypeOnCollapse:true,fisheye:false,layoutBy:{name:'fcose',animate:true,fit:false}});
  expect(c.edgeTypeInfo({data:k=>({kind:'invokes'})[k]})).toBe('invokes');
 });
});
