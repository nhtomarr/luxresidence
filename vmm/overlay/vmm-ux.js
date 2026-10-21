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
  var mo=new MutationObserver(function(){setTimeout(pill,380);});
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
  function blocked(el){if(el.closest&&el.closest(HS))return true;for(;el&&el!==document.body;el=el.parentElement){var cs=getComputedStyle(el);if((cs.overflowX==='auto'||cs.overflowX==='scroll')&&el.scrollWidth>el.clientWidth+4)return true;}return false;}
  function busy2(){return busy()||document.querySelector('.pg.on,#igSV,#mvw,#igReel,#stEd,#s4wr,#s4quiz,#igCtx,.s3over')||(typeof CHAT_SEL!=='undefined'&&CHAT_SEL);}
  function tabList(){return Array.prototype.map.call(document.querySelectorAll('#tabs button'),function(b){return b.dataset.v;});}
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
