import { NotFoundError } from "@/lib/errors";
import { buildMeta, toLimitOffset, type PaginationQuery } from "@/lib/pagination";

/**
 * Outils réservés aux STUBS d'API (étape 4). À supprimer des routes au fur et à mesure que
 * les features sont implémentées ; ce fichier disparaîtra quand plus aucun stub n'existe.
 */

/** UUID v4 valide et prévisible : mockId(3) → 00000000-0000-4000-8000-000000000003 */
export const mockId = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

/** Un id égal à celui-ci fait répondre 404 aux stubs `GET/PATCH/DELETE /…/:id`. */
export const MOCK_NOT_FOUND_ID = mockId(404);

export function mockNotFoundIf(id: string, message?: string) {
  if (id === MOCK_NOT_FOUND_ID) throw new NotFoundError(message);
}

/** Dates fixes (déterministes) pour des réponses stables. */
export const MOCK_DATE = "2026-11-15T09:00:00.000Z";
export const MOCK_DATE_LATER = "2026-11-15T09:30:00.000Z";

/** Découpe un tableau selon `page` / `pageSize`, comme le fera la vraie requête SQL. */
export function mockPage<T>(all: T[], query: PaginationQuery) {
  const { limit, offset } = toLimitOffset(query);
  return { items: all.slice(offset, offset + limit), meta: buildMeta(query, all.length) };
}
