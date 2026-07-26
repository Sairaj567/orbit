import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (
            normalized.includes('node_modules/react/') ||
            normalized.includes('node_modules/react-dom/') ||
            normalized.includes('node_modules/react-router/') ||
            normalized.includes('node_modules/react-is/') ||
            normalized.includes('node_modules/scheduler/')
          ) {
            return 'vendor';
          }
          if (
            normalized.includes('node_modules/@tanstack/react-query/') ||
            normalized.includes('node_modules/@tanstack/query-core/')
          ) {
            return 'query';
          }
          if (
            normalized.includes('node_modules/framer-motion/') ||
            normalized.includes('node_modules/motion-dom/') ||
            normalized.includes('node_modules/motion-utils/')
          ) {
            return 'motion';
          }
        },
      },
    },
  },
});
