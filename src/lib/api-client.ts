import type { ApiResponse } from "@/lib/api/response";
import type { ErrorCode } from "@/lib/errors";
import type { PaginationMeta } from "@/lib/pagination";

/**
 * Client HTTP du FRONT pour appeler `/api/*` (enveloppe standard, voir docs/ARCHITECTURE.md §3).
 * Lance `ApiError` en cas d'échec ; à utiliser avec TanStack Query.
 *
 *   const event = await api.get<EventDto>(`/api/events/${id}`);
 *   const { items, meta } = await api.getPage<EventListItemDto>("/api/events", { page: 2 });
 *   await api.post<EventDto>("/api/events", values);
 */

export class ApiError extends Error {
  readonly code: ErrorCode | "NETWORK_ERROR";
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ApiError["code"], message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** Erreurs par champ renvoyées par une `VALIDATION_ERROR` (`{ email: ["Email invalide"] }`). */
  get fieldErrors(): Record<string, string[]> {
    const details = this.details as { fieldErrors?: Record<string, string[]> } | undefined;
    return details?.fieldErrors ?? {};
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function withQuery(url: string, query?: Query) {
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<{ data: T; meta?: PaginationMeta }> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "Impossible de joindre le serveur", 0);
  }

  if (response.status === 204) return { data: undefined as T };

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("INTERNAL_ERROR", "Réponse invalide du serveur", response.status);
  }

  if (!body.ok) {
    throw new ApiError(body.error.code, body.error.message, response.status, body.error.details);
  }
  return { data: body.data, meta: body.meta };
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  get: async <T>(url: string, query?: Query) => (await request<T>(withQuery(url, query))).data,

  /** Liste paginée : renvoie `{ items, meta }`. */
  getPage: async <T>(url: string, query?: Query) => {
    const { data, meta } = await request<T[]>(withQuery(url, query));
    return { items: data, meta: meta as PaginationMeta };
  },

  post: async <T>(url: string, body?: unknown) => (await request<T>(url, json("POST", body))).data,
  patch: async <T>(url: string, body?: unknown) =>
    (await request<T>(url, json("PATCH", body))).data,
  put: async <T>(url: string, body?: unknown) => (await request<T>(url, json("PUT", body))).data,
  delete: async (url: string) => {
    await request<void>(url, { method: "DELETE" });
  },

  /** Envoi de fichier (multipart/form-data) : ne PAS fixer Content-Type, le navigateur s'en charge. */
  upload: async <T>(url: string, file: File, method: "POST" | "PUT" = "POST", query?: Query) => {
    const form = new FormData();
    form.append("file", file);
    return (await request<T>(withQuery(url, query), { method, body: form })).data;
  },
};
