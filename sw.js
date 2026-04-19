// Service Worker - Badminton Club
// Incrémente CACHE_VERSION à chaque mise à jour pour forcer le refresh
const CACHE_VERSION = 'v3';
const CACHE_NAME = 'badminton-' + CACHE_VERSION;

const FILES_TO_CACHE = [
  '/Badminton-club/',
  '/Badminton-club/index.html',
  '/Badminton-club/manifest.json',
  '/Badminton-club/icon.png'
];

// Installation — mise en cache des fichiers
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  // Force l'activation immédiate sans attendre la fermeture des onglets
  self.skipWaiting();
});

// Activation — supprime les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  // Prend le contrôle immédiatement de tous les onglets ouverts
  self.clients.claim();
});

// Fetch — réseau en priorité, cache en fallback
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes Google Sheets/OAuth
  if (event.request.url.includes('googleapis') ||
      event.request.url.includes('accounts.google') ||
      event.request.url.includes('gstatic')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Met à jour le cache avec la version fraîche
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
