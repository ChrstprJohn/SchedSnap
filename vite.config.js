import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { localApiPlugin } from './development/apiPlugin.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'GEMINI_');
  return { plugins: [react(), tailwindcss(), localApiPlugin({ ...env, ...process.env })] };
});
