// Baş Ofis mobil tətbiqi üçün yerli paket (hibrid rejim).
// /app-bundle/latest → {version, url}  ·  /app-bundle/zip → ofis səhifəsi + skriptlər + vendor kitabxanalar (ZIP, sıxılmamış)
// Tətbiq bu paketi telefonda saxlayır, internetsiz və dərhal açılır; yeni versiya çıxanda özü yükləyib dəyişir.
const VENDOR = {
  'vendor/supabase.js': 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js',
  'vendor/qrcode.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'vendor/jsQR.js': 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
};
const FILES = ['assets/ofis-a.js', 'assets/ofis-b.js', 'assets/lux-auth.js', 'assets/ofis-app.css', 'bg.js',
  'assets/ofis/favicon-32.png', 'assets/ofis/favicon-64.png', 'assets/ofis/apple-touch.png', 'assets/ofis/icon-192.png', 'assets/brand/logo-site-rust.svg'];

async function version(env, origin) {
  const r = await env.ASSETS.fetch(new Request(origin + '/ofis-sw.js'));
  const m = (await r.text()).match(/const V='(\d+)'/);
  return m ? m[1] : '0';
}
// CRC32
const T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zip(entries) {
  const enc = new TextEncoder(); const parts = []; const cen = []; let off = 0;
  for (const [name, data] of entries) {
    const nb = enc.encode(name), crc = crc32(data), h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nb.length, true);
    parts.push(new Uint8Array(h.buffer), nb, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
    cen.push(new Uint8Array(c.buffer), nb); off += 30 + nb.length + data.length;
  }
  const csize = cen.reduce((s, p) => s + p.length, 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true); e.setUint32(12, csize, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...cen, new Uint8Array(e.buffer)]);
}

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url), origin = url.origin, p = url.pathname.replace(/\/+$/, '');
  const cors = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' };
  const V = await version(ctx.env, origin);
  if (p === '/app-bundle/latest') return new Response(JSON.stringify({ version: V, url: origin + '/app-bundle/zip?v=' + V }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  if (p !== '/app-bundle/zip') return new Response('not found', { status: 404 });
  const enc = new TextEncoder(), out = [];
  // index.html = ofis.html (yerli yollar, vendor kitabxanalar, versiya nişanı)
  let html = await (await ctx.env.ASSETS.fetch(new Request(origin + '/ofis'))).text();
  html = html.replace('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js', '/vendor/qrcode.min.js')
    .replace(/<link rel="manifest"[^>]*>/, '')
    .replace('<head>', `<head><script>window.OFIS_APP=1;window.OFIS_V='${V}';</script>`);
  out.push(['index.html', enc.encode(html)]);
  for (const f of FILES) {
    const r = await ctx.env.ASSETS.fetch(new Request(origin + '/' + f)); if (!r.ok) continue;
    let b = new Uint8Array(await r.arrayBuffer());
    if (f === 'assets/lux-auth.js') b = enc.encode(new TextDecoder().decode(b).replace("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2", '/vendor/supabase.js'));
    if (f === 'assets/ofis-a.js') b = enc.encode(new TextDecoder().decode(b).replace('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js', '/vendor/jsQR.js'));
    out.push([f, b]);
  }
  for (const [f, u] of Object.entries(VENDOR)) { const r = await fetch(u, { cf: { cacheTtl: 86400 } }); if (r.ok) out.push([f, new Uint8Array(await r.arrayBuffer())]); }
  out.push(['version.txt', enc.encode(V)]);
  return new Response(zip(out), { headers: { ...cors, 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="ofis-${V}.zip"` } });
}
