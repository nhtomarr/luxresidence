/* Nizami City — sayt v3+: 3D maket, animasiyalar, görünüş, əlavə alətlər. app.js ilə eyni əhatədə işləyir. */
Object.assign(I, {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M8 5l11 7-11 7z"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>',
  fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>',
  mi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
});
const NOMO = () => document.documentElement.classList.contains('nomo') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer:fine)').matches;
const NFL = window.NC_FLOORS || 10;

/* skript yükləyici (three, qrcode — yalnız lazım olanda) */
const _ls = {};
const loadJs = src => _ls[src] || (_ls[src] = new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = () => { delete _ls[src]; no(); }; document.head.appendChild(s); }));
const need3 = () => window.THREE ? Promise.resolve() : loadJs('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
const needQR = () => window.qrcode ? Promise.resolve() : loadJs('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js');

/* ===== 1–6: 3D maket ===== */
const MQ = [];
function killMaq() { MQ.splice(0).forEach(m => { try { m.dispose(); } catch (e) { } }); }
const SEASONS = [['Qış', 11, 21], ['Yaz', 2, 21], ['Yay', 5, 21], ['Payız', 8, 23]];
function maqHtml(id, o = {}) {
  const now = new Date(), si = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 0][now.getMonth()];
  return `<div class="mq${o.sm ? ' sm' : ''}" id="${id}" data-si="${si}">
    <div class="mq-load"><i></i><span>3D maket hazırlanır…</span></div>
    <div class="mq-cap" aria-live="polite"><span></span><em></em></div>
    <div class="mq-tip"></div><div class="mq-hint">Yaxınlaşdırmaq üçün Ctrl + təkər və ya ＋ düyməsi</div>
    <div class="mq-bar" role="toolbar" aria-label="3D idarə">
      ${o.tour === false ? '' : `<button type="button" class="mq-b mq-pl" data-mq="tour">${I.play}<span>Virtual tur</span></button>`}
      <button type="button" class="mq-b" data-mq="sun" aria-expanded="false" title="Günəş və kölgə">${I.sun}<span>Günəş</span></button>
      <button type="button" class="mq-b" data-mq="night" title="Gecə görünüşü">${I.moon}<span>Gecə</span></button>
      <i class="mq-sep"></i>
      <button type="button" class="mq-b ic" data-mq="in" aria-label="Yaxınlaşdır">${I.pl}</button><button type="button" class="mq-b ic" data-mq="out" aria-label="Uzaqlaşdır">${I.mi}</button>
      <button type="button" class="mq-b ic" data-mq="home" aria-label="İlkin görünüş" title="İlkin görünüş">${I.home}</button>
      <button type="button" class="mq-b ic" data-mq="fs" aria-label="Tam ekran" title="Tam ekran">${I.fs}</button>
    </div>
    <div class="mq-sun" hidden>
      <div class="seg sm" data-k="season">${SEASONS.map(([t], i) => `<button type="button" data-v="${i}" class="${i === si ? 'on' : ''}">${t}</button>`).join('')}</div>
      <div class="rng"><div class="v"><span id="${id}T">15:00</span><b id="${id}E"></b></div><input type="range" min="5" max="21.5" step="0.25" value="15" aria-label="Günün saatı"></div>
      <p class="mu">Bakı koordinatları ilə günəşin real mövqeyi. Kölgələr binaların bir-birinə və həyətə düşməsini göstərir.</p>
    </div></div>`;
}
function mountMaq(host, o = {}) {
  if (!host) return;
  const fb = () => { host.classList.add('mq-fb'); const l = $('.mq-load', host); if (l) l.remove(); $('.mq-bar', host).remove(); host.insertAdjacentHTML('afterbegin', pic('aerial', '3D vizual', { sizes: '100vw' })); };
  const go = () => need3().then(() => {
    if (!document.body.contains(host)) return;
    const tip = $('.mq-tip', host), cap = $('.mq-cap', host);
    let ht; const m = window.ncMaq(host, Object.assign({
      showSt: SHOW_ST, tip,
      tipHtml: b => { const fr = UNITS.filter(u => u.b === b.id && u.st === 'free').length; return `<b>Bina ${b.id}</b><span>${SHOW_STOCK ? fr + ' mənzil satışda' : SHOW_ST ? stTxt(b.st) : 'Mərtəbələrə bax'}</span>`; },
      onPick: id => { location.hash = 'bina-' + id; },
      onCap: (t, i, n) => { cap.classList.toggle('on', !!t); if (t) { $('span', cap).textContent = t; $('em', cap).textContent = i + ' / ' + n; } },
      onWheelHint: () => { const h = $('.mq-hint', host); h.classList.add('on'); clearTimeout(ht); ht = setTimeout(() => h.classList.remove('on'), 1600); },
    }, o));
    if (!m) return fb();
    MQ.push(m); host.classList.add('ready'); bindMaqUI(host, m, o); o.ready && o.ready(m);
  }).catch(fb);
  if (!('IntersectionObserver' in window)) return go();
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); go(); } }, { rootMargin: '350px' }); io.observe(host);
}
function bindMaqUI(host, m, o) {
  const id = host.id, sp = $('.mq-sun', host), rng = $('input[type=range]', sp); let si = +host.dataset.si;
  const sunNow = () => { const [, mon, day] = SEASONS[si], h = +rng.value, d = new Date(new Date().getFullYear(), mon, day, Math.floor(h), Math.round((h % 1) * 60)); const p = m.sun(d);
    $('#' + id + 'T').textContent = `${day} ${MON[mon]} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    $('#' + id + 'E').textContent = p.el > 0 ? `Günəş ${Math.round(p.el)}° hündürlükdə` : 'Günəş batıb';
    $('[data-mq=night]', host).classList.toggle('on', m.isNight()); };
  rng.oninput = sunNow;
  $('[data-k=season]', sp).onclick = e => { const b = e.target.closest('button'); if (!b) return; si = +b.dataset.v; $$('[data-k=season] button', sp).forEach(x => x.classList.toggle('on', x === b)); sunNow(); };
  $('.mq-bar', host).onclick = e => {
    const b = e.target.closest('[data-mq]'); if (!b) return; const a = b.dataset.mq;
    if (a === 'tour') { const on = m.tour(() => { b.classList.remove('on'); b.innerHTML = I.play + '<span>Virtual tur</span>'; }); b.classList.toggle('on', on); b.innerHTML = (on ? I.stop : I.play) + `<span>${on ? 'Dayandır' : 'Virtual tur'}</span>`; }
    else if (a === 'sun') { const on = sp.hidden; sp.hidden = !on; b.classList.toggle('on', on); b.setAttribute('aria-expanded', on); if (on) sunNow(); }
    else if (a === 'night') { b.classList.toggle('on', m.night(!m.isNight())); }
    else if (a === 'in') m.zoom(.82); else if (a === 'out') m.zoom(1.2);
    else if (a === 'home') { o.homeFn ? o.homeFn(m) : m.home(); }
    else if (a === 'fs') { if (document.fullscreenElement) document.exitFullscreen(); else if (host.requestFullscreen) host.requestFullscreen().catch(() => host.classList.toggle('mq-max')); else host.classList.toggle('mq-max'); }
  };
  m.sun(new Date(new Date().getFullYear(), SEASONS[si][1], SEASONS[si][2], 15, 0));
}
function maqSection() {
  return `<section class="sec wrap"><div class="sh"><div><h2 class="h2">Kompleksi 3D-də kəşf edin</h2><p class="lead" style="margin-top:8px">Maketi fırladın, binanın üzərinə klikləyin — mərtəbələr və mənzillər açılacaq.</p></div><div class="mq-chips">${BLD.map(b => `<a class="pillbtn sm" href="#bina-${b.id}" data-mqf="${b.id}">Bina ${b.id}</a>`).join('')}</div></div>${maqHtml('mqH')}</section>`;
}
function bindMaqHome(r) {
  mountMaq($('#mqH', r), { ready: m => { $$('[data-mqf]', r).forEach(a => { a.onmouseenter = () => m.focus(a.dataset.mqf); a.onmouseleave = () => m.focus(null); }); } });
}

/* ===== 7: mərtəbə planı 3D (izometrik) ===== */
function isoPlan(u) {
  const same = UNITS.filter(x => x.b === u.b && x.f === u.f && x.ent === u.ent).sort((a, b) => a.n - b.n), half = Math.max(1, Math.ceil(same.length / 2));
  const cell = x => `<div class="iso3-c ${x.id === u.id ? 'me' : x.st === 'sold' ? 'sd' : ''}"><span>${x.id === u.id ? 'Bu mənzil' : roomsT(x.r).replace(' otaqlı', ' otaq')}</span><small>${fm2(x.a)} m²</small></div>`;
  return `<div class="iso3" aria-label="Mərtəbənin 3D sxemi"><div class="iso3-st" style="--n:${half}">${same.slice(0, half).map(cell).join('')}<div class="iso3-cor">dəhliz və liftlər</div>${same.slice(half).map(cell).join('')}</div></div><p class="mu iso3-h">Sürüşdürərək fırladın · ${ord(u.f)} mərtəbə, ${u.ent ? u.ent + '-ci giriş' : 'Bina ' + u.b}</p>`;
}
function bindIso(root) {
  const w = $('.iso3', root); if (!w) return; const st = $('.iso3-st', w); let d = null, rz = -32, rx = 56;
  const set = () => st.style.transform = `rotateX(${rx}deg) rotateZ(${rz}deg)`;
  w.onpointerdown = e => { d = { x: e.clientX, y: e.clientY, rz, rx }; w.setPointerCapture(e.pointerId); w.classList.add('drag'); };
  w.onpointermove = e => { if (!d) return; rz = d.rz + (e.clientX - d.x) * .35; rx = Math.max(20, Math.min(70, d.rx - (e.clientY - d.y) * .25)); set(); };
  w.onpointerup = w.onpointercancel = () => { d = null; w.classList.remove('drag'); };
  set();
}
function placeBlock(u) {
  return `<div class="plan"><div class="sh" style="margin-bottom:14px;align-items:center"><h3 class="h3">Binada yerləşmə</h3><div class="tabs" id="pv"><button type="button" data-v="3d" class="on">${I.cube} 3D bina</button><button type="button" data-v="iso">Mərtəbə 3D</button><button type="button" data-v="2d">Plan</button></div></div>
    <div data-pv="3d">${maqHtml('mqU', { sm: true, tour: false })}</div><div data-pv="iso" style="display:none">${isoPlan(u)}</div><div data-pv="2d" style="display:none">${plateSvg(u)}</div>
    <p class="mu" style="margin:10px 0 0;font-size:14px">Sxematik göstərilib. Dəqiq plan satış ofisində təqdim olunur.</p></div>`;
}
function bindPlace(r, u) {
  const tb = $('#pv', r); if (!tb) return;
  tb.onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('button', tb).forEach(x => x.classList.toggle('on', x === b)); $$('[data-pv]', r).forEach(x => x.style.display = x.dataset.pv === b.dataset.v ? '' : 'none'); };
  bindIso(r);
  mountMaq($('#mqU', r), { autoRotate: false, onPick: id => { if (id !== u.b) location.hash = 'bina-' + id; }, homeFn: m => m.focus(u.b, u.f), ready: m => m.focus(u.b, u.f) });
}

/* mənzil planı + eksplikasiya */
const f2 = n => (+n).toFixed(2).replace('.', ',');
function planCard(u) {
  const p = window.ncPlan(u.a, u.b); if (!p) return ''; const dif = Math.abs(p.a - u.a) > 0.005;
  return `<div class="plan pl-card"><div class="sh" style="margin-bottom:14px;align-items:center"><div><h3 class="h3">Mənzil planı</h3><span class="mu" style="font-size:14px">${p.rooms.length} bölmə · plan ${f2(p.a)} m²</span></div><a class="lk" href="${p.img}" download="Nizami-City-plan-${fm2(p.a)}m2.png">${I.doc} PNG yüklə</a></div>
    <div class="plx"><figure class="plx-im" data-lb="pl"><img src="${p.img}" alt="Mənzil planı, ${fm2(p.a)} m²" loading="lazy" decoding="async"></figure>
    <ol class="expl">${p.rooms.map(([n, m], i) => `<li><i>${i + 1}</i><span>${esc(n)}</span><em></em><b>${f2(m)} m²</b></li>`).join('')}<li class="tot"><span>${dif ? 'Plan üzrə sahə' : 'Ümumi sahə'}</span><em></em><b>${f2(p.a)} m²</b></li>${dif ? `<li class="tot2"><span>Sənəd üzrə sahə</span><em></em><b>${f2(u.a)} m²</b></li>` : ''}</ol></div>
    <p class="mu" style="margin:12px 0 0;font-size:13.5px">Plandakı rəqəmlər eksplikasiyadakı nömrələrə uyğundur. Mebel düzülüşü təqdimat xarakterlidir.</p></div>`;
}

/* ===== 8: kinematik hero ===== */
function heroFx(r) {
  const sl = $('#sl', r); if (!sl) return;
  const t = $('.hero-t', sl), mo = new MutationObserver(() => { t.classList.remove('sw'); void t.offsetWidth; t.classList.add('sw'); });
  mo.observe($('#slH', sl), { childList: true, characterData: true, subtree: true });
}

/* ===== 9–10: keçidlər, irəliləyiş, görünmə, sayğaclar ===== */
const sprog = document.createElement('div'); sprog.className = 'sprog'; sprog.setAttribute('aria-hidden', 'true'); document.body.appendChild(sprog);
let _raf = 0;
function onScroll() {
  if (_raf) return; _raf = requestAnimationFrame(() => {
    _raf = 0; const y = scrollY, H = document.documentElement.scrollHeight - innerHeight;
    sprog.style.transform = `scaleX(${H > 0 ? Math.min(1, y / H) : 0})`;
    $('#hd').classList.toggle('sc', y > 12);
    const sl = $('#sl'); if (sl && !NOMO()) { const rc = sl.getBoundingClientRect(); if (rc.bottom > 0) sl.style.setProperty('--py', Math.round(Math.max(0, -rc.top) * .18) + 'px'); }
  });
}
addEventListener('scroll', onScroll, { passive: true });
let rvIO = null;
function countUp(el) {
  const m = el.textContent.trim().match(/^(\d+)(.*)$/); if (!m || el.dataset.cnt) return; el.dataset.cnt = 1; const to = +m[1], suf = m[2];
  if (NOMO() || to < 2) return; const t0 = performance.now(), D = 1100;
  const step = t => { const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e) + suf; if (k < 1) requestAnimationFrame(step); };
  el.textContent = '0' + suf; requestAnimationFrame(step);
}
function reveal(main) {
  if (rvIO) rvIO.disconnect();
  const els = $$('.sh, .bcard, .ucard, .feat, .ncard, .icn, .two>.card, .promo, .loc>*, .mq, .nz, .plan-card, .nbh, .tline>.card, .stat, .bro-s', main);
  const cnt = $$('.stat b, .nz b', main);
  if (NOMO() || !('IntersectionObserver' in window)) return;
  rvIO = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const el = e.target; rvIO.unobserve(el);
    if (el.classList.contains('rv')) { const sib = el.parentElement ? [...el.parentElement.children].filter(x => x.classList.contains('rv')) : [], i = Math.max(0, sib.indexOf(el)); el.style.transitionDelay = Math.min(i, 5) * 60 + 'ms'; el.classList.add('rv-in'); setTimeout(() => { el.style.transitionDelay = ''; }, 900); }
    $$('.stat b, .nz b', el).concat(cnt.includes(el) ? [el] : []).forEach(countUp); }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  const vh = innerHeight;
  els.forEach(el => { const top = el.getBoundingClientRect().top; if (top > vh * .92) { el.classList.add('rv'); } rvIO.observe(el); });
  cnt.forEach(c => rvIO.observe(c));
}
function pageIn(main) { if (NOMO()) return; main.classList.remove('pg-in'); void main.offsetWidth; main.classList.add('pg-in'); }

/* ===== 11: kartlarda 3D meyl ===== */
if (FINE) {
  let tl = null;
  document.addEventListener('pointermove', e => {
    if (NOMO()) return; const el = e.target.closest && e.target.closest('.bcard, .feat, .ncard, .tilt');
    if (tl && tl !== el) { tl.style.removeProperty('--rx'); tl.style.removeProperty('--ry'); tl.classList.remove('tl'); tl = null; }
    if (!el) return; tl = el; const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.classList.add('tl'); el.style.setProperty('--rx', ((.5 - y) * 6).toFixed(2) + 'deg'); el.style.setProperty('--ry', ((x - .5) * 7).toFixed(2) + 'deg'); el.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
  }, { passive: true });
}

/* ===== 12–13: görünüş — tema, mətn ölçüsü, kontrast, animasiya ===== */
let UI = LS.get('ui', { th: 'light', fs: 0, hc: false, nomo: false });
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
function applyUI() {
  const h = document.documentElement, th = UI.th === 'auto' ? (darkMQ.matches ? 'dark' : 'light') : UI.th;
  h.dataset.theme = th; h.dataset.fs = UI.fs || 0; h.classList.toggle('hc', !!UI.hc); h.classList.toggle('nomo', !!UI.nomo);
  const tc = $('meta[name=theme-color]'); if (tc) tc.content = th === 'dark' ? '#14170f' : '#f4f5f0';
}
darkMQ.addEventListener && darkMQ.addEventListener('change', () => UI.th === 'auto' && applyUI());
applyUI();
function uiPanel() {
  const ex = $('#uiP'); if (ex) { ex.remove(); return; }
  const p = document.createElement('div'); p.className = 'uip'; p.id = 'uiP'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Görünüş');
  const seg = (k, L) => `<div class="seg sm" data-ui="${k}">${L.map(([v, t]) => `<button type="button" data-v="${v}" class="${String(UI[k]) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  p.innerHTML = `<div class="uip-h"><b>Görünüş</b><button class="icb sm" type="button" data-x aria-label="Bağla">${I.x}</button></div>
    <div class="fld"><span>Tema</span>${seg('th', [['light', I.sun + ' Açıq'], ['dark', I.moon + ' Tünd'], ['auto', 'Avto']])}</div>
    <div class="fld"><span>Mətn ölçüsü</span>${seg('fs', [[0, 'A'], [1, 'A+'], [2, 'A++']])}</div>
    <label class="tgl"><input type="checkbox" data-ui="hc" ${UI.hc ? 'checked' : ''}><i></i><span>Yüksək kontrast</span></label>
    <label class="tgl"><input type="checkbox" data-ui="nomo" ${UI.nomo ? 'checked' : ''}><i></i><span>Animasiyaları dayandır</span></label>`;
  document.body.appendChild(p); requestAnimationFrame(() => p.classList.add('on'));
  p.onclick = e => { if (e.target.closest('[data-x]')) return p.remove(); const b = e.target.closest('[data-ui] button'); if (!b) return; const k = b.parentElement.dataset.ui; UI[k] = k === 'fs' ? +b.dataset.v : b.dataset.v; $$('button', b.parentElement).forEach(x => x.classList.toggle('on', x === b)); LS.set('ui', UI); applyUI(); };
  p.onchange = e => { const c = e.target.closest('input[data-ui]'); if (!c) return; UI[c.dataset.ui] = c.checked; LS.set('ui', UI); applyUI(); };
  setTimeout(() => document.addEventListener('click', function cl(e) { if (!p.contains(e.target) && !e.target.closest('[data-ui-open]')) { p.remove(); document.removeEventListener('click', cl); } }), 0);
}
(() => { const r = $('.hd-r'); if (!r) return; const b = document.createElement('button'); b.className = 'icb'; b.type = 'button'; b.dataset.uiOpen = ''; b.setAttribute('aria-label', 'Görünüş: tema, mətn ölçüsü'); b.title = 'Görünüş'; b.innerHTML = I.eye; b.onclick = uiPanel; r.insertBefore(b, r.firstChild);
  const mp = $('.menu .pan > div:last-child'); if (mp) { const m = document.createElement('button'); m.type = 'button'; m.className = 'btn tn'; m.dataset.uiOpen = ''; m.innerHTML = I.eye + ' Görünüş'; m.onclick = () => { closeMenu(); setTimeout(uiPanel, 50); }; mp.appendChild(m); } })();

/* ===== 14: ətraf — interaktiv sxem ===== */
const NCP = { x: 420, y: 300 };
const CATS = [...new Set(POI.map(p => p.c))];
function nbhBlock() {
  return `<div class="nbh"><div class="nbh-f"><div class="seg sm" id="nbF"><button type="button" data-v="" class="on">Hamısı</button>${CATS.map(c => `<button type="button" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div><span class="mu" style="font-size:13px">Sxematik — miqyas dəqiq deyil</span></div>
  <div class="nbh-sc"><svg viewBox="0 0 800 550" class="nbh-s" role="img" aria-label="Ətraf obyektlərin sxemi">
    <defs><pattern id="nbG" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" class="nbh-gr"/></pattern></defs>
    <rect width="800" height="550" fill="url(#nbG)"/>
    <path class="nbh-rd" d="M0 250 C200 260 380 240 800 210 M300 0 C320 200 330 380 300 550 M0 420 C260 400 520 430 800 380 M560 0 C540 160 600 360 660 550"/>
    ${[90, 170, 260].map((rr, i) => `<circle cx="${NCP.x}" cy="${NCP.y}" r="${rr}" class="nbh-ring" style="animation-delay:${i * .8}s"/>`).join('')}
    ${POI.map((p, i) => `<g class="nbh-p" data-c="${esc(p.c)}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(p.n)}"><line x1="${NCP.x}" y1="${NCP.y}" x2="${p.x}" y2="${p.y}" class="nbh-ln"/><circle cx="${p.x}" cy="${p.y}" r="17" class="nbh-dot"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle">${esc(PIC[p.c] || p.k)}</text><text x="${p.x}" y="${p.y + 36}" text-anchor="middle" class="nbh-t">${esc(p.n)}</text></g>`).join('')}
    <g class="nbh-nc"><circle cx="${NCP.x}" cy="${NCP.y}" r="30" class="nbh-pulse"/><circle cx="${NCP.x}" cy="${NCP.y}" r="24"/><image href="/assets/nc/site/mark-cream.png" x="${NCP.x - 15}" y="${NCP.y - 15}" width="30" height="30"/><text x="${NCP.x}" y="${NCP.y + 48}" text-anchor="middle" class="nbh-t b">Nizami City</text></g>
  </svg></div><div class="nbh-card" id="nbC" aria-live="polite"></div></div>`;
}
function bindNbh(r) {
  const w = $('.nbh', r); if (!w) return; const card = $('#nbC', w);
  const sc = $('.nbh-sc', w); requestAnimationFrame(() => { if (sc.scrollWidth > sc.clientWidth) sc.scrollLeft = (sc.scrollWidth * NCP.x / 800) - sc.clientWidth / 2; });
  const show = i => { const p = POI[i]; $$('.nbh-p', w).forEach(g => g.classList.toggle('on', +g.dataset.i === i)); card.innerHTML = `<b>${esc(p.n)}</b><span>${esc(p.d)} · ${esc(p.c)}</span><a class="lk" href="https://www.google.com/maps/dir/?api=1&origin=${MAPQ}&destination=${encodeURIComponent(p.n + ', Bakı')}" target="_blank" rel="noopener">Marşrut ${I.ar}</a>`; card.classList.add('on'); };
  $$('.nbh-p', w).forEach(g => { g.onclick = () => show(+g.dataset.i); g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(+g.dataset.i); } }; if (FINE) g.onmouseenter = () => show(+g.dataset.i); });
  $('#nbF', w).onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#nbF button', w).forEach(x => x.classList.toggle('on', x === b)); const c = b.dataset.v; $$('.nbh-p', w).forEach(g => g.classList.toggle('off', !!c && g.dataset.c !== c)); card.classList.remove('on'); };
}
function bindLocTabs(r) {
  $$('.loc-t', r).forEach(tb => { tb.onclick = e => { const b = e.target.closest('button'); if (!b) return; const box = tb.closest('section'); $$('button', tb).forEach(x => x.classList.toggle('on', x === b)); $$('[data-lv]', box).forEach(x => x.style.display = x.dataset.lv === b.dataset.v ? '' : 'none'); if (b.dataset.v === 'm3' && CM) setTimeout(() => CM.resize(), 30); if (b.dataset.v === 'map') { const f = $('iframe[data-src]', box); if (f) { f.src = f.dataset.src; f.removeAttribute('data-src'); } } }; });
  bindNbh(r);
}

/* ===== 15–16: baxış saatı və zəng vaxtı (formalara əlavə) ===== */
const HOURS = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];
const WHEN = [['now', 'İndi'], ['1h', '1 saat ərzində'], ['eve', 'Axşam 17–19'], ['tom', 'Sabah']];

/* ===== 17: QR kod ===== */
function qrSvg(url) { const q = window.qrcode(0, 'M'); q.addData(url); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }
function fillQR(root) { const L = $$('[data-qr]', root); if (!L.length) return; needQR().then(() => L.forEach(e => { e.innerHTML = qrSvg(e.dataset.qr); })).catch(() => L.forEach(e => e.remove())); }

/* ===== 18: broşür ===== */
pages.brosur = () => {
  const site = location.origin + location.pathname, t = TERMS[0];
  return { title: 'Broşür — Nizami City', html: `<section class="ph wrap bro-top">${crumbs(['Broşür'])}<div class="ph-card"><div><h1 class="h1">Broşür</h1><p class="lead">Kompleks haqqında əsas məlumat bir səhifədə — çap edin və ya PDF kimi saxlayın.</p></div><button class="btn" type="button" data-print>${I.prn} Çap et / PDF saxla</button></div></section>
  <div class="wrap bro">
    <div class="bro-s bro-cov">${pic('front', 'Nizami City', { sizes: '1200px' })}<div class="bro-cv"><img src="/assets/nc/site/mark-cream.png" alt=""><div><b>Nizami City</b><span>${esc(CO.slogan || 'Yasamalda qapalı həyətli yaşayış kompleksi')}</span></div></div></div>
    <div class="bro-s bro-g"><div><h2 class="h2">Layihə haqqında</h2><p class="lead" style="margin-top:10px">Yasamalda, Nizami metrosunun yanında altı bina və mərkəzdə avtomobilsiz qapalı həyət. Birinci mərtəbələrdə kommersiya qalereyası, binaların altında iki səviyyəli parkinq.</p>
      <div class="nzs">${numbers().map(([n, s]) => `<div class="nz"><b>${n}</b><span>${s}</span></div>`).join('')}</div></div>${pic('aerial', 'Kompleksin 3D vizualı', { sizes: '600px' })}</div>
    <div class="bro-s"><h2 class="h2" style="margin-bottom:14px">Kompleksdə həyat</h2><div class="bro-f">${FEAT.map(([k, tt, p]) => `<div>${pic(k, tt, { sizes: '300px' })}<b>${tt}</b><span>${p}</span></div>`).join('')}</div>
      <div class="bro-i">${ICONS.map(([i, b, s]) => `<div><i>${i}</i><b>${b}</b><span>${s}</span></div>`).join('')}</div></div>
    <div class="bro-s bro-g"><div><h2 class="h2">Ödəniş</h2><p class="lead" style="margin-top:10px">Nağd ödəniş, ipoteka və ya daxili kredit: ${t ? 'ilkin ödənişdən sonra qalan məbləğ ' + t.m + ' ay faizsiz' : 'hissə-hissə'}${TERMS.length > 1 ? ', həmçinin ' + TERMS.slice(1).map(x => x.m).join(' və ') + ' aylıq variantlar' : ''}. Qiymət və şərtləri satış meneceri dəqiqləşdirir.</p>
      <h2 class="h2" style="margin-top:22px">Məkan</h2><ul class="bro-l">${POI.map(p => `<li><b>${esc(p.n)}</b> — ${esc(p.d)}</li>`).join('')}</ul></div>
      <div class="bro-c"><h2 class="h2">Əlaqə</h2>${contactsList()}<div class="bro-qr"><div data-qr="${esc(site)}"></div><span>Saytda mənzilləri və 3D maketi görmək üçün skan edin</span></div></div></div>
  </div>`, mount(r) { fillQR(r); } };
};

/* ===== 19: sürətli sual / əlaqə mərkəzi ===== */
const QQ = ['Qiymətlər barədə məlumat almaq istəyirəm', 'Mənzilə baxışa gəlmək istəyirəm', 'Ödəniş şərtləri (daxili kredit, ipoteka) barədə', 'Hazır mənzillər barədə', 'Kommersiya sahəsi ilə maraqlanıram'];
function hub() {
  const ex = $('#hub'); if (ex) { ex.remove(); return; }
  const p = document.createElement('div'); p.className = 'hub'; p.id = 'hub'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Satış ofisi ilə əlaqə');
  p.innerHTML = `<div class="hub-h"><img src="/assets/nc/site/mark-cream.png" alt=""><div><b>Nizami City satış ofisi</b><span>${esc(CO.hours)}</span></div><button class="icb sm" type="button" data-x aria-label="Bağla">${I.x}</button></div>
    <div class="hub-b"><div class="bub">Salam! Sualınızı seçin — WhatsApp-da hazır mətnlə açılacaq.</div>
    <div class="hub-q">${QQ.map((q, i) => `<a href="https://wa.me/${WA()}?text=${encodeURIComponent('Salam! Nizami City: ' + q + '.')}" target="_blank" rel="noopener" data-i="${i}">${esc(q)}${I.ar}</a>`).join('')}</div></div>
    <div class="hub-f"><button class="btn sm" type="button" data-callback>${I.ph} Zəng sifarişi</button><a class="btn tn sm" href="tel:${esc(CO.short)}">${esc(CO.short)}</a></div>`;
  document.body.appendChild(p); requestAnimationFrame(() => p.classList.add('on'));
  p.onclick = e => { if (e.target.closest('[data-x]') || e.target.closest('[data-callback]') || e.target.closest('a')) setTimeout(() => p.remove(), 0); };
  setTimeout(() => document.addEventListener('click', function cl(e) { if (!p.contains(e.target) && !e.target.closest('[data-hub]')) { p.remove(); document.removeEventListener('click', cl); } }), 0);
}
document.addEventListener('click', e => { const h = e.target.closest('[data-hub]'); if (h) { e.preventDefault(); hub(); } });

/* ===== 20: ödəniş planı (faizlə, qiymətsiz) ===== */
function planBlock() {
  return `<div class="plan-card"><div class="plan-tx"><h2 class="h2">Ödəniş planınızı qurun</h2><p class="lead" style="margin-top:8px">İlkin ödənişi və müddəti seçin — qalan məbləğin aylara necə bölündüyünü görün.</p>
    <div class="rng" style="margin-top:20px"><div class="v"><span>İlkin ödəniş</span><b><span id="pdI">50</span>%</b></div><input type="range" id="pdR" min="30" max="90" step="5" value="50" aria-label="İlkin ödəniş faizi"></div>
    <div class="seg" id="pdT" style="margin-top:14px">${TERMS.map((t, i) => `<button type="button" data-m="${t.m}" class="${i ? '' : 'on'}">${t.m} ay${t.s ? '' : ' · 0%'}</button>`).join('')}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px"><a class="btn" href="#elaqe" data-kind="price">Dəqiq hesablama alın ${I.ar}</a></div></div>
    <div class="plan-vz"><div class="pv-bar" id="pdB"></div><div class="pv-leg" id="pdL"></div><p class="mu" id="pdN" style="font-size:13.5px;margin:12px 0 0"></p></div></div>`;
}
function bindPlan(r) {
  const R = $('#pdR', r); if (!R) return; let m = TERMS[0] ? TERMS[0].m : 6;
  const draw = () => { const ip = +R.value, rest = 100 - ip, mon = rest / m; $('#pdI', r).textContent = ip;
    $('#pdB', r).innerHTML = `<i class="pv-d" style="flex:${ip}"><b>${ip}%</b><span>İlkin</span></i>` + Array.from({ length: m }, (_, k) => `<i class="pv-m" style="flex:${mon};animation-delay:${k * (m > 12 ? 18 : 40)}ms"></i>`).join('');
    $('#pdL', r).innerHTML = `<div><span>İlkin ödəniş</span><b>${ip}%</b></div><div><span>Qalan məbləğ</span><b>${rest}%</b></div><div><span>Aylıq</span><b>≈ ${fm2(Math.round(mon * 10) / 10)}%</b></div><div><span>Müddət</span><b>${m} ay</b></div>`;
    const s = SUR(m); $('#pdN', r).textContent = s ? `${m} aylıq variantda m² qiymətinə əlavə tətbiq olunur — satış meneceri dəqiqləşdirəcək.` : `${m} ay ərzində faizsiz — əlavə ödəniş yoxdur.`; };
  R.oninput = draw; $('#pdT', r).onclick = e => { const b = e.target.closest('button'); if (!b) return; m = +b.dataset.m; $$('#pdT button', r).forEach(x => x.classList.toggle('on', x === b)); draw(); }; draw();
}

/* rəqəmlər zolağı */
function numbers() { return [[BLD.length, 'bina'], [NFL, 'mərtəbə'], [2, 'səviyyəli parkinq'], ['7/24', 'mühafizə'], ...(TERMS[0] ? [[TERMS[0].m + ' ay', 'faizsiz ödəniş']] : [])]; }
const numBlock = () => `<section class="sec wrap" style="padding-top:16px"><div class="nzs">${numbers().map(([n, s]) => `<div class="nz"><b>${n}</b><span>${s}</span></div>`).join('')}<a class="nz nz-a" href="#brosur">${I.doc}<span>Broşürü yüklə (PDF)</span></a></div></section>`;

/* render qarmaqları */
function beforeRender() { killMaq(); killCity(); const p = $('#uiP'); if (p) p.remove(); const h = $('#hub'); if (h) h.remove(); }
function afterRender(k, main) {
  pageIn(main); reveal(main); fillQR(main); bindLocTabs(main); bindCity(main); onScroll();
  document.body.classList.toggle('pg-bro', k === 'brosur');
}
// başlıq və altlıq əlavələri
(() => { const fc = $('.fcall'); if (fc) { fc.removeAttribute('data-callback'); fc.dataset.hub = ''; fc.setAttribute('aria-label', 'Satış ofisi ilə əlaqə'); fc.innerHTML = I.chat + '<span>Sual verin</span>'; }
  const mb = $('.mbar [data-callback]'); if (mb) { mb.removeAttribute('data-callback'); mb.dataset.hub = ''; }
  const fcol = $$('#ft .cols > div')[2]; if (fcol) fcol.insertAdjacentHTML('beforeend', '<a href="#brosur">Broşür (PDF)</a>'); })();

/* ===== 3D şəhər xəritəsi (kristal.az/contact üslubunda): MapLibre + OpenFreeMap, tünd göy palitra ===== */
const GEO = (() => { const g = String(SITE_.geo || '').match(/(-?\d+\.\d+)\s*[,; ]\s*(-?\d+\.\d+)/); return g ? [+g[2], +g[1]] : [49.8295, 40.3806]; })(); // [lng, lat]
const PROJ = [
  { id: 'nc', n: 'Nizami City', sub: '«Nizami» metro stansiyası', ic: 'metro', img: '/assets/nc/site/front-1280.webp', ll: GEO, addr: CO.addr, tel: CO.short, href: '#binalar', more: 'Binalara bax' },
  { id: 'lux', n: 'LUX Residence', sub: '«Elmlər Akademiyası» metro stansiyası', ic: 'metro', img: '/assets/og-cover.jpg', ll: [49.81879, 40.36664], addr: 'Ə.Ələkbərov, M.Müşfiq, S.Dağlı, İ.Qutqaşınlı küç. kəsişməsi', href: 'https://luxresidence.az', more: 'luxresidence.az', ext: true },
];
const NEAR = [
  { n: 'Nizami metrosu', c: 'Nəqliyyat', ic: 'metro', ll: [49.83002, 40.37932] },
  { n: 'Nizami Mall', c: 'Alış-veriş', ic: 'bag', ll: [49.83113, 40.37818] },
  { n: 'Caspian Plaza', c: 'Biznes mərkəzi', ic: 'bld', ll: [49.82881, 40.38543] },
  { n: 'Globus Center', c: 'Alış-veriş', ic: 'bag', ll: [49.82802, 40.38519] },
  { n: '18 saylı məktəb', c: 'Təhsil', ic: 'sch', ll: [49.83222, 40.37806] },
  { n: 'Mehdi Hüseynzadə parkı', c: 'İstirahət', ic: 'tree', ll: [49.82672, 40.38720] },
  { n: 'Sevil Qazıyeva parkı', c: 'İstirahət', ic: 'tree', ll: [49.83209, 40.38856] },
];
I.sch = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11v5c3 2 7 2 10 0v-5"/></svg>';
I.loc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="8"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>';
I.chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const hav = (a, b) => { const R = 6371e3, r = Math.PI / 180, dLa = (b[1] - a[1]) * r, dLo = (b[0] - a[0]) * r, x = Math.sin(dLa / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const distT = m => { const w = Math.max(1, Math.round(m * 1.25 / 80)); return (m < 1000 ? '≈ ' + Math.round(m / 10) * 10 + ' m' : '≈ ' + fm2(Math.round(m / 100) / 10) + ' km') + ' · ' + w + ' dəq piyada'; };
const dirUrl = ll => `https://www.google.com/maps/dir/?api=1&destination=${ll[1]},${ll[0]}`;
function cityMap() {
  return `<div class="cmap" id="cmap"><div class="cmap-m" id="cmapM"><div class="mq-load"><i></i><span>Xəritə yüklənir…</span></div></div>
    <aside class="cmap-p"><div class="cmap-h"><h2 id="cmT">Layihələr</h2><label class="cmap-s">${'<input id="cmS" placeholder="Axtar" autocomplete="off" aria-label="Axtar">'}${I.srch}</label></div>
      <div class="cmap-tb" role="tablist"><button type="button" data-t="p" class="on">Layihələr</button><button type="button" data-t="n">Ətraf</button></div>
      <div class="cmap-l" id="cmL"></div></aside>
    <button type="button" class="cmap-b cmap-fs" data-cm="fs" aria-label="Tam ekran">${I.fs}</button>
    <div class="cmap-z"><button type="button" class="cmap-b" data-cm="in" aria-label="Yaxınlaşdır">${I.pl}</button><button type="button" class="cmap-b" data-cm="out" aria-label="Uzaqlaşdır">${I.mi}</button></div>
    <button type="button" class="cmap-b cmap-me" data-cm="me" aria-label="Mənim yerim">${I.loc}</button></div>`;
}
function darkStyle(s) {
  const P = (l, k, v) => { l.paint = l.paint || {}; l.paint[k] = v; };
  s.layers = s.layers.filter(l => !/^boundary|natural_earth|shield|^airport|label_country|label_state|poi_r20|poi_r7/.test(l.id));
  s.layers.forEach(l => {
    const id = l.id;
    if (l.type === 'background') P(l, 'background-color', '#1d2232');
    else if (l.type === 'fill') {
      if (/water/.test(id)) P(l, 'fill-color', '#1a3049');
      else if (/park|grass|wood|wetland|pitch/.test(id)) { P(l, 'fill-color', '#22372f'); P(l, 'fill-opacity', .85); if (l.paint['fill-pattern']) delete l.paint['fill-pattern']; }
      else if (/building/.test(id)) { P(l, 'fill-color', '#272d42'); P(l, 'fill-outline-color', '#272d42'); }
      else if (/road_area/.test(id)) { delete l.paint['fill-pattern']; P(l, 'fill-color', '#2b3144'); }
      else P(l, 'fill-color', '#202638');
    } else if (l.type === 'line') {
      if (/water/.test(id)) P(l, 'line-color', '#1a3049');
      else if (/casing/.test(id)) P(l, 'line-color', '#171b27');
      else if (/rail/.test(id)) P(l, 'line-color', '#363c50');
      else if (/motorway|trunk_primary/.test(id)) P(l, 'line-color', '#4c556f');
      else if (/secondary|tertiary/.test(id)) P(l, 'line-color', '#424a62');
      else if (/path|pedestrian/.test(id)) P(l, 'line-color', '#30364a');
      else P(l, 'line-color', '#393f55');
    } else if (l.type === 'fill-extrusion') {
      P(l, 'fill-extrusion-color', ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 0], 0, '#283049', 30, '#323a5a', 80, '#3e4870']);
      P(l, 'fill-extrusion-opacity', .96);
      l.minzoom = 13;
    } else if (l.type === 'symbol') {
      const poi = /^poi/.test(id);
      P(l, 'text-color', poi ? '#e6a3a3' : /highway|road/.test(id) ? '#8f98ad' : '#c9cfdc');
      P(l, 'text-halo-color', '#151925'); P(l, 'text-halo-width', 1.2);
    }
  });
  return s;
}
let CM = null;
function killCity() { if (CM) { try { CM.remove(); } catch (e) { } CM = null; } }
function bindCity(r) {
  const box = $('#cmap', r); if (!box) return;
  const L = $('#cmL', box), S = $('#cmS', box); let tab = 'p', open = 'nc', mk = {}, you = null;
  const dl = it => it.ll ? distT(hav(GEO, it.ll)) : '';
  const draw = () => {
    const q = S.value.trim().toLowerCase();
    $('#cmT', box).textContent = tab === 'p' ? 'Layihələr' : 'Ətraf';
    if (tab === 'p') L.innerHTML = PROJ.filter(p => !q || p.n.toLowerCase().includes(q)).map(p => `<div class="cmi${open === p.id ? ' op' : ''}" data-id="${p.id}"><button type="button" class="cmi-h"><img src="${p.img}" alt="" loading="lazy"><div><b>${esc(p.n)}</b><span>${I.metro}${esc(p.sub)}</span></div><i>${I.chev}</i></button>
      <div class="cmi-b"><p>${I.pin}${esc(p.addr)}</p>${p.tel ? `<p>${I.ph}<a href="tel:${esc(p.tel)}">${esc(p.tel)}</a></p>` : ''}<div class="cmi-a"><a class="btn sm" href="${dirUrl(p.ll)}" target="_blank" rel="noopener">Marşrut ${I.ar}</a><a class="btn tn sm" href="${p.href}"${p.ext ? ' target="_blank" rel="noopener"' : ''}>${esc(p.more)}</a></div></div></div>`).join('') || '<p class="mu" style="padding:14px 0">Heç nə tapılmadı</p>';
    else L.innerHTML = NEAR.filter(p => !q || (p.n + p.c).toLowerCase().includes(q)).map((p, i) => `<button type="button" class="cmn" data-n="${NEAR.indexOf(p)}"><i>${I[p.ic] || I.pin}</i><div><b>${esc(p.n)}</b><span>${esc(p.c)} · ${dl(p)}</span></div></button>`).join('') || '<p class="mu" style="padding:14px 0">Heç nə tapılmadı</p>';
  };
  draw();
  S.oninput = draw;
  $('.cmap-tb', box).onclick = e => { const b = e.target.closest('button'); if (!b) return; tab = b.dataset.t; $$('.cmap-tb button', box).forEach(x => x.classList.toggle('on', x === b)); draw(); };
  const fly = (ll, z = 16.6) => CM && CM.flyTo({ center: ll, zoom: z, pitch: 60, bearing: -18, speed: .9, essential: true });
  L.onclick = e => {
    const h = e.target.closest('.cmi-h'); if (h) { const id = h.parentElement.dataset.id; open = open === id ? null : id; draw(); const p = PROJ.find(x => x.id === id); if (open) { fly(p.ll); $$('.cm-pk').forEach(m => m.classList.toggle('on', m.dataset.id === id)); } return; }
    const n = e.target.closest('.cmn'); if (n) { const p = NEAR[+n.dataset.n]; fly(p.ll, 17); $$('.cm-pn').forEach(m => m.classList.toggle('on', m.dataset.n === n.dataset.n)); }
  };
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-cm]'); if (!b || !CM) return; const a = b.dataset.cm;
    if (a === 'in') CM.zoomIn(); else if (a === 'out') CM.zoomOut();
    else if (a === 'fs') { if (document.fullscreenElement) document.exitFullscreen(); else if (box.requestFullscreen) box.requestFullscreen().catch(() => box.classList.toggle('cmap-max')); else box.classList.toggle('cmap-max'); setTimeout(() => CM && CM.resize(), 300); }
    else if (a === 'me') {
      if (!navigator.geolocation) return toast('Brauzer yer təyinini dəstəkləmir');
      b.classList.add('busy');
      navigator.geolocation.getCurrentPosition(pos => { b.classList.remove('busy'); const ll = [pos.coords.longitude, pos.coords.latitude];
        if (you) you.remove(); const el = document.createElement('div'); el.className = 'cm-you'; you = new maplibregl.Marker({ element: el }).setLngLat(ll).addTo(CM);
        const bb = new maplibregl.LngLatBounds(ll, ll).extend(GEO); CM.fitBounds(bb, { padding: { top: 80, bottom: 80, left: innerWidth > 900 ? 460 : 60, right: 80 }, pitch: 45, maxZoom: 16 });
        toast(`Nizami City-yə ${distT(hav(ll, GEO)).split(' · ')[0]}`, ['Marşrut', dirUrl(GEO)]); },
      () => { b.classList.remove('busy'); toast('Yerinizi təyin etmək mümkün olmadı'); }, { enableHighAccuracy: true, timeout: 10000 });
    }
  });
  const start = () => {
    $('link#mlcss') || document.head.insertAdjacentHTML('beforeend', '<link id="mlcss" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.min.css">');
    Promise.all([loadJs('https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.min.js'), fetch('https://tiles.openfreemap.org/styles/liberty').then(x => x.json())]).then(([, st]) => {
      if (!document.body.contains(box)) return; killCity();
      const host = $('#cmapM', box), wide = innerWidth > 900;
      CM = new maplibregl.Map({ container: host, style: darkStyle(st), center: GEO, zoom: 15.2, pitch: 58, bearing: -30, attributionControl: false, cooperativeGestures: !wide, maxPitch: 75 });
      if (wide) CM.setPadding({ left: Math.min(460, box.clientWidth * .34), top: 0, right: 0, bottom: 0 });
      CM.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
      if (wide) CM.scrollZoom.disable(), host.addEventListener('wheel', e => { if (e.ctrlKey || e.metaKey || document.fullscreenElement) { CM.scrollZoom.enable(); } else { CM.scrollZoom.disable(); } }, { capture: true, passive: true });
      CM.on('load', () => {
        box.classList.add('ready');
        PROJ.forEach(p => { const el = document.createElement('button'); el.type = 'button'; el.className = 'cm-pk' + (p.id === 'nc' ? ' on' : ''); el.dataset.id = p.id; el.innerHTML = `<div><img src="${p.img}" alt=""><b>${esc(p.n)}</b></div><span>${esc(p.sub.replace(' metro stansiyası', ' metro stansiyası'))}</span>`; el.onclick = () => { open = p.id; tab = 'p'; $$('.cmap-tb button', box).forEach(x => x.classList.toggle('on', x.dataset.t === 'p')); draw(); fly(p.ll); $$('.cm-pk').forEach(m => m.classList.toggle('on', m === el)); }; mk[p.id] = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(p.ll).addTo(CM); });
        NEAR.forEach((p, i) => { const el = document.createElement('button'); el.type = 'button'; el.className = 'cm-pn'; el.dataset.n = i; el.innerHTML = `<i>${I[p.ic] || I.pin}</i><span>${esc(p.n)}</span>`; el.onclick = () => { tab = 'n'; $$('.cmap-tb button', box).forEach(x => x.classList.toggle('on', x.dataset.t === 'n')); draw(); fly(p.ll, 17); $$('.cm-pn').forEach(m => m.classList.toggle('on', m === el)); }; new maplibregl.Marker({ element: el, anchor: 'top' }).setLngLat(p.ll).addTo(CM); });
        if (!NOMO()) CM.easeTo({ zoom: 16.3, bearing: -17, pitch: 62, duration: 3200 });
      });
    }).catch(() => { box.classList.add('cmap-fail'); $('#cmapM', box).innerHTML = `<div class="mq-load"><span>Xəritəni yükləmək mümkün olmadı.</span><a class="btn sm" href="${dirUrl(GEO)}" target="_blank" rel="noopener">Google Maps-də aç</a></div>`; });
  };
  if (!('IntersectionObserver' in window)) return start();
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '300px' }); io.observe(box);
}


/* ===== Mənzil tipləri (LUX məntiqi): kart = plan + otaq·sahə + binalar; mərtəbə/giriş bölgüsü yoxdur ===== */
// Eyni plana düşən mənzillər bir kartdır (məs. 84,40 / 84,42 / 84,57); planı olmayanlar sahə + otaq sayına görə qruplaşır
const tKey = u => { const p = window.ncPlan(u.a, u.b); return p ? 'p' + p.a.toFixed(2) : (+u.a).toFixed(2) + '-' + (u.r || 0); };
const mode = L => { const c = {}; L.forEach(x => c[x] = (c[x] || 0) + 1); return Object.keys(c).sort((a, b) => c[b] - c[a])[0]; };
const TYPES = {};
free.forEach(u => { const k = tKey(u); (TYPES[k] = TYPES[k] || { key: k, units: [] }).units.push(u); });
Object.values(TYPES).forEach(t => {
  t.a = +mode(t.units.map(u => (+u.a).toFixed(2))); t.r = +mode(t.units.map(u => u.r || 0));
  t.blds = [...new Set(t.units.map(u => u.b))].sort();
  t.plan = t.blds.map(b => window.ncPlan(t.a, b)).find(Boolean) || null;
  t.rep = (t.units.find(u => u.st === 'free') || t.units[0]);
  t.conds = [...new Set(t.units.map(u => u.c || condOf(u)))];
  t.nFree = t.units.filter(u => u.st === 'free').length;
  t.pmin = Math.min(...t.units.map(u => u.price || Infinity));
});
const typeOf = u => TYPES[tKey(u)] || { key: tKey(u), a: +u.a, r: u.r, units: [u], blds: [u.b], plan: window.ncPlan(u.a, u.b), rep: u, conds: [u.c || condOf(u)], nFree: u.st === 'free' ? 1 : 0, pmin: u.price };
const uniqT = L => { const s = new Set(), o = []; L.forEach(u => { const t = typeOf(u); if (!s.has(t.key)) { s.add(t.key); o.push(t); } }); return o; };
const tTitle = t => `${roomsT(t.r)} · ${fm2(t.a)} m²`;
const bList = L => L.map(b => 'Bina ' + b).join(', ');
const PLSVG = '<svg viewBox="0 0 120 90" class="tpl-ph" aria-hidden="true"><rect x="8" y="8" width="104" height="74" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><path d="M50 8v30H8M50 56v26M80 38h32M80 38v44M50 38h12" fill="none" stroke="currentColor" stroke-width="3"/></svg>';
function tCard(t, blds) {
  const r = t.rep, bl = blds || t.blds;
  return `<article class="ucard tcard"><a class="ulnk" href="#plan-${t.key}" aria-label="${esc(tTitle(t))}"></a>
    <div class="tpl">${t.plan ? `<img src="${t.plan.img}" alt="${esc(roomsT(t.r))} mənzil planı, ${fm2(t.a)} m²" loading="lazy" decoding="async">` : `${PLSVG}<span>Plan satış ofisində</span>`}</div>
    <div class="uact"><button type="button" class="ub ${isFav(r.id) ? 'on' : ''}" data-fav="${r.id}" aria-label="Seçilmişlərə əlavə et" title="Seçilmişlər">${I.heart}</button><button type="button" class="ub ${isCmp(r.id) ? 'on' : ''}" data-cmp="${r.id}" aria-label="Müqayisəyə əlavə et" title="Müqayisə">${I.cmp}</button></div>
    <div class="tb"><b class="ts">${tTitle(t)}</b><span class="tl">${I.pin}${bList(bl)}</span>
    ${SHOW_STOCK ? `<span class="mu" style="font-size:13.5px">${t.nFree} mənzil satışda</span>` : ''}
    <div class="tf"><span class="pr">${HP ? 'Qiymət sorğu ilə' : fmt(t.pmin) + ' ₼-dan'}</span><span class="lk">Ətraflı ${I.ar}</span></div></div></article>`;
}
function typesGrid(units, filterB) { return uniqT(units).sort((a, b) => a.r - b.r || a.a - b.a).map(t => tCard(t, filterB ? t.blds.filter(b => b === filterB) : null)).join(''); }

pages.tip = key => {
  const t = TYPES[key]; if (!t) return pages.menziller();
  const u = t.rep, url = location.origin + location.pathname + '#plan-' + t.key;
  const sim = Object.values(TYPES).filter(x => x.key !== t.key && x.r === t.r).sort((a, b) => Math.abs(a.a - t.a) - Math.abs(b.a - t.a)).slice(0, 4);
  const msg = `${tTitle(t)} (${bList(t.blds)})`;
  return {
    title: `${roomsT(t.r)} mənzil, ${fm2(t.a)} m² — Nizami City`, html: `<section class="ph wrap">${crumbs(['Mənzillər', 'menziller'], [tTitle(t)])}
      <div class="prn-h"><img src="/assets/nc/logo.png" alt=""><div><b>Nizami City</b><br>${esc(CO.addr)} · ${esc(CO.short)}</div><div class="prn-qr" data-qr="${esc(url)}"></div></div>
      <div class="unit"><div style="display:grid;gap:16px">${t.plan ? planCard({ a: t.a, b: t.plan ? t.blds.find(b => window.ncPlan(t.a, b)) : u.b }) : `<div class="plan"><div class="tpl tpl-big">${PLSVG}<span>Bu mənzilin planını satış ofisi təqdim edir</span></div></div>`}
        <div class="plan"><div class="sh" style="margin-bottom:14px;align-items:center"><h3 class="h3">Binada yerləşmə</h3><span class="mu" style="font-size:14px">${bList(t.blds)}</span></div>${maqHtml('mqU', { sm: true, tour: false })}</div></div>
      <div class="side"><div class="card"><h1 class="h2">${roomsT(t.r)}, ${fm2(t.a)} m²</h1><p class="mu tl" style="margin:8px 0 16px">${I.pin}${bList(t.blds)}</p>
        <div class="prbox"><b>${HP ? 'Qiymət sorğu ilə' : fmt(t.pmin) + ' ₼-dan'}</b></div>
        <div class="kv" style="margin-top:14px">${[['Otaq sayı', t.r], ['Sahə', fm2(t.a) + ' m²'], ['Binalar', t.blds.join(', ')], ['Vəziyyət', t.conds.join(', ')], ...(SHOW_STOCK ? [['Satışda', t.nFree + ' mənzil']] : [])].map(([a, b]) => `<div><span>${a}</span><b>${esc(b)}</b></div>`).join('')}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><a class="btn" href="#lfw">${HP ? 'Qiyməti öyrən' : 'Baxışa yazıl'} ${I.ar}</a><a class="btn tn" href="https://wa.me/${WA()}?text=${encodeURIComponent('Salam! Bu mənzillə maraqlanıram: ' + msg + ' — ' + url)}" target="_blank" rel="noopener">${I.wa} WhatsApp</a><button class="btn tn" type="button" data-callback="${u.id}">${I.ph} Zəng sifarişi</button></div>
        <div class="uacts"><button type="button" class="ua ${isFav(u.id) ? 'on' : ''}" data-fav="${u.id}">${I.heart}<span>Seçilmiş</span></button><button type="button" class="ua ${isCmp(u.id) ? 'on' : ''}" data-cmp="${u.id}">${I.cmp}<span>Müqayisə</span></button><button type="button" class="ua" data-share="${u.id}">${I.share}<span>Paylaş</span></button><button type="button" class="ua" data-print>${I.prn}<span>Çap / PDF</span></button></div></div></div></div></section>
    ${HP ? `<section class="sec wrap">${planBlock()}</section>` : ''}
    <section class="sec wrap" id="lfw">${contactBlock({ title: HP ? 'Bu mənzilin qiyməti' : 'Bu mənzil üzrə sorğu', sub: 'Nömrənizi yazın — satış meneceri qiymət və ödəniş şərtlərini zəng edib desin.', kind: 'price' })}</section>
    ${sim.length ? `<section class="sec wrap"><div class="sh"><h2 class="h2">Oxşar mənzillər</h2></div><div class="ugrid">${sim.map(x => tCard(x)).join('')}</div></section>` : ''}
    ${seenBlock(u.id)}`,
    mount(r) {
      addSeen(u.id); bindLb(r); bindRail(r); bindPlan(r);
      const f = $('#lf', r); if (f) bindForm(f, () => (($('[data-k=kind] .on', f) || {}).dataset || {}).v || 'price', () => { const v = k => (($(`[data-k=${k}] .on`, f) || {}).dataset || {}).v || ''; const k = v('kind') || 'price'; return { unit: u.id, slot: k === 'viewing' ? v('day') + ' ' + v('tm') : '', msg: (k === 'price' ? 'Qiymət sorğusu' : k === 'viewing' ? 'Baxışa yazılış' : 'Zəng sifarişi') + ': ' + msg }; }, d => `${esc(d.name)}, sorğunuz qəbul olundu. Satış meneceri qısa zamanda zəng edəcək.`);
      if (f) { $$('.chips', f).forEach(c => c.addEventListener('click', () => setTimeout(() => $$('.lf-day', f).forEach(d => d.style.display = ((($('[data-k=kind] .on', f) || {}).dataset || {}).v === 'viewing') ? '' : 'none'), 0))); $$('.lf-day', f).forEach(d => d.style.display = ((($('[data-k=kind] .on', f) || {}).dataset || {}).v === 'viewing') ? '' : 'none'); }
      $$('a[href="#lfw"]', r).forEach(a => a.onclick = e => { e.preventDefault(); $('#lfw', r).scrollIntoView({ behavior: 'smooth' }); });
      mountMaq($('#mqU', r), { autoRotate: false, onPick: id => { location.hash = 'bina-' + id; }, homeFn: m => m.focus(t.blds[0]), ready: m => m.focus(t.blds[0]) });
    }
  };
};
pages.menzil = id => { const u = uById(id); return u ? pages.tip(typeOf(u).key) : pages.menziller(); };

render();
