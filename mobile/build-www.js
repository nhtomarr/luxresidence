// Tətbiqin yerli paketi: ofis.pilothayat.az/app-bundle/zip yüklənir və www/ qovluğuna açılır.
// Repo-dakı versiya (ofis-sw.js) canlı sayta çatana qədər gözləyir (Cloudflare yayımı ~1-2 dəq).
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const BASE = process.env.OFIS_BASE || 'https://ofis.pilothayat.az';
const want = (fs.readFileSync(path.join(__dirname, '..', 'ofis-sw.js'), 'utf8').match(/const V='(\d+)'/) || [])[1];
const www = path.join(__dirname, 'www');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function unzip(buf) { // yalnız sıxılmamış (stored) və deflate ZIP
  const out = {}; let o = 0;
  while (buf.readUInt32LE(o) === 0x04034b50) {
    const method = buf.readUInt16LE(o + 8), csize = buf.readUInt32LE(o + 18), nlen = buf.readUInt16LE(o + 26), xlen = buf.readUInt16LE(o + 28);
    const name = buf.slice(o + 30, o + 30 + nlen).toString('utf8'), start = o + 30 + nlen + xlen, data = buf.slice(start, start + csize);
    out[name] = method === 8 ? zlib.inflateRawSync(data) : data; o = start + csize;
  }
  return out;
}
(async () => {
  let v = null;
  for (let i = 0; i < 40; i++) {
    try { v = (await (await fetch(BASE + '/app-bundle/latest', { cache: 'no-store' })).json()).version; } catch (e) { v = null; }
    if (v && (!want || v === want)) break;
    console.log('Canlı versiya', v, '≠ repo', want, '— gözlənilir…'); await sleep(15000);
  }
  if (!v) throw new Error('app-bundle əlçatan deyil');
  const buf = Buffer.from(await (await fetch(BASE + '/app-bundle/zip?v=' + v)).arrayBuffer());
  const files = unzip(buf);
  if (!files['index.html']) throw new Error('paketdə index.html yoxdur');
  for (const [n, d] of Object.entries(files)) { const f = path.join(www, n); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, d); }
  console.log('Yerli paket hazır: v' + v + ', ' + Object.keys(files).length + ' fayl');
})().catch((e) => { console.error(e.message); process.exit(1); });
