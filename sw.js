const CACHE_NAME = 'boda-jym-v1'; // Cambia la versión si haces cambios en el cache
const assets = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  // Asegúrate de añadir las rutas correctas a tus iconos reales cuando los tengas
  './icons/icon-192.png', 
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Montserrat:wght@300;400;700&display=swap',
  'https://fonts.gstatic.com/s/dancingscript/v27/If0rVugyTsjS_g_fnOyQR6yCSJmR-mN7A8jF_I5gR1g.woff2', /* Ejemplo de fuente */
  'https://fonts.gstatic.com/s/montserrat/v26/JTUSjIg1_i6t8kCHKm459Wlhzg.woff2' /* Ejemplo de fuente */
];

self.addEventListener('install', e => {
  console.log('[Service Worker] Instalando...');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Cacheando assets:', assets);
      return cache.addAll(assets).catch(err => console.error('Falló cacheando assets:', err));
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).catch(() => {
        // Opcional: Si es una página HTML y no está en caché, devuelve una página offline
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html'); // o una página 'offline.html' específica
        }
      });
    })
  );
});

self.addEventListener('activate', e => {
  console.log('[Service Worker] Activando...');
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Borrando cache antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});