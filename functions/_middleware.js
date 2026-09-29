// 1) www.luxresidence.az → luxresidence.az (301)
// 2) Əsas SPA səhifələri üçün serverdə düzgün başlıq, təsvir və canonical (Google ilk HTML-də görsün)
const BASE = 'https://luxresidence.az';
const OFFICE_PRIMARY = 'ofis.pilothayat.az';
const OFFICE_HOSTS = new Set([OFFICE_PRIMARY]);
const OFFICE_LIVE = true;
const OFFICE_MANIFEST = JSON.stringify({ name: 'Baş Ofis', short_name: 'Ofis', start_url: '/', scope: '/', display: 'standalone', background_color: '#081634', theme_color: '#081634', lang: 'az',
  icons: [{ src: '/assets/ofis/icon-192.png?v=2', sizes: '192x192', type: 'image/png' }, { src: '/assets/ofis/icon-512.png?v=2', sizes: '512x512', type: 'image/png' }, { src: '/assets/ofis/icon-maskable.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] });
async function officeHost(ctx, url) {
  const p = url.pathname;
  const noindex = (r) => { const h = new Headers(r.headers); h.set('X-Robots-Tag', 'noindex, nofollow'); return new Response(r.body, { status: r.status, headers: h }); };
  if (p === '/' || p === '/index.html' || p === '/ofis' || p === '/ofis.html') {
    const r = await ctx.env.ASSETS.fetch(new Request(new URL('/ofis', url).toString(), ctx.request));
    return noindex(r);
  }
  if (p === '/favicon.ico' || p === '/favicon.svg' || p === '/favicon.png') return Response.redirect(url.origin + '/assets/ofis/favicon-64.png?v=2', 302);
  if (p === '/apple-touch-icon.png') return ctx.env.ASSETS.fetch(new Request(new URL('/assets/ofis/apple-touch.png', url).toString()));
  if (p === '/ofis.webmanifest') return new Response(OFFICE_MANIFEST, { headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=3600' } });
  if (p === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain' } });
  if (p === '/ofis-sw.js' || p.startsWith('/assets/ofis/') || p.startsWith('/assets/lux-auth.js') || p.startsWith('/favicon') || p === '/apple-touch-icon.png') return ctx.next();
  return Response.redirect(url.origin + '/', 302);
}
const PAGES = {
  '/planlar': ['Mənzil planları — 1, 2, 3, 4 otaqlı yeni tikili mənzillər | LUX Residence', 'LUX Residence mənzil planları: 1, 2, 3 və 4 otaqlı mənzillər, sahə və mərtəbə üzrə filtr, 3D planlar, 0% daxili kredit.'],
  '/secim': ['İnteraktiv seçim — binanı və mərtəbəni seçin | LUX Residence', 'Binanı və mərtəbəni interaktiv seçin, satışda olan mənzilləri dərhal görün. LUX Residence, Yasamal, Bakı.'],
  '/haqqimizda': ['Haqqımızda — LUX Residence yaşayış kompleksi | Yasamal, Bakı', 'LUX Residence haqqında: müasir memarlıq, geniş yaşıllıq, yeni tikili mənzillər və Elmlər Akademiyası metrosuna yaxınlıq.'],
  '/infrastruktur': ['İnfrastruktur — metro, məktəb, park yaxınlığı | LUX Residence', 'LUX Residence ətrafındakı infrastruktur: Elmlər Akademiyası metrosu, məktəblər, marketlər, parklar və gündəlik ehtiyaclar üçün hər şey yaxınlıqda.'],
  '/xeberler': ['Bloq — yeni tikili, ipoteka və mənzil seçimi məsləhətləri | LUX Residence', 'Mənzil alarkən bilməli olduğunuz hər şey: kupça, ipoteka, müqavilə, tikinti keyfiyyəti və mənzil seçimi barədə faydalı yazılar.'],
  '/suallar': ['Tez-tez verilən suallar — ödəniş, təhvil, parkinq | LUX Residence', 'LUX Residence haqqında ən çox verilən suallar: daxili kredit, təhvil, parkinq, təhlükəsizlik, infrastruktur və mənzilə baxış.'],
  '/elaqe': ['Əlaqə — satış ofisi, ünvan və telefon | LUX Residence', 'LUX Residence satış ofisi ilə əlaqə: +994 50 809 00 88. Ünvan: Yasamal rayonu, Elmlər Akademiyası metrosu yaxınlığı, Bakı.'],
};
const NOINDEX = new Set(['/muqayise', '/sevimliler']);
class Meta { constructor(v) { this.v = v; } element(el) { el.setAttribute('content', this.v); } }
class Href { constructor(v) { this.v = v; } element(el) { el.setAttribute('href', this.v); } }
class Title { constructor(v) { this.v = v; } element(el) { el.setInnerContent(this.v); } }
class Append { constructor(h) { this.h = h; } element(el) { el.append(this.h, { html: true }); } }
const LEAD = { 1: 'geniş planlı 3 və 4 otaqlı mənzillər', 3: '3, 4, 5 və 6-cı binalarla ortaq mənzil planları', 4: '3, 4, 5 və 6-cı binalarla ortaq mənzil planları', 5: '3, 4, 5 və 6-cı binalarla ortaq mənzil planları', 6: '3, 4, 5 və 6-cı binalarla ortaq mənzil planları', 10: '1 və 3 otaqlı mənzillər', 11: '1 və 3 otaqlı mənzillər' };
export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  // ---- Baş Ofis ayrıca domendə (ofis.pilothayat.az): yalnız ofis sistemi açılır ----
  if (OFFICE_HOSTS.has(url.hostname)) return officeHost(ctx, url);
  // köhnə ünvan → yeni domen (domen aktiv olandan sonra OFFICE_LIVE=true)
  if (OFFICE_LIVE && (url.pathname === '/ofis' || url.pathname === '/ofis.html')) return Response.redirect('https://' + OFFICE_PRIMARY + '/' + url.search, 301);
  if (url.hostname === 'www.luxresidence.az') { url.hostname = 'luxresidence.az'; return Response.redirect(url.toString(), 301); }
  const res = await ctx.next();
  const path = url.pathname.replace(/\/+$/, '') || '/';
  let p = PAGES[path];
  const bm = path.match(/^\/bina-(\d+)$/);
  if (bm) { const n = +bm[1]; p = [`Bina ${n} — 1–4 otaqlı mənzillər, planlar | LUX Residence`, `LUX Residence Bina ${n}: ${LEAD[n] || 'yaşayış binası'}, 3D planlar və eksplikasiya. Yasamal, Elmlər Akademiyası metrosu yaxınlığı. 0% daxili kredit.`]; }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html') || (!p && !NOINDEX.has(path))) return res;
  let rw = new HTMLRewriter();
  if (p) {
    const u = BASE + path;
    rw = rw.on('title', new Title(p[0])).on('meta[name="description"]', new Meta(p[1]))
      .on('meta[property="og:title"]', new Meta(p[0])).on('meta[property="og:description"]', new Meta(p[1]))
      .on('meta[name="twitter:title"]', new Meta(p[0])).on('meta[name="twitter:description"]', new Meta(p[1]))
      .on('meta[property="og:url"]', new Meta(u)).on('link[rel="canonical"]', new Href(u));
    if (path === '/suallar') {
      try {
        const f = await (await ctx.env.ASSETS.fetch(new URL('/assets/faq.json', ctx.request.url))).json();
        const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: f.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) };
        rw = rw.on('head', new Append(`<script type="application/ld+json" id="ldFaq">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`));
      } catch (e) {}
    }
  } else {
    rw = rw.on('meta[name="robots"]', new Meta('noindex, follow'));
  }
  return rw.transform(res);
}
