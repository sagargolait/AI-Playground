/// <reference lib="webworker" />
import { installSerwist } from "@serwist/sw";
import { CacheFirst, NetworkFirst } from "@serwist/strategies";
import type { PrecacheEntry } from "@serwist/precaching";
import type { RuntimeCaching } from "@serwist/sw";

declare global {
  interface ServiceWorkerGlobalScope {
    __SW_MANIFEST: Array<PrecacheEntry | string>;
  }
}

const sw = self as unknown as ServiceWorkerGlobalScope;

installSerwist({
  precacheEntries: sw.__SW_MANIFEST || [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp)$/,
      handler: new CacheFirst(),
    } as RuntimeCaching,
    {
      matcher: /^https:\/\/api\./,
      handler: new NetworkFirst(),
    } as RuntimeCaching,
  ],
});
