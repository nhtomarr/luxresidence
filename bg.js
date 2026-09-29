/* Baş Ofis — native fon yer izləməsi (yalnız Android/iOS tətbiqində işləyir).
   Açıq qısa çıxış olduqca telefon kilidli olsa belə hər ~90 saniyə/150 m-dən bir yer serverə göndərilir. */
(function () {
  if (!window.Capacitor || !Capacitor.isNativePlatform || !Capacitor.isNativePlatform()) return;
  var BG = Capacitor.Plugins.BackgroundGeolocation;
  if (!BG) return;
  var watcherId = null, active = false, lastSentAt = 0, lastPos = null;

  function supa() {                       // veb səhifədəki hazır Supabase klientini istifadə edir
    return window.sb || (window.LuxAuth && window.LuxAuth.sb) || null;
  }
  function send(loc) {
    var sb = supa(); if (!sb || !loc) return;
    var now = Date.now();
    if (lastPos && now - lastSentAt < 85000) {
      var dx = (loc.latitude - lastPos[0]) * 111000, dy = (loc.longitude - lastPos[1]) * 111000 * Math.cos(loc.latitude * Math.PI / 180);
      if (Math.sqrt(dx * dx + dy * dy) < 120) return;   // eyni yerdə boş sorğu göndərmə
    }
    lastPos = [loc.latitude, loc.longitude]; lastSentAt = now;
    sb.rpc('office_bg_point', { p_lat: loc.latitude, p_lng: loc.longitude, p_acc: Math.round(loc.accuracy || 0) })
      .then(function (r) { if (r && r.data && r.data.active === false) stop(); }, function () {});
  }
  function start() {
    if (watcherId !== null) return;
    BG.addWatcher({
      backgroundMessage: 'İş vaxtı çıxış zamanı yeriniz qeyd olunur.',
      backgroundTitle: 'Ofisdən kənardasınız',
      requestPermissions: true, stale: false, distanceFilter: 120
    }, function (loc, err) { if (err) return; if (loc) send(loc); })
    .then(function (id) { watcherId = id; });
  }
  function stop() { if (watcherId !== null) { BG.removeWatcher({ id: watcherId }); watcherId = null; lastPos = null; } }

  // Açıq çıxış olub-olmadığını yoxla və izləməni ona görə aç/qapat
  function sync() {
    var sb = supa(); if (!sb) return;
    var hasOut = (typeof MYOUT !== 'undefined' && MYOUT);
    if (hasOut && !active) { active = true; start(); }
    else if (!hasOut && active) { active = false; stop(); }
  }
  setInterval(sync, 30000);
  document.addEventListener('DOMContentLoaded', function () { setTimeout(sync, 4000); });
  window.__bgSync = sync;
})();
