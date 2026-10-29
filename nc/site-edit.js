/* Nizami City — saytda birbaşa redaktə rejimi (?edit=1). İcazə: nc_site. Yadda saxlanılır: lux_kv nc_site (txt, hide, img) */
(function () {
  var U = 'https://avqchschbbltnnasabdm.supabase.co', K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cWNoc2NoYmJsdG5uYXNhYmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NDA2NTAsImV4cCI6MjEwNTUxNjY1MH0.PVxxfLrj8KZH6AUaQQPx5sEqpiGEMDIFy3Mq206OMKI';
  var sb, S, dirty = 0, PEND = { txt: {}, hide: {}, img: {} };
  var css = document.createElement('style');
  css.textContent = '.nce-bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;display:flex;gap:8px;align-items:center;background:#0b1222;color:#fff;border:1px solid rgba(201,168,106,.5);border-radius:14px;padding:8px 10px 8px 14px;font:600 13px Inter,system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.45);max-width:calc(100vw - 24px);flex-wrap:wrap}' +
    '.nce-bar b{color:#c9a86a}.nce-bar button,.nce-bar a{font:inherit;border:0;border-radius:10px;padding:8px 12px;cursor:pointer;background:#1c2740;color:#fff;text-decoration:none}.nce-bar .nce-save{background:#c9a86a;color:#111}.nce-bar .nce-save[disabled]{opacity:.45;cursor:default}' +
    '[data-nce]{outline:1px dashed rgba(201,168,106,.0);outline-offset:3px;transition:outline-color .15s}[data-nce]:hover{outline-color:rgba(201,168,106,.85);cursor:text}[data-nce]:focus{outline:2px solid #c9a86a;background:rgba(201,168,106,.08)}' +
    '.nce-hidden>*:not(.nce-tg){opacity:.28;filter:grayscale(1)}.nce-sec{position:relative}.nce-tg{position:absolute;top:10px;right:10px;z-index:50;font:600 12px Inter,system-ui,sans-serif;border:0;border-radius:9px;padding:7px 10px;background:#0b1222;color:#fff;cursor:pointer;opacity:.9}.nce-tg.off{background:#b4232a}' +
    '.nce-imgb{position:absolute;z-index:60;font:600 12px Inter,system-ui,sans-serif;border:0;border-radius:9px;padding:7px 10px;background:#c9a86a;color:#111;cursor:pointer;display:none}' +
    '.nce-msg{position:fixed;inset:0;display:grid;place-items:center;background:rgba(7,12,24,.85);z-index:99998;color:#fff;font:15px Inter,system-ui,sans-serif;text-align:center;padding:24px}.nce-msg a{color:#c9a86a}';
  document.head.appendChild(css);

  function msg(h) { var d = document.createElement('div'); d.className = 'nce-msg'; d.innerHTML = '<div>' + h + '</div>'; document.body.appendChild(d); }
  function load(cb) { if (window.supabase && window.supabase.createClient) return cb(); var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2'; s.onload = cb; document.head.appendChild(s); }

  load(async function () {
    sb = window.supabase.createClient(U, K);
    var ses = (await sb.auth.getSession()).data.session;
    if (!ses) return msg('Redaktə üçün əvvəlcə panelə daxil olun.<br><br><a href="/sayt">Panelə keç →</a>');
    var ok = (await sb.rpc('lux_has_perm', { p: 'nc_site' })).data;
    if (!ok) return msg('Bu hesabın sayt redaktəsinə icazəsi yoxdur.<br><br><a href="/">Sayta qayıt</a>');
    S = JSON.parse(JSON.stringify((window.NC_REMOTE || {}).site || {}));
    bar(); window.ncEditHook = hook;
    var main = document.getElementById('view'); var k = (location.hash.slice(1) || 'home').split('-')[0];
    hook(k, main); markText(document.querySelector('header')); markText(document.querySelector('footer'));
    addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  });

  function bar() {
    var b = document.createElement('div'); b.className = 'nce-bar';
    b.innerHTML = '<span>✏️ <b>Redaktə rejimi</b> — mətnə klikləyib yazın</span><span id="nceN" style="opacity:.7"></span><button class="nce-save" id="nceS" disabled>Yadda saxla</button><a href="/sayt">Panel</a><a href="/" id="nceX">Çıx</a>';
    document.body.appendChild(b);
    b.querySelector('#nceS').onclick = save;
    b.querySelector('#nceX').onclick = function (e) { if (dirty && !confirm('Yadda saxlanmamış dəyişikliklər itəcək. Çıxılsın?')) e.preventDefault(); };
  }
  function upd() { var n = Object.keys(PEND.txt).length + Object.keys(PEND.hide).length + Object.keys(PEND.img).length; dirty = n; var s = document.getElementById('nceS'); if (s) { s.disabled = !n; } var c = document.getElementById('nceN'); if (c) c.textContent = n ? n + ' dəyişiklik' : ''; }

  var TAGS = 'h1,h2,h3,h4,h5,p,li,dt,dd,blockquote,figcaption,label,small,.lbl,.txt,.tag,td,th,summary,a.b,button.b,.kv span,.kv b,em,b,strong,span';
  function textNodes(el) { var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, L = []; while ((n = w.nextNode())) if (n.nodeValue.trim()) L.push(n); return L; }
  function markText(root) {
    if (!root) return;
    root.querySelectorAll(TAGS).forEach(function (el) {
      if (el.closest('[data-nce]') || el.closest('form,input,select,textarea,.nce-bar,svg,canvas,.stage3,.chess,.sched,.gal,#cUnit,#oKv,#o3')) return;
      if (el.querySelector('input,select,textarea,img,svg,canvas,button')) return;
      var tn = textNodes(el); if (!tn.length) return;
      if (/^[\d\s.,₼%m²~+\-—·/:]+$/.test(el.textContent.trim())) return; // rəqəmlər canlı məlumatdır
      tn.forEach(function (n) { if (n.__o === undefined) n.__o = n.nodeValue; });
      el.setAttribute('data-nce', ''); el.contentEditable = 'true'; el.spellcheck = false;
      el.addEventListener('click', function (e) { if (el.tagName === 'A' || el.closest('a,button')) e.preventDefault(); }, true);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !/^(P|LI|BLOCKQUOTE|DD)$/.test(el.tagName)) { e.preventDefault(); el.blur(); } });
      el.addEventListener('paste', function (e) { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
      el.addEventListener('blur', function () {
        textNodes(el).forEach(function (n) {
          var o = n.__o; if (o === undefined) return; var k = o.trim(), v = n.nodeValue.trim(); if (!k) return;
          var cur = (S.txt || {})[k]; if (v === (cur !== undefined ? cur : k)) return;
          PEND.txt[k] = v === k ? null : v; upd();
        });
      });
    });
  }
  function hook(route, main) {
    markText(main);
    Array.prototype.forEach.call(main.children, function (el) {
      var key = el.getAttribute('data-ncsec'); if (!key || el.querySelector(':scope > .nce-tg')) return;
      el.classList.add('nce-sec');
      var b = document.createElement('button'); b.className = 'nce-tg'; b.type = 'button';
      var on = function () { var h = key in PEND.hide ? PEND.hide[key] : !!(S.hide || {})[key]; b.textContent = h ? '🚫 Gizlidir — göstər' : '👁 Bölməni gizlət'; b.classList.toggle('off', h); el.classList.toggle('nce-hidden', h); };
      b.onclick = function (e) { e.stopPropagation(); var h = key in PEND.hide ? PEND.hide[key] : !!(S.hide || {})[key]; PEND.hide[key] = !h; on(); upd(); };
      on(); el.appendChild(b);
    });
    images(main);
  }
  // şəkillər: IMG açarına uyğun gələn <img> → "Şəkli dəyiş"
  var ib; function images(root) {
    if (!ib) { ib = document.createElement('button'); ib.className = 'nce-imgb'; ib.textContent = '🖼 Şəkli dəyiş'; document.body.appendChild(ib); ib.onmouseleave = function () { ib.style.display = 'none'; }; }
    var rev = {}; Object.keys(window.IMG || {}).forEach(function (k) { if (k !== 'logo') rev[IMG[k]] = k; });
    root.querySelectorAll('img').forEach(function (im) {
      var key = rev[im.getAttribute('src')]; if (!key) return;
      im.addEventListener('mouseenter', function () { var r = im.getBoundingClientRect(); ib.style.display = 'block'; ib.style.top = (scrollY + r.top + 10) + 'px'; ib.style.left = (scrollX + r.left + 10) + 'px'; ib.style.position = 'absolute'; ib.onclick = function (e) { e.preventDefault(); e.stopPropagation(); pick(key); }; });
    });
  }
  function pick(key) {
    var f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*';
    f.onchange = async function () {
      var file = f.files[0]; if (!file) return; if (file.size > 8e6) return alert('Şəkil 8 MB-dan böyük olmamalıdır');
      ib.textContent = 'Yüklənir…';
      var blob = await shrink(file, 2000), path = 'img/' + key + '-' + Date.now() + '.jpg';
      var r = await sb.storage.from('nc-site').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
      ib.textContent = '🖼 Şəkli dəyiş';
      if (r.error) return alert('Yükləmə xətası: ' + r.error.message);
      var url = sb.storage.from('nc-site').getPublicUrl(path).data.publicUrl;
      var old = IMG[key]; document.querySelectorAll('img').forEach(function (im) { if (im.getAttribute('src') === old) im.src = url; });
      IMG[key] = url; PEND.img[key] = url; upd();
    };
    f.click();
  }
  function shrink(file, max) {
    return new Promise(function (res) {
      var im = new Image(); im.onload = function () { var s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); c.toBlob(function (b) { res(b || file); }, 'image/jpeg', .85); };
      im.onerror = function () { res(file); }; im.src = URL.createObjectURL(file);
    });
  }
  async function save() {
    var btn = document.getElementById('nceS'); btn.disabled = true; btn.textContent = 'Saxlanılır…';
    var cur = await sb.from('lux_kv').select('value').eq('key', 'nc_site').maybeSingle();
    var V = (cur.data && cur.data.value) || {};
    ['txt', 'hide', 'img'].forEach(function (g) { V[g] = V[g] || {}; Object.keys(PEND[g]).forEach(function (k) { var v = PEND[g][k]; if (v === null || v === false) delete V[g][k]; else V[g][k] = v; }); });
    var r = await sb.from('lux_kv').upsert({ key: 'nc_site', value: V, updated_at: new Date().toISOString() });
    btn.textContent = 'Yadda saxla';
    if (r.error) { btn.disabled = false; return alert('Xəta: ' + r.error.message); }
    S = V; window.NC_REMOTE.site = V; PEND = { txt: {}, hide: {}, img: {} }; upd();
    var t = document.createElement('div'); t.className = 'nce-bar'; t.style.bottom = '78px'; t.textContent = '✓ Yadda saxlanıldı — saytda dərhal görünür'; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2500);
  }
})();
