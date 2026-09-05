import { ApiResponse } from "@/types";
import { offlineStore } from "@/lib/offlineStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

let loginInFlight: Promise<string | null> | null = null;
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        
        if (res.ok) {
          const json = await res.json();
          const newAccess = json?.data?.accessToken;
          const newRefresh = json?.data?.refreshToken;
          
          if (newAccess) localStorage.setItem("peoplepay_token", newAccess);
          if (newRefresh) localStorage.setItem("peoplepay_refresh_token", newRefresh);
          
          return newAccess;
        } else {
          // Force logout on invalid refresh token
          localStorage.removeItem("peoplepay_token");
          localStorage.removeItem("peoplepay_refresh_token");
          localStorage.removeItem("peoplepay_user");
          window.location.href = "/login";
        }
      } catch {
        // Network error during refresh
      } finally {
        refreshInFlight = null;
      }
      return null;
    })();
  }
  return refreshInFlight;
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("peoplepay_token");
  if (token) return token;

  if (!loginInFlight) {
    loginInFlight = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/demo-login?role=ADMIN`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const json = await res.json();
          const fetchedToken = json?.data?.accessToken;
          if (fetchedToken) {
            localStorage.setItem("peoplepay_token", fetchedToken);
            return fetchedToken;
          }
        }
      } catch {
        // Fallback to null
      } finally {
        loginInFlight = null;
      }
      return null;
    })();
  }
  return loginInFlight;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_PREFIX = "pp360_cache_";
const DEFAULT_TTL_MS = 60 * 1000; // 1 minute fresh
const MAX_STALE_MS = 10 * 60 * 1000; // 10 minutes stale-while-revalidate

function getFromMemoryOrSession<T>(key: string): CacheEntry<T> | null {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as CacheEntry<T>;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (stored) {
        const parsed = JSON.parse(stored) as CacheEntry<T>;
        memoryCache.set(key, parsed);
        return parsed;
      }
    } catch {
      // Storage read error ignored
    }
  }
  return null;
}

function saveToMemoryAndSession<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      // Storage quota error ignored
    }
  }
  offlineStore.saveCache(key, data);
}

function invalidateMatchingKeys(prefix: string): void {
  for (const k of Array.from(memoryCache.keys())) {
    if (k.includes(prefix)) {
      memoryCache.delete(k);
    }
  }
  if (typeof window !== "undefined") {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX) && k.includes(prefix)) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove) {
        sessionStorage.removeItem(k);
      }
    } catch {
      // Storage error ignored
    }
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = await getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("peoplepay_refresh_token") : null;
    if (refreshToken) {
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        response = await fetch(url, { ...options, headers });
      }
    } else if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("peoplepay_token");
        localStorage.removeItem("peoplepay_refresh_token");
        localStorage.removeItem("peoplepay_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
  }

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    let errorData = null;
    try {
      errorData = await response.json();
      if (errorData.message) {
        errorMsg = errorData.message;
      }
    } catch {
      // Non-JSON response
    }
    throw new ApiError(response.status, errorMsg, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
}

export interface RequestOptions extends RequestInit {
  bypassCache?: boolean;
  ttl?: number;
}

export const apiClient = {
  getFromCache: <T>(endpoint: string): T | null => {
    const entry = getFromMemoryOrSession<T>(endpoint);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > MAX_STALE_MS) {
      return null;
    }
    return entry.data;
  },

  get: async <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    const bypass = options?.bypassCache ?? false;
    const ttl = options?.ttl ?? DEFAULT_TTL_MS;

    if (!bypass) {
      const cached = getFromMemoryOrSession<T>(endpoint);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < ttl) {
          return cached.data;
        }
        if (age < MAX_STALE_MS) {
          request<T>(endpoint, { ...options, method: "GET" })
            .then((fresh) => saveToMemoryAndSession(endpoint, fresh))
            .catch(() => {});
          return cached.data;
        }
      }
    }

    try {
      const data = await request<T>(endpoint, { ...options, method: "GET" });
      saveToMemoryAndSession(endpoint, data);
      return data;
    } catch (err) {
      // Offline fallback to IndexedDB or memory cache
      const idbEntry = await offlineStore.getCache<T>(endpoint);
      if (idbEntry) {
        return idbEntry.data;
      }
      const memEntry = getFromMemoryOrSession<T>(endpoint);
      if (memEntry) {
        return memEntry.data;
      }
      throw err;
    }
  },

  post: async <T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
    try {
      const res = await request<T>(endpoint, {
        ...options,
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
      });
      apiClient.invalidateForEndpoint(endpoint);
      return res;
    } catch (err) {
      if (typeof window !== "undefined" && !navigator.onLine) {
        await offlineStore.queueMutation(endpoint, "POST", body);
        apiClient.invalidateForEndpoint(endpoint);
        return { success: true, offlineQueued: true } as any;
      }
      throw err;
    }
  },

  put: async <T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
    try {
      const res = await request<T>(endpoint, {
        ...options,
        method: "PUT",
        body: body instanceof FormData ? body : JSON.stringify(body),
      });
      apiClient.invalidateForEndpoint(endpoint);
      return res;
    } catch (err) {
      if (typeof window !== "undefined" && !navigator.onLine) {
        await offlineStore.queueMutation(endpoint, "PUT", body);
        apiClient.invalidateForEndpoint(endpoint);
        return { success: true, offlineQueued: true } as any;
      }
      throw err;
    }
  },

  patch: async <T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
    try {
      const res = await request<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: body instanceof FormData ? body : JSON.stringify(body),
      });
      apiClient.invalidateForEndpoint(endpoint);
      return res;
    } catch (err) {
      if (typeof window !== "undefined" && !navigator.onLine) {
        await offlineStore.queueMutation(endpoint, "PATCH", body);
        apiClient.invalidateForEndpoint(endpoint);
        return { success: true, offlineQueued: true } as any;
      }
      throw err;
    }
  },

  delete: async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    try {
      const res = await request<T>(endpoint, { ...options, method: "DELETE" });
      apiClient.invalidateForEndpoint(endpoint);
      return res;
    } catch (err) {
      if (typeof window !== "undefined" && !navigator.onLine) {
        await offlineStore.queueMutation(endpoint, "DELETE");
        apiClient.invalidateForEndpoint(endpoint);
        return { success: true, offlineQueued: true } as any;
      }
      throw err;
    }
  },

  invalidateForEndpoint: (endpoint: string) => {
    const clean = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const root = clean.split("?")[0].split("/")[1];
    if (root) {
      invalidateMatchingKeys(`/${root}`);
      if (["payroll", "attendance", "employees", "contracts", "timeoff"].includes(root)) {
        invalidateMatchingKeys("/dashboard");
      }
    }
  },

  clearCache: () => {
    memoryCache.clear();
    if (typeof window !== "undefined") {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(CACHE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        for (const k of keysToRemove) {
          sessionStorage.removeItem(k);
        }
      } catch {}
    }
  },
};
