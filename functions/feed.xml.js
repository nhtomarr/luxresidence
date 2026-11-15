// Bloq üçün RSS lenti: hər sorğuda bazadan (lux_news) yaradılır, 1 saat keşlənir
import { kv, BASE } from '../functions-lib/seo.js';
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function rfc(d) { const m = String(d || '').match(/(\d{2})\.(\d{2})\.(\d{4})/); return m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], 6, 0)).toUTCString() : null; }
export async function onRequest() {
  let news = [];
  try { const l = await kv('lux_news'); if (Array.isArray(l)) news = l; } catch (e) {}
  const items = news.filter((n) => n && (n.slug || n.id != null) && n.title).slice(0, 40).map((n) => {
    const u = `${BASE}/xeber/${n.slug || n.id}`, pd = rfc(n.date);
    return `<item><title>${esc(n.title)}</title><link>${esc(u)}</link><guid isPermaLink="true">${esc(u)}</guid>${pd ? `<pubDate>${pd}</pubDate>` : ''}<description>${esc(n.excerpt || '')}</description></item>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>LUX Residence — bloq</title><link>${BASE}/xeberler</link><atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/><description>Yeni tikili, ipoteka və mənzil seçimi barədə yazılar</description><language>az</language>\n${items}\n</channel></rss>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
