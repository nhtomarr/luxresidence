
/* ===== Ana səhifə: tam ekran kinematik giriş (17.11.2026) =====
   Video faylı dəyişəndə adını da dəyiş (brauzer 4 saat keşdə saxlayır). Mənbə və emal: LAYIHE-DURUMU.md, "Nizami City: giriş videosu". */
addEventListener('scroll', () => window._nciTop && window._nciTop(), { passive: true });
addEventListener('resize', () => window._nciTop && window._nciTop());
function heroIntro(root) {
  const NCI_V = ['/assets/nc/intro/gate-v1.mp4', '/assets/nc/intro/gate-v1-m.mp4'];   // ilk render bu fayl oxunmadan əvvəl çağırılır — sabit funksiyanın içində olmalıdır
  const H = document.documentElement, hd = $('#hd'), hero = $('.hero.cine', root);
  if (!hero) { window._nciTop = null; H.classList.remove('nc-cine', 'nci'); window.__nci = 0; return; }
  window._nciTop = () => { if (!document.body.contains(hero)) { H.classList.remove('nc-cine'); return; } H.style.setProperty('--hdh', hd.offsetHeight + 'px'); H.classList.toggle('nc-cine', scrollY < hero.offsetHeight - 90); };
  window._nciTop();
  let seen = false; try { seen = sessionStorage.getItem('nc_intro') === '1'; } catch (e) {}
  const c = navigator.connection || {};
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches || c.saveData || /2g/.test(c.effectiveType || '')) return;
  try { sessionStorage.setItem('nc_intro', '1'); } catch (e) {}
  const sl = $('#sl', hero), v = document.createElement('video');
  v.className = 'nci-v'; v.muted = true; v.defaultMuted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.preload = 'auto'; v.setAttribute('aria-hidden', 'true');
  v.src = NCI_V[innerWidth < 760 ? 1 : 0];
  const skip = document.createElement('button'); skip.type = 'button'; skip.className = 'nci-skip'; skip.textContent = 'Keç';
  let done = false, started = false;
  const fin = () => { if (done) return; done = true; window.__nci = 0; window.__nciT = Date.now() + 5000; H.classList.remove('nci'); v.style.opacity = '0'; skip.remove(); setTimeout(() => v.remove(), 450); };
  const fail = () => { if (!started) fin(); };
  skip.onclick = fin;
  v.addEventListener('playing', () => { started = true; });
  v.addEventListener('timeupdate', () => { if (v.duration && v.currentTime >= v.duration - 0.12) { v.pause(); fin(); } });
  v.addEventListener('ended', fin); v.addEventListener('error', fail);
  H.classList.add('nci'); window.__nci = 1; sl.appendChild(v); hero.appendChild(skip);
  const p = v.play(); if (p && p.catch) p.catch(fail);
  setTimeout(fail, 3500); setTimeout(fin, 12000);
}
