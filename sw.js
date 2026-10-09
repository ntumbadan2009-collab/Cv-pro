/* Service worker de CV-Pro — travaille de pair avec index.html.
   - index.html l'enregistre (sw.js, portée "./") et lui envoie "SKIP_WAITING"
     quand une nouvelle version est prête.
   - Il met en cache la page ET les bibliothèques externes dont elle dépend
     (html2canvas, jsPDF, QRCode, polices) pour que l'app, l'export PDF/PNG et
     le QR code fonctionnent aussi hors-ligne après une première visite. */
const CACHE_NAME = "cv-pro-cache-v5";
const APP_SHELL = ["./", "./index.html"];
const EXTERNAL = [
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Outfit:wght@400;500;600;700&family=Baloo+2:wght@500;600;700&family=Nunito:wght@400;600;700&family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await Promise.all(APP_SHELL.map(u => cache.add(u).catch(() => {})));
      // ressources externes : mises en cache "au mieux" (no-cors => réponse opaque acceptée)
      await Promise.all(EXTERNAL.map(u =>
        fetch(u, { mode: "no-cors" }).then(r => cache.put(u, r)).catch(() => {})
      ));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

// "Réseau d'abord, cache en secours" : toujours la dernière version en ligne,
// et l'app complète (page + bibliothèques + polices) hors-ligne.
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || !/^https?:/.test(req.url)) return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then(hit =>
          hit || (req.mode === "navigate" ? caches.match("./index.html") : Response.error())
        )
      )
  );
});
