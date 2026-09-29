// Təchizat — öz brauzer serveri (ScrapingBee əvəzi): JavaScript-li saytları açıb hazır HTML qaytarır.
import http from 'node:http';
import { chromium } from 'playwright';
const TOKEN = process.env.TOKEN || '';
const PORT = +(process.env.PORT || 8080);
const MAX = +(process.env.MAX || 3);          // eyni anda açılan səhifə sayı
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
let browser = null, active = 0; const queue = [];
async function getBrowser() {
  if (!browser || !browser.isConnected()) browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  return browser;
}
async function render(url, wait) {
  const b = await getBrowser();
  const ctx = await b.newContext({ userAgent: UA, locale: 'az-AZ', viewport: { width: 1366, height: 900 } });
  // şəkil, video və şriftlər yüklənmir — sürət və trafik qənaəti
  await ctx.route('**/*', r => ['image', 'media', 'font'].includes(r.request().resourceType()) ? r.abort() : r.continue());
  const p = await ctx.newPage();
  try {
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForTimeout(Math.min(+wait || 3000, 15000));
    try { await p.waitForLoadState('networkidle', { timeout: 5000 }); } catch (_) { /* */ }
    return await p.content();
  } finally { await ctx.close(); }
}
const slot = () => new Promise(r => { if (active < MAX) { active++; r(); } else queue.push(r); });
const release = () => { active--; const n = queue.shift(); if (n) { active++; n(); } };
http.createServer(async (req, res) => {
  if (req.method === 'GET') { res.end('ok'); return; }                       // sağlamlıq yoxlaması
  if (!TOKEN || req.headers['x-token'] !== TOKEN) { res.writeHead(403); res.end('forbidden'); return; }
  let body = ''; for await (const c of req) body += c;
  let j; try { j = JSON.parse(body); } catch { res.writeHead(400); res.end('bad json'); return; }
  if (!/^https?:\/\//.test(j.url || '')) { res.writeHead(400); res.end('url'); return; }
  await slot();
  try { const html = await render(j.url, j.wait); res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html); }
  catch (e) { res.writeHead(502); res.end(String(e && e.message || e)); }
  finally { release(); }
}).listen(PORT, () => console.log('browser service on', PORT));
