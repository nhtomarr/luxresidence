/* Nizami City — işıqlı memar maketi (three r128). window.ncMaq(host, o) → idarə obyekti
   o: { onPick(id), tipHtml(b), labels, showSt (kran/tikinti göstər), interactive, onCap(text) } */
window.ncMaq = function (host, o) {
  o = o || {};
  const T = window.THREE; if (!T || !window.NC_BLD) return null;
  const NOMO = () => document.documentElement.classList.contains('nomo') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mob = matchMedia('(max-width:700px)').matches, lowGPU = mob || (navigator.hardwareConcurrency || 4) <= 4;
  let ren;
  try { ren = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }); } catch (e) { return null; }
  if (!ren.getContext()) return null;
  ren.setPixelRatio(Math.min(lowGPU ? 1.5 : 2, devicePixelRatio || 1));
  ren.shadowMap.enabled = true; ren.shadowMap.type = T.PCFSoftShadowMap;
  ren.outputEncoding = T.sRGBEncoding; ren.toneMapping = T.ACESFilmicToneMapping; ren.toneMappingExposure = 1.08;
  ren.setClearColor(0x000000, 0);
  const el = ren.domElement; el.className = 'mq-cv'; host.prepend(el);
  const S = new T.Scene();
  const NF = window.NC_FLOORS || 10, FH = 7.4, POD = 9, H = (NF - 1) * FH;
  const lin = c => new T.Color(c).convertSRGBToLinear();
  const mat = (c, r = .9, x) => new T.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: r, metalness: 0 }, x || {}));
  const C = { ground: 0xe4e6dc, plate: 0xd9ddcd, road: 0xc6c8bd, court: 0xe9e3d3, lawn: 0xb3c291, play: 0xd8bf8e, tree: 0x93a873, ctx: 0xeef0e8, pod: 0x4a573a, roof: 0xd6d2c6, crane: 0xd9a03a, hl: 0x6f8a3c };
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

  // fasad: krem keramoqranit, tünd profilli pəncərələr, terrakota panellər (renderlərdəki kimi)
  function facade(rows) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d');
    const e = document.createElement('canvas'); e.width = 512; e.height = 512; const y = e.getContext('2d');
    x.fillStyle = '#efe9dc'; x.fillRect(0, 0, 512, 512); y.fillStyle = '#000'; y.fillRect(0, 0, 512, 512);
    x.strokeStyle = 'rgba(120,108,88,.16)'; x.lineWidth = 1;
    for (let i = 0; i <= 512; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); }
    const cols = 8, rh = 512 / rows, cw = 512 / cols;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const gx = k * cw + cw * .17, gy = r * rh + rh * .16, gw = cw * .66, gh = rh * .66;
      const gr = x.createLinearGradient(gx, gy, gx + gw, gy + gh); gr.addColorStop(0, '#9fb0b8'); gr.addColorStop(.55, '#7d909a'); gr.addColorStop(1, '#6c7f88');
      x.fillStyle = gr; x.fillRect(gx, gy, gw, gh);
      x.strokeStyle = '#4a4943'; x.lineWidth = 3; x.strokeRect(gx, gy, gw, gh); x.fillStyle = '#4a4943'; x.fillRect(gx + gw / 2 - 1, gy, 2, gh);
      if (k % 3 === 1) { x.fillStyle = '#b0603f'; x.fillRect(gx + 4, gy + 4, gw - 8, gh * .28); }
      if (rnd() < .46) { y.fillStyle = rnd() < .5 ? '#ffcf86' : '#ffe2b0'; y.fillRect(gx + 2, gy + 2, gw - 4, gh - 4); }
    }
    const mk = cv => { const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 8; t.encoding = T.sRGBEncoding; return t; };
    return [mk(c), mk(e)];
  }
  function podTex() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    const e = document.createElement('canvas'); e.width = 256; e.height = 64; const y = e.getContext('2d');
    x.fillStyle = '#39432d'; x.fillRect(0, 0, 256, 64); y.fillStyle = '#000'; y.fillRect(0, 0, 256, 64);
    for (let k = 0; k < 8; k++) { x.fillStyle = '#9fb2b8'; x.fillRect(k * 32 + 3, 8, 26, 50); x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(k * 32 + 3, 8, 8, 50); y.fillStyle = '#ffd99a'; y.fillRect(k * 32 + 3, 8, 26, 50); }
    const mk = cv => { const t = new T.CanvasTexture(cv); t.wrapS = T.RepeatWrapping; t.encoding = T.sRGBEncoding; return t; };
    return [mk(c), mk(e)];
  }
  const [fTex, fEm] = facade(NF - 1), [pTex, pEm] = podTex();
  const emissives = [];

  // zəmin
  const ground = new T.Mesh(new T.CircleGeometry(2600, 64), mat(C.ground, 1)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; S.add(ground);
  // iki ayrı məhəllə, aralarında küçə; hər birinin ortasında öz parkı
  const roadM = mat(C.road, 1);
  [[0, -205, 1800, 44], [0, 205, 1800, 44], [0, 0, 44, 1800], [-440, 0, 44, 1800], [440, 0, 44, 1800]].forEach(([x, z, w, d]) => { const m = new T.Mesh(new T.PlaneGeometry(w, d), roadM); m.rotation.x = -Math.PI / 2; m.position.set(x, .4, z); m.receiveShadow = true; S.add(m); });
  const plM = mat(C.plate, .95), crM = mat(C.court, .95), lawnM = mat(C.lawn, 1), plyM = mat(C.play, .7);
  const tg = new T.IcosahedronGeometry(1, 1), tm = mat(C.tree, 1), trG = new T.CylinderGeometry(.12, .16, 1, 6), trM = mat(0x8a7a62, 1);
  const tree = (x, z, r) => { const g = new T.Group(); const c = new T.Mesh(tg, tm); c.scale.setScalar(r); c.position.y = r * 1.7; c.castShadow = true; const tk = new T.Mesh(trG, trM); tk.scale.set(r, r * 1.4, r); tk.position.y = r * .7; g.add(tk, c); g.position.set(x, 3, z); S.add(g); };
  const lampM = new T.MeshStandardMaterial({ color: lin(0xf6f1e4), emissive: lin(0xffd38a), emissiveIntensity: 0 }); emissives.push([lampM, 2.2]);
  const lampG = new T.SphereGeometry(2.2, 10, 8);
  [-1, 1].forEach(sx => {
    const cx = sx * 222, px = sx * 200; // məhəllənin və parkın mərkəzi (park açıq tərəfə — küçəyə doğru)
    const pl = new T.Mesh(new T.BoxGeometry(380, 2, 330), plM); pl.position.set(cx + sx * 10, 1, 0); pl.receiveShadow = true; S.add(pl);
    const ct = new T.Mesh(new T.BoxGeometry(230, 1, 160), crM); ct.position.set(px, 2.5, 0); ct.receiveShadow = true; S.add(ct);
    [[-50, -38, 80, 46], [-50, 38, 80, 46], [52, -38, 70, 46], [52, 38, 70, 46]].forEach(([x, z, w, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, 1.2, d), lawnM); m.position.set(px + sx * x, 3.2, z); m.receiveShadow = true; S.add(m); });
    const ply = new T.Mesh(new T.CylinderGeometry(22, 22, 1.6, 48), plyM); ply.position.set(px, 3.4, 0); ply.receiveShadow = true; S.add(ply);
    for (let i = 0; i < 22; i++) { const a = rnd() * Math.PI * 2, rr = 42 + rnd() * 40; tree(px + Math.cos(a) * rr * 1.3, Math.sin(a) * rr * .62, 3.5 + rnd() * 2.6); }
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const m = new T.Mesh(lampG, lampM); m.position.set(px + Math.cos(a) * 36, 9, Math.sin(a) * 36); S.add(m); }
  });
  for (let i = -9; i <= 9; i++) { if (Math.abs(i) < 1) continue; tree(i * 90, -232, 5); tree(i * 90, 232, 5); }
  for (let i = -5; i <= 5; i++) { tree(-26, i * 70, 4.5); tree(26, i * 70, 4.5); }
  // şəhər konteksti — ağ maket blokları
  const cm = mat(C.ctx, 1);
  for (let i = 0; i < 30; i++) {
    const side = i % 4, w = 60 + rnd() * 90, d = 50 + rnd() * 80, h = 14 + rnd() * 70;
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), cm), off = -720 + (i >> 2) * 200 + rnd() * 40;
    const p = [[off, -330], [off, 340], [-600, off], [600, off]][side]; m.position.set(p[0], h / 2, p[1]); m.castShadow = m.receiveShadow = true; S.add(m);
  }

  // binalar
  const blds = [], picks = [];
  NC_BLD.filter(b => b.st !== 'n').forEach(b => {
    const g = new T.Group(); g.position.set(b.x, 2, b.z); g.userData.b = b; const mats = [];
    const pt = pTex.clone(), pe = pEm.clone(); pt.needsUpdate = pe.needsUpdate = true; pt.repeat.set(b.w / 40, 1); pe.repeat.copy(pt.repeat);
    const pm = new T.MeshStandardMaterial({ map: pt, emissive: lin(0xffffff), emissiveMap: pe, emissiveIntensity: 0, roughness: .35, metalness: .15 }); emissives.push([pm, .9]); mats.push(pm);
    const pod = new T.Mesh(new T.BoxGeometry(b.w + 2, POD, b.d + 2), pm); pod.position.y = POD / 2; pod.castShadow = pod.receiveShadow = true; g.add(pod);
    const side = len => { const t = fTex.clone(), e = fEm.clone(); t.needsUpdate = e.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(len / 62)), 1); e.repeat.copy(t.repeat); const m = new T.MeshStandardMaterial({ map: t, emissive: lin(0xffffff), emissiveMap: e, emissiveIntensity: 0, roughness: .7 }); emissives.push([m, 1.1]); mats.push(m); return m; };
    const roof = mat(C.roof, .95); mats.push(roof);
    const body = new T.Mesh(new T.BoxGeometry(b.w, H, b.d), [side(b.d), side(b.d), roof, roof, side(b.w), side(b.w)]);
    body.position.y = POD + H / 2; body.castShadow = body.receiveShadow = true; g.add(body);
    const par = new T.Mesh(new T.BoxGeometry(b.w + 1.4, 2, b.d + 1.4), roof); par.position.y = POD + H + 1; g.add(par);
    const tech = new T.Mesh(new T.BoxGeometry(b.w * .26, 6, b.d * .34), roof); tech.position.set(b.w * .2, POD + H + 3, 0); tech.castShadow = true; g.add(tech);
    if (o.showSt && b.st === 'w') {
      const cmM = mat(C.crane, .5); mats.push(cmM);
      const mast = new T.Mesh(new T.BoxGeometry(2.2, H + 46, 2.2), cmM); mast.position.set(b.w / 2 + 12, (H + 46) / 2, 0); mast.castShadow = true; g.add(mast);
      const jib = new T.Group(); const arm = new T.Mesh(new T.BoxGeometry(120, 1.8, 1.8), cmM); arm.position.x = -34; jib.add(arm); jib.position.set(b.w / 2 + 12, H + 46, 0); g.add(jib); g.userData.jib = jib;
    }
    // mərtəbə vurğusu
    const slab = new T.Mesh(new T.BoxGeometry(b.w + 4, FH * .96, b.d + 4), new T.MeshBasicMaterial({ color: lin(C.hl), transparent: true, opacity: .62, depthWrite: false }));
    slab.visible = false; g.add(slab); g.userData.slab = slab;
    const ring = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(b.w + 4.4, FH, b.d + 4.4)), new T.LineBasicMaterial({ color: lin(0xffffff) })); slab.add(ring);
    g.userData.pick = body; g.userData.mats = mats; S.add(g); blds.push(g); picks.push(body, pod); pod.userData.g = g; body.userData.g = g;
  });

  // işıq
  const hemi = new T.HemisphereLight(0xfdf9ef, 0x9a947f, .62); S.add(hemi);
  const sun = new T.DirectionalLight(0xfff1dc, 1.25); sun.castShadow = true; S.add(sun); S.add(sun.target);
  const sm = lowGPU ? 1024 : 2048; sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -640, right: 640, top: 640, bottom: -640, near: 10, far: 3200 }); sun.shadow.bias = -.0005; sun.shadow.radius = 3;
  const moon = new T.DirectionalLight(0x9fb2d8, 0); moon.position.set(400, 700, -300); S.add(moon);
  let night = false, sunPos = { az: 200, el: 48 };
  function applyLight() {
    const a = sunPos.az * Math.PI / 180, e = Math.max(1, sunPos.el) * Math.PI / 180, r = 1500;
    sun.position.set(Math.sin(a) * Math.cos(e) * r, Math.sin(e) * r, -Math.cos(a) * Math.cos(e) * r);
    const day = night ? 0 : Math.max(0, Math.min(1, sunPos.el / 22));
    sun.intensity = night ? 0 : .25 + 1.35 * day; sun.color.setHSL(.08, .55 + .1 * (1 - day), .6 + .3 * day);
    hemi.intensity = night ? .16 : .26 + .3 * day; hemi.color.set(night ? 0x4a5878 : 0xfdf9ef); hemi.groundColor.set(night ? 0x181b14 : 0x9a947f);
    moon.intensity = night ? .28 : 0;
    const em = night ? 1 : sunPos.el < 6 ? .55 : 0;
    emissives.forEach(([m, k]) => { m.emissiveIntensity = em * k; });
    host.classList.toggle('mq-night', night); host.classList.toggle('mq-dusk', !night && sunPos.el < 10);
    dirty = true;
  }

  // kamera
  const cam = new T.PerspectiveCamera(30, 1, 10, 9000), tgt = new T.Vector3(0, 30, 0);
  let th = -0.9, ph = 1.25, dist = 2500, dirty = true, alive = true, idle = 0, vis = false, hov = null, sel = null, anim = null, fl = null;
  const HOME = { tgt: [0, 30, 0], th: -0.55, ph: 0.62, dist: mob ? 1350 : 1450 };
  const place = () => { cam.position.set(tgt.x + dist * Math.cos(ph) * Math.sin(th), tgt.y + dist * Math.sin(ph), tgt.z + dist * Math.cos(ph) * Math.cos(th)); cam.lookAt(tgt); dirty = true; };
  const size = () => { const W = host.clientWidth, Hh = host.clientHeight; if (!W || !Hh) return; ren.setSize(W, Hh, false); cam.aspect = W / Hh; cam.fov = W < 700 ? 38 : 30; cam.updateProjectionMatrix(); dirty = true; };
  const ro = new ResizeObserver(size); ro.observe(host); size(); place();
  const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const angD = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
  function fly(to, ms, done) {
    const fr = { tgt: tgt.clone(), th, ph, dist }; const t0 = performance.now(); ms = NOMO() ? 1 : ms;
    anim = t => { const k = Math.min(1, (t - t0) / ms), e = ease(k); tgt.lerpVectors(fr.tgt, new T.Vector3(...to.tgt), e); th = fr.th + angD(fr.th, to.th) * e; ph = fr.ph + (to.ph - fr.ph) * e; dist = fr.dist + (to.dist - fr.dist) * e; place(); if (k >= 1) { anim = null; done && done(); } };
  }

  // etiketlər
  const lab = {};
  if (o.labels !== false) blds.forEach(g => { const b = g.userData.b, d = document.createElement('button'); d.type = 'button'; d.className = 'mq-l'; d.innerHTML = '<b>' + b.id + '</b>'; d.setAttribute('aria-label', 'Bina ' + b.id); d.onclick = () => o.onPick && o.onPick(b.id); d.onmouseenter = () => setHover(b.id); d.onmouseleave = () => setHover(sel); host.appendChild(d); lab[b.id] = d; });
  const pv = new T.Vector3();
  const placeLabels = () => { const W = host.clientWidth, Hh = host.clientHeight; blds.forEach(g => { const b = g.userData.b, d = lab[b.id]; if (!d) return; pv.set(b.x, POD + H + 30 + g.position.y, b.z).project(cam); d.style.transform = `translate(${(pv.x * .5 + .5) * W}px,${(-pv.y * .5 + .5) * Hh}px) translate(-50%,-100%)`; d.style.display = pv.z > 1 ? 'none' : ''; }); };

  function tint(g, mode) { // mode: 0 normal, 1 hover, 2 sönük
    g.userData.mats.forEach(m => { m.transparent = mode === 2; m.opacity = mode === 2 ? .28 : 1; m.depthWrite = mode !== 2; if (m.emissive && !m.emissiveMap) m.emissive.set(mode === 1 ? 0x2c3a14 : 0x000000); m.needsUpdate = true; });
    g.userData.lift = mode === 1 ? 1 : 0;
  }
  function restyle() { blds.forEach(g => { const id = g.userData.b.id; tint(g, sel && fl == null && id !== sel && id !== hov ? 2 : sel && fl != null && id !== sel ? 2 : id === hov ? 1 : 0); }); Object.keys(lab).forEach(k => lab[k].classList.toggle('on', k === hov || k === sel)); dirty = true; }
  const setHover = id => { if (hov === id) return; hov = id; restyle(); o.onHover && o.onHover(id); };
  const ray = new T.Raycaster(), v2 = new T.Vector2();
  const hit = e => { const r = el.getBoundingClientRect(); v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, cam); const h = ray.intersectObjects(picks)[0]; return h ? h.object.userData.g.userData.b : null; };
  let down = null, moved = 0;
  const stopTour = () => { if (tour) { tour = null; anim = null; o.onCap && o.onCap(null); } };
  el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, th, ph }; moved = 0; idle = 0; stopTour(); anim = null; });
  const up = () => { down = null; }; addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('pointermove', e => {
    if (down) { const dx = e.clientX - down.x, dy = e.clientY - down.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); th = down.th - dx * .006; if (e.pointerType !== 'touch') ph = Math.min(1.35, Math.max(.12, down.ph + dy * .004)); place(); idle = 0; return; }
    if (e.pointerType === 'touch') return;
    const b = hit(e); el.style.cursor = b ? 'pointer' : 'grab'; setHover(b ? b.id : sel);
    if (o.tip) { if (b && o.tipHtml) { const r = host.getBoundingClientRect(); o.tip.style.transform = `translate(${e.clientX - r.left + 14}px,${e.clientY - r.top + 14}px)`; o.tip.innerHTML = o.tipHtml(b); o.tip.classList.add('on'); } else o.tip.classList.remove('on'); }
  });
  el.addEventListener('pointerleave', () => { setHover(sel); o.tip && o.tip.classList.remove('on'); });
  el.addEventListener('click', e => { if (moved > 6) return; const b = hit(e); if (b && o.onPick) o.onPick(b.id); });
  el.addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey || document.fullscreenElement)) { o.onWheelHint && o.onWheelHint(); return; } e.preventDefault(); api.zoom(e.deltaY > 0 ? 1.1 : .9); }, { passive: false });
  const io = new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) dirty = true; if (vis && !introDone) { introDone = true; fly(o.start || HOME, 2600); } }); io.observe(host);
  let introDone = false, t0 = performance.now(), tour = null;

  (function loop(t) {
    if (!alive) return; requestAnimationFrame(loop); const dt = Math.min(.05, (t - t0) / 1000); t0 = t; if (!vis) return;
    if (anim) anim(t);
    idle += dt; if (!anim && !tour && !down && idle > 3 && !NOMO() && !hov && o.autoRotate !== false) { th += dt * .04; place(); }
    blds.forEach(g => { const y = 2 + (g.userData.lift || 0) * 5; if (Math.abs(g.position.y - y) > .05) { g.position.y += (y - g.position.y) * Math.min(1, dt * 10); dirty = true; } if (g.userData.jib && !NOMO()) { g.userData.jib.rotation.y += dt * .12; dirty = true; } });
    const sl = blds.find(g => g.userData.slab.visible); if (sl) { sl.userData.slab.material.opacity = .5 + Math.sin(t / 380) * .14; dirty = true; }
    if (dirty) { ren.render(S, cam); placeLabels(); dirty = false; }
  })(t0);

  const TOUR = [
    { tgt: [0, 30, 0], th: -0.55, ph: .62, dist: 1500, cap: '9 bina, qapalı həyət' },
    { tgt: [-235, 20, 0], th: .5, ph: .7, dist: 680, cap: 'A, B, C binaları — ortada öz parkı' },
    { tgt: [-200, 0, 0], th: 1.1, ph: .5, dist: 420, cap: 'Avtomobilsiz qapalı həyət' },
    { tgt: [235, 20, 0], th: -.5, ph: .7, dist: 680, cap: 'E, F, G binaları — ortada öz parkı' },
    { tgt: [200, 0, 0], th: -1.1, ph: .5, dist: 420, cap: 'Hər məhəllənin öz həyəti' },
    { tgt: [0, 6, 205], th: .35, ph: .16, dist: 460, cap: 'Birinci mərtəbələrdə kommersiya qalereyası' },
    { tgt: [0, 30, 0], th: -0.55, ph: .62, dist: 1500, cap: 'Nizami City — Yasamal' },
  ];
  const api = {
    home() { stopTour(); fly(HOME, 1400); },
    zoom(k) { stopTour(); dist = Math.min(3000, Math.max(260, dist * k)); place(); idle = 0; },
    sun(date) { if (window.ncSunPos) { sunPos = window.ncSunPos(date); night = sunPos.el <= 0; applyLight(); } return sunPos; },
    night(on) { night = !!on; if (!on && sunPos.el <= 0) sunPos = { az: 200, el: 40 }; applyLight(); return night; },
    isNight: () => night,
    focus(id, f) {
      sel = id || null; fl = f == null ? null : f; stopTour(); introDone = true;
      blds.forEach(g => { const s = g.userData.slab, b = g.userData.b; s.visible = !!id && b.id === id && fl != null; if (s.visible) s.position.y = fl < 2 ? POD / 2 : POD + (fl - 2) * FH + FH / 2; s.scale.y = fl != null && fl < 2 ? POD / FH : 1; });
      restyle();
      const g = blds.find(x => x.userData.b.id === id);
      if (g) { const b = g.userData.b, horiz = b.w > b.d, yy = fl == null ? 34 : (fl < 2 ? 6 : POD + (fl - 2) * FH); // kamera həyət tərəfdən baxır
        const thx = horiz ? (b.z < 0 ? .45 : Math.PI - .45) : (b.x > 0 ? -Math.PI / 2 + .35 : Math.PI / 2 - .35);
        fly({ tgt: [b.x, yy, b.z], th: thx, ph: fl == null ? .42 : .32, dist: mob ? 760 : 580 }, 1500); }
      else fly(HOME, 1400);
    },
    tour(onEnd) {
      if (tour) { stopTour(); return false; } let i = 0; tour = true; introDone = true;
      const step = () => { if (!tour) return; if (i >= TOUR.length) { tour = null; o.onCap && o.onCap(null); onEnd && onEnd(); return; } const w = TOUR[i++]; o.onCap && o.onCap(w.cap, i, TOUR.length); fly(w, i === 1 ? 1600 : 3400, () => { setTimeout(step, NOMO() ? 900 : 1700); }); };
      sel = null; fl = null; blds.forEach(g => g.userData.slab.visible = false); restyle(); step(); return true;
    },
    shot() { ren.render(S, cam); return el.toDataURL('image/png'); },
    dispose() { alive = false; ro.disconnect(); io.disconnect(); removeEventListener('pointerup', up); S.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) [].concat(x.material).forEach(m => { m.map && m.map.dispose(); m.emissiveMap && m.emissiveMap.dispose(); m.dispose(); }); }); ren.dispose(); try { ren.forceContextLoss(); } catch (e) { } el.remove(); Object.values(lab).forEach(d => d.remove()); }
  };
  applyLight();
  return api;
};
