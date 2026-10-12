import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { getPageSeo, SITE_URL, websiteSchema } from '../../shared/seo.js';

export default function PageSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = getPageSeo(pathname);
    document.title = page.title;
    function meta(selector, attributes, content) {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        document.head.appendChild(element);
      }
      element.content = content;
    }
    meta('meta[name="description"]', { name: 'description' }, page.description);
    meta('meta[name="robots"]', { name: 'robots' }, page.index ? 'index, follow' : 'noindex, follow');
    meta('meta[property="og:title"]', { property: 'og:title' }, page.title);
    meta('meta[property="og:description"]', { property: 'og:description' }, page.description);
    meta('meta[property="og:url"]', { property: 'og:url' }, page.canonical || `${SITE_URL}${pathname}`);
    meta('meta[name="twitter:title"]', { name: 'twitter:title' }, page.title);
    meta('meta[name="twitter:description"]', { name: 'twitter:description' }, page.description);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (page.canonical) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = page.canonical;
    } else canonical?.remove();
    let schema = document.getElementById('website-schema');
    if (pathname === '/') {
      if (!schema) {
        schema = document.createElement('script');
        schema.id = 'website-schema';
        schema.type = 'application/ld+json';
        document.head.appendChild(schema);
      }
      schema.textContent = JSON.stringify(websiteSchema);
    } else schema?.remove();
  }, [pathname]);
  return null;
}
