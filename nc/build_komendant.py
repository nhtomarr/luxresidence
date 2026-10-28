#!/usr/bin/env python3
"""LUX komendant.html -> nc/komendant.html (Nizami City).
Məlumat "nc" sxemindədir; icazələr nc_*; dizayn Nizami (göy/laym), bina adları A·1 … G·2.
LUX komendant yeniləndikdə bu skripti yenidən işə salın: python3 nc/build_komendant.py"""
import re, pathlib, sys
R = pathlib.Path(__file__).resolve().parent.parent
s = (R / 'komendant.html').read_text()
n0 = len(s)

def rep(a, b, cnt=None, must=True):
    global s
    c = s.count(a)
    if must and c == 0:
        sys.exit('TAPILMADI: ' + a[:80])
    if cnt is not None and c != cnt:
        sys.exit(f'SAY {c}!={cnt}: ' + a[:80])
    s = s.replace(a, b)

# --- brend və mətnlər ---
rep('<title>LUX Residence — Komendantlıq', '<title>Nizami City — Komendantlıq')
rep('LUX Residence Komendantlığı', 'Nizami City Komendantlığı', must=False)
rep('LUX Residence komendantlığı', 'Nizami City komendantlığı', must=False)
rep('LUX RESIDENCE', 'NIZAMI CITY', must=False)
rep('LUX Residence', 'Nizami City', must=False)
rep('@sakin.luxresidence.az', '@sakin.nizamicity.az')
rep('href="komendant.webmanifest"', 'href="/nc/komendant.webmanifest"', must=False)
rep('href="/komendant.webmanifest"', 'href="/nc/komendant.webmanifest"', must=False)
s = re.sub(r'<link rel="apple-touch-icon"[^>]*>', '<link rel="apple-touch-icon" href="/assets/nc/apple-touch.png"><link rel="icon" href="/assets/nc/logo.png">', s, count=1)
s = s.replace('theme-color" content="#efe6df', 'theme-color" content="#0f1a33')
rep('url(/assets/km/bg.jpg)', 'url(/assets/nc/kmbg.jpg)')
rep('content:"LX"', 'content:"";background:#0f1a33 url(/assets/nc/logo.png) center/cover!important')

# --- yollar (luxresidence.az/nc/komendant və ya nizamicity.az/komendant) ---
rep("location.href='/komendant'", "location.href=KPATH")
rep("location.origin+'/komendant?g='", "location.origin+KPATH+'?g='")
rep("location.origin+'/komendant\\nGiriş: '", "location.origin+KPATH+'\\nGiriş: '")
rep("location.origin+'/komendant</b>", "location.origin+KPATH+'</b>")

# --- icazələr ---
rep("luxAuth({perms:['komendant','komendant_kassa','sakin'],title:'Komendantlıq'", "luxAuth({perms:['nc_komendant','nc_komendant_kassa','nc_sakin'],title:'Komendantlıq',logo:'/assets/nc/logo.png'")
rep("accent:'#ba4d2c',onReady:function(c,me){sb=c;", "accent:'#0f1a33',onReady:function(c,me){sb=ncWrap(c);")
rep("CASH=me.is_admin||p.indexOf('komendant_kassa')>=0;STAFF=CASH||p.indexOf('komendant')>=0;RES=!STAFF&&p.indexOf('sakin')>=0;",
    "CASH=me.is_admin||p.indexOf('nc_komendant_kassa')>=0;STAFF=CASH||p.indexOf('nc_komendant')>=0;RES=!STAFF&&p.indexOf('nc_sakin')>=0;")
rep("p.indexOf('komendant_kassa')>=0||p.indexOf('komendant_akt')>=0", "p.indexOf('nc_komendant_kassa')>=0||p.indexOf('nc_komendant_akt')>=0")
rep("perms:['sakin']", "perms:['nc_sakin']")
rep("invoke('km-notify'", "invoke('nc-km-notify'")

# --- fayl yolları (storage) ---
rep("var p=u.id+'/'+Date.now()", "var p='nc/'+u.id+'/'+Date.now()")
rep("var p='docs/'+Date.now()", "var p='nc/docs/'+Date.now()")
rep("var path='acts/'+Date.now()", "var path='ncacts/'+Date.now()")

# --- bina adları ---
rep("'Bina '+x.binas.join(', ')", "x.binas.map(BN).join(', ')")
rep("' · Bina '+p.binas.join(', ')", "' · '+p.binas.map(BN).join(', ')")
rep("(t.binas&&t.binas.length?t.binas.join(', '):'hamısı')", "(t.binas&&t.binas.length?t.binas.map(BN).join(', '):'hamısı')", must=False)
s, k = re.subn(r"Bina '\+([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)", r"'+BN(\1)", s)
print('Bina etiketləri:', k)
left = re.findall(r".{60}Bina [^a-zəüöğışç].{40}", s)
for l in left: print('  qalan:', l)

# --- köməkçi kod (ən əvvəldə) ---
helper = """<script>
/* Nizami City: nc sxemi, bina adları, yol */
var KPATH=/^\\/nc\\//.test(location.pathname)?'/nc/komendant':'/komendant';
var NC_BINAS=['A · Giriş 1','A · Giriş 2','B','E · Giriş 1','E · Giriş 2','F','G · Giriş 1','G · Giriş 2'];
function BN(b){var n=+b;return NC_BINAS[n-1]?'Bina '+NC_BINAS[n-1]:'Bina '+b;}
function ncWrap(c){var s=c.schema('nc'),PUB={office_push_subs:1,lux_profiles:1,lux_kv:1};return {from:function(t){return PUB[t]?c.from(t):s.from(t);},rpc:function(n,a,o){return n==='office_push_key'?c.rpc(n,a,o):s.rpc(n,a,o);},storage:c.storage,auth:c.auth,functions:c.functions,channel:function(){return c.channel.apply(c,arguments);},removeChannel:function(){return c.removeChannel.apply(c,arguments);},_c:c};}
</script>
"""
i = s.find('<script')
s = s[:i] + helper + s[i:]

# --- Nizami rəng palitrası (LUX terakota -> göy / laym) ---
CMAP = {
 '#ba4d2c':'#0f1a33','#9a3c20':'#1a2742','#b1381f':'#1a2742','#ab4424':'#2d3a57','#bf5330':'#2d3a57','#c9603c':'#3e4a66','#6b2e1a':'#0b1324','#8a3418':'#0b1324',
 '#f0a283':'#dde66e','#251712':'#0f1a33','#1d1611':'#0b1324','#2a1d14':'#0f1a33','#efe6df':'#e8eae0','#f1ece6':'#eceee4','#fbf7f3':'#fbfaf5','#fffdfb':'#fbfaf5',
 '#f3ebe3':'#eceee4','#eadfd3':'#dfe2d6','#e8c9b8':'#d9dfb0','#f7f2ec':'#f3f2ea','#f3e7dc':'#eceee4','#d8c3b0':'#c9cdd8','#e7d8ca':'#dde1ea','#5a4032':'#2d3a57',
 '#8a7a6f':'#66708a','#8b7a6b':'#66708a','#b8a28f':'#8a93a8','#6f6056':'#3e4a66','#5e4e44':'#3e4a66','#3a1d0d':'#0b1324','#fbe6dd':'#eef2cf','#d6c7b8':'#c9cdd8','#e89a78':'#dde66e','#e0a58c':'#c2cd3f','#a4331c':'#1a2742','#cd6440':'#7f8c1a','#d9795a':'#9aa827','#cf6743':'#7f8c1a','#f1ddd1':'#e7ebcc','#e9b39d':'#d9dfb0','#f6f1ec':'#f3f2ea','#25120a':'#070c18','#1b0d06':'#050911',
}
for a, b in CMAP.items():
    s = re.sub(re.escape(a) + r'\b', b, s, flags=re.I)
for a, b in [('rgba(90,45,25,', 'rgba(15,26,51,'), ('rgba(90,40,20,', 'rgba(15,26,51,'), ('rgba(60,30,15,', 'rgba(11,19,36,'), ('rgba(40,22,12,', 'rgba(11,19,36,'),
             ('rgba(37,23,18,', 'rgba(11,19,36,'), ('rgba(42,29,20,', 'rgba(11,19,36,'), ('rgba(154,60,32,', 'rgba(15,26,51,'), ('rgba(186,77,44,', 'rgba(127,140,26,'),
             ('rgba(224,122,85,', 'rgba(194,205,63,'), ('rgba(214,140,108,', 'rgba(194,205,63,')]:
    s = s.replace(a, b)

# --- son üslub: Inter, laym vurğuları ---
extra = """<style id="ncTheme">
:root{--serif:'Inter',-apple-system,system-ui,sans-serif;--lime:#c2cd3f;--lime-d:#7f8c1a}
.top .brand::before{box-shadow:0 0 0 2px rgba(194,205,63,.55),0 10px 22px -10px rgba(15,26,51,.6)!important}
.tabs button.on{box-shadow:inset 0 -2px 0 #c2cd3f,0 8px 18px -10px rgba(15,26,51,.45)!important}
h1,h2,h3,.brand,.serif{font-family:'Inter',-apple-system,system-ui,sans-serif!important;letter-spacing:-.025em}
::selection{background:#c2cd3f;color:#0b1324}
</style>
"""
s = s.replace('</head>', extra + '</head>', 1)

out = R / 'nc' / 'komendant.html'
out.write_text(s)
print('yazıldı:', out, n0, '->', len(s))
