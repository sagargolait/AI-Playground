/// <reference lib="webworker" />

// Explicitly define the service worker context type
type ServiceWorkerContext = ServiceWorkerGlobalScope & typeof globalThis;

// Type guard to check if we're in a service worker context
function isServiceWorkerContext(
  context: unknown
): context is ServiceWorkerContext {
  return (
    context !== undefined &&
    "addEventListener" in (context as ServiceWorkerContext) &&
    "caches" in (context as ServiceWorkerContext)
  );
}

// Check and assert service worker context
const workerContext = isServiceWorkerContext(self)
  ? (self as ServiceWorkerContext)
  : undefined;

if (!workerContext) {
  throw new Error("This script must be run in a service worker context");
}

const CACHE_NAME = "ai-chat-cache-v1";
const OFFLINE_URL = "/offline.html";

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/styles.css",
];

interface ChatMessage {
  id: string;
  content: string;
  // add other necessary message properties
}

// Add this interface near the top with other type definitions
interface SyncEvent extends ExtendableEvent {
  tag: string;
}

async function getFailedMessages(): Promise<ChatMessage[]> {
  const cache = await caches.open(CACHE_NAME);
  const failedMessagesResponse = await cache.match("failed-messages");
  return failedMessagesResponse ? await failedMessagesResponse.json() : [];
}

async function sendMessage(message: ChatMessage): Promise<void> {
  // Implement your message sending logic here
  await fetch("/api/messages", {
    method: "POST",
    body: JSON.stringify(message),
  });
}

async function removeFromFailedMessages(message: ChatMessage): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  const failedMessages = await getFailedMessages();
  const updatedMessages = failedMessages.filter((m) => m.id !== message.id);
  await cache.put(
    "failed-messages",
    new Response(JSON.stringify(updatedMessages))
  );
}

workerContext.addEventListener("install", ((event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await workerContext.caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);

      const offlineResponse = new Response(
        "You are offline. Please check your internet connection.",
        {
          headers: { "Content-Type": "text/html" },
        }
      );
      await cache.put(OFFLINE_URL, offlineResponse);
    })()
  );
}) as EventListener);

workerContext.addEventListener("activate", ((event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await workerContext.caches.keys();
      await Promise.all(
        cacheKeys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => workerContext.caches.delete(key))
      );
    })()
  );
}) as EventListener);

workerContext.addEventListener("fetch", ((event: FetchEvent) => {
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);

        if (response.ok && event.request.method === "GET") {
          const cache = await workerContext.caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }

        return response;
      } catch (error) {
        console.error("error", error);
        const cachedResponse = await workerContext.caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.mode === "navigate") {
          const offlineResponse = await workerContext.caches.match(OFFLINE_URL);
          return offlineResponse || new Response("Offline");
        }

        return new Response("Network error happened", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        });
      }
    })()
  );
}) as EventListener);

workerContext.addEventListener("sync", ((event: SyncEvent) => {
  if (event.tag === "sync-messages") {
    event.waitUntil(syncMessages());
  }
}) as EventListener);

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
