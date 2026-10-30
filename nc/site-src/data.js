// Nizami City — məlumat qatı. İctimai mənbələr: report.az, ipoteka.az, Instagram @nizami.city.
// Qeyd: mənzil inventarı (bina/mərtəbə/status) NÜMUNƏDİR — real satış bazası Supabase "nizami" sxeminə qoşulanda əvəz olunacaq.
window.NC = (function () {
  const CO = {
    name: 'Nizami City', slogan: 'Xoşbəxtliyi inşa edirik',
    short: '*0788', phones: ['(050) 700 00 88', '(050) 970 00 88'], tel: ['+994507000088', '+994509700088'],
    email: 'info@nizamicity.az', addr: 'Cəfər Cabbarlı küç. 31, Nizami m/s, Yasamal r-nu, Bakı',
    hours: 'B.e.–Cümə 09:00–18:00', ig: 'nizami.city', wa: '994507000088', priceFrom: 2700,
  };
  const STAT = {
    ok: { t: 'Təhvil verilib', c: 'ok', pct: 100 },
    w: { t: 'Təhvil', c: 'soon', pct: 64 },
    n: { t: 'Növbəti mərhələ', c: '', pct: 8 },
  };
  // Real elanlardan götürülmüş sahələr (ipoteka.az) — plan tipləri
  const TYPES = [
    { k: 'T1', r: 1, a: 84.40 }, { k: 'T2a', r: 2, a: 76.50 }, { k: 'T2b', r: 2, a: 122.61 }, { k: 'T2c', r: 2, a: 123.71 },
    { k: 'T3', r: 3, a: 163.21 }, { k: 'T4a', r: 4, a: 165.30 }, { k: 'T4b', r: 4, a: 206.70 },
  ];
  // Otaq paylanması (eksplikasiya) — plan sxemi üçün
  const ROOMS = {
    1: { top: [['Qonaq otağı', 30], ['Yataq otağı', 21]], bot: [['Mətbəx', 16], ['Hamam', 7], ['Qarderob', 6], ['Dəhliz', 14]], bal: 6 },
    2: { top: [['Qonaq otağı', 27], ['Yataq otağı', 18], ['Yataq otağı', 15]], bot: [['Mətbəx', 14], ['Hamam', 6], ['S/Q', 3], ['Dəhliz', 12]], bal: 5 },
    3: { top: [['Qonaq otağı', 24], ['Yataq otağı', 17], ['Yataq otağı', 14], ['Uşaq otağı', 13]], bot: [['Mətbəx', 12], ['Hamam', 5], ['S/Q', 3], ['Dəhliz', 10]], bal: 4 },
    4: { top: [['Qonaq otağı', 22], ['Yataq otağı', 15], ['Yataq otağı', 12], ['Uşaq otağı', 11], ['Kabinet', 9]], bot: [['Mətbəx', 11], ['Hamam', 5], ['S/Q', 3], ['Dəhliz', 9]], bal: 4 },
  };
  const ORI = ['Cənub', 'Şərq', 'Qərb', 'Şimal']; const ORIAZ = { 'Cənub': 180, 'Şərq': 90, 'Qərb': 270, 'Şimal': 0 };
  // REAL inventar: Supabase nc_public_units() (satış lövhəsi ilə eyni baza)
  const R = window.NC_REMOTE || {}, SITE = R.site || {}, CFG = R.cfg || {};
  const PR = (CFG.presets || []); const pp = re => (PR.find(x => re.test(x.t)) || {}).p;
  const P_KOT = pp(/kotlovan/i) || (CFG.price || {}).min || 3800, P_TS = pp(/təmirsiz/i) || 3900, P_TL = pp(/təmirli/i) || 4200;
  if (PR.length) CO.priceFrom = Math.min(...PR.map(x => +x.p).filter(Boolean)); else CO.priceFrom = P_KOT;
  CO.delivery = '2027';
  Object.assign(CO, SITE.co || {});
  (SITE.bld || []).forEach(o => { const B = (window.NC_BLD || []).find(x => x.id === o.id); if (B && o.st) B.st = o.st; });
  STAT.w.t = 'Təhvil ' + CO.delivery;
  const UNITS = []; const roomsBy = a => a < 70 ? 1 : a < 105 ? 2 : a < 150 ? 3 : 4; const seq = {};
  (R.units || []).forEach(x => {
    const m = /Bina\s+([A-Z])(?:\s*·\s*Giriş\s*(\d+))?/i.exec(x.b || ''); if (!m) return;
    const bid = m[1].toUpperCase(), B = (window.NC_BLD || []).find(q => q.id === bid); if (!B) return;
    const a = parseFloat(String(x.a || '').replace(',', '.')); if (!(a > 0)) return;
    const f = Math.floor(parseFloat(x.f) || 0) || 1; const ent = m[2] ? +m[2] : 0;
    const k = bid + f; const n = parseInt(x.n) || (seq[k] = (seq[k] || 0) + 1);
    const r = parseInt(x.r) || roomsBy(a); const c = x.c || '';
    const ppm = /təmirli/i.test(c) ? P_TL : B.st === 'ok' ? P_TS : P_KOT;
    const id = `${bid}${ent ? ent : ''}-${f}-${n}`;
    const oo = (SITE.ori || {})[id];
    UNITS.push({ id, b: bid, ent, bst: B.st, f, n, r, a, t: '', st: x.s === 'sold' ? 'sold' : x.s === 'bron' ? 'bron' : 'free', ppm, price: Math.round(a * ppm / 100) * 100, ori: oo || '—', ceil: 3.0, c: c.replace(/\s*·\s*Kirayə/i, '') });
  });
  UNITS.sort((p, q) => p.b.localeCompare(q.b) || p.f - q.f || p.ent - q.ent || p.n - q.n);
  if (UNITS.length) window.NC_FLOORS = Math.max(...UNITS.map(u => u.f));
  const INFRA = [
    ['Qapalı həyət', 'Avtomobilsiz daxili həyət və uşaq meydançası', 'M3 21h18M5 21V10l7-6 7 6v11M10 21v-5h4v5'],
    ['2 səviyyəli yeraltı parkinq', 'Liftlər birbaşa parkinqə enir', 'M5 17h14M6 17l1.5-6h9L18 17M7.5 17v2M16.5 17v2'],
    ['7/24 mühafizə', 'Kameralar və kodlu giriş', 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z'],
    ['Fitnes və SPA', 'Kompleksin daxilində', 'M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12'],
    ['Supermarket, aptek, kafe', 'Binaların birinci mərtəbəsində', 'M4 6h16l-1.5 9H5.5zM9 20h.01M16 20h.01'],
    ['Qadın baxım mərkəzi', 'Kompleksin daxilində', 'M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 11v10M8 17h8'],
    ['Generator', 'Fasiləsiz enerji təminatı', 'M13 2L4 14h7l-1 8 9-12h-7z'],
    ['Sürətli liftlər', 'Sərnişin və yük liftləri', 'M7 3h10v18H7zM10 8l2-2 2 2M10 16l2 2 2-2'],
    ['Optik internet', 'Hər mənzilə', 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01'],
    ['Yanğın sistemi', 'Avtomatik sistem və su ehtiyatı', 'M12 3c3 4 6 6 6 10a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3-1-4 0-6z'],
    ['Keramoqranit fasad', 'Uzunömürlü, baxımı asan', 'M4 4h16v16H4zM4 12h16M12 4v16'],
    ['Təbii qaz', 'Hər mənzildə', 'M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-4 3-6 5-9z'],
  ];
  // Sxematik xəritə (koordinatlar 0–800 × 0–550, mütənasib deyil)
  const POI = [
    { k: 'M', n: 'Nizami metrosu', d: 'Bir neçə dəqiqəlik piyada yolu', x: 520, y: 240, c: 'Nəqliyyat' },
    { k: 'T', n: 'Nizami Mall', d: 'Ticarət mərkəzi', x: 575, y: 360, c: 'Alış-veriş' },
    { k: 'T', n: 'Caspian Plaza', d: 'Biznes və ticarət mərkəzi', x: 300, y: 430, c: 'Alış-veriş' },
    { k: 'T', n: 'Globus Center', d: 'Ticarət mərkəzi', x: 650, y: 150, c: 'Alış-veriş' },
    { k: 'S', n: '31 nömrəli məktəb', d: 'Yaxınlıqda', x: 250, y: 165, c: 'Təhsil' },
    { k: 'S', n: '18 nömrəli məktəb', d: 'Yaxınlıqda', x: 330, y: 110, c: 'Təhsil' },
    { k: 'P', n: 'Parklar və bulvarlar', d: 'Gəzinti üçün', x: 140, y: 330, c: 'İstirahət' },
  ];
  const FAQ = [
    ['Mənzillər təmirlidir?', 'Hazır binalarda həm təmirli, həm təmirsiz mənzillər var. Tikilən binalarda mənzillər təmirsiz, sərbəst planla təhvil verilir.'],
    ['Hansı binalar hazırdır?', 'A, B və C binaları təhvil verilib. E, F və G binalarının təhvili ' + CO.delivery + '-ci ilə planlaşdırılır.'],
    ['Hansı ödəniş variantları var?', 'Nağd ödəniş, daxili kredit (6 ay faizsiz, 12 və 24 ay) və ya ipoteka. Dəqiq şərtləri satış meneceri ilə dəqiqləşdirin.'],
    ['Kvadratmetr qiyməti nə qədərdir?', !SITE.showPrice ? 'Qiymət mənzilin binasından, mərtəbəsindən və vəziyyətindən asılıdır. Saytda «Qiyməti öyrən» formasını doldurun və ya *0788 nömrəsinə zəng edin — satış meneceri dəqiq qiyməti desin.' : 'Qiymətlər ' + CO.priceFrom.toLocaleString('ru').replace(/,/g,' ') + ' ₼/m²-dən başlayır: tikilən binalarda ' + P_KOT + ', hazır binalarda təmirsiz ' + P_TS + ', təmirli ' + P_TL + ' ₼/m².'],
    ['Parkinq var?', 'Bəli, kompleksdə 2 səviyyəli yeraltı parkinq var.'],
    ['Kommersiya sahələri satılır?', 'Bəli, binaların birinci mərtəbələrində qeyri-yaşayış sahələri satışdadır. Kommersiya bölməsindən sorğu göndərin.'],
    ['Kompleks harada yerləşir?', 'Yasamal rayonu, Nizami m/s, Cəfər Cabbarlı küçəsi 31 — Nizami metrosuna yaxın.'],
    ['Mənzilə necə baxa bilərəm?', 'Əlaqə bölməsində gün və saat seçin və ya *0788 nömrəsinə zəng edin — baxışı sizin üçün təşkil edək.'],
  ];
  const TIMELINE = [
    ['Mərhələ I', 'A, B, C binaları', 'Tikinti tamamlanıb, mənzillər sakinlərə təhvil verilib.', 'ok'],
    ['Mərhələ II', 'E, F, G binaları', 'Tikinti davam edir. Təhvil ' + CO.delivery + '-ci ilə planlaşdırılır.', 'w'],
  ];
  const GAL = [
    { src: 'aerial', c: 'Vizuallar', t: 'Hazır binalar — 3D quşbaxışı vizual, mərkəzdə qapalı həyət' },
    { src: 'front', c: 'Vizuallar', t: 'Küçə fasadı və «Nizami City» girişi' },
    { src: 'aerial_c', c: 'Vizuallar', t: 'Binalar və giriş portalı' },
    { src: 'entrance', c: 'Detallar', t: 'Həyətə giriş, terras və kommersiya qalereyası' },
    { src: 'corner', c: 'Vizuallar', t: 'Künc görünüşü və giriş qapısı' },
    { src: 'tower_l', c: 'Detallar', t: 'Künc bina: keramoqranit və kərpic fasad' },
    { src: 'tower_r', c: 'Detallar', t: 'Küçə tərəfi, birinci mərtəbədə vitrinlər' },
    { src: 'street', c: 'Vizuallar', t: 'Uzun fasad və kommersiya mərtəbəsi' },
  ];
  const GCATS = ['Hamısı', 'Vizuallar', 'Detallar', 'Tikinti gedişatı', 'İnteryer'];
  const BLOG = [
    { id: 'kredit-ipoteka-nagd', c: 'Maliyyə', d: '2026-10-14', m: 7, img: 'tower_r', t: 'Nağd, daxili kredit, yoxsa ipoteka?', x: 'Eyni mənzili üç fərqli yolla almaq — hər birinin real xərci və kimə uyğun olduğu.',
      b: `<p>Mənzil alarkən ən böyük sual çox vaxt «hansı mənzil?» yox, «necə ödəyim?» olur. Eyni mənzilin son xərci seçilən ödəniş yolundan asılı olaraq ciddi fərqlənə bilər.</p>
<h2>Nağd ödəniş</h2><p>Ən sadə yoldur: müqavilə bağlanır, məbləğ ödənilir, əlavə xərc yoxdur. Nağd alışda satış ofisi ilə qiymət barədə danışmaq imkanı da adətən daha genişdir.</p>
<h2>Daxili kredit</h2><p>Nizami City-də məbləğin 50%-ni ilkin ödəyib, qalan hissəni 24 ayadək hissə-hissə ödəmək mümkündür. Bu yol banka müraciət etmədən, birbaşa tikinti şirkəti ilə razılaşma əsasında işləyir. Aylıq ödəniş müddət qısa olduğu üçün yüksək olur, amma ümumi xərc proqnozlaşdırılandır.</p>
<blockquote>Qayda: aylıq ödəniş ailə gəlirinin 40%-dən çox olmamalıdır.</blockquote>
<h2>İpoteka</h2><p>Uzunmüddətli bank krediti aylıq ödənişi azaldır, lakin faiz hesabına ümumi xərci artırır. İpoteka şərtləri bankdan və proqramdan asılıdır, ona görə müraciətdən əvvəl bir neçə bankın təklifini müqayisə edin.</p>
<h2>Necə qərar verməli?</h2><ol><li>Əlinizdə olan vəsaiti və aylıq ödəyə biləcəyiniz məbləği yazın.</li><li>Saytdakı kalkulyatorda üç variantı eyni mənzil üçün müqayisə edin.</li><li>Son qərardan əvvəl satış ofisində aktual şərtləri dəqiqləşdirin.</li></ol>` },
    { id: 'temirsiz-menzil', c: 'Təmir', d: '2026-09-28', m: 6, img: 'tower_l', t: 'Təmirsiz mənzil: açarı aldıqdan sonra ilk 90 gün', x: 'Sərbəst planın üstünlüyündən necə yararlanmalı və təmirə hansı ardıcıllıqla başlamalı.',
      b: `<p>Təmirsiz təhvil verilən mənzil ilk baxışda əlavə iş kimi görünür, amma əslində ən böyük üstünlükdür: məkanı tam öz həyat tərzinizə görə qurursunuz.</p>
<h2>1–2-ci həftə: ölçü və plan</h2><p>Mənzilin dəqiq ölçüsünü götürün, pəncərələrin, kommunikasiya çıxışlarının yerini qeyd edin. Ailənin gündəlik ssenarisini yazın: kim harada işləyir, uşaqlar harada oynayır, qonaqlar harada qarşılanır.</p>
<h2>3–4-cü həftə: layihə və smeta</h2><p>Dizayner və ya usta ilə divarların yerini, elektrik nöqtələrini və santexnikanı razılaşdırın. Smetanı mərhələlərə bölün: «qaba» işlər, mühəndis sistemləri, bitirmə işləri.</p>
<h2>2–3-cü ay: qaba işlər</h2><ul><li>Arakəsmə divarlar</li><li>Elektrik və zəif cərəyan xətləri</li><li>Su və kanalizasiya paylanması</li><li>Suvaq və döşəmə hazırlığı</li></ul>
<blockquote>Elektrik nöqtələrini mebel planına görə yerləşdirin — sonradan uzatma kabeli ilə yaşamaqdan yaxşıdır.</blockquote>
<h2>Bitirmə işləri</h2><p>Plitə, laminat, boya və işıqlandırma sona qalır. Bu mərhələdə tələsməyin: material seçimi uzun illər üçündür.</p>` },
    { id: 'menzil-secimi-12-sual', c: 'Bələdçi', d: '2026-09-10', m: 5, img: 'front', t: 'Mənzil seçərkən özünüzə verməli olduğunuz 12 sual', x: 'Baxışa getməzdən əvvəl bu siyahını yanınıza alın.',
      b: `<p>Mənzil seçimi emosional qərardır, amma bir neçə düzgün sual səhvdən qoruyur.</p><ol>
<li>Neçə nəfər yaşayacaq və 5 il sonra bu rəqəm dəyişəcəkmi?</li><li>Hər kəsə ayrıca otaq lazımdırmı?</li><li>Evdən işləyirsinizsə, kabinet üçün yer varmı?</li><li>Pəncərələr hansı tərəfə baxır və gün işığı neçə saat düşür?</li><li>Hansı mərtəbə sizə rahatdır — mənzərə, yoxsa liftdən asılılıq?</li><li>Mətbəx ailənizin ölçüsünə uyğundurmu?</li><li>Saxlama yeri (qarderob, anbar) kifayətdirmi?</li><li>Parkinq lazımdırmı və neçə yer?</li><li>Metro, məktəb, iş yeri neçə dəqiqəlikdir?</li><li>Ödənişi hansı yolla edəcəksiniz və aylıq yük nə qədər olacaq?</li><li>Təmirə nə qədər vaxt və büdcə ayıra bilərsiniz?</li><li>Bina hazırdır, yoxsa tikilir — köçmə tarixi sizə uyğundurmu?</li></ol>
<p>Saytdakı <b>Mənzil seçici</b> bu sualların bir hissəsini 30 saniyəyə cavablandırıb sizə uyğun variantları göstərir.</p>` },
    { id: 'gunes-isigi', c: 'Bələdçi', d: '2026-08-22', m: 4, img: 'aerial', t: 'Günəş işığı: pəncərənin istiqaməti niyə vacibdir', x: 'Cənub, şərq, qərb, şimal — Bakıda hər birinin gündəlik həyata təsiri.',
      b: `<p>Eyni ölçülü iki mənzil pəncərələrin istiqamətinə görə tamamilə fərqli hiss oluna bilər.</p>
<h2>Cənub</h2><p>Qışda gün boyu işıq, yayda isə günəş yüksəkdə olduğu üçün otağa az düşür. Qonaq otağı üçün ən rahat istiqamətdir.</p>
<h2>Şərq</h2><p>Səhər günəşi. Yataq otağı və mətbəx üçün yaxşı seçimdir: gün işıqla başlayır, axşam isə otaq sərin qalır.</p>
<h2>Qərb</h2><p>Günortadan sonra və axşam işığı. Yay aylarında pərdə və kondisioner planlaşdırın.</p>
<h2>Şimal</h2><p>Bərabər, kölgəli işıq. İş otağı və studiya üçün yaxşıdır, amma qışda daha sərin olur.</p>
<blockquote>Saytda hər mənzil səhifəsində fəsillərə görə günəş saatlarını görə bilərsiniz.</blockquote>` },
    { id: 'serbest-planlasdirma', c: 'Dizayn', d: '2026-08-05', m: 5, img: 'aerial_c', t: 'Sərbəst planlaşdırma: 5 işlək ssenari', x: 'Eyni sahədən fərqli həyat tərzləri üçün fərqli mənzillər.',
      b: `<p>Sərbəst plan o deməkdir ki, daxili divarlar sizin qərarınızdır. Budur ən çox seçilən beş ssenari:</p>
<h2>1. Açıq mətbəx-qonaq</h2><p>Mətbəx və qonaq otağı birləşir, məkan daha geniş və işıqlı görünür. Güclü sorucu vacibdir.</p>
<h2>2. Master-otaq</h2><p>Yataq otağına ayrıca hamam və qarderob əlavə olunur. Böyük 3–4 otaqlı mənzillərdə rahat alınır.</p>
<h2>3. Kabinet</h2><p>Kiçik otaq və ya qonaq otağının bir hissəsi şüşə arakəsmə ilə iş yerinə çevrilir.</p>
<h2>4. Uşaq zonası</h2><p>İki uşaq otağı arasında ortaq oyun sahəsi — böyüdükcə yenidən bölünə bilər.</p>
<h2>5. Anbar və camaşırxana</h2><p>Dəhlizdə 2–3 m² ayrılması gündəlik həyatı xeyli asanlaşdırır.</p>` },
    { id: 'yasamal-heyat', c: 'Məkan', d: '2026-07-18', m: 4, img: 'entrance', t: 'Nizami metrosu ətrafında yaşamaq', x: 'Məktəblər, ticarət mərkəzləri və nəqliyyat — gündəlik həyat bir neçə dəqiqəlik məsafədə.',
      b: `<p>Nizami City Yasamal rayonunda, Nizami metrosuna yaxın, şəhərin ən canlı hissələrindən birində yerləşir.</p>
<h2>Nəqliyyat</h2><p>Nizami metrosu bir neçə dəqiqəlik piyada yolundadır, ətrafdakı küçələrdən şəhərin əsas istiqamətlərinə ictimai nəqliyyat işləyir.</p>
<h2>Təhsil</h2><p>31 və 18 nömrəli məktəblər kompleksin yaxınlığındadır.</p>
<h2>Alış-veriş</h2><p>Nizami Mall, Caspian Plaza və Globus Center yaxın məsafədədir. Kompleksin öz birinci mərtəbələrində də supermarket, aptek və kafelər var.</p>
<h2>İstirahət</h2><p>Qapalı həyət gündəlik gəzinti və uşaqlar üçün təhlükəsiz məkandır; yaxınlıqdakı parklar isə daha uzun gəzintilər üçündür.</p>` },
  ];
  const pick = (k, d) => Array.isArray(SITE[k]) && SITE[k].length ? SITE[k] : d;
  const BL = Array.isArray(R.blog) ? R.blog.filter(p => p && p.pub !== false) : BLOG;
  return { CO, STAT, TYPES, ROOMS, ORIAZ, UNITS, INFRA: pick('infra', INFRA), POI, FAQ: pick('faq', FAQ), TIMELINE: pick('timeline', TIMELINE), GAL: pick('gal', GAL), GCATS, BLOG: BL, DEF: { FAQ, TIMELINE, INFRA, GAL, BLOG } };
})();
