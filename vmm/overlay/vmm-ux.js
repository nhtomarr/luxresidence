/* VMM Ofis — mobil UX: Instagram tipli alt menyu (şüşə, sürüşəndə kiçilir), aşağı çəkib yeniləmə, sağa-sola sürüşdürüb bölmə keçidi */
(function(){
  if(!('ontouchstart' in window)&&!matchMedia('(max-width:759px)').matches)return;
  var mob=function(){return innerWidth<760;};
  var $=function(s){return document.querySelector(s);};
  function busy(){return document.body.classList.contains('igfull')||document.body.classList.contains('incall')||($('#modal')&&$('#modal').classList.contains('on'))||(typeof CHATother!=='undefined'&&CHATother);}
  function curTab(){var b=$('#tabs button.on');return b&&b.dataset.v;}
  function pill(){if(typeof dkPill==='function')try{dkPill();}catch(e){}}

  /* 1) Alt menyu: aşağı sürüşəndə kiçilir, yuxarı qayıdanda böyüyür */
  var lastY=scrollY,ticking=false;
  addEventListener('scroll',function(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;if(!mob())return;var y=scrollY,b=document.body;
    if(y<=24)b.classList.remove('dk-mini');else if(y>lastY+8)b.classList.add('dk-mini');else if(y<lastY-14)b.classList.remove('dk-mini');
    lastY=y;});},{passive:true});
  var mo=new MutationObserver(function(){pill();});
  document.addEventListener('DOMContentLoaded',function(){mo.observe(document.body,{attributes:true,attributeFilter:['class']});});

  /* 2) Aşağı çəkib yeniləmə */
  var ptr=document.createElement('div');ptr.id='ptr';ptr.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">'+
    [0,1,2,3,4,5,6,7].map(function(i){var a=i*Math.PI/4,x1=12+5*Math.cos(a),y1=12+5*Math.sin(a),x2=12+9*Math.cos(a),y2=12+9*Math.sin(a);return '<line x1="'+x1.toFixed(2)+'" y1="'+y1.toFixed(2)+'" x2="'+x2.toFixed(2)+'" y2="'+y2.toFixed(2)+'" opacity="'+(0.25+i*0.1).toFixed(2)+'"/>';}).join('')+'</svg>';
  document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(ptr);});
  var sy=null,pulled=0,loading=false,TH=72;
  function setPtr(d){ptr.style.opacity=Math.min(1,d/TH);ptr.style.transform='translate(-50%,'+Math.min(d*.45,40)+'px) rotate('+(d*4)+'deg)';}
  addEventListener('touchstart',function(e){if(loading||!mob()||busy()||e.touches.length>1){sy=null;return;}sy=(scrollY<=0)?e.touches[0].clientY:null;pulled=0;},{passive:true});
  addEventListener('touchmove',function(e){if(sy==null)return;var d=e.touches[0].clientY-sy;if(scrollY>0&&d<=0){sy=null;ptr.style.opacity=0;return;}pulled=Math.max(0,d);ptr.classList.remove('spin');setPtr(pulled);},{passive:true});
  addEventListener('touchend',function(){if(sy==null)return;sy=null;
    if(pulled>=TH&&!loading){loading=true;ptr.classList.add('spin');ptr.style.opacity=1;ptr.style.transform='translate(-50%,28px)';try{navigator.vibrate&&navigator.vibrate(10);}catch(e){}
      var v=curTab(),t0=Date.now();
      Promise.resolve(typeof loadAll==='function'?loadAll():null).catch(function(){}).then(function(){if(v&&typeof show==='function')show(v);
        setTimeout(function(){loading=false;ptr.classList.remove('spin');ptr.style.opacity=0;ptr.style.transform='translate(-50%,0)';},Math.max(0,650-(Date.now()-t0)));});
    }else{ptr.style.opacity=0;ptr.style.transform='translate(-50%,0)';}
  },{passive:true});

  /* 3) Sağa-sola sürüşdürüb bölmələr arasında keçid (barmağı izləyir, Instagram kimi) */
  var HS='input,textarea,select,[contenteditable],canvas,video,.leaflet-container,#dock,#tabs,.top,.socar,.igstories,.soseg,.sugl,.s3hl,.pfbd,.fpfl,.sochips,.igvc,.igboards,.s4opts,.sorpick';
  function blocked(el){if(el.closest&&(el.closest(HS)||el.closest('#dock')))return true;for(;el&&el!==document.body;el=el.parentElement){var cs=getComputedStyle(el);if((cs.overflowX==='auto'||cs.overflowX==='scroll')&&el.scrollWidth>el.clientWidth+4)return true;}return false;}
  function busy2(){return busy()||document.querySelector('.pg.on,#igSV,#mvw,#igReel,#stEd,#s4wr,#s4quiz,#igCtx,.s3over')||(typeof CHAT_SEL!=='undefined'&&CHAT_SEL);}
  function tabList(){var all=Array.prototype.map.call(document.querySelectorAll('#tabs button'),function(b){return b.dataset.v;});var prim=[];try{if(typeof dkPrimary==='function'&&typeof dkTabs==='function')prim=dkPrimary(dkTabs());}catch(e){}  /* sıra alt menyudakı kimi: əvvəl menyudakı 4 bölmə, sonra “Daha”dakılar */
    return prim.concat(all.filter(function(v){return prim.indexOf(v)<0;}));}
  var G=null;
  addEventListener('touchstart',function(e){G=null;if(!mob()||busy2()||e.touches.length!==1||loading)return;var t=e.touches[0];if(t.clientX<16||t.clientX>innerWidth-16||blocked(e.target))return;
    var v=curTab(),el=v&&document.getElementById('v-'+v);if(!el)return;G={x:t.clientX,y:t.clientY,dx:0,on:false,el:el,v:v};},{passive:true});
  addEventListener('touchmove',function(e){if(!G)return;var t=e.touches[0],dx=t.clientX-G.x,dy=t.clientY-G.y;
    if(!G.on){if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){G=null;return;}if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.4){G.on=true;sy=null;ptr.style.opacity=0;G.el.style.transition='none';}else return;}
    if(e.cancelable)e.preventDefault();var L=tabList(),i=L.indexOf(G.v),edge=(dx>0&&i<=0)||(dx<0&&i>=L.length-1);G.dx=edge?dx*.25:dx;
    G.el.style.transform='translateX('+G.dx+'px)';G.el.style.opacity=String(Math.max(.35,1-Math.abs(G.dx)/650));},{passive:false});
  addEventListener('touchend',function(){if(!G)return;var g=G;G=null;if(!g.on)return;var L=tabList(),i=L.indexOf(g.v),dir=g.dx<0?1:-1,j=i+dir,el=g.el;
    el.style.transition='transform .2s ease,opacity .2s ease';
    if(Math.abs(g.dx)<80||j<0||j>=L.length){el.style.transform='';el.style.opacity='';setTimeout(function(){el.style.transition='';},220);return;}
    el.style.transform='translateX('+(-dir*110)+'%)';el.style.opacity='0';try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}
    setTimeout(function(){el.style.transition='';el.style.transform='';el.style.opacity='';show(L[j]);scrollTo(0,0);var n=document.getElementById('v-'+L[j]);
      if(n){n.classList.remove('sw-l','sw-r');void n.offsetWidth;n.classList.add(dir>0?'sw-l':'sw-r');setTimeout(function(){n.classList.remove('sw-l','sw-r');},320);}},190);
  },{passive:true});
})();

/* ---------- Aylıq hesabat: tətbiq daxilində önizləmə + PDF (iOS ana ekran tətbiqində window.print işləmir) ---------- */
(function(){
  var st=document.createElement('style');
  st.textContent='#vrep{position:fixed;inset:0;z-index:9999;background:rgba(10,18,24,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;flex-direction:column}'+
  '#vrep .vr-bar{display:flex;gap:8px;align-items:center;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 10px;background:#15232b;color:#fff}'+
  '#vrep .vr-bar b{flex:1;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '#vrep .vr-bar button{border:0;border-radius:10px;height:36px;padding:0 14px;font:600 14px/1 inherit;cursor:pointer;background:#2e7d4f;color:#fff}'+
  '#vrep .vr-bar button.g{background:rgba(255,255,255,.14)}#vrep .vr-bar button:disabled{opacity:.6}'+
  '#vrep .vr-scroll{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:16px 12px calc(24px + env(safe-area-inset-bottom,0px))}'+
  '.vr-sheet{background:#fff;max-width:794px;margin:0 auto;padding:28px;border-radius:6px;box-shadow:0 10px 40px rgba(0,0,0,.3)}'+
  '.vr-sheet .rp,.vr-cap .rp{font-family:var(--sans,system-ui);color:#15232b}.vr-sheet .rp h1,.vr-cap .rp h1{font-size:24px;margin:0}'+
  '.vr-sheet .rpm,.vr-cap .rpm{color:#64748b;font-size:12px;margin:2px 0 14px}.vr-sheet h2,.vr-cap h2{font-size:16px;margin:18px 0 8px}'+
  '.vr-sheet .rpk,.vr-cap .rpk{display:flex;gap:8px;flex-wrap:wrap}.vr-sheet .rpk div,.vr-cap .rpk div{flex:1;min-width:90px;border:1px solid #cbd5e1;border-radius:10px;padding:10px;font-size:12px;color:#475569}'+
  '.vr-sheet .rpk b,.vr-cap .rpk b{display:block;font-size:22px;color:#15232b}'+
  '.vr-sheet table,.vr-cap table{width:100%;border-collapse:collapse}.vr-sheet th,.vr-sheet td,.vr-cap th,.vr-cap td{border:1px solid #cbd5e1;padding:6px 8px;font-size:12px;text-align:left}'+
  '.vr-sheet th,.vr-cap th{background:#f1f5f9}.vr-sheet{overflow-x:auto}'+
  '.vr-empty{margin:10px 0 0;padding:10px 12px;border-radius:10px;background:#fff7ed;color:#9a3412;font-size:12px}'+
  '@media(max-width:600px){.vr-sheet{padding:16px}.vr-sheet th,.vr-sheet td{padding:5px 6px;font-size:11px}}'+
  '.vr-cap{position:fixed;left:-10000px;top:0;width:794px;background:#fff;padding:36px}';
  document.head.appendChild(st);
  function load(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
  function libs(){return Promise.all([window.html2canvas?0:load('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),window.jspdf?0:load('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')]);}
  window.vmmReport=function(h,name,empty){
    var old=document.getElementById('vrep');if(old)old.remove();
    var w=document.createElement('div');w.id='vrep';
    w.innerHTML='<div class="vr-bar"><b>Aylıq hesabat</b><button type="button" data-a="pdf">⬇ PDF</button><button type="button" class="g" data-a="print">🖨</button><button type="button" class="g" data-a="x" aria-label="Bağla">✕</button></div>'+
      '<div class="vr-scroll"><div class="vr-sheet">'+h+(empty?'<p class="vr-empty">Bu ay üçün hələ davamiyyət qeydi yoxdur — cədvəllər sıfır göstərir. Qeydlər yığıldıqca hesabat dolacaq.</p>':'')+'</div></div>';
    document.body.appendChild(w);
    w.querySelector('[data-a=x]').onclick=function(){w.remove();};
    w.querySelector('[data-a=print]').onclick=function(){var rs=document.getElementById('repSheet');if(!rs)return;rs.innerHTML=h;w.style.display='none';document.body.classList.add('printrep');
      setTimeout(function(){window.print();setTimeout(function(){document.body.classList.remove('printrep');w.style.display='';},500);},200);};
    var pb=w.querySelector('[data-a=pdf]');
    pb.onclick=function(){pb.disabled=true;pb.textContent='Hazırlanır…';
      var cap=document.createElement('div');cap.className='vr-cap';cap.innerHTML=h;document.body.appendChild(cap);
      libs().then(function(){return window.html2canvas(cap,{scale:2,backgroundColor:'#ffffff',width:794,windowWidth:794});}).then(function(cv){
        var J=window.jspdf.jsPDF,pdf=new J({unit:'mm',format:'a4'});var pw=210,ph=297,ih=cv.height*pw/cv.width,img=cv.toDataURL('image/jpeg',0.92),y=0;
        while(y<ih-0.5){if(y>0)pdf.addPage();pdf.addImage(img,'JPEG',0,-y,pw,ih);y+=ph;}
        var fn=(name||'hesabat')+'.pdf',blob=pdf.output('blob');var file;try{file=new File([blob],fn,{type:'application/pdf'});}catch(e){}
        if(file&&navigator.canShare&&navigator.canShare({files:[file]}))return navigator.share({files:[file],title:fn}).catch(function(){});
        var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=fn;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove();},4000);
      }).catch(function(){if(window.toast)toast('PDF hazırlanmadı. İnterneti yoxlayın.');}).then(function(){cap.remove();pb.disabled=false;pb.textContent='⬇ PDF';});};
  };
})();


/* ---------- Alt menyu: "liquid glass" linza (iOS 26 / WhatsApp kimi) — keçiddə uzanıb-yığılır, barmaqla sürüşdürülür ---------- */
(function(){
  if(!('ontouchstart' in window)&&!matchMedia('(max-width:759px)').matches)return;
  function D(){return document.getElementById('dock');}
  function P(){var d=D();return d&&d.querySelector('.dkpill');}
  function ks(){var d=D();return d?[].slice.call(d.querySelectorAll('.dk')):[];}
  var lastI=-1,drag=null,swallow=false;
  function hook(){
    if(typeof window.dkPill!=='function'||window.dkPill._lq)return;
    var orig=window.dkPill;
    window.dkPill=function(){orig.apply(this,arguments);if(drag&&drag.on)return;var d=D(),p=P();if(!d||!p)return;var on=d.querySelector('.dk.on'),i=ks().indexOf(on);
      if(i>=0&&lastI>=0&&i!==lastI&&p.animate){var far=Math.min(3,Math.abs(i-lastI));
        p.animate([{transform:'scale(1,1)'},{transform:'scale('+(1.18+.08*far)+','+(0.9-.02*far)+')',offset:.35},{transform:'scale(.96,1.05)',offset:.75},{transform:'scale(1,1)'}],{duration:520,easing:'cubic-bezier(.3,.7,.3,1)'});}
      if(i>=0)lastI=i;};
    window.dkPill._lq=1;try{window.dkPill();}catch(e){}
  }
  addEventListener('load',hook);document.addEventListener('DOMContentLoaded',function(){setTimeout(hook,0);});setTimeout(hook,1500);
  function place(x){var d=D(),p=P();if(!d||!p)return;var r=d.getBoundingClientRect(),pd=parseFloat(getComputedStyle(d).paddingLeft)||0,n=ks().length||1,w=(r.width-2*pd)/n;
    var l=Math.max(pd,Math.min(r.width-pd-w,x-r.left-w/2));p.style.left=l+'px';p.style.width=w+'px';return Math.round((l-pd)/w);}
  document.addEventListener('touchstart',function(e){var d=D();if(!d||!d.contains(e.target)||e.touches.length!==1)return;drag={x:e.touches[0].clientX,on:false};},{passive:true});
  document.addEventListener('touchmove',function(e){if(!drag)return;var x=e.touches[0].clientX;
    if(!drag.on){if(Math.abs(x-drag.x)<8)return;drag.on=true;var d=D(),p=P();d.classList.add('lq-drag');if(p)p.style.transition='none';}
    if(e.cancelable)e.preventDefault();drag.i=place(x);},{passive:false});
  function end(){if(!drag)return;var g=drag;drag=null;var d=D(),p=P();if(!d)return;d.classList.remove('lq-drag');if(!g.on)return;
    if(p)p.style.transition='';swallow=true;setTimeout(function(){swallow=false;},400);var b=ks()[g.i];
    try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}
    if(b&&!b.classList.contains('on'))b.click();else if(window.dkPill)window.dkPill();}
  document.addEventListener('touchend',end,{passive:true});document.addEventListener('touchcancel',end,{passive:true});
  document.addEventListener('click',function(e){if(swallow&&D()&&D().contains(e.target)&&e.isTrusted){e.stopPropagation();e.preventDefault();}},true);
})();
