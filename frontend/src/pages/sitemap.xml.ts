import type { APIRoute } from 'astro';
import { apiFetch, type ArticleList, type Category } from '../lib/api';

export const GET: APIRoute = async ({ site }) => {
  const [articles, categories] = await Promise.all([
    apiFetch<ArticleList>('/articles?limit=50'),
    apiFetch<Category[]>('/categories'),
  ]);
  const base = site || new URL('http://localhost:4321');
  const urls = [
    { loc: new URL('/', base), lastmod: new Date() },
    { loc: new URL('/about', base), lastmod: new Date() },
    ...categories.map((item) => ({ loc: new URL(`/categories/${item.slug}`, base), lastmod: new Date() })),
    ...articles.items.map((item) => ({ loc: new URL(`/articles/${item.slug}`, base), lastmod: new Date(item.updatedAt) })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, lastmod }) => `  <url><loc>${loc.toString()}</loc><lastmod>${lastmod.toISOString()}</lastmod></url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};

