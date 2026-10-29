# Nizami City ictimai sayt v2 → nc/site.html  (python3 nc/site-src/build.py)
# Şəkillər: /assets/nc/site/*.webp (fayl kimi, keşlənir). Şriftlər: /assets/nc/fonts (NC Display = Imbue, NC Text = Albert Sans).
import json, pathlib, re, subprocess
S = pathlib.Path(__file__).parent; V = S/'v2'; R = S.parent.parent
img = {k: f'/assets/nc/site/{k}-2560.webp' for k in ['front', 'aerial_c', 'corner', 'entrance', 'tower_r', 'street', 'tower_l']}
img['aerial'] = '/assets/nc/site/aerial-2400.webp'
img['logo'] = '/assets/nc/site/mark-cream.png'
for k in img: assert (R/img[k].lstrip('/')).exists(), img[k]
ANON = re.search(r"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_.-]+", (R/'assets/lux-auth.js').read_text()).group(0)
t = (V/'index.tpl.html').read_text()
for k, v in {'%FONTS%': (R/'assets/nc/fonts/fonts.css').read_text(), '%CSS%': (V/'app.css').read_text(), '%IMG%': 'window.IMG=' + json.dumps(img) + ';',
             '%MODEL%': (S/'model.js').read_text().split('window.buildNizami')[0], '%MAQ%': (V/'maquette.js').read_text(),
             '%DATA%': (S/'data.js').read_text(), '%APP%': (V/'app.js').read_text(), '%RUNTIME%': (S/'runtime.js').read_text().replace('%ANON%', ANON)}.items():
    assert k in t, k; t = t.replace(k, v)
out = S.parent/'site.html'; out.write_text(t); print(out, round(len(t)/1024), 'KB')
# panel üçün ilkin (defolt) məzmun
js = (S/'model.js').read_text().split('window.buildNizami')[0] + (S/'data.js').read_text() + "\nconst D=window.NC;console.log(JSON.stringify({co:D.CO,faq:D.DEF.FAQ,timeline:D.DEF.TIMELINE,infra:D.DEF.INFRA,gal:D.DEF.GAL,gcats:D.GCATS,blog:D.DEF.BLOG,bld:window.NC_BLD.map(b=>({id:b.id,st:b.st})),pages:[['binalar','Binalar'],['menziller','Mənzillər'],['kalkulyator','Ödəniş'],['mekan','Məkan'],['kommersiya','Kommersiya'],['bloq','Bloq'],['suallar','Suallar'],['elaqe','Əlaqə']]}))"
o = subprocess.run(['node', '-e', 'global.window=global;' + js], capture_output=True, text=True)
assert o.returncode == 0, o.stderr
(S.parent/'site-defaults.json').write_text(o.stdout); print('defaults', len(o.stdout))
