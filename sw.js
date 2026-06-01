/* ═══════════════════════════════════════════════════════════════
   Field Companion – Service Worker (sw.js)
   Provides offline support via a Cache-First strategy for all
   app shell assets.  Dynamic data lives in localStorage so there
   is nothing network-sensitive to intercept here.
═══════════════════════════════════════════════════════════════ */

'use strict';

const CACHE_NAME = 'field-companion-v1';

// All files that make up the app shell.
// Add any additional asset paths here as you place real files.
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  // Item icons (copied from gamify/image_assets/shop/)
  './assets/icons/weak_health_potion.png',
  './assets/icons/strong_health_potion.png',
  './assets/icons/elixir_of_boost.png',
  './assets/icons/fountain_of_youth_potion.png',
  './assets/icons/green_tea.png',
  './assets/icons/herbal_tea.png',
  './assets/icons/ale.png',
  './assets/icons/milk.png',
  './assets/icons/posset.png',
  './assets/icons/flavored_water.png',
  './assets/icons/sparkling_water.png',
  './assets/icons/fruit_juice.png',
  './assets/icons/sweet_beverage.png',
  './assets/icons/candy.png',
  './assets/icons/small_pastry.png',
  './assets/icons/large_pastry.png',
  './assets/icons/unhealthy_meal.png',
  './assets/icons/genie_lamp.png',
  './assets/icons/mystery_box.png',
  './assets/icons/time.png',
  './assets/icons/diamond.png',
  './assets/icons/gold_coins.png',
  './assets/icons/black_coffee.png',
  './assets/icons/app-icon-192.png',
  './assets/icons/app-icon-512.png',
  // Sounds
  './assets/sounds/potion.mp3',
  './assets/sounds/tea.mp3',
  './assets/sounds/ale.mp3',
  './assets/sounds/magic.mp3',
  './assets/sounds/violation.mp3',
];

// ── Install: pre-cache the app shell ─────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Use individual adds so a missing asset file doesn't abort
      // the whole install (icons and sounds are optional placeholders).
      return Promise.allSettled(
        APP_SHELL.map(url => cache.add(url).catch(() => { /* ignore missing */ }))
      );
    })
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate: remove stale caches ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── Fetch: Cache-First ───────────────────────────────────────────
self.addEventListener('fetch', event => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not in cache — try the network and cache the response
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        // Completely offline and not cached — nothing we can do
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
