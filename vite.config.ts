import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    // ✅ GitHub Pages 專案站點：一定要加 base（要和 repo 名完全一致）
    base: '/Today-s-EATS/',

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [react()],

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        // ✅ 建議：通常是指到 src，不是指到 '.'
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});

