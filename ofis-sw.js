// Baş Ofis — sadə service worker: tətbiq qabığını keşləyir, məlumatlar həmişə şəbəkədən gəlir
const C='ofis-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['/ofis','/assets/ofis/icon-192.png']).catch(()=>{})));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin&&(u.pathname==='/ofis'||u.pathname==='/ofis.html')){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('/ofis',cp));return res;}).catch(()=>caches.match('/ofis')));}});
