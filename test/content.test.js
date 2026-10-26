import { describe,it,expect } from 'vitest';
import { pages } from '../src/content.js';
describe('atlas content',()=>{
 it('has a landing page',()=>expect(pages.some(p=>p.id==='index')).toBe(true));
 it('has distinct stable page paths',()=>expect(new Set(pages.map(p=>p.id)).size).toBe(pages.length));
 it('does not publish empty documents',()=>expect(pages.every(p=>p.content.trim().length>20)).toBe(true));
});
