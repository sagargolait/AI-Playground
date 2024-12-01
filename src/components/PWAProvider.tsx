"use client";

import { useEffect } from "react";
import * as serviceWorkerRegistration from "../utils/serviceWorkerRegistration";

export default function PWAProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    serviceWorkerRegistration.register();
    return () => {
      serviceWorkerRegistration.unregister();
    };
  }, []);

  return <>{children}</>;
}
