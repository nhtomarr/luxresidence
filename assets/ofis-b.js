var _blI=setInterval(function(){var a=document.getElementById("app");if(a&&getComputedStyle(a).display!=="none"){var b=document.getElementById("bootload");if(b)b.style.display="none";clearInterval(_blI);}},400);setTimeout(function(){clearInterval(_blI);},12000);window.addEventListener("load",function(){setTimeout(function(){var a=document.getElementById("app");if(a&&a.style.display!=="none"){var b=document.getElementById("bootload");if(b)b.style.display="none";}},300);});/*bootload-fallback*/
;

/* ===================== SOSİAL ŞƏBƏKƏ v2 ===================== */
var FMODE='all',FARG=null,FEED=[],NOTIF_N=0,_ment={},_cParent=null,_fpMedia=[],_fpPoll=null,_fpClub=null,SOC_CONTACTS=null;
var BADGE_INFO={first_post:['✍️','İlk post'],creator:['🎨','Yaradıcı'],kudos5:['🙌','Sevimli həmkar'],punctual:['🕘','Dəqiq'],year1:['🏅','Veteran'],popular:['⭐','Populyar']};
function badgeInfo(c){if(/^star_/.test(c))return ['🌟','Ayın ulduzu '+c.slice(9,11)+'.'+c.slice(5,9)];return BADGE_INFO[c]||['🏷️',c];}
var REACTS=['❤️','😂','👏','🔥','😮'];
function socContacts(){if(SOC_CONTACTS)return Promise.resolve(SOC_CONTACTS);return run(sb.rpc('msg_contacts')).then(function(l){SOC_CONTACTS=l||[];return SOC_CONTACTS;}).catch(function(){return [];});}
function socText(t){var h=esc(t||'');h=h.replace(/#([\wğüşıöçəĞÜŞİÖÇƏ]+)/g,'<a class="sotag" onclick="event.stopPropagation();feedMode(\'tag\',\'$1\')">#$1</a>');
 (SOC_CONTACTS||[]).forEach(function(c){var n=esc(c.ad);if(h.indexOf('@'+n)>=0)h=h.split('@'+n).join('<a class="soment" onclick="event.stopPropagation();socProfile(\''+c.uid+'\')">@'+n+'</a>');});
 return h.replace(/\n/g,'<br>');}
/* ---- @mention avtomatik tamamlama ---- */
function mentionBind(el){if(!el||el._mb)return;el._mb=1;socContacts();var box=document.createElement('div');box.className='somlist';el.parentNode.insertBefore(box,el.nextSibling);
 el.addEventListener('input',function(){var v=el.value.slice(0,el.selectionStart),m=/@([^\s@]{0,20})$/.exec(v);if(!m){box.innerHTML='';return;}var q=m[1].toLowerCase();
  var l=(SOC_CONTACTS||[]).filter(function(c){return (c.ad||'').toLowerCase().indexOf(q)>=0;}).slice(0,5);
  box.innerHTML=l.map(function(c){return '<button type="button" data-u="'+c.uid+'" data-n="'+esc(c.ad)+'">'+chatAva(c.ad,c.photo,26)+'<span>'+esc(c.ad)+'</span></button>';}).join('');
  Array.prototype.forEach.call(box.children,function(b){b.onmousedown=function(e){e.preventDefault();var n=b.dataset.n,pos=el.selectionStart,pre=el.value.slice(0,pos).replace(/@([^\s@]{0,20})$/,'@'+n+' ');el.value=pre+el.value.slice(pos);_ment[n]=b.dataset.u;box.innerHTML='';el.focus();};});});}
function mentionIds(t){var ids=[];Object.keys(_ment).forEach(function(n){if((t||'').indexOf('@'+n)>=0&&ids.indexOf(_ment[n])<0)ids.push(_ment[n]);});return ids.length?ids:null;}

/* ---- LENT çərçivəsi ---- */
function renderFeed(){var v=$('v-feed');if(!v)return;socContacts().then(function(){if(FEED.length)feedDraw();});
 v.innerHTML='<div class="ig igfeed"><div class="igtop"><h2>Lent</h2><div class="sohead"><button class="igicon" onclick="feedMode(\'explore\')" title="Kəşf">'+IGI.search+'</button><button class="igicon" onclick="feedMode(\'saved\')" title="Saxlanılanlar">🔖</button><button class="igicon sobell" onclick="notifOpen()" title="Bildirişlər">🔔<b id="soBell" class="sobadge"'+(NOTIF_N?'':' style="display:none"')+'>'+NOTIF_N+'</b></button><button class="soavbtn" onclick="socProfile(ME.user_id)">'+chatAva(ME&&ME.full_name||'Mən',(typeof EMP!=='undefined'&&EMP&&EMP.photo)||null,32)+'</button></div></div>'
  +'<div class="soseg" id="soSeg"></div><div id="soBody"></div></div>';
 feedSeg();feedMode(FMODE==='tag'||FMODE==='user'?'all':FMODE);notifCount();}
function feedSeg(){var el=$('soSeg');if(!el)return;var s=[['all','Hamısı'],['following','İzlədiklərim'],['events','Tədbirlər'],['clubs','Klublar'],['albums','Albomlar'],['explore','Kəşf']];
 el.innerHTML=s.map(function(x){return '<button class="'+(FMODE===x[0]||(x[0]==='clubs'&&FMODE==='club')?'on':'')+'" onclick="feedMode(\''+x[0]+'\')">'+x[1]+'</button>';}).join('');}
function feedMode(m,arg){FMODE=m;FARG=arg||null;if(!$('soBody')){show('feed');return;}feedSeg();var b=$('soBody');b.innerHTML='<p class="status"><span class="spin"></span>Yüklənir…</p>';
 if(m==='events')return evRender();if(m==='clubs')return clubRender();if(m==='albums')return albumRender();if(m==='explore')return exploreRender();
 var head='';
 if(m==='all')head='<div class="igstories" id="igStories"></div><div class="igcompose" onclick="feedCompose()">'+chatAva(ME&&ME.full_name||'Mən',(typeof EMP!=='undefined'&&EMP&&EMP.photo)||null,40)+'<span class="igct">Komandaya nə demək istəyirsən?</span><b>📷</b></div><div id="soMoment"></div><div class="igboards" id="igBoards"></div>';
 if(m==='tag')head='<div class="sohdr"><button class="igicon" onclick="feedMode(\'all\')">'+IGI.back+'</button><h3>#'+esc(arg)+'</h3></div>';
 if(m==='saved')head='<div class="sohdr"><button class="igicon" onclick="feedMode(\'all\')">'+IGI.back+'</button><h3>🔖 Saxlanılanlar</h3></div>';
 if(m==='video')head='<div class="sohdr"><button class="igicon" onclick="feedMode(\'explore\')">'+IGI.back+'</button><h3>🎬 Videolar</h3></div>';
 if(m==='club')head='<div class="sohdr" id="soClubH"><button class="igicon" onclick="feedMode(\'clubs\')">'+IGI.back+'</button><h3>Klub</h3></div><div class="igcompose" onclick="feedCompose(\''+arg+'\')"><span class="igct">Kluba yaz…</span><b>📷</b></div>';
 b.innerHTML=head+'<div id="igPosts"><p class="status"><span class="spin"></span>Yüklənir…</p></div>';
 if(m==='all'){storyLoad();feedBoards();momentLoad();}
 if(m==='club')run(sb.rpc('club_list')).then(function(l){var c=(l||[]).find(function(x){return x.id===arg;});var h=$('soClubH');if(c&&h)h.innerHTML='<button class="igicon" onclick="feedMode(\'clubs\')">'+IGI.back+'</button><h3>'+esc(c.emoji+' '+c.name)+'</h3><button class="btn sm '+(c.joined?'ghost':'')+'" onclick="clubJoin(\''+c.id+'\','+(!c.joined)+')">'+(c.joined?'Üzvsən ✓':'Qoşul')+'</button>';});
 feedLoad();}
function feedLoad(){var m=FMODE,a=FARG;run(sb.rpc('feed2',{p_mode:m==='club'?'club':m,p_arg:a,p_before:null})).then(function(r){if(m!==FMODE)return;FEED=r||[];feedDraw();}).catch(err);}
function momentLoad(){run(sb.rpc('soc_explore')).then(function(x){var el=$('soMoment');if(!el||!x||!x.moment||!(x.moment.likes>0))return;var p=x.moment;
 el.innerHTML='<div class="somoment" onclick="postOpen(\''+p.id+'\')"><span>✨ Həftənin anı</span>'+(p.media&&p.media[0]?'<img src="'+esc(p.media[0].url)+'">':(p.image?'<img src="'+esc(p.image)+'">':''))+'<div><b>'+esc(p.author&&p.author.ad||'')+'</b><p>'+esc((p.body||'').slice(0,90))+'</p><small>'+(p.likes||0)+' reaksiya · '+(p.comments||0)+' şərh</small></div></div>';}).catch(function(){});}
/* ---- post kartı ---- */
function postCard(p){var a=p.author,r=p.ref,isK=p.kind==='kudos',sys=p.kind==='birthday'||p.kind==='welcome'||p.kind==='anniv';
 var title=p.kind==='birthday'?'🎂 Ad günü':p.kind==='welcome'?'👋 Yeni həmkar':p.kind==='anniv'?'🎉 İş ildönümü':'';
 var head=sys?'<div class="igph">'+chatAva(r&&r.ad,r&&r.photo,40)+'<div onclick="socProfile(\''+(r&&r.uid)+'\')"><b>'+title+'</b><small>'+chatAgo(p.at)+'</small></div></div>'
  :'<div class="igph">'+chatAva(a&&a.ad,a&&a.photo,40)+'<div onclick="socProfile(\''+(a&&a.uid)+'\')"><b>'+esc(a&&a.ad||'')+(isK&&r?' <span class="muted">→</span> '+esc(r.ad):'')+'</b><small>'+(p.club?esc(p.club.emoji+' '+p.club.name)+' · ':'')+(isK?'təşəkkür etdi · ':'')+chatAgo(p.at)+(p.pinned?' · 📌':'')+'</small></div>'
  +(!isK?'<button class="igicon" onclick="feedMenu(\''+p.id+'\')">'+IGI.more+'</button>':'')+'</div>';
 var badge=isK&&typeof BADGES!=='undefined'&&BADGES[p.badge]?'<div class="igkb">'+BADGES[p.badge][0]+' '+BADGES[p.badge][1]+'</div>':'';
 var media=p.media&&p.media.length?mediaHtml(p):(p.image?'<img class="igpi" src="'+esc(p.image)+'" onclick="chatViewImage(\''+esc(p.image)+'\')" ondblclick="feedReact(\''+p.id+'\',\'❤️\',true)">':'');
 var poll=p.poll?pollHtml(p):'';
 var shared=p.shared?'<div class="soshared" onclick="postOpen(\''+p.shared.id+'\')">'+(p.shared.image?'<img src="'+esc(p.shared.image)+'">':'')+'<div><b>'+esc(p.shared.author&&p.shared.author.ad||'')+'</b><p>'+esc(p.shared.body||'')+'</p></div></div>':'';
 var rs=p.reacts?Object.keys(p.reacts).sort(function(x,y){return p.reacts[y]-p.reacts[x];}).slice(0,3).join(''):'';
 var acts=isK?'':'<div class="sorsum">'+(p.likes?'<span>'+rs+' '+p.likes+'</span>':'<span></span>')+(p.comments?'<span onclick="feedComments(\''+p.id+'\')">'+p.comments+' şərh</span>':'')+'</div>'
  +'<div class="igpa"><button class="sorx'+(p.my?' on':'')+'" data-id="'+p.id+'" onclick="feedReact(\''+p.id+'\',\''+(p.my?'':'❤️')+'\')" oncontextmenu="event.preventDefault();reactPick(\''+p.id+'\',this)" ontouchstart="reactHold(\''+p.id+'\',this)" ontouchend="reactHoldEnd()" ontouchmove="reactHoldEnd()">'+(p.my||'🤍')+' <span>'+(p.my?'Reaksiya':'Bəyən')+'</span></button>'
  +'<button onclick="feedComments(\''+p.id+'\')">💬 <span>Şərh</span></button><button onclick="postShare(\''+p.id+'\')">↗︎ <span>Paylaş</span></button>'
  +(p.kind==='birthday'&&r&&r.uid!==ME.user_id?'<button onclick="show(\'chat\');chatOpen(\''+r.uid+'\',\''+chatArg(r.ad)+'\')">🎉</button>':'<button class="sosave'+(p.saved?' on':'')+'" onclick="postSave(\''+p.id+'\','+(!p.saved)+')">'+(p.saved?'🔖':'📑')+'</button>')+'</div>';
 return '<div class="igpost'+(sys?' sys':'')+(isK?' kud':'')+'" id="post'+p.id+'">'+head+badge+(p.body?'<div class="igpb">'+socText(p.body)+'</div>':'')+media+poll+shared+acts+'</div>';}
function feedDraw(){var el=$('igPosts');if(!el)return;if(!FEED.length){el.innerHTML='<div class="igempty"><b>'+(FMODE==='following'?'İzlədiyin həmkarların postu yoxdur':FMODE==='saved'?'Saxlanılan post yoxdur':'Hələ post yoxdur')+'</b><div>'+(FMODE==='following'?'Kəşf bölməsindən həmkarları izlə':'İlk postu sən paylaş')+'</div></div>';return;}
 el.innerHTML=FEED.map(postCard).join('');}
function mediaHtml(p){var m=p.media;if(m.length===1){var x=m[0];return x.kind==='video'?'<video class="igpi" src="'+esc(x.url)+'" controls playsinline preload="metadata"></video>':'<img class="igpi" src="'+esc(x.url)+'" onclick="chatViewImage(\''+esc(x.url)+'\')" ondblclick="feedReact(\''+p.id+'\',\'❤️\',true)">';}
 return '<div class="socar" onscroll="carDots(this)">'+m.map(function(x){return x.kind==='video'?'<video src="'+esc(x.url)+'" controls playsinline preload="metadata"></video>':'<img src="'+esc(x.url)+'" onclick="chatViewImage(\''+esc(x.url)+'\')">';}).join('')+'</div><div class="sodots">'+m.map(function(x,i){return '<i class="'+(i?'':'on')+'"></i>';}).join('')+'</div>';}
function carDots(el){var i=Math.round(el.scrollLeft/el.clientWidth),d=el.nextSibling;if(d)Array.prototype.forEach.call(d.children,function(x,k){x.classList.toggle('on',k===i);});}
function pollHtml(p){var o=p.poll,v=o.votes||{},tot=0,my=o.myvote;Object.keys(v).forEach(function(k){tot+=v[k];});var done=my!=null;
 return '<div class="sopoll"><b>📊 '+esc(o.q||'')+'</b>'+(o.opts||[]).map(function(t,i){var n=v[i]||0,pc=tot?Math.round(n*100/tot):0;
  return '<button class="'+(my===i?'my':'')+'" onclick="pollVote(\''+p.id+'\','+i+')"><i style="width:'+(done?pc:0)+'%"></i><span>'+esc(t)+'</span>'+(done?'<em>'+pc+'%</em>':'')+'</button>';}).join('')+'<small>'+tot+' səs</small></div>';}
function pollVote(id,i){var p=FEED.find(function(x){return x.id===id;});if(p&&p.poll){var v=p.poll.votes=p.poll.votes||{};if(p.poll.myvote!=null)v[p.poll.myvote]=(v[p.poll.myvote]||1)-1;v[i]=(v[i]||0)+1;p.poll.myvote=i;postRedraw(p);}sb.rpc('post_vote',{p_id:id,p_opt:i}).then(function(){},function(){});}
function postRedraw(p){var e=$('post'+p.id);if(e){var d=document.createElement('div');d.innerHTML=postCard(p);e.replaceWith(d.firstChild);}}
/* ---- reaksiyalar ---- */
var _rh=null;
function reactHold(id,el){clearTimeout(_rh);_rh=setTimeout(function(){el._held=1;reactPick(id,el);},450);}
function reactHoldEnd(){clearTimeout(_rh);}
function reactPick(id,el){try{navigator.vibrate&&navigator.vibrate(12);}catch(e){}var r=el.getBoundingClientRect(),o=document.createElement('div');o.className='sorpick';
 o.innerHTML='<div class="sorbg" onclick="this.parentNode.remove()"></div><div class="sorbar" style="left:'+Math.max(8,r.left-10)+'px;top:'+Math.max(10,r.top-64)+'px">'+REACTS.map(function(e,i){return '<button style="animation-delay:'+(i*30)+'ms" onclick="this.closest(\'.sorpick\').remove();feedReact(\''+id+'\',\''+e+'\',true)">'+e+'</button>';}).join('')+'</div>';document.body.appendChild(o);
 setTimeout(function(){el._held=0;},400);}
function feedReact(id,emoji,force){var p=FEED.find(function(x){return x.id===id;});if(!p||p.kind==='kudos')return;var btn=document.querySelector('.sorx[data-id="'+id+'"]');if(btn&&btn._held)return;
 if(force&&p.my===emoji)return;var old=p.my;p.reacts=p.reacts||{};if(old){p.reacts[old]=(p.reacts[old]||1)-1;if(!p.reacts[old])delete p.reacts[old];p.likes--;}
 if(emoji){p.reacts[emoji]=(p.reacts[emoji]||0)+1;p.likes++;p.my=emoji;}else p.my=null;postRedraw(p);
 if(emoji){var e=$('post'+id);if(e){var h=document.createElement('span');h.className='igheart';h.textContent=emoji;h.style.position='absolute';e.style.position='relative';e.appendChild(h);setTimeout(function(){h.remove();},900);}}
 sb.rpc('post_react',{p_id:id,p_emoji:emoji||null}).then(function(){},function(){});}
function postSave(id,on){var p=FEED.find(function(x){return x.id===id;});if(p){p.saved=on;postRedraw(p);}run(sb.rpc('post_save',{p_id:id,p_on:on})).then(function(){toast(on?'🔖 Saxlanıldı':'Saxlanılanlardan çıxarıldı');}).catch(err);}
/* ---- paylaşma ---- */
function postShare(id){var p=FEED.find(function(x){return x.id===id;})||{};var prev=(p.body||'Post').slice(0,80);
 Promise.all([run(sb.rpc('msg_threads')).catch(function(){return [];}),socContacts()]).then(function(r){var th=(r[0]||[]).slice(0,12);
 modal('<div class="mhead"><h3>Paylaş</h3><button class="x" onclick="closeModal()">×</button></div><button class="igmenu" onclick="closeModal();postRepost(\''+id+'\')">🔁 Lentimdə paylaş</button><div class="igsec" style="margin-top:10px">Çata göndər</div><div style="max-height:45vh;overflow-y:auto">'
  +th.map(function(t){return '<div class="igrow" onclick="postToChat(\''+id+'\',\''+t.other+'\','+(t.is_group?1:0)+',this)">'+(t.is_group?grpAva(t.emoji,40):chatAva(t.ad,t.photo,40))+'<div class="igmeta"><div class="igname">'+esc(t.ad)+'</div></div><button class="btn sm">Göndər</button></div>';}).join('')+'</div>');});
 window._shPrev=prev;}
function postToChat(id,to,g,el){var b=el.querySelector('.btn');if(b){b.disabled=true;b.textContent='✓ Göndərildi';}
 run(sb.rpc('msg_send',{p_to:g?null:to,p_group:g?to:null,p_body:'📣 '+window._shPrev+'\nhttps://ofis.pilothayat.az/?post='+id,p_kind:'text'})).catch(err);}
function postRepost(id){var t=prompt('Paylaşıma fikir əlavə et (istəyə görə)','');if(t===null)return;run(sb.rpc('post_add2',{p_body:t||'',p_media:null,p_poll:null,p_club:null,p_mentions:null,p_shared:id})).then(function(){toast('🔁 Paylaşıldı');if(FMODE==='all')feedLoad();}).catch(err);}
function postOpen(id){run(sb.rpc('post_get',{p_id:id})).then(function(p){if(!p){toast('Post tapılmadı');return;}if(!FEED.find(function(x){return x.id===p.id;}))FEED.push(p);modal('<div class="mhead"><h3>Post</h3><button class="x" onclick="closeModal()">×</button></div><div class="sopostm">'+postCard(p)+'</div>');}).catch(err);}
/* ---- post yaratma ---- */
function feedCompose(club){_fpMedia=[];_fpPoll=null;_fpClub=club||null;_ment={};
 modal('<div class="mhead"><h3>Yeni post</h3><button class="x" onclick="closeModal()">×</button></div><textarea id="fpB" rows="4" placeholder="Nə paylaşmaq istəyirsən? @ ilə həmkarı qeyd et, # ilə mövzu əlavə et" style="width:100%"></textarea><div id="fpPrev" class="fpprev"></div><div id="fpPoll"></div>'
  +'<div class="fptools"><button class="btn ghost sm" onclick="feedPickImg()">🖼️ Şəkil/video</button><button class="btn ghost sm" onclick="fpPollToggle()">📊 Sorğu</button><button class="btn ghost sm" onclick="fpTag()">#</button></div>'
  +'<button class="btn" style="width:100%;margin-top:10px" id="fpGo" onclick="feedPost()">Paylaş</button>');var t=$('fpB');mentionBind(t);setTimeout(function(){t.focus();},120);}
function fpTag(){var t=$('fpB');t.value+=(t.value&&!/\s$/.test(t.value)?' ':'')+'#';t.focus();}
function feedPickImg(){var i=document.createElement('input');i.type='file';i.accept='image/*,video/*';i.multiple=true;i.onchange=function(){Array.prototype.slice.call(i.files,0,10-_fpMedia.length).forEach(function(f){if(f.size>25*1024*1024){toast(f.name+': 25MB-dan böyükdür');return;}_fpMedia.push(f);});fpPrev();};i.click();}
function fpPrev(){var el=$('fpPrev');if(!el)return;el.innerHTML=_fpMedia.map(function(f,i){var u=URL.createObjectURL(f);return '<span>'+(/^video/.test(f.type)?'<video src="'+u+'" muted></video>':'<img src="'+u+'">')+'<button onclick="_fpMedia.splice('+i+',1);fpPrev()">×</button></span>';}).join('');}
function fpPollToggle(){var el=$('fpPoll');if(_fpPoll){_fpPoll=null;el.innerHTML='';return;}_fpPoll=1;el.innerHTML='<div class="fppoll"><input id="fpQ" placeholder="Sual" maxlength="120"><input class="fpo" placeholder="Variant 1" maxlength="60"><input class="fpo" placeholder="Variant 2" maxlength="60"><button class="igtxt" onclick="fpAddOpt()">+ Variant</button></div>';}
function fpAddOpt(){var n=document.querySelectorAll('.fpo').length;if(n>=6)return;var i=document.createElement('input');i.className='fpo';i.placeholder='Variant '+(n+1);i.maxLength=60;var b=document.querySelector('.fppoll .igtxt');b.parentNode.insertBefore(i,b);}
function feedPost(){var b=($('fpB').value||'').trim(),poll=null;
 if(_fpPoll){var q=($('fpQ').value||'').trim(),opts=Array.prototype.map.call(document.querySelectorAll('.fpo'),function(x){return x.value.trim();}).filter(Boolean);if(!q||opts.length<2){toast('Sorğu üçün sual və ən azı 2 variant yazın');return;}poll={q:q,opts:opts};}
 if(!b&&!_fpMedia.length&&!poll){toast('Mətn, şəkil və ya sorğu əlavə edin');return;}var g=$('fpGo');g.disabled=true;g.textContent='Yüklənir…';
 Promise.all(_fpMedia.map(function(f){return chatUpload(f,'post').then(function(u){return {url:u,kind:/^video/.test(f.type)?'video':'image'};});})).then(function(media){
  return run(sb.rpc('post_add2',{p_body:b,p_media:media.length?media:null,p_poll:poll,p_club:_fpClub,p_mentions:mentionIds(b),p_shared:null}));
 }).then(function(){closeModal();toast('Paylaşıldı');feedLoad();}).catch(function(e){g.disabled=false;g.textContent='Paylaş';toast(e.message||e);});}
/* ---- şərhlər (zəncirli) ---- */
function feedComments(id){_cParent=null;_ment={};run(sb.rpc('post_comments2',{p_id:id})).then(function(r){r=r||[];window._cmts=r;var top=r.filter(function(c){return !c.parent;}),kids=function(pid){return r.filter(function(c){return c.parent===pid;});};
 var one=function(c,sub){return '<div class="igcm'+(sub?' sub':'')+'">'+chatAva(c.ad,c.photo,sub?26:32)+'<div class="cmb"><div><b onclick="socProfile(\''+c.uid+'\')">'+esc(c.ad)+'</b> '+socText(c.body)+'</div><small>'+chatAgo(c.at)+(c.likes?' · '+c.likes+' bəyənmə':'')+' · <a onclick="cmReply('+(c.parent||c.id)+',\''+chatArg(c.ad)+'\')">Cavab ver</a></small></div><button class="cmlk'+(c.liked?' on':'')+'" onclick="cmLike(\''+id+'\','+c.id+','+(!c.liked)+')">'+(c.liked?'❤️':'🤍')+'</button></div>';};
 modal('<div class="mhead"><h3>Şərhlər</h3><button class="x" onclick="closeModal()">×</button></div><div style="max-height:55vh;overflow-y:auto">'+(top.length?top.map(function(c){return one(c)+kids(c.id).map(function(k){return one(k,1);}).join('');}).join(''):'<p class="hint">İlk şərhi sən yaz</p>')+'</div>'
  +'<div id="cmTo" class="cmto"></div><div class="row" style="gap:6px;margin-top:8px;position:relative"><input id="fcB" placeholder="Şərh yaz… (@ ilə qeyd et)" style="flex:1" onkeydown="if(event.key===\'Enter\')feedComment(\''+id+'\')"><button class="btn" onclick="feedComment(\''+id+'\')">Göndər</button></div>');mentionBind($('fcB'));}).catch(err);}
function cmReply(pid,ad){_cParent=pid;$('cmTo').innerHTML='↩︎ '+esc(ad)+' adlı istifadəçiyə cavab <a onclick="_cParent=null;this.parentNode.innerHTML=\'\'">×</a>';var i=$('fcB');i.value='@'+ad+' ';var c=(window._cmts||[]).find(function(x){return x.ad===ad;});if(c)_ment[ad]=c.uid;i.focus();}
function cmLike(pid,cid,on){run(sb.rpc('comment_like',{p_id:cid,p_on:on})).then(function(){feedComments(pid);}).catch(err);}
function feedComment(id){var b=($('fcB').value||'').trim();if(!b)return;run(sb.rpc('post_comment2',{p_id:id,p_body:b,p_parent:_cParent,p_mentions:mentionIds(b)})).then(function(){var p=FEED.find(function(x){return x.id===id;});if(p){p.comments=(p.comments||0)+1;postRedraw(p);}feedComments(id);}).catch(err);}
function feedMenu(id){var p=FEED.find(function(x){return x.id===id;})||{};modal('<div class="mhead"><h3>Post</h3><button class="x" onclick="closeModal()">×</button></div>'
 +'<button class="igmenu" onclick="closeModal();postSave(\''+id+'\','+(!p.saved)+')">'+(p.saved?'🔖 Saxlanılanlardan çıxar':'🔖 Saxla')+'</button><button class="igmenu" onclick="closeModal();postShare(\''+id+'\')">↗︎ Paylaş</button>'
 +(typeof MGR!=='undefined'&&MGR?'<button class="igmenu" onclick="feedPin(\''+id+'\','+(!p.pinned)+')">'+(p.pinned?'📌 Sabitdən çıxar':'📌 Yuxarıda sabitlə')+'</button>':'')
 +((p.mine||(typeof MGR!=='undefined'&&MGR))?'<button class="igmenu" style="color:#ed4956" onclick="feedDel(\''+id+'\')">🗑️ Sil</button>':''));}
/* ---- bildirişlər ---- */
function notifCount(){sb.rpc('notif_unread').then(function(r){NOTIF_N=r.data||0;var b=$('soBell');if(b){b.textContent=NOTIF_N;b.style.display=NOTIF_N?'':'none';}
 var t=document.querySelector('#tabs button[data-v="feed"]');if(t){var want='📣 Lent'+(NOTIF_N?' <span class="tabbadge">'+NOTIF_N+'</span>':'');if(t.innerHTML!==want)t.innerHTML=want;}},function(){});}
function notifOpen(){run(sb.rpc('notif_list')).then(function(r){r=r||[];var ic={react:'❤️',comment:'💬',reply:'↩︎',mention:'@',follow:'👤',share:'🔁',clike:'❤️',event:'📅',story:'📸'};
 modal('<div class="mhead"><h3>Bildirişlər</h3><button class="x" onclick="closeModal()">×</button></div><div style="max-height:65vh;overflow-y:auto">'+(r.length?r.map(function(n){var a=n.actor||{};
  return '<div class="sonotif'+(n.read?'':' un')+'" onclick="closeModal();'+(n.post&&n.kind!=='story'?'postOpen(\''+n.post+'\')':n.kind==='follow'?'socProfile(\''+a.uid+'\')':n.kind==='event'?'feedMode(\'events\')':'')+'"><span class="soni">'+chatAva(a.ad,a.photo,40)+'<i>'+(ic[n.kind]||'🔔')+'</i></span><div><b>'+esc(a.ad||'Baş Ofis')+'</b> '+esc(n.text)+'<small>'+chatAgo(n.at)+'</small></div></div>';}).join(''):'<p class="hint">Hələ bildiriş yoxdur</p>')+'</div>');
 sb.rpc('notif_read_all').then(function(){NOTIF_N=0;notifCount();},function(){});}).catch(err);}
/* ---- profil ---- */
function socProfile(uid){if(!uid||uid==='undefined')return;Promise.all([run(sb.rpc('soc_profile',{p_uid:uid})),run(sb.rpc('feed2',{p_mode:'user',p_arg:uid,p_before:null}))]).then(function(r){var p=r[0]||{},posts=r[1]||[];if(!p.ad)return;window._prof=p;
 posts.forEach(function(x){if(!FEED.find(function(y){return y.id===x.id;}))FEED.push(x);});
 var yrs=p.hire?Math.floor((Date.now()-new Date(p.hire))/31557600000):0;
 var grid=posts.filter(function(x){return x.kind==='post';}).map(function(x){var m=x.media&&x.media[0],img=m?m.url:x.image;return '<button onclick="postOpen(\''+x.id+'\')">'+(img?(m&&m.kind==='video'?'<video src="'+esc(img)+'" muted></video><i>▶︎</i>':'<img src="'+esc(img)+'">'):'<span>'+esc((x.body||'').slice(0,60))+'</span>')+'</button>';}).join('');
 modal('<div class="soprof"><div class="socover" style="'+(p.cover?'background-image:url('+esc(p.cover)+')':'')+'"><button class="x" onclick="closeModal()">×</button></div><div class="sopav">'+chatAva(p.ad,p.photo,88)+'</div>'
  +'<h3>'+esc(p.ad)+'</h3><div class="muted">'+esc(p.vezife||'')+(yrs>=1?' · '+yrs+' il komandada':'')+(p.bday?' · 🎂 '+p.bday:'')+'</div>'+(p.bio?'<p class="sobio">'+esc(p.bio)+'</p>':'')
  +(p.interests&&p.interests.length?'<div class="sochips">'+p.interests.map(function(i){return '<span>'+esc(i)+'</span>';}).join('')+'</div>':'')
  +'<div class="sostats"><div><b>'+p.posts+'</b>post</div><div><b>'+p.followers+'</b>izləyici</div><div><b>'+p.following+'</b>izləyir</div><div><b>'+p.kudos+'</b>təşəkkür</div></div>'
  +(p.badges&&p.badges.length?'<div class="sobadges">'+p.badges.map(function(b){var i=badgeInfo(b);return '<span title="'+esc(i[1])+'">'+i[0]+'<small>'+esc(i[1])+'</small></span>';}).join('')+'</div>':'')
  +'<div class="soact">'+(p.me?'<button class="btn ghost" onclick="profEdit()">Profili redaktə et</button><button class="btn ghost" onclick="closeModal();storyPick()">➕ Hekayə</button>'
   :'<button class="btn '+(p.ifollow?'ghost':'')+'" onclick="socFollow(\''+uid+'\','+(!p.ifollow)+')">'+(p.ifollow?'İzləyirsən ✓':'İzlə')+'</button><button class="btn ghost" onclick="closeModal();show(\'chat\');chatOpen(\''+uid+'\',\''+chatArg(p.ad)+'\')">Mesaj</button><button class="btn ghost" onclick="closeModal();var e=(typeof EMPS!==\'undefined\'?EMPS:[]).find(function(x){return x.user_id===\''+uid+'\';});if(e&&typeof openKudos===\'function\')openKudos(e.id)">🙌</button>')+'</div>'
  +'<div class="sogrid">'+(grid||'<p class="hint" style="grid-column:1/-1;text-align:center">Hələ post yoxdur</p>')+'</div></div>');}).catch(err);}
function socFollow(uid,on){run(sb.rpc('soc_follow',{p_uid:uid,p_on:on})).then(function(){toast(on?'İzləyirsən':'İzləmə dayandırıldı');socProfile(uid);}).catch(err);}
function profEdit(){var p=window._prof||{};modal('<div class="mhead"><h3>Profil</h3><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Haqqımda</label><textarea id="peB" maxlength="300">'+esc(p.bio||'')+'</textarea></div><div class="field"><label>Maraqlar (vergüllə)</label><input id="peI" value="'+esc((p.interests||[]).join(', '))+'" placeholder="futbol, dizayn, kitab"></div><button class="btn ghost" style="width:100%" onclick="profCover()">🖼️ Örtük şəkli seç</button><div id="peC" class="hint"></div><button class="btn" style="width:100%;margin-top:10px" onclick="profSave()">Yadda saxla</button>');}
var _peCover=null;function profCover(){var i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=function(){_peCover=i.files[0];$('peC').textContent=_peCover?'✓ '+_peCover.name:'';};i.click();}
function profSave(){var bio=$('peB').value.trim(),ints=$('peI').value.split(',').map(function(x){return x.trim();}).filter(Boolean).slice(0,10);
 (_peCover?chatUpload(_peCover,'cover'):Promise.resolve(null)).then(function(u){_peCover=null;return run(sb.rpc('soc_profile_set',{p_bio:bio,p_cover:u,p_interests:ints}));}).then(function(){toast('Yadda saxlanıldı');socProfile(ME.user_id);}).catch(err);}
/* ---- tədbirlər ---- */
function evRender(){run(sb.rpc('ev_list')).then(function(l){l=l||[];var b=$('soBody');if(!b||FMODE!=='events')return;var M=['yan','fev','mar','apr','may','iyn','iyl','avq','sen','okt','noy','dek'];
 b.innerHTML='<button class="btn" style="width:100%;margin-bottom:12px" onclick="evNew()">+ Tədbir yarat</button>'+(l.length?l.map(function(e){var d=new Date(e.at);
  return '<div class="igpost soev">'+(e.cover?'<img class="igpi" src="'+esc(e.cover)+'">':'')+'<div class="soevb"><div class="soevd"><b>'+d.getDate()+'</b><span>'+M[d.getMonth()]+'</span></div><div style="flex:1;min-width:0"><h3>'+esc(e.title)+'</h3><div class="muted small">🕒 '+d.toLocaleTimeString('az-AZ',{hour:'2-digit',minute:'2-digit'})+(e.place?' · 📍 '+esc(e.place):'')+'</div>'+(e.body?'<p class="small" style="margin-top:6px">'+esc(e.body)+'</p>':'')
  +'<div class="soevf">'+(e.faces||[]).map(function(f){return chatAva(f.ad,f.photo,24);}).join('')+'<span>'+e.going+' gəlir'+(e.maybe?' · '+e.maybe+' bəlkə':'')+'</span></div></div></div>'
  +'<div class="sorsvp">'+[['yes','✅ Gəlirəm'],['maybe','🤔 Bəlkə'],['no','❌ Gəlmirəm']].map(function(s){return '<button class="'+(e.my===s[0]?'on':'')+'" onclick="evRsvp(\''+e.id+'\',\''+s[0]+'\')">'+s[1]+'</button>';}).join('')+'</div>'
  +'<div class="igpa"><button onclick="evIcs(\''+e.id+'\')">📅 Təqvimə əlavə et</button>'+(e.mine||(typeof MGR!=='undefined'&&MGR)?'<button onclick="evDel(\''+e.id+'\')">🗑️</button>':'')+'</div></div>';}).join(''):'<div class="igempty"><b>Yaxın tədbir yoxdur</b><div>Korporativ, futbol və ya ad günü masası təşkil et</div></div>');window._evs=l;}).catch(err);}
function evNew(){modal('<div class="mhead"><h3>Yeni tədbir</h3><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Ad</label><input id="evT" maxlength="120" placeholder="Cümə futbolu"></div><div class="field"><label>Tarix və saat</label><input id="evD" type="datetime-local"></div><div class="field"><label>Yer</label><input id="evP" placeholder="Ofis, iclas zalı…"></div><div class="field"><label>Təsvir</label><textarea id="evB"></textarea></div><button class="btn ghost" style="width:100%" onclick="evCoverPick()">🖼️ Örtük şəkli</button><div id="evC" class="hint"></div><button class="btn" style="width:100%;margin-top:10px" onclick="evSave()">Yarat və hamıya bildir</button>');}
var _evCover=null;function evCoverPick(){var i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=function(){_evCover=i.files[0];$('evC').textContent=_evCover?'✓ '+_evCover.name:'';};i.click();}
function evSave(){var t=$('evT').value.trim(),d=$('evD').value;if(!t||!d){toast('Ad və tarix lazımdır');return;}
 (_evCover?chatUpload(_evCover,'event'):Promise.resolve(null)).then(function(u){_evCover=null;return run(sb.rpc('ev_add',{p_title:t,p_body:$('evB').value.trim()||null,p_at:new Date(d).toISOString(),p_place:$('evP').value.trim()||null,p_cover:u}));}).then(function(){closeModal();toast('Tədbir yaradıldı');evRender();}).catch(err);}
function evRsvp(id,s){run(sb.rpc('ev_rsvp',{p_id:id,p_status:s})).then(evRender).catch(err);}
function evDel(id){if(!confirm('Tədbir silinsin?'))return;run(sb.rpc('ev_delete',{p_id:id})).then(evRender).catch(err);}
function evIcs(id){var e=(window._evs||[]).find(function(x){return x.id===id;});if(!e)return;var f=function(d){return new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');};var s=new Date(e.at),en=new Date(s.getTime()+2*3600000);
 var ics='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Bas Ofis//AZ\r\nBEGIN:VEVENT\r\nUID:'+id+'@ofis\r\nDTSTAMP:'+f(new Date())+'\r\nDTSTART:'+f(s)+'\r\nDTEND:'+f(en)+'\r\nSUMMARY:'+e.title.replace(/[,;]/g,' ')+'\r\nLOCATION:'+(e.place||'').replace(/[,;]/g,' ')+'\r\nEND:VEVENT\r\nEND:VCALENDAR';
 var a=document.createElement('a');a.href='data:text/calendar;charset=utf-8,'+encodeURIComponent(ics);a.download='tedbir.ics';document.body.appendChild(a);a.click();a.remove();}
/* ---- klublar ---- */
function clubRender(){run(sb.rpc('club_list')).then(function(l){l=l||[];var b=$('soBody');if(!b||FMODE!=='clubs')return;
 b.innerHTML='<button class="btn" style="width:100%;margin-bottom:12px" onclick="clubNew()">+ Klub yarat</button><div class="soclubs">'+(l.length?l.map(function(c){return '<div class="soclub" onclick="feedMode(\'club\',\''+c.id+'\')"><span class="soce">'+esc(c.emoji)+'</span><b>'+esc(c.name)+'</b><small>'+c.members+' üzv · '+c.posts+' post</small>'+(c.about?'<p>'+esc(c.about)+'</p>':'')+'<button class="btn sm '+(c.joined?'ghost':'')+'" onclick="event.stopPropagation();clubJoin(\''+c.id+'\','+(!c.joined)+')">'+(c.joined?'Üzvsən ✓':'Qoşul')+'</button></div>';}).join(''):'<div class="igempty" style="grid-column:1/-1"><b>Hələ klub yoxdur</b><div>⚽ Futbol, 📚 Kitab, 🎮 Oyun… ilk klubu sən yarat</div></div>')+'</div>';}).catch(err);}
function clubNew(){modal('<div class="mhead"><h3>Yeni klub</h3><button class="x" onclick="closeModal()">×</button></div><div class="row" style="gap:6px"><input id="clE" value="⚽" maxlength="4" style="width:58px;text-align:center;font-size:1.3rem"><input id="clN" placeholder="Klubun adı" maxlength="60" style="flex:1"></div><div class="field" style="margin-top:10px"><label>Haqqında</label><textarea id="clA" maxlength="300"></textarea></div><button class="btn" style="width:100%" onclick="clubSave()">Yarat</button>');}
function clubSave(){var n=$('clN').value.trim();if(!n){toast('Ad yazın');return;}run(sb.rpc('club_add',{p_name:n,p_emoji:$('clE').value.trim(),p_about:$('clA').value.trim()})).then(function(id){closeModal();feedMode('club',id);}).catch(err);}
function clubJoin(id,on){run(sb.rpc('club_join',{p_id:id,p_on:on})).then(function(){toast(on?'Kluba qoşuldun':'Klubdan çıxdın');if(FMODE==='clubs')clubRender();else feedMode('club',id);}).catch(err);}
/* ---- albomlar ---- */
function albumRender(){run(sb.rpc('album_list')).then(function(l){l=l||[];var b=$('soBody');if(!b||FMODE!=='albums')return;
 b.innerHTML='<button class="btn" style="width:100%;margin-bottom:12px" onclick="albumNew()">+ Albom yarat</button><div class="soalbums">'+(l.length?l.map(function(a){return '<button onclick="albumOpen(\''+a.id+'\',\''+chatArg(a.title)+'\')"><span>'+(a.cover?'<img src="'+esc(a.cover)+'">':'🖼️')+'</span><b>'+esc(a.title)+'</b><small>'+a.n+' foto</small></button>';}).join(''):'<div class="igempty" style="grid-column:1/-1"><b>Albom yoxdur</b><div>Tədbir şəkillərini bir yerdə topla</div></div>')+'</div>';}).catch(err);}
function albumNew(){var t=prompt('Albomun adı (məs. Novruz 2027)');if(!t)return;run(sb.rpc('album_add',{p_title:t})).then(function(id){albumOpen(id,t);}).catch(err);}
function albumOpen(id,title){run(sb.rpc('album_photos',{p_id:id})).then(function(ph){ph=ph||[];modal('<div class="mhead"><h3>'+esc(title)+'</h3><button class="x" onclick="closeModal()">×</button></div><button class="btn" style="width:100%;margin-bottom:10px" id="alUp" onclick="albumUp(\''+id+'\',\''+chatArg(title)+'\')">📷 Şəkil əlavə et</button><div class="sogrid">'+(ph.length?ph.map(function(x){return x.kind==='video'?'<button><video src="'+esc(x.url)+'" controls playsinline></video></button>':'<button onclick="chatViewImage(\''+esc(x.url)+'\')"><img src="'+esc(x.url)+'"></button>';}).join(''):'<p class="hint" style="grid-column:1/-1;text-align:center">Albom boşdur, ilk şəkli sən əlavə et</p>')+'</div>');}).catch(err);}
function albumUp(id,title){var i=document.createElement('input');i.type='file';i.accept='image/*,video/*';i.multiple=true;i.onchange=function(){var fs=Array.prototype.slice.call(i.files,0,30);if(!fs.length)return;var b=$('alUp');if(b){b.disabled=true;b.textContent='Yüklənir… 0/'+fs.length;}var done=0;
 Promise.all(fs.map(function(f){return chatUpload(f,'album').then(function(u){done++;if(b)b.textContent='Yüklənir… '+done+'/'+fs.length;return {url:u,kind:/^video/.test(f.type)?'video':'image'};});})).then(function(urls){return run(sb.rpc('album_put',{p_id:id,p_urls:urls}));}).then(function(){toast('Əlavə edildi');albumOpen(id,title);}).catch(err);};i.click();}
/* ---- kəşf ---- */
function exploreRender(){Promise.all([run(sb.rpc('soc_explore')),run(sb.rpc('bday_upcoming')).catch(function(){return [];})]).then(function(r){var x=r[0]||{},bd=r[1]||[],b=$('soBody');if(!b||FMODE!=='explore')return;
 var h='';
 if(x.tags&&x.tags.length)h+='<div class="igsec">🔥 Trend mövzular</div><div class="sochips">'+x.tags.map(function(t){return '<span onclick="feedMode(\'tag\',\''+esc(t)+'\')">#'+esc(t)+'</span>';}).join('')+'</div>';
 if(x.moment&&x.moment.likes>0)h+='<div class="igsec">✨ Həftənin anı</div><div class="sopostm">'+postCard(x.moment)+'</div>',FEED.push(x.moment);
 h+='<div class="igsec row sp"><span>📸 Populyar</span><button class="igtxt" onclick="feedMode(\'video\')">🎬 Videolar</button></div><div class="sogrid">'+((x.popular||[]).map(function(p){return '<button onclick="postOpen(\''+p.id+'\')">'+(p.kind==='video'?'<video src="'+esc(p.img)+'" muted></video><i>▶︎</i>':'<img src="'+esc(p.img)+'">')+'</button>';}).join('')||'<p class="hint" style="grid-column:1/-1">Hələ şəkilli post yoxdur</p>')+'</div>';
 if(bd.length)h+='<div class="igsec">🎂 Yaxınlaşan ad günləri</div>'+bd.map(function(u){return '<div class="igrow">'+chatAva(u.ad,u.photo,44)+'<div class="igmeta"><div class="igname">'+esc(u.ad)+'</div><div class="iglast">'+esc(u.date)+' · '+(u.in===0?'<b style="color:#e11d48">Bu gün! 🎉</b>':u.in+' gün qalıb')+'</div></div>'+(u.uid!==ME.user_id?'<button class="btn sm ghost" onclick="show(\'chat\');chatOpen(\''+u.uid+'\',\''+chatArg(u.ad)+'\')">'+(u.in===0?'Təbrik et':'Mesaj')+'</button>':'')+'</div>';}).join('');
 h+='<div class="igsec">👥 Həmkarlar</div>'+(x.people||[]).map(function(u){return '<div class="igrow">'+chatAva(u.ad,u.photo,44,u.uid)+'<div class="igmeta" onclick="socProfile(\''+u.uid+'\')"><div class="igname">'+esc(u.ad)+(u.new?' <span class="pill p-acc">yeni</span>':'')+'</div><div class="iglast">'+esc(u.vezife||'')+'</div></div><button class="btn sm '+(u.ifollow?'ghost':'')+'" onclick="socFollow2(\''+u.uid+'\','+(!u.ifollow)+',this)">'+(u.ifollow?'İzləyirsən':'İzlə')+'</button></div>';}).join('');
 b.innerHTML=h;}).catch(err);}
function socFollow2(uid,on,el){el.disabled=true;run(sb.rpc('soc_follow',{p_uid:uid,p_on:on})).then(function(){el.disabled=false;el.textContent=on?'İzləyirsən':'İzlə';el.classList.toggle('ghost',on);el.setAttribute('onclick','socFollow2(\''+uid+'\','+(!on)+',this)');}).catch(err);}
/* ---- videolar: tam ekran (Reels) ---- */
function reelsOpen(list,start){var o=document.createElement('div');o.id='soReels';o.innerHTML='<button class="rx" onclick="this.parentNode.remove();document.body.classList.remove(\'incall\')">✕</button>'+list.map(function(v){return '<section><video src="'+esc(v.url)+'" playsinline loop></video><div class="rcap"><b>'+esc(v.ad||'')+'</b><p>'+esc(v.body||'')+'</p></div></section>';}).join('');document.body.appendChild(o);document.body.classList.add('incall');
 var io=new IntersectionObserver(function(es){es.forEach(function(e){var vd=e.target.querySelector('video');if(e.isIntersecting)vd.play().catch(function(){});else vd.pause();});},{threshold:.6});Array.prototype.forEach.call(o.querySelectorAll('section'),function(s){io.observe(s);s.onclick=function(){var v=s.querySelector('video');v.muted=!v.muted;};});
 if(start)o.children[start+1].scrollIntoView();}
/* ---- hekayə stikerləri ---- */
var _stoStk=null;
function storyPick(){var i=document.createElement('input');i.type='file';i.accept='image/*,video/*';i.onchange=function(){var f=i.files[0];if(!f)return;if(f.size>25*1024*1024){toast('Fayl 25MB-dan kiçik olmalıdır');return;}_stoStk=null;
 var vid=/^video\//.test(f.type),u=URL.createObjectURL(f);
 modal('<div class="mhead"><h3>Hekayə</h3><button class="x" onclick="closeModal()">×</button></div><div style="border-radius:14px;overflow:hidden;background:#000;max-height:45vh;display:flex;justify-content:center">'+(vid?'<video src="'+u+'" style="max-height:45vh;max-width:100%" autoplay muted loop playsinline></video>':'<img src="'+u+'" style="max-height:45vh;max-width:100%;object-fit:contain">')+'</div><input id="stoCap" placeholder="Yazı (istəyə görə)" maxlength="200" style="width:100%;margin-top:10px">'
  +'<div class="fptools"><button class="btn ghost sm" onclick="stoStk(\'poll\')">📊 Sorğu stikeri</button><button class="btn ghost sm" onclick="stoStk(\'q\')">❓ Sual stikeri</button></div><div id="stoStkF"></div><button class="btn" id="stoGo" style="width:100%;margin-top:10px">Paylaş · 24 saat</button>');
 $('stoGo').onclick=function(){var st=null;if(_stoStk==='poll'){var q=$('skQ').value.trim(),a=$('skA').value.trim()||'Bəli',b=$('skB').value.trim()||'Xeyr';if(q)st={type:'poll',q:q,opts:[a,b]};}else if(_stoStk==='q'){var q2=$('skQ').value.trim();if(q2)st={type:'q',q:q2};}
  this.disabled=true;this.textContent='Yüklənir…';chatUpload(f,'story').then(function(url){return run(sb.rpc('story_add2',{p_url:url,p_kind:vid?'video':'image',p_caption:$('stoCap').value.trim()||null,p_sticker:st}));}).then(function(){closeModal();toast('Hekayə paylaşıldı');storyLoad();}).catch(function(e){toast('Alınmadı: '+(e.message||e));});};};i.click();}
function stoStk(t){_stoStk=t;$('stoStkF').innerHTML=t==='poll'?'<div class="fppoll"><input id="skQ" placeholder="Sual: Cümə nahar harada?"><input id="skA" placeholder="Variant 1"><input id="skB" placeholder="Variant 2"></div>':'<div class="fppoll"><input id="skQ" placeholder="Sual: Bu həftə nəyi öyrəndin?"></div>';}
var _storyShow0=storyShow;
storyShow=function(){_storyShow0();if(!_sv)return;var u=CHAT_STORIES[_sv.ui],it=u&&u.items[_sv.ii];if(!it||!it.st)return;var el=$('igSV'),s=it.st,d=document.createElement('div');d.className='svstk';
 if(u.me){d.innerHTML='<b>'+esc(s.q)+'</b><button onclick="storyRes(\''+it.id+'\')">📊 Cavablara bax</button>';}
 else if(s.type==='poll'){d.innerHTML='<b>'+esc(s.q)+'</b>'+s.opts.map(function(o){return '<button class="'+(it.ans===o?'on':'')+'" onclick="storyAns(\''+it.id+'\',\''+chatArg(o)+'\',this)">'+esc(o)+'</button>';}).join('');}
 else d.innerHTML='<b>'+esc(s.q)+'</b>'+(it.ans?'<p>✓ Cavabın: '+esc(it.ans)+'</p>':'<div class="row" style="gap:6px"><input id="svA" placeholder="Cavab yaz…" onfocus="clearInterval(_sv&&_sv.t)"><button onclick="storyAns(\''+it.id+'\',$(\'svA\').value,this)">Göndər</button></div>');
 el.appendChild(d);};
function storyAns(id,a,el){a=(a||'').trim();if(!a)return;var it=CHAT_STORIES[_sv.ui].items[_sv.ii];it.ans=a;run(sb.rpc('story_answer',{p_id:id,p_answer:a})).then(function(r){var box=el.closest('.svstk');if(box&&it.st.type==='poll'){var tot=0;Object.keys(r||{}).forEach(function(k){tot+=r[k];});box.innerHTML='<b>'+esc(it.st.q)+'</b>'+it.st.opts.map(function(o){var pc=tot?Math.round((r[o]||0)*100/tot):0;return '<div class="svbar'+(o===a?' on':'')+'"><i style="width:'+pc+'%"></i><span>'+esc(o)+'</span><em>'+pc+'%</em></div>';}).join('');}else if(box)box.innerHTML='<b>'+esc(it.st.q)+'</b><p>✓ Göndərildi</p>';}).catch(err);}
function storyRes(id){clearInterval(_sv&&_sv.t);run(sb.rpc('story_results',{p_id:id})).then(function(r){r=r||[];var d=document.createElement('div');d.className='svlist';d.innerHTML='<div class="row sp"><b>Cavablar ('+r.length+')</b><button class="igtxt" onclick="this.parentNode.parentNode.remove();storyShow()">Bağla</button></div>'+(r.length?r.map(function(v){return '<div class="igrow">'+chatAva(v.ad,v.photo,36)+'<div class="igmeta"><div class="igname">'+esc(v.ad)+'</div><div class="iglast">'+esc(v.a)+'</div></div></div>';}).join(''):'<p class="hint">Hələ cavab yoxdur</p>');$('igSV').appendChild(d);}).catch(err);}
/* ---- canlı bildiriş, dərin link ---- */
(function socLive(){var go=function(){if(typeof ME==='undefined'||!ME||!ME.user_id||typeof sb==='undefined'){setTimeout(go,1500);return;}
 notifCount();setInterval(function(){if(document.visibilityState==='visible')notifCount();},30000);
 try{sb.channel('nt-'+ME.user_id).on('postgres_changes',{event:'INSERT',schema:'public',table:'office_notifs',filter:'user_id=eq.'+ME.user_id},function(p){notifCount();var n=p.new;if(n&&typeof chatBannerRaw==='function')chatWho(n.actor).then(function(a){chatBannerRaw(a.ad||'Bildiriş',n.text,a,function(){notifOpen();});});}).subscribe();}catch(e){}
 var q=new URLSearchParams(location.search),pid=q.get('post');if(pid){try{history.replaceState(history.state,'',location.pathname);}catch(e){}setTimeout(function(){show('feed');postOpen(pid);},600);}};setTimeout(go,1500);})();
/* çatda ?post= linkini kart kimi göstər */
var _chatDraw0=chatDrawMsgs;
chatDrawMsgs=function(rows){_chatDraw0(rows);(rows||[]).forEach(function(m){if(m.deleted||!m.body)return;var mm=/https:\/\/ofis\.pilothayat\.az\/\?post=([0-9a-f-]{36})/.exec(m.body);if(!mm)return;var b=$('msg'+m.id);if(!b)return;var sp=b.querySelector('.msgbody');if(sp)sp.innerHTML=esc(m.body.replace(mm[0],'').trim())+'<button class="sopostlink" onclick="event.stopPropagation();show(\'feed\');postOpen(\''+mm[1]+'\')">📣 Posta bax</button>';});};
/* video postlarda Reels rejimi */
var _feedDraw0=feedDraw;
feedDraw=function(){_feedDraw0();if(FMODE!=='video')return;var el=$('igPosts');var vids=[];FEED.forEach(function(p){(p.media||[]).forEach(function(m){if(m.kind==='video')vids.push({url:m.url,ad:p.author&&p.author.ad,body:p.body});});});
 if(vids.length)el.insertAdjacentHTML('afterbegin','<button class="btn" style="width:100%;margin-bottom:12px" onclick="reelsOpen(window._vids,0)">▶︎ Tam ekran izlə ('+vids.length+')</button>');window._vids=vids;};


;

/* ===== "GÜN İŞIĞI": fon + mobil dock ===== */
var DK_ICO={
 today:'<path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/><circle cx="12" cy="12" r="4"/>',
 boss:'<path d="M3 20h18M6 16V9M11 16V5M16 16v-6M21 16v-3"/>',
 chat:'<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.6A8.5 8.5 0 1 1 21 11.5z"/>',
 feed:'<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M8 9h8M8 13h8M8 17h5"/>',
 tasks:'<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M8 12.5l2.6 2.6L16.5 9"/>',
 plans:'<rect x="3.5" y="5" width="17" height="15.5" rx="4"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 panel:'<rect x="3.5" y="3.5" width="7" height="9" rx="2"/><rect x="13.5" y="3.5" width="7" height="5" rx="2"/><rect x="13.5" y="11.5" width="7" height="9" rx="2"/><rect x="3.5" y="15.5" width="7" height="5" rx="2"/>',
 remind:'<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
 leads:'<path d="M4 6.5l8 6 8-6"/><rect x="3" y="5" width="18" height="14" rx="3.5"/>',
 leave:'<path d="M14 3.5H7a2.5 2.5 0 0 0-2.5 2.5v12A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5V9z"/><path d="M14 3.5V9h5.5M8.5 13.5h7M8.5 17h4"/>',
 dir:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M16.5 14.6c2.3.2 4 1.7 4.5 4.4"/>',
 news:'<path d="M4 9.5v5l3 .5 8.5 4.5V4.5L7 9z"/><path d="M7 15l1.2 4.5h2.3L9.5 15.4"/><path d="M19 9.5a3 3 0 0 1 0 5"/>',
 cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="4"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/>',
 docs:'<path d="M7 3.5h7l5.5 5.5v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13.5a2 2 0 0 1 2-2z"/><path d="M14 3.5V9h5.5"/>',
 me:'<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"/>',
 asst:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
 oprofil:'<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"/>',
 staff:'<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><path d="M17 7v6M14 10h6"/>',
 team:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
 set:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.2V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.1 14H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
 more:'<circle cx="6" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18" cy="12" r="1.6" fill="currentColor"/>'
};
function dkIcon(k){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(DK_ICO[k]||DK_ICO.docs)+'</svg>';}
function dkLabel(t){return String(t||'').replace(/<[^>]*>/g,'').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,'').replace(/\d+$/,'').trim();}
function todTick(){var h=+new Date().toLocaleString('en-GB',{timeZone:'Asia/Baku',hour:'2-digit',hour12:false});var t=h>=6&&h<10?'dawn':h>=10&&h<17?'day':h>=17&&h<20?'dusk':'night';
 ['dawn','day','dusk','night'].forEach(function(x){document.body.classList.toggle('tod-'+x,x===t);});}
function dkTabs(){return Array.prototype.map.call(document.querySelectorAll('#tabs button'),function(b){var bd=b.querySelector('.tabbadge');return {v:b.dataset.v,l:dkLabel(b.textContent),on:b.classList.contains('on'),n:bd?bd.textContent:''};});}
function dkPrimary(tabs){var want=[tabs[0]&&tabs[0].v,'chat','feed','tasks','plans','dir','me'],out=[];want.forEach(function(v){if(out.length<4&&v&&tabs.some(function(t){return t.v===v;})&&out.indexOf(v)<0)out.push(v);});return out;}
function dkBuild(){var d=$('dock');if(!d){d=document.createElement('nav');d.id='dock';d.setAttribute('aria-label','Əsas menyu');document.body.appendChild(d);}
 var tabs=dkTabs();if(!tabs.length){d.style.display='none';return;}d.style.display='';
 var prim=dkPrimary(tabs),cur=(tabs.find(function(t){return t.on;})||{}).v,inMore=cur&&prim.indexOf(cur)<0;
 var items=prim.map(function(v){return tabs.find(function(t){return t.v===v;});});
 var moreN=tabs.filter(function(t){return prim.indexOf(t.v)<0&&t.n;}).length;
 d.innerHTML='<span class="dkpill"></span>'+items.map(function(t){return '<button class="dk'+(t.v===cur?' on':'')+'" data-v="'+t.v+'" onclick="dkGo(\''+t.v+'\')">'+dkIcon(t.v)+'<span>'+esc(t.l)+'</span>'+(t.n?'<b class="dkb">'+esc(t.n)+'</b>':'')+'</button>';}).join('')
  +'<button class="dk'+(inMore?' on':'')+'" data-v="__more" onclick="dkMore()">'+dkIcon('more')+'<span>Daha</span>'+(moreN?'<b class="dkb">•</b>':'')+'</button>';
 dkPill();}
function dkPill(){var d=$('dock');if(!d)return;var on=d.querySelector('.dk.on'),p=d.querySelector('.dkpill');if(!p)return;if(!on){p.style.width='0';return;}p.style.left=on.offsetLeft+'px';p.style.width=on.offsetWidth+'px';}
function dkGo(v){try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}if(typeof CHATother!=='undefined'&&CHATother&&v==='chat'){chatBack();return;}show(v);}
function dkMore(){var tabs=dkTabs(),prim=dkPrimary(tabs);
 modal('<div class="mhead"><h3>Bölmələr</h3><button class="x" onclick="closeModal()">×</button></div><div class="dkgrid">'+tabs.filter(function(t){return prim.indexOf(t.v)<0;}).map(function(t){return '<button class="'+(t.on?'on':'')+'" onclick="closeModal();dkGo(\''+t.v+'\')">'+dkIcon(t.v)+'<span>'+esc(t.l)+'</span></button>';}).join('')+'</div>');}
function meAvaInit(){var t=document.querySelector('.top');if(!t||$('meAva'))return;var b=document.createElement('button');b.id='meAva';b.setAttribute('aria-label','Profil');b.onclick=meSheet;t.appendChild(b);meAvaUpd();}
function meAvaUpd(){var b=$('meAva'),mb=$('meBox');if(!b||!mb)return;var n=(mb.querySelector('b')||{}).textContent||'';b.textContent=n.split(' ').map(function(w){return w[0]||'';}).slice(0,2).join('').toUpperCase()||'•';}
function meSheet(){var mb=$('meBox'),n=(mb.querySelector('b')||{}).textContent||'',role=mb.textContent.replace(n,'').trim(),inst=$('instBtn'),has=function(v){return !!document.querySelector('#tabs button[data-v="'+v+'"]');};
 modal('<div class="mesheet"><div class="av">'+esc($('meAva').textContent)+'</div><b>'+esc(n)+'</b><span>'+esc(role)+'</span></div><div class="melist">'
  +(has('me')?'<button onclick="closeModal();show(\'me\')">Profilim<span>›</span></button>':'')
  +(has('oprofil')?'<button onclick="closeModal();show(\'oprofil\')">Profilim<span>›</span></button>':'')
  +'<button onclick="closeModal();statusPick&&statusPick()">Status<span>›</span></button>'
  +(inst&&inst.style.display!=='none'?'<button onclick="closeModal();$(\'instBtn\').click()">Tətbiqi quraşdır<span>›</span></button>':'')
  +'<button class="red" onclick="closeModal();$(\'outBtn\').click()">Çıxış</button></div>');}
function glassInit(){meAvaInit();var mbx=$('meBox');if(mbx&&window.MutationObserver)new MutationObserver(meAvaUpd).observe(mbx,{childList:true,subtree:true});if(!$('ambient')){var a=document.createElement('div');a.id='ambient';document.body.insertBefore(a,document.body.firstChild);}
 todTick();setInterval(todTick,60000);
 var tb=$('tabs');if(tb&&window.MutationObserver){var t=null;new MutationObserver(function(){clearTimeout(t);t=setTimeout(dkBuild,30);}).observe(tb,{childList:true,subtree:true,attributes:true,attributeFilter:['class'],characterData:true});}
 dkBuild();window.addEventListener('resize',dkPill);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',glassInit);else glassInit();


;

/* ===================== SOSİAL v3: 20 yeni funksiya ===================== */
var SOC_MOD=false,SOC_X=null,_fpDraft=null,_fpChal=null,_fpWhen=null,CHAT_STYLE=null,_repN=0,_mkKind='',_seenQ=[],_seenDone={},_seenIO=null;
var CHAT_THEMES={'':['Standart','#6c3cf6','#fff'],ocean:['Okean','#0e7490','linear-gradient(180deg,#ecfeff,#e0f2fe)'],sunset:['Gün batımı','#ea580c','linear-gradient(180deg,#fff7ed,#ffe4e6)'],forest:['Meşə','#15803d','linear-gradient(180deg,#f0fdf4,#ecfccb)'],lavender:['Lavanda','#7c3aed','linear-gradient(180deg,#f5f3ff,#fae8ff)'],night:['Gecə','#6366f1','linear-gradient(180deg,#1e1b4b,#0f172a)'],rose:['Qızılgül','#e11d48','linear-gradient(180deg,#fff1f2,#fce7f3)']};
function s3fmt(d){var x=new Date(d);return x.toLocaleString('az-AZ',{timeZone:'Asia/Baku',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}
function s3date(d){var x=new Date(d);return x.toLocaleDateString('az-AZ',{timeZone:'Asia/Baku',day:'numeric',month:'long'});}
function s3card(h,cls){return '<div class="s3card'+(cls?' '+cls:'')+'">'+h+'</div>';}
function s3pick(title,cb,excludeMe){socContacts().then(function(l){window._s3cb=cb;var arr=(l||[]).filter(function(c){return !excludeMe||c.uid!==ME.user_id;});
 modal('<div class="mhead"><h3>'+esc(title)+'</h3><button class="x" onclick="closeModal()">×</button></div><input id="s3q" placeholder="Axtar…" style="width:100%;margin-bottom:8px" oninput="s3pickF(this.value)"><div id="s3pl" style="max-height:55vh;overflow-y:auto">'+arr.map(function(c){return '<div class="igrow s3pi" data-n="'+esc((c.ad||'').toLowerCase())+'" onclick="window._s3cb(\''+c.uid+'\',\''+chatArg(c.ad)+'\')">'+chatAva(c.ad,c.photo,40)+'<div class="igmeta"><div class="igname">'+esc(c.ad)+'</div><div class="iglast">'+esc(c.vezife||'')+'</div></div></div>';}).join('')+'</div>');});}
function s3pickF(q){q=(q||'').toLowerCase();Array.prototype.forEach.call(document.querySelectorAll('.s3pi'),function(e){e.style.display=e.dataset.n.indexOf(q)>=0?'':'none';});}

/* ---- nişanlar ---- */
var _badgeInfo0=badgeInfo;
badgeInfo=function(c){if(/^eom_/.test(c))return ['🏆','Ayın işçisi '+c.slice(8,10)+'.'+c.slice(4,8)];if(/^chal_/.test(c))return ['🏁','Çağırış qalibi'];return _badgeInfo0(c);};

/* ---- lent seqmentləri ---- */
feedSeg=function(){var el=$('soSeg');if(!el)return;var s=[['all','Hamısı'],['following','İzlədiklərim'],['team','🏆 Komanda'],['qa','❓ Suallar'],['events','Tədbirlər'],['clubs','Klublar'],['albums','Albomlar'],['explore','Kəşf']];
 if(SOC_MOD)s.push(['mod','🛡 Moderasiya'+(_repN?' <b class="s3n">'+_repN+'</b>':'')]);
 el.innerHTML=s.map(function(x){return '<button class="'+(FMODE===x[0]||(x[0]==='clubs'&&FMODE==='club')||(x[0]==='team'&&FMODE==='challenge')?'on':'')+'" onclick="feedMode(\''+x[0]+'\')">'+x[1]+'</button>';}).join('');};
var _feedMode0=feedMode;
feedMode=function(m,arg){
 if(['team','qa','mod','challenge'].indexOf(m)>=0){FMODE=m;FARG=arg||null;if(!$('soBody')){show('feed');return;}feedSeg();var b=$('soBody');b.innerHTML='<p class="status"><span class="spin"></span>Yüklənir…</p>';
  if(m==='team')return teamRender();if(m==='qa')return qaRender();if(m==='mod')return modRender();
  if(m==='challenge'){b.innerHTML='<div class="sohdr" id="soChH"><button class="igicon" onclick="feedMode(\'team\')">'+IGI.back+'</button><h3>🏁 Çağırış</h3></div><div id="igPosts"><p class="status"><span class="spin"></span></p></div>';
   run(sb.rpc('chal_list')).then(function(l){var c=(l||[]).find(function(x){return x.id===arg;});var h=$('soChH');if(c&&h){h.innerHTML='<button class="igicon" onclick="feedMode(\'team\')">'+IGI.back+'</button><h3>'+esc(c.emoji+' '+c.title)+'</h3>'+(c.active?'<button class="btn sm" onclick="feedCompose(null,\''+c.id+'\')">Qatıl</button>':'');}}).catch(function(){});feedLoad();}
  return;}
 _feedMode0(m,arg);
 if(m==='all'){var c=document.querySelector('#soBody .igcompose');if(c&&!$('soX3')){c.insertAdjacentHTML('afterend','<div id="soX3"></div>');s3allExtras();}}};

/* ---- "Hamısı" əlavələri: elan, xatirə, qarşılama, günün sualı ---- */
function s3allExtras(){var box=$('soX3');if(!box)return;
 Promise.all([run(sb.rpc('ann_feed')).catch(function(){return [];}),run(sb.rpc('soc_memories')).catch(function(){return [];}),run(sb.rpc('onb_state')).catch(function(){return null;}),run(sb.rpc('qotd_today')).catch(function(){return null;})]).then(function(r){
  if(FMODE!=='all'||!$('soX3'))return;var h='',an=r[0]||[],mem=r[1]||[],onb=r[2],q=r[3];
  if(onb)h+=onbHtml(onb);
  an.forEach(function(a){h+='<div class="s3ann" id="ann'+a.id+'"><div class="row sp"><b>📢 '+(a.pinned?'📌 ':'')+esc(a.title)+'</b><small>'+chatAgo(a.at)+'</small></div><p>'+esc(a.body)+'</p><div class="row" style="gap:6px"><button class="btn sm" onclick="annOk('+a.id+')">✓ Oxudum</button><button class="btn sm ghost" onclick="show(\'news\')">Bütün elanlar</button></div></div>';});
  if(q)h+='<div id="s3Q">'+qotdHtml(q,true)+'</div>';
  mem.forEach(function(m){var p=m.post;if(!p)return;if(!FEED.find(function(x){return x.id===p.id;}))FEED.push(p);var img=p.media&&p.media[0]?p.media[0].url:p.image;
   h+='<div class="s3mem" onclick="postOpen(\''+p.id+'\')"><span>🕰 Xatirə · '+esc(m.ago)+'</span>'+(img?'<img src="'+esc(img)+'">':'')+'<div><b>'+esc(p.kind==='post'?'Bu gün paylaşmışdın':'Bu gün')+'</b><p>'+esc((p.body||'').slice(0,100))+'</p></div></div>';});
  $('soX3').innerHTML=h;}).catch(function(){});}
function annOk(id){run(sb.rpc('ann_read',{p_id:id})).then(function(){var e=$('ann'+id);if(e)e.remove();if(typeof renderTodayAnn==='function')renderTodayAnn();toast('✓ Qeyd edildi');}).catch(err);}

/* ---- qarşılama axını ---- */
function onbHtml(o){var st=o.steps||[],ok=st.filter(function(s){return s.ok;}).length;if(ok===st.length)return '';
 var act={photo:"show('me')",bio:"socProfile(ME.user_id);setTimeout(profEdit,1300)",skills:"socProfile(ME.user_id);setTimeout(profEdit,1300)",follow:"feedMode('explore')",post:"feedCompose()",story:"storyPick()"};
 return '<div class="s3onb"><div class="row sp"><b>👋 Xoş gəldin! İlk addımlar</b><small>'+ok+'/'+st.length+'</small></div><div class="s3bar"><i style="width:'+Math.round(ok*100/st.length)+'%"></i></div>'
  +(o.mentor?'<div class="igrow" onclick="socProfile(\''+o.mentor.uid+'\')">'+chatAva(o.mentor.ad,o.mentor.photo,36)+'<div class="igmeta"><div class="igname">🧭 Mentorun: '+esc(o.mentor.ad)+'</div><div class="iglast">Sualın olsa, ona yaz</div></div><button class="btn sm ghost" onclick="event.stopPropagation();show(\'chat\');chatOpen(\''+o.mentor.uid+'\',\''+chatArg(o.mentor.ad)+'\')">Yaz</button></div>':'')
  +st.map(function(s){return '<button class="s3step'+(s.ok?' ok':'')+'" onclick="'+(s.ok?'':act[s.k]||'')+'"><i>'+(s.ok?'✓':'○')+'</i>'+esc(s.t)+'</button>';}).join('')+'</div>';}

/* ---- günün sualı ---- */
function qotdHtml(q,mini){if(!q)return '';var h='<div class="s3qotd"><small>💭 GÜNÜN SUALI · '+q.n+' cavab</small><b>'+esc(q.q)+'</b>';
 if(!q.my)h+='<div class="row" style="gap:6px"><input id="qtA" maxlength="300" placeholder="Cavabın… (cavab verəndən sonra başqalarınınkı açılır)" style="flex:1" onkeydown="if(event.key===\'Enter\')qotdSend()"><button class="btn sm" onclick="qotdSend()">Göndər</button></div>';
 else h+='<p class="s3my">Sənin cavabın: '+esc(q.my)+'</p>';
 var a=q.answers||[];if(a.length){var l=mini?a.slice(0,3):a;h+=l.map(function(x){return '<div class="s3qa">'+chatAva(x.ad,x.photo,28)+'<div><b>'+esc(x.ad)+'</b> '+esc(x.a)+'</div></div>';}).join('')+(mini&&a.length>3?'<button class="igtxt" onclick="feedMode(\'team\')">Bütün cavablar ('+a.length+') →</button>':'');}
 return h+'</div>';}
function qotdSend(){var i=$('qtA');var v=i&&i.value.trim();if(!v)return;run(sb.rpc('qotd_answer',{p_answer:v})).then(function(q){var b=$('s3Q');if(b)b.innerHTML=qotdHtml(q,FMODE==='all');toast('💭 Cavab göndərildi');}).catch(err);}
function qotdSetUI(){var d=new Date(Date.now()+86400000).toISOString().slice(0,10);modal('<div class="mhead"><h3>💭 Günün sualını təyin et</h3><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Tarix</label><input id="qsD" type="date" value="'+d+'"></div><div class="field"><label>Sual</label><input id="qsQ" maxlength="200" placeholder="Bu həftə səni nə sevindirdi?"></div><p class="hint">Təyin edilməsə, sual bankından avtomatik seçilir.</p><button class="btn" style="width:100%" onclick="qotdSetGo()">Yadda saxla</button>');}
function qotdSetGo(){var q=$('qsQ').value.trim();if(!q){toast('Sual yazın');return;}run(sb.rpc('qotd_set',{p_day:$('qsD').value,p_q:q})).then(function(){closeModal();toast('Təyin edildi');}).catch(err);}

/* ---- KOMANDA bölməsi ---- */
function teamRender(){var b=$('soBody');
 Promise.all([run(sb.rpc('soc_digest')).catch(function(){return {};}),run(sb.rpc('qotd_today')).catch(function(){return null;}),run(sb.rpc('chal_list')).catch(function(){return [];}),run(sb.rpc('eom_state')).catch(function(){return null;}),run(sb.rpc('points_board')).catch(function(){return null;}),Promise.resolve(null)]).then(function(r){
  if(FMODE!=='team')return;var d=r[0]||{},q=r[1],ch=r[2]||[],eo=r[3],pb=r[4],cf=r[5],h='';
  h+='<div id="s4Team"></div><div class="s3dig"><b>📬 Bu həftə</b><span>'+(d.posts||0)+' post</span><span>'+(d.stories||0)+' hekayə</span>'+(d.events?'<span>'+d.events+' tədbir</span>':'')+(d.bdays?'<span>🎂 '+d.bdays+'</span>':'')+(d.newbies?'<span>👋 '+d.newbies+' yeni</span>':'')+(d.chal?'<span>🏁 '+d.chal+' çağırış</span>':'')+'</div>';
  if(q)h+='<div id="s3Q">'+qotdHtml(q,false)+'</div>';
  if(SOC_MOD)h+='<button class="igtxt" style="margin:-4px 0 12px" onclick="qotdSetUI()">💭 Sabahın sualını təyin et</button>';
  /* çağırışlar */
  h+='<div class="igsec row sp"><span>🏁 Çağırışlar</span>'+(SOC_MOD?'<button class="btn sm" onclick="chalNew()">+ Yeni</button>':'')+'</div>';
  h+=ch.length?ch.map(function(c){return '<div class="s3chal'+(c.active?'':' done')+'"><div class="s3ce">'+esc(c.emoji)+'</div><div style="flex:1;min-width:0"><b>'+esc(c.title)+'</b>'+(c.body?'<p>'+esc(c.body)+'</p>':'')
   +'<small>'+(c.active?'Son gün: '+s3date(c.ends)+' · ':'Bitib · ')+c.n+' iştirakçı</small>'+(c.winner?'<div class="s3win">🏆 Qalib: <b onclick="socProfile(\''+c.winner.uid+'\')">'+esc(c.winner.ad)+'</b></div>':'')
   +'<div class="soevf">'+(c.faces||[]).map(function(f){return chatAva(f.ad,f.photo,22);}).join('')+'</div>'
   +'<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">'+(c.active?'<button class="btn sm" onclick="feedCompose(null,\''+c.id+'\')">'+(c.mine?'+ Daha bir post':'Qatıl')+'</button>':'')+'<button class="btn sm ghost" onclick="feedMode(\'challenge\',\''+c.id+'\')">Postlar</button>'+(SOC_MOD&&c.active?'<button class="btn sm ghost" onclick="chalClose(\''+c.id+'\')">Bitir və qalibi seç</button>':'')+'</div></div></div>';}).join(''):'<p class="hint">Aktiv çağırış yoxdur'+(SOC_MOD?' — ilkini sən başlat':'')+'.</p>';
  /* ayın işçisi */
  if(eo){h+='<div class="igsec">🏆 Ayın işçisi səsverməsi</div><div class="s3card">';
   if(eo.last)h+='<div class="igrow" onclick="socProfile(\''+eo.last.uid+'\')">'+chatAva(eo.last.ad,eo.last.photo,44)+'<div class="igmeta"><div class="igname">🏆 '+esc(eo.last.ad)+'</div><div class="iglast">Keçən ayın işçisi</div></div></div>';
   h+='<p class="small" style="margin:6px 0">Bu ay ən çox kim fərqləndi? Ayın 1-də nəticə Lentdə elan olunur. Səs gizlidir. <b>'+eo.total+'</b> səs verilib.</p>'
    +(eo.my&&eo.my.nominee?'<div class="s3my">Sənin səsin: <b>'+esc(eo.my.nominee.ad)+'</b>'+(eo.my.reason?' — '+esc(eo.my.reason):'')+'</div><button class="btn sm ghost" onclick="eomPick()">Dəyiş</button>':'<button class="btn" style="width:100%" onclick="eomPick()">🗳 Səs ver</button>');
   if(eo.results&&eo.results.length)h+='<div class="s3res"><small>Nəticələr (yalnız rəhbərlik görür)</small>'+eo.results.map(function(x,i){return '<div class="igrow">'+chatAva(x.ad,x.photo,32)+'<div class="igmeta"><div class="igname">'+(i+1)+'. '+esc(x.ad)+' · <b>'+x.n+'</b> səs</div>'+(x.reasons&&x.reasons.length?'<div class="iglast">'+esc(x.reasons.slice(0,2).join(' · '))+'</div>':'')+'</div></div>';}).join('')+'</div>';
   h+='</div>';}
  /* xallar */
  if(pb){var me=pb.me||{},bb=me.b||{};h+='<div class="igsec row sp"><span>⭐ Xal cədvəli · bu ay</span><button class="igtxt" onclick="ptsHelp()">Necə hesablanır?</button></div>';
   h+='<div class="s3pts"><div><b>'+(me.pts||0)+'</b><small>sənin xalın</small></div><div><b>#'+(me.rank||'–')+'</b><small>yerin</small></div><div class="s3pb">'+[['✍️',bb.posts],['💬',bb.cmts],['❤️',bb.reacts],['🙌',(bb.kgive||0)+(bb.kget||0)],['🕘',bb.ontime],['🏁',bb.chal],['💭',bb.qotd],['📸',bb.stories]].map(function(x){return '<span>'+x[0]+' '+(x[1]||0)+'</span>';}).join('')+'</div></div>';
   h+=(pb.top||[]).map(function(u,i){return '<div class="igrow'+(u.uid===ME.user_id?' s3me':'')+'" onclick="socProfile(\''+u.uid+'\')"><span class="s3rk">'+(i<3?['🥇','🥈','🥉'][i]:i+1)+'</span>'+chatAva(u.ad,u.photo,36)+'<div class="igmeta"><div class="igname">'+esc(u.ad)+'</div></div><b>'+u.pts+'</b></div>';}).join('')||'<p class="hint">Bu ay hələ xal yoxdur.</p>';}
  /* qəhvə */
  if(cf){h+='<div class="igsec">☕ Qəhvə tanışlığı</div><div class="s3card"><p class="small">Hər bazar ertəsi təsadüfi bir həmkarla cütləşirsən — bir qəhvə iç, tanış ol. İştirakçı: <b>'+cf.n+'</b></p>'
   +(cf.match&&cf.match.length?cf.match.map(function(u){return '<div class="igrow">'+chatAva(u.ad,u.photo,44)+'<div class="igmeta" onclick="socProfile(\''+u.uid+'\')"><div class="igname">Bu həftə: '+esc(u.ad)+'</div><div class="iglast">'+esc(u.vezife||'')+'</div></div><button class="btn sm" onclick="show(\'chat\');chatOpen(\''+u.uid+'\',\''+chatArg(u.ad)+'\')">☕ Yaz</button></div>';}).join(''):'')
   +'<label class="s3sw"><input type="checkbox" '+(cf.on?'checked':'')+' onchange="coffeeSet(this.checked)"><span></span>İştirak edirəm</label>'+(SOC_MOD?'<button class="igtxt" onclick="coffeePairNow()">İndi cütləşdir (bu həftə üçün)</button>':'')+'</div>';}
  /* bacarıqlar */
  h+='<div class="igsec">🧠 Kim nə bilir?</div><div class="s3card"><input id="skS" placeholder="Bacarıq axtar: Excel, 3D, hüquq…" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:12px" oninput="clearTimeout(window._skT);window._skT=setTimeout(skillFind,300)"><div id="skR"></div></div>';
  b.innerHTML=h;skillFind();if(typeof s4team==='function')s4team();}).catch(err);}
function ptsHelp(){modal('<div class="mhead"><h3>⭐ Xallar</h3><button class="x" onclick="closeModal()">×</button></div><div class="s3help"><div>✍️ Post <b>+5</b></div><div>💬 Şərh <b>+2</b></div><div>❤️ Postuna gələn reaksiya <b>+1</b></div><div>🙌 Təşəkkür göndərmək <b>+3</b>, almaq <b>+5</b></div><div>🕘 Vaxtında gəliş <b>+2</b></div><div>🏁 Çağırışa qatılmaq <b>+5</b></div><div>💭 Günün sualı <b>+2</b></div><div>📸 Hekayə <b>+2</b></div></div><p class="hint">Cədvəl hər ayın 1-də sıfırlanır.</p>');}
function coffeeSet(on){run(sb.rpc('coffee_opt',{p_on:on})).then(function(){toast(on?'☕ Qoşuldun! Bazar ertəsi cütləşmə olacaq':'Qəhvə tanışlığından çıxdın');if(FMODE==='team')teamRender();else if(FMODE==='all')s3allExtras();}).catch(err);}
function coffeePairNow(){if(!confirm('Bu həftə üçün indi cütləşdirilsin?'))return;run(sb.rpc('coffee_pair_now')).then(function(n){toast(n?n+' nəfər cütləşdirildi':'Bu həftə artıq cütləşdirilib və ya iştirakçı azdır');teamRender();}).catch(err);}
function skillFind(){var q=($('skS')||{}).value||'';run(sb.rpc('skill_search',{p_q:q.trim()})).then(function(l){var el=$('skR');if(!el)return;l=l||[];
 el.innerHTML=l.length?l.slice(0,15).map(function(u){return '<div class="igrow" onclick="socProfile(\''+u.uid+'\')">'+chatAva(u.ad,u.photo,36)+'<div class="igmeta"><div class="igname">'+esc(u.ad)+'</div><div class="iglast">'+esc(u.vezife||'')+'</div></div><span class="s3sk">'+esc(u.skill)+(u.n?' · '+u.n+'👍':'')+'</span></div>';}).join(''):'<p class="hint" style="margin-top:8px">'+(q?'Tapılmadı':'Hələ heç kim bacarıq əlavə etməyib. Profilində "Bacarıqlar" bölməsini doldur.')+'</p>';}).catch(function(){});}
function chalNew(){var d=new Date(Date.now()+7*86400000).toISOString().slice(0,10);modal('<div class="mhead"><h3>🏁 Yeni çağırış</h3><button class="x" onclick="closeModal()">×</button></div><div class="row" style="gap:6px"><input id="chE" value="📸" maxlength="4" style="width:58px;text-align:center;font-size:1.3rem"><input id="chT" maxlength="100" placeholder="Ən yaxşı ofis fotosu" style="flex:1"></div><div class="field" style="margin-top:10px"><label>Şərtlər</label><textarea id="chB" maxlength="600" placeholder="Necə qatılmaq olar, qalib necə seçilir…"></textarea></div><div class="field"><label>Son gün</label><input id="chD" type="date" value="'+d+'"></div><p class="hint">Qalib — ən çox reaksiya toplayan post. Son gün bitəndə avtomatik seçilir.</p><button class="btn" style="width:100%" onclick="chalSave()">Başlat və Lentdə elan et</button>');}
function chalSave(){var t=$('chT').value.trim();if(!t){toast('Ad yazın');return;}run(sb.rpc('chal_add',{p_title:t,p_body:$('chB').value.trim(),p_emoji:$('chE').value.trim(),p_ends:$('chD').value})).then(function(){closeModal();toast('🏁 Çağırış başladı');teamRender();}).catch(err);}
function chalClose(id){if(!confirm('Çağırış bitirilsin? Ən çox reaksiya alan post qalib olacaq.'))return;run(sb.rpc('chal_close',{p_id:id})).then(function(){toast('🏆 Qalib elan edildi');teamRender();}).catch(err);}
function eomPick(){s3pick('Ayın işçisi kim olsun?',function(uid,ad){modal('<div class="mhead"><h3>🗳 '+esc(ad)+'</h3><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Niyə? (istəyə görə)</label><textarea id="eoR" maxlength="300" placeholder="Bu ay layihəni vaxtında bitirdi…"></textarea></div><button class="btn" style="width:100%" onclick="eomGo(\''+uid+'\')">Səs ver</button>');},true);}
function eomGo(uid){run(sb.rpc('eom_vote',{p_nominee:uid,p_reason:$('eoR').value.trim()||null})).then(function(){closeModal();toast('🗳 Səsin qeydə alındı');teamRender();}).catch(err);}

/* ---- ANONİM SUALLAR ---- */
function qaRender(){var b=$('soBody');run(sb.rpc('qa_list')).then(function(l){if(FMODE!=='qa')return;l=l||[];
 b.innerHTML='<div class="s3card"><b>❓ Rəhbərliyə anonim sual / təklif</b><p class="small" style="margin:4px 0 8px">Adın heç kimə, rəhbərliyə də görünmür. Başqaları sualına 👍 verə bilər, cavab hamıya açıq paylaşılır.</p><textarea id="qaB" maxlength="1000" placeholder="Sualını və ya təklifini yaz…" style="width:100%"></textarea><button class="btn" style="width:100%;margin-top:8px" onclick="qaAsk()">Anonim göndər</button></div>'
  +(l.length?l.map(function(q){return '<div class="s3q'+(q.answer?' ans':'')+'"><div class="row" style="gap:10px;align-items:flex-start"><button class="s3vote'+(q.my?' on':'')+'" onclick="qaVote('+q.id+','+(!q.my)+')">👍<b>'+q.votes+'</b></button><div style="flex:1;min-width:0"><p>'+esc(q.body)+'</p><small>Anonim · '+chatAgo(q.at)+'</small>'
   +(q.answer?'<div class="s3ansb"><small>💬 '+esc(q.by?q.by.ad:'Rəhbərlik')+' cavab verdi · '+chatAgo(q.aat)+'</small><p>'+esc(q.answer)+'</p></div>':'')
   +(SOC_MOD?'<div class="row" style="gap:6px;margin-top:6px"><button class="btn sm ghost" onclick="qaAns('+q.id+')">'+(q.answer?'Cavabı dəyiş':'Cavab ver')+'</button><button class="btn sm ghost" onclick="qaDel('+q.id+')">🗑</button></div>':'')+'</div></div></div>';}).join(''):'<div class="igempty"><b>Hələ sual yoxdur</b></div>');}).catch(err);}
function qaAsk(){var v=$('qaB').value.trim();if(v.length<5){toast('Sual çox qısadır');return;}run(sb.rpc('qa_ask',{p_body:v})).then(function(){toast('✓ Anonim göndərildi');qaRender();}).catch(err);}
function qaVote(id,on){run(sb.rpc('qa_vote',{p_id:id,p_on:on})).then(qaRender).catch(err);}
function qaAns(id){var q=null;modal('<div class="mhead"><h3>Cavab</h3><button class="x" onclick="closeModal()">×</button></div><textarea id="qaA" style="width:100%;min-height:120px" maxlength="2000"></textarea><p class="hint">Cavab adınla hamıya görünəcək, səs verənlərə bildiriş gedəcək.</p><button class="btn" style="width:100%" onclick="qaAnsGo('+id+')">Paylaş</button>');}
function qaAnsGo(id){run(sb.rpc('qa_answer',{p_id:id,p_answer:$('qaA').value})).then(function(){closeModal();qaRender();}).catch(err);}
function qaDel(id){if(!confirm('Sual silinsin?'))return;run(sb.rpc('qa_delete',{p_id:id})).then(qaRender).catch(err);}

/* ---- ŞİKAYƏT və MODERASİYA ---- */
function repOpen(kind,target){var R=['Təhqiredici / kobud','Spam','Məxfi məlumat','Uyğunsuz şəkil','Digər'];
 modal('<div class="mhead"><h3>🚩 Şikayət et</h3><button class="x" onclick="closeModal()">×</button></div><p class="small">Şikayətin anonimdir, yalnız rəhbərlik görür.</p><div class="sochips" style="justify-content:flex-start;margin:10px 0">'+R.map(function(r){return '<span onclick="Array.prototype.forEach.call(this.parentNode.children,function(x){x.classList.remove(\'on\')});this.classList.add(\'on\')">'+r+'</span>';}).join('')+'</div><textarea id="rpT" maxlength="300" placeholder="Əlavə qeyd (istəyə görə)" style="width:100%"></textarea><button class="btn" style="width:100%;margin-top:10px" onclick="repGo(\''+kind+'\',\''+target+'\')">Göndər</button>');}
function repGo(k,t){var c=document.querySelector('#mbox .sochips .on'),r=[c?c.textContent:'',$('rpT').value.trim()].filter(Boolean).join(': ');if(!r){toast('Səbəb seçin');return;}run(sb.rpc('rep_add',{p_kind:k,p_target:t,p_reason:r})).then(function(){closeModal();toast('🚩 Şikayət göndərildi');}).catch(err);}
function repCount(){if(!SOC_MOD)return;sb.rpc('rep_count').then(function(r){var n=r.data||0;if(n!==_repN){_repN=n;feedSeg();}},function(){});}
function modRender(){var b=$('soBody');Promise.all([run(sb.rpc('rep_list')),run(sb.rpc('mod_mutes')).catch(function(){return [];})]).then(function(r){if(FMODE!=='mod')return;var l=r[0]||[],mu=r[1]||[];_repN=l.length;feedSeg();var KN={post:'Post',comment:'Şərh',user:'İstifadəçi',market:'Bazarça elanı'};
 b.innerHTML='<div class="igsec">🛡 Açıq şikayətlər ('+l.length+')</div>'+(l.length?l.map(function(x){var it=x.item||{},a=it.author||{};
  return '<div class="s3card s3rep"><div class="row sp"><span class="s3pill">'+(KN[x.kind]||x.kind)+'</span><small>'+chatAgo(x.at)+(x.n>1?' · <b>'+x.n+' şikayət</b>':'')+'</small></div><p class="small"><b>Səbəb:</b> '+esc(x.reason||'—')+'</p>'
   +'<div class="s3rpi">'+chatAva(a.ad,a.photo,32)+'<div><b onclick="socProfile(\''+a.uid+'\')">'+esc(a.ad||'')+'</b>'+(it.body?'<p>'+esc(it.body)+'</p>':'')+(it.image?'<img src="'+esc(it.image)+'">':'')+(it.hidden?'<small>(artıq gizlədilib)</small>':'')+'</div></div>'
   +(x.kind==='post'?'<button class="igtxt" onclick="postOpen(\''+x.target+'\')">Posta bax →</button>':'')
   +'<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px">'+(x.kind!=='user'?'<button class="btn sm" style="background:#ef4444" onclick="repAct('+x.id+',\'hide\')">'+(x.kind==='market'?'Sil':'Gizlət')+'</button>':'')+'<button class="btn sm ghost" onclick="repAct('+x.id+',\'mute1\')">🔇 1 gün</button><button class="btn sm ghost" onclick="repAct('+x.id+',\'mute7\')">🔇 7 gün</button><button class="btn sm ghost" onclick="repAct('+x.id+',\'dismiss\')">Rədd et</button></div></div>';}).join(''):'<p class="hint">Şikayət yoxdur 👍</p>')
  +'<div class="igsec" style="margin-top:14px">🔇 Məhdudlaşdırılanlar</div>'+(mu.length?mu.map(function(u){return '<div class="igrow">'+chatAva(u.ad,u.photo,36)+'<div class="igmeta"><div class="igname">'+esc(u.ad)+'</div><div class="iglast">'+s3fmt(u.until)+' tarixinədək</div></div><button class="btn sm ghost" onclick="modUnmute(\''+u.uid+'\')">Aç</button></div>';}).join(''):'<p class="hint">Yoxdur</p>');}).catch(err);}
function repAct(id,a){var t={hide:'Məzmun gizlədilsin?',mute1:'İstifadəçi 1 gün paylaşa bilməsin?',mute7:'İstifadəçi 7 gün paylaşa bilməsin?',dismiss:'Şikayət rədd edilsin?'};if(!confirm(t[a]))return;run(sb.rpc('rep_act',{p_id:id,p_action:a})).then(function(){toast('Edildi');modRender();}).catch(err);}
function modUnmute(uid){run(sb.rpc('mod_unmute',{p_uid:uid})).then(modRender).catch(err);}

/* ---- post kartı: çağırış və sistem növləri ---- */
var _postCard0=postCard;
postCard=function(p){var h;
 if(p.kind==='chalwin'||p.kind==='eom'){h=_postCard0(Object.assign({},p,{kind:'welcome'}));h=h.replace('👋 Yeni həmkar',p.kind==='eom'?'🏆 Ayın işçisi':'🏆 Çağırış qalibi');}
 else h=_postCard0(p);
 if(p.chal)h=h.replace(/(<small>)/,'$1<a class="sotag" onclick="event.stopPropagation();feedMode(\'challenge\',\''+p.chal.id+'\')">'+esc(p.chal.emoji+' '+p.chal.title)+'</a> · ');
 return h;};

/* ---- baxış sayğacı (statistika üçün) ---- */
function s3seenObs(){if(!('IntersectionObserver' in window))return;if(!_seenIO)_seenIO=new IntersectionObserver(function(es){es.forEach(function(e){var id=e.target.id.slice(4);if(!e.isIntersecting||_seenDone[id])return;_seenDone[id]=1;_seenQ.push(id);});},{threshold:.5});
 Array.prototype.forEach.call(document.querySelectorAll('.igpost[id^="post"]'),function(el){var id=el.id.slice(4);if(/^[0-9a-f-]{36}$/.test(id)&&!_seenDone[id]){var p=FEED.find(function(x){return x.id===id;});if(p&&p.mine)return;_seenIO.observe(el);}});}
setInterval(function(){if(!_seenQ.length)return;var ids=_seenQ.splice(0,50);sb.rpc('post_seen',{p_ids:ids}).then(function(){},function(){});},4000);
var _feedDraw3=feedDraw;feedDraw=function(){_feedDraw3();s3seenObs();};

/* ---- post menyusu: statistika + şikayət ---- */
var _feedMenu0=feedMenu;
feedMenu=function(id){_feedMenu0(id);var p=FEED.find(function(x){return x.id===id;})||{};var mb=$('mbox');if(!mb)return;
 mb.insertAdjacentHTML('beforeend',(p.mine||SOC_MOD?'<button class="igmenu" onclick="postStats(\''+id+'\')">📊 Statistika</button>':'')+(!p.mine?'<button class="igmenu" onclick="repOpen(\'post\',\''+id+'\')">🚩 Şikayət et</button>':''));};
function postStats(id){run(sb.rpc('post_insights',{p_id:id})).then(function(s){if(!s){toast('Statistika əlçatan deyil');return;}var rs=s.reacts||{};
 modal('<div class="mhead"><h3>📊 Post statistikası</h3><button class="x" onclick="closeModal()">×</button></div><div class="s3stat"><div><b>'+s.views+'</b><small>baxış</small></div><div><b>'+s.reach+'%</b><small>komandaya çatıb</small></div><div><b>'+s.likes+'</b><small>reaksiya</small></div><div><b>'+s.comments+'</b><small>şərh</small></div><div><b>'+s.shares+'</b><small>paylaşma</small></div><div><b>'+s.saves+'</b><small>saxlanma</small></div></div>'
 +(Object.keys(rs).length?'<div class="sochips">'+Object.keys(rs).map(function(e){return '<span>'+e+' '+rs[e]+'</span>';}).join('')+'</div>':'')+'<p class="hint" style="text-align:center">İlk 24 saatda: '+s.day1+' baxış</p>');}).catch(err);}

/* ---- şərhlər (şikayət linki ilə) ---- */
feedComments=function(id){_cParent=null;_ment={};run(sb.rpc('post_comments2',{p_id:id})).then(function(r){r=r||[];window._cmts=r;var top=r.filter(function(c){return !c.parent;}),kids=function(pid){return r.filter(function(c){return c.parent===pid;});};
 var one=function(c,sub){return '<div class="igcm'+(sub?' sub':'')+'">'+chatAva(c.ad,c.photo,sub?26:32)+'<div class="cmb"><div><b onclick="socProfile(\''+c.uid+'\')">'+esc(c.ad)+'</b> '+socText(c.body)+'</div><small>'+chatAgo(c.at)+(c.likes?' · '+c.likes+' bəyənmə':'')+' · <a onclick="cmReply('+(c.parent||c.id)+',\''+chatArg(c.ad)+'\')">Cavab ver</a>'+(c.uid!==ME.user_id?' · <a onclick="repOpen(\'comment\',\''+c.id+'\')">Şikayət</a>':'')+'</small></div><button class="cmlk'+(c.liked?' on':'')+'" onclick="cmLike(\''+id+'\','+c.id+','+(!c.liked)+')">'+(c.liked?'❤️':'🤍')+'</button></div>';};
 modal('<div class="mhead"><h3>Şərhlər</h3><button class="x" onclick="closeModal()">×</button></div><div style="max-height:55vh;overflow-y:auto">'+(top.length?top.map(function(c){return one(c)+kids(c.id).map(function(k){return one(k,1);}).join('');}).join(''):'<p class="hint">İlk şərhi sən yaz</p>')+'</div>'
  +'<div id="cmTo" class="cmto"></div><div class="row" style="gap:6px;margin-top:8px;position:relative"><input id="fcB" placeholder="Şərh yaz… (@ ilə qeyd et)" style="flex:1" onkeydown="if(event.key===\'Enter\')feedComment(\''+id+'\')"><button class="btn" onclick="feedComment(\''+id+'\')">Göndər</button></div>');mentionBind($('fcB'));}).catch(err);};

/* ---- POST YARATMA: qaralama, planlı paylaşım, çağırış ---- */
fpPrev=function(){var el=$('fpPrev');if(!el)return;el.innerHTML=_fpMedia.map(function(f,i){var vid=f.url?f.kind==='video':/^video/.test(f.type),u=f.url||URL.createObjectURL(f);return '<span>'+(vid?'<video src="'+esc(u)+'" muted></video>':'<img src="'+esc(u)+'">')+'<button onclick="_fpMedia.splice('+i+',1);fpPrev()">×</button></span>';}).join('');};
var _feedCompose0=feedCompose;
feedCompose=function(club,chal){_fpDraft=null;_fpChal=chal||null;_fpWhen=null;_feedCompose0(club);var mb=$('mbox');if(!mb)return;
 var h=mb.querySelector('.mhead .x');if(h)h.insertAdjacentHTML('beforebegin','<button class="igtxt" style="margin-left:auto;margin-right:8px" onclick="draftList()">📝 Qaralamalar</button>');
 var tl=mb.querySelector('.fptools');if(tl)tl.insertAdjacentHTML('afterend','<div id="fpChal"></div><div id="fpWhen" class="fpwhen"></div>');
 var go=$('fpGo');if(go)go.insertAdjacentHTML('afterend','<div class="row" style="gap:6px;margin-top:6px"><button class="btn ghost sm" style="flex:1" onclick="draftSave(false)">💾 Qaralama</button><button class="btn ghost sm" style="flex:1" id="fpWT" onclick="fpWhenToggle()">⏰ Vaxt seç</button></div>');
 run(sb.rpc('chal_list')).then(function(l){var a=(l||[]).filter(function(c){return c.active;});var el=$('fpChal');if(!el||!a.length)return;
  el.innerHTML='<div class="fpchal"><span>🏁 Çağırışa qat:</span>'+a.map(function(c){return '<button data-c="'+c.id+'" class="'+(_fpChal===c.id?'on':'')+'" onclick="_fpChal=_fpChal===\''+c.id+'\'?null:\''+c.id+'\';Array.prototype.forEach.call(this.parentNode.querySelectorAll(\'button\'),function(b){b.classList.toggle(\'on\',b.dataset.c===_fpChal)})">'+esc(c.emoji+' '+c.title)+'</button>';}).join('')+'</div>';}).catch(function(){});};
function fpWhenToggle(){var el=$('fpWhen');if(!el)return;var wt=$('fpWT');if(el.innerHTML){el.innerHTML='';_fpWhen=null;var g=$('fpGo');if(g)g.textContent='Paylaş';if(wt)wt.textContent='⏰ Vaxt seç';return;}if(wt)wt.textContent='✕ İndi paylaş';
 var bk=new Date(Date.now()+3600000).toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).slice(0,16).replace(' ','T');
 el.innerHTML='<label class="small">⏰ Paylaşım vaxtı (Bakı)</label><input type="datetime-local" id="fpW" value="'+bk+'" style="width:100%">';var g=$('fpGo');if(g)g.textContent='⏰ Planla';_fpWhen=1;}
function fpWhenISO(){var v=($('fpW')||{}).value;if(!v)return null;return new Date(v+':00+04:00').toISOString();}
function fpCollect(){var b=($('fpB').value||'').trim(),poll=null;
 if(_fpPoll){var q=($('fpQ').value||'').trim(),opts=Array.prototype.map.call(document.querySelectorAll('.fpo'),function(x){return x.value.trim();}).filter(Boolean);if(q||opts.length){if(!q||opts.length<2)throw new Error('Sorğu üçün sual və ən azı 2 variant yazın');poll={q:q,opts:opts};}}
 return {b:b,poll:poll};}
function fpUploadAll(){return Promise.all(_fpMedia.map(function(f){if(f.url)return Promise.resolve({url:f.url,kind:f.kind||'image'});return chatUpload(f,'post').then(function(u){return {url:u,kind:/^video/.test(f.type)?'video':'image'};});}));}
feedPost=function(){var c;try{c=fpCollect();}catch(e){toast(e.message);return;}if(_fpWhen)return draftSave(true);
 if(!c.b&&!_fpMedia.length&&!c.poll){toast('Mətn, şəkil və ya sorğu əlavə edin');return;}var g=$('fpGo');g.disabled=true;g.textContent='Yüklənir…';
 fpUploadAll().then(function(media){return run(sb.rpc('post_add3',{p_body:c.b,p_media:media.length?media:null,p_poll:c.poll,p_club:_fpClub,p_mentions:mentionIds(c.b),p_shared:null,p_challenge:_fpChal}));})
 .then(function(){var d=_fpDraft;closeModal();toast('Paylaşıldı');if(d)sb.rpc('draft_delete',{p_id:d}).then(function(){},function(){});if(FMODE==='team')teamRender();else feedLoad();}).catch(function(e){g.disabled=false;g.textContent='Paylaş';toast(e.message||e);});};
function draftSave(planned){var c;try{c=fpCollect();}catch(e){toast(e.message);return;}if(!c.b&&!_fpMedia.length&&!c.poll){toast('Qaralama boşdur');return;}
 var when=planned?fpWhenISO():null;if(planned&&!when){toast('Vaxt seçin');return;}if(planned&&new Date(when)<new Date()){toast('Vaxt keçmişdədir');return;}
 toast(planned?'⏰ Planlanır…':'💾 Saxlanılır…');
 fpUploadAll().then(function(media){return run(sb.rpc('draft_save',{p_id:_fpDraft,p_body:c.b,p_media:media.length?media:null,p_poll:c.poll,p_club:_fpClub,p_mentions:mentionIds(c.b),p_challenge:_fpChal,p_publish_at:when}));})
 .then(function(){closeModal();toast(planned?'⏰ '+s3fmt(when)+' tarixində paylaşılacaq':'💾 Qaralama saxlanıldı');}).catch(err);}
function draftList(){run(sb.rpc('draft_list')).then(function(l){l=l||[];window._drafts=l;
 modal('<div class="mhead"><h3>📝 Qaralamalar və planlılar</h3><button class="x" onclick="closeModal()">×</button></div>'+(l.length?l.map(function(d){var img=d.media&&d.media[0];
  return '<div class="s3dr">'+(img?(img.kind==='video'?'<video src="'+esc(img.url)+'" muted></video>':'<img src="'+esc(img.url)+'">'):'<span class="s3drp">📝</span>')+'<div style="flex:1;min-width:0"><p>'+esc((d.body||(d.poll?'📊 '+d.poll.q:'(mətn yoxdur)')).slice(0,90))+'</p><small>'+(d.publish_at?'<b style="color:#0a84ff">⏰ '+s3fmt(d.publish_at)+'</b>':'Qaralama · '+chatAgo(d.at))+'</small>'
   +'<div class="row" style="gap:6px;margin-top:6px"><button class="btn sm ghost" onclick="draftOpen(\''+d.id+'\')">Redaktə</button><button class="btn sm" onclick="draftPub(\''+d.id+'\')">İndi paylaş</button><button class="btn sm ghost" onclick="draftDel(\''+d.id+'\')">🗑</button></div></div></div>';}).join(''):'<p class="hint">Qaralama yoxdur. Post yazarkən "💾 Qaralama" və ya "⏰ Planla" seç.</p>'));}).catch(err);}
function draftOpen(id){var d=(window._drafts||[]).find(function(x){return x.id===id;});if(!d)return;feedCompose(d.club,d.chal);_fpDraft=d.id;$('fpB').value=d.body||'';_fpMedia=(d.media||[]).slice();fpPrev();
 if(d.poll){fpPollToggle();$('fpQ').value=d.poll.q||'';var o=d.poll.opts||[];for(var i=2;i<o.length;i++)fpAddOpt();Array.prototype.forEach.call(document.querySelectorAll('.fpo'),function(x,k){x.value=o[k]||'';});}
 if(d.publish_at){fpWhenToggle();$('fpW').value=new Date(d.publish_at).toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).slice(0,16).replace(' ','T');}}
function draftPub(id){run(sb.rpc('draft_publish',{p_id:id})).then(function(){closeModal();toast('Paylaşıldı');feedLoad();}).catch(err);}
function draftDel(id){if(!confirm('Qaralama silinsin?'))return;run(sb.rpc('draft_delete',{p_id:id})).then(draftList).catch(err);}

/* ---- HEKAYƏ: yaxın dostlar + highlights ---- */
var _storyDrawRow3=storyDrawRow;
storyDrawRow=function(){_storyDrawRow3();var el=$('igStories');if(!el)return;var k=0;CHAT_STORIES.forEach(function(u){if(u.me)return;k++;if(u.cf){var r=el.children[k]&&el.children[k].querySelector('.igring');if(r)r.classList.add('cf');}});};
var _storyShow3=storyShow;
storyShow=function(){_storyShow3();if(!_sv)return;var it=CHAT_STORIES[_sv.ui]&&CHAT_STORIES[_sv.ui].items[_sv.ii];if(it&&it.cf){var h=document.querySelector('#igSV .svhead small');if(h)h.insertAdjacentHTML('afterend','<span class="svcf">⭐ Yaxın dostlar</span>');}};
storyPick=function(){var i=document.createElement('input');i.type='file';i.accept='image/*,video/*';i.onchange=function(){var f=i.files[0];if(!f)return;if(f.size>25*1024*1024){toast('Fayl 25MB-dan kiçik olmalıdır');return;}_stoStk=null;window._stoAud='all';
 var vid=/^video\//.test(f.type),u=URL.createObjectURL(f);
 modal('<div class="mhead"><h3>Hekayə</h3><button class="x" onclick="closeModal()">×</button></div><div style="border-radius:14px;overflow:hidden;background:#000;max-height:42vh;display:flex;justify-content:center">'+(vid?'<video src="'+u+'" style="max-height:42vh;max-width:100%" autoplay muted loop playsinline></video>':'<img src="'+u+'" style="max-height:42vh;max-width:100%;object-fit:contain">')+'</div><input id="stoCap" placeholder="Yazı (istəyə görə)" maxlength="200" style="width:100%;margin-top:10px">'
  +'<div class="fptools"><button class="btn ghost sm" onclick="stoStk(\'poll\')">📊 Sorğu stikeri</button><button class="btn ghost sm" onclick="stoStk(\'q\')">❓ Sual stikeri</button></div><div id="stoStkF"></div>'
  +'<div class="s3aud"><button class="on" data-a="all" onclick="stoAud(this)">🌐 Hamı</button><button data-a="cf" onclick="stoAud(this)">⭐ Yaxın dostlar</button><a class="igtxt" onclick="cfManage()">Siyahı</a></div>'
  +'<button class="btn" id="stoGo" style="width:100%;margin-top:10px">Paylaş · 24 saat</button>');
 $('stoGo').onclick=function(){var st=null;if(_stoStk==='poll'){var q=$('skQ').value.trim(),a=$('skA').value.trim()||'Bəli',b=$('skB').value.trim()||'Xeyr';if(q)st={type:'poll',q:q,opts:[a,b]};}else if(_stoStk==='q'){var q2=$('skQ').value.trim();if(q2)st={type:'q',q:q2};}
  this.disabled=true;this.textContent='Yüklənir…';chatUpload(f,'story').then(function(url){return run(sb.rpc('story_add3',{p_url:url,p_kind:vid?'video':'image',p_caption:$('stoCap').value.trim()||null,p_sticker:st,p_audience:window._stoAud}));}).then(function(){closeModal();toast(window._stoAud==='cf'?'⭐ Yaxın dostlarla paylaşıldı':'Hekayə paylaşıldı');storyLoad();}).catch(function(e){var g=$('stoGo');if(g){g.disabled=false;g.textContent='Paylaş · 24 saat';}toast('Alınmadı: '+(e.message||e));});};};i.click();};
function stoAud(el){window._stoAud=el.dataset.a;Array.prototype.forEach.call(el.parentNode.querySelectorAll('button'),function(b){b.classList.toggle('on',b===el);});}
function cfManage(){Promise.all([run(sb.rpc('cf_list')),socContacts()]).then(function(r){var on=r[0]||[],l=(r[1]||[]).filter(function(c){return c.uid!==ME.user_id;});
 var box=document.createElement('div');box.className='s3over';box.innerHTML='<div class="s3sheet"><div class="mhead"><h3>⭐ Yaxın dostlar ('+on.length+')</h3><button class="x" onclick="this.closest(\'.s3over\').remove()">×</button></div><p class="hint">Bu siyahıdakılar "Yaxın dostlar" hekayələrini görür. Onlara bildiriş getmir.</p><div style="max-height:55vh;overflow-y:auto">'
  +l.sort(function(a,b){return (on.indexOf(b.uid)>=0)-(on.indexOf(a.uid)>=0);}).map(function(c){var o=on.indexOf(c.uid)>=0;return '<div class="igrow">'+chatAva(c.ad,c.photo,40)+'<div class="igmeta"><div class="igname">'+esc(c.ad)+'</div></div><button class="s3cfb'+(o?' on':'')+'" onclick="cfSet(\''+c.uid+'\',!this.classList.contains(\'on\'),this)">'+(o?'⭐':'☆')+'</button></div>';}).join('')+'</div></div>';document.body.appendChild(box);}).catch(err);}
function cfSet(uid,on,el){run(sb.rpc('cf_set',{p_uid:uid,p_on:on})).then(function(){if(el){el.classList.toggle('on',on);el.textContent=on?'⭐':'☆';el.setAttribute('onclick','cfSet(\''+uid+'\','+(!on)+',this)');}else{toast(on?'⭐ Yaxın dostlara əlavə edildi':'Yaxın dostlardan çıxarıldı');socProfile(uid);}}).catch(err);}
function hlView(i){var h=(window._profX&&window._profX.hl||[])[i];if(!h||!h.items||!h.items.length)return;var k=0,t=null,el=document.createElement('div');el.id='igSV';document.body.appendChild(el);document.body.classList.add('incall');
 var close=function(){clearInterval(t);el.remove();document.body.classList.remove('incall');};
 var draw=function(){clearInterval(t);var it=h.items[k];if(!it){close();return;}
  el.innerHTML='<div class="svbars">'+h.items.map(function(x,j){return '<i><b style="width:'+(j<k?100:0)+'%"'+(j===k?' id="svb"':'')+'></b></i>';}).join('')+'</div><div class="svhead"><span class="s3hlc">'+(h.items[0].kind==='video'?'🎬':'<img src="'+esc(h.items[0].url)+'">')+'</span><b>'+esc(h.title)+'</b><small>'+s3date(it.at)+'</small><button id="hlX">✕</button></div>'
   +(it.kind==='video'?'<video id="svm" src="'+esc(it.url)+'" autoplay playsinline></video>':'<img id="svm" src="'+esc(it.url)+'">')+(it.cap?'<div class="svcap">'+esc(it.cap)+'</div>':'')+'<div class="svl"></div><div class="svr"></div>'
   +(window._profX&&window._profX._me?'<div class="svfoot"><button id="hlDel">🗑️ Önə çıxanı sil</button></div>':'');
  el.querySelector('#hlX').onclick=close;el.querySelector('.svl').onclick=function(){k=Math.max(0,k-1);draw();};el.querySelector('.svr').onclick=function(){k++;draw();};
  var d=el.querySelector('#hlDel');if(d)d.onclick=function(){if(!confirm('"'+h.title+'" silinsin?'))return;run(sb.rpc('hl_delete',{p_id:h.id})).then(function(){close();socProfile(ME.user_id);}).catch(err);};
  var dur=5000,m=el.querySelector('#svm');if(it.kind==='video'&&m)m.onloadedmetadata=function(){dur=Math.min(30000,(m.duration||5)*1000);};var t0=Date.now();
  t=setInterval(function(){var b=$('svb');var p=(Date.now()-t0)/dur;if(b)b.style.width=Math.min(100,p*100)+'%';if(p>=1){k++;draw();}},50);};draw();}
function hlNew(){run(sb.rpc('story_archive')).then(function(l){l=l||[];window._hlSel=[];if(!l.length){toast('Hələ hekayən yoxdur');return;}
 modal('<div class="mhead"><h3>Yeni önə çıxan</h3><button class="x" onclick="closeModal()">×</button></div><input id="hlT" maxlength="30" placeholder="Ad: Novruz, Komanda, Layihə…" style="width:100%"><p class="hint">Hekayələri seç (arxivdən, son 1 il)</p><div class="sogrid s3hlg">'+l.map(function(s){return '<button data-id="'+s.id+'" onclick="var i=window._hlSel.indexOf(this.dataset.id);if(i<0)window._hlSel.push(this.dataset.id);else window._hlSel.splice(i,1);this.classList.toggle(\'on\',i<0)">'+(s.kind==='video'?'<video src="'+esc(s.url)+'" muted></video>':'<img src="'+esc(s.url)+'">')+'<i>✓</i><small>'+s3date(s.at)+'</small></button>';}).join('')+'</div><button class="btn" style="width:100%;margin-top:10px" onclick="hlSave()">Profilə əlavə et</button>');}).catch(err);}
function hlSave(){if(!window._hlSel.length){toast('Ən azı 1 hekayə seçin');return;}run(sb.rpc('hl_add',{p_title:$('hlT').value.trim(),p_ids:window._hlSel})).then(function(){toast('⭐ Profilə əlavə edildi');socProfile(ME.user_id);}).catch(err);}

/* ---- PROFİL: önə çıxanlar, bacarıqlar, mentor, yaxın dost, şikayət ---- */
var _socProfile3=socProfile;
socProfile=function(uid){if(!uid||uid==='undefined')return;window._profX=null;window._prof=null;_socProfile3(uid);
 run(sb.rpc('soc_profile_x',{p_uid:uid})).then(function(x){if(!x)return;x._me=uid===ME.user_id;x._uid=uid;window._profX=x;var n=0;(function inj(){var pr=document.querySelector('#mbox .soprof');if(!pr||!window._prof){if(n++<40)setTimeout(inj,100);return;}if(pr.querySelector('#soPx'))return;
  var me=x._me,h='<div id="soPx">';
  if(x.hl.length||me)h+='<div class="s3hl">'+(me?'<button onclick="hlNew()"><span class="s3hlc add">+</span><small>Yeni</small></button>':'')+x.hl.map(function(H,i){var c=H.items&&H.items[0];return '<button onclick="hlView('+i+')"><span class="s3hlc">'+(c?(c.kind==='video'?'🎬':'<img src="'+esc(c.url)+'">'):'⭐')+'</span><small>'+esc(H.title)+'</small></button>';}).join('')+'</div>';
  if(x.skills.length)h+='<div class="s3skills">'+x.skills.map(function(s){return '<button class="'+(s.my?'on':'')+'" '+(me?'':'onclick="skEnd(\''+uid+'\',\''+chatArg(s.s)+'\','+(!s.my)+')"')+'>'+esc(s.s)+(s.n?' <b>'+s.n+'</b>':'')+'</button>';}).join('')+(me?'':'<div class="hint" style="width:100%;text-align:center;margin-top:2px">Bacarığa toxun — təsdiqlə 👍</div>')+'</div>';
  else if(me)h+='<button class="igtxt" style="display:block;margin:6px auto" onclick="profEdit()">🧠 Bacarıqlarını əlavə et</button>';
  if(x.mentor)h+='<div class="s3ment" onclick="socProfile(\''+x.mentor.uid+'\')">🧭 Mentoru: <b>'+esc(x.mentor.ad)+'</b></div>';
  if(x.mentees&&x.mentees.length)h+='<div class="s3ment">🧭 Mentordur: '+x.mentees.map(function(m){return '<b onclick="socProfile(\''+m.uid+'\')">'+esc(m.ad)+'</b>';}).join(', ')+'</div>';
  h+='<div class="soact s3act">';
  if(me)h+='<button class="btn ghost sm" onclick="cfManage()">⭐ Yaxın dostlar</button><button class="btn ghost sm" onclick="closeModal();feedCompose();setTimeout(draftList,200)">📝 Qaralamalar</button>';
  else{h+='<button class="btn ghost sm'+(x.cf?' s3on':'')+'" onclick="cfSet(\''+uid+'\','+(!x.cf)+')">'+(x.cf?'⭐ Yaxın dostdur':'☆ Yaxın dost et')+'</button>';
   if(x.mod&&x.newbie)h+='<button class="btn ghost sm" onclick="mentorPick(\''+uid+'\')">🧭 Mentor təyin et</button>';
   h+='<button class="btn ghost sm" onclick="repOpen(\'user\',\''+uid+'\')">🚩</button>';}
  h+='</div></div>';var g=pr.querySelector('.sogrid');if(g)g.insertAdjacentHTML('beforebegin',h);else pr.insertAdjacentHTML('beforeend',h);})();}).catch(function(){});};
function skEnd(uid,s,on){run(sb.rpc('skill_endorse',{p_uid:uid,p_skill:s,p_on:on})).then(function(){toast(on?'👍 Təsdiqləndi':'Təsdiq geri alındı');socProfile(uid);}).catch(err);}
function mentorPick(uid){s3pick('Mentor seç',function(m,ad){run(sb.rpc('mentor_set',{p_newbie:uid,p_mentor:m})).then(function(){toast('🧭 '+ad+' mentor təyin edildi');socProfile(uid);}).catch(err);},true);}
var _profEdit3=profEdit;
profEdit=function(){_profEdit3();var x=window._profX&&window._profX._me?window._profX:null;var mb=$('mbox');if(!mb)return;var btn=mb.querySelector('.btn:not(.ghost)');if(!btn)return;
 var go=function(x){if(!$('peS'))btn.insertAdjacentHTML('beforebegin','<div class="field"><label>🧠 Bacarıqlar (vergüllə, 15-ə qədər)</label><input id="peS" value="'+esc((x&&x.skills||[]).map(function(s){return s.s;}).join(', '))+'" placeholder="Excel, AutoCAD, danışıqlar"></div><label class="s3sw"><input type="checkbox" id="peD" '+(!x||x.digest?'checked':'')+'><span></span>📬 Həftəlik xülasə bildirişi</label>');};
 if(x)go(x);else run(sb.rpc('soc_profile_x',{p_uid:ME.user_id})).then(function(r){go(r);window._peX=r;}).catch(function(){go(null);});};
var _profSave3=profSave;
profSave=function(){var s=$('peS'),d=$('peD'),c=$('peC');var x=window._profX&&window._profX._me?window._profX:window._peX;var jobs=[];
 if(s){var sk=s.value.split(',').map(function(t){return t.trim();}).filter(Boolean).slice(0,15);jobs.push(run(sb.rpc('skill_set',{p_skills:sk})));}
 if(d&&(!x||x.digest!==d.checked))jobs.push(run(sb.rpc('soc_prefs',{p_digest:d.checked})));
 if(c&&(!x||x.coffee!==c.checked))jobs.push(run(sb.rpc('coffee_opt',{p_on:c.checked})));
 Promise.all(jobs).then(function(){_profSave3();}).catch(err);};

/* ---- BİLDİRİŞLƏR (yeni növlər) ---- */
notifOpen=function(){run(sb.rpc('notif_list')).then(function(r){r=r||[];var ic={react:'❤️',comment:'💬',reply:'↩︎',mention:'@',follow:'👤',share:'🔁',clike:'❤️',event:'📅',story:'📸',mentor:'🧭',endorse:'🏅',qa:'❓',coffee:'☕',chal:'🏆',mod:'🛡',sched:'⏰',shop:'🎁',comp:'💌',streak:'🔥'};
 var go=function(n,a){if(n.post&&n.kind!=='story')return "postOpen('"+n.post+"')";if(n.kind==='follow'||n.kind==='endorse'||n.kind==='mentor')return "socProfile('"+a.uid+"')";if(n.kind==='event')return "feedMode('events')";if(n.kind==='qa')return "feedMode('qa')";if(n.kind==='coffee'||n.kind==='chal'||n.kind==='streak')return "feedMode('team')";if(n.kind==='comp')return "feedMode('fun')";if(n.kind==='shop')return "feedMode('shop')";return '';};
 modal('<div class="mhead"><h3>Bildirişlər</h3><button class="x" onclick="closeModal()">×</button></div><div style="max-height:65vh;overflow-y:auto">'+(r.length?r.map(function(n){var a=n.actor||{};var sys=['mod','sched','chal','shop','comp','streak'].indexOf(n.kind)>=0;
  return '<div class="sonotif'+(n.read?'':' un')+'" onclick="closeModal();'+go(n,a)+'"><span class="soni">'+(sys?'<span class="s3ni">'+(ic[n.kind])+'</span>':chatAva(a.ad,a.photo,40))+'<i>'+(ic[n.kind]||'🔔')+'</i></span><div><b>'+esc(sys?'Baş Ofis':(a.ad||'Baş Ofis'))+'</b> '+esc(n.text)+'<small>'+chatAgo(n.at)+'</small></div></div>';}).join(''):'<p class="hint">Hələ bildiriş yoxdur</p>')+'</div>');
 sb.rpc('notif_read_all').then(function(){NOTIF_N=0;notifCount();},function(){});}).catch(err);};

/* ---- ELANLAR: kim oxumayıb + xatırlat (rəhbər) ---- */
var _renderNews3=renderNews;
renderNews=function(){_renderNews3();if(!MGR)return;var tries=0;(function wait(){var el=$('annList');if(!el||typeof ANN==='undefined'||!ANN.length||el.querySelectorAll('.card.ann').length!==ANN.length||el.querySelector('.s3annr')){if(tries++<30&&!(el&&el.querySelector('.s3annr')))setTimeout(wait,150);return;}var act=EMPS.filter(function(e){return e.active&&!e.demo;});
 Array.prototype.forEach.call(el.querySelectorAll('.card.ann'),function(c,i){var a=ANN[i];if(!a||c.querySelector('.s3annr'))return;var rd=ANNR.filter(function(x){return x.ann_id===a.id;}).map(function(x){return x.employee_id;});var un=act.filter(function(e){return rd.indexOf(e.id)<0;});
  c.insertAdjacentHTML('beforeend','<div class="s3annr">'+(un.length?'<details><summary>👁 Oxumayanlar: '+un.length+'</summary><div class="small">'+un.map(function(e){return esc(e.full_name);}).join(', ')+'</div></details><button class="btn sm ghost" onclick="annRemind('+a.id+',this)">🔔 Oxumayanlara xatırlat</button>':'<span class="small" style="color:#16a34a">✓ Hamı oxuyub</span>')+'</div>');});})();};
function annRemind(id,el){el.disabled=true;run(sb.rpc('ann_remind',{p_id:id})).then(function(n){el.textContent='✓ '+n+' nəfərə göndərildi';}).catch(function(e){el.disabled=false;err(e);});}

/* ---- ÇAT: video dairə, öz-özünə silinən, tema, ləqəb ---- */
var _chatLastTxt3=chatLastTxt;chatLastTxt=function(t){if(t.son_kind==='vcircle')return '⭕ Video mesaj';return _chatLastTxt3(t);};
var _chatMsgPreview3=chatMsgPreview;chatMsgPreview=function(m){if(m&&!m.deleted&&m.kind==='vcircle')return '⭕ Video mesaj';return _chatMsgPreview3(m);};
var _renderChatRoom3=renderChatRoom;
renderChatRoom=function(){CHAT_STYLE=null;_renderChatRoom3();var t=$('igTools');if(t)t.insertAdjacentHTML('afterbegin','<button class="igicon igimg" onclick="vcStart()" title="Video dairə">⭕</button>');
 if(CHATgroup){var hd=document.querySelector('.igroom .ighead');if(hd)hd.insertAdjacentHTML('beforeend','<button class="igicon" onclick="chatStyleMenu()" title="Söhbət ayarları">🎨</button>');}
 chatStyleLoad();};
function chatStyleLoad(){var who=CHATother,g=CHATgroup;run(sb.rpc('chat_style',{p_other:g?null:who,p_group:g?who:null})).then(function(s){if(who!==CHATother)return;CHAT_STYLE=s||{};chatStyleApply();if(CHATmsgs&&CHATmsgs.length)chatDrawMsgs(CHATmsgs);}).catch(function(){});}
function chatStyleApply(){var r=document.querySelector('.igroom');if(!r)return;var s=CHAT_STYLE||{},th=CHAT_THEMES[s.theme||'']||CHAT_THEMES[''];
 Object.keys(CHAT_THEMES).forEach(function(k){if(k)r.classList.remove('th-'+k);});if(s.theme){r.classList.add('th-'+s.theme);r.style.setProperty('--igp',th[1]);}else r.style.removeProperty('--igp');
 var b=$('s3eph');if(s.eph){if(!b){var p=$('igPinned');if(p)p.insertAdjacentHTML('beforebegin','<div id="s3eph" onclick="chatStyleMenu()">⏳ Öz-özünə silinən mesajlar aktivdir · 24 saat</div>');}}else if(b)b.remove();
 if(!CHATgroup){var nk=s.nicks&&s.nicks[CHATother],n=document.querySelector('.igroom .igwho .igname');if(n&&nk&&!n.dataset.nk){n.dataset.nk=1;n.firstChild.textContent=nk;}}}
var _chatDrawMsgs3=chatDrawMsgs;
chatDrawMsgs=function(rows){var nk=(CHAT_STYLE&&CHAT_STYLE.nicks)||{};var rr=(rows||[]).map(function(m){if(CHATgroup&&m.from&&nk[m.sender])return Object.assign({},m,{from:Object.assign({},m.from,{ad:nk[m.sender]})});return m;});
 _chatDrawMsgs3(rr);(rows||[]).forEach(function(m){var b=$('msg'+m.id);if(!b)return;
  if(m.kind==='vcircle'&&!m.deleted&&m.file){b.classList.add('vcm');b.innerHTML='<div class="igvc" onclick="event.stopPropagation();vcPlay(this)"><video src="'+esc(m.file)+'#t=0.1" playsinline preload="metadata" muted></video><span class="vcp">▶︎</span><small>'+chatDur(m.dur)+'</small></div>'+(m.reaction?'<span class="msgreact">'+esc(m.reaction)+'</span>':'');}
  if(m.exp&&!m.deleted){var line=b.parentNode;var mt=line.querySelector('.igmeta2');var tag='<span class="igstar" title="24 saata silinəcək">⏳</span>';if(mt)mt.insertAdjacentHTML('beforeend',tag);else b.insertAdjacentHTML('afterend','<div class="igmeta2">'+tag+'</div>');}});};
function vcPlay(el){var v=el.querySelector('video');Array.prototype.forEach.call(document.querySelectorAll('.igvc video'),function(o){if(o!==v){o.pause();o.parentNode.classList.remove('on');}});
 if(v.paused){v.muted=false;if(!el.classList.contains('on'))v.currentTime=0;el.classList.add('on');v.play().catch(function(){});v.onended=function(){el.classList.remove('on');};}else{v.pause();el.classList.remove('on');}}
var _vc=null;
function vcStart(){if(_vc)return;if(!navigator.mediaDevices||!window.MediaRecorder){toast('Bu cihaz video yazmağı dəstəkləmir');return;}
 navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:480},height:{ideal:480}},audio:{echoCancellation:true,noiseSuppression:true}}).then(function(st){
  var o=document.createElement('div');o.id='s3vc';o.innerHTML='<div class="s3vcr"><video autoplay playsinline muted></video><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48"/></svg></div><b id="s3vcT">0:00</b><div class="s3vcb"><button onclick="vcStop(true)">✕</button><button class="go" onclick="vcStop(false)">➤</button></div><small>Maksimum 60 saniyə</small>';document.body.appendChild(o);
  var v=o.querySelector('video');v.srcObject=st;
  var mt=['video/mp4;codecs=avc1,mp4a','video/mp4','video/webm;codecs=vp8,opus','video/webm'].find(function(t){try{return MediaRecorder.isTypeSupported(t);}catch(e){return false;}})||'';
  var r=new MediaRecorder(st,mt?{mimeType:mt,videoBitsPerSecond:900000}:undefined),ch=[];r.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data);};r.start(500);
  _vc={r:r,st:st,ch:ch,t0:Date.now(),mt:r.mimeType||mt||'video/webm',o:o};var c=o.querySelector('circle');
  _vc.tick=setInterval(function(){if(!_vc)return;var s=(Date.now()-_vc.t0)/1000;var x=$('s3vcT');if(x)x.textContent=chatDur(s);if(c)c.style.strokeDashoffset=(301.6*(1-Math.min(1,s/60))).toFixed(1);if(s>=60)vcStop(false);},200);
 }).catch(function(e){toast(callErrMsg(e));});}
function vcStop(cancel){var R=_vc;if(!R)return;_vc=null;clearInterval(R.tick);var dur=(Date.now()-R.t0)/1000;
 R.r.onstop=function(){R.st.getTracks().forEach(function(t){t.stop();});R.o.remove();if(cancel)return;if(dur<1){toast('Çox qısadır');return;}
  var blob=new Blob(R.ch,{type:R.mt.split(';')[0]}),ext=/mp4/.test(R.mt)?'mp4':'webm',f=new File([blob],'dairə.'+ext,{type:blob.type});toast('⭕ Göndərilir…');
  chatUpload(f,'vcircle').then(function(url){return chatSendRpc({kind:'vcircle',file:url,dur:Math.round(dur)});}).catch(function(e){toast('Göndərilmədi: '+(e.message||e));});};
 try{R.r.stop();}catch(e){}}
var _chatRoomMenu3=chatRoomMenu;
chatRoomMenu=function(){_chatRoomMenu3();var mb=$('mbox');if(mb)mb.insertAdjacentHTML('beforeend','<button class="igmenu" onclick="chatStyleMenu()">🎨 Tema, ləqəb və ⏳ silinən mesajlar</button>');};
function chatStyleMenu(){var s=CHAT_STYLE||{},nk=s.nicks||{};
 var ppl=CHATgroup?run(sb.rpc('grp_info',{p_group:CHATother})).then(function(g){return (g&&g.members)||[];}):Promise.resolve([{uid:CHATother,ad:CHATname,photo:CHAT_PH[CHATother]},{uid:ME.user_id,ad:ME.full_name||'Mən',photo:(typeof EMP!=='undefined'&&EMP&&EMP.photo)||null}]);
 ppl.then(function(l){window._csP=l;
 modal('<div class="mhead"><h3>Söhbət ayarları</h3><button class="x" onclick="closeModal()">×</button></div>'
  +'<label class="s3sw"><input type="checkbox" '+(s.eph?'checked':'')+' onchange="chatStyleSet(\'eph\',this.checked?\'1\':\'0\')"><span></span>⏳ Öz-özünə silinən mesajlar</label><p class="hint" style="margin-top:-4px">Aktiv olanda yeni mesajlar 24 saatdan sonra hər kəsdə silinir.'+(s.eph&&s.eph_by?' Aktiv edən: '+esc(s.eph_by.ad):'')+'</p>'
  +'<div class="igsec">🎨 Tema</div><div class="s3th">'+Object.keys(CHAT_THEMES).map(function(k){var t=CHAT_THEMES[k];return '<button class="'+((s.theme||'')===k?'on':'')+'" onclick="chatStyleSet(\'theme\',\''+k+'\')"><span style="background:'+t[2]+'"><i style="background:'+t[1]+'"></i></span><small>'+t[0]+'</small></button>';}).join('')+'</div>'
  +'<div class="igsec">🏷 Ləqəblər</div><div style="max-height:30vh;overflow-y:auto">'+l.map(function(u){return '<div class="igrow">'+chatAva(u.ad,u.photo,34)+'<div class="igmeta"><div class="igname">'+esc(u.ad)+'</div><div class="iglast">'+(nk[u.uid]?'🏷 '+esc(nk[u.uid]):'Ləqəb yoxdur')+'</div></div><button class="btn sm ghost" onclick="chatNick(\''+u.uid+'\')">Dəyiş</button></div>';}).join('')+'</div>');}).catch(err);}
function chatNick(uid){var s=CHAT_STYLE||{},cur=(s.nicks||{})[uid]||'';var v=prompt('Ləqəb (boş qoysan silinəcək)',cur);if(v===null)return;chatStyleSet('nick',v,uid);}
function chatStyleSet(f,v,target){run(sb.rpc('chat_style_set',{p_other:CHATgroup?null:CHATother,p_group:CHATgroup?CHATother:null,p_field:f,p_value:v,p_target:target||null})).then(function(s){CHAT_STYLE=s||{};
 var n=document.querySelector('.igroom .igwho .igname');if(n){delete n.dataset.nk;if(!CHATgroup)n.firstChild.textContent=(s.nicks&&s.nicks[CHATother])||CHATname||'';}
 chatStyleApply();window._chatSig=null;chatLoadMsgs(true);if($('modal').classList.contains('on'))chatStyleMenu();}).catch(err);}

/* ---- başlanğıc ---- */
(function soc3Init(){var go=function(){if(typeof ME==='undefined'||!ME||!ME.user_id||typeof sb==='undefined'){setTimeout(go,1500);return;}
 run(sb.rpc('soc_profile_x',{p_uid:ME.user_id})).then(function(x){SOC_MOD=!!(x&&x.mod);if(SOC_MOD){repCount();setInterval(function(){if(document.visibilityState==='visible')repCount();},60000);}feedSeg();}).catch(function(){});
 var q=new URLSearchParams(location.search);if(q.get('feed')){try{history.replaceState(history.state,'',location.pathname);}catch(e){}setTimeout(function(){show('feed');},700);}};setTimeout(go,1600);})();


;

/* ===================== UI İKONLARI: emoji → xətti SVG ===================== */
(function(){
var P={
plane:'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>',
note:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
userplus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
spark:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M21 5h-4M5 17v4M7 19H3"/>',
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
belloff:'<path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0M2 2l20 20"/>',
mute:'<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
vol:'<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
star:'<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
msg:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
msq:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
pin:'<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
hour:'<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>',
trophy:'<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
cake:'<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01"/>',
chart:'<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
trend:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
mappin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
clip:'<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
mega:'<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
nav:'<path d="m3 11 19-9-9 19-2-8-8-2z"/>',
video:'<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
pen:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
trash:'<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
bookmark:'<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
help:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
coffee:'<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
printer:'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
palette:'<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.56C21.97 6.01 17.46 2 12 2z"/>',
image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
crown:'<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zM5 20h14"/>',
phonem:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
brief:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
map:'<path d="M14.1 6 9.9 4 3 7v13l6.9-3 4.2 2 6.9-3V3z"/><path d="M9.9 4v13M14.1 6v13"/>',
logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
building:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
award:'<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
tag:'<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
bulb:'<path d="M9 18h6M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',
vote:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/>',
ok:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
no:'<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
thumb:'<path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
book:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
car:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.6A2 2 0 0 0 13.7 6H7.4a2 2 0 0 0-1.8 1.1L4 10l-1.5.6C1.7 10.9 1 11.6 1 12.5V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>',
food:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
thermo:'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
ban:'<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
rocket:'<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
game:'<path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><rect x="2" y="6" width="20" height="12" rx="2"/>',mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
};
var M={'🌴':'plane','✈':'plane','🗒':'file','📄':'file','📋':'file','📑':'bookmark','📝':'note','✍':'pen','✎':'pen','✏':'pen','🙌':'heart','💛':'heart','🙏':'heart','👥':'users','🤝':'users','👤':'user','🙋':'user','👋':'userplus','🏠':'home','📷':'camera','📸':'camera',
'🎉':'spark','🥳':'spark','✨':'spark','🌟':'spark','🔔':'bell','🔕':'belloff','🔇':'mute','🔊':'vol','⭐':'star*','☆':'star','💬':'msg','💭':'msq','📌':'pin','⏰':'clock','🕘':'clock','🕒':'clock','🕰':'clock','⏳':'hour',
'🏆':'trophy','🥇':'award#g','🥈':'award#s','🥉':'award#b','🏅':'award','🎂':'cake','📊':'chart','📈':'trend','🏁':'flag','🚩':'flag','📍':'mappin','📎':'clip','📞':'phone','🔁':'repeat','📅':'cal','🗓':'cal','🧭':'compass','👁':'eye',
'📣':'mega','📢':'mega','🎯':'target','🚶':'nav','🎥':'video','🎬':'video','🎤':'mic','⚠':'alert','🗑':'trash','🔖':'bookmark','🛡':'shield','❓':'help','☕':'coffee','➕':'plus','🖨':'printer','🎨':'palette','🖼':'image','💾':'save',
'👑':'crown','📱':'phonem','📲':'phonem','💼':'brief','🗺':'map','🚪':'logout','🏢':'building','🏗':'building','⚙':'gear','🔒':'lock','🏷':'tag','📬':'inbox','🧠':'bulb','🗳':'vote','✅':'ok','❌':'no','🔥':'flame','👍':'thumb','⚡':'zap',
'🌐':'globe','🎁':'gift','📦':'box','🌅':'sun','🖥':'monitor','📘':'book','📚':'book','🚗':'car','🍽':'food','🤒':'thermo','🚫':'ban','🚀':'rocket','🔎':'search','🔍':'search','🔗':'link','🕵':'search','🎙':'mic','🎮':'game','💌':'mail'};
function svg(k){var f=/\*$/.test(k),c=(k.split('#')[1]||'');k=k.replace(/[*]|#.*$/g,'');return '<svg class="ui-ic'+(f?' f':'')+(c?' m'+c:'')+'" viewBox="0 0 24 24" fill="'+(f?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+P[k]+'</svg>';}
window.uiIcon=function(n){return P[n]?svg(n):'';};
var keys=Object.keys(M).sort(function(a,b){return b.length-a.length;});
var RX=new RegExp('('+keys.map(function(k){return k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|')+')\\uFE0F?','g');
var SKIP='.trout,.qzbt,.stkg,.cm2t,.chb,.lvm,.cm2bar .cmemo,.grx,.chr,.chrp,.livetag,.slw,.svqe,.lkav,.lkt,.cmemo,.stcol,.svvr,.msgbody,.igm,.igpb,.igcm .cmb>div,.sorbar,.sorsum,.msgreact,.svr1,.svcap,.soce,.s3ce,.iggrp,.igst,.chatlast,.iglast,.igrep,.igpin,.soshared,.somoment p,.s3mem p,.s3qa,.s3my,.s3q p,.s3ansb p,.s3ann p,.sopoll,.svstk,.svbar,#igCtx,.igreacts,.chatreacts,.mood,.moodpick,.sochips,.fpchal,.s3th,.sorpick,.igvoice,.sotag,.svfoot,.sorx,.no-ic,[contenteditable]';
var NOTAG={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,SELECT:1,OPTION:1,svg:1,SVG:1,TITLE:1,CODE:1,PRE:1};
function fix(root){if(!root)return;if(root.nodeType===3){one(root);return;}if(root.nodeType!==1||NOTAG[root.nodeName])return;if(root.id==='chatMsgs'||(root.closest&&root.closest('#chatMsgs,.cmlist,#igPosts .igcap,.trout')))return;
 var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),l=[],n;while((n=w.nextNode())){RX.lastIndex=0;if(RX.test(n.nodeValue))l.push(n);}l.forEach(one);}
function one(t){var p=t.parentNode;if(!p||p.nodeType!==1||NOTAG[p.nodeName]||p.closest('svg'))return;RX.lastIndex=0;if(!RX.test(t.nodeValue))return;if(p.closest(SKIP))return;
 var s=t.nodeValue,h='',last=0;RX.lastIndex=0;var m;while((m=RX.exec(s))){h+=esc0(s.slice(last,m.index))+svg(M[m[1]]);last=RX.lastIndex;}h+=esc0(s.slice(last));
 var sp=document.createElement('span');sp.innerHTML=h;var fr=document.createDocumentFragment();while(sp.firstChild)fr.appendChild(sp.firstChild);p.replaceChild(fr,t);}
function esc0(x){return x.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
var Q=[],sch=false;function flush(){sch=false;var q=Q;Q=[];q.forEach(function(n){if(n.isConnected)fix(n);});}
var mo=new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='characterData')Q.push(m.target);else m.addedNodes.forEach(function(n){Q.push(n);});});if(!sch&&Q.length){sch=true;requestAnimationFrame(flush);}});
function start(){fix(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

;

/* ===================== SOSİAL v4: 10 funksiya ===================== */
var LVL={},LVLC=['#94a3b8','#22c55e','#0a84ff','#a855f7','#f59e0b'],AZAY=['yanvar','fevral','mart','aprel','may','iyun','iyul','avqust','sentyabr','oktyabr','noyabr','dekabr'];
var _bi4=badgeInfo;badgeInfo=function(c){if(/^streak/.test(c))return ['🔥',c.slice(6)+' günlük seriya'];if(/^league_/.test(c))return ['🏆','Həftənin şöbəsi'];if(/^quiz_/.test(c))return ['🎯','Viktorina qalibi'];return _bi4(c);};
function lvlLoad(){return run(sb.rpc('lvl_map')).then(function(m){LVL=m||{};return LVL;}).catch(function(){return LVL;});}

/* ---- seqmentlər ---- */
var _feedSeg4=feedSeg;
feedSeg=function(){_feedSeg4();var el=$('soSeg');if(!el||el.querySelector('[data-f]'))return;var t=el.querySelector('button[onclick*="\'team\'"]');var h='<button data-f="1" class="'+(FMODE==='fun'||FMODE==='quizzes'?'on':'')+'" onclick="feedMode(\'fun\')">🎮 Əyləncə</button>';if(t)t.insertAdjacentHTML('afterend',h);else el.insertAdjacentHTML('beforeend',h);
 if(FMODE==='shop'&&t)t.classList.add('on');};
var _feedMode4=feedMode;
feedMode=function(m,arg){if(m==='fun'||m==='shop'){FMODE=m;FARG=arg||null;if(!$('soBody')){show('feed');setTimeout(function(){feedMode(m,arg);},300);return;}feedSeg();var b=$('soBody');b.innerHTML='<p class="status"><span class="spin"></span>Yüklənir…</p>';return m==='fun'?funRender():shopRender();}
 _feedMode4(m,arg);if(m==='all')s4allExtras();};

/* ---- KOMANDA əlavələri: mağaza, seriya, liqa ---- */
function s4team(){var box=$('s4Team');if(!box)return;Promise.all([run(sb.rpc('shop_state')).catch(function(){return null;}),run(sb.rpc('streak_state')).catch(function(){return null;}),run(sb.rpc('league_state')).catch(function(){return null;})]).then(function(r){
 var s=r[0],st=r[1]||{},lg=r[2]||{},h='';if(!$('s4Team'))return;
 if(s){var L=s.lvl,pc=L.next?Math.round((s.earned-L.min)*100/(L.next-L.min)):100;
  h+='<div class="s4wal" onclick="feedMode(\'shop\')"><div class="s4lv" style="--lc:'+LVLC[L.n]+'"><b>'+(L.n+1)+'</b></div><div style="flex:1;min-width:0"><small>Səviyyə · '+esc(L.name)+'</small><div class="s4bar"><i style="width:'+pc+'%;background:'+LVLC[L.n]+'"></i></div><small>'+(L.next?(L.next-s.earned)+' xal sonra növbəti səviyyə':'Ən yüksək səviyyə')+'</small></div><div class="s4bal"><b>'+s.balance+'</b><small>xal</small></div><span class="s4go">Mağaza ›</span></div>';}
 var nx=function(v){return v<7?7:v<30?30:v<100?100:null;};
 h+='<div class="s4str"><div><span class="s4fl">🔥</span><b>'+(st.ontime||0)+'</b><small>gün ardıcıl vaxtında</small>'+(nx(st.ontime||0)?'<i>'+nx(st.ontime||0)+' gündə nişan</i>':'')+'</div><div><span class="s4fl">💭</span><b>'+(st.qotd||0)+'</b><small>gün günün sualı</small>'+(nx(st.qotd||0)?'<i>'+nx(st.qotd||0)+' gündə nişan</i>':'')+'</div></div>';
 var rows=lg.rows||[];h+='<div class="igsec row sp"><span>🏆 Şöbələr liqası · bu həftə</span><small class="muted">B.e. 09:00-da bitir</small></div>';
 if(rows.length<2)h+='<div class="s3card"><p class="small">Liqa üçün ən azı 2 şöbə lazımdır. Hazırda bütün işçilər bir şöbədədir'+(rows[0]?' ('+esc(rows[0].name)+')':'')+'. '+(SOC_MOD?'İşçilər bölməsindən şöbələri ayırın, liqa avtomatik başlayacaq.':'Rəhbərlik şöbələri ayıranda liqa başlayacaq.')+'</p></div>';
 else h+=rows.map(function(d,i){return '<div class="s4lg'+(d.mine?' mine':'')+'"><span class="s3rk">'+(i<3?['🥇','🥈','🥉'][i]:i+1)+'</span><div style="flex:1;min-width:0"><b>'+esc(d.name)+'</b><small>'+d.n+' nəfər · lider: '+esc(d.top?d.top.ad:'')+'</small></div><div class="s4lgp"><b>'+d.avg+'</b><small>orta xal</small></div></div>';}).join('')+(lg.last?'<p class="hint">Keçən həftə: <b>'+esc(lg.last.name)+'</b></p>':'');
 box.innerHTML=h;}).catch(function(){});}

/* ---- MAĞAZA ---- */
function shopRender(){var b=$('soBody');run(sb.rpc('shop_state')).then(function(s){if(FMODE!=='shop'||!s)return;var L=s.lvl,pc=L.next?Math.round((s.earned-L.min)*100/(L.next-L.min)):100;var ST={pending:['⏳','Gözləyir'],done:['✅','Təsdiqləndi'],rejected:['❌','Rədd edildi']};
 var h='<div class="sohdr"><button class="igicon" onclick="feedMode(\'team\')">'+IGI.back+'</button><h3>🎁 Xal mağazası</h3></div>'
  +'<div class="s4hero"><div><small>BALANSIN</small><b>'+s.balance+' xal</b><small>Cəmi qazanılıb: '+s.earned+' · xərclənib: '+s.spent+'</small></div><div class="s4lv big" style="--lc:'+LVLC[L.n]+'"><b>'+(L.n+1)+'</b><small>'+esc(L.name)+'</small></div><div class="s4bar w"><i style="width:'+pc+'%"></i></div><small style="opacity:.8">'+(L.next?'Növbəti səviyyəyə '+(L.next-s.earned)+' xal':'Əfsanə səviyyəsindəsən 👑')+'</small></div>'
  +'<div class="s4levels">'+['Yeni','Fəal','Təcrübəli','Ulduz','Əfsanə'].map(function(n,i){return '<span class="'+(i<=L.n?'on':'')+'" style="--lc:'+LVLC[i]+'"><i></i>'+n+'<small>'+[0,100,300,700,1500][i]+'</small></span>';}).join('')+'</div>'
  +'<div class="igsec row sp"><span>Mükafatlar</span>'+(s.mod?'<button class="btn sm" onclick="rwEdit()">+ Mükafat</button>':'')+'</div><div class="s4rw">'
  +(s.rewards||[]).map(function(r){var can=s.balance>=r.cost&&r.active&&(r.left==null||r.left>0);return '<div class="s4rwi'+(r.active?'':' off')+'"><span class="s4rwe">'+esc(r.emoji)+'</span><b>'+esc(r.title)+'</b><small>'+(r.left!=null?r.left+' ədəd qalıb':'')+(r.active?'':' · deaktiv')+'</small><button class="btn sm'+(can?'':' ghost')+'" '+(can?'onclick="shopBuy('+r.id+',\''+chatArg(r.title)+'\','+r.cost+')"':'disabled')+'>'+r.cost+' xal</button>'+(s.mod?'<a class="igtxt" onclick="rwEdit('+r.id+')">Redaktə</a>':'')+'</div>';}).join('')+'</div>';
 if(s.mod&&s.pending&&s.pending.length)h+='<div class="igsec">Təsdiq gözləyənlər ('+s.pending.length+')</div>'+s.pending.map(function(p){return '<div class="igrow">'+chatAva(p.ad,p.photo,36)+'<div class="igmeta"><div class="igname">'+esc(p.ad)+'</div><div class="iglast">'+esc(p.title)+' · '+p.cost+' xal</div></div><button class="btn sm" onclick="shopDecide('+p.id+',true)">Təsdiq</button><button class="btn sm ghost" onclick="shopDecide('+p.id+',false)">✕</button></div>';}).join('');
 if(s.my&&s.my.length)h+='<div class="igsec">Mənim sorğularım</div>'+s.my.map(function(x){var t=ST[x.status]||['',x.status];return '<div class="igrow"><div class="igmeta"><div class="igname">'+esc(x.title)+'</div><div class="iglast">'+x.cost+' xal · '+chatAgo(x.at)+'</div></div><span class="s3pill">'+t[0]+' '+t[1]+'</span></div>';}).join('');
 h+='<p class="hint" style="margin-top:12px">Xal post, şərh, təşəkkür, vaxtında gəliş, çağırış, viktorina və oyunlardan toplanır. Mükafatı rəhbərlik təsdiqləyir, rədd olunsa xal geri qaytarılır.</p>';
 window._rw=s.rewards;b.innerHTML=h;}).catch(err);}
function shopBuy(id,t,c){if(!confirm('"'+t+'" — '+c+' xal xərclənsin?'))return;run(sb.rpc('shop_buy',{p_reward:id})).then(function(){toast('🎁 Sorğu göndərildi, rəhbərlik təsdiqləyəcək');s4confetti(1200);shopRender();}).catch(err);}
function shopDecide(id,ok){run(sb.rpc('shop_decide',{p_id:id,p_ok:ok})).then(shopRender).catch(err);}
function rwEdit(id){var r=(window._rw||[]).find(function(x){return x.id===id;})||{emoji:'🎁',active:true};
 modal('<div class="mhead"><h3>'+(id?'Mükafatı redaktə et':'Yeni mükafat')+'</h3><button class="x" onclick="closeModal()">×</button></div><div class="row" style="gap:6px"><input id="rwE" value="'+esc(r.emoji||'🎁')+'" maxlength="4" style="width:58px;text-align:center;font-size:1.3rem"><input id="rwT" value="'+esc(r.title||'')+'" maxlength="80" placeholder="Kino bileti" style="flex:1"></div><div class="row" style="gap:6px;margin-top:10px"><div class="field" style="flex:1"><label>Qiymət (xal)</label><input id="rwC" type="number" min="1" value="'+(r.cost||100)+'"></div><div class="field" style="flex:1"><label>Say (boş = limitsiz)</label><input id="rwS" type="number" min="0" value="'+(r.stock==null?'':r.stock)+'"></div></div><label class="s3sw"><input type="checkbox" id="rwA" '+(r.active?'checked':'')+'><span></span>Aktiv</label><button class="btn" style="width:100%" onclick="rwSave('+(id||'null')+')">Yadda saxla</button>');}
function rwSave(id){var t=$('rwT').value.trim(),c=+$('rwC').value;if(!t||!(c>0)){toast('Ad və qiymət lazımdır');return;}var s=$('rwS').value;
 run(sb.rpc('shop_reward_save',{p_id:id,p_title:t,p_emoji:$('rwE').value.trim(),p_cost:c,p_stock:s===''?null:+s,p_active:$('rwA').checked})).then(function(){closeModal();shopRender();}).catch(err);}

/* ---- ƏYLƏNCƏ ---- */
function funRender(){var b=$('soBody');Promise.all([run(sb.rpc('quiz_list')).catch(function(){return [];}),run(sb.rpc('room_list')).catch(function(){return [];}),run(sb.rpc('comp_state')).catch(function(){return null;})]).then(function(r){if(FMODE!=='fun')return;var qz=r[0]||[],rm=r[1]||[],cp=r[2]||{},h='';
 var live=qz.filter(function(q){return q.status==='live';});
 live.forEach(function(q){h+='<div class="s4live" onclick="quizOpen(\''+q.id+'\')"><span class="s4dot"></span><div style="flex:1"><small>CANLI VİKTORİNA</small><b>'+esc(q.title)+'</b><small>'+q.players+' oyunçu qoşulub</small></div><button class="btn">Qoşul</button></div>';});
 /* səsli otaqlar */
 h+='<div class="igsec row sp"><span>🎙 Səsli otaqlar</span><button class="btn sm" onclick="roomNew()">+ Otaq aç</button></div>';
 h+=rm.length?rm.map(function(x){return '<div class="s4room" onclick="roomJoin(\''+x.id+'\')"><span class="s4re">'+esc(x.emoji)+'</span><div style="flex:1;min-width:0"><b>'+esc(x.title)+'</b><small>'+esc(x.by?x.by.ad:'')+' açıb · '+x.members.length+' nəfər danışır</small><div class="soevf">'+x.members.slice(0,6).map(function(m){return chatAva(m.ad,m.photo,24);}).join('')+'</div></div><button class="btn sm">Qoşul</button></div>';}).join(''):'<p class="hint">Hazırda açıq otaq yoxdur. "Cümə çayı" kimi bir otaq aç, komanda qoşulsun.</p>';
 /* bu kimdir */
 h+='<div class="igsec">🕵️ Bu kimdir?</div><div class="s3card s4gs" id="s4G"><p class="small">Maraqlı faktlardan həmkarını tap. Hər düzgün cavab <b>+3 xal</b>, gündə 10 raund.</p><button class="btn" style="width:100%" onclick="guessNext()">Oyna</button></div>';
 /* kompliment */
 h+='<div class="igsec">💌 Anonim kompliment</div><div class="s3card"><p class="small">Həftədə bir dəfə həmkarına anonim xoş söz göndər. Adın heç kimə görünmür. Göndərilmədən əvvəl yoxlanılır.</p>'
  +(cp.can?'<button class="btn" style="width:100%" onclick="compNew()">Kompliment göndər</button>':'<p class="s3my">✓ Bu həftə göndərmisən. Bazar ertəsi yenidən!</p>')
  +(cp.mine&&cp.mine.length?'<div class="igsec" style="margin-top:12px;font-size:.95rem">Sənə gələnlər ('+cp.mine.length+')</div>'+cp.mine.map(function(c){return '<div class="s4cm">💌 '+esc(c.body)+'<small>'+chatAgo(c.at)+'</small></div>';}).join(''):'')
  +(cp.queue&&cp.queue.length?'<div class="igsec" style="margin-top:12px;font-size:.95rem">Yoxlama gözləyir ('+cp.queue.length+')</div>'+cp.queue.map(function(c){return '<div class="s4cm q"><small>Kimə: '+esc(c.to.ad)+'</small>'+esc(c.body)+'<div class="row" style="gap:6px;margin-top:6px"><button class="btn sm" onclick="compDecide('+c.id+',true)">Təsdiq</button><button class="btn sm ghost" onclick="compDecide('+c.id+',false)">Rədd</button></div></div>';}).join(''):'')+'</div>';
 /* viktorinalar */
 h+='<div class="igsec row sp"><span>🎯 Viktorinalar</span>'+(SOC_MOD?'<button class="btn sm" onclick="quizEdit()">+ Yarat</button>':'')+'</div>';
 var rest=qz.filter(function(q){return q.status!=='live';});
 h+=rest.length?rest.map(function(q){return '<div class="igrow"><span class="s4qi">🎯</span><div class="igmeta"><div class="igname">'+esc(q.title)+'</div><div class="iglast">'+q.n+' sual · '+(q.status==='draft'?'qaralama':(q.winner?'qalib: '+esc(q.winner.ad):'bitib')+' · '+q.players+' oyunçu')+'</div></div>'
  +(q.status==='draft'?'<button class="btn sm" onclick="quizStart(\''+q.id+'\')">▶ Başlat</button><button class="btn sm ghost" onclick="quizEdit(\''+q.id+'\')">✎</button>':'<button class="btn sm ghost" onclick="quizOpen(\''+q.id+'\')">Nəticə</button>')+'</div>';}).join(''):'<p class="hint">'+(SOC_MOD?'Cümə günü 5 dəqiqəlik viktorina yarat — hamı telefondan eyni anda oynayır.':'Rəhbərlik viktorina başladanda bildiriş gələcək.')+'</p>';
 window._qz=qz;b.innerHTML=h;}).catch(err);}

/* ---- BU KİMDİR ---- */
function guessNext(){var el=$('s4G');if(!el)return;el.innerHTML='<p class="status"><span class="spin"></span></p>';run(sb.rpc('guess_next')).then(function(g){if(!g||g.empty){el.innerHTML='<p class="hint">Hələ oyun üçün kifayət qədər məlumat yoxdur.</p>';return;}
 if(g.done){el.innerHTML='<div class="s4gd"><b>Bu günlük bitdi 🎉</b><p>Bu gün: <b>'+g.score+'/'+g.today+'</b> düzgün · +'+g.score*3+' xal</p><small>Sabah yeni raundlar!</small></div>';return;}
 el.innerHTML='<div class="row sp"><small class="muted">Raund '+(g.today+1)+'/10</small><small class="muted">Xal: '+g.score*3+'</small></div><b style="display:block;margin:6px 0">Bu kimdir?</b><div class="s4clue">'+(g.clues||[]).map(function(c){return '<div>'+esc(c)+'</div>';}).join('')+'</div>'
  +'<div class="s4opts">'+g.opts.map(function(o){return '<button data-u="'+o.uid+'" onclick="guessPick('+g.id+',this)">'+chatAva(o.ad,o.photo,30)+'<span>'+esc(o.ad)+'</span></button>';}).join('')+'</div>';}).catch(err);}
function guessPick(id,el){var bs=el.parentNode.querySelectorAll('button');Array.prototype.forEach.call(bs,function(b){b.disabled=true;});run(sb.rpc('guess_answer',{p_id:id,p_pick:el.dataset.u})).then(function(r){
 Array.prototype.forEach.call(bs,function(b){if(b.dataset.u===r.target.uid)b.classList.add('ok');});if(!r.ok)el.classList.add('bad');else s4confetti(900);try{navigator.vibrate&&navigator.vibrate(r.ok?20:[40,40,40]);}catch(e){}
 $('s4G').insertAdjacentHTML('beforeend','<div class="s4res '+(r.ok?'ok':'bad')+'">'+(r.ok?'Düzdür! +3 xal':'Bu '+esc(r.target.ad)+' idi')+'</div><div class="row" style="gap:6px;margin-top:8px"><button class="btn" style="flex:1" onclick="guessNext()">Növbəti ›</button><button class="btn ghost" onclick="socProfile(\''+r.target.uid+'\')">Profil</button></div>');}).catch(err);}

/* ---- KOMPLİMENT ---- */
function compNew(){s3pick('Kimə?',function(uid,ad){modal('<div class="mhead"><h3>💌 '+esc(ad)+'</h3><button class="x" onclick="closeModal()">×</button></div><textarea id="cpB" maxlength="300" style="width:100%;min-height:110px" placeholder="Məs: Hər səhər hamını gülümsətdiyin üçün sağ ol!"></textarea><p class="hint">Anonimdir. Yoxlandıqdan sonra çatdırılır. Həftədə 1 dəfə.</p><button class="btn" style="width:100%" onclick="compGo(\''+uid+'\')">Göndər</button>');},true);}
function compGo(uid){run(sb.rpc('comp_send',{p_to:uid,p_body:$('cpB').value})).then(function(){closeModal();toast('💌 Göndərildi, yoxlamadan sonra çatacaq');funRender();}).catch(err);}
function compDecide(id,ok){run(sb.rpc('comp_decide',{p_id:id,p_ok:ok})).then(funRender).catch(err);}

/* ---- CANLI VİKTORİNA ---- */
var _qz=null;var QC=['#e21b3c','#1368ce','#d89e00','#26890c'],QS=['▲','◆','●','■'];
function quizEdit(id){var q=id?(window._qz||[]).find(function(x){return x.id===id;}):null;window._qe={id:id||null,title:q?q.title:'',qs:q&&q.questions?JSON.parse(JSON.stringify(q.questions)):[{q:'',opts:['','','',''],ok:0}]};quizEditDraw();}
function quizEditDraw(){var e=window._qe;modal('<div class="mhead"><h3>🎯 Viktorina</h3><button class="x" onclick="closeModal()">×</button></div><input id="qeT" value="'+esc(e.title)+'" placeholder="Ad: Cümə viktorinası" maxlength="100" style="width:100%" oninput="window._qe.title=this.value"><div style="max-height:55vh;overflow-y:auto;margin-top:10px">'
 +e.qs.map(function(q,i){return '<div class="s4qe"><div class="row sp"><b>Sual '+(i+1)+'</b>'+(e.qs.length>1?'<a class="igtxt" onclick="window._qe.qs.splice('+i+',1);quizEditDraw()">Sil</a>':'')+'</div><input value="'+esc(q.q)+'" placeholder="Sual mətni" maxlength="160" oninput="window._qe.qs['+i+'].q=this.value">'
  +q.opts.map(function(o,k){return '<div class="s4qo"><button class="'+(q.ok===k?'on':'')+'" style="--qc:'+QC[k]+'" onclick="window._qe.qs['+i+'].ok='+k+';quizEditDraw()" title="Düzgün cavab">'+(q.ok===k?'✓':QS[k])+'</button><input value="'+esc(o)+'" placeholder="Variant '+(k+1)+(k>1?' (istəyə görə)':'')+'" maxlength="70" oninput="window._qe.qs['+i+'].opts['+k+']=this.value"></div>';}).join('')+'</div>';}).join('')
 +'</div><button class="btn ghost" style="width:100%;margin-top:8px" onclick="window._qe.qs.push({q:\'\',opts:[\'\',\'\',\'\',\'\'],ok:0});quizEditDraw()">+ Sual</button><p class="hint">Rəngli düyməyə toxunaraq düzgün cavabı seç. Hər sual 20 saniyə.</p><button class="btn" style="width:100%" onclick="quizSave()">Yadda saxla</button>');}
function quizSave(){var e=window._qe,qs=[];for(var i=0;i<e.qs.length;i++){var q=e.qs[i],o=q.opts.map(function(x){return (x||'').trim();});var ok=o[q.ok]?q.ok:-1;var keep=[],nok=0;o.forEach(function(x,k){if(x){if(k===q.ok)nok=keep.length;keep.push(x);}});
  if(!(q.q||'').trim()||keep.length<2||ok<0){toast('Sual '+(i+1)+': mətn, ən azı 2 variant və düzgün cavab lazımdır');return;}qs.push({q:q.q.trim(),opts:keep,ok:nok});}
 if(!(e.title||'').trim()){toast('Ad yazın');return;}run(sb.rpc('quiz_save',{p_id:e.id,p_title:e.title.trim(),p_questions:qs})).then(function(){closeModal();toast('Yadda saxlanıldı');funRender();}).catch(err);}
function quizStart(id){if(!confirm('Viktorina başlasın? Hamıya bildiriş gedəcək.'))return;run(sb.rpc('quiz_start',{p_id:id})).then(function(){quizOpen(id);}).catch(err);}
function quizOpen(id){if(_qz)quizClose();var o=document.createElement('div');o.id='s4quiz';o.innerHTML='<div class="s4qin"><p class="status" style="color:#fff"><span class="spin"></span></p></div>';document.body.appendChild(o);document.body.classList.add('incall');
 _qz={id:id,t:null,last:'',sent:{}};sb.rpc('quiz_join',{p_id:id}).then(function(){},function(){});quizTick();_qz.t=setInterval(quizTick,1000);}
function quizClose(){if(_qz)clearInterval(_qz.t);_qz=null;var o=$('s4quiz');if(o)o.remove();document.body.classList.remove('incall');if(FMODE==='fun')funRender();}
function quizTick(){if(!_qz)return;var id=_qz.id;sb.rpc('quiz_state',{p_id:id}).then(function(r){if(!_qz||_qz.id!==id)return;var s=r.data;if(!s)return;quizDraw(s);},function(){});}
function quizDraw(s){var el=document.querySelector('#s4quiz .s4qin');if(!el)return;var key=[s.status,s.cur,s.reveal,!!s.my,s.players,s.answered].join('|');var tb=$('s4qt');
 if(key===_qz.last){if(tb&&s.left!=null)tb.style.width=(s.left/20*100)+'%';var n=$('s4qn');if(n&&s.left!=null)n.textContent=Math.ceil(s.left);return;}_qz.last=key;
 var top='<div class="s4qh"><button onclick="quizClose()">✕</button><b>'+esc(s.title)+'</b><span>'+(s.cur>=0&&s.status==='live'?(s.cur+1)+'/'+s.n:'')+'</span></div>',h='';
 var board=function(lim){return '<div class="s4qb">'+(s.board||[]).slice(0,lim).map(function(u,i){return '<div class="'+(u.uid===ME.user_id?'me':'')+'"><span>'+(i+1)+'</span>'+chatAva(u.ad,u.photo,30)+'<b>'+esc(u.ad)+'</b><em>'+u.pts+'</em></div>';}).join('')+'</div>';};
 if(s.status==='done'){var b=s.board||[],pod=[1,0,2].map(function(i){var u=b[i];return u?'<div class="p'+(i+1)+'">'+chatAva(u.ad,u.photo,i?48:64)+'<b>'+esc(u.ad.split(' ')[0])+'</b><em>'+u.pts+'</em><span>'+(i+1)+'</span></div>':'<div></div>';}).join('');
  h='<div class="s4qd"><b>🏆 Nəticələr</b><div class="s4pod">'+pod+'</div><p>Sənin xalın: <b>'+s.mytot+'</b></p>'+board(10)+'<button class="btn" onclick="quizClose()">Bağla</button></div>';if(!_qz.conf){_qz.conf=1;s4confetti(2500);}}
 else if(s.cur<0)h='<div class="s4ql"><div class="s4big">🎯</div><b>Başlamağa hazırlaşırıq…</b><p>'+s.players+' oyunçu qoşulub</p>'+(s.host?'<button class="btn" onclick="quizNext()">▶ Başla</button>':'<small>Aparıcı başladanda sual çıxacaq</small>')+'</div>';
 else{var q=s.q||{};h='<div class="s4qq"><div class="s4qtm"><i id="s4qt" style="width:'+(s.left/20*100)+'%"></i></div><div class="row sp"><span id="s4qn" class="s4qnum">'+Math.ceil(s.left||0)+'</span><small>'+s.answered+'/'+s.players+' cavab</small></div><h2>'+esc(q.q||'')+'</h2><div class="s4qa">'
  +(q.opts||[]).map(function(o,k){var my=s.my&&s.my.opt===k,cls=s.reveal?(k===s.ok?'ok':my?'bad':'dim'):(s.my?(my?'sel':'dim'):'');var c=s.counts&&s.counts[k]||0;
   return '<button class="'+cls+'" style="--qc:'+QC[k]+'" '+(!s.my&&!s.reveal?'onclick="quizAns('+k+')"':'disabled')+'><i>'+QS[k]+'</i><span>'+esc(o)+'</span>'+(s.reveal?'<em>'+c+'</em>':'')+'</button>';}).join('')+'</div>'
  +(s.reveal?'<div class="s4qr '+(s.my&&s.my.pts>0?'ok':'bad')+'">'+(s.my?(s.my.pts>0?'Düzdür! +'+s.my.pts:'Səhv'):'Cavab vermədin')+'</div>'+board(5)+(s.host?'<button class="btn" style="width:100%" onclick="quizNext()">'+(s.cur+1>=s.n?'🏁 Nəticələr':'Növbəti ›')+'</button>':'<small style="display:block;text-align:center;opacity:.7;margin-top:8px">Növbəti sual gözlənilir…</small>')
   :(s.my?'<div class="s4qr">✓ Cavab qəbul edildi</div>':''))+'</div>';
  if(s.reveal&&s.my&&s.my.pts>0&&!_qz.sent['c'+s.cur]){_qz.sent['c'+s.cur]=1;s4confetti(800);}}
 el.innerHTML=top+h;}
function quizAns(k){if(!_qz)return;var id=_qz.id;try{navigator.vibrate&&navigator.vibrate(15);}catch(e){}run(sb.rpc('quiz_answer',{p_id:id,p_opt:k})).then(function(){_qz.last='';quizTick();}).catch(err);}
function quizNext(){if(!_qz)return;run(sb.rpc('quiz_next',{p_id:_qz.id})).then(function(){_qz.last='';quizTick();}).catch(err);}

/* ---- SƏSLİ OTAQ (WebRTC mesh) ---- */
var _rm=null;
function roomNew(){modal('<div class="mhead"><h3>🎙 Yeni otaq</h3><button class="x" onclick="closeModal()">×</button></div><div class="row" style="gap:6px"><input id="rmE" value="☕" maxlength="4" style="width:58px;text-align:center;font-size:1.3rem"><input id="rmT" maxlength="60" placeholder="Cümə çayı" style="flex:1"></div><p class="hint">Hamıya bildiriş gedəcək. 10 nəfərə qədər.</p><button class="btn" style="width:100%" onclick="roomCreate()">Aç və qoşul</button>');}
function roomCreate(){run(sb.rpc('room_create',{p_title:$('rmT').value.trim()||'Söhbət',p_emoji:$('rmE').value.trim()})).then(function(id){closeModal();roomJoin(id);}).catch(err);}
function roomJoin(id){if(_rm){if(_rm.id===id){roomMax();return;}roomLeave();}
 if(typeof CALL!=='undefined'&&CALL){toast('Əvvəlcə zəngi bitirin');return;}
 navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}).then(function(st){
  return Promise.all([run(sb.rpc('room_join',{p_id:id})),callIce()]).then(function(r){_rm={id:id,st:st,ice:r[1],peers:{},after:0,muted:false,hand:false,mem:[],t:null,joined:Date.now()};roomUI();roomPoll();_rm.t=setInterval(roomPoll,1200);});
 }).catch(function(e){toast(e&&e.message&&/Permission|denied/i.test(e.name+e.message)?'Mikrofona icazə verin':(e.message||e));});}
function roomUI(){var o=$('s4room');if(!o){o=document.createElement('div');o.id='s4room';document.body.appendChild(o);}o.className='';
 o.innerHTML='<div class="s4rh"><button onclick="roomMin()" title="Kiçilt">⌄</button><div><b id="s4rt">Otaq</b><small id="s4rn"></small></div><span></span></div><div class="s4rg" id="s4rg"></div><div class="s4rc"><button id="s4rm" onclick="roomMute()">🎤</button><button id="s4rha" onclick="roomHand()">✋</button><button class="lv" onclick="roomLeave()">Çıx</button></div><div class="s4rpill" onclick="roomMax()"><span class="s4dot"></span><b id="s4rp">Otaq</b><small>açmaq üçün toxun</small></div>';}
function roomMin(){var o=$('s4room');if(o)o.className='min';}
function roomMax(){var o=$('s4room');if(o)o.className='';}
function roomPoll(){if(!_rm)return;var R=_rm;sb.rpc('room_poll',{p_id:R.id,p_muted:R.muted,p_hand:R.hand,p_after:R.after}).then(function(r){if(_rm!==R||!r.data)return;var d=r.data;
 if(d.room&&d.room.closed){toast('Otaq bağlandı');roomLeave();return;}
 R.mem=d.members||[];var t=$('s4rt');if(t&&d.room)t.textContent=d.room.emoji+' '+d.room.title;var p=$('s4rp');if(p&&d.room)p.textContent=d.room.emoji+' '+d.room.title+' · '+R.mem.length;var n=$('s4rn');if(n)n.textContent=R.mem.length+' nəfər';
 (d.sig||[]).forEach(function(s){R.after=Math.max(R.after,s.id);roomOnSig(s.from,s.p);});
 var me=R.mem.find(function(m){return m.uid===ME.user_id;});var ids=R.mem.map(function(m){return m.uid;});
 R.mem.forEach(function(m){if(m.uid===ME.user_id||R.peers[m.uid])return;if(me&&new Date(me.joined)>new Date(m.joined))roomCall(m.uid);});
 Object.keys(R.peers).forEach(function(u){if(ids.indexOf(u)<0){roomDrop(u);}});
 roomDraw();},function(){});}
function roomPC(u){var R=_rm,pc=new RTCPeerConnection({iceServers:R.ice}),P={pc:pc,q:[],a:null};R.peers[u]=P;
 R.st.getTracks().forEach(function(t){pc.addTrack(t,R.st);});
 pc.onicecandidate=function(e){if(e.candidate)sb.rpc('room_sig',{p_id:R.id,p_to:u,p_payload:{t:'ice',c:e.candidate.toJSON()}}).then(function(){},function(){});};
 pc.ontrack=function(e){if(!P.a){P.a=new Audio();P.a.autoplay=true;P.a.playsInline=true;}P.a.srcObject=e.streams[0];P.a.play().catch(function(){});};
 pc.onconnectionstatechange=function(){if(pc.connectionState==='failed'){roomDrop(u);}roomDraw();};return P;}
function roomCall(u){var P=roomPC(u),pc=P.pc;pc.createOffer().then(function(o){return pc.setLocalDescription(o);}).then(function(){return sb.rpc('room_sig',{p_id:_rm.id,p_to:u,p_payload:{t:'offer',sdp:pc.localDescription.sdp}});}).catch(function(){});}
function roomOnSig(u,p){var R=_rm;if(!R||!p)return;var P=R.peers[u];
 if(p.t==='offer'){if(P)roomDrop(u);P=roomPC(u);var pc=P.pc;pc.setRemoteDescription({type:'offer',sdp:p.sdp}).then(function(){P.q.forEach(function(c){pc.addIceCandidate(c).catch(function(){});});P.q=[];return pc.createAnswer();}).then(function(a){return pc.setLocalDescription(a);}).then(function(){return sb.rpc('room_sig',{p_id:R.id,p_to:u,p_payload:{t:'answer',sdp:pc.localDescription.sdp}});}).catch(function(){});}
 else if(p.t==='answer'&&P){P.pc.setRemoteDescription({type:'answer',sdp:p.sdp}).then(function(){P.q.forEach(function(c){P.pc.addIceCandidate(c).catch(function(){});});P.q=[];}).catch(function(){});}
 else if(p.t==='ice'&&P){if(P.pc.remoteDescription)P.pc.addIceCandidate(p.c).catch(function(){});else P.q.push(p.c);}}
function roomDrop(u){var R=_rm;if(!R)return;var P=R.peers[u];if(!P)return;try{P.pc.close();}catch(e){}if(P.a){P.a.srcObject=null;}delete R.peers[u];}
function roomDraw(){var R=_rm,g=$('s4rg');if(!R||!g)return;g.innerHTML=R.mem.map(function(m){var me=m.uid===ME.user_id,P=R.peers[m.uid],cs=me?'connected':(P?P.pc.connectionState:'new');
 return '<div class="s4rp'+(m.muted?' mu':'')+'">'+chatAva(m.ad,m.photo,64)+(m.hand?'<i class="hd">✋</i>':'')+(m.muted?'<i class="mt">🔇</i>':'')+'<b>'+esc(me?'Sən':m.ad.split(' ')[0])+'</b><small>'+(cs==='connected'?'':cs==='failed'?'bağlantı yoxdur':'qoşulur…')+'</small></div>';}).join('');
 var mb=$('s4rm');if(mb){mb.textContent=R.muted?'🔇':'🎤';mb.classList.toggle('off',R.muted);}var hb=$('s4rha');if(hb)hb.classList.toggle('on',R.hand);}
function roomMute(){if(!_rm)return;_rm.muted=!_rm.muted;_rm.st.getAudioTracks().forEach(function(t){t.enabled=!_rm.muted;});var me=_rm.mem.find(function(m){return m.uid===ME.user_id;});if(me)me.muted=_rm.muted;roomDraw();}
function roomHand(){if(!_rm)return;_rm.hand=!_rm.hand;var me=_rm.mem.find(function(m){return m.uid===ME.user_id;});if(me)me.hand=_rm.hand;roomDraw();}
function roomLeave(){var R=_rm;if(!R)return;_rm=null;clearInterval(R.t);Object.keys(R.peers).forEach(function(u){try{R.peers[u].pc.close();}catch(e){}});R.st.getTracks().forEach(function(t){t.stop();});sb.rpc('room_leave',{p_id:R.id}).then(function(){},function(){});var o=$('s4room');if(o)o.remove();if(FMODE==='fun')funRender();}
window.addEventListener('pagehide',function(){if(_rm)try{sb.rpc('room_leave',{p_id:_rm.id});}catch(e){}});

/* ---- KONFETTİ ---- */
function s4confetti(ms){ms=ms||2000;var c=document.createElement('canvas');c.className='s4conf';document.body.appendChild(c);var W=c.width=innerWidth*devicePixelRatio,H=c.height=innerHeight*devicePixelRatio,x=c.getContext('2d'),cols=['#ff3b30','#ff9500','#ffcc00','#34c759','#0a84ff','#af52de','#ff2d55'],ps=[];
 for(var i=0;i<140;i++)ps.push({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*W*.022,vy:-Math.random()*H*.022-H*.006,s:(6+Math.random()*7)*devicePixelRatio,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:cols[i%cols.length]});
 var t0=Date.now();(function f(){var t=Date.now()-t0;x.clearRect(0,0,W,H);ps.forEach(function(p){p.vy+=H*.0006;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.globalAlpha=Math.max(0,1-t/(ms+800));x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore();});if(t<ms+800)requestAnimationFrame(f);else c.remove();})();}

/* ---- SATIŞ / sistem postları + konfetti ---- */
var _postCard4=postCard;
postCard=function(p){var T={sale:'🎉 Yeni satış',league:'🏆 Həftənin şöbəsi',quizwin:'🎯 Viktorina qalibi'};if(T[p.kind]){var h=_postCard4(Object.assign({},p,{kind:'welcome',ref:p.ref||{ad:'Baş Ofis',photo:null}}));return h.replace('👋 Yeni həmkar',T[p.kind]).replace('class="igpost sys','class="igpost sys s4'+p.kind);}return _postCard4(p);};
var _feedDraw4=feedDraw;feedDraw=function(){_feedDraw4();if(FMODE!=='all')return;var s=FEED.filter(function(p){return p.kind==='sale';}).sort(function(a,b){return a.at<b.at?1:-1;})[0];if(!s)return;var k='';try{k=localStorage.getItem('s4sale')||'';}catch(e){}
 if(s.at>k&&Date.now()-new Date(s.at)<3*86400000){try{localStorage.setItem('s4sale',s.at);}catch(e){}if(k)s4confetti(2600);else try{localStorage.setItem('s4sale',s.at);}catch(e){}}};

/* ---- WRAPPED ---- */
function s4allExtras(){var d=+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Baku',day:'numeric'}).format(new Date());if(d>5&&d<25)return;var n=new Date(),mo=d<=5?new Date(n.getFullYear(),n.getMonth()-1,1):n;var m=mo.getFullYear()+'-'+String(mo.getMonth()+1).padStart(2,'0');
 var go=function(){var c=document.querySelector('#soBody .igcompose');if(!c){return;}if($('s4W'))return;c.insertAdjacentHTML('afterend','<div id="s4W" class="s4wb" onclick="wrappedOpen(\''+m+'\')"><div><small>AYIN XÜLASƏN</small><b>Sənin '+AZAY[mo.getMonth()]+' ayın 🎬</b><small>Necə keçdi? Bax və paylaş</small></div><span>▶</span></div>');};setTimeout(go,50);}
var _wr=null;
function wrappedOpen(m){run(sb.rpc('wrapped',{p_month:m})).then(function(w){if(!w)return;var mn=AZAY[+w.month.slice(5,7)-1];var L=w.lvl||{n:0,name:'Yeni'};
 var S=[
  ['g1','<small>'+w.month.slice(0,4)+'</small><h1>Sənin<br>'+mn+' ayın</h1><p>Gəl, birlikdə baxaq 👀</p>'],
  ['g2','<small>İŞDƏ</small><h1>'+w.days+' gün</h1><p>ofisdə idin'+(w.hours?', cəmi <b>'+w.hours+' saat</b> işlədin':'')+'</p><div class="s4wk"><b>'+w.ontime+'</b> gün vaxtında gəldin '+(w.days&&w.ontime===w.days?'— mükəmməl! 🏅':'')+'</div>'],
  ['g3','<small>LENTDƏ</small><h1>'+w.posts+' post</h1><p><b>'+w.reacts+'</b> reaksiya topladın'+(w.topemoji?' — ən çox '+w.topemoji:'')+'</p><div class="s4wk">'+w.stories+' hekayə · '+w.qotd+' günün sualı</div>'],
  ['g4','<small>KOMANDA</small><h1>'+w.kget+' 🙌</h1><p>təşəkkür aldın, <b>'+w.kgive+'</b> dəfə özün təşəkkür etdin</p>'+(w.buddy?'<div class="s4wbud">'+chatAva(w.buddy.ad,w.buddy.photo,64)+'<p>Ən çox yazışdığın<br><b>'+esc(w.buddy.ad)+'</b><br><small>'+w.buddy.n+' mesaj</small></p></div>':'<div class="s4wk">'+w.msgs+' mesaj göndərdin</div>')],
  ['g5','<small>XALLAR</small><h1>'+w.pts+' xal</h1><p>komandada <b>#'+w.rank+'</b> yer</p><div class="s4wk">Səviyyə: <b>'+esc(L.name)+'</b></div><button class="btn s4wsh" onclick="event.stopPropagation();wrappedShare()">Lentdə paylaş</button>']];
 _wr={i:0,S:S,w:w,mn:mn};var o=document.createElement('div');o.id='s4wr';document.body.appendChild(o);document.body.classList.add('incall');wrappedShow();}).catch(err);}
function wrappedShow(){var R=_wr,o=$('s4wr');if(!R||!o)return;clearTimeout(R.t);var s=R.S[R.i];
 o.className=s[0];o.innerHTML='<div class="svbars">'+R.S.map(function(x,i){return '<i><b style="width:'+(i<R.i?100:0)+'%"'+(i===R.i?' id="s4wbar"':'')+'></b></i>';}).join('')+'</div><button class="s4wx" onclick="wrappedClose()">✕</button><div class="s4wc">'+s[1]+'</div><div class="svl" onclick="wrappedNav(-1)"></div><div class="svr" onclick="wrappedNav(1)"></div>';
 var b=$('s4wbar');if(b){b.style.transition='none';b.style.width='0';requestAnimationFrame(function(){b.style.transition='width 6s linear';b.style.width='100%';});}if(R.i<R.S.length-1)R.t=setTimeout(function(){wrappedNav(1);},6000);if(R.i===R.S.length-1)s4confetti(1800);}
function wrappedNav(d){if(!_wr)return;_wr.i=Math.max(0,Math.min(_wr.S.length-1,_wr.i+d));wrappedShow();}
function wrappedClose(){if(_wr)clearTimeout(_wr.t);_wr=null;var o=$('s4wr');if(o)o.remove();document.body.classList.remove('incall');}
function wrappedShare(){var w=_wr&&_wr.w;if(!w)return;var c=document.createElement('canvas');c.width=1080;c.height=1350;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#4f46e5');g.addColorStop(.55,'#9333ea');g.addColorStop(1,'#ec4899');x.fillStyle=g;x.fillRect(0,0,1080,1350);
 x.fillStyle='#fff';x.font='600 44px Inter,system-ui,sans-serif';x.fillText('BAŞ OFİS · '+_wr.mn.toUpperCase()+' '+w.month.slice(0,4),80,130);x.font='800 92px Inter,system-ui,sans-serif';x.fillText((ME.full_name||'').split(' ')[0]+'-in ayı',80,250);
 var it=[[w.days+' gün','ofisdə'],[w.ontime+' gün','vaxtında'],[w.posts+'','post'],[w.reacts+'','reaksiya'],[w.kget+'','təşəkkür aldı'],[w.pts+'','xal · #'+w.rank]];
 it.forEach(function(v,i){var cx=80+(i%2)*470,cy=360+Math.floor(i/2)*290;x.fillStyle='rgba(255,255,255,.14)';if(x.roundRect){x.beginPath();x.roundRect(cx,cy,440,250,36);x.fill();}else x.fillRect(cx,cy,440,250);x.fillStyle='#fff';x.font='800 84px Inter,system-ui,sans-serif';x.fillText(v[0],cx+40,cy+130);x.font='500 40px Inter,system-ui,sans-serif';x.globalAlpha=.85;x.fillText(v[1],cx+40,cy+195);x.globalAlpha=1;});
 x.font='600 40px Inter,system-ui,sans-serif';x.fillText('Səviyyə: '+((w.lvl&&w.lvl.name)||''),80,1290);
 c.toBlob(function(bl){var f=new File([bl],'wrapped.png',{type:'image/png'});toast('Paylaşılır…');chatUpload(f,'post').then(function(u){return run(sb.rpc('post_add3',{p_body:'📊 Mənim '+_wr.mn+' ayım Baş Ofisdə! #wrapped',p_media:[{url:u,kind:'image'}],p_poll:null,p_club:null,p_mentions:null,p_shared:null,p_challenge:null}));}).then(function(){toast('Lentdə paylaşıldı 🎉');wrappedClose();feedMode('all');}).catch(err);},'image/png');}

/* ---- PROFİL: səviyyə çərçivəsi ---- */
var _socProfile4=socProfile;
socProfile=function(uid){_socProfile4(uid);if(!uid||uid==='undefined')return;var n=0;var go=function(){var pr=document.querySelector('#mbox .soprof');var av=pr&&pr.querySelector('.sopav');if(!av||!window._prof){if(n++<40)setTimeout(go,100);return;}if(av.dataset.lv)return;var l=LVL[uid]||0;av.dataset.lv=1;av.style.setProperty('--lc',LVLC[l]);av.classList.add('s4fr');
 av.insertAdjacentHTML('beforeend','<span class="s4lvc" style="background:'+LVLC[l]+'">'+['Yeni','Fəal','Təcrübəli','Ulduz','Əfsanə'][l]+'</span>');};lvlLoad().then(go);};

/* ---- bildirişlər, dərin linklər ---- */
(function s4Init(){var go=function(){if(typeof ME==='undefined'||!ME||!ME.user_id||typeof sb==='undefined'){setTimeout(go,1500);return;}lvlLoad();
 var q=new URLSearchParams(location.search),k=['quiz','room','comp','wrapped'].find(function(x){return q.get(x);});if(!k)return;var v=q.get(k);try{history.replaceState(history.state,'',location.pathname);}catch(e){}
 setTimeout(function(){if(k==='quiz')quizOpen(v);else if(k==='room'){show('feed');feedMode('fun');}else if(k==='comp'){show('feed');feedMode('fun');}else if(k==='wrapped'){show('feed');wrappedOpen(v);}},900);};setTimeout(go,1700);})();

;

/* ===================== HEKAYƏ BAXICISI (Instagram üslubu) ===================== */
function stoAgo(iso){var s=Math.max(0,Math.floor((Date.now()-new Date(iso).getTime())/1000));if(s<60)return s+' san';var m=Math.floor(s/60);if(m<60)return m+' dəq';var h=Math.floor(m/60);if(h<24)return h+' saat';return Math.floor(h/24)+' gün';}
_storyShow0=function(){if(!_sv)return;var u=CHAT_STORIES[_sv.ui],it=u&&u.items[_sv.ii];if(!it){storyClose();return;}var el=$('igSV');clearInterval(_sv.t);
 _sv.el=0;_sv.paused=false;_sv.dur=5000;_sv.last=Date.now();
 var face=u.me?((typeof EMP!=='undefined'&&EMP&&EMP.photo)||u.photo):u.photo;
 el.innerHTML='<div class="svstage" id="svStage">'
  +'<div class="svmedia">'+(it.kind==='video'?'<video id="svm" src="'+esc(it.url)+'" autoplay playsinline></video>':'<img id="svm" src="'+esc(it.url)+'">')+'</div>'
  +'<div class="svshade"></div>'
  +'<div class="svbars">'+u.items.map(function(x,i){return '<i><b style="width:'+(i<_sv.ii?100:0)+'%"'+(i===_sv.ii?' id="svb"':'')+'></b></i>';}).join('')+'</div>'
  +'<div class="svhead">'+chatAva(u.ad,face,34)+'<b onclick="storyClose();socProfile(\''+u.uid+'\')">'+esc(u.me?'Sənin hekayən':u.ad)+'</b><small id="svAgo">'+stoAgo(it.at)+'</small><span class="svps" id="svPs">❚❚</span>'
  +(u.me?'<button class="svmore" onclick="svMenu(\''+it.id+'\')">⋯</button>':'')+'<button class="svx" onclick="storyClose()">✕</button></div>'
  +(it.cap?'<div class="svcap">'+esc(it.cap)+'</div>':'')+'</div>'
  +(u.me?'<div class="svbot me"><button class="svact" onclick="svSheet(\''+it.id+'\')"><span class="svfaces" id="svFaces"></span><span>Fəaliyyət'+(it.views?' · '+it.views:'')+'</span></button><button class="svact" onclick="storyPick()"><b>＋</b><span>Yeni</span></button><button class="svact" onclick="svMenu(\''+it.id+'\')"><b>⋯</b><span>Daha çox</span></button></div>'
   :'<div class="svbot"><input id="svRe" placeholder="'+esc((u.ad||'').split(' ')[0])+' adlı istifadəçiyə cavab…" onfocus="svType(true)" onblur="setTimeout(function(){if(document.activeElement!==$(\'svRe\'))svType(false)},150)" onkeydown="if(event.key===\'Enter\')svReply()"><button class="svhrt" id="svHrt" onclick="svLike(this)">♡</button><button class="svsend" onclick="svReply()">➤</button></div>');
 if(!u.me&&!it.seen){it.seen=true;sb.rpc('story_view',{p_id:it.id}).then(function(){},function(){});}
 var m=$('svm');if(it.kind==='video'&&m){m.onloadedmetadata=function(){_sv&&(_sv.dur=Math.min(60000,(m.duration||5)*1000));};m.onwaiting=function(){if(_sv)_sv.buf=true;};m.onplaying=function(){if(_sv)_sv.buf=false;};}
 if(u.me&&it.views)run(sb.rpc('story_viewers',{p_id:it.id})).then(function(r){var f=$('svFaces');if(f)f.innerHTML=(r||[]).slice(0,3).map(function(v){return chatAva(v.ad,v.photo,22);}).join('');}).catch(function(){});
 svGesture();
 _sv.t=setInterval(function(){if(!_sv)return;var now=Date.now(),d=now-_sv.last;_sv.last=now;if(!_sv.paused&&!_sv.buf)_sv.el+=d;var p=_sv.el/_sv.dur,b=$('svb');if(b)b.style.width=Math.min(100,p*100)+'%';
  var a=$('svAgo');if(a&&(now/1000|0)!==_sv.sec){_sv.sec=now/1000|0;a.textContent=stoAgo(it.at);}if(p>=1)storyNav(1);},40);};
function svPause(on){if(!_sv)return;_sv.paused=on;var v=$('svm');if(v&&v.tagName==='VIDEO'){if(on)v.pause();else v.play().catch(function(){});}var p=$('svPs');if(p)p.classList.toggle('on',on);var s=document.querySelector('#igSV');if(s)s.classList.toggle('held',on&&!_sv.input);}
function svGesture(){var st=$('svStage'),root=$('igSV');if(!st||root._g)return;root._g=1;var g=null;
 var skip=function(t){return t.closest('.svhead,.svbot,.svstk,.svlist,.svsheet,input,button,a,.svmenu');};
 root.addEventListener('pointerdown',function(e){if(!_sv||skip(e.target))return;g={x:e.clientX,y:e.clientY,t:Date.now(),dy:0,dx:0,hold:false};g.h=setTimeout(function(){if(g){g.hold=true;svPause(true);}},220);});
 root.addEventListener('pointermove',function(e){if(!g)return;g.dx=e.clientX-g.x;g.dy=e.clientY-g.y;if(Math.abs(g.dy)>12&&Math.abs(g.dy)>Math.abs(g.dx)){clearTimeout(g.h);var s=$('svStage');if(s&&g.dy>0){s.style.transition='none';s.style.transform='translateY('+g.dy+'px) scale('+Math.max(.85,1-g.dy/1500)+')';root.style.background='rgba(0,0,0,'+Math.max(.2,1-g.dy/500)+')';}}});
 var end=function(e){if(!g)return;var G=g;g=null;clearTimeout(G.h);var s=$('svStage');
  if(G.dy>90&&Math.abs(G.dy)>Math.abs(G.dx)){if(s){s.style.transition='transform .2s,opacity .2s';s.style.transform='translateY(100%) scale(.8)';s.style.opacity='0';}setTimeout(storyClose,180);return;}
  if(s){s.style.transition='transform .2s';s.style.transform='';root.style.background='';}
  if(G.dy<-70&&Math.abs(G.dy)>Math.abs(G.dx)){var u=_sv&&CHAT_STORIES[_sv.ui],it=u&&u.items[_sv.ii];if(u&&u.me)svSheet(it.id);else{var i=$('svRe');if(i)i.focus();}return;}
  if(G.hold){svPause(false);return;}
  if(Math.abs(G.dx)>60){storyNav(G.dx<0?1:-1);return;}
  if(Date.now()-G.t<300)storyNav(G.x<innerWidth*.33?-1:1);};
 root.addEventListener('pointerup',end);root.addEventListener('pointercancel',function(){if(g){clearTimeout(g.h);if(g.hold)svPause(false);var s=$('svStage');if(s){s.style.transform='';root.style.background='';}g=null;}});}
function svSheet(id){_sv&&(_sv.input=true);svPause(true);var root=$('igSV');var old=root.querySelector('.svsheet');if(old)old.remove();var d=document.createElement('div');d.className='svsheet';d.innerHTML='<div class="svgrab"></div><div class="row sp"><b>👁 Baxanlar</b><button class="igtxt" onclick="svSheetClose()">Bağla</button></div><div id="svVl"><p class="status"><span class="spin"></span></p></div>';root.appendChild(d);requestAnimationFrame(function(){d.classList.add('on');});
 var y0=null;d.addEventListener('touchstart',function(e){if(d.querySelector('#svVl').scrollTop<=0)y0=e.touches[0].clientY;},{passive:true});d.addEventListener('touchmove',function(e){if(y0==null)return;var dy=e.touches[0].clientY-y0;if(dy>0)d.style.transform='translateY('+dy+'px)';},{passive:true});d.addEventListener('touchend',function(e){if(y0==null)return;var dy=(e.changedTouches[0].clientY-y0);y0=null;if(dy>80)svSheetClose();else d.style.transform='';});
 run(sb.rpc('story_viewers',{p_id:id})).then(function(r){r=r||[];var l=$('svVl');if(!l)return;l.innerHTML=r.length?r.map(function(v){return '<div class="igrow" onclick="storyClose();socProfile(\''+v.uid+'\')">'+chatAva(v.ad,v.photo,44)+'<div class="igmeta"><div class="igname">'+esc(v.ad)+'</div><div class="iglast">'+stoAgo(v.at)+' əvvəl</div></div>'+(v.r?'<span class="svvr">'+esc(v.r)+'</span>':'')+'</div>';}).join(''):'<p class="hint" style="text-align:center;padding:20px">Hələ baxan yoxdur</p>';}).catch(err);}
function svSheetClose(){var d=document.querySelector('#igSV .svsheet');if(d){d.classList.remove('on');d.style.transform='';setTimeout(function(){d.remove();},220);}if(_sv)_sv.input=false;svPause(false);}
function svMenu(id){_sv&&(_sv.input=true);svPause(true);var root=$('igSV'),d=document.createElement('div');d.className='svmenu';d.innerHTML='<div class="svmbg" onclick="this.parentNode.remove();if(_sv)_sv.input=false;svPause(false)"></div><div class="svmb"><button onclick="svSheet(\''+id+'\');this.closest(\'.svmenu\').remove()">👁 Baxanlar</button><button onclick="this.closest(\'.svmenu\').remove();storyClose();if(typeof hlNew===\'function\')hlNew()">⭐ Önə çıxanlara əlavə et</button><button class="red" onclick="storyDel(\''+id+'\')">🗑 Hekayəni sil</button><button onclick="this.closest(\'.svmenu\').remove();if(_sv)_sv.input=false;svPause(false)">Ləğv et</button></div>';root.appendChild(d);}
function svLike(b){var on=!b.classList.contains('on');b.classList.toggle('on',on);b.textContent=on?'♥':'♡';if(on){try{navigator.vibrate&&navigator.vibrate(15);}catch(e){}var h=document.createElement('span');h.className='svbig';h.textContent='❤️';$('igSV').appendChild(h);setTimeout(function(){h.remove();},900);storyReact('❤️');}}
function svReply(){var i=$('svRe');var t=i&&i.value.trim();if(!t||!_sv)return;var u=CHAT_STORIES[_sv.ui],it=u.items[_sv.ii];i.value='';i.blur();
 run(sb.rpc('msg_send',{p_to:u.uid,p_group:null,p_body:'↩︎ Hekayənə cavab: '+t,p_kind:'text',p_image:it.kind==='image'?it.url:null})).then(function(){toast('Göndərildi');}).catch(err);}
var _storyDel5=storyDel;storyDel=function(id){var m=document.querySelector('#igSV .svmenu');if(m)m.remove();_storyDel5(id);};

;

/* ===================== LENT: Instagram üslubu ===================== */
function igSvg(p,fill){return '<svg viewBox="0 0 24 24" width="26" height="26" fill="'+(fill||'none')+'" stroke="'+(fill&&fill!=='none'?fill:'currentColor')+'" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';}
var IGP={heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',cm:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',rp:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',snd:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',bm:'<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'};
function igNum(n){n=+n||0;return n>=1000?(Math.round(n/100)/10+'B').replace('.',','):String(n);}
function igRing(uid,ad,photo,sz){var i=(typeof CHAT_STORIES!=='undefined'?CHAT_STORIES:[]).findIndex(function(u){return u.uid===uid;});if(i<0)return '<span class="igra" onclick="socProfile(\''+uid+'\')">'+chatAva(ad,photo,sz)+'</span>';var u=CHAT_STORIES[i];
 return '<span class="igra ring'+(u.unseen?'':' seen')+(u.cf?' cf':'')+'" onclick="event.stopPropagation();storyOpen('+i+')">'+chatAva(ad,photo,sz)+'</span>';}
_postCard0=function(p){var a=p.author,r=p.ref,isK=p.kind==='kudos',sys=p.kind==='birthday'||p.kind==='welcome'||p.kind==='anniv';
 var title=p.kind==='birthday'?'🎂 Ad günü':p.kind==='welcome'?'👋 Yeni həmkar':p.kind==='anniv'?'🎉 İş ildönümü':'';var who=sys?r:a,uid=who&&who.uid;
 var sub=(p.club?esc(p.club.emoji+' '+p.club.name):'')+(p.pinned?(p.club?' · ':'')+'Sabitlənib':'');
 var head='<div class="igph">'+igRing(uid,who&&who.ad,who&&who.photo,34)+'<div onclick="socProfile(\''+uid+'\')"><b>'+(sys?title+' · '+esc(r&&r.ad||''):esc(a&&a.ad||'')+(isK&&r?' <span class="muted">→</span> '+esc(r.ad):''))+'</b><small>'+sub+'</small></div>'
  +(!isK?'<button class="igicon igmo" onclick="feedMenu(\''+p.id+'\')">'+igSvg(IGP.more,'currentColor')+'</button>':'')+'</div>';
 var badge=isK&&typeof BADGES!=='undefined'&&BADGES[p.badge]?'<div class="igkb">'+BADGES[p.badge][0]+' '+BADGES[p.badge][1]+'</div>':'';
 var hasM=p.media&&p.media.length||p.image,media='';
 if(p.media&&p.media.length)media=mediaHtml(p);else if(p.image)media='<img class="igpi" src="'+esc(p.image)+'" ondblclick="feedReact(\''+p.id+'\',\'❤️\',true)">';
 var vid=/<video/.test(media);if(vid)media=media.replace(/ controls/g,'').replace(/<video /g,'<video muted loop playsinline data-ap="1" ');
 if(media)media='<div class="igmw" ondblclick="feedReact(\''+p.id+'\',\'❤️\',true)">'+media+(vid?'<button class="igmut" onclick="event.stopPropagation();igMute(this)">🔇</button>':'')+'</div>';
 var poll=p.poll?pollHtml(p):'';
 var shared=p.shared?'<div class="soshared" onclick="postOpen(\''+p.shared.id+'\')">'+(p.shared.image?'<img src="'+esc(p.shared.image)+'">':'')+'<div><b>'+esc(p.shared.author&&p.shared.author.ad||'')+'</b><p>'+esc(p.shared.body||'')+'</p></div></div>':'';
 var big=!hasM&&!poll&&!shared&&p.body&&!isK?'<div class="igbig'+(p.body.length<90?' xl':'')+'">'+socText(p.body)+'</div>':'';
 var rs=p.reacts?Object.keys(p.reacts).sort(function(x,y){return p.reacts[y]-p.reacts[x];}).slice(0,3).join(''):'';
 var hrt=p.my==='❤️'?igSvg(IGP.heart,'#ff3040'):p.my?'<span class="igme">'+esc(p.my)+'</span>':igSvg(IGP.heart);
 var acts=isK?'':'<div class="igact"><button class="sorx'+(p.my?' on':'')+'" data-id="'+p.id+'" onclick="feedReact(\''+p.id+'\',\''+(p.my?'':'❤️')+'\')" oncontextmenu="event.preventDefault();reactPick(\''+p.id+'\',this)" ontouchstart="reactHold(\''+p.id+'\',this)" ontouchend="reactHoldEnd()" ontouchmove="reactHoldEnd()">'+hrt+(p.likes?'<span>'+igNum(p.likes)+'</span>':'')+'</button>'
  +'<button onclick="feedComments(\''+p.id+'\')">'+igSvg(IGP.cm)+(p.comments?'<span>'+igNum(p.comments)+'</span>':'')+'</button>'
  +'<button onclick="postRepost(\''+p.id+'\')">'+igSvg(IGP.rp)+'</button><button onclick="postShare(\''+p.id+'\')">'+igSvg(IGP.snd)+'</button>'
  +(p.kind==='birthday'&&r&&r.uid!==ME.user_id?'<button class="igbm" onclick="show(\'chat\');chatOpen(\''+r.uid+'\',\''+chatArg(r.ad)+'\')">🎉</button>':'<button class="igbm sosave'+(p.saved?' on':'')+'" onclick="postSave(\''+p.id+'\','+(!p.saved)+')">'+igSvg(IGP.bm,p.saved?'currentColor':'none')+'</button>')+'</div>';
 var likes=!isK&&p.likes&&rs?'<div class="iglk">'+rs+' <b>'+p.likes+' reaksiya</b></div>':'';
 var cap=p.body&&!big?'<div class="igcap">'+(sys?'':'<b onclick="socProfile(\''+(a&&a.uid)+'\')">'+esc(a&&a.ad||'')+'</b> ')+socText(p.body)+'</div>':'';
 var cms=!isK&&p.comments?'<a class="igcml" onclick="feedComments(\''+p.id+'\')">Bütün '+p.comments+' şərhə bax</a>':'';
 return '<div class="igpost'+(sys?' sys':'')+' ig2'+(isK?' kud':'')+'" id="post'+p.id+'">'+head+badge+big+media+poll+shared+acts+likes+cap+cms+'<div class="igwhen">'+chatAgo(p.at)+'</div></div>';};
function igMute(b){var v=b.parentNode.querySelector('video');if(!v)return;var on=v.muted;document.querySelectorAll('.igmw video').forEach(function(x){if(x!==v){x.muted=true;var bb=x.closest('.igmw').querySelector('.igmut');if(bb)bb.textContent='🔇';}});v.muted=!on;b.textContent=v.muted?'🔇':'🔊';if(!v.muted)v.play().catch(function(){});}
var _vio=null;function igAutoplay(){if(!('IntersectionObserver' in window))return;if(!_vio)_vio=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting&&e.intersectionRatio>.6)v.play().catch(function(){});else v.pause();});},{threshold:[0,.6,1]});
 document.querySelectorAll('video[data-ap]').forEach(function(v){if(!v._o){v._o=1;_vio.observe(v);}});}
var _feedDraw6=feedDraw;feedDraw=function(){_feedDraw6();igAutoplay();};
var _postRedraw6=postRedraw;postRedraw=function(p){_postRedraw6(p);igAutoplay();};

function svType(on){if(!_sv)return;_sv.input=on;svPause(on);var r=$('igSV');if(r)r.classList.toggle('typing',on);svVV();}
function svVV(){var r=$('igSV'),vv=window.visualViewport;if(!r)return;if(vv&&r.classList.contains('typing')){r.style.height=vv.height+'px';r.style.top=vv.offsetTop+'px';r.style.bottom='auto';}else{r.style.height='';r.style.top='';r.style.bottom='';}}
if(window.visualViewport){visualViewport.addEventListener('resize',svVV);visualViewport.addEventListener('scroll',svVV);}

;

/* ===================== TAM EKRAN BAXICI, ÇAT KARTLARI, STATİSTİKA ===================== */
/* ---- tam ekran şəkil/video baxıcısı (zoom, sürüşdür, bağla) ---- */
var _vw=null;
function mediaView(list,start){if(typeof list==='string')list=[{url:list,kind:/\.(mp4|webm|mov)(\?|#|$)/i.test(list)?'video':'image'}];if(!list||!list.length)return;
 var o=document.createElement('div');o.id='mvw';o.innerHTML='<div class="mvtrack" id="mvT">'+list.map(function(m){return '<div class="mvslide">'+(m.kind==='video'?'<video src="'+esc(m.url)+'" controls playsinline></video>':'<img src="'+esc(m.url)+'" draggable="false">')+'</div>';}).join('')+'</div>'
  +'<div class="mvtop"><button onclick="mediaClose()">✕</button><span id="mvN">'+(list.length>1?'1 / '+list.length:'')+'</span><a id="mvD" href="'+esc(list[0].url)+'" target="_blank" rel="noopener" download>⤓</a></div>';
 document.body.appendChild(o);document.body.classList.add('incall');_vw={list:list,i:start||0,s:1,x:0,y:0};mvGo(_vw.i,true);mvGest(o);}
function mediaClose(){var o=$('mvw');if(!o)return;o.querySelectorAll('video').forEach(function(v){v.pause();});o.classList.add('out');setTimeout(function(){o.remove();},180);document.body.classList.remove('incall');_vw=null;}
function mvGo(i,inst){if(!_vw)return;var n=_vw.list.length;_vw.i=Math.max(0,Math.min(n-1,i));_vw.s=1;_vw.x=0;_vw.y=0;var t=$('mvT');if(!t)return;t.style.transition=inst?'none':'transform .25s ease';t.style.transform='translateX('+(-_vw.i*100)+'%)';
 t.querySelectorAll('img').forEach(function(im){im.style.transform='';});t.querySelectorAll('video').forEach(function(v,k){if(k!==_vw.i)v.pause();});var nn=$('mvN');if(nn&&n>1)nn.textContent=(_vw.i+1)+' / '+n;var d=$('mvD');if(d)d.href=_vw.list[_vw.i].url;}
function mvImg(){var t=$('mvT');return t&&t.children[_vw.i]&&t.children[_vw.i].querySelector('img');}
function mvApply(){var im=mvImg();if(im)im.style.transform='translate('+_vw.x+'px,'+_vw.y+'px) scale('+_vw.s+')';}
function mvGest(o){var P={},st=null,lastTap=0;
 var dist=function(){var k=Object.keys(P);if(k.length<2)return 0;var a=P[k[0]],b=P[k[1]];return Math.hypot(a.x-b.x,a.y-b.y);};
 o.addEventListener('pointerdown',function(e){if(e.target.closest('.mvtop')||e.target.tagName==='VIDEO')return;P[e.pointerId]={x:e.clientX,y:e.clientY};
  if(Object.keys(P).length===2){st={pinch:true,d0:dist(),s0:_vw.s};}else st={x0:e.clientX,y0:e.clientY,px:_vw.x,py:_vw.y,t:Date.now(),dx:0,dy:0};});
 o.addEventListener('pointermove',function(e){if(!P[e.pointerId]||!st||!_vw)return;P[e.pointerId]={x:e.clientX,y:e.clientY};
  if(st.pinch){var d=dist();if(d&&st.d0){_vw.s=Math.max(1,Math.min(4,st.s0*d/st.d0));mvApply();}return;}
  st.dx=e.clientX-st.x0;st.dy=e.clientY-st.y0;
  if(_vw.s>1){_vw.x=st.px+st.dx;_vw.y=st.py+st.dy;mvApply();return;}
  if(Math.abs(st.dy)>Math.abs(st.dx)&&st.dy>0){var t=$('mvT');t.style.transition='none';t.style.transform='translate('+(-_vw.i*100)+'%,'+st.dy+'px) scale('+Math.max(.8,1-st.dy/1200)+')';o.style.background='rgba(0,0,0,'+Math.max(.15,1-st.dy/450)+')';}
  else if(_vw.list.length>1){var t2=$('mvT');t2.style.transition='none';t2.style.transform='translateX(calc('+(-_vw.i*100)+'% + '+st.dx+'px))';}});
 var up=function(e){if(!_vw){P={};return;}delete P[e.pointerId];if(!st)return;if(st.pinch){if(Object.keys(P).length===0){st=null;if(_vw.s<=1.02){_vw.s=1;_vw.x=0;_vw.y=0;mvApply();}}return;}
  var S=st;st=null;o.style.background='';
  if(_vw.s>1){if(Date.now()-S.t<250&&Math.abs(S.dx)<8&&Math.abs(S.dy)<8){if(Date.now()-lastTap<300){_vw.s=1;_vw.x=0;_vw.y=0;var im=mvImg();if(im){im.style.transition='transform .2s';mvApply();setTimeout(function(){im.style.transition='';},220);}}lastTap=Date.now();}return;}
  if(S.dy>110&&Math.abs(S.dy)>Math.abs(S.dx)){mediaClose();return;}
  if(Math.abs(S.dx)>60&&Math.abs(S.dx)>Math.abs(S.dy)){mvGo(_vw.i+(S.dx<0?1:-1));return;}
  mvGo(_vw.i);
  if(Date.now()-S.t<250&&Math.abs(S.dx)<8&&Math.abs(S.dy)<8){if(Date.now()-lastTap<300){var im2=mvImg();if(im2){_vw.s=2.5;var r=im2.getBoundingClientRect();_vw.x=(r.left+r.width/2-S.x0)*1.5;_vw.y=(r.top+r.height/2-S.y0)*1.5;im2.style.transition='transform .2s';mvApply();setTimeout(function(){im2.style.transition='';},220);}lastTap=0;}else lastTap=Date.now();}};
 o.addEventListener('pointerup',up);o.addEventListener('pointercancel',up);}
chatViewImage=function(url){var list=null,start=0;try{var m=(CHATmsgs||[]).filter(function(x){return x.image&&!x.deleted;});var i=m.findIndex(function(x){return x.image===url;});if(i>=0&&$('chatMsgs')){list=m.map(function(x){return {url:x.image,kind:'image'};});start=i;}}catch(e){}
 if(!list){var pm=null;(typeof FEED!=='undefined'?FEED:[]).some(function(p){if(p.media&&p.media.some(function(x){return x.url===url;})){pm=p;return true;}});if(pm){list=pm.media.map(function(x){return {url:x.url,kind:x.kind||'image'};});start=list.findIndex(function(x){return x.url===url;});}}
 mediaView(list||url,start);};
/* lentdə tək toxunuş → tam ekran, iki toxunuş → ❤️ */
var _igT=null;
document.addEventListener('click',function(e){var w=e.target.closest&&e.target.closest('.ig2 .igmw');if(!w||e.target.closest('.igmut,.igtagb,.tgl'))return;var vid=e.target.tagName==='VIDEO';e.stopPropagation();e.preventDefault();
 if(_igT){clearTimeout(_igT);_igT=null;return;}_igT=setTimeout(function(){_igT=null;var post=w.closest('.igpost'),id=post&&post.id.slice(4),p=(FEED||[]).find(function(x){return x.id===id;});var list=p&&p.media&&p.media.length?p.media.map(function(x){return {url:x.url,kind:x.kind||'image'};}):p&&p.image?[{url:p.image,kind:'image'}]:null;if(!list)return;
  var car=w.querySelector('.socar'),i=car?Math.round(car.scrollLeft/car.clientWidth):0;if(vid)w.querySelectorAll('video').forEach(function(v){v.pause();});mediaView(list,i);},260);},true);

/* ---- çatda hekayə reaksiyası/cavabı və paylaşılan post kartları ---- */
var POSTC={};
function chatPostCard(id,el){var draw=function(p){if(!el.isConnected)return;if(!p){el.innerHTML='<div class="cpc gone">Post silinib və ya əlçatan deyil</div>';return;}var a=p.author||p.ref||{},m=p.media&&p.media[0],img=m?m.url:p.image;
  el.innerHTML='<div class="cpc" onclick="event.stopPropagation();show(\'feed\');postOpen(\''+id+'\')"><div class="cpch">'+chatAva(a.ad,a.photo,26)+'<b>'+esc(a.ad||'Baş Ofis')+'</b></div>'+(img?(m&&m.kind==='video'?'<div class="cpcm"><video src="'+esc(img)+'#t=0.1" muted playsinline preload="metadata"></video><i>▶︎</i></div>':'<div class="cpcm"><img src="'+esc(img)+'"></div>'):'')+(p.body?'<div class="cpcb"><b>'+esc(a.ad||'')+'</b> '+esc(p.body.slice(0,140))+'</div>':'')+'</div>';};
 if(POSTC.hasOwnProperty(id))return draw(POSTC[id]);el.innerHTML='<div class="cpc"><div class="cpcm sk"></div></div>';
 sb.rpc('post_get',{p_id:id}).then(function(r){POSTC[id]=r.data||null;draw(POSTC[id]);},function(){draw(null);});}
var _chatDraw7=chatDrawMsgs;
chatDrawMsgs=function(rows){_chatDraw7(rows);(rows||[]).forEach(function(m){if(m.deleted||m.kind==='sys')return;var b=$('msg'+m.id);if(!b)return;var body=m.body||'',line=b.parentNode;
 var rx=/^(\S+) hekayənə reaksiya verdi$/.exec(body);
 if(m.kind==='story_react'||rx){var em=rx?rx[1]:body.split(' ')[0];b.className='igm '+(m.mine?'mine':'their')+' strx';b.innerHTML='<small class="stlab">'+(m.mine?'Hekayəsinə reaksiya verdin':'Hekayənə reaksiya verdi')+'</small>'+(m.image?'<img class="stth" src="'+esc(m.image)+'" onclick="event.stopPropagation();chatViewImage(\''+esc(m.image)+'\')">':'')+'<span class="stem">'+esc(em)+'</span>';return;}
 if(/^↩︎ Hekayənə cavab: /.test(body)){var t=body.replace(/^↩︎ Hekayənə cavab: /,'');b.classList.add('strp');b.innerHTML='<small class="stlab">'+(m.mine?'Hekayəsinə cavab verdin':'Hekayənə cavab verdi')+'</small>'+(m.image?'<img class="stth" src="'+esc(m.image)+'" onclick="event.stopPropagation();chatViewImage(\''+esc(m.image)+'\')">':'')+'<span class="msgbody stbub">'+esc(t)+'</span>';return;}
 var mm=/https:\/\/ofis\.pilothayat\.az\/\?post=([0-9a-f-]{36})/.exec(body);
 if(mm){var note=body.replace(mm[0],'').replace(/^📣\s*/,'').trim();b.classList.add('pcm');b.innerHTML='<div class="cpw"></div>';chatPostCard(mm[1],b.querySelector('.cpw'));}});};
var _chatLastTxt7=chatLastTxt;chatLastTxt=function(t){var s=t.son_mesaj||'';if(t.son_kind==='story_react'||/ hekayənə reaksiya verdi$/.test(s))return (t.son_mine?'Hekayəyə reaksiya: ':'Hekayənə reaksiya: ')+esc(s.split(' ')[0]);if(/^↩︎ Hekayənə cavab: /.test(s))return (t.son_mine?'Sən: ':'')+'↩︎ '+esc(s.slice(19,70));if(/\?post=/.test(s))return (t.son_mine?'Sən: ':'')+'Post göndərdi';return _chatLastTxt7(t);};
var _chatMsgPreview7=chatMsgPreview;chatMsgPreview=function(m){if(m&&!m.deleted){if(m.kind==='story_react'||/ hekayənə reaksiya verdi$/.test(m.body||''))return 'Hekayə reaksiyası '+(m.body||'').split(' ')[0];if(/\?post=/.test(m.body||''))return 'Post';}return _chatMsgPreview7(m);};
/* video dairə düyməsi: emoji əvəzinə ikon */
var _renderChatRoom7=renderChatRoom;renderChatRoom=function(){_renderChatRoom7();var b=document.querySelector('#igTools button[onclick="vcStart()"]');if(b)b.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="m10 8.5 5 3.5-5 3.5z" fill="currentColor"/></svg>';};

/* ---- STATİSTİKA ---- */
function insOpen(days){days=days||30;run(sb.rpc('soc_insights',{p_days:days})).then(function(s){if(!s)return;var pct=function(a,b){if(!b)return a?'<em class="up">yeni</em>':'';var d=Math.round((a-b)*100/b);return '<em class="'+(d>=0?'up':'dn')+'">'+(d>=0?'+':'')+d+'%</em>';};
 var reach=s.team?Math.round(s.reach*100/s.team):0,mx=Math.max.apply(null,(s.daily||[]).map(function(x){return x.n;}).concat([1]));
 var days14=[];for(var i=13;i>=0;i--){var d=new Date(Date.now()-i*86400000).toLocaleDateString('sv-SE',{timeZone:'Asia/Baku'});var f=(s.daily||[]).find(function(x){return x.d===d;});days14.push({d:d,n:f?f.n:0});}
 modal('<div class="mhead"><h3>📊 Statistika</h3><button class="x" onclick="closeModal()">×</button></div><div class="soseg s3sub">'+[7,30,90].map(function(n){return '<button class="'+(n===days?'on':'')+'" onclick="insOpen('+n+')">Son '+n+' gün</button>';}).join('')+'</div>'
  +'<div class="insk"><div><small>Baxış</small><b>'+s.views+'</b>'+pct(s.views,s.views_prev)+'</div><div><small>Əhatə</small><b>'+s.reach+'</b><em>komandanın '+reach+'%-i</em></div><div><small>Reaksiya</small><b>'+s.reacts+'</b>'+pct(s.reacts,s.reacts_prev)+'</div></div>'
  +'<div class="insc"><small>Son 14 gün · baxışlar</small><div class="insbars">'+days14.map(function(x){return '<i title="'+x.d+': '+x.n+'" style="height:'+Math.max(3,Math.round(x.n*100/mx))+'%"></i>';}).join('')+'</div></div>'
  +'<div class="insl">'+[['Post',s.posts],['Şərh',s.comments],['Paylaşma',s.shares],['Saxlanma',s.saves],['Hekayə',s.story_n],['Hekayə baxışı',s.story_views],['İzləyici',s.followers+(s.new_followers?' <em class="up">+'+s.new_followers+'</em>':'')],['Təşəkkür',s.profile_kudos]].map(function(x){return '<div><span>'+x[0]+'</span><b>'+x[1]+'</b></div>';}).join('')+'</div>'
  +'<div class="igsec" style="margin-top:12px">Ən çox baxılan postlar</div>'+((s.top||[]).length?s.top.map(function(p){return '<div class="igrow" onclick="closeModal();postStats(\''+p.id+'\')">'+(p.img?(p.kind==='video'?'<video class="insth" src="'+esc(p.img)+'#t=0.1" muted></video>':'<img class="insth" src="'+esc(p.img)+'">'):'<span class="insth t">Aa</span>')+'<div class="igmeta"><div class="igname">'+esc((p.body||'Post').slice(0,40))+'</div><div class="iglast">👁 '+p.views+' · ❤️ '+p.likes+' · 💬 '+p.comments+'</div></div></div>';}).join(''):'<p class="hint">Bu dövrdə post yoxdur</p>'));}).catch(err);}
/* öz postunun altında "Statistikaya bax" */
var _postCard7=_postCard0;_postCard0=function(p){var h=_postCard7(p);if(p.mine&&p.kind==='post')h=h.replace('<div class="igwhen">','<a class="igins" onclick="postStats(\''+p.id+'\')">Statistikaya bax</a><div class="igwhen">');return h;};
/* profilə Statistika düyməsi */
var _socProfile7=socProfile;socProfile=function(uid){_socProfile7(uid);if(uid!==ME.user_id)return;var n=0;(function go(){var a=document.querySelector('#mbox .soprof .soact');if(!a||!window._prof){if(n++<40)setTimeout(go,100);return;}if(a.querySelector('.insb'))return;a.insertAdjacentHTML('beforeend','<button class="btn ghost insb" onclick="insOpen(30)">📊 Statistika</button>');})();};

var _backAct7=backAct;backAct=function(){if($('mvw')){mediaClose();return true;}if($('igSV')&&typeof storyClose==='function'){var sh=document.querySelector('#igSV .svsheet,#igSV .svmenu');if(sh){if(sh.classList.contains('svsheet'))svSheetClose();else{sh.remove();if(_sv)_sv.input=false;svPause(false);}}else storyClose();return true;}
 if($('s4wr')){wrappedClose();return true;}if($('s4quiz')){quizClose();return true;}var rm=$('s4room');if(rm&&!rm.classList.contains('min')){roomMin();return true;}return _backAct7();};

;

/* ===================== IG PARİTET: performans, səhifələr, profil, reels, redaktor, DM, bildiriş ===================== */
/* ---------- 1. ŞƏKİL SIXMA ---------- */
function imgCompress(file,max,q){return new Promise(function(res){if(!/^image\/(jpeg|jpg|png|webp|heic|heif)$/i.test(file.type)||file.size<350*1024)return res(file);
 var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var w=im.naturalWidth,h=im.naturalHeight,s=Math.min(1,max/Math.max(w,h));var c=document.createElement('canvas');c.width=Math.round(w*s);c.height=Math.round(h*s);
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){if(!b||b.size>=file.size)return res(file);res(new File([b],(file.name||'img').replace(/\.\w+$/,'')+'.jpg',{type:'image/jpeg'}));},'image/jpeg',q||.82);};
 im.onerror=function(){URL.revokeObjectURL(u);res(file);};im.src=u;});}
var _chatUpload8=chatUpload;
chatUpload=function(file,prefix){return imgCompress(file,prefix==='story'?1920:prefix==='cover'?1600:1600,.82).then(function(f){return _chatUpload8(f,prefix);});};

/* ---------- 2. LAZY YÜKLƏMƏ ---------- */
(function(){var fx=function(r){if(!r||r.nodeType!==1)return;var l=r.tagName==='IMG'?[r]:r.querySelectorAll?r.querySelectorAll('img:not([loading])'):[];Array.prototype.forEach.call(l,function(i){if(!i.hasAttribute('loading')){i.setAttribute('loading','lazy');i.setAttribute('decoding','async');}});
  var pv=r.tagName==='VIDEO'?[r]:r.querySelectorAll?r.querySelectorAll('video:not([poster])'):[];Array.prototype.forEach.call(pv,function(x){if(!x.getAttribute('poster'))x.setAttribute('poster','data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');});
  var v=r.tagName==='VIDEO'?[r]:r.querySelectorAll?r.querySelectorAll('video:not([preload])'):[];Array.prototype.forEach.call(v,function(x){x.setAttribute('preload','metadata');if(!x.getAttribute('poster'))x.setAttribute('poster','data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');});};
 new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(fx);});}).observe(document.body,{childList:true,subtree:true});fx(document.body);})();

/* ---------- 3. SONSUZ LENT, SKELET, YUXARI ÇƏK-YENİLƏ ---------- */
var FEED_END=false,FEED_BUSY=false,FEED_MODES=['all','following','tag','saved','video','club','challenge'];
function skel(n){var h='';for(var i=0;i<(n||2);i++)h+='<div class="skp"><div class="skh"><i></i><b></b></div><div class="skm"></div><div class="skl"></div><div class="skl s"></div></div>';return h;}
var _feedLoad8=feedLoad;
feedLoad=function(){FEED_END=false;var el=$('igPosts');if(el&&!FEED.length)el.innerHTML=skel(2);_feedLoad8();};
function feedMore(){if(FEED_END||FEED_BUSY||FEED_MODES.indexOf(FMODE)<0||!FEED.length)return;var el=$('igPosts');if(!el)return;
 var ts=FEED.filter(function(p){return !p.pinned&&p.at;}).map(function(p){return p.at;}).sort();var before=ts[0];if(!before)return;FEED_BUSY=true;var m=FMODE,a=FARG;
 el.insertAdjacentHTML('beforeend','<div id="feedMoreSk">'+skel(1)+'</div>');
 sb.rpc('feed2',{p_mode:m==='club'?'club':m,p_arg:a,p_before:before}).then(function(r){FEED_BUSY=false;var s=$('feedMoreSk');if(s)s.remove();if(m!==FMODE)return;var l=(r.data||[]).filter(function(p){return !FEED.some(function(x){return x.id===p.id;});});
  if(!l.length){FEED_END=true;el.insertAdjacentHTML('beforeend','<div class="feedend">✓ Hamısına baxdın</div>');return;}l.forEach(function(p){FEED.push(p);});el.insertAdjacentHTML('beforeend',l.map(postCard).join(''));igAutoplay();if(typeof s3seenObs==='function')s3seenObs();},function(){FEED_BUSY=false;var s=$('feedMoreSk');if(s)s.remove();});}
window.addEventListener('scroll',function(){var v=$('v-feed');if(!v||!v.classList.contains('on'))return;if(window.innerHeight+window.scrollY>document.body.scrollHeight-900)feedMore();},{passive:true});
(function(){var y0=null,pull=0,ind=null;
 document.addEventListener('touchstart',function(e){var v=$('v-feed');if(!v||!v.classList.contains('on')||window.scrollY>0||document.body.classList.contains('incall')||$('modal').classList.contains('on')||document.querySelector('.pg.on'))return;y0=e.touches[0].clientY;pull=0;},{passive:true});
 document.addEventListener('touchmove',function(e){if(y0==null)return;pull=e.touches[0].clientY-y0;if(pull<=0){if(ind){ind.remove();ind=null;}return;}if(!ind){ind=document.createElement('div');ind.className='ptr';ind.innerHTML='<span class="spin"></span>';document.body.appendChild(ind);}
  var d=Math.min(90,pull*.5);ind.style.transform='translate(-50%,'+d+'px) rotate('+(pull*2)+'deg)';ind.style.opacity=Math.min(1,pull/120);},{passive:true});
 document.addEventListener('touchend',function(){if(y0==null)return;y0=null;var go=pull>140;if(ind){var i=ind;ind=null;if(go){i.classList.add('go');setTimeout(function(){i.remove();},900);}else i.remove();}if(go){try{navigator.vibrate&&navigator.vibrate(10);}catch(e){}FEED=[];feedMode(FMODE==='tag'||FMODE==='user'?'all':FMODE,FARG);if(typeof storyLoad==='function')storyLoad();if(typeof noteLoad==='function')noteLoad();}},{passive:true});})();

/* ---------- 4. SƏHİFƏ YIĞINI (naviqasiya) ---------- */
var PG=[];
function pgPush(html,key){var d=document.createElement('div');d.className='pg';d.dataset.key=key||'';d.innerHTML=html;document.body.appendChild(d);PG.push(d);requestAnimationFrame(function(){d.classList.add('on');});document.body.classList.add('haspg');return d;}
function pgPop(){var d=PG.pop();if(!d)return false;d.classList.remove('on');d.querySelectorAll('video').forEach(function(v){v.pause();});setTimeout(function(){d.remove();},230);if(!PG.length)document.body.classList.remove('haspg');return true;}
function pgTop(){return PG[PG.length-1];}
function pgHead(t,right){return '<div class="pgh"><button class="pgb" onclick="pgPop()">'+igSvg('<path d="m15 18-6-6 6-6"/>')+'</button><b>'+t+'</b><span class="pgr">'+(right||'')+'</span></div>';}
var _backAct8=backAct;backAct=function(){if($('mvw')||$('igSV')||$('s4wr')||$('s4quiz')||$('igReel')||$('stEd'))return _backAct8();if($('modal').classList.contains('on'))return _backAct8();if(PG.length){pgPop();return true;}return _backAct8();};
var _show8=show;show=function(v){while(PG.length){var d=PG.pop();d.remove();}document.body.classList.remove('haspg');_show8(v);};

/* postu səhifədə aç */
postOpen=function(id){if(typeof closeModal==='function'&&$('modal').classList.contains('on'))closeModal();run(sb.rpc('post_get',{p_id:id})).then(function(p){if(!p){toast('Post tapılmadı');return;}var i=FEED.findIndex(function(x){return x.id===p.id;});if(i>=0)FEED[i]=p;else FEED.push(p);
 var a=p.author||p.ref||{};pgPush(pgHead('Post')+'<div class="pgc sopostm">'+postCard(p)+'</div>','post:'+id);igAutoplay();if(typeof s3seenObs==='function')s3seenObs();}).catch(err);};

/* ---------- 5. PROFİL SƏHİFƏSİ ---------- */
var NOTES={};function noteLoad(){return run(sb.rpc('note_list')).then(function(n){NOTES=n||{};if(typeof storyDrawRow==='function'&&$('igStories'))storyDrawRow();return NOTES;}).catch(function(){return NOTES;});}
socProfile=function(uid){if(!uid||uid==='undefined')return;if($('modal').classList.contains('on'))closeModal();var t=pgTop(),re=t&&t.dataset.key==='prof:'+uid;
 var pg=re?t:pgPush(pgHead('<span class="sk1"></span>')+'<div class="pgc"><div class="skprof"><i></i><b></b><b></b></div></div>','prof:'+uid);
 Promise.all([run(sb.rpc('soc_profile',{p_uid:uid})),run(sb.rpc('soc_profile_x',{p_uid:uid})).catch(function(){return null;}),run(sb.rpc('feed2',{p_mode:'user',p_arg:uid,p_before:null})).catch(function(){return [];}),lvlLoad(),noteLoad()]).then(function(r){
  var p=r[0]||{},x=r[1]||{hl:[],skills:[]},posts=r[2]||[];if(!p.ad){pgPop();return;}window._prof=p;x._me=uid===ME.user_id;x._uid=uid;window._profX=x;
  posts.forEach(function(q){var i=FEED.findIndex(function(y){return y.id===q.id;});if(i>=0)FEED[i]=q;else FEED.push(q);});
  var me=x._me,yrs=p.hire?Math.floor((Date.now()-new Date(p.hire))/31557600000):0,lv=LVL[uid]||0,LN=['Yeni','Fəal','Təcrübəli','Ulduz','Əfsanə'];
  var si=(CHAT_STORIES||[]).findIndex(function(u){return u.uid===uid;}),su=CHAT_STORIES[si],nt=NOTES[uid];
  var ava='<div class="pfav'+(su?' ring'+(su.unseen?'':' seen')+(su.cf?' cf':''):'')+'" style="--lc:'+LVLC[lv]+'" onclick="'+(su?'storyOpen('+si+')':(me?'storyPick()':''))+'">'+chatAva(p.ad,p.photo,86)+(me&&!su?'<b class="pfplus">+</b>':'')+'</div>';
  var note=nt||me?'<div class="pfnote'+(nt?'':' empty')+'" onclick="'+(me?'noteEdit()':'')+'">'+(nt?esc(nt.t):'Qeyd…')+'</div>':'';
  var menu=me?'<button class="pgb" onclick="pfMenu()">'+igSvg('<path d="M4 6h16M4 12h16M4 18h16"/>')+'</button>':'<button class="pgb" onclick="pfMenu(\''+uid+'\')">'+igSvg(IGP.more,'currentColor')+'</button>';
  var h=pgHead(esc(p.ad),menu)+'<div class="pgc pf">'
   +'<div class="pftop"><div class="pfaw">'+note+ava+'<span class="pflv" style="background:'+LVLC[lv]+'">'+LN[lv]+'</span></div><div class="pfst"><div><b>'+p.posts+'</b>post</div><div onclick="followList(\''+uid+'\',\'followers\')"><b>'+p.followers+'</b>izləyici</div><div onclick="followList(\''+uid+'\',\'following\')"><b>'+p.following+'</b>izləyir</div></div></div>'
   +'<div class="pfinfo"><b>'+esc(p.ad)+'</b><div class="pfj">'+esc(p.vezife||'')+'</div>'+(p.bio?'<p>'+esc(p.bio)+'</p>':'')+'<div class="pfm">'+(yrs>=1?'🏢 '+yrs+' il komandada':'')+(p.bday?(yrs>=1?' · ':'')+'🎂 '+esc(p.bday):'')+(p.kudos?' · 🙌 '+p.kudos+' təşəkkür':'')+'</div>'
   +(x.mentor?'<div class="pfm" onclick="socProfile(\''+x.mentor.uid+'\')">🧭 Mentoru: <b>'+esc(x.mentor.ad)+'</b></div>':'')+(x.mentees&&x.mentees.length?'<div class="pfm">🧭 Mentordur: '+x.mentees.map(function(m){return '<b onclick="socProfile(\''+m.uid+'\')">'+esc(m.ad)+'</b>';}).join(', ')+'</div>':'')
   +(p.interests&&p.interests.length?'<div class="pfch">'+p.interests.map(function(i){return '<span>'+esc(i)+'</span>';}).join('')+'</div>':'')+'</div>'
   +'<div class="pfbt">'+(me?'<button class="btn ghost" onclick="profEdit()">Profili redaktə et</button><button class="btn ghost" onclick="insOpen(30)">Statistika</button>'
     :'<button class="btn'+(p.ifollow?' ghost':'')+'" onclick="pfFollow(\''+uid+'\','+(!p.ifollow)+')">'+(p.ifollow?'İzləyirsən ▾':'İzlə')+'</button><button class="btn ghost" onclick="show(\'chat\');chatOpen(\''+uid+'\',\''+chatArg(p.ad)+'\')">Mesaj</button><button class="btn ghost sq" onclick="var e=(typeof EMPS!==\'undefined\'?EMPS:[]).find(function(z){return z.user_id===\''+uid+'\'});if(e&&typeof openKudos===\'function\')openKudos(e.id)">🙌</button>')+'</div>'
   +(x.skills&&x.skills.length?'<div class="pfsk">'+x.skills.map(function(s){return '<button class="'+(s.my?'on':'')+'" '+(me?'':'onclick="skEnd(\''+uid+'\',\''+chatArg(s.s)+'\','+(!s.my)+')"')+'>'+esc(s.s)+(s.n?' <b>'+s.n+'</b>':'')+'</button>';}).join('')+'</div>':'')
   +(p.badges&&p.badges.length?'<div class="pfbd">'+p.badges.map(function(b){var i=badgeInfo(b);return '<span title="'+esc(i[1])+'">'+i[0]+'<small>'+esc(i[1])+'</small></span>';}).join('')+'</div>':'')
   +'<div class="s3hl pfhl">'+(me?'<button onclick="hlNew()"><span class="s3hlc add">+</span><small>Yeni</small></button>':'')+(x.hl||[]).map(function(H,i){var c=H.items&&H.items[0];return '<button onclick="hlView('+i+')"><span class="s3hlc">'+(c?(c.kind==='video'?'🎬':'<img src="'+esc(c.url)+'">'):'⭐')+'</span><small>'+esc(H.title)+'</small></button>';}).join('')+'</div>'
   +'<div class="pftabs"><button class="on" onclick="pfTab(this,\'p\',\''+uid+'\')">'+igSvg('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>')+'</button><button onclick="pfTab(this,\'r\',\''+uid+'\')">'+igSvg('<rect x="2" y="3" width="20" height="18" rx="4"/><path d="M2 8h20M8 3l3 5M14 3l3 5"/><path d="m10 12 5 3-5 3z" fill="currentColor"/>')+'</button><button onclick="pfTab(this,\'t\',\''+uid+'\')">'+igSvg('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M6.5 19a6 6 0 0 1 11 0"/>')+'</button></div>'
   +'<div id="pfGrid" class="pfgrid"></div></div>';
  pg.innerHTML=h;window._pfPosts=posts;pfGrid(posts.filter(function(q){return q.kind==='post';}),me?'Hələ post paylaşmamısan':'Hələ post yoxdur');}).catch(function(e){err(e);});};
function pfGrid(l,empty){var g=pgTop()&&pgTop().querySelector('#pfGrid');if(!g)return;g.innerHTML=l.length?l.map(function(x){var m=x.media&&x.media[0],img=m?m.url:x.image,vid=m&&m.kind==='video';
 return '<button onclick="postOpen(\''+x.id+'\')">'+(img?(vid?'<video src="'+esc(img)+'#t=0.1" muted playsinline preload="metadata"></video>':'<img src="'+esc(img)+'">'):'<span class="pftx">'+esc((x.body||'').slice(0,70))+'</span>')+(x.media&&x.media.length>1?'<i class="pfmi">❐</i>':vid?'<i class="pfmi">▶</i>':'')+(x.likes?'<em>♥ '+x.likes+'</em>':'')+'</button>';}).join(''):'<div class="pfempty">'+esc(empty)+'</div>';}
function pfTab(b,k,uid){Array.prototype.forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b);});var P=window._pfPosts||[];
 if(k==='p')pfGrid(P.filter(function(q){return q.kind==='post';}),'Post yoxdur');else if(k==='r')pfGrid(P.filter(function(q){return q.media&&q.media.some(function(m){return m.kind==='video';});}),'Reels yoxdur');
 else{var g=pgTop().querySelector('#pfGrid');g.innerHTML=skel(1);run(sb.rpc('posts_tagged',{p_uid:uid})).then(function(l){(l||[]).forEach(function(q){if(!FEED.some(function(y){return y.id===q.id;}))FEED.push(q);});pfGrid(l||[],'Hələ heç kim işarələməyib');}).catch(err);}}
function pfFollow(uid,on){if(!on&&!confirm('İzləməni dayandırmaq istəyirsən?'))return;run(sb.rpc('soc_follow',{p_uid:uid,p_on:on})).then(function(){socProfile(uid);}).catch(err);}
function pfMenu(uid){var x=window._profX||{};if(!uid){modal('<div class="mhead"><h3>Menyu</h3><button class="x" onclick="closeModal()">×</button></div>'
  +[['📊','Statistika','insOpen(30)'],['📝','Qaralamalar və planlılar','closeModal();feedCompose();setTimeout(draftList,200)'],['🔖','Saxlanılanlar','closeModal();show(\'feed\');feedMode(\'saved\')'],['⭐','Yaxın dostlar','closeModal();cfManage()'],['💬','Qeydini dəyiş','closeModal();noteEdit()'],['🎁','Xal mağazası','closeModal();show(\'feed\');feedMode(\'shop\')']].map(function(a){return '<button class="igmenu" onclick="'+a[2]+'">'+a[0]+' '+a[1]+'</button>';}).join(''));return;}
 modal('<div class="mhead"><h3>'+esc((window._prof||{}).ad||'')+'</h3><button class="x" onclick="closeModal()">×</button></div><button class="igmenu" onclick="closeModal();cfSet(\''+uid+'\','+(!x.cf)+')">'+(x.cf?'⭐ Yaxın dostlardan çıxar':'☆ Yaxın dostlara əlavə et')+'</button>'
  +(x.mod&&x.newbie?'<button class="igmenu" onclick="closeModal();mentorPick(\''+uid+'\')">🧭 Mentor təyin et</button>':'')+'<button class="igmenu" onclick="closeModal();show(\'chat\');chatOpen(\''+uid+'\',\''+chatArg((window._prof||{}).ad||'')+'\')">💬 Mesaj göndər</button><button class="igmenu" style="color:#ed4956" onclick="repOpen(\'user\',\''+uid+'\')">🚩 Şikayət et</button>');}
function followList(uid,kind){run(sb.rpc('follow_list',{p_uid:uid,p_kind:kind})).then(function(l){l=l||[];pgPush(pgHead(kind==='followers'?'İzləyicilər':'İzlədikləri')+'<div class="pgc">'+(l.length?l.map(function(u){return '<div class="igrow"><span onclick="socProfile(\''+u.uid+'\')">'+chatAva(u.ad,u.photo,48)+'</span><div class="igmeta" onclick="socProfile(\''+u.uid+'\')"><div class="igname">'+esc(u.ad)+'</div><div class="iglast">'+esc(u.vezife||'')+'</div></div>'+(u.uid!==ME.user_id?'<button class="btn sm'+(u.ifollow?' ghost':'')+'" onclick="socFollow2(\''+u.uid+'\','+(!u.ifollow)+',this)">'+(u.ifollow?'İzləyirsən':'İzlə')+'</button>':'')+'</div>';}).join(''):'<div class="pfempty">Siyahı boşdur</div>')+'</div>');}).catch(err);}
function noteEdit(){var cur=(NOTES[ME.user_id]||{}).t||'';var v=prompt('Qeydin (24 saat görünür, maks. 60 simvol). Silmək üçün boş burax:',cur);if(v===null)return;run(sb.rpc('note_set',{p_text:v})).then(function(){noteLoad().then(function(){var t=pgTop();if(t&&t.dataset.key==='prof:'+ME.user_id)socProfile(ME.user_id);});toast(v.trim()?'Qeyd paylaşıldı':'Qeyd silindi');}).catch(err);}
/* hekayə sırasında qeyd balonları */
var _storyDrawRow8=storyDrawRow;storyDrawRow=function(){_storyDrawRow8();var el=$('igStories');if(!el)return;var k=0;
 Array.prototype.forEach.call(el.children,function(c,i){var uid=i===0?ME.user_id:null;if(i>0){var us=CHAT_STORIES.filter(function(u){return !u.me;});uid=us[i-1]&&us[i-1].uid;}var n=uid&&NOTES[uid];
  if(n||i===0){var s=c.querySelector('.igring');if(s&&!s.querySelector('.stnote')){s.insertAdjacentHTML('beforeend','<span class="stnote'+(n?'':' empty')+'" onclick="event.stopPropagation();'+(i===0?'noteEdit()':'')+'">'+(n?esc(n.t):'Qeyd…')+'</span>');}}});};

/* ---------- 6. LENT SADƏLƏŞDİRMƏ + REELS + AXTARIŞ ---------- */
var SECT=[['team','🏆','Komanda'],['fun','🎮','Əyləncə'],['qa','❓','Suallar'],['events','📅','Tədbirlər'],['clubs','👥','Klublar'],['albums','🖼','Albomlar'],['saved','🔖','Saxlanılanlar'],['shop','🎁','Mağaza']];
feedSeg=function(){var el=$('soSeg');if(!el)return;var cur=SECT.concat([['mod','🛡','Moderasiya'],['explore','🔎','Kəşf']]).find(function(s){return s[0]===FMODE||(s[0]==='clubs'&&FMODE==='club')||(s[0]==='team'&&FMODE==='challenge');});
 el.innerHTML='<button class="'+(FMODE==='all'?'on':'')+'" onclick="feedMode(\'all\')">Hamısı</button><button class="'+(FMODE==='following'?'on':'')+'" onclick="feedMode(\'following\')">İzlədiklərim</button>'
  +(cur?'<button class="on">'+cur[1]+' '+cur[2]+' <i onclick="event.stopPropagation();feedMode(\'all\')">✕</i></button>':'')+'<button class="sectb" onclick="sectOpen()">⊞ Bölmələr'+(typeof _repN!=='undefined'&&_repN&&SOC_MOD?' <b class="s3n">'+_repN+'</b>':'')+'</button>';};
function sectOpen(){var l=SECT.slice();if(SOC_MOD)l.push(['mod','🛡','Moderasiya'+(_repN?' ('+_repN+')':'')]);modal('<div class="mhead"><h3>Bölmələr</h3><button class="x" onclick="closeModal()">×</button></div><div class="sectg">'+l.map(function(s){return '<button onclick="closeModal();feedMode(\''+s[0]+'\')"><span>'+s[1]+'</span>'+s[2]+'</button>';}).join('')+'</div>');}
var _renderFeed8=renderFeed;renderFeed=function(){_renderFeed8();var hd=document.querySelector('#v-feed .sohead');if(hd&&!hd.querySelector('.reelb'))hd.insertAdjacentHTML('afterbegin','<button class="igicon reelb" onclick="reelsTab()" title="Reels">'+igSvg('<rect x="2" y="3" width="20" height="18" rx="4"/><path d="M2 8h20M8 3l3 5M14 3l3 5"/><path d="m10 12 5 3-5 3z" fill="currentColor"/>')+'</button>');
 if(typeof storyLoad==='function'&&FMODE!=='all')storyLoad();noteLoad();};
/* Kəşf: vahid axtarış */
var _feedMode8=feedMode;feedMode=function(m,arg){_feedMode8(m,arg);if(m==='explore'){var n=0;(function go(){var b=$('soBody');if(!b||FMODE!=='explore')return;if(!b.querySelector('.igsec')&&n++<40){setTimeout(go,100);return;}if($('srchI'))return;
  b.insertAdjacentHTML('afterbegin','<div class="srch"><input id="srchI" placeholder="Axtar: insan, #mövzu, post…" oninput="clearTimeout(window._srT);window._srT=setTimeout(srchGo,280)"><div id="srchR"></div></div>');})();}};
function srchGo(){var q=($('srchI')||{}).value||'';var r=$('srchR');if(!r)return;var rest=Array.prototype.slice.call($('soBody').children).filter(function(c){return !c.classList.contains('srch');});
 if(!q.trim()){r.innerHTML='';rest.forEach(function(c){c.style.display='';});return;}rest.forEach(function(c){c.style.display='none';});r.innerHTML=skel(1);
 run(sb.rpc('soc_search',{p_q:q})).then(function(s){if(($('srchI')||{}).value!==q)return;s=s||{};var h='';
  if(s.people&&s.people.length)h+='<div class="igsec">İnsanlar</div>'+s.people.map(function(u){return '<div class="igrow" onclick="socProfile(\''+u.uid+'\')">'+chatAva(u.ad,u.photo,44)+'<div class="igmeta"><div class="igname">'+esc(u.ad)+'</div><div class="iglast">'+esc(u.vezife||'')+'</div></div></div>';}).join('');
  if(s.tags&&s.tags.length)h+='<div class="igsec">Mövzular</div>'+s.tags.map(function(t){return '<div class="igrow" onclick="feedMode(\'tag\',\''+esc(t.t)+'\')"><span class="srhash">#</span><div class="igmeta"><div class="igname">#'+esc(t.t)+'</div><div class="iglast">'+t.n+' post</div></div></div>';}).join('');
  if(s.posts&&s.posts.length){s.posts.forEach(function(p){if(!FEED.some(function(y){return y.id===p.id;}))FEED.push(p);});h+='<div class="igsec">Postlar</div><div class="pfgrid">'+s.posts.map(function(x){var m=x.media&&x.media[0],img=m?m.url:x.image;return '<button onclick="postOpen(\''+x.id+'\')">'+(img?'<img src="'+esc(img)+'">':'<span class="pftx">'+esc((x.body||'').slice(0,70))+'</span>')+'</button>';}).join('')+'</div>';}
  r.innerHTML=h||'<div class="pfempty">"'+esc(q)+'" üzrə nəticə yoxdur</div>';}).catch(err);}
/* REELS */
var _rl=null;
function reelsTab(){var o=document.createElement('div');o.id='igReel';o.innerHTML='<div class="rlh"><b>Reels</b><button onclick="reelsClose()">✕</button></div><div class="rlw" id="rlW"><div class="rlsk"><span class="spin"></span></div></div>';document.body.appendChild(o);document.body.classList.add('incall');
 run(sb.rpc('feed2',{p_mode:'video',p_arg:null,p_before:null})).then(function(l){l=(l||[]).filter(function(p){return p.media&&p.media.some(function(m){return m.kind==='video';});});var w=$('rlW');if(!w)return;
  if(!l.length){w.innerHTML='<div class="rlsk">Hələ video yoxdur.<br>İlk Reels-i sən paylaş!</div>';return;}l.forEach(function(p){var i=FEED.findIndex(function(x){return x.id===p.id;});if(i>=0)FEED[i]=p;else FEED.push(p);});
  w.innerHTML=l.map(function(p){var v=p.media.find(function(m){return m.kind==='video';}),a=p.author||{};return '<section data-id="'+p.id+'"><video src="'+esc(v.url)+'" playsinline loop preload="metadata"></video><span class="rlmute">🔇</span>'
   +'<div class="rlside"><button onclick="reelLike(\''+p.id+'\',this)" class="'+(p.my?'on':'')+'">'+igSvg(IGP.heart,p.my?'#ff3040':'none')+'<span>'+igNum(p.likes||0)+'</span></button><button onclick="feedComments(\''+p.id+'\')">'+igSvg(IGP.cm)+'<span>'+igNum(p.comments||0)+'</span></button><button onclick="postShare(\''+p.id+'\')">'+igSvg(IGP.snd)+'</button><button onclick="postSave(\''+p.id+'\','+(!p.saved)+')">'+igSvg(IGP.bm,p.saved?'#fff':'none')+'</button></div>'
   +'<div class="rlcap"><div class="rlau" onclick="reelsClose();socProfile(\''+a.uid+'\')">'+chatAva(a.ad,a.photo,32)+'<b>'+esc(a.ad||'')+'</b></div>'+(p.body?'<p>'+esc(p.body)+'</p>':'')+'</div></section>';}).join('');
  _rl={muted:true,io:new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target.querySelector('video');if(e.isIntersecting&&e.intersectionRatio>.7){v.muted=_rl.muted;v.play().catch(function(){});if(typeof _seenQ!=='undefined'){var id=e.target.dataset.id;if(!_seenDone[id]){_seenDone[id]=1;_seenQ.push(id);}}}else v.pause();});},{threshold:[0,.7,1]})};
  Array.prototype.forEach.call(w.querySelectorAll('section'),function(s){_rl.io.observe(s);var last=0;s.addEventListener('click',function(e){if(e.target.closest('.rlside,.rlcap'))return;var now=Date.now();if(now-last<280){var b=s.querySelector('.rlside button');if(!b.classList.contains('on'))reelLike(s.dataset.id,b);var h=document.createElement('span');h.className='svbig';h.textContent='❤️';s.appendChild(h);setTimeout(function(){h.remove();},900);last=0;return;}last=now;
   setTimeout(function(){if(last!==now)return;_rl.muted=!_rl.muted;w.querySelectorAll('video').forEach(function(v){v.muted=_rl.muted;});w.querySelectorAll('.rlmute').forEach(function(m){m.textContent=_rl.muted?'🔇':'🔊';m.classList.remove('flash');void m.offsetWidth;m.classList.add('flash');});},290);});});}).catch(err);}
function reelLike(id,b){var p=FEED.find(function(x){return x.id===id;});if(!p)return;var on=!b.classList.contains('on');b.classList.toggle('on',on);p.likes=(p.likes||0)+(on?1:-1);p.my=on?'❤️':null;b.innerHTML=igSvg(IGP.heart,on?'#ff3040':'none')+'<span>'+igNum(p.likes)+'</span>';sb.rpc('post_react',{p_id:id,p_emoji:on?'❤️':null}).then(function(){},function(){});}
function reelsClose(){var o=$('igReel');if(!o)return;o.querySelectorAll('video').forEach(function(v){v.pause();});if(_rl&&_rl.io)_rl.io.disconnect();_rl=null;o.remove();document.body.classList.remove('incall');}
var _backAct9=backAct;backAct=function(){if($('igReel')){if($('modal').classList.contains('on'))closeModal();else reelsClose();return true;}if($('stEd')){stEdClose();return true;}return _backAct9();};

/* ---------- 7. POST: redaktə, kəsmə və filtr ---------- */
var _feedMenu8=feedMenu;feedMenu=function(id){_feedMenu8(id);var p=FEED.find(function(x){return x.id===id;})||{};var mb=$('mbox');if(mb&&p.mine&&p.kind==='post'){var f=mb.querySelector('.igmenu');if(f)f.insertAdjacentHTML('beforebegin','<button class="igmenu" onclick="postEdit(\''+id+'\')">✏️ Redaktə et</button>');}};
function postEdit(id){var p=FEED.find(function(x){return x.id===id;})||{};modal('<div class="mhead"><h3>Postu redaktə et</h3><button class="x" onclick="closeModal()">×</button></div><textarea id="peT" rows="6" style="width:100%">'+esc(p.body||'')+'</textarea><button class="btn" style="width:100%;margin-top:10px" onclick="postEditGo(\''+id+'\')">Yadda saxla</button>');mentionBind($('peT'));}
function postEditGo(id){var b=$('peT').value;run(sb.rpc('post_edit',{p_id:id,p_body:b})).then(function(){closeModal();var p=FEED.find(function(x){return x.id===id;});if(p){p.body=b;postRedraw(p);}toast('Yeniləndi');}).catch(err);}
var FPF={n:['Normal',''],c:['Clarendon','contrast(1.2) saturate(1.35)'],j:['Juno','saturate(1.4) hue-rotate(-8deg) brightness(1.05)'],l:['Lark','brightness(1.1) saturate(.85) contrast(.95)'],g:['Gingham','brightness(1.05) hue-rotate(-10deg) sepia(.15)'],m:['Moon','grayscale(1) contrast(1.1) brightness(1.05)'],w:['İsti','sepia(.3) saturate(1.3) brightness(1.03)']};
var _fpAR='o',_fpFL='n';
var _fpPrev8=fpPrev;fpPrev=function(){_fpPrev8();var el=$('fpPrev');if(!el)return;var imgs=_fpMedia.some(function(f){return !f.url&&/^image/.test(f.type);});var ed=$('fpEd');
 if(!imgs){if(ed)ed.remove();return;}if(!ed){el.insertAdjacentHTML('afterend','<div id="fpEd" class="fped"></div>');ed=$('fpEd');}
 ed.innerHTML='<div class="fpar">'+[['o','Orijinal'],['s','1:1'],['p','4:5']].map(function(a){return '<button class="'+(_fpAR===a[0]?'on':'')+'" onclick="_fpAR=\''+a[0]+'\';fpPrev()">'+a[1]+'</button>';}).join('')+'</div><div class="fpfl">'+Object.keys(FPF).map(function(k){var f=_fpMedia.find(function(x){return !x.url&&/^image/.test(x.type);});return '<button class="'+(_fpFL===k?'on':'')+'" onclick="_fpFL=\''+k+'\';fpPrev()"><img src="'+URL.createObjectURL(f)+'" style="filter:'+FPF[k][1]+'"><small>'+FPF[k][0]+'</small></button>';}).join('')+'</div>';
 el.querySelectorAll('img').forEach(function(i){i.style.filter=FPF[_fpFL][1];i.style.aspectRatio=_fpAR==='s'?'1':_fpAR==='p'?'4/5':'';i.style.objectFit='cover';});};
function fpProcess(f){if(f.url||!/^image\//.test(f.type)||(_fpAR==='o'&&_fpFL==='n'))return Promise.resolve(f);return new Promise(function(res){var u=URL.createObjectURL(f),im=new Image();im.onload=function(){var W=im.naturalWidth,H=im.naturalHeight,r=_fpAR==='s'?1:_fpAR==='p'?.8:W/H,sw=W,sh=H;if(W/H>r)sw=H*r;else sh=W/r;var sc=Math.min(1,1600/Math.max(sw,sh));
 var c=document.createElement('canvas');c.width=Math.round(sw*sc);c.height=Math.round(sh*sc);var x=c.getContext('2d');x.filter=FPF[_fpFL][1]||'none';x.drawImage(im,(W-sw)/2,(H-sh)/2,sw,sh,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){res(b?new File([b],'post.jpg',{type:'image/jpeg'}):f);},'image/jpeg',.86);};im.onerror=function(){res(f);};im.src=u;});}
fpUploadAll=function(){return Promise.all(_fpMedia.map(function(f){if(f.url)return Promise.resolve({url:f.url,kind:f.kind||'image'});return fpProcess(f).then(function(g){return chatUpload(g,'post').then(function(u){return {url:u,kind:/^video/.test(f.type)?'video':'image'};});});}));};
var _feedCompose8=feedCompose;feedCompose=function(c,ch){_fpAR='o';_fpFL='n';_feedCompose8(c,ch);};

/* ---------- 8. HEKAYƏ REDAKTORU ---------- */
var _st=null,STC=['#ffffff','#000000','#ff3040','#ffcc00','#34c759','#0a84ff','#af52de'];
storyPick=function(){modal('<div class="mhead"><h3>Hekayəyə əlavə et</h3><button class="x" onclick="closeModal()">×</button></div><div class="stpk"><button onclick="stFile(true)"><span>📷</span>Kamera</button><button onclick="stFile(false)"><span>🖼</span>Qalereya</button><button onclick="closeModal();stText()"><span>Aa</span>Yazı</button></div>');};
function stFile(cam){var i=document.createElement('input');i.type='file';i.accept=cam?'image/*':'image/*,video/*';if(cam)i.setAttribute('capture','environment');i.onchange=function(){var f=i.files[0];if(!f)return;if(f.size>60*1024*1024){toast('Fayl çox böyükdür');return;}closeModal();stEdit(f);};i.click();}
function stText(){var c=document.createElement('canvas');c.width=1080;c.height=1920;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,1080,1920);g.addColorStop(0,'#6366f1');g.addColorStop(1,'#ec4899');x.fillStyle=g;x.fillRect(0,0,1080,1920);c.toBlob(function(b){stEdit(new File([b],'bg.png',{type:'image/png'}),true);});}
function stEdit(f,textMode){var vid=/^video\//.test(f.type),u=URL.createObjectURL(f);_st={f:f,vid:vid,u:u,layers:[],aud:'all',stk:null};_stoStk=null;
 var o=document.createElement('div');o.id='stEd';o.innerHTML='<div class="sted"><div class="stcv" id="stCv">'+(vid?'<video src="'+u+'" autoplay muted loop playsinline></video>':'<img src="'+u+'">')+'<div class="stly" id="stLy"></div></div>'
  +'<div class="sttop"><button onclick="stEdClose()">✕</button><span></span><button onclick="stAddText()">Aa</button><button onclick="stMention()">@</button><button onclick="stStk()">☺</button></div>'
  +'<div class="stbot"><div class="s3aud"><button class="on" data-a="all" onclick="stAud(this)">🌐 Hamı</button><button data-a="cf" onclick="stAud(this)">⭐ Yaxın dostlar</button></div><button class="stgo" id="stGo" onclick="stShare()">Hekayən ➜</button></div><div id="stPanel"></div></div>';
 document.body.appendChild(o);document.body.classList.add('incall');if(textMode)setTimeout(stAddText,200);}
function stEdClose(){if(!_st)return;var o=$('stEd');if(o)o.remove();URL.revokeObjectURL(_st.u);_st=null;document.body.classList.remove('incall');}
function stAud(b){_st.aud=b.dataset.a;Array.prototype.forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b);});}
function stAddText(pre){var p=$('stPanel');p.innerHTML='<div class="stpan"><input id="stT" maxlength="120" placeholder="Yazı…" value="'+esc(pre||'')+'"><div class="stcol">'+STC.map(function(c,i){return '<button style="background:'+c+'" class="'+(i?'':'on')+'" data-c="'+c+'" onclick="Array.prototype.forEach.call(this.parentNode.children,function(x){x.classList.remove(\'on\')});this.classList.add(\'on\')"></button>';}).join('')+'<label><input type="checkbox" id="stBg"> fon</label></div><button class="btn" onclick="stTextOk()">Əlavə et</button></div>';setTimeout(function(){$('stT').focus();},50);}
function stTextOk(){var t=$('stT').value.trim();var c=(document.querySelector('#stPanel .stcol .on')||{}).dataset;$('stPanel').innerHTML='';if(!t)return;var L={t:t,c:c?c.c:'#fff',bg:$('stBg')?$('stBg').checked:false,x:.5,y:.4,s:1};_st.layers.push(L);stDrawLayers();}
function stMention(){s3pick('Kimi qeyd edək?',function(uid,ad){closeModal();_st.ment=(_st.ment||[]).concat([uid]);_st.layers.push({t:'@'+ad,c:'#ffffff',bg:true,x:.5,y:.6,s:1,m:1});stDrawLayers();},true);}
function stStk(){var p=$('stPanel');p.innerHTML='<div class="stpan"><div class="fptools" style="justify-content:center"><button class="btn ghost sm" onclick="stoStk(\'poll\')">📊 Sorğu</button><button class="btn ghost sm" onclick="stoStk(\'q\')">❓ Sual</button><button class="btn ghost sm" onclick="_stoStk=null;$(\'stPanel\').innerHTML=\'\'">Ləğv</button></div><div id="stoStkF"></div><button class="btn" style="width:100%;margin-top:6px" onclick="stStkOk()">Hazırdır</button></div>';}
function stStkOk(){var st=null;if(_stoStk==='poll'){var q=$('skQ').value.trim(),a=$('skA').value.trim()||'Bəli',b=$('skB').value.trim()||'Xeyr';if(q)st={type:'poll',q:q,opts:[a,b]};}else if(_stoStk==='q'){var q2=$('skQ').value.trim();if(q2)st={type:'q',q:q2};}_st.stk=st;$('stPanel').innerHTML=st?'<div class="stchip">'+(st.type==='poll'?'📊 ':'❓ ')+esc(st.q)+' <a onclick="_st.stk=null;this.parentNode.remove()">✕</a></div>':'';}
function stDrawLayers(){var ly=$('stLy');if(!ly)return;ly.innerHTML=_st.layers.map(function(L,i){return '<span class="stl'+(L.bg?' bg':'')+'" data-i="'+i+'" style="left:'+(L.x*100)+'%;top:'+(L.y*100)+'%;color:'+(L.bg?(L.c==='#ffffff'?'#000':'#fff'):L.c)+';'+(L.bg?'background:'+L.c:'')+';transform:translate(-50%,-50%) scale('+L.s+')">'+esc(L.t)+'</span>';}).join('');
 Array.prototype.forEach.call(ly.children,function(el){var L=_st.layers[+el.dataset.i],P={},d0=0,s0=1;el.addEventListener('pointerdown',function(e){e.preventDefault();el.setPointerCapture(e.pointerId);P[e.pointerId]={x:e.clientX,y:e.clientY};var k=Object.keys(P);if(k.length===2){d0=Math.hypot(P[k[0]].x-P[k[1]].x,P[k[0]].y-P[k[1]].y);s0=L.s;}el._t=Date.now();});
  el.addEventListener('pointermove',function(e){if(!P[e.pointerId])return;P[e.pointerId]={x:e.clientX,y:e.clientY};var k=Object.keys(P),r=$('stCv').getBoundingClientRect();if(k.length===2){var d=Math.hypot(P[k[0]].x-P[k[1]].x,P[k[0]].y-P[k[1]].y);L.s=Math.max(.5,Math.min(3,s0*d/d0));}else{L.x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));L.y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));}
   el.style.left=(L.x*100)+'%';el.style.top=(L.y*100)+'%';el.style.transform='translate(-50%,-50%) scale('+L.s+')';var tr=L.y>.88;$('stEd').classList.toggle('trash',tr);});
  el.addEventListener('pointerup',function(e){delete P[e.pointerId];if($('stEd').classList.contains('trash')){$('stEd').classList.remove('trash');_st.layers.splice(_st.layers.indexOf(L),1);stDrawLayers();return;}if(Date.now()-el._t<200&&Object.keys(P).length===0&&!L.m){_st.layers.splice(_st.layers.indexOf(L),1);stDrawLayers();stAddText(L.t);}});});}
function stCompose(){return new Promise(function(res){if(_st.vid||!_st.layers.length)return res(_st.f);var im=new Image();im.onload=function(){var c=document.createElement('canvas');c.width=1080;c.height=1920;var x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,1080,1920);
 var cv=$('stCv').getBoundingClientRect(),s=Math.min(1080/im.naturalWidth,1920/im.naturalHeight),w=im.naturalWidth*s,h=im.naturalHeight*s;
 var blur=document.createElement('canvas');x.filter='blur(40px) brightness(.6)';x.drawImage(im,-60,-60,1200,2040);x.filter='none';x.drawImage(im,(1080-w)/2,(1920-h)/2,w,h);
 _st.layers.forEach(function(L){var fs=Math.round(64*L.s);x.font='700 '+fs+'px Inter,system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';var tx=L.x*1080,ty=L.y*1920,tw=x.measureText(L.t).width;
  if(L.bg){x.fillStyle=L.c;var pw=tw+fs*.8,ph=fs*1.5;if(x.roundRect){x.beginPath();x.roundRect(tx-pw/2,ty-ph/2,pw,ph,ph*.3);x.fill();}else x.fillRect(tx-pw/2,ty-ph/2,pw,ph);x.fillStyle=L.c==='#ffffff'?'#000':'#fff';}else{x.fillStyle=L.c;x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=12;}
  x.fillText(L.t,tx,ty);x.shadowBlur=0;});
 c.toBlob(function(b){res(new File([b],'story.jpg',{type:'image/jpeg'}));},'image/jpeg',.88);};im.onerror=function(){res(_st.f);};im.src=_st.u;});}
function stShare(){var g=$('stGo');g.disabled=true;g.textContent='Yüklənir…';var S=_st;stCompose().then(function(f){return chatUpload(f,'story');}).then(function(url){var cap=S.vid&&S.layers.length?S.layers.map(function(l){return l.t;}).join(' · '):null;
  return run(sb.rpc('story_add3',{p_url:url,p_kind:S.vid?'video':'image',p_caption:cap,p_sticker:S.stk,p_audience:S.aud}));}).then(function(){(S.ment||[]).forEach(function(u){sb.rpc('msg_send',{p_to:u,p_group:null,p_body:'📸 Səni hekayəsində qeyd etdi',p_kind:'text'}).then(function(){},function(){});});stEdClose();toast(S.aud==='cf'?'⭐ Yaxın dostlarla paylaşıldı':'Hekayən paylaşıldı');storyLoad();}).catch(function(e){g.disabled=false;g.textContent='Hekayən ➜';toast('Alınmadı: '+(e.message||e));});}

/* ---------- 9. DM: axtarış, media, yönləndirmə ---------- */
var _chatRoomMenu8=chatRoomMenu;chatRoomMenu=function(){_chatRoomMenu8();var mb=$('mbox');if(mb){var f=mb.querySelector('.igmenu');if(f)f.insertAdjacentHTML('afterend','<button class="igmenu" onclick="closeModal();chatSearch()">🔎 Söhbətdə axtar</button><button class="igmenu" onclick="closeModal();chatMedia()">🖼 Media, fayl və linklər</button>');}};
function chatSearch(){var hd=document.querySelector('.igroom .ighead');if(!hd||$('chS'))return;hd.insertAdjacentHTML('afterend','<div class="chs" id="chS"><input id="chSI" placeholder="Mesajlarda axtar…" oninput="chatSearchGo()"><span id="chSN"></span><button onclick="chatSearchEnd()">Bağla</button></div>');$('chSI').focus();}
function chatSearchGo(){var q=($('chSI').value||'').toLowerCase().trim(),n=0,first=null;document.querySelectorAll('#chatMsgs .igline').forEach(function(l){var m=CHATmsgs.find(function(x){return 'msg'+x.id===(l.querySelector('[id^=msg]')||{}).id;});var hit=!q||(m&&(m.body||'').toLowerCase().indexOf(q)>=0);l.style.display=hit?'':'none';if(q&&hit){n++;if(!first)first=l;}});
 document.querySelectorAll('#chatMsgs .igtime,#chatMsgs .igsys,#chatMsgs .igseen').forEach(function(x){x.style.display=q?'none':'';});$('chSN').textContent=q?n+' nəticə':'';if(first)first.scrollIntoView({block:'center'});}
function chatSearchEnd(){var s=$('chS');if(s)s.remove();document.querySelectorAll('#chatMsgs .igline,#chatMsgs .igtime,#chatMsgs .igsys,#chatMsgs .igseen').forEach(function(x){x.style.display='';});var el=$('chatMsgs');if(el)el.scrollTop=el.scrollHeight;}
function chatMedia(){var M=(CHATmsgs||[]).filter(function(m){return !m.deleted;}),im=M.filter(function(m){return m.image||(m.kind==='vcircle'&&m.file);}),fl=M.filter(function(m){return m.kind==='file';}),ln=M.filter(function(m){return /https?:\/\//.test(m.body||'');});
 window._cmL=im.map(function(m){return m.image?{url:m.image,kind:'image'}:{url:m.file,kind:'video'};});
 modal('<div class="mhead"><h3>Media və fayllar</h3><button class="x" onclick="closeModal()">×</button></div><div class="soseg s3sub"><button class="on" onclick="cmTab(this,0)">Media ('+im.length+')</button><button onclick="cmTab(this,1)">Fayllar ('+fl.length+')</button><button onclick="cmTab(this,2)">Linklər ('+ln.length+')</button></div>'
  +'<div class="cmt"><div class="pfgrid">'+(im.length?im.map(function(m,i){return '<button onclick="closeModal();mediaView(window._cmL,'+i+')">'+(m.image?'<img src="'+esc(m.image)+'">':'<video src="'+esc(m.file)+'#t=0.1" muted></video><i class="pfmi">▶</i>')+'</button>';}).join(''):'<div class="pfempty">Media yoxdur</div>')+'</div></div>'
  +'<div class="cmt" style="display:none">'+(fl.length?fl.map(function(m){return '<a class="igrow" href="'+esc(m.file)+'" target="_blank" rel="noopener"><span class="igfic">📄</span><div class="igmeta"><div class="igname">'+esc(m.fname||'Fayl')+'</div><div class="iglast">'+chatFmtSize(m.fsize)+' · '+chatAgo(m.at)+'</div></div></a>';}).join(''):'<div class="pfempty">Fayl yoxdur</div>')+'</div>'
  +'<div class="cmt" style="display:none">'+(ln.length?ln.map(function(m){var u=(m.body.match(/https?:\/\/\S+/)||[''])[0];return '<a class="igrow" href="'+esc(u)+'" target="_blank" rel="noopener"><span class="igfic">🔗</span><div class="igmeta"><div class="igname">'+esc(u.replace(/^https?:\/\//,'').slice(0,50))+'</div><div class="iglast">'+chatAgo(m.at)+'</div></div></a>';}).join(''):'<div class="pfempty">Link yoxdur</div>')+'</div>');}
function cmTab(b,i){Array.prototype.forEach.call(b.parentNode.children,function(x,k){x.classList.toggle('on',k===i);});Array.prototype.forEach.call(document.querySelectorAll('#mbox .cmt'),function(x,k){x.style.display=k===i?'':'none';});}
var _chatMsgMenu8=chatMsgMenu;chatMsgMenu=function(id){_chatMsgMenu8(id);var c=$('igCtx');if(!c)return;var b=c.querySelector('[onclick*="chatSetReply"]');if(!b)return;var n=b.cloneNode(true);n.setAttribute('onclick','chatCtxClose();chatFwd('+id+')');n.innerHTML=n.innerHTML.replace('Cavab ver','Yönləndir').replace('↩︎','↪︎');b.parentNode.insertBefore(n,b.nextSibling);};
function chatFwd(id){var m=CHATmsgs.find(function(x){return x.id===id;});if(!m)return;Promise.all([run(sb.rpc('msg_threads')).catch(function(){return [];}),socContacts()]).then(function(r){var th=(r[0]||[]).slice(0,20);
 modal('<div class="mhead"><h3>Yönləndir</h3><button class="x" onclick="closeModal()">×</button></div><div style="max-height:60vh;overflow-y:auto">'+th.map(function(t){return '<div class="igrow">'+(t.is_group?grpAva(t.emoji,40):chatAva(t.ad,t.photo,40))+'<div class="igmeta"><div class="igname">'+esc(t.ad)+'</div></div><button class="btn sm" onclick="chatFwdGo('+id+',\''+t.other+'\','+(t.is_group?1:0)+',this)">Göndər</button></div>';}).join('')+'</div>');});}
function chatFwdGo(id,to,g,b){var m=CHATmsgs.find(function(x){return x.id===id;});if(!m)return;b.disabled=true;b.textContent='✓';
 run(sb.rpc('msg_send',{p_to:g?null:to,p_group:g?to:null,p_body:m.body||'',p_kind:m.kind==='story_react'?'text':(m.kind||'text'),p_image:m.image||null,p_file_url:m.file||null,p_file_name:m.fname||null,p_file_size:m.fsize||null,p_duration:m.dur||null})).catch(err);}

/* ---------- 10. BİLDİRİŞLƏR: qruplaşdırma, bölmələr, İzlə ---------- */
notifOpen=function(){Promise.all([run(sb.rpc('notif_list')),run(sb.rpc('follow_list',{p_uid:ME.user_id,p_kind:'following'})).catch(function(){return [];})]).then(function(r){var l=r[0]||[],fw={};(r[1]||[]).forEach(function(u){fw[u.uid]=1;});
 var ic={react:'❤️',comment:'💬',reply:'↩︎',mention:'@',follow:'👤',share:'🔁',clike:'❤️',event:'📅',story:'📸',mentor:'🧭',endorse:'🏅',qa:'❓',coffee:'☕',chal:'🏆',mod:'🛡',sched:'⏰',shop:'🎁',comp:'💌',streak:'🔥'};
 var G=[],key={};l.forEach(function(n){var grp=['react','clike','comment','follow'].indexOf(n.kind)>=0;var k=grp?n.kind+'|'+(n.post||'')+'|'+new Date(n.at).toDateString():null;if(k&&key[k]){key[k].more.push(n);if(!n.read)key[k].read=false;return;}var o=Object.assign({more:[]},n);G.push(o);if(k)key[k]=o;});
 var day=86400000,now=Date.now(),sec=function(n){var d=now-new Date(n.at);return d<day?'Bu gün':d<7*day?'Bu həftə':'Daha əvvəl';};
 var go=function(n,a){if(n.post&&n.kind!=='story')return "postOpen('"+n.post+"')";if(['follow','endorse','mentor'].indexOf(n.kind)>=0)return "socProfile('"+a.uid+"')";if(n.kind==='event')return "show('feed');feedMode('events')";if(n.kind==='qa')return "show('feed');feedMode('qa')";if(['coffee','chal','streak'].indexOf(n.kind)>=0)return "show('feed');feedMode('team')";if(n.kind==='comp')return "show('feed');feedMode('fun')";if(n.kind==='shop')return "show('feed');feedMode('shop')";return '';};
 var cur='',h='';G.forEach(function(n){var s=sec(n);if(s!==cur){cur=s;h+='<div class="ntsec">'+s+'</div>';}var a=n.actor||{},sys=['mod','sched','chal','shop','comp','streak'].indexOf(n.kind)>=0;
  var names=[a].concat(n.more.map(function(m){return m.actor||{};})).filter(function(x,i,arr){return x.uid&&arr.findIndex(function(y){return y.uid===x.uid;})===i;});
  var who=sys?'Baş Ofis':esc(names[0]&&names[0].ad||'')+(names.length===2?' və '+esc(names[1].ad):names.length>2?' və '+(names.length-1)+' nəfər':'');
  var av=sys?'<span class="s3ni">'+(ic[n.kind]||'🔔')+'</span>':names.length>1?'<span class="ntav2">'+chatAva(names[1].ad,names[1].photo,30)+chatAva(names[0].ad,names[0].photo,30)+'</span>':chatAva(a.ad,a.photo,44);
  var act=n.kind==='follow'&&names.length===1&&a.uid?'<button class="btn sm'+(fw[a.uid]?' ghost':'')+'" onclick="event.stopPropagation();socFollow2(\''+a.uid+'\','+(!fw[a.uid])+',this)">'+(fw[a.uid]?'İzləyirsən':'Sən də izlə')+'</button>':'';
  h+='<div class="sonotif'+(n.read?'':' un')+'" onclick="closeModal();'+go(n,a)+'"><span class="soni">'+av+(sys?'':'<i>'+(ic[n.kind]||'🔔')+'</i>')+'</span><div style="flex:1;min-width:0"><b>'+who+'</b> '+esc(n.text)+'<small>'+chatAgo(n.at)+'</small></div>'+act+'</div>';});
 modal('<div class="mhead"><h3>Bildirişlər</h3><button class="x" onclick="closeModal()">×</button></div><div style="max-height:70vh;overflow-y:auto">'+(h||'<p class="hint">Hələ bildiriş yoxdur</p>')+'</div>');sb.rpc('notif_read_all').then(function(){NOTIF_N=0;notifCount();},function(){});}).catch(err);};

/* ---------- 11. ŞƏRHLƏR: emoji zolağı, sabitləmə, basıb saxla ---------- */
feedComments=function(id){_cParent=null;_ment={};var P=FEED.find(function(x){return x.id===id;})||{};run(sb.rpc('post_comments2',{p_id:id})).then(function(r){r=r||[];window._cmts=r;window._cmPost=id;var top=r.filter(function(c){return !c.parent;}),kids=function(pid){return r.filter(function(c){return c.parent===pid;});};
 var one=function(c,sub){return '<div class="igcm'+(sub?' sub':'')+(c.pinned?' pin':'')+'" data-c="'+c.id+'" oncontextmenu="event.preventDefault();cmAct('+c.id+')" ontouchstart="this._t=setTimeout(function(){cmAct('+c.id+')},500)" ontouchend="clearTimeout(this._t)" ontouchmove="clearTimeout(this._t)">'+chatAva(c.ad,c.photo,sub?26:32)+'<div class="cmb">'+(c.pinned?'<small class="cmpin">📌 Sabitlənib</small>':'')+'<div><b onclick="socProfile(\''+c.uid+'\')">'+esc(c.ad)+'</b> '+socText(c.body)+'</div><small>'+chatAgo(c.at)+(c.likes?' · '+c.likes+' bəyənmə':'')+' · <a onclick="cmReply('+(c.parent||c.id)+',\''+chatArg(c.ad)+'\')">Cavab ver</a></small></div><button class="cmlk'+(c.liked?' on':'')+'" onclick="cmLike(\''+id+'\','+c.id+','+(!c.liked)+')">'+(c.liked?'❤️':'🤍')+'</button></div>';};
 modal('<div class="mhead"><h3>Şərhlər</h3><button class="x" onclick="closeModal()">×</button></div><div style="max-height:52vh;overflow-y:auto">'+(top.length?top.map(function(c){return one(c)+kids(c.id).map(function(k){return one(k,1);}).join('');}).join(''):'<div class="pfempty">Hələ şərh yoxdur<br><small>Söhbətə ilk sən başla</small></div>')+'</div>'
  +'<div class="cmemo">'+['❤️','🙌','🔥','👏','😢','😍','😮','😂'].map(function(e){return '<button onclick="var i=$(\'fcB\');i.value+=\''+e+'\';i.focus()">'+e+'</button>';}).join('')+'</div>'
  +'<div id="cmTo" class="cmto"></div><div class="row" style="gap:6px;margin-top:6px;position:relative"><input id="fcB" placeholder="Şərh yaz… (@ ilə qeyd et)" style="flex:1" onkeydown="if(event.key===\'Enter\')feedComment(\''+id+'\')"><button class="btn" onclick="feedComment(\''+id+'\')">Göndər</button></div>');mentionBind($('fcB'));}).catch(err);};
function cmAct(cid){var c=(window._cmts||[]).find(function(x){return x.id===cid;});if(!c)return;try{navigator.vibrate&&navigator.vibrate(12);}catch(e){}var pid=window._cmPost,P=FEED.find(function(x){return x.id===pid;})||{},own=P.mine||SOC_MOD;
 var d=document.createElement('div');d.className='s3over';d.innerHTML='<div class="s3sheet"><div class="cmq">'+esc(c.ad)+': '+esc(c.body.slice(0,80))+'</div>'
  +'<button class="igmenu" onclick="this.closest(\'.s3over\').remove();cmReply('+(c.parent||c.id)+',\''+chatArg(c.ad)+'\')">↩︎ Cavab ver</button>'
  +(own&&!c.parent?'<button class="igmenu" onclick="this.closest(\'.s3over\').remove();cmPin('+cid+','+(!c.pinned)+')">📌 '+(c.pinned?'Sabitdən çıxar':'Sabitlə')+'</button>':'')
  +(c.mine||own?'<button class="igmenu" style="color:#ed4956" onclick="this.closest(\'.s3over\').remove();cmDel('+cid+')">🗑 Sil</button>':'')
  +(!c.mine?'<button class="igmenu" onclick="this.closest(\'.s3over\').remove();repOpen(\'comment\',\''+cid+'\')">🚩 Şikayət et</button>':'')
  +'<button class="igmenu" onclick="this.closest(\'.s3over\').remove()">Ləğv et</button></div>';d.onclick=function(e){if(e.target===d)d.remove();};document.body.appendChild(d);}
function cmPin(cid,on){run(sb.rpc('comment_pin',{p_id:cid,p_on:on})).then(function(){feedComments(window._cmPost);}).catch(err);}
function cmDel(cid){if(!confirm('Şərh silinsin?'))return;run(sb.rpc('comment_delete',{p_id:cid})).then(function(){var p=FEED.find(function(x){return x.id===window._cmPost;});if(p){p.comments=Math.max(0,(p.comments||1)-1);postRedraw(p);}feedComments(window._cmPost);}).catch(err);}

;

/* ---- pəncərəni (sheet) aşağı çəkib bağlamaq ---- */
(function(){var mb=$('mbox'),y0=null,dy=0,drag=false;if(!mb)return;
 var innerScrolled=function(t){for(var e=t;e&&e!==mb;e=e.parentNode){if(e.nodeType===1&&e.scrollHeight>e.clientHeight+2&&getComputedStyle(e).overflowY!=='visible'&&e.scrollTop>0)return true;}return false;};
 mb.addEventListener('touchstart',function(e){if(window.innerWidth>760||e.touches.length>1)return;var t=e.target,zone=e.touches[0].clientY-mb.getBoundingClientRect().top<70||!!t.closest('.mhead');if(!zone){if(t.closest('input,textarea,select,.socar,.fpfl,.soseg,.s3hl'))return;if(mb.scrollTop>0||innerScrolled(t))return;}else if(t.closest('button.x'))return;y0=e.touches[0].clientY;dy=0;drag=zone;if(zone){mb.style.transition='none';}},{passive:true});
 mb.addEventListener('touchmove',function(e){if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy<=0){if(drag){mb.style.transform='';}y0=dy<-6?null:y0;return;}if(!drag&&dy>8)drag=true;if(drag){if(e.cancelable)e.preventDefault();mb.style.transition='none';mb.style.transform='translateY('+dy+'px)';$('modal').style.background='rgba(0,0,0,'+Math.max(0,.32-dy/900)+')';}},{passive:false});
 mb.addEventListener('touchend',function(){if(y0==null)return;y0=null;if(!drag)return;drag=false;mb.style.transition='transform .22s ease';$('modal').style.background='';
  if(dy>110){mb.style.transform='translateY(110%)';setTimeout(function(){mb.style.transition='';mb.style.transform='';closeModal();},200);}else{mb.style.transform='';setTimeout(function(){mb.style.transition='';},230);}},{passive:true});
 $('modal').addEventListener('click',function(e){if(e.target===this)closeModal();});})();

;

/* ---- çatda avatar / başlıq → profil ---- */
document.addEventListener('click',function(e){var box=e.target.closest&&e.target.closest('#chatMsgs');if(!box)return;var line=e.target.closest('.igline.their');if(!line)return;var av=line.firstElementChild;if(!av||!(av===e.target||av.contains(e.target))||av.classList.contains('igsp'))return;
 var id=+line.dataset.id,m=(CHATmsgs||[]).find(function(x){return x.id===id;});var uid=CHATgroup?(m&&m.sender):CHATother;if(uid){e.stopPropagation();socProfile(uid);}},true);
chatProfile=function(){if(CHATother&&!CHATgroup)socProfile(CHATother);};

;

/* ===================== IG +10 ===================== */
/* 1. Bəyənənlər siyahısı · 6. bəyənmə sayını gizlət / şərhləri söndür (kartda) */
var _postCard10=_postCard0;
_postCard0=function(p){var h=_postCard10(p);if(p.kind==='kudos')return h;
 if(p.hidelk&&!p.mine){h=h.replace(/(<button class="sorx[^"]*"[^>]*>(?:<svg[\s\S]*?<\/svg>|<span class="igme">[^<]*<\/span>))<span>[^<]*<\/span>/,'$1').replace(/<div class="iglk">[\s\S]*?<\/div>/,'');}
 else h=h.replace('<div class="iglk">','<div class="iglk" onclick="postLikers(\''+p.id+'\')">');
 if(p.nocm){h=h.replace(/<button onclick="feedComments\('[^']+'\)">[\s\S]*?<\/button>/,'').replace(/<a class="igcml"[\s\S]*?<\/a>/,'');h=h.replace('<div class="igwhen">','<div class="igoff">Şərhlər söndürülüb</div><div class="igwhen">');}
 if(p.edited)h=h.replace(/(<div class="igwhen">[^<]*)/,'$1 · redaktə edilib');
 if(p.archived)h=h.replace('<div class="igph">','<div class="igarc">🗄 Arxivdədir — yalnız sən görürsən</div><div class="igph">');
 return h;};
function postLikers(id){run(sb.rpc('post_likers',{p_id:id})).then(function(l){l=l||[];var by={};l.forEach(function(x){by[x.e]=(by[x.e]||0)+1;});window._lk=l;
 modal('<div class="mhead"><h3>Reaksiyalar</h3><button class="x" onclick="closeModal()">×</button></div><div class="soseg s3sub lkt"><button class="on" onclick="lkF(this,\'\')">Hamısı '+l.length+'</button>'+Object.keys(by).map(function(e){return '<button onclick="lkF(this,\''+e+'\')">'+e+' '+by[e]+'</button>';}).join('')+'</div><div id="lkL" style="max-height:60vh;overflow-y:auto"></div>');lkF(null,'');}).catch(err);}
function lkF(b,e){if(b)Array.prototype.forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b);});var l=(window._lk||[]).filter(function(x){return !e||x.e===e;});
 $('lkL').innerHTML=l.length?l.map(function(u){return '<div class="igrow"><span class="lkav" onclick="socProfile(\''+u.uid+'\')">'+chatAva(u.ad,u.photo,44)+'<i>'+esc(u.e)+'</i></span><div class="igmeta" onclick="socProfile(\''+u.uid+'\')"><div class="igname">'+esc(u.ad)+'</div><div class="iglast">'+chatAgo(u.at)+'</div></div>'+(u.uid!==ME.user_id?'<button class="btn sm'+(u.ifollow?' ghost':'')+'" onclick="socFollow2(\''+u.uid+'\','+(!u.ifollow)+',this)">'+(u.ifollow?'İzləyirsən':'İzlə')+'</button>':'')+'</div>';}).join(''):'<div class="pfempty">Hələ reaksiya yoxdur</div>';}

/* 5-6. Post ayarları: arxiv, şərhlər, bəyənmə sayı */
var _feedMenu10=feedMenu;feedMenu=function(id){_feedMenu10(id);var p=FEED.find(function(x){return x.id===id;})||{};var mb=$('mbox');if(!mb||!p.mine||p.kind!=='post')return;
 var ref=mb.querySelector('.igmenu[style*="ed4956"]');var h='<button class="igmenu" onclick="postSet(\''+id+'\',\'archived\','+(!p.archived)+')">'+(p.archived?'🗄 Profilə qaytar':'🗄 Arxivlə')+'</button>'
  +'<button class="igmenu" onclick="postSet(\''+id+'\',\'nocm\','+(!p.nocm)+')">'+(p.nocm?'💬 Şərhləri aç':'💬 Şərhləri söndür')+'</button>'
  +'<button class="igmenu" onclick="postSet(\''+id+'\',\'hidelk\','+(!p.hidelk)+')">'+(p.hidelk?'❤️ Reaksiya sayını göstər':'❤️ Reaksiya sayını gizlət')+'</button>';
 if(ref)ref.insertAdjacentHTML('beforebegin',h);else mb.insertAdjacentHTML('beforeend',h);};
function postSet(id,k,v){var a={p_id:id,p_archived:null,p_no_comments:null,p_hide_likes:null};a[k==='archived'?'p_archived':k==='nocm'?'p_no_comments':'p_hide_likes']=v;
 run(sb.rpc('post_settings',a)).then(function(){closeModal();var p=FEED.find(function(x){return x.id===id;});if(p)p[k]=v;
  if(k==='archived'&&v){var e=$('post'+id);if(e&&!e.closest('.pg'))e.remove();toast('🗄 Arxivləndi. Profil → ☰ → Arxiv');}else{if(p)postRedraw(p);toast(k==='nocm'?(v?'Şərhlər söndürüldü':'Şərhlər açıldı'):k==='hidelk'?(v?'Reaksiya sayı gizlədildi':'Reaksiya sayı görünür'):'Profilə qaytarıldı');}}).catch(err);}
function archiveOpen(){var pg=pgPush(pgHead('🗄 Arxiv')+'<div class="pgc"><p class="hint" style="margin:10px 0">Arxivdəki postları yalnız sən görürsən. Postu açıb "⋯" → "Profilə qaytar".</p><div id="pfGrid" class="pfgrid"></div></div>','archive');
 run(sb.rpc('feed2',{p_mode:'archive',p_arg:null,p_before:null})).then(function(l){l=l||[];l.forEach(function(q){var i=FEED.findIndex(function(y){return y.id===q.id;});if(i>=0)FEED[i]=q;else FEED.push(q);});pfGrid(l,'Arxiv boşdur');}).catch(err);}

/* 2. Ümumi izləyicilər · 10. QR kod (profil) */
var _socProfile10=socProfile;socProfile=function(uid){_socProfile10(uid);if(!uid||uid==='undefined')return;var n=0;(function go(){var t=pgTop(),inf=t&&t.dataset.key==='prof:'+uid&&t.querySelector('.pfinfo');if(!inf){if(n++<50)setTimeout(go,100);return;}if(inf.querySelector('.pfmu'))return;
 var bt=t.querySelector('.pfbt');if(bt&&!bt.querySelector('.qrb'))bt.insertAdjacentHTML('beforeend','<button class="btn ghost sq qrb" onclick="qrOpen(\''+uid+'\')" title="QR kod">▦</button>');
 if(uid===ME.user_id)return;inf.insertAdjacentHTML('beforeend','<div class="pfmu"></div>');run(sb.rpc('soc_mutuals',{p_uid:uid})).then(function(m){var d=inf.querySelector('.pfmu');if(!d||!m||!m.n)return;
  d.innerHTML='<span class="mufc">'+m.top.map(function(u){return chatAva(u.ad,u.photo,20);}).join('')+'</span><span>İzləyir: '+m.top.map(function(u){return '<b onclick="socProfile(\''+u.uid+'\')">'+esc(u.ad.split(' ')[0])+'</b>';}).join(', ')+(m.n>m.top.length?' və '+(m.n-m.top.length)+' nəfər':'')+'</span>';}).catch(function(){});})();};
var _pfMenu10=pfMenu;pfMenu=function(uid){_pfMenu10(uid);if(uid)return;var mb=$('mbox'),f=mb&&mb.querySelector('.igmenu');if(f)f.insertAdjacentHTML('afterend','<button class="igmenu" onclick="closeModal();archiveOpen()">🗄 Arxiv</button><button class="igmenu" onclick="closeModal();qrOpen(ME.user_id)">▦ QR kod</button>');};
function qrOpen(uid){var p=window._prof||{},url='https://ofis.pilothayat.az/?u='+uid;
 modal('<div class="mhead"><h3>QR kod</h3><button class="x" onclick="closeModal()">×</button></div><div class="qrc"><div class="qrbox"><div id="qrI"></div><div class="qrn">'+esc((p.ad||'').toUpperCase())+'</div></div><div class="row" style="gap:8px;margin-top:14px"><button class="btn ghost" style="flex:1" onclick="qrShare(\''+url+'\')">↗︎ Paylaş</button><button class="btn ghost" style="flex:1" onclick="qrCopy(\''+url+'\')">🔗 Linki kopyala</button></div><p class="hint" style="text-align:center">Kamera ilə skan edəndə profil açılır</p></div>');
 setTimeout(function(){try{new QRCode($('qrI'),{text:url,width:220,height:220,colorDark:'#7c3aed',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});}catch(e){$('qrI').textContent=url;}},50);}
function qrShare(u){if(navigator.share)navigator.share({title:'Baş Ofis profili',url:u}).catch(function(){});else qrCopy(u);}
function qrCopy(u){try{navigator.clipboard.writeText(u).then(function(){toast('🔗 Link kopyalandı');});}catch(e){prompt('Link:',u);}}
(function(){var q=new URLSearchParams(location.search),u=q.get('u');if(!u)return;var go=function(){if(typeof ME==='undefined'||!ME||!sb){setTimeout(go,800);return;}try{history.replaceState(history.state,'',location.pathname);}catch(e){}setTimeout(function(){socProfile(u);},900);};setTimeout(go,1500);})();

/* 3. Sizin üçün təkliflər · 4. Hamısını gördün */
var SUGG=null,SUGX={};try{SUGX=JSON.parse(localStorage.getItem('sugx')||'{}');}catch(e){}
var _feedDraw10=feedDraw;feedDraw=function(){_feedDraw10();if(FMODE!=='all')return;s10caught();var el=$('igPosts');if(!el||$('sugg'))return;var posts=el.querySelectorAll(':scope>.igpost');if(posts.length<2)return;var at=posts[Math.min(2,posts.length-1)];
 var draw=function(){var l=(SUGG||[]).filter(function(u){return !u.ifollow&&u.uid!==ME.user_id&&!SUGX[u.uid];}).slice(0,12);if(l.length<1||$('sugg'))return;
  at.insertAdjacentHTML('afterend','<div id="sugg" class="sugg"><div class="row sp"><b>Sizin üçün təkliflər</b><a class="igtxt" onclick="show(\'feed\');feedMode(\'explore\')">Hamısı</a></div><div class="sugl">'+l.map(function(u){return '<div class="sugc" id="sg'+u.uid+'"><button class="sgx" onclick="sugHide(\''+u.uid+'\')">✕</button><span onclick="socProfile(\''+u.uid+'\')">'+chatAva(u.ad,u.photo,76)+'</span><b onclick="socProfile(\''+u.uid+'\')">'+esc(u.ad)+'</b><small>'+esc(u.vezife||(u.new?'Yeni həmkar':'Komandadan'))+'</small><button class="btn sm" onclick="sugFollow(\''+u.uid+'\',this)">İzlə</button></div>';}).join('')+'</div></div>');};
 if(SUGG)draw();else run(sb.rpc('soc_explore')).then(function(x){SUGG=(x&&x.people)||[];draw();}).catch(function(){});};
function sugHide(uid){SUGX[uid]=1;try{localStorage.setItem('sugx',JSON.stringify(SUGX));}catch(e){}var c=$('sg'+uid);if(c){c.style.transform='scale(.8)';c.style.opacity='0';setTimeout(function(){c.remove();var l=document.querySelector('#sugg .sugl');if(l&&!l.children.length)$('sugg').remove();},200);}}
function sugFollow(uid,b){b.disabled=true;run(sb.rpc('soc_follow',{p_uid:uid,p_on:true})).then(function(){b.textContent='İzləyirsən';b.classList.add('ghost');var s=(SUGG||[]).find(function(u){return u.uid===uid;});if(s)s.ifollow=true;}).catch(err);}
function s10caught(){var el=$('igPosts');if(!el||$('caught'))return;var lim=Date.now()-3*86400000,ps=el.querySelectorAll(':scope>.igpost'),first=null,newer=0;
 Array.prototype.forEach.call(ps,function(n){var p=FEED.find(function(x){return 'post'+x.id===n.id;});if(!p||p.pinned)return;if(new Date(p.at)>=lim)newer++;else if(!first)first=n;});
 if(first&&newer>0)first.insertAdjacentHTML('beforebegin','<div id="caught" class="caught"><span>✓</span><b>Hamısını gördün</b><small>Son 3 gündə paylaşılan bütün postlara baxdın</small><i>Köhnə postlar</i></div>');}
var _feedMore10=feedMore;feedMore=function(){_feedMore10();setTimeout(s10caught,1500);};

/* 7. Postu hekayəyə paylaş */
var _postShare10=postShare;postShare=function(id){_postShare10(id);var n=0;(function go(){var mb=$('mbox'),f=mb&&mb.querySelector('.igmenu');if(!f){if(n++<30)setTimeout(go,100);return;}if(mb.querySelector('.p2s'))return;f.insertAdjacentHTML('afterend','<button class="igmenu p2s" onclick="closeModal();postToStory(\''+id+'\')">➕ Hekayənə əlavə et</button>');})();};
function postToStory(id){var p=FEED.find(function(x){return x.id===id;});if(!p)return;var a=p.author||p.ref||{},m=p.media&&p.media.find(function(x){return x.kind!=='video';}),img=m?m.url:p.image;toast('Hazırlanır…');
 var c=document.createElement('canvas');c.width=1080;c.height=1920;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,1080,1920);g.addColorStop(0,'#4f46e5');g.addColorStop(1,'#db2777');x.fillStyle=g;x.fillRect(0,0,1080,1920);
 var card=function(im){var cw=820,ix=130,iy=420,ih=im?Math.min(1025,cw*im.naturalHeight/im.naturalWidth):0,ch=ih+(im?230:520);x.fillStyle='#fff';x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=50;if(x.roundRect){x.beginPath();x.roundRect(ix,iy,cw,ch,36);x.fill();}else x.fillRect(ix,iy,cw,ch);x.shadowBlur=0;
  x.fillStyle='#0a0a0a';x.font='700 40px Inter,system-ui,sans-serif';x.fillText(a.ad||'Baş Ofis',ix+40,iy+75);
  if(im){x.save();x.beginPath();x.rect(ix,iy+110,cw,ih);x.clip();var s=Math.max(cw/im.naturalWidth,ih/im.naturalHeight);x.drawImage(im,ix+(cw-im.naturalWidth*s)/2,iy+110+(ih-im.naturalHeight*s)/2,im.naturalWidth*s,im.naturalHeight*s);x.restore();}
  x.fillStyle='#262626';x.font='400 36px Inter,system-ui,sans-serif';var t=(p.body||'').replace(/\s+/g,' '),y=iy+110+ih+(im?70:60),line='',lines=0;t.split(' ').forEach(function(w){if(lines>=(im?1:7))return;if(x.measureText(line+w).width>cw-80){x.fillText(line,ix+40,y);y+=50;line='';lines++;}line+=w+' ';});if(lines<(im?1:7)&&line)x.fillText(line.length>60&&im?line.slice(0,58)+'…':line,ix+40,y);
  c.toBlob(function(b){var f=new File([b],'post.jpg',{type:'image/jpeg'});chatUpload(f,'story').then(function(u){return run(sb.rpc('story_add3',{p_url:u,p_kind:'image',p_caption:null,p_sticker:{type:'post',id:id,q:'Posta bax'},p_audience:'all'}));}).then(function(){toast('Hekayənə əlavə edildi');if(typeof storyLoad==='function')storyLoad();}).catch(err);},'image/jpeg',.9);};
 if(img){var im=new Image();im.crossOrigin='anonymous';im.onload=function(){try{var t=document.createElement('canvas');t.width=t.height=2;t.getContext('2d').drawImage(im,0,0,2,2);t.toDataURL();card(im);}catch(e){card(null);}};im.onerror=function(){card(null);};im.src=img+(img.indexOf('?')<0?'?cors=1':'');}else card(null);}
/* 8. Hekayə: post və link stikerləri, sürətli emoji */
var _storyShow10=storyShow;storyShow=function(){_storyShow10();if(!_sv)return;var it=CHAT_STORIES[_sv.ui]&&CHAT_STORIES[_sv.ui].items[_sv.ii];if(!it||!it.st)return;var s=it.st;if(s.type!=='post'&&s.type!=='link')return;
 var old=document.querySelector('#igSV .svstk');if(old)old.remove();var d=document.createElement('button');d.className='svpst';
 if(s.type==='post'){d.innerHTML='Posta bax ›';d.onclick=function(e){e.stopPropagation();storyClose();postOpen(s.id);};}else{d.innerHTML='🔗 '+esc(s.t||s.url.replace(/^https?:\/\//,'').slice(0,28));d.onclick=function(e){e.stopPropagation();svPause(true);window.open(s.url,'_blank');};}
 var st=$('svStage');(st||$('igSV')).appendChild(d);};
var _stStk10=stStk;stStk=function(){_stStk10();var p=document.querySelector('#stPanel .fptools');if(p&&!p.querySelector('.stlk'))p.insertAdjacentHTML('afterbegin','<button class="btn ghost sm stlk" onclick="stLink()">🔗 Link</button>');};
function stLink(){var u=prompt('Link (https://...)','https://');if(!u||!/^https?:\/\/\S+\.\S+/.test(u)){if(u)toast('Düzgün link yazın');return;}var t=prompt('Stikerdə görünən yazı (istəyə görə)','')||'';_st.stk={type:'link',url:u,t:t.slice(0,40),q:t||u};$('stPanel').innerHTML='<div class="stchip">🔗 '+esc(t||u)+' <a onclick="_st.stk=null;this.parentNode.remove()">✕</a></div>';}
var _svType10=svType;svType=function(on){_svType10(on);var r=$('igSV');if(!r)return;var q=r.querySelector('.svqe');if(on&&!q){r.insertAdjacentHTML('beforeend','<div class="svqe"><small>Sürətli reaksiyalar</small><div>'+['😂','😮','😍','😢','👏','🔥','🎉','💯'].map(function(e){return '<button onmousedown="event.preventDefault()" onclick="svQuick(\''+e+'\')">'+e+'</button>';}).join('')+'</div></div>');}else if(!on&&q)q.remove();};
function svQuick(e){storyReact(e);var r=$('igSV');var h=document.createElement('span');h.className='svbig';h.textContent=e;r.appendChild(h);setTimeout(function(){h.remove();},900);var i=$('svRe');if(i)i.blur();}

/* 9. Səsli mesaj sürəti */
var VSPD=1;try{VSPD=+localStorage.getItem('vspd')||1;}catch(e){}
var _voiceHtml10=voiceHtml;voiceHtml=function(m){return _voiceHtml10(m).replace(/<\/div>$/,'<button class="igvsp" onclick="event.stopPropagation();vSpeed(this,'+m.id+')">'+VSPD+'×</button></div>');};
function vSpeed(b,id){VSPD=VSPD===1?1.5:VSPD===1.5?2:1;try{localStorage.setItem('vspd',VSPD);}catch(e){}document.querySelectorAll('.igvsp').forEach(function(x){x.textContent=VSPD+'×';});if(_vAudio)_vAudio.playbackRate=VSPD;}
var _voicePlay10=voicePlay;voicePlay=function(id,url){_voicePlay10(id,url);if(_vAudio)_vAudio.playbackRate=VSPD;};

;

/* ---- Instagram jesti: Çat ↔ Lent sürüşdürmə, çat otağında kənardan geri ---- */
(function(){var S=null;
 var busy=function(){return document.body.classList.contains('incall')||$('modal').classList.contains('on')||document.querySelector('.pg.on,#igSV,#mvw,#igReel,#stEd,#s4wr,#s4quiz,#igCtx,.s3over')||(typeof CHAT_SEL!=='undefined'&&CHAT_SEL);};
 var ctx=function(){var c=$('v-chat'),f=$('v-feed');if(c&&c.classList.contains('on'))return CHATother?'room':'list';if(f&&f.classList.contains('on'))return 'feed';return null;};
 var hscroll='.socar,.igstories,.soseg,.sugl,.s3hl,.pfbd,.fpfl,.sochips,.igvc,video,input,textarea,.igboards,.s4opts,.sorpick';
 document.addEventListener('touchstart',function(e){S=null;if(e.touches.length>1||busy())return;var k=ctx();if(!k)return;var t=e.touches[0];
  if(k==='room'){if(t.clientX>28)return;}else if(e.target.closest(hscroll))return;
  var el=k==='room'?document.querySelector('.igroom'):$(k==='feed'?'v-feed':'v-chat');if(!el)return;S={k:k,x:t.clientX,y:t.clientY,dx:0,on:false,el:el};},{passive:true});
 document.addEventListener('touchmove',function(e){if(!S)return;var t=e.touches[0];S.dx=t.clientX-S.x;var dy=t.clientY-S.y;
  if(!S.on){if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(S.dx)){S=null;return;}if(Math.abs(S.dx)>14&&Math.abs(S.dx)>Math.abs(dy)*1.4){
    if(S.k==='feed'&&S.dx>0){S=null;return;}if(S.k==='room'&&S.dx<0){S=null;return;}S.on=true;S.el.style.transition='none';}}
  if(S.on){if(e.cancelable)e.preventDefault();var d=S.dx;S.el.style.transform='translateX('+d+'px)';S.el.style.opacity=String(Math.max(.4,1-Math.abs(d)/700));}},{passive:false});
 document.addEventListener('touchend',function(){if(!S)return;var s=S;S=null;if(!s.on)return;var el=s.el,ok=Math.abs(s.dx)>90;
  el.style.transition='transform .2s ease,opacity .2s ease';
  if(!ok){el.style.transform='';el.style.opacity='';setTimeout(function(){el.style.transition='';},220);return;}
  var dir=s.dx>0?1:-1;el.style.transform='translateX('+(dir*110)+'%)';el.style.opacity='0';try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}
  setTimeout(function(){el.style.transition='';el.style.transform='';el.style.opacity='';
   if(s.k==='room'){chatBack();return;}var to=s.k==='feed'?'chat':'feed';show(to);var n=$('v-'+to);if(n){n.classList.remove('swin-l','swin-r');void n.offsetWidth;n.classList.add(dir>0?'swin-l':'swin-r');setTimeout(function(){n.classList.remove('swin-l','swin-r');},320);}},190);},{passive:true});})();

;

/* ===================== SOSİAL +15 ===================== */
function ovl(html,cls){var d=document.createElement('div');d.className='s3over '+(cls||'');d.innerHTML='<div class="s3sheet">'+html+'</div>';d.onclick=function(e){if(e.target===d)d.remove();};document.body.appendChild(d);return d;}
function ovlPick(title,cb){socContacts().then(function(l){var d=ovl('<div class="mhead"><h3>'+esc(title)+'</h3><button class="x" onclick="this.closest(\'.s3over\').remove()">×</button></div><input class="ovq" placeholder="Axtar…" style="width:100%;margin-bottom:8px"><div class="ovl" style="max-height:55vh;overflow-y:auto">'+(l||[]).filter(function(c){return c.uid!==ME.user_id;}).map(function(c){return '<div class="igrow" data-u="'+c.uid+'" data-n="'+esc(c.ad)+'">'+chatAva(c.ad,c.photo,40)+'<div class="igmeta"><div class="igname">'+esc(c.ad)+'</div></div></div>';}).join('')+'</div>');
 d.querySelector('.ovq').oninput=function(){var q=this.value.toLowerCase();d.querySelectorAll('.ovl .igrow').forEach(function(r){r.style.display=r.dataset.n.toLowerCase().indexOf(q)>=0?'':'none';});};
 d.querySelectorAll('.ovl .igrow').forEach(function(r){r.onclick=function(){d.remove();cb(r.dataset.u,r.dataset.n);};});});}

/* ---------- 15. QARANLIQ REJİM ---------- */
function themeGet(){try{return localStorage.getItem('theme')||'off';}catch(e){return 'off';}}
function themeApply(){var t=themeGet(),dark=t==='on'||(t==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',dark?'#000000':'#ffffff');}
function themeSet(t){try{localStorage.setItem('theme',t);}catch(e){}themeApply();}
function themeMenu(){var t=themeGet();modal('<div class="mhead"><h3>🌙 Görünüş</h3><button class="x" onclick="closeModal()">×</button></div>'+[['off','☀️ İşıqlı'],['on','🌙 Qaranlıq'],['auto','📱 Telefonun ayarına görə']].map(function(o){return '<button class="igmenu" onclick="themeSet(\''+o[0]+'\');themeMenu()">'+o[1]+(t===o[0]?' <b style="float:right;color:#0a84ff">✓</b>':'')+'</button>';}).join(''));}
themeApply();try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',themeApply);}catch(e){}

/* ---------- 1. SƏSLİ MESAJ → MƏTN ---------- */
var _voiceHtml15=voiceHtml;voiceHtml=function(m){return _voiceHtml15(m).replace(/<\/div>$/,'<button class="igstt" onclick="event.stopPropagation();vStt('+m.id+',this)" title="Mətnə çevir">Aa</button></div><div class="igsttx" id="stt'+m.id+'"></div>');};
function vStt(id,b){var box=$('stt'+id);if(!box)return;if(box.dataset.on){box.innerHTML='';delete box.dataset.on;return;}box.dataset.on=1;box.innerHTML='<span class="spin"></span> Mətnə çevrilir…';b.disabled=true;
 sb.functions.invoke('soc-ai',{body:{op:'stt',msg_id:id}}).then(function(r){b.disabled=false;var d=r.data||{};if(r.error||d.error){box.innerHTML='<i>'+esc(d.error||'Alınmadı')+'</i>';return;}box.textContent=d.text;var el=$('chatMsgs');if(el&&el.scrollHeight-el.scrollTop-el.clientHeight<200)el.scrollTop=el.scrollHeight;}).catch(function(){b.disabled=false;box.innerHTML='<i>Alınmadı</i>';});}

/* ---------- 2. AI POST YAZISI + 8/9. işarələmə, məkan, birgə ---------- */
var _fpTags=[],_fpPlace=null,_fpCollab=null,PLACES=['LUX Residence','Baş Ofis','Pilot Həyat','Bina 1','Bina 2','Bina 3','Bina 4','Bina 5','Bina 6','Bina 7','Satış ofisi','Tikinti sahəsi'];
var _feedCompose15=feedCompose;feedCompose=function(c,ch){_fpTags=[];_fpPlace=null;_fpCollab=null;_feedCompose15(c,ch);var t=document.querySelector('#mbox .fptools');if(!t)return;
 t.insertAdjacentHTML('beforeend','<button class="btn ghost sm" onclick="aiCap()">✨ AI</button><button class="btn ghost sm" onclick="fpTagUI()">👤</button><button class="btn ghost sm" onclick="fpPlaceUI()">📍</button><button class="btn ghost sm" onclick="fpCollabUI()">🤝</button>');
 t.insertAdjacentHTML('afterend','<div id="fpAi"></div><div id="fpMeta" class="fpmeta"></div>');};
function fpMetaDraw(){var e=$('fpMeta');if(!e)return;e.innerHTML=(_fpTags.length?'<span>👤 '+_fpTags.map(function(t){return esc(t.ad.split(' ')[0]);}).join(', ')+' <a onclick="_fpTags=[];fpMetaDraw()">✕</a></span>':'')+(_fpPlace?'<span>📍 '+esc(_fpPlace)+' <a onclick="_fpPlace=null;fpMetaDraw()">✕</a></span>':'')+(_fpCollab?'<span>🤝 '+esc(_fpCollab.ad)+' <a onclick="_fpCollab=null;fpMetaDraw()">✕</a></span>':'');}
function fpFirstImg(){return _fpMedia.find(function(f){return f.url?f.kind!=='video':/^image/.test(f.type);});}
function aiCap(){var box=$('fpAi');if(!box)return;box.innerHTML='<div class="fpai"><span class="spin"></span> AI yazı hazırlayır…</div>';var f=fpFirstImg(),draft=($('fpB')||{}).value||'';
 var go=function(img){sb.functions.invoke('soc-ai',{body:{op:'caption',image:img,text:draft}}).then(function(r){var d=r.data||{};if(r.error||d.error||!(d.captions||[]).length){box.innerHTML='<div class="fpai">'+esc(d.error||'Alınmadı, yenidən cəhd et')+'</div>';return;}
  box.innerHTML='<div class="fpai"><small>✨ Toxun — yazıya əlavə olunsun</small>'+d.captions.map(function(c){return '<button onclick="$(\'fpB\').value=this.textContent;$(\'fpAi\').innerHTML=\'\'">'+esc(c)+'</button>';}).join('')+'<a class="igtxt" onclick="aiCap()">↻ Başqa variantlar</a></div>';}).catch(function(){box.innerHTML='<div class="fpai">Alınmadı</div>';});};
 if(!f){if(!draft.trim()){box.innerHTML='<div class="fpai">Əvvəl şəkil seç və ya bir neçə söz yaz</div>';return;}go(null);return;}
 var im=new Image();im.crossOrigin='anonymous';im.onload=function(){var s=Math.min(1,640/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=im.naturalWidth*s;c.height=im.naturalHeight*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);try{go(c.toDataURL('image/jpeg',.7));}catch(e){go(null);}};im.onerror=function(){go(null);};im.src=f.url||URL.createObjectURL(f);}
function fpTagUI(){var imgs=_fpMedia.map(function(f,i){return {f:f,i:i};}).filter(function(x){return x.f.url?x.f.kind!=='video':/^image/.test(x.f.type);});if(!imgs.length){toast('Əvvəl şəkil seç');return;}var cur=imgs[0].i;
 var d=ovl('<div class="mhead"><h3>Kimləri işarələyək?</h3><button class="x" onclick="this.closest(\'.s3over\').remove()">×</button></div><p class="hint">Şəkildə adamın üzərinə toxun</p><div class="tgw"><img id="tgI"><div id="tgL"></div></div><div class="tgth">'+imgs.map(function(x){return '<img data-i="'+x.i+'" src="'+esc(x.f.url||URL.createObjectURL(x.f))+'">';}).join('')+'</div><button class="btn" style="width:100%;margin-top:10px" onclick="this.closest(\'.s3over\').remove();fpMetaDraw()">Hazırdır</button>');
 var draw=function(){var x=imgs.find(function(z){return z.i===cur;});$('tgI').src=x.f.url||URL.createObjectURL(x.f);$('tgL').innerHTML=_fpTags.filter(function(t){return t.i===cur;}).map(function(t){return '<span class="tgl" style="left:'+(t.x*100)+'%;top:'+(t.y*100)+'%">'+esc(t.ad)+' <a data-u="'+t.uid+'">✕</a></span>';}).join('');
  $('tgL').querySelectorAll('a').forEach(function(a){a.onclick=function(e){e.stopPropagation();_fpTags=_fpTags.filter(function(t){return !(t.i===cur&&t.uid===a.dataset.u);});draw();};});};
 d.querySelectorAll('.tgth img').forEach(function(im){im.onclick=function(){cur=+im.dataset.i;draw();};});
 d.querySelector('.tgw').onclick=function(e){if(e.target.closest('.tgl'))return;var r=$('tgI').getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;if(x<0||x>1||y<0||y>1)return;ovlPick('Kimi işarələyək?',function(uid,ad){_fpTags=_fpTags.filter(function(t){return !(t.i===cur&&t.uid===uid);});_fpTags.push({i:cur,x:+x.toFixed(3),y:+y.toFixed(3),uid:uid,ad:ad});draw();});};draw();}
function fpPlaceUI(){var d=ovl('<div class="mhead"><h3>📍 Məkan</h3><button class="x" onclick="this.closest(\'.s3over\').remove()">×</button></div><input class="ovq" placeholder="Məkan yaz və ya seç…" style="width:100%;margin-bottom:8px"><div class="sochips" style="justify-content:flex-start">'+PLACES.map(function(p){return '<span>'+esc(p)+'</span>';}).join('')+'</div><button class="btn" style="width:100%;margin-top:10px">Əlavə et</button>');
 var inp=d.querySelector('.ovq');d.querySelectorAll('.sochips span').forEach(function(s){s.onclick=function(){_fpPlace=s.textContent;d.remove();fpMetaDraw();};});d.querySelector('.btn').onclick=function(){var v=inp.value.trim();if(v){_fpPlace=v.slice(0,60);fpMetaDraw();}d.remove();};}
function fpCollabUI(){ovlPick('Birgə müəllif dəvət et',function(uid,ad){_fpCollab={uid:uid,ad:ad};fpMetaDraw();toast('Paylaşanda '+ad.split(' ')[0]+' dəvət alacaq');});}
feedPost=function(){var c;try{c=fpCollect();}catch(e){toast(e.message);return;}if(_fpWhen)return draftSave(true);
 if(!c.b&&!_fpMedia.length&&!c.poll){toast('Mətn, şəkil və ya sorğu əlavə edin');return;}var g=$('fpGo');g.disabled=true;g.textContent='Yüklənir…';var meta=_fpTags.length||_fpPlace||_fpCollab,T=_fpTags.slice(),P=_fpPlace,C=_fpCollab;
 fpUploadAll().then(function(media){return run(sb.rpc('post_add3',{p_body:c.b,p_media:media.length?media:null,p_poll:c.poll,p_club:_fpClub,p_mentions:mentionIds(c.b),p_shared:null,p_challenge:_fpChal}));})
 .then(function(pid){if(meta&&pid)return run(sb.rpc('post_meta',{p_id:pid,p_tags:T.length?T.map(function(t){return {i:t.i,x:t.x,y:t.y,uid:t.uid,ad:t.ad};}):null,p_place:P,p_collab:C?C.uid:null}));})
 .then(function(){var d=_fpDraft;closeModal();toast('Paylaşıldı');if(d)sb.rpc('draft_delete',{p_id:d}).then(function(){},function(){});if(FMODE==='team')teamRender();else feedLoad();}).catch(function(e){g.disabled=false;g.textContent='Paylaş';toast(e.message||e);});};
/* kartda: məkan, birgə müəllif, işarələr, profil sabiti */
var _postCard15=_postCard0;_postCard0=function(p){var h=_postCard15(p);
 if(p.collab&&p.collab.ok&&p.author)h=h.replace('<b>'+esc(p.author.ad)+'</b>','<b>'+esc(p.author.ad)+' <span class="muted">və</span> <span onclick="event.stopPropagation();socProfile(\''+p.collab.uid+'\')">'+esc(p.collab.ad)+'</span></b>');
 if(p.place)h=h.replace(/(<div class="igph">[\s\S]*?<small>)/,'$1<span class="igplace">'+esc(p.place)+'</span>'+(/<small><\/small>/.test(h)?'':' · '));
 if(p.collab&&!p.collab.ok&&p.collab.uid===ME.user_id)h=h.replace('<div class="igph">','<div class="igcol">🤝 <b>'+esc(p.author&&p.author.ad||'')+'</b> səni bu postun birgə müəllifi olmağa dəvət edib<div><button class="btn sm" onclick="collabAns(\''+p.id+'\',true)">Qəbul et</button><button class="btn sm ghost" onclick="collabAns(\''+p.id+'\',false)">Rədd et</button></div></div><div class="igph">');
 if(p.tags&&p.tags.length){var t0=p.tags.filter(function(t){return (t.i||0)===0;});h=h.replace(/(<div class="igmw"[^>]*>)/,'$1<div class="igtags">'+t0.map(function(t){return '<span class="tgl" style="left:'+(t.x*100)+'%;top:'+(t.y*100)+'%" onclick="event.stopPropagation();socProfile(\''+t.uid+'\')">'+esc(t.ad)+'</span>';}).join('')+'</div><button class="igtagb" onclick="event.stopPropagation();this.parentNode.classList.toggle(\'showtags\')">👤</button>');}
 return h;};
function collabAns(id,ok){run(sb.rpc('collab_answer',{p_id:id,p_ok:ok})).then(function(){toast(ok?'🤝 Birgə müəllif oldun':'Dəvət rədd edildi');var p=FEED.find(function(x){return x.id===id;});if(p){p.collab=ok?Object.assign({},p.collab,{ok:true}):null;postRedraw(p);}}).catch(err);}
var _feedMenu15=feedMenu;feedMenu=function(id){_feedMenu15(id);var p=FEED.find(function(x){return x.id===id;})||{};var mb=$('mbox');if(!mb||!p.mine||p.kind!=='post')return;var f=mb.querySelector('.igmenu');if(f)f.insertAdjacentHTML('beforebegin','<button class="igmenu" onclick="ppin(\''+id+'\','+(!p.ppin)+')">'+(p.ppin?'📌 Profildən sabiti götür':'📌 Profildə sabitlə')+'</button>');};
function ppin(id,on){run(sb.rpc('post_profile_pin',{p_id:id,p_on:on})).then(function(){closeModal();var p=FEED.find(function(x){return x.id===id;});if(p)p.ppin=on;toast(on?'📌 Profilin yuxarısına sabitləndi':'Sabit götürüldü');}).catch(err);}
var _pfGrid15=pfGrid;pfGrid=function(l,empty){l=(l||[]).slice().sort(function(a,b){return (b.ppin?1:0)-(a.ppin?1:0);});_pfGrid15(l,empty);var g=pgTop()&&pgTop().querySelector('#pfGrid');if(!g)return;l.forEach(function(p,i){if(p.ppin&&g.children[i])g.children[i].insertAdjacentHTML('beforeend','<i class="pfpin">📌</i>');});};

/* ---------- 3/4/5/6. HEKAYƏ STİKERLƏRİ ---------- */
var _stStk15=stStk;stStk=function(){_stStk15();var p=document.querySelector('#stPanel .fptools');if(p&&!p.querySelector('.st15'))p.insertAdjacentHTML('beforeend','<button class="btn ghost sm st15" onclick="stAY()">➕ Sən də</button><button class="btn ghost sm" onclick="stCD()">⏳ Geri sayım</button><button class="btn ghost sm" onclick="stSL()">😍 Slayder</button>');};
function stChip(t){$('stPanel').innerHTML='<div class="stchip">'+t+' <a onclick="_st.stk=null;this.parentNode.remove()">✕</a></div>';}
function stAY(){var q=prompt('Zəncir mövzusu (məs. "İş masanı göstər")','');if(!q)return;_st.stk={type:'addyours',q:q.slice(0,80)};stChip('➕ '+esc(q));}
function stCD(){var p=$('stPanel');var dv=new Date(Date.now()+86400000).toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).slice(0,16).replace(' ','T');p.innerHTML='<div class="stpan"><input id="cdT" placeholder="Nəyə qədər? (məs. Korporativ)" maxlength="40"><input id="cdA" type="datetime-local" value="'+dv+'" style="font-size:1rem!important"><button class="btn" onclick="stCDok()">Əlavə et</button></div>';}
function stCDok(){var t=$('cdT').value.trim(),a=$('cdA').value;if(!t||!a){toast('Ad və vaxt lazımdır');return;}_st.stk={type:'cd',t:t,at:new Date(a+':00+04:00').toISOString(),q:t};stChip('⏳ '+esc(t));}
function stSL(){var q=prompt('Sual (məs. "Bu həftə necə keçdi?")','');if(!q)return;var e=prompt('Emoji','😍')||'😍';_st.stk={type:'slider',q:q.slice(0,80),e:Array.from(e)[0]||'😍'};stChip(esc(_st.stk.e)+' '+esc(q));}
var _stEdit15=stEdit;stEdit=function(f,tm){_stEdit15(f,tm);if(window._ayPreset){_st.stk={type:'addyours',q:_ayPreset.q,root:_ayPreset.root};stChip('➕ '+esc(_ayPreset.q));window._ayPreset=null;}};
function cdFmt(ms){if(ms<=0)return 'Vaxt çatdı! 🎉';var s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),x=s%60;return (d?d+'g ':'')+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0');}
var _storyShow15=storyShow;storyShow=function(){_storyShow15();if(!_sv)return;var u=CHAT_STORIES[_sv.ui],it=u&&u.items[_sv.ii];if(!it||!it.st)return;var s=it.st;if(['addyours','cd','slider'].indexOf(s.type)<0)return;
 var old=document.querySelector('#igSV .svstk');if(old)old.remove();var d=document.createElement('div');d.className='svstk s15';var st=$('svStage')||$('igSV');
 if(s.type==='addyours'){var root=s.root||it.id;d.innerHTML='<small class="aytl">SƏN DƏ PAYLAŞ</small><b>'+esc(s.q)+'</b><div class="ayf" id="ayF"></div>'+(u.me&&!s.root?'':'<button class="aybt">📸 Sən də paylaş</button>');
  run(sb.rpc('addyours_count',{p_root:root})).then(function(r){var f=$('ayF');if(f&&r)f.innerHTML=r.faces.map(function(x){return chatAva(x.ad,x.photo,22);}).join('')+'<span>'+r.n+' nəfər qoşulub</span>';}).catch(function(){});
  var bt=d.querySelector('.aybt');if(bt)bt.onclick=function(e){e.stopPropagation();window._ayPreset={q:s.q,root:root};storyClose();storyPick();};}
 else if(s.type==='cd'){d.innerHTML='<small class="aytl">GERİ SAYIM</small><b>'+esc(s.t)+'</b><div class="cdv" id="cdV">'+cdFmt(new Date(s.at)-Date.now())+'</div>'+(u.me?'<small id="cdN"></small>':'<button class="aybt" id="cdB">🔔 Xatırlat</button>');
  var tick=setInterval(function(){var v=$('cdV');if(!v){clearInterval(tick);return;}v.textContent=cdFmt(new Date(s.at)-Date.now());},1000);
  run(sb.rpc('cd_state',{p_story:it.id})).then(function(r){var b=$('cdB'),n=$('cdN');if(n)n.textContent=r.n+' nəfər xatırlatma qoyub';if(b){b.dataset.on=r.on?1:'';b.textContent=r.on?'✓ Xatırladılacaq':'🔔 Xatırlat';b.onclick=function(e){e.stopPropagation();var on=!b.dataset.on;run(sb.rpc('cd_remind',{p_story:it.id,p_on:on})).then(function(){b.dataset.on=on?1:'';b.textContent=on?'✓ Xatırladılacaq':'🔔 Xatırlat';if(on)toast('Vaxt çatanda bildiriş gələcək');});};}}).catch(function(){});}
 else if(s.type==='slider'){var avg=function(r){var t=0,n=0;Object.keys(r||{}).forEach(function(k){var v=+k;if(!isNaN(v)){t+=v*r[k];n+=r[k];}});return n?Math.round(t/n):null;};
  d.innerHTML='<b>'+esc(s.q)+'</b><div class="slw"><input type="range" min="0" max="100" value="'+(it.ans?+it.ans:0)+'" '+(it.ans||u.me?'disabled':'')+' style="--e:\''+s.e+'\'"><span class="slth" id="slTh">'+esc(s.e)+'</span></div><small id="slR">'+(u.me?'':it.ans?'Cavabın qeydə alınıb':'Sürüşdür və burax')+'</small>';
  var r=d.querySelector('input'),th=d.querySelector('#slTh');var pos=function(){th.style.left=r.value+'%';th.style.fontSize=(1.4+r.value/80)+'rem';};pos();r.oninput=pos;
  r.onpointerdown=function(e){e.stopPropagation();svPause(true);};r.onchange=function(){var v=r.value;r.disabled=true;it.ans=v;run(sb.rpc('story_answer',{p_id:it.id,p_answer:String(v)})).then(function(res){$('slR').textContent='Orta nəticə: '+avg(res)+'%';svPause(false);}).catch(function(){svPause(false);});};
  if(u.me)run(sb.rpc('story_results',{p_id:it.id})).then(function(l){l=l||[];var t=0;l.forEach(function(x){t+=+x.a||0;});$('slR').textContent=l.length?l.length+' cavab · orta '+Math.round(t/l.length)+'%':'Hələ cavab yoxdur';}).catch(function(){});}
 st.appendChild(d);};
/* 6. qeyd olunanda paylaş */
stShare=function(){var g=$('stGo');g.disabled=true;g.textContent='Yüklənir…';var S=_st,url0;stCompose().then(function(f){return chatUpload(f,'story');}).then(function(url){url0=url;var cap=S.vid&&S.layers.length?S.layers.map(function(l){return l.t;}).join(' · '):null;
  return run(sb.rpc('story_add3',{p_url:url,p_kind:S.vid?'video':'image',p_caption:cap,p_sticker:S.stk,p_audience:S.aud}));}).then(function(){(S.ment||[]).forEach(function(u){sb.rpc('msg_send',{p_to:u,p_group:null,p_body:'📸 Səni hekayəsində qeyd etdi',p_kind:'story_mention',p_image:S.vid?null:url0,p_file_url:S.vid?url0:null}).then(function(){},function(){});});stEdClose();toast(S.aud==='cf'?'⭐ Yaxın dostlarla paylaşıldı':'Hekayən paylaşıldı');storyLoad();}).catch(function(e){g.disabled=false;g.textContent='Hekayən ➜';toast('Alınmadı: '+(e.message||e));});};
var _chatDraw15=chatDrawMsgs;chatDrawMsgs=function(rows){_chatDraw15(rows);(rows||[]).forEach(function(m){if(m.deleted||!(m.kind==='story_mention'||/^📸 Səni hekayəsində qeyd etdi/.test(m.body||'')))return;var b=$('msg'+m.id);if(!b)return;var src=m.image||m.file;
 b.className='igm '+(m.mine?'mine':'their')+' strx';b.innerHTML='<small class="stlab">'+(m.mine?'Hekayəndə qeyd etdin':'Səni hekayəsində qeyd etdi')+'</small>'+(src?(m.image?'<img class="stth" src="'+esc(src)+'" onclick="event.stopPropagation();chatViewImage(\''+esc(src)+'\')">':'<video class="stth" src="'+esc(src)+'#t=0.1" muted playsinline></video>'):'')+(!m.mine&&src?'<button class="stre" onclick="event.stopPropagation();mentionReshare('+m.id+',this)">➕ Hekayənə əlavə et</button>':'');});};
function mentionReshare(id,b){var m=CHATmsgs.find(function(x){return x.id===id;});if(!m)return;b.disabled=true;b.textContent='Paylaşılır…';run(sb.rpc('story_add3',{p_url:m.image||m.file,p_kind:m.image?'image':'video',p_caption:'↪︎ @'+(CHATname||''),p_sticker:null,p_audience:'all'})).then(function(){b.textContent='✓ Hekayəndədir';storyLoad();}).catch(function(e){b.disabled=false;b.textContent='➕ Hekayənə əlavə et';err(e);});}

/* ---------- 7. OFİS ANI ---------- */
var MOM=null;function momLoad(){return run(sb.rpc('moment_state')).then(function(r){MOM=r;return r;}).catch(function(){return null;});}
function momBanner(){var x=$('soX3');if(!x||FMODE!=='all')return;momLoad().then(function(r){var old=$('momB');if(old)old.remove();if(!r||r.off||!r.started)return;var html;
 if(!r.mine){var left=new Date(r.at).getTime()+120000-Date.now();html='<div id="momB" class="momb'+(left>0?' hot':'')+'" onclick="momCapture()"><span>⚡</span><div><b>'+(left>0?'Ofis anı! <em id="momT">'+cdFmt(left).replace(/^00:/,'')+'</em>':'Ofis anını buraxdın')+'</b><small>'+(left>0?'İndi nə edirsənsə, paylaş — 2 dəqiqə!':'Gecikmiş paylaş, sonra başqalarınınkını gör ('+r.n+')')+'</small></div><button class="btn sm">📸</button></div>';
  if(left>0){var iv=setInterval(function(){var t=$('momT');if(!t){clearInterval(iv);return;}var l=new Date(r.at).getTime()+120000-Date.now();if(l<=0){clearInterval(iv);momBanner();return;}t.textContent=cdFmt(l).replace(/^00:/,'');},1000);}}
 else html='<div id="momB" class="momb ok" onclick="momOpen()"><span>⚡</span><div><b>Bu günün Ofis anları</b><small>'+r.n+' nəfər paylaşıb'+(r.mine.late?' · səninki gecikmiş':'')+'</small></div><span class="momfc">'+(r.list||[]).slice(0,4).map(function(u){return chatAva(u.ad,u.photo,24);}).join('')+'</span></div>';
 x.insertAdjacentHTML('afterbegin',html);});}
var _s3allExtras15=s3allExtras;s3allExtras=function(){_s3allExtras15();setTimeout(momBanner,400);};
function momOpen(){momLoad().then(function(r){if(!r||r.off){toast('Bu gün Ofis anı yoxdur (həftəsonu)');return;}var pg=pgPush(pgHead('⚡ Ofis anı')+'<div class="pgc"><div id="momL"></div></div>','moment');var l=$('momL');
 if(!r.started){l.innerHTML='<div class="pfempty">Bu günün Ofis anı hələ başlamayıb.<br>Bildiriş gələndə 2 dəqiqən olacaq ⚡</div>';return;}
 if(!r.mine&&!r.list){l.innerHTML='<div class="momlock"><b>🔒 '+r.n+' nəfər artıq paylaşıb</b><p>Başqalarının anını görmək üçün öz anını paylaş</p><button class="btn" onclick="momCapture()">📸 Paylaş</button></div>';return;}
 l.innerHTML=(r.list||[]).map(function(u,i){return '<div class="momc"><div class="momh" onclick="socProfile(\''+u.uid+'\')">'+chatAva(u.ad,u.photo,32)+'<b>'+esc(u.ad)+'</b><small>'+new Date(u.at).toLocaleTimeString('az-AZ',{timeZone:'Asia/Baku',hour:'2-digit',minute:'2-digit'})+(u.late?' · <em>gecikmiş</em>':'')+'</small></div><div class="momp" onclick="this.classList.toggle(\'sw\')"><img class="mb" src="'+esc(u.back)+'"><img class="mf" src="'+esc(u.front)+'"></div>'+(u.cap?'<p>'+esc(u.cap)+'</p>':'')+'</div>';}).join('')||'<div class="pfempty">Hələ heç kim paylaşmayıb</div>';});}
var _mc=null;
function momCapture(){if(_mc)return;if(!navigator.mediaDevices){momFallback();return;}var o=document.createElement('div');o.id='momCap';o.innerHTML='<div class="mcv"><video autoplay playsinline muted></video><img class="mcsmall" style="display:none"></div><div class="mctop"><button onclick="momCapClose()">✕</button><b>⚡ Ofis anı</b><span id="mcT"></span></div><div class="mcbot"><button class="mcshut" id="mcS"></button></div><div class="mchint" id="mcH">Arxa kamera — nə görürsən?</div>';document.body.appendChild(o);document.body.classList.add('incall');
 _mc={o:o,st:null,back:null,front:null};var v=o.querySelector('video');var cam=function(f){if(_mc.st)_mc.st.getTracks().forEach(function(t){t.stop();});return navigator.mediaDevices.getUserMedia({video:{facingMode:f,width:{ideal:1280},height:{ideal:1280}},audio:false}).then(function(s){_mc.st=s;v.srcObject=s;v.classList.toggle('mir',f==='user');return new Promise(function(r){v.onloadedmetadata=function(){v.play();setTimeout(r,350);};});});};
 var snap=function(mir){var c=document.createElement('canvas'),w=v.videoWidth,h=v.videoHeight,s=Math.min(w,h*0.8);c.width=900;c.height=1125;var x=c.getContext('2d');if(mir){x.translate(900,0);x.scale(-1,1);}var sw=Math.min(w,h*.8),sh=sw/.8;x.drawImage(v,(w-sw)/2,(h-sh)/2,sw,sh,0,0,900,1125);return new Promise(function(r){c.toBlob(function(b){r(b);},'image/jpeg',.85);});};
 cam('environment').catch(function(){return cam('user');}).then(function(){$('mcS').onclick=function(){this.disabled=true;snap(false).then(function(b){_mc.back=b;var sm=o.querySelector('.mcsmall');sm.src=URL.createObjectURL(b);sm.style.display='';$('mcH').textContent='İndi gülümsə 😊';return cam('user');}).then(function(){var n=3;$('mcT').textContent=n;return new Promise(function(r){var iv=setInterval(function(){n--;$('mcT').textContent=n||'';if(n<=0){clearInterval(iv);r();}},700);});}).then(function(){return snap(true);}).then(function(b){_mc.front=b;momReview();}).catch(function(e){toast(callErrMsg?callErrMsg(e):'Kamera açılmadı');momCapClose();});};}).catch(function(){momCapClose();momFallback();});}
function momReview(){var o=_mc.o;if(_mc.st)_mc.st.getTracks().forEach(function(t){t.stop();});o.querySelector('.mcv').innerHTML='<div class="momp big" onclick="this.classList.toggle(\'sw\')"><img class="mb" src="'+URL.createObjectURL(_mc.back)+'"><img class="mf" src="'+URL.createObjectURL(_mc.front)+'"></div>';
 o.querySelector('.mcbot').innerHTML='<input id="mcC" placeholder="Qeyd əlavə et…" maxlength="120"><div class="row" style="gap:8px;width:100%"><button class="btn ghost" style="flex:1" onclick="momCapClose();momCapture()">↻ Yenidən</button><button class="btn" style="flex:2" id="mcGo" onclick="momSend()">Paylaş ⚡</button></div>';$('mcH').textContent='';}
function momSend(){var g=$('mcGo');g.disabled=true;g.textContent='Yüklənir…';var M=_mc;Promise.all([chatUpload(new File([M.back],'back.jpg',{type:'image/jpeg'}),'moment'),chatUpload(new File([M.front],'front.jpg',{type:'image/jpeg'}),'moment')]).then(function(u){return run(sb.rpc('moment_post',{p_front:u[1],p_back:u[0],p_cap:($('mcC')||{}).value||null}));}).then(function(){momCapClose();toast('⚡ Paylaşıldı!');momOpen();momBanner();}).catch(function(e){g.disabled=false;g.textContent='Paylaş ⚡';err(e);});}
function momCapClose(){if(!_mc)return;if(_mc.st)_mc.st.getTracks().forEach(function(t){t.stop();});_mc.o.remove();_mc=null;document.body.classList.remove('incall');}
function momFallback(){var pick=function(cb,cap){var i=document.createElement('input');i.type='file';i.accept='image/*';i.setAttribute('capture',cap);i.onchange=function(){if(i.files[0])cb(i.files[0]);};i.click();};toast('Əvvəl arxa, sonra ön kamera ilə şəkil çək');
 pick(function(b){pick(function(f){_mc={o:document.createElement('div'),back:b,front:f};_mc.o.id='momCap';_mc.o.innerHTML='<div class="mcv"></div><div class="mctop"><button onclick="momCapClose()">✕</button><b>⚡ Ofis anı</b><span></span></div><div class="mcbot"></div><div class="mchint" id="mcH"></div>';document.body.appendChild(_mc.o);document.body.classList.add('incall');momReview();},'user');},'environment');}

/* ---------- 11. SƏSSİZLƏŞDİRMƏ + FAVORİLƏR ---------- */
var _pfMenu15=pfMenu;pfMenu=function(uid){_pfMenu15(uid);var mb=$('mbox');if(!mb)return;
 if(!uid){var f=mb.querySelector('.igmenu');if(f)f.insertAdjacentHTML('afterend','<button class="igmenu" onclick="closeModal();themeMenu()">🌙 Görünüş (qaranlıq rejim)</button>');return;}
 run(sb.rpc('soc_rel',{p_uid:uid})).then(function(r){var f=mb.querySelector('.igmenu');if(!f||!r)return;f.insertAdjacentHTML('beforebegin','<button class="igmenu" onclick="relSet(\''+uid+'\',{p_fav:'+(!r.fav)+'})">'+(r.fav?'⭐ Favorilərdən çıxar':'⭐ Favorilərə əlavə et')+'</button><button class="igmenu" onclick="relSet(\''+uid+'\',{p_mp:'+(!r.mp)+'})">'+(r.mp?'🔔 Postları göstər':'🔇 Postları səssizləşdir')+'</button><button class="igmenu" onclick="relSet(\''+uid+'\',{p_ms:'+(!r.ms)+'})">'+(r.ms?'🔔 Hekayələri göstər':'🔇 Hekayələri səssizləşdir')+'</button>');}).catch(function(){});};
function relSet(uid,o){run(sb.rpc('soc_rel_set',Object.assign({p_uid:uid,p_fav:null,p_mp:null,p_ms:null},o))).then(function(){closeModal();toast(o.p_fav!==undefined?(o.p_fav?'⭐ Favorilərə əlavə edildi':'Favorilərdən çıxarıldı'):o.p_mp!==undefined?(o.p_mp?'🔇 Postları lentdə görünməyəcək':'Postları yenidən görünür'):(o.p_ms?'🔇 Hekayələri gizlədildi':'Hekayələri yenidən görünür'));if(o.p_ms!==undefined)storyLoad();}).catch(err);}
if(FEED_MODES.indexOf('favs')<0)FEED_MODES.push('favs');
var _feedSeg15=feedSeg;feedSeg=function(){_feedSeg15();var el=$('soSeg');if(!el)return;var b=el.children[1];if(b&&!el.querySelector('.favb'))b.insertAdjacentHTML('afterend','<button class="favb'+(FMODE==='favs'?' on':'')+'" onclick="feedMode(\'favs\')">⭐ Favorilər</button>');};
var _feedDraw15=feedDraw;feedDraw=function(){_feedDraw15();if(FMODE==='favs'&&!FEED.length){var el=$('igPosts');if(el)el.innerHTML='<div class="igempty"><b>Favorilər boşdur</b><div>Profildə ⋯ → "Favorilərə əlavə et" — onların postları burada olacaq</div></div>';}};

/* ---------- 12. KANALLAR ---------- */
var _renderChat15=renderChat;renderChat=function(){_renderChat15();setTimeout(chStrip,60);};
function chStrip(){var t=$('chatThreads');if(!t||CHATother)return;var s=$('chStrip');if(!s){t.insertAdjacentHTML('beforebegin','<div id="chStrip"></div>');s=$('chStrip');}
 run(sb.rpc('ch_list')).then(function(l){l=l||[];if(!s.isConnected)return;if(!l.length&&!SOC_MOD){s.innerHTML='';return;}
  s.innerHTML='<div class="chsh"><b>Kanallar</b>'+(SOC_MOD?'<a class="igtxt" onclick="chNew()">+ Yeni</a>':'')+'</div>'+l.map(function(c){return '<div class="igrow chrow" onclick="chOpen(\''+c.id+'\')"><span class="chav">'+esc(c.emoji)+'</span><div class="igmeta"><div class="igname">'+esc(c.name)+' <span class="chbadge">KANAL</span></div><div class="iglast">'+(c.last?(c.last.img&&!c.last.body?'📷 Şəkil':esc(c.last.body||''))+' · '+chatAgo(c.last.at):esc(c.about||'Hələ yazı yoxdur'))+'</div></div>'+(c.unread?'<b class="chun">'+c.unread+'</b>':'')+'</div>';}).join('')||'<p class="hint" style="padding:0 4px 8px">Rəhbərlikdən elan kanalı yarat — hamı oxuyur, yalnız sən yazırsan.</p>';window._chl=l;}).catch(function(){});}
function chNew(){modal('<div class="mhead"><h3>📢 Yeni kanal</h3><button class="x" onclick="closeModal()">×</button></div><div class="row" style="gap:6px"><input id="chE" value="📢" maxlength="4" style="width:58px;text-align:center;font-size:1.3rem"><input id="chN" placeholder="Rəhbərlik xəbərləri" maxlength="60" style="flex:1"></div><div class="field" style="margin-top:10px"><label>Haqqında</label><input id="chA" maxlength="200"></div><button class="btn" style="width:100%" onclick="chCreate()">Yarat</button>');}
function chCreate(){var n=$('chN').value.trim();if(!n){toast('Ad yazın');return;}run(sb.rpc('ch_create',{p_name:n,p_emoji:$('chE').value.trim(),p_about:$('chA').value.trim()})).then(function(id){closeModal();chStrip();chOpen(id);}).catch(err);}
var _chImg=null;
function chOpen(id){var c=(window._chl||[]).find(function(x){return x.id===id;})||{name:'Kanal',emoji:'📢'};var pg=pgPush(pgHead(esc(c.emoji+' '+c.name))+'<div class="pgc chpg"><div id="chP"><p class="status"><span class="spin"></span></p></div></div>'+(c.admin?'<div class="chin"><button class="igicon" onclick="chPick()">📷</button><input id="chT" placeholder="Kanala yaz…"><button class="btn sm" onclick="chSend(\''+id+'\')">Göndər</button></div><div id="chPv" class="chpv"></div>':'<div class="chro">Yalnız adminlər yaza bilər · reaksiya ver 👇</div>'),'ch:'+id);window._chCur=c;chLoad(id);}
function chLoad(id){run(sb.rpc('ch_posts',{p_id:id})).then(function(l){var el=$('chP');if(!el)return;l=l||[];el.innerHTML=l.length?l.map(function(p){var rs=p.reacts||{};return '<div class="chm" id="chm'+p.id+'">'+(p.image?'<img src="'+esc(p.image)+'" onclick="chatViewImage(\''+esc(p.image)+'\')">':'')+(p.body?'<div class="chb">'+socText(p.body)+'</div>':'')+'<div class="chf"><span>'+chatAgo(p.at)+' · 👁 '+p.seen+'</span>'+((window._chCur||{}).admin?'<a onclick="chDel('+p.id+',\''+id+'\')">Sil</a>':'')+'</div><div class="chr">'+Object.keys(rs).map(function(e){return '<button class="'+(p.my===e?'on':'')+'" onclick="chReact('+p.id+',\''+e+'\',\''+id+'\','+(p.my===e)+')">'+e+' '+rs[e]+'</button>';}).join('')+'<button class="chadd" onclick="chRPick('+p.id+',\''+id+'\',this)">☺+</button></div></div>';}).join(''):'<div class="pfempty">Hələ yazı yoxdur</div>';var pg=pgTop();if(pg)pg.scrollTop=pg.scrollHeight;chStrip();}).catch(err);}
function chRPick(pid,cid,b){var o=document.createElement('div');o.className='chrp';o.innerHTML=['❤️','👍','🔥','👏','😂','😮','🎉'].map(function(e){return '<button>'+e+'</button>';}).join('');b.parentNode.appendChild(o);o.querySelectorAll('button').forEach(function(x){x.onclick=function(){o.remove();chReact(pid,x.textContent,cid,false);};});}
function chReact(pid,e,cid,off){run(sb.rpc('ch_react',{p_post:pid,p_emoji:off?null:e})).then(function(){chLoad(cid);}).catch(err);}
function chPick(){var i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=function(){_chImg=i.files[0];$('chPv').innerHTML=_chImg?'<span><img src="'+URL.createObjectURL(_chImg)+'"><a onclick="_chImg=null;this.parentNode.remove()">✕</a></span>':'';};i.click();}
function chSend(id){var t=$('chT').value.trim();if(!t&&!_chImg)return;var f=_chImg;_chImg=null;$('chPv').innerHTML='';$('chT').value='';(f?chatUpload(f,'channel'):Promise.resolve(null)).then(function(u){return run(sb.rpc('ch_post',{p_id:id,p_body:t||null,p_image:u}));}).then(function(){chLoad(id);}).catch(err);}
function chDel(pid,cid){if(!confirm('Yazı silinsin?'))return;run(sb.rpc('ch_delete_post',{p_post:pid})).then(function(){chLoad(cid);}).catch(err);}

/* ---------- 13. QRUP: kim gördü + çoxlu reaksiya ---------- */
var _chatDraw15b=chatDrawMsgs;chatDrawMsgs=function(rows){_chatDraw15b(rows);if(!CHATgroup||!rows||!rows.length)return;var g=CHATother;run(sb.rpc('grp_extra',{p_group:g})).then(function(x){if(!x||CHATother!==g)return;var el=$('chatMsgs');if(!el)return;
 el.querySelectorAll('.grx,.grseen').forEach(function(n){n.remove();});var R=x.reacts||{};
 Object.keys(R).forEach(function(mid){var b=$('msg'+mid);if(!b)return;var by={};R[mid].forEach(function(r){(by[r.e]=by[r.e]||[]).push(r);});var old=b.querySelector('.msgreact');if(old)old.remove();
  b.insertAdjacentHTML('afterend','<div class="grx">'+Object.keys(by).map(function(e){var me=by[e].some(function(r){return r.me;});return '<button class="'+(me?'on':'')+'" title="'+esc(by[e].map(function(r){return r.ad;}).join(', '))+'" onclick="event.stopPropagation();grpReact('+mid+',\''+e+'\')">'+e+(by[e].length>1?' '+by[e].length:'')+'</button>';}).join('')+'</div>');});
 var last=rows.filter(function(m){return !m.deleted&&m.kind!=='sys';}).slice(-1)[0];if(!last)return;var seen=(x.seen||[]).filter(function(u){return u.at&&new Date(u.at)>=new Date(last.at)&&u.uid!==last.sender;});
 if(seen.length)el.insertAdjacentHTML('beforeend','<div class="grseen"><span>Görüldü</span>'+seen.slice(0,8).map(function(u){return chatAva(u.ad,u.photo,16);}).join('')+(seen.length>8?'<small>+'+(seen.length-8)+'</small>':'')+'</div>');
 if(el._stick!==false)el.scrollTop=el.scrollHeight;}).catch(function(){});};
function grpReact(id,e){run(sb.rpc('grp_react',{p_msg:id,p_emoji:e})).then(function(){window._chatSig=null;chatDrawMsgs(CHATmsgs);}).catch(err);}
var _chatReact15=chatReact;chatReact=function(id,e){if(CHATgroup){grpReact(id,e);return;}_chatReact15(id,e);};

/* ---------- 14. CANLI YAYIM ---------- */
var _lv=null,LIVES=[];
function liveLoad(){return run(sb.rpc('live_list')).then(function(l){LIVES=l||[];if($('igStories'))storyDrawRow();return LIVES;}).catch(function(){return [];});}
setInterval(function(){var f=$('v-feed');if(f&&f.classList.contains('on')&&document.visibilityState==='visible')liveLoad();},30000);
var _storyDrawRow15=storyDrawRow;storyDrawRow=function(){_storyDrawRow15();var el=$('igStories');if(!el||!LIVES.length)return;var first=el.children[1]||null;
 LIVES.filter(function(l){return l.host.uid!==ME.user_id;}).forEach(function(l){var d=document.createElement('div');d.className='igsto';d.onclick=function(){liveJoin(l.id);};d.innerHTML='<span class="igring live">'+chatAva(l.host.ad,l.host.photo,62)+'<b class="livetag">CANLI</b></span><small>'+esc(l.host.ad.split(' ')[0])+'</small>';el.insertBefore(d,first);});};
var _storyPick15=storyPick;storyPick=function(){_storyPick15();var g=document.querySelector('#mbox .stpk');if(g&&!g.querySelector('.lvb'))g.insertAdjacentHTML('beforeend','<button class="lvb" onclick="closeModal();liveStart()"><span style="color:#ff3040">●</span>Canlı</button>');};
function liveUI(host){var o=document.createElement('div');o.id='liveV';o.innerHTML='<video id="lvV" autoplay playsinline '+(host?'muted class="mir"':'')+'></video><div class="lvtop"><span class="lvbad">CANLI</span><span class="lvcnt" id="lvN">👁 0</span><b id="lvTt"></b><button onclick="liveExit()">✕</button></div><div class="lvchat" id="lvC"></div><div class="lvhearts" id="lvH"></div>'
  +'<div class="lvbot">'+(host?'<button class="lvic" onclick="liveFlip()">⟲</button><input id="lvI" placeholder="Şərh yaz…" onkeydown="if(event.key===\'Enter\')liveSay()"><button class="lvend" onclick="liveExit()">Bitir</button>':'<input id="lvI" placeholder="Şərh yaz…" onkeydown="if(event.key===\'Enter\')liveSay()"><button class="lvic" onclick="liveHeart()">❤️</button>')+'</div><div class="lvwait" id="lvW">'+(host?'':'Qoşulur…')+'</div>';document.body.appendChild(o);document.body.classList.add('incall');return o;}
function liveStart(){if(_lv)return;var t=prompt('Yayımın adı','Ofisdən canlı');if(t===null)return;
 navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:720},height:{ideal:1280}},audio:{echoCancellation:true,noiseSuppression:true}}).then(function(st){return Promise.all([run(sb.rpc('live_start',{p_title:t})),callIce()]).then(function(r){
  _lv={id:r[0],host:true,st:st,ice:r[1],peers:{},after:0,chat:0,face:'user'};liveUI(true);$('lvV').srcObject=st;$('lvTt').textContent=t;$('lvW').textContent='';lvPoll();_lv.t=setInterval(lvPoll,1200);});}).catch(function(e){toast(e&&e.name==='NotAllowedError'?'Kamera və mikrofona icazə verin':(e.message||e));});}
function liveJoin(id){if(_lv)return;Promise.all([run(sb.rpc('room_join',{p_id:id})),callIce()]).then(function(r){_lv={id:id,host:false,ice:r[1],peers:{},after:0,chat:0};liveUI(false);lvPoll();_lv.t=setInterval(lvPoll,1200);}).catch(err);}
function livePC(u){var L=_lv,pc=new RTCPeerConnection({iceServers:L.ice}),P={pc:pc,q:[]};L.peers[u]=P;if(L.host)L.st.getTracks().forEach(function(t){pc.addTrack(t,L.st);});
 pc.onicecandidate=function(e){if(e.candidate)sb.rpc('room_sig',{p_id:L.id,p_to:u,p_payload:{t:'ice',c:e.candidate.toJSON()}}).then(function(){},function(){});};
 if(!L.host)pc.ontrack=function(e){var v=$('lvV');if(v&&v.srcObject!==e.streams[0]){v.srcObject=e.streams[0];v.play().catch(function(){v.muted=true;v.play();toast('Səsi açmaq üçün ekrana toxun');v.onclick=function(){v.muted=false;};});}var w=$('lvW');if(w)w.textContent='';};
 pc.onconnectionstatechange=function(){if(pc.connectionState==='failed'){try{pc.close();}catch(e){}delete L.peers[u];}};return P;}
function lvPoll(){var L=_lv;if(!L)return;sb.rpc('live_poll',{p_id:L.id,p_after:L.after,p_chat:L.chat}).then(function(r){if(_lv!==L||!r.data)return;var d=r.data,rm=d.room||{};
 if(rm.closed||(!L.host&&!rm.hostlive&&Date.now()-(L.t0||(L.t0=Date.now()))>8000)){toast('Yayım bitdi');liveExit(true);return;}
 var n=$('lvN');if(n)n.textContent='👁 '+(d.viewers||[]).length;if(!L.host){var tt=$('lvTt');if(tt&&rm.host)tt.textContent=rm.host.ad+' · '+rm.title;}
 (d.sig||[]).forEach(function(s){L.after=Math.max(L.after,s.id);var P=L.peers[s.from],p=s.p;
  if(p.t==='offer'&&!L.host){if(P){try{P.pc.close();}catch(e){}}P=livePC(s.from);P.pc.setRemoteDescription({type:'offer',sdp:p.sdp}).then(function(){P.q.forEach(function(c){P.pc.addIceCandidate(c).catch(function(){});});P.q=[];return P.pc.createAnswer();}).then(function(a){return P.pc.setLocalDescription(a);}).then(function(){return sb.rpc('room_sig',{p_id:L.id,p_to:s.from,p_payload:{t:'answer',sdp:P.pc.localDescription.sdp}});}).catch(function(){});}
  else if(p.t==='answer'&&P)P.pc.setRemoteDescription({type:'answer',sdp:p.sdp}).then(function(){P.q.forEach(function(c){P.pc.addIceCandidate(c).catch(function(){});});P.q=[];}).catch(function(){});
  else if(p.t==='ice'&&P){if(P.pc.remoteDescription)P.pc.addIceCandidate(p.c).catch(function(){});else P.q.push(p.c);}});
 if(L.host){var ids=(d.viewers||[]).map(function(v){return v.uid;});ids.forEach(function(u){if(L.peers[u])return;var P=livePC(u);P.pc.createOffer().then(function(o){return P.pc.setLocalDescription(o);}).then(function(){return sb.rpc('room_sig',{p_id:L.id,p_to:u,p_payload:{t:'offer',sdp:P.pc.localDescription.sdp}});}).catch(function(){});});
  Object.keys(L.peers).forEach(function(u){if(ids.indexOf(u)<0){try{L.peers[u].pc.close();}catch(e){}delete L.peers[u];}});}
 var c=$('lvC');(d.chat||[]).forEach(function(m){L.chat=Math.max(L.chat,m.id);if(m.k==='h'){liveHeartAnim();return;}if(c){c.insertAdjacentHTML('beforeend','<div class="lvm">'+chatAva(m.ad,m.photo,24)+'<span><b>'+esc(m.ad.split(' ')[0])+'</b> '+esc(m.b)+'</span></div>');while(c.children.length>8)c.firstChild.remove();}});},function(){});}
function liveSay(){var i=$('lvI');var t=i&&i.value.trim();if(!t||!_lv)return;i.value='';sb.rpc('live_say',{p_id:_lv.id,p_body:t,p_kind:'c'}).then(function(){},function(){});}
function liveHeart(){if(!_lv)return;liveHeartAnim();sb.rpc('live_say',{p_id:_lv.id,p_body:'❤️',p_kind:'h'}).then(function(){},function(){});}
function liveHeartAnim(){var h=$('lvH');if(!h)return;var s=document.createElement('span');s.textContent=['❤️','💜','💙','🧡'][Math.floor(Math.random()*4)];s.style.left=(Math.random()*40)+'px';h.appendChild(s);setTimeout(function(){s.remove();},2200);}
function liveFlip(){var L=_lv;if(!L||!L.host)return;L.face=L.face==='user'?'environment':'user';navigator.mediaDevices.getUserMedia({video:{facingMode:L.face,width:{ideal:720},height:{ideal:1280}}}).then(function(s){var nt=s.getVideoTracks()[0],old=L.st.getVideoTracks()[0];Object.keys(L.peers).forEach(function(u){var sn=L.peers[u].pc.getSenders().find(function(x){return x.track&&x.track.kind==='video';});if(sn)sn.replaceTrack(nt);});L.st.removeTrack(old);old.stop();L.st.addTrack(nt);var v=$('lvV');v.srcObject=L.st;v.classList.toggle('mir',L.face==='user');}).catch(function(){toast('Kamera dəyişmədi');});}
function liveExit(silent){var L=_lv;if(!L)return;if(L.host&&!silent&&!confirm('Yayımı bitirmək istəyirsən?'))return;_lv=null;clearInterval(L.t);Object.keys(L.peers).forEach(function(u){try{L.peers[u].pc.close();}catch(e){}});if(L.st)L.st.getTracks().forEach(function(t){t.stop();});
 if(L.host)sb.rpc('live_end',{p_id:L.id}).then(function(){},function(){});sb.rpc('room_leave',{p_id:L.id}).then(function(){},function(){});var o=$('liveV');if(o)o.remove();document.body.classList.remove('incall');liveLoad();}

/* ---------- ümumi: bölmələr, geri, dərin linklər, bildiriş ikonları ---------- */
SECT.splice(0,0,['moment','⚡','Ofis anı']);
var _feedMode15=feedMode;feedMode=function(m,a){if(m==='moment'){momOpen();return;}_feedMode15(m,a);};
var _backAct15=backAct;backAct=function(){if($('liveV')){liveExit();return true;}if($('momCap')){momCapClose();return true;}if(document.querySelector('.s3over')){document.querySelector('.s3over').remove();return true;}return _backAct15();};
(function(){var q=new URLSearchParams(location.search),k=['moment','ch','live'].find(function(x){return q.get(x);});if(!k)return;var v=q.get(k);var go=function(){if(typeof ME==='undefined'||!ME||!sb){setTimeout(go,800);return;}try{history.replaceState(history.state,'',location.pathname);}catch(e){}
 setTimeout(function(){if(k==='moment'){show('feed');momLoad().then(function(r){if(r&&!r.mine&&r.started)momCapture();else momOpen();});}else if(k==='ch'){show('chat');run(sb.rpc('ch_list')).then(function(l){window._chl=l||[];chOpen(v);});}else if(k==='live')liveJoin(v);},1000);};setTimeout(go,1500);})();
(function(){var go=function(){if(typeof ME==='undefined'||!ME||!sb){setTimeout(go,1500);return;}liveLoad();};setTimeout(go,2500);})();

;

/* ---- Önə çıxanlar baxıcısı (IG): toxun, saxla, sürüşdür, baxanlar ---- */
var _hv=null;
hlView=function(i){var x=window._profX||{},h=(x.hl||[])[i];if(!h||!h.items||!h.items.length)return;if($('igSV'))return;var el=document.createElement('div');el.id='igSV';document.body.appendChild(el);document.body.classList.add('incall');
 _hv={h:h,k:0,el:el,t:null,el0:0,dur:5000,paused:false,me:!!x._me,meta:[]};hvDraw();run(sb.rpc('hl_meta',{p_id:h.id})).then(function(m){if(!_hv||_hv.h!==h)return;_hv.meta=m||[];hvBot();}).catch(function(){});hvGest(el);};
function hvDraw(){var H=_hv;if(!H)return;var it=H.h.items[H.k];if(!it){hvClose();return;}clearInterval(H.t);H.el0=0;H.dur=5000;H.last=Date.now();H.paused=false;var c=H.h.items[0];
 H.el.innerHTML='<div class="svstage" id="svStage"><div class="svmedia">'+(it.kind==='video'?'<video id="svm" src="'+esc(it.url)+'" autoplay playsinline></video>':'<img id="svm" src="'+esc(it.url)+'">')+'</div><div class="svshade"></div>'
  +'<div class="svbars">'+H.h.items.map(function(z,j){return '<i><b style="width:'+(j<H.k?100:0)+'%"'+(j===H.k?' id="svb"':'')+'></b></i>';}).join('')+'</div>'
  +'<div class="svhead"><span class="s3hlc">'+(c.kind==='video'?'🎬':'<img src="'+esc(c.url)+'">')+'</span><b>'+esc(H.h.title)+'</b><small>'+(it.at?stoAgo(it.at):'')+'</small><span class="svps" id="svPs">❚❚</span>'+(H.me?'<button class="svmore" onclick="hvMenu()">⋯</button>':'')+'<button class="svx" onclick="hvClose()">✕</button></div>'+(it.cap?'<div class="svcap">'+esc(it.cap)+'</div>':'')+'</div><div class="svbot me" id="hvBot"></div>';
 hvBot();var m=$('svm');if(it.kind==='video'&&m)m.onloadedmetadata=function(){if(_hv)_hv.dur=Math.min(60000,(m.duration||5)*1000);};
 H.t=setInterval(function(){if(!_hv)return;var n=Date.now(),d=n-_hv.last;_hv.last=n;if(!_hv.paused)_hv.el0+=d;var p=_hv.el0/_hv.dur,b=$('svb');if(b)b.style.width=Math.min(100,p*100)+'%';if(p>=1)hvNav(1);},40);}
function hvBot(){var H=_hv,b=$('hvBot');if(!H||!b)return;if(!H.me){b.innerHTML='';return;}var mt=H.meta[H.k]||{};
 b.innerHTML='<button class="svact" onclick="hvViewers()"><span class="svfaces"></span><span>Fəaliyyət'+(mt.views!=null?' · '+mt.views:'')+'</span></button><button class="svact" onclick="hvClose();hlNew()"><b>＋</b><span>Yeni</span></button><button class="svact" onclick="hvMenu()"><b>⋯</b><span>Daha çox</span></button>';}
function hvPause(on){if(!_hv)return;_hv.paused=on;var v=$('svm');if(v&&v.tagName==='VIDEO'){if(on)v.pause();else v.play().catch(function(){});}var p=$('svPs');if(p)p.classList.toggle('on',on);if(_hv.el)_hv.el.classList.toggle('held',on&&!_hv.sheet);}
function hvNav(d){var H=_hv;if(!H)return;H.k+=d;if(H.k<0)H.k=0;if(H.k>=H.h.items.length){hvClose();return;}hvDraw();}
function hvClose(){var H=_hv;if(!H)return;_hv=null;clearInterval(H.t);var s=$('svStage');if(s){s.style.transition='transform .18s,opacity .18s';s.style.transform='translateY(40%) scale(.85)';s.style.opacity='0';}setTimeout(function(){H.el.remove();document.body.classList.remove('incall');},170);}
function hvViewers(){var H=_hv;if(!H)return;var mt=H.meta[H.k]||{};if(!mt.sid){toast('Bu hekayənin baxış məlumatı yoxdur');return;}H.sheet=true;hvPause(true);
 var root=H.el,d=document.createElement('div');d.className='svsheet';d.innerHTML='<div class="svgrab"></div><div class="row sp"><b>👁 Baxanlar</b><button class="igtxt" onclick="hvSheetClose()">Bağla</button></div><div id="svVl"><p class="status"><span class="spin"></span></p></div>';root.appendChild(d);requestAnimationFrame(function(){d.classList.add('on');});
 var y0=null;d.addEventListener('touchstart',function(e){if(d.querySelector('#svVl').scrollTop<=0)y0=e.touches[0].clientY;},{passive:true});d.addEventListener('touchmove',function(e){if(y0==null)return;var dy=e.touches[0].clientY-y0;if(dy>0)d.style.transform='translateY('+dy+'px)';},{passive:true});d.addEventListener('touchend',function(e){if(y0==null)return;var dy=e.changedTouches[0].clientY-y0;y0=null;if(dy>80)hvSheetClose();else d.style.transform='';});
 run(sb.rpc('story_viewers',{p_id:mt.sid})).then(function(r){r=r||[];var l=$('svVl');if(!l)return;l.innerHTML=r.length?r.map(function(v){return '<div class="igrow" onclick="hvClose();socProfile(\''+v.uid+'\')">'+chatAva(v.ad,v.photo,44)+'<div class="igmeta"><div class="igname">'+esc(v.ad)+'</div><div class="iglast">'+stoAgo(v.at)+' əvvəl</div></div>'+(v.r?'<span class="svvr">'+esc(v.r)+'</span>':'')+'</div>';}).join(''):'<p class="hint" style="text-align:center;padding:20px">Hələ baxan yoxdur</p>';}).catch(err);}
function hvSheetClose(){var d=_hv&&_hv.el.querySelector('.svsheet,.svmenu');if(d){d.classList.remove('on');setTimeout(function(){d.remove();},200);}if(_hv){_hv.sheet=false;hvPause(false);}}
function hvMenu(){var H=_hv;if(!H)return;H.sheet=true;hvPause(true);var d=document.createElement('div');d.className='svmenu';d.innerHTML='<div class="svmbg"></div><div class="svmb"><button onclick="hvViewers();this.closest(\'.svmenu\').remove()">👁 Baxanlar</button><button class="red" id="hvDel">🗑 Önə çıxanı sil</button><button id="hvNo">Ləğv et</button></div>';H.el.appendChild(d);
 var close=function(){d.remove();if(_hv){_hv.sheet=false;hvPause(false);}};d.querySelector('.svmbg').onclick=close;d.querySelector('#hvNo').onclick=close;
 d.querySelector('#hvDel').onclick=function(){if(!confirm('"'+H.h.title+'" silinsin?'))return;run(sb.rpc('hl_delete',{p_id:H.h.id})).then(function(){hvClose();socProfile(ME.user_id);}).catch(err);};}
function hvGest(root){var g=null,skip=function(t){return t.closest('.svhead,.svbot,.svsheet,.svmenu,button,input');};
 root.addEventListener('pointerdown',function(e){if(!_hv||skip(e.target))return;g={x:e.clientX,y:e.clientY,t:Date.now(),dx:0,dy:0,hold:false};g.h=setTimeout(function(){if(g){g.hold=true;hvPause(true);}},220);});
 root.addEventListener('pointermove',function(e){if(!g)return;g.dx=e.clientX-g.x;g.dy=e.clientY-g.y;if(Math.abs(g.dy)>12&&Math.abs(g.dy)>Math.abs(g.dx)){clearTimeout(g.h);var s=$('svStage');if(s&&g.dy>0){s.style.transition='none';s.style.transform='translateY('+g.dy+'px) scale('+Math.max(.85,1-g.dy/1500)+')';root.style.background='rgba(0,0,0,'+Math.max(.2,1-g.dy/500)+')';}}});
 var end=function(){if(!g)return;var G=g;g=null;clearTimeout(G.h);var s=$('svStage');
  if(G.dy>90&&Math.abs(G.dy)>Math.abs(G.dx)){hvClose();return;}if(s){s.style.transition='transform .2s';s.style.transform='';root.style.background='';}
  if(G.dy<-70&&Math.abs(G.dy)>Math.abs(G.dx)&&_hv&&_hv.me){hvViewers();return;}if(G.hold){hvPause(false);return;}
  if(Math.abs(G.dx)>60){hvNav(G.dx<0?1:-1);return;}if(Date.now()-G.t<300)hvNav(G.x<innerWidth*.33?-1:1);};
 root.addEventListener('pointerup',end);root.addEventListener('pointercancel',function(){if(g){clearTimeout(g.h);if(g.hold)hvPause(false);g=null;}});}
var _backAct16=backAct;backAct=function(){if(_hv){if(_hv.el.querySelector('.svsheet,.svmenu'))hvSheetClose();else hvClose();return true;}return _backAct16();};

/* ---- Səhifələrdə (post, profil, kanal…) yana sürüşdür → geri ---- */
(function(){var S=null,hs='.socar,.igstories,.soseg,.sugl,.s3hl,.pfbd,.fpfl,.sochips,input,textarea,.igvc,.pftabs,.chr,.tgw,video';
 document.addEventListener('touchstart',function(e){S=null;var pg=e.target.closest&&e.target.closest('.pg.on');if(!pg||pg!==pgTop()||e.touches.length>1||$('modal').classList.contains('on'))return;var ex=e.target.closest(hs);if(ex){if(/INPUT|TEXTAREA|VIDEO/.test(ex.tagName)||ex.scrollWidth>ex.clientWidth+4)return;}var t=e.touches[0];S={pg:pg,x:t.clientX,y:t.clientY,dx:0,on:false};},{passive:true});
 document.addEventListener('touchmove',function(e){if(!S)return;var t=e.touches[0];S.dx=t.clientX-S.x;var dy=t.clientY-S.y;
  if(!S.on){if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(S.dx)){S=null;return;}if(Math.abs(S.dx)>14&&Math.abs(S.dx)>Math.abs(dy)*1.3){S.on=true;S.pg.style.transition='none';}}
  if(S.on){if(e.cancelable)e.preventDefault();S.pg.style.transform='translateX('+S.dx+'px)';}},{passive:false});
 document.addEventListener('touchend',function(){if(!S)return;var s=S;S=null;if(!s.on)return;s.pg.style.transition='transform .2s ease';
  if(Math.abs(s.dx)>90){s.pg.style.transform='translateX('+(s.dx>0?110:-110)+'%)';try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}setTimeout(function(){s.pg.style.transition='';pgPop();},180);}
  else{s.pg.style.transform='';setTimeout(function(){s.pg.style.transition='';},220);}},{passive:true});})();

;

/* ---- öz postunda IG üslubu statistika zolağı ---- */
var _postCard17=_postCard0;_postCard0=function(p){var h=_postCard17(p);if(!(p.mine&&p.kind==='post'))return h;
 h=h.replace(/<a class="igins"[^>]*>Statistikaya bax<\/a>/,'');
 var bar='<div class="igstat"><button class="igsl" onclick="postStats(\''+p.id+'\')"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg><b>'+(p.views!=null?p.views:'')+'</b><span>· Statistikanı gör</span></button><button class="igsb" onclick="postToStory(\''+p.id+'\')">Hekayədə paylaş</button></div>';
 var i=h.indexOf('<div class="igact">');return i>=0?h.slice(0,i)+bar+h.slice(i):h;};

;

/* ---- Şərhlər: Instagram görünüşü (cavablar yığılır) ---- */
var _cmOpen={};
feedComments=function(id,keep){_cParent=null;_ment={};var P=FEED.find(function(x){return x.id===id;})||{},A=P.author||P.ref||{};if(window._cmPost!==id)_cmOpen={};
 var sc=keep&&document.querySelector('#mbox .cmlist')?document.querySelector('#mbox .cmlist').scrollTop:0;
 run(sb.rpc('post_comments2',{p_id:id})).then(function(r){r=r||[];window._cmts=r;window._cmPost=id;var top=r.filter(function(c){return !c.parent;}),kids=function(pid){return r.filter(function(c){return c.parent===pid;});};
  var one=function(c,sub){return '<div class="cm2'+(sub?' sub':'')+(c.pinned?' pin':'')+'" oncontextmenu="event.preventDefault();cmAct('+c.id+')" ontouchstart="this._t=setTimeout(function(){cmAct('+c.id+')},500)" ontouchend="clearTimeout(this._t)" ontouchmove="clearTimeout(this._t)">'
   +'<span onclick="closeModal();socProfile(\''+c.uid+'\')">'+(typeof igRing==='function'?igRing(c.uid,c.ad,c.photo,sub?28:38):chatAva(c.ad,c.photo,sub?28:38))+'</span>'
   +'<div class="cm2b">'+(c.pinned?'<small class="cmpin">📌 Sabitlənib</small>':'')+'<div class="cm2h"><b onclick="closeModal();socProfile(\''+c.uid+'\')">'+esc(c.ad)+'</b>'+(P.author&&c.uid===P.author.uid?'<span class="cm2a">Müəllif</span>':'')+'<small>'+chatAgo(c.at)+'</small></div><div class="cm2t">'+socText(c.body)+'</div>'
   +'<div class="cm2f"><a onclick="cmReply('+(c.parent||c.id)+',\''+chatArg(c.ad)+'\')">Cavab ver</a>'+(c.mine?'<a onclick="cmDel('+c.id+')">Sil</a>':'')+'</div></div>'
   +'<button class="cm2l'+(c.liked?' on':'')+'" onclick="cmLike2(\''+id+'\','+c.id+','+(!c.liked)+')">'+igSvg(IGP.heart,c.liked?'#ff3040':'none')+(c.likes?'<span>'+c.likes+'</span>':'')+'</button></div>';};
  var body=top.length?top.map(function(c){var k=kids(c.id),open=_cmOpen[c.id];return one(c)+(k.length?'<div class="cm2k">'+(open?k.map(function(x){return one(x,1);}).join(''):'')+'<button class="cm2more" onclick="_cmOpen['+c.id+']='+(!open)+';feedComments(\''+id+'\',1)"><i></i>'+(open?'Cavabları gizlət':(k.length===1?'1 cavaba bax':k.length+' cavaba bax'))+'</button></div>':'');}).join('')
   :'<div class="pfempty"><b style="font-size:1.1rem;color:#0a0a0a">Hələ şərh yoxdur</b><br><small>Söhbətə ilk sən başla</small></div>';
  var me=typeof EMP!=='undefined'&&EMP&&EMP.photo;
  modal('<div class="cm2top">Şərhlər</div><div class="cmlist">'+body+'</div>'
   +'<div class="cm2bar"><div class="cmemo">'+['❤️','🙌','🔥','👏','😢','😍','😮','😂'].map(function(e){return '<button onmousedown="event.preventDefault()" onclick="var i=$(\'fcB\');i.value+=\''+e+'\';i.focus()">'+e+'</button>';}).join('')+'</div>'
   +'<div id="cmTo" class="cmto"></div><div class="cm2in">'+chatAva(ME&&ME.full_name||'Mən',me||null,36)+'<div class="cm2box"><input id="fcB" placeholder="'+esc((A.ad||'').split(' ')[0])+' üçün şərh yaz…" onkeydown="if(event.key===\'Enter\')feedComment(\''+id+'\')" oninput="var b=$(\'cm2Go\');if(b)b.style.display=this.value.trim()?\'\':\'none\'"><button id="cm2Go" style="display:none" onclick="feedComment(\''+id+'\')">Paylaş</button></div></div></div>');
  $('mbox').classList.add('cmsheet');mentionBind($('fcB'));var l=document.querySelector('#mbox .cmlist');if(l&&sc)l.scrollTop=sc;}).catch(err);};
function cmLike2(pid,cid,on){var c=(window._cmts||[]).find(function(x){return x.id===cid;});if(c){c.liked=on;c.likes=(c.likes||0)+(on?1:-1);}var b=event&&event.currentTarget;if(b){b.classList.toggle('on',on);b.innerHTML=igSvg(IGP.heart,on?'#ff3040':'none')+(c&&c.likes?'<span>'+c.likes+'</span>':'');}
 sb.rpc('comment_like',{p_id:cid,p_on:on}).then(function(){},function(){});}
var _cmReply18=cmReply;cmReply=function(pid,ad){_cmOpen[pid]=true;_cmReply18(pid,ad);var t=$('cmTo');if(t)t.innerHTML='<span>'+esc(ad)+' adlı istifadəçiyə cavab verirsən</span><a onclick="_cParent=null;this.parentNode.innerHTML=\'\'">✕</a>';var b=$('cm2Go');if(b)b.style.display='';};
var _feedComment18=feedComment;feedComment=function(id){var i=$('fcB');if(!i||!i.value.trim())return;_feedComment18(id);};
var _closeModal18=closeModal;closeModal=function(){var m=$('mbox');if(m)m.classList.remove('cmsheet');_closeModal18();};

;

/* ---- Önə çıxanı basıb saxla → menyu ---- */
document.addEventListener('contextmenu',function(e){var b=e.target.closest&&e.target.closest('.pg .pfhl button');if(b){e.preventDefault();}},true);
(function(){var t=null,fired=false;
 document.addEventListener('touchstart',function(e){var b=e.target.closest&&e.target.closest('.pg .pfhl button');if(!b||!window._profX||!window._profX._me)return;var i=Array.prototype.indexOf.call(b.parentNode.querySelectorAll('button[onclick^="hlView"]'),b);if(i<0)return;fired=false;
  t=setTimeout(function(){fired=true;try{navigator.vibrate&&navigator.vibrate(15);}catch(x){}hlAct(i);},480);},{passive:true});
 var cl=function(){clearTimeout(t);};document.addEventListener('touchmove',cl,{passive:true});document.addEventListener('touchend',function(e){cl();if(fired){fired=false;e.preventDefault();}},{passive:false});
 document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.pg .pfhl button')&&window._hlBlock&&Date.now()-window._hlBlock<700){e.stopPropagation();e.preventDefault();}},true);})();
function hlAct(i){window._hlBlock=Date.now();var h=(window._profX.hl||[])[i];if(!h)return;var d=ovl('<div class="cmq">'+esc(h.title)+' · '+h.items.length+' hekayə</div><button class="igmenu" data-a="v">▶️ Bax</button><button class="igmenu" data-a="r">✏️ Adını dəyiş</button><button class="igmenu" style="color:#ed4956" data-a="d">🗑 Önə çıxanı sil</button><button class="igmenu" data-a="x">Ləğv et</button>');
 d.querySelectorAll('[data-a]').forEach(function(b){b.onclick=function(){var a=b.dataset.a;d.remove();if(a==='v')hlView(i);
  else if(a==='r'){var n=prompt('Yeni ad',h.title);if(n&&n.trim())run(sb.rpc('hl_rename',{p_id:h.id,p_title:n})).then(function(){socProfile(ME.user_id);}).catch(err);}
  else if(a==='d'){if(confirm('"'+h.title+'" silinsin? Hekayələrin arxivdə qalır.'))run(sb.rpc('hl_delete',{p_id:h.id})).then(function(){toast('Silindi');socProfile(ME.user_id);}).catch(err);}};});}

/* ---- Instagram kimi paylaşım zolağı (real yükləmə faizi) ---- */
var SBURL='https://avqchschbbltnnasabdm.supabase.co',SBKEY=null;
function upXhr(file,prefix,onp){return imgCompress(file,prefix==='story'?1920:1600,.82).then(function(f){return sb.auth.getSession().then(function(s){var tok=s&&s.data&&s.data.session&&s.data.session.access_token;
 var ext=((f.name||'').split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,6)||'bin',path=prefix+'/'+Date.now()+'_'+Math.random().toString(36).slice(2,8)+'.'+ext;
 if(!tok||!SBKEY)return _chatUpload8(f,prefix).then(function(u){onp&&onp(f.size,f.size);return u;});
 return new Promise(function(res,rej){var x=new XMLHttpRequest();x.open('POST',SBURL+'/storage/v1/object/chat/'+path);x.setRequestHeader('Authorization','Bearer '+tok);x.setRequestHeader('apikey',SBKEY);x.setRequestHeader('x-upsert','false');x.setRequestHeader('Content-Type',f.type||'application/octet-stream');
  x.upload.onprogress=function(e){if(e.lengthComputable&&onp)onp(e.loaded,e.total);};x.onload=function(){if(x.status>=200&&x.status<300){onp&&onp(f.size,f.size);res(SBURL+'/storage/v1/object/public/chat/'+path);}else _chatUpload8(f,prefix).then(res,rej);};x.onerror=function(){_chatUpload8(f,prefix).then(res,rej);};x.send(f);});});});}
try{var _k=(sb&&sb.supabaseKey)||null;SBKEY=_k;}catch(e){}
setTimeout(function(){try{SBKEY=SBKEY||(sb&&(sb.supabaseKey||(sb.rest&&sb.rest.headers&&sb.rest.headers.apikey)));}catch(e){}},3000);
function upBar(thumb,label){var o=$('upBar');if(o)o.remove();o=document.createElement('div');o.id='upBar';o.innerHTML='<div class="upi">'+(thumb?'<img src="'+esc(thumb)+'">':'<span>Aa</span>')+'<b id="upL">'+esc(label||'Paylaşılır…')+'</b><em id="upP"></em></div><i class="upl"><s id="upS"></s></i>';document.body.appendChild(o);requestAnimationFrame(function(){o.classList.add('on');});
 var c={set:function(p){var s=$('upS'),e=$('upP');if(s)s.style.width=Math.max(4,Math.min(100,p))+'%';if(e)e.textContent=Math.round(p)+'%';},
  done:function(ok,msg,retry){var l=$('upL'),e=$('upP'),s=$('upS');if(!o.isConnected)return;if(ok){if(s)s.style.width='100%';if(l)l.textContent='✓ '+(msg||'Paylaşıldı');if(e)e.textContent='';o.classList.add('ok');setTimeout(function(){o.classList.remove('on');setTimeout(function(){o.remove();},250);},1600);}
   else{o.classList.add('bad');if(l)l.textContent=msg||'Alınmadı';if(e)e.innerHTML=retry?'<button>Yenidən</button>':'<button>✕</button>';var b=e&&e.querySelector('button');if(b)b.onclick=function(){o.remove();if(retry)retry();};}}};c.set(3);return c;}
/* post */
feedPost=function(){var c;try{c=fpCollect();}catch(e){toast(e.message);return;}if(_fpWhen)return draftSave(true);if(!c.b&&!_fpMedia.length&&!c.poll){toast('Mətn, şəkil və ya sorğu əlavə edin');return;}
 var S={b:c.b,poll:c.poll,media:_fpMedia.slice(),club:_fpClub,chal:_fpChal,ment:mentionIds(c.b),T:(_fpTags||[]).slice(),P:_fpPlace,C:_fpCollab,draft:_fpDraft,ar:_fpAR,fl:_fpFL};
 var f0=S.media.find(function(f){return f.url?f.kind!=='video':/^image/.test(f.type);});var th=f0?(f0.url||URL.createObjectURL(f0)):null;closeModal();
 var v=$('v-feed');if(!v||!v.classList.contains('on'))show('feed');else if(FMODE!=='all'&&FMODE!=='club'&&FMODE!=='challenge')feedMode('all');window.scrollTo({top:0,behavior:'smooth'});
 var go=function(){var bar=upBar(th,'Paylaşılır…'),tot=S.media.reduce(function(a,f){return a+(f.url?0:f.size||1);},0)||1,done={};
  var prog=function(k,l){done[k]=l;var s=0;Object.keys(done).forEach(function(z){s+=done[z];});bar.set(5+90*s/tot);};
  Promise.all(S.media.map(function(f,i){if(f.url)return Promise.resolve({url:f.url,kind:f.kind||'image'});_fpAR=S.ar;_fpFL=S.fl;return fpProcess(f).then(function(g){return upXhr(g,'post',function(l,t){prog(i,l*(f.size||1)/(t||1));}).then(function(u){if(!/^video/.test(f.type))return {url:u,kind:'image'};return vidPoster(f).then(function(pb){if(!pb)return {url:u,kind:'video'};return _chatUpload8(new File([pb],'poster.jpg',{type:'image/jpeg'}),'post').then(function(pu){return {url:u,kind:'video',poster:pu};},function(){return {url:u,kind:'video'};});});});});}))
  .then(function(media){bar.set(96);return run(sb.rpc('post_add3',{p_body:S.b,p_media:media.length?media:null,p_poll:S.poll,p_club:S.club,p_mentions:S.ment,p_shared:null,p_challenge:S.chal}));})
  .then(function(pid){if(pid&&(S.T.length||S.P||S.C))return run(sb.rpc('post_meta',{p_id:pid,p_tags:S.T.length?S.T:null,p_place:S.P,p_collab:S.C?S.C.uid:null}));})
  .then(function(){bar.done(true);if(S.draft)sb.rpc('draft_delete',{p_id:S.draft}).then(function(){},function(){});FEED=[];if(FMODE==='team')teamRender();else feedLoad();})
  .catch(function(e){bar.done(false,'Paylaşılmadı: '+((e&&e.message)||e),go);});};go();};
/* hekayə */
stShare=function(){var S=_st;if(!S)return;var th=S.vid?null:S.u,lay=S.layers.slice(),stk=S.stk,aud=S.aud,ment=(S.ment||[]).slice(),vid=S.vid;
 var g=$('stGo');g.disabled=true;g.textContent='Hazırlanır…';stCompose().then(function(f){var thumb=vid?null:URL.createObjectURL(f);_st={u:S.u};stEdClose();
  var go=function(){var bar=upBar(thumb,'Hekayən paylaşılır…'),url0;upXhr(f,'story',function(l,t){bar.set(5+90*l/(t||1));}).then(function(url){url0=url;bar.set(96);var cap=vid&&lay.length?lay.map(function(l){return l.t;}).join(' · '):null;return run(sb.rpc('story_add3',{p_url:url,p_kind:vid?'video':'image',p_caption:cap,p_sticker:stk,p_audience:aud}));})
   .then(function(){ment.forEach(function(u){sb.rpc('msg_send',{p_to:u,p_group:null,p_body:'📸 Səni hekayəsində qeyd etdi',p_kind:'story_mention',p_image:vid?null:url0,p_file_url:vid?url0:null}).then(function(){},function(){});});bar.done(true,aud==='cf'?'Yaxın dostlarla paylaşıldı':'Hekayən paylaşıldı');storyLoad();})
   .catch(function(e){bar.done(false,'Alınmadı: '+((e&&e.message)||e),go);});};go();}).catch(function(e){g.disabled=false;g.textContent='Hekayən ➜';toast(e.message||e);});};

;

/* ---- Android tətbiqində (WebView) "şəkil və video" birlikdə seçimi açılmır → seçim pəncərəsi ---- */
(function(){var _ic=HTMLInputElement.prototype.click;
 HTMLInputElement.prototype.click=function(){var inp=this,a=inp.accept||'';
  if(inp.type==='file'&&!inp._ok&&typeof isNative==='function'&&isNative()&&a.indexOf(',')>=0){
   var kinds=a.split(',').map(function(s){return s.trim();}).filter(Boolean);if(kinds.length>1){
    var lab={'image/*':['🖼','Şəkil'],'video/*':['🎬','Video']};var d=ovl('<div class="cmq">Nə seçmək istəyirsən?</div><div class="pkr">'+kinds.map(function(k){var l=lab[k]||['📎',k];return '<button data-k="'+k+'"><span>'+l[0]+'</span>'+l[1]+'</button>';}).join('')+'</div>');
    d.querySelectorAll('[data-k]').forEach(function(b){b.onclick=function(){d.remove();inp.accept=b.dataset.k;inp._ok=1;_ic.call(inp);};});return;}}
  return _ic.call(inp);};})();

;

/* ---- Post yaratma: sadə, Instagram üslubu (klaviatura avtomatik açılmır) ---- */
feedCompose=function(club,chal){_fpMedia=[];_fpPoll=null;_fpClub=club||null;_ment={};_fpDraft=null;_fpChal=chal||null;_fpWhen=null;_fpAR='o';_fpFL='n';_fpTags=[];_fpPlace=null;_fpCollab=null;
 var me=typeof EMP!=='undefined'&&EMP&&EMP.photo;
 var row=function(id,ic,t,fn,extra){return '<button class="cprow" id="'+id+'" onclick="'+fn+'"><span class="cpic">'+ic+'</span><span class="cpt">'+t+'</span><span class="cpv"></span><i>›</i></button>'+(extra||'');};
 modal('<div class="mhead"><h3>Yeni post</h3><button class="x" onclick="closeModal()">×</button></div>'
  +'<div class="cpmed"><button class="cpadd" id="fpAdd" onclick="feedPickImg()"><span>＋</span><b>Şəkil və ya video əlavə et</b><small>10-a qədər · karusel olur</small></button><div id="fpPrev" class="fpprev"></div></div>'
  +'<div class="cpcap">'+chatAva(ME&&ME.full_name||'Mən',me||null,34)+'<textarea id="fpB" rows="3" placeholder="Yazı əlavə et… (@ ilə qeyd, # ilə mövzu)"></textarea></div>'
  +'<div class="cpmini"><button onclick="aiCap()">✨ AI ilə yaz</button><button onclick="fpTag()"># Mövzu</button><button onclick="draftList()">📝 Qaralamalar</button></div><div id="fpAi"></div>'
  +'<div class="cplist">'+row('rTag','👤','İnsanları işarələ','fpTagUI()')+row('rPlace','📍','Məkan əlavə et','fpPlaceUI()')+row('rCol','🤝','Birgə müəllif dəvət et','fpCollabUI()')
  +row('rPoll','📊','Sorğu əlavə et','fpPollToggle();cpSync()','<div id="fpPoll"></div>')+'<div id="fpChal"></div>'
  +row('fpWT','⏰','Paylaşım vaxtı','fpWhenToggle();cpSync()','<div id="fpWhen" class="fpwhen"></div>')+'</div><div id="fpMeta" style="display:none"></div>'
  +'<div class="cpfoot"><button class="btn ghost" onclick="draftSave(false)">Qaralama</button><button class="btn" id="fpGo" onclick="feedPost()">Paylaş</button></div>');
 $('mbox').classList.add('cpsheet');mentionBind($('fpB'));cpSync();
 run(sb.rpc('chal_list')).then(function(l){var a=(l||[]).filter(function(c){return c.active;});var el=$('fpChal');if(!el||!a.length)return;
  el.innerHTML='<div class="fpchal"><span>🏁 Çağırışa qat:</span>'+a.map(function(c){return '<button data-c="'+c.id+'" class="'+(_fpChal===c.id?'on':'')+'" onclick="_fpChal=_fpChal===\''+c.id+'\'?null:\''+c.id+'\';Array.prototype.forEach.call(this.parentNode.querySelectorAll(\'button\'),function(b){b.classList.toggle(\'on\',b.dataset.c===_fpChal)})">'+esc(c.emoji+' '+c.title)+'</button>';}).join('')+'</div>';}).catch(function(){});};
function cpSync(){var v=function(id,t){var e=$(id);if(!e)return;var s=e.querySelector('.cpv');if(s)s.textContent=t||'';e.classList.toggle('set',!!t);};
 v('rTag',(_fpTags||[]).length?_fpTags.map(function(t){return t.ad.split(' ')[0];}).join(', '):'');v('rPlace',_fpPlace||'');v('rCol',_fpCollab?_fpCollab.ad.split(' ')[0]:'');v('rPoll',_fpPoll?'Əlavə edilib':'');
 var w=$('fpW');v('fpWT',_fpWhen&&w?w.value.replace('T',' '):'');var t=$('fpWT');if(t){var x=t.querySelector('.cpt');if(x)x.textContent='Paylaşım vaxtı';}
 var a=$('fpAdd');if(a)a.classList.toggle('small',(_fpMedia||[]).length>0);}
fpMetaDraw=function(){cpSync();};
var _fpPrev19=fpPrev;fpPrev=function(){_fpPrev19();cpSync();};
var _fpWhenToggle19=fpWhenToggle;fpWhenToggle=function(){_fpWhenToggle19();var w=$('fpW');if(w)w.onchange=cpSync;var t=$('fpWT');if(t){var x=t.querySelector('.cpt');if(x)x.textContent='Paylaşım vaxtı';}};
var _closeModal19=closeModal;closeModal=function(){var m=$('mbox');if(m)m.classList.remove('cpsheet');_closeModal19();};

;

/* ---- Post menyusu: səliqəli, Instagram üslubu ---- */
feedMenu=function(id){var p=FEED.find(function(x){return x.id===id;})||{},mine=p.mine&&p.kind==='post',I=function(n){return typeof uiIcon==='function'?uiIcon(n):'';};
 var q=function(ic,t,fn,on){return '<button class="pmq'+(on?' on':'')+'" onclick="closeModal();'+fn+'"><span>'+ic+'</span>'+t+'</button>';};
 var r=function(ic,t,fn,cls){return '<button class="pmr'+(cls?' '+cls:'')+'" onclick="'+fn+'">'+ic+'<span>'+t+'</span></button>';};
 var h='<div class="pmtop">'+q(I('bookmark'),p.saved?'Saxlanılıb':'Saxla','postSave(\''+id+'\','+(!p.saved)+')',p.saved)+q(I('nav'),'Göndər','postShare(\''+id+'\')')+q(I('plus'),'Hekayəyə','postToStory(\''+id+'\')')+'</div><div class="pmg">';
 if(mine){h+=r(I('chart'),'Statistika','closeModal();postStats(\''+id+'\')')+r(I('pen'),'Redaktə et','postEdit(\''+id+'\')')+r(I('pin'),p.ppin?'Profildən sabiti götür':'Profildə sabitlə','ppin(\''+id+'\','+(!p.ppin)+')')+'</div><div class="pmg">'
   +r(I('box'),p.archived?'Profilə qaytar':'Arxivlə','postSet(\''+id+'\',\'archived\','+(!p.archived)+')')+r(I('heart'),p.hidelk?'Reaksiya sayını göstər':'Reaksiya sayını gizlət','postSet(\''+id+'\',\'hidelk\','+(!p.hidelk)+')')+r(I('msg'),p.nocm?'Şərhləri aç':'Şərhləri söndür','postSet(\''+id+'\',\'nocm\','+(!p.nocm)+')');}
 else{var a=p.author||{};if(a.uid)h+=r(I('user'),'Profilə keç','closeModal();socProfile(\''+a.uid+'\')')+r(I('star'),'Favorilərə əlavə et','relSet(\''+a.uid+'\',{p_fav:true})')+r(I('belloff'),'Postlarını səssizləşdir','relSet(\''+a.uid+'\',{p_mp:true})');
  if(SOC_MOD)h+=r(I('chart'),'Statistika','closeModal();postStats(\''+id+'\')');}
 if(typeof MGR!=='undefined'&&MGR)h+=r(I('pin'),p.pinned?'Lentdə sabiti götür':'Lentin yuxarısına sabitlə','feedPin(\''+id+'\','+(!p.pinned)+')');
 h+='</div><div class="pmg">'+(mine||(typeof MGR!=='undefined'&&MGR)?r(I('trash'),'Sil','feedDel(\''+id+'\')','red'):'')+(!mine?r(I('flag'),'Şikayət et','repOpen(\'post\',\''+id+'\')','red'):'')+'</div>';
 modal('<div class="pmh"></div>'+h.replace(/<div class="pmg"><\/div>/g,''));$('mbox').classList.add('pmsheet');};
var _closeModal20=closeModal;closeModal=function(){var m=$('mbox');if(m)m.classList.remove('pmsheet');_closeModal20();};

;

/* ===================== SOSİAL +15 (2) + MAVİ TİK ===================== */
/* ---------- mavi tik ---------- */
var VERIF={},VBADGE='<svg class="vbadge" viewBox="0 0 40 40" aria-label="Təsdiqlənib"><path fill="#0095f6" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"/></svg>';
var VSEL='.pgh>b,.pfinfo>b,.igph b,.cm2h>b,.igname,.svhead>b,.momh>b,.rlau>b,.sonotif b,.chm b,.sugc>b,.lvtop b,.igrow .igname,.igcap>b';
function vMark(root){if(!Object.keys(VERIF).length||!root||!root.querySelectorAll)return;var l=root.matches&&root.matches(VSEL)?[root]:[];l=l.concat(Array.prototype.slice.call(root.querySelectorAll(VSEL)));
 l.forEach(function(el){if(el.querySelector('.vbadge'))return;var t=(el.textContent||'').trim();for(var n in VERIF){if(t===n||t.indexOf(n+' ')===0||t.indexOf(n+'\u00a0')===0||(t.indexOf(n)===0&&t.length<=n.length+3)){var fc=el.firstChild;if(fc&&fc.nodeType===3&&fc.nodeValue.trim().indexOf(n)===0&&fc.nodeValue.trim().length>n.length){var rest=fc.nodeValue.slice(fc.nodeValue.indexOf(n)+n.length);fc.nodeValue=fc.nodeValue.slice(0,fc.nodeValue.indexOf(n)+n.length);fc.parentNode.insertBefore(document.createTextNode(rest),fc.nextSibling);}
  var tmp=document.createElement('span');tmp.innerHTML=VBADGE;var b=tmp.firstChild;if(fc&&fc.nodeType===3)fc.parentNode.insertBefore(b,fc.nextSibling);else el.appendChild(b);break;}}});}
(function(){var q=[],s=false;new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)q.push(n);else if(n.parentNode)q.push(n.parentNode);});});if(!s&&q.length){s=true;requestAnimationFrame(function(){s=false;var x=q;q=[];x.forEach(function(n){if(n.isConnected)vMark(n);});});}}).observe(document.body,{childList:true,subtree:true});
 var go=function(){if(typeof ME==='undefined'||!ME||!sb){setTimeout(go,1200);return;}run(sb.rpc('verified_list')).then(function(l){VERIF={};(l||[]).forEach(function(u){VERIF[u.ad]=u.uid;});vMark(document.body);}).catch(function(){});};setTimeout(go,1500);})();

/* ---------- 1. sabit söhbətlər ---------- */
var CPINS=[];function cpinsLoad(){return run(sb.rpc('chat_pins')).then(function(l){CPINS=l||[];return CPINS;}).catch(function(){return CPINS;});}
var _chatVisible16=chatVisible;chatVisible=function(){var r=_chatVisible16();return r.slice().sort(function(a,b){var x=CPINS.indexOf(a.other),y=CPINS.indexOf(b.other);x=x<0?99:x;y=y<0?99:y;return x-y;});};
var _chatDrawThreads16=chatDrawThreads;chatDrawThreads=function(rows){_chatDrawThreads16(rows);CPINS.forEach(function(u){var r=document.querySelector('#chatThreads .igrow[onclick*="\''+u+'\'"] .igname');if(r&&!r.querySelector('.cpin'))r.insertAdjacentHTML('beforeend','<span class="cpin">📌</span>');});};
function chatPinToggle(){var on=CPINS.indexOf(CHATother)<0;run(sb.rpc('chat_pin',{p_other:CHATother,p_on:on})).then(function(){closeModal();toast(on?'📌 Söhbət yuxarıda sabitləndi':'Sabit götürüldü');cpinsLoad();}).catch(err);}
/* menyulara əlavələr */
function chatExtraItems(){return '<button class="igmenu" onclick="chatPinToggle()">📌 '+(CPINS.indexOf(CHATother)<0?'Söhbəti sabitlə':'Sabiti götür')+'</button><button class="igmenu" onclick="closeModal();msgSchedUI()">⏰ Mesajı planla</button>'+(CHATgroup?'<button class="igmenu" onclick="closeModal();gcallStart()">📹 Qrup video zəngi</button>':'');}
var _chatRoomMenu16=chatRoomMenu;chatRoomMenu=function(){_chatRoomMenu16();var mb=$('mbox');var f=mb&&mb.querySelector('.igmenu');if(f)f.insertAdjacentHTML('beforebegin',chatExtraItems());};
var _chatStyleMenu16=chatStyleMenu;chatStyleMenu=function(){_chatStyleMenu16();var n=0;(function go(){var mb=$('mbox'),h=mb&&mb.querySelector('.mhead');if(!h||!mb.querySelector('.s3sw')){if(n++<30)setTimeout(go,100);return;}if(mb.querySelector('.cxi'))return;h.insertAdjacentHTML('afterend','<div class="cxi">'+chatExtraItems()+'</div>');})();};

/* ---------- 2. planlı mesaj ---------- */
function msgSchedUI(){var dv=new Date(Date.now()+86400000).toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).slice(0,10)+'T09:00';var cur=(($('chatText')||{}).value||'').trim();
 modal('<div class="mhead"><h3>⏰ Mesajı planla</h3><button class="x" onclick="closeModal()">×</button></div><textarea id="msB" rows="3" style="width:100%" placeholder="Mesaj…">'+esc(cur)+'</textarea><div class="field" style="margin-top:8px"><label>Göndəriləcək vaxt (Bakı)</label><input id="msA" type="datetime-local" value="'+dv+'"></div><div class="sochips" style="justify-content:flex-start;margin:4px 0 10px"><span onclick="msQuick(1)">1 saat sonra</span><span onclick="msQuick(\'m\')">Sabah 09:00</span><span onclick="msQuick(\'b\')">Bu gün 18:00</span></div><button class="btn" style="width:100%" onclick="msGo()">Planla</button>');}
function msQuick(k){var d=k===1?new Date(Date.now()+3600000):null,s;if(d)s=d.toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).slice(0,16).replace(' ','T');else{var t=new Date(Date.now()+(k==='m'?86400000:0)).toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).slice(0,10);s=t+(k==='m'?'T09:00':'T18:00');}$('msA').value=s;}
function msGo(){var b=$('msB').value.trim(),a=$('msA').value;if(!b||!a){toast('Mesaj və vaxt lazımdır');return;}run(sb.rpc('msg_schedule',{p_to:CHATgroup?null:CHATother,p_group:CHATgroup?CHATother:null,p_body:b,p_at:new Date(a+':00+04:00').toISOString()})).then(function(){closeModal();var t=$('chatText');if(t&&t.value.trim()===b){t.value='';chatTyping();}toast('⏰ Planlandı');msSchedBar();}).catch(err);}
function msSchedBar(){var who=CHATother,g=CHATgroup;run(sb.rpc('msg_sched_list',{p_other:g?null:who,p_group:g?who:null})).then(function(l){if(who!==CHATother)return;l=l||[];window._msl=l;var b=$('msBar');if(!l.length){if(b)b.remove();return;}var html='<div id="msBar" onclick="msList()">⏰ '+l.length+' planlı mesaj · ən yaxını '+new Date(l[0].at).toLocaleString('az-AZ',{timeZone:'Asia/Baku',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</div>';if(b)b.outerHTML=html;else{var p=$('igPinned');if(p)p.insertAdjacentHTML('beforebegin',html);}}).catch(function(){});}
function msList(){var l=window._msl||[];modal('<div class="mhead"><h3>⏰ Planlı mesajlar</h3><button class="x" onclick="closeModal()">×</button></div>'+l.map(function(m){return '<div class="igrow"><div class="igmeta"><div class="igname">'+esc(m.body.slice(0,80))+'</div><div class="iglast">'+new Date(m.at).toLocaleString('az-AZ',{timeZone:'Asia/Baku',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</div></div><button class="btn sm ghost" onclick="msCancel('+m.id+')">Ləğv</button></div>';}).join(''));}
function msCancel(id){run(sb.rpc('msg_sched_cancel',{p_id:id})).then(function(){closeModal();msSchedBar();}).catch(err);}

/* ---------- 3. qrup video zəng ---------- */
var _gc=null;
function gcallStart(){if(!CHATgroup)return;run(sb.rpc('gcall_start',{p_group:CHATother})).then(function(id){gcallJoin(id);}).catch(err);}
function gcallJoin(id){if(_gc)return;navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:480},height:{ideal:640}},audio:{echoCancellation:true,noiseSuppression:true}}).then(function(st){
 return Promise.all([run(sb.rpc('room_poll',{p_id:id,p_muted:false,p_hand:false,p_after:0})),callIce()]).then(function(r){var mem=(r[0]&&r[0].members)||[];if(mem.filter(function(m){return m.uid!==ME.user_id;}).length>=4){st.getTracks().forEach(function(t){t.stop();});toast('Zəng doludur (4 nəfər)');return;}
  return run(sb.rpc('room_join',{p_id:id})).then(function(){_gc={id:id,st:st,ice:r[1],peers:{},after:0,mem:[],mic:true,cam:true};gcUI();gcPoll();_gc.t=setInterval(gcPoll,1200);});});}).catch(function(e){toast(e&&e.name==='NotAllowedError'?'Kamera və mikrofona icazə verin':(e.message||e));});}
function gcUI(){var o=document.createElement('div');o.id='gcV';o.innerHTML='<div class="gctop"><b>📹 Qrup zəngi</b><span id="gcN"></span></div><div class="gcgrid" id="gcG"></div><div class="gcbot"><button id="gcM" onclick="gcMic()">🎤</button><button id="gcC" onclick="gcCam()">📷</button><button class="end" onclick="gcLeave()">✕</button></div>';document.body.appendChild(o);document.body.classList.add('incall');gcDraw();}
function gcTile(uid){var g=$('gcG');if(!g)return null;var t=g.querySelector('[data-u="'+uid+'"]');if(t)return t;var m=(_gc.mem||[]).find(function(x){return x.uid===uid;})||{ad:uid===ME.user_id?'Sən':''};t=document.createElement('div');t.className='gct';t.dataset.u=uid;t.innerHTML='<video autoplay playsinline '+(uid===ME.user_id?'muted class="mir"':'')+'></video><span>'+esc(uid===ME.user_id?'Sən':(m.ad||'').split(' ')[0])+'</span>';g.appendChild(t);return t;}
function gcDraw(){if(!_gc)return;var me=gcTile(ME.user_id);if(me){var v=me.querySelector('video');if(v.srcObject!==_gc.st)v.srcObject=_gc.st;}var ids=_gc.mem.map(function(m){return m.uid;});var g=$('gcG');if(g){Array.prototype.forEach.call(g.children,function(t){if(t.dataset.u!==ME.user_id&&ids.indexOf(t.dataset.u)<0)t.remove();});g.className='gcgrid n'+Math.max(1,g.children.length);}var n=$('gcN');if(n)n.textContent=Math.max(1,ids.length)+' nəfər';}
function gcPC(u){var G=_gc,pc=new RTCPeerConnection({iceServers:G.ice}),P={pc:pc,q:[]};G.peers[u]=P;G.st.getTracks().forEach(function(t){pc.addTrack(t,G.st);});
 pc.onicecandidate=function(e){if(e.candidate)sb.rpc('room_sig',{p_id:G.id,p_to:u,p_payload:{t:'ice',c:e.candidate.toJSON()}}).then(function(){},function(){});};
 pc.ontrack=function(e){var t=gcTile(u);if(t){var v=t.querySelector('video');if(v.srcObject!==e.streams[0]){v.srcObject=e.streams[0];v.play().catch(function(){});}}gcDraw();};
 pc.onconnectionstatechange=function(){if(pc.connectionState==='failed'){try{pc.close();}catch(x){}delete G.peers[u];}};return P;}
function gcPoll(){var G=_gc;if(!G)return;sb.rpc('room_poll',{p_id:G.id,p_muted:!G.mic,p_hand:false,p_after:G.after}).then(function(r){if(_gc!==G||!r.data)return;var d=r.data;G.mem=d.members||[];
 (d.sig||[]).forEach(function(s){G.after=Math.max(G.after,s.id);var P=G.peers[s.from],p=s.p;
  if(p.t==='offer'){if(P){try{P.pc.close();}catch(x){}}P=gcPC(s.from);P.pc.setRemoteDescription({type:'offer',sdp:p.sdp}).then(function(){P.q.forEach(function(c){P.pc.addIceCandidate(c).catch(function(){});});P.q=[];return P.pc.createAnswer();}).then(function(a){return P.pc.setLocalDescription(a);}).then(function(){return sb.rpc('room_sig',{p_id:G.id,p_to:s.from,p_payload:{t:'answer',sdp:P.pc.localDescription.sdp}});}).catch(function(){});}
  else if(p.t==='answer'&&P)P.pc.setRemoteDescription({type:'answer',sdp:p.sdp}).then(function(){P.q.forEach(function(c){P.pc.addIceCandidate(c).catch(function(){});});P.q=[];}).catch(function(){});
  else if(p.t==='ice'&&P){if(P.pc.remoteDescription)P.pc.addIceCandidate(p.c).catch(function(){});else P.q.push(p.c);}});
 var me=G.mem.find(function(m){return m.uid===ME.user_id;});G.mem.forEach(function(m){if(m.uid===ME.user_id||G.peers[m.uid])return;if(me&&new Date(me.joined)>new Date(m.joined)){var P=gcPC(m.uid);P.pc.createOffer().then(function(o){return P.pc.setLocalDescription(o);}).then(function(){return sb.rpc('room_sig',{p_id:G.id,p_to:m.uid,p_payload:{t:'offer',sdp:P.pc.localDescription.sdp}});}).catch(function(){});}});
 var ids=G.mem.map(function(m){return m.uid;});Object.keys(G.peers).forEach(function(u){if(ids.indexOf(u)<0){try{G.peers[u].pc.close();}catch(x){}delete G.peers[u];}});gcDraw();},function(){});}
function gcMic(){if(!_gc)return;_gc.mic=!_gc.mic;_gc.st.getAudioTracks().forEach(function(t){t.enabled=_gc.mic;});$('gcM').classList.toggle('off',!_gc.mic);$('gcM').textContent=_gc.mic?'🎤':'🔇';}
function gcCam(){if(!_gc)return;_gc.cam=!_gc.cam;_gc.st.getVideoTracks().forEach(function(t){t.enabled=_gc.cam;});$('gcC').classList.toggle('off',!_gc.cam);}
function gcLeave(){var G=_gc;if(!G)return;_gc=null;clearInterval(G.t);Object.keys(G.peers).forEach(function(u){try{G.peers[u].pc.close();}catch(x){}});G.st.getTracks().forEach(function(t){t.stop();});sb.rpc('room_leave',{p_id:G.id}).then(function(){},function(){});var o=$('gcV');if(o)o.remove();document.body.classList.remove('incall');}
var _renderChatRoom16=renderChatRoom;renderChatRoom=function(){_renderChatRoom16();var t=$('igTools');if(t&&!t.querySelector('.stkb'))t.insertAdjacentHTML('afterbegin','<button class="igicon igimg stkb" onclick="stkPick(\'chat\')" title="Stiker">☺</button>');msSchedBar();
 if(CHATgroup){var hd=document.querySelector('.igroom .ighead');if(hd&&!hd.querySelector('.gcb')){var x=hd.querySelector('button[onclick="chatStyleMenu()"]');var b='<button class="igicon gcb" onclick="gcallStart()" title="Qrup video zəngi">'+IGI.video+'</button>';if(x)x.insertAdjacentHTML('beforebegin',b);else hd.insertAdjacentHTML('beforeend',b);}
  var g=CHATother;run(sb.rpc('gcall_active',{p_group:g})).then(function(id){if(!id||g!==CHATother||$('gcBan'))return;var p=$('igPinned');if(p)p.insertAdjacentHTML('beforebegin','<div id="gcBan" onclick="gcallJoin(\''+id+'\')">📹 Qrup zəngi davam edir · <b>Qoşul</b></div>');}).catch(function(){});}};

/* ---------- 4. məxfilik · 14. sakit rejim · 13. fəaliyyət (menyular) ---------- */
var _pfMenu16=pfMenu;pfMenu=function(uid){_pfMenu16(uid);if(uid)return;var mb=$('mbox'),f=mb&&mb.querySelector('.igmenu');if(f)f.insertAdjacentHTML('beforebegin','<button class="igmenu" onclick="closeModal();actOpen()">⏱ Fəaliyyətin</button><button class="igmenu" onclick="closeModal();quietUI()">🔕 Sakit rejim</button><button class="igmenu" onclick="closeModal();privUI()">🔒 Məxfilik</button>');};
function privUI(){run(sb.rpc('soc_privacy')).then(function(p){p=p||{};modal('<div class="mhead"><h3>🔒 Məxfilik</h3><button class="x" onclick="closeModal()">×</button></div><label class="s3sw"><input type="checkbox" '+(p.hide_seen?'checked':'')+' onchange="privSet({p_hide_seen:this.checked})"><span></span>"Görüldü" bildirişini gizlət</label><p class="hint" style="margin-top:-4px">Mesajlarını oxuduğunu başqaları görməyəcək.</p><label class="s3sw"><input type="checkbox" '+(p.hide_online?'checked':'')+' onchange="privSet({p_hide_online:this.checked})"><span></span>"Aktivdir" statusunu gizlət</label><p class="hint" style="margin-top:-4px">Onlayn olduğun və son aktivlik vaxtın görünməyəcək.</p>');}).catch(err);}
function privSet(o){run(sb.rpc('soc_privacy_set',Object.assign({p_hide_seen:null,p_hide_online:null},o))).then(function(){toast('Yadda saxlanıldı');}).catch(err);}
function quietUI(){run(sb.rpc('soc_privacy')).then(function(p){p=p||{};var on=p.quiet_until;var bt=function(t,h){return '<button class="igmenu" onclick="quietGo('+h+')">'+t+'</button>';};
 modal('<div class="mhead"><h3>🔕 Sakit rejim</h3><button class="x" onclick="closeModal()">×</button></div>'+(on?'<div class="s3my">Aktivdir: '+new Date(on).toLocaleString('az-AZ',{timeZone:'Asia/Baku',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'-dək</div>':'')+'<p class="hint">Bildirişlər susur (zənglər xaric), sənə yazanlara bir dəfə avtomatik cavab gedir.</p><input id="qmM" maxlength="200" placeholder="Avtomatik cavab (istəyə görə)" value="'+esc(p.quiet_msg||'')+'" style="width:100%;margin-bottom:8px">'
  +bt('1 saat',1)+bt('3 saat',3)+bt('Səhər 09:00-a qədər',"'m'")+bt('1 gün',24)+(on?'<button class="igmenu" style="color:#ed4956" onclick="quietGo(0)">Söndür</button>':''));}).catch(err);}
function quietGo(h){var u=null;if(h==='m'){var t=new Date(Date.now()+(new Date().getHours()>=9?86400000:0)).toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).slice(0,10);u=new Date(t+'T09:00:00+04:00').toISOString();}else if(h)u=new Date(Date.now()+h*3600000).toISOString();
 run(sb.rpc('quiet_set',{p_until:u,p_msg:($('qmM')||{}).value||null})).then(function(){closeModal();toast(u?'🔕 Sakit rejim aktivdir':'Sakit rejim söndürüldü');}).catch(err);}
/* fəaliyyət izləmə */
var ACT={acc:0,lim:0,warned:''};try{ACT.lim=+localStorage.getItem('actlim')||0;}catch(e){}
setInterval(function(){if(document.visibilityState==='visible'&&typeof ME!=='undefined'&&ME)ACT.acc+=15;},15000);
setInterval(function(){if(!ACT.acc||typeof sb==='undefined'||!sb)return;var s=ACT.acc;ACT.acc=0;sb.rpc('act_ping',{p_secs:s}).then(function(){},function(){});actCheck();},120000);
function actCheck(){if(!ACT.lim)return;var d=new Date().toDateString();if(ACT.warned===d)return;run(sb.rpc('my_activity')).then(function(a){var t=(a.days||[]).slice(-1)[0];if(t&&t.s/60>=ACT.lim){ACT.warned=d;toast('⏱ Bu gün '+Math.round(t.s/60)+' dəq istifadə etdin — limitin '+ACT.lim+' dəq');}}).catch(function(){});}
function actOpen(){run(sb.rpc('my_activity')).then(function(a){var D=a.days||[],mx=Math.max.apply(null,D.map(function(x){return x.s;}).concat([60])),avg=Math.round(D.reduce(function(s,x){return s+x.s;},0)/7/60),W=['B','B.e','Ç.a','Ç','C.a','C','Ş'];
 (a.liked||[]).forEach(function(p){if(!FEED.some(function(y){return y.id===p.id;}))FEED.push(p);});
 pgPush(pgHead('⏱ Fəaliyyətin')+'<div class="pgc"><div class="acth"><small>Gündəlik orta</small><b>'+avg+' dəq</b><small>son 7 gün</small></div><div class="actb">'+D.map(function(x){var d=new Date(x.d+'T12:00:00');return '<div><i style="height:'+Math.max(3,Math.round(x.s*100/mx))+'%"></i><small>'+W[d.getDay()]+'</small><em>'+Math.round(x.s/60)+'</em></div>';}).join('')+'</div>'
  +'<div class="igsec">Gündəlik limit xatırlatması</div><div class="soseg s3sub">'+[[0,'Yox'],[30,'30 dəq'],[60,'1 saat'],[120,'2 saat']].map(function(o){return '<button class="'+(ACT.lim===o[0]?'on':'')+'" onclick="ACT.lim='+o[0]+';try{localStorage.setItem(\'actlim\','+o[0]+')}catch(e){};actOpen.re()">'+o[1]+'</button>';}).join('')+'</div>'
  +'<div class="insl">'+[['Bəyəndiklərin',a.likes],['Şərhlərin',a.comments],['Postların',a.posts],['Hekayələrin',a.stories],['Mesajların',a.msgs]].map(function(x){return '<div><span>'+x[0]+'</span><b>'+x[1]+'</b></div>';}).join('')+'</div><p class="hint">Son 7 gün</p>'
  +'<div class="igsec">Bəyəndiklərin</div><div id="pfGrid" class="pfgrid"></div><div class="igsec" style="margin-top:12px">Şərhlərin</div>'+((a.mycm||[]).map(function(c){return '<div class="igrow" onclick="postOpen(\''+c.post+'\')"><div class="igmeta"><div class="igname">'+esc(c.body.slice(0,80))+'</div><div class="iglast">'+chatAgo(c.at)+'</div></div></div>';}).join('')||'<p class="hint">Şərh yoxdur</p>')+'</div>','act');pfGrid(a.liked||[],'Hələ heç nə bəyənməmisən');}).catch(err);}
actOpen.re=function(){pgPop();setTimeout(actOpen,250);};

/* ---------- 5. brend stikerləri ---------- */
var STK=[['tb','Təbriklər!','🎉','#f97316','#ec4899'],['rz','Razıyam','👍','#22c55e','#16a34a'],['kf','Kofe?','☕','#92400e','#d97706'],['sg','Sağ ol!','🙏','#6366f1','#a855f7'],['sp','Super!','🔥','#ef4444','#f97316'],['ic','İclas','📅','#0ea5e9','#2563eb'],['gl','Gəlirəm','🏃','#14b8a6','#0ea5e9'],['lx','LUX ❤️','🏢','#b45309','#7c2d12'],['ug','Uğurlar','🍀','#16a34a','#65a30d'],['hz','Hazırdır','✅','#059669','#10b981'],['gz','Gözlə','⏳','#64748b','#334155'],['br','Bravo!','👏','#db2777','#9333ea']];
function stkSrc(id){var s=STK.find(function(x){return x[0]===id;});if(!s)return '';var svg='<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+s[3]+'"/><stop offset="1" stop-color="'+s[4]+'"/></linearGradient></defs><rect x="10" y="10" width="220" height="220" rx="56" fill="url(#g)" stroke="#fff" stroke-width="10"/><text x="120" y="122" font-size="92" text-anchor="middle" dominant-baseline="middle">'+s[2]+'</text><text x="120" y="196" font-size="30" font-weight="800" font-family="Inter,Arial,sans-serif" fill="#fff" text-anchor="middle">'+s[1].replace(/&/g,'&amp;')+'</text></svg>';return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);}
function stkPick(ctx){var d=ovl('<div class="mhead"><h3>Stikerlər</h3><button class="x" onclick="this.closest(\'.s3over\').remove()">×</button></div><div class="stkg">'+STK.map(function(s){return '<button data-s="'+s[0]+'"><img src="'+stkSrc(s[0])+'"></button>';}).join('')+'</div>');
 d.querySelectorAll('[data-s]').forEach(function(b){b.onclick=function(){d.remove();var id=b.dataset.s;if(ctx==='chat')chatSendRpc({kind:'sticker',body:id}).catch(err);else{var i=$('fcB');if(i){i.value='⟦st:'+id+'⟧';feedComment(window._cmPost);}}};});}
var _chatDraw16=chatDrawMsgs;chatDrawMsgs=function(rows){_chatDraw16(rows);(rows||[]).forEach(function(m){if(m.kind!=='sticker'||m.deleted)return;var b=$('msg'+m.id);if(!b)return;b.className='igm '+(m.mine?'mine':'their')+' strx';b.innerHTML='<img class="stkimg" src="'+stkSrc(m.body)+'">'+(m.reaction?'<span class="msgreact">'+esc(m.reaction)+'</span>':'');});
 (rows||[]).forEach(function(m){if(m.kind!=='auto')return;var b=$('msg'+m.id);if(b)b.classList.add('automsg');});};
var _chatLastTxt16=chatLastTxt;chatLastTxt=function(t){if(t.son_kind==='sticker')return (t.son_mine?'Sən: ':'')+'🏷 Stiker';return _chatLastTxt16(t);};
var _chatMsgPreview16=chatMsgPreview;chatMsgPreview=function(m){if(m&&m.kind==='sticker'&&!m.deleted)return '🏷 Stiker';return _chatMsgPreview16(m);};
var _socText16=socText;socText=function(t){return _socText16(t).replace(/⟦st:(\w+)⟧/g,function(a,id){return '<img class="cstk" src="'+stkSrc(id)+'">';});};
/* şərh pəncərəsinə stiker düyməsi + tərcümə */
var _feedComments16=feedComments;feedComments=function(id,keep){_feedComments16(id,keep);var n=0;(function go(){var bx=document.querySelector('#mbox .cm2box');if(!bx){if(n++<30)setTimeout(go,100);return;}if(!bx.querySelector('.stkc'))bx.insertAdjacentHTML('beforeend','<button class="stkc" onclick="stkPick(\'cm\')">☺</button>');
 document.querySelectorAll('#mbox .cm2').forEach(function(el){var t=el.querySelector('.cm2t'),f=el.querySelector('.cm2f');if(!t||!f||f.querySelector('.trl'))return;if(needsTr(t.textContent))f.insertAdjacentHTML('beforeend','<a class="trl" onclick="trEl(this)">Tərcüməyə bax</a>');});})();};

/* ---------- 6. "sonra xatırlat" ---------- */
var _chatMsgMenu16=chatMsgMenu;chatMsgMenu=function(id){_chatMsgMenu16(id);var c=$('igCtx');if(!c)return;var b=c.querySelector('[onclick*="chatSetReply"]');if(!b)return;var n=b.cloneNode(true);n.setAttribute('onclick','chatCtxClose();msgRemUI('+id+')');n.innerHTML=n.innerHTML.replace(/Cavab ver/,'Xatırlat').replace('↩︎','⏰');b.parentNode.appendChild(n);};
function msgRemUI(id){var d=ovl('<div class="cmq">Bu mesajı nə vaxt xatırladaq?</div><button class="igmenu" data-h="1">⏰ 1 saat sonra</button><button class="igmenu" data-h="3">⏰ 3 saat sonra</button><button class="igmenu" data-h="m">🌅 Sabah 09:00</button><button class="igmenu" data-h="x">Ləğv et</button>');
 d.querySelectorAll('[data-h]').forEach(function(b){b.onclick=function(){d.remove();var h=b.dataset.h;if(h==='x')return;var at=h==='m'?new Date(new Date(Date.now()+86400000).toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).slice(0,10)+'T09:00:00+04:00'):new Date(Date.now()+h*3600000);
  run(sb.rpc('msg_remind',{p_msg:id,p_at:at.toISOString()})).then(function(){toast('⏰ Xatırladılacaq: '+at.toLocaleString('az-AZ',{timeZone:'Asia/Baku',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}));}).catch(err);};});}

/* ---------- 7. kollaj · 8. kviz · 9. video çəkmə (hekayə) ---------- */
var _storyPick16=storyPick;storyPick=function(){_storyPick16();var g=document.querySelector('#mbox .stpk');if(g&&!g.querySelector('.clb'))g.insertAdjacentHTML('beforeend','<button class="clb" onclick="closeModal();collagePick()"><span>▦</span>Kollaj</button><button onclick="closeModal();vrecOpen()"><span>🎥</span>Video çək</button>');};
function collagePick(){var i=document.createElement('input');i.type='file';i.accept='image/*';i.multiple=true;i._ok=1;i.onchange=function(){var fs=Array.prototype.slice.call(i.files,0,4);if(fs.length<2){toast('Ən azı 2 şəkil seç');return;}collageMake(fs,0);};i.click();}
function collageMake(fs,variant){toast('Kollaj hazırlanır…');Promise.all(fs.map(function(f){return new Promise(function(r){var im=new Image();im.onload=function(){r(im);};im.onerror=function(){r(null);};im.src=URL.createObjectURL(f);});})).then(function(ims){ims=ims.filter(Boolean);var W=1080,H=1920,G=12,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);
 var cells,n=ims.length;if(n===2)cells=variant?[[0,0,W/2,H],[W/2,0,W/2,H]]:[[0,0,W,H/2],[0,H/2,W,H/2]];else if(n===3)cells=[[0,0,W,H/2],[0,H/2,W/2,H/2],[W/2,H/2,W/2,H/2]];else cells=[[0,0,W/2,H/2],[W/2,0,W/2,H/2],[0,H/2,W/2,H/2],[W/2,H/2,W/2,H/2]];
 cells.forEach(function(cl,k){var im=ims[k];if(!im)return;var cx=cl[0]+G,cy=cl[1]+G,cw=cl[2]-G*2,ch=cl[3]-G*2,s=Math.max(cw/im.naturalWidth,ch/im.naturalHeight);x.save();x.beginPath();if(x.roundRect)x.roundRect(cx,cy,cw,ch,24);else x.rect(cx,cy,cw,ch);x.clip();x.drawImage(im,cx+(cw-im.naturalWidth*s)/2,cy+(ch-im.naturalHeight*s)/2,im.naturalWidth*s,im.naturalHeight*s);x.restore();});
 c.toBlob(function(b){stEdit(new File([b],'kollaj.jpg',{type:'image/jpeg'}));if(n===2)setTimeout(function(){var t=document.querySelector('#stEd .sttop span');if(t)t.innerHTML='<button class="clsw" onclick="stEdClose();collageMake(window._clF,'+(variant?0:1)+')">⇄</button>';},100);window._clF=fs;},'image/jpeg',.9);});}
var _stStk16=stStk;stStk=function(){_stStk16();var p=document.querySelector('#stPanel .fptools');if(p&&!p.querySelector('.qzb'))p.insertAdjacentHTML('beforeend','<button class="btn ghost sm qzb" onclick="stQuiz()">🧠 Kviz</button>');};
function stQuiz(){$('stPanel').innerHTML='<div class="stpan"><input id="qzQ" placeholder="Sual" maxlength="80" style="font-size:1.05rem!important"><div class="qzo">'+[0,1,2,3].map(function(i){return '<label><input type="radio" name="qzk" value="'+i+'" '+(i?'':'checked')+'><input class="qzi" placeholder="Variant '+(i+1)+(i>1?' (istəyə görə)':'')+'" maxlength="40"></label>';}).join('')+'</div><small style="opacity:.7">Dairəni seç — düzgün cavab</small><button class="btn" onclick="stQuizOk()">Əlavə et</button></div>';}
function stQuizOk(){var q=$('qzQ').value.trim(),k=+(document.querySelector('input[name=qzk]:checked')||{value:0}).value,o=[],ok=-1;document.querySelectorAll('.qzi').forEach(function(x,i){var v=x.value.trim();if(v){if(i===k)ok=o.length;o.push(v);}});if(!q||o.length<2||ok<0){toast('Sual, ən azı 2 variant və düzgün cavab lazımdır');return;}_st.stk={type:'quiz',q:q,opts:o,ok:ok};$('stPanel').innerHTML='<div class="stchip">🧠 '+esc(q)+' <a onclick="_st.stk=null;this.parentNode.remove()">✕</a></div>';}
var _storyShow16=storyShow;storyShow=function(){_storyShow16();if(!_sv)return;var u=CHAT_STORIES[_sv.ui],it=u&&u.items[_sv.ii];if(!it||!it.st||it.st.type!=='quiz')return;var s=it.st;var old=document.querySelector('#igSV .svstk');if(old)old.remove();
 var d=document.createElement('div');d.className='svstk s15 qz';var draw=function(cnt){var tot=0;Object.keys(cnt||{}).forEach(function(k){tot+=cnt[k];});var done=it.ans!=null||u.me;
  d.innerHTML='<small class="aytl">KVİZ</small><b>'+esc(s.q)+'</b>'+s.opts.map(function(o,i){var c=cnt&&cnt[String(i)]||0,pc=tot?Math.round(c*100/tot):0,cls=done?(i===s.ok?'ok':(String(it.ans)===String(i)?'bad':'')):'';return '<button class="qzbt '+cls+'" data-i="'+i+'" '+(done?'disabled':'')+'><i style="width:'+(done?pc:0)+'%"></i><span>'+String.fromCharCode(65+i)+'</span>'+esc(o)+(done?'<em>'+pc+'%</em>':'')+'</button>';}).join('')+(u.me?'<small id="qzN">'+tot+' cavab</small>':'');
  d.querySelectorAll('.qzbt:not([disabled])').forEach(function(b){b.onclick=function(e){e.stopPropagation();it.ans=b.dataset.i;run(sb.rpc('story_answer',{p_id:it.id,p_answer:b.dataset.i})).then(function(r){draw(r);try{navigator.vibrate&&navigator.vibrate(+b.dataset.i===s.ok?20:[40,40,40]);}catch(x){}if(+b.dataset.i===s.ok&&typeof s4confetti==='function')s4confetti(900);}).catch(err);};});};
 draw(null);if(u.me||it.ans!=null)run(sb.rpc('story_results',{p_id:it.id})).then(function(l){var c={};(l||[]).forEach(function(x){c[x.a]=(c[x.a]||0)+1;});draw(c);}).catch(function(){});($('svStage')||$('igSV')).appendChild(d);};
/* video çəkmə */
var _vr=null;
function vrecOpen(){if(_vr)return;var o=document.createElement('div');o.id='vrec';o.innerHTML='<video autoplay playsinline muted></video><div class="vrtop"><button onclick="vrClose()">✕</button><span id="vrT"></span><button onclick="vrFlip()">⟲</button></div><div class="vrmode"><button class="on" data-m="n" onclick="vrMode(this)">Normal</button><button data-m="b" onclick="vrMode(this)">Bumeranq</button></div><div class="vrbot"><button class="vrsh" id="vrS"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46"/></svg></button><small id="vrH">Basıb saxla — çək</small></div>';document.body.appendChild(o);document.body.classList.add('incall');
 _vr={o:o,face:'environment',mode:'n'};vrCam();var s=$('vrS');s.addEventListener('pointerdown',function(e){e.preventDefault();if(_vr.mode==='b')vrBoom();else vrStart();});s.addEventListener('pointerup',function(){if(_vr&&_vr.mode==='n')vrStop();});s.addEventListener('pointerleave',function(){if(_vr&&_vr.mode==='n'&&_vr.rec)vrStop();});}
function vrCam(){var R=_vr;if(R.st)R.st.getTracks().forEach(function(t){t.stop();});navigator.mediaDevices.getUserMedia({video:{facingMode:R.face,width:{ideal:720},height:{ideal:1280}},audio:R.mode==='n'}).then(function(s){R.st=s;var v=R.o.querySelector('video');v.srcObject=s;v.classList.toggle('mir',R.face==='user');}).catch(function(e){toast(e&&e.name==='NotAllowedError'?'Kameraya icazə verin':'Kamera açılmadı');vrClose();});}
function vrFlip(){if(!_vr||_vr.rec)return;_vr.face=_vr.face==='user'?'environment':'user';vrCam();}
function vrMode(b){if(!_vr||_vr.rec)return;_vr.mode=b.dataset.m;Array.prototype.forEach.call(b.parentNode.children,function(x){x.classList.toggle('on',x===b);});$('vrH').textContent=_vr.mode==='b'?'Toxun — bumeranq':'Basıb saxla — çək';vrCam();}
function vrStart(){var R=_vr;if(!R||!R.st||R.rec)return;var mt=['video/mp4','video/webm;codecs=vp8,opus','video/webm'].find(function(t){try{return MediaRecorder.isTypeSupported(t);}catch(e){return false;}})||'';var r=new MediaRecorder(R.st,mt?{mimeType:mt,videoBitsPerSecond:2500000}:undefined),ch=[];r.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data);};r.start(250);
 R.rec={r:r,ch:ch,t0:Date.now(),mt:r.mimeType||mt||'video/webm'};R.o.classList.add('rec');var c=R.o.querySelector('circle');R.tk=setInterval(function(){var s=(Date.now()-R.rec.t0)/1000;$('vrT').textContent=s.toFixed(0)+' / 15';if(c)c.style.strokeDashoffset=(289*(1-Math.min(1,s/15))).toFixed(1);if(s>=15)vrStop();},100);}
function vrStop(){var R=_vr;if(!R||!R.rec)return;var rec=R.rec;R.rec=null;clearInterval(R.tk);R.o.classList.remove('rec');var dur=(Date.now()-rec.t0)/1000;rec.r.onstop=function(){if(dur<.8){toast('Basıb saxla');return;}var b=new Blob(rec.ch,{type:rec.mt.split(';')[0]});var f=new File([b],'video.'+(/mp4/.test(rec.mt)?'mp4':'webm'),{type:b.type});vrClose();stEdit(f);};try{rec.r.stop();}catch(e){}}
function vrBoom(){var R=_vr;if(!R||!R.st||R.rec)return;var v=R.o.querySelector('video'),w=v.videoWidth||720,h=v.videoHeight||1280,sc=Math.min(1,720/Math.max(w,h)),cw=Math.round(w*sc),chh=Math.round(h*sc),frames=[],n=0;R.rec={boom:1};R.o.classList.add('rec');$('vrH').textContent='Çəkilir…';
 var mir=R.face==='user';var grab=setInterval(function(){var c=document.createElement('canvas');c.width=cw;c.height=chh;var x=c.getContext('2d');if(mir){x.translate(cw,0);x.scale(-1,1);}x.drawImage(v,0,0,cw,chh);frames.push(c);if(++n>=24){clearInterval(grab);boomEncode(frames,cw,chh);}},50);}
function boomEncode(frames,w,h){var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d'),st=c.captureStream(30),mt=['video/webm;codecs=vp8','video/webm','video/mp4'].find(function(t){try{return MediaRecorder.isTypeSupported(t);}catch(e){return false;}})||'',r=new MediaRecorder(st,mt?{mimeType:mt,videoBitsPerSecond:2500000}:undefined),ch=[];
 r.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data);};var seq=[];for(var k=0;k<3;k++){seq=seq.concat(frames,frames.slice().reverse());}var i=0;$('vrH').textContent='Hazırlanır…';x.drawImage(frames[0],0,0);r.start(200);
 var t=setInterval(function(){if(i>=seq.length){clearInterval(t);r.onstop=function(){var b=new Blob(ch,{type:(r.mimeType||mt||'video/webm').split(';')[0]});vrClose();stEdit(new File([b],'bumeranq.webm',{type:b.type}));};r.stop();return;}x.drawImage(seq[i++],0,0);},33);}
function vrClose(){var R=_vr;if(!R)return;_vr=null;clearInterval(R.tk);if(R.st)R.st.getTracks().forEach(function(t){t.stop();});R.o.remove();document.body.classList.remove('incall');}

/* ---------- 10. hekayə xatirələri ---------- */
var _s3allExtras16=s3allExtras;s3allExtras=function(){_s3allExtras16();setTimeout(function(){var x=$('soX3');if(!x||FMODE!=='all'||$('stMem'))return;run(sb.rpc('story_memories')).then(function(l){l=l||[];if(!l.length||$('stMem'))return;window._stm=l;var s=l[0];x.insertAdjacentHTML('beforeend','<div id="stMem" class="s3mem" onclick="stMemOpen(0)"><span>📸 Hekayə xatirəsi · '+esc(s.ago)+'</span>'+(s.kind==='video'?'<video src="'+esc(s.url)+'#t=0.1" muted style="width:56px;height:56px;border-radius:10px;object-fit:cover"></video>':'<img src="'+esc(s.url)+'">')+'<div><b>Bu gün paylaşmışdın</b><p>Yenidən paylaşmaq istəyirsən?</p></div></div>');}).catch(function(){});},600);};
function stMemOpen(i){var s=(window._stm||[])[i];if(!s)return;modal('<div class="mhead"><h3>📸 '+esc(s.ago)+'</h3><button class="x" onclick="closeModal()">×</button></div><div style="border-radius:14px;overflow:hidden;background:#000;display:flex;justify-content:center">'+(s.kind==='video'?'<video src="'+esc(s.url)+'" style="max-height:55vh;max-width:100%" autoplay muted loop playsinline></video>':'<img src="'+esc(s.url)+'" style="max-height:55vh;max-width:100%">')+'</div><button class="btn" style="width:100%;margin-top:10px" onclick="stMemShare('+i+',this)">Hekayədə yenidən paylaş</button>');}
function stMemShare(i,b){var s=window._stm[i];b.disabled=true;run(sb.rpc('story_add3',{p_url:s.url,p_kind:s.kind,p_caption:'📸 '+s.ago,p_sticker:null,p_audience:'all'})).then(function(){closeModal();toast('Hekayən paylaşıldı');storyLoad();var m=$('stMem');if(m)m.remove();}).catch(function(e){b.disabled=false;err(e);});}

/* ---------- 11. tərcümə ---------- */
var TRC={};
function needsTr(t){t=(t||'').replace(/[#@][^\s]+/g,'').replace(/https?:\/\/\S+/g,'').trim();if(t.length<18)return false;if(/[а-яё]/i.test(t))return true;if(/[əƏ]/.test(t))return false;var lat=(t.match(/[a-zçğıöşü]/gi)||[]).length;return lat>t.length*.5&&/\b(the|and|is|you|for|bir|ve|için|çok|güzel|teşekkür|this|with|have)\b/i.test(t);}
function trText(t){if(TRC[t])return Promise.resolve(TRC[t]);return sb.functions.invoke('soc-ai',{body:{op:'translate',text:t}}).then(function(r){var d=r.data||{};if(r.error||d.error)throw new Error(d.error||'Alınmadı');TRC[t]=d.text;return d.text;});}
function trEl(a){var box=a.closest('.cm2,.igpost');var src=box&&(box.querySelector('.cm2t')||box.querySelector('.igcap')||box.querySelector('.igbig'));if(!src)return;var ex=box.querySelector('.trout');if(ex){ex.remove();a.textContent='Tərcüməyə bax';return;}
 a.textContent='Tərcümə edilir…';var t=src.textContent.trim();trText(t).then(function(r){src.insertAdjacentHTML('afterend','<div class="trout">'+esc(r)+'<small>AI tərcüməsi</small></div>');a.textContent='Orijinalı göstər';}).catch(function(e){a.textContent='Tərcüməyə bax';toast(e.message||'Alınmadı');});}
var _postCard16=_postCard0;_postCard0=function(p){var h=_postCard16(p);if(p.body&&needsTr(p.body)){var i=h.indexOf('<div class="igwhen">');if(i>=0)h=h.slice(0,i)+'<a class="igtr" onclick="trEl(this)">Tərcüməyə bax</a>'+h.slice(i);}return h;};

/* ---------- 12. kolleksiyalar ---------- */
var _postSave16=postSave;postSave=function(id,on){_postSave16(id,on);if(on)setTimeout(function(){collSheet(id);},350);};
function collSheet(pid){run(sb.rpc('coll_list')).then(function(l){l=l||[];var d=ovl('<div class="cmq">🔖 Saxlanıldı · kolleksiyaya əlavə et</div><div class="colg">'+l.map(function(c){return '<button data-c="'+c.id+'">'+(c.cover?'<img src="'+esc(c.cover)+'">':'<span>🔖</span>')+'<small>'+esc(c.name)+'</small></button>';}).join('')+'<button data-new="1"><span>＋</span><small>Yeni kolleksiya</small></button></div>');
 d.querySelectorAll('[data-c]').forEach(function(b){b.onclick=function(){d.remove();run(sb.rpc('save_to_coll',{p_post:pid,p_coll:b.dataset.c})).then(function(){toast('Kolleksiyaya əlavə edildi');}).catch(err);};});
 d.querySelector('[data-new]').onclick=function(){var n=prompt('Kolleksiyanın adı (məs. İlham)');if(!n)return;d.remove();run(sb.rpc('coll_create',{p_name:n})).then(function(cid){return run(sb.rpc('save_to_coll',{p_post:pid,p_coll:cid}));}).then(function(){toast('"'+n+'" kolleksiyasına əlavə edildi');}).catch(err);};}).catch(function(){});}
var _feedMode16=feedMode;feedMode=function(m,a){_feedMode16(m,a);if(m!=='saved')return;var h=document.querySelector('#soBody .sohdr');if(!h)return;run(sb.rpc('coll_list')).then(function(l){l=l||[];if(FMODE!=='saved'||$('collBar'))return;
 h.insertAdjacentHTML('afterend','<div id="collBar" class="soseg s3sub"><button class="'+(!FARG?'on':'')+'" onclick="FARG=null;FEED=[];feedMode(\'saved\')">Hamısı</button>'+l.map(function(c){return '<button class="'+(FARG===c.id?'on':'')+'" onclick="feedMode(\'saved\',\''+c.id+'\')">'+esc(c.name)+' '+c.n+'</button>';}).join('')+'<button onclick="var n=prompt(\'Kolleksiyanın adı\');if(n)run(sb.rpc(\'coll_create\',{p_name:n})).then(function(){feedMode(\'saved\')})">＋ Yeni</button></div>');}).catch(function(){});};

/* ---------- 15. profil əlaqə düymələri + sakit rejim nişanı ---------- */
var _socProfile16=socProfile;socProfile=function(uid){_socProfile16(uid);if(!uid||uid==='undefined'||uid===ME.user_id)return;var n=0;(function go(){var t=pgTop(),bt=t&&t.dataset.key==='prof:'+uid&&t.querySelector('.pfbt');if(!bt){if(n++<50)setTimeout(go,100);return;}if(t.querySelector('.pfct'))return;
 run(sb.rpc('soc_contact',{p_uid:uid})).then(function(c){if(!c||t.querySelector('.pfct'))return;var ph=(c.phone||'').replace(/\D/g,''),wa=ph?(ph.length===9?'994'+ph:ph.charAt(0)==='0'?'994'+ph.slice(1):ph):'';var h='<div class="pfct">'+(ph?'<a href="tel:+'+wa+'">📞 Zəng</a><a href="https://wa.me/'+wa+'" target="_blank" rel="noopener">💬 WhatsApp</a>':'')+(c.email?'<a href="mailto:'+esc(c.email)+'">✉️ E-poçt</a>':'')+'</div>';
  if(c.quiet)h='<div class="pfq">🔕 Sakit rejimdədir · '+new Date(c.quiet).toLocaleString('az-AZ',{timeZone:'Asia/Baku',hour:'2-digit',minute:'2-digit'})+'-dək</div>'+h;bt.insertAdjacentHTML('afterend',h);}).catch(function(){});})();};

/* ---------- başlanğıc, dərin linklər, geri ---------- */
(function(){var go=function(){if(typeof ME==='undefined'||!ME||!sb){setTimeout(go,1200);return;}cpinsLoad().then(function(){if(typeof CHAT_THREADS!=='undefined'&&CHAT_THREADS&&CHAT_THREADS.length&&$('chatThreads')&&!CHATother)chatDrawThreads(CHAT_THREADS);});
 var q=new URLSearchParams(location.search),g=q.get('gcall');if(g){try{history.replaceState(history.state,'',location.pathname);}catch(e){}setTimeout(function(){gcallJoin(g);},1000);}};setTimeout(go,1600);})();
var _backAct17=backAct;backAct=function(){if($('gcV')){gcLeave();return true;}if($('vrec')){vrClose();return true;}return _backAct17();};

;

/* ---- Səhifələrdə (profil, post, kanal…) yuxarıdan aşağı çəkib yenilə ---- */
function pgRefresh(pg){var k=pg.dataset.key||'',v=k.split(':')[1];
 if(/^prof:/.test(k)){if(typeof storyLoad==='function')storyLoad();socProfile(v);}
 else if(/^post:/.test(k))run(sb.rpc('post_get',{p_id:v})).then(function(p){var c=pg.querySelector('.pgc');if(!p||!c)return;var i=FEED.findIndex(function(x){return x.id===p.id;});if(i>=0)FEED[i]=p;else FEED.push(p);c.innerHTML=postCard(p);if(typeof igAutoplay==='function')igAutoplay();}).catch(err);
 else if(/^ch:/.test(k))chLoad(v);
 else if(k==='act')actOpen.re();
 else if(k==='archive'){pgPop();setTimeout(archiveOpen,250);}
 else if(k==='moment'){pgPop();setTimeout(momOpen,250);}}
(function(){var S=null,ind=null;
 document.addEventListener('touchstart',function(e){S=null;var pg=e.target.closest&&e.target.closest('.pg.on');if(!pg||pg!==pgTop()||pg.scrollTop>0||e.touches.length>1||$('modal').classList.contains('on'))return;S={pg:pg,y:e.touches[0].clientY,x:e.touches[0].clientX,d:0};},{passive:true});
 document.addEventListener('touchmove',function(e){if(!S)return;var dy=e.touches[0].clientY-S.y,dx=e.touches[0].clientX-S.x;if(S.pg.scrollTop>0||Math.abs(dx)>Math.abs(dy)){if(ind){ind.remove();ind=null;}S=null;return;}S.d=dy;
  if(dy<=0){if(ind){ind.remove();ind=null;}return;}if(!ind){ind=document.createElement('div');ind.className='ptr';ind.innerHTML='<span class="spin"></span>';document.body.appendChild(ind);}
  var d=Math.min(110,dy*.5);ind.style.transform='translate(-50%,'+(d+40)+'px) rotate('+(dy*2)+'deg)';ind.style.opacity=Math.min(1,dy/130);var c=S.pg.querySelector('.pgc');if(c){c.style.transition='none';c.style.transform='translateY('+Math.min(70,dy*.35)+'px)';}},{passive:true});
 document.addEventListener('touchend',function(){if(!S)return;var s=S;S=null;var c=s.pg.querySelector('.pgc');if(c){c.style.transition='transform .25s ease';c.style.transform='';}var go=s.d>120;
  if(ind){var i=ind;ind=null;if(go){i.style.transform='translate(-50%,90px)';i.style.opacity='1';setTimeout(function(){i.remove();},900);}else i.remove();}
  if(go){try{navigator.vibrate&&navigator.vibrate(10);}catch(x){}pgRefresh(s.pg);}},{passive:true});})();

;

/* ---- Nişanlar: profildə gizli, səviyyə yazısına toxunanda açılır ---- */
var BDESC={first_post:'İlk postunu paylaşdığın üçün',creator:'Çoxlu post paylaşan yaradıcı',kudos5:'5 və daha çox təşəkkür aldığın üçün',punctual:'İşə mütəmadi vaxtında gəldiyin üçün',year1:'Komandada 1 ili tamamladığın üçün',popular:'Postların çox reaksiya topladığı üçün',streak7:'7 gün ardıcıl seriya',streak30:'30 gün ardıcıl seriya',streak100:'100 gün ardıcıl seriya'};
function bdDesc(c){if(BDESC[c])return BDESC[c];if(/^eom_/.test(c))return 'Komandanın səsverməsi ilə ayın işçisi seçildin';if(/^chal_/.test(c))return 'Çağırışda qalib oldun';if(/^quiz_/.test(c))return 'Canlı viktorinada 1-ci yer';if(/^league_/.test(c))return 'Şöbən həftənin liqa qalibi oldu';if(/^star_/.test(c))return 'Ayın ulduzu seçildin';return '';}
var _socProfile21=socProfile;socProfile=function(uid){_socProfile21(uid);if(!uid||uid==='undefined')return;var n=0;(function go(){var t=pgTop(),lv=t&&t.dataset.key==='prof:'+uid&&t.querySelector('.pflv');if(!lv||!window._prof){if(n++<50)setTimeout(go,100);return;}
 var bd=t.querySelector('.pfbd');if(bd)bd.remove();if(lv.dataset.b)return;lv.dataset.b=1;var c=(window._prof.badges||[]).length;if(c)lv.insertAdjacentHTML('beforeend',' · 🏅'+c);lv.style.cursor='pointer';lv.onclick=function(e){e.stopPropagation();bdOpen(uid);};})();};
function bdOpen(uid){var p=window._prof||{},b=p.badges||[],me=uid===ME.user_id,LN=['Yeni','Fəal','Təcrübəli','Ulduz','Əfsanə'],lv=(typeof LVL!=='undefined'&&LVL[uid])||0;
 modal('<div class="mhead"><h3>🏅 Nişanlar və səviyyə</h3><button class="x" onclick="closeModal()">×</button></div>'
  +'<div class="bdlv" style="--lc:'+(typeof LVLC!=='undefined'?LVLC[lv]:'#94a3b8')+'"><b>'+(lv+1)+'</b><div><strong>'+LN[lv]+'</strong><small>Səviyyə xal toplandıqca artır: post, şərh, təşəkkür, vaxtında gəliş, oyunlar</small></div>'+(me?'<button class="btn sm ghost" onclick="closeModal();show(\'feed\');feedMode(\'shop\')">Xallarım</button>':'')+'</div>'
  +(b.length?'<div class="bdg">'+b.map(function(c){var i=badgeInfo(c);return '<div class="bdc"><span>'+i[0]+'</span><b>'+esc(i[1])+'</b><small>'+esc(bdDesc(c))+'</small></div>';}).join('')+'</div>'
   :'<div class="pfempty">'+(me?'Hələ nişanın yoxdur.<br><small>İlk postunu paylaş, vaxtında gəl, çağırışlara qatıl — nişanlar avtomatik gələcək.</small>':'Hələ nişan yoxdur')+'</div>'));}

;

/* ---- Lent təmizliyi: postlar dərhal görünsün (IG kimi) ---- */
function tdCards(){var x=$('soX3');if(!x||FMODE!=='all')return;var st=$('tdStrip');if(!st){x.insertAdjacentHTML('beforebegin','<div id="tdStrip" class="tds"></div>');st=$('tdStrip');}var c=[],I=function(n){return typeof uiIcon==='function'?uiIcon(n):'';};
 var mb=$('momB');if(mb){var hot=mb.classList.contains('hot'),ok=mb.classList.contains('ok');c.push({cls:'mom'+(hot?' hot':''),ic:I('zap'),t:hot?'Ofis anı!':ok?'Ofis anları':'Ofis anı',s:hot?'2 dəqiqən var':(mb.querySelector('small')||{}).textContent||'',fn:hot||!ok?'momCapture()':'momOpen()'});}
 var wb=$('s4W');if(wb)c.push({cls:'wr',ic:I('chart'),t:'Ayın xülasən',s:'Bax və paylaş',fn:(wb.getAttribute('onclick')||'')});
 var smo=document.querySelector('#soMoment .somoment');if(smo){var im=smo.querySelector('.smth img'),vd=smo.querySelector('.smth video'),nm=(smo.querySelector('.smtx b')||{}).textContent||'',ms=(smo.querySelector('.smtx small')||{}).textContent||'';c.push({cls:'mo'+(im?' img':''),ic:vd?I('video'):I('spark'),t:'Həftənin anı',s:nm+' · '+ms.split('·')[0].trim(),fn:smo.getAttribute('onclick')||'',bg:im?im.getAttribute('src'):null});}
 var q=$('s3Q');if(q){var my=!!q.querySelector('.s3my');c.push({cls:'qt',ic:I('msq'),t:'Günün sualı',s:my?'Cavablara bax':'Cavab ver',fn:"tdOpen('s3Q','💭 Günün sualı')"});}
 var an=x.querySelectorAll('.s3ann');if(an.length)c.push({cls:'an',ic:I('mega'),t:an.length+' yeni elan',s:(an[0].querySelector('b')||{}).textContent||'',fn:"tdOpen('.s3ann','📢 Elanlar',1)"});
 var ob=x.querySelector('.s3onb');if(ob){var pr=(ob.querySelector('small')||{}).textContent||'';c.push({cls:'ob',ic:I('userplus'),t:'İlk addımlar',s:pr+' tamamlandı',fn:"tdOpen('.s3onb','👋 İlk addımlar')"});}
 x.querySelectorAll('.s3mem').forEach(function(m){c.push({cls:'me',ic:I('clock'),t:'Xatirə',s:(m.querySelector('span')||{}).textContent.replace(/^[^·]*·\s*/,'')||'',fn:m.getAttribute('onclick')||''});});
 var html=c.map(function(k){return '<button class="tdc '+k.cls+'"'+(k.bg?' style="background-image:linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.65)),url(\''+k.bg+'\')"':'')+' onclick="'+k.fn.replace(/"/g,'&quot;')+'"><span>'+k.ic+'</span><b>'+esc(k.t)+'</b><small>'+esc(k.s)+'</small></button>';}).join('');if(st._h!==html){st._h=html;st.innerHTML=html;}var dsp=c.length?'':'none';if(st.style.display!==dsp)st.style.display=dsp;}
function tdOpen(sel,title,all){var x=$('soX3');if(!x)return;var nodes=all?Array.prototype.slice.call(x.querySelectorAll(sel)):[x.querySelector(sel.charAt(0)==='.'||sel.charAt(0)==='#'?sel:'#'+sel)];nodes=nodes.filter(Boolean);if(!nodes.length)return;
 modal('<div class="mhead"><h3>'+title+'</h3><button class="x" onclick="closeModal()">×</button></div><div id="tdBox"></div>');var b=$('tdBox');nodes.forEach(function(n){n._home=n.parentNode;b.appendChild(n);});window._tdNodes=nodes;}
var _closeModal22=closeModal;closeModal=function(){var ns=window._tdNodes;if(ns){window._tdNodes=null;ns.forEach(function(n){if(n._home&&n._home.isConnected)n._home.appendChild(n);});setTimeout(tdCards,50);}_closeModal22();};
(function(){var t=null,mo=new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){if(!window._tdNodes)tdCards();},150);});var bind=function(){var x=$('soX3');if(x&&!x._tdo){x._tdo=1;mo.observe(x,{childList:true,subtree:true});}var w=$('s4W');if(w&&!w._tdo){w._tdo=1;tdCards();}};setInterval(bind,1500);})();
/* başlıq: + yarat, saxlanılanlar ikonu menyuya */
var _renderFeed22=renderFeed;renderFeed=function(){_renderFeed22();var hd=document.querySelector('#v-feed .sohead');if(!hd)return;var bm=hd.querySelector('button[onclick*="saved"]');if(bm)bm.remove();
 if(!hd.querySelector('.addb'))hd.insertAdjacentHTML('afterbegin','<button class="igicon addb" onclick="feedCompose()" title="Yeni post">'+igSvg('<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>')+'</button>');};
/* reytinq lövhələri Komandaya köçür */
var _s4team22=s4team;s4team=function(){_s4team22();var b=$('s4Team');if(b&&!$('igBoards')){b.insertAdjacentHTML('afterend','<div class="igboards" id="igBoards"></div>');if(typeof feedBoards==='function')feedBoards();}};
var _chatLastTxt22=chatLastTxt;chatLastTxt=function(t){if(t.son_kind==='vcircle')return (t.son_mine?'Sən: ':'')+'Video mesaj';return _chatLastTxt22(t);};

;

/* ---- Sürət və bug düzəlişləri ---- */
/* Şərhlər dərhal açılsın (skelet + keş) */
var CMC={};var _feedComments30=feedComments;
feedComments=function(id,keep){if(!keep&&!$('modal').classList.contains('on')){var P=FEED.find(function(x){return x.id===id;})||{};
  modal('<div class="cm2top">Şərhlər</div><div class="cmlist">'+(CMC[id]||'<div class="cmsk">'+[1,2,3].map(function(){return '<div><i></i><span><b></b><b></b></span></div>';}).join('')+'</div>')+'</div>');$('mbox').classList.add('cmsheet');}
 _feedComments30(id,keep);var n=0;(function sv(){var l=document.querySelector('#mbox .cm2')?document.querySelector('#mbox .cmlist'):null;if(!l){if(n++<40)setTimeout(sv,100);return;}CMC[id]=l.innerHTML;})();};
/* Reels: tək toxunuş/iki toxunuş, yalnız görünən video yüklənsin */
var _reelsTab30=reelsTab;reelsTab=function(){_reelsTab30();var n=0;(function go(){var w=$('rlW');if(!w||!w.querySelector('section')){if(n++<60)setTimeout(go,100);return;}
 w.querySelectorAll('section video').forEach(function(v,i){v.preload=i<2?'auto':'none';v.setAttribute('playsinline','');v.muted=true;});
 w.addEventListener('scroll',function(){var h=w.clientHeight,i=Math.round(w.scrollTop/h);w.querySelectorAll('section video').forEach(function(v,k){if(Math.abs(k-i)<=1&&v.preload!=='auto')v.preload='auto';});},{passive:true});})();};
/* Saat yalnız görünəndə yenilənsin */
var _tick30=tick;tick=function(){if(document.visibilityState!=='visible')return;var t=$('v-today');if(t&&!t.classList.contains('on')&&!document.body.classList.contains('owner'))return;_tick30();};

;

/* ---- Video sıxma (720p, ~1.8 Mbit/s) yükləmədən əvvəl ---- */
var VC_MIN=6*1024*1024;
function vidCompress(file,onp){return new Promise(function(res){
 if(!/^video\//.test(file.type)||file.size<(window._vcMin||VC_MIN)||!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)return res(file);
 var url=URL.createObjectURL(file),v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=url;var done=false,fin=function(f){if(done)return;done=true;try{v.pause();}catch(e){}URL.revokeObjectURL(url);res(f||file);};
 v.onerror=function(){fin();};setTimeout(function(){if(!v.duration)fin();},8000);
 var started=false;v.onloadedmetadata=function(){if(v.duration===Infinity){v.ondurationchange=function(){if(isFinite(v.duration)&&!started){v.ondurationchange=null;v.currentTime=0;v.onseeked=function(){v.onseeked=null;go();};}};v.currentTime=1e9;return;}go();};
 var go=function(){if(started)return;started=true;var d=v.duration;if(!d||!isFinite(d)||d>300){fin();return;}var w=v.videoWidth,h=v.videoHeight,s=Math.min(1,1280/Math.max(w,h)),cw=Math.round(w*s/2)*2,ch=Math.round(h*s/2)*2;
  var c=document.createElement('canvas');c.width=cw;c.height=ch;var x=c.getContext('2d'),st=c.captureStream(30);
  try{var vs=(v.captureStream||v.mozCaptureStream).call(v);vs.getAudioTracks().forEach(function(t){st.addTrack(t);});}catch(e){}
  var mt=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(function(t){try{return MediaRecorder.isTypeSupported(t);}catch(e){return false;}});if(!mt){fin();return;}
  var rec;try{rec=new MediaRecorder(st,{mimeType:mt,videoBitsPerSecond:1800000,audioBitsPerSecond:96000});}catch(e){fin();return;}var chunks=[];rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
  rec.onstop=function(){var b=new Blob(chunks,{type:mt.split(';')[0]});if(b.size<file.size*0.9&&b.size>10000)fin(new File([b],(file.name||'video').replace(/\.\w+$/,'')+(/mp4/.test(mt)?'.mp4':'.webm'),{type:b.type}));else fin();};
  var draw=function(){if(done||v.ended||v.paused&&v.currentTime>0)return;x.drawImage(v,0,0,cw,ch);onp&&onp(Math.min(1,v.currentTime/d));if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(draw);else requestAnimationFrame(draw);};
  v.onended=function(){setTimeout(function(){try{rec.stop();}catch(e){fin();}},150);};
  x.drawImage(v,0,0,cw,ch);rec.start(500);v.play().then(function(){if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(draw);else requestAnimationFrame(draw);}).catch(function(){try{rec.stop();}catch(e){}fin();});
  setTimeout(function(){if(!done){try{rec.stop();}catch(e){fin();}}},(d+20)*1000);};});}
function vcLabel(p){var l=$('upL'),s=$('upS'),e=$('upP');if(l)l.textContent='Video sıxılır…';if(s)s.style.width=Math.max(3,Math.round(p*45))+'%';if(e)e.textContent=Math.round(p*100)+'%';}
var _upXhr40=upXhr;upXhr=function(file,prefix,onp){if(!/^video\//.test(file.type))return _upXhr40(file,prefix,onp);
 return vidCompress(file,vcLabel).then(function(f){var l=$('upL');if(l)l.textContent=prefix==='story'?'Hekayən paylaşılır…':'Paylaşılır…';return _upXhr40(f,prefix,function(a,t){var s=$('upS'),e=$('upP');var p=45+55*a/(t||1);if(s)s.style.width=p+'%';if(e)e.textContent=Math.round(p)+'%';});});};
/* çatda video fayl */
var _chatUpload40=chatUpload;chatUpload=function(file,prefix){if(!/^video\//.test(file.type)||prefix==='vcircle'||file.size<VC_MIN)return _chatUpload40(file,prefix);var last=0;
 return vidCompress(file,function(p){var n=Math.round(p*100);if(n-last>=20){last=n;toast('🎬 Video sıxılır… '+n+'%');}}).then(function(f){return _chatUpload40(f,prefix);});};

;

/* ---- Reels: saxla düyməsi dərhal ---- */
function reelSave(id,b){var p=FEED.find(function(x){return x.id===id;});if(!p)return;var on=!p.saved;p.saved=on;b.innerHTML=igSvg(IGP.bm,on?'#fff':'none');b.classList.toggle('on',on);try{navigator.vibrate&&navigator.vibrate(10);}catch(e){}
 var t=document.createElement('div');t.className='rltoast';t.textContent=on?'🔖 Saxlanıldı':'Saxlanılanlardan çıxarıldı';(b.closest('section')||document.body).appendChild(t);setTimeout(function(){t.remove();},1300);
 sb.rpc('post_save',{p_id:id,p_on:on}).then(function(r){if(r.error){p.saved=!on;b.innerHTML=igSvg(IGP.bm,!on?'#fff':'none');toast('Alınmadı');}else if(on&&typeof collSheet==='function')setTimeout(function(){collSheet(id);},700);},function(){p.saved=!on;b.innerHTML=igSvg(IGP.bm,!on?'#fff':'none');});}
var _reelsTab41=reelsTab;reelsTab=function(){_reelsTab41();var n=0;(function go(){var w=$('rlW');if(!w||!w.querySelector('section')){if(n++<60)setTimeout(go,100);return;}
 w.querySelectorAll('.rlside button[onclick^="postSave"]').forEach(function(b){var id=b.closest('section').dataset.id;b.removeAttribute('onclick');b.onclick=function(e){e.stopPropagation();reelSave(id,b);};});})();};

;

/* ---- "Həftənin anı": video postda da önizləmə ---- */
momentLoad=function(){run(sb.rpc('soc_explore')).then(function(x){var el=$('soMoment');if(!el||!x||!x.moment||!(x.moment.likes>0))return;var p=x.moment,m=p.media&&p.media[0],src=m?m.url:p.image,vid=m&&m.kind==='video';
 if(!FEED.some(function(y){return y.id===p.id;}))FEED.push(p);
 var th=src?(vid?'<div class="smth"><video src="'+esc(src)+'#t=0.1" muted playsinline preload="metadata"></video><i>▶</i></div>':'<div class="smth"><img src="'+esc(src)+'" onerror="this.parentNode.style.display=\'none\'"></div>'):'';
 el.innerHTML='<div class="somoment" onclick="postOpen(\''+p.id+'\')"><span>✨ Həftənin anı</span>'+th+'<div class="smtx"><b>'+esc(p.author&&p.author.ad||'')+'</b>'+(p.body?'<p>'+esc(p.body.slice(0,90))+'</p>':'')+'<small>'+(p.likes||0)+' reaksiya · '+(p.comments||0)+' şərh</small></div></div>';if(typeof tdCards==='function')setTimeout(tdCards,50);}).catch(function(){});};

;


/* ---- performans: video posteri ---- */
function vidPoster(file){return new Promise(function(res){var u=URL.createObjectURL(file),v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=u;var done=function(b){URL.revokeObjectURL(u);res(b||null);};setTimeout(function(){done(null);},6000);
 v.onloadeddata=function(){try{v.currentTime=Math.min(.3,(v.duration||1)/4);}catch(e){done(null);}};v.onseeked=function(){try{var s=Math.min(1,720/Math.max(v.videoWidth,v.videoHeight)),c=document.createElement('canvas');c.width=Math.round(v.videoWidth*s);c.height=Math.round(v.videoHeight*s);c.getContext('2d').drawImage(v,0,0,c.width,c.height);c.toBlob(function(b){done(b);},'image/jpeg',.75);}catch(e){done(null);}};v.onerror=function(){done(null);};});}
var _postCard50=_postCard0;_postCard0=function(p){var h=_postCard50(p);(p.media||[]).forEach(function(m){if(m.kind==='video'&&m.poster)h=h.split('src="'+esc(m.url)+'"').join('src="'+esc(m.url)+'" poster="'+esc(m.poster)+'"');});return h;};
var _reelsTab50=reelsTab;reelsTab=function(){_reelsTab50();var n=0;(function go(){var w=$('rlW');if(!w||!w.querySelector('section')){if(n++<60)setTimeout(go,100);return;}w.querySelectorAll('section').forEach(function(s){var p=FEED.find(function(x){return x.id===s.dataset.id;}),m=p&&(p.media||[]).find(function(x){return x.kind==='video';}),v=s.querySelector('video');if(v&&m&&m.poster)v.poster=m.poster;});})();};

;


/* ---- Sorğu planlayıcısı: vacib sorğular (çat, lent) birinci, ikinci dərəcəlilər növbə ilə ---- */
(function(){var LOW={verified_list:1,live_list:1,chat_pins:1,story_memories:1,soc_explore:1,ann_feed:1,onb_state:1,qotd_today:1,soc_memories:1,moment_state:1,rep_count:1,act_ping:1,post_seen:1};
 var hi=0,lo=0,q=[],MAXLO=2;
 var pump=function(){while(q.length&&lo<MAXLO&&(hi===0||Date.now()-q[0].t>2500)){var j=q.shift();lo++;j.go();}};
 var wrap=function(){if(typeof sb==='undefined'||!sb||!sb.rpc||sb._rq){setTimeout(wrap,300);return;}sb._rq=1;var orig=sb.rpc.bind(sb);
  sb.rpc=function(n,a,o){if(!LOW[n]){hi++;var pr=orig(n,a,o);return Promise.resolve(pr).then(function(r){hi--;pump();return r;},function(e){hi--;pump();throw e;});}
   return new Promise(function(res,rej){q.push({t:Date.now(),go:function(){var fr=false,free=function(){if(!fr){fr=true;lo--;pump();}};setTimeout(free,6000);Promise.resolve(orig(n,a,o)).then(function(r){free();res(r);},function(e){free();rej(e);});}});pump();});};
  setInterval(pump,500);};wrap();})();

;


var _pfGrid60=pfGrid;pfGrid=function(l,empty){_pfGrid60(l,empty);var g=pgTop()&&pgTop().querySelector('#pfGrid');if(!g)return;var L=(l||[]).slice().sort(function(a,b){return (b.ppin?1:0)-(a.ppin?1:0);});
 Array.prototype.forEach.call(g.children,function(c,i){var p=L[i],v=c.querySelector('video');if(!p||!v)return;var m=(p.media||[]).find(function(x){return x.kind==='video';});if(m&&m.poster)v.setAttribute('poster',m.poster);});};

;var _show93=show;show=function(v){_show93(v);if(v==='plans'&&!window.XLSX&&!window._xl){window._xl=1;var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.defer=true;document.head.appendChild(s);}};

;
/* ---- Çat: uzun söhbətdə ilk olaraq son 80 mesaj, yuxarıda "Əvvəlki mesajlar" ---- */
var _chatDraw99=chatDrawMsgs;chatDrawMsgs=function(rows){rows=rows||[];if(!window._chatAll&&rows.length>80){_chatDraw99(rows.slice(-80));var el=$('chatMsgs');if(el&&!$('chMore'))el.insertAdjacentHTML('afterbegin','<button id="chMore" class="chmore" onclick="chatShowAll()">↑ Əvvəlki mesajlar ('+(rows.length-80)+')</button>');}else _chatDraw99(rows);};
function chatShowAll(){var el=$('chatMsgs');var h=el?el.scrollHeight-el.scrollTop:0;window._chatAll=true;window._chatSig=null;chatDrawMsgs(CHATmsgs);if(el)el.scrollTop=el.scrollHeight-h;}
var _chatOpen99=chatOpen;chatOpen=function(a,b,c){window._chatAll=false;return _chatOpen99(a,b,c);};
var _chatSearch99=chatSearch;chatSearch=function(){if(!window._chatAll)chatShowAll();_chatSearch99();};
/* tema/ləqəb gələndə bütün çatı yenidən çəkmə (yalnız qrupda ləqəb varsa) */
chatStyleLoad=function(){var who=CHATother,g=CHATgroup;run(sb.rpc('chat_style',{p_other:g?null:who,p_group:g?who:null})).then(function(s){if(who!==CHATother)return;CHAT_STYLE=s||{};chatStyleApply();if(g&&s&&s.nicks&&Object.keys(s.nicks).length&&CHATmsgs&&CHATmsgs.length){window._chatSig=null;chatDrawMsgs(CHATmsgs);}}).catch(function(){});};

;/* ===== IG uyğunluğu: sürüşdür-geri hər yerdə, Kəşf şəbəkəsi, profil düymələri ===== */
/* --- Kəşf: Instagram şəbəkəsi --- */
exploreRender=function(){var b=$('soBody');if(!b)return;b.innerHTML='<div class="exg">'+Array.apply(null,Array(9)).map(function(){return '<i></i>';}).join('')+'</div>';
 Promise.all([run(sb.rpc('soc_explore')),run(sb.rpc('feed2',{p_mode:'all',p_arg:null,p_before:null})).catch(function(){return [];})]).then(function(r){var x=r[0]||{},f=r[1]||[];if(FMODE!=='explore')return;var seen={},L=[];
  (x.popular||[]).forEach(function(p){if(!seen[p.id]){seen[p.id]=1;L.push({id:p.id,img:p.img,vid:p.kind==='video'});}});
  f.forEach(function(p){if(seen[p.id]||p.kind!=='post')return;var m=p.media&&p.media[0],src=m?m.url:p.image;if(!src)return;seen[p.id]=1;if(!FEED.some(function(y){return y.id===p.id;}))FEED.push(p);L.push({id:p.id,img:src,vid:m&&m.kind==='video',poster:m&&m.poster,multi:p.media&&p.media.length>1});});
  var h='<div class="srch"><input id="srchI" placeholder="Axtar" oninput="clearTimeout(window._srT);window._srT=setTimeout(srchGo,280)"><div id="srchR"></div></div>'+(x.tags&&x.tags.length?'<div class="extags">'+x.tags.slice(0,10).map(function(t){return '<span onclick="feedMode(\'tag\',\''+esc(t)+'\')">#'+esc(t)+'</span>';}).join('')+'</div>':'');
  h+=L.length?'<div class="exg">'+L.map(function(p,i){var tall=(i%10===2||i%10===5);return '<button class="'+(tall?'tall':'')+'" onclick="postOpen(\''+p.id+'\')">'+(p.vid?'<video src="'+esc(p.img)+'#t=0.1" muted playsinline preload="metadata"'+(p.poster?' poster="'+esc(p.poster)+'"':'')+'></video>':'<img src="'+esc(p.img)+'">')+(p.vid?'<i class="exi">▶</i>':p.multi?'<i class="exi">❐</i>':'')+'</button>';}).join('')+'</div>':'<div class="pfempty">Hələ şəkilli post yoxdur</div>';
  b.innerHTML=h;var n=0;(function go(){var s=$('srchI');if(!s&&FMODE==='explore'&&n++<20){setTimeout(go,100);return;}})();}).catch(err);};
/* --- Profil: İzlə | Mesaj | Əlaqə + ⋯ (IG biznes profili kimi) --- */
var _socProfile70=socProfile;socProfile=function(uid){_socProfile70(uid);if(!uid||uid==='undefined'||uid===ME.user_id)return;var n=0;(function go(){var t=pgTop(),bt=t&&t.dataset.key==='prof:'+uid&&t.querySelector('.pfbt');var ct=t&&t.querySelector('.pfct');if(!bt||!ct){if(n++<60)setTimeout(go,100);return;}if(bt.dataset.ux)return;bt.dataset.ux=1;
 var links=Array.prototype.map.call(ct.querySelectorAll('a'),function(a){return {h:a.getAttribute('href'),t:a.textContent.trim()};});ct.remove();
 bt.querySelectorAll('.sq').forEach(function(x){x.remove();});if(links.length)bt.insertAdjacentHTML('beforeend','<button class="btn ghost" id="pfCt">Əlaqə</button>');var c=bt.querySelector('#pfCt');if(c)c.onclick=function(){var d=ovl('<div class="cmq">Əlaqə</div>'+links.map(function(l){return '<a class="igmenu" href="'+esc(l.h)+'"'+(/^https/.test(l.h)?' target="_blank" rel="noopener"':'')+'>'+esc(l.t)+'</a>';}).join('')+'<button class="igmenu" onclick="this.closest(\'.s3over\').remove()">Ləğv et</button>');};})();};
var _pfMenu70=pfMenu;pfMenu=function(uid){_pfMenu70(uid);if(!uid)return;var mb=$('mbox'),f=mb&&mb.querySelector('.igmenu');if(f&&!mb.querySelector('.pfk'))f.insertAdjacentHTML('beforebegin','<button class="igmenu pfk" onclick="closeModal();var e=(typeof EMPS!==\'undefined\'?EMPS:[]).find(function(z){return z.user_id===\''+uid+'\'});if(e&&typeof openKudos===\'function\')openKudos(e.id)">🙌 Təşəkkür göndər</button><button class="igmenu" onclick="closeModal();qrOpen(\''+uid+'\')">▦ QR kod</button>');};
/* --- Sürüşdür-geri: hər yerdə --- */
(function(){var S=null,DOCK={today:1,chat:1,feed:1,tasks:1};
 var ctx=function(x){if($('modal').classList.contains('on')||document.querySelector('.pg.on,.s3over,#igSV,#mvw,#stEd,#vrec,#gcV,#momCap,#s3vc,#igCtx'))return null;
  if($('igReel'))return x<60?'ov':null;if($('s4quiz'))return x<60?'ov':null;if($('s4wr'))return null;if($('liveV'))return _lv&&!_lv.host&&x<60?'ov':null;
  var v=document.querySelector('.view.on');if(!v)return null;var id=v.id.replace('v-','');
  if(id==='chat')return CHATother&&x<70?'room':null;
  if(id==='feed')return (FMODE&&['all','following','favs'].indexOf(FMODE)<0)?'sec':null;
  if(!DOCK[id])return x<70?'view':null;return null;};
 var hs='.socar,.igstories,.soseg,.sugl,.s3hl,.fpfl,.sochips,input,textarea,video,.tds,.extags,.rlw';
 document.addEventListener('touchstart',function(e){S=null;if(e.touches.length>1)return;var t=e.touches[0],k=ctx(t.clientX);if(!k)return;if(k!=='ov'&&k!=='room'&&e.target.closest(hs))return;
  var el=k==='ov'?($('igReel')||$('s4quiz')||$('liveV')):k==='room'?document.querySelector('.igroom'):document.querySelector('.view.on');S={k:k,x:t.clientX,y:t.clientY,dx:0,on:false,el:el};},{passive:true});
 document.addEventListener('touchmove',function(e){if(!S)return;var t=e.touches[0];S.dx=t.clientX-S.x;var dy=t.clientY-S.y;
  if(!S.on){if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(S.dx)){S=null;return;}if(S.dx>14&&S.dx>Math.abs(dy)*1.3){S.on=true;if(S.el)S.el.style.transition='none';}else if(S.dx<-14){S=null;return;}}
  if(S.on&&S.el){if(e.cancelable)e.preventDefault();S.el.style.transform='translateX('+Math.max(0,S.dx)+'px)';}},{passive:false});
 document.addEventListener('touchend',function(){if(!S)return;var s=S;S=null;if(!s.on)return;var el=s.el,ok=s.dx>90;if(el){el.style.transition='transform .2s ease';el.style.transform=ok?'translateX(100%)':'';}
  setTimeout(function(){if(el){el.style.transition='';el.style.transform='';}if(!ok)return;try{navigator.vibrate&&navigator.vibrate(8);}catch(x){}
   if(s.k==='room')chatBack();else if(s.k==='sec')feedMode('all');else backAct();},ok?190:220);},{passive:true});})();
