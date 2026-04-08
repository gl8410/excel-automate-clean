import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const frontendPort = parseInt(env.FRONTENDPORT || '7804', 10);
    const backendPort = parseInt(env.BACKENDPORT || '6804', 10);
    return {
      server: {
        port: frontendPort,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: `http://localhost:${backendPort}`,
            changeOrigin: true,
          }
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
