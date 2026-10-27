import {describe,it,expect} from 'vitest';
import {pages,readerPages,internalDocument} from '../src/content.js';
describe('Public Atlas navigation',()=>{
  it('keeps historical development records addressable but not in main navigation',()=>{
    expect(pages.some(p=>p.id==='E3-governed-configurations')).toBe(true);
    expect(readerPages.some(p=>p.id==='E3-governed-configurations')).toBe(false);
    expect(readerPages.every(p=>!internalDocument(p.id))).toBe(true);
  });
  it('publishes a stable reader entry for federated configurations',()=>{
    expect(readerPages.some(p=>p.id==='federated-configurations')).toBe(true);
    expect(readerPages.some(p=>p.id==='index')).toBe(true);
  });
});
