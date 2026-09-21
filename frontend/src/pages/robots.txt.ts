import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site || new URL('http://localhost:4321');
  const body = `User-agent: *
Allow: /
Disallow: /admin
Sitemap: ${new URL('/sitemap.xml', base).toString()}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

