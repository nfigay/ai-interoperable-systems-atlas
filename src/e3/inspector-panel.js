export const INSPECTOR_WIDTHS = Object.freeze({ narrow: 320, normal: 420, wide: 520 });
const ORDER = ['narrow', 'normal', 'wide'];

export function createInspectorState(initial = {}) {
  const width = ORDER.includes(initial.width) ? initial.width : 'normal';
  return {
    collapsed: Boolean(initial.collapsed),
    revealed: Boolean(initial.revealed),
    autoReveal: initial.autoReveal !== false,
    width
  };
}

export function nextInspectorWidth(current) {
  const index = ORDER.indexOf(current);
  return ORDER[(index + 1 + ORDER.length) % ORDER.length];
}

export function inspectorLayoutState(state) {
  const width = INSPECTOR_WIDTHS[state.width] ?? INSPECTOR_WIDTHS.normal;
  const visible = !state.collapsed || state.revealed;
  return { visible, width };
}

export function inspectorWidthLabel(width) {
  return width === 'narrow' ? 'narrow' : width === 'wide' ? 'large' : 'normal';
}
