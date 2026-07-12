/* UNDERHALLS offline worker. Update workflow: bump CACHE, commit, push. */
const CACHE="uh2-v1";
const SEED=["./","./index.html","./underhalls2.html"];
self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>
      Promise.all(SEED.map(u=>c.add(u).catch(()=>{})))
    ).then(()=>self.skipWaiting())
  );
});
self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  e.respondWith(
    caches.match(e.request,{ignoreSearch:true}).then(hit=>{
      if(hit)return hit;
      return fetch(e.request).then(res=>{
        if(res&&res.ok){
          const cp=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,cp));
        }
        return res;
      });
    })
  );
});
