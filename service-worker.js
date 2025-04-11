const CACHE_NAME = "eTracker-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/manifest.json",
  "/service-worker.js",
  "/images/splash-logo.png",
  "/images/eTracker_Black.png",
  "/images/eTracker_White.png",
  "/images/eTracker_favIcon.png",
  "/images/backgroundImage.jpg",
  "/assets/icon-192x192.png",
  "/assets/icon-512x512.png",
  "/assets/icon-512x512-black.png",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// self.addEventListener("activate", (event) => {
//   const cacheWhitelist = [CACHE_NAME];
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheWhitelist.indexOf(cacheName) === -1) {
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
// });
