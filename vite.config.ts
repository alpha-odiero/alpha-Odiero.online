import {defineConfig} from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    host: '0.0.0.0',
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    hmr: process.env.DISABLE_HMR !== 'true',
    // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
  }
});
