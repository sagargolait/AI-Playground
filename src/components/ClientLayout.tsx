"use client"; // Mark as Client Component

import { useServiceWorker } from "@/hooks/useServiceWorker";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOffline, updateAvailable, updateServiceWorker } =
    useServiceWorker();

  return (
    <>
      {children}
      {isOffline && (
        <div className="fixed top-0 w-full bg-yellow-500 p-2 text-center">
          You are currently offline. Some features may be limited.
        </div>
      )}
      {updateAvailable && (
        <div className="fixed bottom-0 w-full bg-blue-500 p-2 text-center">
          <span>New version available! </span>
          <button
            onClick={updateServiceWorker}
            className="underline hover:no-underline"
          >
            Click to update
          </button>
        </div>
      )}
    </>
  );
}
