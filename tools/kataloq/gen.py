# LUX Residence — mənzil planları kataloqu (HTML → PDF). İstiqamət: argv[1] = a | b | c
import sys, json
exec(open('data.py').read())
D = sys.argv[1] if len(sys.argv) > 1 else 'a'
ONLY = sys.argv[2] if len(sys.argv) > 2 else None   # 'sample' — yalnız örnək səhifələr
NO = {'b36': {'111.64':1,'70.37':2,'134.33':3,'73.42':4,'150.66':5,'174.53':6},
      'b911': {'124.70':1,'138.06':2,'72.61':3,'72.52':4,'138.14':5,'123.55':6},
      'b1': {'128.43':1,'187.93':2,'245.72':3,'157.54':4}}
OTAQ = {1:'1 otaqlı',2:'2 otaqlı',3:'3 otaqlı',4:'4 otaqlı'}
def az(x): return f'{x:,.2f}'.replace(',', ' ').replace('.', ',')
def area(a): return a.replace('.', ',')

# Otaq sayına görə rəng: qum → terrakota → gil → espresso (hamısı brend paletindən)
TONE = {1:('#e3a582','#cf7550'), 2:('#d47a52','#ba4d2c'), 3:('#c0573a','#9a3c20'), 4:('#a5452a','#7d2f18')}  # yalnız LUX terrakota çalarları

css_common = '''
@font-face{font-family:PF;src:url(fonts/Playfair%20Display/PlayfairDisplay[wght].ttf) format('truetype');font-weight:400 900}
@font-face{font-family:PF;font-style:italic;src:url(fonts/Playfair%20Display/PlayfairDisplay-Italic[wght].ttf) format('truetype');font-weight:400 900}
@font-face{font-family:IN;src:url(fonts/Inter/Inter[opsz,wght].ttf) format('truetype');font-weight:100 900}
@page{size:210mm 297mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#ddd}
body{font-family:IN,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-feature-settings:"tnum" 1,"lnum" 1;font-variant-numeric:lining-nums tabular-nums}
h1,.sub,.big,.ar,.chip b{font-variant-numeric:lining-nums;font-feature-settings:"lnum" 1}
.pg{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;break-after:page}
.serif{font-family:PF,serif}
sup{font-size:.5em;vertical-align:.7em;line-height:0}
.rooms{list-style:none}
.rooms li{display:grid;grid-template-columns:7mm 1fr auto;align-items:baseline;padding:1.55mm 0}
.rooms .n{font-weight:600;font-size:8pt}
.rooms .r{font-size:9.5pt}
.rooms .v{font-size:9.5pt;font-weight:600}
'''

# ---------- A: «Səhər işığı» — krem fon, terrakota-qızılı yumşaq gradient ----------
css_a = '''
.pg{background:radial-gradient(120mm 90mm at 92% 4%,rgba(201,138,78,.22),transparent 70%),radial-gradient(140mm 110mm at 0% 100%,rgba(186,77,44,.12),transparent 70%),linear-gradient(170deg,#faf6f1 0%,#f3e9de 100%);color:#2a1d14}
.ap{padding:16mm 16mm 14mm}
.ap .k{font-size:7.5pt;letter-spacing:.22em;text-transform:uppercase;color:#9a3c20;display:flex;gap:4mm;align-items:center}
.ap .k i{flex:0 0 10mm;height:1px;background:#ba4d2c}
.ap h1{font-family:PF;font-weight:500;font-size:44pt;line-height:1;margin-top:5mm;letter-spacing:-.01em}
.ap h1 em{font-style:italic;font-weight:400;color:#ba4d2c}
.ap .sub{font-family:PF;font-style:italic;font-size:13pt;color:#8b7a6b;margin-top:2mm}
.ap .plan{position:absolute;left:12mm;right:12mm;top:62mm;height:140mm;display:flex;align-items:center;justify-content:center}
.ap .plan img{max-width:100%;max-height:100%;filter:drop-shadow(0 6mm 8mm rgba(60,35,20,.18))}
.ap .bot{position:absolute;left:16mm;right:16mm;bottom:14mm;display:grid;grid-template-columns:1fr 1fr;gap:0 12mm;border-top:1px solid #e3d5c6;padding-top:5mm}
.ap .rooms li{border-bottom:1px solid #eadfd3}
.ap .rooms .n{color:#ba4d2c}
.ap .rooms .v{color:#2a1d14}
.ap .tot{grid-column:1/-1;display:flex;justify-content:space-between;margin-top:4mm;font-size:8pt;color:#8b7a6b;letter-spacing:.06em}
.ap .chip{position:absolute;right:16mm;top:16mm;width:22mm;height:22mm;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-size:6.5pt;letter-spacing:.14em;text-transform:uppercase}
.ap .chip b{font-family:PF;font-size:20pt;font-weight:500;letter-spacing:0;line-height:1}
'''
# ---------- B: «Espresso axşamı» — tünd espresso, qızılı aksent ----------
css_b = '''
.pg{background:radial-gradient(150mm 120mm at 85% 0%,rgba(201,138,78,.28),transparent 65%),linear-gradient(165deg,#3b261b 0%,#251712 55%,#1a0f0b 100%);color:#f3e9de}
.ap{padding:16mm}
.ap .k{font-size:7.5pt;letter-spacing:.22em;text-transform:uppercase;color:#c98a4e}
.ap h1{font-family:PF;font-weight:500;font-size:44pt;line-height:1;margin-top:5mm}
.ap h1 em{font-style:italic;font-weight:400;color:#e0b07c}
.ap .sub{font-family:PF;font-style:italic;font-size:13pt;color:#b9a593;margin-top:2mm}
.ap .plan{position:absolute;left:12mm;right:12mm;top:60mm;height:142mm;border-radius:6mm;background:linear-gradient(160deg,#fbf7f2,#efe3d6);display:flex;align-items:center;justify-content:center;padding:8mm}
.ap .plan img{max-width:100%;max-height:100%}
.ap .bot{position:absolute;left:16mm;right:16mm;bottom:13mm;display:grid;grid-template-columns:1fr 1fr;gap:0 12mm}
.ap .rooms li{border-bottom:1px solid rgba(243,233,222,.12)}
.ap .rooms .n{color:#c98a4e}
.ap .tot{grid-column:1/-1;display:flex;justify-content:space-between;margin-top:4mm;font-size:8pt;color:#9c8877;letter-spacing:.06em}
.ap .chip{display:none}
'''
# ---------- C: «Rəng kodu» — ağ səhifə, otaq sayına görə gradient zolaq ----------
css_c = '''
.pg{background:#fcfaf7;color:#2a1d14}
.ap .band{position:absolute;left:0;top:0;bottom:0;width:58mm;color:#fff;padding:16mm 10mm 14mm 12mm;display:flex;flex-direction:column}
.ap .band .k{font-size:7pt;letter-spacing:.22em;text-transform:uppercase;opacity:.85}
.ap .band .big{font-family:PF;font-size:120pt;line-height:.8;font-weight:500;margin-top:10mm}
.ap .band .big small{display:block;font-size:12pt;font-style:italic;font-weight:400;margin-top:4mm;opacity:.9}
.ap .band .ar{margin-top:auto;font-family:PF;font-size:30pt;line-height:1}
.ap .band .ar span{display:block;font-family:IN;font-size:7pt;letter-spacing:.2em;text-transform:uppercase;opacity:.8;margin-bottom:2mm}
.ap .main{position:absolute;left:58mm;right:0;top:0;bottom:0;padding:16mm 14mm 14mm 12mm}
.ap .main .plan{height:150mm;display:flex;align-items:center;justify-content:center}
.ap .main .plan img{max-width:100%;max-height:100%}
.ap .main .rooms{margin-top:8mm;columns:2;column-gap:10mm}
.ap .main .rooms li{break-inside:avoid;border-bottom:1px solid #ece3d9}
.ap .main .rooms .n{color:#ba4d2c}
.ap .main .tot{margin-top:5mm;font-size:8pt;color:#8b7a6b;display:flex;justify-content:space-between;letter-spacing:.06em}
'''
CSS = css_common + {'a':css_a,'b':css_b,'c':css_c}[D]

css_a += """
.cv{padding:22mm 20mm;display:flex;flex-direction:column}
.cv .logo{width:34mm}
.cv .t{margin-top:auto}
.cv .t .k{font-size:8pt;letter-spacing:.3em;text-transform:uppercase;color:#9a3c20}
.cv h1{font-family:PF;font-weight:500;font-size:58pt;line-height:.98;margin-top:6mm;letter-spacing:-.015em}
.cv h1 em{font-style:italic;font-weight:400;color:#ba4d2c}
.cv .lead{font-size:10.5pt;line-height:1.6;color:#6e5c4e;max-width:120mm;margin-top:8mm}
.cv .meta{display:flex;justify-content:space-between;border-top:1px solid #e3d5c6;padding-top:5mm;margin-top:16mm;font-size:8pt;letter-spacing:.14em;text-transform:uppercase;color:#8b7a6b}
.cv .wash{position:absolute;inset:0;background:radial-gradient(130mm 160mm at 100% 60%,rgba(201,138,78,.30),transparent 70%),radial-gradient(90mm 90mm at 85% 95%,rgba(186,77,44,.22),transparent 70%)}
.cv .tower{position:absolute;right:-16mm;top:34mm;height:126mm;filter:drop-shadow(0 8mm 10mm rgba(60,35,20,.18))}
.cv .t,.cv .logo{position:relative}
.cv .xx{position:absolute;right:-40mm;top:-30mm;width:170mm;height:170mm;border-radius:50%;background:radial-gradient(circle at 35% 65%,rgba(186,77,44,.9),rgba(201,138,78,.55) 45%,rgba(201,138,78,0) 72%);opacity:.55;filter:blur(2px)}
.in{padding:20mm}
.in .hero{height:64mm;margin:-20mm -20mm 10mm;background:linear-gradient(180deg,rgba(251,248,244,0) 55%,#f9f4ee 100%),url(img2.webp) center 40%/cover}
.in .k{font-size:7.5pt;letter-spacing:.22em;text-transform:uppercase;color:#9a3c20;display:flex;gap:4mm;align-items:center}
.in .k i{flex:0 0 10mm;height:1px;background:#ba4d2c}
.in h2{font-family:PF;font-weight:500;font-size:30pt;line-height:1.05;margin-top:6mm;max-width:150mm}
.in h2 em{font-style:italic;font-weight:400;color:#ba4d2c}
.in p{font-size:10.5pt;line-height:1.7;color:#5a4a3e;margin-top:6mm;max-width:150mm}
.stats{display:grid;grid-template-columns:repeat(4,1fr);margin-top:9mm;border-top:1px solid #e3d5c6;border-bottom:1px solid #e3d5c6}
.stats div{padding:6mm 0 5mm;border-right:1px solid #eadfd3;padding-left:5mm}
.stats div:first-child{padding-left:0}.stats div:last-child{border-right:0}
.stats b{display:block;font-family:PF;font-weight:500;font-size:26pt;color:#2a1d14;font-variant-numeric:lining-nums}
.stats span{font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:#8b7a6b}
.feat{list-style:none;margin-top:7mm;display:grid;grid-template-columns:1fr 1fr;gap:0 12mm}
.feat li{padding:3.4mm 0;border-bottom:1px solid #eadfd3;font-size:10pt;display:flex;gap:4mm}
.feat li:before{content:"";flex:0 0 2mm;height:2mm;margin-top:1.6mm;border-radius:50%;background:linear-gradient(145deg,#c98a4e,#ba4d2c)}
.in .sign{position:absolute;left:20mm;bottom:20mm;font-family:PF;font-style:italic;font-size:16pt;color:#ba4d2c}
.ix table{width:100%;border-collapse:collapse;margin-top:10mm}
.ix th{font-size:7pt;letter-spacing:.18em;text-transform:uppercase;color:#8b7a6b;text-align:left;font-weight:500;padding:0 0 3mm;border-bottom:1px solid #d9c8b6}
.ix td{padding:2.9mm 0;border-bottom:1px solid #eadfd3;font-size:9.5pt}
.ix tr.g td{padding-top:7mm;font-family:PF;font-size:13pt;color:#9a3c20;border-bottom:1px solid #d9c8b6}
.ix .dot{display:inline-block;width:2.6mm;height:2.6mm;border-radius:50%;margin-right:3mm;vertical-align:-.2mm}
.ix td.r{text-align:right}
.sec{padding:20mm;display:flex;flex-direction:column}
.sec .num{font-family:PF;font-size:110pt;line-height:.8;color:transparent;-webkit-text-stroke:1px #ba4d2c;opacity:.5}
.sec h2{font-family:PF;font-weight:500;font-size:44pt;line-height:1;margin-top:8mm}
.sec h2 em{font-style:italic;color:#ba4d2c;font-weight:400}
.sec .key{margin-top:auto;border-radius:4mm;overflow:hidden;background:#fbf6f0;padding:5mm;box-shadow:0 5mm 12mm rgba(60,35,20,.10)}
.sec .key img{width:100%;display:block}
.sec .list{display:flex;flex-wrap:wrap;gap:2.5mm;margin-top:8mm}
.sec .list span{font-size:8.5pt;padding:1.8mm 3.5mm;border-radius:10mm;border:1px solid #e0cfbd;background:rgba(255,255,255,.55)}
.sec .list span b{font-weight:600;color:#9a3c20;margin-right:1.5mm}
.bk{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20mm}
.bk .logo{width:40mm}
.bk .tag{font-family:PF;font-style:italic;font-size:18pt;color:#ba4d2c;margin-top:10mm}
.bk .ph{margin-top:16mm;font-family:PF;font-size:20pt;line-height:1.5;font-variant-numeric:lining-nums}
.bk .ad{margin-top:10mm;font-size:9.5pt;line-height:1.6;color:#6e5c4e;max-width:110mm;padding:4mm 8mm;border:1px solid #e0cfbd;border-radius:12mm}
.bk .fn{position:absolute;left:0;right:0;bottom:14mm;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:#a8988a}
.foot{position:absolute;left:20mm;right:20mm;bottom:12mm;display:flex;justify-content:space-between;font-size:7.5pt;color:#a8988a;letter-spacing:.06em}
"""
if D=='a': CSS = css_common + css_a


def rooms_html(rooms):
    return ''.join(f'<li><span class="n">{i:02d}</span><span class="r">{r}</span><span class="v">{az(v)} m²</span></li>' for i,(r,v) in enumerate(rooms,1))

def ap_page(g, r, a, img, rooms, pno):
    no = NO[g].get(a if '.' in a else a, '')
    bname = G[g][0]
    t0, t1 = TONE[r]
    half = (len(rooms)+1)//2
    foot = f'<div class="tot"><span>{bname} · Mənzil № {no}</span><span>{pno:02d}</span></div>'
    if D in ('a','b'):
        return f'''<section class="pg ap">
<div class="k"><i></i>{bname} · Mənzil № {no}</div>
<h1>{OTAQ[r].split()[0]} <em>otaqlı</em></h1>
<div class="sub">{area(a)} m² · mənzil planı</div>
<div class="chip" style="background:linear-gradient(145deg,{t0},{t1})"><b>{r}</b>otaq</div>
<div class="plan"><img src="pplans/p-{a}.png"></div>
<div class="bot"><ul class="rooms">{rooms_html(rooms[:half])}</ul><ul class="rooms" start="{half+1}">{''.join(f'<li><span class="n">{i:02d}</span><span class="r">{x}</span><span class="v">{az(v)} m²</span></li>' for i,(x,v) in enumerate(rooms[half:],half+1))}</ul>{foot}</div>
</section>'''
    return f'''<section class="pg ap">
<div class="band" style="background:linear-gradient(175deg,{t0} 0%,{t1} 100%)">
<div class="k">{bname}</div>
<div class="big">{r}<small>{'otaqlı mənzil'}</small></div>
<div class="ar"><span>Ümumi sahə</span>{area(a)} m²</div></div>
<div class="main"><div class="plan"><img src="pplans/p-{a}.png"></div>
<ul class="rooms">{rooms_html(rooms)}</ul>{foot}</div>
</section>'''


pages=[]
if ONLY:
    for x in A:
        if x[2]=='111.64': pages.append(ap_page(*x, pno=4))
else:
    logo = open('logo-site-rust.svg').read()
    pages.append(f"""<section class="pg cv"><div class="wash"></div><img class="tower" src="img6.webp"><div class="logo">{logo}</div>
<div class="t"><div class="k">Mənzil planları · Kataloq</div>
<h1>Zövqlü insanların <em>seçimi</em></h1>
<div class="lead">Bina 1, 3–6 və 9–11 üzrə 16 mənzil planı — otaqların ölçüləri ilə birlikdə.</div>
<div class="meta"><span>LUX Residence</span><span>Noyabr 2026</span></div></div></section>""")
    pages.append("""<section class="pg in"><div class="hero"></div><div class="k"><i></i>Layihə haqqında</div>
<h2>Komfort, müasir memarlıq və <em>premium</em> yaşayış standartları</h2>
<p>Bakının prestijli məkanlarından birində yerləşən Lux Residence komfort, müasir memarlıq və premium yaşayış standartlarını bir araya gətirir. 4,2 hektar ərazidə inşa edilən, 14, 16 və 20 mərtəbəli 11 binadan ibarət yaşayış kompleksi yüksək keyfiyyətli tikinti materialları və müasir texnologiyalarla fərqlənir.</p>
<div class="stats"><div><b>4,2</b><span>hektar ərazi</span></div><div><b>11</b><span>bina</span></div><div><b>14–20</b><span>mərtəbə</span></div><div><b>77,8%</b><span>açıq məkan</span></div></div>
<ul class="feat"><li>Ərazinin 77,8%-i açıq məkanlar üçün ayrılıb</li><li>Geniş yaşıllıq və istirahət zonaları</li><li>Uşaq oyun meydançaları və bağça</li><li>Fitness mərkəzləri</li><li>Futbol meydançası</li><li>Marketlər və ticarət obyektləri</li><li>Mənzilləri azad planlama imkanı</li></ul>
<div class="sign">Rahatlığınız üçün hər detal düşünülüb.</div><div class="foot"><span>LUX Residence</span><span>02</span></div></section>""")
    # İndeks
    order=['b36','b911','b1']; pno=3; plan_pages={}
    for g in order:
        pno+=1
        for x in A:
            if x[0]==g: pno+=1; plan_pages[(g,x[2])]=pno
    rows=''
    for g in order:
        rows+=f'<tr class="g"><td colspan="4">{G[g][0]}</td></tr>'
        for x in sorted([x for x in A if x[0]==g], key=lambda x: NO[g][x[2]]):
            t0,t1=TONE[x[1]]
            rows+=f'<tr><td><span class="dot" style="background:linear-gradient(145deg,{t0},{t1})"></span>Mənzil № {NO[g][x[2]]}</td><td>{OTAQ[x[1]]}</td><td>{area(x[2])} m²</td><td class="r">{plan_pages[(g,x[2])]:02d}</td></tr>'
    pages.append(f"""<section class="pg in ix"><div class="k"><i></i>Mündəricat</div><h2>16 mənzil, <em>3 bina qrupu</em></h2>
<table><tr><th>Mənzil</th><th>Otaq</th><th>Sahə</th><th style="text-align:right">Səhifə</th></tr>{rows}</table><div class="foot"><span>LUX Residence</span><span>03</span></div></section>""")
    pno=3; si=0
    for g in order:
        si+=1; pno+=1
        items=sorted([x for x in A if x[0]==g], key=lambda x: NO[g][x[2]])
        chips=''.join(f'<span><b>№ {NO[g][x[2]]}</b>{OTAQ[x[1]]} · {area(x[2])} m²</span>' for x in items)
        nm=G[g][0].replace('Bina ','')
        pages.append(f"""<section class="pg sec"><div class="num">0{si}</div><h2>Bina <em>{nm}</em></h2>
<div class="list">{chips}</div><div class="key"><img src="key-{g}.png"></div><div class="foot" style="bottom:8mm"><span>Tipik mərtəbə planı</span><span>{pno:02d}</span></div></section>""")
        for x in A:
            if x[0]==g: pno+=1; pages.append(ap_page(*x, pno=pno))
    pages.append(f"""<section class="pg bk"><div class="logo">{logo}</div><div class="tag">Zövqlü insanların seçimi!</div>
<div class="ph">+994 (50) 809 00 88<br>+994 (50) 700 00 88</div>
<div class="ad">Ələsgər Ələkbərov, Mikayıl Müşfiq, Seyfəddin Dağlı, İsmayıl bəy Qutqaşınlı küçələrinin kəsişməsi</div>
<div class="fn">Planlar məlumat xarakterlidir · sahələr layihə üzrədir</div></section>""")
html = f'<!doctype html><html lang="az"><head><meta charset="utf-8"><title>LUX Residence — Mənzil planları</title><style>{CSS}</style></head><body>{"".join(pages)}</body></html>'
open(f'cat-{D}{"-s" if ONLY else ""}.html','w').write(html)
print('ok', D, len(pages))
