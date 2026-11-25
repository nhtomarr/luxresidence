/* Mövsüm rejimi — Yeni il.
   BİR AÇAR: SW. 'auto' = 1 dekabr – 14 yanvar (Bakı vaxtı) özü yanır/sönür; 'on' = həmişə; 'off' = sönülü.
   Sınaq: ünvana ?movsum=a (sakit) və ya ?movsum=b (bayramlı) əlavə et; ?movsum=0 söndürür (yalnız həmin brauzer sessiyası üçün).
   Sayta görə ayarlar səhifədə window.SEASON-da verilir (rənglər, hero, loqo, düymə, mətn). */
(function () {
  var SW = 'auto', DEF = 'b';
  var C = window.SEASON || {}, d = document, ss = null;
  try { ss = window.sessionStorage; } catch (e) {}
  var q = /[?&]movsum=([ab01])/.exec(location.search), pv = q ? q[1] : (ss && ss.getItem('ssn_pv'));
  if (q && ss) try { ss.setItem('ssn_pv', q[1]); } catch (e) {}
  var now = new Date(Date.now() + 144e5), mo = now.getUTCMonth() + 1, day = now.getUTCDate();
  var inWin = mo === 12 || (mo === 1 && day <= 14);
  if (pv === '0' || SW === 'off') return;
  if (!(pv === 'a' || pv === 'b' || pv === '1' || SW === 'on' || (SW === 'auto' && inWin))) return;
  var V = pv === 'a' || pv === 'b' ? pv : (C.v || DEF);
  var ru = (C.lang || d.documentElement.lang || 'az').slice(0, 2) === 'ru';
  /* tarixə görə mətn */
  var left = mo === 1 ? 0 : Math.round((Date.UTC(now.getUTCFullYear() + 1, 0, 1) - Date.UTC(now.getUTCFullYear(), mo - 1, day)) / 864e5);
  var T = ru
    ? { pre: 'Выберите квартиру к Новому году', d31: 'С Днём солидарности и Новым годом', ny: 'С Новым годом', n: 'До Нового года: ' + left + ' дн.', cta: 'Записаться на просмотр', x: 'Закрыть' }
    : { pre: 'Yeni il ərəfəsində mənzilinizi seçin', d31: 'Həmrəylik günü və Yeni iliniz mübarək', ny: 'Yeni iliniz mübarək', n: 'Yeni ilə ' + left + ' gün', cta: 'Baxışa yazıl', x: 'Bağla' };
  var t = C.t || {};
  var txt = mo === 1 ? (t.ny || T.ny) : day === 31 ? (t.d31 || T.d31) : (C.offer || t.pre || T.pre);
  var FL = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5M3.2 10.4l3.4-.9-.9-3.4M20.8 13.6l-3.4.9.9 3.4M20.8 10.4l-3.4-.9.9-3.4M3.2 13.6l3.4.9-.9 3.4"/></svg>';
  var css = '.ssn-band{position:relative;z-index:5;display:flex;align-items:center;justify-content:center;gap:12px;min-height:36px;padding:6px 44px 6px 16px;background:' + (C.bg || '#222') + ';color:' + (C.fg || '#fff') + ';font-size:13px;line-height:1.35;font-weight:400}'
    + '.ssn-band .ssn-i{display:flex;color:' + (C.ac || 'currentColor') + '}'
    + '.ssn-band .ssn-n{font-variant-numeric:tabular-nums;opacity:.72;padding-left:12px;border-left:1px solid rgba(255,255,255,.2)}'
    + '.ssn-band .ssn-c{appearance:none;background:none;border:0;padding:0;margin:0;font:inherit;font-weight:500;color:inherit;cursor:pointer;text-decoration:underline;text-decoration-color:rgba(255,255,255,.4);text-underline-offset:3px;white-space:nowrap;transition:text-decoration-color .15s ease}'
    + '.ssn-band .ssn-c:hover{text-decoration-color:currentColor}'
    + '.ssn-band .ssn-c:focus-visible,.ssn-band .ssn-x:focus-visible{outline:2px solid currentColor;outline-offset:2px;border-radius:4px}'
    + '.ssn-band .ssn-x{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:none;border:0;border-radius:8px;color:inherit;opacity:.6;cursor:pointer;transition:opacity .15s ease}'
    + '.ssn-band .ssn-x:hover{opacity:1}'
    + '.ssn-band.b:after{content:"";position:absolute;left:0;right:0;top:100%;height:6px;pointer-events:none;background:radial-gradient(circle at 12px 3px,' + (C.ac || '#fff') + ' 2px,transparent 2.6px) 0 0/48px 6px repeat-x,radial-gradient(circle at 36px 3px,' + (C.fg || '#fff') + ' 2px,transparent 2.6px) 0 0/48px 6px repeat-x;opacity:.85}'
    + '.ssn-snow{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:' + (C.z || 2) + ';transition:opacity .6s ease}'
    + (C.hideWhen ? C.hideWhen + ' .ssn-snow{opacity:0}' : '')
    + (C.logo ? C.logo + '{display:inline-flex;align-items:center}' : '') + '.ssn-lg{display:inline-flex;margin-left:8px;color:' + (C.lgc || C.ac || 'currentColor') + ';vertical-align:middle;flex:none}'
    + '@media(max-width:560px){.ssn-band{justify-content:flex-start;gap:10px;font-size:12.5px;padding-left:12px}.ssn-band .ssn-n,.ssn-band .ssn-i{display:none}}'
    + '@media print{.ssn-band,.ssn-snow,.ssn-lg{display:none}}';
  var st = d.createElement('style'); st.id = 'ssn-css'; st.textContent = css; d.head.appendChild(st);

  /* 1) Zolaq */
  var closed = ss && ss.getItem('ssn_x') === '1';
  if (!closed) {
    var b = d.createElement('div'); b.className = 'ssn-band ' + V; b.setAttribute('role', 'region'); b.setAttribute('aria-label', T.ny);
    var cta = C.cta || {}, ch = cta.href ? '<a class="ssn-c" href="' + cta.href + '">' : '<button type="button" class="ssn-c">';
    b.innerHTML = '<span class="ssn-i">' + FL + '</span><span class="ssn-t">' + txt + '</span>'
      + (V === 'b' && left > 1 ? '<span class="ssn-n">' + T.n + '</span>' : '')
      + (cta === false ? '' : ch + (cta.label || T.cta) + (cta.href ? '</a>' : '</button>'))
      + '<button type="button" class="ssn-x" aria-label="' + T.x + '"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
    var c = b.querySelector('.ssn-c');
    if (c) {
      if (cta.attr) for (var k in cta.attr) c.setAttribute(k, cta.attr[k]);
      c.addEventListener('click', function () {
        try { if (window.gtag) gtag('event', 'season_cta', { variant: V }); } catch (e) {}
        if (cta.click) { var el = d.querySelector(cta.click); if (el) el.click(); else if (cta.fallback) location.href = cta.fallback; }
      });
    }
    b.querySelector('.ssn-x').addEventListener('click', function () { b.remove(); try { ss.setItem('ssn_x', '1'); } catch (e) {} });
    var cs = d.currentScript;
    if (cs && cs.parentNode === d.body) d.body.insertBefore(b, cs); else if (d.body) d.body.insertBefore(b, d.body.firstChild);
  }

  function ready(f) { if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', f); else f(); }
  ready(function () {
    /* 2) Loqoda kiçik detal */
    if (C.logo) { var lg = d.querySelector(C.logo); if (lg && !lg.querySelector('.ssn-lg')) { var s = d.createElement('span'); s.className = 'ssn-lg'; s.innerHTML = FL; lg.appendChild(s); } }
    /* 3) Yüngül qar — yalnız birinci ekranda */
    var mm = window.matchMedia, nav = navigator, cn = nav.connection || {};
    if (!C.hero || !window.requestAnimationFrame || (mm && mm('(prefers-reduced-motion: reduce)').matches) || cn.saveData || /2g/.test(cn.effectiveType || '') || (nav.deviceMemory && nav.deviceMemory <= 2)) return;
    var cv = d.createElement('canvas'); cv.className = 'ssn-snow'; cv.setAttribute('aria-hidden', 'true');
    var cx = cv.getContext('2d'), P = [], W = 0, H = 0, R = 1, host = null, vis = false, raf = 0, last = 0, io = null;
    function size() {
      if (!host) return; var r = host.getBoundingClientRect(); W = r.width; H = r.height; if (!W || !H) return;
      R = Math.min(window.devicePixelRatio || 1, 2); cv.width = Math.round(W * R); cv.height = Math.round(H * R);
      var n = Math.round(Math.min(W * H / (V === 'b' ? 16000 : 30000), V === 'b' ? 90 : 46)); P.length = 0;
      for (var i = 0; i < n; i++) P.push(mk(true));
    }
    function mk(any) { var z = Math.random(); return { x: Math.random() * W, y: any ? Math.random() * H : -6, r: .8 + z * 1.7, v: 14 + z * 26, a: .35 + z * .5, p: Math.random() * 6.28, w: .4 + Math.random() * .7 }; }
    function tick(ts) {
      raf = 0; if (!vis || d.hidden) return; raf = requestAnimationFrame(tick);
      if (ts - last < 33) return; var dt = Math.min((ts - last) / 1000, .1); last = ts;
      cx.setTransform(R, 0, 0, R, 0, 0); cx.clearRect(0, 0, W, H); cx.fillStyle = '#fff';
      for (var i = 0; i < P.length; i++) { var f = P[i]; f.y += f.v * dt; f.p += f.w * dt; f.x += Math.sin(f.p) * 9 * dt; if (f.y > H + 6) P[i] = f = mk(false); cx.globalAlpha = f.a; cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 6.2832); cx.fill(); }
    }
    function run() { if (!raf && vis && !d.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } }
    function attach() {
      var h = d.querySelector(C.hero); if (!h || h === host && cv.isConnected) return;
      host = h; h.appendChild(cv); size();
      if (io) io.disconnect();
      if (window.IntersectionObserver) { io = new IntersectionObserver(function (e) { vis = e[0].isIntersecting; run(); }); io.observe(h); } else { vis = true; run(); }
    }
    attach(); setInterval(attach, 1500);
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
    d.addEventListener('visibilitychange', run);
  });
})();
