/* Nizami City — sayt v2 (SPA, hash marşrutları). Məlumat: window.NC (data.js), canlı: runtime.js */
const { CO, STAT, UNITS, INFRA, POI, FAQ, TIMELINE, BLOG } = window.NC;
const IMG = window.IMG || {};
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Math.round(+n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fm2 = n => (Math.round((+n || 0) * 100) / 100).toString().replace('.', ',');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const OFF = window.NC_OFF || {};
// Qiymətlər: paneldən «Qiymətləri göstər» yandırılmayıbsa gizlidir — yalnız sorğu ilə
const HP = !(((window.NC_REMOTE || {}).site || {}).showPrice);
if (HP) OFF.kalkulyator = true;
const PRQ = 'Sorğu ilə';
const AR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
const TERMS = (((window.NC_REMOTE || {}).cfg || {}).terms || [{ months: 6, surcharge: 0, enabled: true }, { months: 12, surcharge: 200, enabled: true }]).filter(t => t.enabled !== false && +t.months > 0).map(t => ({ m: +t.months, s: +t.surcharge || 0 })).sort((a, b) => a.m - b.m);
const SUR = m => (TERMS.find(t => t.m === m) || { s: 0 }).s;
const roomsT = r => r ? r + ' otaqlı' : 'Studiya';
const ord = n => { n = Math.abs(Math.round(+n)); const d = n % 10, t = Math.floor(n / 10) % 10; const sf = d ? ['', 'ci', 'ci', 'cü', 'cü', 'ci', 'cı', 'ci', 'ci', 'cu'][d] : t ? ['', 'cu', 'ci', 'cu', 'cı', 'ci', 'cı', 'ci', 'ci', 'cı'][t] : 'cü'; return n + '-' + sf; };
const bLbl = u => 'Bina ' + u.b + (u.ent ? ' · ' + u.ent + '-ci giriş' : '');
const stCls = s => ({ ok: 'st-ok', w: 'st-w', n: 'st-n' }[s] || '');
const stTxt = s => ({ ok: 'Təhvil verilib', w: 'Tikilir · ' + CO.delivery, n: 'Növbəti mərhələ' }[s] || '');
const free = UNITS.filter(u => u.st === 'free');
const minPrice = L => L.length ? Math.min(...L.map(u => u.price)) : 0;

/* ---------- şəkillər ---------- */
const OWN = k => typeof IMG[k] === 'string' && IMG[k].indexOf('/assets/nc/site/' + k + '-') === 0;
function pic(k, alt, o = {}) {
  const src = IMG[k] || k || ''; if (!src) return '';
  const set = OWN(k) ? ` srcset="${src.replace(/-\d+\.webp$/, '-1280.webp')} 1280w, ${src} ${k === 'aerial' ? 2400 : 2560}w" sizes="${o.sizes || '100vw'}"` : '';
  return `<img src="${esc(src)}"${set} alt="${esc(alt || '')}"${o.eager ? ' fetchpriority="high"' : o.lazy === false ? ' decoding="async"' : ' loading="lazy" decoding="async"'}${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''}>`;
}
const lines = (arr, cls = '') => arr.map(t => `<span class="ln ${cls}"><span>${t}</span></span>`).join('');

/* ---------- ortaq bloklar ---------- */
const crumbs = (...a) => `<nav class="crumbs" aria-label="Yol"><a href="#home">Ana səhifə</a>${a.map(([t, h]) => `<span aria-hidden="true">/</span>${h ? `<a href="#${h}">${t}</a>` : `<span>${t}</span>`}`).join('')}</nav>`;
const pHead = (title, sub, paper, extra = '') => `<section class="ph-h w ${paper ? 'paper' : 'f0'}">${crumbs([title])}<div class="row2"><h1 class="d h1" data-r>${title}</h1>${extra}</div>${sub ? `<p class="lead" style="margin-top:28px" data-r>${sub}</p>` : ''}</section>`;
function unitRow(u) {
  return `<a class="row" href="#menzil-${u.id}"><span class="c1"><b>${roomsT(u.r)}, ${fm2(u.a)} m²</b><small class="mu sm">${bLbl(u)} · ${ord(u.f)} mərtəbə</small></span><span class="c2 mu">${bLbl(u)}</span><span class="c3 mu">${ord(u.f)} mərtəbə</span><span class="pr num">${HP ? PRQ : fmt(u.price) + ' ₼'}</span>${AR}</a>`;
}

/* ---------- forma ---------- */
const phoneOk = p => (String(p).replace(/\D/g, '').length >= 9);
function bindForm(f, kind, extra, done) {
  f.onsubmit = e => {
    e.preventDefault(); const d = Object.assign(Object.fromEntries(new FormData(f)), extra ? extra() : {}); let bad = false;
    $$('.err', f).forEach(x => x.textContent = '');
    if ('name' in d && String(d.name).trim().length < 2) { $('[data-e=name]', f).textContent = 'Adınızı yazın'; bad = true; }
    if ('phone' in d && !phoneOk(d.phone)) { $('[data-e=phone]', f).textContent = 'Nömrəni yazın, məsələn 050 700 00 88'; bad = true; }
    if (bad) return;
    window.ncLead && window.ncLead(kind, d);
    f.outerHTML = `<div class="done" role="status"><b>Sorğunuz qəbul olundu</b><p class="p">${done ? done(d) : 'Satış meneceri qısa zamanda sizə zəng edəcək.'}</p></div>`;
  };
}
const DAYS = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];
const MON = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
function visitForm(unit) {
  const days = []; for (let i = 1, d = new Date(); days.length < 6; i++) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i); if (x.getDay() !== 0) days.push(x); }
  return `<form class="frm" id="vf" novalidate>
    <div class="fld"><label for="vfN">Adınız</label><input class="in" id="vfN" name="name" autocomplete="name"><div class="err" data-e="name"></div></div>
    <div class="fld"><label for="vfP">Telefon</label><input class="in" id="vfP" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="050 000 00 00"><div class="err" data-e="phone"></div></div>
    <div class="fld"><span>Gün</span><div class="chips" data-k="day">${days.map((x, i) => `<button type="button" data-v="${x.toISOString().slice(0, 10)}" class="${i ? '' : 'on'}">${x.getDate()} ${MON[x.getMonth()].slice(0, 3)}<small>${DAYS[x.getDay()]}</small></button>`).join('')}</div></div>
    <div class="fld"><span>Saat</span><div class="chips" data-k="time">${['10:00', '11:30', '13:00', '15:00', '16:30'].map((t, i) => `<button type="button" data-v="${t}" class="${i === 1 ? 'on' : ''}">${t}</button>`).join('')}</div></div>
    ${unit ? `<input type="hidden" name="unit" value="${esc(unit)}">` : ''}
    <div><button class="btn" type="submit">Baxışa yazıl ${AR}</button></div>
  </form>`;
}
function bindVisit(root, unit) {
  const f = $('#vf', root); if (!f) return;
  $$('.chips', f).forEach(c => c.onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('button', c).forEach(x => x.classList.toggle('on', x === b)); });
  bindForm(f, 'viewing', () => ({ slot: ($('[data-k=day] .on', f) || {}).dataset?.v + ' ' + ($('[data-k=time] .on', f) || {}).dataset?.v }), d => `${esc(d.name)}, ${esc(d.slot)} üçün baxış qeydə alındı. Menecer vaxtı zənglə təsdiqləyəcək.`);
}

/* ---------- kalkulyator (ortaq) ---------- */
function calcBlock(o = {}) {
  const u = o.unit;
  return `<div class="calc" id="cc" data-area="${u ? u.a : 100}" data-ppm="${u ? u.ppm : CO.priceFrom}">
    ${u ? '' : `<div class="rng"><div class="v"><span>Sahə</span><b class="num"><span id="ccAv"></span> m²</b></div><input type="range" id="ccA" min="40" max="220" step="1" value="100" aria-label="Sahə"></div>
    <div class="rng"><div class="v"><span>1 m² qiyməti</span><b class="num"><span id="ccPv"></span> ₼</b></div><input type="range" id="ccP" min="${CO.priceFrom}" max="${Math.max(CO.priceFrom + 600, 4500)}" step="50" value="${CO.priceFrom}" aria-label="1 m² qiyməti"></div>`}
    <div class="rng"><div class="v"><span>İlkin ödəniş</span><b class="num"><span id="ccIv"></span>%</b></div><input type="range" id="ccI" min="30" max="90" step="5" value="50" aria-label="İlkin ödəniş"></div>
    <div class="fld"><span>Müddət</span><div class="seg" id="ccT">${TERMS.map((t, i) => `<button type="button" data-m="${t.m}" class="${i ? '' : 'on'}">${t.m} ay</button>`).join('')}<button type="button" data-m="0">Nağd</button></div></div>
    <div class="out" aria-live="polite"><span id="ccL">Aylıq ödəniş</span><div class="mon"><b class="num" id="ccM">0</b><span id="ccU">₼ / ay</span></div>
      <dl><dt>Mənzilin dəyəri</dt><dd class="num" id="ccTot"></dd><dt>İlkin ödəniş</dt><dd class="num" id="ccD"></dd><dt>1 m² (müddətə görə)</dt><dd class="num" id="ccE"></dd></dl>
      <p class="note" id="ccN"></p>${o.sched ? `<details class="sched"><summary class="lk" style="cursor:pointer">Ödəniş qrafiki</summary><div id="ccS"></div></details>` : ''}</div>
  </div>`;
}
function bindCalc(root) {
  const c = $('#cc', root); if (!c) return;
  const st = { a: +c.dataset.area, p: +c.dataset.ppm, i: 50, m: TERMS[0] ? TERMS[0].m : 6 };
  const pct = el => el && el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%');
  const draw = () => {
    const s = st.m ? SUR(st.m) : 0, e = st.p + s, tot = st.a * e, d = st.m ? tot * st.i / 100 : tot, mon = st.m ? (tot - d) / st.m : 0;
    if ($('#ccAv', c)) { $('#ccAv', c).textContent = st.a; $('#ccPv', c).textContent = fmt(st.p); }
    $('#ccIv', c).textContent = st.i; $$('input[type=range]', c).forEach(pct);
    $('#ccL', c).textContent = st.m ? 'Aylıq ödəniş' : 'Ümumi məbləğ'; $('#ccU', c).textContent = st.m ? '₼ / ay' : '₼';
    tween($('#ccM', c), st.m ? mon : tot); $('#ccTot', c).textContent = fmt(tot) + ' ₼'; $('#ccD', c).textContent = fmt(d) + ' ₼'; $('#ccE', c).textContent = fmt(e) + ' ₼';
    $('#ccN', c).textContent = st.m ? (s ? `${st.m} ay üçün 1 m² qiymətinə ${s} ₼ əlavə olunur.` : `${st.m} ay faizsiz: qiymət dəyişmir.`) + ' Yekun şərtləri satış ofisi təsdiqləyir.' : 'Nağd ödənişdə qiymət dəyişmir.';
    $('#ccI', c).closest('.rng').style.display = st.m ? '' : 'none';
    const S = $('#ccS', c); if (S) { if (!st.m) S.innerHTML = '<p class="note">Nağd ödənişdə qrafik yoxdur.</p>'; else { let bal = tot - d, r = `<tr><td>İlkin</td><td>${fmt(d)}</td><td>${fmt(bal)}</td></tr>`; for (let k = 1; k <= st.m; k++) { bal -= mon; r += `<tr><td>${ord(k)} ay</td><td>${fmt(mon)}</td><td>${fmt(Math.max(0, bal))}</td></tr>`; } S.innerHTML = `<table><thead><tr><th>Dövr</th><th>Ödəniş, ₼</th><th>Qalıq, ₼</th></tr></thead><tbody>${r}</tbody></table>`; } }
  };
  const on = (id, k) => { const el = $(id, c); if (el) el.oninput = () => { st[k] = +el.value; draw(); }; };
  on('#ccA', 'a'); on('#ccP', 'p'); on('#ccI', 'i');
  $('#ccT', c).onclick = e => { const b = e.target.closest('button'); if (!b) return; st.m = +b.dataset.m; $$('#ccT button', c).forEach(x => x.classList.toggle('on', x === b)); draw(); };
  draw();
}
function tween(el, to) { const from = +(el.dataset.v || 0); el.dataset.v = to; if (RM || !window.gsap) { el.textContent = fmt(to); return; } const o = { v: from }; gsap.to(o, { v: to, duration: .7, ease: 'power3.out', onUpdate: () => el.textContent = fmt(o.v) }); }

/* ---------- qiymət sorğusu (qiymətlər gizli olanda) ---------- */
function priceBlock(u) {
  return `<div class="visit"><div class="info"><h2 class="d h2">${lines(u ? ['Bu mənzilin', 'qiyməti'] : ['Qiyməti', 'öyrənin'])}</h2>
    <p class="lead" data-r>${u ? 'Nömrənizi yazın — satış meneceri bu mənzilin qiymətini və ödəniş şərtlərini sizə zəng edib desin.' : 'Qiymət mənzilin binasından, mərtəbəsindən və vəziyyətindən asılıdır. Nömrənizi yazın — satış meneceri sizə uyğun mənzilləri və qiymətləri desin.'}</p>
    <p class="p" data-r>${TERMS.length ? TERMS[0].m + ' ay faizsiz daxili kredit' + (TERMS.length > 1 ? ', ' + TERMS.slice(1).map(t => t.m).join(' və ') + ' ay müddətinə də' : '') + ' mümkündür. ' : ''}Zəng: <a href="tel:${esc(CO.short)}">${esc(CO.short)}</a></p></div>
    <div data-r><form class="frm" id="pqf" novalidate>
      <div class="fld"><label for="pqN">Adınız</label><input class="in" id="pqN" name="name" autocomplete="name"><div class="err" data-e="name"></div></div>
      <div class="fld"><label for="pqP">Telefon</label><input class="in" id="pqP" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="050 000 00 00"><div class="err" data-e="phone"></div></div>
      ${u ? `<input type="hidden" name="unit" value="${esc(u.id)}">` : `<div class="fld"><span>Neçə otaq?</span><div class="chips" data-k="r">${['1', '2', '3', '4+'].map((t, i) => `<button type="button" data-v="${t}" class="${i === 1 ? 'on' : ''}">${t} otaq</button>`).join('')}</div></div>`}
      <div><button class="btn" type="submit">Qiyməti öyrən ${AR}</button></div></form></div></div>`;
}
function bindPrice(root, u) {
  const f = $('#pqf', root); if (!f) return;
  $$('.chips', f).forEach(c => c.onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('button', c).forEach(x => x.classList.toggle('on', x === b)); });
  bindForm(f, 'price', () => u ? { msg: 'Qiymət sorğusu: ' + bLbl(u) + ', ' + ord(u.f) + ' mərtəbə, ' + roomsT(u.r) + ', ' + fm2(u.a) + ' m²' } : { msg: 'Qiymət sorğusu: ' + (($('[data-k=r] .on', f) || {}).dataset || {}).v + ' otaqlı' }, d => `${esc(d.name)}, sorğunuz qəbul olundu. Satış meneceri qısa zamanda zəng edib qiyməti deyəcək.`);
}

/* ---------- mənzil seçici ---------- */
const SELST = { r: 0, ph: 'all' };
function selBlock() {
  return `<div class="sel">
    <div><h2 class="d h2">${lines(['Neçə otaq', 'lazımdır?'])}</h2>
      <p class="p" data-r>Seçin — satışda olan real mənzilləri, qiymət və aylıq ödənişi dərhal görəcəksiniz.</p>
      <div class="grp" data-r><span>Otaq sayı</span><div class="seg" id="sR">${[[0, 'Hamısı'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']].map(([v, t]) => `<button type="button" data-v="${v}" class="${SELST.r === v ? 'on' : ''}">${t}</button>`).join('')}</div></div>
      <div class="grp" data-r><span>Bina</span><div class="seg" id="sP">${[['all', 'Hamısı'], ['ok', 'Hazır'], ['w', 'Tikilən']].map(([v, t]) => `<button type="button" data-v="${v}" class="${SELST.ph === v ? 'on' : ''}">${t}</button>`).join('')}</div></div>
    </div>
    <div class="res" id="sRes" aria-live="polite"></div></div>`;
}
function bindSel(root) {
  const R = $('#sRes', root); if (!R) return;
  const draw = () => {
    const L = free.filter(u => (!SELST.r || (SELST.r === 4 ? u.r >= 4 : u.r === SELST.r)) && (SELST.ph === 'all' || u.bst === SELST.ph)).sort((a, b) => a.price - b.price);
    if (!L.length) { R.innerHTML = `<div class="big"><b class="num">0</b><span>mənzil hazırda satışda deyil</span></div><p class="p">Bu seçim üzrə yeni mənzil satışa çıxanda sizə zəng edək.</p><div><a class="btn" href="#elaqe">Sorğu göndər ${AR}</a></div>`; return; }
    const a0 = Math.min(...L.map(u => u.a)), a1 = Math.max(...L.map(u => u.a)), p0 = minPrice(L), t = TERMS[0];
    const cheap = L[0], mon = t ? cheap.a * (cheap.ppm + t.s) / 2 / t.m : 0;
    R.innerHTML = `<div class="big"><b class="num" id="sN">${L.length}</b><span>mənzil<br>satışda</span></div>
      <div class="ln2"><div><small>Sahə</small>${fm2(a0)}–${fm2(a1)} m²</div>${HP ? `<div><small>Qiymət</small>sorğu ilə</div>${t ? `<div><small>Ödəniş</small>${t.m} ay faizsiz daxili kredit</div>` : ''}` : `<div><small>Qiymət</small>${fmt(p0)} ₼-dən</div>${t ? `<div><small>50% ilkin, ${t.m} ay${t.s ? '' : ' faizsiz'}</small>ayda ${fmt(mon)} ₼-dən</div>` : ''}`}</div>
      <div class="rows">${L.slice(0, 4).map(unitRow).join('')}</div>
      <div><a class="btn ol" href="#menziller" id="sAll">Bütün ${L.length} mənzil ${AR}</a></div>`;
    $('#sAll', R).onclick = () => { resetF(); F.r = SELST.r; F.ph = SELST.ph; };
    if (window.gsap && !RM) gsap.from($$('.row', R), { y: 16, opacity: 0, stagger: .06, duration: .6, ease: 'power3.out' });
  };
  [['#sR', 'r', Number], ['#sP', 'ph', String]].forEach(([id, k, cv]) => $(id, root).onclick = e => { const b = e.target.closest('button'); if (!b) return; SELST[k] = cv(b.dataset.v); $$(id + ' button', root).forEach(x => x.classList.toggle('on', x === b)); draw(); });
  draw();
}

/* ---------- 3D baş plan ---------- */
let MQ = null;
function mpBlock(full) {
  const B = window.NC_BLD;
  return `<div class="mp-h"><div><h2 class="d h2">${lines(full ? ['Baş plan'] : ['Binanı', 'seçin'])}</h2><p class="p" data-r>Modeli barmaqla və ya siçanla fırladın. Binanın üzərinə toxunun — mərtəbələr və satışdakı mənzillər açılacaq.</p></div>
    <div class="tabs" role="tablist" data-r><button type="button" role="tab" class="on" data-v="3d" aria-selected="true">3D baş plan</button><button type="button" role="tab" data-v="iso" aria-selected="false">Hazır binalar</button></div></div>
    <div class="mp"><div class="stage" id="stg">
      <div class="v" id="v3d"><div class="tip3" id="tip3"></div>
        <div class="lg"><span><i class="st-ok"></i>Təhvil verilib</span><span><i class="st-w"></i>Tikilir · ${esc(CO.delivery)}</span></div>
        <div class="zm"><button type="button" aria-label="Yaxınlaşdır" data-z=".86">+</button><button type="button" aria-label="Uzaqlaşdır" data-z="1.16">−</button></div></div>
      <div class="v off iso" id="viso"><div class="card" id="isoC">${pic('aerial', 'Hazır binaların 3D vizualı: qapalı həyət, uşaq meydançası və kommersiya qalereyası', { sizes: '(max-width:980px) 92vw, 66vw' })}
        <button type="button" class="hs" style="left:47%;top:58%"><i></i><span>Qapalı həyət və uşaq meydançası</span></button>
        <button type="button" class="hs" style="left:47%;top:79%"><i></i><span>Kommersiya qalereyası</span></button>
        <button type="button" class="hs" style="left:56%;top:85%"><i></i><span>Həyətə və parkinqə giriş</span></button>
        <button type="button" class="hs" style="left:20%;top:62%"><i></i><span>Küçəyə açılan vitrinlər</span></button></div>
        <span class="cap">Hazır binalar — 3D vizual</span></div>
    </div>
    <div class="blist" id="blist">${B.map(b => { const fr = free.filter(u => u.b === b.id).length; return `<a href="#bina-${b.id}" data-b="${b.id}"><i class="${stCls(b.st)}"></i><b>${b.id}</b><span>${stTxt(b.st)}</span><em class="num">${b.st === 'n' ? 'Sorğu' : fr + ' satışda'}</em></a>`; }).join('')}</div></div>`;
}
function bindMp(root) {
  const host = $('#v3d', root); if (!host) return;
  const start = () => {
    if (MQ || !window.THREE || !window.ncMaquette) return !!MQ;
    MQ = window.ncMaquette(host, { labels: true, tip: $('#tip3', root), tipHtml: b => { const fr = free.filter(u => u.b === b.id).length; return `<b>Bina ${b.id}</b>${stTxt(b.st)}${b.st !== 'n' ? ' · ' + fr + ' mənzil satışda' : ''}`; }, onPick: id => { location.hash = 'bina-' + id; }, onHover: id => $$('#blist a', root).forEach(a => a.classList.toggle('on', a.dataset.b === id)) });
    if (!MQ) host.innerHTML = pic('aerial', 'Nizami City 3D vizualı', { style: 'width:100%;height:100%;object-fit:contain;padding:4%' });
    return true;
  };
  if (!start()) { const w = setInterval(() => { if (start() || !document.body.contains(host)) clearInterval(w); }, 250); setTimeout(() => clearInterval(w), 9000); }
  $$('[data-z]', root).forEach(b => b.onclick = () => MQ && MQ.zoom(+b.dataset.z));
  $$('#blist a', root).forEach(a => { a.onmouseenter = () => MQ && MQ.select(a.dataset.b); a.onmouseleave = () => MQ && MQ.select(null); });
  $$('.tabs button', root).forEach(b => b.onclick = () => { const v = b.dataset.v; $$('.tabs button', root).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); $('#v3d', root).classList.toggle('off', v !== '3d'); $('#viso', root).classList.toggle('off', v !== 'iso'); });
  const card = $('#isoC', root), stg = $('#stg', root);
  if (card && !RM && matchMedia('(pointer:fine)').matches) {
    stg.addEventListener('pointermove', e => { if ($('#viso', root).classList.contains('off')) return; const r = stg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; card.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`; });
    stg.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }
  $$('.hs', root).forEach(h => h.onclick = () => { $$('.hs', root).forEach(x => x.classList.toggle('on', x === h && !x.classList.contains('on'))); });
}

/* ---------- imza səhnəsi: hazır binalar 3D vizualı scroll ilə açılır ---------- */
const sceneBlock = () => `<section class="scn f0" id="scn"><div class="scn-in">
  <div class="scn-t w"><h2 class="d h2">${lines(['Hazır binalar,', 'açar təhvil'])}</h2><p class="p" data-r>A, B və C binaları tikilib və təhvil verilib. Mənzilə bu gün baxıb, müqavilədən sonra açarı dərhal ala bilərsiniz.</p><div data-r><a class="lk" href="#menziller" id="scnL">Hazır binalarda mənzillər ${AR}</a></div></div>
  <div class="scn-v"><div class="scn-c" id="scnC">${pic('aerial', 'Hazır binaların 3D vizualı: qapalı həyət, uşaq meydançası, kommersiya qalereyası', { sizes: '(max-width:860px) 100vw, 70vw', lazy: false })}
    <span class="hs on" style="left:47%;top:58%"><i></i><span>Qapalı həyət</span></span>
    <span class="hs on" style="left:45%;top:80%"><i></i><span>Kommersiya qalereyası</span></span>
    <span class="hs on" style="left:57%;top:88%"><i></i><span>Parkinqə giriş</span></span></div></div>
</div></section>`;
function bindScene(root) {
  const sc = $('#scn', root); if (!sc) return;
  const l = $('#scnL', sc); if (l) l.onclick = () => { resetF(); F.ph = 'ok'; };
  if (!window.gsap || !window.ScrollTrigger || RM) { sc.classList.add('static'); return; }
  const c = $('#scnC', sc), hs = $$('.hs', sc);
  gsap.set(hs, { opacity: 0, scale: .6 });
  gsap.timeline({ scrollTrigger: { trigger: sc, start: 'top top', end: 'bottom bottom', scrub: .8 } })
    .fromTo(c, { rotateX: 62, rotateZ: -24, scale: .62, yPercent: 18, opacity: .35 }, { rotateX: 0, rotateZ: 0, scale: 1, yPercent: 0, opacity: 1, ease: 'power2.out', duration: 1 })
    .to(hs, { opacity: 1, scale: 1, stagger: .08, duration: .25 }, '>-.05')
    .to({}, { duration: .25 });
}
/* ---------- üstünlüklər, rəqəmlər, məkan, bloq, suallar, əlaqə ---------- */
const FEAT = [
  ['aerial_c', 'Qapalı həyət', 'Həyətə yalnız sakinlər daxil olur. Mərkəzdə avtomobil girməyən meydan, uşaq meydançası və kölgəli oturacaqlar var.', 'Binalar və həyətə giriş portalı'],
  ['street', 'Küçəyə açılan qalereya', 'Birinci mərtəbələrdə supermarket, aptek, kafe və xidmətlər. Gündəlik ehtiyaclar evdən çıxmadan həll olunur.', 'Kommersiya mərtəbəsi və uzun fasad'],
  ['tower_r', 'Uzunömürlü fasad', 'Krem keramoqranit və kərpic panellər. İllər keçsə də təzə görünür, baxımı asandır.', 'Fasad: keramoqranit və kərpic'],
  ['entrance', 'Parkinq və təhlükəsizlik', 'İki səviyyəli yeraltı parkinq, kodlu giriş, kameralar, 7/24 mühafizə və generator.', 'Parkinqə eniş və terras'],
];
const featBlock = () => `<div class="ft-h"><h2 class="d h2">${lines(['Şəhərin', 'içində sakit', 'həyat'])}</h2></div>
  ${FEAT.map(([k, t, p, alt]) => `<div class="frow"><div class="tx"><h3 class="d h3" data-r>${t}</h3><p class="p" data-r>${p}</p></div><figure class="clip" data-par>${pic(k, alt, { sizes: '(max-width:860px) 92vw, 30vw' })}</figure></div>`).join('')}`;
const statBlock = () => `<section class="stat" data-ncs>${pic('corner', 'Nizami City: künc bina və həyət binaları', { cls: 'par' })}<div class="hero-s"></div>
  <h2>Ərazi</h2><div class="fg"><b class="num" data-r>2,87 ha</b><p data-r>Yasamalın mərkəzində altı bina, iki səviyyəli parkinq və bir qapalı həyət üçün ayrılmış məhəllə.</p></div></section>
  <div class="subst w f0"><div data-r><b>1–4</b><span>otaqlı mənzillər</span></div><div data-r><b>${window.NC_FLOORS || 10}</b><span>yaşayış mərtəbəsi</span></div><div data-r><b>6</b><span>bina, iki mərhələ</span></div></div>`;
const MAPQ = encodeURIComponent('Nizami City, Cəfər Cabbarlı 31, Bakı');
const locBlock = (h = 'h2') => `<div class="loc"><div class="map" data-r><iframe title="Xəritə: Nizami City" loading="lazy" src="https://maps.google.com/maps?q=${MAPQ}&z=15&output=embed" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
  <div><${h} class="d h2">${lines(['Hər şey', 'yaxındadır'])}</${h}><p class="p" style="margin:-16px 0 36px" data-r>${esc(CO.addr)}</p>
  <ul class="poi">${POI.map(p => `<li data-r><b>${esc(p.n)}</b><span>${esc(p.c)}</span><p>${esc(p.d)}</p></li>`).join('')}</ul></div></div>`;
const posts = () => BLOG.slice().sort((a, b) => String(b.d).localeCompare(String(a.d)));
const dfmt = s => { const d = new Date(s); return isNaN(d) ? esc(s) : `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
const postRow = p => `<a class="post" href="#bloq-${esc(p.id)}"><figure>${p.img ? pic(p.img, '', { sizes: '200px' }) : ''}</figure><div><h3>${esc(p.t)}</h3><span>${esc(p.c)} · ${dfmt(p.d)}${p.m ? ' · ' + p.m + ' dəq' : ''}</span></div>${AR}</a>`;
const faqList = (L) => `<div class="qa">${L.map(([q, a], i) => `<details data-r${i ? '' : ' open'}><summary>${esc(q)}<i aria-hidden="true"></i></summary><div class="an">${esc(a)}</div></details>`).join('')}</div>`;
const infoDl = () => `<dl><dt>Ünvan</dt><dd>${esc(CO.addr)}</dd><dt>İş saatları</dt><dd>${esc(CO.hours)}</dd><dt>Telefon</dt><dd><a href="tel:${esc(CO.short)}">${esc(CO.short)}</a>${(CO.phones || []).map((p, i) => ` · <a href="tel:${esc((CO.tel || [])[i] || p)}">${esc(p)}</a>`).join('')}</dd>${CO.email ? `<dt>Email</dt><dd><a href="mailto:${esc(CO.email)}">${esc(CO.email)}</a></dd>` : ''}</dl>`;
const faqBlock = (n) => `<div class="faq"><div class="side"><h2 class="d h2">${lines(['Suallar', 'və cavablar'])}</h2><div data-r class="visit"><div class="info" style="grid-column:1/-1">${infoDl()}</div></div></div>${faqList(n ? FAQ.slice(0, n) : FAQ)}</div>`;
const visitBlock = (unit) => `<div class="visit"><div class="info"><h2 class="d h2">${lines(['Baxışa', 'gəlin'])}</h2><p class="lead" data-r>Gün və saat seçin — menecer sizi satış ofisində qarşılayıb hazır və tikilən binaları göstərəcək.</p><div data-r>${infoDl()}</div></div><div data-r>${visitForm(unit)}</div></div>`;

/* ---------- SƏHİFƏLƏR ---------- */
const pages = {};
pages.home = () => {
  const t = TERMS[0];
  return {
    title: 'Nizami City — Yasamalda qapalı həyətli yaşayış kompleksi', dark: true, html: `
  <section class="hero" id="hero"><div class="hero-m">${pic('front', 'Nizami City: küçə fasadı və həyətə giriş portalı', { eager: true })}</div><div class="hero-s t"></div><div class="hero-s"></div>
    <div class="hero-c"><div class="hero-row"><div class="hero-l"><p class="lead hx">Yasamalda, Nizami metrosunun yanında: altı bina və avtomobilsiz qapalı həyət.</p>
      <div class="hero-act hx"><a class="btn" href="#menziller">Mənzil seç ${AR}</a><a class="lk" href="#visit">Baxışa yazıl</a></div></div>
      <div class="hero-f hx">${HP ? `<b>${t ? t.m + ' ay faizsiz' : 'Daxili kredit'}</b><span>daxili kredit · qiymət sorğu ilə</span>` : `<b class="num">${fmt(CO.priceFrom)} ₼/m²-dən</b><span>${t ? '50% ilkin ödənişlə ' + t.m + ' ay faizsiz' : 'daxili kredit'}</span>`}</div></div>
      <h1 class="d hero-t"><span class="ln"><span>Nizami</span></span><span class="ln"><span>City</span></span></h1></div></section>
  <section class="sec w paper"><div class="intro"><h2 class="d h2">${lines(['Altı bina,', 'bir həyət'])}</h2>
    <div class="ph clip">${pic('tower_l', 'Nizami City: künc bina, kommersiya mərtəbəsi', { cls: 'par', sizes: '(max-width:860px) 80vw, 42vw' })}</div>
    <div class="tx"><p class="lead" data-r>Binalar məhəllənin perimetri boyunca düzülüb. Mərkəzdə avtomobil girməyən həyət qalır — maşınlar iki səviyyəli yeraltı parkinqdədir.</p><p class="p" data-r>${esc(CO.addr)}. Hazır binalarda açarı dərhal təhvil alırsınız, tikilən binalarda qiymət daha sərfəlidir.</p><div data-r><a class="lk" href="#binalar">Baş plana bax ${AR}</a></div></div>
    <div class="facts"><div data-r><b class="num">6</b><span>bina</span></div><div data-r><b class="num">${window.NC_FLOORS || 10}</b><span>mərtəbə</span></div><div data-r><b class="num">${free.length}</b><span>mənzil indi satışda</span></div><div data-r><b class="num">${CO.delivery}</b><span>tikilən binaların təhvili</span></div></div></div></section>
  ${sceneBlock()}
  <section class="sec w f1">${mpBlock()}</section>
  <section class="sec w paper">${selBlock()}</section>
  <section class="sec w f0">${featBlock()}</section>
  ${statBlock()}
  ${HP ? `<section class="sec w paper" id="prq">${priceBlock()}</section>` : ''}${HP ? '' : `<section class="sec w paper"><div class="pay"><div class="tx"><h2 class="d h2">${lines(['Ödənişi', 'özünüz qurun'])}</h2><p class="lead" data-r>${TERMS.map(t => t.m + ' ay' + (t.s ? ' (+' + t.s + ' ₼/m²)' : ' faizsiz')).join(', ')} daxili kredit və ya ipoteka.</p><div data-r><a class="lk" href="#kalkulyator">Ətraflı kalkulyator ${AR}</a></div></div>${calcBlock()}</div></section>`}
  <section class="sec w f1">${locBlock()}</section>
  ${OFF.bloq || !BLOG.length ? '' : `<section class="sec w paper"><div class="bl-h"><h2 class="d h2">${lines(['Bloq'])}</h2><a class="lk" href="#bloq" data-r>Bütün yazılar ${AR}</a></div><div class="posts">${posts().slice(0, 3).map(postRow).join('')}</div></section>`}
  <section class="sec w f0">${faqBlock(6)}</section>
  <section class="sec w paper" id="visit">${visitBlock()}</section>`,
    mount(root) { bindScene(root); bindMp(root); bindSel(root); bindCalc(root); bindPrice(root); bindVisit(root); }
  };
};
pages.binalar = () => ({
  title: 'Binalar — Nizami City', html: `<section class="w f1" style="padding-top:calc(var(--hd) + clamp(48px,6vw,96px));padding-bottom:var(--gap)">${crumbs(['Binalar'])}${mpBlock(true)}</section>
  <section class="sec w paper"><h2 class="d h2" style="margin-bottom:56px">${lines(['Mərhələlər'])}</h2><div class="rows">${TIMELINE.map(([a, b, c, s]) => `<div class="row" style="grid-template-columns:1fr 1.2fr 2fr;min-height:96px;cursor:default" data-r><b class="d h3">${esc(a)}</b><span><span class="pill"><i class="${stCls(s)}"></i>${esc(b)}</span></span><span class="mu">${esc(c)}</span></div>`).join('')}</div></section>`,
  mount(root) { bindMp(root); }
});
pages.bina = id => {
  const b = window.NC_BLD.find(x => x.id === id); if (!b) return pages.binalar();
  const us = UNITS.filter(u => u.b === id), fr = us.filter(u => u.st === 'free');
  if (b.st === 'n' || !us.length) return {
    title: `Bina ${id} — Nizami City`, html: `${pHead('Bina ' + id, b.st === 'n' ? 'Bu bina növbəti mərhələyə daxildir. Satış başlayanda ilk xəbər tutanlardan olun.' : 'Bu binanın mənzilləri hazırda saytda göstərilmir. Satış ofisindən məlumat alın.', true)}
      <section class="sec w paper" style="padding-top:0"><div class="split"><form class="frm" id="wl" novalidate><div class="fld"><label for="wlN">Adınız</label><input class="in" id="wlN" name="name" autocomplete="name"><div class="err" data-e="name"></div></div><div class="fld"><label for="wlP">Telefon</label><input class="in" id="wlP" name="phone" type="tel" inputmode="tel" autocomplete="tel"><div class="err" data-e="phone"></div></div><div><button class="btn">Gözləmə siyahısına yazıl ${AR}</button></div></form><div class="plate">${pic('aerial', 'Nizami City 3D vizualı')}</div></div></section>`,
    mount(root) { bindForm($('#wl', root), 'waitlist-' + id, null, () => `Bina ${id} üzrə satış başlayanda sizə zəng edəcəyik.`); }
  };
  const fls = [...new Set(us.map(u => u.f))].sort((a, b) => b - a);
  let fl = +(sessionStorage_get('nc_fl_' + id) || 0); if (!fls.includes(fl)) fl = (fls.find(f => us.some(u => u.f === f && u.st === 'free')) || fls[0]);
  return {
    title: `Bina ${id} — Nizami City`, html: `<section class="ph-h w paper">${crumbs(['Binalar', 'binalar'], ['Bina ' + id])}<div class="row2"><h1 class="d h1">${lines(['Bina ' + id])}</h1>
      <div class="facts" style="margin:0;grid-template-columns:repeat(3,auto);gap:40px"><div data-r><b class="num">${fls.length}</b><span>mərtəbə</span></div><div data-r><b class="num">${fr.length}</b><span>satışda</span></div><div data-r><b class="num">${b.st === 'ok' ? 'Hazır' : esc(CO.delivery)}</b><span>${b.st === 'ok' ? 'təhvil verilib' : 'təhvil'}</span></div></div></div></section>
    <section class="w paper" style="padding-bottom:var(--gap)"><div class="bgrid"><div class="floors" role="listbox" aria-label="Mərtəbələr">${fls.map(f => { const fu = us.filter(u => u.f === f); return `<button type="button" data-f="${f}" class="${f === fl ? 'on' : ''}"><b>${f}</b><span>${f === 1 ? 'Aşağı mərtəbə' : 'mərtəbə'}</span><em>${fu.filter(u => u.st === 'free').length} satışda</em></button>`; }).join('')}</div>
      <div><div class="cnt"><h2 class="d h3" id="flT"></h2><span class="mu sm"><span class="pill"><i class="st-w"></i>Bron</span> &nbsp; Satılmış mənzillər solğun göstərilir</span></div><div class="units" id="uGrid"></div></div></div></section>`,
    mount(root) {
      const draw = f => { fl = f; sessionStorage_set('nc_fl_' + id, f); $$('.floors button', root).forEach(x => x.classList.toggle('on', +x.dataset.f === f)); $('#flT', root).textContent = ord(f) + ' mərtəbə';
        $('#uGrid', root).innerHTML = us.filter(u => u.f === f).map(u => `<a class="ub ${u.st}" href="#menzil-${u.id}"${u.st === 'sold' ? ' aria-disabled="true" tabindex="-1"' : ''}><span class="mu sm">${u.ent ? u.ent + '-ci giriş · ' : ''}№ ${u.f}.${u.n}</span><b class="num">${fm2(u.a)} m²</b><span>${roomsT(u.r)}${u.c ? ' · ' + esc(u.c) : ''}</span><strong class="num">${u.st === 'sold' ? 'Satılıb' : HP ? PRQ : fmt(u.price) + ' ₼'}${u.st === 'bron' ? ' · bron' : ''}</strong></a>`).join('');
        if (window.gsap && !RM) gsap.from($$('.ub', root), { y: 18, opacity: 0, stagger: .025, duration: .5, ease: 'power3.out' }); };
      $$('.floors button', root).forEach(x => x.onclick = () => draw(+x.dataset.f)); draw(fl);
    }
  };
};
function sessionStorage_get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
function sessionStorage_set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }

/* kataloq */
const F = {}; const resetF = () => Object.assign(F, { r: 0, b: '', ph: 'all', pmax: 0, sort: HP ? 'aa' : 'pa', n: 24 }); resetF();
function filtered() {
  const L = free.filter(u => (!F.r || (F.r === 4 ? u.r >= 4 : u.r === F.r)) && (!F.b || u.b === F.b) && (F.ph === 'all' || u.bst === F.ph) && (!F.pmax || u.price <= F.pmax));
  const s = { pa: (a, b) => a.price - b.price, pd: (a, b) => b.price - a.price, aa: (a, b) => a.a - b.a, ad: (a, b) => b.a - a.a, fd: (a, b) => b.f - a.f }[F.sort]; return L.sort(s);
}
pages.menziller = () => {
  const bs = [...new Set(free.map(u => u.b))].sort(), mx = Math.ceil(Math.max(...free.map(u => u.price), 100000) / 50000) * 50000;
  return {
    title: 'Mənzillər — Nizami City', html: `${pHead('Mənzillər', 'Satışda olan bütün mənzillər — real vaxtda satış lövhəsindən.', true)}
    <section class="w paper" style="padding-bottom:var(--gap)"><div class="fbar">
      <div class="grp"><span>Otaq</span><div class="seg" data-k="r">${[[0, 'Hamısı'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']].map(([v, t]) => `<button type="button" data-v="${v}">${t}</button>`).join('')}</div></div>
      <div class="grp"><span>Mərhələ</span><div class="seg" data-k="ph">${[['all', 'Hamısı'], ['ok', 'Hazır'], ['w', 'Tikilən']].map(([v, t]) => `<button type="button" data-v="${v}">${t}</button>`).join('')}</div></div>
      <div class="grp"><span>Bina</span><select id="fB" aria-label="Bina"><option value="">Bütün binalar</option>${bs.map(b => `<option value="${b}">Bina ${b}</option>`).join('')}</select></div>
      <div class="grp rg"${HP ? ' style="display:none"' : ''}><span>Büdcə: <b id="fPv"></b></span><input type="range" id="fP" min="100000" max="${mx}" step="10000" aria-label="Maksimum qiymət"></div>
      <div class="grp"><span>Sıralama</span><select id="fS" aria-label="Sıralama">${HP ? '' : '<option value="pa">Qiymət: ucuzdan</option><option value="pd">Qiymət: bahadan</option>'}<option value="aa">Sahə: kiçikdən</option><option value="ad">Sahə: böyükdən</option><option value="fd">Mərtəbə: yuxarıdan</option></select></div></div>
      <div class="cnt"><div><b class="num" id="fN"></b> <span class="mu">mənzil tapıldı</span></div><button class="lk" type="button" id="fR">Filtrləri sıfırla</button></div>
      <table class="tbl"><thead><tr><th>Mənzil</th><th class="hm">Bina</th><th class="hm">Mərtəbə</th><th class="hm">Vəziyyət</th><th class="r">Qiymət</th></tr></thead><tbody id="fT"></tbody></table>
      <div class="more"><button class="btn ol" type="button" id="fM">Daha çox göstər</button></div></section>`,
    mount(root) {
      const sync = () => { $$('.seg[data-k]', root).forEach(s => $$('button', s).forEach(b => b.classList.toggle('on', String(F[s.dataset.k]) === b.dataset.v))); $('#fB', root).value = F.b; $('#fS', root).value = F.sort; const p = $('#fP', root); p.value = F.pmax || p.max; p.style.setProperty('--p', ((p.value - p.min) / (p.max - p.min) * 100) + '%'); $('#fPv', root).textContent = F.pmax ? fmt(F.pmax) + ' ₼-dək' : 'istənilən'; };
      const draw = () => { const L = filtered(); $('#fN', root).textContent = L.length;
        $('#fT', root).innerHTML = L.slice(0, F.n).map(u => `<tr data-go="${u.id}" tabindex="0"><td><b>${roomsT(u.r)}, ${fm2(u.a)} m²</b><div class="mu sm">${bLbl(u)} · ${ord(u.f)} mərtəbə</div></td><td class="hm">${bLbl(u)}</td><td class="hm num">${u.f}</td><td class="hm"><span class="pill"><i class="${stCls(u.bst)}"></i>${u.c ? esc(u.c) : u.bst === 'ok' ? 'Hazır' : 'Tikilir'}</span></td><td class="r num">${HP ? `<b>${PRQ}</b>` : `<b>${fmt(u.price)} ₼</b><div class="mu sm">${fmt(u.ppm)} ₼/m²</div>`}</td></tr>`).join('') || `<tr><td colspan="5" class="empty">Bu filtrlərlə satışda mənzil yoxdur.</td></tr>`;
        $('#fM', root).style.display = L.length > F.n ? '' : 'none';
        $$('#fT tr[data-go]', root).forEach(tr => { tr.onclick = () => location.hash = 'menzil-' + tr.dataset.go; tr.onkeydown = e => { if (e.key === 'Enter') tr.onclick(); }; }); };
      $$('.seg[data-k]', root).forEach(s => s.onclick = e => { const b = e.target.closest('button'); if (!b) return; const k = s.dataset.k; F[k] = k === 'r' ? +b.dataset.v : b.dataset.v; F.n = 24; sync(); draw(); });
      $('#fB', root).onchange = e => { F.b = e.target.value; F.n = 24; draw(); }; $('#fS', root).onchange = e => { F.sort = e.target.value; draw(); };
      $('#fP', root).oninput = e => { const v = +e.target.value; F.pmax = v >= +e.target.max ? 0 : v; F.n = 24; sync(); draw(); };
      $('#fR', root).onclick = () => { resetF(); sync(); draw(); }; $('#fM', root).onclick = () => { F.n += 24; draw(); };
      sync(); draw();
    }
  };
};
const U = id => UNITS.find(u => u.id === id);
function plateSvg(u) {
  const same = UNITS.filter(x => x.b === u.b && x.f === u.f && x.ent === u.ent).sort((a, b) => a.n - b.n), n = Math.max(2, same.length), half = Math.ceil(n / 2), W = 600, Hh = 260, cw = (W - 20) / half;
  return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Mərtəbədə yerləşmə: ${same.length} mənzildən № ${u.f}.${u.n}">${same.map((x, i) => { const top = i < half, k = top ? i : i - half, X = 10 + k * cw, Y = top ? 10 : 150, me = x.id === u.id; return `<rect x="${X + 3}" y="${Y}" width="${cw - 6}" height="100" fill="${me ? '#1a1d17' : x.st === 'sold' ? '#d9cfbb' : '#cfc4ad'}"/><text x="${X + cw / 2}" y="${Y + 56}" text-anchor="middle" font-family="NC Text, sans-serif" font-size="17" fill="${me ? '#eee8dc' : '#4b4e44'}">${x.f}.${x.n}</text>`; }).join('')}<rect x="10" y="118" width="${W - 20}" height="24" fill="#e4dccb"/><text x="${W / 2}" y="135" text-anchor="middle" font-family="NC Text, sans-serif" font-size="13" fill="#4b4e44">dəhliz və liftlər</text></svg>`;
}
pages.menzil = id => {
  const u = U(id); if (!u) return pages.menziller();
  const sim = free.filter(x => x.id !== u.id && x.r === u.r).sort((a, b) => Math.abs(a.a - u.a) - Math.abs(b.a - u.a)).slice(0, 4);
  return {
    title: `${roomsT(u.r)}, ${fm2(u.a)} m² — ${bLbl(u)} — Nizami City`, html: `<section class="ph-h w paper">${crumbs(['Mənzillər', 'menziller'], [bLbl(u)])}
      <div class="unit"><div><h1 class="d h1">${lines([roomsT(u.r) + ',', fm2(u.a) + ' <span class="lc">m²</span>'])}</h1><p class="pr num" data-r>${u.st === 'sold' ? 'Satılıb' : HP ? 'Qiymət sorğu ilə' : fmt(u.price) + ' ₼'}</p><p class="mu" data-r>${HP ? '' : fmt(u.ppm) + ' ₼/m² · '}${u.st === 'bron' ? 'bron olunub' : u.st === 'sold' ? 'satılıb' : 'satışda'}</p>
        <div class="kv" data-r>${[['Bina', bLbl(u)], ['Mərtəbə', `${u.f} / ${window.NC_FLOORS || 10}`], ['Otaq sayı', u.r], ['Sahə', fm2(u.a) + ' m²'], ['Vəziyyət', u.c || (u.bst === 'ok' ? 'Təmirsiz' : 'Tikilir')], ['Təhvil', u.bst === 'ok' ? 'Hazırdır' : CO.delivery], ['Pəncərələr', u.ori && u.ori !== '—' ? u.ori : 'Satış ofisində dəqiqləşdirin']].map(([a, b]) => `<div><span>${a}</span><b>${esc(b)}</b></div>`).join('')}</div>
        <div class="acts" data-r><a class="btn" href="#v">Baxışa yazıl ${AR}</a><a class="btn ol" href="tel:${esc(CO.short)}">Zəng: ${esc(CO.short)}</a></div></div>
      <div style="display:grid;gap:6px;align-content:start"><div class="plate" data-r>${plateSvg(u)}<p>Mərtəbədə yerləşmə sxemi. Dəqiq plan satış ofisində təqdim olunur.</p></div><figure class="clip" style="margin:0;aspect-ratio:4/3;overflow:hidden">${pic(u.bst === 'ok' ? 'tower_l' : 'corner', 'Nizami City binaları', { cls: 'par', sizes: '(max-width:900px) 92vw, 40vw', style: 'width:100%;height:100%;object-fit:cover' })}</figure></div></div></section>
    ${HP ? `<section class="sec w f1" id="prq">${priceBlock(u)}</section>` : `<section class="sec w f1"><div class="pay"><div class="tx"><h2 class="d h2">${lines(['Bu mənzil', 'üçün ödəniş'])}</h2><p class="lead" data-r>İlkin ödənişi və müddəti seçin — aylıq məbləğ dərhal hesablanır.</p></div>${calcBlock({ unit: u, sched: true })}</div></section>`}
    ${sim.length ? `<section class="sec w paper"><h2 class="d h2" style="margin-bottom:48px">${lines(['Oxşar mənzillər'])}</h2><div class="rows">${sim.map(unitRow).join('')}</div></section>` : ''}
    <section class="sec w f0" id="v">${visitBlock(u.id)}</section>`,
    mount(root) { bindCalc(root); bindPrice(root, u); bindVisit(root, u.id); const a = $('a[href="#v"]', root); if (a) a.onclick = e => { e.preventDefault(); scrollToEl($('#v', root)); }; }
  };
};
pages.kalkulyator = () => ({
  title: 'Ödəniş kalkulyatoru — Nizami City', html: `${pHead('Ödəniş', 'Daxili kredit: ' + TERMS.map(t => t.m + ' ay' + (t.s ? ' (+' + t.s + ' ₼/m²)' : ' faizsiz')).join(', ') + '. Nəticə təxminidir — yekun şərtləri satış ofisi təsdiqləyir.', true)}
  <section class="w paper" style="padding-bottom:var(--gap)"><div class="pay"><div class="tx"><p class="lead" data-r>Konkret mənzil üçün hesablamaq istəyirsinizsə, mənzil səhifəsində kalkulyator onun sahəsi və qiyməti ilə açılır.</p><div data-r><a class="btn ol" href="#menziller">Mənzil seç ${AR}</a></div></div>${calcBlock({ sched: true })}</div></section>`,
  mount(root) { bindCalc(root); }
});
pages.mekan = () => ({ title: 'Məkan — Nizami City', html: `${pHead('Məkan', esc(CO.addr), false)}<section class="w f0" style="padding-bottom:var(--gap)">${locBlock('h2')}</section>${statBlock()}` });
pages.kommersiya = () => ({
  title: 'Kommersiya sahələri — Nizami City', html: `${pHead('Kommersiya', 'Binaların birinci mərtəbələrində qeyri-yaşayış sahələri: küçəyə açılan vitrinlər və kompleksin öz sakinləri.', false)}
  <section class="band">${pic('street', 'Nizami City: kommersiya mərtəbəsi və vitrinlər', { cls: 'par' })}</section>
  <section class="sec w paper"><div class="split"><div><h2 class="d h2">${lines(['Biznesiniz', 'üçün yer'])}</h2>${INFRA.length ? '' : ''}<div class="kv" data-r>${[['Yerləşmə', 'Birinci mərtəbələr, küçə tərəfi'], ['Daimi müştəri bazası', 'Kompleksin öz sakinləri'], ['Nəqliyyat', 'Nizami metrosunun piyada axını'], ['Uyğundur', 'Supermarket, aptek, kafe, salon, ofis']].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('')}</div></div>
    <div><form class="frm" id="cf" novalidate><div class="fld"><label for="cfN">Adınız</label><input class="in" id="cfN" name="name" autocomplete="name"><div class="err" data-e="name"></div></div><div class="fld"><label for="cfP">Telefon</label><input class="in" id="cfP" name="phone" type="tel" inputmode="tel" autocomplete="tel"><div class="err" data-e="phone"></div></div><div class="fld"><label for="cfB">Biznes növü və lazım olan sahə</label><input class="in" id="cfB" name="msg" placeholder="Məsələn: kafe, 120 m²"></div><div><button class="btn">Sorğu göndər ${AR}</button></div></form></div></div></section>`,
  mount(root) { bindForm($('#cf', root), 'commercial', null, () => 'Kommersiya meneceri sizə zəng edəcək.'); }
});
pages.bloq = () => ({ title: 'Bloq — Nizami City', html: `${pHead('Bloq', 'Mənzil seçimi, ödəniş və Yasamalda həyat haqqında.', true)}<section class="w paper" style="padding-bottom:var(--gap)"><div class="posts">${posts().map(postRow).join('') || '<p class="empty">Hələ yazı yoxdur.</p>'}</div></section>` });
pages.post = id => {
  const p = BLOG.find(x => x.id === id); if (!p) return pages.bloq();
  const nx = posts().filter(x => x.id !== id).slice(0, 2);
  return { title: p.t + ' — Nizami City', html: `<section class="ph-h w paper"><div class="art">${crumbs(['Bloq', 'bloq'], [p.c])}<h1 class="d h1" style="font-size:clamp(44px,5vw,84px)">${esc(p.t)}</h1><p class="meta">${esc(p.c)} · ${dfmt(p.d)}${p.m ? ' · ' + p.m + ' dəq oxu' : ''}</p></div>${p.img ? `<figure class="cover clip" style="margin:0 calc(var(--m)*-1) 64px">${pic(p.img, p.t, { cls: 'par' })}</figure>` : ''}<div class="art"><div class="bd">${p.b || ''}</div></div></section>
    ${nx.length ? `<section class="sec w f0"><div class="bl-h"><h2 class="d h2">${lines(['Növbəti'])}</h2></div><div class="posts">${nx.map(postRow).join('')}</div></section>` : ''}` };
};
pages.suallar = () => ({ title: 'Suallar — Nizami City', html: `<section class="w f0" style="padding-top:calc(var(--hd) + clamp(60px,8vw,120px));padding-bottom:var(--gap)">${crumbs(['Suallar'])}${faqBlock()}</section>` });
pages.elaqe = () => ({ title: 'Əlaqə — Nizami City', html: `<section class="w paper" style="padding-top:calc(var(--hd) + clamp(60px,8vw,120px));padding-bottom:var(--gap)">${crumbs(['Əlaqə'])}${visitBlock()}</section><section class="sec w f1">${locBlock()}</section>`, mount(root) { bindVisit(root); } });

/* ---------- altlıq ---------- */
function footer() {
  $('#ft').innerHTML = `<div class="w cols"><div><h4>Nizami City</h4><p>${esc(CO.slogan || '')}. ${esc(CO.addr)}</p></div>
    <div><h4>Mənzillər</h4><a href="#menziller">Kataloq</a><a href="#binalar">Binalar</a><a href="#kalkulyator">Ödəniş</a><a href="#kommersiya">Kommersiya</a></div>
    <div><h4>Kompleks</h4><a href="#mekan">Məkan</a>${OFF.bloq ? '' : '<a href="#bloq">Bloq</a>'}<a href="#suallar">Suallar</a><a href="#elaqe">Əlaqə</a></div>
    <div><h4>Əlaqə</h4><a href="tel:${esc(CO.short)}">${esc(CO.short)}</a>${(CO.phones || []).map((p, i) => `<a href="tel:${esc((CO.tel || [])[i] || p)}">${esc(p)}</a>`).join('')}${CO.ig ? `<a href="https://instagram.com/${esc(CO.ig)}" target="_blank" rel="noopener">Instagram</a>` : ''}${CO.wa ? `<a href="https://wa.me/${esc(CO.wa)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}</div></div>
    <div class="wm w" aria-hidden="true"><span>Nizami</span><span>City</span></div>
    <div class="bot"><span>© ${new Date().getFullYear()} Nizami City · City Life MMC</span><span>${esc(CO.hours)}</span></div>`;
  $('#mAddr').textContent = CO.addr;
}

/* ---------- marşrut ---------- */
const NAVK = ['home', 'binalar', 'menziller', 'kalkulyator', 'mekan', 'kommersiya', 'bloq', 'suallar', 'elaqe'];
function parse() {
  const h = decodeURIComponent(location.hash.slice(1)) || 'home';
  let m;
  if ((m = h.match(/^bina-([A-Z])$/))) return ['bina', m[1]];
  if ((m = h.match(/^menzil-(.+)$/))) return ['menzil', m[1]];
  if ((m = h.match(/^bloq-(.+)$/))) return OFF.bloq ? ['home'] : ['post', m[1]];
  if (h === 'layihe' || h === 'gunes' || h === 'qalereya') return ['binalar'];
  return [pages[h] && !['bina', 'menzil', 'post'].includes(h) && !OFF[h] ? h : 'home'];
}
let first = true, busy = false, LEN = null;
function render() {
  const [k, arg] = parse();
  if (MQ) { MQ.dispose(); MQ = null; }
  if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
  const pg = pages[k](arg), main = $('#view');
  main.innerHTML = pg.html; document.title = pg.title || 'Nizami City';
  $$('.nav a, .menu nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + (k === 'menzil' ? 'menziller' : k === 'bina' ? 'binalar' : k === 'post' ? 'bloq' : k)));
  document.body.dataset.page = k;
  if (LEN) LEN.scrollTo(0, { immediate: true }); else scrollTo(0, 0);
  pg.mount && pg.mount(main);
  $$('a[href="#visit"]', main).forEach(a => a.onclick = e => { e.preventDefault(); scrollToEl($('#visit', main)); });
  try { window.ncAfterRender && window.ncAfterRender(k, main); } catch (e) { }
  headerTone(); motion(main, k);
  if (!first) main.focus({ preventScroll: true });
}
function scrollToEl(el) { if (!el) return; if (LEN) LEN.scrollTo(el, { offset: -20, duration: 1.4 }); else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); }
function route() {
  closeMenu();
  if (first || RM || !window.gsap) { render(); first = false; return; }
  if (busy) return; busy = true;
  const w = $('#wipe');
  gsap.timeline({ onComplete: () => { busy = false; } })
    .set(w, { y: 0, yPercent: 100 }).to(w, { yPercent: 0, duration: .55, ease: 'power4.inOut' })
    .add(() => render())
    .to(w, { yPercent: -100, duration: .7, ease: 'power4.inOut' }, '+=.05');
}
addEventListener('hashchange', route);

/* ---------- başlıq və menyu ---------- */
const hd = $('#hd'); let lastY = 0;
function headerTone() {
  const y = scrollY, hero = $('#hero');
  hd.classList.toggle('solid', y > (hero ? hero.offsetHeight - 90 : 20));
  hd.classList.toggle('hide', y > 400 && y > lastY + 4 && !document.body.classList.contains('menu'));
  if (y < lastY - 4 || y < 400) hd.classList.remove('hide');
  lastY = y;
  // altdakı sahənin rənginə görə
  const el = (document.elementsFromPoint(innerWidth / 2, 38) || []).find(x => !hd.contains(x) && !x.closest('.wipe,.veil,.menu'));
  const sec = el && el.closest('section, footer, .subst');
  hd.classList.toggle('on-paper', !!(sec && sec.classList.contains('paper')) && !document.body.classList.contains('menu'));
}
addEventListener('scroll', () => requestAnimationFrame(headerTone), { passive: true });
const mbtn = $('#mbtn');
function closeMenu() { document.body.classList.remove('menu'); mbtn.setAttribute('aria-expanded', 'false'); $('#menu').setAttribute('aria-hidden', 'true'); if (LEN) LEN.start(); }
mbtn.onclick = () => { const on = !document.body.classList.contains('menu'); document.body.classList.toggle('menu', on); mbtn.setAttribute('aria-expanded', on); $('#menu').setAttribute('aria-hidden', !on); if (LEN) on ? LEN.stop() : LEN.start(); };
addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ---------- hərəkət ---------- */
function motion(root, k) {
  if (!window.gsap || RM) return;
  const ST = window.ScrollTrigger;
  // başlıq sətirləri yuxarı qalxır
  $$('h1, h2', root).forEach(h => { const L = $$('.ln > span', h); if (!L.length) return; if (h.closest('#hero')) return; gsap.from(L, { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: .08, scrollTrigger: ST ? { trigger: h, start: 'top 88%', once: true } : undefined }); });
  // hər bölmənin hissələri ardıcıl
  $$('section, .subst', root).forEach(sec => { const L = $$('[data-r]', sec).filter(x => x.closest('section, .subst') === sec); if (!L.length) return; ST ? ST.batch(L, { start: 'top 90%', once: true, onEnter: b => gsap.fromTo(b, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .075, overwrite: true }) }) : gsap.from(L, { y: 28, opacity: 0, duration: .9, stagger: .07 }); if (ST) gsap.set(L.filter(x => x.getBoundingClientRect().top > innerHeight * .9), { y: 28, opacity: 0 }); });
  // şəkil pərdəsi açılır
  $$('.clip', root).forEach(c => gsap.fromTo(c, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: ST ? { trigger: c, start: 'top 85%', once: true } : undefined }));
  // paralaks
  if (ST) $$('img.par', root).forEach(im => gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  if (ST) $$('[data-par] img', root).forEach(im => gsap.fromTo(im, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom 40%', scrub: true } }));
  // hero
  const hero = $('#hero', root);
  if (hero) {
    const img = $('.hero-m img', hero);
    const tl = gsap.timeline({ delay: first ? .2 : .1 });
    tl.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 2.6, ease: 'power3.out' }, 0)
      .from($$('.hero-t .ln > span', hero), { yPercent: 110, duration: 1.3, ease: 'power4.out', stagger: .09 }, .25)
      .from($$('.hx, .hero-f', hero), { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1 }, .7);
    if (ST) {
      gsap.to(img, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to($('.hero-t', hero), { yPercent: -30, opacity: .2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }
  }
  // altlıq söz nişanı
  const wm = $('#ft .wm'); if (wm && ST && !wm.dataset.on) { wm.dataset.on = 1; gsap.from($$('span', wm), { yPercent: 60, opacity: 0, duration: 1.4, ease: 'power4.out', stagger: .1, scrollTrigger: { trigger: wm, start: 'top 95%', once: true } }); }
  if (ST) requestAnimationFrame(() => ST.refresh());
}

/* ---------- başlanğıc ---------- */
footer();
if (HP) $$('a[href="#kalkulyator"]').forEach(a => a.style.display = 'none');
function boot() {
  const ready = () => window.gsap && window.ScrollTrigger;
  const go = () => {
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis && !RM && window.gsap) {
      LEN = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
      LEN.on('scroll', () => window.ScrollTrigger && ScrollTrigger.update());
      gsap.ticker.add(t => LEN.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    }
    render(); first = false;
    const v = $('#veil');
    if (window.gsap && !RM) gsap.to(v, { yPercent: -100, duration: 1, ease: 'power4.inOut', delay: .05, onComplete: () => v.remove() });
    else v.remove();
  };
  if (ready()) return go();
  let n = 0; const t = setInterval(() => { if (ready() || ++n > 30) { clearInterval(t); go(); } }, 80);
}
boot();
