(() => {
'use strict';
const { CO, STAT, TYPES, ROOMS, ORIAZ, UNITS, INFRA, POI, FAQ, TIMELINE, GAL, GCATS, BLOG } = window.NC;
const IMG = window.IMG || {};
const TERMS = (((window.NC_REMOTE || {}).cfg || {}).terms || [{ months: 6, surcharge: 0, enabled: true }, { months: 12, surcharge: 200, enabled: true }]).filter(t => t.enabled !== false && +t.months > 0).map(t => ({ m: +t.months, s: +t.surcharge || 0 })).sort((a, b) => a.m - b.m);
const SUR = m => (TERMS.find(t => t.m === m) || { s: 0 }).s;
const IS = k => IMG[k] || k || '';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fm2 = n => n.toFixed(2).replace('.', ',');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MON = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
const DOW = ['B', 'B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş'];
const dstr = s => { const d = new Date(s); return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
};
const fav = new Set(store.get('nc_fav', [])); let cmp = store.get('nc_cmp', []); let recent = store.get('nc_recent', []);
const saveSets = () => { store.set('nc_fav', [...fav]); store.set('nc_cmp', cmp); store.set('nc_recent', recent); updBadges(); };
const U = id => UNITS.find(u => u.id === id);
const roomsT = r => `${r} otaqlı`;
const ord = n => { const t = { 1: 'ci', 2: 'ci', 3: 'cü', 4: 'cü', 5: 'ci', 6: 'cı', 7: 'ci', 8: 'ci', 9: 'cu', 0: 'cu' }, d = n % 10, tn = n % 100; const tens = { 10: 'cu', 20: 'ci', 30: 'cu', 40: 'cı', 50: 'ci', 60: 'cı', 70: 'ci', 80: 'ci', 90: 'cı' }; return n + '-' + (d === 0 ? (n % 100 === 0 ? 'cü' : tens[tn]) : t[d]); };
const stPill = u => u.st === 'free' ? '<span class="pill ok">Satışda</span>' : u.st === 'bron' ? '<span class="pill bron">Bron</span>' : '<span class="pill sold">Satılıb</span>';
const toastEl = () => $('#toast');
function toast(t) { const e = toastEl(); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2400); }
async function copy(t, msg) { try { await navigator.clipboard.writeText(t); toast(msg || 'Kopyalandı'); } catch (e) { toast(t); } }

/* ---------- ikonlar ---------- */
const P = {
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', cmp: 'M8 4v16M16 4v16M4 8h8M12 16h8',
  arrow: 'M5 12h14M13 6l6 6-6 6', search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
  wa: 'M4 20l1.3-4A8 8 0 1 1 8 18.7zM9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z', cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', share: 'M12 4v11M7 9l5-5 5 5M5 14v6h14v-6',
  sun: 'M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1', moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', list: 'M4 6h16M4 12h16M4 18h16', x: 'M6 6l12 12M18 6L6 18', check: 'M5 12l5 5 9-10', pin: 'M12 21s-7-6.3-7-12a7 7 0 0 1 14 0c0 5.7-7 12-7 12zM12 7a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  play: 'M7 5l12 7-12 7z', pause: 'M7 5h4v14H7zM13 5h4v14h-4z', wand: 'M4 20L16 8M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 11l.7 1.3 1.3.7-1.3.7L19 15l-.7-1.3L17 13l1.3-.7z', copy: 'M8 8h12v12H8zM4 16V4h12',
};
const ic = (n, c = '') => `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
const AR = ic('arrow', 'ar');

/* ---------- mənzil plan sxemi (prosedur, tema ilə uyğun) ---------- */
function rooms(r, a) {
  const R = ROOMS[r], sum = [...R.top, ...R.bot].reduce((s, x) => s + x[1], 0) + R.bal, A = v => Math.round(a * v / sum * 100) / 100;
  return { R, A, list: [...R.top, ...R.bot].map(([n, v]) => [n, A(v)]).concat([['Balkon', A(R.bal)]]) };
}
function planSVG(r, a, o = {}) {
  const { R, A } = rooms(r, a), x0 = 34, y0 = 52, w = 332, h = 212, th = h * .58, by = y0 + th;
  const ts = R.top.reduce((s, x) => s + x[1], 0), bs = R.bot.reduce((s, x) => s + x[1], 0);
  let x = x0; const T = R.top.map(([n, v]) => { const o = { n, ar: A(v), x, w: w * v / ts }; x += o.w; return o; });
  x = x0; const B = R.bot.map(([n, v]) => { const o = { n, ar: A(v), x, w: w * v / bs }; x += o.w; return o; });
  let s = `<rect class="pb" x="${T[0].x + 10}" y="${y0 - 34}" width="${T[0].w - 20}" height="34"/>`;
  T.forEach(t => s += `<rect class="pf" x="${t.x}" y="${y0}" width="${t.w}" height="${th}"/>`);
  B.forEach(b => s += `<rect class="${/Hamam|S\/Q/.test(b.n) ? 'pwet' : 'pf'}" x="${b.x}" y="${by}" width="${b.w}" height="${h - th}"/>`);
  T.slice(1).forEach(t => s += `<line class="pi" x1="${t.x}" y1="${y0}" x2="${t.x}" y2="${by}"/>`);
  B.slice(1).forEach(b => s += `<line class="pi" x1="${b.x}" y1="${by}" x2="${b.x}" y2="${y0 + h}"/>`);
  let cx = x0; T.forEach(t => { const g = t.x + Math.min(14, t.w * .15); s += `<line class="pi" x1="${cx}" y1="${by}" x2="${g}" y2="${by}"/>`; s += `<path class="pd" d="M${g} ${by}V${by - 22}A22 22 0 0 1 ${g + 22} ${by}"/>`; cx = g + 22; });
  s += `<line class="pi" x1="${cx}" y1="${by}" x2="${x0 + w}" y2="${by}"/>`;
  s += `<rect class="po" x="${x0}" y="${y0}" width="${w}" height="${h}"/>`;
  T.forEach(t => { const ww = t.w * .46, wx = t.x + (t.w - ww) / 2; s += `<rect class="pwin" x="${wx}" y="${y0 - 4}" width="${ww}" height="8"/><line class="pwl" x1="${wx}" y1="${y0}" x2="${wx + ww}" y2="${y0}"/>`; });
  const k = B.find(b => b.n === 'Mətbəx'); if (k) { const ww = k.w * .5, wx = k.x + (k.w - ww) / 2; s += `<rect class="pwin" x="${wx}" y="${y0 + h - 4}" width="${ww}" height="8"/><line class="pwl" x1="${wx}" y1="${y0 + h}" x2="${wx + ww}" y2="${y0 + h}"/>`; }
  const d = B.find(b => b.n === 'Dəhliz'); if (d) { const g = d.x + d.w / 2 - 13; s += `<rect class="pgap" x="${g}" y="${y0 + h - 5}" width="26" height="10"/><path class="pd" d="M${g} ${y0 + h}V${y0 + h + 24}M${g} ${y0 + h + 24}A24 24 0 0 0 ${g + 26} ${y0 + h}"/>`; }
  if (o.lbl !== false) {
    const lab = (b, y, hh) => { const cxx = b.x + b.w / 2, cy = y + hh / 2; return b.w > 58 ? `<text class="pt" x="${cxx}" y="${cy - 2}">${b.n}</text><text class="pa" x="${cxx}" y="${cy + 15}">${fm2(b.ar)}</text>` : `<text class="pa" x="${cxx}" y="${cy + 5}">${fm2(b.ar)}</text>`; };
    T.forEach(t => s += lab(t, y0, th)); B.forEach(b => s += lab(b, by, h - th));
    s += `<text class="pt" x="${T[0].x + T[0].w / 2}" y="${y0 - 13}">Balkon</text>`;
  }
  return `<svg class="plan-svg" viewBox="0 0 400 300" role="img" aria-label="${r} otaqlı mənzilin plan sxemi">${s}</svg>`;
}
function plateSVG(n, f) { // mərtəbədə mənzilin yeri
  let s = '<rect class="po" x="20" y="20" width="260" height="120"/><rect class="pwet" x="128" y="62" width="44" height="36"/><text class="pt" x="150" y="84">Lift</text>';
  [[20, 20], [150, 20], [20, 98], [150, 98]].forEach(([x, y], i) => { const on = i + 1 === n; s += `<rect class="${on ? 'pon' : 'pf'}" x="${x + 4}" y="${y + 4}" width="${i % 2 ? 126 : 104}" height="${y > 50 ? 38 : 38}"/><text class="pa${on ? ' on' : ''}" x="${x + (i % 2 ? 67 : 56)}" y="${y + 28}">${f}.${i + 1}</text>`; });
  return `<svg class="plan-svg" viewBox="0 0 300 160" aria-hidden="true">${s}</svg>`;
}

/* ---------- günəş saatları ---------- */
function sunHours(az0, month) {
  let first = null, last = null, tot = 0;
  for (let m = 4 * 60; m <= 21 * 60; m += 10) {
    const p = window.ncSunPos(new Date(2026, month, 21, Math.floor(m / 60), m % 60));
    let df = Math.abs(((p.az - az0 + 540) % 360) - 180);
    if (p.el > 3 && df < 82) { if (first === null) first = m; last = m; tot += 10; }
  }
  return { first, last, tot };
}

/* ---------- 3D ---------- */
let R3 = null;
function mount3D(host, o = {}) {
  if (!window.THREE || !window.buildNizami) { host.innerHTML = `<img src="${IMG.aerial}" alt="Nizami City quşbaxışı" style="width:100%;height:100%;object-fit:cover">`; return null; }
  const dk = document.documentElement.dataset.theme !== 'light';
  const T = THREE, M = window.buildNizami(T, { shadow: 1024, ground: dk ? 0x0f1930 : undefined }), S = M.scene;
  if (dk) { const mp = { 0xc9c3b6: 0x1e2c4b, 0x5c5d58: 0x070c18, 0xcfc6b2: 0x2c3a5c }; S.traverse(o => { const m = o.material; if (m && !Array.isArray(m) && m.color && mp[m.color.getHex()] !== undefined) m.color.setHex(mp[m.color.getHex()]); }); }
  const ren = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  ren.setPixelRatio(Math.min(2, devicePixelRatio || 1)); ren.shadowMap.enabled = true; ren.shadowMap.type = T.PCFSoftShadowMap;
  host.prepend(ren.domElement);
  const cam = new T.PerspectiveCamera(30, 1, 10, 7000), tgt = new T.Vector3(0, 20, 0);
  let th = o.th ?? -0.7, ph = o.ph ?? 0.6, dist = o.dist ?? 1350, dirty = true, alive = true, idle = 0, vis = true, sel = null;
  const place = () => { cam.position.set(tgt.x + dist * Math.cos(ph) * Math.sin(th), tgt.y + dist * Math.sin(ph), tgt.z + dist * Math.cos(ph) * Math.cos(th)); cam.lookAt(tgt); dirty = true; };
  const size = () => { const W = host.clientWidth, H = host.clientHeight; if (!W || !H) return; ren.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); dirty = true; };
  const ro = new ResizeObserver(size); ro.observe(host); size(); place();
  const picks = M.blds.map(g => g.userData.pick);
  const box = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1, 1, 1)), new T.LineBasicMaterial({ color: 0xc2cd3f })); box.visible = false; S.add(box);
  const select = id => { sel = id; const g = M.blds.find(g => g.userData.b.id === id); if (!g) { box.visible = false; dirty = true; return; } const b = g.userData.b; box.scale.set(b.w + 8, M.H + 8, b.d + 8); box.position.set(b.x, (M.H + 8) / 2, b.z); box.visible = true; dirty = true; };
  const ray = new T.Raycaster(), v2 = new T.Vector2();
  const hit = e => { const r = ren.domElement.getBoundingClientRect(); v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, cam); const h = ray.intersectObjects(picks)[0]; return h ? M.blds.find(g => g.userData.pick === h.object).userData.b : null; };
  let down = null, moved = 0;
  const el = ren.domElement; el.style.touchAction = 'pan-y';
  el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, th, ph }; moved = 0; idle = 0; });
  addEventListener('pointerup', () => { down = null; });
  el.addEventListener('pointermove', e => {
    if (down) { const dx = e.clientX - down.x, dy = e.clientY - down.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); th = down.th - dx * .006; ph = Math.min(1.35, Math.max(.18, down.ph + dy * .004)); place(); idle = 0; return; }
    if (!o.tip) return; const b = hit(e); el.style.cursor = b ? 'pointer' : 'grab';
    if (b) { const r = host.getBoundingClientRect(); o.tip.style.left = (e.clientX - r.left) + 'px'; o.tip.style.top = (e.clientY - r.top) + 'px'; o.tip.innerHTML = `<b>Bina ${b.id}</b>${STAT[b.st].t}`; o.tip.style.opacity = 1; } else o.tip.style.opacity = 0;
  });
  el.addEventListener('pointerleave', () => { if (o.tip) o.tip.style.opacity = 0; });
  el.addEventListener('click', e => { if (moved > 6 || !o.onPick) return; const b = hit(e); if (b) o.onPick(b.id); });
  el.addEventListener('wheel', e => { if (!e.ctrlKey && !e.metaKey && !o.wheel) return; e.preventDefault(); dist = Math.min(2400, Math.max(650, dist * (1 + Math.sign(e.deltaY) * .08))); place(); }, { passive: false });
  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; }); io.observe(host);
  let t0 = performance.now();
  (function loop(t) {
    if (!alive) return; requestAnimationFrame(loop); const dt = Math.min(.05, (t - t0) / 1000); t0 = t; if (!vis) return;
    idle += dt; if (o.auto && idle > 3 && !down && !RM) { th += dt * .06; place(); }
    M.blds.forEach(g => { if (g.userData.jib) { g.userData.jib.rotation.y += dt * .15; dirty = true; } });
    if (dirty) { ren.render(S, cam); dirty = false; }
  })(t0);
  return {
    setSun(az, el) { M.setSun(az, el); dirty = true; }, select,
    zoom(k) { dist = Math.min(2400, Math.max(650, dist * k)); place(); },
    dispose() { alive = false; ro.disconnect(); io.disconnect(); ren.dispose(); ren.forceContextLoss && ren.forceContextLoss(); },
  };
}

/* ---------- ümumi bloklar ---------- */
const crumbs = (...a) => `<nav class="crumbs" aria-label="Naviqasiya"><a href="#home">Ana səhifə</a>${a.map(([t, h]) => `<span>/</span>${h ? `<a href="#${h}">${t}</a>` : `<span>${t}</span>`}`).join('')}</nav>`;
const head = (lbl, title, txt, extra = '') => `<header class="ph${extra ? ' row' : ''}"><div style="display:grid;gap:22px"><span class="lbl">${lbl}</span><h1 class="d h2">${title}</h1>${txt ? `<p class="txt">${txt}</p>` : ''}</div>${extra}</header>`;
function card(u) {
  return `<a class="ap" href="#menzil-${u.id}" data-u="${u.id}">
    <div class="tg">${stPill(u)}${u.bst === 'w' ? '<span class="pill soon">'+CO.delivery+'</span>' : ''}</div>
    <div class="act"><button data-fav="${u.id}" class="${fav.has(u.id) ? 'on' : ''}" aria-label="Seçilmişlərə əlavə et">${ic('heart')}</button><button data-cmp="${u.id}" class="${cmp.includes(u.id) ? 'on' : ''}" aria-label="Müqayisəyə əlavə et">${ic('cmp')}</button></div>
    <div class="pv">${planSVG(u.r, u.a, { lbl: false })}</div>
    <div class="bd"><div class="t"><b>${fm2(u.a)} m²</b><span>${roomsT(u.r)}</span></div>
    <div class="p"><span>Bina ${u.b} · ${ord(u.f)} mərtəbə</span><b class="num">${fmt(u.price)} ₼</b></div></div></a>`;
}
function bindCards(root) {
  $$('[data-fav]', root).forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); const id = b.dataset.fav; fav.has(id) ? fav.delete(id) : fav.add(id); b.classList.toggle('on', fav.has(id)); saveSets(); toast(fav.has(id) ? 'Seçilmişlərə əlavə olundu' : 'Seçilmişlərdən çıxarıldı'); });
  $$('[data-cmp]', root).forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); const id = b.dataset.cmp; if (cmp.includes(id)) cmp = cmp.filter(x => x !== id); else { if (cmp.length >= 3) { toast('Ən çox 3 mənzil müqayisə olunur'); return; } cmp.push(id); } b.classList.toggle('on', cmp.includes(id)); saveSets(); toast(cmp.includes(id) ? `Müqayisəyə əlavə olundu (${cmp.length}/3)` : 'Müqayisədən çıxarıldı'); });
}
const ctaBand = () => `<section class="sec ol"><div class="w grid12" style="align-items:end">
  <div style="grid-column:1/8;display:grid;gap:26px"><span class="lbl">Baxış</span><h2 class="d h2">Mənzili şəkildə yox, <em>yerində</em> görün.</h2><p class="txt">Gün və saat seçin — satış meneceri sizi kompleksdə qarşılasın, binaları və mənzilləri göstərsin.</p></div>
  <div style="grid-column:9/13;display:grid;gap:12px;justify-items:start"><a class="b" href="#elaqe">Baxışa yazıl ${AR}</a><a class="lk" href="tel:${CO.tel[0]}">${CO.short} · ${CO.phones[0]}</a></div></div></section>`;

/* ---------- forma köməkçiləri ---------- */
const LEADS = [];
const phoneOk = v => /^(\+?994|0)?(10|12|50|51|55|60|70|77|99)\d{7}$/.test(v.replace(/[\s\-()]/g, ''));
function bindForm(f, kind, done) {
  f.onsubmit = e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(f)); let bad = false;
    $$('.err', f).forEach(x => x.textContent = '');
    if ('name' in d && d.name.trim().length < 2) { $('[data-e=name]', f).textContent = 'Adınızı yazın'; bad = true; }
    if ('phone' in d && !phoneOk(d.phone)) { $('[data-e=phone]', f).textContent = 'Nömrəni düzgün yazın, məs. 050 700 00 88'; bad = true; }
    if (bad) return; LEADS.push({ kind, ...d, at: new Date().toISOString() }); window.ncLead && window.ncLead(kind, d); done(d);
  };
}
const doneBox = (t, s) => `<div class="done"><div class="ic">${ic('check')}</div><h3 class="d h3">${t}</h3><p style="margin:0;color:var(--on-olive2)">${s}</p></div>`;

/* ================= SƏHİFƏLƏR ================= */
const pages = {};

/* ---------- scroll səhnə mühərriki ---------- */
let SC = [];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function scene(el, fn) { SC.push({ el, fn }); }
function tickS() {
  const H = innerHeight;
  for (const s of SC) {
    const r = s.el.getBoundingClientRect(); if (r.bottom < -40 || r.top > H + 40) continue;
    const span = r.height - H, p = span > 0 ? clamp(-r.top / span) : 0, v = clamp((H - r.top) / (H + r.height));
    s.fn(RM ? 1 : p, v, r);
  }
}
let sReq = 0; addEventListener('scroll', () => { if (!sReq) sReq = requestAnimationFrame(() => { sReq = 0; tickS(); }); }, { passive: true });
addEventListener('resize', () => tickS());

const HL = [
  ['front', 'Nizami metrosunun yanında, Yasamalın tam mərkəzində.'],
  ['aerial', 'Doqquz bina, 2,87 hektar və mərkəzdə qapalı həyət.'],
  ['entrance', 'İşıqlı giriş portalı, kodlu giriş və 7/24 mühafizə.'],
  ['tower_r', 'Krem keramoqranit və terrakota panellər — illər keçsə də təzə qalan fasad.'],
  ['aerial_c', 'Avtomobillər iki səviyyəli yeraltı parkinqdə, həyət isə uşaqlarındır.'],
  ['tower_l', `Qiymətlər ${fmt(CO.priceFrom)} ₼/m²-dən. 50% ilkin ödənişlə 36 ayadək daxili kredit.`],
];
const EXP = [
  ['tower_r', 'Fasad', '<b>Fasad.</b> Krem rəngli keramoqranit lövhələr terrakota panellərlə növbələşir — uzunömürlü, baxımı asan və gün işığında isti tonlarla parlayır.'],
  ['entrance', 'Giriş', '<b>Giriş.</b> Həyətə işıqlı portaldan daxil olursunuz. Kodlu giriş, kameralar və 7/24 mühafizə.'],
  ['front', 'Kommersiya qalereyası', '<b>Kommersiya qalereyası.</b> Birinci mərtəbələrdə supermarket, aptek, kafe, fitnes və qadın baxım mərkəzi — vitrinlər küçəyə baxır.'],
  ['aerial_c', 'Qapalı həyət', '<b>Qapalı həyət.</b> Binalar perimetr boyunca düzülüb, mərkəzdə avtomobil girməyən həyət və uşaq meydançası qalır.'],
  ['aerial', 'Parkinq', '<b>Parkinq.</b> İki səviyyəli yeraltı parkinq — maşınınız həmişə yerində, həyət isə səssiz.'],
  ['tower_l', 'Ətraf', '<b>Ətraf.</b> Nizami Mall, Caspian Plaza, Globus Center, 31 və 18 nömrəli məktəblər bir neçə dəqiqəlik məsafədədir.'],
];

pages.home = () => {
  const free = UNITS.filter(u => u.st === 'free');
  const html = `
  <section class="zoom" id="z"><div class="stick"><div class="frame" id="zf"><img src="${IMG.front}" alt="Nizami City — küçə fasadı, vizual"><div class="shade" id="zs"></div></div>
    <div class="t1" id="z1"><small>Nizami City</small><h1 class="d">Xoşbəxtliyi<br>inşa edirik.</h1></div>
    <div class="t2" id="z2"><small>Yasamal · Nizami metrosu</small><h2 class="d">Şəhərin ortasında, öz həyətiniz.</h2><div class="acts"><a class="b" href="#menziller">Mənzil seç</a><button class="b o" data-wiz>30 saniyəlik seçici</button></div></div>
    <div class="cue" id="zc"><span>Aşağı sürüşdürün</span><i></i></div></div></section>

  <section class="giant" id="gi"><div class="w"><div class="word" id="gw" style="--gimg:url(${IMG.aerial_c})" aria-hidden="true">NİZAMİ</div>
    <div class="row"><div><small>Nizami City</small><h2 class="d">Şəhərin<br><em>tam ortasında.</em></h2></div>
    <div class="buy"><span><b>${fmt(CO.priceFrom)} ₼/m²-dən</b><br>və ya 36 ayadək daxili kredit</span><a class="b s" href="#menziller">Seç</a></div></div></div></section>

  <section class="stats" id="st"><div class="w"><div class="nums">
    <div class="up"><small>Binalar</small><b data-count="9">9</b><span>bir qapalı məhəllədə</span></div>
    <div class="up"><small>Mənzillər</small><b data-count="750">~750</b><span>1 otaqlıdan 4 otaqlıyadək</span></div>
    <div class="up"><small>Ərazi</small><b>2,87 ha</b><span>mərkəzində avtomobilsiz həyət</span></div></div></div>
    <div class="shot"><img id="sti" src="${IMG.aerial}" alt="Kompleksin quşbaxışı görünüşü"></div></section>

  <section class="hl" id="hl"><div class="w head"><h2 class="d h2">Əsas məqamlar.</h2><a class="lk" href="#layihe">Layihə haqqında</a></div>
    <div class="track" id="hlt">${HL.map(([s, t], i) => `<figure class="card${i ? '' : ' on'}" data-i="${i}" style="margin:0"><img src="${IS(s)}" alt=""><p>${t}</p></figure>`).join('')}</div>
    <div class="pager"><div class="dots" id="hld">${HL.map((_, i) => `<button aria-label="${i + 1}-ci kart" class="${i ? '' : 'on'}"><i></i></button>`).join('')}</div><button class="pp" id="hlp" aria-label="Dayandır">${ic('pause')}</button></div></section>

  <section class="sec" style="padding-top:clamp(40px,6vw,80px)"><div class="w">
    <div class="ph"><span class="lbl">Memarlıq</span><h2 class="d h2">Kompleksi <em>yaxından</em> tanıyın.</h2></div>
    <div class="ex up" id="ex"><div class="pics">${EXP.map(([s], i) => `<img src="${IS(s)}" alt="" class="${i ? '' : 'on'}">`).join('')}</div>
      <div class="pills">${EXP.map(([, t, d], i) => `<button class="pillb${i ? '' : ' on'}" data-i="${i}"><i>+</i><span>${t}</span><p>${d}</p></button>`).join('')}</div></div>
  </div></section>

  <section class="sec" style="padding-top:0"><div class="w">
    <div class="ph row"><div style="display:grid;gap:16px"><span class="lbl">Planlar</span><h2 class="d h2">Hər ailəyə<br>öz ölçüsü.</h2></div><div class="segc" id="pseg">${[1, 2, 3, 4].map(r => `<button data-r="${r}" class="${r === 2 ? 'on' : ''}">${r} otaq</button>`).join('')}<i class="thumb"></i></div></div>
    <div class="plans"><div class="pc up" id="ppc"></div><div class="spec up" id="psp"></div></div>
  </div></section>

  <section class="day" id="dy"><div class="stick"><div class="box" id="dyb"><img src="${IMG.front}" alt="Nizami City günün müxtəlif saatlarında"><div class="tint" id="dyt"></div><div class="glow" id="dyg"></div>
    <div class="hud"><div><small>21 iyun · Bakı</small><div class="clock" id="dyc">06:00</div></div>
      <svg class="arc" viewBox="0 0 260 120" aria-hidden="true"><line x1="0" y1="110" x2="260" y2="110"/><path d="M10 110 Q130 -40 250 110"/><circle id="dys" r="7" cx="10" cy="110"/></svg></div>
    <div class="cap"><div><h2 class="d h3" style="color:#f5f5f7;margin-bottom:8px">Səhərdən axşama. Gün işığında.</h2><p>Sürüşdürün — günəş kompleksin üzərindən keçsin. Hər mənzil səhifəsində pəncərələrə düşən günəş saatlarını görəcəksiniz.</p></div><a class="lk" href="#gunes">3D modeldə günəşi izləyin</a></div></div></div></section>

  <section class="sec" style="padding-bottom:clamp(40px,6vw,80px)"><div class="w ph"><span class="lbl">İnfrastruktur</span><h2 class="d h2">Hər şey binanın altında.</h2></div>
    <div class="icar" id="icr">${INFRA.map(([t, d, p]) => `<div><svg viewBox="0 0 24 24" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="${p}"/></svg><b>${t}</b><span>${d}</span></div>`).join('')}</div>
    <div class="arrows"><button data-d="-1" aria-label="Geri">‹</button><button data-d="1" aria-label="İrəli">›</button></div></section>

  <section class="emb" id="em"><div class="w"><div class="core" id="emc"><div class="rh2"><img src="${IMG.logo || ''}" alt=""></div></div>
    <span class="lbl">Tikinti</span><h2 class="d" style="margin-top:12px">Üç mərhələ.<br><em>Bir məhəllə.</em></h2>
    <p class="txt">Birinci mərhələnin sakinləri artıq evlərindədir. Tikilən binaların təhvili: ${CO.delivery}.</p>
    <div class="phs">${TIMELINE.map(([a, b, c, st]) => `<a href="#binalar" class="up ${st}"><div class="lt">${b.split(',').map(x => `<i>${x.trim()[0]}</i>`).join('')}</div><span class="mut">${a}</span><b>${STAT[st].t}</b><span class="mut">${c}</span><div class="bar"><i data-w="${STAT[st].pct}"></i></div></a>`).join('')}</div></div></section>

  <section class="sec" style="padding-top:0"><div class="w"><div class="bento up">
    <div class="top"><div style="display:grid;gap:10px"><h2 class="d h2">Sizə hansı uyğundur?</h2><span class="mut">Otaq sayını seçin — rəqəmlər dərhal yenilənir.</span></div>
      <select class="bsel" id="bsel" aria-label="Otaq sayı">${[1, 2, 3, 4].map(r => `<option value="${r}"${r === 3 ? ' selected' : ''}>${r} otaqlı mənzil</option>`).join('')}</select></div>
    <div class="bg" id="bgr"></div></div></div></section>

  <section class="sec" style="padding-top:0"><div class="w"><div class="ph row"><h2 class="d h2">Alıcı üçün bələdçi.</h2><a class="lk" href="#bloq">Bütün yazılar</a></div>
    <div class="posts">${BLOG.slice(0, 3).map(postCard).join('')}</div></div></section>
  ${ctaBand()}`;
  return {
    html, title: 'Nizami City — Xoşbəxtliyi inşa edirik', mount(root) {
      // 1. zoom açılış
      const zi = $('#zf img'), zf = $('#zf'), z1 = $('#z1'), z2 = $('#z2'), zc = $('#zc'), zs = $('#zs');
      scene($('#z'), p => {
        const e = eio(clamp(p / .78)), k = clamp((p - .8) / .2);
        zi.style.transform = `scale(${2.6 - 1.6 * e})`; zi.style.filter = `brightness(${.5 + .5 * e})`;
        zs.style.opacity = 1 - .6 * e;
        z1.style.opacity = 1 - clamp(p / .3); z1.style.transform = `translateY(calc(-50% - ${p * 120}px))`;
        const o = clamp((p - .55) / .25); z2.style.opacity = o; z2.style.transform = `translateY(${(1 - o) * 30}px)`; z2.style.pointerEvents = o > .5 ? 'auto' : 'none';
        zc.style.opacity = 1 - clamp(p * 6);
        zf.style.inset = `${k * 18}px ${k * 3}vw`; zf.style.borderRadius = `${k * 28}px`;
      });
      // 2. nəhəng söz
      scene($('#gi'), (p, v) => { $('#gw').style.setProperty('--gx', (20 + v * 60) + '%'); });
      // 3. statistika şəkli
      scene($('#st'), (p, v) => { $('#sti').style.transform = `scale(${1.12 - .12 * clamp(v * 1.6)})`; });
      // 4. əsas məqamlar
      const tr = $('#hlt'), cards = $$('.card', tr), dots = $$('#hld button'); let idx = 0, t0 = performance.now(), play = !RM, vis = false, paused = 0;
      const padL = () => parseFloat(getComputedStyle(tr).paddingLeft);
      const setI = i => { idx = i; t0 = performance.now(); cards.forEach((c, k) => c.classList.toggle('on', k === i)); dots.forEach((d, k) => { d.classList.toggle('on', k === i); d.style.setProperty('--k', 0); }); };
      const go = i => { i = (i + cards.length) % cards.length; tr.scrollTo({ left: cards[i].offsetLeft - padL(), behavior: RM ? 'auto' : 'smooth' }); setI(i); };
      dots.forEach((d, i) => d.onclick = () => go(i));
      $('#hlp').onclick = () => { play = !play; t0 = performance.now() - paused; $('#hlp').innerHTML = ic(play ? 'pause' : 'play'); $('#hlp').setAttribute('aria-label', play ? 'Dayandır' : 'Oynat'); };
      let st; tr.addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(() => { const L = tr.scrollLeft + padL(); let b = 0, bd = 1e9; cards.forEach((c, k) => { const d = Math.abs(c.offsetLeft - L); if (d < bd) { bd = d; b = k; } }); if (b !== idx) setI(b); }, 120); }, { passive: true });
      new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: .4 }).observe(tr);
      (function loop(t) { if (!document.body.contains(tr)) return; requestAnimationFrame(loop); if (!play || !vis) { paused = t - t0; t0 = t - paused; return; } const k = (t - t0) / 5200; dots[idx].style.setProperty('--k', Math.min(1, k)); if (k >= 1) go(idx + 1); })(t0);
      // 5. kəşf et
      $$('.pillb', root).forEach(b => b.onclick = () => { const i = +b.dataset.i; $$('.pillb', root).forEach(x => x.classList.toggle('on', x === b)); $$('#ex .pics img').forEach((m, k) => m.classList.toggle('on', k === i)); });
      // 6. planlar
      const seg = $('#pseg'), th = $('.thumb', seg);
      const plan = r => { const ts = TYPES.filter(t => t.r === r), fr = free.filter(u => u.r === r), mn = fr.length ? Math.min(...fr.map(u => u.price)) : 0;
        $$('button', seg).forEach(b => b.classList.toggle('on', +b.dataset.r === r)); const on = $('button.on', seg); th.style.left = on.offsetLeft + 'px'; th.style.width = on.offsetWidth + 'px';
        $('#ppc').innerHTML = planSVG(r, ts[ts.length - 1].a);
        $('#psp').innerHTML = `<div><b><em>${ts.map(t => fm2(t.a)).join(' · ')}</em></b><span>m² — ${roomsT(r)} plan variantları</span></div><div><b>${fr.length}</b><span>mənzil satışda</span></div><div><b>${mn ? fmt(mn) + ' ₼' : '—'}</b><span>başlanğıc qiymət</span></div><div><b>${mn ? fmt(mn / 72) + ' ₼' : '—'}</b><span>aylıq — 50% ilkin, 36 ay</span></div><div style="border-top:0"><a class="b" href="#menziller" id="pgo">${roomsT(r)} mənzillərə bax</a></div>`;
        $('#pgo').onclick = () => { resetF(); F.r = r; };
      };
      $$('button', seg).forEach(b => b.onclick = () => plan(+b.dataset.r)); plan(2); setTimeout(() => plan(+$('button.on', seg).dataset.r), 300);
      // 7. gün saatı
      const dI = $('#dyb img'), dT = $('#dyt'), dG = $('#dyg'), dC = $('#dyc'), dS = $('#dys'), dB = $('#dyb');
      scene($('#dy'), p => {
        const m = 360 + Math.round(p * 930 / 5) * 5, s = window.ncSunPos(new Date(2026, 5, 21, Math.floor(m / 60), m % 60)), el = s.el, b = clamp(el / 45);
        dC.textContent = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        const warm = el > 0 ? clamp(1 - el / 18) : 0, night = clamp(-el / 8);
        dI.style.filter = `brightness(${(.42 + .68 * b) * (1 - .55 * night)}) saturate(${.75 + .45 * b + .3 * warm}) contrast(${1 + .08 * warm})`;
        dT.style.background = night > 0 ? `rgba(24,34,80,${.55 * night})` : `rgba(255,${150 + 60 * (1 - warm)},${80 + 120 * (1 - warm)},${.32 * warm})`;
        dG.style.opacity = clamp(night * 1.3) * .9;
        const x = (m - 360) / 930, cx = 10 + 240 * x, cy = 110 - 150 * x * (1 - x) * 2 * clamp(el / 74 + .25);
        dS.setAttribute('cx', cx); dS.setAttribute('cy', Math.min(110, el > 0 ? 110 - (el / 74) * 95 : 110 + Math.min(8, -el))); dS.style.opacity = el > -2 ? 1 : .3;
        dB.style.transform = `scale(${.92 + .08 * clamp(p * 6)})`;
      });
      // 8. infrastruktur
      $$('.arrows button', root).forEach(b => b.onclick = () => $('#icr').scrollBy({ left: +b.dataset.d * 318, behavior: 'smooth' }));
      // 9. emblem
      const emc = $('#emc'); scene($('#em'), (p, v) => { const k = clamp((v - .1) * 2.2); emc.style.transform = `scale(${.72 + .28 * eio(k)})`; emc.style.setProperty('--gl', k); });
      $$('.bar i', root).forEach(i => obs(i, () => i.style.width = i.dataset.w + '%'));
      // 10. bento
      const bento = r => { const fr = free.filter(u => u.r === r), all = UNITS.filter(u => u.r === r), ts = TYPES.filter(t => t.r === r), mn = fr.length ? Math.min(...fr.map(u => u.price)) : 0, ok = fr.filter(u => u.bst === 'ok').length;
        $('#bgr').innerHTML = `<a class="t2" href="#menziller" data-r="${r}"><small>${roomsT(r)} · ən böyük plan</small><div class="pv">${planSVG(r, ts[ts.length - 1].a, { lbl: false })}</div><b style="font-size:21px;font-weight:600">${ts.map(t => fm2(t.a)).join(' · ')} m²</b></a>
          <div class="g"><small>Başlanğıc qiymət</small><b class="k num">${mn ? fmt(mn) : '—'}</b><small>₼ · başlanğıc</small></div>
          <div><small>Satışda</small><b class="k">${fr.length}</b><small>${all.length} mənzildən</small><div class="bar"><i style="width:${all.length ? fr.length / all.length * 100 : 0}%"></i></div></div>
          <div><small>Aylıq ödəniş</small><b class="k num">${mn ? fmt(mn / 72) : '—'}</b><small>₼ · 50% ilkin, 36 ay</small></div>
          <div><small>Dərhal köçmək</small><b class="k">${ok}</b><small>hazır binalarda · qalanı ${CO.delivery}</small></div>
          <a class="w2 g" href="#elaqe"><svg class="ic2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="${P.cal}"/></svg><div><b style="font-size:24px;font-weight:600;letter-spacing:-.02em">Baxışa gəlin</b><br><small>Gün və saat seçin, menecer sizi kompleksdə qarşılasın.</small></div><span class="lk">Baxışa yazıl</span></a>
          <a class="w2" href="#kalkulyator"><svg class="ic2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h12v18H6zM9 7h6M9 11h1M12 11h1M15 11h0M9 15h1M12 15h1M15 15v3"/></svg><div><b style="font-size:24px;font-weight:600;letter-spacing:-.02em">Nağd, kredit, ipoteka</b><br><small>Üç ödəniş yolunu eyni mənzil üçün müqayisə edin.</small></div><span class="lk">Kalkulyator</span></a>`;
        $('#bgr [data-r]').onclick = () => { resetF(); F.r = r; };
      };
      $('#bsel').onchange = e => bento(+e.target.value); bento(3);
      tickS();
    }
  };
};

pages.layihe = () => ({
  title: 'Layihə — Nizami City', html: `
  <section class="sec t0"><div class="w">${crumbs(['Layihə'])}
    <div class="grid12" style="margin-top:34px;align-items:end"><h1 class="d h1" style="grid-column:1/9"><span class="ln"><span>Doqquz bina.</span></span><span class="ln"><span><em>Bir həyət.</em></span></span></h1>
    <p class="txt up" style="grid-column:9/13">Nizami City Yasamal rayonunda, Cəfər Cabbarlı küçəsində 2,87 hektar ərazidə inşa olunan yaşayış kompleksidir. Binalar perimetr boyunca düzülüb, mərkəzdə isə avtomobil girməyən qapalı həyət qalır.</p></div>
  </div></section>
  <figure class="wide up"><img src="${IMG.aerial}" alt="Nizami City quşbaxışı vizual"><figcaption class="w">Vizual · kompleksin quşbaxışı görünüşü</figcaption></figure>
  <section class="sec"><div class="w grid12">
    <div style="grid-column:1/6;display:grid;gap:22px;align-content:start"><span class="lbl">Fakt vərəqi</span><h2 class="d h2">Rəqəmlərlə</h2></div>
    <div class="kv" style="grid-column:7/13">${[['Ünvan', CO.addr], ['Binalar', '9 yaşayış binası'], ['Mənzillər', '~750, 1–4 otaqlı'], ['Ərazi', '2,87 ha'], ['Fasad', 'Keramoqranit'], ['Parkinq', '2 səviyyəli, yeraltı'], ['Təhvil', 'Təmirsiz, sərbəst plan'], ['Mərhələ I', 'A, B, C — təhvil verilib'], ['Mərhələ II', 'E, F, G — 2027'], ['Ödəniş', 'Nağd və ya 50% + 36 ayadək daxili kredit'], ['Qiymət', `${fmt(CO.priceFrom)} ₼/m²-dən`]].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>
  </div></section>
  <section class="sec ol"><div class="w">
    ${head('Tikinti gedişatı', 'Hər mərhələ <em>vaxtında</em>', '')}
    <div class="tl">${TIMELINE.map(([a, b, c, st], i) => `<div class="tli up ${st}"><span class="tln">0${i + 1}</span><div><span class="lbl">${a}</span><h3 class="d h3">${b}</h3><p class="txt">${c}</p><div class="bar" style="margin-top:14px;background:rgba(235,229,212,.14)"><i data-w="${STAT[st].pct}"></i></div></div><span class="pill ${STAT[st].c}">${STAT[st].t}</span></div>`).join('')}</div>
  </div></section>
  <section class="sec"><div class="w grid12">
    <div style="grid-column:1/6;display:grid;gap:22px;align-content:start"><span class="lbl">Memarlıq</span><h2 class="d h2">İsti tonlar, <em>sakit</em> ritm</h2><p class="txt">Fasadlarda krem rəngli keramoqranit terrakota panellərlə növbələşir. Birinci mərtəbələr şüşə vitrinli kommersiya qalereyasıdır, həyətə giriş isə işıqlı portaldan keçir.</p><a class="lk" href="#qalereya">Bütün vizuallar ${AR}</a></div>
    <div style="grid-column:7/13;display:grid;grid-template-columns:1fr 1fr;gap:18px"><img class="up" src="${IMG.tower_r}" alt="Fasad detalı" style="aspect-ratio:3/4;object-fit:cover;width:100%"><img class="up" src="${IMG.entrance}" alt="Giriş portalı" style="aspect-ratio:3/4;object-fit:cover;width:100%;margin-top:60px"></div>
  </div></section>
  ${ctaBand()}`,
  mount(root) { $$('.bar i', root).forEach(i => obs(i, () => i.style.width = i.dataset.w + '%')); }
});

pages.binalar = () => {
  const B = window.NC_BLD;
  return {
    title: 'Binalar — Nizami City', html: `
  <section class="sec t0"><div class="w">${crumbs(['Binalar'])}<div style="height:30px"></div>
    ${head('Baş plan', 'Binanı <em>seçin</em>', 'Modeli fırladın, binanın üzərinə klikləyin — mərtəbələr və mənzillər açılacaq. Baş plan sxematikdir.')}
    <div class="b3"><div class="stage3" id="st3"><div class="tip" id="tip3"></div>
      <div class="zm"><button aria-label="Yaxınlaşdır" data-z=".85">+</button><button aria-label="Uzaqlaşdır" data-z="1.18">−</button></div>
      <div class="lg"><span><i class="ok"></i>Təhvil verilib</span><span><i class="w"></i>Tikilir · ${CO.delivery}</span><span><i class="n"></i>Növbəti mərhələ</span></div></div>
      <div class="blist">${B.map(b => { const us = UNITS.filter(u => u.b === b.id), fr = us.filter(u => u.st === 'free').length; return `<a class="bi ${b.st}" href="#bina-${b.id}" data-b="${b.id}"><b>${b.id}</b><span>${STAT[b.st].t}</span><em>${b.st === 'n' ? 'Sorğu' : fr + ' satışda'}</em></a>`; }).join('')}</div></div>
  </div></section>${ctaBand()}`,
    mount(root) {
      R3 = mount3D($('#st3'), { tip: $('#tip3'), auto: true, onPick: id => { location.hash = 'bina-' + id; } });
      $$('[data-z]', root).forEach(b => b.onclick = () => R3 && R3.zoom(+b.dataset.z));
      $$('.bi', root).forEach(a => { a.onmouseenter = () => R3 && R3.select(a.dataset.b); a.onmouseleave = () => R3 && R3.select(null); });
    }
  };
};

pages.bina = id => {
  const b = window.NC_BLD.find(x => x.id === id); if (!b) return pages.home();
  const us = UNITS.filter(u => u.b === id), NF = window.NC_FLOORS || 9;
  if (b.st === 'n') return {
    title: `Bina ${id} — Nizami City`, html: `<section class="sec t0"><div class="w">${crumbs(['Binalar', 'binalar'], ['Bina ' + id])}<div style="height:30px"></div>
    <div class="grid12"><div style="grid-column:1/7;display:grid;gap:22px;align-content:start"><span class="lbl">${STAT.n.t}</span><h1 class="d h1">Bina <em>${id}</em></h1><p class="txt">Bu bina üçüncü mərhələyə daxildir. Satış başlayanda ilk xəbər tutanlardan olmaq üçün sorğu qoyun.</p></div>
    <form class="frm" id="wl" style="grid-column:8/13" novalidate><label>Adınız<input name="name" autocomplete="name"></label><div class="err" data-e="name"></div><label>Telefon<input name="phone" type="tel" inputmode="tel" placeholder="050 000 00 00" autocomplete="tel"></label><div class="err" data-e="phone"></div><button class="b">Gözləmə siyahısına yazıl ${AR}</button></form></div></div></section>`,
    mount() { bindForm($('#wl'), 'waitlist-' + id, () => { $('#wl').outerHTML = doneBox('Siyahıdasınız', `Bina ${id} üzrə satış başlayanda sizə zəng edəcəyik.`); }); }
  };
  let fl = +(sessionStorage_get('nc_fl_' + id) || NF);
  const html = `<section class="sec t0"><div class="w">${crumbs(['Binalar', 'binalar'], ['Bina ' + id])}<div style="height:30px"></div>
    <header class="ph row"><div style="display:grid;gap:20px"><span class="lbl">${STAT[b.st].t}</span><h1 class="d h1">Bina <em>${id}</em></h1></div>
    <div class="facts" style="grid-template-columns:repeat(3,auto);gap:0 34px"><div style="border:0;padding:0"><b style="font-size:54px">${NF}</b><span>mərtəbə</span></div><div style="border:0;padding:0"><b style="font-size:54px">${us.filter(u => u.st === 'free').length}</b><span>satışda</span></div><div style="border:0;padding:0"><b style="font-size:54px">${b.st === 'ok' ? 'Hazır' : CO.delivery}</b><span>təhvil</span></div></div></header>
    
    <div class="bg2"><div class="fac" role="listbox" aria-label="Mərtəbələr"><div class="roof"></div>
      ${Array.from({ length: NF }, (_, i) => NF - i).filter(f => f > 1 || us.some(u => u.f === 1)).map(f => { const fu = us.filter(u => u.f === f); return `<button data-f="${f}" class="${f === fl ? 'on' : ''}"><b>${f}</b><span>${fu.filter(u => u.st === 'free').length} satışda</span><span class="dots">${fu.map(u => `<i class="${u.st === 'free' ? 'a' : ''}"></i>`).join('')}</span></button>`; }).join('')}
      ${us.some(u => u.f === 1) ? '' : '<button disabled style="opacity:.6;cursor:default"><b>1</b><span>Kommersiya</span><span></span></button>'}</div>
      <div class="chess" id="chess"></div></div>
  </div></section>${ctaBand()}`;
  return {
    title: `Bina ${id} — Nizami City`, html, mount(root) {
      const draw = f => { fl = f; sessionStorage_set('nc_fl_' + id, f); $$('.fac button[data-f]', root).forEach(x => x.classList.toggle('on', +x.dataset.f === f)); const fu = us.filter(u => u.f === f);
        $('#chess').innerHTML = `<div style="display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap"><h3 class="d h3">${ord(f)} mərtəbə</h3><div class="plate" style="width:220px">${plateSVG(0, f)}</div></div>
        <div class="u">${fu.map(u => `<button class="${u.st === 'sold' ? 'sold' : ''}" data-go="${u.id}" ${u.st === 'sold' ? 'aria-disabled="true"' : ''}><span class="mut">${u.ent ? u.ent + '-ci giriş · ' : ''}№ ${u.f}.${u.n}</span><b>${fm2(u.a)} m²</b><span>${roomsT(u.r)} · ${u.ori}</span>${stPill(u)}<strong class="num">${u.st === 'sold' ? '—' : fmt(u.price) + ' ₼'}</strong></button>`).join('')}</div>`;
        $$('[data-go]', root).forEach(x => x.onclick = () => { if (!x.classList.contains('sold')) location.hash = 'menzil-' + x.dataset.go; });
        $$('#chess .u button', root).forEach((x, i) => { x.onmouseenter = () => { const p = $('#chess .plate'); p.innerHTML = plateSVG(i + 1, f); }; });
      };
      $$('.fac button[data-f]', root).forEach(x => x.onclick = () => draw(+x.dataset.f)); draw(fl);
    }
  };
};
function sessionStorage_get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
function sessionStorage_set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }

/* ----- kataloq ----- */
const F = { rs: null, r: 0, amin: 30, amax: 260, pmax: 1100000, b: '', ph: 'all', free: true, fmin: 1, sort: 'pa', view: 'grid', page: 1 };
const resetF = () => Object.assign(F, { rs: null, r: 0, amin: 30, amax: 260, pmax: 1100000, b: '', ph: 'all', free: true, fmin: 1, sort: 'pa', page: 1 });
function filtered() {
  let L = UNITS.filter(u => (!F.r || u.r === F.r) && (!F.rs || F.rs.includes(u.r)) && u.a >= F.amin && u.a <= F.amax && u.price <= F.pmax && (!F.b || u.b === F.b) && (F.ph === 'all' || u.bst === F.ph) && (!F.free || u.st === 'free') && u.f >= F.fmin);
  const s = { pa: (a, b) => a.price - b.price, pd: (a, b) => b.price - a.price, aa: (a, b) => a.a - b.a, ad: (a, b) => b.a - a.a, fd: (a, b) => b.f - a.f, ppm: (a, b) => a.ppm - b.ppm }[F.sort];
  return L.sort(s);
}
pages.menziller = () => ({
  title: 'Mənzillər — Nizami City', html: `
  <section class="sec t0"><div class="w">${crumbs(['Mənzillər'])}<div style="height:30px"></div>
    ${head('Kataloq', 'Mənzil <em>seçimi</em>', '', `<button class="b o" data-wiz>${ic('wand')} Mənzil seçici</button>`)}
    
    <div class="fl"><aside class="fp" id="fp" aria-label="Filtrlər">
      <div><h4>Otaq sayı</h4><div class="seg" data-k="r">${[['Hamısı', 0], ['1', 1], ['2', 2], ['3', 3], ['4', 4]].map(([t, v]) => `<button data-v="${v}">${t}</button>`).join('')}</div></div>
      <div class="rng"><h4>Sahə, m²</h4><div class="v"><span><b id="vAmin"></b></span><span><b id="vAmax"></b></span></div><input type="range" id="fAmin" min="30" max="260" step="1" aria-label="Minimum sahə"><input type="range" id="fAmax" min="30" max="260" step="1" aria-label="Maksimum sahə"></div>
      <div class="rng"><h4>Büdcə</h4><div class="v"><span>maks.</span><b id="vP"></b></div><input type="range" id="fP" min="100000" max="1100000" step="10000" aria-label="Maksimum qiymət"></div>
      <div class="rng"><h4>Mərtəbə</h4><div class="v"><span>ən azı</span><b id="vF"></b></div><input type="range" id="fF" min="1" max="10" step="1" aria-label="Minimum mərtəbə"></div>
      <div><h4>Mərhələ</h4><div class="seg" data-k="ph">${[['Hamısı', 'all'], ['Hazır', 'ok'], [CO.delivery, 'w']].map(([t, v]) => `<button data-v="${v}">${t}</button>`).join('')}</div></div>
      <div><h4>Bina</h4><div class="seg" data-k="b">${[['Hamısı', ''], ...['A', 'B', 'C', 'E', 'F', 'G'].map(x => [x, x])].map(([t, v]) => `<button data-v="${v}">${t}</button>`).join('')}</div></div>
      <label class="chk"><input type="checkbox" id="fFree"> Yalnız satışda olanlar</label>
      <button class="lk" id="fReset" type="button">Filtrləri sıfırla</button>
    </aside>
    <div><div class="tb"><span class="cnt"><b id="cnt">0</b> mənzil</span><span class="sp"></span>
      <select id="sort" aria-label="Sıralama"><option value="pa">Qiymət: ucuzdan</option><option value="pd">Qiymət: bahadan</option><option value="aa">Sahə: kiçikdən</option><option value="ad">Sahə: böyükdən</option><option value="ppm">₼/m²: ucuzdan</option><option value="fd">Mərtəbə: yuxarıdan</option></select>
      <div class="seg" id="vw"><button data-v="grid" aria-label="Şəbəkə">${ic('grid')}</button><button data-v="list" aria-label="Siyahı">${ic('list')}</button></div></div>
      <div class="cards" id="cards"></div><div style="display:grid;justify-items:center;margin-top:34px"><button class="b o" id="more">Daha çox göstər</button></div></div></div>
  </div></section>`,
  mount(root) {
    const sync = () => {
      $$('.seg[data-k]', root).forEach(s => $$('button', s).forEach(b => b.classList.toggle('on', String(F[s.dataset.k]) === b.dataset.v && !(s.dataset.k === 'r' && F.rs))));
      $('#fAmin').value = F.amin; $('#fAmax').value = F.amax; $('#fP').value = F.pmax; $('#fF').value = F.fmin; $('#fFree').checked = F.free; $('#sort').value = F.sort;
      $$("#vw button").forEach(b => b.classList.toggle('on', b.dataset.v === F.view));
      ['#fAmin', '#fAmax', '#fP', '#fF'].forEach(s => pct($(s)));
      $('#vAmin').textContent = F.amin + ' m²'; $('#vAmax').textContent = F.amax + ' m²'; $('#vP').textContent = fmt(F.pmax) + ' ₼'; $('#vF').textContent = F.fmin;
    };
    const draw = (keep) => {
      const L = filtered(), N = F.page * 24; tween($('#cnt'), L.length);
      const c = $('#cards'); c.classList.toggle('list', F.view === 'list');
      c.innerHTML = L.length ? L.slice(0, N).map(card).join('') : `<div class="empty" style="grid-column:1/-1"><b>Bu filtrlərə uyğun mənzil tapılmadı</b><span>Büdcəni və ya sahəni genişləndirin.</span><button class="b s" id="er">Filtrləri sıfırla</button></div>`;
      $('#more').style.display = L.length > N ? '' : 'none'; bindCards(c); stagger($$('.ap', c).slice(keep ? (F.page - 1) * 24 : 0));
      const er = $('#er'); if (er) er.onclick = () => { resetF(); sync(); draw(); };
    };
    $$('.seg[data-k]', root).forEach(s => $$('button', s).forEach(b => b.onclick = () => { const k = s.dataset.k; F[k] = k === 'r' ? +b.dataset.v : b.dataset.v; if (k === 'r') F.rs = null; F.page = 1; sync(); draw(); }));
    $('#fAmin').oninput = e => { F.amin = Math.min(+e.target.value, F.amax - 5); F.page = 1; sync(); draw(); };
    $('#fAmax').oninput = e => { F.amax = Math.max(+e.target.value, F.amin + 5); F.page = 1; sync(); draw(); };
    $('#fP').oninput = e => { F.pmax = +e.target.value; F.page = 1; sync(); draw(); };
    $('#fF').oninput = e => { F.fmin = +e.target.value; F.page = 1; sync(); draw(); };
    $('#fFree').onchange = e => { F.free = e.target.checked; F.page = 1; draw(); };
    $('#sort').onchange = e => { F.sort = e.target.value; draw(); };
    $$("#vw button").forEach(b => b.onclick = () => { F.view = b.dataset.v; sync(); draw(); });
    $('#fReset').onclick = () => { resetF(); sync(); draw(); };
    $('#more').onclick = () => { F.page++; draw(true); };
    sync(); draw();
  }
});

pages.menzil = id => {
  const u = U(id); if (!u) return pages.menziller();
  recent = [id, ...recent.filter(x => x !== id)].slice(0, 6); saveSets();
  const { list } = rooms(u.r, u.a), az = ORIAZ[u.ori];
  const sims = UNITS.filter(x => x.id !== id && x.r === u.r && x.st === 'free').sort((a, b) => Math.abs(a.price - u.price) - Math.abs(b.price - u.price)).slice(0, 3);
  const sh = [['Dekabr', 11], ['Mart', 2], ['İyun', 5]].map(([n, m]) => ({ n, ...sunHours(az, m) }));
  const tm = m => m === null ? '—' : `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const msg = encodeURIComponent(`Salam! Nizami City, ${u.b} binası, ${ord(u.f)} mərtəbə, ${u.r} otaqlı ${fm2(u.a)} m² mənzil (№${u.id}) ilə maraqlanıram.`);
  return {
    title: `${roomsT(u.r)}, ${fm2(u.a)} m² — Nizami City`, html: `
  <section class="sec t0"><div class="w">${crumbs(['Mənzillər', 'menziller'], ['Bina ' + u.b, 'bina-' + u.b], ['№ ' + u.id])}<div style="height:30px"></div>
    <header class="ph row"><div style="display:grid;gap:18px"><div style="display:flex;gap:8px;flex-wrap:wrap">${stPill(u)}<span class="pill">${STAT[u.bst].t}</span>${u.c ? `<span class="pill">${u.c}</span>` : ''}</div><h1 class="d h2">${roomsT(u.r)}, <em>${fm2(u.a)} m²</em></h1></div>
      <div style="display:flex;gap:6px"><button class="ib" data-fav="${u.id}" aria-label="Seçilmiş">${ic('heart')}</button><button class="ib" data-cmp="${u.id}" aria-label="Müqayisə">${ic('cmp')}</button><button class="ib" id="shr" aria-label="Linki kopyala">${ic('share')}</button></div></header>
    <div class="apg"><div style="display:grid;gap:26px">
      <div class="plan"><div class="tabs seg"><button class="on" data-pt="plan">Plan</button><button data-pt="plate">Mərtəbədə yeri</button></div><div id="pv" style="width:100%">${planSVG(u.r, u.a)}</div></div>
      <div><h3 class="d h3" style="margin-bottom:12px">Eksplikasiya</h3><div class="kv expl">${list.map(([n, a]) => `<div><span>${n}</span><b>${fm2(a)} m²</b></div>`).join('')}<div><span><b>Ümumi sahə</b></span><b>${fm2(u.a)} m²</b></div></div><p class="mut" style="font-size:13px;margin-top:10px">Plan sxemi təxminidir; dəqiq ölçülər satış ofisində təqdim olunan rəsmi planda göstərilir.</p></div>
      <div class="sun"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap"><h3 class="d h3">Günəş işığı</h3><span style="color:var(--on-olive2);font-size:14px">Pəncərələr: ${u.ori} · 21-i günləri</span></div>
        ${sh.map(s => `<div class="row"><span>${s.n}</span><div class="tr">${s.first !== null ? `<i style="left:${(s.first - 240) / (17 * 60) * 100}%;width:${Math.max(1, (s.last - s.first) / (17 * 60) * 100)}%"></i>` : ''}</div><b class="num">${(s.tot / 60).toFixed(1).replace('.', ',')} st</b></div>`).join('')}
        <div class="ax"><span></span><div><span>04:00</span><span>12:30</span><span>21:00</span></div><span></span></div>
        <p style="margin:0;font-size:13px;color:var(--on-olive2)">Bakının koordinatları üzrə astronomik hesab; qonşu binaların kölgəsi nəzərə alınmır. ${sh[2].first !== null ? `İyunda günəş ${tm(sh[2].first)}–${tm(sh[2].last)} arası düşür.` : ''}</p></div>
    </div>
    <aside class="side"><div class="price"><span class="mut">Qiymət</span><b class="num">${fmt(u.price)} ₼</b><span class="mut num">${fmt(u.ppm)} ₼/m²${TERMS[0] ? ` · 50% ilkin, ${TERMS[0].m} ay${TERMS[0].s ? '' : ' faizsiz'}: ayda ${fmt(u.a * (u.ppm + TERMS[0].s) / 2 / TERMS[0].m)} ₼` : ''}</span></div>
      <div class="kv">${[['Bina', u.b], ['Mərtəbə', `${u.f} / ${window.NC_FLOORS}`], ['Otaq sayı', u.r], ['Sahə', fm2(u.a) + ' m²'], ['Tavan', '≈ 3,0 m'], ['Pəncərələr', u.ori], ['Təhvil', u.bst === 'ok' ? 'Hazırdır' : CO.delivery], ['Vəziyyət', u.c || (u.bst === 'ok' ? 'Təmirsiz' : 'Tikilir')]].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>
      <div style="display:grid;gap:10px"><a class="b" href="#elaqe" id="book">${ic('cal')} Baxışa yazıl</a><a class="b o" target="_blank" rel="noopener" href="https://wa.me/${CO.wa}?text=${msg}">${ic('wa')} WhatsApp ilə soruş</a><a class="b o" href="#kalkulyator" id="toCalc">Ödənişi hesabla</a></div>
    </aside></div>
  </div></section>
  ${sims.length ? `<section class="sec t0"><div class="w">${head('Oxşar', 'Bənzər <em>mənzillər</em>', '')}<div class="cards">${sims.map(card).join('')}</div></div></section>` : ''}`,
    mount(root) {
      bindCards(root); $$('.seg [data-pt]', root).forEach(b => b.onclick = () => { $$('[data-pt]', root).forEach(x => x.classList.toggle('on', x === b)); $('#pv').innerHTML = b.dataset.pt === 'plan' ? planSVG(u.r, u.a) : plateSVG(u.n, u.f); });
      $('#shr').onclick = () => copy(location.href.split('#')[0] + '#menzil-' + u.id, 'Mənzilin linki kopyalandı');
      $('#book').onclick = () => { BOOK.unit = u.id; }; $('#toCalc').onclick = () => { C.area = u.a; C.ppm = u.ppm; C.unit = u.id; };
      $$('.ib[data-fav]', root).forEach(b => b.classList.toggle('on', fav.has(u.id))); $$('.ib[data-cmp]', root).forEach(b => b.classList.toggle('on', cmp.includes(u.id)));
    }
  };
};

/* ----- kalkulyator ----- */
const C = { mode: 'kredit', area: 100, ppm: CO.priceFrom, init: 50, months: TERMS[0] ? TERMS[0].m : 6, rate: 8, years: 20, ipInit: 20, unit: null };
pages.kalkulyator = () => ({
  title: 'Kalkulyator — Nizami City', html: `
  <section class="sec t0"><div class="w">${crumbs(['Kalkulyator'])}<div style="height:30px"></div>
    ${head('Ödəniş', 'Üç yol, <em>bir mənzil</em>', 'Nağd, daxili kredit və ipotekanı eyni mənzil üçün müqayisə edin. Nəticələr təxminidir — aktual şərtləri satış ofisində dəqiqləşdirin.')}
    <div class="calc"><div class="in">
      <div class="mode" role="tablist">${[['nagd', 'Nağd'], ['kredit', 'Daxili kredit'], ['ipoteka', 'İpoteka']].map(([k, t]) => `<button data-m="${k}">${t}</button>`).join('')}</div>
      <div id="cUnit"></div>
      <div class="rng"><div class="v"><span>Sahə</span><b><span id="vA"></span> m²</b></div><input type="range" id="cA" min="40" max="220" step=".5"></div>
      <div class="rng"><div class="v"><span>Qiymət, ₼/m²</span><b id="vPp"></b></div><input type="range" id="cPp" min="${CO.priceFrom}" max="${Math.max(CO.priceFrom + 600, 4500)}" step="10"></div>
      <div class="rng" data-only="kredit"><div class="v"><span>İlkin ödəniş</span><b><span id="vI"></span>%</b></div><input type="range" id="cI" min="50" max="90" step="5"></div>
      <div class="rng" data-only="kredit"><div class="v"><span>Müddət</span><b><span id="vM"></span> ay</b></div><input type="range" id="cM" min="0" max="${Math.max(0, TERMS.length - 1)}" step="1"></div>
      <div class="rng" data-only="ipoteka"><div class="v"><span>İlkin ödəniş</span><b><span id="vII"></span>%</b></div><input type="range" id="cII" min="10" max="60" step="5"></div>
      <div class="rng" data-only="ipoteka"><div class="v"><span>Müddət</span><b><span id="vY"></span> il</b></div><input type="range" id="cY" min="3" max="30" step="1"></div>
      <div class="rng" data-only="ipoteka"><div class="v"><span>İllik faiz</span><b><span id="vR"></span>%</b></div><input type="range" id="cR" min="2" max="20" step=".5"></div>
      <p class="mut" style="margin:0;font-size:13px" id="cNote"></p>
    </div>
    <div class="out"><span style="color:var(--on-olive2)" id="oL">Aylıq ödəniş</span><div class="big"><span id="oBig">0</span><small id="oU">₼/ay</small></div>
      <div class="kv" id="oKv"></div>
      <div class="cmp3" id="o3"></div>
      <div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b>Ödəniş qrafiki</b><button class="lk" id="cpy" style="color:var(--on-olive)">${ic('copy')} Kopyala</button></div><div class="sched" id="oS"></div></div>
      <a class="b" href="#elaqe">Məsləhət al ${AR}</a></div></div>
  </div></section>`,
  mount(root) {
    const calc = () => {
      const tot = C.area * C.ppm;
      const kt = C.area * (C.ppm + SUR(C.months)); const kr = { first: kt * C.init / 100, m: kt * (1 - C.init / 100) / C.months, n: C.months, total: kt, s: SUR(C.months) };
      const pr = tot * (1 - C.ipInit / 100), i = C.rate / 1200, n = C.years * 12, ann = i ? pr * i / (1 - Math.pow(1 + i, -n)) : pr / n;
      const ip = { first: tot * C.ipInit / 100, m: ann, n, total: tot * C.ipInit / 100 + ann * n };
      return { tot, kr, ip };
    };
    const draw = () => {
      $$('.mode button', root).forEach(b => b.classList.toggle('on', b.dataset.m === C.mode));
      $$('[data-only]', root).forEach(e => e.style.display = e.dataset.only === C.mode ? '' : 'none');
      const set = (id, v, t) => { $(id).value = v; pct($(id)); $(t).textContent = String(v).replace('.', ','); };
      set('#cA', C.area, '#vA'); $('#cPp').value = C.ppm; pct($('#cPp')); $('#vPp').textContent = fmt(C.ppm) + ' ₼';
      set('#cI', C.init, '#vI'); $('#cM').value = Math.max(0, TERMS.findIndex(t => t.m === C.months)); pct($('#cM')); $('#vM').textContent = C.months; set('#cII', C.ipInit, '#vII'); set('#cY', C.years, '#vY'); set('#cR', C.rate, '#vR');
      const u = C.unit && U(C.unit); $('#cUnit').innerHTML = u ? `<div class="note" style="margin:0">Mənzil № ${u.id}: ${roomsT(u.r)}, ${fm2(u.a)} m² · <a href="#menzil-${u.id}">mənzilə qayıt</a></div>` : '';
      $('#cNote').textContent = C.mode === 'kredit' ? 'Daxili kredit: ' + TERMS.map(t => t.m + ' ay' + (t.s ? ' (+' + t.s + ' ₼/m²)' : ' faizsiz')).join(', ') + '. Yekun şərtləri satış ofisi təsdiqləyir.' : C.mode === 'ipoteka' ? 'İpoteka şərtləri banka və proqrama görə dəyişir — rəqəmləri öz təklifinizə uyğunlaşdırın.' : 'Nağd ödənişdə əlavə xərc yoxdur.';
      const r = calc(), cur = C.mode === 'nagd' ? null : r[C.mode === 'kredit' ? 'kr' : 'ip'];
      $('#oL').textContent = C.mode === 'nagd' ? 'Ümumi məbləğ' : 'Aylıq ödəniş'; $('#oU').textContent = C.mode === 'nagd' ? '₼' : '₼/ay';
      tween($('#oBig'), C.mode === 'nagd' ? r.tot : cur.m);
      $('#oKv').innerHTML = (C.mode === 'nagd' ? [['Mənzilin dəyəri', r.tot]] : [['Mənzilin dəyəri', cur.total], ...(C.mode === 'kredit' && cur.s ? [['1 m² (müddət artımı ilə)', C.ppm + cur.s]] : []), ['İlkin ödəniş', cur.first], ['Ödəniş sayı', cur.n + ' ay'], ['Yekun ödəniləcək', cur.total], ...(C.mode === 'ipoteka' ? [['Faiz xərci', cur.total - r.tot]] : [])]).map(([a, b]) => `<div><span>${a}</span><b class="num">${typeof b === 'number' ? fmt(b) + ' ₼' : b}</b></div>`).join('');
      $('#o3').innerHTML = [['nagd', 'Nağd', r.tot, 'birdəfəlik'], ['kredit', 'Daxili kredit', r.kr.m, `${r.kr.n} ay, ayda`], ['ipoteka', 'İpoteka', r.ip.m, `${C.years} il, ayda`]].map(([k, t, v, s]) => `<div class="${k === C.mode ? 'on' : ''}"><span>${t}</span><b class="num">${fmt(v)} ₼</b><span>${s}</span></div>`).join('');
      let rows = '';
      if (C.mode === 'kredit') { let bal = r.kr.total - r.kr.first; rows = `<tr><td>İlkin</td><td>${fmt(r.kr.first)}</td><td>${fmt(bal)}</td></tr>`; for (let k = 1; k <= r.kr.n; k++) { bal -= r.kr.m; rows += `<tr><td>${ord(k)} ay</td><td>${fmt(r.kr.m)}</td><td>${fmt(Math.max(0, bal))}</td></tr>`; } rows = `<table><thead><tr><th>Dövr</th><th>Ödəniş, ₼</th><th>Qalıq, ₼</th></tr></thead><tbody>${rows}</tbody></table>`; }
      else if (C.mode === 'ipoteka') { let bal = r.tot - r.ip.first; const i = C.rate / 1200; for (let y = 1; y <= C.years; y++) { let pi = 0, pp = 0; for (let k = 0; k < 12; k++) { const int = bal * i, prn = r.ip.m - int; pi += int; pp += prn; bal -= prn; } rows += `<tr><td>${ord(y)} il</td><td>${fmt(pp)}</td><td>${fmt(pi)}</td><td>${fmt(Math.max(0, bal))}</td></tr>`; } rows = `<table><thead><tr><th>İl</th><th>Əsas borc</th><th>Faiz</th><th>Qalıq</th></tr></thead><tbody>${rows}</tbody></table>`; }
      else rows = `<p style="padding:14px 0;margin:0;color:var(--on-olive2)">Nağd ödənişdə qrafik yoxdur — məbləğ müqavilə zamanı ödənilir.</p>`;
      $('#oS').innerHTML = rows;
    };
    $$('.mode button', root).forEach(b => b.onclick = () => { C.mode = b.dataset.m; draw(); });
    [['#cA', 'area'], ['#cPp', 'ppm'], ['#cI', 'init'], ['#cM', 'months'], ['#cII', 'ipInit'], ['#cY', 'years'], ['#cR', 'rate']].forEach(([s, k]) => $(s).oninput = e => { C[k] = k === 'months' ? (TERMS[+e.target.value] || TERMS[0] || { m: 6 }).m : +e.target.value; if (k === 'area' || k === 'ppm') C.unit = null; draw(); });
    $('#cpy').onclick = () => copy($$('#oS tr').map(tr => $$('th,td', tr).map(c => c.textContent).join('\t')).join('\n'), 'Qrafik kopyalandı — Excel-ə yapışdıra bilərsiniz');
    draw();
  }
});

/* ----- qalereya ----- */
let gcat = 'Hamısı';
pages.qalereya = () => ({
  title: 'Qalereya — Nizami City', html: `
  <section class="sec t0"><div class="w">${crumbs(['Qalereya'])}<div style="height:30px"></div>
    ${head('Qalereya', 'Görüntülər', 'Layihə vizualları və detallar. Tikinti gedişatı və interyer fotoları əlavə olunduqca bu bölmə yenilənəcək.')}
    <div class="gtabs seg" id="gt">${GCATS.map(c => `<button data-c="${c}">${c} <span class="mut">${c === 'Hamısı' ? GAL.length : GAL.filter(g => g.c === c).length}</span></button>`).join('')}</div>
    <div id="gal"></div></div></section>`,
  mount(root) {
    const draw = () => {
      $$('#gt button', root).forEach(b => b.classList.toggle('on', b.dataset.c === gcat));
      const L = GAL.filter(g => gcat === 'Hamısı' || g.c === gcat);
      $('#gal').innerHTML = L.length ? `<div class="gal">${L.map((g, i) => `<figure data-i="${i}" tabindex="0"><img src="${IS(g.src)}" alt="${g.t}"><figcaption>${g.t}</figcaption></figure>`).join('')}</div>`
        : `<div class="empty"><b>${gcat} — tezliklə</b><span>Bu kateqoriya üçün fotolar hazırlanır.</span><a class="b s" href="#elaqe">Kompleksə gəlib baxın</a></div>`;
      $$('#gal figure', root).forEach(f => { f.onclick = () => openLB(L, +f.dataset.i); f.onkeydown = e => { if (e.key === 'Enter') openLB(L, +f.dataset.i); }; });
      stagger($$('#gal figure', root));
    };
    $$('#gt button', root).forEach(b => b.onclick = () => { gcat = b.dataset.c; draw(); }); draw();
  }
});
let LB = { L: [], i: 0 };
function openLB(L, i) { LB = { L, i }; const lb = $('#lb'); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); drawLB(); $('#lbX').focus(); }
function drawLB() { const g = LB.L[LB.i]; $('#lbImg').src = IS(g.src); $('#lbImg').alt = g.t; $('#lbT').textContent = g.t; $('#lbN').textContent = `${LB.i + 1} / ${LB.L.length}`; $('#lbTh').innerHTML = LB.L.map((x, k) => `<img src="${IMG[x.src]}" alt="" data-k="${k}" class="${k === LB.i ? 'on' : ''}">`).join(''); $$('#lbTh img').forEach(t => t.onclick = () => { LB.i = +t.dataset.k; drawLB(); }); }
const lbGo = d => { LB.i = (LB.i + d + LB.L.length) % LB.L.length; drawLB(); };
const closeLB = () => { const lb = $('#lb'); lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); };

/* ----- bloq ----- */
function postCard(p, i) { return `<a class="post up${i === -1 ? ' feat' : ''}" href="#bloq-${p.id}"><div class="cv"><img src="${IS(p.img)}" alt=""></div><div style="display:grid;gap:12px"><div class="m"><span>${p.c}</span><span>${dstr(p.d)}</span><span>${p.m} dəq</span></div><h3>${p.t}</h3><p>${p.x}</p></div></a>`; }
let bcat = 'Hamısı';
pages.bloq = () => {
  const cats = ['Hamısı', ...new Set(BLOG.map(p => p.c))];
  return {
    title: 'Bloq — Nizami City', html: `<section class="sec t0"><div class="w">${crumbs(['Bloq'])}<div style="height:30px"></div>
    ${head('Bloq', 'Ev almaq haqqında <em>dürüst</em> yazılar', 'Ödəniş, təmir, plan seçimi və məhəllə həyatı haqqında praktik bələdçilər.')}
    <div class="gtabs seg" id="bt">${cats.map(c => `<button data-c="${c}">${c}</button>`).join('')}</div><div class="posts" id="posts"></div></div></section>`,
    mount(root) {
      const draw = () => { $$('#bt button', root).forEach(b => b.classList.toggle('on', b.dataset.c === bcat)); const L = BLOG.filter(p => bcat === 'Hamısı' || p.c === bcat); $('#posts').innerHTML = L.map((p, i) => postCard(p, i === 0 && bcat === 'Hamısı' ? -1 : i)).join(''); stagger($$('#posts .post', root)); };
      $$('#bt button', root).forEach(b => b.onclick = () => { bcat = b.dataset.c; draw(); }); draw();
    }
  };
};
pages.post = id => {
  const p = BLOG.find(x => x.id === id); if (!p) return pages.bloq();
  const nx = BLOG.filter(x => x.id !== id).slice(0, 3);
  return {
    title: p.t + ' — Nizami City', prog: true, html: `<article class="sec t0"><div class="w">${crumbs(['Bloq', 'bloq'], [p.c])}
    <header style="display:grid;gap:22px;margin:34px 0 40px;max-width:980px"><div class="m mut" style="display:flex;gap:14px;font-size:14px"><span>${p.c}</span><span>${dstr(p.d)}</span><span>${p.m} dəqiqəlik oxu</span></div><h1 class="d h2">${p.t}</h1><p class="txt">${p.x}</p></header></div>
    <figure class="wide"><img src="${IS(p.img)}" alt=""></figure>
    <div class="w grid12" style="margin-top:50px"><aside style="grid-column:1/3" class="pshare"><span class="mut" style="font-size:13px">Paylaş</span><button class="ib" id="pcp" aria-label="Linki kopyala">${ic('copy')}</button><a class="ib" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(p.t)}" aria-label="WhatsApp">${ic('wa')}</a></aside>
    <div class="art-body" style="grid-column:3/11">${p.b}</div></div></article>
    <section class="sec"><div class="w">${head('Davamı', 'Növbəti <em>oxu</em>', '')}<div class="posts">${nx.map(postCard).join('')}</div></div></section>`,
    mount() { $('#pcp').onclick = () => copy(location.href.split('#')[0] + '#bloq-' + p.id, 'Məqalənin linki kopyalandı'); }
  };
};

/* ----- məkan ----- */
pages.mekan = () => {
  const cats = ['Hamısı', ...new Set(POI.map(p => p.c))];
  return {
    title: 'Məkan — Nizami City', html: `<section class="sec t0"><div class="w">${crumbs(['Məkan'])}<div style="height:30px"></div>
    ${head('Məkan', 'Hər şey <em>yaxında</em>', CO.addr, `<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="b" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Nizami City, Cəfər Cabbarlı 31, Bakı')}">${ic('pin')} Xəritədə aç</a><button class="b o" id="cpa">${ic('copy')} Ünvanı kopyala</button></div>`)}
    <div class="grid12" style="align-items:start"><div style="grid-column:1/9" class="map" id="map"></div>
    <div style="grid-column:9/13"><div class="seg" id="pc" style="margin-bottom:10px">${cats.map(c => `<button data-c="${c}">${c}</button>`).join('')}</div><div id="pl"></div><p class="mut" style="font-size:13px">Xəritə sxematikdir, məsafələr miqyasa uyğun deyil.</p></div></div>
  </div></section>${ctaBand()}`,
    mount(root) {
      let pc = 'Hamısı', on = -1;
      const map = () => {
        let s = `<defs><pattern id="mg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" class="mgl"/></pattern></defs><rect width="800" height="550" fill="url(#mg)"/>`;
        s += `<path class="mrd" d="M0 300 C200 280 300 250 420 260 S650 300 800 280"/><path class="mrd" d="M480 0 C470 150 500 260 470 550"/><path class="mrd t" d="M0 120 C220 140 360 90 800 130"/><path class="mmt" d="M80 550 C200 420 360 330 520 240 S700 120 800 70"/>`;
        s += `<text class="mtx" x="560" y="470">Cəfər Cabbarlı küç.</text>`;
        POI.forEach((p, i) => { const vis = pc === 'Hamısı' || p.c === pc; s += `<g class="mp${i === on ? ' on' : ''}" opacity="${vis ? 1 : .2}" data-i="${i}" transform="translate(${p.x} ${p.y})"><line x1="0" y1="0" x2="${(400 - p.x) * .0}" y2="0"/><rect x="-15" y="-15" width="30" height="30" transform="rotate(45)"/><text y="5">${p.k}</text></g>`; });
        s += `<g class="mhome" transform="translate(400 280)"><circle r="46" class="pulse"/><rect x="-26" y="-26" width="52" height="52" transform="rotate(45)"/><text y="6">NC</text></g>`;
        if (on >= 0) { const p = POI[on]; s += `<line class="mln" x1="400" y1="280" x2="${p.x}" y2="${p.y}"/><g transform="translate(${p.x} ${p.y - 44})"><rect class="mlb" x="-${p.n.length * 4.4 + 14}" y="-18" width="${p.n.length * 8.8 + 28}" height="32"/><text class="mlt" y="4">${p.n}</text></g>`; }
        $('#map').innerHTML = `<svg viewBox="0 0 800 550" role="img" aria-label="Sxematik xəritə">${s}</svg>`;
        $$('#map .mp').forEach(g => g.onclick = () => { on = +g.dataset.i; map(); list(); });
      };
      const list = () => { $$('#pc button').forEach(b => b.classList.toggle('on', b.dataset.c === pc)); $('#pl').innerHTML = POI.map((p, i) => (pc === 'Hamısı' || p.c === pc) ? `<button class="poi${i === on ? ' on' : ''}" data-i="${i}"><i>${p.k}</i><div><b>${p.n}</b><span>${p.c} · ${p.d}</span></div></button>` : '').join(''); $$('#pl .poi').forEach(b => b.onclick = () => { on = +b.dataset.i; map(); list(); }); };
      $$('#pc button').forEach(b => b.onclick = () => { pc = b.dataset.c; on = -1; map(); list(); });
      $('#cpa').onclick = () => copy(CO.addr, 'Ünvan kopyalandı'); map(); list();
    }
  };
};

/* ----- günəş simulyasiyası ----- */
pages.gunes = () => ({
  title: '3D və günəş — Nizami City', html: `<section class="sec t0"><div class="w">${crumbs(['3D və günəş'])}<div style="height:30px"></div>
    ${head('3D model', 'Günəşin <em>yolunu</em> izləyin', 'İl ərzində istənilən gün və saatda kölgələrin kompleks üzərində necə hərəkət etdiyini görün. Hesablama Bakının koordinatlarına əsaslanır.')}
    <div class="sunlab"><div class="cv" id="sun3"><div class="tip" id="tipS"></div></div>
    <div class="ct"><div><span style="color:var(--on-olive2);font-size:13px" id="sDate"></span><div class="clock num" id="sClock">12:00</div><span style="color:var(--on-olive2);font-size:13px" id="sPos"></span></div>
      <div><h4 style="margin:0 0 10px;font-size:13px;color:var(--on-olive2)">Fəsil</h4><div class="seg" id="sM">${[['Qış', 11], ['Yaz', 2], ['Yay', 5], ['Payız', 8]].map(([t, m]) => `<button data-m="${m}">${t}</button>`).join('')}</div></div>
      <div class="rng"><div class="v"><span style="color:var(--on-olive2)">Saat</span><b id="sH"></b></div><input type="range" id="sR" min="300" max="1260" step="5"></div>
      <button class="b" id="sPlay">${ic('play')} Günü oynat</button>
      <p style="margin:0;font-size:13px;color:var(--on-olive2)">Modeli barmaqla və ya siçanla fırladın. Baş plan sxematikdir.</p></div></div>
  </div></section>`,
  mount() {
    let m = 5, mins = 13 * 60, play = null;
    R3 = mount3D($('#sun3'), { tip: $('#tipS'), th: -.3, ph: .75, dist: 1300 });
    const upd = () => { const d = new Date(2026, m, 21, Math.floor(mins / 60), mins % 60), p = window.ncSunPos(d); R3 && R3.setSun(p.az, p.el);
      $('#sClock').textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`; $('#sH').textContent = $('#sClock').textContent;
      $('#sDate').textContent = `21 ${MON[m]}`; $('#sPos').textContent = p.el > 0 ? `Hündürlük ${p.el.toFixed(0)}° · azimut ${p.az.toFixed(0)}°` : 'Günəş üfüqdən aşağıdadır';
      $('#sR').value = mins; pct($('#sR')); $$('#sM button').forEach(b => b.classList.toggle('on', +b.dataset.m === m)); };
    $$('#sM button').forEach(b => b.onclick = () => { m = +b.dataset.m; upd(); });
    $('#sR').oninput = e => { mins = +e.target.value; upd(); };
    $('#sPlay').onclick = () => { if (play) { clearInterval(play); play = null; $('#sPlay').innerHTML = ic('play') + ' Günü oynat'; return; } $('#sPlay').innerHTML = ic('pause') + ' Dayandır'; play = setInterval(() => { mins += 10; if (mins > 1260) mins = 300; upd(); if (!document.body.contains($('#sPlay'))) clearInterval(play); }, 120); };
    upd();
  }
});

/* ----- kommersiya ----- */
pages.kommersiya = () => ({
  title: 'Kommersiya sahələri — Nizami City', html: `<section class="sec t0"><div class="w">${crumbs(['Kommersiya'])}<div style="height:30px"></div>
    <div class="grid12" style="align-items:end"><div style="grid-column:1/8;display:grid;gap:22px"><span class="lbl">Biznes üçün</span><h1 class="d h1">Hazır <em>auditoriya</em> qapınızda</h1></div><p class="txt" style="grid-column:8/13">Binaların birinci mərtəbələrində vitrinli qeyri-yaşayış sahələri satışdadır. Kompleksin öz sakinləri, metro axını və küçə tərəfi — bir ünvanda.</p></div></div></section>
  <figure class="wide"><img src="${IMG.entrance}" alt="Kommersiya qalereyası və giriş portalı"></figure>
  <section class="sec"><div class="w grid12">
    <div style="grid-column:1/6;display:grid;gap:30px;align-content:start">${[['~750 mənzil', 'Kompleksin öz sakinləri — gündəlik daimi müştəri bazası'], ['Metro yanında', 'Nizami metrosu ətrafının piyada axını'], ['Küçə vitrini', 'Şüşə fasad, ayrıca giriş'], ['Hazır nümunələr', 'Kompleksdə artıq supermarket, aptek, fitnes və qida obyektləri fəaliyyət göstərir']].map(([a, b]) => `<div style="border-top:1.5px solid var(--ink);padding-top:16px;display:grid;gap:6px"><b class="d" style="font-size:32px">${a}</b><span class="mut">${b}</span></div>`).join('')}</div>
    <div style="grid-column:7/13"><h2 class="d h3" style="margin-bottom:20px">Sahə üçün sorğu</h2><form class="frm" id="cf" novalidate>
      <div class="two"><label>Ad, şirkət<input name="name"></label><label>Telefon<input name="phone" type="tel" inputmode="tel" placeholder="050 000 00 00"></label></div><div class="two"><div class="err" data-e="name"></div><div class="err" data-e="phone"></div></div>
      <div class="two"><label>Fəaliyyət növü<select name="biz"><option>Market / ərzaq</option><option>Kafe / restoran</option><option>Aptek / tibb</option><option>Gözəllik / fitnes</option><option>Ofis / xidmət</option><option>Digər</option></select></label><label>Sahə<select name="size"><option>50 m²-ə qədər</option><option>50–100 m²</option><option>100–200 m²</option><option>200 m²-dən çox</option></select></label></div>
      <label>Qeyd<textarea name="note" placeholder="İstəkləriniz"></textarea></label><button class="b">Sorğu göndər ${AR}</button></form></div>
  </div></section>`,
  mount() { bindForm($('#cf'), 'commercial', d => { $('#cf').outerHTML = doneBox('Sorğu qəbul olundu', `${d.biz}, ${d.size} — kommersiya meneceri sizə zəng edəcək.`); }); }
});

/* ----- suallar ----- */
pages.suallar = () => ({
  title: 'Suallar — Nizami City', html: `<section class="sec t0"><div class="w">${crumbs(['Suallar'])}<div style="height:30px"></div>
    <div class="grid12"><div style="grid-column:1/5;display:grid;gap:22px;align-content:start"><span class="lbl">Suallar</span><h1 class="d h2">Tez-tez <em>soruşulanlar</em></h1><input class="inp" id="qs" placeholder="Sualda axtar…" aria-label="Suallarda axtar"><p class="mut">Cavab tapmadınız? <a href="#elaqe">Bizə yazın</a> və ya ${CO.short} nömrəsinə zəng edin.</p></div>
    <div class="qa" style="grid-column:6/13" id="qa"></div></div></div></section>`,
  mount() {
    const draw = q => { const L = FAQ.filter(([a, b]) => !q || (a + b).toLowerCase().includes(q.toLowerCase())); $('#qa').innerHTML = L.length ? L.map(([a, b], i) => `<details${i === 0 && !q ? ' open' : ''}><summary>${a}<i></i></summary><p>${b}</p></details>`).join('') : '<p class="mut" style="padding:26px 0">Uyğun sual tapılmadı.</p>'; };
    $('#qs').oninput = e => draw(e.target.value.trim()); draw('');
  }
});

/* ----- əlaqə və baxış ----- */
const BOOK = { day: null, slot: null, unit: null };
pages.elaqe = () => {
  const days = []; const t = new Date(); t.setHours(0, 0, 0, 0);
  for (let i = 1; days.length < 12; i++) { const d = new Date(t); d.setDate(t.getDate() + i); if (d.getDay() !== 0) days.push(d); }
  if (!BOOK.day) BOOK.day = days[0].toISOString();
  const u = BOOK.unit && U(BOOK.unit);
  return {
    title: 'Əlaqə və baxış — Nizami City', html: `<section class="sec t0"><div class="w">${crumbs(['Əlaqə'])}<div style="height:30px"></div>
    <div class="grid12"><div style="grid-column:1/6;display:grid;gap:30px;align-content:start"><div style="display:grid;gap:22px"><span class="lbl">Əlaqə</span><h1 class="d h2">Gəlin, <em>tanış olaq</em></h1></div>
      <div class="kv">${[['Qısa nömrə', `<a href="tel:*0788">${CO.short}</a>`], ...CO.phones.map((p, i) => ['Telefon', `<a href="tel:${CO.tel[i]}">${p}</a> <button class="cp" data-cp="${p}" aria-label="Kopyala">${ic('copy')}</button>`]), ['E-poçt', `<a href="mailto:${CO.email}">${CO.email}</a>`], ['Ünvan', CO.addr], ['İş saatları', CO.hours], ['Instagram', `<a target="_blank" rel="noopener" href="https://instagram.com/${CO.ig}">@${CO.ig}</a>`]].map(([a, b]) => `<div><span>${a}</span><b style="font-weight:600">${b}</b></div>`).join('')}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="b" href="tel:${CO.tel[0]}">${ic('phone')} Zəng et</a><a class="b o" target="_blank" rel="noopener" href="https://wa.me/${CO.wa}">${ic('wa')} WhatsApp</a></div></div>
    <div style="grid-column:7/13" id="bk"><h2 class="d h3" style="margin-bottom:22px">Baxışa yazılın</h2>
      ${u ? `<div class="note">Seçilmiş mənzil: № ${u.id}, ${roomsT(u.r)}, ${fm2(u.a)} m² <button class="lk" id="unU" style="margin-left:auto">ləğv et</button></div>` : ''}
      <h4 style="margin:0 0 10px;font-size:13px;color:var(--ink2)">1. Gün</h4><div class="days" id="days">${days.map(d => `<button data-d="${d.toISOString()}"><span>${DOW[d.getDay()]}</span><b>${d.getDate()}</b><span>${MON[d.getMonth()].slice(0, 3)}</span></button>`).join('')}</div>
      <h4 style="margin:22px 0 10px;font-size:13px;color:var(--ink2)">2. Saat</h4><div class="slots" id="slots"></div>
      <h4 style="margin:22px 0 10px;font-size:13px;color:var(--ink2)">3. Məlumatlarınız</h4>
      <form class="frm" id="bf" novalidate><div class="two"><label>Adınız<input name="name" autocomplete="name"></label><label>Telefon<input name="phone" type="tel" inputmode="tel" placeholder="050 000 00 00" autocomplete="tel"></label></div><div class="two"><div class="err" data-e="name"></div><div class="err" data-e="phone"></div></div>
      <label>Maraqlandığınız<select name="want"><option>1 otaqlı</option><option selected>2 otaqlı</option><option>3 otaqlı</option><option>4 otaqlı</option><option>Kommersiya sahəsi</option></select></label><div class="err" id="slotErr"></div>
      <button class="b">Baxışı təsdiqlə ${AR}</button></form></div></div>
  </div></section>`,
    mount() {
      const slotsFor = iso => { const d = new Date(iso), sat = d.getDay() === 6, L = []; for (let m = 10 * 60; m <= (sat ? 14 : 17) * 60; m += 30) L.push(m); const seed = d.getDate(); return L.map((m, i) => ({ m, busy: (i * 7 + seed) % 5 === 0 })); };
      const draw = () => { $$('#days button').forEach(b => b.classList.toggle('on', b.dataset.d === BOOK.day)); $('#slots').innerHTML = slotsFor(BOOK.day).map(s => { const t = `${String(Math.floor(s.m / 60)).padStart(2, '0')}:${String(s.m % 60).padStart(2, '0')}`; return `<button type="button" data-s="${t}" ${s.busy ? 'disabled aria-label="' + t + ' dolu"' : ''} class="${BOOK.slot === t ? 'on' : ''}">${t}</button>`; }).join(''); $$('#slots button').forEach(b => b.onclick = () => { BOOK.slot = b.dataset.s; draw(); }); };
      $$('#days button').forEach(b => b.onclick = () => { BOOK.day = b.dataset.d; BOOK.slot = null; draw(); }); draw();
      $$('[data-cp]').forEach(b => b.onclick = () => copy(b.dataset.cp, 'Nömrə kopyalandı'));
      const un = $('#unU'); if (un) un.onclick = () => { BOOK.unit = null; route(true); };
      if (u) $('#bf [name=want]').value = roomsT(u.r);
      const f = $('#bf');
      bindForm(f, 'viewing', d => { const dd = new Date(BOOK.day); $('#bk').innerHTML = doneBox('Baxış təyin olundu', `${dd.getDate()} ${MON[dd.getMonth()]}, saat ${BOOK.slot}. ${d.name}, menecer təsdiq üçün ${d.phone} nömrəsinə zəng edəcək.${u ? ` Mənzil № ${u.id}.` : ''}`); BOOK.slot = null; });
      const inner = f.onsubmit; f.onsubmit = e => { if (!BOOK.slot) { e.preventDefault(); $('#slotErr').textContent = 'Saat seçin'; return; } $('#slotErr').textContent = ''; inner(e); };
    }
  };
};

/* ----- müqayisə və seçilmişlər ----- */
pages.muqayise = () => {
  const L = cmp.map(U).filter(Boolean);
  if (!L.length) return { title: 'Müqayisə — Nizami City', html: `<section class="sec t0"><div class="w">${crumbs(['Müqayisə'])}<div style="height:30px"></div>${head('Müqayisə', 'Müqayisə <em>boşdur</em>', 'Mənzil kartındakı ⫴ düyməsi ilə 3 mənzilə qədər əlavə edin.')}<a class="b" href="#menziller">Mənzillərə keç ${AR}</a></div></section>` };
  const best = (k, f) => { const v = L.map(f); const b = k === 'min' ? Math.min(...v) : Math.max(...v); return u => f(u) === b && L.length > 1; };
  const bp = best('min', u => u.price), ba = best('max', u => u.a), bm = best('min', u => u.ppm), bf = best('max', u => u.f);
  const rows = [['Plan', u => `<div style="max-width:220px">${planSVG(u.r, u.a, { lbl: false })}</div>`], ['Qiymət', u => `<b class="${bp(u) ? 'best' : ''}">${fmt(u.price)} ₼</b>`], ['Sahə', u => `<span class="${ba(u) ? 'best' : ''}">${fm2(u.a)} m²</span>`], ['₼/m²', u => `<span class="${bm(u) ? 'best' : ''}">${fmt(u.ppm)}</span>`], ['Otaq', u => u.r], ['Bina / mərtəbə', u => `<span class="${bf(u) ? 'best' : ''}">${u.b} / ${u.f}</span>`], ['Pəncərələr', u => u.ori], ['Təhvil', u => u.bst === 'ok' ? 'Hazır' : CO.delivery], ['Aylıq (50% / 36 ay)', u => fmt(u.price / 72) + ' ₼'], ['', u => `<div style="display:flex;gap:8px;flex-wrap:wrap"><a class="b s" href="#menzil-${u.id}">Bax</a><button class="b s o" data-rm="${u.id}">Çıxar</button></div>`]];
  return {
    title: 'Müqayisə — Nizami City', html: `<section class="sec t0"><div class="w">${crumbs(['Müqayisə'])}<div style="height:30px"></div>${head('Müqayisə', `${L.length} mənzil <em>yan-yana</em>`, 'Ən sərfəli göstəricilər yaşıl rənglə qeyd olunur.')}
    <div class="cmpt"><table><tbody>${rows.map(([t, f]) => `<tr><th>${t}</th>${L.map(u => `<td>${f(u)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></section>`,
    mount() { $$('[data-rm]').forEach(b => b.onclick = () => { cmp = cmp.filter(x => x !== b.dataset.rm); saveSets(); route(true); }); }
  };
};
pages.secilmis = () => {
  const L = [...fav].map(U).filter(Boolean), R = recent.map(U).filter(Boolean);
  return {
    title: 'Seçilmişlər — Nizami City', html: `<section class="sec t0"><div class="w">${crumbs(['Seçilmişlər'])}<div style="height:30px"></div>
    ${head('Seçilmişlər', L.length ? `${L.length} <em>mənzil</em>` : 'Hələ <em>boşdur</em>', L.length ? '' : 'Bəyəndiyiniz mənzilləri ♡ ilə saxlayın — bu cihazda yadda qalır.', L.length ? `<button class="b o" id="shF">${ic('share')} Siyahını paylaş</button>` : `<a class="b" href="#menziller">Mənzillərə keç ${AR}</a>`)}
    ${L.length ? `<div class="cards">${L.map(card).join('')}</div>` : ''}
    ${R.length ? `<div style="margin-top:80px">${head('Tarixçə', 'Son <em>baxdıqlarınız</em>', '')}<div class="cards">${R.map(card).join('')}</div></div>` : ''}</div></section>`,
    mount(root) { bindCards(root); const s = $('#shF'); if (s) s.onclick = () => copy(L.map(u => `№${u.id} — ${roomsT(u.r)}, ${fm2(u.a)} m², ${fmt(u.price)} ₼`).join('\n'), 'Siyahı kopyalandı'); }
  };
};

/* ================= ROUTER ================= */
const NAV = [['home', 'Ana səhifə'], ['layihe', 'Layihə'], ['binalar', 'Binalar'], ['menziller', 'Mənzillər'], ['kalkulyator', 'Kalkulyator'], ['qalereya', 'Qalereya'], ['gunes', '3D və günəş'], ['mekan', 'Məkan'], ['kommersiya', 'Kommersiya'], ['bloq', 'Bloq'], ['suallar', 'Suallar'], ['elaqe', 'Əlaqə']];
function parse() {
  const h = decodeURIComponent(location.hash.slice(1)) || 'home';
  if (h.startsWith('bina-')) return ['bina', h.slice(5)]; if (h.startsWith('menzil-')) return ['menzil', h.slice(7)]; if (h.startsWith('bloq-')) return ['post', h.slice(5)];
  return [pages[h] && !['bina', 'menzil', 'post'].includes(h) && !(window.NC_OFF || {})[h] ? h : 'home'];
}
let first = true, busy = false;
function render() {
  const [k, arg] = parse(); if (R3) { R3.dispose(); R3 = null; }
  SC = []; const pg = pages[k](arg), main = $('#view');
  main.innerHTML = pg.html; document.title = pg.title || 'Nizami City';
  $$('.hd .ql a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + k || (k === 'menzil' && a.getAttribute('href') === '#menziller') || (k === 'post' && a.getAttribute('href') === '#bloq') || (k === 'bina' && a.getAttribute('href') === '#binalar')));
  $('#prog').style.display = pg.prog ? '' : 'none';
  scrollTo(0, 0); pg.mount && pg.mount(main);
  $$('[data-wiz]', main).forEach(b => b.onclick = openWiz);
  $$('[data-count]', main).forEach(e => obs(e, () => countUp(e)));
  $$('.up', main).forEach(e => { const r = e.getBoundingClientRect(); if (!RM && r.top > innerHeight * .9) { e.classList.add('pre'); obs(e, () => e.classList.remove('pre')); } });
  document.body.classList.remove('ready'); requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('ready')));
  main.focus({ preventScroll: true });
  try { window.ncAfterRender && window.ncAfterRender(k, main); } catch (e) { }
}
function route(force) {
  if (first || RM || force) { first = false; render(); return; }
  if (busy) { render(); return; } busy = true;
  const v = $('#view'); v.classList.add('leave');
  setTimeout(() => { render(); requestAnimationFrame(() => { v.classList.remove('leave'); busy = false; }); }, 300);
}
addEventListener('hashchange', () => { closeMenu(); closeSearch(); closeLB(); route(); });

/* ================= ÜMUMİ UI ================= */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); const f = e.target.__cb; f && f(); } }), { rootMargin: '0px 0px -8% 0px' });
function obs(el, cb) { el.__cb = cb; io.observe(el); }
function countUp(el) { const to = +el.dataset.count, pre = el.textContent.trim().startsWith('~') ? '~' : ''; if (RM) return; const t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / 1500), v = to * (1 - Math.pow(1 - k, 4)); el.textContent = pre + fmt(v); if (k < 1) requestAnimationFrame(f); })(t0); }
function tween(el, to) { const from = +(el.dataset.v || 0); el.dataset.v = to; if (RM) { el.textContent = fmt(to); return; } const t0 = performance.now(); cancelAnimationFrame(el._r); (function f(t) { const k = Math.min(1, (t - t0) / 500), v = from + (to - from) * (1 - Math.pow(1 - k, 3)); el.textContent = fmt(v); if (k < 1) el._r = requestAnimationFrame(f); })(t0); }
function pct(el) { el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); }
function stagger(L) { if (RM) return; L.forEach((e, i) => { e.style.opacity = 0; e.style.transform = 'translateY(24px)'; setTimeout(() => { e.style.transition = 'opacity .6s, transform .8s cubic-bezier(.2,.8,.1,1)'; e.style.opacity = ''; e.style.transform = ''; }, 40 + Math.min(i, 12) * 45); }); }
function updBadges() { $('#favN').textContent = fav.size; $('#favN').style.display = fav.size ? '' : 'none'; $('#cmpN').textContent = cmp.length; $('#cmpB').style.display = cmp.length ? '' : 'none'; }

// menyu
const openMenu = () => { $('#menu').classList.add('open'); $('#menu').setAttribute('aria-hidden', 'false'); $('#mb').setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; $$('#menu .l a').forEach((a, i) => a.style.transitionDelay = (RM ? 0 : .25 + i * .035) + 's'); };
const closeMenu = () => { $('#menu').classList.remove('open'); $('#menu').setAttribute('aria-hidden', 'true'); $('#mb').setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; $$('#menu .l a').forEach(a => a.style.transitionDelay = '0s'); };
$('#menu .l').innerHTML = NAV.filter(([k]) => !(window.NC_OFF || {})[k]).map(([k, t], i) => `<a href="#${k}"><small>${String(i + 1).padStart(2, '0')}</small>${t}</a>`).join('');
$('#mb').onclick = () => $('#menu').classList.contains('open') ? closeMenu() : openMenu(); $('#mx').onclick = closeMenu;
$$('#menu a').forEach(a => a.addEventListener('click', () => { if (a.getAttribute('href') === location.hash || (a.getAttribute('href') === '#home' && !location.hash)) closeMenu(); }));

// başlıq gizlənməsi, dock, oxu irəliləyişi
let ly = 0; addEventListener('scroll', () => { const y = scrollY; $('#hd').classList.toggle('up', y > 300 && y > ly && !$('#menu').classList.contains('open')); ly = y; $('#dock').classList.toggle('on', y > innerHeight * .7);
  if ($('#prog').style.display !== 'none') { const h = document.documentElement.scrollHeight - innerHeight; $('#prog').style.width = (h > 0 ? y / h * 100 : 0) + '%'; }
  const hx = $('#hx img'); if (hx && !RM) { const r = hx.parentElement.getBoundingClientRect(); hx.style.transform = `translateY(${Math.max(-60, Math.min(60, -r.top * .12))}px) scale(1.12)`; } }, { passive: true });

// tema
const themeBtn = $('#theme'); const setTheme = t => { if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; themeBtn.innerHTML = ic(isDark() ? 'sun' : 'moon'); themeBtn.setAttribute('aria-label', isDark() ? 'İşıqlı tema' : 'Qaranlıq tema'); store.set('nc_theme', t || ''); };
const isDark = () => document.documentElement.dataset.theme !== 'light';
themeBtn.onclick = () => setTheme(isDark() ? 'light' : 'dark'); setTheme(store.get('nc_theme', '') || null);

// axtarış palitrası
const IDX = [...NAV.map(([k, t]) => ({ t, s: 'Səhifə', h: k })), ...BLOG.map(p => ({ t: p.t, s: 'Bloq', h: 'bloq-' + p.id })), ...FAQ.map(([q]) => ({ t: q, s: 'Sual', h: 'suallar' })), ...window.NC_BLD.map(b => ({ t: 'Bina ' + b.id + ' — ' + STAT[b.st].t, s: 'Bina', h: 'bina-' + b.id }))];
let sSel = 0, sRes = [];
function search(q) {
  q = q.trim().toLowerCase(); const m = q.match(/(\d)\s*otaq/), idm = q.match(/^([a-i])[-\s]?(\d)[-.\s]?(\d)?$/i);
  let L = q ? IDX.filter(x => x.t.toLowerCase().includes(q)) : IDX.slice(0, 7);
  let un = [];
  if (idm) un = UNITS.filter(u => u.b.toLowerCase() === idm[1] && u.f === +idm[2] && (!idm[3] || u.n === +idm[3]));
  else if (m) un = UNITS.filter(u => u.r === +m[1] && u.st === 'free').sort((a, b) => a.price - b.price);
  un = un.slice(0, 6).map(u => ({ t: `№${u.id} · ${roomsT(u.r)}, ${fm2(u.a)} m²`, s: fmt(u.price) + ' ₼', h: 'menzil-' + u.id }));
  if (m) L.unshift({ t: `Bütün ${m[1]} otaqlı mənzillər`, s: 'Kataloq', h: 'menziller', r: +m[1] });
  sRes = [...un, ...L].slice(0, 12); sSel = 0; drawS(q);
}
function drawS(q) { $('#sres').innerHTML = sRes.length ? sRes.map((x, i) => `<a href="#${x.h}" class="${i === sSel ? 'on' : ''}" data-i="${i}"><i></i><div>${x.t}</div><span>${x.s}</span></a>`).join('') : `<div class="h">Nəticə yoxdur. «3 otaq», «B-5» və ya «ipoteka» yazın.</div>`; $$('#sres a').forEach(a => a.onclick = () => { const x = sRes[+a.dataset.i]; if (x.r) { resetF(); F.r = x.r; } }); }
const openSearch = () => { $('#srch').classList.add('open'); $('#srch').setAttribute('aria-hidden', 'false'); const i = $('#sq'); i.value = ''; search(''); i.focus(); setTimeout(() => i.focus(), 60); };
const closeSearch = () => { $('#srch').classList.remove('open'); $('#srch').setAttribute('aria-hidden', 'true'); };
$('#sq').oninput = e => search(e.target.value);
$('#sq').onkeydown = e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sSel = (sSel + (e.key === 'ArrowDown' ? 1 : -1) + sRes.length) % Math.max(1, sRes.length); drawS(); } if (e.key === 'Enter' && sRes[sSel]) { const x = sRes[sSel]; if (x.r) { resetF(); F.r = x.r; } location.hash = x.h; closeSearch(); } };
$('#srch').onclick = e => { if (e.target.id === 'srch') closeSearch(); };
$('#sb').onclick = openSearch;
addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
  else if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  if (e.key === 'Escape') { closeSearch(); closeMenu(); closeLB(); closeWiz(); }
  if ($('#lb').classList.contains('open')) { if (e.key === 'ArrowRight') lbGo(1); if (e.key === 'ArrowLeft') lbGo(-1); }
});

// lightbox
$('#lbX').onclick = closeLB; $('#lbP').onclick = () => lbGo(-1); $('#lbN2').onclick = () => lbGo(1);
let tx = null; $('#lb .im').addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true }); $('#lb .im').addEventListener('touchend', e => { if (tx === null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) lbGo(d < 0 ? 1 : -1); tx = null; });

// mənzil seçici (wizard)
const WQ = [
  ['Neçə nəfər yaşayacaq?', [['1–2 nəfər', { r: [1, 2] }], ['3 nəfər', { r: [2, 3] }], ['4 nəfər', { r: [3, 4] }], ['5 və daha çox', { r: [4] }]]],
  ['Büdcəniz nə qədərdir?', [['250 000 ₼-ə qədər', { p: 250000 }], ['250–400 min ₼', { p: 400000 }], ['400–600 min ₼', { p: 600000 }], ['600 000 ₼-dən çox', { p: 800000 }]]],
  ['Nə vaxt köçmək istəyirsiniz?', [['Mümkün qədər tez', { ph: 'ok' }], ['Sonra da olar', { ph: 'all' }]]],
];
let W = { i: 0, a: [] };
function openWiz() { W = { i: 0, a: [] }; $('#wz').classList.add('open'); $('#wz').setAttribute('aria-hidden', 'false'); drawWiz(); }
function closeWiz() { $('#wz').classList.remove('open'); $('#wz').setAttribute('aria-hidden', 'true'); }
function drawWiz() {
  const box = $('#wzb');
  if (W.i < WQ.length) { const [q, o] = WQ[W.i]; box.innerHTML = `<div class="stp">${WQ.map((_, k) => `<i class="${k <= W.i ? 'on' : ''}"></i>`).join('')}</div><span class="mut">Sual ${W.i + 1} / ${WQ.length}</span><h3 class="d h3">${q}</h3><div class="opts">${o.map(([t], k) => `<button data-k="${k}">${t}</button>`).join('')}</div>${W.i ? '<button class="lk" id="wBack">Geri</button>' : ''}`;
    $$('.opts button', box).forEach(b => b.onclick = () => { W.a[W.i] = WQ[W.i][1][+b.dataset.k][1]; W.i++; drawWiz(); }); const bk = $('#wBack'); if (bk) bk.onclick = () => { W.i--; drawWiz(); }; return; }
  const c = Object.assign({}, ...W.a), L = UNITS.filter(u => u.st === 'free' && c.r.includes(u.r) && u.price <= c.p && (c.ph === 'all' || u.bst === c.ph)).sort((a, b) => a.price - b.price);
  box.innerHTML = `<div class="stp">${WQ.map(() => '<i class="on"></i>').join('')}</div><h3 class="d h3">${L.length ? `Sizə <em>${L.length}</em> mənzil uyğundur` : 'Dəqiq uyğunluq tapılmadı'}</h3>
    ${L.length ? `<div class="kv">${L.slice(0, 3).map(u => `<div><span><a href="#menzil-${u.id}">№${u.id} · ${roomsT(u.r)}, ${fm2(u.a)} m²</a></span><b>${fmt(u.price)} ₼</b></div>`).join('')}</div>` : '<p class="mut">Büdcəni bir az artırın və ya menecerlə danışın — bəlkə uyğun variant satışa yeni çıxıb.</p>'}
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="b" id="wGo">${L.length ? 'Hamısını göstər' : 'Kataloqa keç'} ${AR}</button><button class="b o" id="wRe">Yenidən</button></div>`;
  $('#wGo').onclick = () => { resetF(); F.r = c.r.length === 1 ? c.r[0] : 0; F.rs = c.r.length > 1 ? c.r : null; F.pmax = Math.min(700000, c.p); F.ph = c.ph; closeWiz(); if (location.hash === '#menziller') route(true); else location.hash = 'menziller'; };
  $('#wRe').onclick = () => { W = { i: 0, a: [] }; drawWiz(); };
  $$('#wzb a').forEach(a => a.onclick = closeWiz);
}
$('#wz').onclick = e => { if (e.target.id === 'wz') closeWiz(); }; $('#wzX').onclick = closeWiz;
$$('[data-wiz]').forEach(b => b.onclick = openWiz);

// footer, dock
$('#yr').textContent = new Date().getFullYear();
updBadges(); route();
window.__nc = { route, F, C, UNITS };
})();
