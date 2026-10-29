# Nizami City ictimai sayt → nc/site.html  (python3 nc/site-src/build.py)
import base64, json, pathlib, io, re
from PIL import Image
S = pathlib.Path(__file__).parent
def webp(p, maxw, q=78):
    im = Image.open(p).convert('RGB'); im.thumbnail((maxw, maxw)); bio = io.BytesIO(); im.save(bio, 'WEBP', quality=q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(bio.getvalue()).decode()
img = {'front': webp(S/'real/front.jpg', 1800, 72), 'aerial': webp(S/'real/aerial.jpg', 1400, 74)}
for k in ['entrance', 'tower_l', 'tower_r', 'aerial_c', 'corner', 'street']: img[k] = webp(S/f'real/{k}.jpg', 1100, 70)
logo = Image.open(S/'logo.png').convert('RGBA'); logo.thumbnail((128, 128)); bio = io.BytesIO(); logo.save(bio, 'WEBP', quality=85)
LOGO = 'data:image/webp;base64,' + base64.b64encode(bio.getvalue()).decode(); img['logo'] = LOGO
ANON = re.search(r"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_.-]+", (S.parent.parent/'assets/lux-auth.js').read_text()).group(0)
EXTRA_CSS = """
.ncs-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:90;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;background:#c9a86a;color:#111;border-radius:14px;padding:12px 44px 12px 16px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.35);max-width:760px;margin:0 auto}
.ncs-banner a{color:#111;text-decoration:underline}.ncs-banner button{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:none;font-size:22px;cursor:pointer;color:#111}
"""
t = (S/'index.tpl.html').read_text()
t = t.replace('<script>%DATA%</script>\n<script>%APP%</script>',
  '<script>window.__NC_START=function(){\n%DATA%\n;\n%APP%\n};</script>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" defer></script>\n<script>%RUNTIME%</script>')
t = t.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n', '', 1)
assert '%RUNTIME%' in t
for k, v in {'%CSS%': (S/'app.css').read_text() + EXTRA_CSS, '%IMG%': 'window.IMG=' + json.dumps(img) + ';', '%MODEL%': (S/'model.js').read_text(),
             '%DATA%': (S/'data.js').read_text(), '%APP%': (S/'app.js').read_text(), '%RUNTIME%': (S/'runtime.js').read_text().replace('%ANON%', ANON), '%LOGO%': LOGO}.items():
    t = t.replace(k, v)
t = t.replace('<meta name="theme-color"', '<link rel="canonical" href="https://nizami-city.az/">\n<meta property="og:title" content="Nizami City — Yasamalda qapalı məhəllə">\n<meta property="og:image" content="https://nizami-city.az/assets/nc/hero.jpg">\n<meta name="theme-color"', 1)
out = S.parent/'site.html'; out.write_text(t); print(out, round(len(t)/1024), 'KB')
# panel üçün ilkin (defolt) məzmun
import subprocess
js = (S/'model.js').read_text().split('window.buildNizami')[0] + (S/'data.js').read_text() + "\nconst D=window.NC;console.log(JSON.stringify({co:D.CO,faq:D.DEF.FAQ,timeline:D.DEF.TIMELINE,infra:D.DEF.INFRA,gal:D.DEF.GAL,gcats:D.GCATS,blog:D.DEF.BLOG,bld:window.NC_BLD.map(b=>({id:b.id,st:b.st})),pages:[['layihe','Layihə'],['binalar','Binalar'],['menziller','Mənzillər'],['kalkulyator','Kalkulyator'],['qalereya','Qalereya'],['gunes','3D və günəş'],['mekan','Məkan'],['kommersiya','Kommersiya'],['bloq','Bloq'],['suallar','Suallar'],['elaqe','Əlaqə']]}))"
o = subprocess.run(['node', '-e', 'global.window=global;' + js], capture_output=True, text=True)
assert o.returncode == 0, o.stderr
(S.parent/'site-defaults.json').write_text(o.stdout); print('defaults', len(o.stdout))
