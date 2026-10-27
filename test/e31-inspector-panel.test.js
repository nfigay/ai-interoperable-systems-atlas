import { describe, expect, it } from 'vitest';
import { createInspectorState, nextInspectorWidth, inspectorLayoutState, inspectorWidthLabel } from '../src/e3/inspector-panel.js';

describe('E3 inspector panel helpers', () => {
  it('normalises state defaults', () => {
    expect(createInspectorState()).toEqual({ collapsed: false, revealed: false, autoReveal: true, width: 'normal' });
    expect(createInspectorState({ width: 'huge', autoReveal: false })).toEqual({ collapsed: false, revealed: false, autoReveal: false, width: 'normal' });
  });

  it('cycles widths predictably', () => {
    expect(nextInspectorWidth('narrow')).toBe('normal');
    expect(nextInspectorWidth('normal')).toBe('wide');
    expect(nextInspectorWidth('wide')).toBe('narrow');
  });

  it('derives visible layout state', () => {
    expect(inspectorLayoutState(createInspectorState({ collapsed: true }))).toEqual({ visible: false, width: 420 });
    expect(inspectorLayoutState(createInspectorState({ collapsed: true, revealed: true, width: 'wide' }))).toEqual({ visible: true, width: 520 });
  });

  it('provides reader-friendly width labels', () => {
    expect(inspectorWidthLabel('narrow')).toBe('narrow');
    expect(inspectorWidthLabel('normal')).toBe('normal');
    expect(inspectorWidthLabel('wide')).toBe('large');
  });
});
