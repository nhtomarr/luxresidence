import { kv, abs, page, BASE } from '../../functions-lib/seo.js';
function iso(d) { const m = String(d || '').match(/(\d{2})\.(\d{2})\.(\d{4})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined; }
export async function onRequest(ctx) {
  try {
    const k = String(ctx.params.slug || '');
    const list = await kv('lux_news');
    const n = Array.isArray(list) ? list.find((x) => (x.slug && x.slug === k) || String(x.id) === k) : null;
    if (!n) { const r = await ctx.env.ASSETS.fetch(new URL('/', ctx.request.url)); const h = new Headers(r.headers); h.set('X-Robots-Tag', 'noindex'); return new Response(r.body, { status: 404, headers: h }); }
    const title = `${n.title} | LUX Residence`;
    const desc = n.excerpt || String(n.body || '').slice(0, 160);
    const img = n.img && String(n.img).indexOf('data:') !== 0 ? abs(n.img) : BASE + '/assets/og-cover.jpg';
    const url = `${BASE}/xeber/${n.slug || n.id}`;
    const ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: n.title, description: desc, keywords: (n.tags || []).join(', '), inLanguage: 'az',
      datePublished: iso(n.date), image: img, mainEntityOfPage: url, author: { '@type': 'Organization', name: 'LUX Residence' }, publisher: { '@type': 'Organization', name: 'LUX Residence', logo: { '@type': 'ImageObject', url: BASE + '/assets/img5.png' } } };
    return page(ctx, { title, desc, url, image: img, ld, ldId: 'ldNews', type: 'article', crumbs: [['Ana səhifə', '/'], ['Xəbərlər', '/xeberler'], [n.title, `/xeber/${n.slug || n.id}`]] });
  } catch (e) { return ctx.env.ASSETS.fetch(new URL('/', ctx.request.url)); }
}
