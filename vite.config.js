import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths work on Cloudflare, locally, and under GitHub Pages /Lele/.
  base: './',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    // During `npm run dev`, forward API calls to the Cloudflare Worker (`npm run cloudflare:dev`).
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
});
