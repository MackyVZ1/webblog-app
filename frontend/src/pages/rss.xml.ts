import type { APIRoute } from 'astro';
import { apiFetch, type ArticleList } from '../lib/api';

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] || char);

export const GET: APIRoute = async ({ site }) => {
  const articles = await apiFetch<ArticleList>('/articles?limit=30');
  const base = site || new URL('http://localhost:4321');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Pulse &amp; Pixel</title>
  <link>${base.toString()}</link>
  <description>Ideas for a more thoughtful tomorrow</description>
  <language>th</language>
  ${articles.items.map((item) => `<item><title>${escapeXml(item.title)}</title><link>${new URL(`/articles/${item.slug}`, base).toString()}</link><guid>${new URL(`/articles/${item.slug}`, base).toString()}</guid><pubDate>${new Date(item.publishedAt || item.createdAt).toUTCString()}</pubDate><description>${escapeXml(item.excerpt)}</description></item>`).join('')}
</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
