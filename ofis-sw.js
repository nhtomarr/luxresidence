// Baş Ofis — service worker: tətbiq qabığı keşi + telefon bildirişləri (Web Push)
const C='ofis-v64';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['/ofis','/assets/ofis/icon-192.png']).catch(()=>{})));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin&&(u.pathname==='/ofis'||u.pathname==='/ofis.html')){
  // network-first + 3 san timeout: şəbəkə yavaşsa dərhal keşdən göstər (ağ ekran olmasın)
  e.respondWith((async()=>{
   const cached=await caches.match('/ofis');
   try{
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(),3000);
    const res=await fetch(r,{signal:ctrl.signal});
    clearTimeout(t);
    if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put('/ofis',cp));return res;}
    return cached||res;
   }catch(_){
    // şəbəkə yox/yavaş → keşdən (varsa), yoxdursa yenidən cəhd
    return cached||fetch(r).catch(()=>new Response('<!doctype html><meta charset=utf-8><meta http-equiv=refresh content=1><body style="font-family:system-ui;text-align:center;padding:40px;color:#64748b">Yüklənir…</body>',{headers:{'Content-Type':'text/html'}}));
   }
  })());
 }});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{};}catch(_){d={title:'Baş Ofis',body:e.data?e.data.text():''};}
 const title=d.title||'Baş Ofis';
 e.waitUntil(self.registration.showNotification(title,{body:d.body||'',icon:'/assets/ofis/icon-192.png',badge:'/assets/ofis/icon-192.png',tag:d.tag||undefined,renotify:!!d.tag,requireInteraction:!!d.important,vibrate:d.important?[300,120,300,120,300]:[180,80,180],data:{url:d.url||'/ofis'}}));});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'/ofis';
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if(c.url.indexOf('/ofis')>=0&&'focus' in c){c.navigate&&c.navigate(url).catch(()=>{});return c.focus();}}return self.clients.openWindow(url);}));});
