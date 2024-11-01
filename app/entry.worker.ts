// Archivo: app/entry.worker.ts

/// <reference lib="WebWorker" />

export type {};
declare let self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'app-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/fonts/inter-var.woff2'  // Asegúrate que esta ruta coincida con tu estructura
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('Caching assets...');
      try {
        await cache.addAll(ASSETS);
        console.log('Assets cached successfully');
      } catch (error) {
        console.error('Error caching assets:', error);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('/auth/') ||
    event.request.url.includes('socket') ||
    event.request.url.includes('/ws')
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Intentar la red primero
        const networkResponse = await fetch(event.request);
        
        // Si la respuesta es exitosa, la guardamos en caché
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Si falla la red, intentamos el caché
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si es una navegación y no hay caché, intentamos la página principal
        if (event.request.mode === 'navigate') {
          const mainPageResponse = await caches.match('/');
          if (mainPageResponse) {
            return mainPageResponse;
          }
        }

        // Si todo falla, retornamos una respuesta genérica
        return new Response('Contenido no disponible', {
          status: 200,
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
        });
      }
    })()
  );
});