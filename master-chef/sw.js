const CACHE='master-chef-2-D94sWHlg';
const IMAGE_CACHE='master-chef-images';
const ASSETS=[];
const IMAGE_HOSTS=['www.themealdb.com','themealdb.com','upload.wikimedia.org','en.wikipedia.org','commons.wikimedia.org'];
function imageHost(hostname){return IMAGE_HOSTS.some((host)=>hostname===host||hostname.endsWith('.'+host));}
self.addEventListener('install',(event)=>{event.waitUntil(caches.open(CACHE).then((cache)=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',(event)=>{event.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE&&key!==IMAGE_CACHE).map((key)=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',(event)=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(imageHost(url.hostname)){
    event.respondWith((async()=>{
      const cache=await caches.open(IMAGE_CACHE);
      const hit=await cache.match(req);
      if(hit)return hit;
      const res=await fetch(req);
      if(res.ok)cache.put(req,res.clone()).catch(()=>{});
      return res;
    })());
    return;
  }
  if(url.origin!==self.location.origin)return;
  event.respondWith(caches.match(req).then((hit)=>hit||fetch(req).then((res)=>{
    const copy=res.clone();
    caches.open(CACHE).then((cache)=>cache.put(req,copy)).catch(()=>{});
    return res;
  }).catch(()=>caches.match('./index.html'))));
});
