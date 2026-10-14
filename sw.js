/* Service worker: cangkang login + vault.js tersimpan untuk dibuka offline.
   VER diisi otomatis oleh build.mjs. PDF terenkripsi (pdf/*.bin) tidak disimpan. */
const VER='1495a169cc';
const CACHE='aibook-'+VER;
const SHELL=['./','index.html','login.css','auth.js','pwa.js','vault.js?v=1495a169cc','manifest.webmanifest','icon-192.png','icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(SHELL.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('aibook-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
const put=(req,res)=>{if(res&&(res.ok||res.type==='opaque'))caches.open(CACHE).then(c=>c.put(req,res.clone())).catch(()=>{});return res};

self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url);
  // font Google: stale-while-revalidate
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.match(req).then(h=>{const n=fetch(req).then(r=>put(req,r)).catch(()=>h);return h||n}));return}
  if(u.origin!==location.origin)return;
  if(/\.bin$/.test(u.pathname)||/\/pdf\//.test(u.pathname))return;           // PDF: langsung ke jaringan
  // berkas ber-versi (?v=hash) tidak berubah isinya: cache-first
  if(u.searchParams.has('v')){
    e.respondWith(caches.match(req).then(h=>h||fetch(req).then(r=>put(req,r)).catch(()=>caches.match(req,{ignoreSearch:true}).then(x=>x||Response.error()))));return}
  // lainnya (index.html, manifest, ikon): jaringan dulu, cadangan dari cache saat offline
  e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>put(req,r)).catch(()=>
    caches.match(req,{ignoreSearch:true}).then(h=>h||(req.mode==='navigate'?caches.match('index.html'):Response.error()))));
});
