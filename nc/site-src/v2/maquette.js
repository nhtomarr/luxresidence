/* Nizami City — memar maketi üslubunda 3D baş plan (three r128). window.ncMaquette(host, {onPick, onHover, tip, labels}) */
window.ncMaquette = function (host, o) {
  o = o || {};
  const T = window.THREE; if (!T || !window.NC_BLD) return null;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowGPU = (navigator.hardwareConcurrency || 4) <= 4 && /Android|iPhone|iPad/.test(navigator.userAgent);
  let ren;
  try { ren = new T.WebGLRenderer({ antialias: !lowGPU, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  ren.setPixelRatio(Math.min(lowGPU ? 1.5 : 2, devicePixelRatio || 1));
  ren.shadowMap.enabled = true; ren.shadowMap.type = T.PCFSoftShadowMap;
  ren.outputEncoding = T.sRGBEncoding; ren.toneMapping = T.ACESFilmicToneMapping; ren.toneMappingExposure = 1.05;
  host.prepend(ren.domElement);
  const S = new T.Scene();
  const FH = 7.2, NF = window.NC_FLOORS || 10, POD = 8, H = NF * FH;
  const C = { base: 0x0f110d, plate: 0x1c2019, road: 0x0b0d0a, court: 0xbdb39f, white: 0xf1ebde, pod: 0xd6ccb8, roof: 0xcfc5b1, brass: 0xc6a66b, ctx: 0x20251d, tree: 0x8c9077, hover: 0xf1dfb6 };
  const lin = c => new T.Color(c).convertSRGBToLinear();
  const mat = (c, r = .92, extra) => new T.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: r, metalness: 0 }, extra || {}));

  // fasad "cızıqları" — maket kimi incə pəncərə şəbəkəsi
  function scoreTex(cols, rows, dim) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, 512, 512);
    const cw = 512 / cols, rh = 512 / rows;
    x.fillStyle = dim ? 'rgba(90,82,66,.22)' : 'rgba(90,82,66,.16)';
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) x.fillRect(k * cw + cw * .22, r * rh + rh * .2, cw * .56, rh * .58);
    x.fillStyle = 'rgba(90,82,66,.10)'; for (let r = 0; r <= rows; r++) x.fillRect(0, r * rh - 1, 512, 2);
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 8; t.encoding = T.sRGBEncoding; return t;
  }
  const tex = scoreTex(8, NF, false), texW = scoreTex(8, NF, true);

  // zəmin, məhəllə lövhəsi, küçələr
  const base = new T.Mesh(new T.PlaneGeometry(4000, 4000), mat(C.base, 1)); base.rotation.x = -Math.PI / 2; base.receiveShadow = true; S.add(base);
  const plate = new T.Mesh(new T.BoxGeometry(620, 4, 520), mat(C.plate, .95)); plate.position.y = 2; plate.receiveShadow = true; S.add(plate);
  const court = new T.Mesh(new T.BoxGeometry(330, 1, 250), mat(C.court, .95)); court.position.set(-12, 4.5, 0); court.receiveShadow = true; S.add(court);
  const play = new T.Mesh(new T.CylinderGeometry(30, 30, 1.6, 64), mat(C.brass, .55, { metalness: .2 })); play.position.set(-30, 5.4, 0); play.receiveShadow = true; S.add(play);
  [[0, -300, 1400, 40], [0, 300, 1400, 40], [-345, 0, 40, 1400], [335, 0, 40, 1400]].forEach(([x, z, w, d]) => { const m = new T.Mesh(new T.PlaneGeometry(w, d), mat(C.road, 1)); m.rotation.x = -Math.PI / 2; m.position.set(x, .3, z); m.receiveShadow = true; S.add(m); });
  // ağaclar — maket kürələri
  const tg = new T.SphereGeometry(1, 14, 10), tm = mat(C.tree, 1);
  const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const tree = (x, z, r) => { const m = new T.Mesh(tg, tm); m.scale.setScalar(r); m.position.set(x, 5 + r, z); m.castShadow = true; S.add(m); };
  for (let i = 0; i < 30; i++) { const a = rnd() * Math.PI * 2, rr = 60 + rnd() * 62; tree(-12 + Math.cos(a) * rr * 1.25, Math.sin(a) * rr * .78, 3.5 + rnd() * 3); }
  for (let i = -7; i <= 7; i++) { tree(i * 90, -276, 4.5); tree(i * 90, 276, 4.5); }
  // kontekst — şəhər blokları
  const cm = mat(C.ctx, 1);
  for (let i = 0; i < 26; i++) {
    const side = i % 4, w = 60 + rnd() * 90, d = 50 + rnd() * 80, h = 14 + rnd() * 60;
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), cm); const off = -620 + (i >> 2) * 210 + rnd() * 40;
    const p = [[off, -420], [off, 420], [-500, off], [490, off]][side]; m.position.set(p[0], h / 2, p[1]); m.castShadow = m.receiveShadow = true; S.add(m);
  }

  // binalar
  const blds = [], picks = [];
  NC_BLD.forEach(b => {
    const g = new T.Group(); g.position.set(b.x, 4, b.z); g.userData.b = b;
    if (b.st === 'n') {
      const geo = new T.BoxGeometry(b.w, H + POD, b.d);
      const m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: lin(C.brass), transparent: true, opacity: .06, depthWrite: false })); m.position.y = (H + POD) / 2; g.add(m);
      const e = new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: lin(C.brass), transparent: true, opacity: .7 })); e.position.y = m.position.y; g.add(e);
      for (let f = 1; f < NF; f += 3) { const r = new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(b.w, b.d)), new T.LineBasicMaterial({ color: lin(C.brass), transparent: true, opacity: .22 })); r.rotation.x = -Math.PI / 2; r.position.y = POD + f * FH; g.add(r); }
      g.children.forEach(c => { c.userData.op = c.material.opacity; });
      g.userData.pick = m; g.userData.hl = [];
    } else {
      const w = b.st === 'w';
      const pod = new T.Mesh(new T.BoxGeometry(b.w + 2, POD, b.d + 2), mat(C.pod, .9)); pod.position.y = POD / 2; pod.castShadow = pod.receiveShadow = true; g.add(pod);
      const side = len => { const t = (w ? texW : tex).clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(len / 60)), 1); return mat(C.white, .86, { map: t }); };
      const roof = mat(C.roof, .95);
      const mats = [side(b.d), side(b.d), roof, roof, side(b.w), side(b.w)];
      const hb = w ? H - FH * 2 : H; // tikilən binalarda yuxarı iki mərtəbə hələ açıq karkasdır
      const body = new T.Mesh(new T.BoxGeometry(b.w, hb, b.d), mats); body.position.y = POD + hb / 2; body.castShadow = body.receiveShadow = true; g.add(body);
      if (w) {
        const fr = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(b.w, FH * 2, b.d, Math.round(b.w / 16), 2, Math.round(b.d / 16))), new T.LineBasicMaterial({ color: lin(C.white), transparent: true, opacity: .55 }));
        fr.position.y = POD + hb + FH; g.add(fr);
        const mast = new T.Mesh(new T.BoxGeometry(2, H + 46, 2), mat(C.brass, .5, { metalness: .3 })); mast.position.set(b.w / 2 + 12, (H + 46) / 2, 0); mast.castShadow = true; g.add(mast);
        const jib = new T.Group(); const arm = new T.Mesh(new T.BoxGeometry(120, 1.6, 1.6), mast.material); arm.position.x = -34; jib.add(arm); jib.position.set(b.w / 2 + 12, H + 46, 0); g.add(jib); g.userData.jib = jib;
      } else {
        const par = new T.Mesh(new T.BoxGeometry(b.w + 1.2, 1.8, b.d + 1.2), roof); par.position.y = POD + H + .9; g.add(par);
        const tech = new T.Mesh(new T.BoxGeometry(b.w * .26, 7, b.d * .34), mat(C.white, .9)); tech.position.set(b.w * .2, POD + H + 3.5, 0); tech.castShadow = true; g.add(tech);
      }
      g.userData.pick = body; g.userData.hl = mats.concat([pod.material]);
    }
    S.add(g); blds.push(g); picks.push(g.userData.pick);
  });

  // işıq — isti axşamüstü
  S.add(new T.HemisphereLight(0xfff4e2, 0x14170f, .5));
  const sun = new T.DirectionalLight(0xffe2b8, 1.5); sun.position.set(-520, 640, 380); sun.castShadow = true;
  sun.shadow.mapSize.set(lowGPU ? 1024 : 2048, lowGPU ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -560, right: 560, top: 560, bottom: -560, near: 10, far: 2400 }); sun.shadow.bias = -.0004; sun.shadow.radius = 4;
  S.add(sun);
  const fill = new T.DirectionalLight(0xc8d2e6, .25); fill.position.set(600, 300, -500); S.add(fill);

  // kamera və idarə
  const cam = new T.PerspectiveCamera(28, 1, 10, 8000), tgt = new T.Vector3(-10, 30, 0);
  let th = -0.72, ph = 1.32, dist = 2300, dirty = true, alive = true, idle = 0, vis = false, hov = null, sel = null;
  const goal = { th: -0.62, ph: 0.62, dist: 1320 };
  const place = () => { cam.position.set(tgt.x + dist * Math.cos(ph) * Math.sin(th), tgt.y + dist * Math.sin(ph), tgt.z + dist * Math.cos(ph) * Math.cos(th)); cam.lookAt(tgt); dirty = true; };
  const size = () => { const W = host.clientWidth, Hh = host.clientHeight; if (!W || !Hh) return; ren.setSize(W, Hh, false); cam.aspect = W / Hh; cam.fov = W < 700 ? 36 : 28; cam.updateProjectionMatrix(); dirty = true; };
  const ro = new ResizeObserver(size); ro.observe(host); size(); place();

  // etiketlər
  const lab = {};
  if (o.labels) blds.forEach(g => { const b = g.userData.b, d = document.createElement('span'); d.className = 'mq-l'; d.textContent = b.id; d.style.cssText = 'position:absolute;left:0;top:0;font:400 26px/1 var(--fd);color:#ece4d2;pointer-events:none;transform:translate(-50%,-100%);transition:opacity .4s;will-change:transform;text-shadow:0 1px 10px rgba(0,0,0,.35)'; host.appendChild(d); lab[b.id] = d; });
  const v3 = new T.Vector3();
  const placeLabels = () => { if (!o.labels) return; const W = host.clientWidth, Hh = host.clientHeight; blds.forEach(g => { const b = g.userData.b; v3.set(b.x, POD + H + 26, b.z).project(cam); const d = lab[b.id]; d.style.transform = `translate(${(v3.x * .5 + .5) * W}px,${(-v3.y * .5 + .5) * Hh}px) translate(-50%,-100%)`; }); };

  const setHover = id => {
    if (hov === id) return; const prev = blds.find(g => g.userData.b.id === hov); if (prev) { prev.userData.lift = 0; recolor(prev, false); }
    hov = id; const g = blds.find(g => g.userData.b.id === id); if (g) { g.userData.lift = 1; recolor(g, true); }
    Object.keys(lab).forEach(k => lab[k].style.opacity = !id || k === id ? 1 : .35); dirty = true; o.onHover && o.onHover(id);
  };
  function recolor(g, on) {
    const b = g.userData.b; if (b.st === 'n') { g.children.forEach(c => { if (c.material) c.material.opacity = on ? Math.min(1, c.userData.op * 2.4) : c.userData.op; }); return; }
    const L = g.userData.hl; L.forEach((m, i) => { m.color.copy(lin(m.map ? (on ? C.hover : C.white) : i === L.length - 1 ? (on ? 0xe6d3a8 : C.pod) : (on ? 0xe8d6ad : C.roof))); });
  }
  const ray = new T.Raycaster(), v2 = new T.Vector2(), el = ren.domElement;
  const hit = e => { const r = el.getBoundingClientRect(); v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, cam); const h = ray.intersectObjects(picks)[0]; return h ? blds.find(g => g.userData.pick === h.object).userData.b : null; };
  let down = null, moved = 0;
  el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, th, ph }; moved = 0; idle = 0; });
  const up = () => { down = null; }; addEventListener('pointerup', up);
  el.addEventListener('pointermove', e => {
    if (down) { const dx = e.clientX - down.x, dy = e.clientY - down.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); th = down.th - dx * .005; ph = Math.min(1.3, Math.max(.2, down.ph + dy * .0035)); goal.th = th; goal.ph = ph; place(); idle = 0; return; }
    const b = hit(e); el.style.cursor = b ? 'pointer' : 'grab'; setHover(b ? b.id : null);
    if (o.tip) { if (b) { const r = host.getBoundingClientRect(); o.tip.style.left = (e.clientX - r.left) + 'px'; o.tip.style.top = (e.clientY - r.top) + 'px'; o.tip.innerHTML = o.tipHtml ? o.tipHtml(b) : 'Bina ' + b.id; o.tip.style.opacity = 1; } else o.tip.style.opacity = 0; }
  });
  el.addEventListener('pointerleave', () => { setHover(sel); if (o.tip) o.tip.style.opacity = 0; });
  el.addEventListener('click', e => { if (moved > 6) return; const b = hit(e); if (b && o.onPick) o.onPick(b.id); });
  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && !intro) { intro = performance.now(); } }); io.observe(host);
  let intro = 0, t0 = performance.now();
  const ease = k => 1 - Math.pow(1 - k, 3);
  const from = { th: th, ph: ph, dist: dist };
  (function loop(t) {
    if (!alive) return; requestAnimationFrame(loop); const dt = Math.min(.05, (t - t0) / 1000); t0 = t; if (!vis) return;
    if (intro && intro > 0) { const k = RM ? 1 : Math.min(1, (t - intro) / 2600), e = ease(k); th = from.th + (goal.th - from.th) * e; ph = from.ph + (goal.ph - from.ph) * e; dist = from.dist + (goal.dist - from.dist) * e; place(); if (k >= 1) intro = -1; }
    idle += dt; if (intro < 0 && !down && idle > 2.5 && !RM && !hov) { th += dt * .045; goal.th = th; place(); }
    blds.forEach(g => { const L = (g.userData.lift || 0) * 6, y = 4 + L; if (Math.abs(g.position.y - y) > .05) { g.position.y += (y - g.position.y) * Math.min(1, dt * 10); dirty = true; } if (g.userData.jib) { g.userData.jib.rotation.y += dt * .12; dirty = true; } });
    if (dirty) { ren.render(S, cam); placeLabels(); dirty = false; }
  })(t0);
  return {
    select(id) { sel = id; setHover(id); },
    zoom(k) { dist = Math.min(2800, Math.max(700, dist * k)); goal.dist = dist; place(); idle = 0; },
    dispose() { alive = false; ro.disconnect(); io.disconnect(); removeEventListener('pointerup', up); ren.dispose(); S.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) [].concat(x.material).forEach(m => { m.map && m.map.dispose(); m.dispose(); }); }); el.remove(); Object.values(lab).forEach(d => d.remove()); }
  };
};
