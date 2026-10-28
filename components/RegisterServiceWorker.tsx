"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (window.serwist !== undefined) {
        window.serwist.register();
      } else {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // Expected in dev mode when service worker compilation is skipped
        });
      }
    }
  }, []);

  return null;
}
