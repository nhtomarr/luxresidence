/* Nizami City — sayt v3 (sakit portal üslubu). Məlumat: window.NC (data.js), canlı: runtime.js */
const { CO, UNITS, FAQ, TIMELINE, BLOG, POI } = window.NC;
const IMG = window.IMG || {};
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Math.round(+n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fm2 = n => (Math.round((+n || 0) * 100) / 100).toString().replace('.', ',');
const OFF = window.NC_OFF || {};
const SITE_ = (window.NC_REMOTE || {}).site || {};
const HP = !SITE_.showPrice;
// Paneldən idarə olunan göstəricilər (defolt: gizli)
const SHOW_ST = !!SITE_.showStatus, SHOW_DEL = SHOW_ST && !!SITE_.showDelivery, SHOW_STOCK = !!SITE_.showStock;
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
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-9-9a4.5 4.5 0 0 1 9-2 4.5 4.5 0 0 1 9 2c-2 4.6-9 9-9 9z"/></svg>',
  cmp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16M17 4v16M3 8l4-4 4 4M13 16l4 4 4-4"/></svg>',
  srch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  prn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z"/></svg>',
  tg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4L3 11l6 2 2 6 3-4 5 4z"/><path d="M9 13l9-7"/></svg>',
  wand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20L16 8M14 4v2M20 10h-2M18 6l-1 1M6 4l.5 1.5L8 6l-1.5.5L6 8l-.5-1.5L4 6l1.5-.5z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1.2-1.2 2 1-.6 1.6c-3.6.4-7.7-3.7-7.3-7.3l1.6-.6 1 2z"/></svg>',
};
const roomsT = r => r ? r + ' otaqlı' : 'Studiya';
const ord = n => { n = Math.abs(Math.round(+n)); const d = n % 10, t = Math.floor(n / 10) % 10; const sf = d ? ['', 'ci', 'ci', 'cü', 'cü', 'ci', 'cı', 'ci', 'ci', 'cu'][d] : t ? ['', 'cu', 'ci', 'cu', 'cı', 'ci', 'cı', 'ci', 'ci', 'cı'][t] : 'cü'; return n + '-' + sf; };
const bLbl = u => 'Bina ' + u.b + (u.ent ? ' · ' + u.ent + '-ci giriş' : '');
const stTxt = s => !SHOW_ST ? '' : s === 'ok' ? 'Təhvil verilib' : 'Tikilir' + (SHOW_DEL ? ' · ' + CO.delivery : '');
const free = UNITS.filter(u => u.st !== 'sold');
const BLD = (window.NC_BLD || []).filter(b => b.st !== 'n');
const BPIC = { A: 'tower_l', B: 'tower_r', C: 'entrance', E: 'front', F: 'corner', G: 'street' };
const bPic = id => BPIC[id] || 'aerial_c';
const priceT = u => u.st === 'sold' ? 'Satılıb' : HP ? 'Qiymət sorğu ilə' : fmt(u.price) + ' ₼';
const condOf = u => /təmirli/i.test(u.c || '') ? 'Təmirli' : /white/i.test(u.c || '') ? 'White Box' : 'Təmirsiz';
const uById = id => UNITS.find(x => x.id === id);
const uTitle = u => `${roomsT(u.r)}, ${fm2(u.a)} m² — ${bLbl(u)}, ${ord(u.f)} mərtəbə`;
const WA = () => String(CO.wa || '994507000088').replace(/\D/g, '');

/* 1–4: yaddaş — seçilmişlər, müqayisə, son baxılanlar */
const LS = { get(k, d) { try { const v = JSON.parse(localStorage.getItem('nc_' + k)); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('nc_' + k, JSON.stringify(v)); } catch (e) { } } };
let FAV = LS.get('fav', []), CMP = LS.get('cmp', []), SEEN = LS.get('seen', []);
const isFav = id => FAV.includes(id), isCmp = id => CMP.includes(id);
function toggleFav(id) { const on = !isFav(id); FAV = on ? [id, ...FAV].slice(0, 60) : FAV.filter(x => x !== id); LS.set('fav', FAV); syncBadges(); toast(on ? 'Seçilmişlərə əlavə olundu' : 'Seçilmişlərdən çıxarıldı', on ? ['Seçilmişlər', '#secilmis'] : null); }
function toggleCmp(id) { if (isCmp(id)) CMP = CMP.filter(x => x !== id); else { if (CMP.length >= 3) { toast('Ən çox 3 mənzili müqayisə etmək olar'); return; } CMP = [...CMP, id]; } LS.set('cmp', CMP); syncBadges(); }
function addSeen(id) { SEEN = [id, ...SEEN.filter(x => x !== id)].slice(0, 8); LS.set('seen', SEEN); }
function syncBadges() {
  FAV = FAV.filter(uById); CMP = CMP.filter(uById);
  $$('[data-fav]').forEach(b => { const on = isFav(b.dataset.fav); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  $$('[data-cmp]').forEach(b => { const on = isCmp(b.dataset.cmp); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  const n = $('#favN'); if (n) { n.textContent = FAV.length || ''; n.style.display = FAV.length ? '' : 'none'; }
  const cb = $('#cmpBar'); if (cb) { cb.classList.toggle('on', CMP.length > 0); $('#cmpN', cb).textContent = CMP.length; }
}
let _tt; function toast(t, link) { let e = $('#toast'); if (!e) { e = document.createElement('div'); e.id = 'toast'; e.className = 'toast'; e.setAttribute('role', 'status'); document.body.appendChild(e); } e.innerHTML = esc(t) + (link ? ` <a href="${link[1]}">${link[0]}</a>` : ''); e.classList.add('on'); clearTimeout(_tt); _tt = setTimeout(() => e.classList.remove('on'), 2600); }
document.addEventListener('click', e => {
  const f = e.target.closest('[data-fav]'); if (f) { e.preventDefault(); e.stopPropagation(); toggleFav(f.dataset.fav); return; }
  const c = e.target.closest('[data-cmp]'); if (c) { e.preventDefault(); e.stopPropagation(); toggleCmp(c.dataset.cmp); return; }
}, true);

/* modal (axtarış, zəng sifarişi, seçici, şəkil) */
function modal(html, cls = '') { closeModal(); const m = document.createElement('div'); m.className = 'mdl ' + cls; m.id = 'mdl'; m.innerHTML = `<div class="mdl-box" role="dialog" aria-modal="true"><button class="icb mdl-x" type="button" aria-label="Bağla" data-x>${I.x}</button>${html}</div>`; document.body.appendChild(m); document.body.classList.add('mdl-on'); m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-x]')) closeModal(); }); requestAnimationFrame(() => m.classList.add('on')); return m; }
function closeModal() { const m = $('#mdl'); if (m) m.remove(); document.body.classList.remove('mdl-on'); }

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
  return `<article class="ucard ${u.st === 'sold' ? 'sold' : ''}"><a class="ulnk" href="#menzil-${u.id}" aria-label="${esc(uTitle(u))}"></a>${photo ? `<div class="ph">${pic(bPic(u.b), bLbl(u), { sizes: '300px' })}</div>` : ''}
    <div class="uact"><button type="button" class="ub ${isFav(u.id) ? 'on' : ''}" data-fav="${u.id}" aria-label="Seçilmişlərə əlavə et" title="Seçilmişlər">${I.heart}</button><button type="button" class="ub ${isCmp(u.id) ? 'on' : ''}" data-cmp="${u.id}" aria-label="Müqayisəyə əlavə et" title="Müqayisə">${I.cmp}</button></div>
    <div class="top"><span class="a num">${fm2(u.a)} m²</span><span class="pr">${HP ? 'Sorğu ilə' : fmt(u.price) + ' ₼'}</span></div>
    <div class="ln"><span>${roomsT(u.r)}</span><span>${I.bld}${bLbl(u)}</span><span>${I.fl}${ord(u.f)} mərtəbə</span></div>
    <div class="ln">${u.c ? `<span class="tag">${esc(u.c)}</span>` : (SHOW_ST ? `<span class="tag g">${u.bst === 'ok' ? 'Hazır bina' : 'Tikilir'}</span>` : '')}${u.st === 'bron' ? '<span class="tag g">Bron</span>' : ''}${window.ncPlan(u.a, u.b) ? '<span class="tag g">Plan var</span>' : ''}</div></article>`;
}
function bCard(b) {
  const us = UNITS.filter(u => u.b === b.id), fr = us.filter(u => u.st === 'free');
  const a0 = fr.length ? Math.min(...fr.map(u => u.a)) : 0, a1 = fr.length ? Math.max(...fr.map(u => u.a)) : 0;
  const rooms = [...new Set(fr.map(u => u.r))].sort().join(', ');
  return `<a class="bcard" href="#bina-${b.id}"><figure>${pic(bPic(b.id), 'Bina ' + b.id, { sizes: '(max-width:620px) 92vw, 33vw' })}${SHOW_ST ? `<span class="badge"><i class="${b.st === 'ok' ? 'st-ok' : 'st-w'}"></i>${stTxt(b.st)}</span>` : ''}</figure>
    <div class="bd"><div class="t"><h3 class="h3">Bina ${b.id}</h3>${SHOW_STOCK ? `<span class="mu">${fr.length ? fr.length + ' mənzil satışda' : 'Satışda mənzil yoxdur'}</span>` : ''}</div>
    <div class="meta">${fr.length ? `<span class="tag">${fm2(a0)} – ${fm2(a1)} m²</span>` : ''}${rooms ? `<span class="tag g">${rooms} otaqlı</span>` : ''}</div>
    ${SHOW_STOCK && us.length ? `<div class="prog" title="Satış vəziyyəti"><div class="prog-b"><i style="width:${Math.round(us.filter(u => u.st === 'sold').length * 100 / us.length)}%"></i></div><span>Satılıb ${Math.round(us.filter(u => u.st === 'sold').length * 100 / us.length)}% · ${us.length} mənzildən</span></div>` : ''}
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
    <div class="fld lf-day"><span>${I.cal} Saat</span><div class="chips" data-k="tm">${HOURS.map((h, i) => `<button type="button" data-v="${h}" class="${i === 1 ? 'on' : ''}">${h}</button>`).join('')}</div></div>
    <div><button class="btn" type="submit">Göndər ${I.ar}</button></div></form>`;
}
function bindLead(root, unit) {
  const f = $('#lf', root); if (!f) return;
  const v = k => (($(`[data-k=${k}] .on`, f) || {}).dataset || {}).v;
  const kind = () => v('kind') || 'viewing';
  const sync = () => { $$('.lf-day', f).forEach(d => d.style.display = kind() === 'viewing' ? '' : 'none'); };
  $('[data-k=kind]', f).addEventListener('click', () => setTimeout(sync, 0)); sync();
  bindForm(f, kind, () => { const k = kind(), u = unit; return { slot: k === 'viewing' ? v('day') + ' ' + (v('tm') || '') : '', msg: (k === 'price' ? 'Qiymət sorğusu' : k === 'viewing' ? 'Baxışa yazılış' : 'Zəng sifarişi') + (u ? ': ' + bLbl(u) + ', ' + ord(u.f) + ' mərtəbə, ' + roomsT(u.r) + ', ' + fm2(u.a) + ' m²' : v('r') ? ': ' + v('r') + ' otaqlı' : '') }; },
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


/* 14: şəkillər tam ekranda */
function bindLb(root) {
  $$('[data-lb] img', root).forEach(im => { im.style.cursor = 'zoom-in'; im.onclick = () => {
    const g = im.closest('[data-lb]').dataset.lb, L = $$(`[data-lb="${g}"] img`, root); let i = L.indexOf(im);
    const m = modal(`<div class="lbx"><img id="lbI" alt=""><div class="lbx-n"><button class="icb" type="button" data-d="-1" aria-label="Əvvəlki">${I.al}</button><span id="lbC" class="mu"></span><button class="icb" type="button" data-d="1" aria-label="Növbəti">${I.ar}</button></div></div>`, 'wide');
    const show = () => { const s = L[i]; $('#lbI', m).src = (s.currentSrc || s.src).replace('-1280.webp', s.src.includes('aerial') ? '-2400.webp' : '-2560.webp'); $('#lbI', m).alt = s.alt; $('#lbC', m).textContent = (i + 1) + ' / ' + L.length + (s.alt ? ' · ' + s.alt : ''); };
    $$('[data-d]', m).forEach(b => b.onclick = () => { i = (i + +b.dataset.d + L.length) % L.length; show(); });
    m.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { i = (i + 1) % L.length; show(); } if (e.key === 'ArrowLeft') { i = (i - 1 + L.length) % L.length; show(); } }); m.tabIndex = -1; m.focus(); show(); }; });
}
/* 11: mənzil seçici sualları */
const QZ = [
  ['Ailəniz neçə nəfərdir?', [['1–2 nəfər', { r: [1, 2] }], ['3–4 nəfər', { r: [2, 3] }], ['5 və daha çox', { r: [3, 4] }]]],
  ...(SHOW_ST ? [['Nə vaxt köçmək istəyirsiniz?', [['Dərhal', { ph: 'ok' }], ['1–2 ilə', { ph: 'w' }], ['Fərq etməz', {}]]]] : []),
  ['Təmir məsələsi?', [['Təmirli olsun', { c: 'Təmirli' }], ['Özüm təmir edəcəm', { c: 'Təmirsiz' }], ['Fərq etməz', {}]]],
];
function quiz() {
  const A = {}; let q = 0;
  const m = modal('<div id="qz"></div>');
  const match = () => free.filter(u => u.st === 'free' && (!A.r || A.r.includes(Math.min(u.r, 4))) && (!A.ph || u.bst === A.ph) && (!A.c || condOf(u) === A.c));
  const draw = () => {
    const box = $('#qz', m);
    if (q < QZ.length) { const [t, opts] = QZ[q]; box.innerHTML = `<span class="mu">Sual ${q + 1} / ${QZ.length}</span><div class="prog-b" style="margin:8px 0 18px"><i style="width:${q * 100 / QZ.length}%"></i></div><h2 class="h2">${t}</h2><div class="qopts">${opts.map(([l], i) => `<button type="button" class="qopt" data-i="${i}">${l}${I.ar}</button>`).join('')}</div>`;
      $$('.qopt', box).forEach(b => b.onclick = () => { Object.assign(A, opts[+b.dataset.i][1]); q++; draw(); }); return; }
    let L = match(); const relaxed = !L.length; if (relaxed) { delete A.c; L = match(); }
    box.innerHTML = `<h2 class="h2">${L.length ? (SHOW_STOCK ? L.length + ' uyğun mənzil tapdıq' : 'Sizə uyğun mənzillər') : 'Uyğun mənzil hazırda yoxdur'}</h2><p class="lead" style="margin:6px 0 16px">${relaxed && L.length ? 'Təmir şərti olmadan nəticələr göstərilir.' : L.length ? 'Ən uyğun variantlar:' : 'Yeni mənzil satışa çıxanda sizə xəbər verək.'}</p>
      <div class="ugrid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${L.sort((a, b) => a.a - b.a).slice(0, 4).map(u => uCard(u)).join('')}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">${L.length ? `<a class="btn" href="#menziller?${new URLSearchParams(Object.assign({}, A.r ? { r: A.r[A.r.length - 1] >= 4 ? 4 : '' } : {}, A.ph ? { ph: A.ph } : {}, A.c ? { c: A.c } : {})).toString()}" data-x>Hamısına bax ${I.ar}</a>` : ''}<button class="btn tn" type="button" data-alert>${I.bell} Xəbər ver</button></div>`;
  };
  draw();
}
/* 3: axtarış */
function search() {
  const m = modal(`<div class="srch"><div class="srch-in">${I.srch}<input id="sq" placeholder="Axtar: «2 otaq», «Bina E», «85 m²», «ipoteka»…" autocomplete="off" aria-label="Axtarış"></div><div id="sr" class="srch-r"></div></div>`, 'top');
  const inp = $('#sq', m), out = $('#sr', m);
  const PAGES = [['Mənzillər', 'menziller'], ['Binalar', 'binalar'], ['Məkan', 'mekan'], ['Kommersiya sahələri', 'kommersiya'], ['Bloq', 'bloq'], ['Suallar', 'suallar'], ['Əlaqə və baxış', 'elaqe'], ['Seçilmişlər', 'secilmis'], ['Müqayisə', 'muqayise']].filter(([, h]) => !OFF[h]);
  const norm = t => String(t).toLowerCase().replace(/ı/g, 'i').replace(/ə/g, 'e').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g');
  const draw = () => {
    const q = norm(inp.value.trim()), R = [];
    if (q) {
      const rm = q.match(/(\d)\s*(otaq|ot)/); if (rm) { const r = Math.min(4, +rm[1]); const n = free.filter(u => u.st === 'free' && (r === 4 ? u.r >= 4 : u.r === r)).length; R.push([`${rm[1]} otaqlı mənzillər`, SHOW_STOCK ? `${n} mənzil satışda` : 'Kataloq', 'menziller?r=' + r]); }
      const am = q.match(/(\d{2,3})\s*(m|kv)?/); if (am && !rm) { const a = +am[1]; if (a >= 30 && a <= 260) { const n = free.filter(u => u.st === 'free' && Math.abs(u.a - a) <= 10).length; R.push([`${a - 10}–${a + 10} m² mənzillər`, `${n} mənzil`, `menziller?a0=${a - 10}&a1=${a + 10}`]); } }
      BLD.forEach(b => { if (q === b.id.toLowerCase() || q.includes('bina ' + b.id.toLowerCase())) R.push(['Bina ' + b.id, stTxt(b.st) || 'Bina', 'bina-' + b.id]); });
      ['təmirli', 'white box', 'təmirsiz'].forEach(c => { if (q.includes(norm(c).slice(0, 5))) R.push([c[0].toUpperCase() + c.slice(1) + ' mənzillər', 'Vəziyyətə görə', 'menziller?c=' + encodeURIComponent(c === 'white box' ? 'White Box' : c[0].toUpperCase() + c.slice(1))]); });
      PAGES.forEach(([t, h]) => { if (norm(t).includes(q)) R.push([t, 'Səhifə', h]); });
      if (!OFF.bloq) BLOG.forEach(p => { if (norm(p.t + ' ' + (p.x || '')).includes(q)) R.push([p.t, 'Bloq', 'bloq-' + p.id]); });
      FAQ.forEach(([qq]) => { if (norm(qq).includes(q)) R.push([qq, 'Sual', 'suallar']); });
    } else PAGES.slice(0, 6).forEach(([t, h]) => R.push([t, 'Səhifə', h]));
    out.innerHTML = R.slice(0, 10).map(([t, s, h]) => `<a href="#${h}" data-x><b>${esc(t)}</b><span>${esc(s)}</span></a>`).join('') || '<p class="mu" style="padding:12px">Heç nə tapılmadı. Satış ofisinə zəng edin: ' + esc(CO.short) + '</p>';
  };
  inp.oninput = draw; draw(); setTimeout(() => inp.focus(), 50);
}
addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search(); } if (e.key === 'Escape') closeModal(); });
/* 7: zəng sifarişi */
function callback(unit) {
  const u = unit && uById(unit);
  const m = modal(`<h2 class="h2">Sizə zəng edək</h2><p class="lead" style="margin:6px 0 18px">${u ? esc(uTitle(u)) + ' üzrə — ' : ''}nömrənizi yazın, satış meneceri iş saatlarında 15 dəqiqə ərzində zəng edəcək.</p><form class="frm" id="cbf" novalidate>${nameFld('cb')}<div class="fld"><span>Nə vaxt zəng edək?</span><div class="chips" data-k="when">${WHEN.map(([v, t], i) => `<button type="button" data-v="${t}" class="${i ? '' : 'on'}">${t}</button>`).join('')}</div></div><div><button class="btn" type="submit">Zəng sifariş et ${I.ar}</button></div></form><p class="mu" style="margin:14px 0 0;font-size:14px">Və ya özünüz zəng edin: <a href="tel:${esc(CO.short)}"><b>${esc(CO.short)}</b></a> · ${esc(CO.hours)}</p>`);
  const wh = () => (($('[data-k=when] .on', m) || {}).dataset || {}).v || '';
  bindForm($('#cbf', m), 'callback', () => Object.assign({ slot: wh() }, u ? { unit: u.id, msg: 'Zəng sifarişi (' + wh() + '): ' + uTitle(u) } : { msg: 'Zəng sifarişi (' + wh() + ')' }), d => `${esc(d.name)}, tezliklə zəng edəcəyik.`);
}
/* 12: yeni mənzil çıxanda xəbər ver */
function alertSub(crit) {
  const m = modal(`<h2 class="h2">${I.bell} Xəbər verək</h2><p class="lead" style="margin:6px 0 18px">Seçiminizə uyğun yeni mənzil satışa çıxanda və ya qiymət şərtləri dəyişəndə satış meneceri sizə zəng edəcək.</p>${crit ? `<p class="tag" style="margin:0 0 14px">${esc(crit)}</p>` : ''}<form class="frm" id="alf" novalidate>${nameFld('al')}<div><button class="btn" type="submit">Abunə ol ${I.ar}</button></div></form>`);
  bindForm($('#alf', m), 'alert', () => ({ msg: 'Xəbər ver: ' + (crit || 'istənilən mənzil') }), () => 'Uyğun mənzil çıxan kimi zəng edəcəyik.');
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-quiz],[data-search],[data-callback],[data-alert],[data-share],[data-print]'); if (!t) return;
  e.preventDefault();
  if (t.dataset.quiz != null) quiz(); else if (t.dataset.search != null) search(); else if (t.dataset.callback != null) callback(t.dataset.callback); else if (t.dataset.alert != null) alertSub(t.dataset.alert || critText()); else if (t.dataset.share != null) share(t.dataset.share); else if (t.dataset.print != null) print();
});
/* 5: paylaş */
function share(id) {
  const u = uById(id), url = location.origin + location.pathname + '#menzil-' + id, txt = 'Nizami City — ' + (u ? uTitle(u) : '');
  if (navigator.share && matchMedia('(pointer:coarse)').matches) { navigator.share({ title: txt, url }).catch(() => { }); return; }
  const m = modal(`<h2 class="h2">Paylaş</h2><p class="lead" style="margin:6px 0 16px">${esc(txt)}</p><div class="shr"><a class="btn tn" href="https://wa.me/?text=${encodeURIComponent(txt + ' ' + url)}" target="_blank" rel="noopener">${I.wa} WhatsApp</a><a class="btn tn" href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${I.tg} Telegram</a><button class="btn tn" type="button" id="cpy">${I.share} Linki kopyala</button></div><div class="qrbox"><div data-qr="${esc(url)}"></div><span class="mu">Telefonla skan edin — mənzil səhifəsi açılacaq</span></div>`);
  fillQR(m);
  $('#cpy', m).onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('Link kopyalandı')).catch(() => { prompt('Linki kopyalayın:', url); }); };
}

/* blokları */
const SLIDES = [['front', 'Nizami City', 'Yasamalda, Nizami metrosunun yanında qapalı həyətli yaşayış kompleksi'], ['aerial_c', 'Qapalı həyət', 'Mərkəzdə avtomobilsiz həyət, uşaq meydançası və istirahət zonası'], SHOW_ST ? ['corner', 'Hazır və tikilən binalar', 'A, B, C binaları təhvil verilib, E, F, G binaları tikilir'] : ['corner', 'Altı bina', 'Yeraltı parkinq, kommersiya qalereyası və qapalı həyət']];
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
  return `<div class="find"><div class="find-h"><h2 class="h3" style="font-size:22px">Sizə uyğun mənzili tapın</h2><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${SHOW_STOCK ? `<span class="mu">${free.length} mənzil satışda</span>` : ''}<button class="btn tn sm" type="button" data-quiz>${I.wand} Seçməkdə kömək et</button></div></div>
    <form class="find-g" id="fd"><div class="fld"><span>Otaq sayı</span><div class="seg" data-k="r">${[[0, 'Hamısı'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']].map(([v, t], i) => `<button type="button" data-v="${v}" class="${i ? '' : 'on'}">${t}</button>`).join('')}</div></div>
    <div class="fld"><label for="fdB">Bina</label><select class="sel" id="fdB"><option value="">Bütün binalar</option>${bs.map(b => `<option value="${b}">Bina ${b}</option>`).join('')}</select></div>
    <div class="fld"${SHOW_ST ? '' : ' style="display:none"'}><label for="fdP">Mərhələ</label><select class="sel" id="fdP"><option value="all">Hamısı</option><option value="ok">Hazır binalar</option><option value="w">Tikilən binalar</option></select></div>
    <button class="btn" type="submit">Axtar ${I.ar}</button></form></div>`;
}
function bindFind(root) {
  const f = $('#fd', root); if (!f) return; let r = 0;
  $('[data-k=r]', f).onclick = e => { const b = e.target.closest('button'); if (!b) return; r = +b.dataset.v; $$('[data-k=r] button', f).forEach(x => x.classList.toggle('on', x === b)); };
  f.onsubmit = e => { e.preventDefault(); resetF(); F.r = r; F.b = $('#fdB', f).value; F.ph = $('#fdP', f).value; location.hash = 'menziller' + (fQuery() ? '?' + fQuery() : ''); };
}
function buildingsBlock(full) {
  const tabs = [['w', 'Tikilən binalar'], ['ok', 'Hazır binalar']];
  return `<div class="sh"><h2 class="h2">${full ? 'Binalar' : 'Binalar'}</h2><div class="tabs" id="bt"${SHOW_ST ? '' : ' style="display:none"'}>${tabs.map(([v, t], i) => `<button type="button" data-v="${v}" class="${i ? '' : 'on'}">${t}</button>`).join('')}</div></div><div class="bgrid" id="bg"></div>`;
}
function bindBuildings(root) {
  const g = $('#bg', root); if (!g) return;
  const draw = v => { g.innerHTML = BLD.filter(b => !SHOW_ST || b.st === v).map(bCard).join(''); };
  $('#bt', root).onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#bt button', root).forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.v); };
  draw('w');
}
function offersBlock() {
  const pickBy = r => free.filter(u => u.st === 'free' && (r === 4 ? u.r >= 4 : u.r === r)).sort((a, b) => a.a - b.a);
  const L = [1, 2, 3, 4].flatMap(r => pickBy(r).filter((u, i, A) => A.findIndex(x => Math.abs(x.a - u.a) < .5 && x.b === u.b) === i).slice(0, 2));
  if (!L.length) return '';
  return `<div class="sh"><h2 class="h2">Satışda olan mənzillər</h2><div style="display:flex;gap:10px;align-items:center"><a class="pillbtn" href="#menziller">Hamısına bax ${I.ar}</a>${railNav()}</div></div>
    <div class="rail">${L.map(u => uCard(u, true)).join('')}</div>`;
}
const railNav = () => `<div class="rail-nav"><button type="button" aria-label="Geri" data-rd="-1">${I.al}</button><button type="button" aria-label="İrəli" data-rd="1">${I.ar}</button></div>`;
function bindRail(root) { $$('[data-rd]', root).forEach(b => b.onclick = () => { const sec = b.closest('section') || root, r = $('.rail', sec); if (r) r.scrollBy({ left: +b.dataset.rd * (r.clientWidth * .8), behavior: 'smooth' }); }); }
/* 4: son baxılanlar */
function seenBlock(skip) {
  const L = SEEN.map(uById).filter(u => u && u.id !== skip); if (!L.length) return '';
  return `<section class="sec wrap"><div class="sh"><h2 class="h2">Son baxdığınız mənzillər</h2><div style="display:flex;gap:10px;align-items:center"><button class="lk" type="button" data-clrseen>Təmizlə</button>${railNav()}</div></div><div class="rail">${L.map(u => uCard(u)).join('')}</div></section>`;
}
document.addEventListener('click', e => { if (e.target.closest('[data-clrseen]')) { SEEN = []; LS.set('seen', SEEN); const s = e.target.closest('section'); if (s) s.remove(); } });
const promoBlock = () => `<div class="promo"><div class="tx"><h2>Hazır binalarda açarı bu gün alın</h2><p class="lead">A, B və C binaları tikilib və təhvil verilib. Mənzilə baxın, müqavilədən sonra açarı dərhal təhvil alın.</p>
  <div class="acts"><a class="btn" href="#menziller" data-ph="ok">Hazır mənzillər ${I.ar}</a><a class="lk" href="#binalar">Baş plana bax ${I.ar}</a></div></div><div class="im">${pic('aerial', 'Hazır binaların 3D vizualı', { sizes: '(max-width:860px) 92vw, 45vw' })}</div></div>`;
const FEAT = [['aerial_c', 'Qapalı həyət', 'Həyətə yalnız sakinlər daxil olur: avtomobilsiz meydan, uşaq meydançası və istirahət zonası.'], ['street', 'Kommersiya qalereyası', 'Birinci mərtəbələrdə supermarket, aptek, kafe və xidmətlər.'], ['entrance', 'Yeraltı parkinq', 'İki səviyyəli parkinq, liftlər birbaşa parkinqə enir.'], ['tower_r', 'Keramoqranit fasad', 'Uzunömürlü, baxımı asan və illər keçsə də təzə görünən fasad.']];
const ICONS = [[I.sh, '7/24 mühafizə', 'Kamera və kodlu giriş'], [I.bolt, 'Generator', 'Fasiləsiz enerji'], [I.metro, 'Nizami metrosu', 'Bir neçə dəqiqəlik məsafə'], [I.bag, 'Gündəlik xidmətlər', 'Binaların altında']];
const featBlock = () => `<div class="sh"><h2 class="h2">Kompleksdə həyat</h2></div><div class="feats" data-lb="f">${FEAT.map(([k, t, p]) => `<article class="feat"><figure>${pic(k, t, { sizes: '(max-width:520px) 92vw, 25vw' })}</figure><div class="bd"><h3 class="h3">${t}</h3><p>${p}</p></div></article>`).join('')}</div>
  <div class="icons">${ICONS.map(([i, b, s]) => `<div class="icn"><i>${i}</i><div><b>${b}</b><span>${s}</span></div></div>`).join('')}</div>`;
const MAPQ = encodeURIComponent('Nizami City, Cəfər Cabbarlı 31, Bakı');
const PIC = { 'Nəqliyyat': 'M', 'Alış-veriş': 'T', 'Təhsil': 'S', 'İstirahət': 'P' };
const locBlock = () => `<div class="sh"><div><h2 class="h2">Məkan</h2><span class="mu">${esc(CO.addr)}</span></div><div class="tabs loc-t"><button type="button" data-v="nbh" class="on">Ətraf sxemi</button><button type="button" data-v="map">Xəritə</button></div></div><div class="loc"><div class="map"><div data-lv="nbh">${nbhBlock()}</div><div data-lv="map" style="display:none;height:100%"><iframe title="Xəritə: Nizami City" loading="lazy" data-src="https://maps.google.com/maps?q=${MAPQ}&z=15&output=embed" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div>
  <div class="pois"><div class="dirs"><span class="mu">Yol göstər:</span><a class="tag" href="https://www.google.com/maps/dir/?api=1&destination=${MAPQ}" target="_blank" rel="noopener">Google Maps</a><a class="tag" href="https://waze.com/ul?q=${MAPQ}&navigate=yes" target="_blank" rel="noopener">Waze</a><a class="tag" href="https://yandex.com/maps/?text=${MAPQ}" target="_blank" rel="noopener">Yandex</a></div>${POI.map(p => `<div class="poi"><i>${PIC[p.c] || '•'}</i><div><b>${esc(p.n)}</b><span>${esc(p.d)}</span></div><em>${esc(p.c)}</em></div>`).join('')}</div></div>`;
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
  ${numBlock()}
  ${maqSection()}
  <section class="sec wrap">${buildingsBlock()}</section>
  ${SHOW_STOCK ? `<section class="sec wrap">${offersBlock()}</section>` : ''}
  ${seenBlock()}
  <section class="sec wrap">${promoBlock()}</section>
  <section class="sec wrap">${planBlock()}</section>
  <section class="sec wrap">${featBlock()}</section>
  <section class="sec wrap">${locBlock()}</section>
  ${newsBlock() ? `<section class="sec wrap">${newsBlock()}</section>` : ''}
  <section class="sec wrap">${faqBlock(5)}</section>`,
  mount(r) { bindHero(r); heroFx(r); bindFind(r); bindMaqHome(r); bindBuildings(r); bindRail(r); bindPlan(r); bindLead(r); bindLb(r); }
});
pages.binalar = () => ({
  title: 'Binalar — Nizami City', html: `${pHead('Binalar', SHOW_ST ? 'A, B və C binaları təhvil verilib. E, F və G binaları tikilir' + (SHOW_DEL ? ', təhvil ' + esc(CO.delivery) : '') + '.' : 'Altı bina, bir qapalı həyət. Binanı seçin — mərtəbələr və mənzillər açılacaq.', `<div class="stats"><div class="stat"><b>${BLD.length}</b><span>bina</span></div>${SHOW_STOCK ? `<div class="stat"><b>${free.filter(u => u.st === 'free').length}</b><span>satışda</span></div>` : ''}<div class="stat"><b>${window.NC_FLOORS || 10}</b><span>mərtəbə</span></div></div>`)}
  <section class="sec wrap"><div class="sh"><h2 class="h2">Baş plan</h2><div class="tabs" id="bpT"><button type="button" data-v="3d" class="on">${I.cube} 3D maket</button><button type="button" data-v="img">Vizual</button></div></div><div data-bp="3d">${maqHtml('mqH')}</div><div data-bp="img" style="display:none"><div class="iso" data-lb="iso">${pic('aerial', 'Hazır binaların 3D vizualı', { sizes: '(max-width:900px) 92vw, 1200px' })}<span class="hs" style="left:47%;top:58%"><i></i><span>Qapalı həyət</span></span><span class="hs" style="left:45%;top:80%"><i></i><span>Kommersiya qalereyası</span></span><span class="hs" style="left:57%;top:88%"><i></i><span>Parkinqə giriş</span></span></div></div></section>
  <section class="sec wrap">${buildingsBlock(true)}</section>
  ${SHOW_ST ? '' : '<!--'}<section class="sec wrap"><div class="sh"><h2 class="h2">Mərhələlər</h2></div><div class="tline">${TIMELINE.map(([a, b, c, s]) => `<div class="card"><span class="badge" style="position:static;background:var(--soft)"><i class="${s === 'ok' ? 'st-ok' : 'st-w'}"></i>${esc(b)}</span><h3 class="h3" style="margin:12px 0 6px">${esc(a)}</h3><p class="ink2" style="margin:0">${esc(c)}</p></div>`).join('')}</div></section>${SHOW_ST ? '' : '-->'}`,
  mount(r) { bindBuildings(r); bindLb(r); mountMaq($('#mqH', r)); $('#bpT', r).onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#bpT button', r).forEach(x => x.classList.toggle('on', x === b)); $$('[data-bp]', r).forEach(x => x.style.display = x.dataset.bp === b.dataset.v ? '' : 'none'); }; }
});
pages.bina = id => {
  const b = BLD.find(x => x.id === id); if (!b) return pages.binalar();
  const us = UNITS.filter(u => u.b === id), fls = [...new Set(us.map(u => u.f))].sort((a, c) => c - a);
  let fl = fls.find(f => us.some(u => u.f === f && u.st === 'free')) || fls[0], view = 'fl';
  const sold = us.filter(u => u.st === 'sold').length;
  return {
    title: `Bina ${id} — Nizami City`, html: `${pHead('Bina ' + id, stTxt(b.st), `<div class="stats"><div class="stat"><b>${fls.length}</b><span>mərtəbə</span></div>${SHOW_STOCK ? `<div class="stat"><b>${us.filter(u => u.st === 'free').length}</b><span>satışda</span></div>${us.length ? `<div class="stat"><b>${Math.round(sold * 100 / us.length)}%</b><span>satılıb</span></div>` : ''}` : ''}</div>`, [['Binalar', 'binalar'], ['Bina ' + id]])}
    <section class="sec wrap">${maqHtml('mqB', { sm: true, tour: false })}</section>
    <section class="sec wrap">${us.length ? `<div class="sh"><h2 class="h2" id="flT"></h2><div class="tabs" id="bv"${SHOW_STOCK ? '' : ' style="display:none"'}><button type="button" data-v="fl" class="on">Mərtəbə üzrə</button>${SHOW_STOCK ? `<button type="button" data-v="ch">${I.grid} Şahmatka</button>` : ''}</div></div><div id="bvb"></div>` : `<div class="empty">Bu binanın mənzilləri hazırda saytda göstərilmir. Satış ofisindən məlumat alın: ${esc(CO.short)}</div>`}</section>
    <section class="sec wrap">${contactBlock({ title: 'Bina ' + id + ' üzrə sorğu', kind: 'price' })}</section>`,
    mount(r) {
      const box = $('#bvb', r);
      const drawFl = f => { fl = f; $('#flT', r).textContent = ord(f) + ' mərtəbə'; box.innerHTML = `<div class="floors">${fls.map(x => `<button type="button" data-f="${x}" class="${x === f ? 'on' : ''}"><b>${x}</b><span>${SHOW_STOCK ? us.filter(u => u.f === x && u.st === 'free').length + ' satışda' : 'mərtəbə'}</span></button>`).join('')}</div><div class="ugrid" style="margin-top:14px">${us.filter(u => u.f === f).map(u => uCard(u)).join('')}</div>`; $$('.floors button', box).forEach(x => x.onclick = () => drawFl(+x.dataset.f)); };
      /* 9: şahmatka */
      const drawCh = () => { $('#flT', r).textContent = 'Şahmatka'; const ents = [...new Set(us.map(u => u.ent))].sort();
        box.innerHTML = `<div class="card chess-w"><div class="chess-lg"><span><i class="c-free"></i>Satışda</span><span><i class="c-bron"></i>Bron</span><span><i class="c-sold"></i>Satılıb</span></div>${ents.map(e => `${ents.length > 1 ? `<h3 class="h3" style="margin:14px 0 8px">${e}-ci giriş</h3>` : ''}<div class="chess">${fls.map(f => { const row = us.filter(u => u.f === f && u.ent === e).sort((a, c) => a.n - c.n); return row.length ? `<div class="ch-r"><b>${f}</b>${row.map(u => `<a class="ch-c c-${u.st}" href="#menzil-${u.id}" title="${esc(uTitle(u))}${u.st === 'sold' ? ' · satılıb' : ''}"><span>${roomsT(u.r).replace(' otaqlı', 'o')}</span><small>${Math.round(u.a)} m²</small></a>`).join('')}</div>` : ''; }).join('')}</div>`).join('')}</div>`; };
      if (us.length) { $('#bv', r).onclick = e => { const t = e.target.closest('button'); if (!t) return; view = t.dataset.v; $$('#bv button', r).forEach(x => x.classList.toggle('on', x === t)); view === 'ch' ? drawCh() : drawFl(fl); }; drawFl(fl); }
      bindLead(r);
      const curF = () => { const b = $('.floors button.on', r); return b ? +b.dataset.f : null; };
      mountMaq($('#mqB', r), { autoRotate: false, onPick: x => { if (x !== id) location.hash = 'bina-' + x; }, homeFn: m => m.focus(id, curF()), ready: m => { m.focus(id, curF()); r.addEventListener('click', e => { const b = e.target.closest('.floors button'); if (b) m.focus(id, +b.dataset.f); else if (e.target.closest('#bv button')) setTimeout(() => m.focus(id, curF()), 0); }); } });
    }
  };
};
/* 13: filtrlər linkdə saxlanır, sahə və vəziyyət filtrləri */
const F = {}; const resetF = () => Object.assign(F, { r: 0, b: '', ph: 'all', c: '', a0: 0, a1: 0, sort: HP ? 'aa' : 'pa', n: 24 }); resetF();
const AREAS = [['', 'İstənilən'], ['0-70', '70 m²-dək'], ['70-100', '70–100 m²'], ['100-130', '100–130 m²'], ['130-170', '130–170 m²'], ['170-999', '170 m²-dən çox']];
function filtered() {
  const L = free.filter(u => (!F.r || (F.r === 4 ? u.r >= 4 : u.r === F.r)) && (!F.b || u.b === F.b) && (F.ph === 'all' || u.bst === F.ph) && (!F.c || condOf(u) === F.c) && (!F.a0 || u.a >= F.a0) && (!F.a1 || u.a <= F.a1));
  const s = { pa: (a, b) => a.price - b.price, pd: (a, b) => b.price - a.price, aa: (a, b) => a.a - b.a, ad: (a, b) => b.a - a.a, fd: (a, b) => b.f - a.f }[F.sort]; return L.sort(s);
}
function fQuery() { const q = {}; if (F.r) q.r = F.r; if (F.b) q.b = F.b; if (F.ph !== 'all') q.ph = F.ph; if (F.c) q.c = F.c; if (F.a0) q.a0 = F.a0; if (F.a1) q.a1 = F.a1; return new URLSearchParams(q).toString(); }
function fFromQuery(qs) { if (!qs) return; const q = new URLSearchParams(qs); resetF(); F.r = +q.get('r') || 0; F.b = q.get('b') || ''; F.ph = q.get('ph') || 'all'; F.c = q.get('c') || ''; F.a0 = +q.get('a0') || 0; F.a1 = +q.get('a1') || 0; }
function critText() { const t = []; if (F.r) t.push(F.r === 4 ? '4+ otaq' : F.r + ' otaq'); if (F.b) t.push('Bina ' + F.b); if (F.ph !== 'all') t.push(F.ph === 'ok' ? 'hazır bina' : 'tikilən bina'); if (F.c) t.push(F.c); if (F.a0 || F.a1) t.push((F.a0 || 0) + '–' + (F.a1 && F.a1 < 999 ? F.a1 : '…') + ' m²'); return t.join(', '); }
pages.menziller = qs => { fFromQuery(qs); return {
  title: 'Mənzillər — Nizami City', html: `${pHead('Mənzillər', 'Satışda olan bütün mənzillər — satış bazası ilə eyni vaxtda yenilənir.', `<button class="btn tn" type="button" data-quiz>${I.wand} Seçməkdə kömək et</button>`)}
  <section class="wrap"><div class="fbar">
    <div class="fld"><span>Otaq</span><div class="seg" data-k="r">${[[0, 'Hamısı'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']].map(([v, t]) => `<button type="button" data-v="${v}">${t}</button>`).join('')}</div></div>
    <div class="fld"${SHOW_ST ? '' : ' style="display:none"'}><span>Mərhələ</span><div class="seg" data-k="ph">${[['all', 'Hamısı'], ['ok', 'Hazır'], ['w', 'Tikilən']].map(([v, t]) => `<button type="button" data-v="${v}">${t}</button>`).join('')}</div></div>
    <div class="fld"><label for="fB">Bina</label><select class="sel" id="fB"><option value="">Bütün binalar</option>${BLD.map(b => `<option value="${b.id}">Bina ${b.id}</option>`).join('')}</select></div>
    <div class="fld"><label for="fA">Sahə</label><select class="sel" id="fA">${AREAS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>
    <div class="fld"><label for="fC">Vəziyyət</label><select class="sel" id="fC"><option value="">Hamısı</option><option>Təmirli</option><option>White Box</option><option>Təmirsiz</option></select></div>
    <div class="fld"><label for="fS">Sıralama</label><select class="sel" id="fS">${HP ? '' : '<option value="pa">Qiymət: ucuzdan</option><option value="pd">Qiymət: bahadan</option>'}<option value="aa">Sahə: kiçikdən</option><option value="ad">Sahə: böyükdən</option><option value="fd">Mərtəbə: yuxarıdan</option></select></div></div>
    <div class="cnt"><div><b class="num" id="fN"></b> <span class="mu">mənzil tapıldı</span></div><div style="display:flex;gap:14px;flex-wrap:wrap"><button class="lk" type="button" data-share-f>${I.share} Axtarışı paylaş</button><button class="lk" type="button" id="fAl">${I.bell} Yeni mənzil çıxanda xəbər ver</button><button class="lk" type="button" id="fR">Filtrləri sıfırla</button></div></div>
    <div class="ugrid" id="fG"></div><div class="more"><button class="btn tn" type="button" id="fM">Daha çox göstər</button></div></section>
  ${seenBlock()}
  <section class="sec wrap">${contactBlock({ title: 'Uyğun mənzili birlikdə seçək', kind: 'price' })}</section>`,
  mount(r) {
    const sync = () => { $$('.seg[data-k]', r).forEach(s => $$('button', s).forEach(b => b.classList.toggle('on', String(F[s.dataset.k]) === b.dataset.v))); $('#fB', r).value = F.b; $('#fS', r).value = F.sort; $('#fC', r).value = F.c; const av = F.a0 || F.a1 ? (F.a0 || 0) + '-' + (F.a1 || 999) : ''; $('#fA', r).value = AREAS.some(a => a[0] === av) ? av : ''; const q = fQuery(); history.replaceState(null, '', '#menziller' + (q ? '?' + q : '')); };
    const draw = () => { const L = filtered(); $('#fN', r).textContent = L.length; $('#fG', r).innerHTML = L.slice(0, F.n).map(u => uCard(u)).join('') || `<div class="empty" style="grid-column:1/-1"><p style="margin:0 0 14px">Bu filtrlərlə satışda mənzil yoxdur.</p><button class="btn" type="button" data-alert="${esc(critText())}">${I.bell} Uyğun mənzil çıxanda xəbər ver</button></div>`; $('#fM', r).style.display = L.length > F.n ? '' : 'none'; };
    const ch = () => { F.n = 24; sync(); draw(); };
    $$('.seg[data-k]', r).forEach(s => s.onclick = e => { const b = e.target.closest('button'); if (!b) return; F[s.dataset.k] = s.dataset.k === 'r' ? +b.dataset.v : b.dataset.v; ch(); });
    $('#fB', r).onchange = e => { F.b = e.target.value; ch(); }; $('#fS', r).onchange = e => { F.sort = e.target.value; sync(); draw(); }; $('#fC', r).onchange = e => { F.c = e.target.value; ch(); };
    $('#fA', r).onchange = e => { const [a, b] = (e.target.value || '0-0').split('-').map(Number); F.a0 = a; F.a1 = b; ch(); };
    $('#fR', r).onclick = () => { resetF(); ch(); }; $('#fM', r).onclick = () => { F.n += 24; draw(); };
    $('#fAl', r).onclick = () => alertSub(critText());
    $('[data-share-f]', r).onclick = () => { const url = location.href; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('Axtarış linki kopyalandı')).catch(() => prompt('Linki kopyalayın:', url)); };
    sync(); draw(); bindLead(r); bindRail(r);
  }
}; };
/* 1: seçilmişlər */
pages.secilmis = () => { const L = FAV.map(uById).filter(Boolean); return {
  title: 'Seçilmişlər — Nizami City', html: `${pHead('Seçilmişlər', L.length ? L.length + ' mənzil yadda saxlanılıb. Siyahı bu cihazda saxlanılır.' : 'Mənzil kartındakı ♡ düyməsi ilə bəyəndiyiniz mənzilləri burada toplayın.', L.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn tn" type="button" id="fvW">${I.wa} Menecerə göndər</button><button class="btn tn" type="button" id="fvC">Hamısını müqayisə et</button></div>` : '')}
  <section class="sec wrap">${L.length ? `<div class="ugrid">${L.map(u => uCard(u)).join('')}</div>` : `<div class="empty"><p style="margin:0 0 14px">Hələ mənzil seçməmisiniz.</p><a class="btn" href="#menziller">Mənzillərə bax ${I.ar}</a></div>`}</section>
  ${L.length ? `<section class="sec wrap">${contactBlock({ title: 'Seçdiyiniz mənzillər üzrə sorğu', kind: 'price' })}</section>` : ''}`,
  mount(r) { const w = $('#fvW', r); if (w) w.onclick = () => open(`https://wa.me/${WA()}?text=${encodeURIComponent('Salam! Nizami City-də bu mənzillərlə maraqlanıram:\n' + L.map(u => '• ' + uTitle(u)).join('\n'))}`, '_blank'); const c = $('#fvC', r); if (c) c.onclick = () => { CMP = L.slice(0, 3).map(u => u.id); LS.set('cmp', CMP); location.hash = 'muqayise'; }; bindLead(r); }
}; };
/* 2: müqayisə */
pages.muqayise = () => { const L = CMP.map(uById).filter(Boolean); const rows = [['Şəkil', u => `<div class="cm-ph">${pic(bPic(u.b), bLbl(u), { sizes: '300px' })}</div>`], ['Plan', u => { const p = window.ncPlan(u.a, u.b); return p ? `<img class="cm-pl" src="${p.img}" alt="Mənzil planı" loading="lazy">` : '<span class="mu">—</span>'; }], ['Qiymət', u => `<b>${priceT(u)}</b>`], ['Otaq sayı', u => u.r], ['Sahə', u => fm2(u.a) + ' m²'], ['Bina', u => bLbl(u)], ['Mərtəbə', u => u.f + ' / ' + (window.NC_FLOORS || 10)], ['Vəziyyət', u => esc(u.c || condOf(u))],  ...(SHOW_ST ? [['Təhvil', u => u.bst === 'ok' ? 'Hazırdır' : SHOW_DEL ? CO.delivery : 'Tikilir']] : []), ['Status', u => u.st === 'bron' ? 'Bron' : u.st === 'sold' ? 'Satılıb' : 'Satışda'], ['', u => `<div style="display:flex;gap:6px;flex-wrap:wrap"><a class="btn sm" href="#menzil-${u.id}">Bax</a><button class="btn tn sm" type="button" data-cmp="${u.id}">Çıxar</button></div>`]];
  return { title: 'Müqayisə — Nizami City', html: `${pHead('Müqayisə', L.length ? 'Ən çox 3 mənzil yan-yana.' : 'Mənzil kartındakı ⇅ düyməsi ilə 3 mənzilədək seçib burada müqayisə edin.')}
  <section class="sec wrap">${L.length ? `<div class="card cmp-w"><table class="cmp"><tbody>${rows.map(([t, f]) => `<tr><th>${t}</th>${L.map(u => `<td>${f(u)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : `<div class="empty"><a class="btn" href="#menziller">Mənzillərə bax ${I.ar}</a></div>`}</section>`,
    mount(r) { r.addEventListener('click', e => { if (e.target.closest('[data-cmp]')) setTimeout(() => { if (location.hash.startsWith('#muqayise')) render(); }, 0); }); } }; };
function plateSvg(u) {
  const same = UNITS.filter(x => x.b === u.b && x.f === u.f && x.ent === u.ent).sort((a, b) => a.n - b.n), n = Math.max(2, same.length), half = Math.ceil(n / 2), W = 600, cw = (W - 20) / half;
  return `<svg viewBox="0 0 ${W} 260" role="img" aria-label="Mərtəbədə yerləşmə">${same.map((x, i) => { const top = i < half, k = top ? i : i - half, X = 10 + k * cw, Y = top ? 10 : 150, me = x.id === u.id; return `<rect x="${X + 3}" y="${Y}" width="${cw - 6}" height="100" rx="10" fill="${me ? '#3f4d2c' : x.st === 'sold' ? '#eceee6' : '#dfe4d3'}"/><text x="${X + cw / 2}" y="${Y + 56}" text-anchor="middle" font-family="NC Text, sans-serif" font-size="17" fill="${me ? '#fff' : '#555d4c'}">${x.f}.${x.n}</text>`; }).join('')}<rect x="10" y="118" width="${W - 20}" height="24" rx="8" fill="#f4f5f0"/><text x="${W / 2}" y="135" text-anchor="middle" font-family="NC Text, sans-serif" font-size="13" fill="#80877a">dəhliz və liftlər</text></svg>`;
}
pages.menzil = id => {
  const u = UNITS.find(x => x.id === id); if (!u) return pages.menziller();
  const sim = free.filter(x => x.id !== u.id && x.r === u.r && x.st === 'free').sort((a, b) => Math.abs(a.a - u.a) - Math.abs(b.a - u.a)).slice(0, 4);
  return {
    title: `${roomsT(u.r)}, ${fm2(u.a)} m² — ${bLbl(u)} — Nizami City`, html: `<section class="ph wrap">${crumbs(['Mənzillər', 'menziller'], [bLbl(u)])}
      <div class="prn-h"><img src="/assets/nc/logo.png" alt=""><div><b>Nizami City</b><br>${esc(CO.addr)} · ${esc(CO.short)}</div><div class="prn-qr" data-qr="${esc(location.origin + location.pathname + '#menzil-' + u.id)}"></div></div>
      <div class="unit"><div style="display:grid;gap:16px"><div class="gal" data-lb="u">${pic(bPic(u.b), bLbl(u), { eager: true, sizes: '(max-width:900px) 92vw, 58vw' })}</div><div class="thumbs" data-lb="u">${['aerial_c', 'entrance', 'street', 'aerial'].filter(k => k !== bPic(u.b)).map(k => pic(k, { aerial_c: 'Qapalı həyət', entrance: 'Giriş və terras', street: 'Kommersiya qalereyası', aerial: '3D vizual' }[k], { sizes: '200px' })).join('')}</div>${planCard(u)}${placeBlock(u)}</div>
      <div class="side"><div class="card"><h1 class="h2">${roomsT(u.r)}, ${fm2(u.a)} m²</h1><p class="mu" style="margin:6px 0 16px">${bLbl(u)} · ${ord(u.f)} mərtəbə</p>
        <div class="prbox"><b>${priceT(u)}</b>${!HP && u.st !== 'sold' ? `<span class="mu">${fmt(u.ppm)} ₼/m²</span>` : ''}</div>
        <div class="kv" style="margin-top:14px">${[['Otaq sayı', u.r], ['Sahə', fm2(u.a) + ' m²'], ['Mərtəbə', `${u.f} / ${window.NC_FLOORS || 10}`], ['Vəziyyət', u.c || condOf(u)], ...(SHOW_ST ? [['Təhvil', u.bst === 'ok' ? 'Hazırdır' : SHOW_DEL ? CO.delivery : 'Tikilir']] : []), ['Status', u.st === 'bron' ? 'Bron olunub' : u.st === 'sold' ? 'Satılıb' : 'Satışda']].map(([a, b]) => `<div><span>${a}</span><b>${esc(b)}</b></div>`).join('')}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><a class="btn" href="#lfw">${HP ? 'Qiyməti öyrən' : 'Baxışa yazıl'} ${I.ar}</a><a class="btn tn" href="https://wa.me/${WA()}?text=${encodeURIComponent('Salam! Bu mənzillə maraqlanıram: ' + uTitle(u) + ' — ' + location.origin + location.pathname + '#menzil-' + u.id)}" target="_blank" rel="noopener">${I.wa} WhatsApp</a><button class="btn tn" type="button" data-callback="${u.id}">${I.ph} Zəng sifarişi</button></div>
        <div class="uacts"><button type="button" class="ua ${isFav(u.id) ? 'on' : ''}" data-fav="${u.id}">${I.heart}<span>Seçilmiş</span></button><button type="button" class="ua ${isCmp(u.id) ? 'on' : ''}" data-cmp="${u.id}">${I.cmp}<span>Müqayisə</span></button><button type="button" class="ua" data-share="${u.id}">${I.share}<span>Paylaş</span></button><button type="button" class="ua" data-print>${I.prn}<span>Çap / PDF</span></button></div></div>
        ${!HP ? `<div class="card"><h3 class="h3" style="margin-bottom:12px">Ödəniş hesabla</h3>${calcBlock(u)}</div>` : ''}</div></div></section>
    ${HP ? `<section class="sec wrap">${planBlock()}</section>` : ''}
    <section class="sec wrap" id="lfw">${contactBlock({ title: HP ? 'Bu mənzilin qiyməti' : 'Bu mənzil üzrə sorğu', sub: 'Nömrənizi yazın — satış meneceri qiymət və ödəniş şərtlərini zəng edib desin.', kind: 'price', unit: u.id })}</section>
    ${sim.length ? `<section class="sec wrap"><div class="sh"><h2 class="h2">Oxşar mənzillər</h2></div><div class="ugrid">${sim.map(x => uCard(x, true)).join('')}</div></section>` : ''}
    ${seenBlock(u.id)}`,
    mount(r) { addSeen(u.id); bindCalc(r, u); bindLead(r, u); bindLb(r); bindRail(r); bindPlace(r, u); bindPlan(r); $$('a[href="#lfw"]', r).forEach(a => a.onclick = e => { e.preventDefault(); $('#lfw', r).scrollIntoView({ behavior: 'smooth' }); }); }
  };
};
pages.kalkulyator = () => ({ title: 'Ödəniş — Nizami City', html: `${pHead('Ödəniş', 'Daxili kredit: ' + TERMS.map(t => t.m + ' ay' + (t.s ? ' (+' + t.s + ' ₼/m²)' : ' faizsiz')).join(', ') + '. Nəticə təxminidir.')}<section class="sec wrap"><div class="two"><div class="card">${calcBlock()}</div><div class="card"><h2 class="h2">Sorğu</h2><p class="lead" style="margin:8px 0 20px">Dəqiq hesablama üçün satış meneceri ilə əlaqə saxlayın.</p>${leadForm({ kind: 'price' })}</div></div></section>`, mount(r) { bindCalc(r); bindLead(r); } });
pages.mekan = () => ({ title: 'Məkan — Nizami City', html: `${pHead('Məkan', esc(CO.addr))}<section class="sec wrap">${locBlock()}</section><section class="sec wrap">${featBlock()}</section>`, mount(r) { bindLb(r); } });
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
  $('#ft').innerHTML = `<div class="wrap"><div class="cols"><div><a class="brand" href="#home"><img src="/assets/nc/site/mark-olive.png" alt="">Nizami City</a><p>${esc(CO.slogan || '')}. ${esc(CO.addr)}</p><div class="soc">${CO.ig ? `<a class="icb" href="https://instagram.com/${esc(CO.ig)}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a>` : ''}${CO.wa ? `<a class="icb" href="https://wa.me/${esc(CO.wa)}" target="_blank" rel="noopener" aria-label="WhatsApp">${I.wa}</a>` : ''}</div></div>
    <div><h4>Mənzillər</h4><a href="#menziller">Bütün mənzillər</a><a href="#binalar">Binalar</a>${HP ? '' : '<a href="#kalkulyator">Ödəniş</a>'}<a href="#kommersiya">Kommersiya</a></div>
    <div><h4>Kompleks</h4><a href="#mekan">Məkan</a>${OFF.bloq ? '' : '<a href="#bloq">Bloq</a>'}<a href="#suallar">Suallar</a><a href="#elaqe">Əlaqə</a></div>
    <div><h4>Əlaqə</h4><a href="tel:${esc(CO.short)}">${esc(CO.short)}</a>${(CO.phones || []).map((p, i) => `<a href="tel:${esc((CO.tel || [])[i] || p)}">${esc(p)}</a>`).join('')}${CO.email ? `<a href="mailto:${esc(CO.email)}">${esc(CO.email)}</a>` : ''}</div></div>
    <div class="bot"><span>© ${new Date().getFullYear()} Nizami City · City Life MMC</span><span>${esc(CO.hours)}</span></div></div>`;
}

/* marşrut */
function parse() {
  const raw = decodeURIComponent(location.hash.slice(1)) || 'home', qi = raw.indexOf('?'), h = qi >= 0 ? raw.slice(0, qi) : raw, qs = qi >= 0 ? raw.slice(qi + 1) : ''; let m;
  if (h === 'menziller') return ['menziller', qs];
  if ((m = h.match(/^bina-([A-Z])$/))) return ['bina', m[1]];
  if ((m = h.match(/^menzil-(.+)$/))) return ['menzil', m[1]];
  if ((m = h.match(/^bloq-(.+)$/))) return OFF.bloq ? ['home'] : ['post', m[1]];
  if (h === 'layihe' || h === 'gunes' || h === 'qalereya') return ['binalar'];
  return [pages[h] && !['bina', 'menzil', 'post'].includes(h) && !OFF[h] ? h : 'home'];
}
function render() {
  beforeRender(); const [k, arg] = parse(), pg = pages[k](arg), main = $('#view');
  main.innerHTML = pg.html; document.title = pg.title || 'Nizami City';
  const act = k === 'menzil' ? 'menziller' : k === 'bina' ? 'binalar' : k === 'post' ? 'bloq' : k;
  $$('.nav a, .menu nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + act));
  scrollTo(0, 0); pg.mount && pg.mount(main); syncBadges();
  $$('a[data-ph]', main).forEach(a => a.setAttribute('href', '#menziller?ph=' + a.dataset.ph));
  try { window.ncAfterRender && window.ncAfterRender(k, main); } catch (e) { }
  closeMenu(); closeModal(); afterRender(k, main);
}
addEventListener('hashchange', render);
const mbtn = $('#mbtn');
function closeMenu() { document.body.classList.remove('menu-on'); mbtn && mbtn.setAttribute('aria-expanded', 'false'); }
if (mbtn) mbtn.onclick = () => { const on = !document.body.classList.contains('menu-on'); document.body.classList.toggle('menu-on', on); mbtn.setAttribute('aria-expanded', on); };
$('#menu').addEventListener('click', e => { if (e.target.id === 'menu' || e.target.closest('[data-close]')) closeMenu(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
footer();
$('#cmpClr').onclick = () => { CMP = []; LS.set('cmp', CMP); syncBadges(); if (location.hash.startsWith('#muqayise')) render(); };
if (HP) $$('a[href="#kalkulyator"]').forEach(a => a.style.display = 'none');
