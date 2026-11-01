import { z } from "zod";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Paramètres de pagination communs. À étendre avec `.extend({...})` pour les filtres. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const paginationMetaSchema = z.object({
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export type Paginated<T> = { items: T[]; meta: PaginationMeta };

/** Valeurs `limit` / `offset` à passer à Drizzle. */
export function toLimitOffset({ page, pageSize }: PaginationQuery) {
  return { limit: pageSize, offset: (page - 1) * pageSize };
}

export function buildMeta({ page, pageSize }: PaginationQuery, total: number): PaginationMeta {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
