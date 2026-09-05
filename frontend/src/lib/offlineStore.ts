"use client";

const DB_NAME = "PeoplePay360_OfflineDB";
const DB_VERSION = 1;

export interface CachedResponse<T = any> {
  endpoint: string;
  data: T;
  timestamp: number;
}

export interface QueuedMutation {
  id: string;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  timestamp: number;
  retryCount: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("cached_responses")) {
        db.createObjectStore("cached_responses", { keyPath: "endpoint" });
      }
      if (!db.objectStoreNames.contains("sync_queue")) {
        db.createObjectStore("sync_queue", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineStore = {
  // ── GET Response Caching ───────────────────────────────────────────────────
  saveCache: async <T>(endpoint: string, data: T): Promise<void> => {
    try {
      const db = await openDB();
      const tx = db.transaction("cached_responses", "readwrite");
      const store = tx.objectStore("cached_responses");
      store.put({
        endpoint,
        data,
        timestamp: Date.now(),
      });
    } catch {
      // Storage error ignored gracefully
    }
  },

  getCache: async <T>(endpoint: string): Promise<CachedResponse<T> | null> => {
    try {
      const db = await openDB();
      const tx = db.transaction("cached_responses", "readonly");
      const store = tx.objectStore("cached_responses");
      return new Promise((resolve) => {
        const req = store.get(endpoint);
        req.onsuccess = () => resolve((req.result as CachedResponse<T>) || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  // ── Offline Mutations Queue ────────────────────────────────────────────────
  queueMutation: async (
    endpoint: string,
    method: "POST" | "PUT" | "PATCH" | "DELETE",
    body?: any
  ): Promise<QueuedMutation> => {
    const mutation: QueuedMutation = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      endpoint,
      method,
      body,
      timestamp: Date.now(),
      retryCount: 0,
    };

    try {
      const db = await openDB();
      const tx = db.transaction("sync_queue", "readwrite");
      const store = tx.objectStore("sync_queue");
      store.put(mutation);
    } catch {
      // Storage fallback ignored
    }
    return mutation;
  },

  getPendingMutations: async (): Promise<QueuedMutation[]> => {
    try {
      const db = await openDB();
      const tx = db.transaction("sync_queue", "readonly");
      const store = tx.objectStore("sync_queue");
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as QueuedMutation[]) || [];
          list.sort((a, b) => a.timestamp - b.timestamp);
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  removeMutation: async (id: string): Promise<void> => {
    try {
      const db = await openDB();
      const tx = db.transaction("sync_queue", "readwrite");
      const store = tx.objectStore("sync_queue");
      store.delete(id);
    } catch {
      // Ignore
    }
  },

  clearAllCache: async (): Promise<void> => {
    try {
      const db = await openDB();
      const tx1 = db.transaction("cached_responses", "readwrite");
      tx1.objectStore("cached_responses").clear();
    } catch {}
  },
};
