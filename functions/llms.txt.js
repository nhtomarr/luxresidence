// AI axtarışları üçün sayt xülasəsi (llms.txt): bazadan və saytın öz məzmunundan yığılır, 1 saat keşlənir.
// Qiymət, mərtəbə və satış statusu bura yazılmır.
import { kv, BASE } from '../functions-lib/seo.js';
const azn = (v) => String(v).replace('.', ',');
export async function onRequest(ctx) {
  let apts = [], news = [], faq = [];
  try { const a = await kv('lux_apartments'); if (Array.isArray(a)) apts = a.filter((x) => x && !x.hidden && x.id != null); } catch (e) {}
  try { const n = await kv('lux_news'); if (Array.isArray(n)) news = n.filter((x) => x && x.title && (x.slug || x.id != null)); } catch (e) {}
  try { faq = await (await ctx.env.ASSETS.fetch(new URL('/assets/faq.json', ctx.request.url))).json(); } catch (e) {}
  const types = [1, 2, 3, 4].map((n) => { const l = apts.filter((a) => (Number(a.rooms) >= 4 ? 4 : Number(a.rooms)) === n).map((a) => Number(a.area)).sort((x, y) => x - y); return l.length ? `- [${n} otaqlı mənzillər](${BASE}/${n}-otaqli-menziller): ${l.length} plan, ${l.length > 1 ? `${azn(l[0])}–${azn(l[l.length - 1])}` : azn(l[0])} m²` : null; }).filter(Boolean);
  const out = [
    '# LUX Residence', '',
    '> LUX Residence — Bakıda, Yasamal rayonunda, Elmlər Akademiyası metrosunun yaxınlığında 11 binalı yeni tikili yaşayış kompleksi. Rəsmi sayt: ' + BASE, '',
    '## Əsas məlumat',
    '- Ünvan: Ə.Ələkbərov, M.Müşfiq, S.Dağlı və İ.Qutqaşınlı küçələrinin kəsişməsi, Yasamal rayonu, Bakı',
    '- Satış ofisi: +994 50 809 00 88, +994 50 700 00 88; luxresidence.az@gmail.com',
    '- Ödəniş: 0% daxili kredit; mənzil qiymətləri sorğu ilə bildirilir',
    '- Kompleksdə: yaşıl həyət, uşaq meydançası, 7/24 mühafizə, yeraltı parking, lift', '',
    '## Mənzil tipləri', ...types, `- [Bütün planlar](${BASE}/planlar): filtr, sıralama, 3D planlar və eksplikasiya`, '',
    '## Səhifələr',
    `- [3D tur](${BASE}/3d): kompleksin interaktiv 3D modeli`,
    `- [İnteraktiv seçim](${BASE}/secim): binanı və mərtəbəni seçmək`,
    `- [İnfrastruktur](${BASE}/infrastruktur): metro, məktəb, market, park və xəritə`,
    `- [Haqqımızda](${BASE}/haqqimizda)`, `- [Tez-tez verilən suallar](${BASE}/suallar)`, `- [Əlaqə](${BASE}/elaqe)`, `- [Bloq](${BASE}/xeberler)`, `- [Русская версия](${BASE}/ru)`, '',
  ];
  if (Array.isArray(faq) && faq.length) { out.push('## Tez-tez verilən suallar'); faq.forEach((f) => { if (f && f.q && f.a) out.push(`- ${f.q} — ${f.a}`); }); out.push(''); }
  if (news.length) { out.push('## Bloq yazıları'); news.slice(0, 30).forEach((n) => out.push(`- [${n.title}](${BASE}/xeber/${n.slug || n.id})`)); out.push(''); }
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
