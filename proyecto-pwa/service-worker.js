const CACHE_VERSION = 'proyecto-pwa-v3';

const STATIC_ASSETS = [
    './index.html',
    './style.css',
    './app.js',
    './js/ocr.js',
    './js/geolocation.js',
    './js/map.js',
    './js/storage.js',
    './manifest.json'
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FIELDMAP — Sin Conexión</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#f3f4f6; color:#111827; font-family:system-ui,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; flex-direction:column; gap:16px; text-align:center; padding:20px; }
  svg { opacity:.6; }
  h1 { font-size:18px; font-weight:600; }
  p { color:#6b7280; font-size:14px; max-width:320px; }
  a { color:#8b5cf6; text-decoration:none; font-size:13px; margin-top:8px; display:block; }
</style>
</head>
<body>
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" stroke="#8b5cf6" stroke-width="2"/>
    <path d="M24 14v12l6 4" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <h1>Sin conexión</h1>
  <p>No hay acceso a internet. Si ya usaste FIELDMAP antes, volvé a intentarlo — los datos locales siguen disponibles.</p>
  <a href="./index.html">Reintentar</a>
</body>
</html>`;

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_VERSION).then(function(cache) {
            var promises = STATIC_ASSETS.map(function(url) {
                return cache.add(url).catch(function(err) {
                    console.warn('[SW] No se pudo cachear:', url, err.message);
                });
            });

            var offlineResponse = new Response(OFFLINE_HTML, {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
            promises.push(cache.put('__offline__', offlineResponse));

            return Promise.all(promises);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) {
                    return key !== CACHE_VERSION;
                }).map(function(key) {
                    return caches.delete(key);
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(event) {
    var url = event.request.url;

    if (event.request.method !== 'GET') return;
    if (!url.startsWith('http')) return;

    if (_isLocalAsset(url)) {
        event.respondWith(
            caches.match(event.request).then(function(cached) {
                if (cached) return cached;
                return fetch(event.request).then(function(response) {
                    if (response && response.ok) {
                        var clone = response.clone();
                        caches.open(CACHE_VERSION).then(function(cache) {
                            cache.put(event.request, clone);
                        });
                    }
                    return response;
                }).catch(function() {
                    if (event.request.headers.get('accept') &&
                        event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('__offline__');
                    }
                });
            })
        );
        return;
    }

    event.respondWith(
        fetch(event.request).then(function(response) {
            if (response && response.ok) {
                var clone = response.clone();
                caches.open(CACHE_VERSION).then(function(cache) {
                    cache.put(event.request, clone);
                });
            }
            return response;
        }).catch(function() {
            return caches.match(event.request).then(function(cached) {
                if (cached) return cached;
                if (event.request.headers.get('accept') &&
                    event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('__offline__');
                }
            });
        })
    );
});

function _isLocalAsset(url) {
    return url.startsWith(self.location.origin);
}