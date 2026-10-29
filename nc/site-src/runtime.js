/* Nizami City sayt — canlı məlumat yükləyicisi + paneldən idarə (lux_kv nc_site / nc_blog / nc_cfg, rpc nc_public_units) */
(function () {
  var U = 'https://avqchschbbltnnasabdm.supabase.co', K = '%ANON%';
  var H = { apikey: K, Authorization: 'Bearer ' + K, 'Content-Type': 'application/json' };
  var EDIT = /[?&]edit=1/.test(location.search); window.NC_EDIT = EDIT;
  function tmo(p, ms) { return Promise.race([p, new Promise(function (r) { setTimeout(function () { r(null); }, ms); })]); }
  var kv = fetch(U + '/rest/v1/lux_kv?select=key,value&key=in.(nc_site,nc_blog,nc_cfg)', { headers: H }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
  var un = fetch(U + '/rest/v1/rpc/nc_public_units', { method: 'POST', headers: H, body: '{}' }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });

  // sorğu → nc_leads
  window.ncLead = function (kind, d) {
    d = d || {}; var o = {};
    Object.keys(d).forEach(function (k) { if (['name', 'phone', 'email', 'msg', 'unit', 'slot'].indexOf(k) < 0) o[k] = d[k]; });
    var body = { kind: String(kind || 'sorğu').slice(0, 60), name: String(d.name || '').slice(0, 120), phone: String(d.phone || '').slice(0, 40), email: String(d.email || '').slice(0, 120) || null, msg: String(d.msg || d.note || '').slice(0, 2000) || null, unit: String(d.unit || '').slice(0, 60) || null, slot: String(d.slot || d.date || '').slice(0, 80) || null, data: Object.assign(o, { page: location.hash.slice(0, 120) }) };
    return fetch(U + '/rest/v1/nc_leads', { method: 'POST', headers: Object.assign({ Prefer: 'return=minimal' }, H), body: JSON.stringify(body) }).catch(function () { });
  };

  // mətn / bölmə əvəzləmələri
  function applyText(root, T) {
    if (!T || !root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, L = [];
    while ((n = w.nextNode())) L.push(n);
    L.forEach(function (n) {
      var o = n.__o || n.nodeValue, k = o.trim(); if (!k) return;
      if (Object.prototype.hasOwnProperty.call(T, k)) { n.__o = o; n.nodeValue = o.replace(k, T[k]); }
    });
  }
  window.ncApplyText = applyText;
  window.ncAfterRender = function (route, main) {
    var S = (window.NC_REMOTE || {}).site || {};
    applyText(main, S.txt);
    var hid = S.hide || {};
    Array.prototype.forEach.call(main.children, function (el, i) {
      var key = route + ':' + i; el.setAttribute('data-ncsec', key);
      if (hid[key]) { if (EDIT) el.classList.add('nce-hidden'); else el.style.display = 'none'; }
    });
    if (window.ncEditHook) try { window.ncEditHook(route, main); } catch (e) { console.error(e); }
  };

  function maint(S) {
    var m = S.maintText || 'Sayt yenilənir. Tezliklə qayıdacağıq.';
    document.body.innerHTML = '<div style="min-height:100vh;display:grid;place-items:center;background:#141712;color:#ece4d2;font:17px \'NC Text\',system-ui,sans-serif;text-align:center;padding:24px"><div style="display:grid;gap:18px;justify-items:center;max-width:460px"><img src="' + (window.IMG && IMG.logo || '') + '" style="width:84px;height:auto" alt=""><h1 style="margin:0;font:400 64px/1 \'NC Display\',serif;text-transform:uppercase">Nizami City</h1><p style="margin:0;opacity:.75;line-height:1.6"></p><a href="tel:*0788" style="color:#c6a66b;text-decoration:none;font-weight:600">*0788</a></div></div>';
    document.querySelector('p').textContent = m;
  }

  tmo(Promise.all([kv, un]), 4500).then(function (res) {
    var R = { site: {}, blog: null, cfg: {}, units: [] };
    if (res) {
      (res[0] || []).forEach(function (r) { if (r.key === 'nc_site') R.site = r.value || {}; else if (r.key === 'nc_blog') R.blog = r.value; else if (r.key === 'nc_cfg') R.cfg = r.value || {}; });
      R.units = Array.isArray(res[1]) ? res[1] : [];
    }
    window.NC_REMOTE = R; var S = R.site;
    if (S.img) Object.keys(S.img).forEach(function (k) { if (S.img[k]) window.IMG[k] = S.img[k]; });
    window.NC_OFF = S.off || {};
    if (S.maint && !EDIT) return maint(S);
    try { window.__NC_START(); } catch (e) { console.error(e); }
    Object.keys(window.NC_OFF).forEach(function (k) { if (window.NC_OFF[k]) document.querySelectorAll('header a[href="#' + k + '"], footer a[href="#' + k + '"], #menu a[href="#' + k + '"]').forEach(function (a) { a.style.display = 'none'; }); });
    applyText(document.querySelector('header'), S.txt); applyText(document.querySelector('footer'), S.txt);
    if (S.banner && S.banner.on && S.banner.t && !EDIT) {
      var b = document.createElement('div'); b.className = 'ncs-banner';
      b.innerHTML = '<span></span>' + (S.banner.url ? '<a></a>' : '') + '<button aria-label="Bağla">×</button>';
      b.querySelector('span').textContent = S.banner.t;
      if (S.banner.url) { var a = b.querySelector('a'); a.href = S.banner.url; a.textContent = S.banner.btn || 'Ətraflı'; }
      b.querySelector('button').onclick = function () { b.remove(); };
      document.body.appendChild(b);
    }
    if (EDIT) { var s = document.createElement('script'); s.src = '/nc/site-edit.js?v=' + Date.now(); document.body.appendChild(s); }
  });
})();
