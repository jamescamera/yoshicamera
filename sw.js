/* Yoshi Camera — offline shell.
   One file to cache, because the whole app is one file. */
var CACHE = 'yoshi-v1';
var CORE = ['./', './index.html', './manifest.webmanifest',
            './icon-192.png', './icon-512.png', './icon-maskable.png'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // never let one missing icon block the install
      return Promise.all(CORE.map(function(u){
        return c.add(u)['catch'](function(){});
      }));
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k===CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Network first, so a fresh build is picked up the moment it is online,
   with the cache standing by for tunnels and aeroplanes. */
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  if(new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(req, copy)['catch'](function(){}); });
      return res;
    })['catch'](function(){
      return caches.match(req).then(function(hit){
        return hit || caches.match('./index.html');
      });
    })
  );
});
