import { NextResponse } from "next/server";

import type { ErrorCode } from "@/lib/errors";
import type { PaginationMeta } from "@/lib/pagination";

/** Enveloppe de TOUTES les réponses JSON de l'API. Discriminer sur `ok`. */
export type ApiSuccess<T> = { ok: true; data: T; meta?: PaginationMeta };
export type ApiFailure = {
  ok: false;
  error: { code: ErrorCode; message: string; details?: unknown };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** 200 */
export function ok<T>(data: T) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data });
}

/** 201 */
export function created<T>(data: T) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status: 201 });
}

/** 200 avec `meta` de pagination. */
export function paginated<T>(items: T[], meta: PaginationMeta) {
  return NextResponse.json<ApiSuccess<T[]>>({ ok: true, data: items, meta });
}

/** 204 : suppression réussie, pas de corps. */
export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function failure(status: number, error: ApiFailure["error"]) {
  return NextResponse.json<ApiFailure>({ ok: false, error }, { status });
}
