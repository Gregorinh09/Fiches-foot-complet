// Service worker : l'application s'ouvre même sans réseau (les données sont dans le téléphone).
const C = 'fiches-foot-v1'
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(['/', '/index.html', '/icon-192.png', '/icon-512.png'])).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
// Réseau d'abord (toujours la dernière version), cache en secours
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r && r.status === 200 && new URL(e.request.url).origin === location.origin) {
          const cp = r.clone()
          caches.open(C).then((c) => c.put(e.request, cp)).catch(() => {})
        }
        return r
      })
      .catch(() => caches.match(e.request).then((m) => m || caches.match('/index.html')))
  )
})
