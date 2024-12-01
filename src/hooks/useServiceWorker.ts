"use client";

import { useState, useEffect } from "react";

export function useServiceWorker() {
  const [isOffline, setIsOffline] = useState<boolean | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          setRegistration(reg);

          reg.addEventListener("waiting", (event) => {
            if (event.target instanceof ServiceWorker) {
              setWaitingWorker(event.target);
            }
          });
        })
        .catch((error) => {
          console.error(`Service worker ${registration} failed:`, error);
        });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const updateServiceWorker = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    waitingWorker?.addEventListener("statechange", (e) => {
      if ((e.target as ServiceWorker).state === "activated") {
        window.location.reload();
      }
    });
  };

  return {
    isOffline: isOffline ?? true,
    updateAvailable: !!waitingWorker,
    updateServiceWorker,
  };
}
