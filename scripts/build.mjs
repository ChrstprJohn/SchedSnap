import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { CREATOR_PATH, SEO_PAGES, SITE_URL } from '../shared/seo.js';
import { replaceSeoHead } from './seo-html.mjs';

await build({ build: { manifest: true } });
const output = resolve('dist');
const manifest = JSON.parse(await readFile(resolve(output, '.vite/manifest.json'), 'utf8'));
const renderDirectory = resolve(output, '.seo-render');
if (dirname(renderDirectory) !== output) throw new Error('Unsafe prerender cleanup path');
try {
  await build({
    configFile: false,
    plugins: [react()],
    build: {
      ssr: 'src/seo/prerender.jsx',
      outDir: renderDirectory,
      copyPublicDir: false,
      rollupOptions: { output: { entryFileNames: 'render.mjs' } },
    },
  });
  const { renderPage } = await import(pathToFileURL(resolve(renderDirectory, 'render.mjs')).href);
  const shell = await readFile(resolve(output, 'index.html'), 'utf8');
  for (const path of Object.keys(SEO_PAGES)) {
    const target = path === '/' ? resolve(output, 'index.html') : resolve(output, path.slice(1), 'index.html');
    const markup = renderPage(path);
    if (path !== CREATOR_PATH && !markup.includes('<h1')) throw new Error(`No heading in prerendered ${path}`);
    let html = replaceSeoHead(shell, path).replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`);
    if (path === '/terms' || path === '/privacy') {
      const css = manifest['src/pages/Legal.jsx']?.css || [];
      html = html.replace('</head>', () => `${css.map(file => `<link rel="stylesheet" href="/${file}" />`).join('\n')}\n</head>`);
    }
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
  }
  // Editor and admin routes must never fall back to the homepage's canonical/content.
  await writeFile(resolve(output, 'app.html'), replaceSeoHead(shell, `${CREATOR_PATH}/editor`));
  await writeFile(resolve(output, 'admin.html'), replaceSeoHead(shell, '/admin'));
  const urls = Object.keys(SEO_PAGES).map(path => `  <url><loc>${SITE_URL}${path}</loc></url>`).join('\n');
  await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  console.log('SEO: prerendered public pages and generated sitemap.xml, robots.txt, and private route shells.');
} finally {
  // This exact temporary directory is inside the validated build output, never node_modules.
  await rm(renderDirectory, { recursive: true, force: true });
}
