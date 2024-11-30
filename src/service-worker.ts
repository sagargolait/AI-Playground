/// <reference lib="webworker" />

const CACHE_NAME = "ai-chat-cache-v1";
const OFFLINE_URL = "/offline.html";

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/styles.css",
  // Add other static assets you want to cache
];

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache static assets
      await cache.addAll(STATIC_ASSETS);
      // Cache offline page
      const offlineResponse = new Response(
        "You are offline. Please check your internet connection.",
        {
          headers: { "Content-Type": "text/html" },
        }
      );
      await cache.put(OFFLINE_URL, offlineResponse);
    })()
  );
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })()
  );
});

self.addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const response = await fetch(event.request);

        // Cache successful responses
        if (response.ok && event.request.method === "GET") {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }

        return response;
      } catch (error) {
        // If network fails, try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If cache fails, return offline page
        if (event.request.mode === "navigate") {
          const offlineResponse = await caches.match(OFFLINE_URL);
          return offlineResponse || new Response("Offline");
        }

        return new Response("Network error happened", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        });
      }
    })()
  );
});

// Handle background sync for failed requests
self.addEventListener("sync", (event: SyncEvent) => {
  if (event.tag === "sync-messages") {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  try {
    const failedMessages = await getFailedMessages();
    for (const message of failedMessages) {
      await sendMessage(message);
      await removeFromFailedMessages(message);
    }
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
