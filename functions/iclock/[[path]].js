// ZKTeco ADMS (iClock) — barmaq izi terminalı buraya qoşulur: server = ofis.pilothayat.az, port 80/443.
// Sorğu olduğu kimi Supabase "bio-adms" funksiyasına ötürülür (cihazın IP-si x-device-ip başlığında).
const TARGET = 'https://avqchschbbltnnasabdm.supabase.co/functions/v1/bio-adms';
export async function onRequest(ctx) {
  const u = new URL(ctx.request.url);
  const h = new Headers();
  h.set('Content-Type', ctx.request.headers.get('Content-Type') || 'text/plain');
  h.set('x-device-ip', ctx.request.headers.get('cf-connecting-ip') || '');
  const init = { method: ctx.request.method, headers: h };
  if (ctx.request.method !== 'GET' && ctx.request.method !== 'HEAD') init.body = await ctx.request.arrayBuffer();
  const r = await fetch(TARGET + u.pathname + u.search, init);
  const body = await r.text();
  return new Response(body, { status: r.status, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store', Date: new Date().toUTCString() } });
}
