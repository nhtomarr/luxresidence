import { kv, abs, page, exists, BASE } from '../../functions-lib/seo.js';
export async function onRequest(ctx) {
  try {
    const id = String(ctx.params.id || '');
    const list = await kv('lux_apartments');
    const a = Array.isArray(list) ? list.find((x) => String(x.id) === id && !x.hidden) : null;
    // birləşdirilmiş (silinmiş) Bina 3/6 dublikatları → eyni tipə daimi yönləndirmə
    const MOVED = { '102': '101', '106': '105', '107': '108', '112': '113', '116': '117', '120': '119' };
    if (!a && MOVED[id]) return Response.redirect(`${BASE}/apt/${MOVED[id]}`, 301);
    if (!a) { const r = await ctx.env.ASSETS.fetch(new URL('/', ctx.request.url)); return new Response(r.body, { status: 404, headers: r.headers }); }
    const bina = a.bina || 'LUX Residence';
    const title = `${a.rooms} otaqlı mənzil, ${a.area} m² — ${bina} | LUX Residence`;
    const desc = `${bina}: ${a.rooms} otaqlı, ${a.area} m² sahəli yeni tikili mənzil. Yasamal, Elmlər Akademiyası metrosu yaxınlığı. Qiymət sorğu ilə.`;
    const og = `/assets/og/apt-${id}.jpg`;
    const hasOg = await exists(ctx, og);
    const image = hasOg ? BASE + og : BASE + '/assets/og-cover.jpg';
    const url = `${BASE}/apt/${id}`;
    const ld = { '@context': 'https://schema.org', '@type': 'Apartment', name: `${a.rooms} otaqlı mənzil, ${a.area} m²`, description: desc, url,
      numberOfRooms: Number(a.rooms) || undefined, floorSize: { '@type': 'QuantitativeValue', value: Number(a.area) || undefined, unitCode: 'MTK' },
      image: [image, abs(a.plan_png || a.plan)].filter(Boolean),
      containedInPlace: { '@type': 'ApartmentComplex', name: 'LUX Residence', '@id': BASE + '/#complex' },
      address: { '@type': 'PostalAddress', addressLocality: 'Bakı', addressRegion: 'Yasamal rayonu', addressCountry: 'AZ' } };
    return page(ctx, { title, desc, url, image, ld, ldId: 'ldApt' });
  } catch (e) { return ctx.env.ASSETS.fetch(new URL('/', ctx.request.url)); }
}
