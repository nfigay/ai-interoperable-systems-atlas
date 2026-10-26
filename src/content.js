// A single maintained source: docs/*.md. Vite bundles documents as raw text at build time.
export const pages = Object.entries(import.meta.glob('../docs/**/*.md', { eager: true, query: '?raw', import: 'default' }))
  .map(([path, content]) => ({
    id: path.replace('../docs/', '').replace(/\.md$/, ''),
    title: String(content).match(/^#\s+(.+)$/m)?.[1] || path,
    content: String(content)
  }))
  .sort((a,b) => (a.id === 'index' ? -1 : b.id === 'index' ? 1 : a.id.localeCompare(b.id)));
