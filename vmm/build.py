#!/usr/bin/env python3
"""VMM Ofis — Baş Ofis (ofis.pilothayat.az) kodundan VMM versiyasını yığır.

Mənbə: ../ofis.html, ../assets/ofis-*.js, ../assets/ofis-app.css, ../assets/lux-auth.js, ../ofis-sw.js, ../bg.js
Üst qat: vmm/overlay/* (VMM dizaynı, ikonlar, şriftlər, Netlify ayarları)
Nəticə: vmm/dist/  →  Cloudflare Worker `vmm-ofis` (ofis.vmm.az); köhnə: Netlify vmm-ofis.netlify.app

Baza: eyni Supabase layihəsi, amma ayrıca `vmm` sxemi (cədvəllər, funksiyalar, bucket-lər `vmm-*`,
edge funksiyalar `vmm-*`). Pilot Həyat məlumatına toxunmur.

İstifadə:  python3 vmm/build.py [versiya]
"""
import os, re, shutil, sys, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, 'vmm')
OV = os.path.join(HERE, 'overlay')
DIST = os.path.join(HERE, 'dist')
VER = sys.argv[1] if len(sys.argv) > 1 else '1'
SITE = os.environ.get('VMM_SITE', 'https://ofis.vmm.az')   # əsas ünvan (köhnə: vmm-ofis.netlify.app)
SB = 'https://avqchschbbltnnasabdm.supabase.co'

def rd(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
def wr(p, s):
    p = os.path.join(DIST, p); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(s)

def must(s, a, b, cnt=None, name=''):
    n = s.count(a)
    if n == 0 or (cnt is not None and n != cnt):
        raise SystemExit(f'[{name}] tapılmadı/say uyğun deyil ({n}): {a[:80]!r}')
    return s.replace(a, b)

WM = '<span class="vmm-wm" aria-label="VMM"><b class="v">V</b><b class="m1">M</b><b class="m2">M</b></span><small>Ofis</small>'

# ---------------------------------------------------------------- JS
WM_BIG = '<span class="vmm-wm" aria-label="VMM"><b class="v">V</b><b class="m1">M</b><b class="m2">M</b></span>'
COMMON = [
    ("title:'Baş Ofis',sub:'İşçi hesabınızla daxil olun'", "title:'" + WM_BIG + "',sub:'Ofis sistemi. İşçi hesabınızla daxil olun.'"),
    ("functions.invoke('", "functions.invoke('vmm-"),
    ("storage.from('office')", "storage.from('vmm-office')"),
    ("storage.from('avatars')", "storage.from('vmm-avatars')"),
    ("storage.from('chat')", "storage.from('vmm-chat')"),
    ("storage.from('backups')", "storage.from('vmm-backups')"),
    ("/storage/v1/object/public/avatars/", "/storage/v1/object/public/vmm-avatars/"),
    ("/storage/v1/object/public/chat/", "/storage/v1/object/public/vmm-chat/"),
    ("/storage/v1/object/chat/", "/storage/v1/object/vmm-chat/"),
    ("schema:'public'", "schema:'vmm'"),
    ("sb.channel('", "sb.channel('vmm-"),
    ("https://ofis.pilothayat.az", SITE),
    ("ofis\\.pilothayat\\.az", "(?:ofis\\.vmm\\.az|vmm\\.az|vmm-ofis\\.netlify\\.app|vmm-ofis\\.omrnihat\\.workers\\.dev)"),
    ("'/ofis-sw.js'", "'/sw.js'"),
    ("/assets/ofis/icon-192.png", "/assets/vmm/icon-192.png"),
    ("Baş Ofis<small>İdarəetmə sistemi</small>", WM),
    ("'Baş Ofis — İdarəetmə'", "'VMM Ofis'"),
    ("Baş Ofisin yeri", "Ofisin yeri"),
    ("Baş Ofis — QR kod", "Ofis QR kodu"),
    ("Baş Ofis", "VMM Ofis"),
    # rəng: Baş Ofisin mavisi → VMM yaşılı / dəniz tünd
    ("#2563eb", "#24704a"), ("#0a84ff", "#24704a"), ("#1d4ed8", "#1b5838"), ("#3b82f6", "#2e8a5a"),
    ("#1e3a8a", "#15232b"), ("#0f172a", "#15232b"), ("#4f46e5", "#7b4b2a"), ("#7c3aed", "#e2742b"),
] + [
    # Instagram / iOS rəngləri → VMM palitrası
    ("#0095f6", "#24704a"), ("#feda75", "#e2742b"), ("#fa7e1e", "#e2742b"), ("#d62976", "#2e7d4f"),
    ("#962fbf", "#2e7d4f"), ("#4f5bd5", "#7b4b2a"), ("#5e5ce6", "#2e7d4f"), ("#6366f1", "#2e7d4f"),
    ("#a855f7", "#7b4b2a"), ("#ec4899", "#e2742b"), ("#0a0a0a", "#15232b"),
]
CSS_COLORS = [c for c in COMMON if c[0].startswith('#')]

def js_common(s, name):
    for a, b in COMMON:
        s = s.replace(a, b)
    return s

a = rd('assets/ofis-a.js')
a = js_common(a, 'a')
# Sahibkar profili: Pilot Həyat sistemlərinə keçidlər VMM-də yoxdur
for l in ['komendant" target', 'nezaret" target', 'techizat.pilothayat.az', 'luxresidence.az/satis']:
    a = re.sub(r"\n  \+'<a class=\"oprof-lnk\" href=\"[^\"]*" + re.escape(l.split('"')[0]) + r"[^\n]*", '', a)
# Android APK — Pilot Həyatın tətbiqidir, VMM-də yalnız brauzerdən quraşdırma
a = must(a, "var APK_URL='https://github.com/nhtomarr/luxresidence/releases/latest/download/bas-ofis.apk';", "var APK_URL='';", 1, 'apk')
a = re.sub(r"\n \+'<p><b>1-ci yol — Android tətbiqi \(tövsiyə olunur\)\.</b>[^\n]*\n \+'<a class=\"btn\"[^\n]*\n \+'<p class=\"muted small\">Yüklənəndən sonra[^\n]*", '', a)
a = a.replace("<b>2-ci yol — Chrome ilə.</b>", "<b>Chrome ilə:</b>")
# LUX-a aid mətnlər
a = must(a, "['Boş mənzillərin siyahısı','🏢'],['Borcluların siyahısı','💰'],", "['Bu gün kim ofisdədir?','🏢'],", 1, 'asstq')
a = must(a, "<li>“Boş mənzillərin siyahısını PDF ver”</li>", "<li>“Bu ay gecikənlərin siyahısını PDF ver”</li>", 1, 'asstli')
a = must(a, "planlar, tapşırıqlar, komendantlıq ödənişləri)", "planlar, tapşırıqlar)", 1, 'bk')
# Rəhbər + sahibkar hüququ olan istifadəçi: iki görünüş arasında keçid (default rəhbər)
a = must(a, "OWNER=(me.perms||[]).indexOf('ofis_owner')>=0;PREVIEW=!!(me.is_admin&&new URLSearchParams(location.search).get('baxis')==='sahibkar');",
 "var _pp=me.perms||[];window._DUAL=!me.is_admin&&_pp.indexOf('ofis_owner')>=0&&_pp.indexOf('ofis_admin')>=0;OWNER=_pp.indexOf('ofis_owner')>=0&&!window._DUAL;PREVIEW=!!((me.is_admin||window._DUAL)&&new URLSearchParams(location.search).get('baxis')==='sahibkar');", 1, 'dual')
a = must(a, "if(ME.is_admin){var pv=document.createElement('button');pv.className='out';pv.textContent=PREVIEW?'✕ Sahibkar görünüşündən çıx':'👁 Sahibkar kimi bax';",
 "if(ME.is_admin||window._DUAL){var pv=document.createElement('button');pv.className='out';pv.textContent=PREVIEW?'↩ Rəhbər görünüşü':'👁 Sahibkar görünüşü';", 1, 'pvbtn')
a = must(a, "PREVIEW?'Afiq Rəhmanov':(ME.full_name||ME.email)", "(ME.full_name||ME.email)", 1, 'afiq1')
a = must(a, "PREVIEW?'Afiq Rəhmanov':(ME.full_name||'Afiq Rəhmanov')", "(ME.full_name||'')", 1, 'afiq2')
a = must(a, "👁 Sahibkarın görəcəyi ekran (önizləmə). Sahibkar yalnız baxır, heç nəyi dəyişə bilmir.", "👁 Sahibkar görünüşü. Rəhbər görünüşünə qayıtmaq üçün yuxarıdakı düyməyə basın.", 1, 'pvbar')
# Saytdan müraciətlər (LUX satış saytı) VMM-də yoxdur
a = must(a, "if(MGR||(EMP&&EMP.lead_rotation))tabs.push(['leads','Müraciətlər']);", "", 1, 'leads')
a = must(a, "['remind','🔔 Xatırlat'],['asst','🎯 Assistent'],", "['remind','🔔 Xatırlat'],", 1, 'noasst-tab')
wr('assets/vmm-a.js', a)

b = rd('assets/ofis-b.js')
b = js_common(b, 'b')
b = must(b, "['lx','LUX ❤️','🏢','#b45309','#7c2d12'],", "['vm','VMM ❤️','⚓','#2e7d4f','#15232b'],", 1, 'lx')
b = re.sub(r"PLACES=\[[^\]]*\]", "PLACES=['VMM Ofis','Viking','Maro','Marox','Liman','Anbar','Gömrük','Gəmi']", b, count=1)
wr('assets/vmm-b.js', b)

# ---------------------------------------------------------------- auth
au = rd('assets/lux-auth.js')
au = must(au, "createClient(URL_,KEY,{global:{fetch:_tf}})",
          "createClient(URL_,KEY,{global:{fetch:_tf},db:{schema:'vmm'},auth:{storageKey:'vmm-auth'}})", 1, 'auth')
au = au.replace("localStorage.getItem('sb-avqchschbbltnnasabdm-auth-token')", "localStorage.getItem('vmm-auth')")
au = au.replace("'Content-Type':'application/json',Prefer:'return=minimal'}", "'Content-Type':'application/json','Content-Profile':'vmm',Prefer:'return=minimal'}")
au = au.replace("Authorization:'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify({p_email", "Authorization:'Bearer '+K,'Content-Type':'application/json','Content-Profile':'vmm'},body:JSON.stringify({p_email")
au = au.replace("/pilothayat\\.az|luxresidence\\.az|localhost|pages\\.dev/", "/vmm\\.az|vmm-ofis\\.netlify\\.app|workers\\.dev|localhost/")
au = au.replace("return h.indexOf('ofis.')===0?'ofis':(p.replace(/^\\/|\\.html$/g,'')||'sayt');", "return 'vmm';")
au = au.replace("['lux_sales','lux_commercial','lux_garage']", "[]")
au = au.replace("lux_remember", "vmm_remember").replace("lux_sess", "vmm_sess")
au = must(au, "<button>Daxil ol</button>", '<button>Daxil ol</button><div class="co"><span class="v">Viking</span><span class="m1">Maro</span><span class="m2">Marox</span></div>', 1, 'co')
# giriş pəncərəsinin dizaynı overlay/auth.css-dən gəlir
au = re.sub(r"function css\(\)\{.*?document\.head\.appendChild\(st\);\}", "function css(){}", au, count=1, flags=re.S)
wr('assets/vmm-auth.js', au)

# ---------------------------------------------------------------- AI assistent VMM-də yoxdur (21.10.2026)
NOASST_CSS = "\n/* Səsli assistent VMM-də söndürülüb */\n#bAsst,#v-asst,[onclick*=\"'asst'\"]{display:none!important}\n"


# ---------------------------------------------------------------- CSS
css = rd('assets/ofis-app.css')
for x, y in CSS_COLORS: css = css.replace(x, y)
theme = open(os.path.join(OV, 'vmm-theme.css'), encoding='utf-8').read()
wr('assets/vmm.css', css + '\n\n' + theme + NOASST_CSS)

# ---------------------------------------------------------------- HTML
h = rd('ofis.html')
h = must(h, '<link rel="preconnect" href="https://avqchschbbltnnasabdm.supabase.co" crossorigin><link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>',
         '<link rel="preconnect" href="https://avqchschbbltnnasabdm.supabase.co" crossorigin><link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin><link rel="preload" href="/assets/vmm/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>', 1, 'pre')
h = re.sub(r'<meta name="theme-color" content="[^"]*">', '<meta name="theme-color" content="#ffffff">', h)
h = re.sub(r'<link rel="manifest"[^>]*>', '<link rel="manifest" href="/manifest.webmanifest?v=' + VER + '">', h)
h = re.sub(r'<link rel="icon" href="/assets/ofis/favicon-32\.png[^>]*>', '<link rel="icon" href="/assets/vmm/favicon-32.png" type="image/png" sizes="32x32">', h)
h = re.sub(r'<link rel="icon" href="/assets/ofis/favicon-64\.png[^>]*>', '<link rel="icon" href="/assets/vmm/favicon-64.png" type="image/png" sizes="64x64">', h)
h = re.sub(r'<link rel="apple-touch-icon"[^>]*>', '<link rel="apple-touch-icon" href="/assets/vmm/apple-touch.png">', h)
h = re.sub(r'<meta name="apple-mobile-web-app-title" content="[^"]*">', '<meta name="apple-mobile-web-app-title" content="VMM Ofis">', h)
h = re.sub(r'<title>[^<]*</title>', '<title>VMM Ofis</title>', h)
h = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=Inter[^>]*>', '', h)
h = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=Playfair[^>]*>', '', h)
h = re.sub(r'<link rel="preconnect" href="https://fonts\.g[^>]*>', '', h)
h = re.sub(r'<script src="/assets/lux-auth\.js\?v=\d+"></script>', '<script src="/assets/vmm-auth.js?v=' + VER + '"></script>', h)
h = re.sub(r'<link rel="stylesheet" href="/assets/ofis-app\.css\?v=\d+">', '<link rel="stylesheet" href="/assets/vmm.css?v=' + VER + '">', h)
h = re.sub(r'<script defer src="/assets/ofis-a\.js\?v=\d+"></script>', '<script defer src="/assets/vmm-a.js?v=' + VER + '"></script>', h)
h = re.sub(r'<script defer src="/assets/ofis-b\.js\?v=\d+"></script>', '<script defer src="/assets/vmm-b.js?v=' + VER + '"></script>', h)
h = h.replace('<body>', '<body class="vmm">', 1)
# yükləmə ekranı
h = re.sub(r'<div id="bootload".*?\n</div>\n', open(os.path.join(OV, 'bootload.html'), encoding='utf-8').read(), h, count=1, flags=re.S)
# LUX brend skripti VMM-də lazım deyil
h = re.sub(r"<script>try\{if\(localStorage\.getItem\('ofis_brand'\)==='lux'\).*?</script>\n", '', h, count=1, flags=re.S)
h = must(h, '<div class="brand">Baş Ofis<small>İdarəetmə sistemi</small></div>', '<div class="brand">' + WM + '</div>', 1, 'brand')
h = h.replace('Baş Ofisin yeri', 'Ofisin yeri').replace('Baş Ofis — QR kod', 'Ofis QR kodu').replace('Baş Ofis', 'VMM Ofis')
h = h.replace('/assets/ofis/icon-192.png', '/assets/vmm/icon-192.png')
h = h.replace('</head>', '<link rel="stylesheet" href="/assets/vmm/auth.css?v=' + VER + '">\n</head>', 1)
wr('index.html', h)

# ---------------------------------------------------------------- SW
sw = rd('ofis-sw.js')
sw = sw.replace("const C='ofis-v", "const C='vmm-v")
sw = re.sub(r"const C='vmm-v\d+';const V='\d+';", f"const C='vmm-v{VER}';const V='{VER}';", sw)
sw = sw.replace("'/assets/ofis-app.css?v='+V,'/assets/ofis-a.js?v='+V,'/assets/ofis-b.js?v='+V", "'/assets/vmm.css?v='+V,'/assets/vmm-a.js?v='+V,'/assets/vmm-b.js?v='+V")
sw = sw.replace("/^\\/assets\\/ofis-(app\\.css|a\\.js|b\\.js)$/", "/^\\/assets\\/(vmm\\.css|vmm-a\\.js|vmm-b\\.js)$/")
sw = sw.replace('/assets/ofis/icon-192.png', '/assets/vmm/icon-192.png').replace('Baş Ofis', 'VMM Ofis')
wr('sw.js', sw)

shutil.copy(os.path.join(ROOT, 'bg.js'), os.path.join(DIST, 'bg.js'))

# ---------------------------------------------------------------- overlay faylları
for base, dirs, files in os.walk(OV):
    for f in files:
        if f in ('vmm-theme.css', 'bootload.html'): continue
        src = os.path.join(base, f); rel = os.path.relpath(src, OV)
        dst = os.path.join(DIST, rel); os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy(src, dst)

# yoxlama: Pilot Həyatın resurslarına qalan istinadlar
left = {}
for p in ['index.html', 'assets/vmm-a.js', 'assets/vmm-b.js', 'assets/vmm-auth.js', 'sw.js']:
    s = open(os.path.join(DIST, p), encoding='utf-8').read()
    for pat in ['pilothayat', 'luxresidence.az/', "functions.invoke('office", "functions.invoke('lux", "functions.invoke('soc", "functions.invoke('call",
                "schema:'public'", "storage.from('office')", "storage.from('chat')", "storage.from('avatars')", '/ofis-app.css', 'ofis-a.js', 'Baş Ofis']:
        c = s.count(pat)
        if c: left[f'{p}:{pat}'] = c
print('dist hazırdır:', DIST, 'v' + VER)
print('qalan istinadlar:', json.dumps(left, ensure_ascii=False))
