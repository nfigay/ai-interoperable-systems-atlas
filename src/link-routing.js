// Reader navigation rules; resource identity remains governed by the landscape registry.
function normalizedSegments(path) {
  const parts = [];
  for (const segment of path.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (!parts.length) return null; // Do not resolve outside docs root.
      parts.pop();
    } else parts.push(segment);
  }
  return parts.join('/');
}

export function resolveAtlasLink(href, pageIds, currentId = 'index') {
  const raw = String(href ?? '').trim();
  if (!raw || /^(?:javascript|data|vbscript):/i.test(raw)) return { kind: 'blocked' };
  if (/^(?:https?:)?\/\//i.test(raw) || /^mailto:/i.test(raw)) return { kind: 'external', href: raw };
  if (raw.startsWith('#')) {
    const candidate = decodeURIComponent(raw.slice(1));
    const id = candidate.split('?')[0];
    if (pageIds.has(id) || id === 'concept-map') return { kind: 'internal', href: `#${encodeURIComponent(id)}` };
    return { kind: 'anchor', href: raw };
  }
  const [path, anchor = ''] = raw.split('#');
  if (!path && anchor) return { kind: 'anchor', href: `#${anchor}` };
  const documentPath = path.replace(/^docs\//, '').replace(/\.md$/i, '');
  const currentDir = currentId.includes('/') ? currentId.slice(0, currentId.lastIndexOf('/') + 1) : '';
  const relative = normalizedSegments(currentDir + documentPath);
  const rooted = normalizedSegments(documentPath);
  // First respect the current Markdown document's directory; permit root-based
  // references where existing Atlas documents use them.
  const id = [relative, rooted].find(candidate => candidate !== null && pageIds.has(candidate));
  if (id) return { kind: 'internal', href: `#${encodeURIComponent(id)}${anchor ? `?anchor=${encodeURIComponent(anchor)}` : ''}` };
  return { kind: 'unresolved', href: raw };
}
