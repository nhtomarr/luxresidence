/* LUX Residence — giriş ayar aləti (yalnız /?ayar=giris ünvanında yüklənir).
   Nihat burada girişi gözlə düzəldir, "Kodu kopyala" ilə ayarı göndərir; kod index.html-də window.LUX_INTRO / window.LUX_HERO kimi canlıya verilir. */
(function(){
  var I=window._luxIntro,HH=window._luxHero,H=document.documentElement;if(!I||!HH)return;
  var C=I.cfg,G=HH.cfg,KEY='lux_tuner_v2',marks=[];
  try{var sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv){Object.assign(C,sv.c||{});Object.assign(G,sv.g||{});marks=sv.m||[];}}catch(e){}
  try{sessionStorage.setItem('lux_intro','1');}catch(e){}
  H.classList.remove('intro');window._introDone&&window._introDone();HH.apply();
  var v=I.make();v.pause();v.style.opacity='0';var mode='n',seqT=[],running=false;

  var css=document.createElement('style');css.textContent=
  '#itn{position:fixed;right:16px;bottom:16px;z-index:99999;width:340px;max-height:calc(100vh - 32px);overflow:auto;background:#fffdfa;color:#2a1d14;border:1px solid #e3d8cc;border-radius:14px;box-shadow:0 18px 50px -18px rgba(40,20,8,.45);font:14px/1.4 Inter,-apple-system,system-ui,sans-serif}'+
  '#itn *{box-sizing:border-box}#itn .hd{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #eee4d9;position:sticky;top:0;background:#fffdfa;z-index:1;cursor:move}'+
  '#itn .hd b{flex:1;font-weight:600;font-size:15px}#itn .hd button{border:0;background:none;font-size:13px;color:#8a5a3c;cursor:pointer;padding:4px 6px}'+
  '#itn .bd{padding:4px 14px 14px}#itn.min .bd{display:none}#itn h4{margin:14px 0 6px;font-size:13px;font-weight:600;color:#8a5a3c}'+
  '#itn .r{display:grid;grid-template-columns:104px 1fr 54px;align-items:center;gap:8px;margin:6px 0}#itn .r label{font-size:13px}#itn .r output{font-variant-numeric:tabular-nums;font-size:12px;text-align:right;color:#6b5a4e}'+
  '#itn input[type=range]{width:100%;accent-color:#ba4d2c}#itn .seg{display:flex;gap:4px;flex-wrap:wrap}#itn .seg button,#itn .act button{border:1px solid #e0d4c7;background:#fff;border-radius:8px;padding:7px 10px;font:500 13px/1 inherit;color:#2a1d14;cursor:pointer}'+
  '#itn .seg button.on{background:#2a1d14;color:#fff;border-color:#2a1d14}#itn .act{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}#itn .act .p{background:#ba4d2c;border-color:#ba4d2c;color:#fff}'+
  '#itn .tl{display:flex;align-items:center;gap:6px;margin:6px 0}#itn .tl input{flex:1}#itn .tl output{width:74px;font-variant-numeric:tabular-nums;font-size:12px;text-align:right}'+
  '#itn .hint{font-size:12px;color:#7a6a5d;margin:4px 0}#itn textarea{width:100%;height:58px;margin-top:8px;border:1px solid #e0d4c7;border-radius:8px;padding:8px;font:12px/1.35 ui-monospace,Menlo,monospace;color:#2a1d14;background:#faf5ef;resize:none}'+
  '#itn .mk{font-size:12px;color:#6b5a4e;margin-top:4px;min-height:16px}'+
  '@media(max-width:700px){#itn{left:8px;right:8px;bottom:8px;width:auto;max-height:56vh}}'+
  'html.itn-ui #v-ana .hcap>*,html.itn-ui #v-ana .hcap-mobile,html.itn-ui #v-ana .hero .bmark .bmark-dot,html.itn-ui #v-ana .hero .veil,html.itn-ui.hero-top .nav{opacity:1!important}';
  document.body.appendChild(css);

  function row(k,obj,label,min,max,step,unit){return '<div class="r"><label>'+label+'</label><input type="range" data-k="'+k+'" data-o="'+obj+'" min="'+min+'" max="'+max+'" step="'+step+'"><output data-v="'+obj+k+'" data-u="'+(unit||'')+'"></output></div>';}
  var p=document.createElement('div');p.id='itn';p.innerHTML=
  '<div class="hd"><b>Giriş ayarı</b><button data-a="min">Yığ</button></div><div class="bd">'+
  '<p class="hint">Dəyişiklik yalnız bu pəncərədə görünür. Bəyəndiyin ayarı aşağıdakı kodla göndər, canlıya verilsin.</p>'+
  '<h4>Şəklin ekrana oturması</h4>'+
  row('pos','g','Kəsilmə yeri',0,1,0.01,'')+
  '<p class="hint">0 — yuxarı tam görünür, aşağı kəsilir. 1 — əksinə.</p>'+
  '<div class="seg" data-s="fit"><button data-x="1">Ekrana sığışdır</button><button data-x="0">Tam şəkil (16:9)</button></div>'+
  '<div class="seg" data-s="nav" style="margin-top:6px"><button data-x="1">Menyu şəklin üstündə</button><button data-x="0">Şəkil menyudan aşağıda</button></div>'+
  '<h4>Videonun şəklə oturması</h4>'+
  '<div class="seg" data-s="mode"><button data-x="n">Adi</button><button data-x="h">Yarı şəffaf</button><button data-x="d">Fərq</button><button data-x="o">Yalnız şəkil</button></div>'+
  '<p class="hint">«Fərq» rejimində video ilə şəkil üst-üstə düşəndə ekran qaralır.</p>'+
  row('x','c','Sola / sağa',-5,5,0.02,'%')+row('y','c','Yuxarı / aşağı',-5,5,0.02,'%')+row('s','c','Böyütmə',0.9,1.15,0.001,'×')+
  '<h4>Zaman</h4>'+
  '<div class="tl"><input type="range" id="itnT" min="0" max="6" step="0.01" value="0"><output id="itnTo">0.00 san</output></div>'+
  '<div class="act"><button data-a="play" class="p">Girişi oynat</button><button data-a="pp">Dayandır</button><button data-a="b">Kadr geri</button><button data-a="f">Kadr irəli</button><button data-a="mark">Burda sıçrayır</button></div>'+
  '<div class="mk" id="itnM"></div>'+
  row('a','c','Başdan kəs',0,3,0.05,' san')+row('b','c','Sondan kəs',0,3,0.05,' san')+row('r','c','Sürət',0.5,1.5,0.05,'×')+row('f','c','Əriyiş',0,2,0.05,' san')+row('d','c','Yazı gecikməsi',0,2,0.05,' san')+
  '<div class="seg" data-s="ui" style="margin-top:6px"><button data-x="0">Yazılar gizli</button><button data-x="1">Yazılar görünsün</button></div>'+
  '<h4>Göndər</h4><textarea id="itnC" readonly></textarea>'+
  '<div class="act"><button data-a="copy" class="p">Kodu kopyala</button><button data-a="reset">Sıfırla</button><button data-a="exit">Alətdən çıx</button></div></div>';
  document.body.appendChild(p);
  var T=p.querySelector('#itnT'),To=p.querySelector('#itnTo'),ui=0;
  function fmt(n){return (Math.round(n*1000)/1000).toString();}
  function code(){return 'LUX1 pos='+fmt(G.pos)+' fit='+(G.fit?1:0)+' nav='+(G.nav?1:0)+' | x='+fmt(C.x)+' y='+fmt(C.y)+' s='+fmt(C.s)+' a='+fmt(C.a)+' b='+fmt(C.b)+' r='+fmt(C.r)+' f='+fmt(C.f)+' d='+fmt(C.d)+' | m='+(marks.join(',')||'-')+' | '+innerWidth+'x'+innerHeight+' | '+((v.currentSrc||'').split('/').pop()||'?');}
  function save(){try{localStorage.setItem(KEY,JSON.stringify({c:C,g:G,m:marks}));}catch(e){}}
  function vis(){v.style.mixBlendMode=mode==='d'?'difference':'';v.style.opacity=mode==='o'?'0':mode==='h'?'.5':'1';}
  function sync(){p.querySelectorAll('input[data-k]').forEach(function(i){var o=i.dataset.o==='c'?C:G,k=i.dataset.k;i.value=o[k];var out=p.querySelector('output[data-v="'+i.dataset.o+k+'"]');out.textContent=fmt(+o[k])+out.dataset.u;});
    p.querySelectorAll('.seg').forEach(function(s){var val=s.dataset.s==='fit'?(G.fit?1:0):s.dataset.s==='nav'?(G.nav?1:0):s.dataset.s==='mode'?mode:ui;s.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',String(val)===b.dataset.x);});});
    p.querySelector('#itnC').value=code();p.querySelector('#itnM').textContent=marks.length?'İşarələnən anlar: '+marks.join(', ')+' san':'';
    I.apply(v);HH.apply();H.classList.toggle('itn-ui',!!ui);save();}
  function stopSeq(){seqT.forEach(clearTimeout);seqT=[];running=false;}
  function still(){stopSeq();v.pause();H.classList.remove('vout','vrev','vplay');H.classList.add('vintro');H.classList.remove('hero-top');HH.apply();vis();}
  function play(){stopSeq();mode='n';ui=0;sync();H.classList.remove('vout','vrev');H.classList.add('vintro','vplay');v.style.opacity='1';v.style.mixBlendMode='';scrollTo(0,0);
    try{v.currentTime=C.a||0;}catch(e){}I.apply(v);running=true;v.play();}
  var wantEnd=false;function toEnd(){if(!v.duration){wantEnd=true;try{v.load();}catch(_){}return;}if(v.currentTime<v.duration-0.05)try{v.currentTime=v.duration-0.02;}catch(_){}}
  v.addEventListener('loadedmetadata',function(){T.max=v.duration;if(wantEnd){wantEnd=false;toEnd();}});
  v.addEventListener('timeupdate',function(){T.value=v.currentTime;To.textContent=v.currentTime.toFixed(2)+' san';
    if(running&&v.duration&&v.currentTime>=v.duration-C.b-0.12)fin();});
  function fin(){if(!running)return;running=false;v.pause();H.classList.remove('vplay');I.out(v,true);seqT.push(setTimeout(function(){v.style.opacity='0';},Math.max(500,C.f*1000+150)));}
  v.addEventListener('ended',fin);
  T.addEventListener('input',function(){still();try{v.currentTime=+T.value;}catch(e){}To.textContent=(+T.value).toFixed(2)+' san';});
  p.addEventListener('input',function(e){var i=e.target;if(!i.dataset||!i.dataset.k)return;(i.dataset.o==='c'?C:G)[i.dataset.k]=+i.value;if(i.dataset.o==='c'&&'xys'.indexOf(i.dataset.k)>=0&&v.paused&&!H.classList.contains('vintro')){still();}sync();});
  p.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var s=b.parentNode.dataset&&b.parentNode.dataset.s,a=b.dataset.a;
    if(s==='fit'){G.fit=+b.dataset.x;sync();}else if(s==='nav'){G.nav=+b.dataset.x;sync();}else if(s==='ui'){ui=+b.dataset.x;sync();}
    else if(s==='mode'){mode=b.dataset.x;still();if(mode!=='n')toEnd();sync();}
    else if(a==='play')play();else if(a==='pp'){if(v.paused){H.classList.add('vintro');v.style.opacity='1';v.play();}else v.pause();}
    else if(a==='b'||a==='f'){still();try{v.currentTime=Math.max(0,Math.min(v.duration||6,v.currentTime+(a==='f'?1:-1)/24));}catch(_){}}
    else if(a==='mark'){var t=+v.currentTime.toFixed(2);if(marks.indexOf(t)<0)marks.push(t);marks.sort(function(x,y){return x-y;});sync();}
    else if(a==='copy'){var ta=p.querySelector('#itnC');ta.select();var ok=false;try{ok=document.execCommand('copy');}catch(_){}if(navigator.clipboard)navigator.clipboard.writeText(ta.value).catch(function(){});b.textContent='Kopyalandı';setTimeout(function(){b.textContent='Kodu kopyala';},1600);}
    else if(a==='reset'){Object.assign(C,{x:0,y:0,s:1,a:0,b:0,f:.35,d:0,r:1});Object.assign(G,{pos:0,fit:0,nav:1});marks=[];mode='n';ui=0;still();sync();}
    else if(a==='min'){p.classList.toggle('min');b.textContent=p.classList.contains('min')?'Aç':'Yığ';}
    else if(a==='exit'){location.href='/';}});
  /* paneli başlığından tutub sürüşdürmək */
  (function(){var hd=p.querySelector('.hd'),d=null;hd.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;var r=p.getBoundingClientRect();d={x:e.clientX-r.left,y:e.clientY-r.top};hd.setPointerCapture(e.pointerId);});
    hd.addEventListener('pointermove',function(e){if(!d)return;p.style.left=Math.max(0,Math.min(innerWidth-80,e.clientX-d.x))+'px';p.style.top=Math.max(0,Math.min(innerHeight-40,e.clientY-d.y))+'px';p.style.right='auto';p.style.bottom='auto';});
    hd.addEventListener('pointerup',function(){d=null;});})();
  addEventListener('resize',function(){p.querySelector('#itnC').value=code();});
  still();v.style.opacity='0';H.classList.remove('vintro');H.classList.add('hero-top');HH.apply();sync();
})();
