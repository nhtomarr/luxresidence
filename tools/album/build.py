# LUX Residence — 2 otaqlı mənzil (111,64 m²) üçün konsept dizayn layihəsi albomu (A3, PDF)
import json, math
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader

FD='/usr/share/fonts/truetype/google-fonts/'
for n,f in [('P','Poppins-Regular'),('PL','Poppins-Light'),('PM','Poppins-Medium'),('PB','Poppins-Bold')]:
    pdfmetrics.registerFont(TTFont(n,FD+f+'.ttf'))

INK=HexColor('#241109'); TER=HexColor('#B4552F'); TER2=HexColor('#C8693F'); CREAM=HexColor('#F7F2EC'); BEIGE=HexColor('#E9DFD1')
GREY=HexColor('#8A7F75'); LINE=HexColor('#CFC4B6'); WALL=HexColor('#2F2A27'); IWALL=HexColor('#5E5650')
FLOORC={'floorW':HexColor('#E8D2B4'),'tile':HexColor('#ECE7E0'),'stone':HexColor('#DCD4C8'),'bath':HexColor('#DCE6EA')}
FLOORN={'floorW':'Parket — palıd, 3 qatlı, 14 mm','tile':'Keramoqranit 60×120, mat','stone':'Daş kafel 60×60, şaxtaya davamlı','bath':'Keramoqranit 60×60 + divar kafeli'}

P=json.load(open('/tmp/album/plan108.json'))
ROOMS,WALLS,WINS,DEF=P['ROOMS108'],P['WALLS108'],P['WINS108'],P['DEF108']
S=93.0; B=[150,85,1240,1395]
PW,PH=landscape(A3)
OUT='/tmp/album/LUX_Residence_Dizayn_Layihesi_2otaq_111m2.pdf'
c=canvas.Canvas(OUT,pagesize=(PW,PH))
c.setTitle('LUX Residence — Dizayn layihəsi · 2 otaqlı mənzil 111,64 m²'); c.setAuthor('LUX Residence'); c.setSubject('Konsept dizayn layihəsi')

M=12*mm; TB=74*mm  # kənar boşluq, sağdakı ştamp eni
DATE='15.11.2026'
SHEETS=[]
def az(v,d=2): return f'{v:,.{d}f}'.replace(',',' ').replace('.',',')

def frame(title, no, scale=None, note=None):
    c.setFillColor(white); c.rect(0,0,PW,PH,0,1)
    c.setStrokeColor(INK); c.setLineWidth(.6); c.rect(M,M,PW-2*M,PH-2*M)
    x0=PW-M-TB; c.line(x0,M,x0,PH-M)
    # ştamp
    c.drawImage(ImageReader('/home/claude/luxresidence/assets/logo-dark.png'),x0+TB/2-11*mm,PH-M-38*mm,22*mm,29.6*mm,mask='auto')
    c.setFillColor(TER); c.rect(x0,PH-M-62*mm,TB,16*mm,0,1)
    c.setFillColor(white); c.setFont('PM',10); c.drawCentredString(x0+TB/2,PH-M-52.5*mm,'DİZAYN LAYİHƏSİ')
    c.setFont('PL',7.5); c.drawCentredString(x0+TB/2,PH-M-58*mm,'konsept · interyer')
    y=PH-M-72*mm
    def row(k,v,big=False):
        nonlocal y
        c.setFillColor(GREY); c.setFont('P',6.6); c.drawString(x0+5*mm,y,k.upper())
        c.setFillColor(INK); c.setFont('PM' if big else 'P',9.5 if big else 8.2)
        for i,ln in enumerate(v.split('\n')): c.drawString(x0+5*mm,y-4.6*mm-i*4*mm,ln)
        y-=(9.5+4*(v.count('\n')))*mm
        c.setStrokeColor(LINE); c.setLineWidth(.4); c.line(x0+5*mm,y+2.2*mm,x0+TB-5*mm,y+2.2*mm)
    row('Obyekt','LUX Residence\nBakı, Nizami r.')
    row('Mənzil','2 otaqlı · 111,64 m²')
    row('Vərəq',title,True)
    if scale: row('Miqyas',scale)
    row('Tarix',DATE)
    row('Mərhələ','Konsept (EP)')
    if note:
        c.setFillColor(GREY); c.setFont('P',6.8)
        yy=y-2*mm
        for ln in note: c.drawString(x0+5*mm,yy,ln); yy-=3.6*mm
    # vərəq nömrəsi
    c.setFillColor(INK); c.rect(x0,M,TB,18*mm,0,1)
    c.setFillColor(white); c.setFont('PL',7); c.drawString(x0+5*mm,M+11*mm,'VƏRƏQ'); c.setFont('PB',20); c.drawRightString(x0+TB-5*mm,M+5.5*mm,f'{no:02d}')
    SHEETS.append((no,title))

def heading(t,sub=None,x=None,y=None):
    x=x or M+10*mm; y=y or PH-M-14*mm
    c.setFillColor(INK); c.setFont('PL',22); c.drawString(x,y,t)
    if sub: c.setFillColor(GREY); c.setFont('P',9); c.drawString(x,y-7*mm,sub)
    c.setFillColor(TER); c.rect(x,y-11*mm,18*mm,1.1*mm,0,1)

# ---------- plan geometriyası ----------
SC=1/60.0  # 1:60
K=1000*mm*SC  # 1 m -> pt
def tr(ox,oy):
    return lambda px,py:(ox+(px-B[0])/S*K, oy-(py-B[1])/S*K)
def plan_origin():
    wpx=(B[2]-B[0])/S*K; hpx=(B[3]-B[1])/S*K
    areaW=PW-2*M-TB; ox=M+14*mm; oy=PH-M-22*mm-((PH-2*M-30*mm)-hpx)/2
    return tr(ox,oy)

def segrect(w,T):
    x1,y1,x2,y2,t=w; t=t/2
    if y1==y2: return (min(x1,x2)-t,y1-t,max(x1,x2)+t,y1+t)
    return (x1-t,min(y1,y2)-t,x1+t,max(y1,y2)+t)

def detect_doors():
    groups={}
    for w in WALLS:
        x1,y1,x2,y2,t=w
        if y1==y2: key=('h',y1); a,b=sorted([x1,x2])
        else: key=('v',x1); a,b=sorted([y1,y2])
        groups.setdefault(key,[]).append((a,b,t))
    doors=[]
    for (o,cc),segs in groups.items():
        segs.sort()
        for (a1,b1,t1),(a2,b2,t2) in zip(segs,segs[1:]):
            g=a2-b1
            if 40<=g<=140:
                mid=(b1+a2)/2
                onwin=any(((o=='h' and wy1==wy2==cc and min(wx1,wx2)-5<=mid<=max(wx1,wx2)+5) or (o=='v' and wx1==wx2==cc and min(wy1,wy2)-5<=mid<=max(wy1,wy2)+5)) for wx1,wy1,wx2,wy2 in WINS)
                if onwin: continue
                doors.append({'o':o,'c':cc,'a':b1,'b':a2,'w':g/S,'t':min(t1,t2)})
    return doors
DOORS=detect_doors()
def room_at(px,py):
    for r in ROOMS:
        if r[0]<=px<=r[2] and r[1]<=py<=r[3]: return r
    return None
for i,d in enumerate(DOORS):
    m=(d['a']+d['b'])/2
    pts=[(m,d['c']-30),(m,d['c']+30)] if d['o']=='h' else [(d['c']-30,m),(d['c']+30,m)]
    rs=[room_at(*p) for p in pts]; d['rooms']=[r[5] if r else 'Giriş' for r in rs]
    d['id']=f'Q{i+1}'
    d['bath']=any(r and r[4]=='bath' for r in rs)

def draw_plan(T, fill=True, labels=True, doors=True, dims=False, lw_scale=1, fillc=None, wallc=None):
    if fill:
        for r in ROOMS:
            x1,y1=T(r[0],r[1]); x2,y2=T(r[2],r[3])
            c.setFillColor((fillc or FLOORC).get(r[4],BEIGE) if isinstance(fillc or FLOORC,dict) else fillc); c.rect(x1,y2,x2-x1,y1-y2,0,1)
    for w in WINS:
        x1,y1=T(w[0],w[1]); x2,y2=T(w[2],w[3]); t=13/S*K
        c.setFillColor(HexColor('#EAF2F5')); c.setStrokeColor(IWALL); c.setLineWidth(.5)
        if w[1]==w[3]: c.rect(min(x1,x2),y1-t,abs(x2-x1),2*t,1,1); c.line(min(x1,x2),y1,max(x1,x2),y1)
        else: c.rect(x1-t,min(y1,y2),2*t,abs(y2-y1),1,1); c.line(x1,min(y1,y2),x1,max(y1,y2))
    for w in WALLS:
        r=segrect(w,w[4]); x1,y1=T(r[0],r[1]); x2,y2=T(r[2],r[3])
        c.setFillColor(wallc or (WALL if w[4]>=20 else IWALL)); c.rect(x1,y2,x2-x1,y1-y2,0,1)
    if doors:
        c.setStrokeColor(INK); c.setLineWidth(.45)
        for d in DOORS:
            L=d['w']*K
            if d['o']=='h':
                x,y=T(d['a'],d['c']); c.line(x,y,x,y-L); c.arc(x-L,y-L,x+L,y+L,270,90)
            else:
                x,y=T(d['c'],d['a']); c.line(x,y,x+L,y); c.arc(x-L,y-L,x+L,y+L,270,90)
    if labels:
        for r in ROOMS:
            if not r[5]: continue
            x,y=T(r[7],r[8])
            c.setFillColor(INK); c.setFont('PM',8.4); c.drawCentredString(x,y,r[5])
            c.setFillColor(TER); c.setFont('P',7.4); c.drawCentredString(x,y-3.6*mm,az(r[6])+' m²')

def dimline(x1,y1,x2,y2,txt,off):
    c.setStrokeColor(GREY); c.setLineWidth(.4)
    if y1==y2:
        y=y1+off; c.line(x1,y,x2,y); c.line(x1,y1,x1,y+(2*mm if off>0 else -2*mm)); c.line(x2,y2,x2,y+(2*mm if off>0 else -2*mm))
        for x in (x1,x2): c.line(x-1.2*mm,y-1.2*mm,x+1.2*mm,y+1.2*mm)
        c.setFillColor(INK); c.setFont('P',7.4); c.drawCentredString((x1+x2)/2,y+1.4*mm,txt)
    else:
        x=x1+off; c.line(x,y1,x,y2); c.line(x1,y1,x+(2*mm if off>0 else -2*mm),y1); c.line(x2,y2,x+(2*mm if off>0 else -2*mm),y2)
        for y in (y1,y2): c.line(x-1.2*mm,y-1.2*mm,x+1.2*mm,y+1.2*mm)
        c.saveState(); c.translate(x-1.4*mm,(y1+y2)/2); c.rotate(90); c.setFillColor(INK); c.setFont('P',7.4); c.drawCentredString(0,0,txt); c.restoreState()

def legend(items,x,y,title=None):
    if title: c.setFillColor(INK); c.setFont('PM',8.6); c.drawString(x,y,title); y-=6*mm
    for sym,txt in items:
        sym(x+2.5*mm,y+1.2*mm); c.setFillColor(INK); c.setFont('P',7.6); c.drawString(x+8*mm,y,txt); y-=5.2*mm
    return y

def table(x,y,cols,rows,widths,fs=7.6,rh=6.2*mm,head=True,zebra=True):
    W=sum(widths)
    if head:
        c.setFillColor(INK); c.rect(x,y-rh,W,rh,0,1); c.setFillColor(white); c.setFont('PM',fs)
        xx=x
        for col,w in zip(cols,widths): c.drawString(xx+2*mm,y-rh+2.1*mm,col); xx+=w
        y-=rh
    for i,rw in enumerate(rows):
        bold=rw and isinstance(rw[0],str) and rw[0].startswith('§')
        if zebra and i%2==0 and not bold: c.setFillColor(CREAM); c.rect(x,y-rh,W,rh,0,1)
        if bold: c.setFillColor(BEIGE); c.rect(x,y-rh,W,rh,0,1)
        xx=x; c.setFillColor(INK); c.setFont('PM' if bold else 'P',fs)
        for v,w in zip(rw,widths):
            v=str(v).lstrip('§');
            if v and (v[0].isdigit() or v[0]=='−') and w<35*mm: c.drawRightString(xx+w-2*mm,y-rh+2.1*mm,v)
            else: c.drawString(xx+2*mm,y-rh+2.1*mm,v)
            xx+=w
        c.setStrokeColor(LINE); c.setLineWidth(.3); c.line(x,y-rh,x+W,y-rh); y-=rh
    return y

def img(path,x,y,w,h,radius=0):
    im=ImageReader(path); iw,ih=im.getSize(); r=max(w/iw,h/ih); dw,dh=iw*r,ih*r
    c.saveState(); p=c.beginPath(); p.roundRect(x,y,w,h,radius) if radius else p.rect(x,y,w,h); c.clipPath(p,stroke=0)
    c.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh); c.restoreState()

# ---------- hesablamalar ----------
H_CEIL={'Zal':2.85,'Yataq otağı':2.75,'Mətbəx':2.75,'Dəhliz':2.60,'Holl':2.60,'S.Q.':2.50,'Eyvan':2.85}
def rect_m(r): return (r[2]-r[0])/S,(r[3]-r[1])/S
def touches(r,px,py,tol=20): return r[0]-tol<=px<=r[2]+tol and r[1]-tol<=py<=r[3]+tol and not (r[0]+tol<px<r[2]-tol and r[1]+tol<py<r[3]-tol)
def win_len(r):
    L=0
    for w in WINS:
        x1,y1,x2,y2=w
        if y1==y2 and r[1]-20<=y1<=r[3]+20: L+=max(0,min(max(x1,x2),r[2])-max(min(x1,x2),r[0]))
        if x1==x2 and r[0]-20<=x1<=r[2]+20: L+=max(0,min(max(y1,y2),r[3])-max(min(y1,y2),r[1]))
    return L/S
CALC=[]
for i,r in enumerate(ROOMS):
    w,d=rect_m(r); per=2*(w+d)
    dw=sum(dd['w'] for dd in DOORS if touches(r,*(( (dd['a']+dd['b'])/2,dd['c']) if dd['o']=='h' else (dd['c'],(dd['a']+dd['b'])/2))))
    wl=win_len(r); h=H_CEIL.get(r[5],2.7)
    skirt=0 if r[4] in ('bath','stone') else max(0,per-dw-wl)
    wall_area=max(0,per*h-dw*2.1-wl*(h-0.05))
    CALC.append(dict(n=r[5] or 'Keçid',ft=r[4],area=r[6] or w*d,w=w,d=d,per=per,doors=dw,win=wl,h=h,skirt=skirt,wall=wall_area))
TOT=sum(x['area'] for x in CALC)

# ================= SƏHİFƏLƏR =================
# 1 — üz qabığı
c.setFillColor(CREAM); c.rect(0,0,PW,PH,0,1)
img('/tmp/album/r_liv.png',PW*0.42,0,PW*0.58,PH)
c.setFillColor(TER); c.rect(PW*0.42-3*mm,0,3*mm,PH,0,1)
c.drawImage(ImageReader('/home/claude/luxresidence/assets/logo-dark.png'),26*mm,PH-78*mm,34*mm,45.7*mm,mask='auto')
c.setFillColor(INK); c.setFont('PL',40); c.drawString(26*mm,PH/2+6*mm,'Dizayn layihəsi')
c.setFillColor(TER); c.setFont('PM',13); c.drawString(26*mm,PH/2-6*mm,'2 OTAQLI MƏNZİL · 111,64 m²')
c.setFillColor(GREY); c.setFont('P',10.5)
for i,ln in enumerate(['Konsept interyer, planlar, işıqlandırma, elektrik','və bitirmə materiallarının spesifikasiyası']): c.drawString(26*mm,PH/2-16*mm-i*5.5*mm,ln)
c.setFillColor(INK); c.setFont('P',9); c.drawString(26*mm,26*mm,'LUX Residence · Bakı'); c.setFillColor(GREY); c.drawString(26*mm,20*mm,DATE+' · konsept mərhələsi')
c.showPage()

# 2 — mündəricat + layihə məlumatı (sonda yenidən yazılacaq — əvvəlcədən siyahı)
TOC=[('Üz qabığı',1),('Mündəricat və layihə məlumatı',2),('İnteryer vizualları — qonaq otağı',3),('İnteryer vizualları — zonalar və axşam',4),('3D aksonometriya',5),
     ('Ölçülü plan',6),('Mebel yerləşdirmə planı',7),('Qapıların planı və cədvəli',8),('Döşəmə planı və plintus hesabı',9),('Tavan planı',10),
     ('İşıqlandırma və açarlar planı',11),('Elektrik: rozetkalar və kondisioner',12),('Bitirmə materiallarının spesifikasiyası',13),('Ümumi qeydlər',14)]
frame('Mündəricat',2)
heading('Mündəricat','Layihənin tərkibi')
y=PH-M-42*mm
for t,n in TOC:
    c.setFillColor(INK); c.setFont('P',11); c.drawString(M+10*mm,y,t)
    c.setStrokeColor(LINE); c.setDash(1,2); c.line(M+12*mm+c.stringWidth(t,'P',11),y+1,M+150*mm,y+1); c.setDash()
    c.setFillColor(TER); c.setFont('PM',11); c.drawRightString(M+158*mm,y,f'{n:02d}'); y-=9.6*mm
x=M+185*mm; y=PH-M-42*mm
c.setFillColor(INK); c.setFont('PM',12); c.drawString(x,y,'Layihə məlumatı'); y-=8*mm
for k,v in [('Mənzil tipi','2 otaqlı (zal + yataq otağı)'),('Ümumi sahə','111,64 m²'),('Yaşayış sahəsi',az(sum(x['area'] for x in CALC if x['n'] in ('Zal','Yataq otağı')))+' m²'),
            ('Otaq sayı',str(len([r for r in ROOMS if r[5]]))+' sahə, 2 sanitar qovşaq'),('Tavan hündürlüyü','2,50 – 2,85 m (zonaya görə)'),('Üslub','Müasir minimalizm, isti təbii tonlar'),('Əsas palitra','Krem, bej, terrakota, palıd, qoz')]:
    c.setFillColor(GREY); c.setFont('P',8); c.drawString(x,y,k.upper()); c.setFillColor(INK); c.setFont('P',10.5); c.drawString(x+45*mm,y,v); y-=8.2*mm
y-=4*mm; c.setFillColor(INK); c.setFont('PM',10); c.drawString(x,y,'Rəng palitrası'); y-=4*mm
for i,(hx,nm) in enumerate([('#F7F2EC','Krem'),('#E9DFD1','Bej'),('#C49A6C','Palıd'),('#6A4A33','Qoz'),('#B4552F','Terrakota'),('#6F7254','Zeytun')]):
    c.setFillColor(HexColor(hx)); c.setStrokeColor(LINE); c.rect(x+i*21*mm,y-14*mm,18*mm,14*mm,1,1); c.setFillColor(GREY); c.setFont('P',7); c.drawString(x+i*21*mm,y-18*mm,nm)
c.showPage()

# 3 — vizual böyük
frame('İnteryer vizualları — qonaq otağı',3,note=['Vizual konsept xarakterlidir:','material və mebel seçimi','sifarişçi ilə dəqiqləşdirilir.'])
heading('Qonaq otağı','Gündüz işığı · buklé divan, travertin masa, qoz konsol')
img('/tmp/album/r_liv.png',M+10*mm,M+10*mm,PW-2*M-TB-20*mm,PH-2*M-50*mm,3*mm)
c.showPage()
# 4 — vizuallar 3-lü
frame('İnteryer vizualları — zonalar',4)
heading('Zonalar və axşam ssenarisi','Yemək zonası · mətbəx · axşam işıqlandırması')
aw=PW-2*M-TB-20*mm; ah=PH-2*M-50*mm
img('/tmp/album/r_din.png',M+10*mm,M+10*mm+ah/2+2*mm,aw/2-2*mm,ah/2-2*mm,3*mm)
img('/tmp/album/r_kit.png',M+10*mm+aw/2+2*mm,M+10*mm+ah/2+2*mm,aw/2-2*mm,ah/2-2*mm,3*mm)
img('/tmp/album/r_night.png',M+10*mm,M+10*mm,aw,ah/2-2*mm,3*mm)
for (tx,xx,yy) in [('Yemək zonası',M+14*mm,M+14*mm+ah/2+2*mm),('Mətbəx',M+14*mm+aw/2+2*mm,M+14*mm+ah/2+2*mm),('Axşam: gizli LED, asma lampalar',M+14*mm,M+14*mm)]:
    c.setFillColor(HexColor('#FFFFFF')); c.roundRect(xx,yy,c.stringWidth(tx,'PM',8.5)+8*mm,7*mm,2*mm,0,1); c.setFillColor(INK); c.setFont('PM',8.5); c.drawString(xx+4*mm,yy+2.3*mm,tx)
c.showPage()
# 5 — aksonometriya
frame('3D aksonometriya',5,note=['Divarlar 1,15 m hündürlükdə','kəsilib göstərilir.'])
heading('3D aksonometriya','Mənzilin mebelli ümumi görünüşü')
img('/tmp/album/axon.png',M+6*mm,M+8*mm,PW-2*M-TB-12*mm,PH-2*M-40*mm)
c.showPage()

# 6 — ölçülü plan
T=plan_origin()
frame('Ölçülü plan',6,'1:60',note=['Ölçülər metrlə.','Divar qalınlıqları: xarici 280 mm,','daxili 150 mm.'])
heading('Ölçülü plan','Otaqların ölçüləri və sahələri')
draw_plan(T)
x1,y1=T(B[0],B[1]); x2,y2=T(B[2],B[3])
dimline(x1,y2,x2,y2,az((B[2]-B[0])/S)+' m',-7*mm)
dimline(x1,y2,x1,y1,az((B[3]-B[1])/S)+' m',-8*mm)
for r in ROOMS:
    if not r[5]: continue
    w,d=rect_m(r); x,y=T(r[7],r[8]); c.setFillColor(GREY); c.setFont('P',6.8); c.drawCentredString(x,y-7*mm,az(w)+' × '+az(d))
c.showPage()

# 7 — mebel planı
frame('Mebel yerləşdirmə planı',7,'1:60')
heading('Mebel yerləşdirmə planı')
draw_plan(T,labels=False)
names={}
for i,dd in enumerate(DEF):
    typ,nm,px,py,w,d,rot=dd
    if typ in ('plant',):
        x,y=T(px,py); c.setFillColor(HexColor('#7C9460')); c.circle(x,y,2.6*mm,0,1); continue
    W2,D2=w/S*K/2,d/S*K/2; x,y=T(px,py)
    c.saveState(); c.translate(x,y); c.rotate(math.degrees(rot))
    c.setFillColor(HexColor('#FFFFFF') if typ!='rug' else HexColor('#F3EADF')); c.setStrokeColor(INK if typ!='rug' else LINE); c.setLineWidth(.5)
    c.rect(-W2,-D2,2*W2,2*D2,1,1)
    c.restoreState()
    key=nm; names.setdefault(key,len(names)+1)
    if typ!='rug': c.setFillColor(TER); c.circle(x,y,2.2*mm,0,1); c.setFillColor(white); c.setFont('PM',6); c.drawCentredString(x,y-.9*mm,str(names[key]))
xL=PW-M-TB-100*mm; yL=PH-M-40*mm
c.setFillColor(INK); c.setFont('PM',9); c.drawString(xL,yL,'Mebel siyahısı'); yL-=6*mm
for k,v in names.items():
    c.setFillColor(TER); c.circle(xL+2*mm,yL+1.2*mm,2*mm,0,1); c.setFillColor(white); c.setFont('PM',6); c.drawCentredString(xL+2*mm,yL+.3*mm,str(v)); c.setFillColor(INK); c.setFont('P',7.8); c.drawString(xL+6*mm,yL,k); yL-=5*mm
c.showPage()

# 8 — qapılar
frame('Qapıların planı və cədvəli',8,'1:60')
heading('Qapıların planı','Açılma istiqaməti və ölçülər')
draw_plan(T,labels=True)
for d in DOORS:
    m=(d['a']+d['b'])/2; x,y=(T(m,d['c']) if d['o']=='h' else T(d['c'],m))
    c.setFillColor(INK); c.circle(x,y,3.2*mm,0,1); c.setFillColor(white); c.setFont('PM',6.4); c.drawCentredString(x,y-1*mm,d['id'])
rows=[[d['id'],' / '.join(sorted(set(d['rooms']))),('70×210' if d['bath'] else ('90×210' if d['w']>0.95 else '80×210')),('Nəmə davamlı' if d['bath'] else ('Giriş, metal' if 'Giriş' in d['rooms'] else 'Gizli çərçivə, MDF'))] for d in DOORS]
table(PW-M-TB-106*mm,PH-M-40*mm,['№','Otaqlar arası','Ölçü, sm','Tip'],rows,[11*mm,40*mm,17*mm,30*mm],fs=6.4)
c.showPage()

# 9 — döşəmə
frame('Döşəmə planı',9,'1:60')
heading('Döşəmə planı','Örtük növləri, sahələr və plintus hesabı')
draw_plan(T)
# parket istiqaməti (palıd otaqlarda nazik xətlər)
c.setStrokeColor(HexColor('#C9AE8C')); c.setLineWidth(.25)
for r in ROOMS:
    if r[4]!='floorW': continue
    xa,ya=T(r[0],r[1]); xb,yb=T(r[2],r[3]); xx=xa+2*mm
    while xx<xb: c.line(xx,yb+1,xx,ya-1); xx+=3*mm
draw_plan(T,fill=False,doors=True)
yy=legend([(lambda x,y,k=k:(c.setFillColor(FLOORC[k]),c.setStrokeColor(LINE),c.rect(x-2.5*mm,y-2.5*mm,5*mm,5*mm,1,1)),FLOORN[k]) for k in FLOORC],PW-M-TB-104*mm,PH-M-40*mm,'Örtüklər')
rows=[[x['n'],az(x['area']),az(x['skirt'],1) if x['skirt'] else '— (kafel)'] for x in CALC]
rows.append(['§Cəmi',az(TOT),az(sum(x['skirt'] for x in CALC),1)])
table(PW-M-TB-104*mm,yy-6*mm,['Otaq','Sahə, m²','Plintus, m'],rows,[42*mm,24*mm,24*mm],fs=7)
c.showPage()

# 10 — tavan
frame('Tavan planı',10,'1:60',note=['Hündürlüklər hazır döşəmədən','tavana qədər göstərilib.'])
heading('Tavan planı','Hündürlüklər, asma tavan və gizli LED zolaqları')
draw_plan(T,fillc=HexColor('#F6F3EE'),labels=False,doors=False)
for r in ROOMS:
    if not r[5]: continue
    xa,ya=T(r[0],r[1]); xb,yb=T(r[2],r[3]); h=H_CEIL.get(r[5],2.7)
    if r[5] in ('Zal','Yataq otağı'):
        c.setStrokeColor(TER2); c.setLineWidth(.9); c.setDash(3,2); c.rect(xa+5*mm,yb+5*mm,xb-xa-10*mm,ya-yb-10*mm); c.setDash()
    if h<=2.6:
        c.setStrokeColor(HexColor('#B9AEA2')); c.setLineWidth(.25)
        k=xa-(ya-yb)
        while k<xb:
            c.saveState(); p=c.beginPath(); p.rect(xa,yb,xb-xa,ya-yb); c.clipPath(p,stroke=0); c.line(k,yb,k+(ya-yb),ya); c.restoreState(); k+=2.5*mm
    x,y=T(r[7],r[8]); c.setFillColor(INK); c.setFont('PM',8.2); c.drawCentredString(x,y+2*mm,r[5])
    c.setFillColor(HexColor('#FFFFFF')); c.roundRect(x-9*mm,y-5.5*mm,18*mm,5.4*mm,1.5*mm,0,1); c.setFillColor(TER); c.setFont('PM',7.6); c.drawCentredString(x,y-4*mm,'+'+az(h))
legend([(lambda x,y:(c.setStrokeColor(TER2),c.setLineWidth(.9),c.setDash(3,2),c.line(x-2.5*mm,y,x+2.5*mm,y),c.setDash()),'Gizli LED zolağı (kontur nişi)'),
        (lambda x,y:(c.setStrokeColor(HexColor('#B9AEA2')),c.setLineWidth(.3),[c.line(x-2.5*mm+i*1.3*mm,y-2*mm,x-.5*mm+i*1.3*mm,y+2*mm) for i in range(3)]),'Asma tavan (gips-karton), 2,50–2,60 m'),
        (lambda x,y:(c.setFillColor(HexColor('#F6F3EE')),c.setStrokeColor(LINE),c.rect(x-2.5*mm,y-2.5*mm,5*mm,5*mm,1,1)),'Suvaq + boya, mat ağ')],PW-M-TB-104*mm,PH-M-40*mm,'Şərti işarələr')
c.showPage()

# 11 — işıqlandırma
def spot(x,y): c.setStrokeColor(INK); c.setLineWidth(.5); c.setFillColor(white); c.circle(x,y,1.5*mm,1,1); c.line(x-1.5*mm,y,x+1.5*mm,y); c.line(x,y-1.5*mm,x,y+1.5*mm)
def pend(x,y): c.setFillColor(TER); c.circle(x,y,2.2*mm,0,1); c.setFillColor(white); c.circle(x,y,.8*mm,0,1)
def wall_l(x,y): c.setFillColor(INK); c.wedge(x-2*mm,y-2*mm,x+2*mm,y+2*mm,0,180,0,1)
def switch(x,y): c.setStrokeColor(TER); c.setLineWidth(.7); c.circle(x,y,1.2*mm,1,0); c.line(x+.8*mm,y+.8*mm,x+2.6*mm,y+2.6*mm)
frame('İşıqlandırma və açarlar',11,'1:60',note=['Açar hündürlüyü: 900 mm.','Spot: LED 7 W, 3000 K, CRI 90+.'])
heading('İşıqlandırma planı','Spotlar, asma lampalar, LED və açarlar')
draw_plan(T,fillc=HexColor('#FAF8F5'))
NL={'spot':0,'pend':0,'wall':0,'sw':0,'led':0}
for r in ROOMS:
    if not r[5]: continue
    w,d=rect_m(r); xa,ya=T(r[0],r[1]); xb,yb=T(r[2],r[3])
    if r[4]=='stone':
        for f in (.3,.7): wall_l(xa+(xb-xa)*f,yb+2.5*mm); NL['wall']+=1
        continue
    nx=max(1,round(w/1.6)); nz=max(1,round(d/1.6))
    if r[5]=='Zal': nx=max(nx,3)
    for i in range(nx):
        for j in range(nz):
            spot(xa+(xb-xa)*(i+.5)/nx, yb+(ya-yb)*(j+.5)/nz); NL['spot']+=1
    if r[5] in ('Zal','Yataq otağı'):
        c.setStrokeColor(TER2); c.setLineWidth(.8); c.setDash(3,2); c.rect(xa+5*mm,yb+5*mm,xb-xa-10*mm,ya-yb-10*mm); c.setDash(); NL['led']+=2*(w+d-1)
for dd in DEF:
    if dd[0] in ('table8','table6','table4'):
        x,y=T(dd[2],dd[3]); n=3 if dd[0]=='table8' else 1
        for k in range(n):
            ang=dd[6]; off=(k-(n-1)/2)*0.6*K; pend(x+off*math.cos(ang),y+off*math.sin(ang)); NL['pend']+=1
    if dd[0]=='night':
        x,y=T(dd[2],dd[3]); wall_l(x,y); NL['wall']+=1
for d in DOORS:
    m=(d['a']+d['b'])/2
    if d['o']=='h': x,y=T(d['b']+20,d['c']+28)
    else: x,y=T(d['c']+28,d['b']+20)
    switch(x,y); NL['sw']+=1
yy=legend([(spot,'Gömülü spot LED 7 W'),(pend,'Asma lampa (yemək masası üzərində)'),(wall_l,'Divar / çarpayıyanı işıq'),
           (lambda x,y:(c.setStrokeColor(TER2),c.setLineWidth(.8),c.setDash(3,2),c.line(x-2.5*mm,y,x+2.5*mm,y),c.setDash()),'Gizli LED zolağı 12 W/m, 2700 K'),(switch,'Açar (qapı yanında, h=900)')],PW-M-TB-104*mm,PH-M-40*mm,'Şərti işarələr')
table(PW-M-TB-104*mm,yy-6*mm,['İşıq mənbəyi','Say'],[['Spot',str(NL['spot'])],['Asma lampa',str(NL['pend'])],['Divar işığı',str(NL['wall'])],['LED zolaq, m',az(NL['led'],1)],['Açar',str(NL['sw'])]],[50*mm,20*mm],fs=7)
c.showPage()

# 12 — elektrik
def sock(x,y,col=INK): c.setStrokeColor(col); c.setLineWidth(.6); c.setFillColor(white); c.circle(x,y,1.6*mm,1,1); c.setFillColor(col); c.wedge(x-1.6*mm,y-1.6*mm,x+1.6*mm,y+1.6*mm,0,180,0,1)
def ac(x,y): c.setFillColor(HexColor('#3E7C91')); c.rect(x-3.5*mm,y-1.2*mm,7*mm,2.4*mm,0,1)
def net(x,y): c.setFillColor(HexColor('#3E7C91')); c.rect(x-1.4*mm,y-1.4*mm,2.8*mm,2.8*mm,0,1)
frame('Elektrik: rozetkalar və kondisioner',12,'1:60',note=['Rozetka hündürlükləri:','ümumi 300 mm, mətbəx 1100 mm,','TV 1100 mm, çarpayıyanı 600 mm.','İcra çertyoju elektrik mühəndisi','tərəfindən hazırlanır.'])
heading('Elektrik planı','Rozetkalar, TV/internet, kondisioner nöqtələri')
draw_plan(T,fillc=HexColor('#FAF8F5'))
NS={'sock':0,'net':0,'ac':0}
SOCK={'sofa':2,'tv':4,'kitchen':5,'fridge':1,'desk':3,'night':2,'table8':1,'table6':1,'table4':1,'sink':1,'bed':0,'wardrobe':0,'arm':0}
for dd in DEF:
    typ,nm,px,py,w,d,rot=dd; n=SOCK.get(typ,0)
    if not n: continue
    back=d/2+18
    bx=px+(-back)*math.sin(rot)*0 + 0;
    # yerli arxa nöqtə (−z) → dünya (plan: x sağa, y aşağı)
    lx,lz=0,-(d/2+12)
    wx=px+lx*math.cos(rot)+lz*math.sin(rot); wy=py-lx*math.sin(rot)+lz*math.cos(rot)
    ux,uy=math.cos(rot),-math.sin(rot)
    for k in range(min(n,4)):
        off=(k-(min(n,4)-1)/2)*30
        x,y=T(wx+ux*off,wy+uy*off); sock(x,y); NS['sock']+=1
    if typ=='tv': x,y=T(wx+ux*70,wy+uy*70); net(x,y); NS['net']+=1
    if typ=='desk': x,y=T(wx-ux*60,wy-uy*60); net(x,y); NS['net']+=1
for r in ROOMS:
    if r[5] in ('Zal','Yataq otağı','Mətbəx'):
        xa,ya=T(r[0],r[1]); xb,yb=T(r[2],r[3]); ac((xa+xb)/2,ya-2.5*mm); NS['ac']+=1
yy=legend([(sock,'Rozetka 220 V, torpaqlanmalı'),(net,'TV / internet (RJ45)'),(ac,'Kondisioner daxili blok nöqtəsi')],PW-M-TB-104*mm,PH-M-40*mm,'Şərti işarələr')
table(PW-M-TB-104*mm,yy-6*mm,['Nöqtə','Say'],[['Rozetka',str(NS['sock'])],['TV / internet',str(NS['net'])],['Kondisioner',str(NS['ac'])]],[50*mm,20*mm],fs=7)
c.showPage()

# 13 — spesifikasiya
frame('Bitirmə materialları',13,note=['Miqdarlara 10% ehtiyat','əlavə olunub.'])
heading('Bitirmə materiallarının spesifikasiyası','Otaqlar üzrə örtüklər və miqdarlar')
rows=[]
for x in CALC:
    rows.append([x['n'],FLOORN[x['ft']].split(',')[0],az(x['area']),'Kafel' if x['ft'] in ('bath',) else ('Fasad suvağı' if x['ft']=='stone' else 'Boya, mat (yuyula bilən)'),az(x['wall'],1),('Nəmə davamlı GK' if x['ft']=='bath' else ('GK asma' if x['h']<=2.6 else 'Suvaq + boya')),az(x['area']),az(x['skirt'],1) if x['skirt'] else '—'])
rows.append(['§Cəmi','',az(TOT),'',az(sum(x['wall'] for x in CALC),1),'',az(TOT),az(sum(x['skirt'] for x in CALC),1)])
yy=table(M+10*mm,PH-M-42*mm,['Otaq','Döşəmə','m²','Divar','m²','Tavan','m²','Plintus, m'],rows,[34*mm,46*mm,18*mm,44*mm,18*mm,36*mm,18*mm,22*mm],fs=7.2,rh=7*mm)
yy-=10*mm; c.setFillColor(INK); c.setFont('PM',10); c.drawString(M+10*mm,yy,'Sifariş üçün yekun (10% ehtiyatla)'); yy-=3*mm
park=sum(x['area'] for x in CALC if x['ft']=='floorW'); til=sum(x['area'] for x in CALC if x['ft']=='tile'); bath=sum(x['area'] for x in CALC if x['ft']=='bath'); st=sum(x['area'] for x in CALC if x['ft']=='stone')
paint=sum(x['wall'] for x in CALC if x['ft'] not in ('bath','stone')); bwall=sum(x['wall'] for x in CALC if x['ft']=='bath')
sk=sum(x['skirt'] for x in CALC)
table(M+10*mm,yy,['Material','Ölçü vahidi','Miqdar'],[
 ['Parket — palıd, 3 qatlı','m²',az(park*1.1,1)],['Keramoqranit 60×120 (mətbəx, dəhliz, holl)','m²',az(til*1.1,1)],['Keramoqranit 60×60 (S.Q. döşəmə)','m²',az(bath*1.1,1)],
 ['Divar kafeli (S.Q.)','m²',az(bwall*1.1,1)],['Daş kafel 60×60 (eyvan)','m²',az(st*1.1,1)],['Divar boyası, mat (2 qat)','m²',az(paint*1.1,1)],
 ['Tavan boyası','m²',az(TOT*1.1,1)],['Plintus, gizli (alüminium / MDF)','p/m',az(sk*1.1,1)],['LED zolaq 12 W/m + profil','p/m',az(NL['led']*1.1,1)],['Gömülü spot LED 7 W','əd.',str(NL['spot'])]],[110*mm,30*mm,30*mm],fs=7.6,rh=6.6*mm)
c.showPage()

# 14 — qeydlər
frame('Ümumi qeydlər',14)
heading('Ümumi qeydlər')
y=PH-M-44*mm
for t in ['1. Layihə LUX Residence 2 otaqlı (111,64 m²) mənzil planı əsasında konsept mərhələsində hazırlanıb.',
          '2. Sahələr və ölçülər satış planından götürülüb; təmirə başlamazdan əvvəl yerində ölçmə aparılmalıdır.',
          '3. Elektrik, ventilyasiya və santexnika planları konsept xarakterlidir — icra çertyojları lisenziyalı',
          '    mühəndislər tərəfindən hazırlanmalıdır.',
          '4. Material miqdarlarına 10% ehtiyat əlavə edilib; dəqiq miqdar seçilən məhsulun ölçüsünə görə dəqiqləşdirilir.',
          '5. Vizuallar interyer üslubunu göstərir; mebel və dekor sifarişçinin seçiminə uyğun dəyişdirilə bilər.',
          '6. Mənzili 3D formatda gəzmək üçün: luxresidence.az/3d → mərtəbə → mənzil → «İçində gəz».']:
    c.setFillColor(INK); c.setFont('P',11); c.drawString(M+10*mm,y,t); y-=9*mm
img('/tmp/album/r_night.png',M+10*mm,M+10*mm,PW-2*M-TB-20*mm,95*mm,3*mm)
c.showPage()
c.save()
print('OK',OUT,'doors',[(d['id'],round(d['w'],2),d['rooms']) for d in DOORS])
