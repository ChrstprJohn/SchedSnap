import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { localApiPlugin } from './development/apiPlugin.js';
import { replaceSeoHead } from './scripts/seo-html.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['GEMINI_', 'UPSTASH_', 'ADMIN_', 'CLOUDINARY_', 'POSTHOG_']);
  return {
    plugins: [react(), tailwindcss(), localApiPlugin({ ...env, ...process.env }), {
      name: 'page-seo',
      transformIndexHtml: html => replaceSeoHead(html, '/'),
    }],
    server: {
      // Export audits write progress and screenshots repeatedly. They are not app inputs.
      watch: { ignored: path => /\/(?:\.impeccable|graphify-out|tmp)(?:\/|$)/.test(path.replaceAll('\\', '/')) },
    },
  };
});
