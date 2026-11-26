// 1) www.luxresidence.az → luxresidence.az (301)
// 2) Əsas SPA səhifələri üçün serverdə düzgün başlıq, təsvir və canonical (Google ilk HTML-də görsün)
import { kv } from '../functions-lib/seo.js';
const BASE = 'https://luxresidence.az';
const OFFICE_PRIMARY = 'ofis.pilothayat.az';
const OFFICE_HOSTS = new Set([OFFICE_PRIMARY]);
const OFFICE_LIVE = true;
const OFFICE_MANIFEST = JSON.stringify({ name: 'Baş Ofis', short_name: 'Ofis', start_url: '/', scope: '/', display: 'standalone', background_color: '#081634', theme_color: '#081634', lang: 'az',
  icons: [{ src: '/assets/ofis/icon-192.png?v=2', sizes: '192x192', type: 'image/png' }, { src: '/assets/ofis/icon-512.png?v=2', sizes: '512x512', type: 'image/png' }, { src: '/assets/ofis/icon-maskable.png?v=2', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] });
async function techizatHost(ctx, url) {
  const p = url.pathname;
  if (p === '/' || p === '/index.html' || p === '/techizat' || p === '/techizat.html') {
    const r = await ctx.env.ASSETS.fetch(new Request(new URL('/techizat', url).toString(), ctx.request));
    const h = new Headers(r.headers); h.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(r.body, { status: r.status, headers: h });
  }
  if (p === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain' } });
  if (p.startsWith('/assets/km/')) return ctx.next();
  return Response.redirect(url.origin + '/', 302);
}
// ---- Pilot Həyat şirkət saytı (pilothayat.az) ----
const PILOT_HOSTS = new Set(['pilothayat.az', 'www.pilothayat.az']);
async function pilotHost(ctx, url) {
  if (url.hostname === 'www.pilothayat.az') return Response.redirect('https://pilothayat.az' + url.pathname + url.search, 301);
  const p = url.pathname;
  if (p === '/' || p === '/index.html') return ctx.env.ASSETS.fetch(new Request(new URL('/pilot', url).toString(), ctx.request));
  if (p === '/pilot-mark.svg' || p === '/favicon.ico') return ctx.env.ASSETS.fetch(new Request(new URL('/pilot-mark.svg', url).toString(), ctx.request));
  if (p === '/robots.txt') return new Response('User-agent: *\nAllow: /\nSitemap: https://pilothayat.az/sitemap.xml\n', { headers: { 'Content-Type': 'text/plain' } });
  if (p === '/sitemap.xml') return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://pilothayat.az/</loc></url></urlset>', { headers: { 'Content-Type': 'application/xml' } });
  return Response.redirect('https://pilothayat.az/', 302);
}
// ---- Komendant sistemi ayrıca domendə (komendant.pilothayat.az) ----
async function komendantHost(ctx, url) {
  const p = url.pathname;
  const noindex = (r) => { const h = new Headers(r.headers); h.set('X-Robots-Tag', 'noindex, nofollow'); return new Response(r.body, { status: r.status, headers: h }); };
  if (p === '/' || p === '/index.html' || p === '/komendant' || p === '/komendant.html') return noindex(await ctx.env.ASSETS.fetch(new Request(new URL('/komendant' + url.search, url).toString(), ctx.request)));
  if (p === '/sakin' || p === '/sakin.html') return noindex(await ctx.env.ASSETS.fetch(new Request(new URL('/sakin' + url.search, url).toString(), ctx.request)));
  if (p === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain' } });
  if (p.startsWith('/assets/') || /^\/(komendant|sakin)\.webmanifest$/.test(p) || /^\/(favicon|apple-touch-icon)/.test(p) || p === '/bg.js') return ctx.next();
  return Response.redirect(url.origin + '/', 302);
}
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
  if (p === '/auth-ok') return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  if (p.startsWith('/iclock')) return ctx.next();
  if (p.startsWith('/app-bundle')) return ctx.next(); // mobil tətbiq üçün yerli paket
  if (p === '/ofis-sw.js' || p.startsWith('/assets/ofis/') || p.startsWith('/assets/lux-auth.js') || p.startsWith('/favicon') || p === '/apple-touch-icon.png') return ctx.next();
  return Response.redirect(url.origin + '/', 302);
}
const PAGES = {
  '/planlar': ['Mənzil planları — 1, 2, 3, 4 otaqlı yeni tikili mənzillər | LUX Residence', 'LUX Residence mənzil planları: 1, 2, 3 və 4 otaqlı mənzillər, sahə və mərtəbə üzrə filtr, 3D planlar, 0% daxili kredit.'],
  '/secim': ['İnteraktiv seçim — binanı və mərtəbəni seçin | LUX Residence', 'Binanı və mərtəbəni interaktiv seçin, satışda olan mənzilləri dərhal görün. LUX Residence, Yasamal, Bakı.'],
  '/haqqimizda': ['Haqqımızda — LUX Residence yaşayış kompleksi | Yasamal, Bakı', 'LUX Residence: Yasamalda 11 binalı yaşayış kompleksi. 700-dən çox mənzil, 16 plan (70–245 m²), yeraltı parkinq, 7/24 mühafizə, Elmlər Akademiyası metrosuna 5 dəqiqə.'],
  '/infrastruktur': ['İnfrastruktur — metro, məktəb, park yaxınlığı | LUX Residence', 'LUX Residence ətrafındakı infrastruktur: Elmlər Akademiyası metrosu, məktəblər, marketlər, parklar və gündəlik ehtiyaclar üçün hər şey yaxınlıqda.'],
  '/xeberler': ['Bloq — yeni tikili, ipoteka və mənzil seçimi məsləhətləri | LUX Residence', 'Mənzil alarkən bilməli olduğunuz hər şey: kupça, ipoteka, müqavilə, tikinti keyfiyyəti və mənzil seçimi barədə faydalı yazılar.'],
  '/suallar': ['Tez-tez verilən suallar — ödəniş, təhvil, parkinq | LUX Residence', 'LUX Residence haqqında ən çox verilən suallar: daxili kredit, təhvil, parkinq, təhlükəsizlik, infrastruktur və mənzilə baxış.'],
  '/elaqe': ['Əlaqə — satış ofisi, ünvan və telefon | LUX Residence', 'LUX Residence satış ofisi ilə əlaqə: +994 50 809 00 88. Ünvan: Yasamal rayonu, Elmlər Akademiyası metrosu yaxınlığı, Bakı.'],
};
for (const n of [1, 2, 3, 4]) PAGES[`/${n}-otaqli-menziller`] = [`${n} otaqlı mənzillər — Yasamalda yeni tikili | LUX Residence`, `LUX Residence-də ${n} otaqlı mənzil planları: sahələr, 3D görünüş və eksplikasiya. Elmlər Akademiyası metrosu yaxınlığı, 0% daxili kredit.`];
const CRUMB = { '/planlar': 'Planlar', '/secim': 'İnteraktiv seçim', '/haqqimizda': 'Haqqımızda', '/infrastruktur': 'İnfrastruktur', '/xeberler': 'Xəbərlər', '/suallar': 'Tez-tez verilən suallar', '/elaqe': 'Əlaqə' };
const NOINDEX = new Set(['/muqayise', '/sevimliler']);
// SPA-nın tanıdığı yollar; qalan naməlum ünvanlar (index.html-ə düşənlər) 404 qaytarır
const SPA_OK = /^\/(|ana|planlar|secim|haqqimizda|infrastruktur|xeberler|elaqe|suallar|muqayise|sevimliler|[1-4]-otaqli-menziller|bina-\d+)$/;
const HREFLANG = '<link rel="alternate" hreflang="az" href="https://luxresidence.az/"><link rel="alternate" hreflang="ru" href="https://luxresidence.az/ru"><link rel="alternate" hreflang="x-default" href="https://luxresidence.az/">';
const azn = (v) => String(v).replace('.', ',');
const ldTag = (id, o) => `<script type="application/ld+json" id="${id}">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const crumbLd = (items) => ldTag('ldCrumb', { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: BASE + it[1] })) });
const escH = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
class Meta { constructor(v) { this.v = v; } element(el) { el.setAttribute('content', this.v); } }
class Href { constructor(v) { this.v = v; } element(el) { el.setAttribute('href', this.v); } }
class Title { constructor(v) { this.v = v; } element(el) { el.setInnerContent(this.v); } }
class Append { constructor(h) { this.h = h; } element(el) { el.append(this.h, { html: true }); } }
const LEAD = { 1: 'geniş planlı 3 və 4 otaqlı mənzillər', 3: '3, 4, 5 və 6-cı binalarla ortaq mənzil planları', 4: '3, 4, 5 və 6-cı binalarla ortaq mənzil planları', 5: '3, 4, 5 və 6-cı binalarla ortaq mənzil planları', 6: '3, 4, 5 və 6-cı binalarla ortaq mənzil planları', 10: '1 və 3 otaqlı mənzillər', 11: '1 və 3 otaqlı mənzillər' };
const NC_HOSTS = new Set(['nizami-city.az', 'www.nizami-city.az', 'nizamicity.az', 'www.nizamicity.az']);
const NC_APPS = new Set(['satis', 'kalkulyator', 'muqavile', 'komendant', 'sayt', 'admin']);
const NC_FILE = { admin: 'sayt' };
const NC_PUB = /^\/(menziller(\/[a-z0-9-]+)?|binalar(\/[a-z])?|mekan|kommersiya|bloq(\/[a-z0-9-]+)?|suallar|elaqe|secilmis|muqayise|odenis|brosur)$/i;
const NC_SEO = {
  menziller: ['Mənzillər və planlar — Nizami City', 'Nizami City mənzil planları: 1, 2, 3 və 4 otaqlı mənzillər, eksplikasiya, binalar. Qiymət sorğu ilə, 6 ay faizsiz daxili kredit.'],
  binalar: ['Binalar və 3D baş plan — Nizami City', 'Nizami City-nin binaları və qapalı həyətləri 3D maketdə. Binanı seçin — mənzil planları açılacaq.'],
  mekan: ['Məkan — Nizami City, Yasamal', 'Nizami City Cəfər Cabbarlı küç. 31-də, Nizami metrosunun yanındadır. 3D xəritə, ətraf obyektlər və marşrut.'],
  kommersiya: ['Kommersiya sahələri — Nizami City', 'Nizami City binalarının birinci mərtəbələrində küçəyə açılan kommersiya sahələri.'],
  bloq: ['Bloq — Nizami City', 'Mənzil seçimi, ödəniş və Yasamalda həyat haqqında yazılar.'],
  suallar: ['Suallar və cavablar — Nizami City', 'Nizami City haqqında tez-tez verilən suallar: ödəniş, təmir, parkinq, sənədlər.'],
  elaqe: ['Əlaqə — Nizami City', 'Nizami City satış ofisi: *0788. Ünvan, iş saatları, 3D xəritə və baxışa yazılış.'],
  brosur: ['Broşür — Nizami City', 'Nizami City broşürü: kompleks, üstünlüklər, ödəniş və əlaqə — çap və ya PDF.'],
};
async function nizamiHost(ctx, url) {
  const p = url.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  const noindex = (r) => { const h = new Headers(r.headers); h.set('X-Robots-Tag', 'noindex, nofollow'); return new Response(r.body, { status: r.status, headers: h }); };
  if (url.hostname.startsWith('www.')) { url.hostname = url.hostname.slice(4); return Response.redirect(url.toString(), 301); }
  const app = p.slice(1);
  if (NC_APPS.has(app)) return noindex(await ctx.env.ASSETS.fetch(new Request(new URL('/nc/' + (NC_FILE[app] || app), url).toString(), ctx.request)));
  // ictimai sayt yalnız kök ünvanda: /nc/site, /nc/site-v3 → / (# hissəsi brauzerdə qalır)
  if (p === '/nc' || p === '/nc/site' || p === '/nc/site-v3') return Response.redirect(url.origin + '/' + url.search, 301);
  if (p.startsWith('/nc/') || p.startsWith('/assets/') || p === '/auth-ok') return ctx.next();
  if (p === '/favicon.ico' || p === '/apple-touch-icon.png') return ctx.env.ASSETS.fetch(new Request(new URL('/assets/nc/apple-touch.png', url).toString()));
  if (p === '/robots.txt') return new Response('User-agent: *\nAllow: /$\nDisallow: /nc/\nDisallow: /satis\nDisallow: /kalkulyator\nDisallow: /muqavile\nDisallow: /komendant\nDisallow: /sayt\nDisallow: /admin\nSitemap: https://nizami-city.az/sitemap.xml\n', { headers: { 'Content-Type': 'text/plain' } });
  if (p === '/sitemap.xml') return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://nizami-city.az/</loc><changefreq>daily</changefreq></url>' + Object.keys(NC_SEO).map(k => `<url><loc>https://nizami-city.az/${k}</loc></url>`).join('') + '</urlset>', { headers: { 'Content-Type': 'application/xml' } });
  if (p === '' || p === '/index' || NC_PUB.test(p)) {
    const r = await ctx.env.ASSETS.fetch(new Request(new URL('/nc/site', url).toString(), ctx.request)); const h = new Headers(r.headers); h.set('Cache-Control', 'public, max-age=300'); h.delete('X-Robots-Tag'); h.delete('content-length');
    const res = new Response(r.body, { status: r.status, headers: h });
    const seg = p.split('/')[1] || '', m = NC_SEO[seg]; if (!m || !p) return res;
    const t = (p.match(/^\/binalar\/([a-z])$/i) ? 'Bina ' + p.slice(-1).toUpperCase() + ' — mənzil planları | Nizami City' : m[0]), u = 'https://nizami-city.az' + p;
    return new HTMLRewriter().on('title', new Title(t)).on('meta[name="description"]', new Meta(m[1])).on('meta[property="og:title"]', new Meta(t)).on('meta[property="og:description"]', new Meta(m[1])).on('link[rel="canonical"]', new Href(u)).transform(res);
  }
  return Response.redirect(url.origin + '/', 302);
}
export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  // ---- VMM Ofisin mənbə kodu (vmm/) bu saytda yayımlanmır — VMM ayrıca Netlify-dadır ----
  if (url.pathname === '/vmm' || url.pathname.startsWith('/vmm/')) return new Response('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
  // ---- Baş Ofis ayrıca domendə (ofis.pilothayat.az): yalnız ofis sistemi açılır ----
  if (OFFICE_HOSTS.has(url.hostname)) return officeHost(ctx, url);
  // ---- Təchizat paneli ayrıca domendə (techizat.pilothayat.az) ----
  if (url.hostname === 'techizat.pilothayat.az') return techizatHost(ctx, url);
  if (PILOT_HOSTS.has(url.hostname)) return pilotHost(ctx, url);
  if (url.hostname === 'komendant.pilothayat.az') return komendantHost(ctx, url);
  // ---- Nizami City daxili sistemləri (nizamicity.az) ----
  if (NC_HOSTS.has(url.hostname)) return nizamiHost(ctx, url);
  if (url.pathname === '/nc/admin' || url.pathname === '/nc/admin.html') { const r = await ctx.env.ASSETS.fetch(new Request(new URL('/nc/sayt', url).toString(), ctx.request)); const h = new Headers(r.headers); h.set('X-Robots-Tag', 'noindex, nofollow'); return new Response(r.body, { status: r.status, headers: h }); }
  if (url.pathname === '/nc' || url.pathname.startsWith('/nc/')) { const r = await ctx.next(); const h = new Headers(r.headers); h.set('X-Robots-Tag', 'noindex, nofollow'); return new Response(r.body, { status: r.status, headers: h }); }
  // köhnə ünvan → yeni domen (domen aktiv olandan sonra OFFICE_LIVE=true)
  if (OFFICE_LIVE && (url.pathname === '/ofis' || url.pathname === '/ofis.html')) return Response.redirect('https://' + OFFICE_PRIMARY + '/' + url.search, 301);
  if (url.hostname === 'www.luxresidence.az') { url.hostname = 'luxresidence.az'; return Response.redirect(url.toString(), 301); }
  const res = await ctx.next();
  const path = url.pathname.replace(/\/+$/, '') || '/';
  let p = PAGES[path];
  const bm = path.match(/^\/bina-(\d+)$/);
  if (bm) { const n = +bm[1]; p = [`Bina ${n} — 1–4 otaqlı mənzillər, planlar | LUX Residence`, `LUX Residence Bina ${n}: ${LEAD[n] || 'yaşayış binası'}, 3D planlar və eksplikasiya. Yasamal, Elmlər Akademiyası metrosu yaxınlığı. 0% daxili kredit.`]; }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return res;
  if (!p && !NOINDEX.has(path)) {
    try {
      // ana səhifə: dil alternativləri (AZ ↔ RU)
      if (path === '/') return new HTMLRewriter().on('head', new Append(HREFLANG)).transform(res);
      // naməlum ünvan SPA qabığına (index.html) düşübsə — əsl 404
      if (res.status === 200 && ctx.request.method === 'GET' && !SPA_OK.test(path) && !/^\/(apt|xeber)\//.test(path) && !/\.[a-z0-9]{2,5}$/i.test(path)) {
        const et = res.headers.get('etag');
        if (et) {
          const root = await ctx.env.ASSETS.fetch(new Request(new URL('/', url).toString(), { method: 'HEAD' }));
          if (root.headers.get('etag') === et) {
            const h = new Headers(res.headers); h.set('X-Robots-Tag', 'noindex'); h.set('Cache-Control', 'no-store'); h.delete('etag');
            return new HTMLRewriter().on('title', new Title('Səhifə tapılmadı | LUX Residence')).on('meta[name="robots"]', new Meta('noindex, follow')).on('link[rel="canonical"]', { element(el) { el.remove(); } }).transform(new Response(res.body, { status: 404, headers: h }));
          }
        }
      }
    } catch (e) {}
    return res;
  }
  let rw = new HTMLRewriter();
  if (p) {
    const u = BASE + path;
    rw = rw.on('title', new Title(p[0])).on('meta[name="description"]', new Meta(p[1]))
      .on('meta[property="og:title"]', new Meta(p[0])).on('meta[property="og:description"]', new Meta(p[1]))
      .on('meta[name="twitter:title"]', new Meta(p[0])).on('meta[name="twitter:description"]', new Meta(p[1]))
      .on('meta[property="og:url"]', new Meta(u)).on('link[rel="canonical"]', new Href(u));
    try {
      const rm = path.match(/^\/([1-4])-otaqli-menziller$/);
      // naviqasiya yolu (BreadcrumbList)
      const cr = [['Ana səhifə', '/']];
      if (bm) cr.push(['Planlar', '/planlar'], [`Bina ${+bm[1]}`, path]);
      else if (rm) cr.push(['Planlar', '/planlar'], [`${rm[1]} otaqlı mənzillər`, path]);
      else if (CRUMB[path]) cr.push([CRUMB[path], path]);
      let extra = cr.length > 1 ? crumbLd(cr) : '';
      // planlar və otaq tipi səhifələri: mənzil siyahısı (ItemList) + JS-siz oxunan linklər
      if (path === '/planlar' || rm) {
        const list = await kv('lux_apartments');
        const apts = (Array.isArray(list) ? list : []).filter((a) => a && !a.hidden && a.id != null && (!rm || (Number(a.rooms) >= 4 ? 4 : Number(a.rooms)) === +rm[1]));
        if (apts.length) {
          const nm = (a) => `${a.rooms} otaqlı mənzil, ${azn(a.area)} m²`;
          extra += ldTag('ldList', { '@context': 'https://schema.org', '@type': 'ItemList', name: p[0], numberOfItems: apts.length, itemListElement: apts.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: nm(a), url: `${BASE}/apt/${a.id}` })) });
          rw = rw.on('body', new Append(`<noscript><ul>${apts.map((a) => `<li><a href="/apt/${escH(a.id)}">${escH(nm(a))} — ${escH(a.bina || 'LUX Residence')}</a></li>`).join('')}</ul></noscript>`));
        }
      }
      if (extra) rw = rw.on('head', new Append(extra));
    } catch (e) {}
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
