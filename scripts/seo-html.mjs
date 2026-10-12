import { SITE_URL, getPageSeo, websiteSchema } from '../shared/seo.js';

const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function seoHead(path) {
  const page = getPageSeo(path);
  const image = `${SITE_URL}/images/hero/hero-phones-refreshed.png`;
  return `<!--seo-start-->
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="${page.index ? 'index, follow' : 'noindex, follow'}" />
    ${page.canonical ? `<link rel="canonical" href="${page.canonical}" />` : ''}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SchedSnap" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${page.canonical || `${SITE_URL}${path}`}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="SchedSnap class schedule wallpaper previews" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${image}" />
    ${path === '/' ? `<script id="website-schema" type="application/ld+json">${JSON.stringify(websiteSchema).replaceAll('<', '\\u003c')}</script>` : ''}
    <!--seo-end-->`;
}

export function replaceSeoHead(html, path) {
  return html.replace(/<!--seo-start-->[\s\S]*?<!--seo-end-->/, () => seoHead(path));
}
