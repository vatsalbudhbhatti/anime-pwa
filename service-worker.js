const CACHE_NAME = 'anime-app-v1';
const API_CACHE_NAME = 'anime-api-cache';
const IMAGE_CACHE_NAME = 'anime-images-cache';

const STATIC_ASSETS = [
  './', // Root path
  'index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Helper function to handle failed requests
const handleFetchError = (error) => {
  console.error('Fetch error:', error);
  return new Response('Network error happened', {
    status: 408,
    headers: { 'Content-Type': 'text/plain' },
  });
};

// Function to cache static assets
const cacheStaticAssets = async () => {
  try {
    const cache = await caches.open(CACHE_NAME);

    // Cache each asset individually
    const cachePromises = STATIC_ASSETS.map(async (asset) => {
      try {
        const response = await fetch(asset);
        if (response.ok) {
          await cache.put(asset, response);
          console.log(`Successfully cached: ${asset}`);
        } else {
          console.warn(`Failed to cache ${asset}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`Failed to cache ${asset}:`, error);
      }
    });

    await Promise.allSettled(cachePromises);
  } catch (error) {
    console.error('Failed to cache static assets:', error);
  }
};

// Function to handle API requests
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(console.warn);
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return handleFetchError(error);
  }
}

// Function to handle image requests
async function handleImageRequest(request) {
  const imageCache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await imageCache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      await imageCache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return a placeholder image or error image when offline
    return new Response(
      'Image not available offline',
      { status: 408, headers: { 'Content-Type': 'text/plain' } }
    );
  }
}

// Function to handle other requests
async function handleOtherRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return handleFetchError(error);
  }
}

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      cacheStaticAssets(),

      // Pre-cache first page of anime data
      fetch('https://api.jikan.moe/v4/top/anime?page=1')
        .then(async response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const clonedResponse = response.clone();
          const cache = await caches.open(API_CACHE_NAME);
          await cache.put('https://api.jikan.moe/v4/top/anime?page=1', clonedResponse);

          // Pre-cache images from first page
          const data = await response.json();
          const imageCache = await caches.open(IMAGE_CACHE_NAME);
          const imagePromises = data.data.map(async anime => {
            const imgUrl = anime.images.jpg.large_image_url;
            try {
              const imgResponse = await fetch(imgUrl);
              if (imgResponse.ok) {
                await imageCache.put(imgUrl, imgResponse);
              }
            } catch (error) {
              console.warn(`Failed to cache image: ${imgUrl}`, error);
            }
          });
          await Promise.allSettled(imagePromises);
        })
        .catch(err => {
          console.log('Failed to pre-cache API data:', err);
          return Promise.resolve();
        })
    ])
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![CACHE_NAME, API_CACHE_NAME, IMAGE_CACHE_NAME].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle API requests
  if (url.href.includes('api.jikan.moe/v4/top/anime')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Handle image requests
  if (event.request.destination === 'image' || url.href.includes('.jpg') || url.href.includes('.png')) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }

  // Handle other requests
  event.respondWith(handleOtherRequest(event.request));
});
