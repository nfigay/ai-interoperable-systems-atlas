import {describe,it,expect,vi} from 'vitest';
import {fcoseOptions,fitVisible} from '../src/layout/fcose-profiles.js';
describe('fCoSE shared profiles',()=>{
  it('initial placements use documented default + randomized mode',()=>{
    for(const p of ['concept','composition']){
      const o=fcoseOptions(p); expect(o).toMatchObject({name:'fcose',quality:'default',randomize:true,fit:false,nodeDimensionsIncludeLabels:false,packComponents:false});
    }
  });
  it('incremental refinement uses proof when randomize is false',()=>{
    const o=fcoseOptions('concept','refine');expect(o).toMatchObject({quality:'proof',randomize:false,nodeDimensionsIncludeLabels:true});
  });
  it('rejects accidental unsupported profiles and phases',()=>{
    expect(()=>fcoseOptions('other')).toThrow();expect(()=>fcoseOptions('concept','wrong')).toThrow();
  });
  it('fits visible elements without running a layout or altering selection',()=>{
    const eles={length:3},cy={resize:vi.fn(),elements:vi.fn(()=>eles),fit:vi.fn()};
    fitVisible(cy,55);expect(cy.resize).toHaveBeenCalledOnce();expect(cy.elements).toHaveBeenCalledWith(':visible');expect(cy.fit).toHaveBeenCalledWith(eles,55);
  });
});
