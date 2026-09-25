// Cloudflare Pages Functions üçün ortaq SEO köməkçiləri
export const SUPA = 'https://avqchschbbltnnasabdm.supabase.co';
export const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cWNoc2NoYmJsdG5uYXNhYmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NDA2NTAsImV4cCI6MjEwNTUxNjY1MH0.PVxxfLrj8KZH6AUaQQPx5sEqpiGEMDIFy3Mq206OMKI';
export const BASE = 'https://luxresidence.az';
export async function kv(key) {
  const r = await fetch(`${SUPA}/rest/v1/lux_kv?select=value&key=eq.${key}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cf: { cacheTtl: 120 } });
  if (!r.ok) return null; const j = await r.json(); return j && j[0] ? j[0].value : null;
}
export const abs = (p) => !p ? null : /^https?:/.test(p) ? p : BASE + (String(p).charAt(0) === '/' ? p : '/' + p);
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
class Meta { constructor(v) { this.v = v; } element(el) { el.setAttribute('content', this.v); } }
class Href { constructor(v) { this.v = v; } element(el) { el.setAttribute('href', this.v); } }
class Title { constructor(v) { this.v = v; } element(el) { el.setInnerContent(this.v); } }
class Append { constructor(h) { this.h = h; } element(el) { el.append(this.h, { html: true }); } }
export async function page(ctx, seo) {
  const res = await ctx.env.ASSETS.fetch(new URL('/', ctx.request.url));
  const r = new HTMLRewriter()
    .on('title', new Title(seo.title))
    .on('meta[name="description"]', new Meta(seo.desc))
    .on('meta[name="twitter:title"]', new Meta(seo.title))
    .on('meta[name="twitter:description"]', new Meta(seo.desc))
    .on('meta[name="twitter:image"]', new Meta(seo.image))
    .on('meta[property="og:title"]', new Meta(seo.title))
    .on('meta[property="og:description"]', new Meta(seo.desc))
    .on('meta[property="og:url"]', new Meta(seo.url))
    .on('meta[property="og:image"]', new Meta(seo.image))
    .on('meta[property="og:image:alt"]', new Meta(seo.title))
    .on('meta[property="og:type"]', new Meta(seo.type || 'website'))
    .on('link[rel="canonical"]', new Href(seo.url))
    .on('head', new Append(`<script type="application/ld+json" id="${seo.ldId}">${JSON.stringify(seo.ld).replace(/</g, '\\u003c')}</script>` ))
    .on('body', new Append(`<noscript><h1>${attr(seo.title)}</h1><p>${attr(seo.desc)}</p></noscript>`));
  const out = r.transform(res);
  const h = new Headers(out.headers); h.set('Cache-Control', 'public, max-age=300');
  return new Response(out.body, { status: 200, headers: h });
}
export async function exists(ctx, path) { try { const r = await ctx.env.ASSETS.fetch(new URL(path, ctx.request.url), { method: 'HEAD' }); return r.ok; } catch (e) { return false; } }
