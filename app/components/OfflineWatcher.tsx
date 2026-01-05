"use client";

import { useEffect } from "react";
import { useOnlineStatus } from "@/context/OnlineStatusContext";

export default function OfflineWatcher() {
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    if (!isOnline) {
      const hasReloaded = sessionStorage.getItem("offlineReloaded");
      if (!hasReloaded) {
        sessionStorage.setItem("offlineReloaded", "true");
        window.location.reload();
      }
    } else {
      // Reset the flag when coming back online
      sessionStorage.removeItem("offlineReloaded");
    }
  }, [isOnline]);

  return null;
}

