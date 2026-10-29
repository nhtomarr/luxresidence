// Nizami City — 3D kompleks modeli (three r128). Sayt və render skripti ortaq istifadə edir.
// Koordinatlar: x şərq, z cənub; 1 vahid ≈ 0.5 m. Baş plan sxematikdir.
window.NC_BLD = [
  { id: 'A', st: 'ok', x: -150, z: -175, w: 150, d: 62 },
  { id: 'B', st: 'ok', x: 30, z: -175, w: 150, d: 62 },
  { id: 'C', st: 'ok', x: 200, z: -95, w: 62, d: 150 },
  { id: 'D', st: 'n', x: 200, z: 85, w: 62, d: 150 },
  { id: 'E', st: 'w', x: 30, z: 175, w: 150, d: 62 },
  { id: 'F', st: 'w', x: -150, z: 175, w: 150, d: 62 },
  { id: 'G', st: 'w', x: -232, z: 85, w: 62, d: 120 },
  { id: 'H', st: 'n', x: -232, z: -70, w: 62, d: 120 },
  { id: 'I', st: 'n', x: 15, z: 0, w: 70, d: 70 },
];
window.NC_FLOORS = 9; window.NC_FH = 7.4;

window.buildNizami = function (THREE, opt) {
  opt = opt || {};
  const S = new THREE.Scene();
  const FH = NC_FH, NF = NC_FLOORS, PODIUM = 9;
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

  function facadeTex(lit, night) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d');
    x.fillStyle = '#ebe5d9'; x.fillRect(0, 0, 512, 512);
    // keramoqranit lövhələri
    x.strokeStyle = 'rgba(120,108,88,.18)'; x.lineWidth = 1;
    for (let i = 0; i <= 512; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); }
    for (let j = 0; j <= 512; j += 57) { x.beginPath(); x.moveTo(0, j); x.lineTo(512, j); x.stroke(); }
    // vertikal krem pilyastrlar
    for (let k = 0; k < 8; k++) { x.fillStyle = 'rgba(255,252,244,.55)'; x.fillRect(k * 64 - 5, 0, 10, 512); }
    const rows = NF, colsN = 8, rh = 512 / rows, cw = 512 / colsN;
    for (let r = 0; r < rows; r++) for (let k = 0; k < colsN; k++) {
      const on = night && rnd() < 0.42;
      const gx = k * cw + cw * 0.18, gy = r * rh + rh * 0.16, gw = cw * 0.64, gh = rh * 0.66;
      x.fillStyle = on ? (rnd() < 0.5 ? '#ffd79a' : '#ffe9c2') : (lit ? '#7f95a3' : '#8a99a2');
      x.fillRect(gx, gy, gw, gh);
      if (!on) { const g = x.createLinearGradient(gx, gy, gx + gw, gy + gh); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(gx, gy, gw, gh); }
      x.strokeStyle = '#4a4943'; x.lineWidth = 3; x.strokeRect(gx, gy, gw, gh); x.fillStyle = '#4a4943'; x.fillRect(gx + gw / 2 - 1, gy, 2, gh); // tünd profil
      if (k % 3 === 1) { x.fillStyle = on ? '#d9884e' : '#a8553a'; x.fillRect(gx + 4, gy + 4, gw - 8, gh - 8); } // terrakota panel (real renderdə olduğu kimi)
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
  }
  function podiumTex(night) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#2b3024'; x.fillRect(0, 0, 256, 64);
    for (let k = 0; k < 8; k++) { x.fillStyle = night ? '#f6d9a2' : '#a9b8bf'; x.fillRect(k * 32 + 3, 8, 26, 48); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(k * 32 + 3, 8, 8, 48); }
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; return t;
  }
  const night = !!opt.night;
  const tFac = facadeTex(true, night), tPod = podiumTex(night);

  // zəmin
  const gMat = new THREE.MeshStandardMaterial({ color: opt.ground || 0xbdb6a6, roughness: 1 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), gMat); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; S.add(ground);
  // küçələr
  const road = new THREE.MeshStandardMaterial({ color: 0x5c5d58, roughness: .95 });
  [[0, -290, 1400, 46], [0, 300, 1400, 46], [-340, 0, 46, 1400], [330, 0, 46, 1400]].forEach(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), road); m.rotation.x = -Math.PI / 2; m.position.set(x, .3, z); m.receiveShadow = true; S.add(m); });
  // həyət
  const lawn = new THREE.MeshStandardMaterial({ color: 0x7d9455, roughness: 1 });
  const paveM = new THREE.MeshStandardMaterial({ color: 0xcfc6b2, roughness: .9 });
  const court = new THREE.Mesh(new THREE.PlaneGeometry(380, 280), paveM); court.rotation.x = -Math.PI / 2; court.position.set(-10, .6, 0); court.receiveShadow = true; S.add(court);
  [[-120, -60, 120, 70], [-120, 70, 120, 70], [120, -70, 90, 60], [120, 70, 90, 60]].forEach(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lawn); m.rotation.x = -Math.PI / 2; m.position.set(x, .9, z); m.receiveShadow = true; S.add(m); });
  // uşaq meydançası
  const play = new THREE.Mesh(new THREE.CylinderGeometry(34, 34, 1.2, 48), new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: .8 })); play.position.set(-30, .9, 0); play.receiveShadow = true; S.add(play);
  // ağaclar
  const leaf = new THREE.MeshStandardMaterial({ color: 0x5d7a40, roughness: 1 }), trunk = new THREE.MeshStandardMaterial({ color: 0x6b5a45 });
  const treeAt = (x, z, s) => { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.CylinderGeometry(1.2 * s, 1.6 * s, 10 * s, 6), trunk); t.position.y = 5 * s; const c = new THREE.Mesh(new THREE.IcosahedronGeometry(9 * s, 1), leaf); c.position.y = 15 * s; c.castShadow = true; g.add(t, c); g.position.set(x, 0, z); S.add(g); };
  for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI * 2, r = 70 + rnd() * 70; treeAt(-10 + Math.cos(a) * r * 1.3, Math.sin(a) * r * .8, .8 + rnd() * .5); }
  for (let i = -6; i <= 6; i++) { treeAt(i * 95, -322, 1); treeAt(i * 95, 332, 1); }

  // binalar
  const blds = [];
  const H = NF * FH;
  NC_BLD.forEach(b => {
    const g = new THREE.Group(); g.position.set(b.x, 0, b.z); g.userData.b = b;
    const ghost = b.st === 'n';
    if (ghost) {
      const geo = new THREE.BoxGeometry(b.w, H + PODIUM, b.d);
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .14, roughness: .2, depthWrite: false }));
      m.position.y = (H + PODIUM) / 2; g.add(m);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xc9a46a, transparent: true, opacity: .8 })); e.position.y = m.position.y; g.add(e);
      g.userData.pick = m;
    } else {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(b.w, PODIUM, b.d), (() => { const t = tPod.clone(); t.needsUpdate = true; t.repeat.set(b.w / 40, 1); const m = new THREE.MeshStandardMaterial({ map: t, roughness: .3, metalness: .2 }); if (night) { m.emissive = new THREE.Color(0xffffff); m.emissiveMap = t; m.emissiveIntensity = .55; } return m; })());
      pod.position.y = PODIUM / 2; pod.castShadow = pod.receiveShadow = true; g.add(pod);
      const t = tFac.clone(); t.needsUpdate = true;
      const sideMat = (len) => { const tt = t.clone(); tt.needsUpdate = true; tt.repeat.set(Math.max(1, len / 64), 1); const m = new THREE.MeshStandardMaterial({ map: tt, roughness: .62, color: b.st === 'w' ? 0xe0ddd6 : 0xffffff }); if (night) { m.emissive = new THREE.Color(0xffffff); m.emissiveMap = tt; m.emissiveIntensity = .5; } return m; };
      const top = new THREE.MeshStandardMaterial({ color: 0x9a968d, roughness: .9 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(b.w, H, b.d), [sideMat(b.d), sideMat(b.d), top, top, sideMat(b.w), sideMat(b.w)]);
      body.position.y = PODIUM + H / 2; body.castShadow = body.receiveShadow = true; g.add(body);
      const par = new THREE.Mesh(new THREE.BoxGeometry(b.w + 1.5, 2.2, b.d + 1.5), new THREE.MeshStandardMaterial({ color: 0x8b877e, metalness: .1, roughness: .6 }));
      par.position.y = PODIUM + H + 1.1; g.add(par);
      const tech = new THREE.Mesh(new THREE.BoxGeometry(b.w * .28, 6, b.d * .36), top); tech.position.set(b.w * .18, PODIUM + H + 4, 0); tech.castShadow = true; g.add(tech);
      if (b.st === 'w') {
        const cm = new THREE.MeshStandardMaterial({ color: 0xd9a03a, roughness: .5 });
        const mast = new THREE.Mesh(new THREE.BoxGeometry(2.4, H + 40, 2.4), cm); mast.position.set(b.w / 2 + 10, (H + 40) / 2, 0);
        const jib = new THREE.Group(); const arm = new THREE.Mesh(new THREE.BoxGeometry(110, 2, 2), cm); arm.position.x = -30; jib.add(arm); jib.position.set(b.w / 2 + 10, H + 40, 0);
        g.add(mast, jib); g.userData.jib = jib;
        const net = new THREE.Mesh(new THREE.BoxGeometry(b.w + .6, FH * 2, b.d + .6), new THREE.MeshStandardMaterial({ color: 0x3b4330, transparent: true, opacity: .55 }));
        net.position.y = PODIUM + H - FH; g.add(net);
      }
      g.userData.pick = body;
    }
    S.add(g); blds.push(g);
  });
  // kontekst binaları
  const ctxM = new THREE.MeshStandardMaterial({ color: 0xc9c3b6, roughness: 1 });
  for (let i = 0; i < 22; i++) {
    const side = i % 4, w = 60 + rnd() * 80, d = 50 + rnd() * 70, h = 20 + rnd() * 70;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ctxM);
    const off = -560 + (i >> 2) * 210 + rnd() * 30;
    const pos = [[off, -400], [off, 410], [-470, off], [460, off]][side];
    m.position.set(pos[0], h / 2, pos[1]); m.castShadow = m.receiveShadow = true; S.add(m);
  }
  // işıq
  const hemi = new THREE.HemisphereLight(night ? 0x2a3550 : 0xfdf8ee, night ? 0x10120c : 0x8f8670, night ? .35 : .75); S.add(hemi);
  const sun = new THREE.DirectionalLight(night ? 0x8fa3c8 : 0xfff1dc, night ? .25 : 1.15);
  sun.castShadow = true; sun.shadow.mapSize.set(opt.shadow || 2048, opt.shadow || 2048);
  Object.assign(sun.shadow.camera, { left: -520, right: 520, top: 520, bottom: -520, near: 10, far: 2600 }); sun.shadow.bias = -0.0005;
  S.add(sun); S.add(sun.target);
  function setSun(az, el) { // dərəcə: az şimaldan saat əqrəbi ilə
    const a = az * Math.PI / 180, e = Math.max(.5, el) * Math.PI / 180, r = 1400;
    sun.position.set(Math.sin(a) * Math.cos(e) * r, Math.sin(e) * r, -Math.cos(a) * Math.cos(e) * r);
    const day = Math.max(0, Math.min(1, el / 25));
    sun.intensity = night ? .25 : (.15 + 1.0 * day); hemi.intensity = night ? .35 : (.35 + .45 * day);
    sun.color.setHSL(.09, .6, .55 + .35 * day);
  }
  setSun(200, 48);
  return { scene: S, blds, sun, setSun, H: H + PODIUM };
};

// Bakı üçün günəş mövqeyi (NOAA sadələşdirilmiş). Qaytarır {az, el} dərəcə
window.ncSunPos = function (date, lat = 40.38, lon = 49.85, tz = 4) {
  const rad = Math.PI / 180, start = Date.UTC(date.getFullYear(), 0, 0);
  const doy = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 864e5);
  const hr = date.getHours() + date.getMinutes() / 60;
  const g = 2 * Math.PI / 365 * (doy - 1 + (hr - 12) / 24);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const tst = hr * 60 + eq + 4 * lon - 60 * tz, ha = (tst / 4 - 180) * rad;
  const cz = Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(ha);
  const zen = Math.acos(Math.max(-1, Math.min(1, cz)));
  let az = Math.acos(Math.max(-1, Math.min(1, (Math.sin(lat * rad) * Math.cos(zen) - Math.sin(dec)) / (Math.cos(lat * rad) * Math.sin(zen))))) / rad;
  az = ha > 0 ? (az + 180) % 360 : (540 - az) % 360;
  return { az, el: 90 - zen / rad };
};
