import { defineConfig } from 'vite';
export default defineConfig({
  base: process.env.ATLAS_BASE || '/ai-interoperable-systems-atlas/',
  test: { environment: 'node' }
});
