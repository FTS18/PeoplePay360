"use client";

import { offlineStore, QueuedMutation } from "@/lib/offlineStore";

type SyncListener = (status: { isSyncing: boolean; pendingCount: number; lastMessage: string | null }) => void;

class OfflineSyncService {
  private listeners = new Set<SyncListener>();
  private isSyncing = false;
  private syncTimer: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline());
      window.addEventListener("offline", () => this.notify());
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.checkPendingCount().then(() => this.notify());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async checkPendingCount(): Promise<number> {
    const list = await offlineStore.getPendingMutations();
    return list.length;
  }

  private async notify(lastMessage: string | null = null) {
    const pendingCount = await this.checkPendingCount();
    this.listeners.forEach((fn) =>
      fn({
        isSyncing: this.isSyncing,
        pendingCount,
        lastMessage,
      })
    );
  }

  private async handleOnline() {
    console.log("[OfflineSync] Network reconnected. Triggering background synchronization...");
    await this.syncPendingMutations();
  }

  public async syncPendingMutations(): Promise<number> {
    if (this.isSyncing || typeof window === "undefined" || !navigator.onLine) {
      return 0;
    }

    this.isSyncing = true;
    this.notify("Starting background synchronization...");

    const pending = await offlineStore.getPendingMutations();
    if (pending.length === 0) {
      this.isSyncing = false;
      this.notify(null);
      return 0;
    }

    let syncedCount = 0;
    const token = localStorage.getItem("peoplepay_token");
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

    for (const item of pending) {
      try {
        const url = `${baseUrl}${item.endpoint.startsWith("/") ? item.endpoint : `/${item.endpoint}`}`;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(url, {
          method: item.method,
          headers,
          body: item.body ? JSON.stringify(item.body) : undefined,
        });

        // 2xx or 400/404/409 (already processed or terminal business error) -> remove from queue
        if (res.ok || res.status === 400 || res.status === 404 || res.status === 409) {
          await offlineStore.removeMutation(item.id);
          syncedCount++;
        } else if (res.status === 401) {
          // Auth failed, keep in queue for when re-authenticated
          break;
        }
      } catch {
        // Network drop during sync loop -> stop loop, try next time
        break;
      }
    }

    this.isSyncing = false;

    if (syncedCount > 0) {
      const msg = `Successfully synchronized ${syncedCount} offline action(s) with the server.`;
      this.notify(msg);
      
      // Dispatch custom DOM event so UI components can refresh data
      window.dispatchEvent(new CustomEvent("peoplepay_offline_synced", { detail: { syncedCount } }));
    } else {
      this.notify(null);
    }

    return syncedCount;
  }
}

export const offlineSyncService = new OfflineSyncService();
