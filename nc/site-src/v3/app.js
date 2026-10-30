/* Nizami City — sayt v3 (sakit portal üslubu). Məlumat: window.NC (data.js), canlı: runtime.js */
const { CO, UNITS, FAQ, TIMELINE, BLOG, POI } = window.NC;
const IMG = window.IMG || {};
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Math.round(+n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fm2 = n => (Math.round((+n || 0) * 100) / 100).toString().replace('.', ',');
const OFF = window.NC_OFF || {};
const HP = !(((window.NC_REMOTE || {}).site || {}).showPrice);
if (HP) OFF.kalkulyator = true;
const TERMS = (((window.NC_REMOTE || {}).cfg || {}).terms || [{ months: 6, surcharge: 0, enabled: true }]).filter(t => t.enabled !== false && +t.months > 0).map(t => ({ m: +t.months, s: +t.surcharge || 0 })).sort((a, b) => a.m - b.m);
const SUR = m => (TERMS.find(t => t.m === m) || { s: 0 }).s;
const I = {
  ar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  al: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  ph: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  pl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  bld: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5l8-2v18M12 21h8V9l-8-2M8 8v.01M8 12v.01M8 16v.01M16 12v.01M16 16v.01"/></svg>',
  fl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16M4 15h16M4 10h16M4 5h16"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  clk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  park: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/></svg>',
  sh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  tree: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-6M7 16h10l-5-13z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  metro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18l4-12 4 8 4-8 4 12"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1.2-1.2 2 1-.6 1.6c-3.6.4-7.7-3.7-7.3-7.3l1.6-.6 1 2z"/></svg>',
};
const roomsT = r => r ? r + ' otaqlı' : 'Studiya';
const ord = n => { n = Math.abs(Math.round(+n)); const d = n % 10, t = Math.floor(n / 10) % 10; const sf = d ? ['', 'ci', 'ci', 'cü', 'cü', 'ci', 'cı', 'ci', 'ci', 'cu'][d] : t ? ['', 'cu', 'ci', 'cu', 'cı', 'ci', 'cı', 'ci', 'ci', 'cı'][t] : 'cü'; return n + '-' + sf; };
const bLbl = u => 'Bina ' + u.b + (u.ent ? ' · ' + u.ent + '-ci giriş' : '');
const stTxt = s => s === 'ok' ? 'Təhvil verilib' : 'Tikilir · ' + CO.delivery;
const free = UNITS.filter(u => u.st !== 'sold');
const BLD = (window.NC_BLD || []).filter(b => b.st !== 'n');
const BPIC = { A: 'tower_l', B: 'tower_r', C: 'entrance', E: 'front', F: 'corner', G: 'street' };
const bPic = id => BPIC[id] || 'aerial_c';
const priceT = u => u.st === 'sold' ? 'Satılıb' : HP ? 'Qiymət sorğu ilə' : fmt(u.price) + ' ₼';

/* şəkil */
const OWN = k => typeof IMG[k] === 'string' && IMG[k].indexOf('/assets/nc/site/' + k + '-') === 0;
function pic(k, alt, o = {}) {
  const src = IMG[k] || k || ''; if (!src) return '';
  const set = OWN(k) ? ` srcset="${src.replace(/-\d+\.webp$/, '-1280.webp')} 1280w, ${src} ${k === 'aerial' ? 2400 : 2560}w" sizes="${o.sizes || '100vw'}"` : '';
  return `<img src="${esc(src)}"${set} alt="${esc(alt || '')}"${o.eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}
const crumbs = (...a) => `<nav class="crumbs" aria-label="Yol"><a href="#home">Ana səhifə</a>${a.map(([t, h]) => `<span aria-hidden="true">/</span>${h ? `<a href="#${h}">${t}</a>` : `<span>${t}</span>`}`).join('')}</nav>`;
const pHead = (title, sub, extra = '', cr) => `<section class="ph wrap">${crumbs(...(cr || [[title]]))}<div class="ph-card"><div><h1 class="h1">${title}</h1>${sub ? `<p class="lead">${sub}</p>` : ''}</div>${extra}</div></section>`;

/* kartlar */
function uCard(u, photo) {
  return `<a class="ucard ${u.st === 'sold' ? 'sold' : ''}" href="#menzil-${u.id}">${photo ? `<div class="ph">${pic(bPic(u.b), bLbl(u), { sizes: '300px' })}</div>` : ''}
    <div class="top"><span class="a num">${fm2(u.a)} m²</span><span class="pr">${HP ? 'Sorğu ilə' : fmt(u.price) + ' ₼'}</span></div>
    <div class="ln"><span>${roomsT(u.r)}</span><span>${I.bld}${bLbl(u)}</span><span>${I.fl}${ord(u.f)} mərtəbə</span></div>
    <div class="ln">${u.c ? `<span class="tag">${esc(u.c)}</span>` : `<span class="tag g">${u.bst === 'ok' ? 'Hazır bina' : 'Tikilir'}</span>`}${u.st === 'bron' ? '<span class="tag g">Bron</span>' : ''}</div></a>`;
}
function bCard(b) {
  const us = UNITS.filter(u => u.b === b.id), fr = us.filter(u => u.st === 'free');
  const a0 = fr.length ? Math.min(...fr.map(u => u.a)) : 0, a1 = fr.length ? Math.max(...fr.map(u => u.a)) : 0;
  const rooms = [...new Set(fr.map(u => u.r))].sort().join(', ');
  return `<a class="bcard" href="#bina-${b.id}"><figure>${pic(bPic(b.id), 'Bina ' + b.id, { sizes: '(max-width:620px) 92vw, 33vw' })}<span class="badge"><i class="${b.st === 'ok' ? 'st-ok' : 'st-w'}"></i>${stTxt(b.st)}</span></figure>
    <div class="bd"><div class="t"><h3 class="h3">Bina ${b.id}</h3><span class="mu">${fr.length ? fr.length + ' mənzil satışda' : 'Satışda mənzil yoxdur'}</span></div>
    <div class="meta">${fr.length ? `<span class="tag">${fm2(a0)} – ${fm2(a1)} m²</span>` : ''}${rooms ? `<span class="tag g">${rooms} otaqlı</span>` : ''}</div>
    <div class="ft"><span class="lk">Mərtəbələrə bax ${I.ar}</span><span class="pr">${HP ? 'Sorğu ilə<small>qiymət</small>' : fr.length ? fmt(Math.min(...fr.map(u => u.price))) + ' ₼<small>başlayaraq</small>' : ''}</span></div></div></a>`;
}

/* forma */
const phoneOk = p => String(p).replace(/\D/g, '').length >= 9;
function bindForm(f, kind, extra, done) {
  if (!f) return;
  $$('.chips', f).forEach(c => c.onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('button', c).forEach(x => x.classList.toggle('on', x === b)); });
  f.onsubmit = e => {
    e.preventDefault(); const d = Object.assign(Object.fromEntries(new FormData(f)), extra ? extra(f) : {}); let bad = false;
    $$('.err', f).forEach(x => x.textContent = '');
    if ('name' in d && String(d.name).trim().length < 2) { $('[data-e=name]', f).textContent = 'Adınızı yazın'; bad = true; }
    if ('phone' in d && !phoneOk(d.phone)) { $('[data-e=phone]', f).textContent = 'Nömrəni yazın, məsələn 050 700 00 88'; bad = true; }
    if (bad) return;
    window.ncLead && window.ncLead(typeof kind === 'function' ? kind() : kind, d);
    f.outerHTML = `<div class="done" role="status"><b>Sorğunuz qəbul olundu</b><span>${done ? done(d) : 'Satış meneceri qısa zamanda sizə zəng edəcək.'}</span></div>`;
  };
}
const nameFld = id => `<div class="row2"><div class="fld"><label for="${id}N">Adınız</label><input class="in" id="${id}N" name="name" autocomplete="name"><div class="err" data-e="name"></div></div><div class="fld"><label for="${id}P">Telefon</label><input class="in" id="${id}P" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="050 000 00 00"><div class="err" data-e="phone"></div></div></div>`;
const DAYS = ['Bazar', 'B.e.', 'Ç.a.', 'Çər.', 'C.a.', 'Cümə', 'Şənbə'], MON = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
function leadForm(o = {}) {
  const days = []; for (let i = 1, d = new Date(); days.length < 6; i++) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i); if (x.getDay() !== 0) days.push(x); }
  const isPrice = o.kind === 'price';
  return `<form class="frm" id="lf" novalidate>${nameFld('lf')}
    <div class="fld"><span>Nə ilə maraqlanırsınız?</span><div class="chips" data-k="kind"><button type="button" data-v="price" class="${isPrice ? 'on' : ''}">Qiymət</button><button type="button" data-v="viewing" class="${isPrice ? '' : 'on'}">Baxışa gəlmək</button><button type="button" data-v="callback">Zəng edin</button></div></div>
    ${o.unit ? `<input type="hidden" name="unit" value="${esc(o.unit)}">` : `<div class="fld"><span>Otaq sayı</span><div class="chips" data-k="r"><button type="button" data-v="">Fərq etməz</button>${['1', '2', '3', '4+'].map((t, i) => `<button type="button" data-v="${t}" class="${i === 1 ? 'on' : ''}">${t}</button>`).join('')}</div></div>`}
    <div class="fld lf-day"><span>Baxış günü</span><div class="chips" data-k="day">${days.map((x, i) => `<button type="button" data-v="${x.toISOString().slice(0, 10)}" class="${i ? '' : 'on'}">${x.getDate()} ${MON[x.getMonth()].slice(0, 3)}<small>${DAYS[x.getDay()]}</small></button>`).join('')}</div></div>
    <div><button class="btn" type="submit">Göndər ${I.ar}</button></div></form>`;
}
function bindLead(root, unit) {
  const f = $('#lf', root); if (!f) return;
  const v = k => (($(`[data-k=${k}] .on`, f) || {}).dataset || {}).v;
  const kind = () => v('kind') || 'viewing';
  const sync = () => { const d = $('.lf-day', f); if (d) d.style.display = kind() === 'viewing' ? '' : 'none'; };
  $('[data-k=kind]', f).addEventListener('click', () => setTimeout(sync, 0)); sync();
  bindForm(f, kind, () => { const k = kind(), u = unit; return { slot: k === 'viewing' ? v('day') : '', msg: (k === 'price' ? 'Qiymət sorğusu' : k === 'viewing' ? 'Baxışa yazılış' : 'Zəng sifarişi') + (u ? ': ' + bLbl(u) + ', ' + ord(u.f) + ' mərtəbə, ' + roomsT(u.r) + ', ' + fm2(u.a) + ' m²' : v('r') ? ': ' + v('r') + ' otaqlı' : '') }; },
    d => `${esc(d.name)}, sorğunuz qəbul olundu. Satış meneceri qısa zamanda zəng edəcək.`);
}

/* kalkulyator (qiymətlər açıq olanda) */
function calcBlock(u) {
  return `<div class="calc" id="cc">${u ? '' : `<div class="rng"><div class="v"><span>Sahə</span><b><span id="cA">100</span> m²</b></div><input type="range" id="iA" min="40" max="220" value="100"></div><div class="rng"><div class="v"><span>1 m² qiyməti</span><b><span id="cP">${fmt(CO.priceFrom)}</span> ₼</b></div><input type="range" id="iP" min="${CO.priceFrom}" max="${CO.priceFrom + 800}" step="50" value="${CO.priceFrom}"></div>`}
    <div class="rng"><div class="v"><span>İlkin ödəniş</span><b><span id="cI">50</span>%</b></div><input type="range" id="iI" min="30" max="90" step="5" value="50"></div>
    <div class="seg" id="iT">${TERMS.map((t, i) => `<button type="button" data-m="${t.m}" class="${i ? '' : 'on'}">${t.m} ay</button>`).join('')}</div>
    <div class="out"><span>Aylıq ödəniş</span><div class="mon num" id="cM"></div><dl><dt>Mənzilin dəyəri</dt><dd class="num" id="cT"></dd><dt>İlkin ödəniş</dt><dd class="num" id="cD"></dd></dl></div></div>`;
}
function bindCalc(root, u) {
  const c = $('#cc', root); if (!c) return; const st = { a: u ? u.a : 100, p: u ? u.ppm : CO.priceFrom, i: 50, m: TERMS[0] ? TERMS[0].m : 6 };
  const draw = () => { const tot = st.a * (st.p + SUR(st.m)), d = tot * st.i / 100; $('#cM', c).textContent = fmt((tot - d) / st.m) + ' ₼'; $('#cT', c).textContent = fmt(tot) + ' ₼'; $('#cD', c).textContent = fmt(d) + ' ₼'; $('#cI', c).textContent = st.i; if ($('#cA', c)) { $('#cA', c).textContent = st.a; $('#cP', c).textContent = fmt(st.p); } };
  [['#iA', 'a'], ['#iP', 'p'], ['#iI', 'i']].forEach(([s, k]) => { const e = $(s, c); if (e) e.oninput = () => { st[k] = +e.value; draw(); }; });
  $('#iT', c).onclick = e => { const b = e.target.closest('button'); if (!b) return; st.m = +b.dataset.m; $$('#iT button', c).forEach(x => x.classList.toggle('on', x === b)); draw(); };
  draw();
}

/* blokları */
const SLIDES = [['front', 'Nizami City', 'Yasamalda, Nizami metrosunun yanında qapalı həyətli yaşayış kompleksi'], ['aerial_c', 'Qapalı həyət', 'Mərkəzdə avtomobilsiz həyət, uşaq meydançası və istirahət zonası'], ['corner', 'Hazır və tikilən binalar', 'A, B, C binaları təhvil verilib, E, F, G binaları tikilir']];
function heroBlock() {
  const t = TERMS[0];
  return `<section class="wrap"><div class="hero"><div class="slides" id="sl">${SLIDES.map(([k, h, s], i) => `<div class="slide${i ? '' : ' on'}">${pic(k, h, { eager: !i, sizes: '(max-width:900px) 100vw, 66vw' })}</div>`).join('')}
      <div class="hero-t"><h1 class="h1" id="slH">${SLIDES[0][1]}</h1><p class="lead" id="slS">${SLIDES[0][2]}</p></div>
      <div class="hero-dots" id="slD">${SLIDES.map((_, i) => `<button type="button" aria-label="Şəkil ${i + 1}" class="${i ? '' : 'on'}"></button>`).join('')}</div>
      <div class="hero-nav"><button type="button" aria-label="Əvvəlki" data-d="-1">${I.al}</button><button type="button" aria-label="Növbəti" data-d="1">${I.ar}</button></div></div>
    <div class="offer"><img class="mk" src="/assets/nc/site/mark-cream.png" alt=""><span>Daxili kredit</span><div class="big">${t ? t.m + ' ay' : '0%'}</div><h2>faizsiz ödəniş</h2><p>Mənzili hissə-hissə alın: ilkin ödənişdən sonra qalan məbləği ${t ? t.m + ' ay ərzində faizsiz' : 'hissə-hissə'} ödəyin${TERMS.length > 1 ? ', ' + TERMS.slice(1).map(x => x.m).join(' və ') + ' aylıq variantlar da var' : ''}.</p><a class="btn" href="#elaqe" data-kind="price">${HP ? 'Qiyməti öyrən' : 'Hesabla'} ${I.ar}</a></div></div>
    ${findBlock()}</section>`;
}
function bindHero(root) {
  const sl = $('#sl', root); if (!sl) return; let i = 0, tm;
  const go = n => { i = (n + SLIDES.length) % SLIDES.length; $$('.slide', sl).forEach((s, k) => s.classList.toggle('on', k === i)); $$('#slD button', sl).forEach((s, k) => s.classList.toggle('on', k === i)); $('#slH', sl).textContent = SLIDES[i][1]; $('#slS', sl).textContent = SLIDES[i][2]; };
  const auto = () => { clearInterval(tm); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) tm = setInterval(() => { if (!document.body.contains(sl)) return clearInterval(tm); go(i + 1); }, 6000); };
  $$('#slD button', sl).forEach((b, k) => b.onclick = () => { go(k); auto(); });
  $$('.hero-nav button', sl).forEach(b => b.onclick = () => { go(i + +b.dataset.d); auto(); });
  auto();
}
function findBlock() {
  const bs = BLD.map(b => b.id);
  return `<div class="find"><div class="find-h"><h2 class="h3" style="font-size:22px">Sizə uyğun mənzili tapın</h2><span class="mu">${free.length} mənzil satışda</span></div>
    <form class="find-g" id="fd"><div class="fld"><span>Otaq sayı</span><div class="seg" data-k="r">${[[0, 'Hamısı'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']].map(([v, t], i) => `<button type="button" data-v="${v}" class="${i ? '' : 'on'}">${t}</button>`).join('')}</div></div>
    <div class="fld"><label for="fdB">Bina</label><select class="sel" id="fdB"><option value="">Bütün binalar</option>${bs.map(b => `<option value="${b}">Bina ${b}</option>`).join('')}</select></div>
    <div class="fld"><label for="fdP">Mərhələ</label><select class="sel" id="fdP"><option value="all">Hamısı</option><option value="ok">Hazır binalar</option><option value="w">Tikilən binalar</option></select></div>
    <button class="btn" type="submit">Axtar ${I.ar}</button></form></div>`;
}
function bindFind(root) {
  const f = $('#fd', root); if (!f) return; let r = 0;
  $('[data-k=r]', f).onclick = e => { const b = e.target.closest('button'); if (!b) return; r = +b.dataset.v; $$('[data-k=r] button', f).forEach(x => x.classList.toggle('on', x === b)); };
  f.onsubmit = e => { e.preventDefault(); resetF(); F.r = r; F.b = $('#fdB', f).value; F.ph = $('#fdP', f).value; location.hash = 'menziller'; };
}
function buildingsBlock(full) {
  const tabs = [['w', 'Tikilən binalar'], ['ok', 'Hazır binalar']];
  return `<div class="sh"><h2 class="h2">${full ? 'Binalar' : 'Binalar'}</h2><div class="tabs" id="bt">${tabs.map(([v, t], i) => `<button type="button" data-v="${v}" class="${i ? '' : 'on'}">${t}</button>`).join('')}</div></div><div class="bgrid" id="bg"></div>`;
}
function bindBuildings(root) {
  const g = $('#bg', root); if (!g) return;
  const draw = v => { g.innerHTML = BLD.filter(b => b.st === v).map(bCard).join(''); };
  $('#bt', root).onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#bt button', root).forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.v); };
  draw('w');
}
function offersBlock() {
  const pickBy = r => free.filter(u => u.st === 'free' && (r === 4 ? u.r >= 4 : u.r === r)).sort((a, b) => a.a - b.a);
  const L = [1, 2, 3, 4].flatMap(r => pickBy(r).filter((u, i, A) => A.findIndex(x => Math.abs(x.a - u.a) < .5 && x.b === u.b) === i).slice(0, 2));
  if (!L.length) return '';
  return `<div class="sh"><h2 class="h2">Satışda olan mənzillər</h2><div style="display:flex;gap:10px;align-items:center"><a class="pillbtn" href="#menziller">Hamısına bax ${I.ar}</a><div class="rail-nav"><button type="button" aria-label="Geri" data-rd="-1">${I.al}</button><button type="button" aria-label="İrəli" data-rd="1">${I.ar}</button></div></div></div>
    <div class="rail" id="rl">${L.map(u => uCard(u, true)).join('')}</div>`;
}
function bindRail(root) { const r = $('#rl', root); if (!r) return; $$('[data-rd]', root).forEach(b => b.onclick = () => r.scrollBy({ left: +b.dataset.rd * (r.clientWidth * .8), behavior: 'smooth' })); }
const promoBlock = () => `<div class="promo"><div class="tx"><h2>Hazır binalarda açarı bu gün alın</h2><p class="lead">A, B və C binaları tikilib və təhvil verilib. Mənzilə baxın, müqavilədən sonra açarı dərhal təhvil alın.</p>
  <div class="acts"><a class="btn" href="#menziller" data-ph="ok">Hazır mənzillər ${I.ar}</a><a class="lk" href="#binalar">Baş plana bax ${I.ar}</a></div></div><div class="im">${pic('aerial', 'Hazır binaların 3D vizualı', { sizes: '(max-width:860px) 92vw, 45vw' })}</div></div>`;
const FEAT = [['aerial_c', 'Qapalı həyət', 'Həyətə yalnız sakinlər daxil olur: avtomobilsiz meydan, uşaq meydançası və istirahət zonası.'], ['street', 'Kommersiya qalereyası', 'Birinci mərtəbələrdə supermarket, aptek, kafe və xidmətlər.'], ['entrance', 'Yeraltı parkinq', 'İki səviyyəli parkinq, liftlər birbaşa parkinqə enir.'], ['tower_r', 'Keramoqranit fasad', 'Uzunömürlü, baxımı asan və illər keçsə də təzə görünən fasad.']];
const ICONS = [[I.sh, '7/24 mühafizə', 'Kamera və kodlu giriş'], [I.bolt, 'Generator', 'Fasiləsiz enerji'], [I.metro, 'Nizami metrosu', 'Bir neçə dəqiqəlik məsafə'], [I.bag, 'Gündəlik xidmətlər', 'Binaların altında']];
const featBlock = () => `<div class="sh"><h2 class="h2">Kompleksdə həyat</h2></div><div class="feats">${FEAT.map(([k, t, p]) => `<article class="feat"><figure>${pic(k, t, { sizes: '(max-width:520px) 92vw, 25vw' })}</figure><div class="bd"><h3 class="h3">${t}</h3><p>${p}</p></div></article>`).join('')}</div>
  <div class="icons">${ICONS.map(([i, b, s]) => `<div class="icn"><i>${i}</i><div><b>${b}</b><span>${s}</span></div></div>`).join('')}</div>`;
const MAPQ = encodeURIComponent('Nizami City, Cəfər Cabbarlı 31, Bakı');
const PIC = { 'Nəqliyyat': 'M', 'Alış-veriş': 'T', 'Təhsil': 'S', 'İstirahət': 'P' };
const locBlock = () => `<div class="sh"><h2 class="h2">Məkan</h2><span class="mu">${esc(CO.addr)}</span></div><div class="loc"><div class="map"><iframe title="Xəritə: Nizami City" loading="lazy" src="https://maps.google.com/maps?q=${MAPQ}&z=15&output=embed" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
  <div class="pois">${POI.map(p => `<div class="poi"><i>${PIC[p.c] || '•'}</i><div><b>${esc(p.n)}</b><span>${esc(p.d)}</span></div><em>${esc(p.c)}</em></div>`).join('')}</div></div>`;
const posts = () => BLOG.slice().sort((a, b) => String(b.d).localeCompare(String(a.d)));
const dfmt = s => { const d = new Date(s); return isNaN(d) ? esc(s) : `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
const nCard = p => `<a class="ncard" href="#bloq-${esc(p.id)}"><figure>${p.img ? pic(p.img, '', { sizes: '(max-width:620px) 92vw, 33vw' }) : ''}</figure><div class="bd"><h3 class="h3">${esc(p.t)}</h3><p>${esc(p.x || '')}</p><div class="ft"><span class="lk">Ətraflı ${I.ar}</span><span>${dfmt(p.d)}</span></div></div></a>`;
const newsBlock = () => OFF.bloq || !BLOG.length ? '' : `<div class="sh"><h2 class="h2">Bloq</h2><a class="pillbtn" href="#bloq">Bütün yazılar ${I.ar}</a></div><div class="news">${posts().slice(0, 3).map(nCard).join('')}</div>`;
const faqList = L => `<div class="qa">${L.map(([q, a], i) => `<details${i ? '' : ' open'}><summary>${esc(q)}<i>${I.pl}</i></summary><div class="an">${esc(a)}</div></details>`).join('')}</div>`;
const contactsList = () => `<div class="contacts"><a href="tel:${esc(CO.short)}"><i>${I.ph}</i><div><small>Qısa nömrə</small><b>${esc(CO.short)}</b></div></a>${(CO.phones || []).map((p, i) => `<a href="tel:${esc((CO.tel || [])[i] || p)}"><i>${I.ph}</i><div><small>Telefon</small><b>${esc(p)}</b></div></a>`).join('')}<div><i>${I.pin}</i><div><small>Ünvan</small><b>${esc(CO.addr)}</b></div></div><div><i>${I.clk}</i><div><small>İş saatları</small><b>${esc(CO.hours)}</b></div></div>${CO.email ? `<a href="mailto:${esc(CO.email)}"><i>${I.mail}</i><div><small>Email</small><b>${esc(CO.email)}</b></div></a>` : ''}</div>`;
const contactBlock = (o = {}) => `<div class="two"><div class="card"><h2 class="h2">${o.title || 'Sorğu göndərin'}</h2><p class="lead" style="margin:8px 0 20px">${o.sub || 'Qiymət, baxış və ya ödəniş şərtləri barədə — satış meneceri sizə zəng edəcək.'}</p>${leadForm(o)}</div><div class="card"><h2 class="h2">Əlaqə</h2>${contactsList()}</div></div>`;
const faqBlock = n => `<div class="two"><div class="card"><h2 class="h2" style="margin-bottom:8px">Suallar</h2>${faqList(n ? FAQ.slice(0, n) : FAQ)}${n && FAQ.length > n ? `<div style="margin-top:14px"><a class="lk" href="#suallar">Bütün suallar ${I.ar}</a></div>` : ''}</div><div class="card" id="visit"><h2 class="h2">Sorğu göndərin</h2><p class="lead" style="margin:8px 0 20px">Qiymət, baxış və ya ödəniş şərtləri barədə — satış meneceri sizə zəng edəcək.</p>${leadForm()}</div></div>`;

/* SƏHİFƏLƏR */
const pages = {};
pages.home = () => ({
  title: 'Nizami City — Yasamalda qapalı həyətli yaşayış kompleksi', html: `${heroBlock()}
  <section class="sec wrap">${buildingsBlock()}</section>
  <section class="sec wrap">${offersBlock()}</section>
  <section class="sec wrap">${promoBlock()}</section>
  <section class="sec wrap">${featBlock()}</section>
  <section class="sec wrap">${locBlock()}</section>
  ${newsBlock() ? `<section class="sec wrap">${newsBlock()}</section>` : ''}
  <section class="sec wrap">${faqBlock(5)}</section>`,
  mount(r) { bindHero(r); bindFind(r); bindBuildings(r); bindRail(r); bindLead(r); }
});
pages.binalar = () => ({
  title: 'Binalar — Nizami City', html: `${pHead('Binalar', 'A, B və C binaları təhvil verilib. E, F və G binaları tikilir, təhvil ' + esc(CO.delivery) + '.', `<div class="stats"><div class="stat"><b>${BLD.length}</b><span>bina</span></div><div class="stat"><b>${free.filter(u => u.st === 'free').length}</b><span>satışda</span></div><div class="stat"><b>${window.NC_FLOORS || 10}</b><span>mərtəbə</span></div></div>`)}
  <section class="sec wrap"><div class="iso">${pic('aerial', 'Hazır binaların 3D vizualı', { sizes: '(max-width:900px) 92vw, 1200px' })}<span class="hs" style="left:47%;top:58%"><i></i><span>Qapalı həyət</span></span><span class="hs" style="left:45%;top:80%"><i></i><span>Kommersiya qalereyası</span></span><span class="hs" style="left:57%;top:88%"><i></i><span>Parkinqə giriş</span></span></div></section>
  <section class="sec wrap">${buildingsBlock(true)}</section>
  <section class="sec wrap"><div class="sh"><h2 class="h2">Mərhələlər</h2></div><div class="tline">${TIMELINE.map(([a, b, c, s]) => `<div class="card"><span class="badge" style="position:static;background:var(--soft)"><i class="${s === 'ok' ? 'st-ok' : 'st-w'}"></i>${esc(b)}</span><h3 class="h3" style="margin:12px 0 6px">${esc(a)}</h3><p class="ink2" style="margin:0">${esc(c)}</p></div>`).join('')}</div></section>`,
  mount(r) { bindBuildings(r); }
});
pages.bina = id => {
  const b = BLD.find(x => x.id === id); if (!b) return pages.binalar();
  const us = UNITS.filter(u => u.b === id), fls = [...new Set(us.map(u => u.f))].sort((a, c) => c - a);
  let fl = fls.find(f => us.some(u => u.f === f && u.st === 'free')) || fls[0];
  return {
    title: `Bina ${id} — Nizami City`, html: `${pHead('Bina ' + id, stTxt(b.st), `<div class="stats"><div class="stat"><b>${fls.length}</b><span>mərtəbə</span></div><div class="stat"><b>${us.filter(u => u.st === 'free').length}</b><span>satışda</span></div></div>`, [['Binalar', 'binalar'], ['Bina ' + id]])}
    <section class="sec wrap">${us.length ? `<div class="sh"><h2 class="h2" id="flT"></h2><span class="mu">Mərtəbəni seçin</span></div><div class="floors">${fls.map(f => `<button type="button" data-f="${f}"><b>${f}</b><span>${us.filter(u => u.f === f && u.st === 'free').length} satışda</span></button>`).join('')}</div><div class="ugrid" id="ug" style="margin-top:14px"></div>` : `<div class="empty">Bu binanın mənzilləri hazırda saytda göstərilmir. Satış ofisindən məlumat alın: ${esc(CO.short)}</div>`}</section>
    <section class="sec wrap">${contactBlock({ title: 'Bina ' + id + ' üzrə sorğu', kind: 'price' })}</section>`,
    mount(r) {
      const draw = f => { fl = f; $$('.floors button', r).forEach(x => x.classList.toggle('on', +x.dataset.f === f)); $('#flT', r).textContent = ord(f) + ' mərtəbə'; $('#ug', r).innerHTML = us.filter(u => u.f === f).map(u => uCard(u)).join(''); };
      if (us.length) { $$('.floors button', r).forEach(x => x.onclick = () => draw(+x.dataset.f)); draw(fl); }
      bindLead(r);
    }
  };
};
const F = {}; const resetF = () => Object.assign(F, { r: 0, b: '', ph: 'all', sort: HP ? 'aa' : 'pa', n: 24 }); resetF();
function filtered() {
  const L = free.filter(u => (!F.r || (F.r === 4 ? u.r >= 4 : u.r === F.r)) && (!F.b || u.b === F.b) && (F.ph === 'all' || u.bst === F.ph));
  const s = { pa: (a, b) => a.price - b.price, pd: (a, b) => b.price - a.price, aa: (a, b) => a.a - b.a, ad: (a, b) => b.a - a.a, fd: (a, b) => b.f - a.f }[F.sort]; return L.sort(s);
}
pages.menziller = () => ({
  title: 'Mənzillər — Nizami City', html: `${pHead('Mənzillər', 'Satışda olan bütün mənzillər — satış bazası ilə eyni vaxtda yenilənir.')}
  <section class="wrap"><div class="fbar">
    <div class="fld"><span>Otaq</span><div class="seg" data-k="r">${[[0, 'Hamısı'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']].map(([v, t]) => `<button type="button" data-v="${v}">${t}</button>`).join('')}</div></div>
    <div class="fld"><span>Mərhələ</span><div class="seg" data-k="ph">${[['all', 'Hamısı'], ['ok', 'Hazır'], ['w', 'Tikilən']].map(([v, t]) => `<button type="button" data-v="${v}">${t}</button>`).join('')}</div></div>
    <div class="fld"><label for="fB">Bina</label><select class="sel" id="fB"><option value="">Bütün binalar</option>${BLD.map(b => `<option value="${b.id}">Bina ${b.id}</option>`).join('')}</select></div>
    <div class="fld"><label for="fS">Sıralama</label><select class="sel" id="fS">${HP ? '' : '<option value="pa">Qiymət: ucuzdan</option><option value="pd">Qiymət: bahadan</option>'}<option value="aa">Sahə: kiçikdən</option><option value="ad">Sahə: böyükdən</option><option value="fd">Mərtəbə: yuxarıdan</option></select></div></div>
    <div class="cnt"><div><b class="num" id="fN"></b> <span class="mu">mənzil tapıldı</span></div><button class="lk" type="button" id="fR">Filtrləri sıfırla</button></div>
    <div class="ugrid" id="fG"></div><div class="more"><button class="btn tn" type="button" id="fM">Daha çox göstər</button></div></section>
  <section class="sec wrap">${contactBlock({ title: 'Uyğun mənzili birlikdə seçək', kind: 'price' })}</section>`,
  mount(r) {
    const sync = () => { $$('.seg[data-k]', r).forEach(s => $$('button', s).forEach(b => b.classList.toggle('on', String(F[s.dataset.k]) === b.dataset.v))); $('#fB', r).value = F.b; $('#fS', r).value = F.sort; };
    const draw = () => { const L = filtered(); $('#fN', r).textContent = L.length; $('#fG', r).innerHTML = L.slice(0, F.n).map(u => uCard(u)).join('') || '<div class="empty" style="grid-column:1/-1">Bu filtrlərlə satışda mənzil yoxdur.</div>'; $('#fM', r).style.display = L.length > F.n ? '' : 'none'; };
    $$('.seg[data-k]', r).forEach(s => s.onclick = e => { const b = e.target.closest('button'); if (!b) return; F[s.dataset.k] = s.dataset.k === 'r' ? +b.dataset.v : b.dataset.v; F.n = 24; sync(); draw(); });
    $('#fB', r).onchange = e => { F.b = e.target.value; F.n = 24; draw(); }; $('#fS', r).onchange = e => { F.sort = e.target.value; draw(); };
    $('#fR', r).onclick = () => { resetF(); sync(); draw(); }; $('#fM', r).onclick = () => { F.n += 24; draw(); };
    sync(); draw(); bindLead(r);
  }
});
function plateSvg(u) {
  const same = UNITS.filter(x => x.b === u.b && x.f === u.f && x.ent === u.ent).sort((a, b) => a.n - b.n), n = Math.max(2, same.length), half = Math.ceil(n / 2), W = 600, cw = (W - 20) / half;
  return `<svg viewBox="0 0 ${W} 260" role="img" aria-label="Mərtəbədə yerləşmə">${same.map((x, i) => { const top = i < half, k = top ? i : i - half, X = 10 + k * cw, Y = top ? 10 : 150, me = x.id === u.id; return `<rect x="${X + 3}" y="${Y}" width="${cw - 6}" height="100" rx="10" fill="${me ? '#3f4d2c' : x.st === 'sold' ? '#eceee6' : '#dfe4d3'}"/><text x="${X + cw / 2}" y="${Y + 56}" text-anchor="middle" font-family="NC Text, sans-serif" font-size="17" fill="${me ? '#fff' : '#555d4c'}">${x.f}.${x.n}</text>`; }).join('')}<rect x="10" y="118" width="${W - 20}" height="24" rx="8" fill="#f4f5f0"/><text x="${W / 2}" y="135" text-anchor="middle" font-family="NC Text, sans-serif" font-size="13" fill="#80877a">dəhliz və liftlər</text></svg>`;
}
pages.menzil = id => {
  const u = UNITS.find(x => x.id === id); if (!u) return pages.menziller();
  const sim = free.filter(x => x.id !== u.id && x.r === u.r && x.st === 'free').sort((a, b) => Math.abs(a.a - u.a) - Math.abs(b.a - u.a)).slice(0, 4);
  return {
    title: `${roomsT(u.r)}, ${fm2(u.a)} m² — ${bLbl(u)} — Nizami City`, html: `<section class="ph wrap">${crumbs(['Mənzillər', 'menziller'], [bLbl(u)])}
      <div class="unit"><div style="display:grid;gap:16px"><div class="gal">${pic(bPic(u.b), bLbl(u), { eager: true, sizes: '(max-width:900px) 92vw, 58vw' })}</div><div class="plan"><h3 class="h3" style="margin-bottom:12px">Mərtəbədə yerləşmə</h3>${plateSvg(u)}<p class="mu" style="margin:10px 0 0;font-size:14px">Sxematik göstərilib. Dəqiq plan satış ofisində təqdim olunur.</p></div></div>
      <div class="side"><div class="card"><h1 class="h2">${roomsT(u.r)}, ${fm2(u.a)} m²</h1><p class="mu" style="margin:6px 0 16px">${bLbl(u)} · ${ord(u.f)} mərtəbə</p>
        <div class="prbox"><b>${priceT(u)}</b>${!HP && u.st !== 'sold' ? `<span class="mu">${fmt(u.ppm)} ₼/m²</span>` : ''}</div>
        <div class="kv" style="margin-top:14px">${[['Otaq sayı', u.r], ['Sahə', fm2(u.a) + ' m²'], ['Mərtəbə', `${u.f} / ${window.NC_FLOORS || 10}`], ['Vəziyyət', u.c || (u.bst === 'ok' ? 'Təmirsiz' : 'Tikilir')], ['Təhvil', u.bst === 'ok' ? 'Hazırdır' : CO.delivery], ['Status', u.st === 'bron' ? 'Bron olunub' : u.st === 'sold' ? 'Satılıb' : 'Satışda']].map(([a, b]) => `<div><span>${a}</span><b>${esc(b)}</b></div>`).join('')}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><a class="btn" href="#lfw">${HP ? 'Qiyməti öyrən' : 'Baxışa yazıl'} ${I.ar}</a><a class="btn tn" href="tel:${esc(CO.short)}">${I.ph} ${esc(CO.short)}</a></div></div>
        ${!HP ? `<div class="card"><h3 class="h3" style="margin-bottom:12px">Ödəniş hesabla</h3>${calcBlock(u)}</div>` : ''}</div></div></section>
    <section class="sec wrap" id="lfw">${contactBlock({ title: HP ? 'Bu mənzilin qiyməti' : 'Bu mənzil üzrə sorğu', sub: 'Nömrənizi yazın — satış meneceri qiymət və ödəniş şərtlərini zəng edib desin.', kind: 'price', unit: u.id })}</section>
    ${sim.length ? `<section class="sec wrap"><div class="sh"><h2 class="h2">Oxşar mənzillər</h2></div><div class="ugrid">${sim.map(x => uCard(x, true)).join('')}</div></section>` : ''}`,
    mount(r) { bindCalc(r, u); bindLead(r, u); $$('a[href="#lfw"]', r).forEach(a => a.onclick = e => { e.preventDefault(); $('#lfw', r).scrollIntoView({ behavior: 'smooth' }); }); }
  };
};
pages.kalkulyator = () => ({ title: 'Ödəniş — Nizami City', html: `${pHead('Ödəniş', 'Daxili kredit: ' + TERMS.map(t => t.m + ' ay' + (t.s ? ' (+' + t.s + ' ₼/m²)' : ' faizsiz')).join(', ') + '. Nəticə təxminidir.')}<section class="sec wrap"><div class="two"><div class="card">${calcBlock()}</div><div class="card"><h2 class="h2">Sorğu</h2><p class="lead" style="margin:8px 0 20px">Dəqiq hesablama üçün satış meneceri ilə əlaqə saxlayın.</p>${leadForm({ kind: 'price' })}</div></div></section>`, mount(r) { bindCalc(r); bindLead(r); } });
pages.mekan = () => ({ title: 'Məkan — Nizami City', html: `${pHead('Məkan', esc(CO.addr))}<section class="sec wrap">${locBlock()}</section><section class="sec wrap">${featBlock()}</section>` });
pages.kommersiya = () => ({
  title: 'Kommersiya sahələri — Nizami City', html: `${pHead('Kommersiya sahələri', 'Binaların birinci mərtəbələrində küçəyə açılan qeyri-yaşayış sahələri.')}
  <section class="sec wrap"><div class="promo"><div class="tx"><h2>Biznesiniz üçün yer</h2><div class="kv">${[['Yerləşmə', 'Birinci mərtəbələr, küçə tərəfi'], ['Müştəri axını', 'Kompleksin sakinləri və metro yolu'], ['Uyğundur', 'Market, aptek, kafe, salon, ofis']].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}</div></div><div class="im" style="min-height:340px">${pic('street', 'Kommersiya qalereyası', { sizes: '45vw' }).replace('<img', '<img style="object-fit:cover;padding:0"')}</div></div></section>
  <section class="sec wrap"><div class="two"><div class="card"><h2 class="h2">Sorğu göndərin</h2><form class="frm" id="cf" novalidate style="margin-top:16px">${nameFld('cf')}<div class="fld"><label for="cfB">Biznes növü və lazım olan sahə</label><input class="in" id="cfB" name="msg" placeholder="Məsələn: kafe, 120 m²"></div><div><button class="btn">Göndər ${I.ar}</button></div></form></div><div class="card"><h2 class="h2">Əlaqə</h2>${contactsList()}</div></div></section>`,
  mount(r) { bindForm($('#cf', r), 'commercial', null, () => 'Kommersiya meneceri sizə zəng edəcək.'); }
});
pages.bloq = () => ({ title: 'Bloq — Nizami City', html: `${pHead('Bloq', 'Mənzil seçimi, ödəniş və Yasamalda həyat haqqında.')}<section class="sec wrap"><div class="news">${posts().map(nCard).join('') || '<div class="empty">Hələ yazı yoxdur.</div>'}</div></section>` });
pages.post = id => {
  const p = BLOG.find(x => x.id === id); if (!p) return pages.bloq();
  return { title: p.t + ' — Nizami City', html: `<section class="ph wrap"><div class="art">${crumbs(['Bloq', 'bloq'], [p.c])}<h1 class="h1" style="font-size:clamp(30px,3.6vw,46px)">${esc(p.t)}</h1><p class="mu" style="margin:10px 0 0">${esc(p.c)} · ${dfmt(p.d)}${p.m ? ' · ' + p.m + ' dəq oxu' : ''}</p>${p.img ? `<div class="cover">${pic(p.img, p.t, { sizes: '780px' })}</div>` : '<div style="height:24px"></div>'}<div class="bd">${p.b || ''}</div></div></section>
    <section class="sec wrap"><div class="sh"><h2 class="h2">Digər yazılar</h2></div><div class="news">${posts().filter(x => x.id !== id).slice(0, 3).map(nCard).join('')}</div></section>` };
};
pages.suallar = () => ({ title: 'Suallar — Nizami City', html: `${pHead('Suallar və cavablar', '')}<section class="sec wrap">${faqBlock()}</section>`, mount(r) { bindLead(r); } });
pages.elaqe = () => ({ title: 'Əlaqə — Nizami City', html: `${pHead('Əlaqə', 'Satış ofisi: ' + esc(CO.hours))}<section class="sec wrap">${contactBlock({ kind: 'viewing' })}</section><section class="sec wrap">${locBlock()}</section>`, mount(r) { bindLead(r); } });

/* altlıq */
function footer() {
  $('#ft').innerHTML = `<div class="wrap"><div class="cols"><div><a class="brand" href="#home"><img src="/assets/nc/site/mark-cream.png" alt="">Nizami City</a><p>${esc(CO.slogan || '')}. ${esc(CO.addr)}</p><div class="soc">${CO.ig ? `<a class="icb" href="https://instagram.com/${esc(CO.ig)}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a>` : ''}${CO.wa ? `<a class="icb" href="https://wa.me/${esc(CO.wa)}" target="_blank" rel="noopener" aria-label="WhatsApp">${I.wa}</a>` : ''}</div></div>
    <div><h4>Mənzillər</h4><a href="#menziller">Bütün mənzillər</a><a href="#binalar">Binalar</a>${HP ? '' : '<a href="#kalkulyator">Ödəniş</a>'}<a href="#kommersiya">Kommersiya</a></div>
    <div><h4>Kompleks</h4><a href="#mekan">Məkan</a>${OFF.bloq ? '' : '<a href="#bloq">Bloq</a>'}<a href="#suallar">Suallar</a><a href="#elaqe">Əlaqə</a></div>
    <div><h4>Əlaqə</h4><a href="tel:${esc(CO.short)}">${esc(CO.short)}</a>${(CO.phones || []).map((p, i) => `<a href="tel:${esc((CO.tel || [])[i] || p)}">${esc(p)}</a>`).join('')}${CO.email ? `<a href="mailto:${esc(CO.email)}">${esc(CO.email)}</a>` : ''}</div></div>
    <div class="bot"><span>© ${new Date().getFullYear()} Nizami City · City Life MMC</span><span>${esc(CO.hours)}</span></div></div>`;
}

/* marşrut */
function parse() {
  const h = decodeURIComponent(location.hash.slice(1)) || 'home'; let m;
  if ((m = h.match(/^bina-([A-Z])$/))) return ['bina', m[1]];
  if ((m = h.match(/^menzil-(.+)$/))) return ['menzil', m[1]];
  if ((m = h.match(/^bloq-(.+)$/))) return OFF.bloq ? ['home'] : ['post', m[1]];
  if (h === 'layihe' || h === 'gunes' || h === 'qalereya') return ['binalar'];
  return [pages[h] && !['bina', 'menzil', 'post'].includes(h) && !OFF[h] ? h : 'home'];
}
function render() {
  const [k, arg] = parse(), pg = pages[k](arg), main = $('#view');
  main.innerHTML = pg.html; document.title = pg.title || 'Nizami City';
  const act = k === 'menzil' ? 'menziller' : k === 'bina' ? 'binalar' : k === 'post' ? 'bloq' : k;
  $$('.nav a, .menu nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + act));
  scrollTo(0, 0); pg.mount && pg.mount(main);
  $$('a[data-ph]', main).forEach(a => a.addEventListener('click', () => { resetF(); F.ph = a.dataset.ph; }));
  try { window.ncAfterRender && window.ncAfterRender(k, main); } catch (e) { }
  closeMenu();
}
addEventListener('hashchange', render);
const mbtn = $('#mbtn');
function closeMenu() { document.body.classList.remove('menu-on'); mbtn && mbtn.setAttribute('aria-expanded', 'false'); }
if (mbtn) mbtn.onclick = () => { const on = !document.body.classList.contains('menu-on'); document.body.classList.toggle('menu-on', on); mbtn.setAttribute('aria-expanded', on); };
$('#menu').addEventListener('click', e => { if (e.target.id === 'menu' || e.target.closest('[data-close]')) closeMenu(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
footer();
if (HP) $$('a[href="#kalkulyator"]').forEach(a => a.style.display = 'none');
render();
