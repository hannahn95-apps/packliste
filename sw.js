const CACHE = "packliste-v7";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "vendor/qrcode.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))));
  self.clients.claim();
});
// Netzwerk zuerst (damit Updates ankommen), offline aus dem Cache
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  // Nur die App selbst zwischenspeichern – nie den Live-Abgleich
  if (u.origin !== self.location.origin) return;
  if ((e.request.headers.get("accept") || "").includes("text/event-stream")) return;
  e.respondWith(
    fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
