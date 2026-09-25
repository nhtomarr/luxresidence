// Avtomatik sitemap: hər sorğuda bazadan (Supabase) yaradılır, 1 saat keşlənir
const SUPA = 'https://avqchschbbltnnasabdm.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cWNoc2NoYmJsdG5uYXNhYmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NDA2NTAsImV4cCI6MjEwNTUxNjY1MH0.PVxxfLrj8KZH6AUaQQPx5sEqpiGEMDIFy3Mq206OMKI';
const BASE = 'https://luxresidence.az';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function isoDate(d) { const m = String(d || '').match(/(\d{2})\.(\d{2})\.(\d{4})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : null; }
export async function onRequest() {
  const today = new Date().toISOString().slice(0, 10);
  let apts = [], news = [];
  try {
    const r = await fetch(`${SUPA}/rest/v1/lux_kv?select=key,value&key=in.(lux_apartments,lux_news)`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, cf: { cacheTtl: 300 } });
    if (r.ok) for (const row of await r.json()) { if (row.key === 'lux_apartments' && Array.isArray(row.value)) apts = row.value; if (row.key === 'lux_news' && Array.isArray(row.value)) news = row.value; }
  } catch (e) {}
  const u = [];
  const add = (p, pr, cf, lm = today) => u.push(`  <url><loc>${esc(BASE + p)}</loc><lastmod>${lm}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`);
  add('/', '1.0', 'weekly'); add('/planlar', '0.9', 'daily'); add('/secim', '0.8', 'weekly'); add('/3d', '0.7', 'weekly');
  add('/haqqimizda', '0.7', 'monthly'); add('/infrastruktur', '0.7', 'monthly'); add('/xeberler', '0.8', 'weekly'); add('/elaqe', '0.6', 'monthly');
  apts.filter((a) => a && !a.hidden && a.id != null).forEach((a) => add(`/apt/${a.id}`, '0.7', 'weekly'));
  news.filter((n) => n && (n.slug || n.id != null)).forEach((n) => add(`/xeber/${n.slug || n.id}`, '0.6', 'monthly', isoDate(n.date) || today));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${u.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
