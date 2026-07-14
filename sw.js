const C='daily-income-pwa-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request).catch(()=>caches.match('/Daily-income/index.html')));return;
 }
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{
  const y=x.clone();caches.open(C).then(c=>c.put(e.request,y));return x;
 })));
});