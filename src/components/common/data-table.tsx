"use client";

import type { ReactNode } from "react";

import { EmptyState, ErrorState, LoadingState } from "@/components/common/state-views";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaginationMeta } from "@/lib/pagination";
import { cn } from "@/lib/utils";

export type Column<Row> = {
  key: string;
  header: string;
  /** Rendu de la cellule. Défaut : `row[key]`. */
  cell?: (row: Row) => ReactNode;
  className?: string;
};

type DataTableProps<Row> = {
  columns: Column<Row>[];
  rows: Row[] | undefined;
  getRowId: (row: Row) => string;
  /** `meta` renvoyé par l'API paginée ; absent = pas de pagination affichée. */
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
};

/**
 * Tableau paginé avec états chargement / erreur / vide. Fonctionne avec TanStack Query :
 *
 *   const [page, setPage] = useState(1);
 *   const query = useQuery({
 *     queryKey: ["events", page],
 *     queryFn: () => api.getPage<EventListItemDto>("/api/events", { page }),
 *   });
 *   <DataTable
 *     columns={[{ key: "name", header: "Nom" }, { key: "startsAt", header: "Date", cell: (e) => formatDate(e.startsAt) }]}
 *     rows={query.data?.items} meta={query.data?.meta} getRowId={(e) => e.id}
 *     isLoading={query.isPending} error={query.error} onRetry={query.refetch}
 *     onPageChange={setPage} emptyTitle="Aucun événement"
 *   />
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowId,
  meta,
  onPageChange,
  isLoading,
  error,
  onRetry,
  emptyTitle = "Aucun résultat",
  emptyDescription,
  emptyAction,
}: DataTableProps<Row>) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={cn(column.className)}>
                    {column.cell
                      ? column.cell(row)
                      : String((row as Record<string, unknown>)[column.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {meta.page} sur {meta.totalPages} · {meta.total} résultat
            {meta.total > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => onPageChange?.(meta.page - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange?.(meta.page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
