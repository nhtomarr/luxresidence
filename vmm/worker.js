// VMM Ofis — Cloudflare Worker: statik faylları verir; /auth-ok (parol saxlama formu) üçün boş 204 cavab
export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname === '/auth-ok' || u.pathname === '/auth-ok.txt') return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
    return env.ASSETS.fetch(req);
  }
};
