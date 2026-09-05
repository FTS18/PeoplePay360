import { ApiResponse } from "@/types";

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

async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("peoplepay_token");
  if (token) return token;

  if (!loginInFlight) {
    loginInFlight = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "admin@peoplepay360.com", password: "Admin@123" }),
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

  const response = await fetch(url, {
    ...options,
    headers,
  });

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

    const data = await request<T>(endpoint, { ...options, method: "GET" });
    saveToMemoryAndSession(endpoint, data);
    return data;
  },

  post: async <T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
    const res = await request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    apiClient.invalidateForEndpoint(endpoint);
    return res;
  },

  put: async <T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> => {
    const res = await request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    apiClient.invalidateForEndpoint(endpoint);
    return res;
  },

  delete: async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const res = await request<T>(endpoint, { ...options, method: "DELETE" });
    apiClient.invalidateForEndpoint(endpoint);
    return res;
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
