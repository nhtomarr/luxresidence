

/* ---------- Azərbaycan dilində tarix ---------- */
var AZM=['yanvar','fevral','mart','aprel','may','iyun','iyul','avqust','sentyabr','oktyabr','noyabr','dekabr'],AZMs=['yan','fev','mar','apr','may','iyn','iyl','avq','sen','okt','noy','dek'],
 AZW=['bazar','bazar ertəsi','çərşənbə axşamı','çərşənbə','cümə axşamı','cümə','şənbə'],AZWs=['B.','B.e.','Ç.a.','Ç.','C.a.','C.','Ş.'];
function azFmt(d,o,tm){o=o||{};var pt={};new Intl.DateTimeFormat('en-GB',{timeZone:o.timeZone||'Asia/Baku',year:'numeric',month:'numeric',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d).forEach(function(x){pt[x.type]=x.value;});
 var wd=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(pt.weekday),mi=+pt.month-1,out;
 if(!o.month&&!o.weekday)out=String(pt.day).padStart(2,'0')+'.'+String(pt.month).padStart(2,'0')+'.'+pt.year;
 else{out=(o.day?(+pt.day)+' ':'')+(o.month==='short'?AZMs[mi]:o.month?AZM[mi]:'')+(o.year?' '+pt.year:'');if(o.weekday)out=(o.weekday==='short'?AZWs[wd]:AZW[wd])+', '+out;}
 if(tm)out+=' '+(pt.hour==='24'?'00':pt.hour)+':'+pt.minute;return out.trim();}
(function(){var D=Date.prototype,_d=D.toLocaleDateString,_s=D.toLocaleString;
 D.toLocaleDateString=function(l,o){return /^az/.test(l||'')?azFmt(this,o,false):_d.call(this,l,o);};
 D.toLocaleString=function(l,o){return /^az/.test(l||'')?azFmt(this,o,!o||!!o.hour||(!o.month&&!o.weekday&&!o.day)):_s.call(this,l,o);};})();
function mLabel(m){return AZM[+m.slice(5,7)-1].replace(/^./,function(c){return c.toUpperCase();})+' '+m.slice(0,4);}

function OFB(q){return (location.pathname.indexOf('/ofis')===0?'/ofis':'/')+(q||'');}

var SIMPLE=false,PREVIEW=false,OWNER=false,sb=null,ME=null,MGR=false,EMP=null,EMPS=[],DEPTS=[],POS=[],TASKS=[],PROFS=[],CFG=null,KB='new',LEAVES=[],HOL=[];
var LT={mezuniyyet:'Məzuniyyət',xestelik:'Xəstəlik',ezamiyyet:'Ezamiyyət',uzaqdan:'Uzaqdan iş',icaze:'Saatlıq icazə',odenissiz:'Ödənişsiz məzuniyyət',duzelis:'Davamiyyət düzəlişi'};
var TZ='Asia/Baku';
var ST={new:'Yeni',doing:'İcrada',review:'Yoxlamada',done:'Bitdi'},PR={urgent:'Təcili',high:'Yüksək',normal:'Normal',low:'Aşağı'};
var WD=['B.e','Ç.a','Çər','C.a','Cüm','Şən','Baz'];
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function toast(t){var e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove('on');},3200);}
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:TZ}).format(new Date());}
function hm(ts){return ts?new Date(ts).toLocaleTimeString('az-AZ',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}):'—';}
function isoDow(dstr){var d=new Date(dstr+'T12:00:00Z').getUTCDay();return d===0?7:d;}
function hmin(m){m=m||0;var h=Math.floor(m/60),mm=m%60;return h?(h+' saat'+(mm?' '+mm+' dəq':'')):(mm+' dəq');}
function empName(id){var e=EMPS.find(function(x){return x.id===id;});return e?e.full_name:'—';}
function posOf(e){var p=POS.find(function(x){return x.id===e.position_id;});return p;}
function err(e){toast((e&&e.message)||'Xəta baş verdi');console.warn(e);}
function run(q){return q.then(function(r){if(r.error)throw r.error;return r.data;});}

/* ---------- start ---------- */
luxAuth({perms:['ofis','ofis_admin','ofis_owner'],title:'Baş Ofis',sub:'İşçi hesabınızla daxil olun',logo:false,noAdminLink:true,accent:'#2563eb',bg:'linear-gradient(135deg,#e2e8f0,#f8fafc)',onReady:function(client,me){sb=client;ME=me;OWNER=(me.perms||[]).indexOf('ofis_owner')>=0;PREVIEW=!!(me.is_admin&&new URLSearchParams(location.search).get('baxis')==='sahibkar');if(PREVIEW)OWNER=true;MGR=me.is_admin||OWNER||(me.perms||[]).indexOf('ofis_admin')>=0;start();}});
function start(){$('app').style.display='';var _bl=document.getElementById('bootload');if(_bl)_bl.style.display='none';var chip=document.querySelector('.lux-me');if(chip)chip.style.display='none';
 $('meBox').innerHTML='<b>'+esc(PREVIEW?'Afiq Rəhmanov':(ME.full_name||ME.email))+'</b>'+(PREVIEW?'Sahibkar':ME.is_admin?'Sistem admini':OWNER?'Sahibkar':MGR?'HR rəhbəri':'İşçi');
 $('outBtn').onclick=function(){sb.auth.signOut().then(function(){location.href=OFB();});};
 if(ME.is_admin){var pv=document.createElement('button');pv.className='out';pv.textContent=PREVIEW?'✕ Sahibkar görünüşündən çıx':'👁 Sahibkar kimi bax';pv.onclick=function(){location.href=PREVIEW?OFB():OFB('?baxis=sahibkar');};$('outBtn').parentNode.insertBefore(pv,$('outBtn'));}
 if(PREVIEW){var bn=document.createElement('div');bn.className='pvbar';bn.innerHTML='👁 Sahibkarın görəcəyi ekran (önizləmə). Sahibkar yalnız baxır, heç nəyi dəyişə bilmir.';document.body.insertBefore(bn,$('app'));}
 var tabs;
 if(OWNER)tabs=[['boss','Nəzarət'],['chat','💬 Çat'],['feed','📣 Lent'],['remind','🔔 Xatırlat'],['asst','🎯 Assistent'],['oprofil','Profil']];
 else{tabs=[['today','Bu gün'],['chat','💬 Çat'],['feed','📣 Lent']];if(MGR)tabs.push(['boss','Nəzarət'],['panel','Panel'],['remind','🔔 Xatırlat']);tabs.push(['plans',MGR?'Aylıq planlar':'Aylıq plan'],['tasks','Tapşırıqlar']);if(MGR||(EMP&&EMP.lead_rotation))tabs.push(['leads','Müraciətlər']);tabs.push(['leave','Sorğular'],['dir','Komanda'],['news','Elanlar'],['cal','Təqvim'],['docs','Sənədlər']);tabs.push(['me','Profilim']);
  if(SIMPLE)tabs=[['today','Bu gün'],['dir','Komanda']];if(MGR){tabs.push(['team','Davamiyyət'],['staff','İşçilər'],['set','Ayarlar']);}}
 document.body.classList.toggle('is-mgr',MGR);document.body.classList.toggle('owner',OWNER);
 $('tabs').innerHTML=tabs.map(function(t){return '<button data-v="'+t[0]+'">'+t[1]+'</button>';}).join('');
 $('tabs').onclick=function(e){var b=e.target.closest('button');if(b)show(b.dataset.v);};if(typeof chatUpdateBadge==='function')setTimeout(chatUpdateBadge,800);setTimeout(function(){try{chatGlobalInit();}catch(e){}},1000);
 $('dDay').value=today();$('mMonth').value=today().slice(0,7);$('dDay').onchange=renderDay;$('mMonth').onchange=renderMonth;$('tkFilter').onchange=renderKanban;
 setInterval(tick,1000);tick();
 loadAll().then(function(){setTimeout(function(){iosSheetShow(false);},2500);if(!MGR&&EMP&&EMP.lead_rotation&&!document.querySelector('#tabs [data-v=leads]'))$('tabs').querySelector('[data-v=leave]').insertAdjacentHTML('beforebegin','<button data-v="leads">Müraciətlər</button>');var c=new URLSearchParams(location.search).get('c');(function(){var def=new URLSearchParams(location.search).get('qr')&&MGR?'set':((OWNER||(ME.is_admin&&!EMP))?'boss':'today');var saved='';try{saved=sessionStorage.getItem('ofis_tab')||'';}catch(e){}var allowed=tabs.map(function(t){return t[0];});show(saved&&allowed.indexOf(saved)>=0?saved:def);})();if(new URLSearchParams(location.search).get('qr')&&MGR)openQR(+new URLSearchParams(location.search).get('qrloc')||null);if(c)autoCheck(c);});
}
function show(v){if(v!=='chat'&&typeof chatFull==='function'){chatFull(false);CHAT_SEL=null;var _b=document.getElementById('igSelBar');if(_b)_b.remove();}try{sessionStorage.setItem('ofis_tab',v);}catch(e){}document.querySelectorAll('.view').forEach(function(x){x.classList.toggle('on',x.id==='v-'+v);});document.querySelectorAll('#tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.v===v);});var ab=document.querySelector('#tabs button.on');if(ab&&ab.scrollIntoView)try{ab.scrollIntoView({block:'nearest',inline:'center'});}catch(e){}
 if(v==='today')renderToday();if(v==='panel')renderPanel();if(v==='tasks')renderKanban();if(v==='team'){renderDay();renderMonth();}if(v==='staff')renderStaff();if(v==='set')renderSet();if(v==='leave')renderLeave();if(v==='boss'){if(OWNER)renderOwner();else renderBoss();}if(v==='asst')renderAsst();if(v==='oprofil')renderOProfil();if(v==='remind')renderRemind();if(v==='chat')renderChat();if(v==='feed')renderFeed();if(v==='plans')renderPlans();if(v==='leads')renderLeads();if(v==='news')renderNews();if(v==='cal')renderCal();if(v==='dir'){dirFilters();var db=$('dirBar');if(db)db.style.display='';renderDir();}if(v==='docs')renderDocs();if(v==='me')renderMe();window.scrollTo(0,0);}
function tick(){var n=new Date();$('tClock').textContent=n.toLocaleTimeString('az-AZ',{timeZone:TZ,hour:'2-digit',minute:'2-digit',second:'2-digit'});$('tDate').textContent=n.toLocaleDateString('az-AZ',{timeZone:TZ,weekday:'long',day:'numeric',month:'long'});}
function loadAll(){return Promise.all([
  run(sb.from('office_employees').select('*').order('full_name')),run(sb.from('office_departments').select('*').order('sort').order('id')),run(sb.from('office_positions').select('*').order('sort').order('id')),
  run(sb.from('office_tasks').select('*').order('due',{ascending:true,nullsFirst:false}).order('id',{ascending:false})),
  MGR?run(sb.from('lux_profiles').select('user_id,email,full_name,perms,is_admin,active')):Promise.resolve([]),MGR?run(sb.from('office_config').select('*').eq('id',1).maybeSingle()):Promise.resolve(null),
  run(sb.from('office_leaves').select('*').order('date_from',{ascending:false})),run(sb.from('office_holidays').select('*').order('day')),
  sb.from('office_locations').select('id,name,lat,lng,radius_m,static_qr,active,sort').order('sort').order('id').then(function(x){return x.data||[];},function(){return [];})
 ]).then(function(r){LOCS=r[8]||[];EMPS=r[0]||[];DEPTS=r[1]||[];POS=r[2]||[];TASKS=r[3]||[];PROFS=r[4]||[];CFG=r[5];LEAVES=r[6]||[];HOL=r[7]||[];EMP=EMPS.find(function(e){return e.user_id===ME.user_id&&e.active;})||null;
  SIMPLE=!!(EMP&&EMP.simple_mode&&!MGR);if(SIMPLE){$('tabs').innerHTML=[['today','Bu gün'],['dir','Komanda']].map(function(t){return '<button data-v="'+t[0]+'">'+t[1]+'</button>';}).join('');document.body.classList.add('simple');}}).catch(err);}

/* ---------- BU GÜN / check-in ---------- */
var MYDAY=null;
function renderToday(){document.body.classList.toggle('simple',!!SIMPLE);renderOwnerTasksForEmp();renderHomeExtras();renderPwBanner();renderPushCards();$('noEmp').style.display=(EMP||MGR)?'none':'';var _wn=document.getElementById('workdayNote');if(_wn)_wn.innerHTML=workdayNote();var ck=document.querySelector('.checkcard');if(ck)ck.style.display=(!EMP&&MGR)?'none':'';renderTgCard();renderHrBoxes();renderTodayAnn();
 var my=TASKS.filter(function(t){return EMP&&t.assignee_id===EMP.id&&t.status!=='done'&&!t.from_owner;}).sort(function(a,b){return String(a.due||'9')<String(b.due||'9')?-1:1;});
 $('tMyTasks').innerHTML=my.length?my.map(taskRow).join(''):'<div class="empty">Açıq tapşırığınız yoxdur 🎉</div>';
 if(!EMP){$('tStatus').textContent='';$('tBtns').innerHTML='';$('tStats').innerHTML='';return;}
 run(sb.from('office_attendance').select('*').eq('employee_id',EMP.id).gte('day',today().slice(0,7)+'-01').order('day')).then(function(rows){
  MYDAY=rows.find(function(r){return r.day===today();})||null;
  var s,btn;if(!isWorkdayToday()&&(!MYDAY||!MYDAY.check_in)){s='🏠 Bu gün iş günü deyil · xoş istirahət';btn='<button class="btn ghost" onclick="scan(\'in\')" style="opacity:.85">📷 İşə gəlmişəmsə, qeyd et</button>';}
  else if(!MYDAY||!MYDAY.check_in){var hh=dayHours(EMP,today());s='Bu gün hələ gəliş qeyd olunmayıb · iş saatı '+hh[0]+'–'+hh[1];btn='<button class="btn" onclick="scan(\'in\')">📷 Gəlişi qeyd et</button>';}
  else if(!MYDAY.check_out){s='Gəliş: '+hm(MYDAY.check_in)+(MYDAY.late_min?' · '+MYDAY.late_min+' dəq gecikmə':' · vaxtında');btn='<button class="btn" onclick="scan(\'out\')">📷 Çıxışı qeyd et</button>';}
  else{s='Gəliş '+hm(MYDAY.check_in)+' · Çıxış '+hm(MYDAY.check_out)+' · '+hmin(MYDAY.worked_min);btn='';}
  $('tStatus').textContent=s;$('tBtns').innerHTML=btn;loadMyOuting().then(function(){if(MYOUT&&btn)$('tBtns').innerHTML='';renderOutingBox();});
  var d=rows.filter(function(r){return r.check_in;}),late=rows.filter(function(r){return r.late_min>0;});
  $('tStats').innerHTML='<div><b>'+d.length+'</b><span class="muted small">gün işə gəlmisiniz (bu ay)</span></div><div><b>'+late.length+'</b><span class="muted small">dəfə gecikmisiniz</span></div><div><b>'+(late.length?hmin(late.reduce(function(a,r){return a+r.late_min;},0)):'—')+'</b><span class="muted small">gecikmə cəmi</span></div>';
  $('tMonth').innerHTML=d.length?('<div class="tbl"><table><tr><th>Gün</th><th>Gəliş</th><th>Çıxış</th><th>Qeyd</th></tr>'+rows.slice().reverse().map(function(r){return '<tr><td>'+r.day.slice(8)+'.'+r.day.slice(5,7)+'</td><td>'+hm(r.check_in)+'</td><td>'+hm(r.check_out)+'</td><td>'+(r.late_min?'<span class="pill p-warn">'+r.late_min+' dəq gec</span>':'')+(r.early_min?' <span class="pill p-mut">'+r.early_min+' dəq tez</span>':'')+'</td></tr>';}).join('')+'</table></div>'):'Bu ay hələ qeyd yoxdur.';
 }).catch(err);}
/* ---------- Selfi ilə təsdiq ---------- */
function selfieCapture(kind){var need=CFG?Promise.resolve(CFG.require_selfie!==false):sb.rpc('office_selfie_required').then(function(r){return !!(r&&r.data);}).catch(function(){return true;});
 return need.then(function(req){return req?selfieShot(kind):null;});}
function selfieShot(kind){return new Promise(function(resolve){
 if(!navigator.mediaDevices||!EMP)return resolve(null);
 modal('<div class="mhead"><h3>📸 Selfi ilə təsdiq</h3></div><p class="muted small" style="margin-bottom:10px">Qeydin sizə aid olduğunu təsdiqləmək üçün şəkil avtomatik çəkiləcək. Üzünüz kadrda olsun.</p><div class="selfie"><video id="sfV" playsinline muted autoplay></video><b id="sfC">3</b></div><p class="muted small" style="margin-top:8px;text-align:center" id="sfT">Kamera açılır…</p>');
 var st=null,done=false;function fin(v){if(done)return;done=true;if(st)st.getTracks().forEach(function(t){t.stop();});closeModal();resolve(v);}
 navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:640}}}).then(function(s){st=s;var v=$('sfV');v.srcObject=s;v.play();$('sfT').textContent='Kameraya baxın';
  var n=3;var it=setInterval(function(){n--;var c=$('sfC');if(c)c.textContent=n>0?n:'📸';if(n<=0){clearInterval(it);
   var cv=document.createElement('canvas'),sz=Math.min(v.videoWidth,v.videoHeight)||480;cv.width=cv.height=480;cv.getContext('2d').drawImage(v,(v.videoWidth-sz)/2,(v.videoHeight-sz)/2,sz,sz,0,0,480,480);
   cv.toBlob(function(bl){var path='selfie/'+EMP.id+'/'+today()+'_'+kind+'_'+Date.now()+'.jpg';
    sb.storage.from('office').upload(path,bl,{contentType:'image/jpeg'}).then(function(r){if(r.error)throw r.error;return sb.rpc('office_att_photo',{p_kind:kind,p_path:path});}).then(function(){fin(path);}).catch(function(){fin(null);});},'image/jpeg',.8);}},1000);
 }).catch(function(){toast('Kamera açılmadı — qeyd şəkilsiz saxlanıldı');fin(null);});});}
/* ---------- İş vaxtı qısa çıxışlar ---------- */
var MYOUT=null;
function loadMyOuting(){if(!EMP)return Promise.resolve();return run(sb.from('office_outings').select('*').eq('employee_id',EMP.id).eq('day',today()).order('id')).then(function(r){MYOUTS=r;MYOUT=r.find(function(x){return !x.back_at;})||null;}).catch(function(){MYOUTS=[];MYOUT=null;});}
var MYOUTS=[];
function renderOutingBox(){var b=$('tOut');if(!b)return;if(MYOUT)trkStart();else trkStop();if(window.__bgSync)window.__bgSync();if(!EMP||!MYDAY||!MYDAY.check_in||MYDAY.check_out){b.innerHTML=MYOUTS.length&&MYDAY&&MYDAY.check_out?'':'';return;}
 if(MYOUT){var mins=Math.max(0,Math.round((Date.now()-new Date(MYOUT.out_at))/60000));
  b.innerHTML='<div class="card outc"><div class="row sp"><div><b>🚶 Ofisdən kənardasınız · '+(MYOUT.kind==='is'?'işlə bağlı':'şəxsi')+'</b><div class="small">'+esc(MYOUT.note)+' · '+hm(MYOUT.out_at)+'-dan bəri ('+hmin(mins)+')</div></div></div><div class="row" style="margin-top:10px;gap:8px">'+(MYOUT.arrive_at?'<span class="pill p-ok">📍 Çatdığınız yer qeyd olunub · '+hm(MYOUT.arrive_at)+'</span>':'<span class="pill p-mut">📍 Yer avtomatik izlənir — çatanda özü qeyd olunacaq</span>')+'<button class="btn" onclick="outingEnd(false)">✅ Ofisə qayıtdım</button>'+(MYOUT.kind==='is'?'<button class="btn ghost" onclick="outingEnd(true)">Bu gün qayıtmayacağam</button>':'')+'</div></div>';return;}
 var cnt=MYOUTS.length;b.innerHTML='<div class="outbar"><button class="btn ghost sm" onclick="openOuting()">🚶 Qısa çıxış (iş vaxtı)</button>'+(cnt?'<span class="muted small">Bu gün '+cnt+' çıxış</span>':'')+'</div>';}
function openOuting(){modal('<div class="mhead"><h3>🚶 İş vaxtı çıxış</h3><button class="x" onclick="closeModal()">×</button></div><p class="muted small" style="margin-bottom:10px">Ofisdən müvəqqəti çıxanda qeyd edin — dəftərə yazmağa ehtiyac yoxdur. Çıxış müddətində yeriniz <b>avtomatik</b> qeyd olunur (tətbiq açıq olduqca) və çatdığınız yer özü müəyyən edilir. Qayıdanda <b>“Ofisə qayıtdım”</b> basın. İzləmə yalnız çıxış müddətində aparılır və məlumatı yalnız rəhbərlik görür.</p>'+
 '<div class="field"><label>Növ</label><div class="okinds"><label><input type="radio" name="oK" value="is" checked><span>💼 İşlə bağlı<small>görüş, bank, obyekt, sənəd</small></span></label><label><input type="radio" name="oK" value="sexsi"><span>🙋 Şəxsi<small>iş vaxtından çıxılır</small></span></label></div></div>'+
 '<div class="field"><label>Hara və nə üçün</label><input id="oN" maxlength="200" placeholder="məs: Kapital Bank — ödəniş sənədləri"></div><button class="btn" style="width:100%" id="oBtn" onclick="outingStart()">Çıxışı qeyd et</button>');}
function geoGet(cb){if(!navigator.geolocation)return cb(null,null);navigator.geolocation.getCurrentPosition(function(p){cb(p.coords.latitude,p.coords.longitude);},function(){cb(null,null);},{enableHighAccuracy:true,timeout:12000,maximumAge:0});}
function outingStart(){var k=(document.querySelector('input[name=oK]:checked')||{}).value,n=$('oN').value.trim();if(!n)return toast('Hara və nə üçün getdiyinizi yazın');$('oBtn').disabled=true;toast('Yer yoxlanılır…');
 geoGet(function(la,ln){sb.rpc('office_outing_start',{p_kind:k,p_note:n,p_lat:la,p_lng:ln}).then(function(r){if(r.error)throw r.error;closeModal();toast(r.data.msg);renderToday();}).catch(function(e){var b=$('oBtn');if(b)b.disabled=false;err(e);});});}
/* ---------- Çıxış zamanı avtomatik yer izləmə (yalnız açıq çıxış müddətində) ---------- */
var TRK={id:null,last:null,lastAt:0,timer:null};
function trkSend(p){var c=p.coords,now=Date.now();
  if(TRK.last&&now-TRK.lastAt<85000){var dx=(c.latitude-TRK.last[0])*111000,dy=(c.longitude-TRK.last[1])*111000*Math.cos(c.latitude*Math.PI/180);if(Math.sqrt(dx*dx+dy*dy)<100)return;}
  TRK.last=[c.latitude,c.longitude];TRK.lastAt=now;
  sb.rpc('office_outing_point',{p_lat:c.latitude,p_lng:c.longitude,p_acc:Math.round(c.accuracy||0)}).then(function(r){if(r&&r.data&&r.data.arrived){toast('📍 Çatdığınız yer avtomatik qeyd olundu');renderToday();}if(r&&r.data&&r.data.reason==='no_outing')trkStop();});}
function trkStart(){if(TRK.id!==null||!navigator.geolocation)return;
  TRK.id=navigator.geolocation.watchPosition(trkSend,function(){},{enableHighAccuracy:true,maximumAge:30000,timeout:30000});
  TRK.timer=setInterval(function(){navigator.geolocation.getCurrentPosition(function(p){TRK.lastAt=0;trkSend(p);},function(){},{enableHighAccuracy:true,maximumAge:0,timeout:20000});},90000);}
function trkStop(){if(TRK.id!==null){navigator.geolocation.clearWatch(TRK.id);TRK.id=null;}if(TRK.timer){clearInterval(TRK.timer);TRK.timer=null;}TRK.last=null;}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&MYOUT&&navigator.geolocation)navigator.geolocation.getCurrentPosition(function(p){TRK.lastAt=0;trkSend(p);},function(){},{enableHighAccuracy:true,maximumAge:0,timeout:20000});});
/* Rəhbər: çıxış marşrutu xəritədə */
function loadLeaflet(){return window.L?Promise.resolve():new Promise(function(ok,no){var c=document.createElement('link');c.rel='stylesheet';c.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';document.head.appendChild(c);var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
function openRoute(oid){Promise.all([loadLeaflet(),run(sb.from('office_outings').select('*').eq('id',oid).single()),run(sb.from('office_outing_points').select('at,lat,lng,acc').eq('outing_id',oid).order('at'))]).then(function(r){var o=r[1],pts=r[2];var e=EMPS.find(function(x){return x.id===o.employee_id;})||{full_name:''};
  var gaps=0;for(var i=1;i<pts.length;i++)if(new Date(pts[i].at)-new Date(pts[i-1].at)>20*60000)gaps++;
  modal('<div class="mhead"><h3>🗺 '+esc(e.full_name)+' — '+esc(o.note)+'</h3><button class="x" onclick="closeModal()">×</button></div><div class="small muted" style="margin-bottom:8px">'+hm(o.out_at)+'–'+(o.back_at?hm(o.back_at):'davam edir')+' · '+pts.length+' nöqtə'+(o.arrive_at?' · çatıb: '+hm(o.arrive_at)+(o.arrive_auto?' (avtomatik)':''):'')+(gaps?' · <b style="color:var(--bad)">'+gaps+' boşluq (20+ dəq yer gəlməyib)</b>':'')+'</div><div id="routeMap" style="height:380px;border-radius:14px"></div>');
  setTimeout(function(){var m=L.map('routeMap');L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(m);var ll=[];
    if(o.out_lat)ll.push([o.out_lat,o.out_lng]);pts.forEach(function(p){ll.push([p.lat,p.lng]);});if(o.back_lat)ll.push([o.back_lat,o.back_lng]);
    var _st=siteOf(e);if(_st.lat!=null){L.circle([_st.lat,_st.lng],{radius:_st.radius_m||150,color:'#2563eb'}).addTo(m).bindTooltip(_st.name);}
    if(ll.length){L.polyline(ll,{color:'#dc2626',weight:4}).addTo(m);pts.forEach(function(p,i){L.circleMarker([p.lat,p.lng],{radius:4,color:'#dc2626'}).addTo(m).bindTooltip(hm(p.at));});
      if(o.arrive_lat)L.marker([o.arrive_lat,o.arrive_lng]).addTo(m).bindPopup('Çatıb: '+hm(o.arrive_at)).openPopup();m.fitBounds(L.latLngBounds(ll).pad(0.2));}
    else{m.setView(_st.lat!=null?[_st.lat,_st.lng]:[40.4,49.85],13);}},60);
 }).catch(err);}

function outingArrive(){toast('Yer müəyyən edilir…');if(!navigator.geolocation)return toast('Telefon yer xidmətini dəstəkləmir');navigator.geolocation.getCurrentPosition(function(p){sb.rpc('office_outing_arrive',{p_lat:p.coords.latitude,p_lng:p.coords.longitude,p_acc:Math.round(p.coords.accuracy)}).then(function(r){if(r.error)throw r.error;toast(r.data.msg);renderToday();}).catch(err);},function(){toast('Yer icazəsi verilmədi — telefonda yer xidmətini aktiv edin');},{enableHighAccuracy:true,timeout:15000,maximumAge:0});}
function outingEnd(endDay){if(endDay&&!confirm('Bu gün ofisə qayıtmayacaqsınız? İş gününüz indi bitmiş sayılacaq.'))return;toast('Yer yoxlanılır…');
 geoGet(function(la,ln){sb.rpc('office_outing_end',{p_lat:la,p_lng:ln,p_end_day:!!endDay}).then(function(r){if(r.error)throw r.error;toast(r.data.msg);renderToday();}).catch(err);});}
/* HR: günün çıxışları və selfi */
function selfieThumb(p){return p?'<img class="sfthumb" data-p="'+esc(p)+'" onclick="openSelfie(this.dataset.p)" alt="">':'';}
function hydrateSelfies(root){var ims=(root||document).querySelectorAll('img.sfthumb:not([src])');[].forEach.call(ims,function(im){sb.storage.from('office').createSignedUrl(im.dataset.p,3600).then(function(r){if(r.data)im.src=r.data.signedUrl;});});}
function openSelfie(p){sb.storage.from('office').createSignedUrl(p,600).then(function(r){if(r.data)modal('<div class="mhead"><h3>📸 Selfi</h3><button class="x" onclick="closeModal()">×</button></div><img src="'+r.data.signedUrl+'" style="width:100%;border-radius:16px">');});}

/* ---------- 🎯 AI Köməkçi (professional) ---------- */
var ASVOICE=true,ASAUDIO=null,ASHIST=(function(){try{return JSON.parse(sessionStorage.getItem('asst_hist')||'[]')}catch(e){return[]}})(),ASPREFS={voice:'shimmer',speed:1.0,autospeak:true};
function asstSaveHist(){try{sessionStorage.setItem('asst_hist',JSON.stringify(ASHIST.slice(-40)))}catch(e){}}
var ASREC=null,ASchunks=[],ASscope='today',ASlisten=false,ASsilence=null,ASctx=null,ASanalyser=null,ASstream=null,ASbargeTimer=null,ASview='chat';
var QUICK=[['Bu gün kim gəlməyib?','👥'],['İndi kim çöldədir?','🚶'],['Sabah kimin ad günüdür?','🎂'],['Təsdiq gözləyən sorğular','📋'],['Boş mənzillərin siyahısı','🏢'],['Borcluların siyahısı','💰'],['Bu ay kim gecikib?','⏰'],['Mənzil xülasəsi','📊'],['Bu gün nəyim var?','🗓']];
function asstHi(){var h=new Date().getHours();return h<6?'Gecəniz xeyrə':h<12?'Sabahınız xeyir':h<18?'Gününüz uğurlu olsun':'Axşamınız xeyir';}

function ocount(tbl,col,val){return run(sb.from(tbl).select('id',{count:'exact',head:true}).eq(col,val)).then(function(r){return r.count||0;}).catch(function(){return 0;});}
/* ---------- 💬 Komanda çatı ---------- */
var CHATother=null,CHATname='',CHATsub=null,CHATreply=null,CHATmsgs=[];
var CHAT_PH={},CHAT_SUB={},CHAT_THREADS=[],PRES={};
function chatAva(name,photo,sz,uid){if(uid){var pr=PRES[uid];return '<span class="igavw" data-pu="'+esc(uid)+'">'+chatAva(name,photo,sz)+'<i class="igon'+(pr&&pr.on?' on':'')+'" style="width:'+Math.max(10,Math.round(sz*.26))+'px;height:'+Math.max(10,Math.round(sz*.26))+'px"></i></span>';}sz=sz||56;var b='https://avqchschbbltnnasabdm.supabase.co/storage/v1/object/public/avatars/';
 if(photo)return '<img class="igava" src="'+b+esc(photo)+'" alt="" loading="lazy" style="width:'+sz+'px;height:'+sz+'px">';
 return '<span class="igava igini" style="width:'+sz+'px;height:'+sz+'px;font-size:'+Math.round(sz*.36)+'px">'+esc(chatInitials(name))+'</span>';}
var IGI={
 back:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>',
 edit:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
 search:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
 cam:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
 img:'<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="9" cy="9" r="1.6"/><path d="M21 15l-5-5-8 9"/></svg>',
 video:'<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2.5" y="6" width="13.5" height="12" rx="3"/><path d="M16 10.5l5.5-3.5v10L16 13.5z"/></svg>',
 phone:'<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>'
};
function chatAgo(iso){if(!iso)return '';var s=(Date.now()-new Date(iso).getTime())/1000;
 if(s<60)return 'indi';if(s<3600)return Math.floor(s/60)+'d';if(s<86400)return Math.floor(s/3600)+'s';if(s<604800)return Math.floor(s/86400)+'g';return Math.floor(s/604800)+'h';}
function chatInitials(n){return (n||'?').split(' ').map(function(w){return w[0]||'';}).slice(0,2).join('').toUpperCase();}
function chatArg(s){return esc(s||'').replace(/\x27/g,"\\x27");}
var CHAT_SEL=null,CHAT_FILTER='all',_lpT=null,_lpFired=false;
function chatFilter(f){CHAT_FILTER=f;chatDrawThreads(CHAT_THREADS);}
function chatSelStart(uid){CHAT_SEL=new Set();if(uid)CHAT_SEL.add(uid);try{navigator.vibrate&&navigator.vibrate(25);}catch(e){}chatDrawThreads(CHAT_THREADS);}
function chatSelEnd(){CHAT_SEL=null;chatDrawThreads(CHAT_THREADS);}
function chatSelAll(){var vis=chatVisible(),all=vis.length>0&&vis.every(function(x){return CHAT_SEL.has(x.other);});vis.forEach(function(x){if(all)CHAT_SEL.delete(x.other);else CHAT_SEL.add(x.other);});chatDrawThreads(CHAT_THREADS);}
function chatRowDown(uid){clearTimeout(_lpT);_lpFired=false;_lpT=setTimeout(function(){_lpFired=true;if(!CHAT_SEL)chatSelStart(uid);else{CHAT_SEL.add(uid);chatDrawThreads(CHAT_THREADS);}},500);}
function chatRowUp(){clearTimeout(_lpT);}
function chatBulk(a){if(!CHAT_SEL||!CHAT_SEL.size)return;var ids=Array.from(CHAT_SEL),n=ids.length;
 if(a==='delete'&&!confirm(n+' söhbət silinsin?\n\nSöhbət yalnız səndə silinir, qarşı tərəfdə qalır. Yeni mesaj gəlsə, söhbət yenidən görünəcək.'))return;
 run(sb.rpc('msg_bulk',{p_others:ids,p_action:a})).then(function(){toast(a==='delete'?n+' söhbət silindi':a==='read'?'Oxunmuş edildi':'Oxunmamış edildi');CHAT_SEL=null;
  return run(sb.rpc('msg_threads'));}).then(function(r){CHAT_THREADS=r||[];chatDrawThreads(CHAT_THREADS);livePoll();}).catch(err);}
function chatTime(iso){if(!iso)return '';var d=new Date(iso),now=new Date();if(d.toDateString()===now.toDateString())return d.toLocaleTimeString('az-AZ',{hour:'2-digit',minute:'2-digit'});return d.toLocaleDateString('az-AZ',{day:'2-digit',month:'2-digit'});}
function chatNew(){run(sb.rpc('msg_contacts')).then(function(list){
  var html='<div class="mhead"><h3>Yeni mesaj</h3><button class="x" onclick="closeModal()">×</button></div>'
   +'<label class="igsearch" style="margin:0 0 10px">'+IGI.search+'<input id="chatSearch" placeholder="Axtar" oninput="chatFilterContacts(this.value)"></label>'
   +'<div id="chatContacts" style="max-height:55vh;overflow-y:auto">'+chatContactsHtml(list)+'</div>';
  window.CHAT_CONTACTS=list;modal(html);presRefresh();
 }).catch(err);
}
function chatContactsHtml(list){return list.map(function(c){CHAT_PH[c.uid]=c.photo||null;CHAT_SUB[c.uid]=c.vezife||'';
 return '<div class="igrow" onclick="closeModal();chatOpen(\''+c.uid+'\',\''+chatArg(c.ad)+'\')">'+chatAva(c.ad,c.photo,48,c.uid)+'<div class="igmeta"><div class="igname">'+esc(c.ad)+'</div><div class="iglast">'+esc(c.vezife||'')+'</div></div></div>';}).join('')||'<p class="hint">İşçi tapılmadı</p>';}
function chatFilterContacts(q){q=(q||'').toLowerCase();var f=(window.CHAT_CONTACTS||[]).filter(function(c){return (c.ad||'').toLowerCase().indexOf(q)>=0||(c.vezife||'').toLowerCase().indexOf(q)>=0;});$('chatContacts').innerHTML=chatContactsHtml(f);}
function chatBack(){chatFull(false);CHATother=null;CHATreply=null;if(CHATsub){try{CHATsub.unsubscribe();}catch(e){}CHATsub=null;}renderChat();chatUpdateBadge();}
function chatFit(){var r=document.querySelector('.igroom');if(!r)return;var vv=window.visualViewport;
 if(vv){r.style.height=vv.height+'px';r.style.top=vv.offsetTop+'px';}else{r.style.height=window.innerHeight+'px';r.style.top='0px';}
 var m=$('chatMsgs');if(m&&m._stick!==false)m.scrollTop=m.scrollHeight;}
function chatFull(on){document.body.classList.toggle('igfull',!!on);var vv=window.visualViewport;
 if(on){if(!window._chatFitOn){window._chatFitOn=true;if(vv){vv.addEventListener('resize',chatFit);vv.addEventListener('scroll',chatFit);}window.addEventListener('resize',chatFit);}chatFit();
  var m=$('chatMsgs');if(m)m.addEventListener('scroll',function(){m._stick=(m.scrollHeight-m.scrollTop-m.clientHeight)<80;});}
 else if(window._chatFitOn){window._chatFitOn=false;if(vv){vv.removeEventListener('resize',chatFit);vv.removeEventListener('scroll',chatFit);}window.removeEventListener('resize',chatFit);}}
function chatSep(d){var now=new Date(),y=new Date(now);y.setDate(now.getDate()-1);var hm=d.toLocaleTimeString('az-AZ',{hour:'2-digit',minute:'2-digit'});
 if(d.toDateString()===now.toDateString())return hm;if(d.toDateString()===y.toDateString())return 'Dünən '+hm;
 return d.toLocaleDateString('az-AZ',{day:'numeric',month:'long'})+' '+hm;}
/* ===== CANLI ÇAT QATI + ZƏNG (WebRTC) ===== */
var LIVE={ch:null,ok:false,poll:null,unread:-1,started:false};
function chatGlobalInit(){if(LIVE.started||!ME||!ME.user_id)return;LIVE.started=true;
 var go=function(){liveSubscribe();};
 try{sb.auth.getSession().then(function(r){var t=r&&r.data&&r.data.session&&r.data.session.access_token;if(t&&sb.realtime&&sb.realtime.setAuth)sb.realtime.setAuth(t);go();}).catch(go);}catch(e){go();}
 try{sb.auth.onAuthStateChange(function(ev,s){if(s&&s.access_token&&sb.realtime&&sb.realtime.setAuth)sb.realtime.setAuth(s.access_token);});}catch(e){}
 LIVE.poll=setInterval(function(){if(document.visibilityState==='visible')livePoll();},LIVE.ok?20000:6000);
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){livePoll(true);if(!LIVE.ok)liveSubscribe();}});
 window.addEventListener('online',function(){livePoll(true);liveSubscribe();});
 livePoll(true);liveDeepLink();presInit();try{backInit();}catch(e){}
}
function liveSubscribe(){var u=ME.user_id;if(LIVE.ch){try{sb.removeChannel(LIVE.ch);}catch(e){}LIVE.ch=null;}
 try{LIVE.ch=sb.channel('me-'+u)
  .on('postgres_changes',{event:'INSERT',schema:'public',table:'office_messages',filter:'receiver=eq.'+u},function(p){liveMsgIn(p.new);})
  .on('postgres_changes',{event:'INSERT',schema:'public',table:'office_messages',filter:'sender=eq.'+u},function(p){liveMsgOut(p.new);})
  .on('postgres_changes',{event:'UPDATE',schema:'public',table:'office_messages',filter:'sender=eq.'+u},function(p){if(CHATother&&p.new&&p.new.receiver===CHATother)chatLoadMsgs(true);})
  .on('postgres_changes',{event:'UPDATE',schema:'public',table:'office_messages',filter:'receiver=eq.'+u},function(p){if(CHATother&&p.new&&p.new.sender===CHATother)chatLoadMsgs(true);})
  .on('postgres_changes',{event:'INSERT',schema:'public',table:'office_calls',filter:'callee=eq.'+u},function(p){callIncoming(p.new);})
  .on('postgres_changes',{event:'INSERT',schema:'public',table:'office_messages'},function(p){var m=p.new;if(m&&m.group_id&&m.sender!==u)liveGroupIn(m);})
  .on('postgres_changes',{event:'UPDATE',schema:'public',table:'office_presence'},function(p){var r=p.new;if(!r||!r.typing_to||r.user_id===u)return;if(Date.now()-new Date(r.typing_at).getTime()>8000)return;
    if(CHATother&&((CHATgroup&&r.typing_to===CHATother)||(!CHATgroup&&r.typing_to===u&&r.user_id===CHATother))){var nm='';if(CHATgroup){var mm=(CHATmsgs||[]).find(function(x){return x.sender===r.user_id&&x.from;});nm=mm?mm.from.ad:'';}chatTypingShow(nm);}})
  .on('postgres_changes',{event:'INSERT',schema:'public',table:'office_call_sig',filter:'receiver=eq.'+u},function(p){var r=p.new;if(r&&CALL&&r.call_id===CALL.id)callSigRow(r.id,r.payload);})
  .on('postgres_changes',{event:'UPDATE',schema:'public',table:'office_calls',filter:'callee=eq.'+u},function(p){callRowUpdate(p.new);})
  .on('postgres_changes',{event:'UPDATE',schema:'public',table:'office_calls',filter:'caller=eq.'+u},function(p){callRowUpdate(p.new);})
  .subscribe(function(st){LIVE.ok=(st==='SUBSCRIBED');if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'){setTimeout(liveSubscribe,5000);}});
 }catch(e){LIVE.ok=false;}
}
function livePoll(force){
 run(sb.rpc('msg_unread')).then(function(n){n=n||0;var ch=n!==LIVE.unread;var first=LIVE.unread<0;LIVE.unread=n;chatSetBadge(n);
  if((ch&&!first)||force){liveRefreshViews();}}).catch(function(){});
 if(!CALL)run(sb.rpc('call_pending')).then(function(c){if(c&&c.id&&!CALL)callIncoming(c);}).catch(function(){});
}
function liveRefreshViews(){var v=$('v-chat');if(!v||!v.classList.contains('on'))return;if(CHATother)chatLoadMsgs(true);else if($('chatThreads'))run(sb.rpc('msg_threads')).then(function(r){CHAT_THREADS=r||[];chatDrawThreads(CHAT_THREADS);}).catch(function(){});}
function chatSetBadge(n){var b=document.querySelector('#tabs button[data-v="chat"]');if(!b)return;b.innerHTML='💬 Çat'+(n>0?' <span class="tabbadge">'+n+'</span>':'');}
function liveMsgIn(m){if(!m)return;var inRoom=CHATother===m.sender&&$('v-chat')&&$('v-chat').classList.contains('on')&&document.visibilityState==='visible';
 if(inRoom){chatLoadMsgs(true);}else{var b=m.body||'',tt=(CHAT_THREADS||[]).find(function(x){return x.other===m.sender;});if(!/^(📞|🎥)/.test(b)&&!(tt&&tt.muted))chatBanner(m.sender,m.kind==='voice'?'🎤 Səsli mesaj':m.kind==='file'?'📎 '+(m.file_name||'Fayl'):m.image_url&&!b?'📷 Şəkil göndərdi':b);}
 LIVE.unread=-2;livePoll(true);}

function liveGroupIn(m){var inRoom=CHATother===m.group_id&&$('v-chat')&&$('v-chat').classList.contains('on')&&document.visibilityState==='visible';
 if(inRoom){chatLoadMsgs(true);return;}var t=(CHAT_THREADS||[]).find(function(x){return x.other===m.group_id;});
 if(!(t&&t.muted)&&m.kind!=='sys')chatWho(m.sender).then(function(p){chatBannerRaw((t?t.emoji+' '+t.ad:'Qrup'),(p.ad||'').split(' ')[0]+': '+(m.kind==='voice'?'🎤 Səsli mesaj':m.kind==='file'?'📎 Fayl':m.image_url&&!m.body?'📷 Şəkil':m.body),p,function(){show('chat');chatOpen(m.group_id,t?t.ad:'Qrup',1,t?t.emoji:'👥');});});
 LIVE.unread=-2;livePoll(true);}
function chatBannerRaw(title,text,p,go){var el=$('igBanner');if(!el){el=document.createElement('div');el.id='igBanner';document.body.appendChild(el);}
 el.innerHTML=chatAva(p.ad,p.photo,40)+'<div class="bnt"><b>'+esc(title)+'</b><span>'+esc(String(text||'').slice(0,90))+'</span></div>';
 el.onclick=function(){el.classList.remove('on');go();};el.classList.add('on');try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}chatBlip();clearTimeout(_bnT);_bnT=setTimeout(function(){el.classList.remove('on');},4500);}
function liveMsgOut(m){if(CHATother&&m&&m.receiver===CHATother)chatLoadMsgs(true);else liveRefreshViews();}
function chatWho(uid){var t=(CHAT_THREADS||[]).find(function(x){return x.other===uid;})||((window.CHAT_CONTACTS||[]).find(function(x){return x.uid===uid;}));
 if(t)return Promise.resolve({ad:t.ad,photo:t.photo,vezife:t.vezife});
 return run(sb.rpc('msg_profile',{p_uid:uid})).then(function(p){return p||{};}).catch(function(){return {};});}
var _bnT=null;
function chatBanner(uid,text){chatWho(uid).then(function(p){var el=$('igBanner');if(!el){el=document.createElement('div');el.id='igBanner';document.body.appendChild(el);}
 el.innerHTML=chatAva(p.ad,p.photo,40)+'<div class="bnt"><b>'+esc(p.ad||'Yeni mesaj')+'</b><span>'+esc(String(text||'').slice(0,90))+'</span></div>';
 el.onclick=function(){el.classList.remove('on');show('chat');CHAT_PH[uid]=p.photo||null;CHAT_SUB[uid]=p.vezife||'';chatOpen(uid,p.ad||'');};
 el.classList.add('on');try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}chatBlip();
 clearTimeout(_bnT);_bnT=setTimeout(function(){el.classList.remove('on');},4500);});}
function chatBlip(){try{var C=window._actx||(window._actx=new (window.AudioContext||window.webkitAudioContext)());var o=C.createOscillator(),g=C.createGain();o.frequency.value=880;g.gain.setValueAtTime(.0001,C.currentTime);g.gain.exponentialRampToValueAtTime(.12,C.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,C.currentTime+.25);o.connect(g);g.connect(C.destination);o.start();o.stop(C.currentTime+.26);}catch(e){}}
function liveDeepLink(){var q=new URLSearchParams(location.search),c=q.get('chat'),k=q.get('call'),gq=q.get('group'),fq=q.get('feed');
 if(fq)setTimeout(function(){show('feed');},300);
 if(gq)run(sb.rpc('grp_info',{p_group:gq})).then(function(g){if(g){show('chat');chatOpen(g.id,g.name,1,g.emoji);}}).catch(function(){});
 if(c||k||gq||fq){try{history.replaceState(history.state,'',location.pathname);}catch(e){}}
 if(c){chatWho(c).then(function(p){show('chat');CHAT_PH[c]=p.photo||null;CHAT_SUB[c]=p.vezife||'';chatOpen(c,p.ad||'');});}
 if(k){run(sb.rpc('call_get',{p_id:k})).then(function(r){if(r&&r.status==='ringing'&&r.callee===ME.user_id)callIncoming(r);}).catch(function(){});}
}



/* ===== GERİ DÜYMƏSİ: pəncərə → söhbət → bölmə → ana səhifə → "çıxmaq üçün təkrar toxun" ===== */
var _backT=0;
function backHome(){var b=document.querySelector('#tabs button');return b?b.dataset.v:'today';}
function backCur(){var b=document.querySelector('#tabs button.on');return b?b.dataset.v:backHome();}
function backAct(){ // true = idarə olundu, false = tətbiqdən çıx
 if(typeof CALL!=='undefined'&&CALL)return true;
 if(typeof chatCtxClose==='function'&&chatCtxClose())return true;
 var md=$('modal');if(md&&md.classList.contains('on')){closeModal();return true;}

 if(typeof CHAT_SEL!=='undefined'&&CHAT_SEL){chatSelEnd();return true;}
 if(typeof CHATother!=='undefined'&&CHATother){chatBack();return true;}
 if(backCur()!==backHome()){show(backHome());try{window.scrollTo(0,0);}catch(e){}return true;}
 if(Date.now()-_backT<2000)return false;
 _backT=Date.now();toast('Çıxmaq üçün təkrar toxun');return true;}
function backInit(){
 if(isNative()){try{var A=window.Capacitor.Plugins.App;if(A&&A.addListener){A.addListener('backButton',function(){if(!backAct()){try{A.exitApp();}catch(e){}}});return;}}catch(e){}}
 try{history.replaceState({bo:0},'');history.pushState({bo:1},'');}catch(e){}
 window.addEventListener('popstate',function(){if(backAct()){try{history.pushState({bo:1},'');}catch(e){}}else{try{history.back();}catch(e){}}});
}

/* ---------- ONLAYN STATUS ---------- */
var _presT=null,_presPing=null;
function presPing(on){try{sb.rpc('msg_ping',{p_online:!!on}).then(function(){},function(){});}catch(e){}}
function presInit(){presPing(document.visibilityState==='visible');
 _presPing=setInterval(function(){if(document.visibilityState==='visible')presPing(true);},40000);
 document.addEventListener('visibilitychange',function(){presPing(document.visibilityState==='visible');if(document.visibilityState==='visible')presRefresh();});
 window.addEventListener('pagehide',function(){presPing(false);});
 _presT=setInterval(function(){var v=$('v-chat');if(document.visibilityState==='visible'&&v&&v.classList.contains('on'))presRefresh();},30000);}
function presRefresh(){var ids={};if(ME&&ME.user_id)ids[ME.user_id]=1;(CHAT_THREADS||[]).forEach(function(t){if(!t.is_group)ids[t.other]=1;});(window.CHAT_CONTACTS||[]).forEach(function(c){ids[c.uid]=1;});if(CHATother&&!CHATgroup)ids[CHATother]=1;
 var arr=Object.keys(ids);if(!arr.length)return;
 run(sb.rpc('msg_presence',{p_uids:arr})).then(function(m){PRES=m||{};presApply();if($('igTop')&&!CHAT_SEL&&!CHATother){chatTopBar();var th=$('chatThreads');if(th&&CHAT_THREADS.length)chatDrawThreads(CHAT_THREADS);}}).catch(function(){});}
function presText(uid){var p=PRES[uid];if(!p||!p.seen)return '';if(p.on)return 'Aktivdir';
 var s=(Date.now()-new Date(p.seen).getTime())/1000;if(s<3600)return Math.max(1,Math.floor(s/60))+' dəq əvvəl aktiv idi';if(s<86400)return Math.floor(s/3600)+' saat əvvəl aktiv idi';if(s<7*86400)return Math.floor(s/86400)+' gün əvvəl aktiv idi';return '';}
function presApply(){document.querySelectorAll('[data-pu]').forEach(function(el){var p=PRES[el.getAttribute('data-pu')];var d=el.querySelector('.igon');if(d)d.classList.toggle('on',!!(p&&p.on));});
 var sub=$('igSub');if(sub&&CHATother&&!CHATgroup){var t=presText(CHATother);sub.textContent=t||CHAT_SUB[CHATother]||'';sub.classList.toggle('live',t==='Aktivdir');}}

/* ---------- ZƏNG ---------- */
var CALL=null,_ICE=null,_ICEt=0;
function callIce(){if(_ICE&&Date.now()-_ICEt<3000000)return Promise.resolve(_ICE);
 return sb.functions.invoke('call-ice',{body:{}}).then(function(r){window._ICEturn=!!(r&&r.data&&r.data.turn);var s=(r&&r.data&&r.data.iceServers)||[{urls:['stun:stun.cloudflare.com:3478','stun:stun.l.google.com:19302']}];_ICE=s;_ICEt=Date.now();return s;}).catch(function(){return [{urls:['stun:stun.l.google.com:19302']}];});}
function callMedia(kind,facing){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return Promise.reject(new Error('Bu cihaz zəngi dəstəkləmir'));
 return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:kind==='video'?{facingMode:facing||'user',width:{ideal:720},height:{ideal:1280}}:false});}
function callErrMsg(e){var n=e&&e.name;if(n==='NotAllowedError'||n==='SecurityError')return 'Mikrofon/kamera icazəsi verilməyib. Brauzer ayarlarından icazə verin.';if(n==='NotFoundError')return 'Mikrofon və ya kamera tapılmadı';return (e&&e.message)||'Zəng alınmadı';}
function callStart(kind){if(CALL){toast('Artıq zəngdəsiniz');return;}if(!CHATother)return;var peer=CHATother,name=CHATname,photo=CHAT_PH[peer];
 CALL={role:'caller',peer:peer,name:name,photo:photo,kind:kind,ice:[],state:'out',facing:'user'};callUI();callSetStatus('Zəng edilir…');callTone('back');
 callMedia(kind).then(function(st){if(!CALL)return st.getTracks().forEach(function(t){t.stop();});CALL.local=st;callAttachLocal();
  return run(sb.rpc('call_start',{p_callee:peer,p_kind:kind}));
 }).then(function(r){if(!CALL||!r)return;if(r.busy){callSetStatus('Məşğuldur');callTone(null);setTimeout(function(){callCleanup();},2200);return;}
  CALL.id=r.id;callJoin();CALL.ringT=setTimeout(function(){if(CALL&&CALL.state==='out'){callSetStatus('Cavab yoxdur');run(sb.rpc('call_set',{p_id:CALL.id,p_status:'missed'})).catch(function(){});setTimeout(callCleanup,1500);}},40000);
 }).catch(function(e){toast(callErrMsg(e));callCleanup();});
}
function callIncoming(c){if(!c||c.status!=='ringing'||c.callee!==ME.user_id)return;if(CALL){if(CALL.id===c.id)return;return;}
 if(Date.now()-new Date(c.created_at).getTime()>55000)return;
 CALL={role:'callee',id:c.id,peer:c.caller,kind:c.kind,ice:[],state:'in',name:c.ad||'',photo:c.photo||null,facing:'user'};callUI();callSetStatus(c.kind==='video'?'Video zəng…':'Səsli zəng…');callTone('ring');
 try{navigator.vibrate&&navigator.vibrate([400,200,400,200,400,200,400,200,400]);}catch(e){}
 if(!c.ad)chatWho(c.caller).then(function(p){if(!CALL||CALL.id!==c.id)return;CALL.name=p.ad||'';CALL.photo=p.photo||null;callUI(true);});
 CALL.ringT=setTimeout(function(){if(CALL&&CALL.state==='in')callCleanup();},45000);
}
function callAccept(){if(!CALL||CALL.state!=='in')return;CALL.state='conn';callTone(null);try{navigator.vibrate&&navigator.vibrate(0);}catch(e){}clearTimeout(CALL.ringT);callSetStatus('Qoşulur…');callUI(true);
 callMedia(CALL.kind).then(function(st){if(!CALL)return st.getTracks().forEach(function(t){t.stop();});CALL.local=st;callAttachLocal();return run(sb.rpc('call_set',{p_id:CALL.id,p_status:'accepted'}));
 }).then(function(r){if(!CALL)return;if(r&&r.status!=='accepted'){callSetStatus('Zəng bitib');setTimeout(callCleanup,1200);return;}callJoin();
 }).catch(function(e){toast(callErrMsg(e));callHang();});
}
function callDecline(){if(!CALL)return;var id=CALL.id;run(sb.rpc('call_set',{p_id:id,p_status:'declined'})).catch(function(){});callSend({t:'bye'});callCleanup();}
function callHang(){if(!CALL)return;var id=CALL.id;if(CALL.state!=='live')callDiag();callSend({t:'bye'});if(id)run(sb.rpc('call_set',{p_id:id,p_status:'ended'})).then(function(){if(CHATother)chatLoadMsgs(true);}).catch(function(){});callSetStatus('Zəng bitdi');setTimeout(callCleanup,600);}
function callRowUpdate(r){if(!CALL||!r||r.id!==CALL.id)return;
 if(r.status==='accepted'&&CALL.role==='caller'&&CALL.state==='out'){CALL.state='conn';callTone(null);clearTimeout(CALL.ringT);callSetStatus('Qoşulur…');callUI(true);}
 if(['declined','missed','cancelled','ended','busy'].indexOf(r.status)>=0){callSetStatus(r.status==='declined'?'Rədd edildi':r.status==='cancelled'?'Zəng ləğv edildi':r.status==='missed'?'Cavab yoxdur':'Zəng bitdi');callTone(null);setTimeout(callCleanup,1200);}
}
function callJoin(){if(!CALL)return;CALL.seen={};CALL.dg=CALL.dg||{lc:{},rc:{},st:[],sig:0};
 var poll=function(){if(!CALL||!CALL.id)return;var id=CALL.id;run(sb.rpc('call_sig_get',{p_call:id,p_after:0})).then(function(rows){(rows||[]).forEach(function(r){if(CALL&&CALL.id===id)callSigRow(r.id,r.payload);});}).catch(function(){}).then(function(){if(CALL&&CALL.id===id)CALL.sigT=setTimeout(poll,CALL.state==='live'?3000:800);});};
 poll();
 if(CALL.role==='callee'){var n=0;var f=function(){if(!CALL||CALL.gotOffer||n++>15)return;callSend({t:'ready'});CALL.readyT=setTimeout(f,2000);};f();}
 CALL.connT=setTimeout(function(){if(CALL&&CALL.state!=='live'){callDiag();toast(CALL.gotOffer||CALL.offered?'Bağlantı qurulmadı: mobil şəbəkə birbaşa əlaqəni bloklayır (TURN lazımdır)':'Qarşı tərəflə siqnal alınmadı');callHang();}},30000);
}
function callSigRow(id,payload){if(!CALL)return;CALL.seen=CALL.seen||{};if(CALL.seen[id])return;CALL.seen[id]=1;CALL.dg&&CALL.dg.sig++;callSig(payload||{});}
function callSend(o){if(!CALL||!CALL.id)return Promise.resolve();return run(sb.rpc('call_sig',{p_call:CALL.id,p_payload:o})).catch(function(){});}
function callDiag(){if(!CALL||!CALL.id||!CALL.dg)return;var d=CALL.dg;d.turn=!!window._ICEturn;d.pc=CALL.pc&&CALL.pc.connectionState;d.ice=CALL.pc&&CALL.pc.iceConnectionState;d.ua=navigator.userAgent.slice(0,120);run(sb.rpc('call_diag',{p_id:CALL.id,p_data:d})).catch(function(){});}
function callPC(){return callIce().then(function(ice){if(!CALL)return null;if(CALL.pc)return CALL.pc;var pc=new RTCPeerConnection({iceServers:ice});CALL.pc=pc;
 (CALL.local?CALL.local.getTracks():[]).forEach(function(t){pc.addTrack(t,CALL.local);});
 pc.onicecandidate=function(e){if(e.candidate){var m=/ typ (\w+)/.exec(e.candidate.candidate||'');if(m&&CALL&&CALL.dg)CALL.dg.lc[m[1]]=(CALL.dg.lc[m[1]]||0)+1;callSend({t:'ice',c:e.candidate.toJSON?e.candidate.toJSON():e.candidate});}};
 pc.ontrack=function(e){var s=e.streams&&e.streams[0];if(!s){s=CALL.remote||new MediaStream();s.addTrack(e.track);}CALL.remote=s;callAttachRemote();};
 pc.onconnectionstatechange=function(){if(!CALL)return;var s=pc.connectionState;if(CALL.dg)CALL.dg.st.push(s);
  if(s==='connected'){clearTimeout(CALL.dropT);clearTimeout(CALL.connT);callDiag();if(!CALL.t0){CALL.t0=Date.now();CALL.tick=setInterval(callTick,1000);}callTick();CALL.state='live';callUI(true);}
  else if(s==='disconnected'){callSetStatus('Yenidən qoşulur…');clearTimeout(CALL.dropT);CALL.dropT=setTimeout(function(){if(CALL&&pc.connectionState!=='connected')callHang();},10000);}
  else if(s==='failed'){callDiag();toast('Bağlantı qurulmadı: mobil şəbəkə birbaşa əlaqəni bloklayır (TURN lazımdır)');callHang();}};
 return pc;});}
function callFlushIce(){var pc=CALL&&CALL.pc;if(!pc||!pc.remoteDescription)return;var q=CALL.ice;CALL.ice=[];q.forEach(function(c){pc.addIceCandidate(c).catch(function(){});});}
function callSig(m){if(!CALL)return;
 if(m.t==='ready'&&CALL.role==='caller'){if(CALL.offered)return;CALL.offered=true;CALL.state='conn';callTone(null);clearTimeout(CALL.ringT);callSetStatus('Qoşulur…');callUI(true);
  callPC().then(function(pc){if(!pc)return;return pc.createOffer().then(function(o){return pc.setLocalDescription(o);}).then(function(){callSetStatus('Bağlantı qurulur…');callSend({t:'offer',sdp:{type:pc.localDescription.type,sdp:pc.localDescription.sdp}});});}).catch(function(e){toast('Zəng xətası');callHang();});}
 else if(m.t==='offer'&&CALL.role==='callee'){if(CALL.gotOffer)return;CALL.gotOffer=true;clearTimeout(CALL.readyT);
  callPC().then(function(pc){if(!pc)return;return pc.setRemoteDescription(m.sdp).then(function(){callFlushIce();return pc.createAnswer();}).then(function(a){return pc.setLocalDescription(a);}).then(function(){callSetStatus('Bağlantı qurulur…');callSend({t:'answer',sdp:{type:pc.localDescription.type,sdp:pc.localDescription.sdp}});});}).catch(function(){toast('Zəng xətası');callHang();});}
 else if(m.t==='answer'&&CALL.role==='caller'){var pc=CALL.pc;if(pc&&pc.signalingState==='have-local-offer')pc.setRemoteDescription(m.sdp).then(callFlushIce).catch(function(){});}
 else if(m.t==='ice'&&m.c){var mm=/ typ (\w+)/.exec(m.c.candidate||'');if(mm&&CALL.dg)CALL.dg.rc[mm[1]]=(CALL.dg.rc[mm[1]]||0)+1;CALL.ice.push(m.c);callFlushIce();}
 else if(m.t==='bye'){callSetStatus('Zəng bitdi');callTone(null);setTimeout(callCleanup,800);}
 else if(m.t==='cam'){CALL.remoteCamOff=!m.on;callUI(true);}
}
function callTick(){if(!CALL||!CALL.t0)return;var s=Math.floor((Date.now()-CALL.t0)/1000);callSetStatus(Math.floor(s/60)+':'+String(s%60).padStart(2,'0'));}
function callCleanup(){if(!CALL)return;var c=CALL;CALL=null;try{var NA=callNA();NA&&NA.stop().catch(function(){});}catch(e){}callTone(null);try{navigator.vibrate&&navigator.vibrate(0);}catch(e){}
 clearTimeout(c.ringT);clearTimeout(c.readyT);clearTimeout(c.dropT);clearTimeout(c.sigT);clearTimeout(c.connT);clearInterval(c.tick);
 try{c.local&&c.local.getTracks().forEach(function(t){t.stop();});}catch(e){}try{c.pc&&c.pc.close();}catch(e){}
 var el=$('callUI');if(el)el.remove();document.body.classList.remove('incall');if(CHATother)setTimeout(function(){chatLoadMsgs(true);},700);}
function callSetStatus(t){if(CALL)CALL.status=t;var e=$('callSt');if(e)e.textContent=t;}
function callAttachLocal(){var v=$('callLocal');if(v&&CALL&&CALL.local){v.srcObject=CALL.local;v.muted=true;v.play&&v.play().catch(function(){});}}
function callAttachRemote(){if(!CALL||!CALL.remote)return;var a=$('callAudio');if(a){a.srcObject=CALL.remote;callApplySink(a);a.play&&a.play().catch(function(){});}var v=$('callRemote');if(v){v.srcObject=CALL.remote;v.play&&v.play().catch(function(){});}}
var CI={
 spk:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
 mic:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
 micoff:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 9v2a3 3 0 0 0 5 2.2M15 10V6a3 3 0 0 0-5.7-1.3M5 11a7 7 0 0 0 11.5 5.3M19 11a7 7 0 0 1-.6 2.8M12 18v3M3 3l18 18"/></svg>',
 cam:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></svg>',
 camoff:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M16 16v1a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2M11 6h4a1 1 0 0 1 1 1v3l5-3v10M3 3l18 18"/></svg>',
 flip:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><path d="M9 13a3 3 0 0 1 5-2.2M15 13a3 3 0 0 1-5 2.2M14 9v2h-2M10 17v-2h2"/></svg>',
 end:'<svg viewBox="0 0 24 24" width="30" height="30" fill="#fff"><path d="M12 9c-2.6 0-5 .6-7.2 1.8-.8.4-1.2 1.3-1 2.2l.4 1.7c.2.8 1 1.3 1.8 1.1l2.7-.6c.7-.2 1.2-.8 1.2-1.5v-1.5c1.4-.4 2.8-.4 4.2 0v1.5c0 .7.5 1.3 1.2 1.5l2.7.6c.8.2 1.6-.3 1.8-1.1l.4-1.7c.2-.9-.2-1.8-1-2.2C17 9.6 14.6 9 12 9z"/></svg>',
 acc:'<svg viewBox="0 0 24 24" width="30" height="30" fill="#fff"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
 vacc:'<svg viewBox="0 0 24 24" width="30" height="30" fill="#fff"><path d="M4 6h11a2 2 0 0 1 2 2v1.5l4-2.5v10l-4-2.5V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/></svg>'
};
function callUI(re){if(!CALL)return;var el=$('callUI');if(!el){el=document.createElement('div');el.id='callUI';document.body.appendChild(el);}
 document.body.classList.add('incall');var c=CALL,vid=c.kind==='video',live=c.state==='live'||c.state==='conn';
 var big=chatAva(c.name,c.photo,112);
 var h='<div class="cbg">'+(c.photo?'<img src="'+AVA_BASE+esc(c.photo)+'">':'')+'</div>';
 if(vid)h+='<video id="callRemote" class="crem'+(c.state==='live'&&!c.remoteCamOff?' on':'')+'" autoplay playsinline muted></video><video id="callLocal" class="cloc'+(c.state==='in'?' full':'')+(c.camOff?' off':'')+'" autoplay playsinline muted></video>';
 h+='<audio id="callAudio" autoplay playsinline></audio>';
 h+='<div class="ctop'+(vid&&c.state==='live'&&!c.remoteCamOff?' mini':'')+'">'+big+'<div class="cname">'+esc(c.name||'')+'</div><div class="cst" id="callSt">'+esc(c.status||'')+'</div></div>';
 if(c.state==='in'){h+='<div class="cbtns in"><div><button class="cb red" onclick="callDecline()">'+CI.end+'</button><span>Rədd et</span></div><div><button class="cb green pulse" onclick="callAccept()">'+(vid?CI.vacc:CI.acc)+'</button><span>Qəbul et</span></div></div>';}
 else{h+='<div class="cbtns">'
  +'<button class="cb glass'+(c.speaker?' act':'')+'" onclick="callSpeaker()" title="Dinamik">'+CI.spk+'</button>'
  +'<button class="cb glass'+(c.muted?' act':'')+'" onclick="callMute()">'+(c.muted?CI.micoff:CI.mic)+'</button>'
  +(vid?'<button class="cb glass'+(c.camOff?' act':'')+'" onclick="callCam()">'+(c.camOff?CI.camoff:CI.cam)+'</button><button class="cb glass" onclick="callFlip()">'+CI.flip+'</button>':'')
  +'<button class="cb red" onclick="callHang()">'+CI.end+'</button></div>';}
 el.className=vid?'video':'audio';el.innerHTML=h;callAttachLocal();callAttachRemote();
}

/* səs çıxışı: səsli zəngdə qulaqlıq (earpiece), videoda dinamik */
function callOuts(){if(!navigator.mediaDevices||!navigator.mediaDevices.enumerateDevices)return Promise.resolve([]);return navigator.mediaDevices.enumerateDevices().then(function(d){return d.filter(function(x){return x.kind==='audiooutput';});}).catch(function(){return [];});}
function callPickSink(outs,speaker){var ear=/earpiece|receiver|handset|phone|qulaq|telefon/i,spk=/speaker|dinamik|hoparl|loud/i;
 var f=outs.find(function(o){return (speaker?spk:ear).test(o.label||'');});if(f)return f.deviceId;
 if(!speaker){var nd=outs.find(function(o){return o.deviceId!=='default'&&!spk.test(o.label||'')&&!/bluetooth|headset|usb|wired/i.test(o.label||'');});return nd?nd.deviceId:null;}
 return 'default';}
function callNA(){try{var C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return null;return (C.Plugins&&C.Plugins.CallAudio)||null;}catch(e){return null;}}
function callNativeRoute(){var P=callNA();if(!P||!CALL)return false;if(CALL.speaker==null)CALL.speaker=(CALL.kind==='video');try{P.start({speaker:!!CALL.speaker}).catch(function(){});}catch(e){}return true;}
function callApplySink(a){if(callNativeRoute())return;if(!CALL||!a||typeof a.setSinkId!=='function')return;if(CALL.speaker==null)CALL.speaker=(CALL.kind==='video');
 callOuts().then(function(outs){if(!CALL)return;CALL.outs=outs;var id=callPickSink(outs,CALL.speaker);if(id&&a.sinkId!==id)a.setSinkId(id).catch(function(){});});}
function callSpeaker(){if(!CALL)return;if(callNA()){CALL.speaker=!CALL.speaker;callNativeRoute();toast(CALL.speaker?'🔊 Dinamik':'📱 Qulaqlıq');callUI(true);return;}var a=$('callAudio');
 if(!a||typeof a.setSinkId!=='function'){toast('Brauzerdə qulaqlıq seçimi yoxdur — Baş Ofis tətbiqində (APK) işləyir');return;}
 CALL.speaker=!CALL.speaker;callOuts().then(function(outs){var id=callPickSink(outs,CALL.speaker);
  if(!id||outs.length<2){CALL.speaker=!CALL.speaker;toast('Brauzerdə qulaqlıq seçimi yoxdur — Baş Ofis tətbiqində (APK) işləyir');callUI(true);return;}
  a.setSinkId(id).then(function(){toast(CALL.speaker?'🔊 Dinamik':'📱 Qulaqlıq');}).catch(function(){toast('Səs çıxışı dəyişmədi');});callUI(true);});}
function callMute(){if(!CALL||!CALL.local)return;CALL.muted=!CALL.muted;CALL.local.getAudioTracks().forEach(function(t){t.enabled=!CALL.muted;});callUI(true);}
function callCam(){if(!CALL||!CALL.local)return;CALL.camOff=!CALL.camOff;CALL.local.getVideoTracks().forEach(function(t){t.enabled=!CALL.camOff;});callSend({t:'cam',on:!CALL.camOff});callUI(true);}
function callFlip(){if(!CALL||CALL.kind!=='video'||!CALL.local)return;var f=CALL.facing==='user'?'environment':'user';
 navigator.mediaDevices.getUserMedia({video:{facingMode:f}}).then(function(s){var nt=s.getVideoTracks()[0];if(!CALL){nt.stop();return;}var old=CALL.local.getVideoTracks()[0];
  if(CALL.pc){var snd=CALL.pc.getSenders().find(function(x){return x.track&&x.track.kind==='video';});if(snd)snd.replaceTrack(nt);}
  if(old){CALL.local.removeTrack(old);old.stop();}CALL.local.addTrack(nt);CALL.facing=f;callAttachLocal();}).catch(function(){toast('Kamera dəyişmədi');});}
var _tone=null;
function callTone(kind){try{if(_tone){clearInterval(_tone.i);try{_tone.o.stop();}catch(e){}_tone=null;}if(!kind)return;
 var C=window._actx||(window._actx=new (window.AudioContext||window.webkitAudioContext)());if(C.state==='suspended')C.resume();
 var g=C.createGain();g.gain.value=0;g.connect(C.destination);var o=C.createOscillator();o.frequency.value=kind==='ring'?660:425;o.connect(g);o.start();
 var beat=function(){var t=C.currentTime;if(kind==='ring'){[0,.45].forEach(function(d){g.gain.setValueAtTime(.18,t+d);g.gain.setValueAtTime(0,t+d+.35);});o.frequency.setValueAtTime(660,t);o.frequency.setValueAtTime(880,t+.45);}else{g.gain.setValueAtTime(.08,t);g.gain.setValueAtTime(0,t+1);}};
 beat();_tone={o:o,i:setInterval(beat,kind==='ring'?2000:3500)};}catch(e){}}

/* uzun basma / sağ klik → menyu */
var _chatHold=null;
function chatCancelReply(){CHATreply=null;$('chatReplyBar').innerHTML='';}
function chatPickImage(){var f=$('chatFile');if(f){f.value='';f.click();}}
function chatViewImage(url){modal('<div class="mhead"><h3>Şəkil</h3><button class="x" onclick="closeModal()">×</button></div><img src="'+esc(url)+'" style="width:100%;border-radius:12px"><a href="'+esc(url)+'" target="_blank" class="btn ghost" style="width:100%;margin-top:8px;text-align:center;display:block">Tam ölçüdə aç</a>');}
function chatProfile(){run(sb.rpc('msg_profile',{p_uid:CHATother})).then(function(p){p=p||{};
 var html='<div class="mhead"><h3>Profil</h3><button class="x" onclick="closeModal()">×</button></div>'
  +'<div style="text-align:center;padding:10px 0"><div style="display:flex;justify-content:center;margin-bottom:12px">'+chatAva(p.ad||CHATname,p.photo,88)+'</div><h3 style="margin:0">'+esc(p.ad||CHATname)+'</h3><div class="muted">'+esc(p.vezife||'')+'</div></div>'
  +'<div class="card" style="margin-top:10px">'
  +(p.sobe?'<div class="row sp" style="padding:7px 0"><span class="muted">Şöbə</span><b>'+esc(p.sobe)+'</b></div>':'')
  +(p.telefon?'<div class="row sp" style="padding:7px 0;border-top:1px solid var(--line)"><span class="muted">Telefon</span><a href="tel:'+esc(p.telefon)+'">'+esc(p.telefon)+'</a></div>':'')
  +(p.rehber?'<div class="row sp" style="padding:7px 0;border-top:1px solid var(--line)"><span class="muted">Rəhbər</span><b>'+esc(p.rehber)+'</b></div>':'')
  +(p.ad_gunu?'<div class="row sp" style="padding:7px 0;border-top:1px solid var(--line)"><span class="muted">Ad günü</span><b>'+esc(p.ad_gunu)+'</b></div>':'')
  +'</div>';
 modal(html);
}).catch(err);}
function chatSubscribe(){/* qlobal canlı qat (chatGlobalInit) idarə edir */}
function chatUpdateBadge(){if(typeof livePoll==='function')livePoll();}


/* ---------- 🔔 Xatırlatma bölməsi ---------- */
var RMTMPL=[],RMFORGOT=[];
function renderRemind(){var v=$('v-remind');if(!v)return;
 v.innerHTML='<div class="row sp" style="margin-bottom:12px"><h2 class="bossh" style="margin:0">🔔 Xatırlat</h2><button class="btn ghost sm" onclick="rmTemplates()">⚙️ Şablonlar</button></div>'
  +'<p class="muted small" style="margin:0 0 14px">Sistemdə bir işi tamamlamağı unudan işçilər. Yanındakı düymə ilə xatırlatma göndərin.</p>'
  +'<div id="rmList"><p class="status"><span class="spin"></span>Yoxlanılır…</p></div>';
 Promise.all([run(sb.rpc('office_forgot_list')),run(sb.from('office_remind_templates').select('*').order('sort'))])
  .then(function(r){RMFORGOT=r[0]||[];RMTMPL=r[1]||[];rmDraw();}).catch(err);
}
function rmIco(n){return {cixis:'🚪',gelis:'🌅',colde:'🚶',plan:'📋',push:'🔕'}[n]||'⚠️';}
function rmDraw(){var el=$('rmList');if(!el)return;
 if(!RMFORGOT.length){el.innerHTML='<div class="card" style="text-align:center;padding:24px;color:var(--ok)">✓ Hər kəs hər şeyi tamamlayıb. Xatırladılacaq heç nə yoxdur.</div>';return;}
 // növə görə qrupla
 var groups={};RMFORGOT.forEach(function(f){(groups[f.nov]=groups[f.nov]||[]).push(f);});
 var lbl={cixis:'Çıxışı qeyd etməyənlər',gelis:'Gəlməyənlər',colde:'Qısa çıxışdan qayıtmayanlar',plan:'Aylıq plan verməyənlər',push:'Bildirişi aktiv etməyənlər'};
 var html='';
 Object.keys(groups).forEach(function(nov){var arr=groups[nov];
  html+='<div class="card" style="margin-bottom:12px"><div class="row sp" style="margin-bottom:8px"><b>'+rmIco(nov)+' '+(lbl[nov]||nov)+'</b><span class="muted small">'+arr.length+' nəfər</span></div>';
  arr.forEach(function(f){
   html+='<div class="row sp" style="padding:9px 0;border-top:1px solid var(--line)"><div><b>'+esc(f.ad)+'</b>'+(f.detal?'<div class="muted small">'+esc(f.detal)+'</div>':'')+'</div>'
    +'<button class="btn sm" onclick="rmPick('+f.emp_id+',\''+nov+'\',\''+esc(f.ad).replace(/'/g,"\\'")+'\')">Xatırlat</button></div>';
  });
  // qrupa toplu göndər
  if(arr.length>1)html+='<button class="btn ghost sm" style="width:100%;margin-top:8px" onclick="rmPickBulk(\''+nov+'\')">Hamısına ('+arr.length+') xatırlat</button>';
  html+='</div>';
 });
 el.innerHTML=html;
}
function rmPick(empId,nov,ad){
 // uyğun şablonları göstər (bu növə aid + custom)
 var opts=RMTMPL.filter(function(t){return t.kind===nov||t.kind==='custom';});
 if(!opts.length)opts=RMTMPL;
 var html='<div class="mhead"><h3>'+esc(ad)+'-ə xatırlatma</h3><button class="x" onclick="closeModal()">×</button></div>'
  +'<p class="muted small" style="margin-bottom:10px">Şablon seçin və ya öz mesajınızı yazın:</p><div id="rmOpts">'
  +opts.map(function(t,i){return '<div class="card rmopt" style="cursor:pointer;margin-bottom:6px;padding:11px" onclick="rmSend('+empId+',this,\''+esc(t.title).replace(/'/g,"\\'")+'\')" data-body="'+esc(t.body)+'"><b>'+esc(t.title)+'</b><div class="muted small">'+esc(t.body)+'</div></div>';}).join('')
  +'</div><div style="margin-top:10px"><textarea id="rmCustom" rows="3" placeholder="Öz mesajınızı yazın…" style="width:100%;padding:11px;border:1px solid var(--line);border-radius:12px"></textarea>'
  +'<button class="btn" style="width:100%;margin-top:8px" onclick="rmSendCustom('+empId+')">Öz mesajımı göndər</button></div>';
 modal(html);
}
function rmSend(empId,elOrBody,title){var body=typeof elOrBody==='string'?elOrBody:elOrBody.getAttribute('data-body');
 run(sb.rpc('office_remind_send',{p_emp_id:empId,p_title:'🔔 '+title,p_body:body})).then(function(){closeModal();toast('Xatırlatma göndərildi ✅');}).catch(function(e){toast('Xəta: '+(e.message||e));});}
function rmSendCustom(empId){var t=$('rmCustom').value.trim();if(!t){toast('Mesaj yazın');return;}
 run(sb.rpc('office_remind_send',{p_emp_id:empId,p_title:'🔔 Xatırlatma',p_body:t})).then(function(){closeModal();toast('Göndərildi ✅');}).catch(function(e){toast(e.message);});}
function rmPickBulk(nov){var arr=RMFORGOT.filter(function(f){return f.nov===nov;});
 var opts=RMTMPL.filter(function(t){return t.kind===nov||t.kind==='custom';});if(!opts.length)opts=RMTMPL;
 var html='<div class="mhead"><h3>'+arr.length+' nəfərə xatırlatma</h3><button class="x" onclick="closeModal()">×</button></div>'
  +'<p class="muted small" style="margin-bottom:10px">'+arr.map(function(f){return esc(f.ad);}).join(', ')+'</p><div>'
  +opts.map(function(t){return '<div class="card rmopt" style="cursor:pointer;margin-bottom:6px;padding:11px" onclick="rmSendBulk(\''+nov+'\',\''+esc(t.title).replace(/'/g,"\\'")+'\',this)" data-body="'+esc(t.body)+'"><b>'+esc(t.title)+'</b><div class="muted small">'+esc(t.body)+'</div></div>';}).join('')
  +'</div>';
 modal(html);
}
function rmSendBulk(nov,title,el){var body=el.getAttribute('data-body');var arr=RMFORGOT.filter(function(f){return f.nov===nov;});
 var p=arr.map(function(f){return sb.rpc('office_remind_send',{p_emp_id:f.emp_id,p_title:'🔔 '+title,p_body:body}).catch(function(){});});
 Promise.all(p).then(function(){closeModal();toast(arr.length+' nəfərə göndərildi ✅');});}
/* şablon idarəetməsi */
function rmTemplates(){
 var html='<div class="mhead"><h3>Şablonlar</h3><button class="x" onclick="closeModal()">×</button></div>'
  +'<div id="rmTList">'+RMTMPL.map(function(t){return '<div class="card" style="margin-bottom:6px;padding:10px"><div class="row sp"><b>'+esc(t.title)+'</b>'+(t.builtin?'<span class="pill p-mut">hazır</span>':'<button class="x" onclick="rmDelTmpl('+t.id+')">×</button>')+'</div><div class="muted small">'+esc(t.body)+'</div></div>';}).join('')+'</div>'
  +'<div class="card" style="margin-top:10px;padding:12px"><b>Yeni şablon</b>'
  +'<input id="ntTitle" placeholder="Qısa ad (məs: Hesabatı təqdim et)" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;margin:8px 0">'
  +'<textarea id="ntBody" rows="3" placeholder="Mesaj mətni…" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px"></textarea>'
  +'<button class="btn" style="width:100%;margin-top:8px" onclick="rmAddTmpl()">+ Əlavə et</button></div>';
 modal(html);
}
function rmAddTmpl(){var t=$('ntTitle').value.trim(),b=$('ntBody').value.trim();if(!t||!b){toast('Ad və mətn yazın');return;}
 run(sb.from('office_remind_templates').insert({title:t,body:b,kind:'custom',builtin:false})).then(function(){
  run(sb.from('office_remind_templates').select('*').order('sort')).then(function(r){RMTMPL=r||[];rmTemplates();toast('Əlavə olundu ✅');});
 }).catch(function(e){toast(e.message);});}
function rmDelTmpl(id){if(!confirm('Şablon silinsin?'))return;run(sb.from('office_remind_templates').delete().eq('id',id)).then(function(){
  run(sb.from('office_remind_templates').select('*').order('sort')).then(function(r){RMTMPL=r||[];rmTemplates();});});}

function renderOProfil(){var v=$('v-oprofil');if(!v)return;var nm=(ME&&ME.full_name)||'Sahibkar';var em=(ME&&ME.email)||'';
 var ini=nm.split(' ').map(function(w){return w[0]||'';}).slice(0,2).join('').toUpperCase();
 v.innerHTML=''
  +'<div class="card oprof-head"><div class="oprof-av">'+esc(ini)+'</div><div><h2 style="margin:0;font-family:var(--serif);font-size:1.5rem">'+esc(nm)+'</h2><div class="muted">Sahibkar · Baş Ofis</div>'+(em?'<div class="muted small">'+esc(em)+'</div>':'')+'</div></div>'
  +'<div class="card"><h3 class="oprof-h">🔔 Bildirişlər</h3><p class="muted small" style="margin:0 0 10px">Xatırlatmalar telefonunuza gəlsin deyə bildirişləri aktiv edin.</p><div id="oprofPush"><button class="btn" onclick="enablePush&&enablePush()">🔔 Bildirişləri aktiv et</button></div></div>'
  +'<div class="card"><h3 class="oprof-h">⚡ Sürətli keçidlər</h3><div class="oprof-links">'
  +'<a class="oprof-lnk" href="#" onclick="show(\'boss\');return false">📊 Nəzarət</a>'
  +'<a class="oprof-lnk" href="#" onclick="show(\'asst\');return false">🎯 AI Köməkçi</a>'
  +'<a class="oprof-lnk" href="https://luxresidence.az/komendant" target="_blank">🏢 Komendantlıq</a>'
  +'<a class="oprof-lnk" href="https://luxresidence.az/nezaret" target="_blank">🖥 Nəzarət sistemi</a>'
  +'<a class="oprof-lnk" href="https://techizat.pilothayat.az" target="_blank">📦 Təchizat</a>'
  +'<a class="oprof-lnk" href="https://luxresidence.az/satis" target="_blank">🏗 Satış lövhəsi</a>'
  +'</div></div>'
  +'<div class="card"><button class="btn ghost" style="width:100%;color:var(--bad);border-color:var(--bad)" onclick="(window.doLogout||function(){location.reload()})()">Çıxış</button></div>';
 if(typeof renderPushCard==='function'){try{renderPushCard($('oprofPush'));}catch(e){}}
}

function renderAsst(){var v=$('v-asst');if(!v)return;var nm=(ME&&ME.full_name)?ME.full_name:'';
 v.innerHTML=''
 +'<div class="ast-wrap">'
 +' <button class="ast-back" onclick="show(\'boss\')">‹ Nəzarətə qayıt</button>'
 +' <div class="ast-hero"><div class="ast-hero-ic">🎯</div><div><div class="ast-hi">'+asstHi()+(nm?', '+esc(nm):'')+'</div><h2 class="ast-title">AI Köməkçiniz</h2><div class="ast-sub">Mən sizin süni intellekt köməkçinizəm. Hansı tapşırığınız varsa, buyurun.</div></div>'
 +'  <div class="ast-heroctl"><button class="ast-gear" onclick="asstClear()" title="Söhbəti təmizlə">🗑</button><button class="ast-gear" onclick="asstSettings()" title="Ayarlar">⚙️</button></div></div>'
 +' <div class="ast-seg"><button class="'+(ASview==="chat"?"on":"")+'" onclick="asstView(\'chat\')">💬 Söhbət</button><button class="'+(ASview==="tasks"?"on":"")+'" onclick="asstView(\'tasks\')">🗒 Planlarım</button></div>'
 +' <div class="ast-body">'
 +'  <div id="astChatView" '+(ASview==="tasks"?'hidden':'')+'>'
 +'   <div id="asChat" class="ast-chat"></div>'
 +'   <div id="asOut" class="ast-out"></div>'
 +'   <div class="ast-quick" id="asQuick">'+QUICK.map(function(q){return '<button onclick="asstChat(\''+q[0].replace(/'/g,"\\'")+'\',false)">'+q[1]+' '+esc(q[0])+'</button>';}).join('')+'</div>'
 +'   <div class="ast-inbar"><button class="ast-orb-sm" id="asMic" onclick="asstMic()"><span id="asMicIco">🎤</span></button>'
 +'    <input id="asInput" class="ast-input" placeholder="Yazın və ya mikrofona toxunun…" onkeydown="if(event.key===\'Enter\')asstSendInput()">'
 +'    <button class="ast-send" onclick="asstSendInput()">➤</button></div>'
 +'   <div class="ast-microw"><button class="ast-chip '+(ASlisten?'on':'')+'" id="asHands" onclick="asstHands()">◉ Fasiləsiz</button><button class="ast-chip" id="asVchip" onclick="asstQuickVoice()">'+(ASVOICE?'🔊 Səs':'🔇 Səssiz')+'</button></div>'
 +'   <div class="ast-hint" id="asMicTxt"></div>'
 +'  </div>'
 +'  <div id="astTaskView" '+(ASview==="tasks"?'':'hidden')+'>'
 +'   <div class="ast-tabs" id="asTabs">'+[['today','Bu gün'],['tomorrow','Sabah'],['week','Bu həftə'],['noday','Tarixsiz'],['done','Bitmiş']].map(function(t){return '<button class="'+(t[0]===ASscope?'on':'')+'" onclick="ASscope=\''+t[0]+'\';renderAsstList();renderAsstTabs()">'+t[1]+'</button>';}).join('')+'</div>'
 +'   <div id="asList" class="ast-list"></div><button class="ast-add" onclick="$(\'asInput\')&&asstView(\'chat\');setTimeout(function(){$(\'asInput\')&&$(\'asInput\').focus()},100)">+ Söhbətdən yeni iş əlavə et</button>'
 +'  </div>'
 +' </div></div>';
 renderAsstChat();renderAsstList();
 sb.functions.invoke('office-assistant',{body:{action:'prefs'}}).then(function(r){if(r.data&&!r.data.error){ASPREFS=r.data;ASVOICE=r.data.autospeak!==false;var vc=$('asVchip');if(vc)vc.textContent=ASVOICE?'🔊 Səs':'🔇 Səssiz';}}).catch(function(){});}
function asstClear(){if(!ASHIST.length){return;}if(!confirm('Söhbət təmizlənsin?'))return;ASHIST=[];asstSaveHist();renderAsstChat();stopSpeak();}
function asstView(v){ASview=v;var c=$('astChatView'),t=$('astTaskView');if(c)c.hidden=(v!=='chat');if(t)t.hidden=(v!=='tasks');document.querySelectorAll('.ast-seg button').forEach(function(b,i){b.classList.toggle('on',(i===0&&v==='chat')||(i===1&&v==='tasks'));});if(v==='tasks')renderAsstList();}
function renderAsstTabs(){document.querySelectorAll('#asTabs button').forEach(function(b,i){var sc=['today','tomorrow','week','noday','done'][i];b.classList.toggle('on',sc===ASscope);});}
function renderAsstChat(){var c=$('asChat');if(!c)return;
 if(!ASHIST.length){c.innerHTML='<div class="ast-welcome"><p>👋 Salam! Nə istəsəniz soruşun və ya söyləyin:</p><ul><li>“Bu gün kim gəlməyib?”</li><li>“Boş mənzillərin siyahısını PDF ver”</li><li>“Sabah saat 10-da görüş qeyd et”</li></ul></div>';return;}
 c.innerHTML=ASHIST.slice(-24).map(function(h,i){var real=ASHIST.length<=24?i:ASHIST.length-24+i;if(h.role==='user')return '<div class="ast-b user">'+esc(h.content)+'</div>';
  var tbl=h.table?asstTableHtml(h.table,real):'';
  return '<div class="ast-b ai">'+esc(h.content)+tbl+'</div>';}).join('');c.scrollTop=c.scrollHeight;}
function asstTableHtml(t,idx){var cols=t.columns||[],rows=t.rows||[];
 var head='<tr>'+cols.map(function(c){return '<th>'+esc(c)+'</th>';}).join('')+'</tr>';
 var body=rows.slice(0,8).map(function(r){return '<tr>'+r.map(function(c){return '<td>'+esc(c)+'</td>';}).join('')+'</tr>';}).join('');
 var more=rows.length>8?'<div class="ast-tmore">…və daha '+(rows.length-8)+' sətir</div>':'';
 return '<div class="ast-tbl"><div class="ast-tbl-h">'+esc(t.title||'')+' · '+rows.length+' sətir</div><div class="ast-tbl-scroll"><table>'+head+body+'</table></div>'+more+'<button class="ast-pdf" onclick="asstPdf('+idx+')">📄 PDF kimi yüklə</button></div>';}
function asstQuickVoice(){ASVOICE=!ASVOICE;var vc=$('asVchip');if(vc)vc.textContent=ASVOICE?'🔊 Səs':'🔇 Səssiz';sb.functions.invoke('office-assistant',{body:{action:'prefs',set:{voice:ASPREFS.voice,speed:ASPREFS.speed,autospeak:ASVOICE}}}).catch(function(){});if(!ASVOICE&&ASAUDIO)ASAUDIO.pause();}
function asstSendInput(){var el=$('asInput');if(!el)return;var t=el.value.trim();if(!t)return;el.value='';asstChat(t,false);}
function asstMic(){if(ASREC&&ASREC.state==='recording'){ASREC.stop();return;}stopSpeak();startRec(false);}
function asstHands(){ASlisten=!ASlisten;var b=$('asHands');if(b)b.classList.toggle('on',ASlisten);if(ASlisten){stopSpeak();startRec(true);}else{if(ASREC&&ASREC.state==='recording')ASREC.stop();stopVAD();releaseStream();}var t=$('asMicTxt');if(t)t.textContent=ASlisten?'Fasiləsiz dinləmə aktiv':'';}
function startRec(hands){if(!navigator.mediaDevices){toast('Mikrofon dəstəklənmir');return;}
 var g=ASstream?Promise.resolve(ASstream):navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
 g.then(function(st){ASstream=st;ASchunks=[];ASREC=new MediaRecorder(st);ASREC.ondataavailable=function(e){if(e.data.size)ASchunks.push(e.data);};
  ASREC.onstop=function(){var blob=new Blob(ASchunks,{type:ASREC.mimeType||'audio/webm'});setMic(false);if(blob.size>2500)asstSend(blob,hands);else if(hands&&ASlisten)armVAD(st);};
  ASREC.start();setMic(true,hands);if(hands)armVAD(st);
 }).catch(function(){toast('Mikrofon icazəsi verilmədi');ASlisten=false;var b=$('asHands');if(b)b.classList.remove('on');});}
function setMic(on,hands){var b=$('asMic'),t=$('asMicTxt');if(b)b.classList.toggle('rec',on);if(t)t.textContent=on?(hands?'Dinləyirəm…':'Bitirmək üçün toxunun'):(ASlisten?'Fasiləsiz dinləmə aktiv':'');}
function releaseStream(){if(ASstream&&!ASlisten){ASstream.getTracks().forEach(function(t){t.stop();});ASstream=null;}}
function armVAD(st){try{if(!ASctx)ASctx=new(window.AudioContext||window.webkitAudioContext)();if(ASctx.state==='suspended')ASctx.resume();var src=ASctx.createMediaStreamSource(st);ASanalyser=ASctx.createAnalyser();ASanalyser.fftSize=512;src.connect(ASanalyser);var data=new Uint8Array(ASanalyser.frequencyBinCount);var quiet=0,spoke=false;
 clearInterval(ASsilence);ASsilence=setInterval(function(){if(!ASREC||ASREC.state!=='recording'){clearInterval(ASsilence);return;}ASanalyser.getByteFrequencyData(data);var v=0;for(var i=0;i<data.length;i++)v+=data[i];v/=data.length;if(v>13){spoke=true;quiet=0;}else if(spoke){quiet++;if(quiet>11){clearInterval(ASsilence);ASREC.stop();}}},110);}catch(e){}}
function stopVAD(){clearInterval(ASsilence);}
function armBargeIn(){try{if(!ASstream){navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true}}).then(function(st){ASstream=st;bargeLoop(st);});return;}bargeLoop(ASstream);}catch(e){}}
function bargeLoop(st){try{if(!ASctx)ASctx=new(window.AudioContext||window.webkitAudioContext)();if(ASctx.state==='suspended')ASctx.resume();var src=ASctx.createMediaStreamSource(st);var an=ASctx.createAnalyser();an.fftSize=512;src.connect(an);var data=new Uint8Array(an.frequencyBinCount);var hi=0;
 clearInterval(ASbargeTimer);ASbargeTimer=setInterval(function(){if(!ASAUDIO||ASAUDIO.paused){clearInterval(ASbargeTimer);return;}an.getByteFrequencyData(data);var v=0;for(var i=0;i<data.length;i++)v+=data[i];v/=data.length;if(v>24){hi++;if(hi>3){clearInterval(ASbargeTimer);stopSpeak();startRec(ASlisten);}}else hi=0;},90);}catch(e){}}
function asstSend(blob,hands){setBusy(true);var fd=new FormData();fd.append('audio',blob,'audio.webm');
 sb.functions.invoke('office-assistant',{body:fd}).then(function(r){if(r.error)throw r.error;if(r.data.error)throw new Error(r.data.error);var t=(r.data.text||'').trim();setBusy(false);if(!t){if(hands&&ASlisten)startRec(true);return;}asstChat(t,hands);
 }).catch(function(e){setBusy(false,'Xəta: '+(e.message||e));if(hands&&ASlisten)setTimeout(function(){startRec(true);},1500);});}
function asstChat(text,hands){if(ASview!=='chat')asstView('chat');ASHIST.push({role:'user',content:text});asstSaveHist();renderAsstChat();setBusy(true);
 sb.functions.invoke('office-assistant',{body:{action:'chat',text:text,history:ASHIST.slice(-8).map(function(h){return {role:h.role,content:h.content};})}}).then(function(r){if(r.error)throw r.error;if(r.data.error)throw new Error(r.data.error);
  setBusy(false);ASHIST.push({role:'assistant',content:r.data.reply,table:r.data.table||null});asstSaveHist();renderAsstChat();renderAsstList();asstSpeak(r.data.reply,hands);
 }).catch(function(e){setBusy(false,'Xəta: '+(e.message||e));if(hands&&ASlisten)setTimeout(function(){startRec(true);},1500);});}
function setBusy(on,msg){var o=$('asOut');if(!o)return;o.innerHTML=on?'<div class="ast-typing"><span></span><span></span><span></span></div>':(msg?'<div class="ast-err">'+esc(msg)+'</div>':'');}
function stopSpeak(){if(ASAUDIO){try{ASAUDIO.pause();ASAUDIO.currentTime=0;}catch(e){}}clearInterval(ASbargeTimer);}
function asstSpeak(txt,hands){if(!ASVOICE||!txt){if(hands&&ASlisten)setTimeout(function(){startRec(true);},350);return;}
 sb.functions.invoke('office-assistant',{body:{action:'tts',text:txt}}).then(function(r){if(r.error||!r.data||!r.data.audio){if(hands&&ASlisten)startRec(true);return;}
  try{stopSpeak();ASAUDIO=new Audio('data:audio/mp3;base64,'+r.data.audio);ASAUDIO.onplay=function(){armBargeIn();};ASAUDIO.onended=function(){clearInterval(ASbargeTimer);if(hands&&ASlisten)startRec(true);};ASAUDIO.play().catch(function(){if(hands&&ASlisten)startRec(true);});}catch(e){if(hands&&ASlisten)startRec(true);}
 }).catch(function(){if(hands&&ASlisten)startRec(true);});}
function asstPdf(idx){var h=ASHIST[idx];if(!h||!h.table){toast('Cədvəl yoxdur');return;}var d=h.table;var cols=d.columns||[],rows=d.rows||[];
 var w=window.open('','_blank');if(!w){toast('Pop-up icazəsi verin');return;}
 var e2=function(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
 var css='body{font:14px/1.5 -apple-system,Arial,sans-serif;color:#2a1d14;padding:30px;max-width:840px;margin:0 auto}h1{font-size:22px;color:#ba4d2c;margin:0 0 3px}.m{color:#8b7a6b;font-size:12px;margin-bottom:18px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#ba4d2c;color:#fff;text-align:left;padding:9px 11px}td{padding:8px 11px;border-bottom:1px solid #eadfd3}tr:nth-child(even) td{background:#faf6f1}.f{margin-top:22px;color:#8b7a6b;font-size:11px;text-align:center}.b{background:#ba4d2c;color:#fff;border:none;padding:11px 22px;border-radius:8px;font-size:14px;cursor:pointer;margin:14px 0}@media print{.b{display:none}body{padding:10px}}';
 var thead=cols.map(function(c){return '<th>'+e2(c)+'</th>';}).join('');
 var tbody=rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+e2(c)+'</td>';}).join('')+'</tr>';}).join('');
 var A=String.fromCharCode(60),Z=String.fromCharCode(62);
 var P=[];
 P.push('!DOCTYPE html');var open=function(t){return A+t+Z;},close=function(t){return A+'/'+t+Z;};
 var doc=w.document;doc.open();
 doc.write(open('!DOCTYPE html')+open('html lang="az"')+open('head')+open('meta charset="utf-8"')+open('meta name="viewport" content="width=device-width,initial-scale=1"')+open('title')+e2(d.title||'Hesabat')+close('title')+open('style')+css+close('style')+close('head')+open('body'));
 doc.write(open('h1')+e2(d.title||'Hesabat')+close('h1')+open('div class="m"')+'Baş Ofis · '+new Date().toLocaleString('az-AZ')+close('div'));
 doc.write(open('button class="b" onclick="window.print()"')+'📄 PDF kimi yüklə / çap et'+close('button'));
 doc.write(open('table')+open('thead')+open('tr')+thead+close('tr')+close('thead')+open('tbody')+tbody+close('tbody')+close('table'));
 doc.write(open('div class="f"')+rows.length+' sətir · Baş Ofis idarəetmə sistemi'+close('div')+close('body')+close('html'));
 doc.close();setTimeout(function(){try{w.print();}catch(e){}},600);}
function asstSettings(){var voices=[['shimmer','Yumşaq qadın'],['nova','Canlı qadın'],['coral','İsti qadın'],['sage','Sakit qadın'],['alloy','Neytral'],['onyx','Dərin kişi'],['echo','Kişi'],['ash','Aydın kişi']];
 var html='<div class="mhead"><h3>Səs ayarları</h3><button class="x" onclick="closeModal()">×</button></div>'+
  '<label class="ast-lbl">Səs</label><select id="apVoice" class="ast-sel">'+voices.map(function(v){return '<option value="'+v[0]+'"'+(ASPREFS.voice===v[0]?' selected':'')+'>'+v[1]+'</option>';}).join('')+'</select>'+
  '<label class="ast-lbl">Sürət: <b id="apSpeedV">'+(+ASPREFS.speed||1).toFixed(2)+'</b></label><input type="range" id="apSpeed" min="0.7" max="1.3" step="0.05" value="'+(ASPREFS.speed||1)+'" class="ast-range" oninput="$(\'apSpeedV\').textContent=(+this.value).toFixed(2)">'+
  '<label class="ast-check"><input type="checkbox" id="apAuto" '+(ASVOICE?'checked':'')+'> Cavabları səslə oxusun</label>'+
  '<div class="row" style="gap:8px;margin-top:14px"><button class="ast-chip" onclick="asstTestVoice()">🔊 Sına</button><button class="ast-save" onclick="asstSaveVoice()">Yadda saxla</button></div>';
 modal(html);}
function asstTestVoice(){var v=$('apVoice').value,sp=+$('apSpeed').value;sb.functions.invoke('office-assistant',{body:{action:'prefs',set:{voice:v,speed:sp,autospeak:true}}}).then(function(){sb.functions.invoke('office-assistant',{body:{action:'tts',text:'Salam, mən sizin AI köməkçinizəm. Bu, səs nümunəsidir.'}}).then(function(r){if(r.data&&r.data.audio){stopSpeak();ASAUDIO=new Audio('data:audio/mp3;base64,'+r.data.audio);ASAUDIO.play().catch(function(){});}});});}
function asstSaveVoice(){var v=$('apVoice').value,sp=+$('apSpeed').value,au=$('apAuto').checked;sb.functions.invoke('office-assistant',{body:{action:'prefs',set:{voice:v,speed:sp,autospeak:au}}}).then(function(r){if(r.data){ASPREFS=r.data;ASVOICE=au;var vc=$('asVchip');if(vc)vc.textContent=ASVOICE?'🔊 Səs':'🔇 Səssiz';}closeModal();toast('Yadda saxlanıldı');});}
function asstDueTxt(n){if(!n.due)return '';var d=new Date(n.due);return d.toLocaleDateString('az-AZ',{day:'2-digit',month:'short'})+(n.due_all_day?'':' '+d.toLocaleTimeString('az-AZ',{hour:'2-digit',minute:'2-digit'}));}
function renderAsstList(){var el=$('asList');if(!el)return;run(sb.rpc('notes_list',{p_scope:ASscope})).then(function(rows){
 el.innerHTML=rows.length?rows.map(function(n){var late=n.due&&new Date(n.due)<new Date()&&!n.done;
  return '<div class="ast-task'+(n.done?' done':'')+'"><button class="ast-ck'+(n.done?' on':'')+'" onclick="asstDone('+n.id+','+(!n.done)+')">'+(n.done?'✓':'')+'</button><div class="ast-tx" onclick="asstEdit('+n.id+',\''+esc(n.text).replace(/'/g,"\\'")+'\')" style="cursor:text"><b>'+esc(n.text)+'</b>'+(n.due?'<span class="ast-due'+(late?' late':'')+'">'+(late?'⏰ ':'')+asstDueTxt(n)+'</span>':'')+'</div><button class="ast-x" onclick="asstDel('+n.id+')">×</button></div>';
 }).join(''):'<div class="ast-empty"><div class="ast-empty-ico">🗒</div><p>Bu siyahı boşdur.</p></div>';}).catch(err);}
function asstDone(id,v){run(sb.from('office_notes').update({done:v,done_at:v?new Date().toISOString():null}).eq('id',id)).then(function(){renderAsstList();}).catch(err);}
function asstDel(id){run(sb.from('office_notes').delete().eq('id',id)).then(function(){renderAsstList();}).catch(err);}
function asstEdit(id,cur){var t=prompt('İşi düzəlt:',cur);if(t==null)return;t=t.trim();if(!t)return;run(sb.from('office_notes').update({text:t}).eq('id',id)).then(function(){renderAsstList();}).catch(err);}





var _scanKind='in';
function loadJsQR(){return new Promise(function(res,rej){if(window.jsQR)return res();var sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';sc.onload=function(){res();};sc.onerror=function(){rej(new Error('QR oxuyucu yüklənmədi'));};document.head.appendChild(sc);});}
function stopCam(){if(scan._st){scan._st.getTracks().forEach(function(t){t.stop();});scan._st=null;}scan._on=false;}
function scan(kind){_scanKind=kind;
 modal('<div class="mhead"><h3>'+(kind==='in'?'Gəliş':'Çıxış')+' — QR skan</h3><button class="x" onclick="stopCam();closeModal()">×</button></div>'+
  '<div style="position:relative"><video id="cam" playsinline muted autoplay style="width:100%;border-radius:14px;background:#000;aspect-ratio:1;object-fit:cover"></video><div style="position:absolute;inset:18%;border:3px solid rgba(255,255,255,.85);border-radius:16px;pointer-events:none"></div></div>'+
  '<p class="muted small" id="camMsg" style="margin-top:8px">Kamera açılır… İcazə soruşulsa, <b>“İcazə ver”</b> basın.</p>');
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){$('camMsg').innerHTML='Bu brauzer kameranı dəstəkləmir. Telefonun <b>Kamera</b> tətbiqi ilə ofisdəki QR-ı skan edin.';return;}
 var useBD=('BarcodeDetector' in window);var det=null;try{if(useBD)det=new BarcodeDetector({formats:['qr_code']});}catch(e){useBD=false;}
 var ready=useBD?Promise.resolve():loadJsQR();
 Promise.all([ready,navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:1280}},audio:false})]).then(function(r){
  var st=r[1],v=$('cam');if(!v){st.getTracks().forEach(function(t){t.stop();});return;}scan._st=st;scan._on=true;v.srcObject=st;var pp=v.play();if(pp&&pp.catch)pp.catch(function(){});
  $('camMsg').textContent='Kameranı ofisdəki QR koda tutun.';
  var cv=document.createElement('canvas'),cx=cv.getContext('2d',{willReadFrequently:true});
  function found(raw){var m=String(raw).match(/[?&]c=((?:\d+\.)?[0-9a-f]{16})/)||String(raw).match(/^((?:\d+\.)?[0-9a-f]{16})$/);if(!m){$('camMsg').textContent='Bu QR sistemə aid deyil. Ofisdəki QR-ı skan edin.';return false;}stopCam();closeModal();doCheck(kind,m[1]);return true;}
  (function loop(){if(!scan._on||!$('cam'))return stopCam();
   if(v.readyState<2)return setTimeout(loop,150);
   if(useBD){det.detect(v).then(function(c){if(c&&c[0]&&found(c[0].rawValue))return;setTimeout(loop,120);}).catch(function(){setTimeout(loop,250);});return;}
   var w=v.videoWidth,h=v.videoHeight,sz=Math.min(w,h,900),sx=(w-sz)/2,sy=(h-sz)/2;cv.width=sz;cv.height=sz;cx.drawImage(v,sx,sy,sz,sz,0,0,sz,sz);
   var img=cx.getImageData(0,0,sz,sz),code=window.jsQR(img.data,sz,sz,{inversionAttempts:'dontInvert'});
   if(code&&found(code.data))return;setTimeout(loop,120);})();
 }).catch(function(e){var n=(e&&e.name)||'';$('camMsg').innerHTML=(n==='NotAllowedError'||n==='SecurityError')?'<b style="color:var(--bad)">Kameraya icazə verilmədi.</b> Telefonun ayarlarında bu sayt üçün kameranı aktiv edin (iPhone: Ayarlar → Safari → Kamera → İcazə ver), sonra yenidən cəhd edin. Və ya telefonun <b>Kamera</b> tətbiqi ilə skan edin.':(n==='NotFoundError'?'Kamera tapılmadı.':'Kamera açılmadı: '+esc((e&&e.message)||n)+'. Telefonun Kamera tətbiqi ilə skan edin.');});}

function autoCheck(token){history.replaceState(null,'',OFB());if(!EMP){toast('Hesabınız işçi kartına bağlanmayıb');return;}
 run(sb.from('office_attendance').select('*').eq('employee_id',EMP.id).eq('day',today()).maybeSingle()).then(function(r){var kind=(!r||!r.check_in)?'in':(!r.check_out?'out':null);
  if(!kind){toast('Bu gün gəliş və çıxış artıq qeyd olunub');return;}
  if(kind==='out'&&!confirm('Çıxışı qeyd edək?'))return;doCheck(kind,token);}).catch(err);}
function doCheck(kind,token){toast('Yer yoxlanılır…');var _scanAt=new Date().toISOString();
 function send(lat,lng){sb.rpc('office_check',{p_kind:kind,p_token:token,p_lat:lat,p_lng:lng,p_at:_scanAt}).then(function(r){if(r.error)throw r.error;var msg=(r.data&&r.data.msg)||'Qeyd olundu';toast(msg);renderToday();return selfieCapture(kind).then(function(){renderToday();}).catch(function(){});}).catch(err);}
 if(!navigator.geolocation)return send(null,null);
 navigator.geolocation.getCurrentPosition(function(p){send(p.coords.latitude,p.coords.longitude);},function(){send(null,null);},{enableHighAccuracy:true,timeout:12000,maximumAge:0});}

/* ---------- PANEL ---------- */
function renderPanel(){var d=today();$('pDate').textContent=new Date().toLocaleDateString('az-AZ',{timeZone:TZ,day:'numeric',month:'long',year:'numeric'});
 run(sb.from('office_attendance').select('*').eq('day',d)).then(function(att){var act=EMPS.filter(function(e){return e.active&&(e.workdays||[]).indexOf(isoDow(d))>=0&&!isHol(d)&&!leaveOn(e.id,d);});var onLeave=EMPS.filter(function(e){return e.active&&leaveOn(e.id,d);});
  var came=att.filter(function(a){return a.check_in;}),late=att.filter(function(a){return a.late_min>0;}),absent=act.filter(function(e){return !att.some(function(a){return a.employee_id===e.id&&a.check_in;});});
  var open=TASKS.filter(function(t){return t.status!=='done';}),over=open.filter(function(t){return t.due&&t.due<d;});
  $('pKpi').innerHTML=kpi(came.length+' / '+act.length,'bu gün işdədir','ok')+kpi(late.length,'gecikib','warn')+kpi(absent.length,'gəlməyib'+(onLeave.length?' · '+onLeave.length+' icazəli':''),'bad')+kpi(over.length+' / '+open.length,'vaxtı keçmiş / açıq tapşırıq',over.length?'bad':'');
  $('pLate').innerHTML=(late.map(function(a){return '<div class="row" style="justify-content:space-between;padding:6px 0"><span>'+esc(empName(a.employee_id))+'</span><span class="pill p-warn">'+hm(a.check_in)+' · '+a.late_min+' dəq</span></div>';}).join('')+absent.map(function(e){return '<div class="row" style="justify-content:space-between;padding:6px 0"><span>'+esc(e.full_name)+'</span><span class="pill p-bad">gəlməyib</span></div>';}).join(''))||'<div class="empty">Hamı vaxtında 👏</div>';
  $('pOver').innerHTML=over.length?over.map(taskRow).join(''):'<div class="empty">Vaxtı keçmiş tapşırıq yoxdur</div>';
  var rows=EMPS.filter(function(e){return e.active;}).map(function(e){var t=TASKS.filter(function(x){return x.assignee_id===e.id;});var o=t.filter(function(x){return x.status!=='done';}),ov=o.filter(function(x){return x.due&&x.due<d;}),dn=t.filter(function(x){return x.status==='done'&&x.done_at&&(Date.now()-new Date(x.done_at))<30*864e5;});
   return '<tr style="cursor:pointer" onclick="perfCard('+e.id+')"><td><b style="color:var(--acc)">'+esc(e.full_name)+'</b><div class="muted small">'+esc((posOf(e)||{}).title||'')+'</div></td><td>'+o.length+'</td><td>'+(ov.length?'<span class="pill p-bad">'+ov.length+'</span>':'0')+'</td><td>'+dn.length+'</td></tr>';}).join('');
  drawCharts();renderHrBoxes();
  $('pPeople').innerHTML=rows?'<table><tr><th>İşçi</th><th>Açıq</th><th>Vaxtı keçmiş</th><th>Son 30 gündə bitib</th></tr>'+rows+'</table>':'<div class="empty">Ştatda işçi yoxdur</div>';
 }).catch(err);}
function kpi(v,l,c){return '<div class="kpi '+(c||'')+'"><b>'+v+'</b><span>'+l+'</span></div>';}

/* ---------- TAPŞIRIQLAR ---------- */
function taskRow(t){var over=t.status!=='done'&&t.due&&t.due<today();var cl=t.checklist||[],cd=cl.filter(function(x){return x.done;}).length;return '<div class="tk'+(over?' over':'')+(t.from_owner?' ownt':'')+'" draggable="true" data-id="'+t.id+'" onclick="openTask('+t.id+')">'+(t.from_owner?'<div class="ownbadge">👑 Sahibkardan</div>':'')+'<b>'+esc(t.title)+'</b><div class="meta">'+(cl.length?'<span class="pill '+(cd===cl.length?'p-ok':'p-mut')+'">✓ '+cd+'/'+cl.length+'</span>':'')+((t.files||[]).length?'<span>📎 '+t.files.length+'</span>':'')+(t.recur?'<span title="Təkrarlanan">🔁</span>':'')+'<span class="pill prio-'+t.priority+'">'+PR[t.priority]+'</span><span class="pill p-mut">'+ST[t.status]+'</span>'+(t.assignee_id?'<span>👤 '+esc(empName(t.assignee_id))+'</span>':'')+(t.due?'<span'+(over?' style="color:var(--bad);font-weight:700"':'')+'>📅 '+t.due.slice(8)+'.'+t.due.slice(5,7)+'</span>':'')+'</div></div>';}
function renderKanban(){var f=MGR?$('tkFilter').value:'mine';
 var list=TASKS.filter(function(t){if(f==='mine')return EMP&&t.assignee_id===EMP.id;if(f==='created')return t.created_by===ME.user_id;return true;});
 if(!renderKanban._i){renderKanban._i=1;var fk=['doing','new','review','done'].find(function(k){return list.some(function(t){return t.status===k;});});if(fk)KB=fk;}
 $('kbTabs').innerHTML=Object.keys(ST).map(function(k){var n=list.filter(function(t){return t.status===k;}).length;return '<button data-k="'+k+'" class="'+(KB===k?'on':'')+'">'+ST[k]+' ('+n+')</button>';}).join('');
 $('kbTabs').onclick=function(e){var b=e.target.closest('button');if(!b)return;KB=b.dataset.k;renderKanban();};
 $('kanban').innerHTML=Object.keys(ST).map(function(k){var l=list.filter(function(t){return t.status===k;});return '<div class="col'+(KB===k?' on':'')+'" data-st="'+k+'"><h4>'+ST[k]+'<span>'+l.length+'</span></h4>'+(l.map(taskRow).join('')||'<div class="empty small">—</div>')+'</div>';}).join('');}
function empOpts(sel){return '<option value="">— təyin edilməyib —</option>'+EMPS.filter(function(e){return e.active;}).map(function(e){return '<option value="'+e.id+'"'+(e.id===sel?' selected':'')+'>'+esc(e.full_name)+'</option>';}).join('');}
var CL=[];
function openTask(id){if(!MGR&&!id){toast('Tapşırığı rəhbər verir. Öz işlərinizi “Aylıq plan”da yazın.');return;}return openTask_(id);}
function openTask_(id){var t=id?TASKS.find(function(x){return x.id===id;}):null;var canEdit=!t||MGR||t.created_by===ME.user_id;CL=JSON.parse(JSON.stringify((t&&t.checklist)||[]));
 modal('<div class="mhead"><h3>'+(t?'Tapşırıq':'Yeni tapşırıq')+'</h3><button class="x" onclick="closeModal()">×</button></div>'+
  (!t?'<div class="field"><label>Şablon</label><select id="fTpl" onchange="applyTaskTpl(this.value)"><option value="">— boş —</option>'+TTPL.map(function(x,i){return '<option value="'+i+'">'+esc(x.title)+'</option>';}).join('')+'</select></div>':'')+
  '<div class="field"><label>Başlıq</label><input id="fT" value="'+esc(t?t.title:'')+'"'+(canEdit?'':' disabled')+'></div>'+
  '<div class="field"><label>Təsvir</label><textarea id="fD"'+(canEdit?'':' disabled')+'>'+esc(t?t.description:'')+'</textarea></div>'+
  '<div class="grid g2"><div class="field"><label>Məsul</label><select id="fA"'+(canEdit&&MGR?'':' disabled')+'>'+(MGR?empOpts(t?t.assignee_id:null):'<option value="'+(t?t.assignee_id:(EMP&&EMP.id))+'">'+esc(empName(t?t.assignee_id:(EMP&&EMP.id)))+'</option>')+'</select>'+(MGR?'':'<div class="muted small" style="margin-top:4px">Tapşırıq özünüz üçün yaradılır</div>')+'</div><div class="field"><label>Son tarix</label><input id="fDue" type="date" value="'+(t&&t.due?t.due:'')+'"'+(canEdit?'':' disabled')+'></div>'+
  '<div class="field"><label>Prioritet</label><select id="fP"'+(canEdit?'':' disabled')+'>'+Object.keys(PR).map(function(k){return '<option value="'+k+'"'+((t?t.priority:'normal')===k?' selected':'')+'>'+PR[k]+'</option>';}).join('')+'</select></div>'+
  '<div class="field"><label>Status</label><select id="fS">'+Object.keys(ST).map(function(k){return '<option value="'+k+'"'+((t?t.status:'new')===k?' selected':'')+'>'+ST[k]+'</option>';}).join('')+'</select></div>'+
  '<div class="field"><label>Təkrarlanma</label><select id="fR"'+(canEdit?'':' disabled')+'><option value="">Təkrarlanmır</option><option value="daily"'+(t&&t.recur==='daily'?' selected':'')+'>Hər gün</option><option value="weekly"'+(t&&t.recur==='weekly'?' selected':'')+'>Hər həftə</option><option value="monthly"'+(t&&t.recur==='monthly'?' selected':'')+'>Hər ay</option></select></div></div>'+
  '<div class="field"><label>Yoxlama siyahısı</label><div id="clBox"></div><div class="row" style="margin-top:6px"><input id="clNew" placeholder="Yeni bənd…" style="flex:1;border:1px solid var(--line);border-radius:10px;padding:9px 12px" onkeydown="if(event.key===\'Enter\'){event.preventDefault();clAdd();}"><button type="button" class="btn ghost sm" onclick="clAdd()">+</button></div></div>'+
  (t?'<div class="field"><label>Fayllar</label><div id="flBox"></div><label class="btn ghost sm" style="margin-top:6px;cursor:pointer">📎 Fayl əlavə et<input type="file" id="flIn" multiple hidden onchange="upFiles('+t.id+',this.files)"></label></div>':'<p class="muted small">Fayl əlavə etmək üçün əvvəlcə tapşırığı yadda saxlayın.</p>')+
  (t?'<p class="muted small">Yaradıb: '+esc(profName(t.created_by))+' · '+new Date(t.created_at).toLocaleDateString('az-AZ')+(t.done_at?' · bitib: '+new Date(t.done_at).toLocaleDateString('az-AZ'):'')+'</p>':'')+
  '<div class="row" style="justify-content:flex-end;margin-top:12px">'+(t&&(MGR||t.created_by===ME.user_id)?'<button class="btn red" onclick="delTask('+t.id+')">Sil</button>':'')+'<span style="flex:1"></span><button class="btn" onclick="saveTask('+(t?t.id:0)+')">Yadda saxla</button></div>'+
  (t?'<h3 style="margin-top:18px">Şərhlər</h3><div id="cmList"><div class="muted small">Yüklənir…</div></div><div class="field" style="margin-top:8px"><textarea id="cmNew" placeholder="Şərh yazın…" style="min-height:60px"></textarea></div><button class="btn ghost sm" onclick="addCm('+t.id+')">Göndər</button>':''));
 drawCL();if(t){loadCm(t.id);drawFiles(t);}}
function profName(uid){var p=PROFS.find(function(x){return x.user_id===uid;});if(p)return p.full_name||p.email;var e=EMPS.find(function(x){return x.user_id===uid;});return e?e.full_name:(uid===ME.user_id?(ME.full_name||ME.email):'—');}
function saveTask(id){var b={title:$('fT').value.trim(),description:$('fD').value.trim(),assignee_id:+$('fA').value||null,due:$('fDue').value||null,priority:$('fP').value,status:$('fS').value,recur:$('fR').value||null,checklist:CL};
 if(!b.title){toast('Başlıq yazın');return;}
 var q=id?sb.from('office_tasks').update(b).eq('id',id).select().single():sb.from('office_tasks').insert(Object.assign(b,{created_by:ME.user_id})).select().single();
 var prevA=id?(TASKS.find(function(x){return x.id===id;})||{}).assignee_id:null;
 var prevS=id?(TASKS.find(function(x){return x.id===id;})||{}).status:null;
 run(q).then(function(t){var i=TASKS.findIndex(function(x){return x.id===t.id;});if(i>=0)TASKS[i]=t;else TASKS.unshift(t);closeModal();toast('Yadda saxlanıldı');refreshCurrent();if(t.assignee_id&&t.assignee_id!==prevA)notify('task_assigned',{id:t.id});if(id&&t.from_owner&&prevS&&t.status!==prevS)notify('task_status',{id:t.id});}).catch(err);}
function delTask(id){if(!confirm('Tapşırıq silinsin?'))return;run(sb.from('office_tasks').delete().eq('id',id)).then(function(){TASKS=TASKS.filter(function(x){return x.id!==id;});closeModal();refreshCurrent();}).catch(err);}
function loadCm(id){run(sb.from('office_task_comments').select('*').eq('task_id',id).order('created_at')).then(function(c){$('cmList').innerHTML=c.length?c.map(function(x){return '<div class="cm"><b>'+esc(profName(x.author))+'</b> <span class="muted small">'+new Date(x.created_at).toLocaleString('az-AZ',{timeZone:TZ})+'</span><p>'+esc(x.body)+'</p></div>';}).join(''):'<div class="muted small">Hələ şərh yoxdur</div>';}).catch(err);}
function addCm(id){var v=$('cmNew').value.trim();if(!v)return;var mentions=EMPS.filter(function(e){return e.active&&v.indexOf('@'+e.full_name.split(' ')[0])>=0;}).map(function(e){return e.id;});
 run(sb.from('office_task_comments').insert({task_id:id,body:v,author:ME.user_id})).then(function(){$('cmNew').value='';loadCm(id);notify('task_comment',{id:id,text:v,mentions:mentions});}).catch(err);}
function refreshCurrent(){var v=(document.querySelector('#tabs button.on')||{}).dataset;show(v&&v.v||'today');}




/* ---------- tapşırıq əlavələri ---------- */
var TTPL=[
 {title:'Yeni işçinin işə qəbulu',priority:'normal',items:['Əmək müqaviləsi imzalanıb','Sənədlər (şəxsiyyət, diplom) qəbul olunub','Sistem hesabı yaradılıb','İş yeri və avadanlıq hazırdır','Komanda ilə tanışlıq','Sınaq müddəti planı']},
 {title:'Həftəlik hesabat',priority:'normal',recur:'weekly',items:['Satış nəticələri','Görülən işlər','Növbəti həftənin planı']},
 {title:'Aylıq tabelin hazırlanması',priority:'high',recur:'monthly',items:['Davamiyyət yoxlanıldı','İcazəli günlər təsdiqləndi','Tabel Excel-ə çıxarıldı','Mühasibatlığa göndərildi']},
 {title:'İşdən çıxma prosesi',priority:'high',items:['Ərizə qəbul olunub','Avadanlıq təhvil alınıb','Sistem hesabı dondurulub','Son hesablaşma']}];
function applyTaskTpl(i){var x=TTPL[+i];if(!x)return;$('fT').value=x.title;$('fP').value=x.priority;if(x.recur)$('fR').value=x.recur;CL=x.items.map(function(t){return {t:t,done:false};});drawCL();}
function drawCL(){var b=$('clBox');if(!b)return;var n=CL.filter(function(x){return x.done;}).length;
 b.innerHTML=(CL.length?'<div class="clbar"><i style="width:'+Math.round(n/CL.length*100)+'%"></i></div>':'')+CL.map(function(x,i){return '<label class="cli"><input type="checkbox"'+(x.done?' checked':'')+' onchange="CL['+i+'].done=this.checked;drawCL()"><span'+(x.done?' style="text-decoration:line-through;color:var(--mut)"':'')+'>'+esc(x.t)+'</span><button type="button" onclick="event.preventDefault();CL.splice('+i+',1);drawCL()">×</button></label>';}).join('');}
function clAdd(){var v=$('clNew').value.trim();if(!v)return;CL.push({t:v,done:false});$('clNew').value='';drawCL();}
function drawFiles(t){var b=$('flBox');if(!b)return;var fs=t.files||[];b.innerHTML=fs.length?fs.map(function(f,i){return '<div class="fli"><a href="javascript:dlFile(\''+encodeURIComponent(f.path)+'\')">📄 '+esc(f.name)+'</a><span class="muted small">'+Math.max(1,Math.round((f.size||0)/1024))+' KB</span>'+((MGR||t.created_by===ME.user_id)?'<button type="button" onclick="rmFile('+t.id+','+i+')">×</button>':'')+'</div>';}).join(''):'<div class="muted small">Fayl yoxdur</div>';}
function dlFile(p){sb.storage.from('office').createSignedUrl(decodeURIComponent(p),120).then(function(r){if(r.error)throw r.error;window.open(r.data.signedUrl,'_blank');}).catch(err);}
function upFiles(id,files){var t=TASKS.find(function(x){return x.id===id;});if(!t||!files||!files.length)return;toast('Yüklənir…');
 var arr=[].slice.call(files);Promise.all(arr.map(function(f){if(f.size>15*1024*1024){toast(f.name+': 15 MB-dan böyükdür');return null;}var path='tasks/'+id+'/'+Date.now()+'-'+f.name.replace(/[^\w.\-]+/g,'_');
  return sb.storage.from('office').upload(path,f,{upsert:false}).then(function(r){if(r.error)throw r.error;return {name:f.name,path:path,size:f.size};});}))
 .then(function(res){var nf=(t.files||[]).concat(res.filter(Boolean));return run(sb.from('office_tasks').update({files:nf}).eq('id',id).select().single());})
 .then(function(nt){var i=TASKS.findIndex(function(x){return x.id===id;});TASKS[i]=nt;drawFiles(nt);toast('Fayl əlavə olundu');}).catch(err);}
function rmFile(id,i){var t=TASKS.find(function(x){return x.id===id;});var f=t.files[i];if(!confirm(f.name+' silinsin?'))return;
 sb.storage.from('office').remove([f.path]).then(function(){var nf=t.files.slice();nf.splice(i,1);return run(sb.from('office_tasks').update({files:nf}).eq('id',id).select().single());}).then(function(nt){var k=TASKS.findIndex(function(x){return x.id===id;});TASKS[k]=nt;drawFiles(nt);}).catch(err);}
/* kanban: kartı sütunlar arasında sürüşdür */
document.addEventListener('dragstart',function(e){var c=e.target.closest&&e.target.closest('.tk[data-id]');if(c){e.dataTransfer.setData('text/plain',c.dataset.id);c.style.opacity='.5';}});
document.addEventListener('dragend',function(e){var c=e.target.closest&&e.target.closest('.tk[data-id]');if(c)c.style.opacity='';});
document.addEventListener('dragover',function(e){var col=e.target.closest&&e.target.closest('.col[data-st]');if(col){e.preventDefault();col.classList.add('dropon');}});
document.addEventListener('dragleave',function(e){var col=e.target.closest&&e.target.closest('.col[data-st]');if(col)col.classList.remove('dropon');});
document.addEventListener('drop',function(e){var col=e.target.closest&&e.target.closest('.col[data-st]');if(!col)return;e.preventDefault();col.classList.remove('dropon');var id=+e.dataTransfer.getData('text/plain'),st=col.dataset.st;var t=TASKS.find(function(x){return x.id===id;});if(!t||t.status===st)return;
 var old=t.status;t.status=st;renderKanban();run(sb.from('office_tasks').update({status:st}).eq('id',id).select().single()).then(function(nt){var i=TASKS.findIndex(function(x){return x.id===id;});TASKS[i]=nt;renderKanban();toast(ST[st]);if(nt.from_owner)notify('task_status',{id:nt.id});}).catch(function(er){t.status=old;renderKanban();err(er);});});


function renderHol(){var b=$('holList');if(!b)return;var yr=today().slice(0,4);var l=HOL.filter(function(h){return h.day>=yr+'-01-01';});
 b.innerHTML=l.length?'<table>'+l.map(function(h){return '<tr><td>'+h.day.slice(8)+'.'+h.day.slice(5,7)+'.'+h.day.slice(0,4)+'</td><td>'+esc(h.name)+'</td><td style="text-align:right"><button class="btn ghost sm" onclick="delHol(\''+h.day+'\')">×</button></td></tr>';}).join('')+'</table>':'<div class="empty">Bayram günü yoxdur</div>';}
function addHol(){var d=$('hD').value,n=$('hN').value.trim();if(!d||!n)return toast('Tarix və ad yazın');run(sb.from('office_holidays').upsert({day:d,name:n})).then(function(){HOL=HOL.filter(function(h){return h.day!==d;}).concat([{day:d,name:n}]).sort(function(a,b){return a.day<b.day?-1:1;});$('hN').value='';renderHol();}).catch(err);}
function delHol(d){run(sb.from('office_holidays').delete().eq('day',d)).then(function(){HOL=HOL.filter(function(h){return h.day!==d;});renderHol();}).catch(err);}


/* ---------- ANALİTİKA ---------- */
var CH={};
function loadChart(){return window.Chart?Promise.resolve():new Promise(function(res,rej){var sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';sc.onload=res;sc.onerror=rej;document.head.appendChild(sc);});}
function addDays(d,n){var x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10);}
function mkChart(id,cfg){cfg.options=cfg.options||{};cfg.options.interaction={mode:'index',intersect:false};cfg.options.events=['click','touchstart','mousemove','mouseout'];if(CH[id])CH[id].destroy();var c=$(id);if(!c)return;CH[id]=new Chart(c,cfg);}
function drawCharts(){var d=today(),from=addDays(d,-13);
 Promise.all([loadChart(),run(sb.from('office_attendance').select('employee_id,day,check_in,late_min').gte('day',from).lte('day',d))]).then(function(r){var att=r[1];
  Chart.defaults.font.family="Inter,system-ui,sans-serif";Chart.defaults.color='#64748b';
  var days=[],came=[],late=[],plan=[];for(var i=0;i<14;i++){var ds=addDays(from,i);days.push(ds.slice(8)+'.'+ds.slice(5,7));var a=att.filter(function(x){return x.day===ds&&x.check_in;});came.push(a.length);late.push(a.filter(function(x){return x.late_min>0;}).length);
   plan.push(isHol(ds)?0:EMPS.filter(function(e){return e.active&&(e.workdays||[]).indexOf(isoDow(ds))>=0&&!leaveOn(e.id,ds);}).length);}
  mkChart('chAtt',{type:'bar',data:{labels:days,datasets:[{label:'Gəlib',data:came,backgroundColor:'#2563eb',borderRadius:6},{label:'Gecikib',data:late,backgroundColor:'#f59e0b',borderRadius:6},{type:'line',label:'Plan',data:plan,borderColor:'#94a3b8',borderDash:[4,4],pointRadius:0,tension:.2}]},options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
  var wk=[],cr=[],dn=[];for(var w=7;w>=0;w--){var ws=addDays(d,-(w*7+6)),we=addDays(d,-w*7);wk.push(ws.slice(8)+'.'+ws.slice(5,7));
   cr.push(TASKS.filter(function(t){var c=String(t.created_at).slice(0,10);return c>=ws&&c<=we;}).length);dn.push(TASKS.filter(function(t){var c=t.done_at?String(t.done_at).slice(0,10):'';return c&&c>=ws&&c<=we;}).length);}
  mkChart('chTask',{type:'line',data:{labels:wk,datasets:[{label:'Yaradılıb',data:cr,borderColor:'#94a3b8',backgroundColor:'rgba(148,163,184,.15)',fill:true,tension:.3},{label:'Bitib',data:dn,borderColor:'#16a34a',backgroundColor:'rgba(22,163,74,.12)',fill:true,tension:.3}]},options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
  var m=d.slice(0,7);run(sb.from('office_attendance').select('employee_id,late_min').gte('day',m+'-01').lte('day',d)).then(function(ma){
   var lab=[],val=[];DEPTS.forEach(function(dp){var ids=EMPS.filter(function(e){var p=posOf(e);return p&&p.department_id===dp.id;}).map(function(e){return e.id;});lab.push(dp.name);val.push(ma.filter(function(x){return ids.indexOf(x.employee_id)>=0;}).reduce(function(s2,x){return s2+(x.late_min||0);},0));});
   mkChart('chDept',{type:'bar',data:{labels:lab,datasets:[{label:'Gecikmə (dəq)',data:val,backgroundColor:'#ef4444',borderRadius:6}]},options:{indexAxis:'y',maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}});});
 }).catch(function(){});}
function perfCard(eid){var e=EMPS.find(function(x){return x.id===eid;});var m=today().slice(0,7);
 loadPlans(m).then(function(){monthRows(function(R){var r=R.find(function(x){return x.e.id===eid;})||{plan:0,came:0,leave:0,absent:0,lateN:0,lateM:0,earlyM:0,work:0};
  var t=TASKS.filter(function(x){return x.assignee_id===eid;}),done=t.filter(function(x){return x.status==='done';}),onT=done.filter(function(x){return !x.due||String(x.done_at||'').slice(0,10)<=x.due;}),open=t.filter(function(x){return x.status!=='done';}),over=open.filter(function(x){return x.due&&x.due<today();});
  var att=r.plan?Math.round((r.came+r.leave)/r.plan*100):100,ont=done.length?Math.round(onT.length/done.length*100):100;var pl=(PLANS||[]).find(function(x){return x.employee_id===eid&&x.month===m&&x.status==='approved';});var plp=pl?planPct(pl):null;var pun=r.lateN?Math.max(0,100-r.lateN*10):100;var score=plp===null?Math.round(att*0.4+ont*0.4+pun*0.2):Math.round(att*0.3+ont*0.25+plp*0.3+pun*0.15);
  modal('<div class="mhead"><h3>'+esc(e.full_name)+'</h3><button class="x" onclick="closeModal()">×</button></div><p class="muted small">'+esc((posOf(e)||{}).title||'')+' · '+m+'</p>'+
   '<div class="score"><b>'+score+'</b><span>ümumi bal / 100</span></div>'+
   '<div class="grid g2" style="margin-top:12px">'+kpi(att+'%','davamiyyət ('+(r.came+r.leave)+'/'+r.plan+' gün)',att>=95?'ok':att>=85?'warn':'bad')+kpi(ont+'%','tapşırıq vaxtında ('+onT.length+'/'+done.length+')',ont>=90?'ok':ont>=70?'warn':'bad')+(plp!==null?kpi(plp+'%','aylıq plan icrası ('+pl.items.filter(function(x){return x.done;}).length+'/'+pl.items.length+')',plp>=80?'ok':plp>=40?'warn':'bad'):'')+kpi(r.lateN,'gecikmə · '+hmin(r.lateM),r.lateN?'warn':'ok')+kpi(Math.round(r.work/60)+' s','işlənib (bu ay)')+kpi(open.length,'açıq tapşırıq')+kpi(over.length,'vaxtı keçmiş',over.length?'bad':'ok')+'</div>'+
   '<p class="muted small" style="margin-top:10px">'+(plp===null?'Bal: davamiyyət 40% + tapşırıqların vaxtında icrası 40% + dəqiqlik 20%.':'Bal: davamiyyət 30% + aylıq plan 30% + tapşırıqlar 25% + dəqiqlik 15%.')+'</p>');});});}

function monthReport(){var m=today().slice(0,7);monthRows(function(R){var t=TASKS;var d=today();
 var h='<div class="rp"><h1>Aylıq hesabat · '+m+'</h1><p class="rpm">Hazırlandı: '+new Date().toLocaleString('az-AZ',{timeZone:TZ})+'</p>'+
  '<div class="rpk"><div><b>'+EMPS.filter(function(e){return e.active;}).length+'</b>işçi</div><div><b>'+R.reduce(function(s2,r){return s2+r.lateN;},0)+'</b>gecikmə</div><div><b>'+R.reduce(function(s2,r){return s2+r.absent;},0)+'</b>gəlməmə günü</div><div><b>'+t.filter(function(x){return x.done_at&&String(x.done_at).slice(0,7)===m;}).length+'</b>bitmiş tapşırıq</div><div><b>'+t.filter(function(x){return x.status!=='done'&&x.due&&x.due<d;}).length+'</b>vaxtı keçmiş</div></div>'+
  '<h2>Davamiyyət (tabel)</h2><table><tr><th>İşçi</th><th>Plan</th><th>Gəlib</th><th>İcazəli</th><th>Gəlməyib</th><th>Gecikmə</th><th>İşlənib</th></tr>'+R.map(function(r){return '<tr><td>'+esc(r.e.full_name)+'</td><td>'+r.plan+'</td><td>'+r.came+'</td><td>'+r.leave+'</td><td>'+r.absent+'</td><td>'+r.lateN+' / '+r.lateM+' dəq</td><td>'+Math.round(r.work/60)+' s</td></tr>';}).join('')+'</table>'+
  '<h2>Tapşırıqlar</h2><table><tr><th>İşçi</th><th>Açıq</th><th>Vaxtı keçmiş</th><th>Bu ay bitib</th></tr>'+EMPS.filter(function(e){return e.active;}).map(function(e){var x=t.filter(function(y){return y.assignee_id===e.id;});return '<tr><td>'+esc(e.full_name)+'</td><td>'+x.filter(function(y){return y.status!=='done';}).length+'</td><td>'+x.filter(function(y){return y.status!=='done'&&y.due&&y.due<d;}).length+'</td><td>'+x.filter(function(y){return y.done_at&&String(y.done_at).slice(0,7)===m;}).length+'</td></tr>';}).join('')+'</table></div>';
 $('repSheet').innerHTML=h;document.body.classList.add('printrep');setTimeout(function(){window.print();setTimeout(function(){document.body.classList.remove('printrep');},500);},300);});}


/* ---------- ELANLAR ---------- */
var ANN=[],ANNR=[],EVS=[];
function loadAnn(){return Promise.all([run(sb.from('office_announcements').select('*').order('pinned',{ascending:false}).order('created_at',{ascending:false}).limit(60)),run(sb.from('office_ann_reads').select('*'))]).then(function(r){ANN=r[0]||[];ANNR=r[1]||[];});}
function annRead(a){return EMP&&ANNR.some(function(x){return x.ann_id===a.id&&x.employee_id===EMP.id;});}
function renderNews(){loadAnn().then(function(){var act=EMPS.filter(function(e){return e.active;}).length;
 $('annList').innerHTML=ANN.length?ANN.map(function(a){var rd=ANNR.filter(function(x){return x.ann_id===a.id;});var unread=EMP&&!annRead(a);
  return '<div class="card ann'+(unread?' unread':'')+'"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><h3 style="margin:0">'+(a.pinned?'📌 ':'')+esc(a.title)+'</h3><div class="muted small">'+new Date(a.created_at).toLocaleString('az-AZ',{timeZone:TZ})+' · '+esc(profName(a.created_by))+'</div></div>'+(MGR?'<div class="row"><span class="pill p-mut" title="'+esc(rd.map(function(x){return empName(x.employee_id);}).join(', '))+'">👁 '+rd.length+'/'+act+'</span><button class="btn ghost sm" onclick="delAnn('+a.id+')">×</button></div>':'')+'</div><p style="white-space:pre-line;margin-top:10px">'+esc(a.body)+'</p>'+(unread?'<button class="btn sm" style="margin-top:10px" onclick="markAnn('+a.id+')">✓ Oxudum</button>':'')+'</div>';}).join(''):'<div class="card empty">Hələ elan yoxdur</div>';});}
function openAnn(){modal('<div class="mhead"><h3>Yeni elan</h3><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Başlıq</label><input id="aT"></div><div class="field"><label>Mətn</label><textarea id="aB" style="min-height:130px"></textarea></div><label class="row small" style="margin-bottom:6px"><input type="checkbox" id="aP"> Yuxarıda sabitlə</label><label class="row small" style="margin-bottom:12px"><input type="checkbox" id="aTg" checked> Hamının telefonuna bildiriş göndər (tətbiq, brauzer və Telegram)</label><div class="row" style="justify-content:flex-end"><button class="btn" onclick="saveAnn()">Paylaş</button></div>');}
function saveAnn(){var b={title:$('aT').value.trim(),body:$('aB').value.trim(),pinned:$('aP').checked,created_by:ME.user_id};if(!b.title)return toast('Başlıq yazın');var tg=$('aTg').checked;
 run(sb.from('office_announcements').insert(b).select().single()).then(function(a){closeModal();toast('Paylaşıldı');renderNews();if(tg)notify('announcement',{id:a.id});}).catch(err);}
function delAnn(id){if(!confirm('Elan silinsin?'))return;run(sb.from('office_announcements').delete().eq('id',id)).then(renderNews).catch(err);}
function markAnn(id){if(!EMP)return;run(sb.from('office_ann_reads').insert({ann_id:id,employee_id:EMP.id})).then(function(){ANNR.push({ann_id:id,employee_id:EMP.id});renderNews();renderTodayAnn();}).catch(err);}
function renderTodayAnn(){var c=$('tAnn');if(!c)return;loadAnn().then(function(){var u=ANN.filter(function(a){return EMP&&!annRead(a);});c.style.display=u.length?'':'none';if(u.length)c.innerHTML='<div class="row" style="justify-content:space-between"><h3 style="margin:0">📢 Oxunmamış elan: '+u.length+'</h3><button class="btn sm" onclick="show(\'news\')">Oxu</button></div><div class="muted small" style="margin-top:6px">'+esc(u[0].title)+'</div>';});}
/* ---------- TƏQVİM ---------- */
function dtl(ts){return new Date(ts).toLocaleString('az-AZ',{timeZone:TZ,weekday:'short',day:'numeric',month:'short'});}
function renderCal(){var from=new Date(Date.now()-864e5).toISOString();run(sb.from('office_events').select('*').gte('ends_at',from).order('starts_at').limit(100)).then(function(ev){EVS=ev;var by={};ev.forEach(function(x){var k=new Intl.DateTimeFormat('en-CA',{timeZone:TZ}).format(new Date(x.starts_at));(by[k]=by[k]||[]).push(x);});
 $('calList').innerHTML=Object.keys(by).length?Object.keys(by).sort().map(function(k){return '<div class="card"><h3>'+(k===today()?'Bu gün · ':'')+dtl(k+'T08:00:00Z')+'</h3>'+by[k].map(function(x){var mine=EMP&&(x.participants||[]).indexOf(EMP.id)>=0;return '<div class="evr'+(mine?' mine':'')+'"><div class="evt">'+hm(x.starts_at)+'<br><span class="muted small">'+hm(x.ends_at)+'</span></div><div style="flex:1"><b>'+esc(x.title)+'</b>'+(x.room?' <span class="pill p-acc">📍 '+esc(x.room)+'</span>':'')+'<div class="muted small">'+(x.participants||[]).map(empName).map(esc).join(', ')+(x.note?' · '+esc(x.note):'')+'</div></div>'+(MGR?'<button class="btn ghost sm" onclick="delEv('+x.id+')">×</button>':'')+'</div>';}).join('')+'</div>';}).join(''):'<div class="card empty">Yaxın günlərdə iclas yoxdur</div>';}).catch(err);}
function openEv(){if(!MGR){toast('İclası yalnız rəhbər təyin edə bilər');return;}var rooms=[];EVS.forEach(function(x){if(x.room&&rooms.indexOf(x.room)<0)rooms.push(x.room);});
 modal('<div class="mhead"><h3>Yeni iclas</h3><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Mövzu</label><input id="vT"></div>'+
  '<div class="grid g2"><div class="field"><label>Tarix</label><input id="vD" type="date" value="'+today()+'"></div><div class="field"><label>Otaq / yer</label><input id="vR" list="roomL" placeholder="Məs: İclas otağı 1"><datalist id="roomL">'+rooms.map(function(r){return '<option value="'+esc(r)+'">';}).join('')+'</datalist></div>'+
  '<div class="field"><label>Başlayır</label><input id="vS" type="time" value="10:00"></div><div class="field"><label>Bitir</label><input id="vE" type="time" value="11:00"></div></div>'+
  '<div class="field"><label>İştirakçılar</label><div class="days" id="vP">'+EMPS.filter(function(e){return e.active;}).map(function(e){return '<label><input type="checkbox" value="'+e.id+'"'+(EMP&&e.id===EMP.id?' checked':'')+'>'+esc(e.full_name)+'</label>';}).join('')+'</div></div>'+
  '<div class="field"><label>Qeyd</label><input id="vN"></div><div class="row" style="justify-content:flex-end"><button class="btn" onclick="saveEv()">Yadda saxla</button></div>');}
function saveEv(){var d=$('vD').value,st=bakuTs(d,$('vS').value),en=bakuTs(d,$('vE').value);if(!$('vT').value.trim()||!st||!en||en<=st)return toast('Mövzu və saatları düzgün yazın');
 var room=$('vR').value.trim();var clash=room&&EVS.find(function(x){return x.room===room&&x.starts_at<en&&x.ends_at>st;});if(clash&&!confirm('“'+room+'” bu saatda məşğuldur ('+clash.title+'). Yenə də saxlanılsın?'))return;
 var b={title:$('vT').value.trim(),room:room,starts_at:st,ends_at:en,note:$('vN').value.trim(),participants:[].slice.call(document.querySelectorAll('#vP input:checked')).map(function(x){return +x.value;}),created_by:ME.user_id};
 run(sb.from('office_events').insert(b).select().single()).then(function(x){closeModal();toast('İclas əlavə olundu');renderCal();notify('event',{id:x.id});}).catch(err);}
function delEv(id){if(!confirm('İclas silinsin?'))return;run(sb.from('office_events').delete().eq('id',id)).then(renderCal).catch(err);}
/* ---------- HR xatırlatmaları ---------- */
function daysTo(md){var t=today(),y=+t.slice(0,4);var d=y+'-'+md;if(d<t)d=(y+1)+'-'+md;return dDays(t,d)-1;}
function hrUpcoming(){var out=[],t=today();EMPS.filter(function(e){return e.active;}).forEach(function(e){if(e.birthday){var n=daysTo(e.birthday.slice(5));if(n<=30)out.push({n:n,txt:'🎂 '+e.full_name+' — ad günü',d:e.birthday.slice(5)});}
  if(e.probation_end&&e.probation_end>=t){var n2=dDays(t,e.probation_end)-1;if(n2<=30)out.push({n:n2,txt:'🧪 '+e.full_name+' — sınaq müddəti bitir',d:e.probation_end.slice(5)});}
  if(e.contract_end&&e.contract_end>=t){var n3=dDays(t,e.contract_end)-1;if(n3<=30)out.push({n:n3,txt:'📄 '+e.full_name+' — müqavilə bitir',d:e.contract_end.slice(5)});}});return out.sort(function(a,b){return a.n-b.n;});}
function renderHrBoxes(){var u=hrUpcoming();var p=$('pHr');if(p)p.innerHTML=u.length?u.map(function(x){return '<div class="row" style="justify-content:space-between;padding:6px 0"><span>'+esc(x.txt)+'</span><span class="pill '+(x.n===0?'p-ok':x.n<=7?'p-warn':'p-mut')+'">'+(x.n===0?'bu gün':x.n+' gün sonra')+' · '+x.d.slice(3)+'.'+x.d.slice(0,2)+'</span></div>';}).join(''):'<div class="empty">Yaxın 30 gündə yoxdur</div>';
 renderBdayCards();}


/* ---------- SAYTDAN MÜRACİƏTLƏR ---------- */
var LEADS=[];var SLA=30;
function minsBetween(a,b){return Math.round((new Date(b)-new Date(a))/60000);}
function renderLeads(){run(sb.from('lux_leads').select('*').order('created_at',{ascending:false}).limit(300)).then(function(L){LEADS=L;var f=$('ldF').value;$('ldF').onchange=renderLeads;
 var m=today().slice(0,7),now=new Date().toISOString();
 var list=L.filter(function(l){if(f==='open')return l.status==='yeni'&&(MGR||(EMP&&l.assigned_to===EMP.id));if(f==='mine')return EMP&&l.assigned_to===EMP.id;return true;});
 var mon=L.filter(function(l){return String(l.created_at).slice(0,7)===m;}),resp=mon.filter(function(l){return l.first_response_at&&l.assigned_at;});
 var avg=resp.length?Math.round(resp.reduce(function(s2,l){return s2+minsBetween(l.assigned_at,l.first_response_at);},0)/resp.length):0;
 var breach=mon.filter(function(l){return l.assigned_at&&((l.first_response_at&&minsBetween(l.assigned_at,l.first_response_at)>SLA)||(!l.first_response_at&&l.status==='yeni'&&minsBetween(l.assigned_at,now)>SLA));}).length;
 $('ldKpi').innerHTML=kpi(L.filter(function(l){return l.status==='yeni';}).length,'cavabsız',L.some(function(l){return l.status==='yeni';})?'bad':'ok')+kpi(mon.length,'bu ay müraciət')+kpi(hmin(avg),'orta cavab müddəti',avg>SLA?'warn':'ok')+kpi(breach,SLA+' dəq-dən gec cavab',breach?'warn':'ok');
 $('ldList').innerHTML=list.length?list.map(function(l){var wait=l.status==='yeni'&&l.assigned_at?minsBetween(l.assigned_at,now):null;var ph=String(l.phone||'').replace(/[^\d+]/g,'');
  return '<div class="card lead'+(wait!==null&&wait>SLA?' breach':'')+'"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><b style="font-size:16px">'+esc(l.name||'—')+'</b> '+(l.status==='yeni'?'<span class="pill p-bad">cavabsız'+(wait!==null?' · '+hmin(wait):'')+'</span>':'<span class="pill p-ok">cavablandı'+(l.first_response_at&&l.assigned_at?' · '+hmin(minsBetween(l.assigned_at,l.first_response_at)):'')+'</span>')+
   '<div class="muted small">'+new Date(l.created_at).toLocaleString('az-AZ',{timeZone:TZ})+(l.subject?' · '+esc(l.subject):'')+(l.apartment?' · 🏠 '+esc(l.apartment):'')+'</div></div>'+
   '<div class="row">'+(ph?'<a class="btn sm" href="tel:'+esc(ph)+'">📞 Zəng</a><a class="btn ghost sm" target="_blank" rel="noopener" href="https://wa.me/'+esc(ph.replace('+',''))+'">WhatsApp</a>':'')+(l.status==='yeni'?'<button class="btn ghost sm" onclick="leadDone(\''+l.id+'\')">✓ Cavablandı</button>':'')+'</div></div>'+
   (l.message?'<p style="margin-top:8px;white-space:pre-line">'+esc(l.message)+'</p>':'')+'<div class="row small muted" style="margin-top:8px">Məsul: '+(MGR?'<select onchange="leadAssign(\''+l.id+'\',this.value)" class="btn ghost sm"><option value="">— yoxdur —</option>'+EMPS.filter(function(e){return e.active;}).map(function(e){return '<option value="'+e.id+'"'+(e.id===l.assigned_to?' selected':'')+'>'+esc(e.full_name)+'</option>';}).join('')+'</select>':'<b>'+esc(empName(l.assigned_to))+'</b>')+'</div></div>';}).join(''):'<div class="card empty">'+(f==='open'?'Cavabsız müraciət yoxdur 👏':'Müraciət yoxdur')+'</div>';
 if(MGR){var rot=EMPS.filter(function(e){return e.active&&(e.lead_rotation||mon.some(function(l){return l.assigned_to===e.id;}));});
  $('ldMgr').innerHTML=rot.length?'<table><tr><th>Menecer</th><th>Müraciət</th><th>Cavabsız</th><th>Orta cavab</th><th>Növbədə</th></tr>'+rot.map(function(e){var x=mon.filter(function(l){return l.assigned_to===e.id;}),r=x.filter(function(l){return l.first_response_at&&l.assigned_at;});var a=r.length?Math.round(r.reduce(function(s2,l){return s2+minsBetween(l.assigned_at,l.first_response_at);},0)/r.length):null;
   return '<tr><td><b>'+esc(e.full_name)+'</b></td><td>'+x.length+'</td><td>'+(x.filter(function(l){return l.status==='yeni';}).length||'0')+'</td><td>'+(a===null?'—':hmin(a))+'</td><td>'+(e.lead_rotation?'<span class="pill p-ok">bəli</span>':'<span class="pill p-mut">xeyr</span>')+'</td></tr>';}).join('')+'</table>':'<div class="empty">Növbədə menecer yoxdur. İşçilər → işçi kartında “müraciətləri növbə ilə payla” işarələyin.</div>';}
 }).catch(err);}
function leadDone(id){run(sb.from('lux_leads').update({status:'cavablandı'}).eq('id',id)).then(function(){toast('Qeyd olundu');renderLeads();}).catch(err);}
function leadAssign(id,eid){run(sb.from('lux_leads').update({assigned_to:+eid||null,assigned_at:new Date().toISOString(),sla_alerted:false}).eq('id',id)).then(function(){toast('Təyin olundu');if(eid)notify('lead_reassigned',{id:id});renderLeads();}).catch(err);}


/* ---------- AYLIQ PLAN ---------- */
var PLANS=[],PLI=[];
function nextMonth(m){var y=+m.slice(0,4),mo=+m.slice(5,7)+1;if(mo>12){mo=1;y++;}return y+'-'+String(mo).padStart(2,'0');}
function planPct(p){var it=(p&&p.items)||[];if(!it.length)return 0;return Math.round(it.filter(function(x){return x.done;}).length/it.length*100);}
var PST={draft:['qaralama','p-mut'],submitted:['təsdiq gözləyir','p-warn'],approved:['təsdiqlənib','p-ok'],returned:['düzəlişə qaytarılıb','p-bad']};
function loadPlans(m){return run(sb.from('office_plans').select('*').eq('month',m)).then(function(r){var ex={};EMPS.forEach(function(e){if(e.plan_required===false)ex[e.id]=1;});PLANS=(r||[]).filter(function(p){return !ex[p.employee_id];});return PLANS;});}
function bar(p){return '<div class="pbar"><i style="width:'+p+'%;background:'+(p>=80?'var(--ok)':p>=40?'var(--warn)':'var(--bad)')+'"></i></div>';}
function renderPlans(){var mi=$('plM');var b=plBounds();if(!mi.value||mi.value<b[0]||mi.value>b[1])mi.value=today().slice(0,7);
 // Rəhbər: təsdiq gözləyən plan başqa aydadırsa, o aya keç (bir dəfə)
 if(MGR&&!renderPlans._did){renderPlans._did=1;
  run(sb.from('office_plans').select('month').eq('status','submitted').gte('month',b[0]).lte('month',b[1]).order('month',{ascending:false}).limit(1)).then(function(r){
   if(r&&r[0]&&r[0].month&&r[0].month!==mi.value){mi.value=r[0].month;renderPlans();}}).catch(function(){});}
 var m=mi.value;plNav();var lb=$('plML');if(lb)lb.textContent=mLabel(m);
 $('plH').textContent=MGR?'Aylıq iş planları':'Mənim aylıq planım';
 loadPlans(m).then(function(){if(MGR)return renderPlansMgr(m);renderPlanMine(m);}).catch(err);}
function mAdd(m,k){var y=+m.slice(0,4),mo=+m.slice(5,7)+k;while(mo<1){mo+=12;y--;}while(mo>12){mo-=12;y++;}return y+'-'+String(mo).padStart(2,'0');}
function plBounds(){var c=today().slice(0,7);return [mAdd(c,-1),mAdd(c,1)];}
function plShift(k){var m=$('plM').value||today().slice(0,7),n=mAdd(m,k),b=plBounds();if(n<b[0]||n>b[1])return;$('plM').value=n;renderPlans();}
function plNav(){var m=$('plM').value,b=plBounds(),bt=document.querySelectorAll('.msw button');if(bt.length<2)return;bt[0].disabled=m<=b[0];bt[1].disabled=m>=b[1];}
function renderPlanMine(m){$('plKpi').innerHTML='';var lb=$('plML');if(lb)lb.textContent=mLabel(m);if(!EMP){$('plBody').innerHTML='<div class="card empty">Hesabınız işçi kartına bağlanmayıb. HR rəhbərinə müraciət edin.</div>';return;}
 var cur=today().slice(0,7),past=m<cur,p=PLANS.find(function(x){return x.employee_id===EMP.id;});PLI=JSON.parse(JSON.stringify((p&&p.items)||[]));if((!p||!p.items||!p.items.length)&&m>=cur){var pr=mAdd(m,-1);run(sb.from('office_plans').select('items').eq('employee_id',EMP.id).eq('month',pr).maybeSingle()).then(function(r){var rec=((r&&r.data&&r.data.items)||[]).filter(function(x){return x.rec;}).map(function(x){return {t:x.t,done:false,note:'',rec:true};});if(rec.length&&(!PLI.length)){PLI=rec;drawPlanItems(true,false);plDirty();toast(rec.length+' mütəmadi iş keçən aydan gətirildi');}}).catch(function(){});}
 PL_SAVED=JSON.stringify(((p&&p.items)||[]).map(function(x){return (x.t||'').trim();}));PL_ST=p?p.status:'none';
 var st=p?p.status:'none',edit=!past&&(st==='none'||st==='draft'||st==='returned'),prog=(st==='approved'||st==='submitted')&&!past&&m<=mAdd(cur,1),h='<div class="card">';
 var steps=[['Yaz',st==='none'||st==='draft'||st==='returned'],['Rəhbərə göndər',st==='submitted'],['Təsdiq',st==='approved']];
 h+='<div class="plsteps">'+steps.map(function(x,i){var done=(st==='submitted'&&i<1)||(st==='approved'&&i<2);return '<span class="'+(x[1]?'on':done?'ok':'')+'"><i>'+(done?'✓':i+1)+'</i>'+x[0]+'</span>';}).join('<em></em>')+'</div>';
 if(st==='none'&&!past)h+='<p class="plinfo">'+mLabel(m)+' ayında görəcəyiniz işlərin siyahısını yazın. Hazır olanda <b>“Rəhbərə göndər”</b> basın.</p>';
 if(st==='draft'&&!past)h+='<p class="plinfo">Qaralama yadda saxlanılıb, amma <b>hələ rəhbərə göndərilməyib</b>.</p>';
 if(st==='returned')h+='<div class="note bad">↩️ <b>Rəhbər planı düzəlişə qaytarıb.</b>'+(p.mgr_note?'<br>Qeyd: '+esc(p.mgr_note):'')+'<br>Düzəldin və yenidən göndərin.</div>';
 if(st==='submitted')h+='<div class="note">⏳ <b>Planınız rəhbərə göndərilib və təsdiq gözləyir.</b> Rəhbər təsdiqləyənə qədər bəndləri düzəldə bilərsiniz — sonra “Yenilənmiş planı göndər” basın.</div>';
 if(st==='approved')h+='<div class="row sp" style="margin:4px 0 6px"><span class="muted small">Gördüyünüz işi işarələyin — dəyişiklik avtomatik yadda saxlanılır.</span><b>'+planPct(p)+'% icra</b></div>'+bar(planPct(p))+(p.mgr_note?'<div class="note">💬 Rəhbərin qeydi: '+esc(p.mgr_note)+'</div>':'');
 if(past&&st==='none')h+='<p class="muted">Bu ay üçün plan verilməyib.</p>';
 if(past&&st!=='none'&&st!=='approved')h+='<p class="muted small">Ay bitib — plan artıq dəyişdirilə bilməz.</p>';
 h+='<div id="plItems" style="margin-top:10px"></div>';
 if(edit)h+='<div class="row" style="margin-top:10px"><input id="plNew" class="plin" style="flex:1" placeholder="Yeni iş, məs: 20 müştəri ilə görüş" oninput="plDirty()" onkeydown="if(event.key===\'Enter\'){event.preventDefault();plAdd();}"><button class="btn ghost sm" onclick="plAdd()">+ Əlavə et</button></div>'+'<div class="row" style="margin-top:8px;gap:8px"><input type="file" id="plXlsx" accept=".xlsx,.xls,.csv" style="display:none" onchange="plImportXlsx(this.files[0])"><button class="btn ghost sm" onclick="plPickXlsx()">📄 Excel-dən yüklə</button><span class="muted small" style="align-self:center">hər sətir bir iş</span></div>'+
  '<div class="row" style="justify-content:flex-end;margin-top:16px">'+(st==='submitted'?'':'<button class="btn ghost" onclick="savePlan(\''+m+'\',\'draft\')">Qaralama saxla</button>')+'<button class="btn" id="plSend" onclick="savePlan(\''+m+'\',\'submitted\')">'+(st==='returned'?'Düzəldib yenidən göndər':st==='submitted'?'Yenilənmiş planı göndər':'Rəhbərə göndər')+'</button></div>';
 
 h+='</div>';
 if(m===cur&&+today().slice(8)>=20){var nm=nextMonth(m);h+='<div class="card"><b>'+mLabel(nm)+'</b><p class="muted small">Növbəti ayın planını indidən hazırlaya bilərsiniz.</p><button class="btn ghost sm" onclick="$(\'plM\').value=\''+nm+'\';renderPlans()">'+mLabel(nm)+' planını yaz →</button></div>';}
 $('plBody').innerHTML=h;drawPlanItems(edit,prog,st==='approved'&&!prog);plDirty();}
function drawPlanItems(edit,prog,ro){var b=$('plItems');if(!b)return;
 b.innerHTML=PLI.length?PLI.map(function(x,i){
  if(edit)return '<div class="pli"><span class="pln">'+(i+1)+'.</span><input class="plin plin-e" value="'+esc(x.t)+'" oninput="PLI['+i+'].t=this.value.trim();plDirty()"><button class="recbtn'+(x.rec?' on':'')+'" title="'+(x.rec?'Mütəmadi — hər ay təkrarlanır':'Birdəfəlik iş')+'" onclick="PLI['+i+'].rec=!PLI['+i+'].rec;drawPlanItems(true,false);plDirty()">'+(x.rec?'🔁':'1️⃣')+'</button><button title="Sil" onclick="PLI.splice('+i+',1);drawPlanItems(true,false);plDirty()">×</button></div>';
  if(prog)return '<div class="pli"><input type="checkbox"'+(x.done?' checked':'')+' onchange="PLI['+i+'].done=this.checked;planAutoSave()"><div style="flex:1"><div'+(x.done?' style="text-decoration:line-through;color:var(--mut)"':'')+'>'+(x.rec?'<span class="rectag">🔁</span> ':'')+esc(x.t)+'</div>'+
   (x.note?'<div class="small muted" onclick="plNote('+i+')" style="cursor:pointer">💬 '+esc(x.note)+'</div>':'<button class="linkbtn" onclick="plNote('+i+')">+ qeyd</button>')+'</div></div>';
  return '<div class="pli"><span class="pln">'+(ro&&x.done?'✅':(i+1)+'.')+'</span><div style="flex:1">'+esc(x.t)+(x.note?'<div class="small muted">💬 '+esc(x.note)+'</div>':'')+'</div></div>';}).join('')
  :'<div class="muted small">'+(edit?'Hələ bənd yoxdur. Aşağıda yazıb “+ Əlavə et” basın.':'Bənd yoxdur')+'</div>';}
function plNote(i){var v=prompt('Qeyd (məs: 43 görüş oldu)',PLI[i].note||'');if(v===null)return;PLI[i].note=v.trim();planAutoSave();}
var _plT;function planAutoSave(){drawPlanItems(false,true);clearTimeout(_plT);_plT=setTimeout(function(){var ex=PLANS.find(function(x){return EMP&&x.employee_id===EMP.id;});if(!ex)return;
 run(sb.from('office_plans').update({items:PLI}).eq('id',ex.id).select().single()).then(function(p2){var i=PLANS.indexOf(ex);PLANS[i]=p2;toast('Yadda saxlanıldı · '+planPct(p2)+'% icra');renderPlanMine($('plM').value);}).catch(err);},500);}
function planRecall(m){if(!confirm('Plan rəhbərdən geri çağırılsın? Dəyişdikdən sonra yenidən göndərməlisiniz.'))return;var ex=PLANS.find(function(x){return EMP&&x.employee_id===EMP.id;});
 run(sb.from('office_plans').update({status:'draft'}).eq('id',ex.id)).then(function(){toast('Geri çağırıldı — indi dəyişə bilərsiniz');renderPlans();}).catch(err);}
function plAdd(){var v=$('plNew').value.trim();if(!v)return;PLI.push({t:v,done:false,note:''});$('plNew').value='';drawPlanItems(true,false);plDirty();$('plNew').focus();}

function plPickXlsx(){var el=document.getElementById('plXlsx');if(el){el.value='';el.click();}}
function plImportXlsx(file){if(!file)return;
 function cellTxt(v){return (v==null?'':String(v)).replace(/\s+/g,' ').trim();}
 function isNoise(t){ // sıra nömrəsi, başlıq, boş — plan deyil
  if(!t)return true;
  if(/^\d{1,3}[.\)]?$/.test(t))return true;        // "1", "2.", "3)"
  if(/^(№|no|nömrə|sira|s\/n|#)$/i.test(t))return true;
  if(/^(i[sş]|plan|v[əe]zif[əe]|tap[sş][ıi]r[ıi]q|ad|work|task|status|qeyd|m[əe]bl[əe][ğg]|tarix|month|ay|i[şs]l[əe]r|g[öo]r[üu]l[əe]c[əe]k)$/i.test(t))return true;
  return false;
 }
 function recOf(t){return /m[üu]t[əe]madi|t[əe]krar|h[əe]r ay|daimi|recurring|monthly/i.test(t);}
 function parseGrid(grid){
  // boş sətirləri at
  grid=grid.filter(function(r){return r&&r.some(function(c){return cellTxt(c);});});
  if(!grid.length){toast('Fayl boşdur');return;}
  // ən çox "mətn" (hərf olan, uzun) xanası olan sütunu tap = plan sütunu
  var maxCols=0;grid.forEach(function(r){if(r.length>maxCols)maxCols=r.length;});
  var score=[];
  for(var c=0;c<maxCols;c++){score[c]=0;
   grid.forEach(function(r){var t=cellTxt(r[c]);if(t&&!isNoise(t)&&/[a-zA-ZəĞğÜüÖöÇçŞşİıÀ-ÿ]/.test(t)&&t.length>=4)score[c]+=t.length;});
  }
  var planCol=0,best=-1;score.forEach(function(v,c){if(v>best){best=v;planCol=c;}});
  if(best<=0){toast('Faylda iş mətni tapılmadı');return;}
  // status sütunu: mütəmadi/təkrar sözləri olan başqa sütun
  var statusCol=-1;
  for(var c=0;c<maxCols;c++){if(c===planCol)continue;var hit=0;grid.forEach(function(r){if(recOf(cellTxt(r[c])))hit++;});if(hit>0){statusCol=c;break;}}
  var added=0;
  grid.forEach(function(r){
   var t=cellTxt(r[planCol]);
   if(!t||isNoise(t))return;
   var rec=statusCol>=0?recOf(cellTxt(r[statusCol])):recOf(r.map(cellTxt).join(' '));
   PLI.push({t:t.slice(0,300),done:false,note:'',rec:rec});added++;
  });
  if(added>0){drawPlanItems(true,false);plDirty();toast(added+' iş əlavə olundu ✅');}
  else toast('İş tapılmadı. Faylda işlərin adını yoxlayın.');
 }
 var ext=(file.name||'').toLowerCase();
 var reader=new FileReader();
 reader.onload=function(e){
  try{
   var grid;
   if(ext.endsWith('.csv')){
    var text=e.target.result;
    grid=text.split(/\r?\n/).map(function(ln){var sep=ln.indexOf(';')>=0&&ln.indexOf(',')<0?';':',';return ln.split(sep).map(function(c){return c.replace(/^"|"$/g,'');});});
   }else{
    if(!window.XLSX){toast('Excel oxuyucu yüklənmədi, yenidən cəhd edin');return;}
    var wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});
    var sh=wb.Sheets[wb.SheetNames[0]];
    grid=XLSX.utils.sheet_to_json(sh,{header:1,raw:false,defval:''});
   }
   parseGrid(grid||[]);
  }catch(err){toast('Fayl oxunmadı: '+(err.message||err));}
 };
 if(ext.endsWith('.csv'))reader.readAsText(file,'utf-8');
 else reader.readAsArrayBuffer(file);
}

var PL_SAVED='[]',PL_ST='none';
function plDirty(){var b=$('plSend');if(!b)return;var nv=$('plNew'),cur=JSON.stringify(PLI.map(function(x){return (x.t||'').trim();}).filter(Boolean).concat(nv&&nv.value.trim()?[nv.value.trim()]:[]));
 if(PL_ST==='submitted'){var ch=cur!==PL_SAVED;b.disabled=!ch;b.textContent=ch?'Yenilənmiş planı göndər':'✓ Göndərilib — dəyişiklik yoxdur';}}
function savePlan(m,st,eid){eid=eid||(EMP&&EMP.id);var nv=$('plNew');if(nv&&nv.value.trim()){PLI.push({t:nv.value.trim(),done:false,note:''});nv.value='';}
 PLI=PLI.filter(function(x){return x.t&&x.t.trim();});if(!PLI.length&&st!=='draft')return toast('Ən azı bir bənd yazın');
 if(st==='submitted'&&!MGR&&!confirm(PLI.length+' bəndlik plan rəhbərə göndərilsin?'))return;
 var ex=PLANS.find(function(x){return x.employee_id===eid;});var b={items:PLI};if(!ex||ex.status!=='approved'||MGR)b.status=st;if(st==='submitted')b.submitted_at=new Date().toISOString();
 var sbtn=$('plSend');if(sbtn){if(sbtn.disabled&&st==='submitted')return;sbtn.disabled=true;}
 var q=ex?sb.from('office_plans').update(b).eq('id',ex.id).select().single():sb.from('office_plans').insert(Object.assign(b,{employee_id:eid,month:m})).select().single();
 run(q).catch(function(e){if(sbtn)sbtn.disabled=false;throw e;}).then(function(p){toast(st==='submitted'?(ex&&ex.status==='submitted'?'Yenilənmiş plan rəhbərə göndərildi ✅':'Rəhbərə göndərildi ✅'):'Qaralama yadda saxlanıldı');if(st==='submitted')notify('plan_submitted',{id:p.id});closeModal();renderPlans();}).catch(err);}
function renderPlansMgr(m){var act=EMPS.filter(function(e){return e.active&&e.plan_required!==false;});var by={};PLANS.forEach(function(p){by[p.employee_id]=p;});
 var sub=act.filter(function(e){var p=by[e.id];return p&&(p.status==='submitted'||p.status==='approved');}).length,appr=PLANS.filter(function(p){return p.status==='approved';}),avg=appr.length?Math.round(appr.reduce(function(s2,p){return s2+planPct(p);},0)/appr.length):0;
 $('plKpi').innerHTML=kpi(sub+' / '+act.length,'plan verib','ok')+kpi(PLANS.filter(function(p){return p.status==='submitted';}).length,'təsdiq gözləyir','warn')+kpi(act.length-sub,'plan verməyib',act.length-sub?'bad':'ok')+kpi(avg+'%','orta icra');
 $('plBody').innerHTML='<div class="card tbl"><table><tr><th>İşçi</th><th>Status</th><th>Bənd</th><th>İcra</th><th></th></tr>'+act.map(function(e){var p=by[e.id];var st=p?p.status:null;
   return '<tr><td><b>'+esc(e.full_name)+'</b><div class="muted small">'+esc((posOf(e)||{}).title||'')+'</div></td><td>'+(st?'<span class="pill '+PST[st][1]+'">'+PST[st][0]+'</span>':'<span class="pill p-bad">verməyib</span>')+'</td><td>'+(p?(p.items||[]).length:'—')+'</td><td style="min-width:120px">'+(st==='approved'?bar(planPct(p))+'<span class="small">'+planPct(p)+'%</span>':'—')+'</td><td>'+(p?'<button class="btn '+(st==='submitted'?'':'ghost ')+'sm" onclick="openPlan('+e.id+',\''+m+'\')">'+(st==='submitted'?'Bax və təsdiqlə':'Bax')+'</button>':'<button class="btn ghost sm" onclick="openPlan('+e.id+',\''+m+'\')">Yaz</button>')+'</td></tr>';}).join('')+'</table></div>';}
function openPlan(eid,m){var p=PLANS.find(function(x){return x.employee_id===eid;});PLI=JSON.parse(JSON.stringify((p&&p.items)||[]));var st=p?p.status:'none';
 modal('<div class="mhead"><h3>'+esc(empName(eid))+' · '+m+'</h3><button class="x" onclick="closeModal()">×</button></div>'+(p?'<span class="pill '+PST[st][1]+'">'+PST[st][0]+'</span>':'')+(st==='approved'?bar(planPct(p)):'')+
  '<div id="plItems" style="margin-top:10px"></div><div class="row" style="margin-top:8px"><input id="plNew" class="plin" placeholder="Bənd əlavə et"><button class="btn ghost sm" onclick="plAdd()">+</button></div>'+
  '<div class="field" style="margin-top:12px"><label>Rəhbərin qeydi</label><input id="plNote" value="'+esc(p&&p.mgr_note||'')+'" placeholder="məs: 3-cü bəndi dəqiqləşdirin"></div>'+
  '<div class="row" style="justify-content:flex-end">'+(p?'<button class="btn red" onclick="decidePlan('+eid+',\''+m+'\',\'returned\')">↩ Düzəlişə qaytar</button>':'')+'<button class="btn" onclick="decidePlan('+eid+',\''+m+'\',\'approved\')">✓ Təsdiqlə'+(st==='approved'?' / yadda saxla':'')+'</button></div>');
 drawPlanItems(true,st==='approved');}
function decidePlan(eid,m,st){var p=PLANS.find(function(x){return x.employee_id===eid;});if(!PLI.length)return toast('Planda bənd yoxdur');
 var b={items:PLI,status:st,mgr_note:$('plNote').value.trim()};if(st==='approved'&&(!p||p.status!=='approved')){b.approved_by=ME.user_id;b.approved_at=new Date().toISOString();}
 run(p?sb.from('office_plans').update(b).eq('id',p.id).select().single():sb.from('office_plans').insert(Object.assign(b,{employee_id:eid,month:m})).select().single()).then(function(np){closeModal();toast(st==='approved'?'Təsdiqləndi':'Qaytarıldı');if(!p||p.status!==st)notify('plan_decided',{id:np.id});renderPlans();}).catch(err);}
/* ---------- NƏZARƏT (sahibkar üçün sadə ekran) ---------- */
function renderOutingsCard(id,d){var box=$(id);if(!box)return;run(sb.from('office_outings').select('*').eq('day',d).order('out_at')).then(function(os){if(!os.length){box.innerHTML='';return;}
 box.innerHTML='<div class="card" style="margin-top:14px"><h3 style="margin:0 0 8px">🚶 Bu gün ofisdən çıxışlar</h3>'+os.map(function(o){var e=EMPS.find(function(x){return x.id===o.employee_id;})||{full_name:'—'};return '<div class="row" style="justify-content:space-between;gap:8px;padding:8px 0;border-top:1px solid var(--line);flex-wrap:wrap"><div><b>'+esc(e.full_name)+'</b><div class="small muted">'+(o.kind==='is'?'💼 işlə bağlı':'🙋 şəxsi')+' · '+hm(o.out_at)+'–'+(o.back_at?hm(o.back_at):'<b style="color:var(--warn)">çöldədir</b>')+' · '+esc(o.note)+(o.arrive_at?' · 📍 çatıb '+hm(o.arrive_at):'')+'</div></div><button class="btn sm" onclick="openRoute('+o.id+')">🗺 Marşrut</button></div>';}).join('')+'</div>';}).catch(function(){});}
function renderBoss(){renderOutingsCard('bOut',today());return renderBoss0.apply(this,arguments);}
function renderBoss0(){var d=today(),m=d.slice(0,7);$('bDate').textContent=new Date().toLocaleDateString('az-AZ',{timeZone:TZ,weekday:'long',day:'numeric',month:'long'});
 Promise.all([run(sb.from('office_attendance').select('*').eq('day',d)),loadPlans(m),run(sb.from('office_attendance').select('employee_id,late_min').gte('day',m+'-01').lte('day',d)),run(sb.from('lux_leads').select('id,status')).catch(function(){return [];})]).then(function(r){var att=r[0],ma=r[2],leads=r[3]||[];
  var act=EMPS.filter(function(e){return e.active;});var work=act.filter(function(e){return (e.workdays||[]).indexOf(isoDow(d))>=0&&!isHol(d)&&!leaveOn(e.id,d);});
  var came=att.filter(function(a){return a.check_in;}),late=came.filter(function(a){return a.late_min>0;}),absent=work.filter(function(e){return !came.some(function(a){return a.employee_id===e.id;});});
  var appr=PLANS.filter(function(p){return p.status==='approved';}),avg=appr.length?Math.round(appr.reduce(function(s2,p){return s2+planPct(p);},0)/appr.length):0;
  var over=TASKS.filter(function(t){return t.status!=='done'&&t.due&&t.due<d;}).length,openL=leads.filter(function(l){return l.status==='yeni';}).length;
  function tile(v,l,c,go){return '<div class="btile '+(c||'')+'"'+(go?' onclick="show(\''+go+'\')"':'')+'><b>'+v+'</b><span>'+l+'</span></div>';}
  $('bKpi').innerHTML=tile(came.length+' / '+work.length,'bu gün işdədir','ok','team')+tile(late.length,'gecikib',late.length?'warn':'ok','team')+tile(absent.length,'gəlməyib',absent.length?'bad':'ok','team')+tile(avg+'%','aylıq plan icrası',avg>=70?'ok':avg>=40?'warn':'bad','plans')+tile(over,'vaxtı keçmiş tapşırıq',over?'bad':'ok','tasks')+(leads.length?tile(openL,'cavabsız müraciət',openL?'warn':'ok'):'');
  $('bList').innerHTML=act.map(function(e){var a=att.find(function(x){return x.employee_id===e.id;});var lv=leaveOn(e.id,d);var p=PLANS.find(function(x){return x.employee_id===e.id;});var ln=ma.filter(function(x){return x.employee_id===e.id&&x.late_min>0;}).length;
   var stt=lv?'<span class="pill p-acc">'+LT[lv.type]+'</span>':a&&a.check_in?(a.late_min?'<span class="pill p-warn">'+hm(a.check_in)+' · '+a.late_min+' dəq gec</span>':'<span class="pill p-ok">'+hm(a.check_in)+' · vaxtında</span>'):(work.indexOf(e)>=0?'<span class="pill p-bad">gəlməyib</span>':'<span class="pill p-mut">istirahət</span>');
   var pp=p&&p.status==='approved'?planPct(p):null;
   return '<div class="brow" onclick="perfCard('+e.id+')"><div class="bn"><b>'+esc(e.full_name)+demoTag(e)+'</b><span>'+esc((posOf(e)||{}).title||'')+'</span></div><div class="bs">'+stt+'</div><div class="bp">'+(pp===null?'<span class="muted small">'+(p?PST[p.status][0]:'plan yoxdur')+'</span>':bar(pp)+'<span class="small">plan '+pp+'%</span>')+'</div><div class="bl">'+(ln?'<span class="pill p-warn">bu ay '+ln+' gecikmə</span>':'<span class="pill p-ok">gecikmə yoxdur</span>')+'</div></div>';}).join('')||'<div class="card empty">Ştatda işçi yoxdur</div>';
 }).catch(err);}


function clearDemo(){if(!confirm('Bütün demo işçilər və onlara aid məlumatlar silinsin? Real məlumatlara toxunulmayacaq.'))return;
 sb.rpc('office_demo_clear').then(function(r){if(r.error)throw r.error;toast((r.data||0)+' demo işçi silindi');return loadAll();}).then(function(){renderSet();}).catch(err);}
function demoTag(e){return e&&e.demo?' <span class="pill p-mut" style="font-size:10px">demo</span>':'';}


/* ---------- SAHİBKAR: çox sadə, yalnız baxış ---------- */
var OWN={};
function grade(r,pp,over){var pts=0;var att=r.plan?(r.came+r.leave)/r.plan:1;if(att>=0.95)pts+=2;else if(att>=0.85)pts+=1;
 if(r.lateN<=1)pts+=2;else if(r.lateN<=4)pts+=1;if(pp===null)pts+=1;else if(pp>=70)pts+=2;else if(pp>=40)pts+=1;if(!over)pts+=2;else if(over<=1)pts+=1;
 return pts>=7?['Yaxşı','g-ok']:pts>=4?['Orta','g-warn']:['Zəif','g-bad'];}
function renderOwner(){var d=today(),m=d.slice(0,7);var ac=$('bAsst');if(ac)ac.innerHTML='<div class="card asst" style="cursor:pointer" onclick="show(\'asst\')"><div class="row sp"><b>🎯 Səsli assistent</b><span class="go">›</span></div><div class="muted small" style="margin-top:4px">Planlarınızı səslə deyin, xatırlatma alın</div></div>';renderOutingsCard('bOut',d);
 $('bDate').textContent=new Date().toLocaleDateString('az-AZ',{timeZone:TZ,weekday:'long',day:'numeric',month:'long',year:'numeric'});
 var hs=document.querySelectorAll('#v-boss .bossh');var hr=+new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',hour12:false}).format(new Date());var gr=hr>=5&&hr<12?'Sabahınız xeyir':hr>=12&&hr<17?'Günortanız xeyir':'Axşamınız xeyir';var nm=PREVIEW?'Afiq Rəhmanov':(ME.full_name||'Afiq Rəhmanov');hs[0].textContent=gr+', '+nm;var hb=$('ownGiveBtn');if(!hb){hb=document.createElement('button');hb.id='ownGiveBtn';hb.className='btn givebtn';hb.textContent='✍️ Tapşırıq ver';hb.onclick=function(){ownTaskModal();};hs[0].parentNode.insertBefore(hb,hs[0].nextSibling);}if(hs[1])hs[1].parentNode.style.display='none';
 var pm=document.querySelector('#v-boss > p.muted');if(pm)pm.style.display='none';$('bList').innerHTML='';
 Promise.all([run(sb.from('office_attendance').select('*').gte('day',m+'-01').lte('day',d)),loadPlans(m),loadChart()]).then(function(r){var matt=r[0],att=matt.filter(function(a){return a.day===d;});
  monthRows(function(R){var act=EMPS.filter(function(e){return e.active;});
   var work=act.filter(function(e){return (e.workdays||[]).indexOf(isoDow(d))>=0&&!isHol(d)&&!leaveOn(e.id,d);});
   var came=att.filter(function(a){return a.check_in;}),late=came.filter(function(a){return a.late_min>0;}),absent=work.filter(function(e){return !came.some(function(a){return a.employee_id===e.id;});}),onLv=act.filter(function(e){return leaveOn(e.id,d);});
   var rows=act.map(function(e){var rr=R.find(function(x){return x.e.id===e.id;})||{plan:0,came:0,leave:0,lateN:0,lateM:0,absent:0,work:0};var p=PLANS.find(function(x){return x.employee_id===e.id;});var pp=p&&p.status==='approved'?planPct(p):null;
    var tk=TASKS.filter(function(t){return t.assignee_id===e.id;}),over=tk.filter(function(t){return t.status!=='done'&&t.due&&t.due<d;}),open=tk.filter(function(t){return t.status!=='done';}),doneM=tk.filter(function(t){return t.done_at&&String(t.done_at).slice(0,7)===m;});
    var a=att.find(function(x){return x.employee_id===e.id;});return {e:e,r:rr,p:p,pp:pp,over:over,open:open,doneM:doneM,a:a,g:grade(rr,pp,over.length)};});
   OWN={late:late,absent:absent,onLv:onLv,rows:rows,matt:matt};
   var appr=rows.filter(function(x){return x.pp!==null;}),avg=appr.length?Math.round(appr.reduce(function(s2,x){return s2+x.pp;},0)/appr.length):0,overAll=rows.reduce(function(s2,x){return s2+x.over.length;},0);
   var monLate=R.reduce(function(s2,x){return s2+x.lateN;},0),monLateM=R.reduce(function(s2,x){return s2+x.lateM;},0),monAbs=R.reduce(function(s2,x){return s2+x.absent;},0);
   function tile(v,l,sub,c,k){return '<div class="btile '+c+'" onclick="ownList(\''+k+'\')"><b>'+v+'</b><span>'+l+'</span>'+(sub?'<small>'+sub+'</small>':'')+'</div>';}
   $('bKpi').innerHTML=tile(came.length+'/'+work.length,'nəfər bu gün işdədir',onLv.length?'Bundan başqa '+onLv.length+' nəfər icazəlidir':'','ok','came')+tile(late.length,'nəfər bu gün gecikib','Bu ay bütün işçilər birlikdə '+monLate+' dəfə gecikib (cəmi '+hmin(monLateM)+')',late.length?'warn':'ok','late')+tile(absent.length,'nəfər bu gün gəlməyib',monAbs?'Bu ay bütün işçilər birlikdə cəmi '+monAbs+' gün xəbərsiz gəlməyib':'Bu ay xəbərsiz gəlməyən olmayıb',absent.length?'bad':'ok','absent')+
    tile(avg+'%','aylıq planlar yerinə yetirilib',act.length+' işçidən '+appr.length+'-nin planı təsdiqlənib',avg>=70?'ok':avg>=40?'warn':'bad','plans')+tile(overAll,'işin son tarixi keçib','Hələ bitməmiş '+TASKS.filter(function(t){return t.status!=='done';}).length+' işdən '+overAll+'-i gecikir',overAll?'bad':'ok','over')+tile(TASKS.filter(function(t){return t.done_at&&String(t.done_at).slice(0,7)===m;}).length,'iş bu ay tamamlanıb','','ok','done');
   rows.sort(function(a,b){var o={'g-bad':0,'g-warn':1,'g-ok':2};return o[a.g[1]]-o[b.g[1]]||a.e.full_name.localeCompare(b.e.full_name);});
   var tbl='<div class="card otbl"><div class="row" style="justify-content:space-between"><h3>İşçilər</h3><span class="muted small">Sətrə toxunun — ətraflı</span></div><div class="tbl"><table><tr><th>İşçi</th><th>Bu gün</th><th>Bu ay gəlib</th><th>Gecikmə</th><th>Aylıq plan</th><th>Tapşırıqlar</th><th>Qiymət</th></tr>'+rows.map(function(x){var e=x.e,r2=x.r;
     var tdy=leaveOn(e.id,d)?'<span class="pill p-acc">'+LT[leaveOn(e.id,d).type]+'</span>':x.a&&x.a.check_in?(x.a.late_min?'<span class="pill p-warn">'+hm(x.a.check_in)+' · '+x.a.late_min+' dəq gec</span>':'<span class="pill p-ok">'+hm(x.a.check_in)+'</span>'):(work.indexOf(e)>=0?'<span class="pill p-bad">gəlməyib</span>':'<span class="pill p-mut">istirahət</span>');
     return '<tr onclick="ownCard('+e.id+')"><td><b>'+esc(e.full_name)+demoTag(e)+'</b><div class="muted small">'+esc((posOf(e)||{}).title||'')+'</div></td><td>'+tdy+'</td><td>'+(r2.came+r2.leave)+' / '+r2.plan+(r2.absent?'<div class="small" style="color:var(--bad)">'+r2.absent+' gün yoxdur</div>':'')+'</td><td>'+(r2.lateN?r2.lateN+' dəfə<div class="muted small">'+hmin(r2.lateM)+'</div>':'<span style="color:var(--ok)">yoxdur</span>')+'</td><td style="min-width:120px">'+(x.pp!==null?bar(x.pp)+'<span class="small">'+x.pp+'%</span>':'<span class="muted small">'+(x.p?PST[x.p.status][0]:'verməyib')+'</span>')+'</td><td class="small">'+x.open.length+' açıq'+(x.over.length?' · <b style="color:var(--bad)">'+x.over.length+' gecikir</b>':'')+'<div class="muted">bu ay '+x.doneM.length+' bitib</div></td><td><span class="grade '+x.g[1]+'">'+x.g[0]+'</span></td></tr>';}).join('')+'</table></div></div>';
   // diqqət tələb edənlər
   var al=[];absent.forEach(function(e){al.push(['bad','❌',e.full_name+' bu gün xəbərsiz gəlməyib']);});
   rows.filter(function(x){return x.over.length;}).forEach(function(x){al.push(['bad','⚠️',x.e.full_name+': '+x.over.length+' işin vaxtı keçib']);});
   rows.filter(function(x){return x.r.lateN>=5;}).forEach(function(x){al.push(['warn','⏰',x.e.full_name+' bu ay '+x.r.lateN+' dəfə gecikib']);});
   if(+d.slice(8)>=5)rows.filter(function(x){return (!x.p||x.p.status==='draft')&&x.e.plan_required!==false;}).forEach(function(x){al.push(['warn','🗒',x.e.full_name+' aylıq planını verməyib']);});
   hrUpcoming().filter(function(h){return h.n<=14&&h.txt.indexOf('🎂')!==0;}).forEach(function(h){al.push(['warn','📄',h.txt.replace(/^\S+ /,'')+' — '+(h.n===0?'bu gün':h.n+' gün sonra')]);});
   hrUpcoming().filter(function(h){return h.n===0&&h.txt.indexOf('🎂')===0;}).forEach(function(h){al.push(['ok','🎂',h.txt.replace(/^\S+ /,'')+' — bu gün']);});
   var alerts='<div class="card"><h3>Diqqət tələb edənlər</h3>'+(al.length?al.map(function(a){return '<div class="alr '+a[0]+'"><span>'+a[1]+'</span>'+esc(a[2])+'</div>';}).join(''):'<p class="muted">Hər şey qaydasındadır 👍</p>')+'</div>';
   // şöbələr
   var deps='<div class="card"><h3>Şöbələr</h3><table class="dtbl"><tr><th>Şöbə</th><th>Bu gün</th><th>Plan</th><th>Gecikmə (ay)</th></tr>'+DEPTS.map(function(dp){var rs=rows.filter(function(x){var p2=posOf(x.e);return p2&&p2.department_id===dp.id;});if(!rs.length)return '';var cm=rs.filter(function(x){return x.a&&x.a.check_in;}).length,pl=rs.filter(function(x){return x.pp!==null;}),pa=pl.length?Math.round(pl.reduce(function(s2,x){return s2+x.pp;},0)/pl.length):null;
     return '<tr><td><b>'+esc(dp.name)+'</b></td><td>'+cm+'/'+rs.length+'</td><td>'+(pa===null?'—':pa+'%')+'</td><td>'+rs.reduce(function(s2,x){return s2+x.r.lateN;},0)+'</td></tr>';}).join('')+'</table></div>';
   var chart='<div class="card"><h3>Son 14 gün: işə gələnlər</h3><div class="chartbox" style="height:210px"><canvas id="chOwn"></canvas></div></div>';
   $('ownDash').innerHTML='<div class="odash"><div class="omain">'+tbl+'</div><div class="oside">'+ownGivenCard()+alerts+chart+deps+'</div></div>';
   var from=addDays(d,-13),labels=[],cm2=[],lt2=[],pl2=[];for(var i=0;i<14;i++){var ds=addDays(from,i);if(isoDow(ds)>5&&!matt.some(function(a){return a.day===ds;}))continue;labels.push(ds.slice(8)+'.'+ds.slice(5,7));var aa=matt.filter(function(a){return a.day===ds&&a.check_in;});cm2.push(aa.length);lt2.push(aa.filter(function(a){return a.late_min>0;}).length);pl2.push(isHol(ds)?0:act.filter(function(e){return (e.workdays||[]).indexOf(isoDow(ds))>=0&&!leaveOn(e.id,ds);}).length);}
   if(from<m+'-01'){}
   mkChart('chOwn',{type:'bar',data:{labels:labels,datasets:[{label:'Gəlib',data:cm2,backgroundColor:'#2563eb',borderRadius:5},{label:'Gecikib',data:lt2,backgroundColor:'#f59e0b',borderRadius:5},{type:'line',label:'Olmalı idi',data:pl2,borderColor:'#94a3b8',borderDash:[4,4],pointRadius:0}]},options:{maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
   ownTg();renderPushCards();
  });}).catch(err);}

function ownTg(){var c=$('ownTg');if(!c)return;Promise.all([tgBot(),sb.rpc('office_tg_code')]).then(function(r){var bot=r[0],d=(r[1]&&r[1].data)||{};if(!bot){c.innerHTML='';return;}
 c.innerHTML=d.connected?'<div class="card" style="margin-top:16px">📲 Hər iş günü səhər saat 09:30-da bu məlumatlar Telegram-a da gəlir.</div>':'<div class="card" style="margin-top:16px"><b>📲 Hər səhər qısa xülasə Telegram-a gəlsin?</b><p class="muted" style="margin:6px 0 12px">Düyməyə basın, Telegram açılanda <b>START</b> basın.</p><a class="btn" style="font-size:17px;padding:14px 20px" target="_blank" rel="noopener" href="https://t.me/'+encodeURIComponent(bot)+'?start='+esc(d.code)+'">Telegram-a qoş</a></div>';}).catch(function(){});}
function calTap(el){document.querySelectorAll('.ocal span.sel').forEach(function(x){x.classList.remove('sel');});el.classList.add('sel');var b=$('calInfo');if(b)b.textContent=el.dataset.info;}
function ownList(k){var t={done:'Bu ay bitmiş işlər',came:'Bu gün işdə olanlar',late:'Bu gün gecikənlər',absent:'Bu gün gəlməyənlər',plans:'Bu ayın planları',over:'Vaxtında görülməyən işlər',leave:'Məzuniyyətdə / icazəli'}[k];var h='';
 if(k==='came')h=OWN.rows.filter(function(x){return x.a&&x.a.check_in;}).map(function(x){return li(x.e.full_name,'gəlib: '+hm(x.a.check_in)+(x.a.late_min?' ('+x.a.late_min+' dəq gec)':''));}).join('');
 if(k==='late')h=OWN.late.map(function(a){return li(empName(a.employee_id),hm(a.check_in)+' — '+a.late_min+' dəqiqə gec');}).join('');
 if(k==='absent')h=OWN.absent.map(function(e){return li(e.full_name,'xəbərsiz gəlməyib');}).join('');
 if(k==='leave')h=OWN.onLv.map(function(e){var l=leaveOn(e.id,today());return li(e.full_name,LT[l.type]+' · '+l.date_to.slice(8)+'.'+l.date_to.slice(5,7)+'-dək');}).join('');
 if(k==='plans')h=OWN.rows.map(function(x){return li(x.e.full_name,x.pp!==null?x.pp+'% edilib':(x.p?PST[x.p.status][0]:'plan verməyib'),x.pp);}).join('');
 if(k==='done')h=OWN.rows.filter(function(x){return x.doneM.length;}).map(function(x){return x.doneM.map(function(t){return li(x.e.full_name,'✅ '+t.title+' — '+String(t.done_at).slice(8,10)+'.'+String(t.done_at).slice(5,7));}).join('');}).join('');
 if(k==='over')h=OWN.rows.filter(function(x){return x.over.length;}).map(function(x){return x.over.map(function(t){return li(x.e.full_name,t.title+' — son tarix '+t.due.slice(8)+'.'+t.due.slice(5,7));}).join('');}).join('');
 modal('<div class="mhead"><h3 class="ownh">'+t+'</h3><button class="x" onclick="closeModal()">×</button></div><div class="olist">'+(h||'<p class="empty">Heç kim yoxdur 👍</p>')+'</div>');}
function li(n,s2,pp){return '<div class="oli"><b>'+esc(n)+'</b><span>'+esc(s2)+'</span>'+(pp!==undefined&&pp!==null?bar(pp):'')+'</div>';}
function ownCard(eid){var x=OWN.rows.find(function(y){return y.e.id===eid;});if(!x)return;var r=x.r;
 var lines=['📅 Bu ay <b>'+r.came+'</b> gün işə gəlib'+(r.plan?' ('+r.plan+' iş günündən)':'')+'.',
  r.leave?'🌴 <b>'+r.leave+'</b> gün icazəli olub.':'',
  r.absent?'❌ <b>'+r.absent+'</b> gün xəbərsiz gəlməyib.':'✅ Xəbərsiz gəlmədiyi gün yoxdur.',
  r.lateN?'⏰ <b>'+r.lateN+'</b> dəfə gecikib (cəmi '+hmin(r.lateM)+').':'✅ Bu ay gecikməyib.',
  x.pp!==null?'🗒 Aylıq planının <b>'+x.pp+'%</b>-ni edib.':(x.p?'🗒 Aylıq planı: '+PST[x.p.status][0]+'.':'🗒 Bu ay üçün plan verməyib.'),
  x.over.length?'⚠️ <b>'+x.over.length+'</b> işi vaxtında görülməyib.':'✅ Vaxtı keçmiş işi yoxdur.'].filter(Boolean);
 var plan=x.p&&x.p.items&&x.p.items.length?'<h4 class="ownh4">Bu ayın planı</h4>'+x.p.items.map(function(i){return '<div class="opi">'+(i.done?'✅':'⬜')+' '+esc(i.t)+'</div>';}).join(''):'';
 var over=x.over.length?'<h4 class="ownh4">Vaxtında görülməyən işlər</h4>'+x.over.map(function(t){return '<div class="opi">⚠️ '+esc(t.title)+' <span class="muted">(son tarix '+t.due.slice(8)+'.'+t.due.slice(5,7)+')</span></div>';}).join(''):'';
 var d=today(),m=d.slice(0,7),y=+m.slice(0,4),mo=+m.slice(5,7),last=new Date(Date.UTC(y,mo,0)).getUTCDate(),first=isoDow(m+'-01');var cal='<h4 class="ownh4">Bu ay gün-gün</h4><div class="ocal">'+['B.e','Ç.a','Çər','C.a','Cüm','Şən','Baz'].map(function(w){return '<i>'+w+'</i>';}).join('');for(var k=1;k<first;k++)cal+='<span></span>';
 for(var dd=1;dd<=last;dd++){var ds=m+'-'+String(dd).padStart(2,'0');var a=(OWN.matt||[]).find(function(z){return z.employee_id===x.e.id&&z.day===ds;});var lv=leaveOn(x.e.id,ds);var wk=(x.e.workdays||[]).indexOf(isoDow(ds))>=0&&!isHol(ds);var c,tt;
  if(ds>d){c='fut';tt='';}else if(lv&&!(a&&a.check_in)){c='lv';tt=LT[lv.type];}else if(a&&a.check_in){c=a.late_min?'lt':'ok';tt=hm(a.check_in)+(a.late_min?' · '+a.late_min+' dəq gec':'')+(a.check_out?' – '+hm(a.check_out):'');}else if(wk){c='ab';tt='gəlməyib';}else{c='off';tt=isHol(ds)?'bayram':'istirahət';}
  var info=ds.slice(8)+'.'+ds.slice(5,7)+' — '+(tt||'hələ gəlməyib');cal+='<span class="'+c+'" data-info="'+esc(info)+'" onclick="calTap(this)">'+dd+'</span>';}
 cal+='</div><div class="calinfo" id="calInfo">👆 Günə toxunun — gəliş və çıxış saatı burada görünəcək</div><div class="olegend"><span class="ok"></span>vaxtında <span class="lt"></span>gecikib <span class="ab"></span>gəlməyib <span class="lv"></span>icazəli <span class="off"></span>istirahət</div>';
 var tks=x.open.length||x.doneM.length?'<h4 class="ownh4">Tapşırıqlar</h4>'+x.open.map(function(t){var ov=t.due&&t.due<d;return '<div class="opi">'+(ov?'⚠️':'🔹')+' '+esc(t.title)+' <span class="muted">('+ST[t.status]+(t.due?', son tarix '+t.due.slice(8)+'.'+t.due.slice(5,7):'')+')</span></div>';}).join('')+x.doneM.map(function(t){return '<div class="opi">✅ '+esc(t.title)+' <span class="muted">(bitib '+String(t.done_at).slice(8,10)+'.'+String(t.done_at).slice(5,7)+')</span></div>';}).join(''):'';
 modal('<div class="mhead"><div><h3 class="ownh">'+esc(x.e.full_name)+'</h3><div class="muted">'+esc((posOf(x.e)||{}).title||'')+(x.e.phone?' · '+esc(x.e.phone):'')+'</div></div><button class="x" onclick="closeModal()">×</button></div><div class="row" style="gap:10px;align-items:stretch"><div class="grade big '+x.g[1]+'" style="flex:1">Ümumi qiymət: '+x.g[0]+'</div><button class="btn givebtn" onclick="ownTaskModal('+x.e.id+')">✍️ Tapşırıq ver</button></div><div class="ocols"><div><div class="olines">'+lines.map(function(l){return '<p>'+l+'</p>';}).join('')+'</div>'+cal+'</div><div>'+plan+tks+'</div></div>');
 $('mbox').classList.add('wide');}


/* ---------- SAHİBKARIN TAPŞIRIQLARI ---------- */
function renderOwnerTasksForEmp(){var b=$('tOwnerTasks');if(!b)return;var l=EMP?TASKS.filter(function(t){return t.from_owner&&t.assignee_id===EMP.id&&t.status!=='done';}):[];
 b.innerHTML=l.length?'<div class="owncard"><div class="owncard-h">👑 Sahibkardan tapşırıq'+(l.length>1?' ('+l.length+')':'')+'</div>'+l.map(function(t){var over=t.due&&t.due<today();return '<div class="owntask" onclick="openTask('+t.id+')"><b>'+esc(t.title)+'</b>'+(t.description?'<p>'+esc(t.description)+'</p>':'')+'<div class="owntask-m">'+(t.priority==='urgent'?'<span>🔥 Təcili</span>':'')+(t.due?'<span'+(over?' class="late"':'')+'>📅 '+(over?'Son tarix keçib: ':'Son tarix: ')+t.due.slice(8)+'.'+t.due.slice(5,7)+'</span>':'')+'<span>'+ST[t.status]+'</span></div></div>';}).join('')+'</div>':'';}
function ownTaskModal(eid){var act=EMPS.filter(function(e){return e.active;});var d3=addDays(today(),3);
 modal('<div class="mhead"><h3 class="ownh">✍️ Tapşırıq ver</h3><button class="x" onclick="closeModal()">×</button></div>'+
  '<div class="field"><label>Kimə</label><select id="otE" class="big">'+act.map(function(e){return '<option value="'+e.id+'"'+(e.id===eid?' selected':'')+'>'+esc(e.full_name)+' — '+esc((posOf(e)||{}).title||'')+'</option>';}).join('')+'</select></div>'+
  '<div class="field"><label>Nə etməlidir</label><input id="otT" class="big" placeholder="Məs: Bina 6 üzrə satış hesabatını hazırla"></div>'+
  '<div class="field"><label>Ətraflı (istəyə bağlı)</label><textarea id="otD" class="big"></textarea></div>'+
  '<div class="grid g2"><div class="field"><label>Son tarix</label><input id="otDue" type="date" class="big" value="'+d3+'"></div><div class="field"><label>Vaciblik</label><select id="otP" class="big"><option value="high">Vacib</option><option value="urgent">🔥 Təcili</option></select></div></div>'+
  '<button class="btn" style="width:100%;font-size:18px;padding:15px" onclick="ownTaskSave()">Göndər</button>');}
function ownTaskSave(){var b={title:$('otT').value.trim(),description:$('otD').value.trim(),assignee_id:+$('otE').value,due:$('otDue').value||null,priority:$('otP').value,status:'new',created_by:ME.user_id,from_owner:true};
 if(!b.title)return toast('Tapşırığı yazın');
 run(sb.from('office_tasks').insert(b).select().single()).then(function(t){TASKS.unshift(t);closeModal();toast('Tapşırıq göndərildi: '+empName(t.assignee_id));notify('task_assigned',{id:t.id});if(OWNER)renderOwner();}).catch(err);}
function ownGivenCard(){var l=TASKS.filter(function(t){return t.from_owner;}).sort(function(a,b){return (a.status==='done')-(b.status==='done')||String(b.created_at).localeCompare(String(a.created_at));}).slice(0,12);
 return '<div class="card"><div class="row" style="justify-content:space-between"><h3>Verdiyim tapşırıqlar</h3><button class="btn sm" onclick="ownTaskModal()">+ Yeni</button></div>'+(l.length?l.map(function(t){var over=t.status!=='done'&&t.due&&t.due<today();var st=t.status==='done'?'<span class="pill p-ok">✅ bitib</span>':over?'<span class="pill p-bad">gecikir</span>':'<span class="pill '+(t.status==='new'?'p-mut':'p-acc')+'">'+ST[t.status]+'</span>';
  return '<div class="ogt"><div><b>'+esc(t.title)+'</b><div class="muted small">'+esc(empName(t.assignee_id))+(t.due?' · son tarix '+t.due.slice(8)+'.'+t.due.slice(5,7):'')+'</div></div>'+st+'</div>';}).join(''):'<p class="muted">Hələ tapşırıq verməmisiniz. “+ Yeni” ilə istənilən işçiyə tapşırıq verə bilərsiniz.</p>')+'</div>';}




/* ---------- MOBİL TƏTBİQ (Capacitor) ---------- */
function isNative(){try{return !!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());}catch(e){return false;}}
function nativePush(){return isNative()&&window.Capacitor.Plugins&&window.Capacitor.Plugins.PushNotifications;}
var _fcmOn=null;function fcmOn(){return _fcmOn!==null?Promise.resolve(_fcmOn):sb.rpc('office_fcm_on').then(function(r){_fcmOn=!!(r&&r.data);return _fcmOn;}).catch(function(){return false;});}
function nativePushInit(){var P=nativePush();if(!P||nativePushInit._d)return;nativePushInit._d=1;
 P.addListener('registration',function(t){sb.from('office_push_subs').upsert({user_id:ME.user_id,endpoint:'fcm:'+t.value,p256dh:'fcm',auth:'fcm',ua:'android-app'},{onConflict:'endpoint'}).then(function(){renderPushCards();});});
 P.addListener('registrationError',function(){toast('Bildiriş qeydiyyatı alınmadı');});
 P.addListener('pushNotificationActionPerformed',function(a){try{var u=a.notification.data&&a.notification.data.url;if(u&&u.indexOf(OFB())>=0)location.href=u;}catch(e){}});}

/* ---------- iPhone: ana ekrana əlavə etmə bələdçisi ---------- */
function iosSheetClose(days){$('iosSheet').classList.remove('on');try{localStorage.setItem('iosSheetUntil',String(Date.now()+(days||3)*864e5));}catch(e){}}
function iosSheetShow(force){if(isNative()||!isIOS()||isStandalone())return;var until=0;try{until=+localStorage.getItem('iosSheetUntil')||0;}catch(e){}if(!force&&Date.now()<until)return;
 var ua=navigator.userAgent,chrome=/CriOS|FxiOS|EdgiOS/.test(ua),ipad=/iPad/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 var st=$('iosStep1'),ar=$('iosArrow');
 if(chrome){st.innerHTML='Ünvan zolağının sağındakı <b>Paylaş</b> düyməsinə basın <svg viewBox="0 0 24 24" class="shr"><path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';ar.className='ios-arrow top';ar.textContent='⬆';}
 else if(ipad){st.innerHTML='Yuxarıda, sağda <b>Paylaş</b> düyməsinə basın <svg viewBox="0 0 24 24" class="shr"><path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';ar.className='ios-arrow top';ar.textContent='⬆';}
 $('iosSheet').classList.add('on');}

/* ================= İŞÇİ TƏCRÜBƏSİ: Komanda, Təşəkkür, Əhval, Sənədlər, Profilim ================= */
var BADGES={komanda:['🤝','Komanda oyunçusu'],komek:['🙌','Köməyə gəldi'],teseb:['🚀','Təşəbbüs'],keyf:['⭐','Keyfiyyət'],musteri:['💬','Müştəri məmnuniyyəti'],lider:['🏆','Liderlik']};
var TSTAT={ofisde:['🟢','Ofisdə','p-ok'],uzaqdan:['🏠','Uzaqdan','p-acc'],ezamiyyet:['✈️','Ezamiyyətdə','p-acc'],icazeli:['🌴','İcazəli','p-mut'],getdi:['🚪','İşdən çıxıb','p-mut'],yox:['⚪','Gəlməyib','p-mut']};
var TEAMST={},KUDOS=[],KLIKES=[],DOCS=[],DACKS=[];
function ini(n){return String(n||'?').split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase();}
function avaC(n){var h=0;String(n).split('').forEach(function(c){h=(h*31+c.charCodeAt(0))%360;});return 'hsl('+h+',55%,52%)';}
var AVA_BASE='https://avqchschbbltnnasabdm.supabase.co/storage/v1/object/public/avatars/';
function avatar(n,sz,photo){sz=sz||40;if(photo)return '<img class="eava" src="'+AVA_BASE+esc(photo)+'" alt="" loading="lazy" style="width:'+sz+'px;height:'+sz+'px;object-fit:cover">';return '<span class="eava" style="width:'+sz+'px;height:'+sz+'px;font-size:'+Math.round(sz*.38)+'px;background:'+avaC(n)+'">'+esc(ini(n))+'</span>';}
function avatarE(e,sz){return avatar(e.full_name,sz,e.photo);}
function deptOf(e){var p=posOf(e);return p?DEPTS.find(function(d){return d.id===p.department_id;}):null;}
function greetE(){var h=+new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',hour12:false}).format(new Date());return h>=5&&h<12?'Sabahınız xeyir':h>=12&&h<17?'Günortanız xeyir':'Axşamınız xeyir';}
function tenure(d){if(!d)return '';var a=new Date(d+'T12:00:00Z'),b=new Date(today()+'T12:00:00Z');var m=(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth();if(b.getUTCDate()<a.getUTCDate())m--;if(m<1)return 'yeni işçi';var y=Math.floor(m/12),mm=m%12;return (y?y+' il ':'')+(mm?mm+' ay':'');}
function weekStart(){var d=new Date(today()+'T12:00:00Z'),w=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()-w+1);return d.toISOString().slice(0,10);}
function loadTeam(){return sb.rpc('office_team_today').then(function(r){TEAMST={};(r.data||[]).forEach(function(x){TEAMST[x.employee_id]=x.status;});}).catch(function(){});}
function loadKudos(){return Promise.all([run(sb.from('office_kudos').select('*').order('created_at',{ascending:false}).limit(80)),run(sb.from('office_kudos_likes').select('*'))]).then(function(r){KUDOS=r[0];KLIKES=r[1];});}
function loadDocs(){return Promise.all([run(sb.from('office_docs').select('*').order('created_at',{ascending:false})),run(sb.from('office_doc_acks').select('*'))]).then(function(r){DOCS=r[0];DACKS=r[1];});}
function bdaySoon(e){if(!e.birthday)return null;var t=today(),y=+t.slice(0,4),b=y+e.birthday.slice(4);if(b<t)b=(y+1)+e.birthday.slice(4);var n=Math.round((new Date(b+'T12:00:00Z')-new Date(t+'T12:00:00Z'))/864e5);return n<=7?n:null;}

/* ---------- Bu gün: salamlama, sürətli düymələr, seriya, əhval, sənədlər, təşəkkürlər ---------- */
function renderHomeExtras(){if(OWNER)return;var nm=String((EMP&&EMP.full_name)||ME.full_name||'').split(' ')[0];
 var h=$('tHello');if(h)h.innerHTML='<div><h2 style="margin:0">'+greetE()+(nm?', '+esc(nm):'')+'</h2><div class="muted small" id="tHsub"></div></div>';
 var q=$('tQuick');if(q)q.innerHTML=[['🌴','Məzuniyyət / icazə','openLeave()'],['🗒','Aylıq plan','show(\'plans\')'],['🙌','Təşəkkür göndər','openKudos()'],['👥','Komanda','show(\'dir\')'],['📄','Sənədlər','show(\'docs\')']].map(function(x){return '<button class="qa-b" onclick="'+x[2]+'"><span>'+x[0]+'</span>'+x[1]+'</button>';}).join('');
 if(!EMP)return;
 // seriya: ardıcıl vaxtında gəliş
 run(sb.from('office_attendance').select('day,check_in,late_min').eq('employee_id',EMP.id).gte('day',addDays(today(),-60)).order('day',{ascending:false})).then(function(rows){var s=0;for(var i=0;i<rows.length;i++){if(!rows[i].check_in)continue;if(rows[i].late_min>0)break;s++;}
  var hs=$('tHsub');if(hs)hs.innerHTML=s>=2?'🔥 <b>'+s+' gün ardıcıl</b> vaxtında gəlmisiniz'+(s>=10?' — əla nəticə!':''):'Uğurlu iş günü arzulayırıq!';}).catch(function(){});
 // həftəlik əhval (anonim)
 var wk=weekStart();run(sb.from('office_moods').select('*').eq('employee_id',EMP.id).eq('week',wk)).then(function(r){var c=$('tMood');if(!c)return;if(r.length){c.innerHTML='';return;}
  c.innerHTML='<div class="card moodc"><div><h3 style="margin:0">Bu həftə necə keçir?</h3><div class="muted small">Cavab <b>anonimdir</b> — rəhbərlik yalnız ümumi əhvalı görür.</div></div><div class="moods">'+[['😣',1],['😕',2],['😐',3],['🙂',4],['😄',5]].map(function(x){return '<button onclick="saveMood('+x[1]+')" title="'+x[1]+'">'+x[0]+'</button>';}).join('')+'</div></div>';}).catch(function(){});
 // tanış olunmalı sənədlər
 loadDocs().then(function(){var c=$('tDocsCard');if(!c)return;var need=DOCS.filter(function(d){return d.requires_ack&&!DACKS.some(function(a){return a.doc_id===d.id&&a.employee_id===EMP.id;});});
  c.innerHTML=need.length?'<div class="card docneed" onclick="show(\'docs\')"><span>📄</span><div><b>'+need.length+' sənədlə tanış olmalısınız</b><div class="muted small">'+esc(need.slice(0,2).map(function(d){return d.title;}).join(', '))+(need.length>2?'…':'')+'</div></div><b class="go">›</b></div>':'';}).catch(function(){});
 // son təşəkkürlər
 loadKudos().then(function(){var c=$('tKudos');if(!c)return;var mine=KUDOS.filter(function(k){return k.to_emp===EMP.id;}),last=KUDOS.slice(0,3);
  c.innerHTML='<div class="card"><div class="row sp"><h3 style="margin:0">🙌 Təşəkkür divarı</h3><button class="btn ghost sm" onclick="show(\'dir\');DIRTAB=\'kudos\';renderDir()">Hamısı ›</button></div>'+(mine.length?'<p class="small" style="margin:8px 0">Sizə <b>'+mine.length+'</b> dəfə təşəkkür edilib 💛</p>':'')+(last.length?last.map(kudosRow).join(''):'<p class="muted small" style="margin-top:8px">Hələ təşəkkür yoxdur. İlk təşəkkürü siz göndərin!</p>')+'</div>';}).catch(function(){});}
function saveMood(v){run(sb.from('office_moods').insert({employee_id:EMP.id,week:weekStart(),score:v})).then(function(){toast('Təşəkkürlər! Cavabınız anonimdir.');$('tMood').innerHTML='';}).catch(err);}

/* ---------- Komanda (kataloq) + Təşəkkür divarı ---------- */
var DIRTAB='people';
function renderDir(){var v=$('dirBody');if(!v)return;var db=$('dirBar');if(db)db.style.display=DIRTAB==='people'?'':'none';
 $('dirTabs').innerHTML=[['people','👥 Əməkdaşlar'],['kudos','🙌 Təşəkkür divarı']].concat(MGR?[['mood','📈 Komanda əhvalı']]:[]).map(function(t){return '<button class="'+(DIRTAB===t[0]?'on':'')+'" onclick="DIRTAB=\''+t[0]+'\';renderDir()">'+t[1]+'</button>';}).join('');
 if(DIRTAB==='kudos')return loadKudos().then(renderKudosWall).catch(err);
 if(DIRTAB==='mood')return renderMood();
 loadTeam().then(function(){var q=(($('dirQ')||{}).value||'').toLowerCase(),df=+(($('dirD')||{}).value||0);
  var act=EMPS.filter(function(e){return e.active&&!e.demo;});if(!act.length)act=EMPS.filter(function(e){return e.active;});
  var cnt={};act.forEach(function(e){var s=TEAMST[e.id]||'yox';cnt[s]=(cnt[s]||0)+1;});
  var list=act.filter(function(e){var d=deptOf(e);return (!df||(d&&d.id===df))&&(!q||(e.full_name+' '+((posOf(e)||{}).title||'')+' '+(d?d.name:'')+' '+(e.phone||'')).toLowerCase().indexOf(q)>=0);});
  var groups={};list.forEach(function(e){var d=deptOf(e);var k=d?d.name:'Digər';(groups[k]=groups[k]||[]).push(e);});
  v.innerHTML=(v.dataset.init?'':'')+'<div class="dirstats">'+['ofisde','uzaqdan','ezamiyyet','icazeli'].map(function(k){return '<div class="kpi"><b>'+(cnt[k]||0)+'</b><span>'+TSTAT[k][0]+' '+TSTAT[k][1]+'</span></div>';}).join('')+'</div>'+
   Object.keys(groups).sort().map(function(g){return '<h3 class="dirg">'+esc(g)+' <span class="muted small">'+groups[g].length+'</span></h3><div class="dirgrid">'+groups[g].sort(function(a,b){return a.full_name.localeCompare(b.full_name);}).map(function(e){var s=TSTAT[TEAMST[e.id]||'yox'],bd=bdaySoon(e);
    return '<div class="pcard" onclick="openPerson('+e.id+')">'+avatarE(e,48)+'<div class="pinfo"><b>'+esc(e.full_name)+'</b><span>'+esc((posOf(e)||{}).title||'')+'</span><div class="row" style="gap:6px;margin-top:6px"><span class="pill '+s[2]+'">'+s[0]+' '+s[1]+'</span>'+(bd!==null?'<span class="pill p-warn">🎂 '+(bd===0?'bu gün':bd+' gün sonra')+'</span>':'')+'</div></div></div>';}).join('')+'</div>';}).join('')||'<div class="card empty">Tapılmadı</div>';}).catch(err);}
function dirFilters(){var d=$('dirD');if(d&&!d.options.length){d.innerHTML='<option value="0">Bütün şöbələr</option>'+DEPTS.filter(function(x){return !x.demo;}).map(function(x){return '<option value="'+x.id+'">'+esc(x.name)+'</option>';}).join('');}}
function openPerson(id){var e=EMPS.find(function(x){return x.id===id;});if(!e)return;var d=deptOf(e),mg=e.manager_id?EMPS.find(function(x){return x.id===e.manager_id;}):null,s=TSTAT[TEAMST[e.id]||'yox'],ph=String(e.phone||'').replace(/\D/g,'');
 var rec=KUDOS.filter(function(k){return k.to_emp===id;}).length;
 modal('<div class="mhead"><div class="row" style="gap:14px">'+avatarE(e,64)+'<div><h3>'+esc(e.full_name)+'</h3><div class="muted">'+esc((posOf(e)||{}).title||'')+(d?' · '+esc(d.name):'')+'</div><span class="pill '+s[2]+'" style="margin-top:6px">'+s[0]+' '+s[1]+'</span></div></div><button class="x" onclick="closeModal()">×</button></div>'+
  (e.about?'<p style="margin:6px 0 12px">'+esc(e.about)+'</p>':'')+
  '<div class="pgrid">'+(mg?'<div><span>Rəhbəri</span><b>'+esc(mg.full_name)+'</b></div>':'')+(e.hire_date?'<div><span>Komandada</span><b>'+tenure(e.hire_date)+'</b></div>':'')+(e.birthday?'<div><span>Ad günü</span><b>'+(+e.birthday.slice(8))+' '+AZM[+e.birthday.slice(5,7)-1]+'</b></div>':'')+'<div><span>Təşəkkürlər</span><b>🙌 '+rec+'</b></div>'+(e.email?'<div><span>Email</span><b style="font-size:13px">'+esc(e.email)+'</b></div>':'')+'</div>'+
  '<div class="row" style="margin-top:16px">'+(ph?'<a class="btn" href="tel:'+esc(e.phone)+'">📞 Zəng</a><a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/'+(ph.length<=10?'994'+ph.replace(/^0/,''):ph)+'">💬 WhatsApp</a>':'')+(EMP&&EMP.id!==id?'<button class="btn ghost" onclick="closeModal();openKudos('+id+')">🙌 Təşəkkür</button>':'')+'</div>');}
function kudosRow(k){var f=EMPS.find(function(x){return x.id===k.from_emp;})||{full_name:'?'},t=EMPS.find(function(x){return x.id===k.to_emp;})||{full_name:'?'},b=BADGES[k.badge]||BADGES.komanda;
 var lk=KLIKES.filter(function(l){return l.kudos_id===k.id;}),me=EMP&&lk.some(function(l){return l.employee_id===EMP.id;});
 return '<div class="kud"><div class="kav">'+avatarE(t,40)+'<i>'+b[0]+'</i></div><div style="flex:1"><div><b>'+esc(f.full_name)+'</b> → <b>'+esc(t.full_name)+'</b> <span class="pill p-acc">'+b[1]+'</span></div>'+(k.message?'<p>'+esc(k.message)+'</p>':'')+'<div class="muted small">'+new Date(k.created_at).toLocaleDateString('az-AZ',{day:'numeric',month:'long'})+' · <button class="like'+(me?' on':'')+'" onclick="event.stopPropagation();toggleLike('+k.id+')">❤️ '+(lk.length||'')+'</button></div></div></div>';}
function renderKudosWall(){var m=today().slice(0,7),mon=KUDOS.filter(function(k){return String(k.created_at).slice(0,7)===m;}),sc={};mon.forEach(function(k){sc[k.to_emp]=(sc[k.to_emp]||0)+1;});
 var top=Object.keys(sc).sort(function(a,b){return sc[b]-sc[a];}).slice(0,3);
 $('dirBody').innerHTML='<div class="grid g2" style="align-items:start"><div class="card"><div class="row sp"><h3 style="margin:0">Son təşəkkürlər</h3>'+(EMP?'<button class="btn sm" onclick="openKudos()">+ Təşəkkür göndər</button>':'')+'</div><div style="margin-top:8px">'+(KUDOS.length?KUDOS.map(kudosRow).join(''):'<p class="muted">Hələ təşəkkür yoxdur.</p>')+'</div></div>'+
  '<div class="card"><h3>🏆 Ayın ən çox təşəkkür alanları</h3>'+(top.length?top.map(function(id,i){var e=EMPS.find(function(x){return x.id===+id;})||{full_name:'?'};return '<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)"><span style="font-size:22px">'+['🥇','🥈','🥉'][i]+'</span>'+avatarE(e,36)+'<b style="flex:1">'+esc(e.full_name)+'</b><span class="pill p-acc">🙌 '+sc[id]+'</span></div>';}).join(''):'<p class="muted small">Bu ay hələ təşəkkür yoxdur.</p>')+'</div></div>';}
function toggleLike(id){if(!EMP)return;var me=KLIKES.find(function(l){return l.kudos_id===id&&l.employee_id===EMP.id;});
 (me?run(sb.from('office_kudos_likes').delete().eq('kudos_id',id).eq('employee_id',EMP.id)):run(sb.from('office_kudos_likes').insert({kudos_id:id,employee_id:EMP.id}))).then(loadKudos).then(function(){if($('v-dir').classList.contains('on'))renderKudosWall();else renderHomeExtras();}).catch(err);}
function openKudos(to){if(!EMP){toast('Təşəkkür göndərmək üçün işçi kartı lazımdır');return;}var act=EMPS.filter(function(e){return e.active&&e.id!==EMP.id&&!e.demo;});if(!act.length)act=EMPS.filter(function(e){return e.active&&e.id!==EMP.id;});
 modal('<div class="mhead"><h3>🙌 Təşəkkür göndər</h3><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Kimə</label><select id="kTo">'+act.sort(function(a,b){return a.full_name.localeCompare(b.full_name);}).map(function(e){return '<option value="'+e.id+'"'+(e.id===to?' selected':'')+'>'+esc(e.full_name)+'</option>';}).join('')+'</select></div>'+
  '<div class="field"><label>Nəyə görə</label><div class="kbs" id="kB">'+Object.keys(BADGES).map(function(k,i){return '<button class="'+(i===0?'on':'')+'" data-k="'+k+'" onclick="document.querySelectorAll(\'#kB button\').forEach(function(b){b.classList.remove(\'on\')});this.classList.add(\'on\')"><span>'+BADGES[k][0]+'</span>'+BADGES[k][1]+'</button>';}).join('')+'</div></div>'+
  '<div class="field"><label>Mesaj</label><textarea id="kM" placeholder="məs: Dünən müştəri ilə görüşdə çox kömək etdin, təşəkkürlər!"></textarea></div><button class="btn" style="width:100%" onclick="sendKudos()">Göndər</button>');}
function sendKudos(){var b=document.querySelector('#kB button.on');run(sb.from('office_kudos').insert({from_emp:EMP.id,to_emp:+$('kTo').value,badge:b?b.dataset.k:'komanda',message:$('kM').value.trim()}).select().single()).then(function(k){try{sb.functions.invoke('office-wish',{body:{action:'kudos',id:k.id}});}catch(e){}closeModal();toast('Təşəkkür göndərildi 🙌');return loadKudos();}).then(function(){if($('v-dir').classList.contains('on')){DIRTAB='kudos';renderDir();}else renderHomeExtras();}).catch(err);}
function renderMood(){sb.rpc('office_mood_stats').then(function(r){var d=(r.data||[]).slice().reverse();
 $('dirBody').innerHTML='<div class="card"><h3>📈 Komanda əhvalı (anonim)</h3><p class="muted small">İşçilər hər həftə 1–5 arası qiymət verir. Anonimliyi qorumaq üçün 3-dən az cavab olan həftələr göstərilmir.</p>'+(d.length?'<div class="moodbars">'+d.map(function(x){var p=(x.avg-1)/4*100;return '<div><b>'+Number(x.avg).toFixed(1)+'</b><i style="height:'+Math.max(8,p)+'%;background:'+(x.avg>=4?'#16a34a':x.avg>=3?'#f59e0b':'#dc2626')+'"></i><span>'+x.week.slice(8)+'.'+x.week.slice(5,7)+'</span><small>'+x.n+' cavab</small></div>';}).join('')+'</div>':'<p class="empty">Hələ kifayət qədər cavab yoxdur.</p>')+'</div>';}).catch(err);}

/* ---------- Sənədlər ---------- */
var DCAT={qayda:'📘 Daxili qaydalar',siyaset:'🛡 Siyasətlər',telimat:'🧭 Təlimatlar',forma:'📝 Formalar',diger:'📎 Digər'};
function renderDocs(){loadDocs().then(function(){var act=EMPS.filter(function(e){return e.active;}).length;
 $('docBody').innerHTML=(MGR?'<div class="row" style="justify-content:flex-end;margin-bottom:12px"><button class="btn" onclick="openDoc()">+ Sənəd</button></div>':'')+(DOCS.length?DOCS.map(function(d){var ack=DACKS.some(function(a){return a.doc_id===d.id&&EMP&&a.employee_id===EMP.id;}),n=DACKS.filter(function(a){return a.doc_id===d.id;}).length;
  return '<div class="card doc"><div class="row sp"><div><span class="muted small">'+(DCAT[d.category]||DCAT.diger)+'</span><h3 style="margin:2px 0">'+esc(d.title)+'</h3><span class="muted small">'+new Date(d.created_at).toLocaleDateString('az-AZ',{day:'numeric',month:'long',year:'numeric'})+'</span></div><div class="row">'+
   (MGR&&d.requires_ack?'<button class="btn ghost sm" onclick="docAcks('+d.id+')">✔ '+n+'/'+act+' tanış olub</button>':'')+'<button class="btn ghost sm" onclick="viewDoc('+d.id+')">Aç</button>'+(d.requires_ack&&EMP?(ack?'<span class="pill p-ok">✔ Tanış olmusunuz</span>':'<button class="btn sm" onclick="ackDoc('+d.id+')">Tanış oldum</button>'):'')+(MGR?'<button class="btn ghost sm" onclick="delDoc('+d.id+')">×</button>':'')+'</div></div></div>';}).join(''):'<div class="card empty">Hələ sənəd yoxdur.'+(MGR?' Şirkət qaydalarını, təlimatları və formaları burada paylaşın.':'')+'</div>');}).catch(err);}
function viewDoc(id){var d=DOCS.find(function(x){return x.id===id;});modal('<div class="mhead"><h3>'+esc(d.title)+'</h3><button class="x" onclick="closeModal()">×</button></div>'+(d.body?'<div style="white-space:pre-line;line-height:1.6">'+esc(d.body)+'</div>':'')+(d.path?'<p style="margin-top:12px"><button class="btn ghost" onclick="openDocFile(\''+esc(d.path)+'\')">📎 Faylı aç</button></p>':''));}
function openDocFile(p){sb.storage.from('office').createSignedUrl(p,600).then(function(r){if(r.data)window.open(r.data.signedUrl,'_blank');else toast('Fayl açılmadı');});}
function ackDoc(id){run(sb.from('office_doc_acks').insert({doc_id:id,employee_id:EMP.id})).then(function(){toast('Qeyd olundu ✔');renderDocs();}).catch(err);}
function docAcks(id){var act=EMPS.filter(function(e){return e.active;}),acked=DACKS.filter(function(a){return a.doc_id===id;}).map(function(a){return a.employee_id;});var no=act.filter(function(e){return acked.indexOf(e.id)<0;});
 modal('<div class="mhead"><h3>Tanış olmayanlar ('+no.length+')</h3><button class="x" onclick="closeModal()">×</button></div>'+(no.length?no.map(function(e){return '<div class="row" style="padding:6px 0">'+avatarE(e,30)+esc(e.full_name)+'</div>';}).join(''):'<p class="muted">Hamı tanış olub 👍</p>'));}
function openDoc(){modal('<div class="mhead"><h3>Yeni sənəd</h3><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Başlıq</label><input id="dT" placeholder="məs: Daxili intizam qaydaları"></div><div class="field"><label>Kateqoriya</label><select id="dC">'+Object.keys(DCAT).map(function(k){return '<option value="'+k+'">'+DCAT[k]+'</option>';}).join('')+'</select></div><div class="field"><label>Mətn</label><textarea id="dB" style="min-height:140px"></textarea></div><div class="field"><label>Fayl (istəyə bağlı, PDF və s.)</label><input id="dF" type="file"></div><label class="row small" style="margin-bottom:12px"><input type="checkbox" id="dA" checked> İşçilər “Tanış oldum” təsdiq etməlidir</label><button class="btn" style="width:100%" onclick="saveDoc()">Paylaş</button>');}
function saveDoc(){var t=$('dT').value.trim();if(!t)return toast('Başlıq yazın');var f=$('dF').files[0];
 (f?sb.storage.from('office').upload('docs/'+Date.now()+'-'+f.name.replace(/[^\w.\-]+/g,'_'),f).then(function(r){if(r.error)throw r.error;return r.data.path;}):Promise.resolve(null)).then(function(path){
  return run(sb.from('office_docs').insert({title:t,category:$('dC').value,body:$('dB').value,path:path,requires_ack:$('dA').checked}));}).then(function(){closeModal();toast('Sənəd paylaşıldı');renderDocs();}).catch(err);}
function delDoc(id){if(!confirm('Sənəd silinsin?'))return;run(sb.from('office_docs').delete().eq('id',id)).then(renderDocs).catch(err);}

/* ---------- profil şəkli: kvadrat kəsilir, 400px, JPEG ---------- */
function uploadPhoto(f){if(!f||!EMP)return;if(!/^image\//.test(f.type))return toast('Şəkil faylı seçin');toast('Yüklənir…');
 var img=new Image(),url=URL.createObjectURL(f);img.onload=function(){var sz=Math.min(img.width,img.height),cv=document.createElement('canvas');cv.width=cv.height=400;
  cv.getContext('2d').drawImage(img,(img.width-sz)/2,(img.height-sz)/2,sz,sz,0,0,400,400);URL.revokeObjectURL(url);
  cv.toBlob(function(bl){var path='emp/'+EMP.id+'/'+Date.now()+'.jpg',old=EMP.photo;
   sb.storage.from('avatars').upload(path,bl,{contentType:'image/jpeg',upsert:false}).then(function(r){if(r.error)throw r.error;return sb.rpc('office_set_photo',{p_path:path});})
   .then(function(r){if(r.error)throw r.error;EMP.photo=path;var me=EMPS.find(function(x){return x.id===EMP.id;});if(me)me.photo=path;if(old)sb.storage.from('avatars').remove([old]);toast('Profil şəkli yeniləndi ✅');renderMe();}).catch(err);},'image/jpeg',.86);};
 img.onerror=function(){toast('Şəkil oxunmadı');};img.src=url;}
function removePhoto(){if(!confirm('Profil şəkli silinsin?'))return;var old=EMP.photo;sb.rpc('office_set_photo',{p_path:null}).then(function(r){if(r.error)throw r.error;EMP.photo=null;var me=EMPS.find(function(x){return x.id===EMP.id;});if(me)me.photo=null;if(old)sb.storage.from('avatars').remove([old]);renderMe();}).catch(err);}

/* ---------- Şifrəmi dəyiş ---------- */
function pwCard(){return '<div class="card" id="pwCard"><h3>🔒 Şifrəmi dəyiş</h3>'+(EMP&&!EMP.pw_changed?'<p class="note" style="margin-bottom:12px">Hazırda ilkin (ümumi) şifrə ilə daxil olursunuz. Təhlükəsizlik üçün özünüzə yeni şifrə təyin edin.</p>':'<p class="muted small" style="margin-bottom:12px">Şifrənizi istənilən vaxt dəyişə bilərsiniz.</p>')+
 '<div class="field"><label>Cari şifrə</label><input id="pwCur" type="password" autocomplete="current-password"></div>'+
 '<div class="field"><label>Yeni şifrə (ən az 8 simvol)</label><input id="pwNew" type="password" autocomplete="new-password" oninput="pwHint()"></div>'+
 '<div class="field"><label>Yeni şifrə təkrar</label><input id="pwRep" type="password" autocomplete="new-password" oninput="pwHint()"></div>'+
 '<div class="row sp"><label class="row small" style="gap:6px"><input type="checkbox" onchange="[\'pwCur\',\'pwNew\',\'pwRep\'].forEach(function(i){$(i).type=this.checked?\'text\':\'password\';},this)"> Şifrəni göstər</label><span class="small" id="pwHint"></span></div>'+
 '<button class="btn" style="width:100%;margin-top:12px" onclick="changePw()">Şifrəni dəyiş</button></div>';}
function pwHint(){var n=$('pwNew').value,r=$('pwRep').value,h=$('pwHint');if(!h)return;var sc=(n.length>=8)+(/[A-Z]/.test(n)||/[ƏÖÜÇŞĞİ]/.test(n))+/\d/.test(n)+/[^A-Za-z0-9]/.test(n);
 h.innerHTML=!n?'':r&&r!==n?'<span style="color:var(--bad)">Təkrar uyğun deyil</span>':n.length<8?'<span style="color:var(--bad)">Çox qısadır</span>':sc>=3?'<span style="color:var(--ok)">Güclü ✓</span>':'<span style="color:var(--warn)">Orta — rəqəm və ya simvol əlavə edin</span>';}
function changePw(){var c=$('pwCur').value,n=$('pwNew').value,r=$('pwRep').value;
 if(!c)return toast('Cari şifrəni yazın');if(n.length<8)return toast('Yeni şifrə ən az 8 simvol olmalıdır');if(n!==r)return toast('Yeni şifrə təkrarı uyğun deyil');if(n===c)return toast('Yeni şifrə köhnə ilə eyni ola bilməz');
 if(/^(\d)\1+$/.test(n)||n==='12345678'||n==='123456789')return toast('Bu şifrə çox sadədir, başqasını seçin');
 toast('Yoxlanılır…');
 sb.auth.signInWithPassword({email:ME.email,password:c}).then(function(r1){if(r1.error)throw new Error('Cari şifrə səhvdir');return sb.auth.updateUser({password:n});})
 .then(function(r2){if(r2.error)throw r2.error;return sb.rpc('office_pw_changed');}).then(function(){if(EMP)EMP.pw_changed=true;['pwCur','pwNew','pwRep'].forEach(function(i){$(i).value='';});toast('Şifrə dəyişdirildi ✅ Növbəti girişdə yeni şifrəni istifadə edin');renderMe();renderPwBanner();})
 .catch(function(e){toast((e&&e.message)||'Şifrə dəyişdirilmədi');});}
function renderPwBanner(){var b=$('tPw');if(!b)return;b.innerHTML=EMP&&!EMP.pw_changed?'<div class="card pwban" onclick="if(SIMPLE){modal(\'<div class=&quot;mhead&quot;><h3>Şifrə</h3><button class=&quot;x&quot; onclick=&quot;closeModal()&quot;>×</button></div>\'+pwCard());return;}show(\'me\');setTimeout(function(){var c=$(\'pwCard\');if(c){c.scrollIntoView({behavior:\'smooth\',block:\'start\'});$(\'pwCur\').focus();}},400)"><span>🔒</span><div><b>Şifrənizi dəyişin</b><div class="small">Hazırda ümumi ilkin şifrə ilə daxil olursunuz. 1 dəqiqəlik işdir.</div></div><b class="go">›</b></div>':'';}

/* ---------- Ad günü təbrikləri ---------- */
var WISHES=[];
function bdayToday(){var md=today().slice(5);return EMPS.filter(function(e){return e.active&&e.birthday&&e.birthday.slice(5)===md;});}
function loadWishes(){var y=+today().slice(0,4);return run(sb.from('office_bday_wishes').select('*').eq('year',y)).then(function(r){WISHES=r;}).catch(function(){WISHES=[];});}
function renderBdayCards(){var t=$('tHr');if(!t)return;var list=bdayToday();if(!list.length){t.innerHTML='';return;}
 loadWishes().then(function(){t.innerHTML=list.map(function(e){var w=WISHES.filter(function(x){return x.to_emp===e.id;}),mine=EMP&&w.find(function(x){return x.from_emp===EMP.id;}),self=EMP&&EMP.id===e.id;
  if(self)return '<div class="card bdc me" onclick="showWishes('+e.id+')">'+avatarE(e,52)+'<div class="bdt"><b>🎉 Ad gününüz mübarək, '+esc(e.full_name.split(' ')[0])+'!</b><span>'+(w.length?'<b>'+w.length+'</b> həmkarınız sizi təbrik edib — oxumaq üçün toxunun':'Komandamız adından uğurlar arzulayırıq!')+'</span></div><b class="go">›</b></div>';
  return '<div class="card bdc" onclick="'+(mine?'showWishes('+e.id+')':'openWish('+e.id+')')+'">'+avatarE(e,52)+'<div class="bdt"><b>🎂 '+esc(e.full_name)+'</b><span>bu gün ad günüdür'+(w.length?' · '+w.length+' nəfər təbrik edib':'')+'</span></div>'+(mine?'<span class="pill p-ok">✓ Təbrik etdiniz</span>':'<button class="btn sm bdb" onclick="event.stopPropagation();openWish('+e.id+')">🎉 Təbrik et</button>')+'</div>';}).join('');});}
var WISH_TPL=['Ad günün mübarək! 🎉 Sağlamlıq, xoşbəxtlik və uğurlar arzulayıram!','Doğum günün mübarək! 🎂 Arzuların reallaşsın!','Ad günün mübarək! 🥳 Yeni yaşın sevinc və uğurlarla dolu olsun!','Təbrik edirəm! 🎁 Sənin kimi həmkarımız olduğu üçün şadıq!'];
function openWish(id){if(!EMP){toast('Təbrik üçün işçi kartı lazımdır');return;}var e=EMPS.find(function(x){return x.id===id;});if(!e)return;
 modal('<div class="mhead"><div class="row" style="gap:12px">'+avatarE(e,48)+'<div><h3>🎂 '+esc(e.full_name)+'</h3><div class="muted small">bu gün ad günüdür</div></div></div><button class="x" onclick="closeModal()">×</button></div>'+
  '<div class="field"><label>Hazır təbriklər</label><div class="wtpl">'+WISH_TPL.map(function(t,i){return '<button onclick="$(\'wMsg\').value=WISH_TPL['+i+'];$(\'wMsg\').focus()">'+esc(t)+'</button>';}).join('')+'</div></div>'+
  '<div class="field"><label>Təbrikiniz</label><textarea id="wMsg" maxlength="500" placeholder="Öz sözlərinizlə yazın…"></textarea></div><button class="btn" style="width:100%" id="wBtn" onclick="sendWish('+id+')">🎉 Təbriki göndər</button>');}
function sendWish(id){var m=$('wMsg').value.trim();if(!m)return toast('Təbrik mətnini yazın və ya hazır təbrik seçin');var b=$('wBtn');b.disabled=true;
 run(sb.from('office_bday_wishes').insert({to_emp:id,from_emp:EMP.id,year:+today().slice(0,4),message:m}).select().single()).then(function(w){closeModal();toast('Təbrikiniz göndərildi 🎉');try{sb.functions.invoke('office-wish',{body:{action:'bday',id:w.id}});}catch(e){}renderBdayCards();})
 .catch(function(e){b.disabled=false;err(e);});}
function showWishes(id){var e=EMPS.find(function(x){return x.id===id;});loadWishes().then(function(){var w=WISHES.filter(function(x){return x.to_emp===id;}).sort(function(a,b){return a.created_at<b.created_at?1:-1;});
 modal('<div class="mhead"><h3>🎂 '+(EMP&&EMP.id===id?'Sizə gələn təbriklər':esc(e.full_name)+' — təbriklər')+'</h3><button class="x" onclick="closeModal()">×</button></div>'+(w.length?w.map(function(x){var f=EMPS.find(function(y){return y.id===x.from_emp;})||{full_name:'?'};return '<div class="wish">'+avatarE(f,38)+'<div><b>'+esc(f.full_name)+'</b><p>'+esc(x.message)+'</p><span class="muted small">'+new Date(x.created_at).toLocaleString('az-AZ',{hour:'2-digit',minute:'2-digit'})+'</span></div></div>';}).join(''):'<p class="muted">Hələ təbrik yoxdur.</p>')+
  (EMP&&EMP.id!==id&&!w.some(function(x){return x.from_emp===EMP.id;})?'<button class="btn" style="width:100%;margin-top:10px" onclick="openWish('+id+')">🎉 Təbrik et</button>':''));});}

/* ---------- Profilim ---------- */
function renderMeProfileLink(){}
function renderMe(){var b=$('meBody');if(!EMP){b.innerHTML='<div class="card empty">Hesabınız işçi kartına bağlanmayıb.</div>';return;}var e=EMP,d=deptOf(e),mg=e.manager_id?EMPS.find(function(x){return x.id===e.manager_id;}):null,yr=+today().slice(0,4),used=leaveUsed(e.id,yr),left=(e.leave_days||21)-used;
 loadKudos().then(function(){var rec=KUDOS.filter(function(k){return k.to_emp===e.id;}).length;
 b.innerHTML='<div class="card mehead"><div class="meava" title="Profil şəklini dəyiş" onclick="$(\'mePh\').click()">'+avatarE(e,86)+'<i class="cam">📷</i></div><input id="mePh" type="file" accept="image/*" style="display:none" onchange="uploadPhoto(this.files[0])">'+'<div style="flex:1"><h2 style="margin:0">'+esc(e.full_name)+'</h2><div class="muted">'+esc((posOf(e)||{}).title||'')+(d?' · '+esc(d.name):'')+'</div>'+(e.photo?'<button class="linkbtn" onclick="removePhoto()">Şəkli sil</button>':'<div class="muted small" style="margin-top:4px">Profil şəkli əlavə etmək üçün dairəyə toxunun</div>')+'<div class="row" style="gap:8px;margin-top:8px">'+(e.hire_date?'<span class="pill p-acc">🗓 '+tenure(e.hire_date)+'</span>':'')+'<span class="pill p-acc">🙌 '+rec+' təşəkkür</span>'+(mg?'<span class="pill p-mut">Rəhbər: '+esc(mg.full_name)+'</span>':'')+'</div></div></div>'+
  '<div class="grid g4" style="margin-bottom:14px"><div class="kpi"><b>'+left+'</b><span>məzuniyyət günü qalıb ('+yr+')</span></div><div class="kpi"><b>'+used+'</b><span>gün istifadə olunub</span></div><div class="kpi"><b>'+String(e.work_start||'09:00').slice(0,5)+'–'+String(e.work_end||'18:00').slice(0,5)+'</b><span>iş saatım</span></div><div class="kpi"><b id="meLate">…</b><span>bu ay gecikmə</span></div></div>'+
  '<div class="grid g2" style="align-items:start"><div class="card"><div class="row sp"><h3 style="margin:0">Davamiyyətim · '+mLabel(today().slice(0,7))+'</h3><button class="btn ghost sm" onclick="openLeave(\'duzelis\')">Düzəliş istə</button></div><div id="meCal" style="margin-top:12px"></div><p class="muted small" style="margin-top:10px">Çıxışı qeyd etməyi unutmusunuzsa və ya səhv qeyd varsa, “Düzəliş istə” ilə HR-a bildirin.</p></div>'+
  '<div class="card"><h3>Əlaqə məlumatlarım</h3><div class="field"><label>Telefon</label><input id="meP" value="'+esc(e.phone||'')+'"></div><div class="field"><label>Təcili əlaqə şəxsi</label><input id="meE" value="'+esc(e.emergency_contact||'')+'" placeholder="məs: Anam — 050 123 45 67"></div><div class="field"><label>Haqqımda (komanda görür)</label><textarea id="meA" placeholder="məs: Satış üzrə 5 il təcrübə">'+esc(e.about||'')+'</textarea></div><button class="btn" onclick="saveMe()">Yadda saxla</button>'+
  '<div class="pgrid" style="margin-top:16px">'+(e.email?'<div><span>Giriş (email)</span><b style="font-size:13px">'+esc(e.email)+'</b></div>':'')+(e.birthday?'<div><span>Ad günü</span><b>'+(+e.birthday.slice(8))+' '+AZM[+e.birthday.slice(5,7)-1]+'</b></div>':'')+(e.hire_date?'<div><span>İşə başlama</span><b>'+dmyS(e.hire_date)+'</b></div>':'')+'</div></div></div>'+pwCard();
 meCalendar();}).catch(err);}
function monthEnd(m){var y=+m.slice(0,4),mo=+m.slice(5,7);return m+'-'+String(new Date(Date.UTC(y,mo,0)).getUTCDate()).padStart(2,'0');}
function dmyS(d){return d?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):'';}
function meCalendar(){var m=today().slice(0,7);run(sb.from('office_attendance').select('*').eq('employee_id',EMP.id).gte('day',m+'-01').lte('day',monthEnd(m))).then(function(rows){
 var y=+m.slice(0,4),mo=+m.slice(5,7),last=new Date(Date.UTC(y,mo,0)).getUTCDate(),first=isoDow(m+'-01'),d=today(),late=0,h='<div class="ocal">'+['B.e','Ç.a','Çər','C.a','Cüm','Şən','Baz'].map(function(w){return '<i>'+w+'</i>';}).join('');
 for(var k=1;k<first;k++)h+='<span></span>';
 for(var dd=1;dd<=last;dd++){var ds=m+'-'+String(dd).padStart(2,'0'),a=rows.find(function(r){return r.day===ds;}),lv=leaveOn(EMP.id,ds),wk=(EMP.workdays||[]).indexOf(isoDow(ds))>=0&&!isHol(ds),c,tt;
  if(a&&a.late_min>0)late++;
  if(ds>d){c='fut';tt='';}else if(lv&&lv.type!=='duzelis'&&!(a&&a.check_in)){c='lv';tt=LT[lv.type];}else if(a&&a.check_in){c=a.late_min?'lt':'ok';tt=hm(a.check_in)+(a.check_out?' – '+hm(a.check_out):' (çıxış yoxdur)')+(a.late_min?' · '+a.late_min+' dəq gec':'');}else if(wk&&ds<d){c='ab';tt='gəlməyib';}else{c='off';tt=isHol(ds)?'bayram':'istirahət';}
  h+='<span class="'+c+'" onclick="toast(\''+(dd+' '+AZM[mo-1]+(tt?': '+tt:'')).replace(/'/g,'')+'\')">'+dd+'</span>';}
 $('meCal').innerHTML=h+'</div><div class="olegend"><span class="ok"></span>vaxtında <span class="lt"></span>gecikib <span class="ab"></span>gəlməyib <span class="lv"></span>icazəli <span class="off"></span>istirahət</div>';var ml=$('meLate');if(ml)ml.textContent=late;}).catch(err);}
function saveMe(){sb.rpc('office_update_me',{p_phone:$('meP').value.trim(),p_emergency:$('meE').value.trim(),p_about:$('meA').value.trim()}).then(function(r){if(r.error)throw r.error;EMP.phone=$('meP').value.trim();EMP.emergency_contact=$('meE').value.trim();EMP.about=$('meA').value.trim();toast('Yadda saxlanıldı');}).catch(err);}

/* ---------- TELEFON BİLDİRİŞLƏRİ (Web Push) ---------- */
function b64u(s){var p='='.repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,'+').replace(/_/g,'/'),r=atob(b),o=new Uint8Array(r.length);for(var i=0;i<r.length;i++)o[i]=r.charCodeAt(i);return o;}
function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
function pushSupported(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;}
function pushState(){if(isNative()){if(!nativePush())return Promise.resolve('unsupported');return fcmOn().then(function(on){if(!on)return 'native-soon';var P=nativePush();nativePushInit();return P.checkPermissions().then(function(r){if(r.receive==='denied')return 'denied';return sb.from('office_push_subs').select('id').eq('user_id',ME.user_id).like('endpoint','fcm:%').then(function(q){return (r.receive==='granted'&&q.data&&q.data.length)?'on':'off';});});});}
 if(!pushSupported())return Promise.resolve(isIOS()&&!isStandalone()?'ios-install':'unsupported');if(Notification.permission==='denied')return Promise.resolve('denied');
 return navigator.serviceWorker.ready.then(function(r){return r.pushManager.getSubscription();}).then(function(sub){return sub&&Notification.permission==='granted'?'on':'off';}).catch(function(){return 'off';});}
function enablePush(){if(isNative()){var P=nativePush();if(!P)return;nativePushInit();P.requestPermissions().then(function(r){if(r.receive!=='granted'){toast('Bildiriş icazəsi verilmədi');renderPushCards();return;}return P.register().then(function(){toast('Bildirişlər aktivdir ✅');setTimeout(function(){notify('push_test',{});renderPushCards();},1500);});}).catch(err);return;}
 if(isIOS()&&!isStandalone()){pushHelpIOS();return;}
 if(!pushSupported()){toast('Bu brauzer bildirişləri dəstəkləmir');return;}
 Notification.requestPermission().then(function(p){if(p!=='granted'){toast('Bildiriş icazəsi verilmədi');renderPushCards();return;}
  return Promise.all([navigator.serviceWorker.ready,sb.rpc('office_push_key')]).then(function(r){var reg=r[0],key=r[1]&&r[1].data;if(!key)throw new Error('Açar alınmadı');
   return reg.pushManager.getSubscription().then(function(old){return old||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(key)});});})
  .then(function(sub){var j=sub.toJSON();return sb.from('office_push_subs').upsert({user_id:ME.user_id,endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth,ua:navigator.userAgent.slice(0,200)},{onConflict:'endpoint'}).then(function(r){if(r.error)throw r.error;});})
  .then(function(){toast('Bildirişlər aktivdir ✅');notify('push_test',{});renderPushCards();});}).catch(err);}
function pushHelpIOS(){if($('iosSheet')){iosSheetShow(true);return;}modal('<div class="mhead"><h3>iPhone-da bildirişlər</h3><button class="x" onclick="closeModal()">×</button></div><p style="font-size:16px;line-height:1.6">iPhone bildirişləri yalnız tətbiq <b>ana ekrana əlavə olunanda</b> göndərir:</p><ol style="margin:12px 0 0 20px;line-height:1.9;font-size:16px"><li>Safari-də aşağıdakı <b>Paylaş</b> düyməsinə (□↑) bas</li><li><b>“Ana ekrana əlavə et”</b> → <b>Əlavə et</b></li><li>Ana ekrandakı <b>Ofis</b> ikonundan aç və daxil ol</li><li><b>“Bildirişləri aktiv et”</b> düyməsinə bas → <b>İcazə ver</b></li></ol>');}
function renderPushCards(){var boxes=[$('pushCard'),$('ownPush')].filter(Boolean);if(!boxes.length)return;
 pushState().then(function(st){var h;
  if(st==='on')h='';
  else if(st==='denied')h='<div class="pushcta warn"><span>🔕</span><div><b>Bildirişlər bloklanıb</b><small>Brauzerin/telefonun ayarlarında bu sayt üçün bildirişlərə icazə verin, sonra səhifəni yeniləyin.</small></div></div>';
  else if(st==='native-soon')h='<div class="pushcta warn"><span>🔔</span><div><b>Bildirişlər tezliklə</b><small>Tətbiq üçün bildiriş xidməti qoşulur. Hazır olanda burada “Aktiv et” düyməsi görünəcək.</small></div></div>';
  else if(st==='unsupported')h='<div class="pushcta warn"><span>🔕</span><div><b>Bu brauzer bildirişləri dəstəkləmir</b><small>Chrome, Edge və ya Safari (iOS 16.4+) istifadə edin.</small></div></div>';
  else h='<div class="pushcta"><span>🔔</span><div><b>Bildirişləri aktiv et</b><small>'+(st==='ios-install'?'iPhone-da əvvəlcə tətbiqi ana ekrana əlavə edin.':'Yeni tapşırıq, xatırlatma və sorğu nəticələri telefonun bildiriş panelinə düşsün.')+'</small></div><button class="btn" onclick="enablePush()">'+(st==='ios-install'?'Necə?':'Aktiv et')+'</button></div>';
  boxes.forEach(function(b){b.innerHTML=h;});});}



/* ---------- Ehtiyat nüsxələr ---------- */
function renderBackups(){var c=$('bkSet');if(!c)return;run(sb.from('office_backup_log').select('*').order('id',{ascending:false}).limit(30)).then(function(l){var okL=l.filter(function(x){return x.ok;}),last=okL[0];
 c.innerHTML='<p class="muted small">Sistem <b>hər gecə saat 03:00-da</b> bütün məlumatların (işçilər, gəliş-gediş, məzuniyyətlər, planlar, tapşırıqlar, komendantlıq ödənişləri) tam nüsxəsini avtomatik çıxarır. Nüsxələr <b>400 gün</b> saxlanılır.</p>'+
  (last?'<div class="note" style="margin:10px 0">✅ Son nüsxə: <b>'+new Date(last.created_at).toLocaleString('az-AZ',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})+'</b> · '+Math.round(last.bytes/1024)+' KB · cəmi '+okL.length+' nüsxə</div>':'<div class="note bad" style="margin:10px 0">Hələ nüsxə yoxdur</div>')+
  (l.length&&!l[0].ok?'<div class="note bad" style="margin-bottom:10px">⚠️ Son cəhd alınmadı: '+esc(l[0].note||'')+'</div>':'')+
  '<div class="row" style="gap:8px;margin-bottom:10px"><button class="btn sm" onclick="backupNow(this)">İndi nüsxə yarat</button>'+(last?'<button class="btn ghost sm" onclick="dlBackup(\''+esc(last.path)+'\')">⬇ Son nüsxəni yüklə</button>':'')+'</div>'+
  (okL.length>1?'<details><summary class="small muted" style="cursor:pointer">Bütün nüsxələr</summary>'+okL.map(function(x){return '<div class="row sp small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>'+new Date(x.created_at).toLocaleString('az-AZ',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' · '+Math.round(x.bytes/1024)+' KB</span><button class="linkbtn" onclick="dlBackup(\''+esc(x.path)+'\')">yüklə</button></div>';}).join('')+'</details>':'')+
  '<p class="muted small" style="margin-top:10px">Tövsiyə: ayda bir dəfə son nüsxəni yükləyib kompüterdə və ya Google Drive-da da saxlayın.</p>';}).catch(function(){c.innerHTML='<p class="muted small">Yalnız admin və HR rəhbəri görür.</p>';});}
function backupNow(b){b.disabled=true;b.textContent='Hazırlanır…';sb.functions.invoke('office-backup',{body:{}}).then(function(r){if(r.error||!(r.data&&r.data.ok))throw new Error((r.data&&r.data.error)||'Alınmadı');toast('Nüsxə yaradıldı ✅');renderBackups();}).catch(function(e){toast(e.message);b.disabled=false;b.textContent='İndi nüsxə yarat';});}
function dlBackup(path){sb.storage.from('backups').createSignedUrl(path,300,{download:true}).then(function(r){if(r.error||!r.data)throw r.error||new Error('Yüklənmədi');location.href=r.data.signedUrl;}).catch(err);}

/* ---------- Firebase (mobil tətbiq) ayarı ---------- */
function renderFcmSet(){var c=$('fcmSet');if(!c)return;sb.rpc('office_fcm_project').then(function(r){var pj=r&&r.data;
 c.innerHTML=(pj?'<p>✅ Qoşulub: <b>'+esc(pj)+'</b>. Android tətbiqində “Bildirişləri aktiv et” işləyir.</p><details style="margin-top:8px"><summary class="small muted" style="cursor:pointer">Faylı dəyiş</summary>':'<p class="muted small">Firebase layihəsindəki <b>Service account</b> açar faylını (JSON) seçin: Project settings → Service accounts → Generate new private key. Fayl yalnız serverdə saxlanılır.</p>')+
  '<div class="row" style="margin-top:8px"><label class="btn ghost sm" style="cursor:pointer">📄 JSON faylı seç<input type="file" accept=".json,application/json" hidden onchange="fcmFile(this.files[0])"></label><span class="muted small" id="fcmName"></span></div>'+(pj?'</details>':'');}).catch(function(){});}
function fcmFile(f){if(!f)return;var rd=new FileReader();rd.onload=function(){var j;try{j=JSON.parse(rd.result);}catch(e){toast('Fayl JSON deyil');return;}
 $('fcmName').textContent=f.name;sb.rpc('office_set_fcm',{sa:j}).then(function(r){if(r.error)throw r.error;toast('Firebase qoşuldu: '+r.data);_fcmOn=null;renderFcmSet();}).catch(err);};rd.readAsText(f);}

/* ---------- TELEGRAM ---------- */
var TGBOT=null;
function notify(action,payload){try{sb.functions.invoke('office-telegram',{body:Object.assign({action:action},payload||{})}).catch(function(){});}catch(e){}}
function tgBot(){return TGBOT!==null?Promise.resolve(TGBOT):sb.rpc('office_tg_bot').then(function(r){TGBOT=(r&&r.data)||'';return TGBOT;});}
function renderTgCard(){var c=$('tgCard');if(!c)return;if(EMP&&EMP.tg_chat_id){c.style.display='none';return;}pushState().then(function(ps){if(ps==='on'){c.style.display='none';return;}renderTgCard2(c);});}
function renderTgCard2(c){if(!EMP){if(!MGR){c.style.display='none';return;}c.style.display='';
  Promise.all([tgBot(),sb.rpc('office_tg_code')]).then(function(r){var bot=r[0],d=(r[1]&&r[1].data)||{};
   if(!bot){c.innerHTML='<h3>🔔 Telegram bildirişləri</h3><p class="muted small">Botu Ayarlar bölməsində qoşun.</p>';return;}
   if(d.connected){c.style.display='none';return;}
   c.innerHTML='<div class="row" style="justify-content:space-between"><div><h3 style="margin:0">🔔 Rəhbər bildirişlərini aktiv et</h3><div class="muted small">İşçi kartınız olmasa da, rəhbər bildirişlərini Telegram-da ala bilərsiniz.</div></div><a class="btn" target="_blank" rel="noopener" href="https://t.me/'+encodeURIComponent(bot)+'?start='+esc(d.code)+'">Telegram-ı qoş</a></div><p class="muted small" style="margin-top:8px">Açılan Telegram-da <b>START</b> basın, sonra bu səhifəni yeniləyin.</p>';}).catch(function(){});return;}
 c.style.display='';
 tgBot().then(function(bot){
  if(!bot){c.innerHTML='<h3>🔔 Telegram bildirişləri</h3><p class="muted small">Rəhbər hələ Telegram botunu qoşmayıb.</p>';return;}
  c.innerHTML='<div class="row" style="justify-content:space-between"><div><h3 style="margin:0">🔔 Bildirişlər Telegram-a gəlsin?</h3><div class="muted small">Telefon bildirişləri işləmirsə, Telegram-dan istifadə edə bilərsiniz.</div></div><a class="btn" target="_blank" rel="noopener" href="https://t.me/'+encodeURIComponent(bot)+'?start='+EMP.tg_code+'">Telegram-ı qoş</a></div><p class="muted small" style="margin-top:8px">Açılan Telegram-da <b>START</b> basın, sonra bu səhifəni yeniləyin.</p>';});}
function tgTest(){sb.functions.invoke('office-telegram',{body:{action:'test'}}).then(function(r){toast(r&&r.data&&r.data.ok?'Göndərildi — Telegram-a baxın':'Göndərilmədi');});}
function renderTgSet(){var c=$('tgSet');if(!c)return;var bot=(CFG&&CFG.tg_bot)||'';
 c.innerHTML=(bot?'<p>✅ Qoşulub: <b>@'+esc(bot)+'</b></p><p class="muted small">İşçilər "Bu gün" bölməsindən <b>“Telegram-ı qoş”</b> basıb aktiv edirlər. Rəhbərlər hər iş günü 09:30-da səhər xülasəsi alır; 19:00-da çıxışı unudanlara xatırlatma gedir; ad günü, sınaq və müqavilə bitmə xəbərdarlıqları 08:00-da gəlir.</p><div class="row" style="margin-top:8px"><button class="btn ghost sm" onclick="tgTest()">Özümə test göndər</button></div><details style="margin-top:12px"><summary class="small muted" style="cursor:pointer">Botu dəyiş</summary>':'<ol class="small" style="margin:0 0 10px 18px;line-height:1.7"><li>Telegram-da <b>@BotFather</b>-ı açın → <b>/newbot</b></li><li>Bota ad verin (məs: “Baş Ofis”) və istifadəçi adı (məs: <i>sirket_ofis_bot</i>)</li><li>BotFather-in verdiyi <b>token</b>-i aşağıya yapışdırın</li></ol>')+
  '<div class="row"><input id="tgTok" class="btn ghost" style="flex:1;min-width:220px;text-align:left;font-weight:500" placeholder="123456789:AA..." autocomplete="off"><button class="btn" onclick="tgSetup()">Qoş</button></div>'+(bot?'</details>':'');}
function tgSetup(){var t=$('tgTok').value.trim();if(!/^\d+:[\w-]{30,}$/.test(t))return toast('Token formatı səhvdir');toast('Qoşulur…');
 sb.functions.invoke('office-telegram',{body:{action:'setup',token:t}}).then(function(r){if(r.error){var c=r.error.context;return (c&&c.json?c.json():Promise.resolve({})).then(function(j){throw new Error(j.error||r.error.message);});}if(r.data&&r.data.error)throw new Error(r.data.error);
  CFG.tg_bot=r.data.bot;TGBOT=r.data.bot;renderTgSet();toast('Bot qoşuldu: @'+r.data.bot);}).catch(err);}

/* ---------- SORĞULAR (məzuniyyət, icazə) ---------- */
function dDays(a,b){return Math.round((new Date(b+'T12:00:00Z')-new Date(a+'T12:00:00Z'))/864e5)+1;}
function isHol(d){return HOL.some(function(h){return h.day===d;});}
function leaveOn(eid,d){return LEAVES.find(function(l){return l.employee_id===eid&&l.status==='approved'&&l.type!=='duzelis'&&l.date_from<=d&&l.date_to>=d;});}
function leaveUsed(eid,yr){return LEAVES.filter(function(l){return l.employee_id===eid&&l.type==='mezuniyyet'&&l.status!=='rejected'&&l.date_from.slice(0,4)===String(yr);}).reduce(function(s,l){return s+dDays(l.date_from,l.date_to);},0);}
function lvPill(st){return st==='approved'?'<span class="pill p-ok">təsdiqlənib</span>':st==='rejected'?'<span class="pill p-bad">rədd edilib</span>':'<span class="pill p-warn">gözləyir</span>';}
function lvRange(l){var f=l.date_from.slice(8)+'.'+l.date_from.slice(5,7),t=l.date_to.slice(8)+'.'+l.date_to.slice(5,7);return (f===t?f:f+' – '+t)+(l.type==='icaze'&&l.hours?' · '+l.hours+' saat':' · '+dDays(l.date_from,l.date_to)+' gün');}
function renderLeave(){var yr=today().slice(0,4);
 if(EMP){var used=leaveUsed(EMP.id,yr),tot=EMP.leave_days||21,mine=LEAVES.filter(function(l){return l.employee_id===EMP.id;});
  $('lvKpi').innerHTML=kpi(Math.max(0,tot-used)+' gün','məzuniyyət qalığı ('+yr+')','ok')+kpi(used,'istifadə olunub')+kpi(mine.filter(function(l){return l.status==='pending';}).length,'gözləyən sorğu','warn')+kpi(mine.filter(function(l){return l.type==='xestelik'&&l.date_from.slice(0,4)===yr;}).reduce(function(s,l){return s+dDays(l.date_from,l.date_to);},0),'xəstəlik günü');}
 else $('lvKpi').innerHTML='';
 var pend=LEAVES.filter(function(l){return l.status==='pending';});
 $('lvPendBox').style.display=MGR?'':'none';$('lvF').style.display=MGR?'':'none';$('lvListH').textContent=MGR?'Bütün sorğular':'Mənim sorğularım';
 if(MGR)$('lvPend').innerHTML=pend.length?pend.map(function(l){var e=EMPS.find(function(x){return x.id===l.employee_id;})||{};var bal=l.type==='mezuniyyet'?' · qalıq: '+Math.max(0,(e.leave_days||21)-leaveUsed(l.employee_id,l.date_from.slice(0,4))+dDays(l.date_from,l.date_to))+' gün':'';
   return '<div class="lvrow"><div><b>'+esc(e.full_name||'—')+'</b> · '+LT[l.type]+'<div class="muted small">'+lvRange(l)+bal+(l.reason?' · '+esc(l.reason):'')+'</div></div><div class="row"><button class="btn sm" onclick="decideLeave('+l.id+',\'approved\')">Təsdiqlə</button><button class="btn red sm" onclick="decideLeave('+l.id+',\'rejected\')">Rədd et</button></div></div>';}).join(''):'<div class="empty">Gözləyən sorğu yoxdur</div>';
 var f=$('lvF').value||'all';$('lvF').onchange=renderLeave;
 var list=(MGR?LEAVES:LEAVES.filter(function(l){return EMP&&l.employee_id===EMP.id;})).filter(function(l){return f==='all'||l.status===f;});
 $('lvList').innerHTML=list.length?'<table><tr>'+(MGR?'<th>İşçi</th>':'')+'<th>Növ</th><th>Tarix</th><th>Status</th><th></th></tr>'+list.map(function(l){var mine=EMP&&l.employee_id===EMP.id;return '<tr>'+(MGR?'<td><b>'+esc(empName(l.employee_id))+'</b></td>':'')+'<td>'+LT[l.type]+(l.reason?'<div class="muted small">'+esc(l.reason)+'</div>':'')+'</td><td class="small">'+lvRange(l)+'</td><td>'+lvPill(l.status)+(l.decision_note?'<div class="muted small">'+esc(l.decision_note)+'</div>':'')+'</td><td>'+((l.status==='pending'&&mine)||MGR?'<button class="btn ghost sm" onclick="delLeave('+l.id+')">'+(l.status==='pending'?'Ləğv et':'Sil')+'</button>':'')+'</td></tr>';}).join('')+'</table>':'<div class="empty">Sorğu yoxdur</div>';}
function openLeave(preset){if(!EMP&&!MGR){toast('Hesabınız işçi kartına bağlanmayıb');return;}var t=today();
 modal('<div class="mhead"><h3>Yeni sorğu</h3><button class="x" onclick="closeModal()">×</button></div>'+(MGR?'<div class="field"><label>İşçi</label><select id="lE">'+EMPS.filter(function(e){return e.active;}).map(function(e){return '<option value="'+e.id+'"'+(EMP&&e.id===EMP.id?' selected':'')+'>'+esc(e.full_name)+'</option>';}).join('')+'</select></div>':'')+
  '<div class="field"><label>Növ</label><select id="lT" onchange="$(\'lHw\').style.display=this.value===\'icaze\'?\'\':\'none\'">'+Object.keys(LT).map(function(k){return '<option value="'+k+'">'+LT[k]+'</option>';}).join('')+'</select></div>'+
  '<div class="grid g2"><div class="field"><label>Başlanğıc</label><input id="lF" type="date" value="'+t+'"></div><div class="field"><label>Son gün</label><input id="lTo" type="date" value="'+t+'"></div></div>'+
  '<div class="field" id="lHw" style="display:none"><label>Neçə saat</label><input id="lH" type="number" step="0.5" min="0.5" max="8" value="2"></div>'+
  '<div class="field"><label>Səbəb / qeyd</label><textarea id="lR" placeholder="İstəyə bağlı"></textarea></div><div class="row" style="justify-content:flex-end"><button class="btn" onclick="saveLeave()">Göndər</button></div>');if(preset){var s1=$('lT');if(s1){s1.value=preset;if(s1.onchange)s1.onchange();var r1=$('lR');if(r1&&preset==='duzelis')r1.placeholder='məs: 25 sentyabrda çıxışı qeyd etməyi unutmuşam, 18:05-də çıxmışam';}}}
function saveLeave(){var b={employee_id:MGR&&$('lE')?+$('lE').value:EMP.id,type:$('lT').value,date_from:$('lF').value,date_to:$('lTo').value,reason:$('lR').value.trim()};
 if(!b.date_from||!b.date_to||b.date_to<b.date_from)return toast('Tarixləri düzgün seçin');if(b.type==='icaze')b.hours=+$('lH').value||null;
 if(MGR&&(!EMP||b.employee_id!==EMP.id)){b.status='approved';b.decided_by=ME.user_id;b.decided_at=new Date().toISOString();}
 run(sb.from('office_leaves').insert(b).select().single()).then(function(l){LEAVES.unshift(l);closeModal();toast(l.status==='approved'?'Əlavə olundu':'Sorğu göndərildi');renderLeave();if(typeof notify==='function'&&l.status==='pending')notify('leave_new',{id:l.id});}).catch(err);}
function decideLeave(id,st){var note=st==='rejected'?(prompt('Rədd səbəbi (istəyə bağlı):')||''):'';
 run(sb.from('office_leaves').update({status:st,decided_by:ME.user_id,decided_at:new Date().toISOString(),decision_note:note}).eq('id',id).select().single()).then(function(l){var i=LEAVES.findIndex(function(x){return x.id===id;});LEAVES[i]=l;toast(st==='approved'?'Təsdiqləndi':'Rədd edildi');renderLeave();if(typeof notify==='function')notify('leave_decided',{id:id});}).catch(err);}
function delLeave(id){if(!confirm('Sorğu silinsin?'))return;run(sb.from('office_leaves').delete().eq('id',id)).then(function(){LEAVES=LEAVES.filter(function(x){return x.id!==id;});renderLeave();}).catch(err);}

/* ---------- DAVAMİYYƏT ---------- */
function renderDay(){var d=$('dDay').value||today();Promise.all([run(sb.from('office_attendance').select('*').eq('day',d)),run(sb.from('office_outings').select('*').eq('day',d).order('out_at'))]).then(function(rr){var att=rr[0],outs=rr[1];var act=EMPS.filter(function(e){return e.active&&locMatch(e);});
 $('dayTbl').innerHTML='<table><tr><th>İşçi</th><th>Gəliş</th><th>Çıxış</th><th>Status</th><th class="hide-m">Məsafə</th><th></th></tr>'+act.map(function(e){var a=att.find(function(x){return x.employee_id===e.id;});var work=(e.workdays||[]).indexOf(isoDow(d))>=0&&!isHol(d);var lv=leaveOn(e.id,d);
  var st=lv&&!(a&&a.check_in)?'<span class="pill p-acc">'+LT[lv.type]+'</span>':a&&a.check_in?(a.late_min?'<span class="pill p-warn">'+a.late_min+' dəq gec</span>':'<span class="pill p-ok">vaxtında</span>')+(a.early_min?' <span class="pill p-mut">'+a.early_min+' dəq tez</span>':''):(work?'<span class="pill p-bad">gəlməyib</span>':'<span class="pill p-mut">'+(isHol(d)?'bayram':'istirahət')+'</span>');
  var eo=outs.filter(function(o){return o.employee_id===e.id;});var otx=eo.map(function(o){return '<div class="small" style="margin-top:3px">'+(o.kind==='is'?'💼':'🙋')+' '+hm(o.out_at)+'–'+(o.back_at?hm(o.back_at):'<b style="color:var(--warn)">çöldədir</b>')+' · '+esc(o.note)+(o.ended_day?' <span class="pill p-mut">günü çöldə bitirdi</span>':'')+(o.arrive_lat!=null?' <span class="pill p-ok">📍 çatıb '+hm(o.arrive_at)+(o.arrive_auto?' (avto)':'')+'</span>':'')+' <a class="maplink" href="#" onclick="openRoute('+o.id+');return false">🗺 Marşrut</a>'+(o.ended_day&&o.back_lat!=null?' <a class="maplink" target="_blank" rel="noopener" href="https://www.google.com/maps?q='+o.back_lat+','+o.back_lng+'">🏁 günü bitirdiyi yer</a>':'')+'</div>';}).join('');
  return '<tr><td><b>'+esc(e.full_name)+'</b>'+locPill(e,a)+'</td><td>'+hm(a&&a.check_in)+(a?selfieThumb(a.photo_in):'')+'</td><td>'+hm(a&&a.check_out)+(a?selfieThumb(a.photo_out):'')+'</td><td>'+st+(a&&a.note?'<div class="muted small">'+esc(a.note)+'</div>':'')+otx+'</td><td class="hide-m muted small">'+(a&&a.in_dist!=null?a.in_dist+' m':'')+'</td><td><button class="btn ghost sm" onclick="editAtt('+e.id+',\''+d+'\')">✎</button></td></tr>';}).join('')+'</table>';
 renderDay._att=att;hydrateSelfies($('dayTbl'));}).catch(err);}
function editAtt(eid,d){var a=(renderDay._att||[]).find(function(x){return x.employee_id===eid;})||{};function t(ts){return ts?hm(ts):'';}
 modal('<div class="mhead"><h3>'+esc(empName(eid))+' · '+d+'</h3><button class="x" onclick="closeModal()">×</button></div><div class="grid g2"><div class="field"><label>Gəliş</label><input id="eIn" type="time" value="'+t(a.check_in)+'"></div><div class="field"><label>Çıxış</label><input id="eOut" type="time" value="'+t(a.check_out)+'"></div></div><div class="field"><label>Qeyd (məs: icazəli, xəstə, ezamiyyət)</label><input id="eNote" value="'+esc(a.note||'')+'"></div><button class="btn" onclick="saveAtt('+eid+',\''+d+'\')">Yadda saxla</button>');}
function isWorkdayToday(){var wd=(CFG&&CFG.work_days)||[1,2,3,4,5];var dow=((new Date().getDay()+6)%7)+1;/*1=B.e..7=Baz*/return wd.indexOf(dow)>=0;}
function workdayNote(){return '';}
function dayHours(e,d){var s2=e.schedule&&e.schedule[String(isoDow(d))];return s2?s2:[String(e.work_start).slice(0,5),String(e.work_end).slice(0,5)];}
function bakuTs(d,t){return t?new Date(d+'T'+t+':00+04:00').toISOString():null;}
function saveAtt(eid,d){var e=EMPS.find(function(x){return x.id===eid;}),ci=$('eIn').value,co=$('eOut').value;var g=(CFG&&CFG.grace_min)||0;
 function mins(t){var p=String(t).slice(0,5).split(':');return (+p[0])*60+(+p[1]);}
 var hh=dayHours(e,d);var late=ci?Math.max(0,mins(ci)-mins(hh[0])):0;if(late<=g)late=0;var early=co?Math.max(0,mins(hh[1])-mins(co)):0;var worked=ci&&co?Math.max(0,mins(co)-mins(ci)):0;
 run(sb.from('office_attendance').upsert({employee_id:eid,day:d,check_in:bakuTs(d,ci),check_out:bakuTs(d,co),late_min:late,early_min:early,worked_min:worked,note:$('eNote').value.trim(),source:'manual'},{onConflict:'employee_id,day'})).then(function(){closeModal();toast('Yadda saxlanıldı');renderDay();renderMonth();}).catch(err);}
function monthRows(cb){var m=$('mMonth').value||today().slice(0,7);var y=+m.slice(0,4),mo=+m.slice(5,7);var last=new Date(Date.UTC(y,mo,0)).getUTCDate();var to=m+'-'+String(last).padStart(2,'0');
 run(sb.from('office_attendance').select('*').gte('day',m+'-01').lte('day',to)).then(function(att){var upto=(m===today().slice(0,7))?+today().slice(8):last;
  cb(EMPS.filter(function(e){return e.active&&locMatch(e);}).map(function(e){var a=att.filter(function(x){return x.employee_id===e.id;});var st0=[e.hire_date||'',String(e.created_at||'').slice(0,10)].sort().pop();var plan=0,lvd=0;for(var i=1;i<=upto;i++){var ds=m+'-'+String(i).padStart(2,'0');if(ds>=st0&&(e.workdays||[]).indexOf(isoDow(ds))>=0&&!isHol(ds)){plan++;if(leaveOn(e.id,ds)&&!a.some(function(x){return x.day===ds&&x.check_in;}))lvd++;}}
   var came=a.filter(function(x){return x.check_in;}).length;return {e:e,plan:plan,came:came,leave:lvd,absent:Math.max(0,plan-came-lvd),lateN:a.filter(function(x){return x.late_min>0;}).length,lateM:a.reduce(function(s,x){return s+(x.late_min||0);},0),earlyM:a.reduce(function(s,x){return s+(x.early_min||0);},0),work:a.reduce(function(s,x){return s+(x.worked_min||0);},0)};}),m);}).catch(err);}
function renderMonth(){monthRows(function(R){$('monthTbl').innerHTML='<table><tr><th>İşçi</th><th>Plan</th><th>Gəlib</th><th>İcazəli</th><th>Gəlməyib</th><th>Gecikmə</th><th class="hide-m">Tez çıxma</th><th>İşlənib</th></tr>'+R.map(function(r){return '<tr><td><b>'+esc(r.e.full_name)+'</b></td><td>'+r.plan+'</td><td>'+r.came+'</td><td>'+(r.leave||'—')+'</td><td>'+(r.absent?'<span class="pill p-bad">'+r.absent+'</span>':'0')+'</td><td>'+(r.lateN?'<span class="pill p-warn">'+r.lateN+' dəfə · '+hmin(r.lateM)+'</span>':'—')+'</td><td class="hide-m">'+(r.earlyM?hmin(r.earlyM):'—')+'</td><td>'+hmin(r.work)+'</td></tr>';}).join('')+'</table>';});}
function xlsx(rows,name){function go(){var ws=XLSX.utils.aoa_to_sheet(rows);var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Tabel');XLSX.writeFile(wb,name);}
 if(window.XLSX)return go();var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=go;document.head.appendChild(s);}
function exportMonth(){monthRows(function(R,m){xlsx([['İşçi','Vəzifə','Plan günləri','Gəlib','İcazəli','Gəlməyib','Gecikmə sayı','Gecikmə (dəq)','Tez çıxma (dəq)','İşlənib (saat)']].concat(R.map(function(r){return [r.e.full_name,(posOf(r.e)||{}).title||'',r.plan,r.came,r.leave,r.absent,r.lateN,r.lateM,r.earlyM,Math.round(r.work/6)/10];})),'tabel-'+m+'.xlsx');});}
function exportDay(){var d=$('dDay').value;var att=renderDay._att||[];xlsx([['İşçi','İş yeri','Gəliş','Çıxış','Gecikmə (dəq)','Tez çıxma (dəq)','Qeyd']].concat(EMPS.filter(function(e){return e.active&&locMatch(e);}).map(function(e){var a=att.find(function(x){return x.employee_id===e.id;})||{};return [e.full_name,locName(a.check_in?a.location_id:e.location_id),hm(a.check_in),hm(a.check_out),a.late_min||0,a.early_min||0,a.note||''];})),'davamiyyet-'+d+'.xlsx');}

/* ---------- ŞTAT ---------- */
function renderStaff(){var act=EMPS.filter(function(e){return e.active;});var total=POS.reduce(function(s,p){return s+(p.headcount||0);},0);
 $('sKpi').innerHTML=kpi(DEPTS.length,'şöbə')+kpi(total,'ştat vahidi')+kpi(act.length,'işçi','ok')+kpi(Math.max(0,total-act.filter(function(e){return e.position_id;}).length),'vakansiya','warn');
 $('deptList').innerHTML=(DEPTS.map(function(d){var ps=POS.filter(function(p){return p.department_id===d.id;});
  return '<div class="dept"><div class="dept-h"><span style="flex:1">'+esc(d.name)+'</span><button class="btn ghost sm" onclick="addPos('+d.id+')">+ Vəzifə</button><button class="btn ghost sm" onclick="renDept('+d.id+')">✎</button></div>'+
   (ps.map(function(p){var who=act.filter(function(e){return e.position_id===p.id;});var vac=(p.headcount||0)-who.length;
    return '<div class="pos"><b>'+esc(p.title)+'</b><span class="pill '+(vac>0?'p-warn':'p-ok')+'">'+who.length+' / '+p.headcount+'</span><span class="who">'+(who.map(function(e){return esc(e.full_name);}).join(', ')||'boşdur')+'</span><button class="btn ghost sm" onclick="editPos('+p.id+')">✎</button></div>';}).join('')||'<div class="pos muted small">Vəzifə yoxdur</div>')+'</div>';}).join(''))||'<div class="card empty">Hələ şöbə yoxdur. "+ Şöbə" ilə başlayın.</div>';
 $('empTbl').innerHTML=EMPS.length?'<table><tr><th>Ad</th><th>Vəzifə</th><th class="hide-m">Rəhbəri</th><th class="hide-m">Qrafik</th><th>Hesab</th><th></th></tr>'+EMPS.map(function(e){var p=posOf(e);return '<tr style="'+(e.active?'':'opacity:.5')+'"><td><b>'+esc(e.full_name)+demoTag(e)+'</b><div class="muted small">'+esc(e.phone||'')+(LOCS.length?' · '+esc(locName(e.location_id)):'')+'</div></td><td>'+esc(p?p.title:'—')+'</td><td class="hide-m">'+esc(e.manager_id?empName(e.manager_id):'—')+'</td><td class="hide-m small">'+String(e.work_start).slice(0,5)+'–'+String(e.work_end).slice(0,5)+'</td><td>'+(e.user_id?'<span class="pill p-ok">bağlı</span>':'<span class="pill p-mut">yox</span>')+'</td><td><button class="btn ghost sm" onclick="openEmp('+e.id+')">✎</button></td></tr>';}).join('')+'</table>':'<div class="empty">Hələ işçi yoxdur</div>';}
function addDept(){var n=prompt('Şöbənin adı:');if(!n)return;run(sb.from('office_departments').insert({name:n.trim()}).select().single()).then(function(d){DEPTS.push(d);renderStaff();}).catch(err);}
function renDept(id){var d=DEPTS.find(function(x){return x.id===id;});var n=prompt('Şöbənin adı (silmək üçün boş buraxın):',d.name);if(n===null)return;
 if(!n.trim()){if(!confirm('Şöbə və onun vəzifələri silinsin?'))return;run(sb.from('office_departments').delete().eq('id',id)).then(function(){return loadAll();}).then(renderStaff).catch(err);return;}
 run(sb.from('office_departments').update({name:n.trim()}).eq('id',id)).then(function(){d.name=n.trim();renderStaff();}).catch(err);}
function addPos(did){posModal({department_id:did,title:'',headcount:1});}
function editPos(id){posModal(POS.find(function(x){return x.id===id;}));}
function posModal(p){modal('<div class="mhead"><h3>'+(p.id?'Vəzifə':'Yeni vəzifə')+'</h3><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Vəzifə adı</label><input id="pT" value="'+esc(p.title)+'"></div><div class="field"><label>Ştat vahidi (neçə nəfər)</label><input id="pH" type="number" min="0" value="'+(p.headcount||1)+'"></div><div class="row">'+(p.id?'<button class="btn red" onclick="delPos('+p.id+')">Sil</button>':'')+'<span style="flex:1"></span><button class="btn" onclick="savePos('+(p.id||0)+','+p.department_id+')">Yadda saxla</button></div>');}
function savePos(id,did){var b={title:$('pT').value.trim(),headcount:+$('pH').value||0,department_id:did};if(!b.title)return toast('Ad yazın');
 run(id?sb.from('office_positions').update(b).eq('id',id).select().single():sb.from('office_positions').insert(b).select().single()).then(function(p){var i=POS.findIndex(function(x){return x.id===p.id;});if(i>=0)POS[i]=p;else POS.push(p);closeModal();renderStaff();}).catch(err);}
function delPos(id){if(!confirm('Vəzifə silinsin?'))return;run(sb.from('office_positions').delete().eq('id',id)).then(function(){POS=POS.filter(function(x){return x.id!==id;});closeModal();renderStaff();}).catch(err);}
function openEmp(id){var e=id?EMPS.find(function(x){return x.id===id;}):{full_name:'',work_start:'09:00',work_end:'18:00',workdays:[1,2,3,4,5],active:true};
 var used=EMPS.filter(function(x){return x.user_id&&x.id!==e.id;}).map(function(x){return x.user_id;});
 var accs=PROFS.filter(function(p){return p.active&&used.indexOf(p.user_id)<0&&(p.perms||[]).indexOf('ofis_owner')<0&&!p.is_admin;});
 modal('<div class="mhead"><h3>'+(id?'İşçi kartı':'Yeni işçi')+'</h3><button class="x" onclick="closeModal()">×</button></div>'+
  '<div class="grid g2"><div class="field"><label>Ad, soyad</label><input id="eN" value="'+esc(e.full_name)+'"></div><div class="field"><label>Vəzifə</label><select id="eP"><option value="">—</option>'+DEPTS.map(function(d){return '<optgroup label="'+esc(d.name)+'">'+POS.filter(function(p){return p.department_id===d.id;}).map(function(p){return '<option value="'+p.id+'"'+(p.id===e.position_id?' selected':'')+'>'+esc(p.title)+'</option>';}).join('')+'</optgroup>';}).join('')+'</select></div>'+
  '<div class="field"><label>Rəhbəri</label><select id="eM">'+empOpts(e.manager_id).replace('— təyin edilməyib —','—')+'</select></div><div class="field"><label>İşə qəbul tarixi</label><input id="eH" type="date" value="'+(e.hire_date||'')+'"></div>'+
  '<div class="field"><label>Telefon</label><input id="ePh" value="'+esc(e.phone||'')+'"></div><div class="field"><label>Email</label><input id="eE" value="'+esc(e.email||'')+'"></div>'+
  '<div class="field"><label>Doğum tarixi</label><input id="eBd" type="date" value="'+(e.birthday||'')+'"></div><div class="field"><label>İllik məzuniyyət (gün)</label><input id="eLv" type="number" min="0" value="'+(e.leave_days||21)+'"></div>'+
  '<div class="field"><label>Sınaq müddəti bitir</label><input id="ePr" type="date" value="'+(e.probation_end||'')+'"></div><div class="field"><label>Müqavilə bitir</label><input id="eCe" type="date" value="'+(e.contract_end||'')+'"></div>'+
  '<div class="field"><label>İş yeri (QR və konum)</label><select id="eLoc">'+locOpts(e.location_id)+'</select></div><div class="field"><label>&nbsp;</label><div class="muted small" style="padding-top:8px">İşçi yalnız bu iş yerinin QR-ı ilə qeyd olunur</div></div>'+
  '<div class="field"><label>İş başlayır</label><input id="eS" type="time" value="'+String(e.work_start||'09:00').slice(0,5)+'"></div><div class="field"><label>İş bitir</label><input id="eF" type="time" value="'+String(e.work_end||'18:00').slice(0,5)+'"></div></div>'+
  '<div class="field"><label>İş günləri</label><div class="days" id="eD">'+WD.map(function(w,i){return '<label><input type="checkbox" value="'+(i+1)+'"'+((e.workdays||[]).indexOf(i+1)>=0?' checked':'')+'>'+w+'</label>';}).join('')+'</div></div>'+
  '<label class="row small" style="margin-bottom:8px"><input type="checkbox" id="eShift"'+(e.schedule?' checked':'')+' onchange="$(\'shBox\').style.display=this.checked?\'\':\'none\'"> Növbəli qrafik (günlərə görə fərqli saatlar)</label><div id="shBox" class="shbox" style="'+(e.schedule?'':'display:none')+'">'+WD.map(function(w,i){var d=(e.schedule||{})[String(i+1)];return '<div class="shr"><b>'+w+'</b><input type="time" id="sh'+(i+1)+'a" value="'+(d?d[0]:'')+'"><span>–</span><input type="time" id="sh'+(i+1)+'b" value="'+(d?d[1]:'')+'"></div>';}).join('')+'<p class="muted small">Boş gün = həmin gün ümumi saatlar (yuxarıda) tətbiq olunur.</p></div>'+
  (e.user_id?'<div class="acct"><h4>Giriş hesabı</h4><p class="small">Bağlıdır: <b>'+esc(profEmail(e.user_id))+'</b></p><div class="field"><label>Yeni parol (dəyişmək lazımdırsa)</label><div class="row"><input id="eNewPw" style="flex:1" placeholder="boş qalsa dəyişmir"><button type="button" class="btn ghost sm" onclick="$(\'eNewPw\').value=genPw()">Yarat</button></div></div><label class="row small"><input type="checkbox" id="eUnlink"> Hesabı bu kartdan ayır</label></div>'
   :'<div class="acct"><h4>Giriş hesabı</h4><p class="muted small">İşçi sistemə bu email və parolla daxil olacaq.</p><div class="grid g2"><div class="field"><label>Email (giriş adı)</label><input id="eAccEmail" type="email" autocomplete="off" placeholder="ad@sirket.az" value="'+esc(e.email||'')+'"></div><div class="field"><label>Parol</label><div class="row"><input id="eAccPw" style="flex:1" autocomplete="off" value="'+genPw()+'"><button type="button" class="btn ghost sm" onclick="$(\'eAccPw\').value=genPw()">Yarat</button></div></div></div>'+'<div class="field"><label>Rolu</label><select id="eAccRole"><option value="ofis">İşçi</option><option value="ofis_admin">HR rəhbəri (idarə edir)</option>'+(ME.is_admin?'<option value="ofis_owner">Sahibkar (hər şeyi görür)</option>':'')+'</select></div>'+
    (accs.length?'<div class="field"><label>və ya mövcud hesabı bağla</label><select id="eU"><option value="">— yeni hesab yarat —</option>'+accs.map(function(p){return '<option value="'+p.user_id+'">'+esc((p.full_name?p.full_name+' · ':'')+p.email)+'</option>';}).join('')+'</select></div>':'')+
    '<label class="row small"><input type="checkbox" id="eNoAcc"> Hesab yaratma (yalnız ştatda göstər)</label></div>')+
'<label class="row small" style="margin-bottom:6px"><input type="checkbox" id="eLr"'+(e.lead_rotation?' checked':'')+'> Saytdan gələn müraciətləri növbə ilə bu işçiyə də payla (satış meneceri)</label>'+
'<label class="row small" style="margin-bottom:12px"><input type="checkbox" id="eA"'+(e.active?' checked':'')+'> Aktiv işçi</label>'+
  '<div class="row">'+(id?'<button class="btn red" onclick="delEmp('+id+')">Sil</button>':'')+'<span style="flex:1"></span><button class="btn" onclick="saveEmp('+(id||0)+')">Yadda saxla</button></div>');}
function genPw(){var c='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789',p='',a=new Uint32Array(10);crypto.getRandomValues(a);for(var i=0;i<10;i++)p+=c[a[i]%c.length];return p;}
function profEmail(uid){var p=PROFS.find(function(x){return x.user_id===uid;});return p?p.email:'hesab';}
function fnCall(body){return sb.functions.invoke('lux-admin',{body:body}).then(function(r){if(r.error){var c=r.error.context;if(c&&c.json)return c.json().then(function(j){throw new Error(j.error||r.error.message);},function(){throw new Error(r.error.message);});throw new Error(r.error.message);}if(r.data&&r.data.error)throw new Error(r.data.error);return r.data;});}
function saveEmp(id){var old=id?EMPS.find(function(x){return x.id===id;}):null;
 var sched=null;if($('eShift')&&$('eShift').checked){sched={};for(var di=1;di<=7;di++){var sa=$('sh'+di+'a').value,sb2=$('sh'+di+'b').value;if(sa&&sb2)sched[String(di)]=[sa,sb2];}if(!Object.keys(sched).length)sched=null;}
 var b={location_id:($('eLoc')&&+$('eLoc').value)||null,schedule:sched,birthday:($('eBd')||{}).value||null,probation_end:($('ePr')||{}).value||null,contract_end:($('eCe')||{}).value||null,leave_days:+(($('eLv')||{}).value)||21,lead_rotation:!!($('eLr')&&$('eLr').checked),full_name:$('eN').value.trim(),position_id:+$('eP').value||null,manager_id:+$('eM').value||null,hire_date:$('eH').value||null,phone:$('ePh').value.trim(),email:$('eE').value.trim(),work_start:$('eS').value||'09:00',work_end:$('eF').value||'18:00',workdays:[].slice.call(document.querySelectorAll('#eD input:checked')).map(function(x){return +x.value;}),active:$('eA').checked};
 if(!b.full_name)return toast('Ad yazın');if(id&&b.manager_id===id)b.manager_id=null;
 var creds=null,chain=Promise.resolve();
 if(old&&old.user_id){b.user_id=$('eUnlink')&&$('eUnlink').checked?null:old.user_id;var np=($('eNewPw')||{}).value;if(np&&b.user_id){np=np.trim();if(np.length<8)return toast('Parol ən az 8 simvol');chain=fnCall({action:'update',user_id:old.user_id,password:np}).then(function(){creds={email:profEmail(old.user_id),pw:np};});}}
 else{var link=$('eU')&&$('eU').value;var skip=$('eNoAcc')&&$('eNoAcc').checked;
  if(link){b.user_id=link;}
  else if(!skip){var em=($('eAccEmail').value||'').trim().toLowerCase(),pw=($('eAccPw').value||'').trim();if(!em||pw.length<8)return toast('Hesab üçün email və ən az 8 simvolluq parol yazın (və ya "Hesab yaratma"nı seçin)');
   var role=($('eAccRole')||{}).value||'ofis';var perms=role==='ofis'?['ofis']:['ofis',role];
   chain=fnCall({action:'create',email:em,password:pw,full_name:b.full_name,perms:perms}).then(function(d){b.user_id=d.user.user_id;creds={email:em,pw:pw};PROFS.push({user_id:d.user.user_id,email:em,full_name:b.full_name,perms:perms,active:true});});}}
 toast('Saxlanılır…');
 chain.then(function(){return run(id?sb.from('office_employees').update(b).eq('id',id).select().single():sb.from('office_employees').insert(b).select().single());})
 .then(function(e){var i=EMPS.findIndex(function(x){return x.id===e.id;});if(i>=0)EMPS[i]=e;else EMPS.push(e);EMP=EMPS.find(function(x){return x.user_id===ME.user_id&&x.active;})||null;closeModal();renderStaff();
  if(creds)showCreds(e.full_name,creds.email,creds.pw);else toast('Yadda saxlanıldı');}).catch(err);}
function showCreds(name,em,pw){var link=location.origin+OFB();var txt=name+', Baş Ofis sisteminə giriş:\n'+link+'\nEmail: '+em+'\nParol: '+pw;
 modal('<div class="mhead"><h3>Giriş məlumatları</h3><button class="x" onclick="closeModal()">×</button></div><p class="muted small">Bunu işçiyə ötürün. Parol bir daha göstərilməyəcək.</p><div class="card" style="background:#f8fafc;margin:10px 0"><div class="small muted">Ünvan</div><b>'+esc(link)+'</b><div class="small muted" style="margin-top:8px">Email</div><b>'+esc(em)+'</b><div class="small muted" style="margin-top:8px">Parol</div><b style="font-size:20px;letter-spacing:.04em">'+esc(pw)+'</b></div><div class="row"><button class="btn" id="cpy">Kopyala</button><a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(txt)+'">WhatsApp-da göndər</a></div>');
 $('cpy').onclick=function(){(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){toast('Kopyalandı');},function(){prompt('Kopyalayın:',txt);});};}

function delEmp(id){if(!confirm('İşçi kartı və onun davamiyyət tarixçəsi silinsin? (İşdən çıxıbsa, "Aktiv" işarəsini söndürmək daha yaxşıdır)'))return;run(sb.from('office_employees').delete().eq('id',id)).then(function(){EMPS=EMPS.filter(function(x){return x.id!==id;});closeModal();renderStaff();}).catch(err);}

/* ---------- AYARLAR / QR ---------- */
function renderSet(){var c=CFG||{};try{renderLocs();}catch(e){}renderFcmSet();renderBackups();renderHol();renderTgSet();document.querySelectorAll('input[name=qmode]').forEach(function(r){r.checked=(r.value==='static')===!!c.static_qr;});$('cLat').value=c.lat||'';$('cLng').value=c.lng||'';$('cRad').value=c.radius_m||150;$('cGrace').value=c.grace_min||10;$('cGeo').checked=c.require_geo!==false;$('cSelfie').checked=c.require_selfie!==false;}
function useHere(){if(!navigator.geolocation)return toast('Brauzer yeri dəstəkləmir');toast('Yer alınır…');navigator.geolocation.getCurrentPosition(function(p){$('cLat').value=p.coords.latitude.toFixed(6);$('cLng').value=p.coords.longitude.toFixed(6);toast('Dəqiqlik: ±'+Math.round(p.coords.accuracy)+' m. "Yadda saxla" basın.');},function(){toast('Yer icazəsi verilmədi');},{enableHighAccuracy:true,timeout:15000});}
function saveCfg(){var qm=(document.querySelector('input[name=qmode]:checked')||{}).value;var b={lat:parseFloat($('cLat').value)||null,lng:parseFloat($('cLng').value)||null,radius_m:+$('cRad').value||150,grace_min:+$('cGrace').value||0,require_geo:$('cGeo').checked,require_selfie:$('cSelfie').checked,static_qr:qm==='static',updated_at:new Date().toISOString()};
 if(b.static_qr&&(b.lat==null||b.lng==null))return toast('Sabit QR üçün əvvəlcə ofisin yerini təyin edin');
 run(sb.from('office_config').update(b).eq('id',1).select().single()).then(function(c){CFG=c;toast('Ayarlar saxlanıldı');}).catch(err);}

function printQR(loc){var L0=loc?locById(loc):null;if(loc){if(!L0||L0.lat==null)return toast('Əvvəlcə bu iş yerinin konumunu təyin edin');}else if(!CFG||!CFG.static_qr)return toast('Əvvəlcə "Çap olunan sabit QR" seçib Yadda saxla basın');
 sb.rpc('office_qr_static',loc?{p_loc:loc}:{}).then(function(r){if(r.error)throw r.error;var url=location.origin+OFB('?c=')+r.data;var SN=L0?L0.name:'Baş Ofis';
  var sh=$('printSheet');sh.innerHTML='<div class="ps-in">'
   +'<div class="ps-brand">'+esc(SN.toLocaleUpperCase('az'))+'</div>'
   +'<div class="ps-t">Gəliş · Gediş</div>'
   +'<div class="ps-s">İşə gələndə və gedəndə telefonunuzla skan edin</div>'
   +'<div class="ps-qrwrap"><div class="ps-corner tl"></div><div class="ps-corner tr"></div><div class="ps-corner bl"></div><div class="ps-corner br"></div><div id="psQr"></div></div>'
   +'<div class="ps-steps">'
   +'<div class="ps-step"><span class="ps-num">1</span><span>Telefonun kamerasını QR koda tutun və çıxan linkə toxunun</span></div>'
   +'<div class="ps-step"><span class="ps-num">2</span><span>İlk dəfə hesabınızla (email və şifrə) daxil olun</span></div>'
   +'<div class="ps-step"><span class="ps-num">3</span><span>Kamera və yer (məkan) icazəsini verin</span></div>'
   +'</div>'
   +'<div class="ps-f"><span class="ps-dot"></span>'+esc(SN)+' · İdarəetmə Sistemi<span class="ps-dot"></span></div>'
   +'</div>';
  new QRCode($('psQr'),{text:url,width:460,height:460,correctLevel:QRCode.CorrectLevel.H});
  modal('<div class="mhead"><h3>Çap üçün QR · '+esc(SN)+'</h3><button class="x" onclick="closeModal()">×</button></div><p class="muted small">A4 vərəqə çap edin və girişə, göz səviyyəsində vurun.</p><div id="pvQr" style="display:flex;justify-content:center;margin:12px 0"></div><div class="row"><button class="btn" onclick="window.print()">🖨 Çap et</button><button class="btn ghost" onclick="dlQR(\''+(loc?'is-yeri-'+loc:'ofis')+'\')">PNG yüklə</button></div>');
  new QRCode($('pvQr'),{text:url,width:240,height:240,correctLevel:QRCode.CorrectLevel.H});
 }).catch(err);}
function dlQR(n){var c=document.querySelector('#psQr canvas');if(!c)return;var a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=(n||'ofis')+'-qr.png';a.click();}
function rotateQR(loc){var L0=loc?locById(loc):null;if(!confirm((L0?L0.name+': ':'Baş Ofis: ')+'QR yenilənsin? Köhnə çap olunmuş QR dərhal işləməz olacaq və yenisini çap etməli olacaqsınız.'))return;sb.rpc('office_qr_rotate',loc?{p_loc:loc}:{}).then(function(r){if(r.error)throw r.error;toast('QR yeniləndi. Yenisini çap edin.');}).catch(err);}
var _qrT=null,_qrTick=null;
function openQR(loc){loc=+loc||null;var L0=loc?locById(loc):null;if(loc&&(!L0||L0.lat==null))return toast('Əvvəlcə bu iş yerinin konumunu təyin edin');$('qrWrap').querySelector('h1').textContent=(L0?L0.name+' · ':'')+'Gəliş / Gediş';$('qrWrap').classList.add('on');var box=$('qrBox'),qr=null;function draw(){sb.rpc('office_qr_token',loc?{p_loc:loc}:{}).then(function(r){if(r.error)throw r.error;var url=location.origin+OFB('?c=')+r.data;box.innerHTML='';qr=new QRCode(box,{text:url,width:300,height:300,correctLevel:QRCode.CorrectLevel.M});}).catch(err);}
 draw();clearInterval(_qrT);clearInterval(_qrTick);var left=60-new Date().getSeconds();$('qrLeft').textContent=left;
 _qrTick=setInterval(function(){left=60-new Date().getSeconds();$('qrLeft').textContent=left;if(left===60||left===1){setTimeout(draw,1200);}},1000);
 if(document.documentElement.requestFullscreen&&new URLSearchParams(location.search).get('qr'))try{document.documentElement.requestFullscreen();}catch(e){}}
function closeQR(){$('qrWrap').classList.remove('on');clearInterval(_qrTick);if(document.fullscreenElement)document.exitFullscreen();}

/* ---------- modal ---------- */
function modal(h){$('mbox').innerHTML=h;$('modal').classList.add('on');}
function closeModal(){var mb=$('mbox');if(mb)mb.classList.remove('wide');if(typeof stopCam==='function')stopCam();$('modal').classList.remove('on');$('mbox').innerHTML='';}
$('modal').addEventListener('click',function(e){if(e.target===$('modal'))closeModal();});

/* ---------- PWA ---------- */
if('serviceWorker' in navigator){navigator.serviceWorker.register('/ofis-sw.js',{scope:'/'}).then(function(reg){
  // yeni versiya gelende avtomatik yenile (kohne kes ilisib qalmasin)
  reg.addEventListener('updatefound',function(){var nw=reg.installing;if(!nw)return;nw.addEventListener('statechange',function(){if(nw.state==='activated'&&navigator.serviceWorker.controller){location.reload();}});});
  setInterval(function(){reg.update().catch(function(){});},60000);
 }).catch(function(){});}
var _bip=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();_bip=e;var b=$('instBtn');if(b)b.style.display='';});
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||navigator.standalone;}
document.addEventListener('DOMContentLoaded',function(){var b=$('instBtn');if(!b)return;
 if(!isNative()&&!isStandalone()&&/iphone|ipad|ipod/i.test(navigator.userAgent))b.style.display='';
 b.onclick=function(){if(_bip){_bip.prompt();_bip.userChoice.then(function(){_bip=null;b.style.display='none';});}
  else if(isIOS()){iosSheetShow(true);}
  else modal('<div class="mhead"><h3>Telefona quraşdır</h3><button class="x" onclick="closeModal()">×</button></div><p><b>iPhone (Safari):</b> aşağıdakı <b>Paylaş</b> düyməsi (□↑) → <b>“Ana ekrana əlavə et”</b> → <b>Əlavə et</b>.</p><p style="margin-top:10px"><b>Android (Chrome):</b> sağ yuxarıdakı ⋮ menyu → <b>“Tətbiqi quraşdır”</b>.</p>');};});
/* ===================== SOSİAL MODUL (qruplar, səsli, fayl, hekayələr, lent, status...) ===================== */
var CHATgroup=false,CHAT_STORIES=[],_typT=0,_typShowT=null,_rec=null;
IGI.mic='<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
IGI.clip='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9"/></svg>';
IGI.info='<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>';
IGI.more='<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
IGI.play='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>';
IGI.pause='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>';
function grpAva(emoji,sz){sz=sz||56;return '<span class="igava iggrp" style="width:'+sz+'px;height:'+sz+'px;font-size:'+Math.round(sz*.48)+'px">'+esc(emoji||'👥')+'</span>';}
function stEmoji(uid){var p=PRES[uid];return p&&p.st&&p.st.e?' <span class="igst" title="'+esc(p.st.t||'')+'">'+esc(p.st.e)+'</span>':'';}
function chatFmtSize(b){if(!b)return '';return b<1048576?Math.max(1,Math.round(b/1024))+' KB':(b/1048576).toFixed(1)+' MB';}
function chatDur(s){s=Math.max(0,Math.round(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function chatLastTxt(t){var k=t.son_kind;if(k==='voice')return '🎤 Səsli mesaj';if(k==='file')return '📎 Fayl';if(k==='sys')return esc(t.son_mesaj||'');if(t.son_sekil&&!t.son_mesaj)return '📷 Şəkil';return esc((t.son_mesaj||'').slice(0,60));}

/* ---------- SİYAHI ---------- */
function renderChat(){var v=$('v-chat');if(!v)return;
 if(CHATother){renderChatRoom();return;}
 CHAT_SEL=null;v.innerHTML='<div class="ig"><div class="igtop" id="igTop"></div>'
  +'<div class="igstories" id="igStories"></div>'
  +'<label class="igsearch">'+IGI.search+'<input id="igQ" placeholder="Axtar" oninput="chatDrawThreads(CHAT_THREADS)"></label>'
  +'<div class="igchips" id="igChips"></div>'
  +'<div id="chatThreads"><p class="status"><span class="spin"></span>Yüklənir…</p></div></div>';
 run(sb.rpc('msg_threads')).then(function(rows){CHAT_THREADS=rows||[];chatDrawThreads(CHAT_THREADS);presRefresh();}).catch(err);
 storyLoad();
}
function chatTopBar(){var t=$('igTop');if(!t)return;
 if(CHAT_SEL){var n=CHAT_SEL.size,vis=chatVisible(),all=vis.length>0&&vis.every(function(x){return CHAT_SEL.has(x.other);});
  t.innerHTML='<div class="igselh"><button class="igicon" onclick="chatSelEnd()">✕</button><b>'+(n?n+' seçildi':'Söhbət seçin')+'</b></div><button class="igtxt" onclick="chatSelAll()">'+(all?'Heç birini':'Hamısını seç')+'</button>';}
 else{var my=ME&&ME.user_id,st=PRES[my]&&PRES[my].st;
  t.innerHTML='<div style="display:flex;align-items:center;gap:8px"><h2>Çat</h2><button class="igstbtn" onclick="statusPick()">'+(st&&st.e?esc(st.e)+' '+esc((st.t||'').slice(0,18)):'+ Status')+'</button></div><div style="display:flex;align-items:center;gap:2px">'
  +(CHAT_THREADS.length?'<button class="igtxt" onclick="chatSelStart()">Seç</button>':'')+'<button class="igicon" onclick="chatListMenu()" title="Daha çox">'+IGI.more+'</button><button class="igicon" onclick="chatNew()" title="Yeni mesaj">'+IGI.edit+'</button></div>';}
 var c=$('igChips');if(c){var un=CHAT_THREADS.filter(function(x){return x.oxunmamis>0;}).length;
  c.innerHTML=[['all','Hamısı'],['unread','Oxunmamış'],['groups','Qruplar']].map(function(f){return '<button class="igchip'+(CHAT_FILTER===f[0]?' on':'')+'" onclick="chatFilter(\''+f[0]+'\')">'+f[1]+(f[0]==='unread'&&un?' <span>'+un+'</span>':'')+'</button>';}).join('');}
 var bar=$('igSelBar');
 if(CHAT_SEL){if(!bar){bar=document.createElement('div');bar.id='igSelBar';document.body.appendChild(bar);}var d=!CHAT_SEL.size;
  bar.innerHTML='<button '+(d?'disabled':'')+' onclick="chatBulk(\'read\')">Oxunmuş et</button><button '+(d?'disabled':'')+' onclick="chatBulk(\'unread\')">Oxunmamış et</button><button class="del" '+(d?'disabled':'')+' onclick="chatBulk(\'delete\')">Sil</button>';}
 else if(bar)bar.remove();}
function chatVisible(){var q=(($('igQ')||{}).value||'').toLowerCase();return CHAT_THREADS.filter(function(t){return (!q||(t.ad||'').toLowerCase().indexOf(q)>=0)&&(CHAT_FILTER!=='unread'||t.oxunmamis>0)&&(CHAT_FILTER!=='groups'||t.is_group);});}
function chatDrawThreads(rows){var el=$('chatThreads');if(!el)return;chatTopBar();
 if(!rows.length){el.innerHTML='<div class="igempty"><div class="igemptyic">'+IGI.edit+'</div><b>Mesajlarınız</b><div>Komandadan kiməsə yazın</div><button class="igbtn" onclick="chatNew()">Mesaj göndər</button></div>';return;}
 rows=chatVisible();
 el.innerHTML=rows.map(function(t){if(!t.is_group){CHAT_PH[t.other]=t.photo||null;CHAT_SUB[t.other]=t.vezife||'';}
  var un=t.oxunmamis>0,last,lt=chatLastTxt(t);
  if(un)last=t.oxunmamis>1?t.oxunmamis+' yeni mesaj':(t.son_kim?esc(t.son_kim)+': ':'')+lt;
  else if(t.son_mine&&t.son_goruldu)last='Görüldü';
  else last=(t.son_mine&&t.son_kind!=='sys'?'Siz: ':(t.son_kim?esc(t.son_kim)+': ':''))+lt;
  var sel=CHAT_SEL&&CHAT_SEL.has(t.other),g=t.is_group?1:0;
  return '<div class="igrow'+(un?' un':'')+(sel?' sel':'')+'" onclick="chatRowTap(\''+t.other+'\',\''+chatArg(t.ad)+'\','+g+',\''+chatArg(t.emoji||'')+'\')" ontouchstart="chatRowDown(\''+t.other+'\')" ontouchend="chatRowUp()" ontouchmove="chatRowUp()" oncontextmenu="event.preventDefault();_lpFired=false;if(!CHAT_SEL)chatSelStart(\''+t.other+'\')">'
   +(g?grpAva(t.emoji,56):chatAva(t.ad,t.photo,56,t.other))
   +'<div class="igmeta"><div class="igname">'+esc(t.ad||'İşçi')+(g?'':stEmoji(t.other))+(t.muted?' <span class="igmute">🔕</span>':'')+'</div><div class="iglast"><span class="iglt">'+(last||'&nbsp;')+'</span>'+(t.son?'<span class="igago">&nbsp;· '+chatAgo(t.son)+'</span>':'')+'</div></div>'
   +(CHAT_SEL?'<span class="igchk'+(sel?' on':'')+'">'+(sel?'✓':'')+'</span>':(un?'<span class="igdot'+(t.muted?' m':'')+'"></span>':''))+'</div>';
 }).join('')||'<p class="hint" style="padding:14px">'+(CHAT_FILTER==='unread'?'Oxunmamış mesaj yoxdur':CHAT_FILTER==='groups'?'Qrup yoxdur':'Tapılmadı')+'</p>';
}
function chatRowTap(uid,ad,g,emoji){if(_lpFired){_lpFired=false;return;}if(CHAT_SEL){if(CHAT_SEL.has(uid))CHAT_SEL.delete(uid);else CHAT_SEL.add(uid);chatDrawThreads(CHAT_THREADS);return;}chatOpen(uid,ad,g,emoji);}
function chatListMenu(){modal('<div class="mhead"><h3>Çat</h3><button class="x" onclick="closeModal()">×</button></div>'
 +'<button class="igmenu" onclick="closeModal();grpNew()">👥 Yeni qrup yarat</button>'
 +'<button class="igmenu" onclick="closeModal();chatStarred()">⭐ Ulduzlu mesajlar</button>'
 +'<button class="igmenu" onclick="closeModal();statusPick()">😊 Statusumu dəyiş</button>'
 +'<button class="igmenu" onclick="closeModal();storyPick()">➕ Hekayə paylaş</button>');}

/* ---------- STATUS ---------- */
var ST_PRESETS=[['📅','Görüşdəyəm',2],['🏗️','Obyektdəyəm',4],['🚗','Yoldayam',1],['🍽️','Nahardayam',1],['🎯','Fokuslanmışam',2],['🤒','Xəstəyəm',24],['🌴','Məzuniyyətdəyəm',0],['🏠','Uzaqdan işləyirəm',8]];
function statusPick(){var my=ME&&ME.user_id,st=PRES[my]&&PRES[my].st;
 modal('<div class="mhead"><h3>Status</h3><button class="x" onclick="closeModal()">×</button></div><div class="igstlist">'
  +ST_PRESETS.map(function(p,i){return '<button class="igmenu" onclick="statusSet('+i+')">'+p[0]+' '+p[1]+'<small>'+(p[2]?p[2]+' saat':'özüm silənə qədər')+'</small></button>';}).join('')
  +'</div><div class="row" style="gap:6px;margin-top:8px"><input id="stE" placeholder="😀" maxlength="4" style="width:58px;text-align:center"><input id="stT" placeholder="Öz statusun…" maxlength="40" style="flex:1"><button class="btn" onclick="statusSet(-1)">OK</button></div>'
  +(st?'<button class="btn ghost" style="width:100%;margin-top:10px" onclick="statusSet(-2)">Statusu sil</button>':''));}
function statusSet(i){var e,t,h;if(i===-2){e=null;t=null;h=0;}else if(i===-1){e=($('stE').value||'💬').trim();t=$('stT').value.trim();h=8;if(!t){toast('Status yazın');return;}}else{e=ST_PRESETS[i][0];t=ST_PRESETS[i][1];h=ST_PRESETS[i][2];}
 run(sb.rpc('status_set',{p_emoji:e,p_text:t,p_hours:h})).then(function(){closeModal();toast(e?'Status: '+e+' '+t:'Status silindi');var my=ME.user_id;PRES[my]=PRES[my]||{};PRES[my].st=e?{e:e,t:t}:null;chatTopBar();presRefresh();}).catch(err);}

/* ---------- QRUPLAR ---------- */
function grpNew(){run(sb.rpc('msg_contacts')).then(function(list){window.CHAT_CONTACTS=list;window._grpSel=new Set();
 modal('<div class="mhead"><h3>Yeni qrup</h3><button class="x" onclick="closeModal()">×</button></div>'
  +'<div class="row" style="gap:6px"><input id="gE" value="👥" maxlength="4" style="width:58px;text-align:center;font-size:1.3rem"><input id="gN" placeholder="Qrupun adı" maxlength="60" style="flex:1"></div>'
  +'<label class="igsearch" style="margin:10px 0">'+IGI.search+'<input placeholder="Üzv axtar" oninput="grpDrawPick(this.value)"></label>'
  +'<div id="gPick" style="max-height:45vh;overflow-y:auto"></div><button class="btn" id="gGo" style="width:100%;margin-top:10px" onclick="grpCreate()">Qrup yarat</button>');grpDrawPick('');}).catch(err);}
function grpDrawPick(q){q=(q||'').toLowerCase();var el=$('gPick');if(!el)return;
 el.innerHTML=(window.CHAT_CONTACTS||[]).filter(function(c){return !q||(c.ad||'').toLowerCase().indexOf(q)>=0;}).map(function(c){var on=_grpSel.has(c.uid);
  return '<div class="igrow" onclick="grpToggle(\''+c.uid+'\')">'+chatAva(c.ad,c.photo,44)+'<div class="igmeta"><div class="igname">'+esc(c.ad)+'</div><div class="iglast">'+esc(c.vezife||'')+'</div></div><span class="igchk'+(on?' on':'')+'">'+(on?'✓':'')+'</span></div>';}).join('');
 var b=$('gGo');if(b)b.textContent='Qrup yarat'+(_grpSel.size?' ('+_grpSel.size+')':'');}
function grpToggle(u){if(_grpSel.has(u))_grpSel.delete(u);else _grpSel.add(u);grpDrawPick((document.querySelector('#mbox .igsearch input')||{}).value);}
function grpCreate(){var n=($('gN').value||'').trim(),e=($('gE').value||'👥').trim();if(!n){toast('Qrupun adını yazın');return;}if(!_grpSel.size){toast('Ən azı 1 üzv seçin');return;}
 run(sb.rpc('grp_create',{p_name:n,p_emoji:e,p_members:Array.from(_grpSel)})).then(function(id){closeModal();chatOpen(id,n,1,e);}).catch(err);}
function grpInfo(){var gid=CHATother;run(sb.rpc('grp_info',{p_group:gid})).then(function(g){if(!g)return;window._grpInfo=g;
 var html='<div class="mhead"><h3>Qrup</h3><button class="x" onclick="closeModal()">×</button></div><div style="text-align:center;padding:6px 0 10px">'+grpAva(g.emoji,80)+'<h3 style="margin:8px 0 0">'+esc(g.name)+'</h3><div class="muted">'+(g.members||[]).length+' üzv'+(g.kind!=='custom'?' · avtomatik qrup':'')+'</div></div>'
  +'<button class="igmenu" onclick="chatMuteToggle()">'+(g.muted?'🔔 Bildirişləri aç':'🔕 Səssizə al')+'</button>'
  +'<button class="igmenu" onclick="closeModal();chatPinnedList()">📌 Sabitlənmiş mesajlar</button>'
  +(g.admin&&g.kind==='custom'?'<button class="igmenu" onclick="grpRename()">✏️ Adı dəyiş</button><button class="igmenu" onclick="grpAddPick()">➕ Üzv əlavə et</button>':'')
  +'<div class="igsec" style="margin-top:10px">Üzvlər</div><div style="max-height:40vh;overflow-y:auto">'+(g.members||[]).map(function(m){
   return '<div class="igrow">'+chatAva(m.ad,m.photo,40,m.uid)+'<div class="igmeta"><div class="igname">'+esc(m.ad)+(m.role==='admin'?' <small class="muted">admin</small>':'')+'</div></div>'
   +(g.admin&&g.kind==='custom'&&m.uid!==ME.user_id?'<button class="igtxt" style="color:#ed4956" onclick="grpRemove(\''+m.uid+'\')">Çıxar</button>':'')+'</div>';}).join('')+'</div>'
  +(g.kind==='custom'?'<button class="igmenu" style="color:#ed4956" onclick="grpLeave()">🚪 Qrupdan çıx</button>':'');
 modal(html);presRefresh();}).catch(err);}
function grpRename(){var g=window._grpInfo;var n=prompt('Qrupun yeni adı',g.name);if(!n)return;run(sb.rpc('grp_edit',{p_group:g.id,p_action:'rename',p_name:n})).then(function(){CHATname=n;closeModal();renderChatRoom();}).catch(err);}
function grpRemove(u){if(!confirm('Üzv qrupdan çıxarılsın?'))return;run(sb.rpc('grp_edit',{p_group:CHATother,p_action:'remove',p_users:[u]})).then(grpInfo).catch(err);}
function grpLeave(){if(!confirm('Qrupdan çıxırsınız?'))return;run(sb.rpc('grp_edit',{p_group:CHATother,p_action:'leave'})).then(function(){closeModal();chatBack();}).catch(err);}
function grpAddPick(){var have={};(window._grpInfo.members||[]).forEach(function(m){have[m.uid]=1;});run(sb.rpc('msg_contacts')).then(function(list){window.CHAT_CONTACTS=list.filter(function(c){return !have[c.uid];});window._grpSel=new Set();
 modal('<div class="mhead"><h3>Üzv əlavə et</h3><button class="x" onclick="closeModal()">×</button></div><label class="igsearch" style="margin:0 0 10px">'+IGI.search+'<input placeholder="Axtar" oninput="grpDrawPick(this.value)"></label><div id="gPick" style="max-height:50vh;overflow-y:auto"></div><button class="btn" id="gGo" style="width:100%;margin-top:10px" onclick="grpAddGo()">Əlavə et</button>');grpDrawPick('');}).catch(err);}
function grpAddGo(){if(!_grpSel.size)return;run(sb.rpc('grp_edit',{p_group:CHATother,p_action:'add',p_users:Array.from(_grpSel)})).then(function(){closeModal();toast('Əlavə edildi');chatLoadMsgs(true);}).catch(err);}
function chatMuteToggle(){var t=CHAT_THREADS.find(function(x){return x.other===CHATother;});var on=!(t&&t.muted);if(window._grpInfo&&CHATgroup)on=!window._grpInfo.muted;
 run(sb.rpc('msg_mute',{p_target:CHATother,p_on:on})).then(function(){if(t)t.muted=on;closeModal();toast(on?'🔕 Səssizə alındı':'🔔 Bildirişlər açıldı');}).catch(err);}

/* ---------- OTAQ ---------- */
function chatOpen(uid,ad,g,emoji){CHAT_SEL=null;var _b=$('igSelBar');if(_b)_b.remove();CHATother=uid;CHATname=ad;CHATgroup=!!(+g);window._chatEmoji=emoji||'👥';CHATreply=null;window._chatSig=null;renderChatRoom();}
function renderChatRoom(){var v=$('v-chat');if(!v)return;var ph=CHAT_PH[CHATother],sub=CHAT_SUB[CHATother]||'';
 var who=CHATgroup?grpAva(window._chatEmoji,40):chatAva(CHATname,ph,40,CHATother);
 var subTxt=CHATgroup?'Qrup':(presText(CHATother)||sub);
 v.innerHTML='<div class="ig igroom"><div class="ighead"><button class="igicon" onclick="chatBack()">'+IGI.back+'</button>'
  +'<div class="igwho" onclick="'+(CHATgroup?'grpInfo()':'chatProfile()')+'">'+who+'<div style="min-width:0"><div class="igname">'+esc(CHATname||'İşçi')+(CHATgroup?'':stEmoji(CHATother))+'</div><div class="igsub'+(subTxt==='Aktivdir'?' live':'')+'" id="igSub">'+esc(subTxt)+'</div></div></div>'
  +(CHATgroup?'<button class="igicon" onclick="grpInfo()">'+IGI.info+'</button>':'<button class="igicon" onclick="callStart(\'audio\')" title="Səsli zəng">'+IGI.phone+'</button><button class="igicon" onclick="callStart(\'video\')" title="Video zəng">'+IGI.video+'</button><button class="igicon" onclick="chatRoomMenu()">'+IGI.more+'</button>')+'</div>'
  +'<div id="igPinned"></div>'
  +'<div id="chatMsgs" class="igmsgs"><p class="status"><span class="spin"></span></p></div>'
  +'<div id="chatReplyBar"></div><div id="igRec"></div>'
  +'<div class="igbar" id="igBar"><button class="igcam" onclick="chatPickImage()">'+IGI.cam+'</button><input type="file" id="chatFile" accept="image/*" style="display:none" onchange="chatUploadImage(this.files[0])"><input type="file" id="chatAny" style="display:none" onchange="chatUploadFile(this.files[0])">'
  +'<input id="chatText" placeholder="Mesaj..." autocomplete="off" oninput="chatTyping()" onkeydown="if(event.key===\'Enter\')chatSend()">'
  +'<span id="igTools"><button class="igicon igimg" onclick="chatPickFile()" title="Fayl">'+IGI.clip+'</button><button class="igicon igimg" id="igMic" title="Basıb saxla — səsli mesaj">'+IGI.mic+'</button></span><button class="igsend" id="igSend" onclick="chatSend()" style="display:none">Göndər</button></div></div>';
 chatFull(true);chatLoadMsgs();presRefresh();voiceBind();
 if(!CHATgroup&&(!CHAT_PH.hasOwnProperty(CHATother)||sub===''))run(sb.rpc('msg_profile',{p_uid:CHATother})).then(function(p){if(!p||CHATother==null||CHATgroup)return;CHAT_PH[CHATother]=p.photo||null;CHAT_SUB[CHATother]=p.vezife||'';var w=document.querySelector('.igwho');if(w)w.innerHTML=chatAva(CHATname,p.photo,40,CHATother)+'<div style="min-width:0"><div class="igname">'+esc(CHATname||'İşçi')+stEmoji(CHATother)+'</div><div class="igsub" id="igSub">'+esc(presText(CHATother)||p.vezife||'')+'</div></div>';}).catch(function(){});
}
function chatRoomMenu(){var t=CHAT_THREADS.find(function(x){return x.other===CHATother;});
 modal('<div class="mhead"><h3>'+esc(CHATname)+'</h3><button class="x" onclick="closeModal()">×</button></div>'
 +'<button class="igmenu" onclick="closeModal();chatProfile()">👤 Profilə bax</button>'
 +'<button class="igmenu" onclick="chatMuteToggle()">'+(t&&t.muted?'🔔 Bildirişləri aç':'🔕 Səssizə al')+'</button>'
 +'<button class="igmenu" onclick="closeModal();chatPinnedList()">📌 Sabitlənmiş mesajlar</button>'
 +'<button class="igmenu" onclick="closeModal();chatStarred()">⭐ Ulduzlu mesajlar</button>'
 +'<button class="igmenu" onclick="closeModal();chatKudos()">🙌 Təşəkkür göndər</button>');}
function chatKudos(){var e=(typeof EMPS!=='undefined'?EMPS:[]).find(function(x){return x.user_id===CHATother;});if(e&&typeof openKudos==='function')openKudos(e.id);else toast('Bu şəxs üçün təşəkkür mümkün deyil');}
function chatTyping(){var t=$('chatText'),has=t&&t.value.trim().length>0;var s=$('igSend'),i=$('igTools');if(s)s.style.display=has?'':'none';if(i)i.style.display=has?'none':'';
 if(has&&CHATother&&Date.now()-_typT>3000){_typT=Date.now();sb.rpc('msg_typing',{p_to:CHATother}).then(function(){},function(){});}}
function chatTypingShow(name){var s=$('igSub');if(!s)return;s.textContent=(CHATgroup&&name?name.split(' ')[0]+' ':'')+'yazır…';s.classList.add('live');clearTimeout(_typShowT);_typShowT=setTimeout(function(){presApply();if(CHATgroup){var x=$('igSub');if(x){x.textContent='Qrup';x.classList.remove('live');}}},4500);}
function chatLoadMsgs(quiet){var who=CHATother,g=CHATgroup;run(g?sb.rpc('msg_open_group',{p_group:who}):sb.rpc('msg_open',{p_other:who})).then(function(rows){if(who!==CHATother)return;rows=rows||[];
 var sig=JSON.stringify(rows.map(function(m){return [m.id,m.read,m.reaction,m.edited,m.deleted,m.pinned,m.star];}));if(quiet&&sig===window._chatSig)return;window._chatSig=sig;CHATmsgs=rows;chatDrawMsgs(CHATmsgs);if(quiet)livePoll();}).catch(quiet?function(){}:err);}
function chatDrawMsgs(rows){var el=$('chatMsgs');if(!el)return;
 var pins=rows.filter(function(m){return m.pinned&&!m.deleted;}),pb=$('igPinned');
 if(pb)pb.innerHTML=pins.length?'<div class="igpin" onclick="chatJump('+pins[pins.length-1].id+')">📌 <span>'+esc(chatMsgPreview(pins[pins.length-1]))+'</span>'+(pins.length>1?'<small>+'+(pins.length-1)+'</small>':'')+'</div>':'';
 if(!rows.length){el.innerHTML='<div class="igintro">'+(CHATgroup?grpAva(window._chatEmoji,88):chatAva(CHATname,CHAT_PH[CHATother],88))+'<b>'+esc(CHATname)+'</b><div>'+esc(CHATgroup?'Qrup':(CHAT_SUB[CHATother]||''))+'</div><span>İlk mesajı yazın 👋</span></div>';return;}
 var lastMine=-1;rows.forEach(function(m,i){if(m.mine)lastMine=i;});
 var h='';rows.forEach(function(m,i){var p=rows[i-1],n=rows[i+1],t=new Date(m.at);
  if(!p||t-new Date(p.at)>15*60000)h+='<div class="igtime">'+chatSep(t)+'</div>';
  if(m.kind==='sys'){h+='<div class="igsys">'+esc(m.body)+'</div>';return;}
  var same=function(a,b){return a&&b&&a.kind!=='sys'&&b.kind!=='sys'&&a.mine===b.mine&&a.sender===b.sender&&Math.abs(new Date(a.at)-new Date(b.at))<=15*60000;};
  var newGrp=!same(p,m),endGrp=!same(m,n);
  var cls='igm '+(m.mine?'mine':'their')+(newGrp?' first':'')+(endGrp?' last':'')+(m.image&&!m.body&&!m.deleted?' pic':'')+(m.reaction?' hasr':'')+(m.deleted?' del':'');
  var rep=m.reply&&!m.deleted?'<div class="igrep">'+(m.reply.mine?'Sizə':'')+'<span>'+esc(chatMsgPreview(m.reply))+'</span></div>':'';
  var cm=/^(📞|🎥) /.test(m.body||'')&&m.kind==='text',inner;
  if(m.deleted)inner='<span class="msgbody"><i>🚫 Mesaj silindi</i></span>';
  else if(cm){var vk=m.body.indexOf('🎥')===0,miss=/Buraxılmış|rədd/.test(m.body);cls+=' callm';inner='<i>'+(vk?'🎥':(miss?'↙︎':'📞'))+'</i><span class="msgbody">'+esc(m.body.replace(/^(📞|🎥) /,''))+'<small>'+(m.mine?'':'Yenidən zəng et')+'</small></span>';}
  else if(m.kind==='voice')inner=voiceHtml(m);
  else if(m.kind==='file')inner='<a class="igfile" href="'+esc(m.file)+'" target="_blank" rel="noopener" onclick="event.stopPropagation()"><span class="igfic">📄</span><span><b>'+esc(m.fname||'Fayl')+'</b><small>'+chatFmtSize(m.fsize)+'</small></span></a>'+(m.body?'<span class="msgbody">'+esc(m.body)+'</span>':'');
  else inner=(m.image?'<img class="msgimg" src="'+esc(m.image)+'" onclick="event.stopPropagation();chatViewImage(\''+esc(m.image)+'\')">':'')+(m.body?'<span class="msgbody">'+esc(m.body)+'</span>':'');
  var meta=(m.edited&&!m.deleted?'<span class="igedit">redaktə edildi</span>':'')+(m.star?'<span class="igstar">⭐</span>':'')+(m.pinned?'<span class="igstar">📌</span>':'');
  var react=m.reaction?'<span class="msgreact">'+esc(m.reaction)+'</span>':'';
  var nm=CHATgroup&&!m.mine&&newGrp&&m.from?'<div class="igfrom">'+esc(m.from.ad)+'</div>':'';
  var av=!m.mine?(endGrp?(CHATgroup&&m.from?chatAva(m.from.ad,m.from.photo,28):chatAva(CHATname,CHAT_PH[CHATother],28)):'<span class="igsp"></span>'):'';
  h+='<div class="igline '+(m.mine?'mine':'their')+'" data-id="'+m.id+'">'+av+'<div class="igcol">'+nm+rep
   +'<div class="'+cls+'" id="msg'+m.id+'" '+(cm?'onclick="callStart(\''+(vk?'video':'audio')+'\')" ':'')+'ontouchstart="chatTouchStart('+m.id+',event)" ontouchend="chatTouchEnd(event)" ontouchmove="chatTouchMove(event)" oncontextmenu="event.preventDefault();chatMsgMenu('+m.id+')" ondblclick="chatQuickLike('+m.id+')">'
   +inner+react+'</div>'+(meta?'<div class="igmeta2">'+meta+'</div>':'')+'</div></div>';
  if(i===lastMine&&i===rows.length-1&&m.read&&!CHATgroup)h+='<div class="igseen">Görüldü</div>';
 });
 var stick=el._stick!==false;el.innerHTML=h;if(stick)el.scrollTop=el.scrollHeight;
}
function chatMsgPreview(m){if(!m)return '';if(m.deleted)return 'Mesaj silindi';if(m.kind==='voice')return '🎤 Səsli mesaj';if(m.kind==='file')return '📎 '+(m.fname||'Fayl');if(m.image&&!m.body)return '📷 Şəkil';return (m.body||'').slice(0,80);}
function chatJump(id){var e=$('msg'+id);if(e){e.scrollIntoView({block:'center',behavior:'smooth'});e.classList.add('flash');setTimeout(function(){e.classList.remove('flash');},1200);}}
/* toxunuş: uzun bas = menyu, sağa sürüşdür = cavab, iki dəfə = ❤️ */
var _sw=null,_lastTap={id:0,t:0};
function chatTouchStart(id,e){var t=e&&e.touches&&e.touches[0];_sw={id:id,x:t?t.clientX:0,y:t?t.clientY:0,dx:0,moved:false};_chatHold=setTimeout(function(){if(_sw&&!_sw.moved){_sw.held=true;chatMsgMenu(id);}},500);}
function chatTouchMove(e){if(!_sw)return;var t=e.touches[0],dx=t.clientX-_sw.x,dy=t.clientY-_sw.y;if(Math.abs(dx)>8||Math.abs(dy)>8){_sw.moved=true;clearTimeout(_chatHold);}
 if(Math.abs(dy)>Math.abs(dx)&&!_sw.sw)return;if(dx>0){_sw.sw=true;_sw.dx=Math.min(dx,90);var ln=$('msg'+_sw.id);if(ln){ln.parentNode.parentNode.style.transform='translateX('+_sw.dx+'px)';ln.parentNode.parentNode.classList.toggle('swr',_sw.dx>60);}}}
function chatTouchEnd(e){clearTimeout(_chatHold);if(!_sw)return;var s=_sw;_sw=null;var ln=$('msg'+s.id);if(ln){var r=ln.parentNode.parentNode;r.style.transition='transform .2s';r.style.transform='';r.classList.remove('swr');setTimeout(function(){r.style.transition='';},220);}
 if(s.sw&&s.dx>60){chatSetReply(s.id);try{navigator.vibrate&&navigator.vibrate(20);}catch(x){}return;}
 if(!s.moved&&!s.held){var now=Date.now();if(_lastTap.id===s.id&&now-_lastTap.t<320){_lastTap={id:0,t:0};chatQuickLike(s.id);if(e&&e.preventDefault)e.preventDefault();}else _lastTap={id:s.id,t:now};}}
function chatQuickLike(id){var b=$('msg'+id);if(b){var h=document.createElement('span');h.className='igheart';h.textContent='❤️';b.appendChild(h);setTimeout(function(){h.remove();},900);}try{navigator.vibrate&&navigator.vibrate(15);}catch(e){}chatReact(id,'❤️');}
function chatReact(id,emoji){var m=CHATmsgs.find(function(x){return x.id===id;});if(m&&m.reaction===emoji)emoji=null;
 run(sb.from('office_messages').update({reaction:emoji}).eq('id',id)).then(function(){closeModal&&closeModal();chatLoadMsgs(true);}).catch(function(e){toast(e.message);});}
function chatMsgMenu(id){var m=CHATmsgs.find(function(x){return x.id===id;});if(!m||m.deleted)return;var fresh=Date.now()-new Date(m.at).getTime()<15*60000;
 var bub=$('msg'+id);if(!bub)return;try{navigator.vibrate&&navigator.vibrate(18);}catch(e){}
 var r=bub.getBoundingClientRect(),vh=window.innerHeight,vw=window.innerWidth;
 var acts=[['↩︎','Cavab ver','chatSetReply('+id+')']];
 if(m.body&&m.kind==='text')acts.push(['📋','Kopyala','chatCopy('+id+')']);
 acts.push([m.star?'☆':'⭐',m.star?'Ulduzu götür':'Ulduzla','chatStar('+id+','+(!m.star)+')']);
 acts.push(['📌',m.pinned?'Sabitdən çıxar':'Sabitlə','chatPin('+id+','+(!m.pinned)+')']);
 if(m.mine&&fresh&&m.kind==='text'&&!/^(📞|🎥) /.test(m.body||''))acts.push(['✏️','Redaktə et','chatEdit('+id+')']);
 if(m.mine&&fresh)acts.push(['🗑️','Hamıdan sil','chatUnsend('+id+')','del']);
 var menuH=acts.length*48+16,reH=56,gap=8,bh=Math.min(r.height,vh*0.4);
 var top=r.top;var need=reH+gap+bh+gap+menuH;var minTop=reH+gap+16,maxTop=vh-menuH-gap-bh-16;
 if(top<minTop)top=minTop;if(top>maxTop)top=Math.max(minTop,maxTop);
 var o=document.createElement('div');o.id='igCtx';
 var side=m.mine?'right:'+Math.max(10,vw-r.right)+'px':'left:'+Math.max(10,r.left)+'px';
 o.innerHTML='<div class="cxbg" onclick="chatCtxClose()"></div>'
  +'<div class="cxre" style="top:'+(top-reH-gap)+'px;'+(m.mine?'right:10px':'left:10px')+'">'+['❤️','😂','😮','😢','🙏','👍','🔥'].map(function(e){return '<button class="'+(m.reaction===e?'on':'')+'" onclick="chatCtxClose();chatReact('+id+',\''+e+'\')">'+e+'</button>';}).join('')+'</div>'
  +'<div class="cxmsg ig" style="top:'+top+'px;'+side+';width:'+r.width+'px;max-height:'+bh+'px"></div>'
  +'<div class="cxmenu" style="top:'+(top+bh+gap)+'px;'+(m.mine?'right:10px':'left:10px')+'">'+acts.map(function(a){return '<button class="'+(a[3]||'')+'" onclick="chatCtxClose();'+a[2]+'"><span>'+a[1]+'</span><i>'+a[0]+'</i></button>';}).join('')+'</div>';
 var cl=bub.cloneNode(true);cl.removeAttribute('id');cl.removeAttribute('ontouchstart');cl.removeAttribute('ontouchend');cl.removeAttribute('ontouchmove');cl.removeAttribute('ondblclick');cl.removeAttribute('oncontextmenu');cl.removeAttribute('onclick');
 o.querySelector('.cxmsg').appendChild(cl);document.body.appendChild(o);requestAnimationFrame(function(){o.classList.add('on');});}
function chatCtxClose(){var o=$('igCtx');if(!o)return false;o.classList.remove('on');setTimeout(function(){o.remove();},150);return true;}
function chatCopy(id){var m=CHATmsgs.find(function(x){return x.id===id;});try{navigator.clipboard.writeText(m.body);toast('Kopyalandı');}catch(e){}closeModal();}
function chatStar(id,on){run(sb.rpc('msg_star',{p_id:id,p_on:on})).then(function(){closeModal();toast(on?'⭐ Ulduzlandı':'Ulduz götürüldü');chatLoadMsgs(true);}).catch(err);}
function chatPin(id,on){run(sb.rpc('msg_pin',{p_id:id,p_on:on})).then(function(){closeModal();toast(on?'📌 Sabitləndi':'Sabitdən çıxarıldı');chatLoadMsgs(true);}).catch(err);}
function chatEdit(id){var m=CHATmsgs.find(function(x){return x.id===id;});closeModal();var n=prompt('Mesajı redaktə et',m.body);if(n==null||!n.trim()||n===m.body)return;run(sb.rpc('msg_edit',{p_id:id,p_body:n.trim()})).then(function(){chatLoadMsgs(true);}).catch(err);}
function chatUnsend(id){if(!confirm('Mesaj hamıdan silinsin?'))return;run(sb.rpc('msg_unsend',{p_id:id})).then(function(){closeModal();chatLoadMsgs(true);}).catch(err);}
function chatSetReply(id){var m=CHATmsgs.find(function(x){return x.id===id;});if(!m)return;CHATreply=m;closeModal();
 $('chatReplyBar').innerHTML='<div class="replybar"><span>↩︎ '+esc(chatMsgPreview(m).slice(0,50))+'</span><button onclick="chatCancelReply()">×</button></div>';var t=$('chatText');if(t)t.focus();}
function chatPinnedList(){var p=(CHATmsgs||[]).filter(function(m){return m.pinned&&!m.deleted;});modal('<div class="mhead"><h3>📌 Sabitlənmiş</h3><button class="x" onclick="closeModal()">×</button></div>'+(p.length?p.map(function(m){return '<button class="igmenu" onclick="closeModal();chatJump('+m.id+')">'+esc(chatMsgPreview(m))+'<small>'+chatSep(new Date(m.at))+'</small></button>';}).join(''):'<p class="hint">Sabitlənmiş mesaj yoxdur. Mesajı uzun basıb "Sabitlə" seçin.</p>'));}
function chatStarred(){run(sb.rpc('msg_starred')).then(function(r){r=r||[];modal('<div class="mhead"><h3>⭐ Ulduzlu mesajlar</h3><button class="x" onclick="closeModal()">×</button></div><div style="max-height:60vh;overflow-y:auto">'+(r.length?r.map(function(m){return '<div class="igrow" onclick="closeModal();show(\'chat\');chatOpen(\''+m.chat+'\',\''+chatArg(m.group?'Qrup':m.from.ad)+'\','+(m.group?1:0)+')">'+chatAva(m.from.ad,m.from.photo,40)+'<div class="igmeta"><div class="igname">'+esc(m.from.ad)+'</div><div class="iglast"><span class="iglt">'+esc(chatMsgPreview(m))+'</span></div></div></div>';}).join(''):'<p class="hint">Hələ ulduzlu mesaj yoxdur. Mesajı uzun basıb ⭐ seçin.</p>')+'</div>');}).catch(err);}

/* ---------- GÖNDƏRMƏ ---------- */
function chatSendRpc(o){var a={p_to:CHATgroup?null:CHATother,p_group:CHATgroup?CHATother:null,p_body:o.body||'',p_kind:o.kind||'text',p_image:o.image||null,p_file_url:o.file||null,p_file_name:o.fname||null,p_file_size:o.fsize||null,p_duration:o.dur||null,p_reply:CHATreply?CHATreply.id:null};
 return run(sb.rpc('msg_send',a)).then(function(){chatCancelReply();chatLoadMsgs(true);var el=$('chatMsgs');if(el)el._stick=true;});}
function chatSend(){var el=$('chatText');if(!el)return;var t=el.value.trim();if(!t)return;el.value='';chatTyping();chatSendRpc({body:t}).catch(function(e){toast('Göndərilmədi: '+(e.message||e));});}
function chatUpload(file,prefix){var ext=((file.name||'').split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,6)||'bin';var path=prefix+'/'+Date.now()+'_'+Math.random().toString(36).slice(2,8)+'.'+ext;
 return sb.storage.from('chat').upload(path,file,{contentType:file.type||'application/octet-stream'}).then(function(r){if(r.error)throw r.error;return sb.storage.from('chat').getPublicUrl(path).data.publicUrl;});}
function chatUploadImage(file){if(!file)return;if(file.size>15*1024*1024){toast('Şəkil 15MB-dan kiçik olmalıdır');return;}toast('Şəkil yüklənir…');
 chatUpload(file,'img').then(function(url){return chatSendRpc({image:url});}).catch(function(e){toast('Şəkil göndərilmədi: '+(e.message||e));});}
function chatPickFile(){var f=$('chatAny');if(f){f.value='';f.click();}}
function chatUploadFile(file){if(!file)return;if(file.size>25*1024*1024){toast('Fayl 25MB-dan kiçik olmalıdır');return;}
 if(/^image\//.test(file.type))return chatUploadImage(file);toast('Fayl yüklənir…');
 chatUpload(file,'file').then(function(url){return chatSendRpc({kind:'file',file:url,fname:file.name,fsize:file.size});}).catch(function(e){toast('Fayl göndərilmədi: '+(e.message||e));});}

/* ---------- SƏSLİ MESAJ ---------- */
function voiceBind(){var b=$('igMic');if(!b)return;
 var start=function(e){e.preventDefault();voiceStart();},stop=function(e){e.preventDefault();voiceStop(e.type==='pointerleave'||e.type==='pointercancel');};
 b.addEventListener('pointerdown',start);b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('contextmenu',function(e){e.preventDefault();});}
function voiceStart(){if(_rec)return;if(!navigator.mediaDevices||!window.MediaRecorder){toast('Bu cihaz səs yazmağı dəstəkləmir');return;}
 navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(function(st){
  var mt=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'].find(function(t){try{return MediaRecorder.isTypeSupported(t);}catch(e){return false;}})||'';
  var r=new MediaRecorder(st,mt?{mimeType:mt}:undefined),ch=[];_rec={r:r,st:st,ch:ch,t0:Date.now(),mt:r.mimeType||mt||'audio/webm'};
  r.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data);};r.start(250);
  try{navigator.vibrate&&navigator.vibrate(30);}catch(e){}
  var bar=$('igRec');if(bar){bar.innerHTML='<div class="igrec"><span class="igrecdot"></span><b id="igRecT">0:00</b><span>Buraxanda göndəriləcək · ləğv üçün kənara çək</span></div>';}
  _rec.tick=setInterval(function(){var x=$('igRecT');if(x&&_rec)x.textContent=chatDur((Date.now()-_rec.t0)/1000);if(_rec&&Date.now()-_rec.t0>300000)voiceStop(false);},250);
 }).catch(function(e){toast(callErrMsg(e));});}
function voiceStop(cancel){var R=_rec;if(!R)return;_rec=null;clearInterval(R.tick);var bar=$('igRec');if(bar)bar.innerHTML='';
 var dur=(Date.now()-R.t0)/1000;R.r.onstop=function(){R.st.getTracks().forEach(function(t){t.stop();});
  if(cancel||dur<0.8){if(!cancel)toast('Səs yazmaq üçün düyməni basıb saxlayın');return;}
  var blob=new Blob(R.ch,{type:R.mt.split(';')[0]});var ext=/mp4/.test(R.mt)?'m4a':/ogg/.test(R.mt)?'ogg':'webm';
  var f=new File([blob],'ses.'+ext,{type:blob.type});toast('🎤 Göndərilir…');
  chatUpload(f,'voice').then(function(url){return chatSendRpc({kind:'voice',file:url,dur:Math.round(dur)});}).catch(function(e){toast('Səs göndərilmədi: '+(e.message||e));});};
 try{R.r.stop();}catch(e){}}
function voiceHtml(m){var bars='';for(var i=0;i<26;i++){var h=6+Math.abs(Math.sin((m.id+i)*1.7))*16;bars+='<i style="height:'+h.toFixed(0)+'px"></i>';}
 return '<div class="igvoice" onclick="event.stopPropagation();voicePlay('+m.id+',\''+esc(m.file)+'\')"><button class="igvp" id="vp'+m.id+'">'+IGI.play+'</button><span class="igwave" id="vw'+m.id+'">'+bars+'</span><small id="vt'+m.id+'">'+chatDur(m.dur)+'</small></div>';}
var _vAudio=null,_vId=null;
function voicePlay(id,url){if(_vAudio&&_vId===id){if(_vAudio.paused)_vAudio.play();else _vAudio.pause();return;}
 if(_vAudio){_vAudio.pause();var ob=$('vp'+_vId);if(ob)ob.innerHTML=IGI.play;}
 var a=new Audio(url);_vAudio=a;_vId=id;var b=$('vp'+id);
 a.onplay=function(){if(b)b.innerHTML=IGI.pause;};a.onpause=function(){if(b)b.innerHTML=IGI.play;};
 a.ontimeupdate=function(){var w=$('vw'+id),t=$('vt'+id);if(w&&a.duration&&isFinite(a.duration)){var p=a.currentTime/a.duration,bs=w.children;for(var i=0;i<bs.length;i++)bs[i].classList.toggle('on',i/bs.length<=p);}if(t)t.textContent=chatDur(a.currentTime);};
 a.onended=function(){if(b)b.innerHTML=IGI.play;var w=$('vw'+id);if(w)Array.prototype.forEach.call(w.children,function(x){x.classList.remove('on');});var m=CHATmsgs.find(function(x){return x.id===id;});var t=$('vt'+id);if(t&&m)t.textContent=chatDur(m.dur);_vId=null;};
 a.play().catch(function(){toast('Səs açılmadı');});}

/* ---------- HEKAYƏLƏR ---------- */
function storyLoad(){run(sb.rpc('story_feed')).then(function(r){CHAT_STORIES=r||[];storyDrawRow();}).catch(function(){});}
function storyDrawRow(){var el=$('igStories');if(!el)return;var my=CHAT_STORIES.find(function(u){return u.me;});
 var h='<div class="igsto" onclick="'+(my?'storyOpen(0)':'storyPick()')+'"><span class="igring'+(my?' seen':' add')+'">'+chatAva(ME&&ME.full_name||'Mən',(typeof EMP!=='undefined'&&EMP&&EMP.photo)||null,62)+(my?'':'<b class="igplus">+</b>')+'</span><small>Sənin hekayən</small></div>';
 CHAT_STORIES.forEach(function(u,i){if(u.me)return;h+='<div class="igsto" onclick="storyOpen('+i+')"><span class="igring'+(u.unseen?'':' seen')+(u.bday?' bday':'')+'">'+chatAva(u.ad,u.photo,62)+'</span><small>'+(u.bday?'🎂 ':'')+esc((u.ad||'').split(' ')[0])+'</small></div>';});
 el.innerHTML=h;}
function storyPick(){var i=document.createElement('input');i.type='file';i.accept='image/*,video/*';i.onchange=function(){var f=i.files[0];if(!f)return;if(f.size>25*1024*1024){toast('Fayl 25MB-dan kiçik olmalıdır');return;}
 var vid=/^video\//.test(f.type),u=URL.createObjectURL(f);
 modal('<div class="mhead"><h3>Hekayə</h3><button class="x" onclick="closeModal()">×</button></div><div style="border-radius:14px;overflow:hidden;background:#000;max-height:55vh;display:flex;justify-content:center">'+(vid?'<video src="'+u+'" style="max-height:55vh;max-width:100%" autoplay muted loop playsinline></video>':'<img src="'+u+'" style="max-height:55vh;max-width:100%;object-fit:contain">')+'</div><input id="stoCap" placeholder="Yazı əlavə et (istəyə görə)" maxlength="200" style="width:100%;margin-top:10px"><button class="btn" id="stoGo" style="width:100%;margin-top:10px">Paylaş · 24 saat görünəcək</button>');
 $('stoGo').onclick=function(){this.disabled=true;this.textContent='Yüklənir…';chatUpload(f,'story').then(function(url){return run(sb.rpc('story_add',{p_url:url,p_kind:vid?'video':'image',p_caption:$('stoCap').value.trim()||null}));}).then(function(){closeModal();toast('Hekayə paylaşıldı');storyLoad();}).catch(function(e){toast('Alınmadı: '+(e.message||e));});};};i.click();}
var _sv=null;
function storyOpen(ui){var u=CHAT_STORIES[ui];if(!u)return;var start=0;if(!u.me){var k=u.items.findIndex(function(x){return !x.seen;});start=k<0?0:k;}
 _sv={ui:ui,ii:start,t:null,p:0};var el=document.createElement('div');el.id='igSV';document.body.appendChild(el);document.body.classList.add('incall');storyShow();}
function storyShow(){if(!_sv)return;var u=CHAT_STORIES[_sv.ui],it=u&&u.items[_sv.ii];if(!it){storyClose();return;}var el=$('igSV');clearInterval(_sv.t);_sv.p=0;
 el.innerHTML='<div class="svbars">'+u.items.map(function(x,i){return '<i><b style="width:'+(i<_sv.ii?100:0)+'%"'+(i===_sv.ii?' id="svb"':'')+'></b></i>';}).join('')+'</div>'
  +'<div class="svhead">'+chatAva(u.ad,u.photo,34)+'<b>'+esc(u.ad)+'</b><small>'+chatAgo(it.at)+'</small><button onclick="storyClose()">✕</button></div>'
  +(it.kind==='video'?'<video id="svm" src="'+esc(it.url)+'" autoplay playsinline></video>':'<img id="svm" src="'+esc(it.url)+'">')
  +(it.cap?'<div class="svcap">'+esc(it.cap)+'</div>':'')
  +'<div class="svl" onclick="storyNav(-1)"></div><div class="svr" onclick="storyNav(1)"></div>'
  +(u.me?'<div class="svfoot"><button onclick="storyViewers(\''+it.id+'\')">👁 '+(it.views||0)+' baxış</button><button onclick="storyDel(\''+it.id+'\')">🗑️ Sil</button><button onclick="storyPick()">➕ Yeni</button></div>'
   :'<div class="svfoot">'+['❤️','🔥','👏','😂','😮'].map(function(e){return '<button class="svr1" onclick="storyReact(\''+e+'\')">'+e+'</button>';}).join('')+'</div>');
 if(!u.me&&!it.seen){it.seen=true;sb.rpc('story_view',{p_id:it.id}).then(function(){},function(){});}
 var dur=5000,m=$('svm');if(it.kind==='video'&&m){m.onloadedmetadata=function(){dur=Math.min(30000,(m.duration||5)*1000);};}
 var t0=Date.now();_sv.t=setInterval(function(){var b=$('svb');var p=(Date.now()-t0)/dur;if(b)b.style.width=Math.min(100,p*100)+'%';if(p>=1)storyNav(1);},50);}
function storyNav(d){if(!_sv)return;var u=CHAT_STORIES[_sv.ui];_sv.ii+=d;if(_sv.ii<0){_sv.ii=0;}
 if(_sv.ii>=u.items.length){var nx=_sv.ui+1;while(CHAT_STORIES[nx]&&CHAT_STORIES[nx].me)nx++;if(CHAT_STORIES[nx]&&!u.me){_sv.ui=nx;_sv.ii=0;}else{storyClose();return;}}storyShow();}
function storyClose(){if(_sv)clearInterval(_sv.t);_sv=null;var el=$('igSV');if(el)el.remove();document.body.classList.remove('incall');storyDrawRow();}
function storyReact(e){if(!_sv)return;var it=CHAT_STORIES[_sv.ui].items[_sv.ii];run(sb.rpc('story_view',{p_id:it.id,p_reaction:e})).then(function(){toast(e+' göndərildi');}).catch(function(){});}
function storyDel(id){if(!confirm('Hekayə silinsin?'))return;run(sb.rpc('story_delete',{p_id:id})).then(function(){storyClose();storyLoad();}).catch(err);}
function storyViewers(id){clearInterval(_sv&&_sv.t);run(sb.rpc('story_viewers',{p_id:id})).then(function(r){r=r||[];var el=$('igSV');var d=document.createElement('div');d.className='svlist';
 d.innerHTML='<div class="row sp"><b>👁 Baxanlar ('+r.length+')</b><button class="igtxt" onclick="this.parentNode.parentNode.remove();storyShow()">Bağla</button></div>'+(r.length?r.map(function(v){return '<div class="igrow">'+chatAva(v.ad,v.photo,36)+'<div class="igmeta"><div class="igname">'+esc(v.ad)+(v.r?' '+esc(v.r):'')+'</div><div class="iglast">'+chatAgo(v.at)+'</div></div></div>';}).join(''):'<p class="hint">Hələ baxan yoxdur</p>');el.appendChild(d);}).catch(err);}

/* ---------- LENT ---------- */
function renderFeed(){var v=$('v-feed');if(!v)return;
 v.innerHTML='<div class="ig igfeed"><div class="igtop"><h2>📣 Lent</h2><button class="igicon" onclick="storyPick()" title="Hekayə">➕</button></div>'
  +'<div class="igstories" id="igStories"></div>'
  +'<div class="igcompose" onclick="feedCompose()">'+chatAva(ME&&ME.full_name||'Mən',(typeof EMP!=='undefined'&&EMP&&EMP.photo)||null,40)+'<span class="igct">Komandaya nə demək istəyirsən?</span><b>📷</b></div>'
  +'<div class="igboards" id="igBoards"></div><div id="igPosts"><p class="status"><span class="spin"></span>Yüklənir…</p></div></div>';
 storyLoad();feedBoards();feedLoad();}
function feedBoards(){Promise.all([run(sb.rpc('sales_board')).catch(function(){return [];}),run(sb.rpc('kudos_board')).catch(function(){return [];})]).then(function(r){var s=r[0]||[],k=r[1]||[],el=$('igBoards');if(!el)return;
 var medal=function(i){return ['🥇','🥈','🥉'][i]||(i+1)+'.';};
 el.innerHTML='<div class="igboard"><b>🏆 Ayın satış liderləri</b>'+(s.length?s.slice(0,5).map(function(x,i){return '<div class="igbr"><span>'+medal(i)+'</span>'+chatAva(x.ad,x.photo,30)+'<span class="nm">'+esc(x.ad)+'</span><b>'+x.n+' satış</b></div>';}).join(''):'<p class="hint">Bu ay hələ satış qeydə alınmayıb</p>')+'</div>'
  +'<div class="igboard"><b>🙌 Ayın ən çox təşəkkür alanları</b>'+(k.length?k.slice(0,5).map(function(x,i){return '<div class="igbr"><span>'+medal(i)+'</span>'+chatAva(x.ad,x.photo,30)+'<span class="nm">'+esc(x.ad)+'</span><b>'+x.n+' 🙌</b></div>';}).join(''):'<p class="hint">Bu ay hələ təşəkkür yoxdur</p>')
  +'<button class="igtxt" onclick="typeof openKudos===\'function\'?openKudos():0">+ Təşəkkür göndər</button></div>';});}
var FEED=[];
function feedLoad(){run(sb.rpc('feed_list',{p_before:null})).then(function(r){FEED=r||[];feedDraw();}).catch(err);}
function feedDraw(){var el=$('igPosts');if(!el)return;if(!FEED.length){el.innerHTML='<div class="igempty"><b>Lent boşdur</b><div>İlk postu sən paylaş 👆</div></div>';return;}
 el.innerHTML=FEED.map(function(p){var a=p.author,r=p.ref,isK=p.kind==='kudos',sys=p.kind==='birthday'||p.kind==='welcome';
  var head=sys?'<div class="igph">'+chatAva(r&&r.ad,r&&r.photo,40)+'<div><b>'+(p.kind==='birthday'?'🎂 Ad günü':'👋 Yeni həmkar')+'</b><small>'+chatAgo(p.at)+'</small></div></div>'
   :'<div class="igph">'+chatAva(a&&a.ad,a&&a.photo,40)+'<div><b>'+esc(a&&a.ad||'')+(isK&&r?' <span class="muted">→</span> '+esc(r.ad):'')+'</b><small>'+(isK?'təşəkkür etdi · ':'')+chatAgo(p.at)+(p.pinned?' · 📌':'')+'</small></div>'
   +((p.mine||(typeof MGR!=='undefined'&&MGR))&&!isK?'<button class="igicon" onclick="feedMenu(\''+p.id+'\')">'+IGI.more+'</button>':'')+'</div>';
  var badge=isK&&typeof BADGES!=='undefined'&&BADGES[p.badge]?'<div class="igkb">'+BADGES[p.badge][0]+' '+BADGES[p.badge][1]+'</div>':'';
  var body=(badge)+(p.body?'<div class="igpb">'+esc(p.body).replace(/\n/g,'<br>')+'</div>':'')+(p.image?'<img class="igpi" src="'+esc(p.image)+'" onclick="chatViewImage(\''+esc(p.image)+'\')" ondblclick="feedLike(\''+p.id+'\',true)">':'');
  var acts=isK?'':'<div class="igpa"><button onclick="feedLike(\''+p.id+'\','+(!p.liked)+')" class="'+(p.liked?'on':'')+'">'+(p.liked?'❤️':'🤍')+' '+(p.likes||'')+'</button><button onclick="feedComments(\''+p.id+'\')">💬 '+(p.comments||'')+'</button>'+(p.kind==='birthday'&&r&&r.uid!==ME.user_id?'<button onclick="show(\'chat\');chatOpen(\''+r.uid+'\',\''+chatArg(r.ad)+'\')">🎉 Təbrik et</button>':'')+'</div>';
  return '<div class="igpost'+(sys?' sys':'')+(isK?' kud':'')+'">'+head+body+acts+'</div>';}).join('');}
function feedCompose(){modal('<div class="mhead"><h3>Yeni post</h3><button class="x" onclick="closeModal()">×</button></div><textarea id="fpB" rows="4" placeholder="Nə paylaşmaq istəyirsən?" style="width:100%"></textarea><div id="fpPrev"></div><div class="row" style="gap:8px;margin-top:8px"><button class="btn ghost" onclick="feedPickImg()">📷 Şəkil</button><button class="btn" style="flex:1" id="fpGo" onclick="feedPost()">Paylaş</button></div>');setTimeout(function(){var t=$('fpB');if(t)t.focus();},100);}
var _fpImg=null;
function feedPickImg(){var i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=function(){_fpImg=i.files[0];if(_fpImg)$('fpPrev').innerHTML='<img src="'+URL.createObjectURL(_fpImg)+'" style="width:100%;border-radius:12px;margin-top:8px;max-height:40vh;object-fit:cover">';};i.click();}
function feedPost(){var b=($('fpB').value||'').trim();if(!b&&!_fpImg){toast('Mətn və ya şəkil əlavə edin');return;}var g=$('fpGo');g.disabled=true;g.textContent='Paylaşılır…';
 (_fpImg?chatUpload(_fpImg,'post'):Promise.resolve(null)).then(function(url){return run(sb.rpc('post_add',{p_body:b,p_image:url}));}).then(function(){_fpImg=null;closeModal();toast('Paylaşıldı');feedLoad();}).catch(function(e){g.disabled=false;g.textContent='Paylaş';toast(e.message||e);});}
function feedLike(id,on){var p=FEED.find(function(x){return x.id===id;});if(!p||p.kind==='kudos')return;if(p.liked===on&&on)return;p.liked=on;p.likes=(p.likes||0)+(on?1:-1);feedDraw();sb.rpc('post_like',{p_id:id,p_on:on}).then(function(){},function(){});}
function feedComments(id){run(sb.rpc('post_comments',{p_id:id})).then(function(r){r=r||[];modal('<div class="mhead"><h3>💬 Şərhlər</h3><button class="x" onclick="closeModal()">×</button></div><div style="max-height:50vh;overflow-y:auto">'+(r.length?r.map(function(c){return '<div class="igcm">'+chatAva(c.ad,c.photo,32)+'<div><b>'+esc(c.ad)+'</b> '+esc(c.body)+'<small>'+chatAgo(c.at)+'</small></div></div>';}).join(''):'<p class="hint">İlk şərhi sən yaz</p>')+'</div><div class="row" style="gap:6px;margin-top:10px"><input id="fcB" placeholder="Şərh yaz…" style="flex:1" onkeydown="if(event.key===\'Enter\')feedComment(\''+id+'\')"><button class="btn" onclick="feedComment(\''+id+'\')">Göndər</button></div>');}).catch(err);}
function feedComment(id){var b=($('fcB').value||'').trim();if(!b)return;run(sb.rpc('post_comment',{p_id:id,p_body:b})).then(function(){var p=FEED.find(function(x){return x.id===id;});if(p)p.comments=(p.comments||0)+1;feedComments(id);feedDraw();}).catch(err);}
function feedMenu(id){var p=FEED.find(function(x){return x.id===id;});modal('<div class="mhead"><h3>Post</h3><button class="x" onclick="closeModal()">×</button></div>'
 +(typeof MGR!=='undefined'&&MGR?'<button class="igmenu" onclick="feedPin(\''+id+'\','+(!p.pinned)+')">'+(p.pinned?'📌 Sabitdən çıxar':'📌 Yuxarıda sabitlə')+'</button>':'')
 +'<button class="igmenu" style="color:#ed4956" onclick="feedDel(\''+id+'\')">🗑️ Sil</button>');}
function feedPin(id,on){run(sb.rpc('post_pin',{p_id:id,p_on:on})).then(function(){closeModal();feedLoad();}).catch(err);}
function feedDel(id){if(!confirm('Post silinsin?'))return;run(sb.rpc('post_delete',{p_id:id})).then(function(){closeModal();feedLoad();}).catch(err);}


/* ---------- İŞ YERLƏRİ (Baş Ofis + LUX Satış + LUX Köçürmə) ---------- */
var LOCS=[];
function locById(id){return LOCS.find(function(l){return l.id===+id;})||null;}
function locName(id){var l=id?locById(id):null;return l?l.name:'Baş Ofis';}
function locOpts(sel){return '<option value="">Baş Ofis</option>'+LOCS.filter(function(l){return l.active||l.id===sel;}).map(function(l){return '<option value="'+l.id+'"'+(l.id===sel?' selected':'')+'>'+esc(l.name)+'</option>';}).join('');}
function siteOf(e){var l=e&&e.location_id?locById(e.location_id):null;if(l)return {name:l.name,lat:l.lat,lng:l.lng,radius_m:l.radius_m};var c=CFG||{};return {name:'Baş Ofis',lat:c.lat!=null?c.lat:null,lng:c.lng,radius_m:c.radius_m||150};}
var LOCF='';try{LOCF=sessionStorage.getItem('ofis_locf')||'';}catch(e){}
function locMatch(e){if(!LOCF)return true;if(LOCF==='0')return !e.location_id;return e.location_id===+LOCF;}
function locPill(e,a){if(!LOCS.length)return '';var id=(a&&a.check_in)?a.location_id:e.location_id;var other=a&&a.check_in&&(a.location_id||null)!==(e.location_id||null);return '<div class="small" style="margin-top:2px"><span class="pill '+(other?'p-warn':'p-mut')+'">📍 '+esc(locName(id))+'</span></div>';}
function locFilterBar(){var h=document.querySelector('#v-team > .row');if(!h||!LOCS.length||$('dLoc'))return;h.querySelector('.row').insertAdjacentHTML('afterbegin','<select id="dLoc" class="btn ghost sm" title="İş yeri"><option value="">Bütün iş yerləri</option><option value="0">Baş Ofis</option>'+LOCS.map(function(l){return '<option value="'+l.id+'">'+esc(l.name)+'</option>';}).join('')+'</select>');$('dLoc').value=LOCF;$('dLoc').onchange=function(){LOCF=this.value;try{sessionStorage.setItem('ofis_locf',LOCF);}catch(e){}renderDay();renderMonth();};}
(function(){var _rd=renderDay;renderDay=function(){try{locFilterBar();}catch(e){}return _rd.apply(this,arguments);};})();
function renderLocs(){var box=$('locSet');if(!box)return;
 var c=CFG||{};var rows=[{id:0,name:'Baş Ofis',lat:c.lat,lng:c.lng,radius_m:c.radius_m||150,fixed:true}].concat(LOCS);
 box.innerHTML=rows.map(function(l){var n=EMPS.filter(function(e){return e.active&&(l.id?e.location_id===l.id:!e.location_id);}).length;var ok=l.lat!=null;
  return '<div class="locrow" style="border:1px solid var(--line,#e5e7eb);border-radius:14px;padding:12px;margin-bottom:10px">'
   +'<div class="row" style="justify-content:space-between;align-items:center"><b>'+esc(l.name)+'</b><span class="pill '+(ok?'p-ok':'p-bad')+'">'+(ok?'konum var · '+(l.radius_m||150)+' m':'konum təyin edilməyib')+'</span></div>'
   +'<div class="muted small" style="margin:4px 0 8px">'+n+' işçi'+(ok?' · '+(+l.lat).toFixed(5)+', '+(+l.lng).toFixed(5)+' · <a class="maplink" target="_blank" rel="noopener" href="https://www.google.com/maps?q='+l.lat+','+l.lng+'">xəritədə</a>':'')+(l.active===false?' · <b>söndürülüb</b>':'')+'</div>'
   +(l.fixed?'<div class="muted small">Baş Ofisin konumu və QR rejimi aşağıdakı kartlardadır.</div>'
     :'<div class="row" style="flex-wrap:wrap;gap:6px"><button class="btn ghost sm" onclick="locEdit('+l.id+')">✎ Konum və radius</button><button class="btn ghost sm" onclick="printQR('+l.id+')">🖨 Çap QR</button><button class="btn ghost sm" onclick="openQR('+l.id+')">🖥 Ekran QR</button><button class="btn ghost sm" style="color:var(--bad)" onclick="rotateQR('+l.id+')">↻ QR-ı yenilə</button></div>')
   +'</div>';}).join('')+'<button class="btn ghost sm" onclick="locEdit(0)">+ Yeni iş yeri</button>';}
function locEdit(id){var l=id?locById(id):{name:'',lat:null,lng:null,radius_m:150,active:true};
 modal('<div class="mhead"><h3>'+(id?esc(l.name):'Yeni iş yeri')+'</h3><button class="x" onclick="closeModal()">×</button></div>'
  +'<div class="field"><label>Adı</label><input id="lN" value="'+esc(l.name)+'"></div>'
  +'<div class="grid g2"><div class="field"><label>Enlik (lat)</label><input id="lLat" inputmode="decimal" value="'+(l.lat!=null?l.lat:'')+'"></div><div class="field"><label>Uzunluq (lng)</label><input id="lLng" inputmode="decimal" value="'+(l.lng!=null?l.lng:'')+'"></div></div>'
  +'<button class="btn ghost sm" onclick="locHere()">📍 Hazırkı yerimi bu iş yeri kimi götür</button><p class="muted small" style="margin:6px 0 10px">İş yerinin içində (girişin yanında) dayanıb basın. Google Maps-dən "40.4, 49.8" şəklində koordinatı Enlik sahəsinə yapışdırmaq da olar.</p>'
  +'<div class="field"><label>İcazəli radius (metr)</label><input id="lRad" type="number" min="30" value="'+(l.radius_m||150)+'"></div>'
  +(id?'<label class="row small" style="margin-bottom:12px"><input type="checkbox" id="lAct"'+(l.active?' checked':'')+'> Aktiv</label>':'')
  +'<div class="row"><span style="flex:1"></span><button class="btn" onclick="locSave('+(id||0)+')">Yadda saxla</button></div>');}
function locHere(){if(!navigator.geolocation)return toast('Brauzer yeri dəstəkləmir');toast('Yer alınır…');navigator.geolocation.getCurrentPosition(function(p){$('lLat').value=p.coords.latitude.toFixed(6);$('lLng').value=p.coords.longitude.toFixed(6);toast('Dəqiqlik: ±'+Math.round(p.coords.accuracy)+' m. "Yadda saxla" basın.');},function(){toast('Yer icazəsi verilmədi');},{enableHighAccuracy:true,timeout:15000,maximumAge:0});}
function locSave(id){var raw=($('lLat').value+'').trim();var m=raw.match(/(-?\d+\.\d+)\s*[, ]\s*(-?\d+\.\d+)/);if(m){$('lLat').value=m[1];$('lLng').value=m[2];}
 var b={name:$('lN').value.trim(),lat:parseFloat($('lLat').value),lng:parseFloat($('lLng').value),radius_m:Math.max(30,+$('lRad').value||150)};
 if(!b.name)return toast('Ad yazın');if(isNaN(b.lat)||isNaN(b.lng)){b.lat=null;b.lng=null;}
 if($('lAct'))b.active=$('lAct').checked;
 var q=id?sb.from('office_locations').update(b).eq('id',id):sb.from('office_locations').insert(b);
 run(q.select('id,name,lat,lng,radius_m,static_qr,active,sort').single()).then(function(r){var i=LOCS.findIndex(function(x){return x.id===r.id;});if(i>=0)LOCS[i]=r;else LOCS.push(r);closeModal();renderLocs();toast('Saxlanıldı');}).catch(err);}
