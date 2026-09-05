"use client";

import { useEffect, useState } from "react";
import { offlineSyncService } from "@/services/offlineSyncService";

export interface NetworkSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastMessage: string | null;
  triggerManualSync: () => Promise<number>;
}

export function useNetworkStatus(): NetworkSyncStatus {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const unsubscribe = offlineSyncService.subscribe((status) => {
      setIsSyncing(status.isSyncing);
      setPendingCount(status.pendingCount);
      setLastMessage(status.lastMessage);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, []);

  const triggerManualSync = async (): Promise<number> => {
    return await offlineSyncService.syncPendingMutations();
  };

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastMessage,
    triggerManualSync,
  };
}
