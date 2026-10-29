/* Nizami City — daxili sistemlərin ortaq köməkçiləri */
(function(){
try{var t=localStorage.getItem('nc_theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}
var NC=window.NC={sb:null,me:null,tok:null};
NC.$=function(id){return document.getElementById(id);};
NC.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
NC.fmt=function(n,d){n=Number(n)||0;return n.toLocaleString('az-AZ',{minimumFractionDigits:d||0,maximumFractionDigits:d||0}).replace(/ /g,' ');};
NC.money=function(n){return NC.fmt(Math.round(Number(n)||0))+' ₼';};
NC.today=function(){var d=new Date(Date.now()+4*3600e3);return d.toISOString().slice(0,10);};
NC.dmy=function(s){if(!s)return '';var p=String(s).slice(0,10).split('-');return p[2]+'.'+p[1]+'.'+p[0];};
NC.can=function(p){var m=NC.me;if(!m)return false;if(m.is_admin)return true;var ps=m.perms||[];return (Array.isArray(p)?p:[p]).some(function(x){return ps.indexOf(x)>=0;});};
var tt;NC.toast=function(m){var e=NC.$('ncToast');if(!e){e=document.createElement('div');e.id='ncToast';e.className='nc-toast';document.body.appendChild(e);}e.textContent=m;e.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){e.classList.remove('on');},2600);};
NC.modal=function(html,opts){opts=opts||{};var m=NC.$('ncMod');if(!m){m=document.createElement('div');m.id='ncMod';m.className='nc-mod';m.addEventListener('click',function(e){if(e.target===m)NC.close();});document.body.appendChild(m);}
 m.innerHTML='<div class="box'+(opts.wide?' wide':'')+'">'+html+'</div>';requestAnimationFrame(function(){m.classList.add('on');});return m.firstChild;};
NC.close=function(){var m=NC.$('ncMod');if(m)m.classList.remove('on');};
document.addEventListener('keydown',function(e){if(e.key==='Escape')NC.close();});
NC.mh=function(t,s){return '<div class="mh"><div><h2>'+t+'</h2>'+(s?'<p>'+s+'</p>':'')+'</div><button class="nc-ib" onclick="NC.close()" aria-label="Bağla"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';};
var LINKS=[['satis','Satış lövhəsi|Satış',['nc_sales','nc_sales_edit','nc_contracts']],['kalkulyator','Kalkulyator|Kalkulyator',['nc_calc','nc_calc_admin']],['muqavile','Müqavilələr|Müqavilə',['nc_contracts']],['komendant','Komendantlıq|Komendant',['nc_komendant','nc_komendant_kassa','nc_sakin']],['sayt','Sayt idarəsi|Sayt',['nc_site']]];
NC.base=function(){return /nizami-?city\.az$/.test(location.hostname)?'/':'/nc/';};
NC.header=function(active,sub){var h=document.createElement('header');h.className='nc-hd noprint';
 h.innerHTML='<div class="in"><a class="nc-brand" href="'+NC.base()+'satis"><img src="/assets/nc/logo.png" alt=""><span>Nizami City<small>'+(sub||'Daxili sistem')+'</small></span></a><nav class="nc-nav" id="ncNav"></nav><button class="nc-ib" id="ncTheme" aria-label="Tema"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/></svg></button><button class="nc-ib nc-out" id="ncOut" style="display:none" onclick="NC.logout()" aria-label="Çıxış"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg></button></div>';
 document.body.insertBefore(h,document.body.firstChild);
 NC.$('ncTheme').onclick=function(){var r=document.documentElement,l=r.getAttribute('data-theme')==='light'?'dark':'light';r.setAttribute('data-theme',l);try{localStorage.setItem('nc_theme',l);}catch(e){}};
 NC._active=active;};
NC.navFill=function(){var n=NC.$('ncNav');if(!n)return;n.innerHTML=LINKS.filter(function(l){return NC.can(l[2]);}).map(function(l){return '<a href="'+NC.base()+l[0]+'"'+(l[0]===NC._active?' class="on"':'')+'><span class="ln">'+l[1].split('|')[0]+'</span><span class="sh">'+l[1].split('|')[1]+'</span></a>';}).join('')+(NC.me?'<a href="#" class="nc-lo" onclick="NC.logout();return false">Çıxış</a>':'');var o=NC.$('ncOut');if(o&&NC.me)o.style.display='';};
NC.logout=function(){if(!confirm('Hesabdan çıxılsın?'))return;NC.sb.auth.signOut().then(function(){location.reload();});};
NC.auth=function(o){luxAuth({perms:o.perms,title:o.title,sub:o.sub||'Nizami City hesabınızla daxil olun',logo:'/assets/nc/logo.png',accent:'#c2cd3f',noAdminLink:true,onReady:function(sb,me,tok){NC.sb=sb;NC.me=me;NC.tok=tok;NC.navFill();o.onReady&&o.onReady(sb,me,tok);}});};
NC.kv=function(key){return NC.sb.from('lux_kv').select('value,updated_at').eq('key',key).maybeSingle().then(function(r){if(r.error)throw r.error;return r.data;});};
NC.kvSave=function(key,val){return NC.sb.from('lux_kv').upsert({key:key,value:val,updated_at:new Date().toISOString()}).then(function(r){if(r.error)throw r.error;return r;});};
NC.xlsx=function(cb){if(window.XLSX)return cb();var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=cb;document.head.appendChild(s);};
NC.ST={satisda:['Satışda','var(--s-satisda)'],satilib:['Satılıb','var(--s-satilib)'],investor:['İnvestor','var(--s-investor)'],bron:['Bron','var(--s-bron)'],sakin:['Sakin','var(--s-sakin)'],fond:['Fond','var(--s-fond)'],satilmir:['Satılmır','var(--s-satilmir)']};
})();
