import { describe, it, expect } from 'vitest';
import { resolveAtlasLink } from '../src/link-routing.js';
const ids = new Set(['index', 'references', 'glossary', 'journeys/01-landscape', 'journeys/02-laboratory']);
describe('Relative Markdown routing regression', () => {
  it('resolves a parent-relative reference', () => {
    expect(resolveAtlasLink('../references.md', ids, 'journeys/01-landscape')).toEqual({ kind: 'internal', href: '#references' });
  });
  it('resolves a sibling-relative journey', () => {
    expect(resolveAtlasLink('./02-laboratory.md', ids, 'journeys/01-landscape')).toEqual({ kind: 'internal', href: '#journeys%2F02-laboratory' });
  });
  it('preserves unresolved links rather than redirecting', () => {
    expect(resolveAtlasLink('../missing.md', ids, 'journeys/01-landscape')).toEqual({ kind: 'unresolved', href: '../missing.md' });
  });
});
