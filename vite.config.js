import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages hosts this project under /Lele/; local preview stays at /.
  base: process.env.GITHUB_ACTIONS ? '/Lele/' : '/',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
