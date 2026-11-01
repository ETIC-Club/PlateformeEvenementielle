import { AlertCircle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Chargement : lignes grises. `lines` = nombre de lignes affichées. */
export function LoadingState({ lines = 5 }: { lines?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Chargement">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

/** Erreur avec bouton « Réessayer » (passer `onRetry={() => query.refetch()}`). */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : "Une erreur est survenue";
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Impossible de charger les données</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            Réessayer
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/** Aucun résultat. `action` : ex. un bouton « Créer un événement ». */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center">
      <Inbox className="text-muted-foreground size-8" aria-hidden />
      <p className="font-medium">{title}</p>
      {description && <p className="text-muted-foreground max-w-md text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
